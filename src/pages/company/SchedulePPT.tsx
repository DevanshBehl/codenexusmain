import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Terminal,
    Building2,
    Users,
    FileText,
    ExternalLink,
    Swords,
    Eye,
    Mail,
    Presentation,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Plus,
    Calendar,
    Clock,
    Link as LinkIcon,
    Video,
    AlignLeft,
    Building
} from 'lucide-react';

/* ────────── Types & Mock Data ────────── */
interface PPT {
    id: string;
    title: string;
    targetUniversities: string[];
    date: string;
    time: string;
    duration: string;
    meetingLink: string;
    agenda: string;
    status: 'UPCOMING' | 'COMPLETED';
}

const mockPPTs: PPT[] = [
    {
        id: '1',
        title: 'Google Cloud Platform Info Session',
        targetUniversities: ['IIT Bombay', 'BITS Pilani'],
        date: '2026-04-10',
        time: '14:00',
        duration: '60 mins',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        agenda: 'Introduction to GCP infrastructure and hiring process for the Site Reliability Engineering roles.',
        status: 'UPCOMING'
    },
    {
        id: '2',
        title: 'Stripe Engineering Culture',
        targetUniversities: ['NIT Trichy', 'IIIT Hyderabad'],
        date: '2026-03-15',
        time: '16:00',
        duration: '45 mins',
        meetingLink: 'https://zoom.us/j/123456789',
        agenda: 'A deep dive into Stripe engineering culture and Q&A with our Lead Engineers.',
        status: 'COMPLETED'
    }
];

const mockUniversities = [
    'IIT Bombay', 'IIT Delhi', 'IIT Madras', 'BITS Pilani', 'NIT Trichy', 'IIIT Hyderabad', 'DTU', 'NSUT'
];

