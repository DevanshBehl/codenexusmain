import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Terminal, Video, PenTool, Users } from 'lucide-react';

const TYPING_LINES = [
    'function maxSlidingWindow(nums, k) {',
    '  // Use a monotonic deque approach',
    '  const result = [];',
    '  const deque = [];',
    '  for (let i = 0; i < nums.length; i++) {',
    '    while (deque.length > 0 && deque[0] <= i - k) {',
    '      deque.shift();',
    '    }',
    '    while (deque.length > 0 && nums[deque[deque.length - 1]] < nums[i]) {',
    '      deque.pop();',
    '    }',
    '    deque.push(i);',
    '    if (i >= k - 1) result.push(nums[deque[0]]);',
    '  }',
];

export default function Hero() {
    const [visibleLines, setVisibleLines] = useState(5);

    useEffect(() => {
        const interval = setInterval(() => {
            setVisibleLines(prev => (prev >= TYPING_LINES.length ? 5 : prev + 1));
        }, 1800);
        return () => clearInterval(interval);
    }, []);

    const containerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.12 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
    };

    return (
        <section className="py-24 px-6 border-b border-[#333] flex flex-col items-center justify-center text-center relative min-h-[90vh]">
            {/* Radial glow behind hero */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent-500/[0.04] blur-[120px] pointer-events-none" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center"
            >
                <motion.div variants={itemVariants}>
                    <Link to="/student/interview" className="inline-flex items-center gap-2 border border-[#333] bg-[#111] px-3 py-1 text-xs text-[#aaa] rounded-sm mb-8 hover:bg-[#222] hover:border-accent-500/50 cursor-pointer transition-all duration-300 font-mono tracking-wide group">
                        <span className="bg-accent-500 text-black px-1.5 py-0.5 rounded-sm font-bold text-[10px] animate-pulse">NEW</span>
                        <span>Real-time AI Mock Interviews</span>
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>

                <motion.h1
                    variants={itemVariants}
                    className="text-4xl md:text-6xl lg:text-7xl font-bold text-white max-w-5xl uppercase tracking-tight leading-[1.1] mb-6 font-sans"
                >
                    THE ALL-IN-ONE PLATFORM FOR <br /> PLACEMENT PREP & TECHNICAL HIRING
                </motion.h1>

                <motion.p
                    variants={itemVariants}
                    className="text-[#888] max-w-3xl mx-auto text-sm md:text-base leading-relaxed mb-10 font-mono text-center"
                >
                    Practice LeetCode-style DSA problems, take real-time AI mock interviews, and connect with universities and recruiters. Say goodbye to uncoordinated screen sharing with our lag-free collaborative IDE, 1-on-1 video conferencing, and built-in interactive whiteboards.
                </motion.p>

                <motion.div variants={itemVariants} className="flex items-center gap-4 mb-20">
                    <Link to="/student/codearena">
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(255,255,255,0.15)' }}
                            whileTap={{ scale: 0.97 }}
                            className="bg-[#e0e0e0] text-black px-6 py-3 font-bold hover:bg-white transition-colors text-sm font-mono"
                        >
                            Start Practicing
                        </motion.button>
                    </Link>
                    <Link to="/student/interview">
                        <motion.button
                            whileHover={{ scale: 1.05, borderColor: 'oklch(0.777 0.152 181.912)' }}
                            whileTap={{ scale: 0.97 }}
                            className="border border-[#555] bg-transparent text-white px-6 py-3 font-bold hover:bg-[#111] transition-all text-sm flex items-center gap-2 font-mono"
                        >
                            Schedule Interview
                        </motion.button>
                    </Link>
                </motion.div>
            </motion.div>

            {/* Mock IDE Preview */}
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-5xl border border-[#333] bg-[#0a0a0a] rounded-sm p-4 relative shadow-2xl hover:border-[#444] transition-colors duration-500"
            >
                <div className="border border-[#333] rounded-sm overflow-hidden flex flex-col h-[450px]">
                    {/* Tab header */}
                    <div className="flex bg-[#111] border-b border-[#333]">
                        {[
                            { icon: <Terminal size={12} />, label: 'ide.ts', active: true },
                            { icon: <PenTool size={12} />, label: 'whiteboard', active: false },
                            { icon: <Video size={12} />, label: 'video call', active: false },
                            { icon: null, label: 'chat', active: false },
                        ].map((tab, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ backgroundColor: '#1a1a1a' }}
                                className={`px-4 py-2 border-r border-[#333] text-xs font-mono flex items-center gap-2 cursor-pointer transition-colors ${
                                    tab.active ? 'text-accent-400 border-b-2 border-b-accent-500' : 'text-[#666] hover:text-[#aaa]'
                                }`}
                            >
                                {tab.icon}{tab.label}
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex flex-1">
                        {/* Left: Code Editor */}
                        <div className="w-[60%] p-6 border-r border-[#333] flex flex-col text-left font-mono relative">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-white font-bold text-xs uppercase tracking-widest text-[#aaa]">LIVE INTERVIEW SESSION</h3>
                                <span className="text-red-500 animate-pulse flex items-center gap-1 text-xs">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> REC 00:14:32
                                </span>
                            </div>

                            <div className="flex-1 overflow-hidden relative border border-[#222] bg-[#050505] p-4 text-xs">
                                {TYPING_LINES.slice(0, visibleLines).map((line, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="text-[#aaa] leading-[1.8]"
                                    >
                                        <span className="text-[#444] mr-2 select-none inline-block w-5 text-right">{i + 1}</span>
                                        <span dangerouslySetInnerHTML={{
                                            __html: line
                                                .replace(/(function|const|for|let|while|if)/g, '<span class="text-accent-400">$1</span>')
                                                .replace(/(maxSlidingWindow|shift|pop|push)/g, '<span class="text-blue-300">$1</span>')
                                                .replace(/(\/\/.+)/g, '<span class="text-[#555]">$1</span>')
                                        }} />
                                    </motion.div>
                                ))}
                                {/* Blinking cursor */}
                                <span className="inline-block w-1.5 h-3.5 bg-accent-400 animate-pulse ml-7 mt-0.5" />

                                {/* Typing indicator */}
                                <motion.div
                                    animate={{ opacity: [0.6, 1, 0.6] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute left-[36%] bottom-[15%] glass-card bg-accent-500/20 border border-accent-500/50 px-2 py-0.5 rounded-sm text-[9px] text-accent-400"
                                >
                                    Student is typing...
                                </motion.div>
                            </div>
                        </div>

                        {/* Right panel: Video & Architecture */}
                        <div className="w-[40%] bg-[#050505] p-4 flex flex-col relative overflow-hidden group border-t border-l border-[#222]">
                            <div className="text-xs text-[#888] flex justify-between items-center mb-4 relative z-10 font-mono">
                                <h3 className="flex items-center gap-2"><ChevronRight size={14} className="text-accent-500" /> Multi-Tool Panel</h3>
                                <div className="flex gap-2">
                                    <span className="px-2 border border-[#333] bg-[#222] text-white rounded-[2px] border-b-2 border-b-accent-500">Video</span>
                                    <span className="px-2 border border-[#333] bg-[#111] rounded-[2px] hover:bg-[#222] transition-colors cursor-pointer">Diagram</span>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col gap-3">
                                <motion.div
                                    whileHover={{ borderColor: '#444' }}
                                    className="flex-1 bg-[#111] border border-[#333] relative rounded-sm flex items-center justify-center transition-colors"
                                >
                                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 text-[9px] uppercase tracking-widest font-mono text-white">HR / Interviewer</div>
                                    <Users size={24} className="text-[#333]" />
                                </motion.div>
                                <motion.div
                                    whileHover={{ boxShadow: '0 0 25px oklch(0.777 0.152 181.912 / 0.25)' }}
                                    className="flex-1 bg-[#111] border border-accent-500/50 shadow-[0_0_15px_oklch(0.777_0.152_181.912_/_0.15)] relative rounded-sm flex items-center justify-center transition-shadow"
                                >
                                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 text-[9px] uppercase tracking-widest font-mono text-accent-400">Student (You)</div>
                                    <div className="absolute bottom-2 right-2 flex gap-1">
                                        <span className="w-1 h-3 bg-green-500 rounded-full animate-pulse" />
                                        <span className="w-1 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                                        <span className="w-1 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                                    </div>
                                    <Users size={24} className="text-[#444]" />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
