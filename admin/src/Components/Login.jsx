import React, { useState } from 'react';
import { GraduationCap, KeyRound, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import ServerConfig from '../Constants/Config.js';

export default function Login() {
    const { login } = useAuth();
    const [key, setKey] = useState('');
    const [show, setShow] = useState(false);
    const [status, setStatus] = useState(null); // null | 'loading' | 'error'
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!key.trim()) return;
        setStatus('loading');
        setErrorMsg('');

        // Verify the key by attempting a POST /metadata with an empty payload signed with this key
        // Actually — the backend validates the key only on POST /timetable.
        // For login, we simply verify the key works by hitting GET /metadata (which always succeeds)
        // then the key is stored and used in timetable submissions.
        // A wrong key will only surface when submitting a timetable, which is fine.
        // We do a quick GET /metadata to at least confirm the backend is reachable.
        try {
            const res = await fetch(`${ServerConfig.BaseURL}/metadata`);
            if (res.ok || res.status === 404) {
                // Backend is reachable — accept the key
                login(key.trim());
            } else {
                setErrorMsg('Backend returned an unexpected error. Check if the server is running.');
                setStatus('error');
            }
        } catch {
            setErrorMsg('Cannot reach the backend at localhost:3000. Make sure it is running.');
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            {/* Background glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-sm">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-900/50 mb-4">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-white font-bold text-2xl tracking-tight">ClassSync</h1>
                    <p className="text-slate-500 text-sm mt-1">Admin Dashboard</p>
                </div>

                {/* Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
                    <h2 className="text-white font-semibold text-lg mb-1">Sign in</h2>
                    <p className="text-slate-500 text-sm mb-6">Enter your admin key to continue</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-slate-400 text-xs font-medium mb-1.5">
                                Admin Key
                            </label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                                    <KeyRound className="w-4 h-4" />
                                </div>
                                <input
                                    type={show ? 'text' : 'password'}
                                    value={key}
                                    onChange={e => setKey(e.target.value)}
                                    placeholder="Enter your admin key"
                                    autoFocus
                                    className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-600 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShow(!show)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {status === 'error' && (
                            <div className="flex items-start gap-2.5 bg-red-900/30 border border-red-500/30 rounded-xl p-3">
                                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-red-400 text-sm">{errorMsg}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!key.trim() || status === 'loading'}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all"
                        >
                            {status === 'loading' ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-slate-600 text-xs text-center mt-4">
                    The admin key is used to authorize timetable submissions.
                </p>
            </div>
        </div>
    );
}
