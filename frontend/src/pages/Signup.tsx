import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Mail, Lock, Briefcase, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth, getRoleDashboard } from '../lib/auth';
import { ApiRequestError } from '../lib/api';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('STUDENT');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsSubmitting(true);
        try {
            await signup({ email, password, role });
            // Set flag for forced profile completion on signup
            localStorage.setItem('cn_signup_session', 'true');
            // After signup + auto-login, redirect to profile to force completion
            if (role === 'STUDENT') {
                navigate('/student/profile', { replace: true });
            } else {
                navigate(getRoleDashboard(role), { replace: true });
            }
        } catch (err) {
            if (err instanceof ApiRequestError) {
                setError(err.message);
            } else {
                setError('Something went wrong. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] font-sans text-white selection:bg-accent-500/30 selection:text-white relative overflow-hidden flex flex-col">
            {/* Background Dots */}
            <div className="fixed inset-0 pointer-events-none z-0 dotted-bg"></div>

            <nav className="w-full border-b border-[#333] flex items-center justify-between px-6 py-4 bg-[#050505]/90 backdrop-blur-md z-50">
                <Link to="/" className="flex items-center gap-2 text-accent-500 font-bold text-xl italic font-serif">
                    <span>{'<'}cn/{'>'}</span>
                </Link>
                <div className="flex items-center gap-4 text-sm font-mono">
                    <span className="text-[#888] tracking-wider text-xs hidden sm:block">Already have an account?</span>
                    <Link to="/login" className="border border-[#555] bg-transparent text-white px-4 py-1.5 font-bold hover:bg-[#111] transition-colors rounded-sm">
                        Login
                    </Link>
                </div>
            </nav>

            <div className="flex-1 flex items-center justify-center p-6 z-10">
                <div className="w-full max-w-md bg-[#0A0A0A] border border-[#222] p-8 mt-10 shadow-2xl relative rounded-sm group hover:border-[#333] transition-colors">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-accent-500 to-transparent opacity-50"></div>

                    <h2 className="text-3xl font-bold text-white mb-2 uppercase font-sans tracking-tight">Create Account</h2>
                    <p className="text-[#888] font-mono text-xs leading-relaxed mb-8">
                        Join CodeNexus and access the ultimate placement prep and technical hiring platform.
                    </p>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-sm mb-5 text-xs font-mono">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase tracking-widest text-[#888] font-mono">Email Address</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
                                <input
                                    type="email"
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isSubmitting}
                                    className="w-full bg-[#111] border border-[#333] py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-accent-500 transition-colors font-mono rounded-sm disabled:opacity-50"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase tracking-widest text-[#888] font-mono">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isSubmitting}
                                    className="w-full bg-[#111] border border-[#333] py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-accent-500 transition-colors font-mono rounded-sm disabled:opacity-50"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 mb-2">
                            <label className="text-[10px] uppercase tracking-widest text-[#888] font-mono">Select Role</label>
                            <div className="relative">
                                <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    disabled={isSubmitting}
                                    className="w-full bg-[#111] border border-[#333] py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-accent-500 transition-colors font-mono rounded-sm appearance-none cursor-pointer disabled:opacity-50"
                                >
                                    <option value="STUDENT">Student</option>
                                    <option value="UNIVERSITY">University Placement Cell</option>
                                    <option value="COMPANY_ADMIN">Company Admin</option>
                                    <option value="RECRUITER">Recruiter</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <ChevronRight size={14} className="text-[#555] rotate-90" />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#e0e0e0] text-black py-3 font-bold hover:bg-white transition-colors text-sm font-mono mt-2 uppercase tracking-wide flex justify-center items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" /> Creating account...
                                </>
                            ) : (
                                <>
                                    Sign Up <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 border-t border-[#222] pt-6 flex justify-center">
                        <span className="text-xs text-[#555] font-mono tracking-widest uppercase text-center">Protected by CodeNexus Security</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
