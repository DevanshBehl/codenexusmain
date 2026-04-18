import { useState, useRef, useEffect, useCallback } from 'react';
import { Terminal, Play, Send, Settings, Lock } from 'lucide-react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { Socket } from 'socket.io-client';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';

/* ── Language mapping for Monaco ── */
const LANGUAGE_MAP: Record<string, string> = {
    cpp: 'cpp',
    java: 'java',
    python: 'python',
    javascript: 'javascript',
};

const DEFAULT_CODE: Record<string, string> = {
    cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> numMap;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (numMap.count(complement)) {
                return {numMap[complement], i};
            }
            numMap[nums[i]] = i;
        }
        return {};
    }
};`,
    java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }
}`,
    python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        num_map = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in num_map:
                return [num_map[complement], i]
            num_map[num] = i
        return []`,
    javascript: `function twoSum(nums, target) {
    const numMap = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (numMap.has(complement)) {
            return [numMap.get(complement), i];
        }
        numMap.set(nums[i], i);
    }
    return [];
}`,
};

interface InterviewEditorProps {
    socket: Socket | null;
    interviewId: string;
    role: 'student' | 'recruiter';
    onSubmit?: () => void;
}

export default function InterviewEditor({ socket, interviewId, role, onSubmit }: InterviewEditorProps) {
    const [language, setLanguage] = useState('cpp');
    const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
    const isRemoteUpdate = useRef(false);
    const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isStudent = role === 'student';

    const handleEditorDidMount: OnMount = (editor) => {
        editorRef.current = editor;
        if (isStudent) editor.focus();
        
        // Phase 2: Yjs Initialization
        if (socket) {
            const doc = new Y.Doc();
            const type = doc.getText('monaco');
            const model = editor.getModel();
            
            // @ts-ignore
            const binding = new MonacoBinding(type, model, new Set([editor]), null);

            doc.on('update', (update: Uint8Array, origin: any) => {
                if (origin !== socket) {
                    socket.emit('yjs-update', { interviewId, update: Array.from(update) });
                }
            });

            socket.on('yjs-update', (data: { update: number[] }) => {
                Y.applyUpdate(doc, new Uint8Array(data.update), socket);
            });

            socket.on('yjs-state', (data: { updates: number[][] }) => {
                if (data.updates) {
                    data.updates.forEach(u => Y.applyUpdate(doc, new Uint8Array(u), socket));
                }
            });
            
            // Clean up old text-based code-sync
            socket.on('code-sync', (data: { language: string }) => {
                if (data.language && data.language !== language) {
                    setLanguage(data.language);
                }
            });
        }
    };

    const handleLanguageChange = (newLang: string) => {
        setLanguage(newLang);
        if (socket && isStudent) {
            socket.emit('code-sync', {
                interviewId,
                code: '',
                language: newLang,
            });
        }
    };

    // Receive general socket cleanups mapped from didMount
    useEffect(() => {
        return () => {
            if (socket) {
                socket.off('yjs-update');
                socket.off('yjs-state');
                socket.off('code-sync');
            }
        };
    }, [socket]);

    return (
        <section className="h-full min-h-0 border border-accent-500/30 bg-[#050505] rounded-sm overflow-hidden flex flex-col relative group hover:border-accent-500/60 transition-colors shadow-[0_0_20px_oklch(0.777_0.152_181.912_/_0.05)]">
            {/* Editor Header */}
            <div className="h-12 border-b border-[#333] flex items-center justify-between px-4 bg-[#111]">
                <div className="flex items-center gap-3">
                    <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        disabled={!isStudent}
                        className="bg-[#222] border border-[#333] text-white text-sm rounded-sm px-3 py-1.5 focus:outline-none focus:border-accent-500/50 appearance-none font-mono cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                        <option value="python">Python 3</option>
                        <option value="javascript">JavaScript</option>
                    </select>
                    <button className="p-1.5 rounded-sm hover:bg-[#222] text-[#666] hover:text-white transition-colors border border-transparent hover:border-[#333]">
                        <Settings size={16} />
                    </button>
                    {!isStudent && (
                        <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-[#333] rounded-sm px-2.5 py-1 ml-2">
                            <Lock size={12} className="text-[#666]" />
                            <span className="text-[9px] font-mono text-[#666] uppercase tracking-widest">View Only</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {isStudent && (
                        <>
                            <button className="flex items-center gap-2 px-4 py-1.5 bg-[#222] hover:bg-[#333] border border-[#333] rounded-sm text-sm font-medium transition-all text-white/90">
                                <Play size={14} className="text-green-400" />
                                Run
                            </button>
                            <button
                                onClick={onSubmit}
                                className="flex items-center gap-2 px-4 py-1.5 bg-accent-500/20 hover:bg-accent-500/30 border border-accent-500/50 rounded-sm text-sm font-semibold transition-all text-accent-400"
                            >
                                <Send size={14} />
                                Submit
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 relative min-h-0">
                <div className="absolute inset-0">
                <Editor
                    height="100%"
                    defaultLanguage={LANGUAGE_MAP[language]}
                    language={LANGUAGE_MAP[language]}
                    defaultValue={DEFAULT_CODE[language]}
                    theme="vs-dark"
                    onMount={handleEditorDidMount}
                    options={{
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, 'Courier New', monospace",
                        fontLigatures: true,
                        lineNumbers: 'on',
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 4,
                        wordWrap: 'off',
                        renderWhitespace: 'selection',
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
                        foldingHighlight: true,
                        matchBrackets: 'always',
                        renderLineHighlight: 'line',
                        renderLineHighlightOnlyWhenFocus: false,
                        lineDecorationsWidth: 8,
                        padding: { top: 16, bottom: 16 },
                        overviewRulerBorder: false,
                        hideCursorInOverviewRuler: true,
                        readOnly: !isStudent,
                        domReadOnly: !isStudent,
                        scrollbar: {
                            vertical: 'auto',
                            horizontal: 'auto',
                            verticalScrollbarSize: 6,
                            horizontalScrollbarSize: 6,
                        },
                    }}
                />
                </div>

                {/* Floating watermark/logo */}
                <div className="absolute bottom-4 right-4 opacity-5 pointer-events-none z-10">
                    <Terminal size={120} />
                </div>
            </div>
        </section>
    );
}
