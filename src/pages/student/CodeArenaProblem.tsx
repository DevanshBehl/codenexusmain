import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Terminal,
    Code2,
    Briefcase,
    FileText,
    Box,
    Activity,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Play,
    Send,
    Settings,
    Maximize2,
    RefreshCw,
    Mail,
    Presentation,
    PenTool
} from 'lucide-react';
import AskAI from '../../components/CodeArena/AskAI';

const CodeArenaProblem = () => {
    const { id } = useParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default collapsed for more space
    const [language, setLanguage] = useState('cpp');

    // Mocks
    const problem = {
        title: 'Merge K Sorted Lists',
        difficulty: 'Hard',
        acceptance: '52.4%',
        timeLimit: '2.0s',
        memoryLimit: '256MB',
        tags: ['Linked List', 'Divide and Conquer', 'Heap'],
        description: `
You are given an array of \`k\` linked-lists \`lists\`, each linked-list is sorted in ascending order.

*Merge all the linked-lists into one sorted linked-list and return it.*

**Example 1:**
\`\`\`
Input: lists = [[1,4,5],[1,3,4],[2,6]]
Output: [1,1,2,3,4,4,5,6]
Explanation: The linked-lists are:
[
  1->4->5,
  1->3->4,
  2->6
]
merging them into one sorted list:
1->1->2->3->4->4->5->6
\`\`\`

**Example 2:**
\`\`\`
Input: lists = []
Output: []
\`\`\`

**Constraints:**
- \`k == lists.length\`
- \`0 <= k <= 10^4\`
- \`0 <= lists[i].length <= 500\`
- \`-10^4 <= lists[i][j] <= 10^4\`
- \`lists[i]\` is sorted in ascending order.
- The sum of \`lists[i].length\` will not exceed \`10^4\`.
        `
    };

    const sidebarItems = [
        { icon: Mail, label: 'MAIL', path: '/student/mail' },
        { icon: Presentation, label: 'WEBINARS', path: '/student/webinars' },
        { icon: Terminal, label: 'CMD CENTER', path: '/student/dashboard' },
        { icon: Code2, label: 'CODE ARENA', active: true, path: '/student/codearena' },
        { icon: PenTool, label: 'DESIGN ARENA', path: '/student/designarena' },
        { icon: Briefcase, label: 'INTERVIEWS', path: '/student/interview' },
        { icon: FileText, label: 'APPLICATIONS', path: '/student/dashboard' },
        { icon: Box, label: 'PROJECTS', path: '/student/dashboard' },
        { icon: Activity, label: 'ANALYTICS', path: '/student/dashboard' },
    ];

    return (
        <div className="h-screen bg-[#050505] font-sans text-white selection:bg-accent-500/30 selection:text-white overflow-hidden flex flex-col relative">
            {/* Background Dots */}
            <div className="fixed inset-0 pointer-events-none z-0 dotted-bg"></div>

            <div className="flex-1 flex overflow-hidden z-10">
                {/* Sidebar */}
                <motion.aside
                    initial={false}
                    animate={{ width: isSidebarOpen ? 240 : 70 }}
                    className="h-full bg-[#0A0A0A] border-r border-[#222] flex flex-col relative flex-shrink-0"
                >
                    {/* Logo Area */}
                    <div className="h-14 flex items-center px-4 border-b border-[#222]">
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
                    <div className="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto custom-scrollbar">
                        {sidebarItems.map((item, index) => (
                            <Link to={item.path} key={index}>
                                <button
                                    className={`w-full flex items-center px-3 py-2.5 rounded-sm transition-all duration-200 group relative
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
                            </Link>
                        ))}
                    </div>

                    {/* User Profile Mini */}
                    <div className="p-3 border-t border-[#222]">
                        <div className="flex items-center group cursor-pointer hover:bg-[#111] p-2 rounded-sm border border-transparent hover:border-[#333] transition-colors">
                            <div className="w-8 h-8 rounded-sm bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-white font-mono text-xs font-bold shrink-0">
                                DB
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
                                            <p className="text-[10px] font-mono text-white whitespace-nowrap uppercase tracking-wider">Devansh Behl</p>
                                        </div>
                                        <LogOut size={12} className="text-[#555] group-hover:text-red-400 transition-colors" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.aside>

                {/* Split Layout: Problem Statement + Code Editor */}
                <div className="flex-1 flex flex-col md:flex-row p-2 gap-2 h-full min-h-0 bg-[#050505]">

                    {/* Left Pane: Problem Description */}
                    <div className="w-full md:w-[45%] lg:w-[40%] bg-[#0A0A0A] border border-[#222] rounded-sm flex flex-col overflow-hidden">
                        {/* Header Tabs */}
                        <div className="flex border-b border-[#222] bg-[#111]">
                            <button className="px-4 py-3 border-r border-[#222] text-[10px] font-mono uppercase tracking-widest text-accent-400 border-b-2 border-accent-500 bg-[#0A0A0A] flex items-center gap-2">
                                <FileText size={12} /> Description
                            </button>
                            <Link to="/student/codearena/submissions" className="px-4 py-3 border-r border-[#222] text-[10px] font-mono uppercase tracking-widest text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors flex items-center gap-2">
                                <Activity size={12} /> Submissions
                            </Link>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <div className="flex justify-between items-start mb-4">
                                <h1 className="text-2xl font-sans font-bold text-white tracking-tight flex items-center gap-3">
                                    <span className="text-[#555] font-mono text-lg">{id}.</span> {problem.title}
                                </h1>
                            </div>

                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 border rounded-sm text-red-500 border-red-500/30 bg-red-500/10">
                                    {problem.difficulty}
                                </span>
                                <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 border rounded-sm border-[#333] text-[#aaa]">
                                    Acc: {problem.acceptance}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-8">
                                {problem.tags.map((tag, i) => (
                                    <span key={i} className="text-[9px] font-mono uppercase tracking-widest text-[#888] bg-[#111] px-2 py-1 border border-[#333] rounded-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Marked renderer mock */}
                            <div className="prose prose-invert prose-pre:bg-[#111] prose-pre:border prose-pre:border-[#222] prose-pre:rounded-sm max-w-none font-sans text-sm text-[#ccc] leading-relaxed">
                                <p>You are given an array of <code>k</code> linked-lists <code>lists</code>, each linked-list is sorted in ascending order.</p>
                                <p><em>Merge all the linked-lists into one sorted linked-list and return it.</em></p>

                                <h4 className="text-white font-bold mt-6 mb-2">Example 1:</h4>
                                <pre className="p-4 rounded-sm text-xs font-mono !bg-[#111] !border-[#333]">
                                    <code className="text-[#aaa]">
                                        <span className="text-[#888]">Input:</span> lists = [[1,4,5],[1,3,4],[2,6]]<br />
                                        <span className="text-[#888]">Output:</span> [1,1,2,3,4,4,5,6]<br />
                                        <span className="text-[#888]">Explanation:</span> The linked-lists are:<br />
                                        [<br />
                                        1-&gt;4-&gt;5,<br />
                                        1-&gt;3-&gt;4,<br />
                                        2-&gt;6<br />
                                        ]<br />
                                        merging them into one sorted list:<br />
                                        1-&gt;1-&gt;2-&gt;3-&gt;4-&gt;4-&gt;5-&gt;6
                                    </code>
                                </pre>

                                <h4 className="text-white font-bold mt-6 mb-2">Example 2:</h4>
                                <pre className="p-4 rounded-sm text-xs font-mono !bg-[#111] !border-[#333]">
                                    <code>
                                        <span className="text-[#888]">Input:</span> lists = []<br />
                                        <span className="text-[#888]">Output:</span> []
                                    </code>
                                </pre>

                                <h4 className="text-white font-bold mt-6 mb-2">Constraints:</h4>
                                <ul className="list-disc pl-5 space-y-1 text-xs">
                                    <li><code>k == lists.length</code></li>
                                    <li><code>0 &lt;= k &lt;= 10^4</code></li>
                                    <li><code>0 &lt;= lists[i].length &lt;= 500</code></li>
                                    <li><code>-10^4 &lt;= lists[i][j] &lt;= 10^4</code></li>
                                    <li><code>lists[i]</code> is sorted in ascending order.</li>
                                    <li>The sum of <code>lists[i].length</code> will not exceed <code>10^4</code>.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Footer limits */}
                        <div className="p-3 border-t border-[#222] bg-[#111] flex justify-between items-center text-[9px] font-mono text-[#666] uppercase tracking-widest">
                            <span>Time Limit: <span className="text-[#aaa]">{problem.timeLimit}</span></span>
                            <span>Memory Limit: <span className="text-[#aaa]">{problem.memoryLimit}</span></span>
                        </div>
                    </div>

                    {/* Right Pane: Code Editor */}
                    <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0A] border border-[#222] rounded-sm relative group overflow-hidden">
                        {/* Editor Toolbar */}
                        <div className="flex justify-between items-center border-b border-[#222] bg-[#111] px-4 py-2">
                            <div className="flex items-center gap-2">
                                <Code2 size={14} className="text-accent-500" />
                                <div className="relative">
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="bg-[#1a1a1a] border border-[#333] text-[10px] font-mono uppercase tracking-widest text-[#aaa] py-1 pl-2 pr-6 focus:outline-none focus:border-accent-500 rounded-sm appearance-none cursor-pointer hover:bg-[#222] transition-colors"
                                    >
                                        <option value="cpp">C++</option>
                                        <option value="java">Java</option>
                                        <option value="python">Python 3</option>
                                        <option value="javascript">JavaScript</option>
                                    </select>
                                    <ChevronRight size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#555] rotate-90 pointer-events-none" />
                                </div>
                                <button className="p-1.5 hover:bg-[#222] border border-transparent hover:border-[#333] rounded-sm text-[#888] hover:text-white transition-colors">
                                    <RefreshCw size={12} />
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-1.5 hover:bg-[#222] border border-transparent hover:border-[#333] rounded-sm text-[#888] hover:text-white transition-colors">
                                    <Settings size={12} />
                                </button>
                                <button className="p-1.5 hover:bg-[#222] border border-transparent hover:border-[#333] rounded-sm text-[#888] hover:text-white transition-colors">
                                    <Maximize2 size={12} />
                                </button>
                            </div>
                        </div>

                        {/* Code Editor Body Mock */}
                        <div className="flex-1 overflow-auto bg-[#050505] p-4 font-mono text-xs leading-relaxed relative text-[#aaa]">
                            {/* Simple line numbers + code representation */}
                            <div className="flex">
                                <div className="text-[#444] text-right pr-4 select-none flex flex-col">
                                    {[...Array(20)].map((_, i) => <span key={i}>{i + 1}</span>)}
                                </div>
                                <div>
                                    <span className="text-[#555]">/**</span><br />
                                    <span className="text-[#555]"> * Definition for singly-linked list.</span><br />
                                    <span className="text-[#555]"> * struct ListNode {'{'}</span><br />
                                    <span className="text-[#555]"> *     int val;</span><br />
                                    <span className="text-[#555]"> *     ListNode *next;</span><br />
                                    <span className="text-[#555]"> *     ListNode() : val(0), next(nullptr) {'}'}</span><br />
                                    <span className="text-[#555]"> *     ListNode(int x) : val(x), next(nullptr) {'}'}</span><br />
                                    <span className="text-[#555]"> *     ListNode(int x, ListNode *next) : val(x), next(next) {'}'}</span><br />
                                    <span className="text-[#555]"> * {'};'}</span><br />
                                    <span className="text-[#555]"> */</span><br />
                                    <span className="text-accent-400">class</span> <span className="text-amber-200">Solution</span> {'{'}<br />
                                    <span className="text-accent-400">public:</span><br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;ListNode* <span className="text-blue-300">mergeKLists</span>(vector&lt;ListNode*&gt;&amp; lists) {'{'}<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="inline-block w-2 h-3.5 bg-accent-400 animate-pulse ml-0.5 align-middle"></span><br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;{'}'}<br />
                                    {'};'}<br />
                                </div>
                            </div>
                        </div>

                        {/* Editor Action Bar (Bottom) */}
                        <div className="border-t border-[#222] bg-[#111] p-3 flex justify-between items-center z-10">
                            <button className="text-[10px] font-mono uppercase tracking-widest text-[#888] hover:text-white flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] border border-[#333] hover:border-[#555] rounded-sm transition-colors">
                                <Terminal size={12} /> Console
                            </button>

                            <div className="flex gap-3">
                                <button className="px-5 py-2 bg-[#1a1a1a] border border-[#333] hover:border-[#555] hover:bg-[#222] text-[#ccc] text-[10px] font-mono uppercase tracking-widest rounded-sm transition-all flex items-center gap-2">
                                    <Play size={12} /> Run Task
                                </button>
                                <button className="px-5 py-2 bg-[#e0e0e0] border border-[#e0e0e0] hover:bg-white text-black text-[10px] font-mono uppercase tracking-widest font-bold rounded-sm transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(224,224,224,0.15)] group">
                                    <Send size={12} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" /> Submit Task
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <AskAI />
        </div>
    );
};

export default CodeArenaProblem;
