import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
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
    PenTool,
    CheckCircle,
    XCircle,
    Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import AskAI from '../../components/CodeArena/AskAI';
import { codeArenaApi } from '../../lib/api';
import { io } from 'socket.io-client';

const LANGUAGE_MAP: Record<string, string> = {
    cpp: 'cpp',
    java: 'java',
    python: 'python',
    javascript: 'javascript',
};

const DEFAULT_CODE: Record<string, string> = {
    cpp: `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        
    }
};`,
    java: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        
    }
}`,
    python: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def mergeKLists(self, lists: list[Optional[ListNode]]) -> Optional[ListNode]:
        pass`,
    javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
function mergeKLists(lists) {
    
}`,
};

const CodeArenaProblem = () => {
    const { id } = useParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default collapsed for more space
    const [language, setLanguage] = useState('cpp');

    const [problemData, setProblemData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [isConsoleOpen, setIsConsoleOpen] = useState(false);
    const [runState, setRunState] = useState<'idle' | 'running' | 'success'>('idle');
    const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success'>('idle');
    const [code, setCode] = useState(DEFAULT_CODE[language]);
    const [runResult, setRunResult] = useState<any>(null);

    useEffect(() => {
        setCode(DEFAULT_CODE[language]);
    }, [language]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const socket = io('http://localhost:5000/codearena', {
            auth: { token }
        });

        socket.on('submission_result', (data) => {
            console.log('Submission result:', data);
            setRunResult(data.result);
            if (data.isSubmission) {
                setSubmitState('success');
                if (data.result.status === 'Accepted') {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                }
            } else {
                setRunState('success');
            }
        });

        socket.on('submission_status', (data) => {
            console.log('Status:', data);
        });

        return () => { socket.disconnect(); };
    }, []);

    const handleRun = async () => {
        if (!id) return;
        setIsConsoleOpen(true);
        setRunState('running');
        setRunResult(null);
        try {
            await codeArenaApi.runCode(id, language, code);
        } catch (err) {
            console.error(err);
            setRunState('idle');
        }
    };

    const handleSubmit = async () => {
        if (!id) return;
        setSubmitState('submitting');
        setIsConsoleOpen(false);
        setRunResult(null);
        try {
            await codeArenaApi.submitCode(id, language, code);
        } catch (err) {
            console.error(err);
            setSubmitState('idle');
        }
    };

    useEffect(() => {
        if (!id) return;
        const fetchProblem = async () => {
            try {
                const res = await codeArenaApi.getProblem(id);
                setProblemData(res.data);
            } catch (err) {
                console.error("Failed to load problem", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProblem();
    }, [id]);

    const problem = problemData ? {
        title: problemData.title,
        difficulty: problemData.difficulty === 'EASY' ? 'Easy' : problemData.difficulty === 'MEDIUM' ? 'Medium' : 'Hard',
        acceptance: '52.4%', // Placeholder
        timeLimit: '2.0s',
        memoryLimit: '256MB',
        tags: [problemData.topic || 'General'],
        description: problemData.description,
        constraints: problemData.constraints,
        testCases: problemData.testCases || []
    } : null;

    const sidebarItems = [
        { icon: Mail, label: 'MAIL', path: '/student/mail' },
        { icon: Presentation, label: 'WEBINARS', path: '/student/webinars' },
        { icon: Terminal, label: 'CMD CENTER', path: '/student/dashboard' },
        { icon: Code2, label: 'CODE ARENA', active: true, path: '/student/codearena' },
        { icon: PenTool, label: 'DESIGN ARENA', path: '/student/designarena' },
        { icon: Briefcase, label: 'INTERVIEWS', path: '/student/interview' },
        { icon: FileText, label: 'PROFILE', path: '/student/profile' },
        { icon: Box, label: 'PROJECTS', path: '/student/projects' },
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
                            <button className="px-4 py-3 border-r border-[#222] text-[10px] font-mono uppercase tracking-widest text-accent-400 border-b-2 border-accent-500 bg-[#0A0A0A] flex items-center gap-2 transition-colors">
                                <FileText size={12} /> Description
                            </button>
                            <Link to="/student/codearena/submissions" className="px-4 py-3 border-r border-[#222] text-[10px] font-mono uppercase tracking-widest text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors flex items-center gap-2">
                                <Activity size={12} /> Submissions
                            </Link>
                        </div>
                        
                        {loading ? (
                            <div className="flex-1 flex items-center justify-center p-6">
                                <div className="text-[#888] font-mono text-sm tracking-widest uppercase flex items-center gap-2">
                                    <RefreshCw className="animate-spin" size={14} /> Loading Problem...
                                </div>
                            </div>
                        ) : !problem ? (
                            <div className="flex-1 flex items-center justify-center p-6 text-red-400 font-mono text-xs text-center border-t border-[#222]">
                                Could not find problem.
                            </div>
                        ) : (
                            <>
                                {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <div className="flex justify-between items-start mb-4">
                                <h1 className="text-xl md:text-2xl font-sans font-bold text-white tracking-tight flex items-center gap-2 md:gap-3 leading-tight">
                                    {problem?.title}
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
                                {problem?.tags.map((tag: string, i: number) => (
                                    <span key={i} className="text-[9px] font-mono uppercase tracking-widest text-[#888] bg-[#111] px-2 py-1 border border-[#333] rounded-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Render Dynamic Problem Data */}
                            <div className="prose prose-invert prose-pre:bg-[#111] prose-pre:border prose-pre:border-[#222] prose-pre:rounded-sm max-w-none font-sans text-sm text-[#ccc] leading-relaxed">
                                <p className="whitespace-pre-wrap">{problem?.description}</p>

                                {problem?.testCases?.map((tc: any, idx: number) => (
                                    <div key={idx}>
                                        <h4 className="text-white font-bold mt-6 mb-2">Example {idx + 1}:</h4>
                                        <pre className="p-4 rounded-sm text-xs font-mono !bg-[#111] !border-[#333] overflow-x-auto">
                                            <code className="text-[#aaa]">
                                                <span className="text-[#888]">Input:</span> {tc.input}<br />
                                                <span className="text-[#888]">Output:</span> {tc.output}
                                            </code>
                                        </pre>
                                    </div>
                                ))}

                                {problem?.constraints && (
                                    <>
                                        <h4 className="text-white font-bold mt-6 mb-2">Constraints:</h4>
                                        <pre className="p-4 rounded-sm text-xs font-mono !bg-[#111] !border-[#333] overflow-x-auto text-[#aaa]">
                                            {problem.constraints}
                                        </pre>
                                    </>
                                )}
                            </div>
                        </div>

                                {/* Footer limits */}
                                <div className="p-3 border-t border-[#222] bg-[#111] flex justify-between items-center text-[9px] font-mono text-[#666] uppercase tracking-widest">
                                    <span>Time Limit: <span className="text-[#aaa]">{problem.timeLimit}</span></span>
                                    <span>Memory Limit: <span className="text-[#aaa]">{problem.memoryLimit}</span></span>
                                </div>
                            </>
                        )}
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

                        {/* Code Editor Body */}
                        <div className="flex-1 relative min-h-0">
                            <div className="absolute inset-0">
                            <Editor
                                height="100%"
                                defaultLanguage={LANGUAGE_MAP[language]}
                                language={LANGUAGE_MAP[language]}
                                value={code}
                                onChange={(val) => setCode(val || '')}
                                theme="vs-dark"
                                options={{
                                    fontSize: 13,
                                    fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, 'Courier New', monospace",
                                    fontLigatures: true,
                                    lineNumbers: 'on',
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    tabSize: 4,
                                    wordWrap: 'off',
                                    cursorBlinking: 'smooth',
                                    cursorSmoothCaretAnimation: 'on',
                                    smoothScrolling: true,
                                    bracketPairColorization: { enabled: true },
                                    autoClosingBrackets: 'always',
                                    autoClosingQuotes: 'always',
                                    autoIndent: 'full',
                                    formatOnPaste: true,
                                    formatOnType: true,
                                    suggestOnTriggerCharacters: true,
                                    parameterHints: { enabled: true },
                                    folding: true,
                                    matchBrackets: 'always',
                                    renderLineHighlight: 'line',
                                    padding: { top: 12, bottom: 12 },
                                    overviewRulerBorder: false,
                                    hideCursorInOverviewRuler: true,
                                    scrollbar: {
                                        vertical: 'auto',
                                        horizontal: 'auto',
                                        verticalScrollbarSize: 6,
                                        horizontalScrollbarSize: 6,
                                    },
                                }}
                            />
                            </div>
                        </div>

                        {/* Submission Success Overlay */}
                        <AnimatePresence>
                            {submitState !== 'idle' && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                                >
                                    {submitState === 'submitting' ? (
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="animate-spin text-accent-500" size={40} />
                                            <div className="text-white font-mono uppercase tracking-widest text-sm animate-pulse">Running Tests on Server...</div>
                                        </div>
                                    ) : (
                                        <motion.div 
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="bg-[#111] border border-[#333] p-8 flex flex-col items-center rounded-sm max-w-md w-full text-center shadow-2xl"
                                        >
                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${runResult?.status === 'Accepted' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                                {runResult?.status === 'Accepted' ? <CheckCircle className="text-green-500" size={32} /> : <XCircle className="text-red-500" size={32} />}
                                            </div>
                                            <h2 className="text-3xl font-bold font-sans tracking-tight text-white mb-2 uppercase">{runResult?.status || 'Accepted'}</h2>
                                            <p className="text-[#888] font-mono text-xs uppercase tracking-widest mb-6">
                                                {runResult?.status === 'Accepted' ? 'All test cases passed successfully' : 'Some test cases failed'}
                                            </p>
                                            <div className="w-full bg-[#0a0a0a] border border-[#222] rounded-sm p-4 flex justify-between mb-8">
                                                <div className="text-left font-mono">
                                                    <div className="text-[#666] text-[10px] uppercase tracking-widest mb-1">Runtime</div>
                                                    <div className="text-accent-400 font-bold text-lg">{runResult?.time || 0} s</div>
                                                </div>
                                                <div className="text-right font-mono border-l border-[#222] pl-4">
                                                    <div className="text-[#666] text-[10px] uppercase tracking-widest mb-1">Memory</div>
                                                    <div className="text-accent-400 font-bold text-lg">{runResult?.memory || 0} KB</div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => setSubmitState('idle')}
                                                className="w-full py-3 bg-[#e0e0e0] text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors"
                                            >
                                                Back to Problem
                                            </button>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Expandable Console drawer */}
                        <AnimatePresence>
                            {isConsoleOpen && submitState === 'idle' && (
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: 260 }}
                                    exit={{ height: 0 }}
                                    className="absolute bottom-14 left-0 right-0 border-t border-[#333] z-20 bg-[#0a0a0a] flex flex-col shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
                                >
                                    <div className="flex justify-between items-center border-b border-[#222] p-2 bg-[#111]">
                                        <div className="text-[10px] font-mono uppercase tracking-widest text-[#aaa] ml-2 flex items-center gap-2">
                                            <Terminal size={12}/> Run Results
                                        </div>
                                        <button onClick={() => setIsConsoleOpen(false)} className="text-[#555] hover:text-white p-1">
                                            <ChevronRight className="rotate-90" size={14} />
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                        {runState === 'running' ? (
                                            <div className="flex items-center justify-center h-full flex-col gap-3">
                                                <Loader2 className="animate-spin text-accent-500" size={24} />
                                                <div className="font-mono text-[10px] text-[#888] uppercase tracking-widest animate-pulse">Executing code...</div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-center gap-2">
                                                    <h3 className={`${runResult?.status === 'Accepted' ? 'text-green-500' : 'text-red-500'} font-sans font-bold text-xl tracking-tight uppercase`}>{runResult?.status || 'Wrong Answer'}</h3>
                                                    <span className={`${runResult?.status === 'Accepted' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'} border px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest rounded-sm`}>Example Test Cases</span>
                                                </div>
                                                <div className="flex gap-4 border-b border-[#222] pb-4 overflow-x-auto custom-scrollbar">
                                                    {runResult?.testResults?.map((tc: any, idx: number) => (
                                                        <div key={idx} className="bg-[#111] border border-[#222] rounded-sm p-3 min-w-[200px] flex-shrink-0">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-[#888] font-mono text-[9px] uppercase tracking-widest">Case {idx + 1}</span>
                                                                {tc.passed ? <CheckCircle size={10} className="text-green-500" /> : <XCircle size={10} className="text-red-500" />}
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <div>
                                                                    <div className="text-[#555] font-mono text-[9px] uppercase tracking-widest mb-0.5">Input</div>
                                                                    <div className="text-[#aaa] font-mono text-[10px] bg-[#0a0a0a] p-1 border border-[#222]">{tc.input}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-[#555] font-mono text-[9px] uppercase tracking-widest mb-0.5">Expected Output</div>
                                                                    <div className="text-[#aaa] font-mono text-[10px] bg-[#0a0a0a] p-1 border border-[#222]">{tc.expectedOutput}</div>
                                                                </div>
                                                                {!tc.passed && (
                                                                    <div>
                                                                        <div className="text-[#555] font-mono text-[9px] uppercase tracking-widest mb-0.5">My Output</div>
                                                                        <div className="text-red-400 font-mono text-[10px] bg-[#0a0a0a] p-1 border border-[#222]">{tc.actualOutput || tc.error}</div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {(!runResult?.testResults || runResult.testResults.length === 0) && (
                                                       <div className="text-red-400 font-mono text-[10px] uppercase whitespace-pre">{runResult?.compile_output || runResult?.error || 'Internal tests failed. Please try again.'}</div>
                                                    )}
                                                </div>
                                                <div className="font-mono text-[10px] text-[#555] uppercase tracking-widest">Done in {runResult?.time || 0}s</div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Editor Action Bar (Bottom) */}
                        <div className="border-t border-[#222] bg-[#111] p-3 flex justify-between items-center z-10 relative">
                            <button 
                                onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                                className={`text-[10px] font-mono uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] border rounded-sm transition-colors ${isConsoleOpen ? 'text-white border-accent-500' : 'text-[#888] hover:text-white border-[#333] hover:border-[#555]'}`}
                            >
                                <Terminal size={12} /> Console
                            </button>

                            <div className="flex gap-3">
                                <button 
                                    onClick={handleRun}
                                    disabled={runState === 'running' || submitState !== 'idle'}
                                    className="px-5 py-2 bg-[#1a1a1a] border border-[#333] hover:border-[#555] hover:bg-[#222] disabled:opacity-50 text-[#ccc] text-[10px] font-mono uppercase tracking-widest rounded-sm transition-all flex items-center gap-2"
                                >
                                    {runState === 'running' ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />} Run Task
                                </button>
                                <button 
                                    onClick={handleSubmit}
                                    disabled={submitState !== 'idle'}
                                    className="px-5 py-2 bg-[#e0e0e0] border border-[#e0e0e0] hover:bg-white disabled:opacity-50 disabled:bg-[#888] text-black text-[10px] font-mono uppercase tracking-widest font-bold rounded-sm transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(224,224,224,0.15)] group"
                                >
                                    {submitState === 'submitting' ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />} Submit Task
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
