import React, { useState } from 'react';
import MetaData from "./Components/MetaData.jsx";
import TimeTable from "./Components/TimeTable.jsx";
import Viewer from "./Components/Viewer.jsx";
import Login from "./Components/Login.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { LayoutDashboard, CalendarDays, Eye, GraduationCap, Menu, X, LogOut, KeyRound } from 'lucide-react';

const navItems = [
    { id: 'metadata',  label: 'MetaData',  icon: LayoutDashboard, desc: 'Teachers & Subjects' },
    { id: 'timetable', label: 'TimeTable', icon: CalendarDays,     desc: 'Schedule Builder'   },
    { id: 'viewer',    label: 'Viewer',    icon: Eye,              desc: 'Saved Schedule'      },
];

function Shell() {
    const { isAuthed, adminKey, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('metadata');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (!isAuthed) return <Login />;

    const SidebarNav = ({ onSelect }) => (
        <>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-4 px-3">Navigation</p>
            {navItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                        activeTab === item.id
                            ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <div>
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className="text-xs opacity-60">{item.desc}</div>
                    </div>
                </button>
            ))}
        </>
    );

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">

            {/* Top Bar */}
            <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <button className="lg:hidden text-slate-400 hover:text-white transition-colors p-1"
                        onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                            <GraduationCap className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <span className="font-bold text-white text-sm tracking-wide">ClassSync</span>
                            <span className="text-slate-500 text-xs ml-1">Admin</span>
                        </div>
                    </div>
                </div>

                {/* Desktop tab pills */}
                <div className="hidden sm:flex items-center gap-1 bg-slate-800 rounded-xl p-1">
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                activeTab === item.id
                                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/50'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}>
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Right: key indicator + logout */}
                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1.5 bg-slate-800 rounded-lg px-2.5 py-1.5">
                        <KeyRound className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 text-xs font-medium">
                            {adminKey.slice(0, 4)}{'•'.repeat(Math.max(0, adminKey.length - 4))}
                        </span>
                    </div>
                    <button onClick={logout}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-red-900/40 border border-slate-700 hover:border-red-500/40 text-slate-400 hover:text-red-400 rounded-lg text-xs font-medium transition-all">
                        <LogOut className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Sign out</span>
                    </button>
                </div>
            </header>

            <div className="flex flex-1">
                {/* Mobile sidebar overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-20 lg:hidden" onClick={() => setSidebarOpen(false)}>
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <nav className="relative w-64 h-full bg-slate-900 border-r border-slate-800 p-4 pt-6 space-y-1"
                            onClick={e => e.stopPropagation()}>
                            <SidebarNav onSelect={(id) => { setActiveTab(id); setSidebarOpen(false); }} />
                        </nav>
                    </div>
                )}

                {/* Desktop sidebar */}
                <nav className="hidden lg:flex flex-col w-56 bg-slate-900 border-r border-slate-800 p-4 pt-6 space-y-1 sticky top-[57px] h-[calc(100vh-57px)]">
                    <SidebarNav onSelect={setActiveTab} />

                    <div className="mt-auto pt-4 border-t border-slate-800 space-y-2">
                        <div className="px-3 py-2 bg-slate-800/50 rounded-xl">
                            <p className="text-slate-500 text-xs">Backend</p>
                            <p className="text-emerald-400 text-xs font-medium mt-0.5">● localhost:3000</p>
                        </div>
                        <button onClick={logout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl text-sm transition-all">
                            <LogOut className="w-4 h-4" />
                            Sign out
                        </button>
                    </div>
                </nav>

                {/* Main content */}
                <main className="flex-1 overflow-auto">
                    {activeTab === 'metadata'  && <MetaData />}
                    {activeTab === 'timetable' && <TimeTable />}
                    {activeTab === 'viewer'    && <Viewer />}
                </main>
            </div>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Shell />
        </AuthProvider>
    );
}

export default App;
