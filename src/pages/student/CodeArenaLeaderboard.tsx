import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Terminal,
    Code2,
    Briefcase,
    ChevronRight,
    ChevronLeft,
    Box,
    FileText,
    Activity,
    LogOut,
    Trophy,
    Search,
    Mail,
    Presentation,
    PenTool
} from 'lucide-react';

const CodeArenaLeaderboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const sidebarItems = [
        { icon: Mail, label: 'MAIL', path: '/student/mail' },
        { icon: Presentation, label: 'WEBINARS', path: '/student/webinars' },
        { icon: Terminal, label: 'CMD CENTER', path: '/student/dashboard' },
        { icon: Code2, label: 'CODE ARENA', active: true, path: '/student/codearena' },
        { icon: PenTool, label: 'DESIGN ARENA', path: '/student/designarena' },
        { icon: Briefcase, label: 'INTERVIEWS', path: '/student/interview' },
        { icon: FileText, label: 'APPLICATIONS', path: '/student/dashboard' },
        { icon: Box, label: 'PROJECTS', path: '/student/dashboard' },
        { icon: Activity, label: 'ANALYTICS', path: '/student/dashboard' },
    ];

    const leaderboardData = [
        { rank: 1, user: 'Alex Chen', score: 15420, solved: 450, tier: 'Grandmaster' },
        { rank: 2, user: 'Sarah Jenkins', score: 14200, solved: 412, tier: 'Master' },
        { rank: 3, user: 'David Kim', score: 13850, solved: 398, tier: 'Master' },
        { rank: 4, user: 'Priya Patel', score: 12100, solved: 345, tier: 'Candidate Master' },
        { rank: 5, user: 'Michael Chang', score: 11950, solved: 332, tier: 'Candidate Master' },
        { rank: 6, user: 'Emma Wilson', score: 10500, solved: 290, tier: 'Expert' },
        { rank: 7, user: 'James Rodriguez', score: 9800, solved: 275, tier: 'Expert' },
        { rank: 8, user: 'Lisa Wang', score: 9200, solved: 250, tier: 'Specialist' },
        { rank: 9, user: 'Devansh Behl', score: 8500, solved: 231, tier: 'Specialist', isCurrentUser: true },
        { rank: 10, user: 'Tom Harris', score: 8100, solved: 220, tier: 'Pupil' },
    ];

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'Grandmaster': return 'text-red-500 bg-red-500/10 border-red-500/30';
            case 'Master': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
            case 'Candidate Master': return 'text-purple-500 bg-purple-500/10 border-purple-500/30';
            case 'Expert': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
            case 'Specialist': return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30';
            default: return 'text-green-500 bg-green-500/10 border-green-500/30'; // Pupil/Newbie
        }
    };

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
                {/* Logo Area */}
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

                {/* Navigation Items */}
                <div className="flex-1 py-6 flex flex-col gap-1 px-3 overflow-y-auto custom-scrollbar">
                    {sidebarItems.map((item, index) => (
                        <Link to={item.path} key={index}>
                            <button
                                className={`w-full flex items-center px-3 py-2.5 rounded-sm transition-all duration-200 group relative
                                    ${item.active ? 'bg-[#111] border border-[#333] border-l-2 border-l-accent-500 text-white' : 'border border-transparent text-[#888] hover:bg-[#111] hover:border-[#222] hover:text-white'}`}
                            >
                                <item.icon size={16} className={`min-w-[16px] ${item.active ? 'text-accent-400' : 'group-hover:text-white transition-colors'}`} />
                                <AnimatePresence>
                                    {isSidebarOpen && (
                                        <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="ml-3 font-mono text-[10px] uppercase tracking-widest whitespace-nowrap overflow-hidden">
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                        </Link>
                    ))}
                </div>

                {/* User Profile Mini */}
                <div className="p-4 border-t border-[#222]">
                    <div className="flex items-center group cursor-pointer hover:bg-[#111] p-2 rounded-sm border border-transparent hover:border-[#333] transition-colors">
                        <div className="w-8 h-8 rounded-sm bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-white font-mono text-xs font-bold shrink-0">DB</div>
                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="ml-3 overflow-hidden flex-1 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-mono text-white whitespace-nowrap uppercase tracking-wider">Devansh Behl</p>
                                        <p className="text-[10px] font-mono text-accent-500 whitespace-nowrap">STUDENT</p>
                                    </div>
                                    <LogOut size={14} className="text-[#555] group-hover:text-red-400 transition-colors" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <div className="max-w-5xl mx-auto flex flex-col gap-6">

                        {/* Top Navigation Strip */}
                        <div className="flex items-center gap-4 text-sm font-mono uppercase tracking-widest border-b border-[#333] pb-4">
                            <Link to="/student/codearena" className="text-[#888] hover:text-white transition-colors">Problems</Link>
                            <span className="text-accent-500 border-b-2 border-accent-500 pb-4 -mb-[17px]">Leaderboard</span>
                            <Link to="/student/codearena/submissions" className="text-[#888] hover:text-white transition-colors">Submissions</Link>
                        </div>

                        {/* Header */}
                        <div className="border border-[#333] bg-[#0A0A0A] p-6 lg:p-8 shadow-2xl relative rounded-sm flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden">
                            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-accent-500/5 blur-[100px] rounded-full pointer-events-none"></div>

                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 border border-[#333] bg-[#111] px-2 py-1 text-[10px] text-[#aaa] rounded-sm mb-4 font-mono tracking-widest uppercase">
                                    <Trophy size={12} className="text-yellow-500" />
                                    GLOBAL RANKINGS
                                </div>
                                <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight uppercase">
                                    HALL OF <span className="text-accent-400 font-serif italic">FAME</span>
                                </h1>
                                <p className="text-[#888] font-mono text-xs mt-2 w-full max-w-lg leading-relaxed">
                                    Compete with peers. Solve more problems to climb the leaderboard and earn exclusive badges.
                                </p>
                            </div>
                        </div>

                        {/* Search & Filters */}
                        <div className="flex items-center justify-between bg-[#0A0A0A] border border-[#222] p-4 rounded-sm">
                            <div className="relative flex-1 max-w-sm">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className="w-full bg-[#111] border border-[#333] pl-9 pr-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-accent-500 rounded-sm"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-[#0A0A0A] border border-[#222] rounded-sm overflow-hidden mb-20">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[#222] bg-[#111]">
                                        <th className="py-3 px-6 font-mono text-[10px] uppercase tracking-widest text-[#666] font-normal w-24">Rank</th>
                                        <th className="py-3 px-6 font-mono text-[10px] uppercase tracking-widest text-[#666] font-normal">User</th>
                                        <th className="py-3 px-6 font-mono text-[10px] uppercase tracking-widest text-[#666] font-normal w-40">Tier</th>
                                        <th className="py-3 px-6 font-mono text-[10px] uppercase tracking-widest text-[#666] font-normal w-32 text-right">Problems Solved</th>
                                        <th className="py-3 px-6 font-mono text-[10px] uppercase tracking-widest text-accent-500 font-normal w-32 text-right">Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboardData.map((data, idx) => (
                                        <tr key={idx} className={`border-b border-[#222] hover:bg-[#111] transition-colors ${data.isCurrentUser ? 'bg-accent-500/5' : ''}`}>
                                            <td className="py-4 px-6 font-mono text-sm">
                                                <div className="flex items-center gap-2">
                                                    {data.rank === 1 && <Trophy size={14} className="text-yellow-500" />}
                                                    {data.rank === 2 && <Trophy size={14} className="text-gray-300" />}
                                                    {data.rank === 3 && <Trophy size={14} className="text-amber-600" />}
                                                    <span className={data.rank <= 3 ? 'font-bold text-white' : 'text-[#888]'}>
                                                        #{data.rank}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 font-sans font-bold text-sm text-white">
                                                {data.user} {data.isCurrentUser && <span className="ml-2 text-[9px] font-mono text-accent-500 uppercase tracking-widest border border-accent-500/30 px-1.5 py-0.5 rounded-sm">You</span>}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 border rounded-sm ${getTierColor(data.tier)}`}>
                                                    {data.tier}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 font-mono text-xs text-[#aaa] text-right">
                                                {data.solved}
                                            </td>
                                            <td className="py-4 px-6 font-mono text-sm font-bold text-accent-400 text-right">
                                                {data.score.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default CodeArenaLeaderboard;
