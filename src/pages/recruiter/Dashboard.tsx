import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Terminal,
    Users,
    Video,
    ChevronRight,
    ChevronLeft,
    LogOut,
    Calendar,
    Search,
    Filter,
    Clock,
    Play,
    Star,
    X,
    TrendingUp,
    CheckCircle2,
    Eye,
    Briefcase,
    GraduationCap,
    Award,
    Code2
} from 'lucide-react';

/* ────────── Types & Mock Data ────────── */
type TabType = 'INTERVIEWS' | 'RECORDINGS';
type StudentFilter = 'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

interface Project {
    title: string;
    description: string;
    techStack: string[];
}

interface Candidate {
    id: string;
    name: string;
    role: string;
    date: string;
    time: string;
    status: 'Upcoming' | 'In Progress' | 'Completed';
    gender: 'male' | 'female';
    academics: string;
    cgpa: string;
    specialization: string;
    codeArenaScore: number;
    universityRank: number;
    projects: Project[];
    university: string;
}

const SCHEDULED_INTERVIEWS: Candidate[] = [
    {
        id: '1',
        name: 'Alex Johnson',
        role: 'Frontend Engineer',
        date: 'Mar 25',
        time: '14:00',
        status: 'Upcoming',
        gender: 'male',
        academics: 'B.Tech in Computer Science',
        cgpa: '8.9/10',
        specialization: 'Frontend Development & UI/UX',
        codeArenaScore: 1845,
        universityRank: 12,
        university: 'IIT Delhi',
        projects: [
            {
                title: 'E-commerce React Dashboard',
                description: 'A full-featured admin dashboard built with React, Redux, and TailwindCSS for managing products, orders, and users.',
                techStack: ['React', 'Redux', 'TailwindCSS', 'Firebase']
            },
            {
                title: 'Real-time Chat App',
                description: 'WebSocket-based chat application with typing indicators, read receipts, and room management.',
                techStack: ['Node.js', 'Socket.io', 'React']
            }
        ]
    },
    {
        id: '2',
        name: 'Sarah Chen',
        role: 'Backend Engineer',
        date: 'Mar 26',
        time: '10:30',
        status: 'Upcoming',
        gender: 'female',
        academics: 'M.S. in Software Engineering',
        cgpa: '3.8/4.0',
        specialization: 'Distributed Systems & API Design',
        codeArenaScore: 2150,
        universityRank: 3,
        university: 'IIT Bombay',
        projects: [
            {
                title: 'Microservices Payment Gateway',
                description: 'Designed a resilient payment gateway using Go and gRPC, capable of handling 5000+ TPS with 99.99% uptime.',
                techStack: ['Go', 'gRPC', 'PostgreSQL', 'Redis', 'Kafka']
            }
        ]
    },
    {
        id: '3',
        name: 'Michael Rodriguez',
        role: 'Full Stack Engineer',
        date: 'Mar 28',
        time: '16:00',
        status: 'Upcoming',
        gender: 'male',
        academics: 'B.S. in Information Technology',
        cgpa: '3.6/4.0',
        specialization: 'Web Applications & Database Optimization',
        codeArenaScore: 1680,
        universityRank: 45,
        university: 'NIT Trichy',
        projects: [
            {
                title: 'Social Media Analytics Tool',
                description: 'Full stack app aggregating social metrics, visualizing trends using D3.js and a Python backend.',
                techStack: ['Python', 'Django', 'React', 'D3.js']
            },
            {
                title: 'Task Management System',
                description: 'Kanban board application with drag-and-drop functionality and offline sync capabilities.',
                techStack: ['TypeScript', 'Next.js', 'Prisma']
            }
        ]
    }
];

