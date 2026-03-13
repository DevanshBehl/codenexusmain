import { useState } from 'react';
import { ChevronRight, Terminal, Video, PenTool, BrainCircuit, Users, Building2, Code2, LineChart, ShieldCheck, Zap } from 'lucide-react';

function Navbar() {
  return (
    <nav className="w-full border-b border-[#333] flex items-center justify-between px-6 py-4 bg-[#050505]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 text-accent-500 font-bold text-xl italic font-serif">
          <span>{'<'}cn/{'>'}</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-[#888]">
          <a href="#" className="text-white border-b-2 border-accent-500 pb-1">CodeNexus</a>
          <a href="#prep" className="hover:text-white transition-colors">For Students</a>
          <a href="#hiring" className="hover:text-white transition-colors">For HR & Universities</a>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-4 text-sm font-mono">
        <span className="text-[#888] tracking-wider text-xs">start your interview prep!</span>
        <button className="bg-[#e0e0e0] text-black px-4 py-1.5 font-bold hover:bg-white transition-colors">
          Get Access
        </button>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="py-24 px-6 border-b border-[#333] flex flex-col items-center justify-center text-center relative min-h-[90vh]">
      <div className="inline-flex items-center gap-2 border border-[#333] bg-[#111] px-3 py-1 text-xs text-[#aaa] rounded-sm mb-8 hover:bg-[#222] cursor-pointer transition-colors font-mono tracking-wide">
        <span className="bg-[#787878] text-white px-1.5 py-0.5 rounded-sm font-bold text-[10px]">NEW</span>
        <span>Real-time AI Mock Interviews</span>
        <ChevronRight size={14} />
      </div>

      <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white max-w-5xl uppercase tracking-tight leading-[1.1] mb-6 font-sans">
        THE ALL-IN-ONE PLATFORM FOR <br /> PLACEMENT PREP & TECHNICAL HIRING
      </h1>

      <p className="text-[#888] max-w-3xl mx-auto text-sm md:text-base leading-relaxed mb-10 font-mono text-center">
        Practice LeetCode-style DSA problems, take real-time AI mock interviews, and connect with universities and recruiters. Say goodbye to uncoordinated screen sharing with our lag-free collaborative IDE, 1-on-1 video conferencing, and built-in interactive whiteboards.
      </p>

      <div className="flex items-center gap-4 mb-20">
        <button className="bg-[#e0e0e0] text-black px-6 py-3 font-bold hover:bg-white transition-colors text-sm font-mono">
          Start Practicing
        </button>
        <button className="border border-[#555] bg-transparent text-white px-6 py-3 font-bold hover:bg-[#111] transition-colors text-sm flex items-center gap-2 font-mono">
          Schedule Interview
        </button>
      </div>

      <div className="w-full max-w-5xl border border-[#333] bg-[#0a0a0a] rounded-sm p-4 relative shadow-2xl">
        {/* Render some mock UI here in DevDoq style with the new cyan theme */}
        <div className="border border-[#333] rounded-sm overflow-hidden flex flex-col h-[450px]">
          {/* Tab header */}
          <div className="flex bg-[#111] border-b border-[#333]">
            <div className="px-4 py-2 border-r border-[#333] text-xs text-accent-400 border-b-2 border-accent-500 font-mono flex items-center gap-2"><Terminal size={12} /> ide.ts</div>
            <div className="px-4 py-2 border-r border-[#333] text-xs text-[#666] font-mono flex items-center gap-2"><PenTool size={12} /> whiteboard</div>
            <div className="px-4 py-2 border-r border-[#333] text-xs text-[#666] font-mono flex items-center gap-2"><Video size={12} /> video call</div>
            <div className="px-4 py-2 border-r border-[#333] text-xs text-[#666] font-mono">chat</div>
          </div>

          <div className="flex flex-1">
            <div className="w-[60%] p-6 border-r border-[#333] flex flex-col text-left font-mono relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-bold text-xs uppercase tracking-widest text-[#aaa]">LIVE INTERVIEW SESSION</h3>
                </div>
                <div className="flex gap-2 text-xs text-[#666]">
                  <span className="text-red-500 animate-pulse flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> REC 00:14:32</span>
                </div>
              </div>

              {/* IDE Content */}
              <div className="flex-1 overflow-hidden relative border border-[#222] bg-[#050505] p-4 text-xs">
                <span className="text-[#555]">1 | <span className="text-accent-400">function</span> <span className="text-blue-300">maxSlidingWindow</span>(nums, k) {'{\n'}</span>
                <span className="text-[#555]">2 |   <span className="text-[#888]">// Interviewer added a hint here: Use a deque</span>{'\n'}</span>
                <span className="text-[#555]">3 |   const result = [];{'\n'}</span>
                <span className="text-[#555]">4 |   const deque = [];{'\n'}</span>
                <span className="text-[#555]">5 |   <span className="text-accent-400">for</span> (let i = 0; i {'<'} nums.length; i++) {'{\n'}</span>
                <span className="text-[#555]">6 |     <span className="text-accent-400">while</span> (deque.length {'>'} 0 {'&&'} deque[0] {'<='} i - k) {'{\n'}</span>
                <span className="text-[#555]">7 |       deque.<span className="text-blue-300">shift</span>();{'\n'}</span>
                <span className="text-[#555]">8 |     {'}\n'}</span>
                <span className="text-[#555]">9 |     <span className="text-accent-400">while</span> (deque.length {'>'} 0 {'&&'} nums[deque[deque.length - 1]] {'<'} nums[i]) {'{\n'}</span>
                <span className="text-[#555]">10|       deque.<span className="text-blue-300">pop</span>();{'\n'}</span>
                <span className="text-[#555]">11|     {'}\n'}</span>
                <span className="text-[#555]">12|     deque.<span className="text-blue-300">push</span>(i);{'\n'}</span>
                <span className="text-[#555]">13| <span className="inline-block w-1.5 h-3 bg-accent-400 animate-pulse"></span></span>

                {/* Cursor Indicator */}
                <div className="absolute left-[36%] top-[65%] glass-card bg-accent-500/20 border border-accent-500/50 px-2 py-0.5 rounded-sm text-[9px] text-accent-400">Student is typing...</div>
              </div>
            </div>

            {/* Right panel: Video & Architecture/Reports */}
            <div className="w-[40%] bg-[#050505] p-4 flex flex-col relative overflow-hidden group border-t border-l border-[#222]">
              <div className="text-xs text-[#888] flex justify-between items-center mb-4 relative z-10 font-mono">
                <h3 className="flex items-center gap-2"><ChevronRight size={14} className="text-accent-500" /> Multi-Tool Panel</h3>
                <div className="flex gap-2">
                  <span className="px-2 border border-[#333] bg-[#222] text-white rounded-[2px] border-b-2 border-b-accent-500">Video</span>
                  <span className="px-2 border border-[#333] bg-[#111] rounded-[2px]">Diagram</span>
                </div>
              </div>

              {/* Video Feed Mocks */}
              <div className="flex-1 flex flex-col gap-3">
                {/* Interviewer Video */}
                <div className="flex-1 bg-[#111] border border-[#333] relative rounded-sm flex items-center justify-center group-hover:border-[#444] transition-colors">
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 text-[9px] uppercase tracking-widest font-mono text-white">HR / Interviewer</div>
                  <Users size={24} className="text-[#333]" />
                </div>
                {/* Student Video */}
                <div className="flex-1 bg-[#111] border border-accent-500/50 shadow-[0_0_15px_oklch(0.777_0.152_181.912_/_0.15)] relative rounded-sm flex items-center justify-center">
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 text-[9px] uppercase tracking-widest font-mono text-accent-400">Student (You)</div>
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    <span className="w-1 h-3 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="w-1 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                  <Users size={24} className="text-[#444]" />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Marquee() {
  return (
    <div className="w-full overflow-hidden border-b border-[#333] bg-[#050505] py-2 flex">
      <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite] flex gap-4 text-[#888] font-mono">
        {[...Array(10)].map((_, i) => (
          <span key={i} className="px-4 font-bold text-xs uppercase tracking-widest text-[#555]">
            DSA PREP · AI MOCKS · LIVE IDE · SYSTEM ARCHITECTURE WHITEBOARD · HR REPORTS
          </span>
        ))}
      </div>
    </div>
  )
}

function FeaturesTabs() {
  return (
    <section className="py-24 px-6 border-b border-[#333] flex flex-col bg-[#050505]" id="prep">
      <div className="flex gap-4 mb-10 text-sm max-w-6xl mx-auto w-full">
        <div className="border border-[#333] px-4 py-2 bg-[#111] text-white cursor-pointer font-sans font-medium text-xs rounded-[2px] shadow-[0_2px_0_oklch(0.777_0.152_181.912)]">For Students (Prep & AI Mocks)</div>
        <div className="border border-transparent px-4 py-2 text-[#666] cursor-pointer hover:text-white font-sans font-medium text-xs">For Recruiters (Live Interviews)</div>
      </div>

      <div className="flex flex-col md:flex-row gap-16 items-center max-w-6xl mx-auto w-full">
        <div className="w-full md:w-1/2">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 uppercase font-sans tracking-[0.02em]">MASTER THE INTERVIEW PROCESS</h2>
          <p className="text-[#888] text-sm md:text-[15px] leading-[1.8] mb-8 font-mono">
            Don't wait for your dream company to test your skills. With CodeNexus, students can practice a massive library of LeetCode-style DSA problems in the exact same IDE they will be interviewed in.
            <br /><br />
            Switch to <strong>Real-Time AI Mock Interviews</strong>, where an AI evaluator acts as your interviewer—testing your logic, code efficiency, and giving instant, actionable feedback to help you improve before the real thing.
          </p>
          <button className="bg-white text-black font-bold px-4 py-2 flex items-center gap-2 hover:bg-[#e0e0e0] transition-colors text-xs font-mono rounded-[2px]">
            Try an AI Mock <ChevronRight size={14} />
          </button>
        </div>
        <div className="w-full md:w-1/2 flex justify-center">
          {/* Abstract node graph representing AI/DSA prep */}
          <div className="relative w-[300px] h-[300px] hover:scale-105 transition-transform duration-700 flex items-center justify-center">
            <BrainCircuit size={160} strokeWidth={1} className="text-accent-500 drop-shadow-[0_0_20px_oklch(0.777_0.152_181.912_/_0.3)]" />

            <div className="absolute inset-0">
              <div className="absolute top-10 left-10 w-3 h-3 bg-white rounded-full animate-ping"></div>
              <div className="absolute bottom-20 right-10 w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 right-4 w-4 h-4 bg-accent-400 rounded-full drop-shadow-[0_0_10px_oklch(0.777_0.152_181.912)] animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function DetailedFeatures() {
  const features = [
    {
      icon: <Code2 size={24} className="text-accent-500" />,
      title: "LeetCode-Style Practice Hub",
      description: "Access 1000+ curated DSA problems categorized by difficulty and pattern. Practice in the exact same IDE environment you'll use for real interviews so you are uniquely prepared."
    },
    {
      icon: <BrainCircuit size={24} className="text-accent-500" />,
      title: "AI Interviewer (Beta)",
      description: "Take on-demand mock interviews with an AI that observes your code, asks follow up optimization questions, and scores your communication skills in real-time."
    },
    {
      icon: <Terminal size={24} className="text-accent-500" />,
      title: "Collaborative IDE environment",
      description: "Lag-free syntax highlighting, auto-completion, and multi-cursor support for over 20+ programming languages. Execute code and see test case results instantly."
    },
    {
      icon: <PenTool size={24} className="text-accent-500" />,
      title: "Infinite Whiteboard Canvas",
      description: "Draw system architecture diagrams or trace complex data structures visually using our built-in whiteboard. Perfect for senior backend or full-stack interviews."
    },
    {
      icon: <Video size={24} className="text-accent-500" />,
      title: "Integrated Video Conferencing",
      description: "No more juggling Zoom links and separate code editors. Enjoy crystal clear 1-on-1 WebRTC video calling embedded directly next to the code editor."
    },
    {
      icon: <LineChart size={24} className="text-accent-500" />,
      title: "University & HR Dashboards",
      description: "Manage candidate pipelines, schedule interviews across timezone, and review highly detailed candidate scorecards and session recordings."
    },
    {
      icon: <Zap size={24} className="text-accent-500" />,
      title: "Instant Session Playback",
      description: "Interviews are recorded as keystroke/video logs. Hiring committees can replay the exact problem-solving timeline rather than relying on brief interviewer notes."
    },
    {
      icon: <ShieldCheck size={24} className="text-accent-500" />,
      title: "Anti-Plagiarism & Proctoring",
      description: "Ensure candidate integrity with built-in tab-tracking, copy-paste detection, and AI similarity scores across all completed interview sessions."
    }
  ];

  return (
    <section className="py-24 px-6 border-b border-[#333] bg-[#050505]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white uppercase font-sans tracking-tight mb-4 border-l-4 border-accent-500 pl-4">COMPREHENSIVE TOOLSET</h2>
          <p className="text-[#888] font-mono text-sm max-w-2xl leading-relaxed pl-5">
            Everything you need to practice, execute, and analyze technical interviews.
            CodeNexus replaces 4 disjointed tools with one streamlined platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-[#0A0A0A] border border-[#222] p-6 rounded-sm hover:border-accent-500/50 hover:bg-[#111] transition-all group">
              <div className="mb-4 bg-[#111] w-12 h-12 flex items-center justify-center rounded-sm border border-[#333] group-hover:scale-110 transition-transform shadow-[0_0_15px_oklch(0.777_0.152_181.912_/_0.0)] group-hover:shadow-[0_0_15px_oklch(0.777_0.152_181.912_/_0.2)]">
                {feature.icon}
              </div>
              <h3 className="text-white font-bold mb-3 font-sans text-sm tracking-wide">{feature.title}</h3>
              <p className="text-[#888] font-mono text-xs leading-relaxed group-hover:text-[#aaa] transition-colors">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function UnderTheHood() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { title: "Collaborative Live IDE", icon: <Terminal size={16} /> },
    { title: "Video & Chat System", icon: <Video size={16} /> },
    { title: "Interactive Whiteboard", icon: <PenTool size={16} /> },
    { title: "AI Evaluator Analysis", icon: <BrainCircuit size={16} /> },
    { title: "University & HR Reports", icon: <Building2 size={16} /> },
  ];

  return (
    <section className="py-24 px-6 border-b border-[#333] bg-[#050505]" id="hiring">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-white uppercase font-sans tracking-tight mb-4">CODENEXUS INTERVIEW ARCHITECTURE</h2>
        <p className="text-[#888] font-mono text-xs max-w-2xl mx-auto leading-relaxed">
          The complete toolkit for Universities and Companies to manage, execute, and analyze technical hiring cycles.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto items-stretch border border-[#222]">
        <div className="w-full md:w-1/3 flex flex-col bg-[#0A0A0A] border-r border-[#222]">
          {steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`flex items-center gap-4 px-6 py-6 text-xs font-mono text-left transition-colors border-l-2
                ${activeStep === idx ? 'bg-[#151515] border-white text-white' : 'border-transparent text-[#666] hover:bg-[#111] hover:text-[#aaa]'}`}
            >
              <div className={activeStep === idx ? 'text-white' : 'text-[#555]'}>{step.icon}</div>
              {step.title}
            </button>
          ))}
        </div>

        <div className="w-full md:w-2/3 flex flex-col p-8 bg-[#050505]">
          <div className="bg-[#111] border border-[#222] p-8 aspect-[16/9] flex items-center justify-center relative mb-8 rounded-sm overflow-hidden">

            {activeStep === 0 && (
              <div className="w-full h-full border border-[#333] bg-[#050505] p-4 font-mono text-xs relative">
                <div className="flex justify-between text-[#555] mb-2 border-b border-[#222] pb-2">
                  <span>index.js - Active Session</span>
                  <span className="text-accent-500">Nodev20 - JS</span>
                </div>
                <span className="text-blue-300">console</span>.<span className="text-yellow-200">log</span>(<span className="text-green-300">"Candidate and HR code in real time"</span>);
                <div className="absolute top-1/2 left-10 flex flex-col">
                  <div className="px-2 py-0.5 bg-white text-black text-[9px] font-bold rounded-sm mb-1 self-start">HR Added Testcase</div>
                  <div className="w-0.5 h-4 bg-white animate-pulse"></div>
                </div>
                <div className="absolute top-[60%] left-40 flex flex-col">
                  <div className="px-2 py-0.5 bg-accent-500 text-white text-[9px] font-bold rounded-sm mb-1 self-start">Student Typing</div>
                  <div className="w-0.5 h-4 bg-accent-500 animate-pulse"></div>
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="w-full h-full flex gap-4">
                <div className="flex-1 border border-[#333] bg-[#0A0A0A] rounded-md relative flex items-center justify-center">
                  <div className="absolute top-2 left-2 flex items-center gap-1 text-[9px] text-[#888]"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Recording...</div>
                  <Users size={32} className="text-[#333]" />
                </div>
                <div className="w-1/3 border border-[#333] bg-[#050505] rounded-md flex flex-col">
                  <div className="p-2 border-b border-[#222] text-[9px] text-[#666] font-mono">Live Chat</div>
                  <div className="p-2 flex-1 flex flex-col gap-2">
                    <div className="bg-[#111] rounded p-1 text-[8px] text-[#aaa] self-end max-w-[80%]">Can you explain the Big-O?</div>
                    <div className="bg-accent-500/10 border border-accent-500/30 rounded p-1 text-[8px] text-accent-400 self-start max-w-[80%]">Yes! It is O(N).</div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="w-full h-full border border-dashed border-[#555] bg-[#0A0A0A] rounded-md relative">
                <svg className="w-full h-full p-4" viewBox="0 0 100 100">
                  <rect x="10" y="40" width="20" height="20" rx="2" fill="none" stroke="oklch(0.777 0.152 181.912)" strokeWidth="0.5" />
                  <rect x="70" y="40" width="20" height="20" rx="2" fill="none" stroke="#fff" strokeWidth="0.5" />
                  <path d="M 30 50 L 65 50" stroke="#888" strokeWidth="0.5" strokeDasharray="2,2" />
                  <polygon points="65,48 70,50 65,52" fill="#888" />
                  <text x="20" y="52" fontSize="4" fill="#aaa" textAnchor="middle" fontFamily="monospace">Client</text>
                  <text x="80" y="52" fontSize="4" fill="#aaa" textAnchor="middle" fontFamily="monospace">API</text>
                </svg>
                <div className="absolute top-2 right-2 flex gap-2">
                  <div className="w-4 h-4 rounded bg-[#222] flex items-center justify-center"><PenTool size={10} className="text-white" /></div>
                  <div className="w-4 h-4 rounded bg-[#111] border border-[#333]"></div>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="w-full h-full border border-accent-500/20 bg-accent-500/5 p-6 font-mono text-xs flex flex-col justify-center">
                <div className="flex items-center gap-2 text-accent-400 mb-4"><BrainCircuit size={16} /> AI Mock Complete</div>
                <div className="w-full h-1 bg-[#222] mb-2"><div className="w-[85%] h-full bg-accent-500"></div></div>
                <div className="flex justify-between text-[#888] text-[9px] mb-4"><span>Overall Score</span><span>85/100</span></div>
                <div className="text-[#aaa] text-[10px] bg-[#0a0a0a] p-2 border border-[#333] rounded-sm">
                  "Great optimal solution using HashMap. Communication was clear, but missed edge case on line 12."
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div className="w-full h-full border border-[#333] bg-[#0A0A0A] p-4 flex flex-col gap-2">
                <div className="flex justify-between pb-2 border-b border-[#222]">
                  <span className="text-[10px] text-white">University HR Dashboard</span>
                  <span className="text-[10px] bg-white text-black px-1 pb-0.5 rounded-sm">Schedule New</span>
                </div>
                {[1, 2, 3].map((val) => (
                  <div key={val} className="flex justify-between items-center bg-[#111] p-2 rounded-sm border border-[#222]">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#333] rounded-full"></div>
                      <span className="text-[9px] text-[#aaa] font-mono">Student 00{val}</span>
                    </div>
                    <span className={`text-[9px] px-1 py-0.5 rounded-sm ${val === 1 ? 'bg-green-500/20 text-green-400' : 'bg-[#222] text-[#888]'}`}>
                      {val === 1 ? "Passed - 92/100" : "Interview Pending"}
                    </span>
                  </div>
                ))}
              </div>
            )}

          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-4 font-mono">
              <span className="text-accent-500">[SYSTEM]</span> {steps[activeStep].title.toUpperCase()}
            </h3>
            <p className="text-[#888] font-mono text-[13px] leading-[1.8] mb-4">
              {activeStep === 0 && "Instead of screen sharing, the interviewer and student connect to a lag-free collaborative IDE. Both can type, run code in multiple languages, and add test cases instantly without constantly asking 'can you show me line 42?'."}
              {activeStep === 1 && "Built entirely in the browser. 1-on-1 WebRTC video conferencing is built adjacent to the code editor. Say goodbye to juggling separate Zoom links. All interviews can be securely recorded for hiring committees."}
              {activeStep === 2 && "A fully interactive whiteboard allows candidates to draw system architecture diagrams, database schemas, and data flow charts in real-time, side by side with the interviewer."}
              {activeStep === 3 && "Students can take practice sessions where an AI evaluator acts as the interviewer. It challenges their code, asks follow up questions, and provides a structured evaluation scorecard to prep for the real interview."}
              {activeStep === 4 && "Universities and Corporate HR teams access a unified dashboard to track all student progress. They can view AI Mock reports, schedule real interviews, and parse through recorded sessions effortlessly."}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="py-32 px-6 flex flex-col items-center justify-center text-center bg-[#050505] min-h-[70vh] relative overflow-hidden">

      <div className="mb-10 text-[120px] leading-none font-bold text-accent-600 italic font-serif opacity-90 drop-shadow-[0_0_40px_oklch(0.777_0.152_181.912_/_0.3)] select-none">
        {'<'}cn/{'>'}
      </div>

      <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 uppercase font-sans tracking-tight">YOU SHOWCASE THE SKILLS</h2>
      <h2 className="text-3xl md:text-5xl font-bold text-white mb-12 uppercase font-sans tracking-tight">WE PROVIDE THE PLATFORM</h2>

      <div className="flex gap-4 mb-32 z-10 font-mono">
        <button className="bg-[#e0e0e0] text-black px-8 py-3 font-bold hover:bg-white transition-colors text-sm hover:scale-105 transform duration-200">
          Student Sign Up
        </button>
        <button className="bg-transparent text-white border border-[#555] px-8 py-3 font-bold hover:bg-[#111] transition-colors text-sm hover:scale-105 transform duration-200">
          University & HR Login
        </button>
      </div>

      <div className="w-full flex flex-col md:flex-row items-center justify-between pt-10 border-t border-[#333] border-dashed mt-auto font-mono z-10">
        <div className="flex flex-col items-start mb-6 md:mb-0">
          <span className="text-xl font-bold text-white mb-2">codenexus</span>
          <span className="text-[10px] text-accent-500 tracking-widest uppercase">© 2025 codenexus - All Rights Reserved</span>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-6 text-white mb-4 font-bold text-sm">
            <span className="border-b-2 border-white pb-0.5 tracking-wider cursor-pointer hover:text-accent-400 hover:border-accent-400 transition-colors">GH</span>
            <span className="border-b-2 border-white pb-0.5 tracking-wider cursor-pointer hover:text-accent-400 hover:border-accent-400 transition-colors">X</span>
            <span className="border-b-2 border-white pb-0.5 tracking-wider cursor-pointer hover:text-accent-400 hover:border-accent-400 transition-colors">IG</span>
            <span className="border-b-2 border-white pb-0.5 tracking-wider cursor-pointer hover:text-accent-400 hover:border-accent-400 transition-colors">EM</span>
          </div>
          <div className="border border-[#333] px-3 py-1 bg-[#111] flex items-center gap-2 text-[10px] text-[#888] mb-3 rounded-sm tracking-widest uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]"></div> All systems operational
          </div>
          <div className="flex gap-4 text-[10px] text-[#555] tracking-widest uppercase">
            <span className="hover:text-[#888] cursor-pointer">PRIVACY POLICY</span>
            <span className="hover:text-[#888] cursor-pointer">//</span>
            <span className="hover:text-[#888] cursor-pointer">TERMS OF SERVICE</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white selection:bg-accent-500/30 selection:text-white relative overflow-x-hidden">

      {/* Background Dots */}
      <div className="fixed inset-0 pointer-events-none z-0 dotted-bg"></div>

      {/* Vertical grid lines */}
      <div className="fixed inset-y-0 left-[5%] xl:left-[10%] w-[1px] bg-[#222] z-0 hidden lg:block opacity-50"></div>
      <div className="fixed inset-y-0 right-[5%] xl:right-[10%] w-[1px] bg-[#222] z-0 hidden lg:block opacity-50"></div>

      {/* Main Content wrapper */}
      <div className="relative z-10 w-full lg:max-w-[90%] xl:max-w-[80%] mx-auto border-x-0 lg:border-x border-[#222] min-h-screen flex flex-col bg-[#050505]/50 backdrop-blur-[1px]">
        <Navbar />
        <Hero />
        <Marquee />
        <FeaturesTabs />
        <DetailedFeatures />
        <Marquee />
        <UnderTheHood />
        <Marquee />
        <FinalCTA />
      </div>
    </div>
  )
}

export default App
