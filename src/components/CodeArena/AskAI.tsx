import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, User } from 'lucide-react';

const AskAI = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', content: "Hi! I'm your CodeNexus AI assistant. Any doubts or need a hint?" }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        // Add user message
        const newMessages = [...messages, { role: 'user', content: input }];
        setMessages(newMessages);
        setInput('');

        // Mock AI response
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                { role: 'ai', content: "I see you're working on this problem. Hint: Try using a hash map to reduce the time complexity from O(N^2) to O(N)." }
            ]);
        }, 1000);
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 w-14 h-14 bg-accent-500 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(var(--accent-500),0.4)] z-50 transition-transform ${isOpen ? 'scale-0' : 'scale-100'}`}
                style={{ visibility: isOpen ? 'hidden' : 'visible' }}
            >
                <Sparkles size={24} />
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-6 right-6 w-[360px] h-[500px] bg-[#0A0A0A] border border-[#333] rounded-sm shadow-2xl z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-[#111] border-b border-[#333] p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-white font-sans font-bold">
                                <Bot size={18} className="text-accent-500" />
                                <span>CodeNexus AI</span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-[#888] hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                                >
                                    <div className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-[#1a1a1a] border border-[#333] text-white' : 'bg-accent-500/10 border border-accent-500/30 text-accent-400'}`}>
                                        {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                    </div>
                                    <div className={`p-3 rounded-sm text-sm font-sans ${msg.role === 'user' ? 'bg-[#1a1a1a] text-white border border-[#333]' : 'bg-transparent text-[#ccc] border border-[#222]'}`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-[#111] border-t border-[#333]">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask for hints..."
                                    className="w-full bg-[#050505] border border-[#333] pl-4 pr-12 py-3 rounded-sm text-sm text-white focus:outline-none focus:border-accent-500 transition-colors font-mono"
                                />
                                <button
                                    onClick={handleSend}
                                    className="absolute right-2 p-2 text-accent-500 hover:text-accent-400 transition-colors"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                            <div className="text-center mt-2">
                                <span className="text-[9px] font-mono text-[#555] uppercase tracking-widest">
                                    AI can make mistakes. Verify hints.
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AskAI;