const RECORDINGS = [
    { student: 'Priya Patel', university: 'IIT Bombay', role: 'SWE', date: 'Mar 15, 2026', duration: '45 min', rating: 4.5, type: 'TECHNICAL', verdict: 'SELECTED' },
    { student: 'Vikram Singh', university: 'NIT Trichy', role: 'Systems Eng.', date: 'Mar 14, 2026', duration: '52 min', rating: 4.8, type: 'TECHNICAL', verdict: 'SELECTED' },
    { student: 'Kavya Iyer', university: 'IIT Bombay', role: 'Backend Eng.', date: 'Mar 13, 2026', duration: '38 min', rating: 3.5, type: 'TECHNICAL', verdict: 'PENDING' },
    { student: 'Arjun Nair', university: 'BITS Pilani', role: 'SDE I', date: 'Mar 12, 2026', duration: '40 min', rating: 2.8, type: 'TECHNICAL', verdict: 'REJECTED' },
];

/* ────────── Component ────────── */
export default function RecruiterDashboard() {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('INTERVIEWS');
    const [studentFilter, setStudentFilter] = useState<StudentFilter>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

    const sidebarItems = [
        { icon: Terminal, label: 'CMD CENTER', active: true },
        { icon: Video, label: 'INTERVIEWS', onClick: () => setActiveTab('INTERVIEWS') },
        { icon: Play, label: 'RECORDINGS', onClick: () => setActiveTab('RECORDINGS') },
    ];

    const filteredInterviews = SCHEDULED_INTERVIEWS.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.role.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const getVerdictStyle = (verdict: string) => {
        switch (verdict) {
            case 'SELECTED': return 'text-green-400 border-green-500/20';
            case 'REJECTED': return 'text-red-400 border-red-500/20';
            case 'PENDING': return 'text-yellow-400 border-yellow-500/20';
            default: return 'text-[#888] border-[#333]';
        }
    };

    const tabs: { key: TabType; label: string; icon: typeof Terminal }[] = [
        { key: 'INTERVIEWS', label: 'Upcoming Interviews', icon: Calendar },
        { key: 'RECORDINGS', label: 'My Recordings', icon: Play },
    ];

    return (
        <div className="h-screen w-full bg-[#050505] font-sans text-white selection:bg-accent-500/30 selection:text-white relative overflow-hidden flex">
            {/* Background Dots */}
            <div className="fixed inset-0 pointer-events-none z-0 dotted-bg"></div>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 240 : 70 }}
                className="h-screen bg-[#0A0A0A] border-r border-[#222] flex flex-col relative flex-shrink-0 z-20"
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
                    {sidebarItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                if (item.onClick) item.onClick();
                            }}
                            className={`flex items-center px-3 py-2.5 rounded-sm transition-all duration-200 group relative
                                ${item.active && index === 0
                                    ? 'bg-[#111] border border-[#333] border-l-2 border-l-accent-500 text-white'
                                    : 'border border-transparent text-[#888] hover:bg-[#111] hover:border-[#222] hover:text-white'
                                }`}
                        >
                            <item.icon size={16} className={`min-w-[16px] ${item.active && index === 0 ? 'text-accent-400' : 'group-hover:text-white transition-colors'}`} />
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

                <div className="p-4 border-t border-[#222]">
                    <div className="flex items-center group cursor-pointer hover:bg-[#111] p-2 rounded-sm border border-transparent hover:border-[#333] transition-colors">
                        <div className="w-8 h-8 rounded-sm bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-white font-mono text-xs font-bold shrink-0">
                            HR
                        </div>
                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="ml-3 overflow-hidden flex-1 flex items-center justify-between"
                                >
                                    <div>
                                        <p className="text-xs font-mono text-white whitespace-nowrap uppercase tracking-wider">John Doe</p>
                                        <p className="text-[10px] font-mono text-accent-500 whitespace-nowrap">RECRUITER</p>
                                    </div>
                                    <LogOut size={14} className="text-[#555] group-hover:text-red-400 transition-colors" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative z-10 flex flex-col">
                <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">

                    {/* Header */}
                    <div className="border border-[#333] bg-[#0A0A0A] p-6 lg:p-8 shadow-2xl relative rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-[1px] bg-gradient-to-r from-transparent via-accent-500 to-transparent opacity-50"></div>

                        <div>
                            <div className="inline-flex items-center gap-2 border border-[#333] bg-[#111] px-2 py-1 text-[10px] text-[#aaa] rounded-sm mb-4 font-mono tracking-widest uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse"></span>
                                RECRUITER PORTAL
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight uppercase">
                                <span className="text-accent-400 font-serif italic">My</span> Dashboard
                            </h1>
                            <p className="text-[#888] font-mono text-xs mt-2">
                                /home/recruiter/dashboard
                            </p>
                        </div>
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-[#0A0A0A] border border-[#222] p-5 rounded-sm group hover:border-[#333] transition-colors relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#111] group-hover:bg-accent-500 transition-colors"></div>
                            <h3 className="text-[10px] uppercase font-mono tracking-widest text-[#888] mb-1">Upcoming</h3>
                            <div className="text-3xl font-bold font-sans tracking-tight">{SCHEDULED_INTERVIEWS.length}</div>
                            <div className="text-[10px] font-mono text-green-400 mt-2 flex items-center gap-1">
                                <TrendingUp size={10} /> Next one in 2 hrs
                            </div>
                        </div>
                        <div className="bg-[#0A0A0A] border border-[#222] p-5 rounded-sm group hover:border-[#333] transition-colors relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#111] group-hover:bg-accent-500 transition-colors"></div>
                            <h3 className="text-[10px] uppercase font-mono tracking-widest text-[#888] mb-1">Completed</h3>
                            <div className="text-3xl font-bold font-sans tracking-tight">{RECORDINGS.length}</div>
                            <div className="text-[10px] font-mono text-[#555] mt-2 flex items-center gap-1">
                                <CheckCircle2 size={10} /> past 30 days
                            </div>
                        </div>
                        <div className="bg-[#0A0A0A] border border-[#222] p-5 rounded-sm group hover:border-[#333] transition-colors relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#111] group-hover:bg-accent-500 transition-colors"></div>
                            <h3 className="text-[10px] uppercase font-mono tracking-widest text-[#888] mb-1">Avg Rating</h3>
                            <div className="text-3xl font-bold font-sans tracking-tight text-yellow-400 flex items-center"><Star size={24} className="fill-yellow-400 mr-2" /> 4.2</div>
                            <div className="text-[10px] font-mono text-[#555] mt-2">from your given ratings</div>
                        </div>
                        <div className="bg-[#0A0A0A] border border-[#222] p-5 rounded-sm group hover:border-[#333] transition-colors relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#111] group-hover:bg-accent-500 transition-colors"></div>
                            <h3 className="text-[10px] uppercase font-mono tracking-widest text-[#888] mb-1">Time Spent</h3>
                            <div className="text-3xl font-bold font-sans tracking-tight text-accent-400">12h</div>
                            <div className="text-[10px] font-mono text-[#555] mt-2">in interviews this week</div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex items-center gap-1 border-b border-[#222] pb-0 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-4 py-3 text-[10px] font-mono uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
                                    activeTab === tab.key
                                        ? 'border-accent-500 text-accent-400'
                                        : 'border-transparent text-[#666] hover:text-white'
                                }`}
                            >
                                <tab.icon size={13} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.2 }}
                        >

                            {/* ───── INTERVIEWS TAB ───── */}
                            {activeTab === 'INTERVIEWS' && (
                                <div className="space-y-6">
                                    <div className="bg-[#0A0A0A] border border-[#222] rounded-sm">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 pb-4 border-b border-[#222] gap-4">
                                            <h3 className="text-sm font-bold font-sans uppercase tracking-widest text-white flex items-center gap-2">
                                                <Calendar size={16} className="text-[#888]" />
                                                My Schedule ({filteredInterviews.length})
                                            </h3>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <div className="relative">
                                                    <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#555]" />
                                                    <input
                                                        type="text"
                                                        placeholder="Name, role, university..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="bg-[#050505] border border-[#333] rounded-sm pl-7 pr-3 py-1.5 text-[10px] font-mono text-white placeholder:text-[#555] outline-none focus:border-accent-500 transition-colors w-48"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Filter size={10} className="text-[#555]" />
                                                    {(['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'] as const).map((f) => (
                                                        <button
                                                            key={f}
                                                            onClick={() => setStudentFilter(f)}
                                                            className={`text-[9px] font-mono uppercase tracking-widest px-2 py-1 border rounded-sm transition-colors ${
                                                                studentFilter === f
                                                                    ? 'border-accent-500/50 text-accent-400 bg-accent-500/10'
                                                                    : 'border-[#333] text-[#666] hover:text-white hover:border-[#555]'
                                                            }`}
                                                        >
                                                            {f}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="divide-y divide-[#1a1a1a]">
                                            {filteredInterviews.map((interview, i) => (
                                                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-5 hover:bg-[#050505] transition-colors group">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-10 h-10 rounded-sm bg-[#111] border border-[#333] flex items-center justify-center text-accent-400 font-mono text-sm font-bold shrink-0">
                                                            {interview.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <h4 className="font-sans font-bold text-sm text-white group-hover:text-accent-400 transition-colors">{interview.name}</h4>
                                                                <span className="text-[9px] font-mono px-2 py-0.5 border rounded-sm uppercase tracking-widest border-accent-500/50 text-accent-400 bg-accent-500/10">
                                                                    {interview.status}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-[10px] font-mono text-[#666] uppercase tracking-widest mt-1 mb-2">
                                                                <span>{interview.university}</span>
                                                                <span>•</span>
                                                                <span>{interview.role}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => setSelectedCandidate(interview)}
                                                                className="text-xs text-accent-400 hover:text-accent-300 transition-colors underline underline-offset-2 flex items-center gap-1"
                                                            >
                                                                <Users size={12} /> View Profile
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6 mt-3 md:mt-0">
                                                        <div className="text-right">
                                                            <div className="text-xs font-mono text-white flex items-center gap-2 mb-1">
                                                                <Calendar size={12} className="text-accent-500" /> {interview.date}
                                                            </div>
                                                            <div className="text-[10px] font-mono text-[#aaa] flex items-center gap-2 justify-end">
                                                                <Clock size={12} className="text-accent-500" /> {interview.time}
                                                            </div>
                                                        </div>
                                                        <Link
                                                            to={`/recruiter/interview?participant=${interview.id}&time=${interview.date}T${interview.time}:00`}
                                                            className="flex items-center justify-center gap-2 bg-accent-500/10 hover:bg-accent-500/20 border border-accent-500/30 rounded-sm px-4 py-2 text-xs font-bold font-mono tracking-widest text-accent-400 transition-colors"
                                                        >
                                                            <Video size={14} /> JOIN
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ───── RECORDINGS TAB ───── */}
                            {activeTab === 'RECORDINGS' && (
                                <div className="bg-[#0A0A0A] border border-[#222] rounded-sm">
                                    <div className="p-6 pb-4 border-b border-[#222]">
                                        <h3 className="text-sm font-bold font-sans uppercase tracking-widest text-white flex items-center gap-2">
                                            <Video size={16} className="text-[#888]" />
                                            Past Recordings
                                        </h3>
                                    </div>
                                    <div className="divide-y divide-[#1a1a1a]">
                                        {RECORDINGS.map((rec, i) => (
                                            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-5 hover:bg-[#050505] transition-colors group cursor-pointer">
                                                <div className="flex items-start gap-4 flex-1">
                                                    <div className="w-10 h-10 rounded-sm bg-[#111] border border-[#333] flex items-center justify-center shrink-0 group-hover:border-accent-500/50 transition-colors">
                                                        <Play size={16} className="text-[#555] group-hover:text-accent-400 transition-colors ml-0.5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-sans font-bold text-sm text-white group-hover:text-accent-400 transition-colors">{rec.student}</h4>
                                                        <div className="flex items-center gap-3 text-[10px] font-mono text-[#666] uppercase tracking-widest mt-1">
                                                            <span>{rec.university}</span>
                                                            <span>•</span>
                                                            <span>{rec.role}</span>
                                                            <span>•</span>
                                                            <span>{rec.type}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-[10px] font-mono text-[#555] mt-2">
                                                            <span>{rec.date}</span>
                                                            <span>•</span>
                                                            <span>{rec.duration}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 mt-3 md:mt-0">
                                                    {/* Rating */}
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, si) => (
                                                            <Star key={si} size={12} className={si < Math.floor(rec.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-[#333]'} />
                                                        ))}
                                                        <span className="text-[10px] font-mono text-[#888] ml-1">{rec.rating}</span>
                                                    </div>
                                                    <span className={`text-[9px] font-mono px-2 py-1 border rounded-sm uppercase tracking-widest ${getVerdictStyle(rec.verdict)}`}>
                                                        {rec.verdict}
                                                    </span>
                                                    <button className="p-2 bg-[#111] border border-[#333] rounded-sm hover:border-accent-500 transition-colors flex items-center gap-1">
                                                        <Eye size={14} className="text-[#888] group-hover:text-accent-400" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Candidate Profile Modal */}
            <AnimatePresence>
                {selectedCandidate && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedCandidate(null)}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-[#0A0A0A] border border-[#222] rounded-sm w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
                        >
                            {/* Modal Header */}
                            <div className="shrink-0 h-20 bg-gradient-to-r from-[#111] to-[#0A0A0A] border-b border-[#222] flex items-center justify-between px-6 relative overflow-hidden">
                                <div className="absolute -right-10 -top-10 text-accent-500/5 rotate-12 pointer-events-none">
                                    <Briefcase size={120} />
                                </div>
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-14 h-14 rounded-sm bg-gradient-to-br from-[#222] to-[#111] border border-[#333] flex items-center justify-center text-2xl font-bold font-mono text-white/80 shadow-inner">
                                        {selectedCandidate.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                            {selectedCandidate.name}
                                            <span className="text-[10px] bg-accent-500/20 text-accent-400 px-2 py-0.5 rounded-sm font-mono font-normal uppercase tracking-widest border border-accent-500/30">
                                                Verified
                                            </span>
                                        </h2>
                                        <p className="text-sm text-[#888] font-mono">{selectedCandidate.role}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedCandidate(null)}
                                    className="p-2 bg-[#111] hover:bg-[#222] rounded-sm text-[#666] hover:text-white transition-colors border border-[#333] relative z-10"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 bg-[#050505] relative">
                                {/* Top Stats Row */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="bg-[#111] border border-[#222] rounded-sm p-4 flex flex-col gap-2 relative overflow-hidden group">
                                        <div className="absolute -right-2 -bottom-2 text-[#222] transition-transform group-hover:scale-110">
                                            <GraduationCap size={48} />
                                        </div>
                                        <span className="text-[#888] text-[10px] font-mono uppercase tracking-widest relative z-10">CGPA</span>
                                        <span className="text-xl font-bold text-white relative z-10">{selectedCandidate.cgpa}</span>
                                    </div>
                                    <div className="bg-[#111] border border-[#222] rounded-sm p-4 flex flex-col gap-2 relative overflow-hidden group">
                                        <div className="absolute -right-2 -bottom-2 text-[#222] transition-transform group-hover:scale-110">
                                            <TrendingUp size={48} />
                                        </div>
                                        <span className="text-[#888] text-[10px] font-mono uppercase tracking-widest relative z-10">Score</span>
                                        <span className="text-xl font-bold text-accent-400 relative z-10">{selectedCandidate.codeArenaScore}</span>
                                    </div>
                                    <div className="bg-[#111] border border-[#222] rounded-sm p-4 flex flex-col gap-2 relative overflow-hidden group">
                                        <div className="absolute -right-2 -bottom-2 text-[#222] transition-transform group-hover:scale-110">
                                            <Trophy size={48} />
                                        </div>
                                        <span className="text-[#888] text-[10px] font-mono uppercase tracking-widest relative z-10">Uni Rank</span>
                                        <span className="text-xl font-bold text-white relative z-10">#{selectedCandidate.universityRank}</span>
                                    </div>
                                    <div className="bg-[#111] border border-[#222] rounded-sm p-4 flex flex-col gap-2 relative overflow-hidden group">
                                        <div className="absolute -right-2 -bottom-2 text-[#222] transition-transform group-hover:scale-110">
                                            <Star size={48} />
                                        </div>
                                        <span className="text-[#888] text-[10px] font-mono uppercase tracking-widest relative z-10">Status</span>
                                        <span className="text-sm font-bold text-green-400 relative z-10 mt-1 uppercase tracking-widest font-mono">{selectedCandidate.status}</span>
                                    </div>
                                </div>

                                {/* Academics & Specialization */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <section>
                                        <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#aaa] mb-3 flex items-center gap-2">
                                            <Award size={14} className="text-accent-500" />
                                            Academics
                                        </h3>
                                        <div className="bg-[#0A0A0A] border border-[#222] rounded-sm p-4">
                                            <p className="font-sans text-sm font-bold text-white/90">{selectedCandidate.academics}</p>
                                        </div>
                                    </section>
                                    <section>
                                        <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#aaa] mb-3 flex items-center gap-2">
                                            <Code2 size={14} className="text-accent-500" />
                                            Key Specialization
                                        </h3>
                                        <div className="bg-[#0A0A0A] border border-[#222] rounded-sm p-4">
                                            <p className="font-sans text-sm font-bold text-white/90">{selectedCandidate.specialization}</p>
                                        </div>
                                    </section>
                                </div>

                                {/* Projects */}
                                <section>
                                    <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#aaa] mb-4 flex items-center gap-2">
                                        <Briefcase size={14} className="text-accent-500" />
                                        Featured Projects ({selectedCandidate.projects.length})
                                    </h3>
                                    <div className="space-y-4">
                                        {selectedCandidate.projects.map((project, idx) => (
                                            <div key={idx} className="bg-[#0A0A0A] border border-[#222] hover:border-[#333] rounded-sm p-5 transition-colors">
                                                <h4 className="font-bold font-sans text-white text-md mb-2">{project.title}</h4>
                                                <p className="text-[#888] text-xs font-mono leading-relaxed mb-4">
                                                    {project.description}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {project.techStack.map(tech => (
                                                        <span key={tech} className="px-2 py-0.5 bg-[#111] border border-[#333] text-[#aaa] text-[9px] uppercase tracking-widest font-mono rounded-sm">
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                            </div>

                            {/* Modal Footer */}
                            <div className="shrink-0 p-5 bg-[#0A0A0A] border-t border-[#222] flex justify-end gap-3">
                                <button
                                    onClick={() => setSelectedCandidate(null)}
                                    className="px-5 py-2.5 rounded-sm border border-[#333] text-xs font-mono uppercase tracking-widest text-[#888] hover:text-white hover:bg-[#111] transition-colors"
                                >
                                    Close
                                </button>
                                <Link
                                    to={`/recruiter/interview?participant=${selectedCandidate.id}&time=${selectedCandidate.date}T${selectedCandidate.time}:00`}
                                    className="px-6 py-2.5 rounded-sm bg-accent-500/10 border border-accent-500/30 text-accent-400 font-bold text-xs uppercase tracking-widest font-mono hover:bg-accent-500/20 transition-colors flex items-center gap-2"
                                >
                                    Join Interview <ChevronRight size={14} />
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global scrollbar styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                  width: 4px;
                  height: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: #333;
                  border-radius: 0px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: #555;
                }
            `}} />
        </div>
    );
}
