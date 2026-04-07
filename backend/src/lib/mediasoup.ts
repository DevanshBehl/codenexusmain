import * as mediasoup from 'mediasoup';
import os from 'os';

export const workers: mediasoup.types.Worker[] = [];
let nextWorkerIdx = 0;

export const routers: Map<string, mediasoup.types.Router> = new Map();
export const transports: Map<string, mediasoup.types.WebRtcTransport> = new Map();
export const producers: Map<string, mediasoup.types.Producer> = new Map();
export const consumers: Map<string, mediasoup.types.Consumer> = new Map();

export async function createWorkers() {
    const numWorkers = Object.keys(os.cpus()).length;
    for (let i = 0; i < numWorkers; i++) {
        const worker = await mediasoup.createWorker({
            logLevel: 'warn',
            logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp'],
            rtcMinPort: 10000,
            rtcMaxPort: 10100,
        });

        worker.on('died', () => {
            console.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid);
            setTimeout(() => process.exit(1), 2000);
        });

        workers.push(worker);
    }
}

function getWorker() {
    const worker = workers[nextWorkerIdx];
    nextWorkerIdx = (nextWorkerIdx + 1) % workers.length;
    return worker;
}

const mediaCodecs: any[] = [
    {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2
    },
    {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
        parameters: {
            'x-google-start-bitrate': 1000
        }
    }
];

export async function createRoomRouter(roomId: string) {
    let router = routers.get(roomId);
    if (router) return router;

    const worker = getWorker();
    if (!worker) throw new Error("No mediasoup workers available");
    router = await worker.createRouter({ mediaCodecs });
    routers.set(roomId, router);
    return router;
}

export async function createWebRtcTransport(router: mediasoup.types.Router) {
    const webRtcTransportOptions: mediasoup.types.WebRtcTransportOptions = {
        listenIps: [
            {
                ip: process.env.MEDIASOUP_LISTEN_IP || '0.0.0.0',
                announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP || '127.0.0.1', // Use a public IP in production
            }
        ],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
        initialAvailableOutgoingBitrate: 1000000
    };

    const transport = await router.createWebRtcTransport(webRtcTransportOptions);

    transport.on('dtlsstatechange', (dtlsState) => {
        if (dtlsState === 'closed') {
            transport.close();
        }
    });

    transport.on('@close', () => {
        transports.delete(transport.id);
    });

    transports.set(transport.id, transport);
    return transport;
}
