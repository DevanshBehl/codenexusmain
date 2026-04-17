import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    Terminal, Play, Send, CheckCircle2, Circle,
    ChevronLeft, Clock, Activity,
    Trophy, Check, X, Code2, AlertCircle, Settings
} from 'lucide-react';
import { contestApi } from '../../lib/api';

const LANGUAGES = [
    { id: 'cpp', name: 'C++' },
    { id: 'java', name: 'Java' },
    { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' },
];

const DEFAULT_CODES: Record<string, string> = {
    cpp: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}",
    java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}",
    python: "# Your code here\n",
    javascript: "// Your code here\n"
};

interface ContestProblem {
    id: string;
    title: string;
    difficulty: string;
    points: number;
    description?: string;
    constraints?: string;
    testCases?: { input: string; output: string }[];
}

interface ContestLeaderboardEntry {
    rank: number;
    displayName: string;
    score: number;
    problemsSolved: number;
}

export default function Contest() {
    const { id: contestId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [contest, setContest] = useState<any>(null);
    const [problems, setProblems] = useState<ContestProblem[]>([]);
    const [isRegistered, setIsRegistered] = useState(false);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);

    const [currentProblemIdx, setCurrentProblemIdx] = useState(0);
    const [language, setLanguage] = useState('javascript');
    const [codes, setCodes] = useState<Record<string, string>>({});
    const [solvedStatus, setSolvedStatus] = useState<Record<string, boolean>>({});

    const [activeTab, setActiveTab] = useState<'DESCRIPTION' | 'TESTCASES'>('DESCRIPTION');
    const [activeTestCase, setActiveTestCase] = useState(0);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [leaderboardData, setLeaderboardData] = useState<ContestLeaderboardEntry[]>([]);

    const [outputPanel, setOutputPanel] = useState<'HIDDEN' | 'RUN_SUCCESS' | 'RUN_ERROR' | 'SUBMIT_SUCCESS' | 'SUBMIT_ERROR'>('HIDDEN');
    const [isCompiling, setIsCompiling] = useState(false);
    const [output, setOutput] = useState<any>(null);

    const [timeLeft, setTimeLeft] = useState(0);

    const currProblem = problems[currentProblemIdx];
    const currCode = codes[currProblem?.id]?.[language] ?? DEFAULT_CODES[language] ?? '';

    useEffect(() => {
        if (!contestId) return;
        const fetchContest = async () => {
            try {
                const res = await contestApi.getById(contestId);
                const data = res.data;
                setContest(data);

                if (data.problems) {
                    setProblems(data.problems);
                    const initCodes: Record<string, string> = {};
                    data.problems.forEach((p: any) => {
                        initCodes[p.id] = DEFAULT_CODES[language] || '';
                    });
                    setCodes(initCodes);
                }

                try {
                    const regs = await contestApi.getRegistrations(contestId);
                    const myReg = regs.data.find((r: any) => r.student?.user?.id);
                    setIsRegistered(!!myReg);
                } catch (e) {
                    setIsRegistered(false);
                }
            } catch (error) {
                console.error("Failed to fetch contest", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContest();
    }, [contestId]);

    useEffect(() => {
        if (!contest) return;

        const contestStart = new Date(contest.date).getTime();
        const contestEnd = contestStart + (contest.durationMins || 120) * 60 * 1000;
        const now = Date.now();

        if (now < contestStart) {
            setTimeLeft(Math.floor((contestStart - now) / 1000));
        } else if (now < contestEnd) {
            setTimeLeft(Math.floor((contestEnd - now) / 1000));
        } else {
            setTimeLeft(0);
        }

        const timer = setInterval(() => {
            const now = Date.now();
            if (now < contestStart) {
                setTimeLeft(Math.floor((contestStart - now) / 1000));
            } else if (now < contestEnd) {
                setTimeLeft(Math.floor((contestEnd - now) / 1000));
            } else {
                setTimeLeft(0);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [contest]);

    useEffect(() => {
        if (language === 'javascript') {
            setCodes(prev => {
                const updated = { ...prev };
                Object.keys(updated).forEach(pid => {
                    if (!updated[pid] || updated[pid] === DEFAULT_CODES['cpp'] || updated[pid] === DEFAULT_CODES['java'] || updated[pid] === DEFAULT_CODES['python']) {
                        updated[pid] = DEFAULT_CODES['javascript'];
                    }
                });
                return updated;
            });
        }
    }, [language]);

    const handleRegister = async () => {
        if (!contestId) return;
        setRegistering(true);
        try {
            await contestApi.register(contestId);
            setIsRegistered(true);
        } catch (error) {
            console.error("Failed to register", error);
        } finally {
            setRegistering(false);
        }
    };

    const handleRun = async () => {
        if (!currProblem) return;
        setIsCompiling(true);
        setOutputPanel('HIDDEN');
        try {
            const res = await fetch('/api/v1/contests/submissions/run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('cn_token')}`
                },
                body: JSON.stringify({
                    problemId: currProblem.id,
                    language,
                    code: currCode
                })
            });
            const data = await res.json();
            setOutput(data.data || {});
            setOutputPanel(data.data?.verdict === 'accepted' ? 'RUN_SUCCESS' : 'RUN_ERROR');
        } catch (error) {
            setOutputPanel('RUN_ERROR');
        } finally {
            setIsCompiling(false);
        }
    };

    const handleSubmit = async () => {
        if (!currProblem) return;
        setIsCompiling(true);
        setOutputPanel('HIDDEN');
        try {
            const res = await fetch(`/api/v1/contests/${contestId}/submissions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('cn_token')}`
                },
                body: JSON.stringify({
                    problemId: currProblem.id,
                    language,
                    code: currCode
                })
            });
            const data = await res.json();
            setOutput(data.data || {});
            const success = data.data?.status === 'AC' || data.data?.verdict === 'accepted';
            setOutputPanel(success ? 'SUBMIT_SUCCESS' : 'SUBMIT_ERROR');
            if (success) {
                setSolvedStatus(prev => ({ ...prev, [currProblem.id]: true }));
            }
        } catch (error) {
            setOutputPanel('SUBMIT_ERROR');
        } finally {
            setIsCompiling(false);
        }
    };

    const fetchLeaderboard = async () => {
        if (!contestId) return;
        try {
            const res = await contestApi.getLeaderboard(contestId);
            const data = res.data;
            setLeaderboardData(data.rankings || []);
        } catch (error) {
            console.error("Failed to fetch leaderboard", error);
        }
    };

    const handleShowLeaderboard = () => {
        setShowLeaderboard(!showLeaderboard);
        if (!showLeaderboard) {
            fetchLeaderboard();
        }
    };

    const handleCodeChange = (value: string | undefined) => {
        if (!currProblem) return;
        setCodes(prev => ({
            ...prev,
            [currProblem.id]: {
                ...prev[currProblem.id],
                [language]: value || ''
            }
        }));
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const getDifficultyColor = (diff: string) => {
        if (diff === 'Easy') return 'text-green-400 border-green-500/30 bg-green-500/10';
        if (diff === 'Medium') return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
        return 'text-red-400 border-red-500/30 bg-red-500/10';
    };

    if (loading) {
        return (
            <div className="h-screen w-full bg-[#050505] flex items-center justify-center">
                <div className="text-accent-500 font-mono">Loading contest...</div>
            </div>
        );
    }

    if (!contest) {
        return (
            <div className="h-screen w-full bg-[#050505] flex items-center justify-center flex-col gap-4">
                <div className="text-red-500 font-mono">Contest not found</div>
                <Link to="/student/dashboard" className="text-accent-500 hover:text-white">Back to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-[#050505] font-sans text-white flex flex-col overflow-hidden relative selection:bg-accent-500/30 selection:text-white">
            <header className="h-14 border-b border-[#222] bg-[#0A0A0A] shrink-0 flex items-center justify-between px-4 z-20">
                <div className="flex items-center gap-4">
                    <Link to="/student/dashboard" className="text-[#888] hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="font-serif italic font-bold text-accent-500 text-xl">{'<cn/>'}</span>
                        <div className="w-[1px] h-4 bg-[#333] mx-2"></div>
                        <span className="font-mono text-sm uppercase tracking-widest font-bold">{contest.title}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm border ${
                            contest.status === 'ACTIVE' ? 'border-green-500/30 bg-green-500/10 text-green-400' :
                            contest.status === 'UPCOMING' ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400' :
                            'border-red-500/30 bg-red-500/10 text-red-400'
                        }`}>
                            {contest.status}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className={`flex items-center gap-2 font-mono text-lg font-bold ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-accent-400'}`}>
                        <Clock size={16} />
                        {formatTime(timeLeft)}
                    </div>

                    <button
                        onClick={handleShowLeaderboard}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-colors text-xs font-mono uppercase tracking-widest ${showLeaderboard ? 'border-accent-500 text-accent-400 bg-accent-500/10' : 'border-[#333] text-[#aaa] hover:text-white hover:border-[#555]'}`}
                    >
                        <Trophy size={14} /> Leaderboard
                    </button>
                </div>
            </header>

            {!isRegistered && contest.status === 'UPCOMING' && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="bg-[#0A0A0A] border border-[#333] p-8 rounded-sm text-center max-w-md">
                        <h2 className="text-xl font-bold mb-4">Register for this Contest</h2>
                        <p className="text-[#888] text-sm mb-6">{contest.description || 'Join this contest to compete with other students.'}</p>
                        <button
                            onClick={handleRegister}
                            disabled={registering}
                            className="px-6 py-3 bg-accent-500 text-white font-bold rounded-sm hover:bg-accent-600 transition-colors disabled:opacity-50"
                        >
                            {registering ? 'Registering...' : 'Register Now'}
                        </button>
                    </div>
                </div>
            )}

            {!isRegistered && contest.status === 'ACTIVE' && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="bg-[#0A0A0A] border border-[#333] p-8 rounded-sm text-center max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-red-400">Contest has started</h2>
                        <p className="text-[#888] text-sm mb-6">Registration is closed. You can view the problems but cannot submit.</p>
                        <button
                            onClick={() => setIsRegistered(true)}
                            className="px-6 py-3 bg-[#222] border border-[#444] text-white font-bold rounded-sm hover:bg-[#333] transition-colors"
                        >
                            View Problems
                        </button>
                    </div>
                </div>
            )}

            {(isRegistered || contest.status === 'ENDED') && problems.length > 0 && (
                <div className="flex flex-1 overflow-hidden">
                    <div className="w-16 border-r border-[#222] bg-[#0A0A0A] flex flex-col shrink-0 z-10 py-4 gap-2 items-center overflow-y-auto custom-scrollbar">
                        {problems.map((p, idx) => {
                            const isSolved = solvedStatus[p.id];
                            const isActive = idx === currentProblemIdx;
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => { setCurrentProblemIdx(idx); setOutputPanel('HIDDEN'); }}
                                    className={`w-12 h-12 rounded-sm border flex flex-col items-center justify-center relative transition-colors group ${isActive ? 'border-accent-500 bg-[#111] text-accent-400' : 'border-[#333] hover:border-[#555] bg-[#0A0A0A] text-[#888] hover:text-white'}`}
                                    title={p.title}
                                >
                                    <span className="font-mono text-xs font-bold font-sans">Q{idx + 1}</span>
                                    {isSolved ? (
                                        <CheckCircle2 size={10} className="text-green-500 absolute bottom-1.5 right-1.5" />
                                    ) : (
                                        <Circle size={6} className={`absolute bottom-2 right-2 ${isActive ? 'fill-accent-500 text-accent-500' : 'fill-[#333] text-[#333] group-hover:fill-[#555] group-hover:text-[#555]'}`} />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="w-[35%] lg:w-[30%] border-r border-[#222] bg-[#0A0A0A] flex flex-col shrink-0">
                        <div className="flex border-b border-[#222] shrink-0">
                            <button
                                onClick={() => setActiveTab('DESCRIPTION')}
                                className={`flex-1 py-3 text-[10px] font-mono uppercase tracking-widest text-center border-b-2 transition-colors ${activeTab === 'DESCRIPTION' ? 'border-accent-500 text-accent-400 bg-[#111]' : 'border-transparent text-[#666] hover:text-white'}`}
                            >
                                Description
                            </button>
                            <button
                                onClick={() => setActiveTab('TESTCASES')}
                                className={`flex-1 py-3 text-[10px] font-mono uppercase tracking-widest text-center border-b-2 transition-colors ${activeTab === 'TESTCASES' ? 'border-accent-500 text-accent-400 bg-[#111]' : 'border-transparent text-[#666] hover:text-white'}`}
                            >
                                Test Cases
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                            {activeTab === 'DESCRIPTION' && currProblem && (
                                <div className="space-y-6 animate-fade-in">
                                    <div>
                                        <h1 className="text-xl font-bold font-sans tracking-tight mb-2">{currProblem.title}</h1>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-sm border ${getDifficultyColor(currProblem.difficulty)}`}>
                                                {currProblem.difficulty}
                                            </span>
                                            <span className="text-[10px] font-mono text-[#888] px-2 py-0.5 border border-[#333] rounded-sm bg-[#111]">
                                                Score: {currProblem.points}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-sm font-sans text-[#ccc] leading-relaxed whitespace-pre-wrap">
                                        {currProblem.description || 'No description available.'}
                                    </div>

                                    {currProblem.constraints && (
                                        <div>
                                            <h3 className="text-xs font-bold font-mono text-white mb-2">Constraints:</h3>
                                            <pre className="bg-[#111] border border-[#333] p-3 rounded-sm font-mono text-xs text-[#aaa] whitespace-pre-wrap">
                                                {currProblem.constraints}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'TESTCASES' && currProblem?.testCases && (
                                <div className="space-y-4 animate-fade-in flex flex-col h-full">
                                    <div className="flex gap-2 border-b border-[#222] pb-2 overflow-x-auto custom-scrollbar">
                                        {currProblem.testCases.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setActiveTestCase(i)}
                                                className={`px-3 py-1.5 rounded-sm text-xs font-mono transition-colors shrink-0 ${activeTestCase === i ? 'bg-[#222] text-white border border-[#444]' : 'bg-[#111] text-[#888] border border-transparent hover:text-white'}`}
                                            >
                                                Case {i + 1}
                                            </button>
                                        ))}
                                    </div>

                                    {currProblem.testCases[activeTestCase] && (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-mono text-[#888] uppercase tracking-widest mb-1 block">Input</label>
                                                <pre className="bg-[#111] border border-[#333] p-3 rounded-sm font-mono text-xs text-[#ccc] whitespace-pre-wrap">
                                                    {currProblem.testCases[activeTestCase].input}
                                                </pre>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-mono text-[#888] uppercase tracking-widest mb-1 block">Expected Output</label>
                                                <pre className="bg-[#111] border border-[#333] p-3 rounded-sm font-mono text-xs text-[#ccc] whitespace-pre-wrap">
                                                    {currProblem.testCases[activeTestCase].output}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0A]">
                        <div className="h-12 border-b border-[#222] bg-[#0A0A0A] flex items-center justify-between px-4 shrink-0">
                            <div className="flex items-center gap-3">
                                <Code2 size={16} className="text-[#666]" />
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="bg-[#111] border border-[#333] text-sm text-[#ccc] font-mono rounded-sm px-2 py-1 outline-none focus:border-accent-500 cursor-pointer"
                                >
                                    {LANGUAGES.map(l => (
                                        <option key={l.id} value={l.id}>{l.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleRun}
                                    disabled={isCompiling || contest.status !== 'ACTIVE'}
                                    className="px-4 py-1.5 bg-[#111] border border-[#333] text-white text-[10px] font-mono uppercase tracking-widest rounded-sm hover:border-accent-500 hover:text-accent-400 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isCompiling ? <Activity size={12} className="animate-spin" /> : <Play size={12} />} Run
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isCompiling || contest.status !== 'ACTIVE'}
                                    className="px-6 py-1.5 bg-accent-500 text-white font-bold text-[10px] font-mono uppercase tracking-widest rounded-sm hover:bg-accent-600 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm shadow-accent-500/20"
                                >
                                    {isCompiling ? <Activity size={12} className="animate-spin" /> : <Send size={12} />} Submit
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 relative min-h-0 bg-[#0A0A0A]">
                            <div className="absolute inset-0">
                                <Editor
                                    height="100%"
                                    language={language}
                                    theme="vs-dark"
                                    value={currCode}
                                    onChange={handleCodeChange}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, 'Courier New', monospace",
                                        lineNumbers: 'on',
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        padding: { top: 16, bottom: 16 },
                                    }}
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {outputPanel !== 'HIDDEN' && output && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 250, opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-[#222] bg-[#0A0A0A] flex flex-col shrink-0"
                                >
                                    <div className="flex items-center justify-between px-4 py-2 border-b border-[#222] bg-[#111]">
                                        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
                                            <Terminal size={12} className="text-[#888]" />
                                            <span className="text-white">Execution Result</span>
                                        </div>
                                        <button onClick={() => setOutputPanel('HIDDEN')} className="text-[#888] hover:text-white">
                                            <X size={14} />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                        {(outputPanel === 'RUN_SUCCESS' || outputPanel === 'SUBMIT_SUCCESS') && (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 text-green-400 font-bold font-sans text-lg">
                                                    <CheckCircle2 size={18} /> Accepted
                                                </div>
                                                <div className="bg-[#111] border border-[#333] rounded-sm p-3 font-mono text-xs text-[#ccc]">
                                                    <div className="text-[#888] mb-1">Status:</div>
                                                    <div className="text-white">{output.verdict || 'AC'}</div>
                                                </div>
                                            </div>
                                        )}

                                        {(outputPanel === 'RUN_ERROR' || outputPanel === 'SUBMIT_ERROR') && (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 text-red-500 font-bold font-sans text-lg">
                                                    <AlertCircle size={18} /> Error
                                                </div>
                                                <div className="bg-red-500/10 border border-red-500/30 rounded-sm p-4 font-mono text-xs text-red-400 whitespace-pre-wrap">
                                                    {output.error_message || 'An error occurred during execution.'}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {showLeaderboard && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLeaderboard(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-14 bottom-0 right-0 w-full sm:w-96 lg:w-[450px] bg-[#0A0A0A] border-l border-[#222] shadow-2xl z-50 flex flex-col"
                        >
                            <div className="h-14 border-b border-[#222] flex items-center justify-between px-4 shrink-0 bg-[#111]">
                                <h3 className="font-bold flex items-center gap-2 font-sans tracking-widest uppercase text-sm">
                                    <Trophy size={16} className="text-accent-500" /> Contest Leaderboard
                                </h3>
                                <button onClick={() => setShowLeaderboard(false)} className="text-[#888] hover:text-white transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                                <table className="w-full text-left font-mono text-xs text-[#aaa]">
                                    <thead className="bg-[#111] sticky top-0 z-10 border-b border-[#222] text-[10px] uppercase tracking-widest">
                                        <tr>
                                            <th className="px-4 py-3 font-normal">Rank</th>
                                            <th className="px-4 py-3 font-normal">User</th>
                                            <th className="px-4 py-3 font-normal text-right">Score</th>
                                            <th className="px-4 py-3 font-normal text-right">Solved</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#222]">
                                        {leaderboardData.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-8 text-center text-[#666]">No submissions yet</td>
                                            </tr>
                                        ) : (
                                            leaderboardData.map((entry) => (
                                                <tr key={entry.rank} className="hover:bg-[#111] transition-colors">
                                                    <td className="px-4 py-3">
                                                        {entry.rank === 1 ? <span className="text-yellow-400 font-bold">1</span> :
                                                         entry.rank === 2 ? <span className="text-[#ccc] font-bold">2</span> :
                                                         entry.rank === 3 ? <span className="text-[#cd7f32] font-bold">3</span> : entry.rank}
                                                    </td>
                                                    <td className="px-4 py-3 font-bold text-white">{entry.displayName}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-accent-400">{entry.score}</td>
                                                    <td className="px-4 py-3 text-right text-[#888]">{entry.problemsSolved}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                  width: 6px;
                  height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: #333;
                  border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: #555;
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </div>
    );
}