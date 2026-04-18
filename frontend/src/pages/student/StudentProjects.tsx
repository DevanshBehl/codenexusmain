import { useState, useEffect } from 'react';
import { projectApi } from '../../lib/api';
import type { ProjectItem } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    Terminal, Users, FileText, CheckCircle2, MessageSquare, Briefcase, PenTool,
    Code2, Presentation, PlayCircle, Box, Plus, Github, ExternalLink, X, PlusCircle, Mail,
    Trophy, Play
} from 'lucide-react';

interface Project {
    id: string;
    title: string;
    description: string;
    techStack: string;
    githubLink?: string;
    liveLink?: string;
}

export default function StudentProjects() {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await projectApi.getMyProjects();
                setProjects((res.data as unknown as ProjectItem[]).map(p => ({
                    id: p.id,
                    title: p.title,
                    description: p.description,
                    techStack: p.techStack,
                    githubLink: p.githubLink || undefined,
                    liveLink: p.liveLink || undefined,
                })));
            } catch (err) {
                console.error('Failed to fetch projects:', err);
            }
        };
        fetchProjects();
    }, []);

    // Modal Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        techStack: '',
        githubLink: '',
        liveLink: ''
    });

    const [formErrors, setFormErrors] = useState({
        description: '',
        techStack: ''
    });

    const sidebarItems = [
        { icon: Mail, label: 'MAIL', onClick: () => navigate('/student/mail') },
        { icon: Presentation, label: 'WEBINARS', onClick: () => navigate('/student/webinars') },
        { icon: Terminal, label: 'CMD CENTER', onClick: () => navigate('/student/dashboard') },
        { icon: Code2, label: 'CODE ARENA', onClick: () => navigate('/student/codearena') },
        { icon: PenTool, label: 'DESIGN ARENA', onClick: () => navigate('/student/designarena') },
        { icon: Briefcase, label: 'INTERVIEWS', onClick: () => navigate('/student/interview') },
        { icon: Trophy, label: 'CONTEST', onClick: () => navigate('/student/contest') },
        { icon: FileText, label: 'PROFILE', onClick: () => window.location.href = '/student/profile' },
        { icon: Box, label: 'PROJECTS', active: true, onClick: () => navigate('/student/projects') },
        { icon: Play, label: 'RECORDING', onClick: () => navigate('/student/recording') },
    ];

    const getWordCount = (text: string) => text.trim().split(/\s+/).filter(word => word.length > 0).length;

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Basic real-time validation for word count constraints
        if (name === 'description') {
            const count = getWordCount(value);
            if (count > 200) {
                setFormErrors(prev => ({ ...prev, description: `Maximum 200 words allowed (${count}/200).` }));
            } else {
                setFormErrors(prev => ({ ...prev, description: '' }));
            }
        }
        if (name === 'techStack') {
            const count = getWordCount(value);
            if (count > 30) {
                setFormErrors(prev => ({ ...prev, techStack: `Maximum 30 words allowed (${count}/30).` }));
            } else {
                setFormErrors(prev => ({ ...prev, techStack: '' }));
            }
        }
    };

    const handleAddProject = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Final validation
        if (getWordCount(formData.description) > 200 || getWordCount(formData.techStack) > 30) {
            return;
        }

        setSaving(true);
        try {
            const res = await projectApi.create({
                title: formData.title,
                description: formData.description,
                techStack: formData.techStack,
                githubLink: formData.githubLink || undefined,
                liveLink: formData.liveLink || undefined,
            });
            const p = res.data;
            setProjects(prev => [...prev, {
                id: p.id,
                title: p.title,
                description: p.description,
                techStack: p.techStack,
                githubLink: p.githubLink || undefined,
                liveLink: p.liveLink || undefined,
            }]);
            setIsModalOpen(false);
            setFormData({ title: '', description: '', techStack: '', githubLink: '', liveLink: '' });
        } catch (err: any) {
            console.error('Failed to add project:', err);
            alert(err.message || 'Failed to add project');
        } finally {
            setSaving(false);
        }
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
                    <div className="text-[10px] font-mono text-[#555] uppercase tracking-widest px-3 mb-2">STUDENT Options</div>
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
                        <Box size={20} className="text-accent-400" />
                        <div>
                            <h1 className="text-sm font-bold font-sans text-white uppercase tracking-widest">My Projects</h1>
                            <p className="text-[10px] font-mono text-[#666]">Showcase your skills {projects.length}/2</p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <div className="max-w-4xl mx-auto space-y-8 pb-24">
                        
                        {/* Empty state or Project grid */}
                        {projects.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 bg-[#0A0A0A] border border-[#222] border-dashed rounded-sm text-center">
                                <Box size={48} className="text-[#333] mb-4" />
                                <h2 className="text-lg font-bold text-white mb-2 tracking-widest uppercase font-mono">No Projects Added</h2>
                                <p className="text-[#888] text-sm font-mono max-w-md">You haven't added any projects yet. Attracting recruiters is easier when you showcase what you can build.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {projects.map((project) => (
                                    <div key={project.id} className="bg-[#0A0A0A] border border-[#222] rounded-sm p-6 hover:border-[#444] transition-all flex flex-col h-full shadow-lg relative overflow-hidden group">
                                        {/* Subtle accent glow */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/5 blur-[50px] pointer-events-none rounded-full transition-opacity opacity-0 group-hover:opacity-100"></div>

                                        <h3 className="text-xl font-bold font-sans text-white mb-3">{project.title}</h3>
                                        
                                        <div className="mb-4">
                                            <span className="text-[9px] font-mono text-accent-400 uppercase tracking-widest block mb-1">Tech Stack</span>
                                            <div className="text-xs font-mono text-[#aaa] leading-relaxed">
                                                {project.techStack}
                                            </div>
                                        </div>

                                        <p className="text-sm text-[#888] font-sans leading-relaxed mb-6 flex-1">
                                            {project.description}
                                        </p>

                                        <div className="flex items-center gap-4 mt-auto pt-4 border-t border-[#222]">
                                            {project.githubLink && (
                                                <a href={project.githubLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-mono text-[#888] hover:text-white transition-colors group/link p-2 bg-[#111] rounded-sm border border-[#333] hover:border-[#666]">
                                                    <Github size={14} className="group-hover/link:text-white" />
                                                    GitHub Repo
                                                </a>
                                            )}
                                            {project.liveLink && (
                                                <a href={project.liveLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-mono text-accent-400 hover:text-accent-300 transition-colors group/link p-2 bg-accent-500/10 rounded-sm border border-accent-500/20 hover:border-accent-500/40">
                                                    <ExternalLink size={14} />
                                                    Live Demo
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add Button at the bottom */}
                        <div className="flex justify-center mt-12">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                disabled={projects.length >= 2}
                                className={`px-8 py-4 rounded-sm font-mono uppercase tracking-widest text-sm font-bold flex items-center justify-center gap-3 transition-all ${
                                    projects.length >= 2 
                                    ? 'bg-[#111] text-[#555] border border-[#333] cursor-not-allowed'
                                    : 'bg-accent-500 text-black shadow-[0_0_20px_rgba(var(--accent-500),0.3)] hover:bg-accent-400 hover:scale-105'
                                }`}
                            >
                                {projects.length >= 2 ? (
                                    <>Limit Reached ✓</>
                                ) : (
                                    <><PlusCircle size={20} /> Add New Project</>
                                )}
                            </button>
                            {projects.length >= 2 && (
                                <p className="text-[#555] text-xs font-mono mt-4 text-center absolute -bottom-8">Maximum of 2 projects can be showcased.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal Overlay */}
                <AnimatePresence>
                    {isModalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
                        >
                            <motion.div
                                initial={{ scale: 0.95, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.95, y: 20 }}
                                className="bg-[#0A0A0A] border border-[#333] rounded-sm shadow-2xl w-full max-w-2xl relative overflow-hidden my-8"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-600 via-accent-400 to-accent-600"></div>
                                
                                <div className="px-6 py-4 border-b border-[#222] flex items-center justify-between bg-[#111]">
                                    <h2 className="text-lg font-bold font-sans uppercase tracking-widest text-white flex items-center gap-2">
                                        <Plus size={18} className="text-accent-500" />
                                        Add Project
                                    </h2>
                                    <button onClick={() => setIsModalOpen(false)} className="text-[#666] hover:text-white transition-colors p-1">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-6">
                                    <form onSubmit={handleAddProject} className="flex flex-col gap-5">
                                        <div>
                                            <label className="block text-xs font-mono text-[#aaa] uppercase tracking-widest mb-2 font-semibold">Title *</label>
                                            <input 
                                                required
                                                type="text" 
                                                name="title"
                                                value={formData.title}
                                                onChange={handleFormChange}
                                                className="w-full bg-[#111] border border-[#333] rounded-sm px-4 py-3 text-white focus:outline-none focus:border-accent-500 transition-colors font-sans"
                                                placeholder="e.g. Distributed Task Queue"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="block text-xs font-mono text-[#aaa] uppercase tracking-widest font-semibold">Description *</label>
                                                <span className={`text-[10px] font-mono ${getWordCount(formData.description) > 200 ? 'text-red-500' : 'text-[#666]'}`}>
                                                    {getWordCount(formData.description)}/200 words
                                                </span>
                                            </div>
                                            <textarea 
                                                required
                                                name="description"
                                                value={formData.description}
                                                onChange={handleFormChange}
                                                rows={4}
                                                className={`w-full bg-[#111] border ${formErrors.description ? 'border-red-500/50' : 'border-[#333] focus:border-accent-500'} rounded-sm px-4 py-3 text-white focus:outline-none transition-colors font-sans resize-none custom-scrollbar`}
                                                placeholder="Elaborate on the problem you solved, your approach, and key features..."
                                            />
                                            {formErrors.description && <p className="text-red-500 text-[10px] font-mono mt-1">{formErrors.description}</p>}
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="block text-xs font-mono text-[#aaa] uppercase tracking-widest font-semibold">Technologies Used *</label>
                                                <span className={`text-[10px] font-mono ${getWordCount(formData.techStack) > 30 ? 'text-red-500' : 'text-[#666]'}`}>
                                                    {getWordCount(formData.techStack)}/30 words
                                                </span>
                                            </div>
                                            <input 
                                                required
                                                type="text" 
                                                name="techStack"
                                                value={formData.techStack}
                                                onChange={handleFormChange}
                                                className={`w-full bg-[#111] border ${formErrors.techStack ? 'border-red-500/50' : 'border-[#333] focus:border-accent-500'} rounded-sm px-4 py-3 text-white focus:outline-none transition-colors font-sans`}
                                                placeholder="e.g. Python, Redis, React, Docker..."
                                            />
                                            {formErrors.techStack && <p className="text-red-500 text-[10px] font-mono mt-1">{formErrors.techStack}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-xs font-mono text-[#aaa] uppercase tracking-widest mb-2 font-semibold flex items-center gap-1.5">
                                                    <Github size={12} /> GitHub Link <span className="text-[#666] font-normal lowercase">(optional)</span>
                                                </label>
                                                <input 
                                                    type="url" 
                                                    name="githubLink"
                                                    value={formData.githubLink}
                                                    onChange={handleFormChange}
                                                    className="w-full bg-[#111] border border-[#333] rounded-sm px-4 py-3 text-white focus:outline-none focus:border-accent-500 transition-colors font-sans"
                                                    placeholder="https://github.com/..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-mono text-[#aaa] uppercase tracking-widest mb-2 font-semibold flex items-center gap-1.5">
                                                    <ExternalLink size={12} /> Live Link <span className="text-[#666] font-normal lowercase">(optional)</span>
                                                </label>
                                                <input 
                                                    type="url" 
                                                    name="liveLink"
                                                    value={formData.liveLink}
                                                    onChange={handleFormChange}
                                                    className="w-full bg-[#111] border border-[#333] rounded-sm px-4 py-3 text-white focus:outline-none focus:border-accent-500 transition-colors font-sans"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-8 flex items-center justify-end gap-4 border-t border-[#222] pt-6">
                                            <button 
                                                type="button"
                                                onClick={() => setIsModalOpen(false)}
                                                className="px-6 py-2.5 bg-transparent border border-[#333] text-[#888] font-mono text-xs uppercase tracking-widest font-bold rounded-sm hover:border-[#666] hover:text-white transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                type="submit"
                                                disabled={Boolean(formErrors.description || formErrors.techStack)}
                                                className="px-6 py-2.5 bg-accent-500 text-black border border-transparent font-mono text-xs uppercase tracking-widest font-bold rounded-sm hover:bg-accent-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Save Project
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
