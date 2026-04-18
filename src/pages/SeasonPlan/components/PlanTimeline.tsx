import React, { useMemo, useState, Fragment, useRef, useEffect } from 'react';
import { SeasonPlan, Phase } from '../../../types/seasonPlan';
import { ChevronRight, ChevronDown, Zap, CheckSquare, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../utils/cn';
import { rippleUpdatePhases, hasPlanOverlap, syncPlanDatesWithPhases, addDays } from '../../../utils/seasonPlanUtils';
import { SelectionState } from '../SeasonPlanPage';

interface PlanTimelineProps {
  plans: SeasonPlan[];
  selectedId?: string;
  onSelect: (selection: SelectionState) => void;
  onUpdatePlan: (plan: SeasonPlan) => void;
  onAddPhase: (planId: string, name: string) => void;
  preExpandedPlanId?: string;
  canEdit?: boolean;
}

export function PlanTimeline({
  plans,
  selectedId,
  onSelect,
  onUpdatePlan,
  onAddPhase,
  preExpandedPlanId,
  canEdit = false,
}: PlanTimelineProps) {
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [timeScale, setTimeScale] = useState<'weeks' | 'months' | 'quarters'>('months');
  const [isAddingPhaseTo, setIsAddingPhaseTo] = useState<string | null>(null);
  const addPhaseInputRef = useRef<HTMLInputElement>(null);
  const ganttBodyRef = useRef<HTMLDivElement>(null);
  const ganttHeaderRef = useRef<HTMLDivElement>(null);
  const scrollBarRef = useRef<HTMLDivElement>(null);

  // Auto-expand the pre-selected plan
  useEffect(() => {
    if (preExpandedPlanId && plans.length > 0) {
      const plan = plans.find(p => p.id === preExpandedPlanId);
      if (plan) {
        setExpandedPlans(new Set([preExpandedPlanId]));
        // Auto-expand all phases
        const phaseIds = new Set(plan.phases.map(ph => ph.id));
        setExpandedPhases(phaseIds);
      }
    }
  }, [preExpandedPlanId, plans]);

  // Sync scrolling between header, body and bottom scrollbar
  const syncScroll = (source: 'body' | 'scrollbar') => (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = (e.currentTarget as HTMLDivElement).scrollLeft;
    if (source === 'body') {
      if (ganttHeaderRef.current) ganttHeaderRef.current.scrollLeft = scrollLeft;
      if (scrollBarRef.current) scrollBarRef.current.scrollLeft = scrollLeft;
    } else {
      if (ganttBodyRef.current) ganttBodyRef.current.scrollLeft = scrollLeft;
      if (ganttHeaderRef.current) ganttHeaderRef.current.scrollLeft = scrollLeft;
    }
  };

  const [dragState, setDragState] = useState<{
    type: 'MOVE' | 'RESIZE';
    planId: string;
    phaseId: string;
    initialDuration: number;
    initialStartDate: string;
    startX: number;
  } | null>(null);

  // const canEdit = canEditPlan(user?.role); // Removed in favor of prop

  const handleMouseDown = (e: React.MouseEvent, planId: string, phase: Phase, type: 'MOVE' | 'RESIZE') => {
    if (!canEdit) return;
    e.stopPropagation();
    
    const duration = Math.round((new Date(phase.endDate).getTime() - new Date(phase.startDate).getTime()) / (1000 * 60 * 60 * 24));
    
    setDragState({
      type,
      planId,
      phaseId: phase.id,
      initialDuration: duration,
      initialStartDate: phase.startDate,
      startX: e.clientX
    });
  };

  const handleMouseMove = () => {
    if (!dragState) return;
    // Possible enhancement: Show ghost bar or live preview
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!dragState) return;
    
    const deltaX = e.clientX - dragState.startX;
    const deltaDays = Math.round(deltaX / pixelsPerDay);
    
    if (deltaDays !== 0) {
      const plan = plans.find(p => p.id === dragState.planId);
      if (plan) {
        const phaseIndex = plan.phases.findIndex(ph => ph.id === dragState.phaseId);
        
        let updatedPhases = plan.phases;
        if (dragState.type === 'RESIZE') {
          const newDuration = Math.max(1, dragState.initialDuration + deltaDays);
          updatedPhases = rippleUpdatePhases(plan.phases, phaseIndex, { newDuration });
        } else {
          const newStartDate = addDays(dragState.initialStartDate, deltaDays);
          updatedPhases = rippleUpdatePhases(plan.phases, phaseIndex, { newStartDate });
        }
        
        // Sync plan dates
        const updatedPlan = syncPlanDatesWithPhases({
          ...plan,
          phases: updatedPhases
        });

        // Conflict check
        if (hasPlanOverlap(updatedPlan.plotId, updatedPlan.startDate, updatedPlan.endDate, plans, updatedPlan.id)) {
          alert('Cảnh báo: Thay đổi này gây ra xung đột thời gian với kế hoạch khác trên cùng lô đất.');
        }

        onUpdatePlan(updatedPlan);
      }
    }
    
    setDragState(null);
  };

  const toggleExpandPlan = (planId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedPlans);
    if (newExpanded.has(planId)) {
      newExpanded.delete(planId);
    } else {
      newExpanded.add(planId);
    }
    setExpandedPlans(newExpanded);
  };

  const toggleExpandPhase = (phaseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
  };

  const handleAddPhaseSubmit = (planId: string) => {
    const name = addPhaseInputRef.current?.value;
    console.log('[PlanTimeline] handleAddPhaseSubmit:', { planId, name });
    if (name && name.trim()) {
      onAddPhase(planId, name.trim());
    } else {
      console.warn('[PlanTimeline] Invalid phase name:', name);
    }
    setIsAddingPhaseTo(null);
  };

  // Timeline bounds calculation
  const { minDate, maxDate, totalDays } = useMemo(() => {
    if (plans.length === 0) {
      const today = new Date();
      const start = new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000);
      const end = new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000);
      return { minDate: start, maxDate: end, totalDays: 60 };
    }

    let min = new Date(plans[0].startDate);
    let max = new Date(plans[0].endDate);
    
    plans.forEach((plan) => {
      const start = new Date(plan.startDate);
      const end = new Date(plan.endDate);
      if (start < min) min = start;
      if (end > max) max = end;
    });

    min = new Date(min.getTime() - 15 * 24 * 60 * 60 * 1000);
    max = new Date(max.getTime() + 45 * 24 * 60 * 60 * 1000);
    
    const diff = Math.ceil((max.getTime() - min.getTime()) / (1000 * 60 * 60 * 24));
    return { minDate: min, maxDate: max, totalDays: diff };
  }, [plans]);

  const months = useMemo(() => {
    const result = [];
    let current = new Date(minDate);
    current.setDate(1);

    while (current <= maxDate) {
      const monthStr = current.toLocaleString('vi-VN', { month: 'long', year: 'numeric' });
      const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
      
      let startOffset = 0;
      if (current < minDate) {
        startOffset = Math.ceil((minDate.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
      }
      
      let endOffset = 0;
      const endOfMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      if (endOfMonth > maxDate) {
        endOffset = Math.ceil((endOfMonth.getTime() - maxDate.getTime()) / (1000 * 60 * 60 * 24));
      }

      const visibleDays = daysInMonth - startOffset - endOffset;
      if (visibleDays > 0) {
        result.push({
          label: monthStr.charAt(0).toUpperCase() + monthStr.slice(1),
          days: visibleDays,
          widthPercent: (visibleDays / totalDays) * 100,
        });
      }
      current.setMonth(current.getMonth() + 1);
    }
    return result;
  }, [minDate, maxDate, totalDays]);

  const pixelsPerDay = useMemo(() => {
    switch (timeScale) {
      case 'weeks': return 80;
      case 'months': return 30;
      case 'quarters': return 10;
      default: return 30;
    }
  }, [timeScale]);

  const totalWidth = totalDays * pixelsPerDay;

  const getPositionStyle = (startDateStr: string, endDateStr: string) => {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const left = ((start.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) * pixelsPerDay;
    const width = ((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) * pixelsPerDay;
    
    return {
      left: `${Math.max(0, left)}px`,
      width: `${Math.max(20, width)}px`,
    };
  };

  const todayPosition = useMemo(() => {
    const today = new Date();
    if (today < minDate || today > maxDate) return null;
    return ((today.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) * pixelsPerDay;
  }, [minDate, maxDate, pixelsPerDay]);

  return (
    <div className="bg-white flex flex-col h-full relative overflow-hidden border border-slate-200 rounded-xl m-4 shadow-sm">
      {/* Header Area */}
      <div className="flex border-b-2 border-slate-300 bg-slate-50/50 sticky top-0 z-30">
        <div className="w-[320px] flex-shrink-0 border-r border-slate-200 px-4 py-2 flex items-center justify-between bg-white z-40">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Danh mục công việc</span>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400 hover:bg-slate-50">
           
          </Button>
        </div>
        
        <div className="flex-1 overflow-x-auto overflow-y-hidden" ref={ganttHeaderRef} id="timeline-header-container" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div style={{ width: `${totalWidth}px` }} className="relative h-full flex bg-slate-50/50">
            {months.map((month, idx) => {
              const monthWidth = (month.days / totalDays) * totalWidth;
              return (
                <div
                  key={idx}
                  className="h-full flex items-center justify-center text-[9px] font-black text-slate-400 border-r border-slate-200 last:border-r-0 uppercase tracking-widest"
                  style={{ width: `${monthWidth}px` }}
                >
                  {month.label}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div 
        className="flex-1 flex overflow-hidden bg-white select-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Fixed Sidebar */}
        <div className="w-[320px] flex-shrink-0 border-r border-slate-200 overflow-y-auto no-scrollbar z-20 bg-white flex flex-col">
          <div className="flex flex-col flex-1">
            {plans.map((plan) => {
              const isExpanded = expandedPlans.has(plan.id);
              const isPlanSelected = selectedId === plan.id;
              
              return (
                <Fragment key={plan.id}>
                  <div
                    className={cn(
                      "flex h-12 items-center px-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer group transition-all",
                      isPlanSelected && "bg-indigo-50/50 border-l-4 border-l-indigo-500 pl-3"
                    )}
                    onClick={() => onSelect({ type: 'PLAN', id: plan.id, planId: plan.id })}
                  >
                    <button
                      onClick={(e) => toggleExpandPlan(plan.id, e)}
                      className="p-1 mr-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                    >
                      {isExpanded ? <ChevronDown size={14} strokeWidth={3} /> : <ChevronRight size={14} strokeWidth={3} />}
                    </button>
                    <div className="truncate flex-1 text-[13px] font-bold text-slate-700">
                       {plan.name}
                    </div>
                  </div>

                  {isExpanded && (
                    <>
                      {plan.phases.map((phase) => {
                        const isPhaseExpanded = expandedPhases.has(phase.id);
                        const isPhaseSelected = selectedId === phase.id;
                        
                        return (
                          <Fragment key={phase.id}>
                            <div
                              className={cn(
                                "flex h-11 items-center pl-8 pr-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-all",
                                isPhaseSelected && "bg-indigo-50/50 border-l-4 border-l-indigo-400 pl-7"
                              )}
                              onClick={() => onSelect({ type: 'PHASE', id: phase.id, planId: plan.id })}
                            >
                              <button
                                 onClick={(e) => toggleExpandPhase(phase.id, e)}
                                 className="p-1 mr-1 text-slate-300 hover:text-indigo-500 transition-colors"
                               >
                                 {isPhaseExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                               </button>
                               <Zap size={14} className="text-purple-600 mr-2 shrink-0" fill="currentColor" />
                               <div className="truncate text-[13px] font-bold text-slate-600 flex-1">
                                 {phase.name}
                               </div>
                            </div>

                             {isPhaseExpanded && phase.tasks && phase.tasks.map((task) => (
                                <div
                                  key={task.id}
                                  className={cn(
                                    "flex h-11 items-center pl-16 pr-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer",
                                    selectedId === task.id && "bg-indigo-50/50 border-l-4 border-l-indigo-300 pl-15"
                                  )}
                                  onClick={() => onSelect({ type: 'TASK', id: task.id, planId: plan.id, phaseId: phase.id })}
                                >
                                  <CheckSquare size={13} className="text-blue-500 mr-2 shrink-0" />
                                  <div className="truncate text-[13px] font-medium text-slate-500 flex-1">
                                    {task.name}
                                  </div>
                                </div>
                             ))}
                          </Fragment>
                        );
                      })}
                      
                      {/* Add Phase Input/Button */}
                      {isAddingPhaseTo === plan.id ? (
                        <div className="p-3 pl-12 border-b border-slate-50 bg-indigo-50/20">
                          <input
                            ref={addPhaseInputRef}
                            autoFocus
                            placeholder="Tên giai đoạn mới..."
                            className="w-full px-3 py-1.5 text-xs font-bold bg-white border border-indigo-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddPhaseSubmit(plan.id);
                              }
                              if (e.key === 'Escape') {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsAddingPhaseTo(null);
                              }
                            }}
                            onBlur={() => {
                              // Small delay to allow Enter key to be processed before blur unmounts
                              setTimeout(() => setIsAddingPhaseTo(null), 100);
                            }}
                          />
                        </div>
                      ) : canEdit ? (
                        <button 
                          className="flex h-11 items-center pl-12 pr-4 text-[11px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors"
                          onClick={() => setIsAddingPhaseTo(plan.id)}
                        >
                          <Plus size={14} className="mr-2" />
                          Thêm giai đoạn
                        </button>
                      ) : null}
                    </>
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>

        {/* Scrollable Gantt Body */}
        <div 
          ref={ganttBodyRef}
          className="flex-1 overflow-x-auto overflow-y-hidden relative" 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={syncScroll('body')}
        >
          <div style={{ width: `${totalWidth}px` }} className="absolute inset-y-0 flex pointer-events-none z-0">
            {months.map((month, idx) => {
              const monthWidth = (month.days / totalDays) * totalWidth;
              return <div key={idx} className="h-full border-r border-slate-100/50" style={{ width: `${monthWidth}px` }} />;
            })}
          </div>

          {todayPosition !== null && (
            <div className="absolute top-0 bottom-0 w-[1px] bg-indigo-500/60 z-10 pointer-events-none" style={{ left: `${todayPosition}px` }}>
               <div className="absolute top-0 -left-1.5 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white shadow-lg" />
            </div>
          )}

          <div style={{ width: `${totalWidth}px` }} className="relative flex flex-col min-h-full">
            {plans.map((plan) => {
               const isExpanded = expandedPlans.has(plan.id);
               return (
                 <Fragment key={plan.id}>
                    <div className="h-12 border-b border-slate-100 relative flex items-center">
                    </div>

                    {isExpanded && plan.phases.map((phase) => {
                       const isPhaseExpanded = expandedPhases.has(phase.id);
                       return (
                         <Fragment key={phase.id}>
                            <div className="h-11 border-b border-slate-100 relative flex items-center">
                              <div 
                                className={cn(
                                  "absolute h-6 border rounded-sm flex items-center px-2 shadow-sm transition-all",
                                  canEdit ? "cursor-grab active:cursor-grabbing" : "cursor-default",
                                  selectedId === phase.id 
                                    ? "border-indigo-500 bg-indigo-100 shadow-indigo-200 z-10" 
                                    : "border-indigo-200/60 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-300"
                                )}
                                style={getPositionStyle(phase.startDate, phase.endDate)}
                                onClick={() => onSelect({ type: 'PHASE', id: phase.id, planId: plan.id })}
                                onMouseDown={(e) => handleMouseDown(e, plan.id, phase, 'MOVE')}
                              >
                                 <span className="text-[9px] font-black text-slate-700 truncate uppercase mt-[-1px] pointer-events-none">
                                   {phase.name}
                                 </span>
                                 {canEdit && (
                                   <div 
                                      className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-indigo-400/50 rounded-r-sm transition-colors z-20"
                                      onMouseDown={(e) => {
                                        e.stopPropagation();
                                        handleMouseDown(e, plan.id, phase, 'RESIZE');
                                      }}
                                   />
                                 )}
                              </div>
                            </div>

                            {isPhaseExpanded && phase.tasks && phase.tasks.map((task) => {
                               const statusCode = typeof task.status === 'string' ? task.status : task.status.code;
                               const statusColor = typeof task.status === 'string' ? '' : task.status.color;
                               
                               return (
                                 <div key={task.id} className="h-11 border-b border-slate-50 relative flex items-center">
                                    <div
                                      className={cn(
                                        "absolute h-4 rounded-sm border transition-all cursor-pointer overflow-hidden",
                                        selectedId === task.id ? "border-blue-600 shadow-sm z-10" : "border-slate-200 hover:border-slate-400"
                                      )}
                                      style={{
                                        ...getPositionStyle(task.startDate, task.endDate),
                                        backgroundColor: statusColor && statusCode === 'CUSTOM' ? `${statusColor}20` : undefined
                                      }}
                                      onClick={() => onSelect({ type: 'TASK', id: task.id, planId: plan.id, phaseId: phase.id })}
                                    >
                                       {/* Progress Background */}
                                       <div 
                                         className={cn(
                                            "h-full transition-all",
                                            statusCode === 'COMPLETED' ? "bg-emerald-500" :
                                            statusCode === 'OVERDUE' ? "bg-rose-500" :
                                            "bg-blue-500"
                                         )}
                                         style={{ 
                                            width: `${task.progressPercent}%`,
                                            backgroundColor: statusColor && statusCode === 'CUSTOM' ? statusColor : undefined
                                         }}
                                       />
                                    </div>
                                 </div>
                               );
                            })}
                         </Fragment>
                       );
                    })}
                 </Fragment>
               );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Horizontal Scrollbar */}
      <div className="flex bg-white">
        <div className="w-[320px] flex-shrink-0 border-r border-slate-200" />
        <div
          ref={scrollBarRef}
          className="flex-1 overflow-x-auto overflow-y-hidden h-4"
          style={{ scrollbarWidth: 'auto' }}
          onScroll={syncScroll('scrollbar')}
        >
          <div style={{ width: `${totalWidth}px`, height: 1 }} />
        </div>
      </div>

      {/* Zoom Selector */}
      <div className="absolute bottom-10 right-10 z-30 flex bg-white/95 backdrop-blur-xl shadow-2xl shadow-indigo-200/50 border border-slate-200 rounded-xl p-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
         {(['weeks', 'months', 'quarters'] as const).map((scale) => (
           <button
             key={scale}
             onClick={() => setTimeScale(scale)}
             className={cn(
               "px-3 py-1.5 text-[9px] font-black uppercase tracking-wider transition-all rounded-lg",
               timeScale === scale 
                 ? "bg-slate-900 text-white shadow-xl shadow-slate-300" 
                 : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
             )}
           >
             {scale === 'weeks' ? 'Tuần' : scale === 'months' ? 'Tháng' : 'Quý'}
           </button>
         ))}
      </div>
    </div>
  );
}
