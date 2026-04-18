import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Loader2, Play, Pause, Volume2, VolumeX, Maximize,
    SkipBack, SkipForward, Code2, PenTool, Send, Bookmark, ChevronDown, ChevronUp
} from 'lucide-react';

export interface Timestamp {
    id: string;
    offsetMs: number;
    type: string;
    label: string;
}

interface VideoPlayerProps {
    isOpen: boolean;
    onClose: () => void;
    videoUrl?: string;
    title?: string;
    isLoading?: boolean;
    timestamps?: Timestamp[];
}

const TIMESTAMP_ICONS: Record<string, typeof Code2> = {
    ide_opened: Code2,
    ide_closed: Code2,
    whiteboard_opened: PenTool,
    code_submitted: Send,
    manual: Bookmark,
};

const TIMESTAMP_COLORS: Record<string, string> = {
    ide_opened: '#22c55e',
    ide_closed: '#ef4444',
    whiteboard_opened: '#eab308',
    code_submitted: '#8b5cf6',
    manual: '#06b6d4',
};

function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VideoPlayer({ isOpen, onClose, videoUrl, title = 'Recording Playback', isLoading = false, timestamps = [] }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showTimestamps, setShowTimestamps] = useState(true);
    const [hoveredTs, setHoveredTs] = useState<Timestamp | null>(null);
    const [hoverX, setHoverX] = useState(0);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();
            if (e.key === ' ') { e.preventDefault(); togglePlay(); }
            if (e.key === 'ArrowLeft') skip(-5);
            if (e.key === 'ArrowRight') skip(5);
            if (e.key === 'm') setIsMuted(p => !p);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isPlaying]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setIsPlaying(false);
            setCurrentTime(0);
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const togglePlay = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
            video.play();
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    }, []);

    const skip = useCallback((seconds: number) => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
    }, []);

    const seekTo = useCallback((seconds: number) => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = seconds;
        setCurrentTime(seconds);
    }, []);

    const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        seekTo(pct * duration);
    }, [duration, seekTo]);

    const handleProgressHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressRef.current || timestamps.length === 0) return;
        const rect = progressRef.current.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        const hoverTime = pct * duration * 1000;

        const closest = timestamps.reduce((prev, curr) =>
            Math.abs(curr.offsetMs - hoverTime) < Math.abs(prev.offsetMs - hoverTime) ? curr : prev
        );

        if (Math.abs(closest.offsetMs - hoverTime) < duration * 10) {
            setHoveredTs(closest);
            setHoverX(e.clientX - rect.left);
        } else {
            setHoveredTs(null);
        }
    }, [timestamps, duration]);

    const handleTimeUpdate = useCallback(() => {
        const video = videoRef.current;
        if (video) setCurrentTime(video.currentTime);
    }, []);

    const handleLoadedMetadata = useCallback(() => {
        const video = videoRef.current;
        if (video) setDuration(video.duration);
    }, []);

    const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

    const sortedTimestamps = [...timestamps].sort((a, b) => a.offsetMs - b.offsetMs);

    const jumpToNext = useCallback(() => {
        const currentMs = currentTime * 1000;
        const next = sortedTimestamps.find(ts => ts.offsetMs > currentMs + 500);
        if (next) seekTo(next.offsetMs / 1000);
    }, [currentTime, sortedTimestamps, seekTo]);

    const jumpToPrev = useCallback(() => {
        const currentMs = currentTime * 1000;
        const prev = [...sortedTimestamps].reverse().find(ts => ts.offsetMs < currentMs - 500);
        if (prev) seekTo(prev.offsetMs / 1000);
    }, [currentTime, sortedTimestamps, seekTo]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-6xl bg-[#0A0A0A] border border-[#333] rounded-md shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 border-b border-[#222] bg-[#111] shrink-0">
                            <h3 className="text-white font-sans font-bold text-sm">{title}</h3>
                            <button
                                onClick={onClose}
                                className="text-[#888] hover:text-white transition-colors bg-[#222] hover:bg-[#333] p-1.5 rounded-sm"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Video Area */}
                        <div className="relative w-full aspect-video bg-black flex items-center justify-center cursor-pointer" onClick={togglePlay}>
                            {isLoading ? (
                                <Loader2 size={48} className="text-accent-500 animate-spin" />
                            ) : (
                                <>
                                    <video
                                        ref={videoRef}
                                        className="w-full h-full object-contain"
                                        src={videoUrl}
                                        onTimeUpdate={handleTimeUpdate}
                                        onLoadedMetadata={handleLoadedMetadata}
                                        onPlay={() => setIsPlaying(true)}
                                        onPause={() => setIsPlaying(false)}
                                        onEnded={() => setIsPlaying(false)}
                                        muted={isMuted}
                                    />
                                    {!isPlaying && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                                            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                                <Play size={28} className="text-white ml-1" />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Custom Controls */}
                        <div className="bg-[#111] border-t border-[#222] px-4 py-2 shrink-0">
                            {/* Progress Bar with Timestamp Markers */}
                            <div
                                ref={progressRef}
                                className="relative h-6 flex items-center cursor-pointer group mb-1"
                                onClick={handleProgressClick}
                                onMouseMove={handleProgressHover}
                                onMouseLeave={() => setHoveredTs(null)}
                            >
                                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-[#333] rounded-full group-hover:h-1.5 transition-all">
                                    <div
                                        className="h-full bg-accent-500 rounded-full relative"
                                        style={{ width: `${progressPct}%` }}
                                    >
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-accent-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md" />
                                    </div>
                                </div>

                                {/* Timestamp markers on the timeline */}
                                {duration > 0 && sortedTimestamps.map(ts => {
                                    const leftPct = (ts.offsetMs / (duration * 1000)) * 100;
                                    const color = TIMESTAMP_COLORS[ts.type] || '#888';
                                    return (
                                        <div
                                            key={ts.id}
                                            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-[#0A0A0A] z-10 hover:scale-150 transition-transform cursor-pointer"
                                            style={{ left: `${leftPct}%`, backgroundColor: color }}
                                            onClick={(e) => { e.stopPropagation(); seekTo(ts.offsetMs / 1000); }}
                                            title={`${ts.label} — ${formatTime(ts.offsetMs / 1000)}`}
                                        />
                                    );
                                })}

                                {/* Hover tooltip */}
                                {hoveredTs && (
                                    <div
                                        className="absolute bottom-full mb-2 bg-[#1a1a1a] border border-[#333] rounded-sm px-2 py-1 text-[10px] font-mono text-white whitespace-nowrap z-20 pointer-events-none"
                                        style={{ left: hoverX, transform: 'translateX(-50%)' }}
                                    >
                                        {hoveredTs.label} — {formatTime(hoveredTs.offsetMs / 1000)}
                                    </div>
                                )}
                            </div>

                            {/* Control buttons row */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button onClick={togglePlay} className="text-white hover:text-accent-400 transition-colors">
                                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                    </button>
                                    <button onClick={() => skip(-10)} className="text-[#888] hover:text-white transition-colors" title="Back 10s">
                                        <SkipBack size={16} />
                                    </button>
                                    <button onClick={() => skip(10)} className="text-[#888] hover:text-white transition-colors" title="Forward 10s">
                                        <SkipForward size={16} />
                                    </button>
                                    <button onClick={() => setIsMuted(!isMuted)} className="text-[#888] hover:text-white transition-colors">
                                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                    </button>
                                    <span className="text-[11px] font-mono text-[#888] ml-2">
                                        {formatTime(currentTime)} / {formatTime(duration)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    {sortedTimestamps.length > 0 && (
                                        <>
                                            <button onClick={jumpToPrev} className="text-[#888] hover:text-white transition-colors text-[9px] font-mono flex items-center gap-1" title="Previous marker">
                                                <SkipBack size={12} /> Prev
                                            </button>
                                            <button onClick={jumpToNext} className="text-[#888] hover:text-white transition-colors text-[9px] font-mono flex items-center gap-1" title="Next marker">
                                                Next <SkipForward size={12} />
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => videoRef.current?.requestFullscreen()}
                                        className="text-[#888] hover:text-white transition-colors"
                                    >
                                        <Maximize size={16} />
                                    </button>
                                    {sortedTimestamps.length > 0 && (
                                        <button
                                            onClick={() => setShowTimestamps(!showTimestamps)}
                                            className={`text-[9px] font-mono flex items-center gap-1 px-2 py-1 rounded-sm border transition-colors ${showTimestamps ? 'border-accent-500/30 text-accent-400 bg-accent-500/10' : 'border-[#333] text-[#888] hover:text-white'}`}
                                        >
                                            <Bookmark size={12} />
                                            {showTimestamps ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Timestamps Panel */}
                        <AnimatePresence>
                            {showTimestamps && sortedTimestamps.length > 0 && (
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: 'auto' }}
                                    exit={{ height: 0 }}
                                    className="overflow-hidden border-t border-[#222]"
                                >
                                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
                                            {sortedTimestamps.map((ts, i) => {
                                                const Icon = TIMESTAMP_ICONS[ts.type] || Bookmark;
                                                const color = TIMESTAMP_COLORS[ts.type] || '#888';
                                                const isActive = Math.abs(currentTime * 1000 - ts.offsetMs) < 2000;
                                                return (
                                                    <button
                                                        key={ts.id}
                                                        onClick={() => seekTo(ts.offsetMs / 1000)}
                                                        className={`flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-b border-r border-[#222] hover:bg-[#111] ${isActive ? 'bg-[#111]' : 'bg-[#0A0A0A]'}`}
                                                    >
                                                        <div
                                                            className="w-7 h-7 rounded-sm flex items-center justify-center shrink-0"
                                                            style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
                                                        >
                                                            <Icon size={13} style={{ color }} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-xs font-sans text-white truncate">{ts.label}</div>
                                                            <div className="text-[10px] font-mono text-[#666]">{formatTime(ts.offsetMs / 1000)}</div>
                                                        </div>
                                                        {isActive && (
                                                            <div className="w-1.5 h-1.5 rounded-full ml-auto shrink-0" style={{ backgroundColor: color }} />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
