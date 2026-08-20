import React from 'react';
import { Plus, X, Clock, Calendar, Trash2 } from 'lucide-react';

const purposeColors = {
    L: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    T: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    P: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};
const purposeLabel = { L: 'Lecture', T: 'Tutorial', P: 'Practical' };

export function DayCard({
    day, getDayName, formatTime,
    onAddTimeSlot, onRemoveDay, onRemoveColumn,
    onAddSchedule, onEditSlot, onRemoveSlot,
    onDragStart, onDragOver, onDragLeave, onDrop,
    isColumnDragTarget, isSlotBeingDragged
}) {
    const totalSlots = day.cols.reduce((s, c) => s + c.schedules.length, 0);

    return (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
            {/* Day header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-3.5 bg-slate-800/60 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold">{getDayName(day.day)}</h3>
                        <p className="text-slate-500 text-xs">{day.cols.length} slot(s) · {totalSlots} schedule(s)</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onAddTimeSlot(day.day)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-medium transition-all"
                    >
                        <Plus className="w-3 h-3" />
                        Add Time Slot
                    </button>
                    <button onClick={() => onRemoveDay(day.day)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Time columns */}
            <div className="p-4">
                {day.cols.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-center">
                        <Clock className="w-8 h-8 text-slate-700 mb-2" />
                        <p className="text-slate-600 text-sm">No time slots yet</p>
                        <button onClick={() => onAddTimeSlot(day.day)}
                            className="mt-3 text-blue-400 hover:text-blue-300 text-xs underline transition-colors">
                            Add a time slot
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {day.cols.map((col, ci) => (
                            <TimeSlotCard
                                key={ci}
                                col={col} colIndex={ci} dayIndex={day.day}
                                formatTime={formatTime}
                                onRemoveColumn={onRemoveColumn}
                                onAddSchedule={onAddSchedule}
                                onEditSlot={onEditSlot}
                                onRemoveSlot={onRemoveSlot}
                                onDragStart={onDragStart}
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onDrop={onDrop}
                                isColumnDragTarget={isColumnDragTarget}
                                isSlotBeingDragged={isSlotBeingDragged}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function TimeSlotCard({
    col, colIndex, dayIndex, formatTime,
    onRemoveColumn, onAddSchedule, onEditSlot, onRemoveSlot,
    onDragStart, onDragOver, onDragLeave, onDrop,
    isColumnDragTarget, isSlotBeingDragged
}) {
    const isDragTarget = isColumnDragTarget && isColumnDragTarget(dayIndex, colIndex);
    return (
        <div
            className={`border rounded-xl transition-all ${isDragTarget ? 'border-blue-500/60 bg-blue-500/5' : 'border-slate-700/60 bg-slate-900/60'}`}
            onDragOver={e => onDragOver && onDragOver(e, dayIndex, colIndex)}
            onDragLeave={onDragLeave}
            onDrop={e => onDrop && onDrop(e, dayIndex, colIndex)}
        >
            {/* Slot header */}
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-300 text-xs font-semibold">{formatTime(col.start_time)}</span>
                    <span className="text-slate-600 text-xs">· {col.duration}min</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => onAddSchedule(dayIndex, colIndex)}
                        className="p-1 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-all">
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onRemoveColumn(dayIndex, colIndex)}
                        className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Schedules */}
            <div className="p-2.5 space-y-2">
                {col.schedules.map((s, si) => (
                    <ScheduleItem
                        key={si}
                        schedule={s} scheduleIndex={si} dayIndex={dayIndex} colIndex={colIndex}
                        onEditSlot={onEditSlot} onRemoveSlot={onRemoveSlot}
                        onDragStart={onDragStart} isSlotBeingDragged={isSlotBeingDragged}
                    />
                ))}
                <button
                    onClick={() => onAddSchedule(dayIndex, colIndex)}
                    className="w-full py-2 border border-dashed border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/5 text-slate-600 hover:text-blue-400 rounded-lg text-xs transition-all"
                >
                    + Add Schedule
                </button>
            </div>
        </div>
    );
}

function ScheduleItem({ schedule, scheduleIndex, dayIndex, colIndex, onEditSlot, onRemoveSlot, onDragStart, isSlotBeingDragged }) {
    const purpose = schedule.slot_purpose || 'L';
    const isDragging = isSlotBeingDragged && isSlotBeingDragged(dayIndex, colIndex, scheduleIndex);
    return (
        <div
            draggable
            onDragStart={() => onDragStart && onDragStart(dayIndex, colIndex, scheduleIndex)}
            className={`group bg-slate-800 border rounded-lg p-2.5 cursor-move transition-all hover:border-slate-600 ${isDragging ? 'opacity-40 border-blue-400' : 'border-slate-700'}`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md border ${purposeColors[purpose] || purposeColors.L}`}>
                            {purpose}
                        </span>
                        {schedule.batch && (
                            <span className="text-slate-500 text-xs truncate">
                                {Array.isArray(schedule.batch) ? schedule.batch.slice(0,3).join(', ') + (schedule.batch.length > 3 ? '…' : '') : schedule.batch}
                            </span>
                        )}
                    </div>
                    {schedule.course && <p className="text-white text-xs font-medium truncate">{schedule.course}</p>}
                    <div className="mt-1 space-y-0.5">
                        {schedule.room && <p className="text-slate-500 text-xs">📍 {schedule.room}</p>}
                        {schedule.teacher && (
                            <p className="text-slate-500 text-xs">👤 {Array.isArray(schedule.teacher) ? schedule.teacher.join(', ') : schedule.teacher}</p>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => onEditSlot(dayIndex, colIndex, scheduleIndex)}
                        className="text-xs text-blue-400 hover:text-blue-300 px-1.5 py-0.5 hover:bg-blue-500/10 rounded transition-all">
                        Edit
                    </button>
                    <button onClick={() => onRemoveSlot(dayIndex, colIndex, scheduleIndex)}
                        className="text-xs text-red-400 hover:text-red-300 px-1.5 py-0.5 hover:bg-red-500/10 rounded transition-all">
                        Del
                    </button>
                </div>
            </div>
        </div>
    );
}
