import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Terminal,
    Building2,
    Users,
    GraduationCap,
    BarChart3,
    FileBarChart,
    ChevronRight,
    ChevronLeft,
    LogOut,
    Calendar,
    Bell,
    Download,
    Plus,
    Search,
    Filter,
    TrendingUp,
    Briefcase,
    CheckCircle2,
    Clock,
    ArrowUpRight
} from 'lucide-react';

const UniversityDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [studentFilter, setStudentFilter] = useState<'ALL' | 'PLACED' | 'UNPLACED' | 'IN_PROCESS'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const sidebarItems = [
        { icon: Terminal, label: 'CMD CENTER', active: true },
        { icon: Building2, label: 'COMPANIES' },
        { icon: Users, label: 'STUDENTS' },
        { icon: Briefcase, label: 'PLACEMENTS' },
        { icon: BarChart3, label: 'ANALYTICS' },
        { icon: FileBarChart, label: 'REPORTS' },
    ];

    const students = [
        { name: 'Aarav Sharma', branch: 'CSE', cgpa: 9.2, status: 'PLACED', company: 'Google' },
        { name: 'Priya Patel', branch: 'ECE', cgpa: 8.8, status: 'PLACED', company: 'Microsoft' },
        { name: 'Rohan Gupta', branch: 'CSE', cgpa: 8.5, status: 'IN_PROCESS', company: 'Amazon' },
        { name: 'Sneha Reddy', branch: 'IT', cgpa: 9.0, status: 'PLACED', company: 'Apple' },
        { name: 'Arjun Nair', branch: 'CSE', cgpa: 7.9, status: 'UNPLACED', company: '—' },
        { name: 'Kavya Iyer', branch: 'ME', cgpa: 8.1, status: 'IN_PROCESS', company: 'Flipkart' },
        { name: 'Vikram Singh', branch: 'CSE', cgpa: 9.4, status: 'PLACED', company: 'Meta' },
        { name: 'Ananya Das', branch: 'ECE', cgpa: 7.6, status: 'UNPLACED', company: '—' },
        { name: 'Rahul Verma', branch: 'IT', cgpa: 8.3, status: 'PLACED', company: 'Uber' },
        { name: 'Meera Joshi', branch: 'CSE', cgpa: 8.7, status: 'IN_PROCESS', company: 'Stripe' },
        { name: 'Aditya Kumar', branch: 'ME', cgpa: 7.4, status: 'UNPLACED', company: '—' },
        { name: 'Ishita Bose', branch: 'CSE', cgpa: 9.1, status: 'PLACED', company: 'Netflix' },
    ];

    const recentDrives = [
        { company: 'Google', date: 'Mar 18, 2026', roles: 'SDE I, SDE II', offers: 12, status: 'COMPLETED' },
        { company: 'Microsoft', date: 'Mar 15, 2026', roles: 'SWE, PM', offers: 8, status: 'COMPLETED' },
        { company: 'Amazon', date: 'Mar 22, 2026', roles: 'SDE I', offers: 0, status: 'UPCOMING' },
        { company: 'Stripe', date: 'Mar 25, 2026', roles: 'Backend Eng.', offers: 0, status: 'UPCOMING' },
    ];

    const upcomingEvents = [
        { title: 'Amazon Placement Drive', type: 'DRIVE', time: 'Mar 22, 10:00 AM', color: 'text-accent-400 border-accent-500/50' },
        { title: 'Pre-Placement Talk — Stripe', type: 'PPT', time: 'Mar 24, 2:00 PM', color: 'text-yellow-400 border-yellow-500/50' },
        { title: 'Resume Submission Deadline', type: 'DEADLINE', time: 'Mar 25, 11:59 PM', color: 'text-red-400 border-red-500/50' },
        { title: 'Mock Interview Session', type: 'WORKSHOP', time: 'Mar 28, 5:00 PM', color: 'text-[#888] border-[#333]' },
    ];

    const filteredStudents = students.filter(s => {
        const matchesFilter = studentFilter === 'ALL' || s.status === studentFilter;
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.branch.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const placedCount = students.filter(s => s.status === 'PLACED').length;
    const totalStudents = students.length;

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PLACED':
                return 'text-green-400 bg-green-500/10 border-green-500/20';
            case 'IN_PROCESS':
                return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            case 'UNPLACED':
                return 'text-[#888] bg-[#111] border-[#333]';
            default:
                return 'text-[#888] bg-[#111] border-[#333]';
        }
    };

    const getDriveStatusStyle = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'text-green-400 border-green-500/20 bg-green-500/10';
            case 'UPCOMING':
                return 'text-accent-400 border-accent-500/20 bg-accent-500/10';
            default:
                return 'text-[#888] border-[#333] bg-[#111]';
        }
    };

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

                {/* User Profile Mini */}
                <div className="p-4 border-t border-[#222]">
                    <div className="flex items-center group cursor-pointer hover:bg-[#111] p-2 rounded-sm border border-transparent hover:border-[#333] transition-colors">
                        <div className="w-8 h-8 rounded-sm bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-white font-mono text-xs font-bold shrink-0">
                            PC
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
                                        <p className="text-xs font-mono text-white whitespace-nowrap uppercase tracking-wider">Placement Cell</p>
                                        <p className="text-[10px] font-mono text-accent-500 whitespace-nowrap">UNIVERSITY</p>
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
                                PLACEMENT PORTAL ONLINE
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight uppercase">
                                <span className="text-accent-400 font-serif italic">University</span> Dashboard
                            </h1>
                            <p className="text-[#888] font-mono text-xs mt-2">
                                /home/university/placement_cell/dashboard
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button className="border border-[#555] bg-transparent text-white px-4 py-2 font-bold hover:bg-[#111] transition-colors text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                                <Bell size={14} /> Notify
                            </button>
                            <button className="bg-[#e0e0e0] text-black px-4 py-2 font-bold hover:bg-white transition-colors text-xs font-mono uppercase tracking-widest flex items-center gap-2 group">
                                <Plus size={14} /> Add Company <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Companies Listed */}
                        <div className="bg-[#0A0A0A] border border-[#222] p-6 rounded-sm group hover:border-[#333] transition-colors relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#111] group-hover:bg-accent-500 transition-colors"></div>
                            <h3 className="text-[10px] uppercase font-mono tracking-widest text-[#888] mb-2 flex justify-between items-center">
                                Companies Listed
                                <span className="text-accent-400 font-bold">2026</span>
                            </h3>
                            <div className="text-4xl font-bold font-sans tracking-tight">48</div>
                            <div className="text-[10px] font-mono text-green-400 mt-3 flex items-center gap-1">
                                <TrendingUp size={10} /> ↑ 12 MORE <span className="text-[#555]">/ VS LAST YEAR</span>
                            </div>
                        </div>

                        {/* Students Placed */}
                        <div className="bg-[#0A0A0A] border border-[#222] p-6 rounded-sm group hover:border-[#333] transition-colors relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#111] group-hover:bg-accent-500 transition-colors"></div>
                            <h3 className="text-[10px] uppercase font-mono tracking-widest text-[#888] mb-2 flex justify-between items-center">
                                Students Placed
                                <span className="text-accent-400 font-bold">{placedCount} / {totalStudents}</span>
                            </h3>
                            <div className="text-4xl font-bold font-sans tracking-tight flex items-end gap-2">
                                {placedCount} <span className="text-sm text-[#555] font-mono font-normal pb-1">of {totalStudents} eligible</span>
                            </div>
                            <div className="w-full bg-[#111] border border-[#333] h-1.5 mt-3 rounded-sm overflow-hidden">
                                <div className="bg-accent-500 h-1.5 rounded-sm transition-all duration-500" style={{ width: `${(placedCount / totalStudents) * 100}%` }} />
                            </div>
                        </div>

                        {/* Avg. Package */}
                        <div className="bg-[#0A0A0A] border border-[#222] p-6 rounded-sm group hover:border-[#333] transition-colors relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#111] group-hover:bg-accent-500 transition-colors"></div>
                            <h3 className="text-[10px] uppercase font-mono tracking-widest text-[#888] mb-2 flex justify-between items-center">
                                Avg. Package
                                <span className="text-accent-400 font-bold">₹12.4 LPA</span>
                            </h3>
                            <div className="text-4xl font-bold font-sans tracking-tight">₹12.4<span className="text-lg text-[#555] ml-1">LPA</span></div>
                            <div className="text-[10px] font-mono text-green-400 mt-3 flex items-center gap-1">
                                <TrendingUp size={10} /> ↑ 18% <span className="text-[#555]">/ VS LAST YEAR (₹10.5 LPA)</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Recent Placement Drives */}
                            <div className="bg-[#0A0A0A] border border-[#222] p-6 rounded-sm">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#222]">
                                    <h3 className="text-sm font-bold font-sans uppercase tracking-widest text-white flex items-center gap-2">
                                        <Building2 size={16} className="text-[#888]" />
                                        Placement Drives
                                    </h3>
                                    <button className="text-[10px] font-mono uppercase tracking-widest text-[#555] hover:text-accent-500 transition-colors">VIEW ALL {'>>'}</button>
                                </div>

                                <div className="space-y-3">
                                    {recentDrives.map((drive, i) => (
                                        <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-[#222] bg-[#050505] hover:border-[#333] transition-colors group cursor-pointer rounded-sm">
                                            <div className="flex-1">
                                                <h4 className="font-sans font-bold text-sm text-white group-hover:text-accent-400 transition-colors mb-1">{drive.company}</h4>
                                                <div className="flex items-center gap-4 text-[10px] font-mono text-[#666] uppercase tracking-widest">
                                                    <span>{drive.date}</span>
                                                    <span>•</span>
                                                    <span>{drive.roles}</span>
                                                    {drive.offers > 0 && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-green-400">{drive.offers} OFFERS</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-3 md:mt-0">
                                                <span className={`text-[10px] font-mono px-2 py-1 border rounded-sm uppercase tracking-widest ${getDriveStatusStyle(drive.status)}`}>
                                                    {drive.status === 'COMPLETED' && <CheckCircle2 size={10} className="inline mr-1 -mt-px" />}
                                                    {drive.status === 'UPCOMING' && <Clock size={10} className="inline mr-1 -mt-px" />}
                                                    {drive.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Students List */}
                            <div className="bg-[#0A0A0A] border border-[#222] p-6 rounded-sm">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-[#222] gap-4">
                                    <h3 className="text-sm font-bold font-sans uppercase tracking-widest text-white flex items-center gap-2">
                                        <GraduationCap size={16} className="text-[#888]" />
                                        Students ({filteredStudents.length})
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        {/* Search */}
                                        <div className="relative">
                                            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#555]" />
                                            <input
                                                type="text"
                                                placeholder="Search..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="bg-[#050505] border border-[#333] rounded-sm pl-7 pr-3 py-1.5 text-[10px] font-mono text-white placeholder:text-[#555] outline-none focus:border-accent-500 transition-colors w-36"
                                            />
                                        </div>
                                        {/* Filter */}
                                        <div className="flex items-center gap-1">
                                            <Filter size={10} className="text-[#555]" />
                                            {(['ALL', 'PLACED', 'UNPLACED', 'IN_PROCESS'] as const).map((f) => (
                                                <button
                                                    key={f}
                                                    onClick={() => setStudentFilter(f)}
                                                    className={`text-[9px] font-mono uppercase tracking-widest px-2 py-1 border rounded-sm transition-colors ${
                                                        studentFilter === f
                                                            ? 'border-accent-500/50 text-accent-400 bg-accent-500/10'
                                                            : 'border-[#333] text-[#666] hover:text-white hover:border-[#555]'
                                                    }`}
                                                >
                                                    {f.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Table Header */}
                                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[9px] font-mono uppercase tracking-widest text-[#555] border-b border-[#1a1a1a] mb-2">
                                    <div className="col-span-4">Name</div>
                                    <div className="col-span-2">Branch</div>
                                    <div className="col-span-2">CGPA</div>
                                    <div className="col-span-2">Status</div>
                                    <div className="col-span-2">Company</div>
                                </div>

                                {/* Student Rows */}
                                <div className="space-y-1 max-h-[360px] overflow-y-auto custom-scrollbar">
                                    {filteredStudents.map((student, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="grid grid-cols-12 gap-4 px-4 py-3 border border-transparent hover:border-[#222] hover:bg-[#050505] rounded-sm cursor-pointer group transition-colors items-center"
                                        >
                                            <div className="col-span-4 flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-sm bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-[10px] font-mono font-bold text-[#aaa] shrink-0">
                                                    {student.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <span className="text-xs font-sans font-semibold text-white group-hover:text-accent-400 transition-colors truncate">{student.name}</span>
                                            </div>
                                            <div className="col-span-2 text-[10px] font-mono text-[#888] uppercase tracking-widest">{student.branch}</div>
                                            <div className="col-span-2 text-xs font-mono font-bold text-white">{student.cgpa}</div>
                                            <div className="col-span-2">
                                                <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 border rounded-sm ${getStatusStyle(student.status)}`}>
                                                    {student.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="col-span-2 text-[10px] font-mono text-[#888]">{student.company}</div>
                                        </motion.div>
                                    ))}
                                </div>

                                {filteredStudents.length === 0 && (
                                    <div className="text-center py-12 text-[#555] font-mono text-xs uppercase tracking-widest">
                                        No students match the current filter
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6 flex flex-col">

                            {/* Upcoming Events */}
                            <div className="bg-[#0A0A0A] border border-[#222] p-6 rounded-sm flex-1">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#222]">
                                    <h3 className="text-sm font-bold font-sans uppercase tracking-widest text-white flex items-center gap-2">
                                        <Calendar size={16} className="text-[#888]" />
                                        Events
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    {upcomingEvents.map((event, i) => (
                                        <div key={i} className="flex gap-4 group cursor-pointer opacity-90 hover:opacity-100 transition-opacity">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-2 h-2 rounded-full border border-current mt-1.5 ${event.color} bg-[#0A0A0A]`} />
                                                {i !== upcomingEvents.length - 1 && (
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
                                    View Full Calendar
                                </button>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-[#0A0A0A] border border-[#222] p-6 rounded-sm">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#222]">
                                    <h3 className="text-sm font-bold font-sans uppercase tracking-widest text-white flex items-center gap-2">
                                        <ArrowUpRight size={16} className="text-[#888]" />
                                        Quick Actions
                                    </h3>
                                </div>

                                <div className="space-y-2">
                                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#050505] border border-[#222] hover:border-accent-500/50 rounded-sm transition-all group text-left">
                                        <Plus size={14} className="text-[#555] group-hover:text-accent-400 transition-colors shrink-0" />
                                        <div>
                                            <p className="text-xs font-sans font-semibold text-white group-hover:text-accent-400 transition-colors">Schedule Drive</p>
                                            <p className="text-[10px] font-mono text-[#555] mt-0.5">Add a new placement drive</p>
                                        </div>
                                    </button>
                                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#050505] border border-[#222] hover:border-accent-500/50 rounded-sm transition-all group text-left">
                                        <Bell size={14} className="text-[#555] group-hover:text-accent-400 transition-colors shrink-0" />
                                        <div>
                                            <p className="text-xs font-sans font-semibold text-white group-hover:text-accent-400 transition-colors">Send Notifications</p>
                                            <p className="text-[10px] font-mono text-[#555] mt-0.5">Broadcast to all students</p>
                                        </div>
                                    </button>
                                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#050505] border border-[#222] hover:border-accent-500/50 rounded-sm transition-all group text-left">
                                        <Download size={14} className="text-[#555] group-hover:text-accent-400 transition-colors shrink-0" />
                                        <div>
                                            <p className="text-xs font-sans font-semibold text-white group-hover:text-accent-400 transition-colors">Export Report</p>
                                            <p className="text-[10px] font-mono text-[#555] mt-0.5">Download placement data</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
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

export default UniversityDashboard;