export default function SchedulePPT() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [view, setView] = useState<'LIST' | 'SCHEDULE'>('LIST');
    const [ppts, setPpts] = useState<PPT[]>(mockPPTs);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Evaluate 5 min rule
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const canJoinWebinar = (dateStr: string, timeStr: string) => {
        const scheduledTime = new Date(`${dateStr}T${timeStr}:00`);
        const timeDiffMs = scheduledTime.getTime() - currentTime.getTime();
        const diffMinutes = timeDiffMs / (1000 * 60);
        return diffMinutes <= 5;
    };

    // Form State
    const [title, setTitle] = useState('');
    const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [duration, setDuration] = useState('60 mins');
    const [meetingLink, setMeetingLink] = useState('');
    const [agenda, setAgenda] = useState('');

    const sidebarItems = [
        { icon: Terminal, label: 'CMD CENTER', onClick: () => window.location.href = '/company/dashboard' },
        { icon: Presentation, label: 'WEBINARS', active: true, onClick: () => window.location.href = '/company/ppt' },
        { icon: Building2, label: 'UNIVERSITIES', onClick: () => window.location.href = '/company/dashboard' },
        { icon: Users, label: 'CANDIDATES', onClick: () => window.location.href = '/company/dashboard' },
        { icon: FileText, label: 'EVALUATIONS', onClick: () => window.location.href = '/company/evaluation' },
        { icon: ExternalLink, label: 'JOB POSTINGS', onClick: () => window.location.href = '/company/dashboard' },
        { icon: Swords, label: 'CODE ARENA', onClick: () => window.location.href = '/company/dashboard' },
        { icon: Eye, label: 'PROCTORING', onClick: () => window.location.href = '/company/dashboard' },
        { icon: Mail, label: 'MAIL', onClick: () => window.location.href = '/company/mail' },
    ];

    const toggleUniversity = (uni: string) => {
        setSelectedUniversities(prev => 
            prev.includes(uni) ? prev.filter(u => u !== uni) : [...prev, uni]
        );
    };

    const handleSchedule = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || selectedUniversities.length === 0 || !date || !time || !meetingLink) return;

        const newPPT: PPT = {
            id: Math.random().toString(36).substr(2, 9),
            title,
            targetUniversities: selectedUniversities,
            date,
            time,
            duration,
            meetingLink,
            agenda,
            status: 'UPCOMING'
        };

        setPpts([newPPT, ...ppts]);
        setView('LIST');
        
        // Reset form
        setTitle('');
        setSelectedUniversities([]);
        setDate('');
        setTime('');
        setMeetingLink('');
        setAgenda('');
    };

    return (
        <div className="h-screen w-full bg-[#050505] font-sans text-white selection:bg-accent-500/30 selection:text-white flex overflow-hidden">
            {/* Background Details */}
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
                    <div className="text-[10px] font-mono text-[#555] uppercase tracking-widest px-3 mb-2">Company Options</div>
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
                    {/* User Profile Hook */}
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
                                        <p className="text-xs font-mono text-white whitespace-nowrap">HR Team</p>
                                        <p className="text-[10px] text-[#888] whitespace-nowrap">Google</p>
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
                <header className="h-16 border-b border-[#222] bg-[#0A0A0A]/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <Presentation size={20} className="text-accent-400" />
                        <div>
                            <h1 className="text-sm font-bold font-sans text-white uppercase tracking-widest">Pre-Placement Talks</h1>
                            <p className="text-[10px] font-mono text-[#666]">Host webinars & connect with universities</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setView('LIST')}
                            className={`px-4 py-2 font-mono text-[10px] uppercase tracking-widest border rounded-sm transition-colors ${view === 'LIST' ? 'bg-[#111] border-[#333] text-white' : 'border-transparent text-[#888] hover:text-white hover:bg-[#111]'}`}
                        >
                            Scheduled Webinars
                        </button>
                        <button 
                            onClick={() => setView('SCHEDULE')}
                            className={`px-4 py-2 font-mono text-[10px] uppercase tracking-widest border rounded-sm transition-colors flex items-center gap-2 ${view === 'SCHEDULE' ? 'bg-accent-500 text-black border-accent-500 font-bold' : 'border-accent-500/30 text-accent-400 hover:bg-accent-500 hover:text-black font-bold'}`}
                        >
                            <Plus size={12} /> Schedule New
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <AnimatePresence mode="wait">
                        {view === 'LIST' ? (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="max-w-5xl mx-auto space-y-6"
                            >
                                {ppts.map(ppt => (
                                    <div key={ppt.id} className="bg-[#0A0A0A] border border-[#222] rounded-sm p-6 flex flex-col md:flex-row gap-6 hover:border-[#333] transition-colors">
                                        <div className="md:w-1/4 shrink-0 flex flex-col justify-center items-center p-4 bg-[#111] border border-[#222] rounded-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-accent-500/5 rotate-45 translate-x-8 -translate-y-8"></div>
                                            <Calendar size={24} className={ppt.status === 'UPCOMING' ? 'text-accent-400 mb-2' : 'text-[#555] mb-2'} />
                                            <span className="text-sm font-bold text-white tracking-widest font-mono">{new Date(ppt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}</span>
                                            <span className="text-[10px] font-mono text-[#888] mt-1">{ppt.time} ({ppt.duration})</span>
                                        </div>
                                        
                                        <div className="flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className={`text-lg font-bold font-sans ${ppt.status === 'UPCOMING' ? 'text-white' : 'text-[#888]'}`}>{ppt.title}</h3>
                                                <span className={`px-2 py-0.5 text-[9px] font-mono border rounded-sm tracking-widest uppercase ${ppt.status === 'UPCOMING' ? 'text-green-400 border-green-500/20 bg-green-500/10' : 'text-[#555] border-[#333] bg-[#111]'}`}>
                                                    {ppt.status}
                                                </span>
                                            </div>
                                            
                                            <p className="text-xs text-[#888] font-sans leading-relaxed mb-4 line-clamp-2">
                                                {ppt.agenda}
                                            </p>
                                            
                                            <div className="flex flex-wrap items-center gap-4 mt-auto">
                                                <div className="flex items-center gap-2">
                                                    <Building size={14} className="text-[#555]" />
                                                    <div className="flex gap-1">
                                                        {ppt.targetUniversities.map((uni, i) => (
                                                            <span key={i} className="text-[10px] font-mono text-white bg-[#1a1a1a] px-1.5 py-0.5 rounded-sm border border-[#333]">
                                                                {uni}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                {ppt.status === 'UPCOMING' && (
                                                    <a 
                                                        href={canJoinWebinar(ppt.date, ppt.time) ? "/company/webinar" : "#"} 
                                                        onClick={(e) => {
                                                            if (!canJoinWebinar(ppt.date, ppt.time)) e.preventDefault();
                                                        }}
                                                        className={`ml-auto text-[10px] font-mono flex items-center gap-1 transition-colors px-3 py-1.5 border rounded-sm ${
                                                            canJoinWebinar(ppt.date, ppt.time)
                                                            ? 'text-accent-400 border-accent-500/30 hover:bg-accent-500/10 hover:text-white'
                                                            : 'text-[#555] border-[#333] cursor-not-allowed bg-[#111]'
                                                        }`}
                                                    >
                                                        <Video size={12} /> {canJoinWebinar(ppt.date, ppt.time) ? 'Host Webinar' : 'Opens 5 Mins Before'}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="schedule"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="max-w-3xl mx-auto"
                            >
                                <form onSubmit={handleSchedule} className="bg-[#0A0A0A] border border-[#222] rounded-sm overflow-hidden">
                                    <div className="p-6 border-b border-[#222] bg-[#111]">
                                        <h2 className="text-sm font-bold font-sans text-white uppercase tracking-widest flex items-center gap-2">
                                            <Calendar size={14} className="text-accent-500" /> Form PPT Request
                                        </h2>
                                        <p className="text-[10px] font-mono text-[#666] mt-1">Schedules are automatically sent to selected placement cells.</p>
                                    </div>
                                    
                                    <div className="p-8 space-y-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-mono text-[#888] uppercase tracking-widest">Webinar Title</label>
                                            <input 
                                                type="text" 
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="e.g. SDE 1 Roles & Technical Deep Dive"
                                                className="w-full bg-[#111] border border-[#333] outline-none p-3 text-sm font-sans text-white placeholder:text-[#444] rounded-sm focus:border-accent-500 transition-colors"
                                                required
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-mono text-[#888] uppercase tracking-widest">Select Target Universities</label>
                                            <div className="flex flex-wrap gap-2 p-4 bg-[#111] border border-[#333] rounded-sm">
                                                {mockUniversities.map(uni => (
                                                    <button
                                                        key={uni}
                                                        type="button"
                                                        onClick={() => toggleUniversity(uni)}
                                                        className={`px-3 py-1.5 text-xs font-mono rounded-sm border transition-colors ${
                                                            selectedUniversities.includes(uni)
                                                            ? 'bg-accent-500/10 border-accent-500/50 text-accent-400'
                                                            : 'bg-[#1a1a1a] border-[#333] text-[#888] hover:text-white hover:border-[#555]'
                                                        }`}
                                                    >
                                                        {uni}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-mono text-[#888] uppercase tracking-widest flex items-center gap-1"><Calendar size={10} /> Date</label>
                                                <input 
                                                    type="date" 
                                                    value={date}
                                                    onChange={(e) => setDate(e.target.value)}
                                                    className="w-full bg-[#111] border border-[#333] outline-none p-3 text-sm font-mono text-white placeholder:text-[#444] rounded-sm focus:border-accent-500 transition-colors"
                                                    required
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-mono text-[#888] uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> Time</label>
                                                <input 
                                                    type="time" 
                                                    value={time}
                                                    onChange={(e) => setTime(e.target.value)}
                                                    className="w-full bg-[#111] border border-[#333] outline-none p-3 text-sm font-mono text-white placeholder:text-[#444] rounded-sm focus:border-accent-500 transition-colors"
                                                    required
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-mono text-[#888] uppercase tracking-widest">Duration</label>
                                                <select
                                                    value={duration}
                                                    onChange={(e) => setDuration(e.target.value)}
                                                    className="w-full bg-[#111] border border-[#333] outline-none p-3 text-sm font-mono text-white focus:border-accent-500 rounded-sm cursor-pointer"
                                                >
                                                    <option>30 mins</option>
                                                    <option>45 mins</option>
                                                    <option>60 mins</option>
                                                    <option>90 mins</option>
                                                    <option>120 mins</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-mono text-[#888] uppercase tracking-widest flex items-center gap-1"><LinkIcon size={10} /> Meeting Join Link</label>
                                            <input 
                                                type="url" 
                                                value={meetingLink}
                                                onChange={(e) => setMeetingLink(e.target.value)}
                                                placeholder="https://zoom.us/j/..."
                                                className="w-full bg-[#111] border border-[#333] outline-none p-3 text-sm font-mono text-white placeholder:text-[#444] rounded-sm focus:border-accent-500 transition-colors"
                                                required
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-mono text-[#888] uppercase tracking-widest flex items-center gap-1"><AlignLeft size={10} /> Description / Agenda</label>
                                            <textarea 
                                                value={agenda}
                                                onChange={(e) => setAgenda(e.target.value)}
                                                placeholder="What will this webinar cover?"
                                                className="w-full h-[150px] bg-[#111] border border-[#333] outline-none p-4 text-sm font-sans text-[#ccc] placeholder:text-[#444] rounded-sm focus:border-accent-500 transition-colors resize-none custom-scrollbar"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="p-6 border-t border-[#222] bg-[#111] flex justify-end gap-4">
                                        <button 
                                            type="button"
                                            onClick={() => setView('LIST')}
                                            className="px-6 py-2.5 font-mono text-[10px] uppercase tracking-widest text-[#888] border border-[#333] rounded-sm hover:text-white hover:bg-[#222] transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={!title || selectedUniversities.length === 0 || !date || !time || !meetingLink || !agenda}
                                            className="px-6 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest bg-white text-black rounded-sm hover:bg-accent-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            <Presentation size={14} /> Schedule PPT
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Scrollbar overrides */}
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
