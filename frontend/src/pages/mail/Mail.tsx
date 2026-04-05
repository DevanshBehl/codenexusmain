import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Inbox,
    Send,
    PenSquare,
    ChevronRight,
    ChevronLeft,
    LogOut,
    User,
    Search,
    ShieldAlert,
    X,
    MessageSquare,
    ShieldCheck,
    Terminal,
    Code2,
    Play,
    Users,
    FileText,
    CheckCircle2,
    Briefcase,
    Presentation,
    PenTool,
    Video,
    Building2,
    Swords,
    BarChart3,
    FileBarChart,
    Calendar,
    Loader2
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { mailApi, type MailItem, type RecipientSearchResult } from '../../lib/api';

/* ────────── Types & Constants ────────── */
type Role = 'STUDENT' | 'UNIVERSITY' | 'COMPANY' | 'RECRUITER' | 'CODENEXUS';

interface Email {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: Role;
    recipientId: string;
    recipientName: string;
    recipientRole: Role;
    subject: string;
    body: string;
    timestamp: string;
    read: boolean;
}

function formatTimestamp(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function mailItemToEmail(mail: MailItem): Email {
    return {
        id: mail.id,
        senderId: mail.sender_cnid,
        senderName: mail.sender_name,
        senderRole: (mail.sender_cnid.split('-')[1] as Role) || 'CODENEXUS',
        recipientId: mail.recipient_cnid,
        recipientName: mail.recipient_name,
        recipientRole: (mail.recipient_cnid.split('-')[1] as Role) || 'CODENEXUS',
        subject: mail.subject,
        body: mail.body,
        timestamp: formatTimestamp(mail.sent_at),
        read: mail.is_read
    };
}

export default function Mail() {
    const { user, isLoading: authLoading } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [currentView, setCurrentView] = useState<'INBOX' | 'SENT' | 'COMPOSE'>('INBOX');

    // Auth user info derived from useAuth
    const activeUserId = user?.id || '';
    const activeUserRole = (user?.role as Role) || 'STUDENT';

    // Composition State
    const [composeTo, setComposeTo] = useState('');
    const [composeTargetRole, setComposeTargetRole] = useState<Role>('CODENEXUS');
    const [composeSubject, setComposeSubject] = useState('');
    const [composeBody, setComposeBody] = useState('');

    // Mail State
    const [mails, setMails] = useState<Email[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMail, setSelectedMail] = useState<Email | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recipientSearchResults, setRecipientSearchResults] = useState<RecipientSearchResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

    const sidebarItems = [
        { icon: Inbox, label: 'INBOX', view: 'INBOX' },
        { icon: Send, label: 'SENT', view: 'SENT' },
        { icon: PenSquare, label: 'COMPOSE', view: 'COMPOSE' },
    ];

    const getDashboardSidebarItems = () => {
        switch (activeUserRole) {
            case 'STUDENT':
                return [
                    { icon: Terminal, label: 'CMD CENTER', onClick: () => window.location.href = '/student/dashboard' },
                    { icon: Code2, label: 'CODE ARENA', onClick: () => window.location.href = '/student/codearena' },
                    { icon: Play, label: 'INTERVIEWS', onClick: () => window.location.href = '/student/dashboard' },
                    { icon: Users, label: 'PORTFOLIO', onClick: () => window.location.href = '/student/dashboard' },
                    { icon: FileText, label: 'RESUME', onClick: () => window.location.href = '/student/dashboard' },
                    { icon: CheckCircle2, label: 'EVALUATIONS', onClick: () => window.location.href = '/student/dashboard' },
                    { icon: MessageSquare, label: 'FORUM', onClick: () => window.location.href = '/student/dashboard' },
                    { icon: Briefcase, label: 'JOBS', onClick: () => window.location.href = '/student/dashboard' },
                    { icon: Presentation, label: 'WEBINARS', onClick: () => window.location.href = '/student/webinars' },
                    { icon: PenTool, label: 'DESIGN ARENA', onClick: () => window.location.href = '/student/designarena' },
                ];
            case 'COMPANY':
                return [
                    { icon: Presentation, label: 'WEBINARS', onClick: () => window.location.href = '/company/ppt' },
                    { icon: Terminal, label: 'CMD CENTER', onClick: () => window.location.href = '/company/dashboard' },
                    { icon: Building2, label: 'UNIVERSITIES', onClick: () => window.location.href = '/company/dashboard' },
                    { icon: Users, label: 'CANDIDATES', onClick: () => window.location.href = '/company/dashboard' },
                    { icon: Swords, label: 'CODE ARENA', onClick: () => window.location.href = '/company/dashboard' },
                    { icon: Video, label: 'INTERVIEWS', onClick: () => window.location.href = '/company/dashboard' },
                    { icon: CheckCircle2, label: 'EVALUATIONS', onClick: () => window.location.href = '/company/evaluation' },
                    { icon: BarChart3, label: 'ANALYTICS', onClick: () => window.location.href = '/company/dashboard' },
                ];
            case 'UNIVERSITY':
                return [
                    { icon: Presentation, label: 'WEBINARS', onClick: () => window.location.href = '/university/webinars' },
                    { icon: Terminal, label: 'CMD CENTER', onClick: () => window.location.href = '/university/dashboard' },
                    { icon: Building2, label: 'COMPANIES', onClick: () => window.location.href = '/university/dashboard' },
                    { icon: Users, label: 'STUDENTS', onClick: () => window.location.href = '/university/dashboard' },
                    { icon: Briefcase, label: 'PLACEMENTS', onClick: () => window.location.href = '/university/dashboard' },
                    { icon: CheckCircle2, label: 'EVALUATIONS', onClick: () => window.location.href = '/university/evaluation' },
                    { icon: BarChart3, label: 'ANALYTICS', onClick: () => window.location.href = '/university/dashboard' },
                    { icon: FileBarChart, label: 'REPORTS', onClick: () => window.location.href = '/university/dashboard' },
                ];
            case 'RECRUITER':
                return [
                    { icon: Terminal, label: 'CMD CENTER', onClick: () => window.location.href = '/recruiter/dashboard' },
                    { icon: Users, label: 'CANDIDATES', onClick: () => window.location.href = '/recruiter/dashboard' },
                    { icon: Video, label: 'INTERVIEWS', onClick: () => window.location.href = '/recruiter/dashboard' },
                    { icon: Calendar, label: 'SCHEDULE', onClick: () => window.location.href = '/recruiter/dashboard' },
                    { icon: FileText, label: 'REPORTS', onClick: () => window.location.href = '/recruiter/dashboard' },
                ];
            default:
                return [];
        }
    };

    const getAllowedRecipientRoles = (role: Role): Role[] => {
        switch (role) {
            case 'STUDENT': return ['UNIVERSITY', 'CODENEXUS'];
            case 'UNIVERSITY': return ['STUDENT', 'COMPANY', 'CODENEXUS'];
            case 'COMPANY': return ['UNIVERSITY', 'STUDENT', 'RECRUITER', 'CODENEXUS'];
            case 'RECRUITER': return ['COMPANY', 'CODENEXUS'];
            case 'CODENEXUS': return ['STUDENT', 'UNIVERSITY', 'COMPANY', 'RECRUITER'];
            default: return ['CODENEXUS'];
        }
    };

    const allowedRoles = getAllowedRecipientRoles(activeUserRole);

    const fetchMails = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        setError(null);
        try {
            const endpoint = currentView === 'INBOX' ? mailApi.getInbox() : mailApi.getSent();
            const res = await endpoint;
            const emails = res.data.mails.map((mail) => mailItemToEmail(mail));
            setMails(emails);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch mails');
            setMails([]);
        } finally {
            setIsLoading(false);
        }
    }, [user, currentView]);

    useEffect(() => {
        if (!authLoading && user) {
            fetchMails();
        }
    }, [authLoading, user, currentView, fetchMails]);

    useEffect(() => {
        if (currentView === 'COMPOSE') {
            setRecipientSearchResults([]);
            setSearchQuery('');
        }
    }, [currentView]);

    const handleSendEmail = async () => {
        if (!composeTo.trim() || !composeSubject.trim() || !composeBody.trim()) return;

        setIsSending(true);
        setError(null);
        try {
            await mailApi.send({
                recipient_cnid: composeTo,
                subject: composeSubject,
                body: composeBody
            });
            setComposeTo('');
            setComposeSubject('');
            setComposeBody('');
            setCurrentView('SENT');
            fetchMails();
        } catch (err: any) {
            setError(err.message || 'Failed to send mail');
        } finally {
            setIsSending(false);
        }
    };

    const handleSearchRecipients = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setRecipientSearchResults([]);
            return;
        }
        setSearchLoading(true);
        try {
            const res = await mailApi.searchRecipients(query);
            setRecipientSearchResults(res.data.filter(r => allowedRoles.includes(r.role.toUpperCase() as Role)));
        } catch (err) {
            setRecipientSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSelectRecipient = (result: RecipientSearchResult) => {
        setComposeTo(result.cnid);
        setSearchQuery(result.displayName);
        setRecipientSearchResults([]);
    };

    const handleMailClick = async (mail: Email) => {
        setSelectedMail(mail);
        if (currentView === 'INBOX' && !mail.read) {
            try {
                await mailApi.markAsRead(mail.id);
                setMails(prev => prev.map(m => m.id === mail.id ? { ...m, read: true } : m));
            } catch (err) {
                // Silently fail - mail will remain unread visually
            }
        }
    };

    const displayList = mails.filter(m => {
        const searchMatches =
            m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.recipientName.toLowerCase().includes(searchQuery.toLowerCase());

        return searchMatches;
    });

    const getRoleColor = (role: Role) => {
        switch (role) {
            case 'STUDENT': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            case 'UNIVERSITY': return 'text-green-400 bg-green-500/10 border-green-500/20';
            case 'COMPANY': return 'text-accent-400 bg-accent-500/10 border-accent-500/20';
            case 'RECRUITER': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
            case 'CODENEXUS': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            default: return 'text-[#888] bg-[#111] border-[#333]';
        }
    };

    if (authLoading) {
        return (
            <div className="h-screen w-full bg-[#050505] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-accent-500 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="h-screen w-full bg-[#050505] flex flex-col items-center justify-center">
                <MessageSquare size={48} className="text-[#444] mb-4" />
                <p className="text-[#666] font-mono text-sm uppercase tracking-widest">Please login to access mail</p>
                <Link to="/login" className="mt-4 px-6 py-2 bg-accent-500 text-black font-mono text-xs uppercase tracking-widest rounded-sm hover:bg-accent-400 transition-colors">
                    Login
                </Link>
            </div>
        );
    }

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
                    <div className="text-[10px] font-mono text-[#555] uppercase tracking-widest px-3 mb-2">Back to Dashboard</div>
                    {getDashboardSidebarItems().map((item, index) => (
                        <button
                            key={'dash'+index}
                            onClick={item.onClick}
                            className={`flex items-center px-3 py-2.5 rounded-sm transition-all duration-200 group relative border border-transparent text-[#888] hover:bg-[#111] hover:border-[#222] hover:text-white`}
                        >
                            <item.icon size={16} className={`min-w-[16px] group-hover:text-white transition-colors`} />
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

                    <div className="text-[10px] font-mono text-[#555] uppercase tracking-widest px-3 mb-2 mt-4 pt-4 border-t border-[#222]">Mailbox</div>
                    {sidebarItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setCurrentView(item.view as any);
                                setSelectedMail(null);
                            }}
                            className={`flex items-center px-3 py-2.5 rounded-sm transition-all duration-200 group relative
                                ${currentView === item.view
                                    ? 'bg-[#111] border border-[#333] border-l-2 border-l-accent-500 text-white'
                                    : 'border border-transparent text-[#888] hover:bg-[#111] hover:border-[#222] hover:text-white'
                                }`}
                        >
                            <item.icon size={16} className={`min-w-[16px] ${currentView === item.view ? 'text-accent-400' : 'group-hover:text-white transition-colors'}`} />
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

                    {/* Current Role Display */}
                    <div className="mt-8 border-t border-[#222] pt-4">
                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="px-3"
                                >
                                    <div className="text-[10px] font-mono text-accent-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <ShieldCheck size={12}/> Current Role
                                    </div>
                                    <div className={`text-xs font-mono px-2 py-1 border rounded-sm uppercase tracking-wider ${getRoleColor(activeUserRole)}`}>
                                        {activeUserRole}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>

                <div className="p-4 border-t border-[#222]">
                    <div className="flex items-center group cursor-pointer hover:bg-[#111] p-2 rounded-sm border border-transparent hover:border-[#333] transition-colors">
                        <div className="w-8 h-8 rounded-sm bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-white font-mono text-xs font-bold shrink-0">
                            {activeUserRole[0]}
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
                                        <p className="text-xs font-mono text-white whitespace-nowrap uppercase tracking-wider">{activeUserId}</p>
                                        <p className="text-[10px] font-mono text-[#888] whitespace-nowrap">{activeUserRole}</p>
                                    </div>
                                    <LogOut size={14} className="text-[#555] group-hover:text-red-400 transition-colors" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
                {/* Topbar */}
                <header className="h-16 border-b border-[#222] bg-[#0A0A0A] flex items-center justify-between px-6 shrink-0">
                    <h1 className="text-lg font-bold font-sans text-white uppercase tracking-widest flex items-center gap-2">
                        {currentView === 'INBOX' && <><Inbox size={18} className="text-accent-400"/> Inbox Message Center</>}
                        {currentView === 'SENT' && <><Send size={18} className="text-accent-400"/> Sent Messages</>}
                        {currentView === 'COMPOSE' && <><PenSquare size={18} className="text-accent-400"/> Compose New Message</>}
                    </h1>

                    {currentView !== 'COMPOSE' && (
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
                            <input
                                type="text"
                                placeholder="Search subject or sender..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-[#111] border border-[#333] rounded-sm pl-9 pr-4 py-1.5 text-xs font-mono text-white placeholder:text-[#555] outline-none focus:border-accent-500 transition-colors w-64"
                            />
                        </div>
                    )}
                </header>

                {error && (
                    <div className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                        {error}
                    </div>
                )}

                <div className="flex-1 overflow-hidden flex">
                    {currentView === 'COMPOSE' ? (
                        /* Compose Area */
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#050505]">
                            <div className="max-w-4xl mx-auto bg-[#0A0A0A] border border-[#222] rounded-sm flex flex-col shadow-2xl overflow-hidden">
                                <div className="p-4 border-b border-[#222] bg-[#111]">
                                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#aaa]">
                                        <ShieldAlert size={14} className="text-accent-500" />
                                        <span>Communication Restricted To: {allowedRoles.join(', ')}</span>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col gap-6">
                                    <div className="flex flex-col gap-2 relative">
                                        <label className="text-[10px] font-mono text-[#888] uppercase tracking-widest">To (CodeNexus ID)</label>
                                        <div className="flex gap-4">
                                            <select
                                                value={composeTargetRole}
                                                onChange={(e) => setComposeTargetRole(e.target.value as Role)}
                                                className="w-1/4 bg-[#111] border border-[#333] outline-none p-3 text-sm font-mono text-white focus:border-accent-500 rounded-sm cursor-pointer"
                                            >
                                                {allowedRoles.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                            <div className="flex-1 relative">
                                                <input
                                                    type="text"
                                                    value={searchQuery || composeTo}
                                                    onChange={(e) => {
                                                        setComposeTo(e.target.value);
                                                        handleSearchRecipients(e.target.value);
                                                    }}
                                                    onFocus={(e) => {
                                                        if (e.target.value.length >= 2) {
                                                            handleSearchRecipients(e.target.value);
                                                        }
                                                    }}
                                                    placeholder="Search or enter CN-ID (e.g. CN-ADM-000)"
                                                    className="w-full bg-[#111] border border-[#333] outline-none p-3 text-sm font-mono text-white placeholder:text-[#444] rounded-sm focus:border-accent-500 transition-colors"
                                                />
                                                {recipientSearchResults.length > 0 && (
                                                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#111] border border-[#333] rounded-sm max-h-48 overflow-y-auto custom-scrollbar z-50">
                                                        {recipientSearchResults.map((result) => (
                                                            <button
                                                                key={result.cnid}
                                                                onClick={() => handleSelectRecipient(result)}
                                                                className="w-full px-4 py-2 text-left hover:bg-[#222] flex items-center justify-between border-b border-[#222] last:border-b-0"
                                                            >
                                                                <span className="text-sm font-mono text-white">{result.displayName}</span>
                                                                <span className={`text-[9px] font-mono px-1.5 py-0.5 border rounded-sm uppercase ${getRoleColor(result.role.toUpperCase() as Role)}`}>
                                                                    {result.role}
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                                {searchLoading && (
                                                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#111] border border-[#333] rounded-sm p-4 flex items-center justify-center">
                                                        <Loader2 className="w-4 h-4 text-accent-500 animate-spin" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-mono text-[#888] uppercase tracking-widest">Subject</label>
                                        <input
                                            type="text"
                                            value={composeSubject}
                                            onChange={(e) => setComposeSubject(e.target.value)}
                                            placeholder="Enter message subject"
                                            className="w-full bg-[#111] border border-[#333] outline-none p-3 text-sm font-sans font-bold text-white placeholder:text-[#444] rounded-sm focus:border-accent-500 transition-colors"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 flex-1">
                                        <label className="text-[10px] font-mono text-[#888] uppercase tracking-widest">Message</label>
                                        <textarea
                                            value={composeBody}
                                            onChange={(e) => setComposeBody(e.target.value)}
                                            placeholder="Type your message here..."
                                            className="w-full h-[300px] bg-[#111] border border-[#333] outline-none p-4 text-sm font-sans text-[#ccc] placeholder:text-[#444] rounded-sm focus:border-accent-500 transition-colors resize-none custom-scrollbar leading-relaxed"
                                        />
                                    </div>

                                    <div className="flex justify-end pt-4 border-t border-[#222]">
                                        <button
                                            onClick={handleSendEmail}
                                            disabled={!composeTo || !composeSubject || !composeBody || isSending}
                                            className="bg-white text-black px-8 py-3 font-mono font-bold uppercase tracking-widest text-[10px] hover:bg-accent-400 hover:text-white transition-colors flex items-center gap-2 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed group"
                                        >
                                            {isSending ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            )}
                                            {isSending ? 'Sending...' : 'Send Encrypted'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Inbox / Sent View */
                        <div className="flex-1 flex bg-[#050505] overflow-hidden">
                            {/* List */}
                            <div className="w-full h-full flex flex-col bg-[#0A0A0A]">
                                {isLoading ? (
                                    <div className="flex-1 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-accent-500 animate-spin" />
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-[#1a1a1a]">
                                        {displayList.map(mail => (
                                            <div
                                                key={mail.id}
                                                onClick={() => handleMailClick(mail)}
                                                className={`p-4 cursor-pointer hover:bg-[#111] transition-colors ${selectedMail?.id === mail.id ? 'bg-[#111] border-l-2 border-l-accent-500' : 'border-l-2 border-l-transparent'}`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        {!mail.read && currentView === 'INBOX' && <div className="w-2 h-2 rounded-full bg-accent-500"></div>}
                                                        <span className={`text-[9px] font-mono px-1.5 py-0.5 border rounded-sm tracking-widest uppercase ${getRoleColor(currentView === 'INBOX' ? mail.senderRole : mail.recipientRole)}`}>
                                                            {currentView === 'INBOX' ? mail.senderRole : mail.recipientRole}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] font-mono text-[#666]">{mail.timestamp}</span>
                                                </div>
                                                <div className="font-bold text-sm text-white mb-1 truncate">{currentView === 'INBOX' ? mail.senderName : `To: ${mail.recipientId}`}</div>
                                                <div className="font-sans font-semibold text-xs text-[#ccc] mb-2 truncate">{mail.subject}</div>
                                                <div className="font-sans text-xs text-[#666] line-clamp-2 leading-relaxed">{mail.body}</div>
                                            </div>
                                        ))}
                                        {displayList.length === 0 && (
                                            <div className="flex flex-col items-center justify-center p-12 text-[#555]">
                                                <MessageSquare size={32} className="mb-4 opacity-20" />
                                                <span className="text-[10px] font-mono uppercase tracking-widest">Folder Empty</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Viewer Modal */}
                            <AnimatePresence>
                            {selectedMail && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                                    onClick={() => setSelectedMail(null)}
                                >
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full max-w-4xl h-[85vh] bg-[#0A0A0A] border border-[#333] rounded-sm flex flex-col shadow-2xl overflow-hidden"
                                    >
                                        <div className="p-6 border-b border-[#222] bg-[#111] flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <h2 className="text-xl lg:text-3xl font-bold font-sans text-white mb-6 tracking-tight">{selectedMail.subject}</h2>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-[#1a1a1a] border border-[#333] rounded-full flex items-center justify-center">
                                                            <User size={18} className="text-[#888]" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm text-white flex items-center gap-2">
                                                                {selectedMail.senderName}
                                                                <span className={`text-[9px] font-mono px-1.5 py-0.5 border rounded-sm tracking-widest uppercase ${getRoleColor(selectedMail.senderRole)}`}>
                                                                    {selectedMail.senderRole}
                                                                </span>
                                                            </div>
                                                            <div className="text-[10px] font-mono text-[#666] mt-1">
                                                                From: <span className="text-[#aaa]">{selectedMail.senderId}</span> • To: <span className="text-[#aaa]">{currentView === 'INBOX' ? 'Me' : selectedMail.recipientId}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-[10px] font-mono text-[#555] whitespace-nowrap">
                                                        {selectedMail.timestamp}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSelectedMail(null)}
                                                className="p-2 text-[#666] hover:text-white hover:bg-[#222] border border-[#333] rounded-sm transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 bg-[#050505]">
                                            <div className="max-w-3xl font-sans text-[#ccc] whitespace-pre-wrap leading-[1.8] text-sm md:text-base">
                                                {selectedMail.body}
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                            </AnimatePresence>
                        </div>
                    )}
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
}