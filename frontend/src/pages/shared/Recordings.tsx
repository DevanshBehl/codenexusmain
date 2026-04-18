import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    Terminal, Building2, Users, Mail, Presentation,
    Calendar, Video, Code2, Play, CheckCircle2, Briefcase,
    PenTool, Box, Star, ChevronLeft, ChevronRight, Swords, Loader2, Trophy, FileText
} from 'lucide-react';
import VideoPlayer, { type Timestamp } from '../../components/VideoPlayer';
import { interviewApi } from '../../lib/api';

/* ────────── Types & Mock Data ────────── */
export type UserRole = 'STUDENT' | 'UNIVERSITY' | 'COMPANY' | 'RECRUITER';

interface Recording {
    id: string;
    student: string;
    university: string;
    role: string;
    date: string;
    duration: string;
    rating: number;
    type: string;
    verdict: string;
    videoUrl?: string;
}

interface RecordingsProps {
    userRole: UserRole;
}

interface InterviewItem {
    id: string;
    status: string;
    role: string;
    type: string;
    scheduledAt: string;
    student: { id: string; name: string; branch: string; cgpa: number };
    recruiter: { name: string; company: { name: string } };
    interviewRecording?: { status: string; file_size_bytes: number; file_path?: string };
}

export default function Recordings({ userRole }: RecordingsProps) {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<{ url?: string; title: string; isOpen: boolean }>({
        isOpen: false,
        title: '',
    });
    const [videoLoading, setVideoLoading] = useState(false);
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [videoTimestamps, setVideoTimestamps] = useState<Timestamp[]>([]);

    useEffect(() => {
        const fetchRecordings = async () => {
            try {
                setLoading(true);
                const response = await interviewApi.getAll();
                const interviews: InterviewItem[] = response.data;

                const recordingsData: Recording[] = interviews
                    .filter(interview => interview.interviewRecording && interview.interviewRecording.status === 'completed')
                    .map(interview => ({
                        id: interview.id,
                        student: interview.student.name,
                        university: interview.student.branch || 'Unknown',
                        role: interview.role,
                        date: new Date(interview.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        duration: interview.interviewRecording?.file_size_bytes 
                            ? `${Math.round(interview.interviewRecording.file_size_bytes / 1024 / 1024)} MB` 
                            : 'N/A',
                        rating: 0,
                        type: interview.type,
                        verdict: interview.status === 'COMPLETED' ? 'PENDING' : interview.status,
                        videoUrl: interviewApi.getRecordingStreamUrl(interview.id),
                    }));

                setRecordings(recordingsData);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch recordings:', err);
                setError('Failed to load recordings');
            } finally {
                setLoading(false);
            }
        };

        fetchRecordings();
    }, []);

    /* ────────── Sidebars ────────── */
    const studentSidebarItems = [
        { icon: Mail, label: 'MAIL', onClick: () => navigate('/student/mail') },
        { icon: Presentation, label: 'WEBINARS', onClick: () => navigate('/student/webinars') },
        { icon: Terminal, label: 'CMD CENTER', onClick: () => navigate('/student/dashboard') },
        { icon: Code2, label: 'CODE ARENA', onClick: () => navigate('/student/codearena') },
        { icon: PenTool, label: 'DESIGN ARENA', onClick: () => navigate('/student/designarena') },
        { icon: Briefcase, label: 'INTERVIEWS', onClick: () => navigate('/student/interview') },
        { icon: Trophy, label: 'CONTEST', onClick: () => navigate('/student/contest') },
        { icon: FileText, label: 'PROFILE', onClick: () => navigate('/student/profile') },
        { icon: Box, label: 'PROJECTS', onClick: () => navigate('/student/projects') },
        { icon: Play, label: 'RECORDINGS', active: true, onClick: () => navigate('/student/recording') },
    ];

    const universitySidebarItems = [
        { icon: Mail, label: 'MAIL', onClick: () => navigate('/university/mail') },
        { icon: Presentation, label: 'WEBINARS', onClick: () => navigate('/university/webinars') },
        { icon: Terminal, label: 'CMD CENTER', onClick: () => navigate('/university/dashboard') },
        { icon: Building2, label: 'COMPANIES', onClick: () => navigate('/university/dashboard') },
        { icon: Users, label: 'STUDENTS', onClick: () => navigate('/university/dashboard') },
        { icon: Briefcase, label: 'PLACEMENTS', onClick: () => navigate('/university/dashboard') },
        { icon: CheckCircle2, label: 'EVALUATIONS', onClick: () => navigate('/university/evaluation') },
        { icon: Play, label: 'RECORDINGS', active: true, onClick: () => navigate('/university/recording') },
    ];

    const companySidebarItems = [
        { icon: Mail, label: 'MAIL', onClick: () => navigate('/company/mail') },
        { icon: Presentation, label: 'WEBINARS', onClick: () => navigate('/company/ppt') },
        { icon: Terminal, label: 'CMD CENTER', onClick: () => navigate('/company/dashboard') },
        { icon: Building2, label: 'UNIVERSITIES', onClick: () => navigate('/company/dashboard') },
        { icon: Users, label: 'CANDIDATES', onClick: () => navigate('/company/dashboard') },
        { icon: Swords, label: 'CODE ARENA', onClick: () => navigate('/company/dashboard') },
        { icon: Video, label: 'INTERVIEWS', onClick: () => navigate('/company/dashboard') },
        { icon: CheckCircle2, label: 'EVALUATIONS', onClick: () => navigate('/company/evaluation') },
        { icon: Play, label: 'RECORDINGS', active: true, onClick: () => navigate('/company/recording') },
    ];

    const recruiterSidebarItems = [
        { icon: Mail, label: 'MAIL', onClick: () => navigate('/recruiter/mail') },
        { icon: Terminal, label: 'CMD CENTER', onClick: () => navigate('/recruiter/dashboard') },
        { icon: Video, label: 'INTERVIEWS', onClick: () => navigate('/recruiter/dashboard') },
        { icon: Play, label: 'RECORDINGS', active: true, onClick: () => navigate('/recruiter/recording') },
    ];

    let sidebarItems = studentSidebarItems;
    if (userRole === 'UNIVERSITY') sidebarItems = universitySidebarItems;
    else if (userRole === 'COMPANY') sidebarItems = companySidebarItems;
    else if (userRole === 'RECRUITER') sidebarItems = recruiterSidebarItems;

    const getVerdictStyle = (verdict: string) => {
        switch (verdict) {
            case 'SELECTED': return 'text-green-400 border-green-500/20 bg-green-500/10';
            case 'REJECTED': return 'text-red-400 border-red-500/20 bg-red-500/10';
            case 'PENDING': return 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10';
            default: return 'text-[#888] border-[#333] bg-[#111]';
        }
    };

    return (
        <div className="h-screen w-full bg-[#050505] font-sans text-white flex overflow-hidden selection:bg-accent-500/30">
            <div className="fixed inset-0 pointer-events-none z-0 dotted-bg"></div>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 240 : 70 }}
                className="h-screen bg-[#0A0A0A] border-r border-[#222] flex flex-col relative shrink-0 z-20"
            >
                <div className="h-16 flex items-center px-4 border-b border-[#222]">
                    <Link to="/" className="flex items-center gap-2 text-accent-500 font-bold text-xl italic font-serif">
                        <span>{'<'}</span>
                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="overflow-hidden whitespace-nowrap"
                                >
                                    cn/
                                </motion.span>
                            )}
                        </AnimatePresence>
                        <span>{'>'}</span>
                    </Link>
                </div>

                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute -right-3 top-20 h-6 w-6 bg-[#111] border border-[#333] rounded-sm flex items-center justify-center text-[#888] hover:text-white hover:border-accent-500 transition-colors z-30"
                >
                    {isSidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
                </button>

                <div className="flex-1 py-6 flex flex-col gap-1 px-3 overflow-y-auto custom-scrollbar">
                    <div className="text-[10px] font-mono text-[#555] uppercase tracking-widest px-3 mb-2">{userRole} Options</div>
                    {sidebarItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={item.onClick}
                            className={`flex items-center px-3 py-2.5 rounded-sm transition-all duration-200 group relative
                                ${item.active
                                    ? 'bg-[#111] border border-[#333] border-l-2 border-l-accent-500 text-white'
                                    : 'border border-transparent text-[#888] hover:bg-[#111] hover:border-[#222] hover:text-white'
                                }`}
                        >
                            <item.icon size={16} className={`min-w-[16px] ${item.active ? 'text-accent-400' : 'group-hover:text-white transition-colors'}`} />
                            <AnimatePresence>
                                {isSidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="ml-3 font-mono text-[10px] uppercase tracking-widest whitespace-nowrap overflow-hidden"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    ))}
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
                <header className="h-16 border-b border-[#222] bg-[#0A0A0A]/80 backdrop-blur-md flex items-center px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <Play size={20} className="text-accent-400" />
                        <div>
                            <h1 className="text-sm font-bold font-sans text-white uppercase tracking-widest">Interview Recordings</h1>
                            <p className="text-[10px] font-mono text-[#666]">Access past interview and technical assessment videos</p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
                    <div className="max-w-5xl mx-auto space-y-6">
                        {loading && (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 size={40} className="text-accent-500 animate-spin" />
                            </div>
                        )}
                        {error && (
                            <div className="text-center py-20 text-red-400 font-mono">
                                {error}
                            </div>
                        )}
                        {!loading && !error && recordings.length === 0 && (
                            <div className="text-center py-20 text-[#666] font-mono">
                                No recordings found
                            </div>
                        )}
                        {!loading && !error && recordings.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {recordings.map((rec) => (
                                    <div key={rec.id} className="bg-[#0A0A0A] border border-[#222] rounded-sm p-5 hover:border-[#333] transition-colors shadow-lg flex flex-col relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 font-mono text-8xl font-black pointer-events-none select-none -mt-4 -mr-4 text-accent-500">
                                            <Video size={100} />
                                        </div>
                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <div>
                                                <h3 className="text-lg font-bold font-sans text-white group-hover:text-accent-400 transition-colors">{rec.student}</h3>
                                                <p className="text-[10px] font-mono text-[#aaa] uppercase tracking-widest">{rec.role}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 text-[9px] font-mono border rounded-sm tracking-widest uppercase ${getVerdictStyle(rec.verdict)}`}>
                                                {rec.verdict}
                                            </span>
                                        </div>

                                        <div className="space-y-2 mb-6 relative z-10">
                                            <div className="flex items-center gap-2 text-[10px] font-mono text-[#666]">
                                                <Building2 size={12} className="text-[#888]" /> {rec.university}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-mono text-[#666]">
                                                <Calendar size={12} className="text-[#888]" /> {rec.date} ({rec.duration})
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-mono text-[#666]">
                                                <Code2 size={12} className="text-[#888]" /> {rec.type}
                                            </div>
                                        </div>

                                        <div className="mt-auto flex items-center justify-between border-t border-[#222] pt-4 relative z-10">
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, si) => (
                                                    <Star key={si} size={10} className={si < Math.floor(rec.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-[#333]'} />
                                                ))}
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    setSelectedVideo({ isOpen: true, title: `Recording: ${rec.student} - ${rec.role}` });
                                                    setVideoLoading(true);
                                                    setVideoTimestamps([]);
                                                    try {
                                                        const [url, tsRes] = await Promise.all([
                                                            interviewApi.getRecordingBlobUrl(rec.id),
                                                            interviewApi.getTimestamps(rec.id).catch(() => ({ data: [] })),
                                                        ]);
                                                        setBlobUrl(url);
                                                        setSelectedVideo(prev => ({ ...prev, url }));
                                                        setVideoTimestamps(tsRes.data as Timestamp[]);
                                                    } catch (err) {
                                                        console.error('Failed to load video:', err);
                                                        setSelectedVideo(prev => ({ ...prev, isOpen: false }));
                                                    } finally {
                                                        setVideoLoading(false);
                                                    }
                                                }}
                                                className="ml-auto text-[10px] font-mono font-bold flex items-center gap-2 px-3 py-1.5 rounded-sm outline-none transition-all bg-accent-500 text-black hover:bg-accent-400 shadow-[0_0_15px_rgba(var(--accent-500),0.3)]"
                                            >
                                                <Play size={12} className="fill-black" /> Watch Video
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Video Player Modal */}
            <VideoPlayer
                isOpen={selectedVideo.isOpen}
                onClose={() => {
                    setSelectedVideo({ ...selectedVideo, isOpen: false });
                    if (blobUrl) {
                        URL.revokeObjectURL(blobUrl);
                        setBlobUrl(null);
                    }
                    setVideoTimestamps([]);
                }}
                title={selectedVideo.title}
                videoUrl={selectedVideo.url}
                isLoading={videoLoading}
                timestamps={videoTimestamps}
            />
        </div>
    );
}
