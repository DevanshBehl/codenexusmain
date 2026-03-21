import { useState } from 'react';
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
    Calendar,
    Search,
    Filter,
    TrendingUp,
    CheckCircle2,
    Clock,
    Plus,
    Play,
    Video,
    Trophy,
    Star,
    MapPin,
    FileText,
    ExternalLink,
    Swords,
    Eye
} from 'lucide-react';

type StudentFilter = 'ALL' | 'SHORTLISTED' | 'INTERVIEWED' | 'SELECTED' | 'REJECTED';
type TabType = 'UNIVERSITIES' | 'STUDENTS' | 'CONTESTS' | 'INTERVIEWS' | 'RECORDINGS';

const CompanyDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('UNIVERSITIES');
    const [studentFilter, setStudentFilter] = useState<StudentFilter>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showContestModal, setShowContestModal] = useState(false);

    const sidebarItems = [
        { icon: Terminal, label: 'CMD CENTER', active: true },
        { icon: Building2, label: 'UNIVERSITIES' },
        { icon: Users, label: 'CANDIDATES' },
        { icon: Swords, label: 'CODE ARENA' },
        { icon: Video, label: 'INTERVIEWS' },
        { icon: BarChart3, label: 'ANALYTICS' },
    ];

    const partnerUniversities = [
        { name: 'IIT Delhi', location: 'New Delhi', students: 120, hires: 8, status: 'ACTIVE', tier: 1 },
        { name: 'IIT Bombay', location: 'Mumbai', students: 95, hires: 6, status: 'ACTIVE', tier: 1 },
        { name: 'NIT Trichy', location: 'Tiruchirappalli', students: 80, hires: 4, status: 'ACTIVE', tier: 1 },
        { name: 'BITS Pilani', location: 'Pilani', students: 65, hires: 3, status: 'ACTIVE', tier: 2 },
        { name: 'DTU', location: 'New Delhi', students: 55, hires: 2, status: 'UPCOMING', tier: 2 },
        { name: 'VIT Vellore', location: 'Vellore', students: 70, hires: 0, status: 'UPCOMING', tier: 2 },
    ];

    const students = [
        { name: 'Aarav Sharma', university: 'IIT Delhi', branch: 'CSE', cgpa: 9.2, skills: ['React', 'Node.js', 'Python'], status: 'SHORTLISTED', score: 92 },
        { name: 'Priya Patel', university: 'IIT Bombay', branch: 'ECE', cgpa: 8.8, skills: ['Java', 'Spring', 'AWS'], status: 'SELECTED', score: 88 },
        { name: 'Rohan Gupta', university: 'NIT Trichy', branch: 'CSE', cgpa: 8.5, skills: ['Python', 'ML', 'TensorFlow'], status: 'INTERVIEWED', score: 85 },
        { name: 'Sneha Reddy', university: 'IIT Delhi', branch: 'IT', cgpa: 9.0, skills: ['Go', 'Kubernetes', 'Docker'], status: 'SHORTLISTED', score: 90 },
        { name: 'Arjun Nair', university: 'BITS Pilani', branch: 'CSE', cgpa: 7.9, skills: ['C++', 'DSA', 'Linux'], status: 'REJECTED', score: 62 },
        { name: 'Kavya Iyer', university: 'IIT Bombay', branch: 'ME', cgpa: 8.1, skills: ['Python', 'Django', 'PostgreSQL'], status: 'INTERVIEWED', score: 78 },
        { name: 'Vikram Singh', university: 'NIT Trichy', branch: 'CSE', cgpa: 9.4, skills: ['Rust', 'Systems', 'WebAssembly'], status: 'SELECTED', score: 95 },
        { name: 'Ananya Das', university: 'DTU', branch: 'ECE', cgpa: 7.6, skills: ['JavaScript', 'React', 'Firebase'], status: 'SHORTLISTED', score: 71 },
        { name: 'Rahul Verma', university: 'IIT Delhi', branch: 'IT', cgpa: 8.3, skills: ['TypeScript', 'Next.js', 'GraphQL'], status: 'INTERVIEWED', score: 82 },
        { name: 'Meera Joshi', university: 'BITS Pilani', branch: 'CSE', cgpa: 8.7, skills: ['Swift', 'iOS', 'SwiftUI'], status: 'SHORTLISTED', score: 86 },
    ];

    const contests = [
        { title: 'SDE I Hiring Challenge', date: 'Mar 25, 2026', duration: '2h', problems: 4, registered: 342, status: 'UPCOMING' },
        { title: 'Backend Engineering Test', date: 'Mar 18, 2026', duration: '1.5h', problems: 3, registered: 189, status: 'COMPLETED' },
        { title: 'Full Stack Assessment', date: 'Mar 10, 2026', duration: '3h', problems: 5, registered: 256, status: 'COMPLETED' },
    ];

    const scheduledInterviews = [
        { student: 'Aarav Sharma', university: 'IIT Delhi', role: 'SDE I', date: 'Mar 22, 2:00 PM', type: 'TECHNICAL', status: 'SCHEDULED' },
        { student: 'Sneha Reddy', university: 'IIT Delhi', role: 'SDE I', date: 'Mar 22, 3:30 PM', type: 'TECHNICAL', status: 'SCHEDULED' },
        { student: 'Rohan Gupta', university: 'NIT Trichy', role: 'ML Engineer', date: 'Mar 23, 10:00 AM', type: 'SYSTEM DESIGN', status: 'SCHEDULED' },
        { student: 'Rahul Verma', university: 'IIT Delhi', role: 'SDE II', date: 'Mar 23, 2:00 PM', type: 'HR', status: 'SCHEDULED' },
    ];

    const recordings = [
        { student: 'Priya Patel', university: 'IIT Bombay', role: 'SWE', date: 'Mar 15, 2026', duration: '45 min', rating: 4.5, type: 'TECHNICAL', verdict: 'SELECTED' },
        { student: 'Vikram Singh', university: 'NIT Trichy', role: 'Systems Eng.', date: 'Mar 14, 2026', duration: '52 min', rating: 4.8, type: 'TECHNICAL', verdict: 'SELECTED' },
        { student: 'Kavya Iyer', university: 'IIT Bombay', role: 'Backend Eng.', date: 'Mar 13, 2026', duration: '38 min', rating: 3.5, type: 'TECHNICAL', verdict: 'PENDING' },
        { student: 'Arjun Nair', university: 'BITS Pilani', role: 'SDE I', date: 'Mar 12, 2026', duration: '40 min', rating: 2.8, type: 'TECHNICAL', verdict: 'REJECTED' },
    ];

    const filteredStudents = students.filter(s => {
        const matchesFilter = studentFilter === 'ALL' || s.status === studentFilter;
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.skills.some(sk => sk.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    const getStudentStatusStyle = (status: string) => {
        switch (status) {
            case 'SHORTLISTED': return 'text-accent-400 bg-accent-500/10 border-accent-500/20';
            case 'INTERVIEWED': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            case 'SELECTED': return 'text-green-400 bg-green-500/10 border-green-500/20';
            case 'REJECTED': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-[#888] bg-[#111] border-[#333]';
        }
    };

    const getVerdictStyle = (verdict: string) => {
        switch (verdict) {
            case 'SELECTED': return 'text-green-400 border-green-500/20';
            case 'REJECTED': return 'text-red-400 border-red-500/20';
            case 'PENDING': return 'text-yellow-400 border-yellow-500/20';
            default: return 'text-[#888] border-[#333]';
        }
    };

    const tabs: { key: TabType; label: string; icon: typeof Terminal }[] = [
        { key: 'UNIVERSITIES', label: 'Universities', icon: Building2 },
        { key: 'STUDENTS', label: 'Candidates', icon: Users },
        { key: 'CONTESTS', label: 'Code Arena', icon: Swords },
        { key: 'INTERVIEWS', label: 'Interviews', icon: Calendar },
        { key: 'RECORDINGS', label: 'Recordings', icon: Video },
    ];

    return (
        <div className="min-h-screen bg-[#050505] font-sans text-white selection:bg-accent-500/30 selection:text-white relative overflow-hidden flex">

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
                                <span className="text-accent-400 font-serif italic">TechCorp</span> Dashboard
                            </h1>
                            <p className="text-[#888] font-mono text-xs mt-2">
                                /home/company/techcorp/recruitment/dashboard
                            </p>
                        </div>

                        <div className="flex gap-3 flex-wrap">
                            <button
                                onClick={() => setShowContestModal(!showContestModal)}
                                className="border border-[#555] bg-transparent text-white px-4 py-2 font-bold hover:bg-[#111] transition-colors text-xs font-mono uppercase tracking-widest flex items-center gap-2"
                            >
                                <Trophy size={14} /> Create Contest
                            </button>
                            <button
                                onClick={() => setShowScheduleModal(!showScheduleModal)}
                                className="bg-[#e0e0e0] text-black px-4 py-2 font-bold hover:bg-white transition-colors text-xs font-mono uppercase tracking-widest flex items-center gap-2 group"
                            >
                                <Calendar size={14} /> Schedule Interview <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-[#0A0A0A] border border-[#222] p-5 rounded-sm group hover:border-[#333] transition-colors relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#111] group-hover:bg-accent-500 transition-colors"></div>
                            <h3 className="text-[10px] uppercase font-mono tracking-widest text-[#888] mb-1">Partner Universities</h3>
                            <div className="text-3xl font-bold font-sans tracking-tight">{partnerUniversities.length}</div>
                            <div className="text-[10px] font-mono text-green-400 mt-2 flex items-center gap-1">
                                <TrendingUp size={10} /> 2 new <span className="text-[#555]">this season</span>
                            </div>
                        </div>
                        <div className="bg-[#0A0A0A] border border-[#222] p-5 rounded-sm group hover:border-[#333] transition-colors relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#111] group-hover:bg-accent-500 transition-colors"></div>
                            <h3 className="text-[10px] uppercase font-mono tracking-widest text-[#888] mb-1">Shortlisted</h3>
                            <div className="text-3xl font-bold font-sans tracking-tight">{students.filter(s => s.status === 'SHORTLISTED').length}</div>
                            <div className="text-[10px] font-mono text-accent-400 mt-2">of {students.length} candidates</div>
                        </div>
                        <div className="bg-[#0A0A0A] border border-[#222] p-5 rounded-sm group hover:border-[#333] transition-colors relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#111] group-hover:bg-accent-500 transition-colors"></div>
                            <h3 className="text-[10px] uppercase font-mono tracking-widest text-[#888] mb-1">Interviews</h3>
                            <div className="text-3xl font-bold font-sans tracking-tight">{scheduledInterviews.length}</div>
                            <div className="text-[10px] font-mono text-yellow-400 mt-2 flex items-center gap-1">
                                <Clock size={10} /> upcoming this week
                            </div>
                        </div>
                        <div className="bg-[#0A0A0A] border border-[#222] p-5 rounded-sm group hover:border-[#333] transition-colors relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#111] group-hover:bg-accent-500 transition-colors"></div>
                            <h3 className="text-[10px] uppercase font-mono tracking-widest text-[#888] mb-1">Selected</h3>
                            <div className="text-3xl font-bold font-sans tracking-tight text-green-400">{students.filter(s => s.status === 'SELECTED').length}</div>
                            <div className="text-[10px] font-mono text-[#555] mt-2">offers extended</div>
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
                            {/* ───── UNIVERSITIES TAB ───── */}
                            {activeTab === 'UNIVERSITIES' && (
                                <div className="bg-[#0A0A0A] border border-[#222] rounded-sm">
                                    <div className="flex justify-between items-center p-6 pb-4 border-b border-[#222]">
                                        <h3 className="text-sm font-bold font-sans uppercase tracking-widest text-white flex items-center gap-2">
                                            <Building2 size={16} className="text-[#888]" />
                                            Partner Universities
                                        </h3>
                                        <button className="px-3 py-1.5 bg-[#111] border border-[#333] text-[10px] font-mono uppercase tracking-widest text-[#aaa] hover:text-white hover:border-accent-500 transition-colors rounded-sm flex items-center gap-2">
                                            <Plus size={12} /> Add University
                                        </button>
                                    </div>

                                    <div className="divide-y divide-[#1a1a1a]">
                                        {partnerUniversities.map((uni, i) => (
                                            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-5 hover:bg-[#050505] transition-colors group cursor-pointer">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-sm bg-[#111] border border-[#333] flex items-center justify-center text-accent-400 font-mono text-xs font-bold shrink-0">
                                                        {uni.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-sans font-bold text-sm text-white group-hover:text-accent-400 transition-colors">{uni.name}</h4>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="text-[10px] font-mono text-[#666] flex items-center gap-1"><MapPin size={10} />{uni.location}</span>
                                                            <span className="text-[9px] font-mono px-1.5 py-0.5 border border-[#333] text-[#888] rounded-sm uppercase">TIER {uni.tier}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6 mt-3 md:mt-0">
                                                    <div className="text-center">
                                                        <div className="text-sm font-bold font-sans text-white">{uni.students}</div>
                                                        <div className="text-[9px] font-mono text-[#555] uppercase tracking-widest">Students</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-sm font-bold font-sans text-green-400">{uni.hires}</div>
                                                        <div className="text-[9px] font-mono text-[#555] uppercase tracking-widest">Hires</div>
                                                    </div>
                                                    <span className={`text-[9px] font-mono px-2 py-1 border rounded-sm uppercase tracking-widest ${
                                                        uni.status === 'ACTIVE' ? 'text-green-400 border-green-500/20 bg-green-500/10' : 'text-accent-400 border-accent-500/20 bg-accent-500/10'
                                                    }`}>
                                                        {uni.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ───── STUDENTS TAB ───── */}
                            {activeTab === 'STUDENTS' && (
                                <div className="bg-[#0A0A0A] border border-[#222] rounded-sm">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 pb-4 border-b border-[#222] gap-4">
                                        <h3 className="text-sm font-bold font-sans uppercase tracking-widest text-white flex items-center gap-2">
                                            <Users size={16} className="text-[#888]" />
                                            Candidates ({filteredStudents.length})
                                        </h3>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <div className="relative">
                                                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#555]" />
                                                <input
                                                    type="text"
                                                    placeholder="Name, university, skill..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="bg-[#050505] border border-[#333] rounded-sm pl-7 pr-3 py-1.5 text-[10px] font-mono text-white placeholder:text-[#555] outline-none focus:border-accent-500 transition-colors w-48"
                                                />
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Filter size={10} className="text-[#555]" />
                                                {(['ALL', 'SHORTLISTED', 'INTERVIEWED', 'SELECTED', 'REJECTED'] as const).map((f) => (
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
                                        {filteredStudents.map((student, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.03 }}
                                                className="flex flex-col md:flex-row md:items-center justify-between p-5 hover:bg-[#050505] transition-colors group cursor-pointer"
                                            >
                                                <div className="flex items-start gap-4 flex-1">
                                                    <div className="w-9 h-9 rounded-sm bg-[#111] border border-[#333] flex items-center justify-center text-[10px] font-mono font-bold text-[#aaa] shrink-0">
                                                        {student.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h4 className="font-sans font-bold text-sm text-white group-hover:text-accent-400 transition-colors">{student.name}</h4>
                                                            <span className={`text-[9px] font-mono px-2 py-0.5 border rounded-sm uppercase tracking-widest ${getStudentStatusStyle(student.status)}`}>
                                                                {student.status}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-[10px] font-mono text-[#666] uppercase tracking-widest mb-2">
                                                            <span>{student.university}</span>
                                                            <span>•</span>
                                                            <span>{student.branch}</span>
                                                            <span>•</span>
                                                            <span>CGPA {student.cgpa}</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {student.skills.map((skill, si) => (
                                                                <span key={si} className="text-[9px] font-mono text-[#888] bg-[#111] px-2 py-0.5 border border-[#333] rounded-sm">{skill}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 mt-3 md:mt-0 md:ml-4">
                                                    <div className="text-center">
                                                        <div className="text-lg font-bold font-sans text-white">{student.score}</div>
                                                        <div className="text-[9px] font-mono text-[#555] uppercase tracking-widest">Score</div>
                                                    </div>
                                                    <button className="p-2 bg-[#111] border border-[#333] rounded-sm hover:border-accent-500 transition-colors">
                                                        <FileText size={14} className="text-[#888] hover:text-accent-400" />
                                                    </button>
                                                    <button className="p-2 bg-[#111] border border-[#333] rounded-sm hover:border-accent-500 transition-colors">
                                                        <Calendar size={14} className="text-[#888] hover:text-accent-400" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {filteredStudents.length === 0 && (
                                        <div className="text-center py-16 text-[#555] font-mono text-xs uppercase tracking-widest">
                                            No candidates match the current filter
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ───── CONTESTS TAB ───── */}
                            {activeTab === 'CONTESTS' && (
                                <div className="space-y-6">
                                    {/* Create Contest Panel */}
                                    <div className="bg-[#0A0A0A] border border-accent-500/20 rounded-sm p-6 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 font-mono text-8xl font-black pointer-events-none select-none -mt-4 -mr-4 text-accent-500">
                                            ⚔
                                        </div>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                                            <div>
                                                <h3 className="text-sm font-bold font-sans uppercase tracking-widest text-white flex items-center gap-2">
                                                    <Trophy size={16} className="text-accent-400" />
                                                    Create Code Arena Contest
                                                </h3>
                                                <p className="text-[10px] font-mono text-[#888] mt-1">Design custom coding challenges to evaluate candidates at scale</p>
                                            </div>
                                            <button
                                                onClick={() => setShowContestModal(!showContestModal)}
                                                className="bg-[#e0e0e0] text-black px-4 py-2 font-bold hover:bg-white transition-colors text-xs font-mono uppercase tracking-widest flex items-center gap-2 group shrink-0"
                                            >
                                                <Plus size={14} /> New Contest <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Contest Modal */}
                                    <AnimatePresence>
                                        {showContestModal && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="bg-[#0A0A0A] border border-[#333] rounded-sm overflow-hidden"
                                            >
                                                <div className="p-6 space-y-4">
                                                    <h4 className="text-xs font-mono uppercase tracking-widest text-accent-400 mb-4">New Contest Configuration</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-[10px] font-mono uppercase tracking-widest text-[#888] block mb-2">Contest Title</label>
                                                            <input className="w-full bg-[#050505] border border-[#333] rounded-sm px-3 py-2 text-xs font-mono text-white placeholder:text-[#555] outline-none focus:border-accent-500 transition-colors" placeholder="e.g., SDE Hiring Challenge" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-mono uppercase tracking-widest text-[#888] block mb-2">Date & Time</label>
                                                            <input type="datetime-local" className="w-full bg-[#050505] border border-[#333] rounded-sm px-3 py-2 text-xs font-mono text-white outline-none focus:border-accent-500 transition-colors [color-scheme:dark]" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-mono uppercase tracking-widest text-[#888] block mb-2">Duration</label>
                                                            <select className="w-full bg-[#050505] border border-[#333] rounded-sm px-3 py-2 text-xs font-mono text-white outline-none focus:border-accent-500 transition-colors">
                                                                <option>1 hour</option>
                                                                <option>1.5 hours</option>
                                                                <option>2 hours</option>
                                                                <option>3 hours</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-mono uppercase tracking-widest text-[#888] block mb-2">No. of Problems</label>
                                                            <select className="w-full bg-[#050505] border border-[#333] rounded-sm px-3 py-2 text-xs font-mono text-white outline-none focus:border-accent-500 transition-colors">
                                                                <option>3 Problems</option>
                                                                <option>4 Problems</option>
                                                                <option>5 Problems</option>
                                                                <option>6 Problems</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 pt-2">
                                                        <button className="bg-[#e0e0e0] text-black px-4 py-2 font-bold hover:bg-white transition-colors text-xs font-mono uppercase tracking-widest">
                                                            Create Contest
                                                        </button>
                                                        <button
                                                            onClick={() => setShowContestModal(false)}
                                                            className="border border-[#333] text-[#888] px-4 py-2 font-bold hover:text-white hover:border-[#555] transition-colors text-xs font-mono uppercase tracking-widest"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Existing Contests */}
                                    <div className="bg-[#0A0A0A] border border-[#222] rounded-sm">
                                        <div className="p-6 pb-4 border-b border-[#222]">
                                            <h3 className="text-sm font-bold font-sans uppercase tracking-widest text-white flex items-center gap-2">
                                                <Swords size={16} className="text-[#888]" />
                                                Your Contests
                                            </h3>
                                        </div>
                                        <div className="divide-y divide-[#1a1a1a]">
                                            {contests.map((contest, i) => (
                                                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-5 hover:bg-[#050505] transition-colors group cursor-pointer">
                                                    <div>
                                                        <h4 className="font-sans font-bold text-sm text-white group-hover:text-accent-400 transition-colors">{contest.title}</h4>
                                                        <div className="flex items-center gap-4 text-[10px] font-mono text-[#666] uppercase tracking-widest mt-1">
                                                            <span>{contest.date}</span>
                                                            <span>•</span>
                                                            <span>{contest.duration}</span>
                                                            <span>•</span>
                                                            <span>{contest.problems} problems</span>
                                                            <span>•</span>
                                                            <span>{contest.registered} registered</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-3 md:mt-0">
                                                        <span className={`text-[9px] font-mono px-2 py-1 border rounded-sm uppercase tracking-widest ${
                                                            contest.status === 'UPCOMING' ? 'text-accent-400 border-accent-500/20 bg-accent-500/10' : 'text-green-400 border-green-500/20 bg-green-500/10'
                                                        }`}>
                                                            {contest.status === 'UPCOMING' && <Clock size={10} className="inline mr-1 -mt-px" />}
                                                            {contest.status === 'COMPLETED' && <CheckCircle2 size={10} className="inline mr-1 -mt-px" />}
                                                            {contest.status}
                                                        </span>
                                                        <button className="p-2 bg-[#111] border border-[#333] rounded-sm hover:border-accent-500 transition-colors">
                                                            <ExternalLink size={12} className="text-[#888]" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ───── INTERVIEWS TAB ───── */}
                            {activeTab === 'INTERVIEWS' && (
                                <div className="space-y-6">
                                    {/* Schedule Modal */}
                                    <AnimatePresence>
                                        {showScheduleModal && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="bg-[#0A0A0A] border border-accent-500/20 rounded-sm overflow-hidden"
                                            >
                                                <div className="p-6 space-y-4">
                                                    <h4 className="text-xs font-mono uppercase tracking-widest text-accent-400 mb-4 flex items-center gap-2">
                                                        <Calendar size={14} /> Schedule New Interview
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-[10px] font-mono uppercase tracking-widest text-[#888] block mb-2">Candidate</label>
                                                            <select className="w-full bg-[#050505] border border-[#333] rounded-sm px-3 py-2 text-xs font-mono text-white outline-none focus:border-accent-500 transition-colors">
                                                                <option>Select candidate...</option>
                                                                {students.filter(s => s.status === 'SHORTLISTED').map((s, i) => (
                                                                    <option key={i}>{s.name} — {s.university}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-mono uppercase tracking-widest text-[#888] block mb-2">Role</label>
                                                            <input className="w-full bg-[#050505] border border-[#333] rounded-sm px-3 py-2 text-xs font-mono text-white placeholder:text-[#555] outline-none focus:border-accent-500 transition-colors" placeholder="e.g., SDE I" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-mono uppercase tracking-widest text-[#888] block mb-2">Date & Time</label>
                                                            <input type="datetime-local" className="w-full bg-[#050505] border border-[#333] rounded-sm px-3 py-2 text-xs font-mono text-white outline-none focus:border-accent-500 transition-colors [color-scheme:dark]" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-mono uppercase tracking-widest text-[#888] block mb-2">Interview Type</label>
                                                            <select className="w-full bg-[#050505] border border-[#333] rounded-sm px-3 py-2 text-xs font-mono text-white outline-none focus:border-accent-500 transition-colors">
                                                                <option>Technical</option>
                                                                <option>System Design</option>
                                                                <option>HR</option>
                                                                <option>Managerial</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 pt-2">
                                                        <button className="bg-[#e0e0e0] text-black px-4 py-2 font-bold hover:bg-white transition-colors text-xs font-mono uppercase tracking-widest">
                                                            Schedule
                                                        </button>
                                                        <button
                                                            onClick={() => setShowScheduleModal(false)}
                                                            className="border border-[#333] text-[#888] px-4 py-2 font-bold hover:text-white hover:border-[#555] transition-colors text-xs font-mono uppercase tracking-widest"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Scheduled Interviews */}
                                    <div className="bg-[#0A0A0A] border border-[#222] rounded-sm">
                                        <div className="flex justify-between items-center p-6 pb-4 border-b border-[#222]">
                                            <h3 className="text-sm font-bold font-sans uppercase tracking-widest text-white flex items-center gap-2">
                                                <Calendar size={16} className="text-[#888]" />
                                                Scheduled Interviews
                                            </h3>
                                            <button
                                                onClick={() => setShowScheduleModal(true)}
                                                className="px-3 py-1.5 bg-[#111] border border-[#333] text-[10px] font-mono uppercase tracking-widest text-[#aaa] hover:text-white hover:border-accent-500 transition-colors rounded-sm flex items-center gap-2"
                                            >
                                                <Plus size={12} /> Schedule
                                            </button>
                                        </div>
                                        <div className="divide-y divide-[#1a1a1a]">
                                            {scheduledInterviews.map((interview, i) => (
                                                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-5 hover:bg-[#050505] transition-colors group cursor-pointer">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-9 h-9 rounded-sm bg-[#111] border border-[#333] flex items-center justify-center text-[10px] font-mono font-bold text-accent-400 shrink-0">
                                                            {interview.student.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-sans font-bold text-sm text-white group-hover:text-accent-400 transition-colors">{interview.student}</h4>
                                                            <div className="flex items-center gap-3 text-[10px] font-mono text-[#666] uppercase tracking-widest mt-1">
                                                                <span>{interview.university}</span>
                                                                <span>•</span>
                                                                <span>{interview.role}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-3 md:mt-0">
                                                        <span className="text-[9px] font-mono px-2 py-1 border border-[#333] text-[#888] rounded-sm uppercase tracking-widest">{interview.type}</span>
                                                        <div className="text-right">
                                                            <div className="text-xs font-mono text-white">{interview.date}</div>
                                                            <div className="text-[9px] font-mono text-accent-400 uppercase tracking-widest">{interview.status}</div>
                                                        </div>
                                                        <Link to="/interview" className="p-2 bg-accent-500/10 border border-accent-500/30 rounded-sm hover:bg-accent-500/20 transition-colors">
                                                            <Video size={14} className="text-accent-400" />
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
                                            Interview Recordings
                                        </h3>
                                    </div>
                                    <div className="divide-y divide-[#1a1a1a]">
                                        {recordings.map((rec, i) => (
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
};

export default CompanyDashboard;
