import { useState } from 'react';
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
    ShieldCheck
} from 'lucide-react';

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

const mockMails: Email[] = [
    {
        id: '1',
        senderId: 'CN-UNI-001',
        senderName: 'Placement Cell - IITB',
        senderRole: 'UNIVERSITY',
        recipientId: 'CN-STU-442',
        recipientName: 'Kavya Iyer',
        recipientRole: 'STUDENT',
        subject: 'Upcoming Amazon Drive - Important Details',
        body: 'Dear students, please ensure your resumes are updated on the portal by 11:59 PM tonight. Late submissions will not be considered for the Amazon SDE I drive.\n\nBest,\nPlacement Cell',
        timestamp: 'Mar 22, 10:30 AM',
        read: false
    },
    {
        id: '2',
        senderId: 'CN-COM-099',
        senderName: 'Jane Smith - Stripe',
        senderRole: 'COMPANY',
        recipientId: 'CN-UNI-001',
        recipientName: 'Placement Cell - IITB',
        recipientRole: 'UNIVERSITY',
        subject: 'Feedback regarding recent technical interviews',
        body: 'Hello Placement Team,\n\nWe have evaluated the candidates from yesterday. Overall, performance was exceptional. We will send the final offers via the evaluations portal by EOD.\n\nRegards,\nJane (Stripe HR)',
        timestamp: 'Mar 21, 04:15 PM',
        read: true
    },
    {
        id: '3',
        senderId: 'CN-ADM-000',
        senderName: 'CodeNexus Support',
        senderRole: 'CODENEXUS',
        recipientId: 'CN-UNI-001',
        recipientName: 'Placement Cell - IITB',
        recipientRole: 'UNIVERSITY',
        subject: 'Platform Maintenance Alert',
        body: 'The CodeNexus CodeArena will be offline for maintenance on Mar 24th from 2AM to 4AM IST. Please inform ongoing test administrators.',
        timestamp: 'Mar 20, 09:00 AM',
        read: true
    }
];

