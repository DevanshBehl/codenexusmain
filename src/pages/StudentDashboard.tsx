import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Code2,
    History,
    FileText,
    Palette,
    BarChart2,
    ChevronLeft,
    ChevronRight,
    Trophy,
    Calendar,
    Clock,
    Terminal,
    MapPin,
    ArrowRight
} from 'lucide-react';

const StudentDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const sidebarItems = [
        { icon: LayoutDashboard, label: 'Dashboard', active: true },
        { icon: Code2, label: 'Code Arena' },
        { icon: History, label: 'Interview History' },
        { icon: FileText, label: 'My Applications' },
        { icon: Palette, label: 'Design Arena' },
        { icon: BarChart2, label: 'Analytics' },
    ];

    const upcomingContests = [
        { title: 'Weekly Coder Challenge #42', date: 'Tomorrow, 10:00 AM', participants: '1.2k' },
        { title: 'Amazon Hiring Hackathon', date: 'Oct 15, 2:00 PM', participants: '5.5k' }
    ];

    const problemOfTheDay = {
        title: 'Merge K Sorted Lists',
        difficulty: 'Hard',
        topics: ['Linked List', 'Divide and Conquer', 'Heap'],
        successRate: '45.2%'
    };

    const upcomingEvents = [
        { title: 'Interview with Amazon', type: 'Interview', time: 'Today, 2:00 PM', color: 'bg-orange-500/10 text-orange-500' },
        { title: 'Apple Application Opens', type: 'Application', time: 'Tomorrow, 9:00 AM', color: 'bg-blue-500/10 text-blue-500' },
        { title: 'System Design Session', type: 'Workshop', time: 'Oct 12, 5:00 PM', color: 'bg-purple-500/10 text-purple-500' }
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans flex overflow-hidden">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 80 }}
                className="h-screen bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col relative flex-shrink-0 z-20"
            >
                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 border-b border-[#1a1a1a]">
                    <div className="h-8 w-8 rounded bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                        C
                    </div>
                    <AnimatePresence>
                        {isSidebarOpen && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="ml-3 font-semibold text-lg tracking-wide whitespace-nowrap"
                            >
                                CodeNexus
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar Toggle */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute -right-4 top-24 h-8 w-8 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#222] transition-colors z-30"
                >
                    {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>

                {/* Navigation Items */}
                <div className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto custom-scrollbar">
                    {sidebarItems.map((item, index) => (
                        <button
                            key={index}
                            className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 group relative
                                ${item.active
                                    ? 'bg-gradient-to-r from-cyan-500/10 to-transparent text-cyan-400'
                                    : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
                                }`}
                        >
                            {item.active && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                            )}
                            <item.icon size={22} className={`min-w-[22px] ${item.active ? 'text-cyan-400' : 'group-hover:text-cyan-300 transition-colors'}`} />
                            <AnimatePresence>
                                {isSidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="ml-4 font-medium whitespace-nowrap"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    ))}
                </div>

                {/* User Profile Mini */}
                <div className="p-4 border-t border-[#1a1a1a]">
                    <div className={`flex items-center ${isSidebarOpen ? 'justify-start' : 'justify-center'} p-2 rounded-lg bg-[#111] border border-[#222]`}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold shrink-0">
                            DB
                        </div>
                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="ml-3 overflow-hidden"
                                >
                                    <p className="text-sm font-medium text-white whitespace-nowrap">Devansh Behl</p>
                                    <p className="text-xs text-cyan-400 whitespace-nowrap">Student</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
                {/* Background Glows */}
                <div className="absolute top-0 left-[20%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-[10%] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-6xl mx-auto relative z-10 space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <p className="text-cyan-400 font-medium mb-1 tracking-wider text-sm flex items-center gap-2">
                                <Terminal size={14} /> DASHBOARD
                            </p>
                            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                                Hi <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Devansh</span> 👋
                            </h1>
                            <p className="text-gray-400 mt-2 text-lg">Ready to conquer your next challenge?</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button className="px-5 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#333] hover:border-cyan-500/50 hover:bg-[#222] transition-all text-sm font-medium flex items-center gap-2">
                                <Calendar size={16} className="text-gray-400" />
                                My Schedule
                            </button>
                            <button className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] flex items-center gap-2">
                                <Terminal size={16} />
                                Start Coding
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 hover:border-cyan-500/30 transition-colors group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-gray-400 text-sm">Global Rank</p>
                                    <h3 className="text-2xl font-bold text-white mt-1">#4,289</h3>
                                </div>
                                <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                                    <Trophy size={20} />
                                </div>
                            </div>
                            <div className="text-sm text-green-400 flex items-center gap-1">
                                <span>↑ 124 places</span> <span className="text-gray-500 ml-1">this week</span>
                            </div>
                        </div>
                        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 hover:border-cyan-500/30 transition-colors group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-gray-400 text-sm">Problems Solved</p>
                                    <h3 className="text-2xl font-bold text-white mt-1">342</h3>
                                </div>
                                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                                    <Code2 size={20} />
                                </div>
                            </div>
                            <div className="w-full bg-[#1a1a1a] rounded-full h-1.5 mt-2 overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5 rounded-full" style={{ width: '68%' }} />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">68% to Master tier</p>
                        </div>
                        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 hover:border-cyan-500/30 transition-colors group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-gray-400 text-sm">Current Streak</p>
                                    <h3 className="text-2xl font-bold text-white mt-1">14 Days</h3>
                                </div>
                                <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                                    <Calendar size={20} />
                                </div>
                            </div>
                            <div className="flex gap-1 mt-4">
                                {[...Array(7)].map((_, i) => (
                                    <div key={i} className={`h-6 w-full rounded-sm ${i < 5 ? 'bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-[#1a1a1a]'}`} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Middle Column (Main content) */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Problem of the Day */}
                            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-1 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 opacity-30 group-hover:opacity-50 transition-opacity blur-xl z-0" />
                                <div className="relative z-10 bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl p-6 h-full flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold tracking-wider flex items-center gap-1.5 cursor-default border border-cyan-500/20">
                                                <Trophy size={12} /> PROBLEM OF THE DAY
                                            </span>
                                            <span className="text-sm font-medium px-2.5 py-1 rounded bg-[#2a1111] text-red-400 border border-red-500/20 cursor-default">
                                                {problemOfTheDay.difficulty}
                                            </span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                                            {problemOfTheDay.title}
                                        </h2>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {problemOfTheDay.topics.map((topic, i) => (
                                                <span key={i} className="text-xs text-gray-400 bg-[#1a1a1a] px-2 py-1 rounded-md border border-[#222]">
                                                    {topic}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1a] mt-4">
                                        <p className="text-sm text-gray-500">
                                            Success Rate: <span className="text-gray-300 font-medium">{problemOfTheDay.successRate}</span>
                                        </p>
                                        <button className="flex items-center gap-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors group-hover:underline decoration-cyan-400/30 underline-offset-4">
                                            Solve Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Upcoming Contests */}
                            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Code2 size={20} className="text-blue-400" />
                                        Coding Arena
                                    </h3>
                                    <button className="text-sm text-gray-400 hover:text-white transition-colors">View All</button>
                                </div>
                                <div className="space-y-4">
                                    {upcomingContests.map((contest, i) => (
                                        <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-[#1a1a1a] bg-[#0c0c0c] hover:border-blue-500/30 hover:bg-[#111] transition-all group">
                                            <div>
                                                <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{contest.title}</h4>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {contest.date}</span>
                                                    <span className="flex items-center gap-1.5"><MapPin size={14} /> Global</span>
                                                </div>
                                            </div>
                                            <div className="mt-4 md:mt-0 flex items-center gap-4">
                                                <div className="text-right hidden md:block">
                                                    <p className="text-sm font-medium text-white">{contest.participants}</p>
                                                    <p className="text-xs text-gray-500">Registered</p>
                                                </div>
                                                <button className="w-full md:w-auto px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] hover:border-blue-500/50 text-white rounded-lg text-sm font-medium transition-all group-hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                                                    Register
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column (Sidebar equivalent within content) */}
                        <div className="space-y-6">
                            {/* Event List */}
                            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 h-full">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Clock size={20} className="text-purple-400" />
                                        Upcoming Events
                                    </h3>
                                </div>
                                
                                <div className="space-y-5">
                                    {upcomingEvents.map((event, i) => (
                                        <div key={i} className="group cursor-pointer">
                                            <div className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] relative z-10 mt-1.5" />
                                                    {i !== upcomingEvents.length - 1 && (
                                                        <div className="w-px h-full bg-gradient-to-b from-[#333] to-transparent mt-2" />
                                                    )}
                                                </div>
                                                <div className="flex-1 bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl p-4 group-hover:border-[#333] transition-colors">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${event.color}`}>
                                                            {event.type}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-semibold text-white mt-2 group-hover:text-cyan-400 transition-colors">{event.title}</h4>
                                                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                                                        <Clock size={12} /> {event.time}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <button className="w-full mt-6 py-3 border border-[#1a1a1a] rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-[#111] transition-all flex items-center justify-center gap-2">
                                    View Full Calendar <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* Global Custom Scrollbar Styles specific to this page container */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #222;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
      `}} />
        </div>
    );
};

export default StudentDashboard;
