import React, { useState, useEffect } from 'react';
import { userApi } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Terminal, FileText, Mail, Presentation, LogOut, ChevronLeft, ChevronRight,
    Code2, Briefcase, PenTool, Box, User, Edit2, X, Save
} from 'lucide-react';

interface ProfileData {
    name: string;
    age: string;
    email: string;
    number: string;
    gender: string;
    branch: string;
    registrationNumber: string;
    codeNexusId: string;
    parentsName: string;
    parentContactNo: string;
    parentEmail: string;
    address: string;
    currentCgpa: string;
    institute: string;
    xSchool: string;
    xPercentage: string;
    xiiSchool: string;
    xiiPercentage: string;
    otherInfo: string;
}

export default function StudentProfile() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isNewProfile, setIsNewProfile] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [universities, setUniversities] = useState<{id: string, name: string}[]>([]);
    
    const [profile, setProfile] = useState<ProfileData>({
        name: '',
        age: '',
        email: '',
        number: '',
        gender: '',
        branch: '',
        registrationNumber: '',
        codeNexusId: '',
        parentsName: '',
        parentContactNo: '',
        parentEmail: '',
        address: '',
        currentCgpa: '',
        institute: '',
        xSchool: '',
        xPercentage: '',
        xiiSchool: '',
        xiiPercentage: '',
        otherInfo: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Fetch available universities
                userApi.getUniversities().then(res => setUniversities(res.data)).catch(console.error);

                const res = await userApi.getMe();
                const data = res.data;
                setUserEmail(data.email);
                if (data.profile) {
                    const p = data.profile;
                    setProfile({
                        name: p.name || '',
                        age: p.age?.toString() || '',
                        email: data.email || '',
                        number: p.phone || '',
                        gender: p.gender || '',
                        branch: p.branch || '',
                        registrationNumber: p.registrationNumber || '',
                        codeNexusId: p.codeNexusId || '',
                        parentsName: p.parentsName || '',
                        parentContactNo: p.parentContactNo || '',
                        parentEmail: p.parentEmail || '',
                        address: p.address || '',
                        currentCgpa: p.cgpa?.toString() || '',
                        institute: p.universityId || '',
                        xSchool: p.xSchool || '',
                        xPercentage: p.xPercentage || '',
                        xiiSchool: p.xiiSchool || '',
                        xiiPercentage: p.xiiPercentage || '',
                        otherInfo: p.otherInfo || '',
                    });
                } else {
                    setIsNewProfile(true);
                }
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const [editForm, setEditForm] = useState<ProfileData>({ ...profile });

    const sidebarItems: { icon: any, label: string, onClick: () => void, active?: boolean }[] = [
        { icon: Mail, label: 'MAIL', onClick: () => window.location.href = '/student/mail' },
        { icon: Presentation, label: 'WEBINARS', onClick: () => window.location.href = '/student/webinars' },
        { icon: Terminal, label: 'CMD CENTER', onClick: () => window.location.href = '/student/dashboard' },
        { icon: Code2, label: 'CODE ARENA', onClick: () => window.location.href = '/student/codearena' },
        { icon: PenTool, label: 'DESIGN ARENA', onClick: () => window.location.href = '/student/designarena' },
        { icon: Briefcase, label: 'INTERVIEWS', onClick: () => window.location.href = '/student/interview' },
        { icon: FileText, label: 'PROFILE', onClick: () => window.location.href = '/student/profile' },
        { icon: Box, label: 'PROJECTS', onClick: () => window.location.href = '/student/projects' },
    ];

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload: any = {
                name: editForm.name,
                universityId: editForm.institute || undefined,
                age: editForm.age ? parseInt(editForm.age) || undefined : undefined,
                phone: editForm.number || undefined,
                branch: editForm.branch,
                cgpa: editForm.currentCgpa ? parseFloat(editForm.currentCgpa) || undefined : undefined,
                gender: editForm.gender || undefined,
                registrationNumber: editForm.registrationNumber || undefined,
                parentsName: editForm.parentsName || undefined,
                parentContactNo: editForm.parentContactNo || undefined,
                parentEmail: editForm.parentEmail || undefined,
                address: editForm.address || undefined,
                xSchool: editForm.xSchool || undefined,
                xPercentage: editForm.xPercentage || undefined,
                xiiSchool: editForm.xiiSchool || undefined,
                xiiPercentage: editForm.xiiPercentage || undefined,
                otherInfo: editForm.otherInfo || undefined,
            };
            
            if (isNewProfile) {
                await userApi.createStudentProfile(payload);
                setIsNewProfile(false);
            } else {
                await userApi.updateStudentProfile(payload);
            }

            // Remove signup guard if it exists
            if (localStorage.getItem('cn_signup_session')) {
                localStorage.removeItem('cn_signup_session');
                // Optional: navigate away from profile since they just completed boarding
                window.location.href = '/student/dashboard';
            }

            setProfile(editForm);
            setIsEditModalOpen(false);
        } catch (err: any) {
            console.error('Failed to save profile:', err);
            alert(err.message || 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="h-screen w-full bg-[#050505] font-sans text-white selection:bg-accent-500/30 selection:text-white relative overflow-hidden flex">
            {/* Background Dots */}
            <div className="fixed inset-0 pointer-events-none z-0 dotted-bg"></div>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 240 : 70 }}
                className="h-screen bg-[#0A0A0A] border-r border-[#222] flex flex-col relative shrink-0 z-20"
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
                            onClick={item.onClick}
                            className={`flex items-center px-3 py-2.5 rounded-sm transition-all duration-200 group relative
                                ${item.active
                                    ? 'bg-[#111] border border-[#333] border-l-2 border-l-accent-500 text-white'
                                    : 'border border-transparent text-[#888] hover:bg-[#111] hover:border-[#222] hover:text-white'
                                }`}
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
                </div>

                {/* User Profile Mini */}
                <div className="p-4 border-t border-[#222]">
                    <div className="flex items-center group cursor-pointer bg-[#111] p-2 rounded-sm border border-[#333] transition-colors shadow-[0_0_10px_rgba(255,255,255,0.05)]">
                        <div className="w-8 h-8 rounded-sm bg-[#1a1a1a] border border-accent-500/30 flex items-center justify-center text-accent-400 font-mono text-xs font-bold shrink-0">
                            {profile.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
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
                                        <p className="text-xs font-mono text-white whitespace-nowrap uppercase tracking-wider">{profile.name}</p>
                                        <p className="text-[10px] font-mono text-accent-500 whitespace-nowrap">STUDENT</p>
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
                                PROFILE STATUS: COMPLETE
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight uppercase">
                                <span className="text-accent-400 font-serif italic">Student</span> Profile
                            </h1>
                            <p className="text-[#888] font-mono text-xs mt-2">
                                /home/students/devansh_behl/profile
                            </p>
                        </div>

                        <div className="flex gap-4">
                            {/* Actions can go here if needed, edit button moved to floating bottom right CTA */}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Profile Overview Card */}
                        <div className="bg-[#0A0A0A] border border-[#222] p-6 rounded-sm group hover:border-[#333] transition-colors relative overflow-hidden md:col-span-2 flex flex-col md:flex-row items-center gap-8">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#111] group-hover:bg-accent-500 transition-colors"></div>
                            <div className="w-32 h-32 rounded-full border border-[#333] bg-[#111] flex flex-shrink-0 items-center justify-center text-4xl text-accent-500 font-mono tracking-tight font-black uppercase shadow-2xl">
                                {profile.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-3xl font-sans font-bold text-white tracking-tight uppercase mb-2">
                                    {profile.name}
                                </h2>
                                <p className="text-[#888] font-mono mb-4 text-sm tracking-widest uppercase">{profile.email}</p>
                                
                                <div className="flex flex-wrap gap-4 mt-2">
                                    <div className="bg-[#111] border border-[#333] px-3 py-1.5 rounded-sm flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-accent-500 rounded-full"></div>
                                        <span className="text-[10px] font-mono text-white uppercase tracking-widest">ID: {profile.codeNexusId}</span>
                                    </div>
                                    <div className="bg-[#111] border border-[#333] px-3 py-1.5 rounded-sm flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-[#888] rounded-full"></div>
                                        <span className="text-[10px] font-mono text-[#888] uppercase tracking-widest">Reg: {profile.registrationNumber}</span>
                                    </div>
                                    <div className="bg-[#111] border border-[#333] px-3 py-1.5 rounded-sm flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                        <span className="text-[10px] font-mono text-green-400 uppercase tracking-widest">CGPA: {profile.currentCgpa}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Basic Details */}
                        <div className="bg-[#0A0A0A] border border-[#222] p-6 rounded-sm">
                            <h3 className="text-sm font-bold font-sans uppercase tracking-widest text-[#888] border-b border-[#222] pb-4 mb-6 flex items-center gap-2">
                                <User size={16} /> Basic Information
                            </h3>
                            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                <div>
                                    <label className="text-[9px] font-mono text-[#555] uppercase tracking-widest block mb-1">Age</label>
                                    <div className="text-sm font-sans font-semibold text-white">{profile.age}</div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono text-[#555] uppercase tracking-widest block mb-1">Gender</label>
                                    <div className="text-sm font-sans font-semibold text-white">{profile.gender}</div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono text-[#555] uppercase tracking-widest block mb-1">Contact No</label>
                                    <div className="text-sm font-sans font-semibold text-white">{profile.number}</div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono text-[#555] uppercase tracking-widest block mb-1">Branch</label>
                                    <div className="text-sm font-sans font-semibold text-white">{profile.branch}</div>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[9px] font-mono text-[#555] uppercase tracking-widest block mb-1">Address</label>
                                    <div className="text-sm font-sans text-white border-l-2 border-[#333] pl-3 py-1">{profile.address}</div>
                                </div>
                            </div>
                        </div>

                        {/* Educational Details */}
                        <div className="bg-[#0A0A0A] border border-[#222] p-6 rounded-sm">
                            <h3 className="text-sm font-bold font-sans uppercase tracking-widest text-[#888] border-b border-[#222] pb-4 mb-6 flex items-center gap-2">
                                <Terminal size={16} /> Educational Details
                            </h3>
                            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                <div className="col-span-2">
                                    <label className="text-[9px] font-mono text-[#555] uppercase tracking-widest block mb-1">Institute</label>
                                    <div className="text-sm font-sans font-semibold text-white">{universities.find(u => u.id === profile.institute)?.name || profile.institute}</div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono text-[#555] uppercase tracking-widest block mb-1">X Board</label>
                                    <div className="text-xs font-sans font-semibold text-white mb-1">{profile.xSchool}</div>
                                    <div className="text-[10px] font-mono text-accent-400">{profile.xPercentage}</div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono text-[#555] uppercase tracking-widest block mb-1">XII Board</label>
                                    <div className="text-xs font-sans font-semibold text-white mb-1">{profile.xiiSchool}</div>
                                    <div className="text-[10px] font-mono text-accent-400">{profile.xiiPercentage}</div>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[9px] font-mono text-[#555] uppercase tracking-widest block mb-1">Other Info</label>
                                    <div className="text-xs font-mono text-[#888] bg-[#111] p-3 border border-[#333] rounded-sm">{profile.otherInfo}</div>
                                </div>
                            </div>
                        </div>

                        {/* Parental Info */}
                        <div className="bg-[#0A0A0A] border border-[#222] p-6 rounded-sm md:col-span-2">
                            <h3 className="text-sm font-bold font-sans uppercase tracking-widest text-[#888] border-b border-[#222] pb-4 mb-6 flex items-center gap-2">
                                <Briefcase size={16} /> Parental Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-6">
                                <div>
                                    <label className="text-[9px] font-mono text-[#555] uppercase tracking-widest block mb-1">Parent's Name</label>
                                    <div className="text-sm font-sans font-semibold text-white">{profile.parentsName}</div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono text-[#555] uppercase tracking-widest block mb-1">Contact Number</label>
                                    <div className="text-sm font-sans font-semibold text-white">{profile.parentContactNo}</div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono text-[#555] uppercase tracking-widest block mb-1">Email Address</label>
                                    <div className="text-sm font-sans font-semibold text-white">{profile.parentEmail}</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Floating Edit Button */}
                <button
                    onClick={() => {
                        setEditForm({ ...profile });
                        setIsEditModalOpen(true);
                    }}
                    className="fixed bottom-8 right-8 z-40 bg-[#e0e0e0] text-black px-5 py-3 font-bold hover:bg-white border border-transparent focus:outline-none transition-all text-sm font-mono uppercase tracking-widest flex items-center gap-2 group shadow-2xl rounded-sm hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                    <Edit2 size={16} className="group-hover:rotate-12 transition-transform" />
                    <span>Edit Details</span>
                </button>
            </main>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050505]/90 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#0A0A0A] border border-[#333] rounded-sm w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-[#222] bg-[#111]">
                                <h2 className="text-lg font-bold uppercase tracking-widest font-mono text-white flex items-center gap-3">
                                    <Edit2 size={18} className="text-accent-500" /> Edit Profile Records
                                </h2>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="text-[#888] hover:text-white transition-colors bg-[#1a1a1a] p-2 rounded-sm hover:bg-[#333]"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8 bg-[#050505] inset-shadow">
                                {/* Form sections */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-mono text-accent-500 tracking-widest uppercase mb-2 flex items-center gap-2">
                                        <div className="w-1 h-1 bg-accent-500 rounded-full"></div> Basic Info
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[9px] font-mono text-[#666] uppercase tracking-widest">Name</label>
                                            <input name="name" value={editForm.name} onChange={handleChange} className="bg-[#111] border border-[#333] p-2.5 text-xs text-white outline-none focus:border-accent-500 rounded-sm font-sans" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[9px] font-mono text-[#666] uppercase tracking-widest">Email</label>
                                            <input name="email" value={editForm.email} onChange={handleChange} className="bg-[#111] border border-[#333] p-2.5 text-xs text-white outline-none focus:border-accent-500 rounded-sm font-sans" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[9px] font-mono text-[#666] uppercase tracking-widest">Age</label>
                                            <input name="age" value={editForm.age} onChange={handleChange} className="bg-[#111] border border-[#333] p-2.5 text-xs text-white outline-none focus:border-accent-500 rounded-sm font-sans" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[9px] font-mono text-[#666] uppercase tracking-widest">Gender</label>
                                            <input name="gender" value={editForm.gender} onChange={handleChange} className="bg-[#111] border border-[#333] p-2.5 text-xs text-white outline-none focus:border-accent-500 rounded-sm font-sans" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[9px] font-mono text-[#666] uppercase tracking-widest">Contact Number</label>
                                            <input name="number" value={editForm.number} onChange={handleChange} className="bg-[#111] border border-[#333] p-2.5 text-xs text-white outline-none focus:border-accent-500 rounded-sm font-sans" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[9px] font-mono text-[#666] uppercase tracking-widest">Branch</label>
                                            <input name="branch" value={editForm.branch} onChange={handleChange} className="bg-[#111] border border-[#333] p-2.5 text-xs text-white outline-none focus:border-accent-500 rounded-sm font-sans" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[9px] font-mono text-[#666] uppercase tracking-widest">Registration Number</label>
                                            <input name="registrationNumber" value={editForm.registrationNumber} onChange={handleChange} className="bg-[#111] border border-[#333] p-2.5 text-xs text-white outline-none focus:border-accent-500 rounded-sm font-sans" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[9px] font-mono text-[#666] uppercase tracking-widest">Code Nexus ID</label>
                                            <input name="codeNexusId" value={editForm.codeNexusId} onChange={handleChange} className="bg-[#0A0A0A] border border-[#222] p-2.5 text-xs text-[#555] outline-none rounded-sm font-mono cursor-not-allowed" disabled />
                                        </div>
                                        <div className="flex flex-col gap-1.5 md:col-span-2">
                                            <label className="text-[9px] font-mono text-[#666] uppercase tracking-widest">Address</label>
                                            <textarea name="address" value={editForm.address} onChange={handleChange} rows={2} className="bg-[#111] border border-[#333] p-2.5 text-xs text-white outline-none focus:border-accent-500 rounded-sm custom-scrollbar font-sans" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-[#222]">
                                    <h3 className="text-[10px] font-mono text-accent-500 tracking-widest uppercase mb-2 flex items-center gap-2">
                                        <div className="w-1 h-1 bg-accent-500 rounded-full"></div> Educational Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[9px] font-mono text-[#666] uppercase tracking-widest">Institute</label>
                                            <select name="institute" value={editForm.institute} onChange={(e) => setEditForm(prev => ({...prev, institute: e.target.value}))} className="bg-[#111] border border-[#333] p-2.5 text-xs text-white outline-none focus:border-accent-500 rounded-sm font-sans appearance-none">
                                                <option value="" disabled>Select your university</option>
                                                {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[9px] font-mono text-[#666] uppercase tracking-widest">Current CGPA</label>
                                            <input name="currentCgpa" value={editForm.currentCgpa} onChange={handleChange} className="bg-[#111] border border-[#333] p-2.5 text-xs text-white outline-none focus:border-accent-500 rounded-sm font-sans" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[9px] font-mono text-[#666] uppercase tracking-widest">X School</label>
                                            <input name="xSchool" value={editForm.xSchool} onChange={handleChange} className="bg-[#111] border border-[#333] p-2.5 text-xs text-white outline-none focus:border-accent-500 rounded-sm font-sans" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[9px] font-mono text-[#666] uppercase tracking-widest">X Percentage</label>
                                            <input name="xPercentage" value={editForm.xPercentage} onChange={handleChange} className="bg-[#111] border border-[#333] p-2.5 text-xs text-white outline-none focus:border-accent-500 rounded-sm font-sans" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[9px] font-mono text-[#666] uppercase tracking-widest">XII School</label>
                                            <input name="xiiSchool" value={editForm.xiiSchool} onChange={handleChange} className="bg-[#111] border border-[#333] p-2.5 text-xs text-white outline-none focus:border-accent-500 rounded-sm font-sans" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[9px] font-mono text-[#666] uppercase tracking-widest">XII Percentage</label>
                                            <input name="xiiPercentage" value={editForm.xiiPercentage} onChange={handleChange} className="bg-[#111] border border-[#333] p-2.5 text-xs text-white outline-none focus:border-accent-500 rounded-sm font-sans" />
                                        </div>
                                        <div className="flex flex-col gap-1.5 md:col-span-2">
                                            <label className="text-[9px] font-mono text-[#666] uppercase tracking-widest">Other Info</label>
                                            <textarea name="otherInfo" value={editForm.otherInfo} onChange={handleChange} rows={2} className="bg-[#111] border border-[#333] p-2.5 text-xs text-white outline-none focus:border-accent-500 rounded-sm custom-scrollbar font-mono text-[#aaa]" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-[#222]">
                                    <h3 className="text-[10px] font-mono text-accent-500 tracking-widest uppercase mb-2 flex items-center gap-2">
                                        <div className="w-1 h-1 bg-accent-500 rounded-full"></div> Parental Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[9px] font-mono text-[#666] uppercase tracking-widest">Parent's Name</label>
                                            <input name="parentsName" value={editForm.parentsName} onChange={handleChange} className="bg-[#111] border border-[#333] p-2.5 text-xs text-white outline-none focus:border-accent-500 rounded-sm font-sans" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[9px] font-mono text-[#666] uppercase tracking-widest">Parent's Contact No</label>
                                            <input name="parentContactNo" value={editForm.parentContactNo} onChange={handleChange} className="bg-[#111] border border-[#333] p-2.5 text-xs text-white outline-none focus:border-accent-500 rounded-sm font-sans" />
                                        </div>
                                        <div className="flex flex-col gap-1.5 md:col-span-2">
                                            <label className="text-[9px] font-mono text-[#666] uppercase tracking-widest">Parent's Email</label>
                                            <input name="parentEmail" value={editForm.parentEmail} onChange={handleChange} className="bg-[#111] border border-[#333] p-2.5 text-xs text-white outline-none focus:border-accent-500 rounded-sm font-sans" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 border-t border-[#222] bg-[#111] flex justify-end gap-3 z-10 relative">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-widest border border-[#333] text-[#888] hover:text-white hover:border-[#666] rounded-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2.5 text-xs font-mono bg-accent-500 text-black hover:bg-white font-black uppercase tracking-widest rounded-sm transition-colors flex items-center gap-2 group"
                                >
                                    <Save size={14} className="group-hover:scale-110 transition-transform" /> Save Profile
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Global Custom Scrollbar Styles for monotonic harsh theme */}
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
