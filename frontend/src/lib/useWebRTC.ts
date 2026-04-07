import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';

const STUN_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

export function useWebRTC(socket: Socket | null, interviewId: string) {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasRemotePeer, setHasRemotePeer] = useState(false);

    const peerConnection = useRef<RTCPeerConnection | null>(null);
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
            console.error('[WebRTC] Media access error:', err);
            setError('Could not access camera/microphone. Please check permissions.');
            return null;
        }
    }, []);

    const initPeerConnection = useCallback((stream: MediaStream) => {
        if (peerConnection.current) return peerConnection.current;

        const pc = new RTCPeerConnection(STUN_SERVERS);
        peerConnection.current = pc;

        // Add local tracks
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // Handle incoming tracks
        pc.ontrack = (event) => {
            console.log('[WebRTC] Received remote track:', event.track.kind);
            setRemoteStream(event.streams[0]);
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit('webrtc-ice-candidate', {
                    interviewId,
                    candidate: event.candidate,
                });
            }
        };

        pc.onconnectionstatechange = () => {
            console.log('[WebRTC] Connection state:', pc.connectionState);
            if (pc.connectionState === 'connected') {
                setHasRemotePeer(true);
            } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                setHasRemotePeer(false);
            }
        };

        return pc;
    }, [socket, interviewId]);

    const makeOffer = useCallback(async (pc: RTCPeerConnection) => {
        if (!socket) return;
        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit('webrtc-offer', { interviewId, offer });
        } catch (err) {
            console.error('[WebRTC] Failed to create offer:', err);
        }
    }, [socket, interviewId]);

    // Media controls
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

    // Socket signaling listeners
    useEffect(() => {
        if (!socket) return;

        const handlePeerJoined = async () => {
            console.log('[WebRTC] Peer joined, making offer...');
            setHasRemotePeer(true);
            // We initiate the call when someone joins
            if (!localStream) {
                const stream = await initMedia();
                if (stream) {
                    const pc = initPeerConnection(stream);
                    makeOffer(pc);
                }
            } else {
                const pc = initPeerConnection(localStream);
                makeOffer(pc);
            }
        };

        const handleOffer = async (data: { offer: RTCSessionDescriptionInit }) => {
            console.log('[WebRTC] Received offer');
            let stream = localStream;
            if (!stream) {
                stream = await initMedia();
            }
            if (!stream) return;

            const pc = initPeerConnection(stream);
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('webrtc-answer', { interviewId, answer });
        };

        const handleAnswer = async (data: { answer: RTCSessionDescriptionInit }) => {
            console.log('[WebRTC] Received answer');
            if (peerConnection.current) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
            }
        };

        const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit }) => {
            if (peerConnection.current) {
                try {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (err) {
                    console.error('[WebRTC] Error adding received ice candidate', err);
                }
            }
        };

        const handlePeerLeft = () => {
            console.log('[WebRTC] Peer left');
            setHasRemotePeer(false);
            setRemoteStream(null);
            if (peerConnection.current) {
                peerConnection.current.close();
                peerConnection.current = null;
            }
            // Re-init local peer connection ready for next join
            if (localStream) {
                initPeerConnection(localStream);
            }
        };

        socket.on('peer-joined', handlePeerJoined);
        socket.on('webrtc-offer', handleOffer);
        socket.on('webrtc-answer', handleAnswer);
        socket.on('webrtc-ice-candidate', handleIceCandidate);
        socket.on('peer-left', handlePeerLeft);

        return () => {
            socket.off('peer-joined', handlePeerJoined);
            socket.off('webrtc-offer', handleOffer);
            socket.off('webrtc-answer', handleAnswer);
            socket.off('webrtc-ice-candidate', handleIceCandidate);
            socket.off('peer-left', handlePeerLeft);
        };
    }, [socket, interviewId, localStream, initMedia, initPeerConnection, makeOffer]);

    // Initial load
    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            initMedia().then(stream => {
                if (stream) {
                    initPeerConnection(stream);
                }
            });
        }

        return () => {
            // Cleanup on unmount
            if (localStream) {
                localStream.getTracks().forEach(t => t.stop());
            }
            if (peerConnection.current) {
                peerConnection.current.close();
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
