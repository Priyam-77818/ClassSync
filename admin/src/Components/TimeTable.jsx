import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, Copy, Check, Upload, Send, CalendarDays, Hash, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modals } from './Modals';
import { DayCard } from './DayCard';
import { useAuth } from '../context/AuthContext.jsx';
import ServerConfig from '../Constants/Config.js';

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

function TimetableForm() {
    const { adminKey } = useAuth();
    const [timetableId, setTimetableId] = useState(1);
    const [days, setDays] = useState([]);
    const [fetchStatus, setFetchStatus] = useState('idle');
    const [submitStatus, setSubmitStatus] = useState(null);
    const [submitError, setSubmitError] = useState('');
    const [validationError, setValidationError] = useState('');

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const slotPurposes = ['L', 'T', 'P'];
    const availableBatches = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'E15', 'E16', 'E17', 'All'];

    const [showDayModal, setShowDayModal] = useState(false);
    const [showColumnModal, setShowColumnModal] = useState(false);
    const [showSlotModal, setShowSlotModal] = useState(false);
    const [showLoadModal, setShowLoadModal] = useState(false);

    const [currentDayIndex, setCurrentDayIndex] = useState(null);
    const [currentColumnIndex, setCurrentColumnIndex] = useState(null);
    const [editingSlotIndex, setEditingSlotIndex] = useState(null);

    const [newDay, setNewDay] = useState({ day: 0, cols: [] });
    const [newColumn, setNewColumn] = useState({ start_time: { hr: 9, min: 0 }, duration: 50, schedules: [] });
    const [newSlot, setNewSlot] = useState({ slot_purpose: 'L', batch: [], course: '', room: '', teacher: [] });

    const [copySuccess, setCopySuccess] = useState(false);
    const [jsonInput, setJsonInput] = useState('');
    const [loadError, setLoadError] = useState('');

    const [draggedSlot, setDraggedSlot] = useState(null);
    const [draggedFrom, setDraggedFrom] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);

    // Load existing timetable from backend on mount
    useEffect(() => {
        const loadExisting = async () => {
            setFetchStatus('loading');
            try {
                const res = await fetch(`${ServerConfig.BaseURL}/timetable`);
                if (res.ok) {
                    const json = await res.json();
                    if (json?.days) {
                        setTimetableId(json.id ?? json.version ?? 1);
                        setDays(json.days);
                        setFetchStatus('loaded');
                    } else {
                        setFetchStatus('empty');
                    }
                } else {
                    setFetchStatus('error');
                }
            } catch {
                setFetchStatus('error');
            }
        };
        loadExisting();
    }, []);

    const handleDragStart = (dayIndex, colIndex, slotIndex) => {
        const day = days.find(d => d.day === dayIndex);
        setDraggedSlot({ ...day.cols[colIndex].schedules[slotIndex] });
        setDraggedFrom({ dayIndex, colIndex, slotIndex });
    };
    const handleDragOver = (e, dayIndex, colIndex) => { e.preventDefault(); setDragOverColumn({ dayIndex, colIndex }); };
    const handleDragLeave = () => setDragOverColumn(null);
    const handleDrop = (e, dayIndex, colIndex) => {
        e.preventDefault();
        if (!draggedSlot || !draggedFrom) return;
        if (draggedFrom.dayIndex === dayIndex && draggedFrom.colIndex === colIndex) {
            setDraggedSlot(null); setDraggedFrom(null); setDragOverColumn(null); return;
        }
        const updated = [...days];
        updated.find(d => d.day === draggedFrom.dayIndex).cols[draggedFrom.colIndex].schedules.splice(draggedFrom.slotIndex, 1);
        updated.find(d => d.day === dayIndex).cols[colIndex].schedules.push(draggedSlot);
        setDays(updated);
        setDraggedSlot(null); setDraggedFrom(null); setDragOverColumn(null);
    };
    const isColumnDragTarget = (di, ci) => dragOverColumn && dragOverColumn.dayIndex === di && dragOverColumn.colIndex === ci;
    const isSlotBeingDragged = (di, ci, si) => draggedFrom && draggedFrom.dayIndex === di && draggedFrom.colIndex === ci && draggedFrom.slotIndex === si;

    const formatTime = (ts) => `${ts.hr.toString().padStart(2,'0')}:${ts.min.toString().padStart(2,'0')}`;
    const getDayName = (i) => dayNames[i] || `Day ${i}`;

    const addDay = () => {
        if (days.find(d => d.day === newDay.day)) { alert('Day already exists!'); return; }
        setDays([...days, { ...newDay, cols: [] }]);
        setNewDay({ day: 0, cols: [] });
        setShowDayModal(false);
    };
    const removeDay = (i) => setDays(days.filter(d => d.day !== i));
    const addColumn = () => {
        const updated = [...days];
        const day = updated.find(d => d.day === currentDayIndex);
        if (day) day.cols.push({ ...newColumn, schedules: [] });
        setDays(updated);
        setNewColumn({ start_time: { hr: 9, min: 0 }, duration: 50, schedules: [] });
        setShowColumnModal(false);
    };
    const removeColumn = (di, ci) => {
        const updated = [...days];
        updated.find(d => d.day === di)?.cols.splice(ci, 1);
        setDays(updated);
    };
    const saveSlot = () => {
        const updated = [...days];
        const col = updated.find(d => d.day === currentDayIndex).cols[currentColumnIndex];
        const slotData = Object.fromEntries(
            Object.entries({
                slot_purpose: newSlot.slot_purpose || undefined,
                batch: newSlot.batch.length > 0 ? newSlot.batch : undefined,
                course: newSlot.course.trim() || undefined,
                room: newSlot.room.trim() || undefined,
                teacher: newSlot.teacher.length > 0 ? newSlot.teacher : undefined,
            }).filter(([, v]) => v !== undefined)
        );
        if (editingSlotIndex !== null) col.schedules[editingSlotIndex] = slotData;
        else col.schedules.push(slotData);
        setDays(updated);
        resetSlotModal();
    };
    const resetSlotModal = () => {
        setNewSlot({ slot_purpose: 'L', batch: [], course: '', room: '', teacher: [] });
        setEditingSlotIndex(null);
        setShowSlotModal(false);
    };
    const editSlot = (di, ci, si) => {
        const slot = days.find(d => d.day === di).cols[ci].schedules[si];
        setNewSlot({ slot_purpose: slot.slot_purpose || 'L', batch: slot.batch || [], course: slot.course || '', room: slot.room || '', teacher: slot.teacher || [] });
        setCurrentDayIndex(di); setCurrentColumnIndex(ci); setEditingSlotIndex(si);
        setShowSlotModal(true);
    };
    const removeSlot = (di, ci, si) => {
        const updated = [...days];
        updated.find(d => d.day === di).cols[ci].schedules.splice(si, 1);
        setDays(updated);
    };
    const generateJSON = () => ({ key: adminKey, timetable: { id: timetableId, days: days.sort((a,b) => a.day - b.day) } });
    const copyToClipboard = async () => {
        try { await navigator.clipboard.writeText(JSON.stringify(generateJSON(), null, 2)); } catch {}
        setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000);
    };
    const loadFromJson = () => {
        setLoadError('');
        try {
            const data = JSON.parse(jsonInput);
            if (!data.key || !data.timetable) throw new Error('Must contain key and timetable.');
            if (!data.timetable.id || !Array.isArray(data.timetable.days)) throw new Error('Invalid timetable structure.');
            setAdminKey(data.key); setTimetableId(data.timetable.id); setDays(data.timetable.days);
            setShowLoadModal(false); setJsonInput('');
        } catch (e) { setLoadError(e.message); }
    };
    const handleSubmit = async () => {
        // Validation
        if (!adminKey) { setValidationError('Admin key is missing. Please log out and sign in again.'); return; }
        if (days.length === 0) { setValidationError('Add at least one day before submitting.'); return; }
        const emptyDays = days.filter(d => d.cols.length === 0).map(d => dayNames[d.day]);
        if (emptyDays.length > 0) { setValidationError(`${emptyDays.join(', ')} have no time slots. Add at least one slot per day.`); return; }
        setValidationError('');
        setSubmitStatus('loading');
        setSubmitError('');
        try {
            const res = await fetch(`${ServerConfig.BaseURL}/timetable`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(generateJSON()),
            });
            if (res.ok) {
                setSubmitStatus('success');
            } else {
                const body = await res.json().catch(() => ({}));
                setSubmitError(body?.msg || `Server error (${res.status})`);
                setSubmitStatus('error');
            }
        } catch {
            setSubmitError('Cannot reach backend. Make sure localhost:3000 is running.');
            setSubmitStatus('error');
        }
        setTimeout(() => setSubmitStatus(null), 4000);
    };

    const totalSchedules = days.reduce((sum, d) => sum + d.cols.reduce((s, c) => s + c.schedules.length, 0), 0);

    return (
        <div className="min-h-full bg-slate-950 p-4 sm:p-6 lg:p-8">

            {/* Hero */}
            <div className="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-br from-blue-900/60 via-indigo-900/60 to-slate-900 border border-blue-500/20 p-6 sm:p-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-blue-400 text-xs font-semibold uppercase tracking-widest">Step 2</span>
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
                                <span className="text-slate-500 text-xs">No saved timetable — starting fresh</span>
                            )}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1 mb-1">Timetable Builder</h1>
                        <p className="text-slate-400 text-sm">Add days, time slots, and assign courses to build the full schedule.</p>
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

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {[
                    { label: 'Days', value: days.length, color: 'border-blue-500/30 text-blue-400' },
                    { label: 'Time Slots', value: days.reduce((s, d) => s + d.cols.length, 0), color: 'border-emerald-500/30 text-emerald-400' },
                    { label: 'Schedules', value: totalSchedules, color: 'border-violet-500/30 text-violet-400' },
                    { label: 'Timetable ID', value: `#${timetableId}`, color: 'border-amber-500/30 text-amber-400' },
                ].map(({ label, value, color }) => (
                    <div key={label} className={`rounded-2xl p-4 border bg-slate-800/50 ${color}`}>
                        <p className="text-slate-400 text-xs mb-1">{label}</p>
                        <p className="text-white font-bold text-2xl">{value}</p>
                    </div>
                ))}
            </div>

            {/* Basic Config — ID only, key comes from auth */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
                <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-slate-500" />
                    Basic Configuration
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
                        <span className="text-slate-500 text-xs">Admin Key</span>
                        <span className="text-emerald-400 text-xs font-medium ml-auto">● Active from login</span>
                    </div>
                    <InputField label="Timetable ID" type="number" value={timetableId}
                        onChange={e => setTimetableId(parseInt(e.target.value))} />
                </div>
            </div>

            {/* Days */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <h2 className="text-white font-semibold flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-slate-500" />
                        Days & Time Slots
                    </h2>
                    <button
                        onClick={() => setShowDayModal(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all w-full sm:w-auto"
                    >
                        <Plus className="w-4 h-4" />
                        Add Day
                    </button>
                </div>

                <div className="space-y-4">
                    {days.sort((a, b) => a.day - b.day).map(day => (
                        <DayCard
                            key={day.day}
                            day={day}
                            getDayName={getDayName}
                            formatTime={formatTime}
                            onAddTimeSlot={(di) => { setCurrentDayIndex(di); setShowColumnModal(true); }}
                            onRemoveDay={removeDay}
                            onRemoveColumn={removeColumn}
                            onAddSchedule={(di, ci) => { setCurrentDayIndex(di); setCurrentColumnIndex(ci); setShowSlotModal(true); }}
                            onEditSlot={editSlot}
                            onRemoveSlot={removeSlot}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            isColumnDragTarget={isColumnDragTarget}
                            isSlotBeingDragged={isSlotBeingDragged}
                        />
                    ))}

                    {days.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
                                <CalendarDays className="w-8 h-8 text-slate-600" />
                            </div>
                            <p className="text-slate-400 font-medium">No days added yet</p>
                            <p className="text-slate-600 text-sm mt-1">Click "Add Day" to start building your timetable</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
                {validationError && (
                    <div className="flex items-center gap-2.5 bg-amber-900/30 border border-amber-500/30 rounded-xl p-3">
                        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <p className="text-amber-300 text-sm">{validationError}</p>
                    </div>
                )}
                {submitStatus === 'error' && submitError && (
                    <div className="flex items-center gap-2.5 bg-red-900/30 border border-red-500/30 rounded-xl p-3">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <p className="text-red-300 text-sm">{submitError}</p>
                    </div>
                )}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-slate-400 text-sm hidden sm:block">
                        {days.length === 0 ? 'Add at least one day to submit.' : `${days.length} day(s) · ${totalSchedules} schedule(s) configured`}
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
                            disabled={submitStatus === 'loading' || days.length === 0}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex-1 sm:flex-none justify-center ${
                                submitStatus === 'success' ? 'bg-emerald-600 text-white' :
                                submitStatus === 'error' ? 'bg-red-600 text-white' :
                                'bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50'
                            }`}
                        >
                            {submitStatus === 'loading' ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</>
                            ) : submitStatus === 'success' ? (
                                <><Check className="w-4 h-4" />Submitted!</>
                            ) : submitStatus === 'error' ? (
                                <>Failed — Retry</>
                            ) : (
                                <><Send className="w-4 h-4" />Submit Timetable</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <Modals
                showDayModal={showDayModal} showColumnModal={showColumnModal}
                showSlotModal={showSlotModal} showLoadModal={showLoadModal}
                newDay={newDay} newColumn={newColumn} newSlot={newSlot}
                jsonInput={jsonInput} loadError={loadError} editingSlotIndex={editingSlotIndex}
                dayNames={dayNames} slotPurposes={slotPurposes} availableBatches={availableBatches} days={days}
                setNewDay={setNewDay} setNewColumn={setNewColumn} setNewSlot={setNewSlot}
                setJsonInput={setJsonInput} setLoadError={setLoadError}
                setShowDayModal={setShowDayModal} setShowColumnModal={setShowColumnModal}
                setShowSlotModal={setShowSlotModal} setShowLoadModal={setShowLoadModal}
                addDay={addDay} addColumn={addColumn} saveSlot={saveSlot}
                resetSlotModal={resetSlotModal} loadFromJson={loadFromJson}
            />
        </div>
    );
}

export default TimetableForm;
