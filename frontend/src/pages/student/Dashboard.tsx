import { useState, useEffect } from 'react';
import { dashboardApi, problemApi, type StudentDashboardData } from '../../lib/api';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Terminal,
    Code2,
    Briefcase,
    Calendar,
    ChevronRight,
    ChevronLeft,
    Box,
    FileText,
    Activity,
    LogOut,
    CheckCircle2,
    Mail,
    Presentation,
    PenTool,
    Trophy,
    Play
} from 'lucide-react';

const StudentDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [data, setData] = useState<StudentDashboardData | null>(null);
    const [problemOfTheDay, setProblemOfTheDay] = useState<{
        id: string;
        title: string;
        difficulty: string;
        topic: string;
        points: number;
    } | null>(null);

    useEffect(() => {
        dashboardApi.student()
            .then(res => setData(res.data))
            .catch(() => { });

        problemApi.getAll({ limit: 20 }).then(res => {
            const r = res.data as any;
            const problems = r.problems || r || [];
            if (problems.length > 0) {
                const p = problems[Math.floor(Math.random() * problems.length)];
                setProblemOfTheDay({
                    id: p.id,
                    title: p.title,
                    difficulty: p.difficulty,
                    topic: p.topic || 'Algorithms',
                    points: p.points || 100,
                });
            }
        }).catch(() => { });
    }, []);

    const userName = data?.profile.name?.split(' ')[0] || 'Student';
    const initials = data?.profile.name
        ? data.profile.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
        : 'ST';
    const codeArenaScore = data?.stats ? data.profile.codeArenaScore : 0;
    const globalRank = data?.stats.globalRank ?? 0;
    const streak = data?.stats.streak ?? 0;

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const upcomingContests = data?.upcomingContests || [];
    const upcomingInterviews = data?.upcomingInterviews || [];
    const upcomingWebinars = data?.upcomingWebinars || [];

    const events = [
        ...upcomingInterviews.slice(0, 2).map(i => ({
            title: `${i.role} Interview`,
            type: 'INTERVIEW',
            time: `${i.company} · ${formatDate(i.scheduledAt)}`,
            color: 'text-accent-400 border-accent-500/50',
        })),
        ...upcomingWebinars.slice(0, 2).map(w => ({
            title: w.title,
            type: 'WEBINAR',
            time: `${w.company} · ${formatDate(w.scheduledAt)}`,
            color: 'text-[#888] border-[#333]',
        })),
    ];

    const sidebarItems = [
        { icon: Mail, label: 'MAIL', path: '/student/mail' },
        { icon: Presentation, label: 'WEBINARS', path: '/student/webinars' },
        { icon: Terminal, label: 'CMD CENTER', path: '/student/dashboard', active: true },
        { icon: Code2, label: 'CODE ARENA', path: '/student/codearena' },
        { icon: PenTool, label: 'DESIGN ARENA', path: '/student/designarena' },
        { icon: Briefcase, label: 'INTERVIEWS', path: '/student/interview' },
        { icon: Trophy, label: 'CONTEST', path: '/student/contest' },
        { icon: FileText, label: 'PROFILE', path: '/student/profile' },
        { icon: Box, label: 'PROJECTS', path: '/student/projects' },
        { icon: Play, label: 'RECORDING', path: '/student/recording' },
    ];

    return (
        <div className="h-screen w-full bg-[#050505] font-sans text-white selection:bg-accent-500/30 selection:text-white relative overflow-hidden flex">
            <div className="fixed inset-0 pointer-events-none z-0 dotted-bg"></div>

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
                    {sidebarItems.map((item: any, index: number) => (
                        <button
                            key={index}
                            onClick={() => { if (item.path) window.location.href = item.path; }}
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
                            {initials}
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
                                        <p className="text-xs font-mono text-white whitespace-nowrap uppercase tracking-wider">{data?.profile.name || '—'}</p>
                                        <p className="text-[10px] font-mono text-accent-500 whitespace-nowrap">STUDENT</p>
                                    </div>
                                    <LogOut size={14} className="text-[#555] group-hover:text-red-400 transition-colors" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.aside>

            <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative z-10 flex flex-col">
                <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">

                    <div className="border border-[#333] bg-[#0A0A0A] p-6 lg:p-8 shadow-2xl relative rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-[1px] bg-gradient-to-r from-transparent via-accent-500 to-transparent opacity-50"></div>

                        <div>
                            <div className="inline-flex items-center gap-2 border border-[#333] bg-[#111] px-2 py-1 text-[10px] text-[#aaa] rounded-sm mb-4 font-mono tracking-widest uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse"></span>
                                SYSTEM ONLINE
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight uppercase">
                                Welcome, <span className="text-accent-400 font-serif italic">{userName}</span>
                            </h1>
                            <p className="text-[#888] font-mono text-xs mt-2">
                                {data?.profile.branch ? `${data.profile.branch} · ${data.profile.university}` : '/home/students/dashboard'}
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button className="border border-[#555] bg-transparent text-white px-4 py-2 font-bold hover:bg-[#111] transition-colors text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={14} /> Schedule
                            </button>
                            <Link to="/student/codearena" className="bg-[#e0e0e0] text-black px-4 py-2 font-bold hover:bg-white transition-colors text-xs font-mono uppercase tracking-widest flex items-center gap-2 group">
                                <Terminal size={14} /> Play Area <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[#0A0A0A] border border-[#222] p-6 rounded-sm group hover:border-[#333] transition-colors relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#111] group-hover:bg-accent-500 transition-colors"></div>
                            <h3 className="text-[10px] uppercase font-mono tracking-widest text-[#888] mb-2 flex justify-between items-center">
                                Global Rank
                                <span className="text-accent-400 font-bold">#{globalRank}</span>
                            </h3>
                            <div className="text-2xl font-bold font-sans tracking-tight">
                                {data?.stats.problemsSolved ?? 0} Solved
                            </div>
                            <div className="text-[10px] font-mono text-green-400 mt-2 flex items-center gap-1">
                                {data?.stats.accuracy ?? 0}% ACCURACY <span className="text-[#555]">/ {data?.stats.totalSubmissions ?? 0} SUBS</span>
                            </div>
                        </div>

                        <div className="bg-[#0A0A0A] border border-[#222] p-6 rounded-sm group hover:border-[#333] transition-colors relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#111] group-hover:bg-accent-500 transition-colors"></div>
                            <h3 className="text-[10px] uppercase font-mono tracking-widest text-[#888] mb-2 flex justify-between items-center">
                                Arena Score
                                <span className="text-accent-400 font-bold">{codeArenaScore}</span>
                            </h3>
                            <div className="text-2xl font-bold font-sans tracking-tight">{codeArenaScore} pts</div>
                            <div className="w-full bg-[#111] border border-[#333] h-1.5 mt-3 rounded-sm overflow-hidden">
                                <div className="bg-accent-500 h-1.5 rounded-sm" style={{ width: `${Math.min(100, (codeArenaScore / 5000) * 100)}%` }} />
                            </div>
                        </div>

                        <div className="bg-[#0A0A0A] border border-[#222] p-6 rounded-sm group hover:border-[#333] transition-colors relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#111] group-hover:bg-accent-500 transition-colors"></div>
                            <h3 className="text-[10px] uppercase font-mono tracking-widest text-[#888] mb-2 flex justify-between items-center">
                                Current Streak
                                <span className="text-accent-400 font-bold">{streak} DAYS</span>
                            </h3>
                            <div className="text-2xl font-bold font-sans tracking-tight">{streak > 0 ? 'Active' : 'Idle'}</div>
                            <div className="flex gap-1 mt-3">
                                {[...Array(7)].map((_, i) => (
                                    <div key={i} className={`h-1.5 w-full rounded-sm ${i < Math.min(7, streak) ? 'bg-accent-500 shadow-[0_0_8px_oklch(0.777_0.152_181.912_/_0.4)]' : 'bg-[#1a1a1a] border border-[#333]'}`} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">

                            <div className="bg-[#0A0A0A] border border-[#222] p-6 rounded-sm shadow-xl relative overflow-hidden group hover:border-[#333] transition-colors">
                                <div className="absolute top-0 right-0 p-4 opacity-10 font-mono text-8xl font-black pointer-events-none select-none -mt-4 -mr-4 text-accent-500">
                                    ?
                                </div>
                                <div className="flex justify-between items-center mb-6 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-1 bg-[#111] border border-accent-500/30 text-accent-400 text-[10px] font-mono tracking-widest uppercase flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 bg-accent-500 rounded-full"></div>
                                            PROBLEM OF THE DAY
                                        </span>
                                        {problemOfTheDay && (
                                            <span className={`text-[10px] font-mono px-2 py-1 border uppercase tracking-widest ${
                                                problemOfTheDay.difficulty === 'EASY' ? 'bg-[#0e1f11] border-green-500/20 text-green-400' :
                                                problemOfTheDay.difficulty === 'MEDIUM' ? 'bg-[#1f1a0e] border-yellow-500/20 text-yellow-400' :
                                                'bg-[#2a1111] border-red-500/20 text-red-500'
                                            }`}>
                                                {problemOfTheDay.difficulty}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-[#555] font-mono">24:00:00 LIMIT</span>
                                </div>

                                <h2 className="text-2xl font-sans font-bold text-white mb-3 hover:text-accent-400 transition-colors w-fit cursor-pointer relative z-10">
                                    {problemOfTheDay?.title || 'Loading...'}
                                </h2>

                                <div className="flex flex-wrap gap-2 mb-8 relative z-10">
                                    {problemOfTheDay?.topic && (
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#888] bg-[#111] px-2 py-1 border border-[#333] rounded-sm">
                                            {problemOfTheDay.topic}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-[#222] relative z-10">
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#555]">
                                        Points <span className="text-[#aaa] ml-2">{problemOfTheDay?.points ?? 0} pts</span>
                                    </p>
                                    {problemOfTheDay && (
                                        <Link to={`/student/codearena/problem/${problemOfTheDay.id}`} className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-accent-500 hover:text-accent-400 transition-colors group">
                                            Solve Challenge <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <div className="bg-[#0A0A0A] border border-[#222] p-6 rounded-sm">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#222]">
                                    <h3 className="text-sm font-bold font-sans uppercase tracking-widest text-white flex items-center gap-2">
                                        <Code2 size={16} className="text-[#888]" />
                                        Coding Arena
                                    </h3>
                                    <Link to="/student/codearena" className="text-[10px] font-mono uppercase tracking-widest text-[#555] hover:text-accent-500 transition-colors">VIEW ALL {'>>'}</Link>
                                </div>

                                <div className="space-y-3">
                                    {upcomingContests.length === 0 && (
                                        <div className="p-4 border border-dashed border-[#222] text-[10px] font-mono uppercase tracking-widest text-[#555] text-center">
                                            No upcoming contests
                                        </div>
                                    )}
                                    {upcomingContests.map((contest, i) => (
                                        <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-[#222] bg-[#050505] hover:border-[#333] transition-colors group cursor-pointer rounded-sm">
                                            <div>
                                                <h4 className="font-sans font-bold text-sm text-white group-hover:text-accent-400 transition-colors mb-1">{contest.title}</h4>
                                                <div className="flex items-center gap-4 text-[10px] font-mono text-[#666] uppercase tracking-widest">
                                                    <span>{formatDate(contest.date)}</span>
                                                    <span>•</span>
                                                    <span>{contest.company}</span>
                                                    <span>•</span>
                                                    <span>{contest.problems} Q</span>
                                                </div>
                                            </div>
                                            <div className="mt-4 md:mt-0 flex items-center gap-4">
                                                <span className={`text-[10px] font-mono flex items-center gap-1 bg-[#111] px-2 py-1 border rounded-sm ${
                                                    contest.status === 'ACTIVE' ? 'text-green-500 border-green-500/20' : 'text-[#aaa] border-[#333]'
                                                }`}>
                                                    {contest.status === 'ACTIVE' && <CheckCircle2 size={12} />} {contest.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 flex flex-col h-full">
                            <div className="bg-[#0A0A0A] border border-[#222] p-6 rounded-sm flex-1">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#222]">
                                    <h3 className="text-sm font-bold font-sans uppercase tracking-widest text-white flex items-center gap-2">
                                        <Calendar size={16} className="text-[#888]" />
                                        Events
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    {events.length === 0 && (
                                        <div className="p-4 border border-dashed border-[#222] text-[10px] font-mono uppercase tracking-widest text-[#555] text-center">
                                            No upcoming events
                                        </div>
                                    )}
                                    {events.map((event, i) => (
                                        <div key={i} className="flex gap-4 group cursor-pointer opacity-90 hover:opacity-100 transition-opacity">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-2 h-2 rounded-full border border-current mt-1.5 ${event.color} bg-[#0A0A0A]`} />
                                                {i !== events.length - 1 && (
                                                    <div className="w-px h-full bg-[#222] mt-2 group-hover:bg-[#333] transition-colors" />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <span className={`text-[9px] font-mono uppercase tracking-widest border border-current px-1.5 py-0.5 rounded-[2px] ${event.color}`}>
                                                    {event.type}
                                                </span>
                                                <h4 className="font-sans font-bold text-white mt-2 group-hover:text-accent-400 transition-colors text-sm">{event.title}</h4>
                                                <p className="text-[10px] font-mono text-[#666] mt-1 tracking-widest">
                                                    {event.time}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button className="w-full mt-4 py-3 bg-[#111] border border-[#222] rounded-sm text-[10px] font-mono uppercase tracking-widest text-[#888] hover:text-white hover:border-[#333] transition-all flex items-center justify-center gap-2">
                                    <Activity size={12} /> View Full Calendar
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

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

export default StudentDashboard;
