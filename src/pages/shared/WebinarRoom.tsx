import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff,
    Hand, MessageSquare, Users, Send, Settings, MoreVertical,
    User, ChevronLeft, Volume2, Maximize, Check, XCircle
} from 'lucide-react';

/* ────────── Types & Mock Data ────────── */
export type WebinarRole = 'COMPANY' | 'STUDENT';

interface ChatMessage {
    id: string;
    sender: string;
    role: WebinarRole;
    text: string;
    timestamp: string;
}

interface Participant {
    id: string;
    name: string;
    role: WebinarRole;
    isMicOn: boolean;
    isVideoOn: boolean;
    handRaised: boolean;
    permissionGranted: boolean;
}

const initialParticipants: Participant[] = [
    { id: '1', name: 'Google Presenter (Host)', role: 'COMPANY', isMicOn: true, isVideoOn: true, handRaised: false, permissionGranted: true },
    { id: '2', name: 'Devansh Behl (You)', role: 'STUDENT', isMicOn: false, isVideoOn: false, handRaised: false, permissionGranted: false },
    { id: '3', name: 'Kavya Iyer', role: 'STUDENT', isMicOn: false, isVideoOn: false, handRaised: false, permissionGranted: false },
    { id: '4', name: 'Rahul Sharma', role: 'STUDENT', isMicOn: false, isVideoOn: false, handRaised: true, permissionGranted: false },
    { id: '5', name: 'Priya Patel', role: 'STUDENT', isMicOn: true, isVideoOn: false, handRaised: false, permissionGranted: true },
];

const initialChat: ChatMessage[] = [
    { id: 'c1', sender: 'Google Presenter (Host)', role: 'COMPANY', text: 'Welcome everyone! We will start in 2 minutes.', timestamp: '14:00' },
    { id: 'c2', sender: 'Rahul Sharma', role: 'STUDENT', text: 'Hi, will there be a Q&A session?', timestamp: '14:02' },
    { id: 'c3', sender: 'Google Presenter (Host)', role: 'COMPANY', text: 'Yes, we will reserve the last 15 minutes for Q&A.', timestamp: '14:03' },
];

interface WebinarRoomProps {
    userRole: WebinarRole;
}

