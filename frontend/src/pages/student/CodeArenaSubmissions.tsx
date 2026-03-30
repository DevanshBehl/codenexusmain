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
    CheckCircle2,
    XCircle,
    Clock,
    Mail,
    Presentation,
    PenTool
} from 'lucide-react';

const CodeArenaSubmissions = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const sidebarItems = [
        { icon: Mail, label: 'MAIL', path: '/student/mail' },
        { icon: Presentation, label: 'WEBINARS', path: '/student/webinars' },
        { icon: Terminal, label: 'CMD CENTER', path: '/student/dashboard' },
        { icon: Code2, label: 'CODE ARENA', active: true, path: '/student/codearena' },
        { icon: PenTool, label: 'DESIGN ARENA', path: '/student/designarena' },
        { icon: Briefcase, label: 'INTERVIEWS', path: '/student/interview' },
        { icon: FileText, label: 'PROFILE', path: '/student/profile' },
        { icon: Box, label: 'PROJECTS', path: '/student/projects' },
    ];

    const submissionsData = [
        { id: '1042', time: '10 mins ago', problem: 'Two Sum', problemId: '1', status: 'Accepted', runtime: '5 ms', memory: '10.2 MB', language: 'C++' },
        { id: '1041', time: '15 mins ago', problem: 'Two Sum', problemId: '1', status: 'Wrong Answer', runtime: 'N/A', memory: 'N/A', language: 'C++' },
        { id: '1040', time: '2 hours ago', problem: 'Merge K Sorted Lists', problemId: '23', status: 'Time Limit Exceeded', runtime: 'N/A', memory: 'N/A', language: 'Python 3' },
        { id: '1039', time: '1 day ago', problem: 'Container With Most Water', problemId: '11', status: 'Accepted', runtime: '52 ms', memory: '55.4 MB', language: 'Java' },
        { id: '1038', time: '2 days ago', problem: 'Valid Parentheses', problemId: '20', status: 'Accepted', runtime: '48 ms', memory: '42.1 MB', language: 'JavaScript' },
        { id: '1037', time: '2 days ago', problem: 'Valid Parentheses', problemId: '20', status: 'Compile Error', runtime: 'N/A', memory: 'N/A', language: 'JavaScript' },
    ];

    const getStatusDetails = (status: string) => {
        switch (status) {
            case 'Accepted': return { color: 'text-green-500', icon: <CheckCircle2 size={14} className="text-green-500" /> };
            case 'Wrong Answer': return { color: 'text-red-500', icon: <XCircle size={14} className="text-red-500" /> };
            case 'Time Limit Exceeded': return { color: 'text-orange-500', icon: <Clock size={14} className="text-orange-500" /> };
            case 'Compile Error': return { color: 'text-yellow-500', icon: <Terminal size={14} className="text-yellow-500" /> };
            default: return { color: 'text-gray-500', icon: <div className="w-3.5 h-3.5 rounded-full border border-[#444]"></div> };
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
                <div className="h-16 flex items-center px-4 border-b border-[#222]">
                    <Link to="/" className="flex items-center gap-2 text-accent-500 font-bold text-xl italic font-serif">
                        <span>{'<'}</span>
                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden whitespace-nowrap">
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
                        <Link to={item.path} key={index}>
                            <button className={`w-full flex items-center px-3 py-2.5 rounded-sm transition-all duration-200 group relative ${item.active ? 'bg-[#111] border border-[#333] border-l-2 border-l-accent-500 text-white' : 'border border-transparent text-[#888] hover:bg-[#111] hover:border-[#222] hover:text-white'}`}>
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
                            <Link to="/student/codearena/leaderboard" className="text-[#888] hover:text-white transition-colors">Leaderboard</Link>
                            <span className="text-accent-500 border-b-2 border-accent-500 pb-4 -mb-[17px]">Submissions</span>
                        </div>

                        {/* Title */}
                        <div className="mt-4 mb-2">
                            <h2 className="text-2xl font-bold font-sans text-white">All Submissions</h2>
                        </div>

                        {/* Table */}
                        <div className="bg-[#0A0A0A] border border-[#222] rounded-sm overflow-hidden mb-20">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[#222] bg-[#111]">
                                        <th className="py-3 px-6 font-mono text-[10px] uppercase tracking-widest text-[#666] font-normal w-32">Time Submitted</th>
                                        <th className="py-3 px-6 font-mono text-[10px] uppercase tracking-widest text-[#666] font-normal">Problem</th>
                                        <th className="py-3 px-6 font-mono text-[10px] uppercase tracking-widest text-[#666] font-normal">Status</th>
                                        <th className="py-3 px-6 font-mono text-[10px] uppercase tracking-widest text-[#666] font-normal w-24">Runtime</th>
                                        <th className="py-3 px-6 font-mono text-[10px] uppercase tracking-widest text-[#666] font-normal w-24">Memory</th>
                                        <th className="py-3 px-6 font-mono text-[10px] uppercase tracking-widest text-[#666] font-normal w-28">Language</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissionsData.map((sub, idx) => {
                                        const statusObj = getStatusDetails(sub.status);
                                        return (
                                            <tr key={idx} className="border-b border-[#222] hover:bg-[#111] transition-colors">
                                                <td className="py-4 px-6 font-mono text-xs text-[#888]">
                                                    {sub.time}
                                                </td>
                                                <td className="py-4 px-6 font-sans font-bold text-sm text-white hover:text-accent-400 transition-colors cursor-pointer">
                                                    <Link to={`/student/codearena/${sub.problemId}`}>{sub.problem}</Link>
                                                </td>
                                                <td className="py-4 px-6 font-mono text-xs">
                                                    <div className={`flex items-center gap-2 font-bold ${statusObj.color}`}>
                                                        {statusObj.icon}
                                                        {sub.status}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 font-mono text-xs text-[#aaa]">
                                                    {sub.runtime}
                                                </td>
                                                <td className="py-4 px-6 font-mono text-xs text-[#aaa]">
                                                    {sub.memory}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-[9px] font-mono uppercase tracking-widest text-[#888] bg-[#1a1a1a] px-2 py-0.5 border border-[#333] rounded-sm">
                                                        {sub.language}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default CodeArenaSubmissions;
