import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Terminal,
    Code2,
    Briefcase,
    FileText,
    Box,
    Activity,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Send,
    PenTool,
    Mail,
    Presentation
} from 'lucide-react';
import Whiteboard from '../../components/Interview/Whiteboard';

const DesignArenaProblem = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Mocks
    const problem = {
        title: 'Design a URL Shortener',
        difficulty: 'Medium',
        acceptance: '45.2%',
        timeLimit: '45.0m',
        memoryLimit: 'N/A',
        tags: ['System Design', 'Scaling', 'Databases'],
        description: `
Design a URL shortening service like bit.ly.

**Requirements:**
1. Given a long URL, the service should generate a shorter and unique alias.
2. When users access the short link, they should be redirected to the original link.
3. The service should be highly available. This is really critical because if the service is down, all the URL redirections will start failing.
4. URL redirection should happen in real-time with minimal latency.
5. Shortened links should not be predictable or easy to guess.

**Core Components to Design:**
- Load Balancer
- Web Servers
- Database Layer
- High throughput Cache

*Use the whiteboard on the right to sketch out your architecture. Submit your design when you are ready.*
        `
    };

    const sidebarItems = [
        { icon: Mail, label: 'MAIL', path: '/student/mail' },
        { icon: Presentation, label: 'WEBINARS', path: '/student/webinars' },
        { icon: Terminal, label: 'CMD CENTER', path: '/student/dashboard' },
        { icon: Code2, label: 'CODE ARENA', path: '/student/codearena' },
        { icon: PenTool, label: 'DESIGN ARENA', active: true, path: '/student/designarena' },
        { icon: Briefcase, label: 'INTERVIEWS', path: '/student/interview' },
        { icon: FileText, label: 'PROFILE', path: '/student/profile' },
        { icon: Box, label: 'PROJECTS', path: '/student/projects' },
    ];

    return (
        <div className="h-screen bg-[#050505] font-sans text-white selection:bg-accent-500/30 selection:text-white overflow-hidden flex flex-col relative">
            {/* Background Dots */}
            <div className="fixed inset-0 pointer-events-none z-0 dotted-bg"></div>

            <div className="flex-1 flex overflow-hidden z-10">
                {/* Sidebar */}
                <motion.aside
                    initial={false}
                    animate={{ width: isSidebarOpen ? 240 : 70 }}
                    className="h-full bg-[#0A0A0A] border-r border-[#222] flex flex-col relative flex-shrink-0"
                >
                    {/* Logo Area */}
                    <div className="h-14 flex items-center px-4 border-b border-[#222]">
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

                    {/* Sidebar Toggle */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="absolute -right-3 top-20 h-6 w-6 bg-[#111] border border-[#333] rounded-sm flex items-center justify-center text-[#888] hover:text-white hover:border-accent-500 transition-colors z-30"
                    >
                        {isSidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
                    </button>

                    {/* Navigation Items */}
                    <div className="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto custom-scrollbar">
                        {sidebarItems.map((item, index) => (
                            <Link to={item.path} key={index}>
                                <button
                                    className={`w-full flex items-center px-3 py-2.5 rounded-sm transition-all duration-200 group relative
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
                            </Link>
                        ))}
                    </div>

                    {/* User Profile Mini */}
                    <div className="p-3 border-t border-[#222]">
                        <div className="flex items-center group cursor-pointer hover:bg-[#111] p-2 rounded-sm border border-transparent hover:border-[#333] transition-colors">
                            <div className="w-8 h-8 rounded-sm bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-white font-mono text-xs font-bold shrink-0">
                                DB
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
                                            <p className="text-[10px] font-mono text-white whitespace-nowrap uppercase tracking-wider">Devansh Behl</p>
                                        </div>
                                        <LogOut size={12} className="text-[#555] group-hover:text-red-400 transition-colors" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.aside>

                {/* Split Layout: Problem Statement + Whiteboard */}
                <div className="flex-1 flex flex-col md:flex-row p-2 gap-2 h-full min-h-0 bg-[#050505]">

                    {/* Left Pane: Problem Description */}
                    <div className="w-full md:w-[35%] lg:w-[30%] bg-[#0A0A0A] border border-[#222] rounded-sm flex flex-col overflow-hidden">
                        {/* Header Tabs */}
                        <div className="flex border-b border-[#222] bg-[#111]">
                            <button className="px-4 py-3 border-r border-[#222] text-[10px] font-mono uppercase tracking-widest text-accent-400 border-b-2 border-accent-500 bg-[#0A0A0A] flex items-center gap-2">
                                <FileText size={12} /> Prompts
                            </button>
                            <button className="px-4 py-3 border-r border-[#222] text-[10px] font-mono uppercase tracking-widest text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors flex items-center gap-2">
                                <Activity size={12} /> History
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <div className="flex justify-between items-start mb-4">
                                <h1 className="text-2xl font-sans font-bold text-white tracking-tight flex items-center gap-3">
                                    {problem.title}
                                </h1>
                            </div>

                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 border rounded-sm text-yellow-500 border-yellow-500/30 bg-yellow-500/10">
                                    {problem.difficulty}
                                </span>
                                <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 border rounded-sm border-[#333] text-[#aaa]">
                                    Acc: {problem.acceptance}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-8">
                                {problem.tags.map((tag, i) => (
                                    <span key={i} className="text-[9px] font-mono uppercase tracking-widest text-[#888] bg-[#111] px-2 py-1 border border-[#333] rounded-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Problem Description */}
                            <div className="prose prose-invert prose-pre:bg-[#111] prose-pre:border prose-pre:border-[#222] prose-pre:rounded-sm max-w-none font-sans text-sm text-[#ccc] leading-relaxed">
                                <p>Design a URL shortening service like bit.ly.</p>
                                <h4 className="text-white font-bold mt-6 mb-2">Requirements:</h4>
                                <ol className="list-decimal pl-5 space-y-1 text-xs">
                                    <li>Given a long URL, the service should generate a shorter and unique alias.</li>
                                    <li>When users access the short link, they should be redirected to the original link.</li>
                                    <li>The service should be highly available. This is really critical because if the service is down, all the URL redirections will start failing.</li>
                                    <li>URL redirection should happen in real-time with minimal latency.</li>
                                    <li>Shortened links should not be predictable or easy to guess.</li>
                                </ol>

                                <h4 className="text-white font-bold mt-6 mb-2">Core Components to Design:</h4>
                                <ul className="list-disc pl-5 space-y-1 text-xs">
                                    <li>Load Balancer</li>
                                    <li>Web Servers</li>
                                    <li>Database Layer</li>
                                    <li>High throughput Cache</li>
                                </ul>
                                
                                <p className="mt-6 italic text-[#888]">
                                    Use the whiteboard on the right to sketch out your architecture. Submit your design when you are ready.
                                </p>
                            </div>
                        </div>

                        {/* Footer limits */}
                        <div className="p-3 border-t border-[#222] bg-[#111] flex justify-between items-center text-[9px] font-mono text-[#666] uppercase tracking-widest">
                            <span>Time Limit: <span className="text-[#aaa]">{problem.timeLimit}</span></span>
                        </div>
                    </div>

                    {/* Right Pane: Whiteboard & Verification */}
                    <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0A] border border-[#222] rounded-sm relative group overflow-hidden">
                        
                        {/* Upper Toolbar */}
                        <div className="flex justify-between items-center border-b border-[#222] bg-[#111] px-4 py-2 h-12">
                            <div className="flex items-center gap-2">
                                <PenTool size={14} className="text-accent-500" />
                                <span className="text-[10px] font-mono uppercase tracking-widest text-[#aaa]">Architecture Canvas</span>
                            </div>
                        </div>

                        {/* Whiteboard Container */}
                        <div className="flex-1 relative bg-[#050505] flex flex-col">
                            <Whiteboard socket={null as any} interviewId="" role="student" />
                        </div>

                        {/* Editor Action Bar (Bottom) */}
                        <div className="border-t border-[#222] bg-[#111] p-3 flex justify-between items-center z-10 w-full relative">
                            <button className="text-[10px] font-mono uppercase tracking-widest text-[#888] hover:text-white flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] border border-[#333] hover:border-[#555] rounded-sm transition-colors">
                                <Terminal size={12} /> Console
                            </button>

                            <div className="flex gap-3">
                                <button className="px-5 py-2 bg-[#e0e0e0] border border-[#e0e0e0] hover:bg-white text-black text-[10px] font-mono uppercase tracking-widest font-bold rounded-sm transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(224,224,224,0.15)] group">
                                    <Send size={12} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" /> Verify Design
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesignArenaProblem;