export default function WebinarRoom({ userRole }: WebinarRoomProps) {
    const navigate = useNavigate();
    
    // UI State
    const [activeSidebarTab, setActiveSidebarTab] = useState<'CHAT' | 'PARTICIPANTS'>('CHAT');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    // Media State
    const [isMicOn, setIsMicOn] = useState(userRole === 'COMPANY');
    const [isVideoOn, setIsVideoOn] = useState(userRole === 'COMPANY');
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isHandRaised, setIsHandRaised] = useState(false);
    
    // Room Data State
    const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
    const [chat, setChat] = useState<ChatMessage[]>(initialChat);
    const [chatInput, setChatInput] = useState('');

    // Current User Logic
    // If the active user is a student, we find themselves in the mock array. For demo, we assume ID '2' is the student viewer if userRole is student.
    const myParticipantData = userRole === 'STUDENT' ? participants.find(p => p.id === '2') : participants.find(p => p.id === '1');
    const hasPermissionToSpeak = userRole === 'COMPANY' || myParticipantData?.permissionGranted === true;

    // Handle Mic Toggle
    const handleToggleMic = () => {
        if (!hasPermissionToSpeak) return;
        setIsMicOn(!isMicOn);
    };

    // Handle Video Toggle
    const handleToggleVideo = () => {
        if (!hasPermissionToSpeak) return;
        setIsVideoOn(!isVideoOn);
    };

    // Handle Raise Hand
    const handleRaiseHand = () => {
        if (userRole === 'COMPANY') return;
        setIsHandRaised(!isHandRaised);
        
        // Update mock participant list
        setParticipants(prev => prev.map(p => p.id === '2' ? { ...p, handRaised: !isHandRaised } : p));
    };

    // Handle Send Chat
    const handleSendChat = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        
        const newMsg: ChatMessage = {
            id: Math.random().toString(),
            sender: userRole === 'COMPANY' ? 'Google Presenter (Host)' : 'Devansh Behl (You)',
            role: userRole,
            text: chatInput,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setChat([...chat, newMsg]);
        setChatInput('');
    };

    // Host Functions (Company Only)
    const grantPermission = (participantId: string) => {
        if (userRole !== 'COMPANY') return;
        setParticipants(prev => prev.map(p => 
            p.id === participantId 
                ? { ...p, permissionGranted: true, handRaised: false } 
                : p
        ));
    };
    
    const revokePermission = (participantId: string) => {
        if (userRole !== 'COMPANY') return;
        setParticipants(prev => prev.map(p => 
            p.id === participantId 
                ? { ...p, permissionGranted: false, isMicOn: false, isVideoOn: false } 
                : p
        ));
    };

    // End / Leave Call
    const handleLeaveCall = () => {
        if (userRole === 'COMPANY') {
            navigate('/company/ppt');
        } else {
            navigate('/student/dashboard');
        }
    };

    return (
        <div className="h-screen w-full bg-[#050505] flex flex-col font-sans text-white overflow-hidden relative">
            {/* Topbar */}
            <header className="h-14 bg-[#0A0A0A] border-b border-[#222] flex items-center justify-between px-6 shrink-0 z-20 shadow-sm relative">
                <div className="flex items-center gap-4 border-r border-[#222] pr-6">
                    <button 
                        onClick={handleLeaveCall}
                        className="text-[#888] hover:text-white transition-colors p-1 bg-[#111] border border-[#333] rounded-sm"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <div className="flex items-center gap-2 text-accent-500 font-bold italic font-serif opacity-50 pointer-events-none">
                        <span>{'<'}</span>cn/<span>{'>'}</span>
                    </div>
                </div>
                
                <div className="flex-1 px-6 flex items-center gap-4">
                    <div className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold tracking-widest uppercase flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span> LIVE
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-white tracking-widest uppercase">Google SDE 1 Roles & Technical Deep Dive</h1>
                        <p className="text-[10px] font-mono text-[#888]">Pre-Placement Talk • 1:45:20 Elapsed</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="text-[#888] hover:text-white transition-colors" title="Audio Settings"><Volume2 size={16}/></button>
                    <button className="text-[#888] hover:text-white transition-colors" title="Fullscreen"><Maximize size={16}/></button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden relative">
                
                {/* Stages Area (Video View) */}
                <main className="flex-1 p-4 md:p-6 flex flex-col items-center justify-center bg-[#050505] relative z-10">
                    <div className="w-full max-w-6xl h-full flex flex-col gap-4">
                        
                        {/* Primary Presenter Stage */}
                        <div className="flex-1 bg-[#0A0A0A] border rounded-sm border-[#222] relative overflow-hidden group shadow-2xl flex flex-col">
                            {/* Mock Video Feed / Screen Share */}
                            <div className={`absolute inset-0 bg-gradient-to-b from-[#111] to-[#0A0A0A] flex flex-col items-center justify-center ${isScreenSharing ? 'border-2 border-accent-500/50' : ''}`}>
                                {isScreenSharing ? (
                                    <>
                                        <MonitorUp size={64} className="text-accent-500/20 mb-4" />
                                        <h2 className="text-xl font-mono text-accent-500 uppercase tracking-widest font-bold">Screen Sharing is Active</h2>
                                        <p className="text-sm text-[#888] mt-2">Displaying Presentation Deck</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-32 h-32 rounded-full border border-[#333] bg-[#1a1a1a] flex items-center justify-center mb-6 shadow-inner">
                                            <User size={48} className="text-[#555]" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white tracking-tight">Google Presenter (Host)</h2>
                                        <p className="text-sm text-[#888] mt-2 font-mono uppercase tracking-widest">Company Recruiter</p>
                                    </>
                                )}
                            </div>
                            
                            {/* Video Controls Overlay */}
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-sm border border-white/10 flex items-center gap-2">
                                {isScreenSharing && <MonitorUp size={12} className="text-accent-500" />}
                                <span className="text-[10px] font-mono text-white tracking-widest">{isScreenSharing ? 'Screen Share' : 'Main Camera'}</span>
                            </div>
                        </div>
                        
                        {/* Secondary Viewers Stage (Mock thumbnails) */}
                        <div className="h-32 shrink-0 flex gap-4 overflow-x-auto custom-scrollbar">
                            {participants.filter(p => p.role !== 'COMPANY' && p.permissionGranted).map(p => (
                                <div key={p.id} className="w-48 h-full bg-[#0A0A0A] border border-[#222] rounded-sm relative overflow-hidden flex items-center justify-center">
                                    <User size={24} className="text-[#444]" />
                                    <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded-sm border border-white/10 flex items-center gap-2">
                                        <span className="text-[9px] font-mono text-white truncate max-w-[100px]">{p.name}</span>
                                        {p.isMicOn ? <Mic size={10} className="text-green-400" /> : <MicOff size={10} className="text-red-400" />}
                                    </div>
                                </div>
                            ))}
                            {/* Empty states to fill row */}
                            {[1, 2, 3].map(i => (
                                <div key={`empty-${i}`} className="w-48 h-full bg-[#0A0A0A]/50 border border-[#222] border-dashed rounded-sm flex items-center justify-center opacity-30">
                                    <User size={24} className="text-[#333]" />
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                {/* Right Sidebar (Chat & Participants) */}
                <AnimatePresence>
                    {isSidebarOpen && (
                        <motion.aside 
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 340, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="h-full bg-[#0A0A0A] border-l border-[#222] flex flex-col shrink-0 z-20"
                        >
                            {/* Tabs */}
                            <div className="flex border-b border-[#222]">
                                <button 
                                    onClick={() => setActiveSidebarTab('CHAT')}
                                    className={`flex-1 py-4 text-xs font-mono uppercase tracking-widest font-bold transition-colors border-b-2 flex items-center justify-center gap-2
                                        ${activeSidebarTab === 'CHAT' ? 'text-accent-400 border-accent-500 bg-[#111]' : 'text-[#888] border-transparent hover:bg-[#111] hover:text-white'}`}
                                >
                                    <MessageSquare size={14} /> Chat
                                </button>
                                <button 
                                    onClick={() => setActiveSidebarTab('PARTICIPANTS')}
                                    className={`flex-1 py-4 text-xs font-mono uppercase tracking-widest font-bold transition-colors border-b-2 flex items-center justify-center gap-2
                                        ${activeSidebarTab === 'PARTICIPANTS' ? 'text-accent-400 border-accent-500 bg-[#111]' : 'text-[#888] border-transparent hover:bg-[#111] hover:text-white'}`}
                                >
                                    <Users size={14} /> People ({participants.length})
                                </button>
                            </div>

                            {/* Sidebar Content */}
                            <div className="flex-1 overflow-hidden relative">
                                
                                {/* --- CHAT TAB --- */}
                                {activeSidebarTab === 'CHAT' && (
                                    <div className="absolute inset-0 flex flex-col">
                                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
                                            {chat.map(msg => (
                                                <div key={msg.id} className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs font-bold ${msg.role === 'COMPANY' ? 'text-accent-400' : 'text-white'}`}>
                                                            {msg.sender}
                                                        </span>
                                                        <span className="text-[9px] font-mono text-[#666]">{msg.timestamp}</span>
                                                    </div>
                                                    <div className="text-sm text-[#ccc] leading-relaxed break-words bg-[#111] p-3 rounded-sm border border-[#222]">
                                                        {msg.text}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <form onSubmit={handleSendChat} className="p-4 border-t border-[#222] bg-[#111] flex gap-2">
                                            <input 
                                                type="text" 
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                placeholder="Type message to everyone..."
                                                className="flex-1 bg-[#1a1a1a] border border-[#333] outline-none px-3 py-2 text-sm font-sans text-white placeholder:text-[#555] rounded-sm focus:border-accent-500 transition-colors"
                                            />
                                            <button 
                                                type="submit"
                                                disabled={!chatInput.trim()}
                                                className="bg-accent-500 text-black p-2 rounded-sm disabled:opacity-50 hover:bg-accent-400 transition-colors shrink-0"
                                            >
                                                <Send size={16} />
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {/* --- PARTICIPANTS TAB --- */}
                                {activeSidebarTab === 'PARTICIPANTS' && (
                                    <div className="absolute inset-0 flex flex-col overflow-y-auto custom-scrollbar p-4 gap-2">
                                        {/* Group by Roles / Status */}
                                        <div className="text-[10px] font-mono text-[#555] uppercase tracking-widest mt-2 mb-1 pl-1 border-b border-[#222] pb-1">Host</div>
                                        {participants.filter(p => p.role === 'COMPANY').map(p => (
                                            <div key={p.id} className="flex items-center justify-between bg-[#111] border border-[#222] p-3 rounded-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-accent-500/20 text-accent-400 flex items-center justify-center font-bold text-xs">C</div>
                                                    <div>
                                                        <p className="text-xs font-bold text-white">{p.name}</p>
                                                        <p className="text-[9px] font-mono text-[#888] uppercase">Host</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {p.isMicOn ? <Mic size={14} className="text-green-400"/> : <MicOff size={14} className="text-red-400"/>}
                                                    {p.isVideoOn ? <Video size={14} className="text-green-400"/> : <VideoOff size={14} className="text-red-400"/>}
                                                </div>
                                            </div>
                                        ))}

                                        <div className="text-[10px] font-mono text-[#555] uppercase tracking-widest mt-6 mb-1 pl-1 border-b border-[#222] pb-1">Students</div>
                                        {participants.filter(p => p.role === 'STUDENT').map(p => (
                                            <div key={p.id} className="flex items-center justify-between bg-[#111] border border-[#222] p-3 rounded-sm group">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-8 h-8 rounded-full bg-[#222] text-[#888] flex items-center justify-center shrink-0">
                                                        <User size={14} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-white truncate pr-2">{p.name}</p>
                                                        <div className="flex gap-1 mt-0.5">
                                                            {p.handRaised && <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[8px] px-1 py-0.5 uppercase tracking-wider rounded-sm font-mono flex items-center gap-1"><Hand size={8}/> Raised</span>}
                                                            {p.permissionGranted && <span className="bg-green-500/10 text-green-500 border border-green-500/20 text-[8px] px-1 py-0.5 uppercase tracking-wider rounded-sm font-mono">Speaker</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <div className="flex gap-2">
                                                        {p.isMicOn ? <Mic size={14} className="text-green-400"/> : <MicOff size={14} className="text-[#444]"/>}
                                                    </div>
                                                    
                                                    {/* Company Override Controls */}
                                                    {userRole === 'COMPANY' && (
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-2 border-l border-[#333] pl-2">
                                                            {!p.permissionGranted ? (
                                                                <button onClick={() => grantPermission(p.id)} title="Grant Mic/Cam Access" className="p-1 text-[#888] hover:text-green-400 hover:bg-[#222] rounded-sm transition-colors">
                                                                    <Check size={14} />
                                                                </button>
                                                            ) : (
                                                                <button onClick={() => revokePermission(p.id)} title="Revoke Access" className="p-1 text-[#888] hover:text-red-400 hover:bg-[#222] rounded-sm transition-colors">
                                                                    <XCircle size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Dock Control Bar */}
            <div className="h-20 bg-[#0A0A0A] border-t border-[#222] shrink-0 z-30 flex items-center justify-between px-6 lg:px-12 shadow-2xl relative">
                
                {/* Left Side Info */}
                <div className="hidden lg:flex flex-col gap-1 w-64">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#888]">{userRole} MODE</span>
                    {userRole === 'STUDENT' && !hasPermissionToSpeak && (
                        <span className="text-[9px] text-red-400 font-mono tracking-wider">Audio/Video Disabled by Host</span>
                    )}
                </div>

                {/* Center Core Controls */}
                <div className="flex-1 flex justify-center items-center gap-3 md:gap-4">
                    
                    {/* Mic Button */}
                    <button 
                        onClick={handleToggleMic}
                        disabled={!hasPermissionToSpeak}
                        title={!hasPermissionToSpeak ? "Mic strictly disabled by host" : (isMicOn ? "Turn Off Mic" : "Turn On Mic")}
                        className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all ${
                            !hasPermissionToSpeak 
                                ? 'bg-[#111] text-[#333] border border-[#222] cursor-not-allowed'
                                : (isMicOn 
                                    ? 'bg-[#222] text-white hover:bg-[#333] border border-[#444]' 
                                    : 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                                )
                        }`}
                    >
                        {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                    </button>

                    {/* Camera Button */}
                    <button 
                        onClick={handleToggleVideo}
                        disabled={!hasPermissionToSpeak}
                        title={!hasPermissionToSpeak ? "Camera strictly disabled by host" : (isVideoOn ? "Turn Off Camera" : "Turn On Camera")}
                        className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all ${
                            !hasPermissionToSpeak 
                                ? 'bg-[#111] text-[#333] border border-[#222] cursor-not-allowed'
                                : (isVideoOn 
                                    ? 'bg-[#222] text-white hover:bg-[#333] border border-[#444]' 
                                    : 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                                )
                        }`}
                    >
                        {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
                    </button>

                    {/* Determine Specific Role Buttons */}
                    {userRole === 'COMPANY' && (
                        <button 
                            onClick={() => setIsScreenSharing(!isScreenSharing)}
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all border ${
                                isScreenSharing 
                                    ? 'bg-accent-500 text-black border-accent-400 hover:bg-accent-400 shadow-[0_0_15px_rgba(var(--accent-500),0.3)]' 
                                    : 'bg-[#222] text-white border-[#444] hover:bg-[#333]'
                            }`}
                        >
                            <MonitorUp size={20} />
                        </button>
                    )}

                    {userRole === 'STUDENT' && (
                        <button 
                            onClick={handleRaiseHand}
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all border ${
                                isHandRaised 
                                    ? 'bg-yellow-500 text-black border-yellow-400 hover:bg-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]' 
                                    : 'bg-[#222] text-white border-[#444] hover:bg-[#333]'
                            }`}
                        >
                            <Hand size={20} />
                        </button>
                    )}

                    {/* End Call / Leave Button */}
                    <button 
                        onClick={handleLeaveCall}
                        className="w-16 h-12 md:w-20 md:h-14 rounded-3xl bg-red-600 text-white flex items-center justify-center hover:bg-red-500 transition-colors shadow-[0_0_20px_rgba(220,38,38,0.2)] ml-4 border border-red-400"
                    >
                        <PhoneOff size={20} />
                    </button>
                </div>

                {/* Right Side Options */}
                <div className="hidden lg:flex justify-end gap-3 w-64">
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border ${
                            isSidebarOpen ? 'bg-accent-500/20 text-accent-400 border-accent-500/30' : 'bg-[#111] text-[#888] border-[#333] hover:text-white hover:bg-[#222]'
                        }`}
                    >
                        <MessageSquare size={16} />
                    </button>
                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[#111] text-[#888] border border-[#333] hover:text-white hover:bg-[#222] transition-colors">
                        <Settings size={16} />
                    </button>
                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[#111] text-[#888] border border-[#333] hover:text-white hover:bg-[#222] transition-colors">
                        <MoreVertical size={16} />
                    </button>
                </div>
            </div>

            {/* Global Custom Scrollbar Styles */}
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
