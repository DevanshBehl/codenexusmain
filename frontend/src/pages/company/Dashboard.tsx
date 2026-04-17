import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardApi, type CompanyDashboardData } from '../../lib/api';
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
    Video,
    Trophy,
    MapPin,
    FileText,
    ExternalLink,
    Swords,
    Mail,
    Presentation
} from 'lucide-react';

type StudentFilter = 'ALL' | 'PLACED' | 'AVAILABLE';
type TabType = 'UNIVERSITIES' | 'STUDENTS' | 'CONTESTS' | 'INTERVIEWS';

const CompanyDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('UNIVERSITIES');
    const [studentFilter, setStudentFilter] = useState<StudentFilter>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState<CompanyDashboardData | null>(null);

    useEffect(() => {
        dashboardApi.company()
            .then(res => setData(res.data))
            .catch(() => { });
    }, []);

    const sidebarItems = [
        { icon: Mail, label: 'MAIL', onClick: () => window.location.href = '/company/mail' },
        { icon: Presentation, label: 'WEBINARS', onClick: () => window.location.href = '/company/ppt' },
        { icon: Terminal, label: 'CMD CENTER', active: true, onClick: () => window.location.href = '/company/dashboard' },
        { icon: Building2, label: 'UNIVERSITIES', onClick: () => setActiveTab('UNIVERSITIES') },
        { icon: Users, label: 'CANDIDATES', onClick: () => setActiveTab('STUDENTS') },
        { icon: Swords, label: 'CODE ARENA', onClick: () => setActiveTab('CONTESTS') },
        { icon: Video, label: 'INTERVIEWS', onClick: () => setActiveTab('INTERVIEWS') },
        { icon: CheckCircle2, label: 'EVALUATIONS', onClick: () => window.location.href = '/company/evaluation' },
        { icon: BarChart3, label: 'ANALYTICS', onClick: () => window.location.href = '/company/profile' },
        { icon: FileText, label: 'PROFILE', onClick: () => window.location.href = '/company/profile' },
    ];

    const companyName = data?.profile.name || '—';
    const companyInitials = companyName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'CO';

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const partnerUniversities = data?.partnerUniversities || [];
    const candidates = data?.candidates || [];
    const contests = data?.recentContests || [];
    const scheduledInterviews = data?.scheduledInterviews || [];

    const filteredCandidates = candidates.filter(s => {
        const matchesFilter = studentFilter === 'ALL' || s.status === studentFilter;
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q ||
            s.name.toLowerCase().includes(q) ||
            s.university.toLowerCase().includes(q) ||
            s.branch.toLowerCase().includes(q);
        return matchesFilter && matchesSearch;
    });

    const getStudentStatusStyle = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return 'text-accent-400 bg-accent-500/10 border-accent-500/20';
            case 'PLACED': return 'text-green-400 bg-green-500/10 border-green-500/20';
            default: return 'text-[#888] bg-[#111] border-[#333]';
        }
    };

    const tabs: { key: TabType; label: string; icon: typeof Terminal }[] = [
        { key: 'UNIVERSITIES', label: 'Universities', icon: Building2 },
        { key: 'STUDENTS', label: 'Candidates', icon: Users },
        { key: 'CONTESTS', label: 'Code Arena', icon: Swords },
        { key: 'INTERVIEWS', label: 'Interviews', icon: Calendar },
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
                    {sidebarItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => { if ((item as any).onClick) (item as any).onClick(); }}
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
                            {companyInitials}
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
                                        <p className="text-xs font-mono text-white whitespace-nowrap uppercase tracking-wider">{companyName}</p>
                                        <p className="text-[10px] font-mono text-accent-500 whitespace-nowrap">COMPANY</p>
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
                                RECRUITER PORTAL
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight uppercase">
                                <span className="text-accent-400 font-serif italic">{companyName}</span> Dashboard
                            </h1>
                            <p className="text-[#888] font-mono text-xs mt-2">
                                {data?.profile.industry || 'Recruitment Command Center'}
                            </p>
                        </div>

                        <div className="flex gap-3 flex-wrap">
                            <Link to="/company/create-contest" className="border border-[#555] bg-transparent text-white px-4 py-2 font-bold hover:bg-[#111] transition-colors text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                                <Trophy size={14} /> Create Contest
                            </Link>
                            <Link to="/company/interviews" className="bg-[#e0e0e0] text-black px-4 py-2 font-bold hover:bg-white transition-colors text-xs font-mono uppercase tracking-widest flex items-center gap-2 group">
                                <Calendar size={14} /> Schedule Interview <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-[#0A0A0A] border border-[#222] p-5 rounded-sm group hover:border-[#333] transition-colors relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#111] group-hover:bg-accent-500 transition-colors"></div>
                            <h3 className="text-[10px] uppercase font-mono tracking-widest text-[#888] mb-1">Partner Universities</h3>
                            <div className="text-3xl font-bold font-sans tracking-tight">{data?.stats.partnerUniversities ?? 0}</div>
                            <div className="text-[10px] font-mono text-green-400 mt-2 flex items-center gap-1">
                                <TrendingUp size={10} /> {data?.stats.totalStudentsReach ?? 0} students reach
                            </div>
                        </div>
                        <div className="bg-[#0A0A0A] border border-[#222] p-5 rounded-sm group hover:border-[#333] transition-colors relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#111] group-hover:bg-accent-500 transition-colors"></div>
                            <h3 className="text-[10px] uppercase font-mono tracking-widest text-[#888] mb-1">Contests</h3>
                            <div className="text-3xl font-bold font-sans tracking-tight">{data?.stats.totalContests ?? 0}</div>
                            <div className="text-[10px] font-mono text-accent-400 mt-2">{data?.stats.activeContests ?? 0} active</div>
                        </div>
                        <div className="bg-[#0A0A0A] border border-[#222] p-5 rounded-sm group hover:border-[#333] transition-colors relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#111] group-hover:bg-accent-500 transition-colors"></div>
                            <h3 className="text-[10px] uppercase font-mono tracking-widest text-[#888] mb-1">Interviews</h3>
                            <div className="text-3xl font-bold font-sans tracking-tight">{data?.stats.scheduledInterviews ?? 0}</div>
                            <div className="text-[10px] font-mono text-yellow-400 mt-2 flex items-center gap-1">
                                <Clock size={10} /> upcoming · {data?.stats.completedInterviews ?? 0} done
                            </div>
                        </div>
                        <div className="bg-[#0A0A0A] border border-[#222] p-5 rounded-sm group hover:border-[#333] transition-colors relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#111] group-hover:bg-accent-500 transition-colors"></div>
                            <h3 className="text-[10px] uppercase font-mono tracking-widest text-[#888] mb-1">Recruiters</h3>
                            <div className="text-3xl font-bold font-sans tracking-tight text-green-400">{data?.stats.recruiters ?? 0}</div>
                            <div className="text-[10px] font-mono text-[#555] mt-2">active in company</div>
                        </div>
                    </div>

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

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'UNIVERSITIES' && (
                                <div className="bg-[#0A0A0A] border border-[#222] rounded-sm">
                                    <div className="flex justify-between items-center p-6 pb-4 border-b border-[#222]">
                                        <h3 className="text-sm font-bold font-sans uppercase tracking-widest text-white flex items-center gap-2">
                                            <Building2 size={16} className="text-[#888]" />
                                            Partner Universities
                                        </h3>
                                    </div>

                                    <div className="divide-y divide-[#1a1a1a]">
                                        {partnerUniversities.length === 0 && (
                                            <div className="text-center py-16 text-[#555] font-mono text-xs uppercase tracking-widest">
                                                No partner universities yet
                                            </div>
                                        )}
                                        {partnerUniversities.map((uni) => (
                                            <div key={uni.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 hover:bg-[#050505] transition-colors group cursor-pointer">
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
                                                        <div className="text-sm font-bold font-sans text-white">{uni.studentCount}</div>
                                                        <div className="text-[9px] font-mono text-[#555] uppercase tracking-widest">Students</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'STUDENTS' && (
                                <div className="bg-[#0A0A0A] border border-[#222] rounded-sm">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 pb-4 border-b border-[#222] gap-4">
                                        <h3 className="text-sm font-bold font-sans uppercase tracking-widest text-white flex items-center gap-2">
                                            <Users size={16} className="text-[#888]" />
                                            Candidates ({filteredCandidates.length})
                                        </h3>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <div className="relative">
                                                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#555]" />
                                                <input
                                                    type="text"
                                                    placeholder="Name, university, branch..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="bg-[#050505] border border-[#333] rounded-sm pl-7 pr-3 py-1.5 text-[10px] font-mono text-white placeholder:text-[#555] outline-none focus:border-accent-500 transition-colors w-48"
                                                />
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Filter size={10} className="text-[#555]" />
                                                {(['ALL', 'AVAILABLE', 'PLACED'] as const).map((f) => (
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
                                        {filteredCandidates.map((student, i) => (
                                            <motion.div
                                                key={student.id}
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
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 mt-3 md:mt-0 md:ml-4">
                                                    <div className="text-center">
                                                        <div className="text-lg font-bold font-sans text-white">{student.problemsSolved}</div>
                                                        <div className="text-[9px] font-mono text-[#555] uppercase tracking-widest">Solved</div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {filteredCandidates.length === 0 && (
                                        <div className="text-center py-16 text-[#555] font-mono text-xs uppercase tracking-widest">
                                            No candidates match the current filter
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'CONTESTS' && (
                                <div className="space-y-6">
                                    <div className="bg-[#0A0A0A] border border-accent-500/20 rounded-sm p-6 relative overflow-hidden">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                                            <div>
                                                <h3 className="text-sm font-bold font-sans uppercase tracking-widest text-white flex items-center gap-2">
                                                    <Trophy size={16} className="text-accent-400" />
                                                    Create Code Arena Contest
                                                </h3>
                                                <p className="text-[10px] font-mono text-[#888] mt-1">Design custom coding challenges to evaluate candidates at scale</p>
                                            </div>
                                            <Link to="/company/create-contest" className="bg-[#e0e0e0] text-black px-4 py-2 font-bold hover:bg-white transition-colors text-xs font-mono uppercase tracking-widest flex items-center gap-2 group shrink-0">
                                                <Plus size={14} /> New Contest <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="bg-[#0A0A0A] border border-[#222] rounded-sm">
                                        <div className="p-6 pb-4 border-b border-[#222]">
                                            <h3 className="text-sm font-bold font-sans uppercase tracking-widest text-white flex items-center gap-2">
                                                <Swords size={16} className="text-[#888]" />
                                                Your Contests
                                            </h3>
                                        </div>
                                        <div className="divide-y divide-[#1a1a1a]">
                                            {contests.length === 0 && (
                                                <div className="text-center py-12 text-[#555] font-mono text-xs uppercase tracking-widest">
                                                    No contests yet
                                                </div>
                                            )}
                                            {contests.map((contest) => (
                                                <div key={contest.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 hover:bg-[#050505] transition-colors group cursor-pointer">
                                                    <div>
                                                        <h4 className="font-sans font-bold text-sm text-white group-hover:text-accent-400 transition-colors">{contest.title}</h4>
                                                        <div className="flex items-center gap-4 text-[10px] font-mono text-[#666] uppercase tracking-widest mt-1">
                                                            <span>{formatDate(contest.date)}</span>
                                                            <span>•</span>
                                                            <span>{contest.durationMins} min</span>
                                                            <span>•</span>
                                                            <span>{contest.problems} problems</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-3 md:mt-0">
                                                        <span className={`text-[9px] font-mono px-2 py-1 border rounded-sm uppercase tracking-widest ${
                                                            contest.status === 'UPCOMING' ? 'text-accent-400 border-accent-500/20 bg-accent-500/10' :
                                                            contest.status === 'ACTIVE' ? 'text-green-400 border-green-500/20 bg-green-500/10' :
                                                            'text-[#888] border-[#333] bg-[#111]'
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

                            {activeTab === 'INTERVIEWS' && (
                                <div className="bg-[#0A0A0A] border border-[#222] rounded-sm">
                                    <div className="flex justify-between items-center p-6 pb-4 border-b border-[#222]">
                                        <h3 className="text-sm font-bold font-sans uppercase tracking-widest text-white flex items-center gap-2">
                                            <Calendar size={16} className="text-[#888]" />
                                            Scheduled Interviews
                                        </h3>
                                    </div>
                                    <div className="divide-y divide-[#1a1a1a]">
                                        {scheduledInterviews.length === 0 && (
                                            <div className="text-center py-12 text-[#555] font-mono text-xs uppercase tracking-widest">
                                                No interviews scheduled
                                            </div>
                                        )}
                                        {scheduledInterviews.map((interview) => (
                                            <div key={interview.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 hover:bg-[#050505] transition-colors group cursor-pointer">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-9 h-9 rounded-sm bg-[#111] border border-[#333] flex items-center justify-center text-[10px] font-mono font-bold text-accent-400 shrink-0">
                                                        {interview.student.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-sans font-bold text-sm text-white group-hover:text-accent-400 transition-colors">{interview.student}</h4>
                                                        <div className="flex items-center gap-3 text-[10px] font-mono text-[#666] uppercase tracking-widest mt-1">
                                                            <span>{interview.studentUniversity}</span>
                                                            <span>•</span>
                                                            <span>{interview.role}</span>
                                                            <span>•</span>
                                                            <span>{interview.recruiter}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 mt-3 md:mt-0">
                                                    <span className="text-[9px] font-mono px-2 py-1 border border-[#333] text-[#888] rounded-sm uppercase tracking-widest">{interview.type}</span>
                                                    <div className="text-right">
                                                        <div className="text-xs font-mono text-white">{formatDate(interview.scheduledAt)}</div>
                                                    </div>
                                                    <Link to={`/recruiter/interview/${interview.id}`} className="p-2 bg-accent-500/10 border border-accent-500/30 rounded-sm hover:bg-accent-500/20 transition-colors">
                                                        <Video size={14} className="text-accent-400" />
                                                    </Link>
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