export default function Mail() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    // Default sub-route based on manual mapping or generic path checks.
    // For simplicity, we use a single component state here, but real routing might hook into params.
    const [currentView, setCurrentView] = useState<'INBOX' | 'SENT' | 'COMPOSE'>('INBOX');

    // MOCK LOGIN STATE: Simulate who is logged in right now to test constraints
    const [activeUserRole, setActiveUserRole] = useState<Role>('UNIVERSITY');
    const activeUserId = 'CN-UNI-001';
    const activeUserName = 'Placement Cell - IITB';

    // Composition State
    const [composeTo, setComposeTo] = useState('');
    const [composeTargetRole, setComposeTargetRole] = useState<Role>('CODENEXUS');
    const [composeSubject, setComposeSubject] = useState('');
    const [composeBody, setComposeBody] = useState('');

    // Mail State
    const [mails, setMails] = useState<Email[]>(mockMails);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMail, setSelectedMail] = useState<Email | null>(null);

    const sidebarItems = [
        { icon: Inbox, label: 'INBOX', view: 'INBOX' },
        { icon: Send, label: 'SENT', view: 'SENT' },
        { icon: PenSquare, label: 'COMPOSE', view: 'COMPOSE' },
    ];

    // Determine allowed recipients based on user role
    const getAllowedRecipientRoles = (role: Role): Role[] => {
        switch (role) {
            case 'STUDENT': return ['UNIVERSITY', 'CODENEXUS'];
            case 'UNIVERSITY': return ['STUDENT', 'COMPANY', 'CODENEXUS'];
            case 'COMPANY': return ['UNIVERSITY', 'STUDENT', 'RECRUITER', 'CODENEXUS'];
            case 'RECRUITER': return ['COMPANY', 'CODENEXUS'];
            case 'CODENEXUS': return ['STUDENT', 'UNIVERSITY', 'COMPANY', 'RECRUITER']; // System admin
            default: return ['CODENEXUS'];
        }
    };
    
    const allowedRoles = getAllowedRecipientRoles(activeUserRole);

    const handleSendEmail = () => {
        if (!composeTo.trim() || !composeSubject.trim() || !composeBody.trim()) return;

        const newMail: Email = {
            id: Math.random().toString(36).substr(2, 9),
            senderId: activeUserId,
            senderName: activeUserName,
            senderRole: activeUserRole,
            recipientId: composeTo,
            recipientName: `User (${composeTo})`,
            recipientRole: composeTargetRole,
            subject: composeSubject,
            body: composeBody,
            timestamp: 'Just now',
            read: false
        };

        setMails([newMail, ...mails]);
        setComposeTo('');
        setComposeSubject('');
        setComposeBody('');
        setCurrentView('SENT'); // Redirect to sent after sending
    };

    // Filter mails based on current view and user
    const displayList = mails.filter(m => {
        const isInbox = currentView === 'INBOX' && m.recipientId === activeUserId;
        const isSent = currentView === 'SENT' && m.senderId === activeUserId;
        const matchView = isInbox || isSent;
        
        const searchMatches = 
            m.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
            m.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.recipientName.toLowerCase().includes(searchQuery.toLowerCase());
            
        return matchView && searchMatches;
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
                    <div className="text-[10px] font-mono text-[#555] uppercase tracking-widest px-3 mb-2">Mailbox</div>
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
                    
                    {/* Role Switcher for Demo Purposes */}
                    <div className="mt-8 border-t border-[#222] pt-4">
                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="px-3"
                                >
                                    <div className="text-[10px] font-mono text-accent-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <ShieldCheck size={12}/> Demo Logic: Role
                                    </div>
                                    <select 
                                        value={activeUserRole}
                                        onChange={(e) => {
                                            setActiveUserRole(e.target.value as Role);
                                            setComposeTargetRole('CODENEXUS'); // Reset target
                                        }}
                                        className="w-full bg-[#111] border border-[#333] text-white text-xs p-2 rounded-sm outline-none cursor-pointer focus:border-accent-500"
                                    >
                                        <option value="STUDENT">Student</option>
                                        <option value="UNIVERSITY">University</option>
                                        <option value="COMPANY">Company</option>
                                        <option value="RECRUITER">Recruiter</option>
                                    </select>
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
                                            <input 
                                                type="text" 
                                                value={composeTo}
                                                onChange={(e) => setComposeTo(e.target.value)}
                                                placeholder="e.g. CN-ADM-000"
                                                className="flex-1 bg-[#111] border border-[#333] outline-none p-3 text-sm font-mono text-white placeholder:text-[#444] rounded-sm focus:border-accent-500 transition-colors"
                                            />
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
                                            disabled={!composeTo || !composeSubject || !composeBody}
                                            className="bg-white text-black px-8 py-3 font-mono font-bold uppercase tracking-widest text-[10px] hover:bg-accent-400 hover:text-white transition-colors flex items-center gap-2 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed group"
                                        >
                                            <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Send Encrypted
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Inbox / Sent View */
                        <div className="flex-1 flex bg-[#050505] overflow-hidden">
                            {/* List */ }
                            <div className={`w-full ${selectedMail ? 'hidden lg:flex w-[400px] border-r border-[#222]' : 'flex'} flex-col bg-[#0A0A0A]`}>
                                <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-[#1a1a1a]">
                                    {displayList.map(mail => (
                                        <div 
                                            key={mail.id} 
                                            onClick={() => setSelectedMail(mail)}
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
                            </div>

                            {/* Viewer */ }
                            {selectedMail && (
                                <div className="flex-1 flex flex-col bg-[#050505]">
                                    <div className="p-6 border-b border-[#222] bg-[#0A0A0A] flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <h2 className="text-xl lg:text-3xl font-bold font-sans text-white mb-6 tracking-tight">{selectedMail.subject}</h2>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-[#111] border border-[#333] rounded-full flex items-center justify-center">
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
                                            className="lg:hidden p-2 text-[#666] hover:text-white hover:bg-[#111] border border-[#333] rounded-sm transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
                                        <div className="max-w-3xl font-sans text-[#ccc] whitespace-pre-wrap leading-[1.8] text-sm md:text-base">
                                            {selectedMail.body}
                                        </div>
                                    </div>
                                </div>
                            )}
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
