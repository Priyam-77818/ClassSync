import React from 'react';
import { X, Upload, FileText } from 'lucide-react';

function ModalWrapper({ title, icon: Icon, iconColor, onClose, children }) {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor || 'bg-slate-700'}`}>
                                <Icon className="w-4 h-4 text-white" />
                            </div>
                        )}
                        <h3 className="text-white font-semibold">{title}</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-5">
                    {children}
                </div>
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

function ModalActions({ primary, secondary, onPrimary, onSecondary, primaryDisabled }) {
    return (
        <div className="flex gap-3 mt-5">
            <button
                onClick={onPrimary}
                disabled={primaryDisabled}
                className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all"
            >
                {primary}
            </button>
            <button
                onClick={onSecondary}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-all"
            >
                {secondary}
            </button>
        </div>
    );
}

export function Modals({
    showDayModal, showColumnModal, showSlotModal, showLoadModal,
    newDay, newColumn, newSlot, jsonInput, loadError, editingSlotIndex,
    dayNames, slotPurposes, availableBatches, days,
    setNewDay, setNewColumn, setNewSlot, setJsonInput, setLoadError,
    setShowDayModal, setShowColumnModal, setShowSlotModal, setShowLoadModal,
    addDay, addColumn, saveSlot, resetSlotModal, loadFromJson,
}) {
    const purposeLabel = { L: 'Lecture', T: 'Tutorial', P: 'Practical' };
    const purposeColor = { L: 'bg-blue-600', T: 'bg-amber-600', P: 'bg-emerald-600' };

    return (
        <>
            {/* Add Day Modal */}
            {showDayModal && (
                <ModalWrapper title="Add Day" onClose={() => setShowDayModal(false)}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-slate-400 text-xs font-medium mb-1.5">Select Day</label>
                            <select
                                value={newDay.day}
                                onChange={e => setNewDay({ ...newDay, day: parseInt(e.target.value) })}
                                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                            >
                                {dayNames.map((name, i) => (
                                    <option key={i} value={i} disabled={days.some(d => d.day === i)}>
                                        {name} {days.some(d => d.day === i) ? '(added)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <ModalActions primary="Add Day" secondary="Cancel" onPrimary={addDay} onSecondary={() => setShowDayModal(false)} />
                    </div>
                </ModalWrapper>
            )}

            {/* Add Time Slot Modal */}
            {showColumnModal && (
                <ModalWrapper title="Add Time Slot" onClose={() => setShowColumnModal(false)}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <InputField label="Hour" type="number" min="0" max="23" value={newColumn.start_time.hr}
                                onChange={e => setNewColumn({ ...newColumn, start_time: { ...newColumn.start_time, hr: parseInt(e.target.value) } })} />
                            <InputField label="Minutes" type="number" min="0" max="59" value={newColumn.start_time.min}
                                onChange={e => setNewColumn({ ...newColumn, start_time: { ...newColumn.start_time, min: parseInt(e.target.value) } })} />
                        </div>
                        <InputField label="Duration (minutes)" type="number" min="1" value={newColumn.duration}
                            onChange={e => setNewColumn({ ...newColumn, duration: parseInt(e.target.value) })} />
                        <ModalActions primary="Add Time Slot" secondary="Cancel" onPrimary={addColumn} onSecondary={() => setShowColumnModal(false)} />
                    </div>
                </ModalWrapper>
            )}

            {/* Add / Edit Schedule Modal */}
            {showSlotModal && (
                <ModalWrapper
                    title={editingSlotIndex !== null ? 'Edit Schedule' : 'Add Schedule'}
                    onClose={resetSlotModal}
                >
                    <div className="space-y-4">
                        {/* Slot Purpose */}
                        <div>
                            <label className="block text-slate-400 text-xs font-medium mb-2">Slot Type</label>
                            <div className="grid grid-cols-3 gap-2">
                                {slotPurposes.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setNewSlot({ ...newSlot, slot_purpose: p })}
                                        className={`py-2 rounded-xl text-sm font-semibold border transition-all ${
                                            newSlot.slot_purpose === p
                                                ? `${purposeColor[p]} text-white border-transparent`
                                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        {purposeLabel[p]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <InputField label="Course" type="text" value={newSlot.course}
                            onChange={e => setNewSlot({ ...newSlot, course: e.target.value })}
                            placeholder="Course name or code" />

                        <InputField label="Room" type="text" value={newSlot.room}
                            onChange={e => setNewSlot({ ...newSlot, room: e.target.value })}
                            placeholder="e.g. Room 101" />

                        <InputField label="Teachers (comma separated)" type="text"
                            value={newSlot.teacher.join(', ')}
                            onChange={e => setNewSlot({ ...newSlot, teacher: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                            placeholder="e.g. PKS, JDM" />

                        {/* Batches */}
                        <div>
                            <label className="block text-slate-400 text-xs font-medium mb-2">
                                Batches <span className="text-slate-600">({newSlot.batch.length} selected)</span>
                            </label>
                            <div className="grid grid-cols-5 gap-1.5 max-h-28 overflow-y-auto p-1">
                                {availableBatches.map(b => (
                                    <button
                                        key={b}
                                        onClick={() => {
                                            const has = newSlot.batch.includes(b);
                                            setNewSlot({ ...newSlot, batch: has ? newSlot.batch.filter(x => x !== b) : [...newSlot.batch, b] });
                                        }}
                                        className={`py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                            newSlot.batch.includes(b)
                                                ? 'bg-violet-600 text-white border-violet-500'
                                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        {b}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <ModalActions
                            primary={editingSlotIndex !== null ? 'Update Schedule' : 'Add Schedule'}
                            secondary="Cancel"
                            onPrimary={saveSlot}
                            onSecondary={resetSlotModal}
                        />
                    </div>
                </ModalWrapper>
            )}

            {/* Load JSON Modal */}
            {showLoadModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
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
                                placeholder="Paste your JSON configuration here..."
                                className="w-full h-52 bg-slate-800 border border-slate-700 text-slate-300 placeholder-slate-600 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                            />
                            {loadError && (
                                <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3">
                                    <p className="text-red-400 text-sm">{loadError}</p>
                                </div>
                            )}
                            <div className="flex gap-3">
                                <button onClick={loadFromJson} disabled={!jsonInput.trim()}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-all">
                                    <Upload className="w-4 h-4" />
                                    Load
                                </button>
                                <button onClick={() => { setShowLoadModal(false); setJsonInput(''); setLoadError(''); }}
                                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-all">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
