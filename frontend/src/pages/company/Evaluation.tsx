import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Terminal,
    Building2,
    Users,
    BarChart3,
    ChevronRight,
    ChevronLeft,
    LogOut,
    Video,
    CheckCircle2,
    Swords,
    Search,
    Play,
    Star,
    X,
    MessageSquare,
    Code2,
    FileText,
    XCircle,
    Check,
    Mail,
    Presentation
} from 'lucide-react';

/* ────────── Types & Mock Data ────────── */
type TabType = 'PENDING' | 'EVALUATED';

interface SolvedQuestion {
    title: string;
    testCasesPassed: number;
    totalTestCases: number;
    codeSubmission: string;
}

interface EvaluationCandidate {
    id: string;
    student: string;
    university: string;
    recruiter: string;
    role: string;
    date: string;
    duration: string;
    rating: number;
    notes: string;
    evaluatorNote?: string;
    status: 'PENDING' | 'SELECTED' | 'REJECTED';
    questions: SolvedQuestion[];
}

const mockCandidates: EvaluationCandidate[] = [
    {
        id: 'c1',
        student: 'Kavya Iyer',
        university: 'IIT Bombay',
        recruiter: 'John Doe',
        role: 'Backend Eng.',
        date: 'Mar 13, 2026',
        duration: '38 min',
        rating: 3.5,
        status: 'PENDING',
        notes: "Struggled a bit initially with DP but brute force solution worked. We talked through memoization but ran out of time to implement fully.",
        questions: [
            {
                title: 'Climbing Stairs',
                totalTestCases: 15,
                testCasesPassed: 10,
                codeSubmission: "function climbStairs(n) {\n  // TLE on large inputs\n  if (n <= 2) return n;\n  return climbStairs(n - 1) + climbStairs(n - 2);\n}"
            }
        ]
    },
    {
        id: 'c2',
        student: 'Arjun Nair',
        university: 'BITS Pilani',
        recruiter: 'Jane Smith',
        role: 'SDE I',
        date: 'Mar 12, 2026',
        duration: '40 min',
        rating: 2.8,
        status: 'PENDING',
        notes: "Candidate was unable to grasp the optimal solution even after several hints. The basic string manipulation question was left incomplete.",
        questions: [
            {
                title: 'Valid Palindrome',
                totalTestCases: 10,
                testCasesPassed: 4,
                codeSubmission: "function isPalindrome(s) {\n  const cleanStr = s.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();\n  // Did not finish two-pointer logic\n  for(let i=0; i<cleanStr.length; i++){\n    \n  }\n}"
            }
        ]
    },
    {
        id: 'c3',
        student: 'Vikram Singh',
        university: 'NIT Trichy',
        recruiter: 'John Doe',
        role: 'Systems Eng.',
        date: 'Mar 14, 2026',
        duration: '52 min',
        rating: 4.8,
        status: 'SELECTED',
        notes: "Exceptional knowledge of core CS concepts and systems design. Solved the LRU Cache with perfect concurrency considerations.",
        evaluatorNote: "Strongly agree with recruiter. Making an offer for Systems Team.",
        questions: [
            {
                title: 'LRU Cache',
                totalTestCases: 20,
                testCasesPassed: 20,
                codeSubmission: "class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.cache = new Map();\n  }\n  get(key) {\n    if (!this.cache.has(key)) return -1;\n    const val = this.cache.get(key);\n    this.cache.delete(key);\n    this.cache.set(key, val);\n    return val;\n  }\n  put(key, value) {\n    if (this.cache.has(key)) this.cache.delete(key);\n    this.cache.set(key, value);\n    if (this.cache.size > this.capacity) {\n      this.cache.delete(this.cache.keys().next().value);\n    }\n  }\n}"
            }
        ]
    }
];

