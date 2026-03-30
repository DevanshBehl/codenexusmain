import { useState, useEffect } from 'react';
import { problemApi } from '../../lib/api';
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
    LogOut,
    Search,
    Filter,
    CheckCircle2,
    Mail,
    Presentation,
    PenTool
} from 'lucide-react';
import ActivityHeatmap from '../../components/CodeArena/ActivityHeatmap';
import AskAI from '../../components/CodeArena/AskAI';

const CodeArena = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTopic, setActiveTopic] = useState('All');
    const [problems, setProblems] = useState<{id: string; title: string; difficulty: string; points: number; topic: string; status: string;}[]>([]);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const res = await problemApi.getAll({ limit: 200 });
                const data = res.data as any;
                const list = (data.problems || data || []) as any[];
                setProblems(list.map((p: any) => ({
                    id: p.id,
                    title: p.title,
                    difficulty: p.difficulty === 'EASY' ? 'Easy' : p.difficulty === 'MEDIUM' ? 'Medium' : 'Hard',
                    points: p.points || 100,
                    topic: p.topic || 'General',
                    status: 'Unsolved',
                })));
            } catch (err) {
                console.error('Failed to fetch problems:', err);
            }
        };
        fetchProblems();
    }, []);

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

    const topics = [
        'All', 'Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Backtracking', 'Math'
    ];

    const filteredProblems = activeTopic === 'All'
        ? problems
        : problems.filter(p => p.topic === activeTopic);

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'Easy': return 'text-green-500 border-green-500/30 bg-green-500/10';
            case 'Medium': return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
            case 'Hard': return 'text-red-500 border-red-500/30 bg-red-500/10';
            default: return 'text-gray-500 border-gray-500/30 bg-gray-500/10';
        }
    };

    const getStatusIcon = (status: string) => {
        if (status === 'Solved') return <CheckCircle2 size={14} className="text-green-500" />;
        if (status === 'Attempted') return <div className="w-3.5 h-3.5 rounded-full border border-yellow-500 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div></div>;
        return <div className="w-3.5 h-3.5 rounded-full border border-[#444]"></div>;
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

                {/* Sidebar Toggle */}
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
                <div className="p-4 border-t border-[#222]">
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
                    <div className="max-w-6xl mx-auto flex flex-col gap-6">
                        
                        {/* Top Navigation Strip */}
                        <div className="flex items-center gap-4 text-sm font-mono uppercase tracking-widest border-b border-[#333] pb-4">
                            <span className="text-accent-500 border-b-2 border-accent-500 pb-4 -mb-[17px]">Problems</span>
                            <Link to="/student/codearena/leaderboard" className="text-[#888] hover:text-white transition-colors">Leaderboard</Link>
                            <Link to="/student/codearena/submissions" className="text-[#888] hover:text-white transition-colors">Submissions</Link>
                        </div>

                        {/* Header */}
                        <div className="border border-[#333] bg-[#0A0A0A] p-6 lg:p-8 shadow-2xl relative rounded-sm flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-[1px] bg-gradient-to-r from-transparent via-accent-500 to-transparent opacity-50"></div>
                            
                            <div>
                                <div className="inline-flex items-center gap-2 border border-[#333] bg-[#111] px-2 py-1 text-[10px] text-[#aaa] rounded-sm mb-4 font-mono tracking-widest uppercase">
                                    <Code2 size={12} className="text-accent-500" />
                                    ALGORITHM PRACTICE
                                </div>
                                <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight uppercase">
                                    CODE <span className="text-accent-400 font-serif italic">ARENA</span>
                                </h1>
                                <p className="text-[#888] font-mono text-xs mt-2 w-full max-w-lg leading-relaxed">
                                    Master Data Structures and Algorithms. Practice real interview questions and improve your coding skills.
                                </p>
                            </div>

                            <div className="bg-[#111] border border-[#333] p-4 rounded-sm flex gap-4 items-center">
                                <div className="text-center px-4 border-r border-[#333]">
                                    <div className="text-xl font-bold text-white mb-1">24</div>
                                    <div className="text-[9px] font-mono text-[#666] uppercase tracking-widest">Solved</div>
                                </div>
                                <div className="text-center px-4 border-r border-[#333]">
                                    <div className="text-xl font-bold text-accent-400 mb-1">10</div>
                                    <div className="text-[9px] font-mono text-[#666] uppercase tracking-widest">Attempted</div>
                                </div>
                                <div className="text-center px-4">
                                    <div className="text-xl font-bold text-white mb-1">#4289</div>
                                    <div className="text-[9px] font-mono text-[#666] uppercase tracking-widest">Rank</div>
                                </div>
                            </div>
                        </div>

                        {/* Activity Tracker */}
                        <ActivityHeatmap />

                        {/* Topics Filter */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold font-sans uppercase tracking-widest text-[#aaa]">TOPICS</h2>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {topics.map((topic) => (
                                    <button
                                        key={topic}
                                        onClick={() => setActiveTopic(topic)}
                                        className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all rounded-sm border ${
                                            activeTopic === topic
                                                ? 'bg-accent-500/10 border-accent-500 text-accent-400'
                                                : 'bg-[#0A0A0A] border-[#333] text-[#888] hover:border-[#555] hover:text-white'
                                        }`}
                                    >
                                        {topic} {activeTopic === topic && <span className="ml-1 text-[#555]">({problems.filter(p => topic === 'All' || p.topic === topic).length})</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Problem List */}
                        <div className="flex flex-col gap-4 mb-20">
                            <div className="flex items-center justify-between bg-[#0A0A0A] border border-[#222] p-4 rounded-sm">
                                <div className="relative flex-1 max-w-sm">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
                                    <input 
                                        type="text" 
                                        placeholder="Search problems..." 
                                        className="w-full bg-[#111] border border-[#333] pl-9 pr-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-accent-500 rounded-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="bg-[#111] border border-[#333] text-[#888] hover:text-white p-2 rounded-sm transition-colors">
                                        <Filter size={14} />
                                    </button>
                                    <select className="bg-[#111] border border-[#333] text-xs font-mono text-[#aaa] py-2 px-3 focus:outline-none focus:border-accent-500 rounded-sm appearance-none cursor-pointer">
                                        <option>Difficulty</option>
                                        <option>Easy</option>
                                        <option>Medium</option>
                                        <option>Hard</option>
                                    </select>
                                    <select className="bg-[#111] border border-[#333] text-xs font-mono text-[#aaa] py-2 px-3 focus:outline-none focus:border-accent-500 rounded-sm appearance-none cursor-pointer">
                                        <option>Status</option>
                                        <option>Todo</option>
                                        <option>Solved</option>
                                        <option>Attempted</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-[#0A0A0A] border border-[#222] rounded-sm overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#222] bg-[#111]">
                                            <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-[#666] font-normal w-12 text-center">Status</th>
                                            <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-[#666] font-normal">Title</th>
                                            <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-[#666] font-normal w-32">Topic</th>
                                            <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-[#666] font-normal w-24">Points</th>
                                            <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-widest text-[#666] font-normal w-28">Difficulty</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProblems.map((problem) => (
                                            <tr key={problem.id} className="border-b border-[#222] hover:bg-[#111] group transition-colors cursor-pointer">
                                                <td className="py-4 px-4 text-center">
                                                    <div className="flex justify-center">
                                                        {getStatusIcon(problem.status)}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Link to={`/student/codearena/${problem.id}`} className="font-sans font-bold text-sm text-white group-hover:text-accent-400 transition-colors flex items-center gap-2">
                                                        {problem.title}
                                                    </Link>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="text-[9px] font-mono uppercase tracking-widest text-[#888]">
                                                        {problem.topic}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 font-mono text-xs text-[#aaa]">
                                                    {problem.points} pts
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 border rounded-sm ${getDifficultyColor(problem.difficulty)}`}>
                                                        {problem.difficulty}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <AskAI />

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
};

export default CodeArena;
