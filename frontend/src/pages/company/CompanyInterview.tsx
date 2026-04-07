import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Terminal, Mail, Presentation, Calendar, Video, Briefcase, Plus, Users, Clock, Building2, X, Swords, CheckCircle2, BarChart3
} from 'lucide-react';
import { interviewApi, type InterviewItem } from '../../lib/api';

export default function CompanyInterview() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [interviews, setInterviews] = useState<InterviewItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isScheduling, setIsScheduling] = useState(false);
    
    // Arrays for scheduling
    const [students, setStudents] = useState<any[]>([]);
    const [recruiters, setRecruiters] = useState<any[]>([]);

    const [scheduleData, setScheduleData] = useState({
        studentId: '',
        recruiterId: '',
        role: 'Data Structures and Algorithms',
        scheduledDate: '',
        scheduledTime: '',
        type: 'TECHNICAL' as 'TECHNICAL' | 'HR' | 'SYSTEM_DESIGN',
    });

    useEffect(() => {
        fetchInterviews();
        fetchSchedulingData();
    }, []);

    const fetchInterviews = async () => {
        try {
            setIsLoading(true);
            const res = await interviewApi.getAll();
            setInterviews(res.data);
        } catch (err) {
            window.alert('Failed to load interviews');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSchedulingData = async () => {
        try {
            const [stdRes, recRes] = await Promise.all([
                interviewApi.getStudents(),
                interviewApi.getCompanyRecruiters()
            ]);
            setStudents(stdRes.data);
            setRecruiters(recRes.data);
        } catch (err) {
            console.error('Failed to load scheduling data', err);
        }
    };

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await interviewApi.schedule(scheduleData);
            window.alert('Interview scheduled successfully');
            setIsScheduling(false);
            fetchInterviews();
        } catch (err: any) {
            window.alert(err.response?.data?.message || err.message || 'Failed to schedule interview');
        }
    };

    const sidebarItems = [
        { icon: Mail, label: 'MAIL', onClick: () => window.location.href = '/company/mail' },
        { icon: Presentation, label: 'WEBINARS', onClick: () => window.location.href = '/company/ppt' },
        { icon: Terminal, label: 'CMD CENTER', onClick: () => window.location.href = '/company/dashboard' },
        { icon: Building2, label: 'UNIVERSITIES', onClick: () => window.location.href = '/company/dashboard' },
        { icon: Users, label: 'CANDIDATES', onClick: () => window.location.href = '/company/dashboard' },
        { icon: Swords, label: 'CODE ARENA', onClick: () => window.location.href = '/company/dashboard' },
        { icon: Video, label: 'INTERVIEWS', active: true, onClick: () => window.location.href = '/company/interview' },
        { icon: CheckCircle2, label: 'EVALUATIONS', onClick: () => window.location.href = '/company/evaluation' },
        { icon: BarChart3, label: 'ANALYTICS', onClick: () => window.location.href = '/company/dashboard' },
    ];

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            timeStr: date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
        };
    };

    return (
        <div className="h-screen w-full bg-[#050505] font-sans text-white flex overflow-hidden">
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

                <div className="flex-1 py-6 flex flex-col gap-1 px-3 overflow-y-auto custom-scrollbar">
                    <div className="text-[10px] font-mono text-[#555] uppercase tracking-widest px-3 mb-2">COMPANY PORTAL</div>
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
                <header className="h-16 border-b border-[#222] bg-[#0A0A0A]/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <Video size={20} className="text-accent-400" />
                        <div>
                            <h1 className="text-sm font-bold font-sans text-white uppercase tracking-widest">Global Interviews</h1>
                            <p className="text-[10px] font-mono text-[#666]">Overview of all scheduled company interviews</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsScheduling(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-accent-500 hover:bg-accent-400 text-black font-bold font-mono text-xs rounded-sm transition-colors shadow-[0_0_15px_rgba(var(--accent-500),0.3)]"
                    >
                        <Plus size={14} /> Schedule Interview
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <div className="max-w-5xl mx-auto space-y-6">
                        {isLoading ? (
                            <div className="flex justify-center p-8"><span className="text-[#888] font-mono text-xs animate-pulse">Loading interviews...</span></div>
                        ) : interviews.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 bg-[#0A0A0A] border border-[#222] rounded-sm text-center">
                                <Clock size={48} className="text-[#333] mb-4" />
                                <h2 className="text-lg font-bold text-white mb-2 tracking-widest uppercase font-mono">No Interviews Scheduled</h2>
                                <p className="text-[#888] text-sm font-mono">You haven't scheduled any interviews for your recruiters yet. Click the button above to get started.</p>
                            </div>
                        ) : (
                            interviews.map((interview) => {
                                const { dateStr, timeStr } = formatDateTime(interview.scheduledAt);
                                const isUpcoming = interview.status === 'SCHEDULED';

                                return (
                                    <div key={interview.id} className="bg-[#0A0A0A] border border-[#222] rounded-sm p-6 flex flex-col md:flex-row gap-6 hover:border-[#333] transition-colors shadow-lg">
                                        <div className="md:w-1/4 shrink-0 flex flex-col justify-center items-center p-4 bg-[#111] border border-[#222] rounded-sm relative overflow-hidden">
                                            <div className={`absolute top-0 right-0 w-16 h-16 rotate-45 translate-x-8 -translate-y-8 ${isUpcoming ? 'bg-accent-500/5' : 'bg-[#222]/20'}`}></div>
                                            <Calendar size={24} className={isUpcoming ? 'text-accent-400 mb-2' : 'text-[#555] mb-2'} />
                                            <span className="text-sm font-bold text-white tracking-widest font-mono">{dateStr}</span>
                                            <span className="text-[10px] font-mono text-[#888] mt-1">{timeStr} (60 mins)</span>
                                        </div>

                                        <div className="flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className={`text-lg font-bold font-sans ${isUpcoming ? 'text-white' : 'text-[#888]'}`}>{interview.role} - {interview.type}</h3>
                                                    <p className="text-[10px] font-mono text-accent-500 uppercase tracking-widest flex items-center gap-1 mt-1">
                                                        <Users size={12} /> Candidate: {interview.student.name} ({interview.student.branch}, CGPA: {interview.student.cgpa})
                                                    </p>
                                                    <p className="text-[10px] font-mono text-blue-400 uppercase tracking-widest flex items-center gap-1 mt-1">
                                                        <Briefcase size={12} /> Assigned Recruiter: {interview.recruiter.name}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-0.5 text-[9px] font-mono border rounded-sm tracking-widest uppercase ${isUpcoming ? 'text-green-400 border-green-500/20 bg-green-500/10' : 'text-[#555] border-[#333] bg-[#111]'}`}>
                                                    {interview.status}
                                                </span>
                                            </div>

                                            <div className="flex items-center mt-auto">
                                                <span className="text-[10px] font-mono text-[#555] italic">
                                                    Note: Only the assigned recruiter can join the live room.
                                                </span>
                                                {interview.status === 'COMPLETED' && (
                                                    <button
                                                        className="ml-auto text-[10px] font-mono font-bold flex items-center gap-2 px-4 py-2 rounded-sm outline-none transition-all bg-[#111] text-[#888] border border-[#333] hover:text-white"
                                                    >
                                                        View Result/Feedback
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Scheduling Modal */}
                <AnimatePresence>
                    {isScheduling && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-[#0A0A0A] border border-[#333] rounded-sm w-full max-w-lg shadow-2xl overflow-hidden"
                            >
                                <div className="h-14 border-b border-[#333] flex items-center justify-between px-6 bg-[#111]">
                                    <h2 className="font-bold text-white tracking-widest font-mono text-sm">SCHEDULE INTERVIEW</h2>
                                    <button onClick={() => setIsScheduling(false)} className="text-[#666] hover:text-white transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                                <form onSubmit={handleSchedule} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-xs font-mono text-[#888] mb-1">Select Candidate</label>
                                        <select
                                            required
                                            value={scheduleData.studentId}
                                            onChange={e => setScheduleData({ ...scheduleData, studentId: e.target.value })}
                                            className="w-full bg-[#111] border border-[#333] rounded-sm px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500"
                                        >
                                            <option value="">-- Choose Student --</option>
                                            {students.map(s => (
                                                <option key={s.id} value={s.id}>{s.name} ({s.branch}, CGPA: {s.cgpa})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-mono text-[#888] mb-1">Assign to Recruiter</label>
                                        <select
                                            required
                                            value={scheduleData.recruiterId}
                                            onChange={e => setScheduleData({ ...scheduleData, recruiterId: e.target.value })}
                                            className="w-full bg-[#111] border border-[#333] rounded-sm px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500"
                                        >
                                            <option value="">-- Choose Recruiter --</option>
                                            {recruiters.map(r => (
                                                <option key={r.id} value={r.id}>{r.name} ({r.user?.email})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-mono text-[#888] mb-1">Role / Topic</label>
                                        <input
                                            required
                                            type="text"
                                            value={scheduleData.role}
                                            onChange={e => setScheduleData({ ...scheduleData, role: e.target.value })}
                                            className="w-full bg-[#111] border border-[#333] rounded-sm px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-mono text-[#888] mb-1">Date</label>
                                            <input
                                                required
                                                type="date"
                                                value={scheduleData.scheduledDate}
                                                onChange={e => setScheduleData({ ...scheduleData, scheduledDate: e.target.value })}
                                                className="w-full bg-[#111] border border-[#333] rounded-sm px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-mono text-[#888] mb-1">Time (Local)</label>
                                            <input
                                                required
                                                type="time"
                                                value={scheduleData.scheduledTime}
                                                onChange={e => setScheduleData({ ...scheduleData, scheduledTime: e.target.value })}
                                                className="w-full bg-[#111] border border-[#333] rounded-sm px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-mono text-[#888] mb-1">Interview Type</label>
                                        <select
                                            value={scheduleData.type}
                                            onChange={e => setScheduleData({ ...scheduleData, type: e.target.value as any })}
                                            className="w-full bg-[#111] border border-[#333] rounded-sm px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500"
                                        >
                                            <option value="TECHNICAL">TECHNICAL</option>
                                            <option value="HR">HR</option>
                                            <option value="SYSTEM_DESIGN">SYSTEM_DESIGN</option>
                                        </select>
                                    </div>

                                    <div className="pt-4 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsScheduling(false)}
                                            className="px-4 py-2 text-sm font-mono text-[#888] hover:text-white transition-colors"
                                        >
                                            CANCEL
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-accent-500 hover:bg-accent-400 text-black font-bold font-mono text-sm rounded-sm transition-colors"
                                        >
                                            SCHEDULE
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