export default function CompanyEvaluation() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('PENDING');
    const [searchQuery, setSearchQuery] = useState('');
    const [candidates, setCandidates] = useState<EvaluationCandidate[]>(mockCandidates);
    const [selectedCandidate, setSelectedCandidate] = useState<EvaluationCandidate | null>(null);
    const [evaluatorNote, setEvaluatorNote] = useState('');

    const sidebarItems = [
        { icon: Mail, label: 'MAIL', onClick: () => window.location.href = '/company/mail' },
        { icon: Presentation, label: 'WEBINARS', onClick: () => window.location.href = '/company/ppt' },
        { icon: Terminal, label: 'CMD CENTER', onClick: () => window.location.href = '/company/dashboard' },
        { icon: Building2, label: 'UNIVERSITIES', onClick: () => window.location.href = '/company/dashboard' },
        { icon: Users, label: 'CANDIDATES', onClick: () => window.location.href = '/company/dashboard' },
        { icon: Swords, label: 'CODE ARENA', onClick: () => window.location.href = '/company/dashboard' },
        { icon: Video, label: 'INTERVIEWS', onClick: () => window.location.href = '/company/dashboard' },
        { icon: CheckCircle2, label: 'EVALUATIONS', active: true, onClick: () => window.location.href = '/company/evaluation' },
        { icon: BarChart3, label: 'ANALYTICS', onClick: () => window.location.href = '/company/dashboard' },
    ];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'SELECTED': return 'text-green-400 border-green-500/20 bg-green-500/10';
            case 'REJECTED': return 'text-red-400 border-red-500/20 bg-red-500/10';
            case 'PENDING': return 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10';
            default: return 'text-[#888] border-[#333] bg-[#111]';
        }
    };

    const handleEvaluation = (status: 'SELECTED' | 'REJECTED') => {
        if (!selectedCandidate) return;
        setCandidates(prev => prev.map(c => {
            if (c.id === selectedCandidate.id) {
                return { ...c, status, evaluatorNote };
            }
            return c;
        }));
        setSelectedCandidate(null);
        setEvaluatorNote('');
    };

    const displayList = candidates.filter(c => {
        const matchesTab = activeTab === 'PENDING' ? c.status === 'PENDING' : c.status !== 'PENDING';
        const matchesSearch = c.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.recruiter.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

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

                <div className="p-4 border-t border-[#222]">
                    <div className="flex items-center group cursor-pointer hover:bg-[#111] p-2 rounded-sm border border-transparent hover:border-[#333] transition-colors">
                        <div className="w-8 h-8 rounded-sm bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-white font-mono text-xs font-bold shrink-0">
                            TC
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
                                        <p className="text-xs font-mono text-white whitespace-nowrap uppercase tracking-wider">TechCorp Inc.</p>
                                        <p className="text-[10px] font-mono text-[#888] whitespace-nowrap">HR MANAGER</p>
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
                    <div className="border border-[#333] bg-[#0A0A0A] p-6 lg:p-8 shadow-2xl relative rounded-sm flex flex-col justify-center">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-[1px] bg-gradient-to-r from-transparent via-accent-500 to-transparent opacity-50"></div>

                        <div className="inline-flex items-center gap-2 border border-[#333] bg-[#111] px-2 py-1 text-[10px] text-[#aaa] rounded-sm mb-4 font-mono tracking-widest uppercase self-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse"></span>
                            EVALUATION PORTAL
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight uppercase">
                            <span className="text-accent-400 font-serif italic">Candidate</span> Review
                        </h1>
                        <p className="text-[#888] font-mono text-xs mt-2">
                            /home/company/techcorp/evaluation
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex items-center gap-1 border-b border-[#222] pb-0 overflow-x-auto mt-4">
                        <button
                            onClick={() => setActiveTab('PENDING')}
                            className={`flex items-center gap-2 px-6 py-3 text-[10px] font-mono uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
                                activeTab === 'PENDING'
                                    ? 'border-accent-500 text-accent-400'
                                    : 'border-transparent text-[#666] hover:text-white'
                            }`}
                        >
                            <FileText size={13} />
                            Pending Evaluation ({candidates.filter(c => c.status === 'PENDING').length})
                        </button>
                        <button
                            onClick={() => setActiveTab('EVALUATED')}
                            className={`flex items-center gap-2 px-6 py-3 text-[10px] font-mono uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
                                activeTab === 'EVALUATED'
                                    ? 'border-green-500 text-green-400'
                                    : 'border-transparent text-[#666] hover:text-white'
                            }`}
                        >
                            <CheckCircle2 size={13} />
                            Evaluated Students ({candidates.filter(c => c.status !== 'PENDING').length})
                        </button>
                    </div>

                    {/* List Content */}
                    <div className="bg-[#0A0A0A] border border-[#222] rounded-sm">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 pb-4 border-b border-[#222] gap-4">
                            <h3 className="text-sm font-bold font-sans uppercase tracking-widest text-white flex items-center gap-2">
                                <Users size={16} className="text-[#888]" />
                                {activeTab === 'PENDING' ? 'Awaiting Decision' : 'Evaluated Candidates'}
                            </h3>
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="relative">
                                    <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#555]" />
                                    <input
                                        type="text"
                                        placeholder="Name, role, recruiter..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-[#050505] border border-[#333] rounded-sm pl-7 pr-3 py-1.5 text-[10px] font-mono text-white placeholder:text-[#555] outline-none focus:border-accent-500 transition-colors w-64"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-[#1a1a1a]">
                            {displayList.map((candidate, i) => (
                                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-5 hover:bg-[#050505] transition-colors group cursor-pointer">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={`w-10 h-10 rounded-sm bg-[#111] border flex items-center justify-center shrink-0 ${candidate.status === 'PENDING' ? 'border-[#333] group-hover:border-accent-500/50 text-[#555] group-hover:text-accent-400' : 'border-[#333] text-[#888]'}`}>
                                            <FileText size={16} className="transition-colors" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="font-sans font-bold text-sm text-white group-hover:text-accent-400 transition-colors">{candidate.student}</h4>
                                                <span className={`text-[9px] font-mono px-2 py-0.5 border rounded-sm uppercase tracking-widest ${getStatusStyle(candidate.status)}`}>
                                                    {candidate.status}
                                                </span>
                                                {candidate.status !== 'PENDING' && (
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, si) => (
                                                            <Star key={si} size={10} className={si < Math.floor(candidate.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-[#333]'} />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-mono text-[#666] uppercase tracking-widest mt-1">
                                                <span>{candidate.university}</span>
                                                <span>•</span>
                                                <span>{candidate.role}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-mono text-[#555] mt-2">
                                                <span>{candidate.date}</span>
                                                <span>•</span>
                                                <span>Recruiter: <span className="text-[#aaa]">{candidate.recruiter}</span></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-3 md:mt-0">
                                        <button 
                                            onClick={() => {
                                                setSelectedCandidate(candidate);
                                                setEvaluatorNote(candidate.evaluatorNote || '');
                                            }}
                                            className={`px-4 py-2 bg-[#111] border rounded-sm transition-colors flex items-center gap-2 group/btn ${
                                                candidate.status === 'PENDING' ? 'border-accent-500/50 hover:bg-accent-500/10 hover:border-accent-500' : 'border-[#333] hover:border-[#555]'
                                            }`}
                                        >
                                            <Search size={14} className={candidate.status === 'PENDING' ? 'text-accent-400' : 'text-[#888]'} />
                                            <span className={`text-[10px] font-mono uppercase tracking-widest ${
                                                candidate.status === 'PENDING' ? 'text-accent-400' : 'text-[#aaa]'
                                            }`}>
                                                {candidate.status === 'PENDING' ? 'Review & Decide' : 'View Details'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {displayList.length === 0 && (
                                <div className="text-center py-16 text-[#555] font-mono text-xs uppercase tracking-widest bg-[#050505]">
                                    No candidates found
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Evaluation Modal */}
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
                            className="bg-[#0A0A0A] border border-[#222] rounded-sm w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
                        >
                            {/* Header */}
                            <div className="shrink-0 h-16 bg-gradient-to-r from-[#111] to-[#0A0A0A] border-b border-[#222] flex items-center justify-between px-6">
                                <h2 className="text-sm font-bold font-sans uppercase tracking-widest text-white flex items-center gap-2">
                                    <FileText size={16} className="text-accent-400" /> Evaluation Review: {selectedCandidate.student}
                                </h2>
                                <button
                                    onClick={() => setSelectedCandidate(null)}
                                    className="p-1.5 bg-[#111] hover:bg-[#222] rounded-sm text-[#666] hover:text-white transition-colors border border-[#333]"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-[#050505]">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    
                                    {/* Left Column: Recording & Details */}
                                    <div className="lg:col-span-1 space-y-6">
                                        <div className="w-full aspect-video bg-[#111] border border-[#222] rounded-sm relative overflow-hidden group">
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors cursor-pointer z-10">
                                                <div className="w-12 h-12 rounded-full bg-accent-500/20 border border-accent-500 flex items-center justify-center pl-1 backdrop-blur-sm shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                                                    <Play size={20} className="text-accent-400" />
                                                </div>
                                            </div>
                                            {/* Dummy thumbnail */}
                                            <div className="absolute inset-0 flex items-center justify-between px-4 opacity-50">
                                                <div className="w-24 h-24 rounded-full bg-[#1a1a1a] border border-[#333]" />
                                                <div className="w-16 h-16 rounded-full bg-[#222] border border-[#333]" />
                                            </div>
                                            <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                                                <span className="bg-black/80 px-2 py-1 text-[8px] font-mono text-white rounded-sm border border-[#333] uppercase">Recording</span>
                                                <span className="bg-black/80 px-2 py-1 text-[8px] font-mono text-white rounded-sm border border-[#333]">{selectedCandidate.duration}</span>
                                            </div>
                                        </div>

                                        <div className="bg-[#0A0A0A] border border-[#222] p-4 rounded-sm flex flex-col gap-3">
                                            <div>
                                                <span className="text-[10px] font-mono text-[#888] uppercase tracking-widest block mb-1">Role</span>
                                                <span className="text-sm font-bold font-sans text-white">{selectedCandidate.role}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-mono text-[#888] uppercase tracking-widest block mb-1">Date</span>
                                                <span className="text-sm font-bold font-sans text-white">{selectedCandidate.date}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-mono text-[#888] uppercase tracking-widest block mb-1">Interviewer</span>
                                                <span className="text-sm font-bold font-sans text-accent-400">{selectedCandidate.recruiter}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-mono text-[#888] uppercase tracking-widest block mb-1">Recruiter Rating</span>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} className={i < Math.floor(selectedCandidate.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-[#333]'} />
                                                    ))}
                                                    <span className="text-xs font-mono font-bold text-white ml-2">{selectedCandidate.rating}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-[#0A0A0A] border border-[#222] p-4 rounded-sm">
                                            <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#aaa] mb-2 flex items-center gap-2">
                                                <MessageSquare size={12} className="text-accent-500" /> Recruiter Notes
                                            </h3>
                                            <p className="font-mono text-xs text-[#ccc] leading-relaxed">
                                                {selectedCandidate.notes}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right Column: Technical & Decision */}
                                    <div className="lg:col-span-2 space-y-6 flex flex-col h-full">
                                        <div className="bg-[#0A0A0A] border border-[#222] rounded-sm p-4 flex-1">
                                            <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#aaa] mb-4 flex items-center gap-2">
                                                <Code2 size={12} className="text-accent-500" /> Technical Assessment ({selectedCandidate.questions.length})
                                            </h3>
                                            <div className="space-y-4">
                                                {selectedCandidate.questions.map((q, idx) => {
                                                    const passRate = Math.round((q.testCasesPassed / q.totalTestCases) * 100);
                                                    const isPerfect = q.testCasesPassed === q.totalTestCases;
                                                    return (
                                                        <div key={idx} className="bg-[#111] border border-[#222] rounded-sm overflow-hidden flex flex-col">
                                                            <div className="p-3 border-b border-[#222] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                                <div className="font-bold font-sans text-xs text-white flex items-center gap-2">
                                                                    <div className={`w-2 h-2 rounded-full ${isPerfect ? 'bg-green-400' : 'bg-yellow-400'}`} />
                                                                    {q.title}
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex items-center gap-1.5 opacity-80">
                                                                        <span className="text-[9px] font-mono text-[#888] uppercase">Test Cases:</span>
                                                                        <span className={`text-[10px] font-mono font-bold ${isPerfect ? 'text-green-400' : 'text-yellow-400'}`}>
                                                                            {q.testCasesPassed}/{q.totalTestCases}
                                                                        </span>
                                                                    </div>
                                                                    <div className="w-16 h-1 bg-[#222] rounded-full overflow-hidden shrink-0">
                                                                        <div 
                                                                            className={`h-full ${isPerfect ? 'bg-green-500' : 'bg-yellow-500'}`} 
                                                                            style={{ width: `${passRate}%` }} 
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="p-3 bg-[#050505]">
                                                                <div className="border border-[#333] rounded-sm overflow-hidden" style={{ height: '160px' }}>
                                                                    <Editor
                                                                        value={q.codeSubmission}
                                                                        language="javascript"
                                                                        theme="vs-dark"
                                                                        options={{
                                                                            readOnly: true,
                                                                            minimap: { enabled: false },
                                                                            fontSize: 11,
                                                                            fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, 'Courier New', monospace",
                                                                            lineNumbers: 'on',
                                                                            scrollBeyondLastLine: false,
                                                                            automaticLayout: true,
                                                                            renderLineHighlight: 'none',
                                                                            overviewRulerBorder: false,
                                                                            hideCursorInOverviewRuler: true,
                                                                            domReadOnly: true,
                                                                            padding: { top: 8, bottom: 8 },
                                                                            scrollbar: {
                                                                                vertical: 'auto',
                                                                                horizontal: 'auto',
                                                                                verticalScrollbarSize: 4,
                                                                                horizontalScrollbarSize: 4,
                                                                            },
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="bg-[#111] border border-[#333] p-4 rounded-sm flex flex-col">
                                            <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#aaa] mb-2 flex items-center gap-2">
                                                <FileText size={12} className="text-white" /> Evaluator's Note (Required)
                                            </h3>
                                            <textarea
                                                readOnly={selectedCandidate.status !== 'PENDING'}
                                                value={evaluatorNote}
                                                onChange={(e) => setEvaluatorNote(e.target.value)}
                                                placeholder={selectedCandidate.status !== 'PENDING' ? '' : "Add final decision notes here..."}
                                                className={`w-full bg-[#050505] border border-[#333] outline-none rounded-sm p-3 text-xs font-mono text-white resize-none min-h-[80px] transition-colors ${selectedCandidate.status === 'PENDING' ? 'focus:border-accent-500' : ''}`}
                                            />
                                        </div>

                                    </div>
                                </div>
                            </div>
                            
                            {/* Footer / Decision Bar */}
                            <div className="shrink-0 p-5 bg-[#0A0A0A] border-t border-[#222] flex justify-between items-center gap-4">
                                <span className={`text-[10px] font-mono px-3 py-1.5 border rounded-sm uppercase tracking-widest ${getStatusStyle(selectedCandidate.status)}`}>
                                    Status: {selectedCandidate.status}
                                </span>
                                
                                <div className="flex items-center gap-3">
                                    {selectedCandidate.status === 'PENDING' ? (
                                        <>
                                            <button
                                                onClick={() => handleEvaluation('REJECTED')}
                                                disabled={evaluatorNote.trim().length === 0}
                                                className="px-6 py-2.5 rounded-sm bg-[#111] border border-[#333] hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 text-xs font-mono uppercase tracking-widest text-[#888] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 group"
                                            >
                                                <XCircle size={14} className="group-hover:text-red-400" /> Reject
                                            </button>
                                            <button
                                                onClick={() => handleEvaluation('SELECTED')}
                                                disabled={evaluatorNote.trim().length === 0}
                                                className="px-6 py-2.5 rounded-sm bg-[#111] border border-[#333] hover:border-green-500/50 hover:bg-green-500/10 hover:text-green-400 text-xs font-bold font-mono uppercase tracking-widest text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 group shadow-2xl"
                                            >
                                                <Check size={14} className="group-hover:text-green-400" /> Select
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setSelectedCandidate(null)}
                                            className="px-6 py-2.5 rounded-sm bg-[#111] border border-[#333] text-xs font-mono uppercase tracking-widest text-white hover:border-[#555] transition-colors"
                                        >
                                            Close Record
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global Custom Scrollbar Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #050505;
          border-left: 1px solid #1a1a1a;
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
