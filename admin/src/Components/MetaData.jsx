import React, { useState, useEffect } from 'react';
import { Plus, X, Clock, User, BookOpen, Send, Copy, Check, Upload, FileText, Users, Layers, Timer, Hash, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import ServerConfig from '../Constants/Config.js';

const tagColors = {
    CS: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    EC: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    HS: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    PH: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    MA: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    OTH: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

function StatCard({ icon: Icon, label, value, color }) {
    return (
        <div className={`rounded-2xl p-4 border bg-slate-800/50 ${color} flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.replace('border-', 'bg-').replace('/30', '/20')}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-slate-400 text-xs">{label}</p>
                <p className="text-white font-bold text-xl leading-tight">{value}</p>
            </div>
        </div>
    );
}

function InputField({ label, ...props }) {
    return (
        <div>
            {label && <label className="block text-slate-400 text-xs font-medium mb-1.5">{label}</label>}
            <input
                {...props}
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
        </div>
    );
}

function SectionCard({ title, icon: Icon, iconColor, children }) {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
            <div className={`px-5 py-4 border-b border-slate-800 flex items-center gap-3`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor}`}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-white font-semibold text-base">{title}</h2>
            </div>
            <div className="flex-1 flex flex-col p-5">
                {children}
            </div>
        </div>
    );
}

function MetaData() {
    const [timeConfig, setTimeConfig] = useState({ start: 8, end: 15, duration: 50, relax_period: 10 });
    const [teachers, setTeachers] = useState([]);
    const [newTeacher, setNewTeacher] = useState({ abbreviation: '', name: '' });
    const [subjects, setSubjects] = useState([]);
    const [newSubject, setNewSubject] = useState({ name: '', code: '', tag: 'CS' });
    const availableTags = ['CS', 'EC', 'HS', 'PH', 'MA', 'OTH'];
    const [copySuccess, setCopySuccess] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // null | 'loading' | 'success' | 'error'
    const [submitError, setSubmitError] = useState('');
    const [fetchStatus, setFetchStatus] = useState('idle'); // 'idle' | 'loading' | 'loaded' | 'empty' | 'error'
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [jsonInput, setJsonInput] = useState('');
    const [loadError, setLoadError] = useState('');
    const [validationError, setValidationError] = useState('');

    // Always ensure these are arrays regardless of what the backend returns
    const teachersList = Array.isArray(teachers) ? teachers : (teachers?.list || []);
    const subjectsList = Array.isArray(subjects) ? subjects : [];
    const totalSlots = Math.max(0, Math.floor((timeConfig.end - timeConfig.start) * 60 / (timeConfig.duration + timeConfig.relax_period)));

    // Load existing metadata from backend on mount
    useEffect(() => {
        const loadExisting = async () => {
            setFetchStatus('loading');
            try {
                const res = await fetch(`${ServerConfig.BaseURL}/metadata`);
                if (res.ok) {
                    const json = await res.json();
                    if (json?.data) {
                        const d = json.data;
                        if (d.time) setTimeConfig(d.time);

                        // Backend stores teachers as { list: [...] } — normalize to flat array
                        if (d.teachers) {
                            const teacherList = Array.isArray(d.teachers)
                                ? d.teachers
                                : (d.teachers.list || []);
                            setTeachers(teacherList);
                        }

                        // Backend stores subjects split by tag: { cs: [...], ec: [...], ... }
                        // Flatten them back to a single array with tag field
                        if (d.subjects) {
                            if (Array.isArray(d.subjects)) {
                                setSubjects(d.subjects);
                            } else {
                                const tagMap = { cs: 'CS', ec: 'EC', hs: 'HS', ph: 'PH', ma: 'MA', oth: 'OTH' };
                                const flat = Object.entries(tagMap).flatMap(([key, tag]) =>
                                    (d.subjects[key] || []).map(s => ({ ...s, tag }))
                                );
                                setSubjects(flat);
                            }
                        }
                        setFetchStatus('loaded');
                    } else {
                        setFetchStatus('empty');
                    }
                } else if (res.status === 404) {
                    setFetchStatus('empty');
                } else {
                    setFetchStatus('error');
                }
            } catch {
                setFetchStatus('error');
            }
        };
        loadExisting();
    }, []);
    const addTeacher = () => {
        if (newTeacher.abbreviation.trim() && newTeacher.name.trim()) {
            setTeachers([...teachers, { ...newTeacher }]);
            setNewTeacher({ abbreviation: '', name: '' });
        }
    };
    const removeTeacher = (i) => setTeachers(teachers.filter((_, idx) => idx !== i));

    const addSubject = () => {
        if (newSubject.name.trim() && newSubject.code.trim()) {
            setSubjects([...subjects, { ...newSubject }]);
            setNewSubject({ name: '', code: '', tag: 'CS' });
        }
    };
    const removeSubject = (i) => setSubjects(subjects.filter((_, idx) => idx !== i));

    const copyToClipboard = async () => {
        const payload = { time: timeConfig, teachers, subjects };
        try {
            await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch {
            const ta = document.createElement('textarea');
            ta.value = JSON.stringify(payload, null, 2);
            document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    const loadFromJson = () => {
        setLoadError('');
        try {
            const data = JSON.parse(jsonInput);
            if (!data.time || !data.teachers || !data.subjects) throw new Error('Must contain time, teachers, and subjects.');
            setTimeConfig(data.time);
            setTeachers(data.teachers);
            setSubjects(data.subjects);
            setShowLoadModal(false);
            setJsonInput('');
        } catch (e) { setLoadError(e.message); }
    };

    const handleSubmit = async () => {
        // Validation
        if (teachersList.length === 0) { setValidationError('Add at least one teacher before submitting.'); return; }
        if (subjectsList.length === 0) { setValidationError('Add at least one subject before submitting.'); return; }
        if (timeConfig.end <= timeConfig.start) { setValidationError('End hour must be after start hour.'); return; }
        if (timeConfig.duration < 1) { setValidationError('Class duration must be at least 1 minute.'); return; }
        setValidationError('');
        setSubmitStatus('loading');
        setSubmitError('');
        const payload = { time: timeConfig, teachers, subjects };
        try {
            const res = await fetch(`${ServerConfig.BaseURL}/metadata`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                setSubmitStatus('success');
            } else {
                const body = await res.json().catch(() => ({}));
                setSubmitError(body?.msg || `Server error (${res.status})`);
                setSubmitStatus('error');
            }
        } catch (e) {
            setSubmitError('Cannot reach backend. Make sure localhost:3000 is running.');
            setSubmitStatus('error');
        }
        setTimeout(() => setSubmitStatus(null), 4000);
    };

    return (
        <div className="min-h-full bg-slate-950 p-4 sm:p-6 lg:p-8">

            {/* Hero */}
            <div className="relative rounded-3xl overflow-hidden mb-6 bg-gradient-to-br from-violet-900/60 via-indigo-900/60 to-slate-900 border border-violet-500/20 p-6 sm:p-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-violet-400 text-xs font-semibold uppercase tracking-widest">Step 1</span>
                            {fetchStatus === 'loaded' && (
                                <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                                    <CheckCircle2 className="w-3 h-3" /> Loaded from database
                                </span>
                            )}
                            {fetchStatus === 'loading' && (
                                <span className="flex items-center gap-1 text-slate-400 text-xs">
                                    <RefreshCw className="w-3 h-3 animate-spin" /> Loading saved data...
                                </span>
                            )}
                            {fetchStatus === 'empty' && (
                                <span className="text-slate-500 text-xs">No saved data — starting fresh</span>
                            )}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">MetaData Configuration</h1>
                        <p className="text-slate-400 text-sm">Set up teachers, time slots, and subjects before building the timetable.</p>
                    </div>
                    <button
                        onClick={() => setShowLoadModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-xl text-sm font-medium transition-all backdrop-blur-sm whitespace-nowrap"
                    >
                        <Upload className="w-4 h-4" />
                        Load from JSON
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                <StatCard icon={Users} label="Teachers" value={teachersList.length} color="border-emerald-500/30 text-emerald-400" />
                <StatCard icon={BookOpen} label="Subjects" value={subjectsList.length} color="border-violet-500/30 text-violet-400" />
                <StatCard icon={Timer} label="Slots/Day" value={totalSlots} color="border-blue-500/30 text-blue-400" />
                <StatCard icon={Clock} label="Class Duration" value={`${timeConfig.duration}m`} color="border-amber-500/30 text-amber-400" />
            </div>

            {/* Three Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">

                {/* Teachers */}
                <SectionCard title="Teachers" icon={Users} iconColor="bg-emerald-600">
                    <div className="space-y-3 mb-5">
                        <InputField
                            placeholder="Abbreviation (e.g. PKS)"
                            value={newTeacher.abbreviation}
                            onChange={e => setNewTeacher({ ...newTeacher, abbreviation: e.target.value })}
                            onKeyDown={e => e.key === 'Enter' && addTeacher()}
                        />
                        <InputField
                            placeholder="Full Name"
                            value={newTeacher.name}
                            onChange={e => setNewTeacher({ ...newTeacher, name: e.target.value })}
                            onKeyDown={e => e.key === 'Enter' && addTeacher()}
                        />
                        <button
                            onClick={addTeacher}
                            disabled={!newTeacher.abbreviation.trim() || !newTeacher.name.trim()}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Add Teacher
                        </button>
                    </div>

                    <div className="flex-1">
                        <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-3">Added ({teachersList.length})</p>
                        {teachersList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-3">
                                    <User className="w-6 h-6 text-slate-600" />
                                </div>
                                <p className="text-slate-500 text-sm">No teachers yet</p>
                                <p className="text-slate-600 text-xs mt-1">Add your first teacher above</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {teachersList.map((t, i) => (
                                    <div key={i} className="flex items-center justify-between bg-slate-800 rounded-xl px-3.5 py-2.5 group hover:bg-slate-750 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-emerald-400 text-xs font-bold">{t.abbreviation.slice(0,2)}</span>
                                            </div>
                                            <div>
                                                <p className="text-white text-sm font-medium leading-tight">{t.name}</p>
                                                <p className="text-slate-500 text-xs">{t.abbreviation}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => removeTeacher(i)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all ml-2">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </SectionCard>

                {/* Time Configuration */}
                <SectionCard title="Time Configuration" icon={Clock} iconColor="bg-blue-600">
                    <div className="space-y-4 mb-5">
                        <div className="grid grid-cols-2 gap-3">
                            <InputField label="Start Hour" type="number" min="0" max="23" value={timeConfig.start}
                                onChange={e => setTimeConfig({ ...timeConfig, start: parseInt(e.target.value) || 0 })} />
                            <InputField label="End Hour" type="number" min="0" max="23" value={timeConfig.end}
                                onChange={e => setTimeConfig({ ...timeConfig, end: parseInt(e.target.value) || 0 })} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <InputField label="Duration (mins)" type="number" min="1" value={timeConfig.duration}
                                onChange={e => setTimeConfig({ ...timeConfig, duration: parseInt(e.target.value) || 1 })} />
                            <InputField label="Break (mins)" type="number" min="0" value={timeConfig.relax_period}
                                onChange={e => setTimeConfig({ ...timeConfig, relax_period: parseInt(e.target.value) || 0 })} />
                        </div>
                    </div>

                    {/* Visual summary */}
                    <div className="bg-slate-800 rounded-2xl p-4 mb-4">
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Working Hours', val: `${timeConfig.start}:00 – ${timeConfig.end}:00` },
                                { label: 'Class Duration', val: `${timeConfig.duration} min` },
                                { label: 'Break Time', val: `${timeConfig.relax_period} min` },
                                { label: 'Total Slots', val: `${totalSlots} slots` },
                            ].map(({ label, val }) => (
                                <div key={label} className="bg-slate-900/60 rounded-xl p-3">
                                    <p className="text-slate-500 text-xs mb-0.5">{label}</p>
                                    <p className="text-white text-sm font-semibold">{val}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timeline visual */}
                    <div>
                        <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-2">Day Preview</p>
                        <div className="flex gap-1 flex-wrap">
                            {Array.from({ length: totalSlots }).map((_, i) => (
                                <div key={i} className="flex-1 min-w-[28px] h-8 bg-blue-600/30 border border-blue-500/30 rounded-lg flex items-center justify-center">
                                    <span className="text-blue-300 text-xs font-medium">{i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionCard>

                {/* Subjects */}
                <SectionCard title="Subjects" icon={BookOpen} iconColor="bg-violet-600">
                    <div className="space-y-3 mb-5">
                        <InputField
                            placeholder="Subject Name"
                            value={newSubject.name}
                            onChange={e => setNewSubject({ ...newSubject, name: e.target.value })}
                        />
                        <InputField
                            placeholder="Subject Code"
                            value={newSubject.code}
                            onChange={e => setNewSubject({ ...newSubject, code: e.target.value })}
                        />

                        {/* Tag selector */}
                        <div>
                            <label className="block text-slate-400 text-xs font-medium mb-2">Department</label>
                            <div className="grid grid-cols-3 gap-1.5">
                                {availableTags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => setNewSubject({ ...newSubject, tag })}
                                        className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                            newSubject.tag === tag
                                                ? tagColors[tag] + ' ring-1 ring-current'
                                                : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={addSubject}
                            disabled={!newSubject.name.trim() || !newSubject.code.trim()}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Add Subject
                        </button>
                    </div>

                    <div className="flex-1">
                        <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-3">Added ({subjectsList.length})</p>
                        {subjectsList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-3">
                                    <BookOpen className="w-6 h-6 text-slate-600" />
                                </div>
                                <p className="text-slate-500 text-sm">No subjects yet</p>
                                <p className="text-slate-600 text-xs mt-1">Add your first subject above</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {subjectsList.map((s, i) => (
                                    <div key={i} className="flex items-center justify-between bg-slate-800 rounded-xl px-3.5 py-2.5 group hover:bg-slate-750 transition-all">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md border flex-shrink-0 ${tagColors[s.tag]}`}>
                                                {s.tag}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-white text-sm font-medium truncate leading-tight">{s.name}</p>
                                                <p className="text-slate-500 text-xs">{s.code}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => removeSubject(i)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all ml-2 flex-shrink-0">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </SectionCard>
            </div>

            {/* Action Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
                {/* Validation error */}
                {validationError && (
                    <div className="flex items-center gap-2.5 bg-amber-900/30 border border-amber-500/30 rounded-xl p-3">
                        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <p className="text-amber-300 text-sm">{validationError}</p>
                    </div>
                )}
                {/* Submit error */}
                {submitStatus === 'error' && submitError && (
                    <div className="flex items-center gap-2.5 bg-red-900/30 border border-red-500/30 rounded-xl p-3">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <p className="text-red-300 text-sm">{submitError}</p>
                    </div>
                )}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-slate-400 text-sm hidden sm:block">
                        {teachersList.length === 0 || subjectsList.length === 0
                            ? <span className="text-amber-400/80">⚠ Add teachers and subjects before submitting</span>
                            : `${teachersList.length} teacher(s) · ${subjectsList.length} subject(s) ready`
                        }
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={copyToClipboard}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-all flex-1 sm:flex-none justify-center"
                        >
                            {copySuccess ? <><Check className="w-4 h-4 text-emerald-400" />Copied!</> : <><Copy className="w-4 h-4" />Copy JSON</>}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitStatus === 'loading'}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex-1 sm:flex-none justify-center ${
                                submitStatus === 'success' ? 'bg-emerald-600 text-white' :
                                submitStatus === 'error' ? 'bg-red-600 text-white' :
                                'bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50'
                            }`}
                        >
                            {submitStatus === 'loading' ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</>
                            ) : submitStatus === 'success' ? (
                                <><Check className="w-4 h-4" />Submitted!</>
                            ) : submitStatus === 'error' ? (
                                <>Failed — Retry</>
                            ) : (
                                <><Send className="w-4 h-4" />Submit Configuration</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Load JSON Modal */}
            {showLoadModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-emerald-400" />
                                </div>
                                <h2 className="text-white font-semibold">Load from JSON</h2>
                            </div>
                            <button onClick={() => { setShowLoadModal(false); setJsonInput(''); setLoadError(''); }}
                                className="text-slate-500 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <textarea
                                value={jsonInput}
                                onChange={e => setJsonInput(e.target.value)}
                                placeholder={`{\n  "time": { "start": 8, "end": 15, "duration": 50, "relax_period": 10 },\n  "teachers": [{ "abbreviation": "PKS", "name": "Pankaj Kumar" }],\n  "subjects": [{ "name": "Physics", "code": "PH101", "tag": "PH" }]\n}`}
                                className="w-full h-52 bg-slate-800 border border-slate-700 text-slate-300 placeholder-slate-600 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                            />
                            {loadError && (
                                <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3">
                                    <p className="text-red-400 text-sm">{loadError}</p>
                                </div>
                            )}
                            <div className="flex gap-3">
                                <button
                                    onClick={loadFromJson}
                                    disabled={!jsonInput.trim()}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-all"
                                >
                                    <Upload className="w-4 h-4" />
                                    Load Configuration
                                </button>
                                <button onClick={() => { setShowLoadModal(false); setJsonInput(''); setLoadError(''); }}
                                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-all">
                                    Cancel
                                </button>
                            </div>
                            <p className="text-slate-600 text-xs">Loading will replace all current configuration.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MetaData;
