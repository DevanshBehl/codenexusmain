import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Terminal, Video, PenTool, BrainCircuit, Code2, LineChart, ShieldCheck, Zap } from 'lucide-react';

export default function DetailedFeatures() {
    const features = [
        {
            icon: <Code2 size={24} className="text-accent-500" />,
            title: "LeetCode-Style Practice Hub",
            description: "Access 1000+ curated DSA problems categorized by difficulty and pattern. Practice in the exact same IDE environment you'll use for real interviews so you are uniquely prepared.",
            link: '/student/codearena',
        },
        {
            icon: <BrainCircuit size={24} className="text-accent-500" />,
            title: "AI Interviewer (Beta)",
            description: "Take on-demand mock interviews with an AI that observes your code, asks follow up optimization questions, and scores your communication skills in real-time.",
            link: '/student/interview',
        },
        {
            icon: <Terminal size={24} className="text-accent-500" />,
            title: "Collaborative IDE environment",
            description: "Lag-free syntax highlighting, auto-completion, and multi-cursor support for over 20+ programming languages. Execute code and see test case results instantly.",
            link: '/student/codearena',
        },
        {
            icon: <PenTool size={24} className="text-accent-500" />,
            title: "Infinite Whiteboard Canvas",
            description: "Draw system architecture diagrams or trace complex data structures visually using our built-in whiteboard. Perfect for senior backend or full-stack interviews.",
            link: '/student/designarena',
        },
        {
            icon: <Video size={24} className="text-accent-500" />,
            title: "Integrated Video Conferencing",
            description: "No more juggling Zoom links and separate code editors. Enjoy crystal clear 1-on-1 WebRTC video calling embedded directly next to the code editor.",
            link: '/student/interview',
        },
        {
            icon: <LineChart size={24} className="text-accent-500" />,
            title: "University & HR Dashboards",
            description: "Manage candidate pipelines, schedule interviews across timezone, and review highly detailed candidate scorecards and session recordings.",
            link: '/university/dashboard',
        },
        {
            icon: <Zap size={24} className="text-accent-500" />,
            title: "Instant Session Playback",
            description: "Interviews are recorded as keystroke/video logs. Hiring committees can replay the exact problem-solving timeline rather than relying on brief interviewer notes.",
            link: '/company/evaluation',
        },
        {
            icon: <ShieldCheck size={24} className="text-accent-500" />,
            title: "Anti-Plagiarism & Proctoring",
            description: "Ensure candidate integrity with built-in tab-tracking, copy-paste detection, and AI similarity scores across all completed interview sessions.",
            link: '/company/dashboard',
        },
    ];

    const containerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.08 } },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.97 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: 'easeOut' as const } },
    };

    return (
        <section className="py-24 px-6 border-b border-[#333] bg-[#050505]">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6 }}
                    className="mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white uppercase font-sans tracking-tight mb-4 border-l-4 border-accent-500 pl-4">COMPREHENSIVE TOOLSET</h2>
                    <p className="text-[#888] font-mono text-sm max-w-2xl leading-relaxed pl-5">
                        Everything you need to practice, execute, and analyze technical interviews.
                        CodeNexus replaces 4 disjointed tools with one streamlined platform.
                    </p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-60px' }}
                >
                    {features.map((feature, idx) => (
                        <motion.div key={idx} variants={cardVariants}>
                            <Link to={feature.link} className="block bg-[#0A0A0A] border border-[#222] p-6 rounded-sm hover:border-accent-500/50 hover:bg-[#111] transition-all duration-300 group h-full">
                                <motion.div
                                    whileHover={{ scale: 1.15, rotate: 5 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                                    className="mb-4 bg-[#111] w-12 h-12 flex items-center justify-center rounded-sm border border-[#333] shadow-[0_0_0px_oklch(0.777_0.152_181.912_/_0)] group-hover:shadow-[0_0_20px_oklch(0.777_0.152_181.912_/_0.25)] transition-shadow duration-300"
                                >
                                    {feature.icon}
                                </motion.div>
                                <h3 className="text-white font-bold mb-3 font-sans text-sm tracking-wide group-hover:text-accent-400 transition-colors duration-300">{feature.title}</h3>
                                <p className="text-[#888] font-mono text-xs leading-relaxed group-hover:text-[#aaa] transition-colors">{feature.description}</p>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
