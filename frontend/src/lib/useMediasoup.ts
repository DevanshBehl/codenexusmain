import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import * as mediasoupClient from 'mediasoup-client';

export function useMediasoup(socket: Socket | null, interviewId: string) {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasRemotePeer, setHasRemotePeer] = useState(false);

    const deviceRef = useRef<mediasoupClient.Device | null>(null);
    const sendTransportRef = useRef<mediasoupClient.types.Transport | null>(null);
    const recvTransportRef = useRef<mediasoupClient.types.Transport | null>(null);
    const consumersRef = useRef<Map<string, mediasoupClient.types.Consumer>>(new Map());

    const hasInitialized = useRef(false);

    const initMedia = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 },
                audio: true,
            });
            setLocalStream(stream);
            return stream;
        } catch (err) {
            console.error('[Mediasoup] Media access error:', err);
            setError('Could not access camera/microphone. Please check permissions.');
            return null;
        }
    }, []);

    const toggleMute = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    // Make request helper that turns socket.emit with callbacks into Promises
    const request = useCallback((type: string, data: any = {}) => {
        return new Promise<any>((resolve, reject) => {
            if (!socket) return reject("No socket");
            socket.emit(type, data, (res: any) => {
                if (res.error) reject(new Error(res.error));
                else resolve(res);
            });
        });
    }, [socket]);

    const initMediasoup = useCallback(async (stream: MediaStream) => {
        if (!socket) return;
        
        try {
            // 1. Get Router capabilities
            const { rtpCapabilities } = await request("getRouterRtpCapabilities", { interviewId });
            
            // 2. Initialize Mediasoup Device
            const device = new mediasoupClient.Device();
            await device.load({ routerRtpCapabilities: rtpCapabilities });
            deviceRef.current = device;

            // 3. Create Send Transport
            const sendTransportData = await request("createWebRtcTransport", { interviewId });
            const sendTransport = device.createSendTransport({
                id: sendTransportData.id,
                iceParameters: sendTransportData.iceParameters,
                iceCandidates: sendTransportData.iceCandidates,
                dtlsParameters: sendTransportData.dtlsParameters,
            });

            sendTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
                request("connectWebRtcTransport", { transportId: sendTransport.id, dtlsParameters })
                    .then(callback)
                    .catch(errback);
            });

            sendTransport.on("produce", async ({ kind, rtpParameters }, callback, errback) => {
                try {
                    const { id } = await request("produce", {
                        interviewId,
                        transportId: sendTransport.id,
                        kind,
                        rtpParameters,
                    });
                    callback({ id });
                } catch (err: any) {
                    errback(err);
                }
            });

            sendTransportRef.current = sendTransport;

            // Produce Audio and Video
            const audioTrack = stream.getAudioTracks()[0];
            const videoTrack = stream.getVideoTracks()[0];

            if (audioTrack) await sendTransport.produce({ track: audioTrack });
            if (videoTrack) await sendTransport.produce({ track: videoTrack });

            // 4. Create Receive Transport
            const recvTransportData = await request("createWebRtcTransport", { interviewId });
            const recvTransport = device.createRecvTransport({
                id: recvTransportData.id,
                iceParameters: recvTransportData.iceParameters,
                iceCandidates: recvTransportData.iceCandidates,
                dtlsParameters: recvTransportData.dtlsParameters,
            });

            recvTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
                request("connectWebRtcTransport", { transportId: recvTransport.id, dtlsParameters })
                    .then(callback)
                    .catch(errback);
            });

            recvTransportRef.current = recvTransport;

            // 5. Consume already existing producers in the room
            const { producers } = await request("getProducers", { interviewId });
            for (const p of producers) {
                await consumeProducer(p.producerId);
            }
            
            // Mark remote peer connection if any
            if (producers.length > 0) setHasRemotePeer(true);

        } catch (err: any) {
            console.error("[Mediasoup] Initialization failed", err);
            setError(err.message);
        }
    }, [socket, interviewId, request]);

    const consumeProducer = useCallback(async (producerId: string) => {
        const device = deviceRef.current;
        const recvTransport = recvTransportRef.current;
        if (!device || !recvTransport) return;

        try {
            const { id, kind, rtpParameters } = await request("consume", {
                interviewId,
                transportId: recvTransport.id,
                producerId,
                rtpCapabilities: device.rtpCapabilities
            });

            const consumer = await recvTransport.consume({
                id,
                producerId,
                kind,
                rtpParameters,
            });

            consumersRef.current.set(consumer.id, consumer);

            // Add the new track to the remote stream by explicitly creating a new reference
            setRemoteStream(prevStream => {
                const stream = new MediaStream(prevStream ? prevStream.getTracks() : []);
                stream.addTrack(consumer.track);
                return stream;
            });

            // Resume the consumer
            await request("resume-consumer", { consumerId: consumer.id });
        } catch (err) {
            console.error("[Mediasoup] Consume failed", err);
        }
    }, [request, interviewId]);

    // Setup listeners for socket signaling
    useEffect(() => {
        if (!socket) return;

        const handleNewProducer = async ({ producerId }: { producerId: string }) => {
            console.log("[Mediasoup] New producer:", producerId);
            setHasRemotePeer(true);
            await consumeProducer(producerId);
        };

        const handlePeerJoined = () => {
             console.log("[Mediasoup] Peer joined");
             setHasRemotePeer(true);
        };

        const handleRoomJoined = (data: any) => {
             console.log("[Mediasoup] Room joined");
             if (data.members && data.members.length > 1) {
                  setHasRemotePeer(true);
             }
        };

        const handlePeerLeft = () => {
             console.log("[Mediasoup] Peer left");
             setHasRemotePeer(false);
             setRemoteStream(null);
             consumersRef.current.forEach(c => c.close());
             consumersRef.current.clear();
        };

        socket.on("new-producer", handleNewProducer);
        socket.on("peer-joined", handlePeerJoined);
        socket.on("room-joined", handleRoomJoined);
        socket.on("peer-left", handlePeerLeft);

        return () => {
            socket.off("new-producer", handleNewProducer);
            socket.off("peer-joined", handlePeerJoined);
            socket.off("room-joined", handleRoomJoined);
            socket.off("peer-left", handlePeerLeft);
        };
    }, [socket, consumeProducer]);

    // Initial load
    useEffect(() => {
        if (!socket) return;
        
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            initMedia().then(stream => {
                if (stream) {
                    initMediasoup(stream);
                }
            });
        }

        return () => {
            // Cleanup on unmount
            if (localStream) {
                localStream.getTracks().forEach(t => t.stop());
            }
            if (sendTransportRef.current) sendTransportRef.current.close();
            if (recvTransportRef.current) recvTransportRef.current.close();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket]); // depend on socket availability

    return {
        localStream,
        remoteStream,
        isMuted,
        isVideoOff,
        toggleMute,
        toggleVideo,
        error,
        hasRemotePeer,
    };
}
