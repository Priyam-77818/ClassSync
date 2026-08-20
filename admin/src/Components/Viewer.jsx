import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, CalendarDays, Clock, BookOpen, Users, AlertCircle, Eye } from 'lucide-react';
import ServerConfig from '../Constants/Config.js';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const purposeColors = {
    L: { bg: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-300', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    T: { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-300', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    P: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-300', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
};

const tagColors = {
    CS: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    EC: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    HS: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    PH: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    MA: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    OTH: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

function formatTime(ts) {
    if (!ts) return '—';
    return `${String(ts.hr).padStart(2, '0')}:${String(ts.min).padStart(2, '0')}`;
}

function ScheduleCard({ schedule }) {
    const purpose = schedule.slot_purpose || 'L';
    const colors = purposeColors[purpose] || purposeColors.L;
    return (
        <div className={`rounded-lg border p-2.5 ${colors.bg} ${colors.border} text-xs`}>
            <div className="flex items-center gap-1.5 mb-1">
                <span className={`font-bold px-1.5 py-0.5 rounded border text-xs ${colors.badge}`}>
                    {purpose === 'L' ? 'Lecture' : purpose === 'T' ? 'Tutorial' : 'Practical'}
                </span>
                {schedule.batch && Array.isArray(schedule.batch) && schedule.batch.length > 0 && (
                    <span className="text-slate-400 truncate">
                        {schedule.batch.slice(0, 3).join(', ')}{schedule.batch.length > 3 ? ` +${schedule.batch.length - 3}` : ''}
                    </span>
                )}
            </div>
            {schedule.course && (
                <p className="text-white font-semibold truncate mb-1">{schedule.course}</p>
            )}
            <div className="space-y-0.5 text-slate-400">
                {schedule.room && <p>📍 {schedule.room}</p>}
                {schedule.teacher && schedule.teacher.length > 0 && (
                    <p>👤 {Array.isArray(schedule.teacher) ? schedule.teacher.join(', ') : schedule.teacher}</p>
                )}
            </div>
        </div>
    );
}

function MetaSummary({ meta }) {
    if (!meta) return null;
    const { data } = meta;
    if (!data) return null;

    // Normalize teachers: backend returns { list: [...] }
    const teachers = Array.isArray(data.teachers)
        ? data.teachers
        : (data.teachers?.list || []);

    // Normalize subjects: backend returns { cs: [...], ec: [...], ... }
    const subjects = Array.isArray(data.subjects)
        ? data.subjects
        : Object.entries({ cs: 'CS', ec: 'EC', hs: 'HS', ph: 'PH', ma: 'MA', oth: 'OTH' })
            .flatMap(([key, tag]) => (data.subjects?.[key] || []).map(s => ({ ...s, tag })));

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* Time config */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-blue-600/20 rounded-lg flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Time Config</p>
                </div>
                {data.time && (
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Hours</span>
                            <span className="text-white font-medium">{data.time.start}:00 – {data.time.end}:00</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Duration</span>
                            <span className="text-white font-medium">{data.time.duration} min</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Break</span>
                            <span className="text-white font-medium">{data.time.relax_period} min</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Teachers */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
                        Teachers ({teachers.length})
                    </p>
                </div>
                <div className="space-y-1.5 max-h-28 overflow-y-auto">
                    {teachers.map((t, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-emerald-500/20 rounded-md flex items-center justify-center text-emerald-400 text-xs font-bold flex-shrink-0">
                                {t.abbreviation?.slice(0, 2)}
                            </span>
                            <div className="min-w-0">
                                <p className="text-white text-xs font-medium truncate">{t.name}</p>
                                <p className="text-slate-500 text-xs">{t.abbreviation}</p>
                            </div>
                        </div>
                    ))}
                    {teachers.length === 0 && (
                        <p className="text-slate-600 text-xs">No teachers saved</p>
                    )}
                </div>
            </div>

            {/* Subjects */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-violet-600/20 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                    </div>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
                        Subjects ({subjects.length})
                    </p>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                    {subjects.map((s, i) => (
                        <span key={i} className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${tagColors[s.tag] || tagColors.OTH}`}>
                            {s.code}
                        </span>
                    ))}
                    {subjects.length === 0 && (
                        <p className="text-slate-600 text-xs">No subjects saved</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function Viewer() {
    const [timetable, setTimetable] = useState(null);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedDay, setSelectedDay] = useState(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [ttRes, metaRes] = await Promise.all([
                fetch(`${ServerConfig.BaseURL}/timetable`),
                fetch(`${ServerConfig.BaseURL}/metadata`),
            ]);

            if (ttRes.ok) {
                const ttData = await ttRes.json();
                if (ttData?.days?.length > 0) {
                    setTimetable(ttData);
                    setSelectedDay(ttData.days.sort((a, b) => a.day - b.day)[0].day);
                } else {
                    setTimetable(null);
                }
            } else {
                setError('Failed to load timetable from server.');
            }

            if (metaRes.ok) {
                const metaData = await metaRes.json();
                if (metaData) setMeta(metaData);
            }
        } catch {
            setError('Cannot reach backend at localhost:3000. Make sure it is running.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const sortedDays = timetable?.days ? [...timetable.days].sort((a, b) => a.day - b.day) : [];
    const activeDay = sortedDays.find(d => d.day === selectedDay);

    return (
        <div className="min-h-full bg-slate-950 p-4 sm:p-6 lg:p-8">

            {/* Hero */}
            <div className="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-br from-emerald-900/50 via-teal-900/50 to-slate-900 border border-emerald-500/20 p-6 sm:p-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span className="text-emerald-400 text-xs font-semibold uppercase tracking-widest">Step 3</span>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1 mb-1">Timetable Viewer</h1>
                        <p className="text-slate-400 text-sm">View the currently saved timetable and metadata from the database.</p>
                    </div>
                    <button
                        onClick={fetchAll}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-xl text-sm font-medium transition-all backdrop-blur-sm whitespace-nowrap disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-10 h-10 border-2 border-slate-700 border-t-violet-500 rounded-full animate-spin mb-4" />
                    <p className="text-slate-500 text-sm">Loading from database...</p>
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="flex items-start gap-3 bg-red-900/20 border border-red-500/30 rounded-2xl p-5 mb-6">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-red-300 font-medium">Could not load data</p>
                        <p className="text-red-400/70 text-sm mt-0.5">{error}</p>
                    </div>
                </div>
            )}

            {/* No data */}
            {!loading && !error && !timetable && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
                        <Eye className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-slate-400 font-medium text-lg">No timetable saved yet</p>
                    <p className="text-slate-600 text-sm mt-2 max-w-xs">
                        Go to the MetaData tab to configure teachers & subjects, then use the TimeTable tab to build and submit a schedule.
                    </p>
                </div>
            )}

            {/* Content */}
            {!loading && !error && timetable && (
                <>
                    {/* Meta summary */}
                    <MetaSummary meta={meta} />

                    {/* Timetable stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                        {[
                            { label: 'Timetable ID', value: `#${timetable.id ?? timetable.version ?? '—'}` },
                            { label: 'Days', value: sortedDays.length },
                            { label: 'Time Slots', value: sortedDays.reduce((s, d) => s + d.cols.length, 0) },
                            { label: 'Schedules', value: sortedDays.reduce((s, d) => s + d.cols.reduce((a, c) => a + c.schedules.length, 0), 0) },
                        ].map(({ label, value }) => (
                            <div key={label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                                <p className="text-slate-500 text-xs mb-1">{label}</p>
                                <p className="text-white font-bold text-2xl">{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Day tabs */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                        {/* Day selector */}
                        <div className="flex gap-1 p-3 border-b border-slate-800 overflow-x-auto">
                            {sortedDays.map(day => (
                                <button
                                    key={day.day}
                                    onClick={() => setSelectedDay(day.day)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                                        selectedDay === day.day
                                            ? 'bg-emerald-600 text-white'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                                >
                                    {DAY_NAMES[day.day] || `Day ${day.day}`}
                                </button>
                            ))}
                        </div>

                        {/* Day content */}
                        {activeDay && (
                            <div className="p-4 sm:p-5">
                                {activeDay.cols.length === 0 ? (
                                    <div className="flex flex-col items-center py-12 text-center">
                                        <CalendarDays className="w-10 h-10 text-slate-700 mb-3" />
                                        <p className="text-slate-500">No time slots for {DAY_NAMES[activeDay.day]}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {[...activeDay.cols]
                                            .sort((a, b) => a.start_time.hr * 60 + a.start_time.min - (b.start_time.hr * 60 + b.start_time.min))
                                            .map((col, ci) => (
                                                <div key={ci} className="flex gap-4">
                                                    {/* Time label */}
                                                    <div className="w-16 flex-shrink-0 pt-1 text-right">
                                                        <p className="text-slate-300 text-sm font-semibold">{formatTime(col.start_time)}</p>
                                                        <p className="text-slate-600 text-xs">{col.duration}min</p>
                                                    </div>

                                                    {/* Divider */}
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-2 h-2 rounded-full bg-slate-600 mt-1.5 flex-shrink-0" />
                                                        <div className="w-px flex-1 bg-slate-800" />
                                                    </div>

                                                    {/* Schedules */}
                                                    <div className="flex-1 pb-4">
                                                        {col.schedules.length === 0 ? (
                                                            <p className="text-slate-700 text-xs italic pt-1">Empty slot</p>
                                                        ) : (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                                                                {col.schedules.map((s, si) => (
                                                                    <ScheduleCard key={si} schedule={s} />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
