import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { SeasonPlan, Phase, Task } from '../../../types/seasonPlan';
import { ChevronRight, ChevronDown, Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '../../../utils/cn';
import {
  rippleUpdatePhases,
  hasPlanOverlap,
  syncPlanDatesWithPhases,
} from '../../../utils/seasonPlanUtils';
import { SelectionState } from '../SeasonPlanPage';

// ─── Types ────────────────────────────────────────────────────────────────────

type DragTarget =
  | { kind: 'phase'; planId: string; phaseId: string }
  | { kind: 'task'; planId: string; phaseId: string; taskId: string };

type DragMode = 'MOVE' | 'RESIZE_LEFT' | 'RESIZE_RIGHT';

interface BarDragState {
  mode: DragMode;
  target: DragTarget;
  startX: number;
  origStart: string;
  origEnd: string;
}

type TimeScale = 'weeks' | 'months' | 'quarters';

interface PlanTimelineProps {
  plans: SeasonPlan[];
  selectedId?: string;
  onSelect: (selection: SelectionState) => void;
  onUpdatePlan: (plan: SeasonPlan) => void;
  onDeletePlan?: (planId: string) => void;
  onAddPhase: (planId: string) => void;
  onExpandPhase?: (planId: string, phaseId: string) => void;
  preExpandedPlanId?: string;
  canEdit?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

function addDaysToStr(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return toDateStr(d);
}

function diffDays(a: string | Date, b: string | Date): number {
  const da = typeof a === 'string' ? new Date(a) : a;
  const db = typeof b === 'string' ? new Date(b) : b;
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

function getMonday(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const result = new Date(d);
  result.setDate(d.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PlanTimeline({
  plans,
  selectedId,
  onSelect,
  onUpdatePlan,
  onDeletePlan,
  onAddPhase,
  onExpandPhase,
  preExpandedPlanId,
  canEdit = false,
}: PlanTimelineProps) {

  // ── Sidebar resize ────────────────────────────────────────────────────────
  const SIDEBAR_MIN = 200;
  const SIDEBAR_MAX = 520;
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const sidebarResizing = useRef(false);
  const sidebarStartX = useRef(0);
  const sidebarStartW = useRef(300);

  const startSidebarResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    sidebarResizing.current = true;
    sidebarStartX.current = e.clientX;
    sidebarStartW.current = sidebarWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [sidebarWidth]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!sidebarResizing.current) return;
      const delta = e.clientX - sidebarStartX.current;
      setSidebarWidth(Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, sidebarStartW.current + delta)));
    };
    const onUp = () => {
      if (!sidebarResizing.current) return;
      sidebarResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  // ── Timeline state ────────────────────────────────────────────────────────
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [timeScale, setTimeScale] = useState<TimeScale>('weeks');
  const [barDrag, setBarDrag] = useState<BarDragState | null>(null);
  const [dragDeltaDays, setDragDeltaDays] = useState(0);
  const [dragTooltip, setDragTooltip] = useState<{ x: number; y: number; label: string } | null>(null);

  const ganttBodyRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const sprintRef = useRef<HTMLDivElement>(null);
  const scrollBarRef = useRef<HTMLDivElement>(null);
  const sidebarBodyRef = useRef<HTMLDivElement>(null);

  // ── Auto-expand ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (preExpandedPlanId && plans.length > 0) {
      const plan = plans.find(p => p.id === preExpandedPlanId);
      if (plan) {
        setExpandedPlans(new Set([preExpandedPlanId]));
        setExpandedPhases(new Set(plan.phases.map(ph => ph.id)));
      }
    }
  }, [preExpandedPlanId, plans]);

  // ── Pixels per day ───────────────────────────────────────────────────────
  const PPD = useMemo<number>(() => {
    switch (timeScale) {
      case 'weeks': return 44;
      case 'months': return 18;
      case 'quarters': return 6;
    }
  }, [timeScale]);

  // ── Timeline bounds ───────────────────────────────────────────────────────
  const { minDate, maxDate } = useMemo(() => {
    if (plans.length === 0) {
      const today = new Date();
      return {
        minDate: new Date(today.getTime() - 15 * 86_400_000),
        maxDate: new Date(today.getTime() + 75 * 86_400_000),
      };
    }
    let min = new Date(plans[0].startDate);
    let max = new Date(plans[0].endDate);
    plans.forEach(p => {
      const s = new Date(p.startDate), e = new Date(p.endDate);
      if (s < min) min = s;
      if (e > max) max = e;
    });
    return {
      minDate: new Date(min.getTime() - 20 * 86_400_000),
      maxDate: new Date(max.getTime() + 50 * 86_400_000),
    };
  }, [plans]);

  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / 86_400_000);
  const totalWidth = totalDays * PPD;

  // ── Today ─────────────────────────────────────────────────────────────────
  const todayDate = useMemo(() => {
    const t = new Date(); t.setHours(0, 0, 0, 0); return t;
  }, []);

  const todayLeft = useMemo(() => {
    if (todayDate < minDate || todayDate > maxDate) return null;
    return diffDays(minDate, todayDate) * PPD;
  }, [minDate, maxDate, PPD, todayDate]);

  // ─────────────────────────────────────────────────────────────────────────
  // HEADER DATA
  //
  // WEEKS:  dayCells[] — one per day.
  //         Each cell: leftPx, width=PPD, dayLabel ("1"…"31"),
  //         isFirstOfMonth (to show month name), isWeekend, isToday.
  //         Rendered as 2 sub-rows inside a single header band:
  //           top 28px: month spans
  //           bottom 28px: day numbers
  //
  // MONTHS: topCells (month names) + subCells (week-start dates)
  // QUARTERS: topCells (quarter labels) + subCells (month short names)
  // ─────────────────────────────────────────────────────────────────────────

  interface DayCell {
    date: Date;
    dayLabel: string;
    monthShort: string;
    isFirstOfMonth: boolean;
    isWeekend: boolean;
    isToday: boolean;
    leftPx: number;
  }

  const dayCells = useMemo((): DayCell[] => {
    if (timeScale !== 'weeks') return [];
    const cells: DayCell[] = [];
    let cur = new Date(minDate); cur.setHours(0, 0, 0, 0);
    while (cur <= maxDate) {
      const dow = cur.getDay();
      cells.push({
        date: new Date(cur),
        dayLabel: String(cur.getDate()),
        monthShort: cur.toLocaleString('vi-VN', { month: 'short' }),
        isFirstOfMonth: cur.getDate() === 1,
        isWeekend: dow === 0 || dow === 6,
        isToday: cur.getTime() === todayDate.getTime(),
        leftPx: diffDays(minDate, cur) * PPD,
      });
      cur = new Date(cur.getTime() + 86_400_000);
    }
    return cells;
  }, [timeScale, minDate, maxDate, PPD, todayDate]);

  // Month spans for the top portion of weeks header
  const monthSpans = useMemo(() => {
    if (timeScale !== 'weeks') return [];
    const spans: { label: string; leftPx: number; widthPx: number }[] = [];
    let curLabel = '';
    let curLeft = 0;
    let curWidth = 0;
    dayCells.forEach(cell => {
      if (cell.monthShort !== curLabel) {
        if (curLabel) spans.push({ label: curLabel, leftPx: curLeft, widthPx: curWidth });
        curLabel = cell.monthShort;
        curLeft = cell.leftPx;
        curWidth = PPD;
      } else {
        curWidth += PPD;
      }
    });
    if (curLabel) spans.push({ label: curLabel, leftPx: curLeft, widthPx: curWidth });
    return spans;
  }, [dayCells, timeScale, PPD]);

  interface ColCell { label: string; widthPx: number; isHighlight?: boolean; }

  const { topCells, subCells } = useMemo((): { topCells: ColCell[]; subCells: ColCell[] } => {
    if (timeScale === 'weeks') return { topCells: [], subCells: [] };
    const top: ColCell[] = [];
    const sub: ColCell[] = [];

    if (timeScale === 'months') {
      // top = months
      let cur = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      while (cur <= maxDate) {
        const nxt = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
        const s = cur < minDate ? minDate : cur;
        const e = nxt > maxDate ? maxDate : nxt;
        const days = Math.ceil((e.getTime() - s.getTime()) / 86_400_000);
        if (days > 0) top.push({ label: cur.toLocaleString('vi-VN', { month: 'long' }), widthPx: days * PPD });
        cur = nxt;
      }
      // sub = week starts
      const currentMonday = getMonday(todayDate);
      let wcur = getMonday(minDate);
      while (wcur <= maxDate) {
        const wend = new Date(wcur.getTime() + 7 * 86_400_000);
        const s = wcur < minDate ? new Date(minDate) : new Date(wcur);
        const e = wend > maxDate ? maxDate : wend;
        const days = Math.ceil((e.getTime() - s.getTime()) / 86_400_000);
        if (days > 0) {
          sub.push({
            label: String(s.getDate()),
            widthPx: days * PPD,
            isHighlight: wcur.getTime() === currentMonday.getTime(),
          });
        }
        wcur = wend;
      }
    } else {
      // quarters
      const Q = [['Tháng 1', 'Tháng 3'], ['Tháng 4', 'Tháng 6'], ['Tháng 7', 'Tháng 9'], ['Tháng 10', 'Tháng 12']];
      const qStart = Math.floor(minDate.getMonth() / 3) * 3;
      let cur = new Date(minDate.getFullYear(), qStart, 1);
      while (cur <= maxDate) {
        const nxt = new Date(cur.getFullYear(), cur.getMonth() + 3, 1);
        const s = cur < minDate ? minDate : cur;
        const e = nxt > maxDate ? maxDate : nxt;
        const days = Math.ceil((e.getTime() - s.getTime()) / 86_400_000);
        if (days > 0) {
          const qi = Math.floor(cur.getMonth() / 3);
          top.push({ label: `${Q[qi][0]} - ${Q[qi][1]}`, widthPx: days * PPD });
        }
        cur = nxt;
      }
      // sub = months
      let mcur = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      while (mcur <= maxDate) {
        const nxt = new Date(mcur.getFullYear(), mcur.getMonth() + 1, 1);
        const s = mcur < minDate ? minDate : mcur;
        const e = nxt > maxDate ? maxDate : nxt;
        const days = Math.ceil((e.getTime() - s.getTime()) / 86_400_000);
        if (days > 0) sub.push({ label: mcur.toLocaleString('vi-VN', { month: 'short' }), widthPx: days * PPD });
        mcur = nxt;
      }
    }
    return { topCells: top, subCells: sub };
  }, [timeScale, minDate, maxDate, PPD, todayDate]);

  // ── Sprint bars ───────────────────────────────────────────────────────────
  const sprintBars = useMemo(() => {
    return plans.flatMap(plan =>
      plan.phases.map(ph => ({
        label: ph.name,
        left: diffDays(minDate, new Date(ph.startDate)) * PPD,
        width: Math.max(24, diffDays(ph.startDate, ph.endDate) * PPD),
      }))
    );
  }, [plans, minDate, PPD]);

  // ── Scroll sync ───────────────────────────────────────────────────────────
  const syncRefs = useCallback((sl: number) => {
    [headerRef, sprintRef, scrollBarRef].forEach(r => {
      if (r.current) r.current.scrollLeft = sl;
    });
  }, []);

  const onBodyScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    syncRefs(el.scrollLeft);
    if (sidebarBodyRef.current) sidebarBodyRef.current.scrollTop = el.scrollTop;
  };

  const onBarScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const sl = (e.currentTarget as HTMLDivElement).scrollLeft;
    if (ganttBodyRef.current) ganttBodyRef.current.scrollLeft = sl;
    syncRefs(sl);
  };

  // ── Scroll to today ───────────────────────────────────────────────────────
  const scrollToToday = useCallback(() => {
    if (todayLeft === null || !ganttBodyRef.current) return;
    const cw = ganttBodyRef.current.clientWidth;
    const target = Math.max(0, todayLeft - cw * 0.35);
    ganttBodyRef.current.scrollLeft = target;
    syncRefs(target);
  }, [todayLeft, syncRefs]);

  useEffect(() => { scrollToToday(); }, [timeScale]);

  // ── Toggle ────────────────────────────────────────────────────────────────
  const togglePlan = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPlans(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const togglePhase = (id: string, planId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPhases(p => {
      const n = new Set(p);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
        if (onExpandPhase) onExpandPhase(planId, id);
      }
      return n;
    });
  };

  // ── Bar drag ──────────────────────────────────────────────────────────────
  const rafRef = useRef<number | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0, delta: 0 });

  const startBarDrag = (e: React.MouseEvent, target: DragTarget, mode: DragMode, origStart: string, origEnd: string) => {
    if (!canEdit) return;
    e.preventDefault(); e.stopPropagation();
    setBarDrag({ mode, target, startX: e.clientX, origStart, origEnd });
    setDragDeltaDays(0);
    document.body.style.cursor = mode === 'MOVE' ? 'grabbing' : mode === 'RESIZE_LEFT' ? 'w-resize' : 'e-resize';
  };

  const onGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (!barDrag) return;
    
    if (rafRef.current) return;
    
    rafRef.current = requestAnimationFrame(() => {
      if (!barDrag) { rafRef.current = null; return; }
      
      const delta = Math.round((e.clientX - barDrag.startX) / PPD);
      lastMousePos.current = { x: e.clientX, y: e.clientY, delta };
      
      setDragDeltaDays(delta);
      
      let s = barDrag.origStart, en = barDrag.origEnd;
      if (barDrag.mode === 'MOVE') { s = addDaysToStr(s, delta); en = addDaysToStr(en, delta); }
      else if (barDrag.mode === 'RESIZE_LEFT') s = addDaysToStr(s, delta);
      else en = addDaysToStr(en, delta);
      
      const fmt = (d: string) => {
        const date = new Date(d);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      };
      setDragTooltip({ x: e.clientX, y: e.clientY - 44, label: `${fmt(s)} → ${fmt(en)}` });
      
      rafRef.current = null;
    });
  }, [barDrag, PPD]);

  const onGlobalMouseUp = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (!barDrag || dragDeltaDays === 0) {
      setBarDrag(null); setDragDeltaDays(0); setDragTooltip(null);
      document.body.style.cursor = ''; return;
    }
    const { target, mode, origStart, origEnd } = barDrag;
    const d = dragDeltaDays;

    const applyUpdate = (plan: SeasonPlan): SeasonPlan => {
      if (target.kind === 'phase') {
        const idx = plan.phases.findIndex(ph => ph.id === target.phaseId);
        if (idx === -1) return plan;
        let phases: Phase[];
        if (mode === 'MOVE') {
          phases = rippleUpdatePhases(plan.phases, idx, { newStartDate: addDaysToStr(origStart, d) });
        } else if (mode === 'RESIZE_LEFT') {
          phases = plan.phases.map((ph, i) => {
            if (i !== idx) return ph;
            const dur = Math.max(1, diffDays(origStart, origEnd) - d);
            return { ...ph, startDate: addDaysToStr(origEnd, -dur) };
          });
        } else {
          phases = rippleUpdatePhases(plan.phases, idx, { newDuration: Math.max(1, diffDays(origStart, origEnd) + d) });
        }
        const updated = syncPlanDatesWithPhases({ ...plan, phases });
        if (updated.plots?.some(p => hasPlanOverlap(p.plotId, updated.startDate, updated.endDate, plans, updated.id)))
          window.alert('Cảnh báo: Thay đổi này gây ra xung đột thời gian với kế hoạch khác trên cùng lô đất.');
        return updated;
      }
      if (target.kind === 'task') {
        return {
          ...plan, phases: plan.phases.map(ph => {
            if (ph.id !== target.phaseId) return ph;
            return {
              ...ph, tasks: ph.tasks?.map(t => {
                if (t.id !== target.taskId) return t;
                if (mode === 'MOVE') return { ...t, startDate: addDaysToStr(origStart, d), endDate: addDaysToStr(origEnd, d) };
                if (mode === 'RESIZE_LEFT') return { ...t, startDate: addDaysToStr(origEnd, -Math.max(1, diffDays(origStart, origEnd) - d)) };
                return { ...t, endDate: addDaysToStr(origStart, Math.max(1, diffDays(origStart, origEnd) + d)) };
              }) ?? [],
            };
          }),
        };
      }
      return plan;
    };

    const plan = plans.find(p => p.id === target.planId);
    if (plan) onUpdatePlan(applyUpdate(plan));
    setBarDrag(null); setDragDeltaDays(0); setDragTooltip(null);
    document.body.style.cursor = '';
  }, [barDrag, dragDeltaDays, plans, onUpdatePlan]);

  useEffect(() => {
    if (!barDrag) return;
    window.addEventListener('mousemove', onGlobalMouseMove);
    window.addEventListener('mouseup', onGlobalMouseUp);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      window.removeEventListener('mousemove', onGlobalMouseMove);
      window.removeEventListener('mouseup', onGlobalMouseUp);
    };
  }, [barDrag, onGlobalMouseMove, onGlobalMouseUp]);

  // ── Bar preview style ─────────────────────────────────────────────────────
  const minDateTime = useMemo(() => minDate.getTime(), [minDate]);
  const ppdValue = PPD;

  const getLeft = useCallback((d: string) => {
    const days = Math.round((new Date(d).getTime() - minDateTime) / 86400000);
    return days * ppdValue;
  }, [minDateTime, ppdValue]);

  const getWidth = useCallback((s: string, e: string) => {
    const days = Math.round((new Date(e).getTime() - new Date(s).getTime()) / 86400000);
    return Math.max(ppdValue * 0.5, days * ppdValue);
  }, [ppdValue]);

  const previewStyle = useCallback((planId: string, itemId: string, kind: 'phase' | 'task', start: string, end: string) => {
    if (!barDrag || barDrag.target.planId !== planId) {
      return { left: `${getLeft(start)}px`, width: `${getWidth(start, end)}px` };
    }
    
    const isHit = (kind === 'phase' && barDrag.target.kind === 'phase' && (barDrag.target as any).phaseId === itemId) ||
      (kind === 'task' && barDrag.target.kind === 'task' && (barDrag.target as any).taskId === itemId);
    
    if (!isHit) return { left: `${getLeft(start)}px`, width: `${getWidth(start, end)}px` };
    
    const d = dragDeltaDays;
    let ns = start, ne = end;
    if (barDrag.mode === 'MOVE') { ns = addDaysToStr(barDrag.origStart, d); ne = addDaysToStr(barDrag.origEnd, d); }
    else if (barDrag.mode === 'RESIZE_LEFT') { const dur = Math.max(1, diffDays(barDrag.origStart, barDrag.origEnd) - d); ns = addDaysToStr(barDrag.origEnd, -dur); }
    else { ne = addDaysToStr(barDrag.origStart, Math.max(1, diffDays(barDrag.origStart, barDrag.origEnd) + d)); }
    return { left: `${getLeft(ns)}px`, width: `${getWidth(ns, ne)}px` };
  }, [barDrag, dragDeltaDays, getLeft, getWidth]);

  // ── Status helpers ────────────────────────────────────────────────────────
  const statusCode = (s: any) => typeof s === 'string' ? s : (s?.code ?? '');
  const statusLabel = (s: any) => {
    switch (statusCode(s)) {
      case 'COMPLETED': return 'HOÀN THÀNH';
      case 'IN_PROGRESS': case 'ACTIVE': return 'ĐANG TIÊN HÀNH';
      case 'OVERDUE': return 'QUÁ HẠN';
      case 'ASSIGNED': return 'PHÂN CÔNG';
      default: return 'CẦN LÀM';
    }
  };
  const statusBadgeCls = (s: any) => {
    const l = statusLabel(s);
    if (l === 'HOÀN THÀNH') return 'bg-emerald-100 text-emerald-700';
    if (l === 'ĐANG TIÊN HÀNH') return 'bg-blue-100 text-blue-700';
    if (l === 'QUÁ HẠN') return 'bg-rose-100 text-rose-700';
    if (l === 'PHÂN CÔNG') return 'bg-violet-100 text-violet-700';
    return 'bg-slate-100 text-slate-500';
  };
  const taskBarCls = (s: any) => {
    const l = statusLabel(s);
    if (l === 'HOÀN THÀNH') return 'bg-emerald-500';
    if (l === 'ĐANG TIÊN HÀNH') return 'bg-blue-500';
    if (l === 'QUÁ HẠN') return 'bg-rose-500';
    if (l === 'PHÂN CÔNG') return 'bg-violet-500';
    return 'bg-slate-400';
  };

  // ── Row list ──────────────────────────────────────────────────────────────
  interface Row {
    type: 'plan' | 'phase' | 'task';
    id: string;
    planId: string;
    phaseId?: string;
    depth: number;
    item: any;
  }

  const rows = useMemo((): Row[] => {
    const list: Row[] = [];
    const multi = plans.length > 1;
    plans.forEach(plan => {
      if (multi) list.push({ type: 'plan', id: plan.id, planId: plan.id, depth: 0, item: plan });
      if (!multi || expandedPlans.has(plan.id)) {
        plan.phases.forEach(phase => {
          list.push({ type: 'phase', id: phase.id, planId: plan.id, depth: multi ? 1 : 0, item: phase });
          if (expandedPhases.has(phase.id)) {
            (phase.tasks ?? []).forEach(task => {
              list.push({ type: 'task', id: task.id, planId: plan.id, phaseId: phase.id, depth: multi ? 2 : 1, item: task });
            });
          }
        });
      }
    });
    return list;
  }, [plans, expandedPlans, expandedPhases]);

  // ── Dimensions ───────────────────────────────────────────────────────────
  const ROW_H = 40;
  const SPRINT_H = 28;
  const HEADER_TOP_H = 28; // month / quarter row
  const HEADER_SUB_H = 28; // day / week / month row
  const HEADER_H = HEADER_TOP_H + HEADER_SUB_H;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        'flex-1 flex flex-col h-full min-h-0 relative border border-slate-200 rounded-none shadow-sm overflow-hidden bg-white',
        barDrag ? 'select-none' : '',
      )}
    >
      {/* ════════ Sprint row ════════ */}
      <div className="flex flex-shrink-0 border-b border-slate-200 bg-slate-50/50" style={{ height: SPRINT_H }}>
        <div
          className="flex-shrink-0 border-r border-slate-200 flex items-center px-3"
          style={{ width: sidebarWidth }}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sprints</span>
        </div>
        <div style={{ width: 4, flexShrink: 0 }} />
        <div ref={sprintRef} className="flex-1 overflow-hidden relative" style={{ scrollbarWidth: 'none' }}>
          <div style={{ width: totalWidth, height: SPRINT_H, position: 'relative' }}>
            {sprintBars.map((sp, i) => (
              <div
                key={i}
                className="absolute flex items-center overflow-hidden"
                style={{
                  left: sp.left,
                  width: Math.max(sp.width, 24),
                  top: 4,
                  height: 20,
                  background: 'rgba(99,102,241,0.08)',
                  borderLeft: '2px solid rgba(99,102,241,0.45)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  borderRadius: 3,
                  whiteSpace: 'nowrap',
                }}
              >
                <span className="truncate px-2 text-[10px] font-semibold text-indigo-500">{sp.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════ HEADER ════════ */}
      <div className="flex flex-shrink-0 border-b-2 border-slate-300 bg-white" style={{ height: HEADER_H }}>
        {/* Sidebar label */}
        <div
          className="flex-shrink-0 border-r border-slate-200 flex flex-col justify-end pb-1 px-3"
          style={{ width: sidebarWidth }}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Work</span>
        </div>
        <div style={{ width: 4, flexShrink: 0 }} />

        {/* Scrollable header */}
        <div ref={headerRef} className="flex-1 overflow-hidden relative" style={{ scrollbarWidth: 'none' }}>
          <div style={{ width: totalWidth, height: HEADER_H, position: 'relative' }}>

            {timeScale === 'weeks' ? (
              <>
                {/* ── Top portion: month name spans ── */}
                {monthSpans.map((ms, i) => (
                  <div
                    key={i}
                    className="absolute flex items-center border-r border-slate-200"
                    style={{ left: ms.leftPx, width: ms.widthPx, top: 0, height: HEADER_TOP_H, paddingLeft: 10 }}
                  >
                    <span className="text-[11px] font-semibold text-slate-700 whitespace-nowrap">{ms.label}</span>
                  </div>
                ))}

                {/* ── Bottom portion: individual day cells ── */}
                {dayCells.map((cell, i) => (
                  <div
                    key={i}
                    className={cn(
                      'absolute flex items-center justify-center border-r',
                      cell.isWeekend ? 'bg-slate-50/80 border-slate-100' : 'border-slate-100',
                    )}
                    style={{ left: cell.leftPx, width: PPD, top: HEADER_TOP_H, height: HEADER_SUB_H }}
                  >
                    {cell.isToday ? (
                      <div className="w-[22px] h-[22px] rounded-full bg-indigo-600 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white leading-none">{cell.dayLabel}</span>
                      </div>
                    ) : (
                      <span className={cn(
                        'text-[11px] font-medium leading-none',
                        cell.isWeekend ? 'text-slate-400' : 'text-slate-600',
                      )}>
                        {cell.dayLabel}
                      </span>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <>
                {/* ── Top row: months or quarters ── */}
                {(() => {
                  let x = 0;
                  return topCells.map((col, i) => {
                    const left = x; x += col.widthPx;
                    return (
                      <div
                        key={i}
                        className="absolute flex items-center border-r border-b border-slate-200 px-3"
                        style={{ left, width: col.widthPx, top: 0, height: HEADER_TOP_H }}
                      >
                        <span className="text-[11px] font-semibold text-slate-700 whitespace-nowrap truncate">{col.label}</span>
                      </div>
                    );
                  });
                })()}

                {/* ── Bottom row: weeks or months ── */}
                {(() => {
                  let x = 0;
                  return subCells.map((col, i) => {
                    const left = x; x += col.widthPx;
                    return (
                      <div
                        key={i}
                        className={cn(
                          'absolute flex items-center justify-center border-r border-slate-100 text-[11px]',
                          col.isHighlight ? 'text-indigo-600 font-bold' : 'text-slate-500 font-medium',
                        )}
                        style={{ left, width: col.widthPx, top: HEADER_TOP_H, height: HEADER_SUB_H }}
                      >
                        {col.label}
                      </div>
                    );
                  });
                })()}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ════════ Body ════════ */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Sidebar ── */}
        <div
          ref={sidebarBodyRef}
          className="flex-shrink-0 overflow-y-auto z-20 bg-white flex flex-col"
          style={{ width: sidebarWidth, scrollbarWidth: 'none' }}
        >
          {rows.map(r => {
            const isSelected = selectedId === r.id;
            const pl = 10 + r.depth * 20;

            if (r.type === 'plan') {
              const expanded = expandedPlans.has(r.id);
              return (
                <div
                  key={r.id}
                  style={{ height: ROW_H, paddingLeft: pl }}
                  className={cn(
                    'flex items-center pr-2 border-b border-slate-100 hover:bg-slate-50 cursor-pointer group transition-colors flex-shrink-0',
                    isSelected && 'bg-indigo-50 border-l-[3px] border-l-indigo-500',
                  )}
                  onClick={() => onSelect({ type: 'PLAN', id: r.id, planId: r.id })}
                >
                  <button className="p-0.5 mr-1.5 text-slate-400 hover:text-indigo-600 flex-shrink-0" onClick={e => togglePlan(r.id, e)}>
                    {expanded ? <ChevronDown size={14} strokeWidth={2.5} /> : <ChevronRight size={14} strokeWidth={2.5} />}
                  </button>
                  <div className="w-4 h-4 rounded flex items-center justify-center mr-2 flex-shrink-0 bg-indigo-500">
                    <svg width="9" height="9" viewBox="0 0 10 10"><path d="M5 1l1.5 3h3l-2.5 2 1 3L5 7.5 2 9l1-3L.5 4h3z" fill="white" /></svg>
                  </div>
                  <span className="truncate text-[12px] font-semibold text-slate-700 flex-1 min-w-0">{r.item.name}</span>
                  {canEdit && onDeletePlan && (
                    <button
                      className="opacity-0 group-hover:opacity-100 ml-1 p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all flex-shrink-0"
                      onClick={e => { e.stopPropagation(); onDeletePlan(r.id); }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              );
            }

            if (r.type === 'phase') {
              const expanded = expandedPhases.has(r.id);
              return (
                <div
                  key={r.id}
                  style={{ height: ROW_H, paddingLeft: pl }}
                  className={cn(
                    'flex items-center pr-2 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors flex-shrink-0',
                    isSelected && 'bg-indigo-50 border-l-[3px] border-l-indigo-500',
                  )}
                  onClick={() => onSelect({ type: 'PHASE', id: r.id, planId: r.planId })}
                >
                  <button className="p-0.5 mr-1.5 text-slate-300 hover:text-indigo-500 flex-shrink-0" onClick={e => togglePhase(r.id, r.planId, e)}>
                    {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  </button>
                  <div className="w-3.5 h-3.5 rounded-sm bg-indigo-500 flex items-center justify-center mr-2 flex-shrink-0">
                    <svg width="8" height="8" viewBox="0 0 8 8">
                      <path d="M4 1L7 4L4 7M1 4h6" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="truncate text-[12px] font-medium text-slate-700 flex-1 min-w-0">{r.item.name}</span>
                </div>
              );
            }

            // task
            const sc = statusCode(r.item.status);
            return (
              <div
                key={r.id}
                style={{ height: ROW_H, paddingLeft: pl }}
                className={cn(
                  'flex items-center pr-2 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors flex-shrink-0',
                  isSelected && 'bg-indigo-50/60 border-l-[3px] border-l-indigo-300',
                )}
                onClick={() => onSelect({ type: 'TASK', id: r.id, planId: r.planId, phaseId: r.phaseId })}
              >
                <div className={cn('w-3 h-3 rounded-sm border mr-2 flex items-center justify-center flex-shrink-0', sc === 'HOÀN THÀNH' ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300')}>
                  {sc === 'HOÀN THÀNH' && (
                    <svg width="7" height="7" viewBox="0 0 8 8">
                      <path d="M1 4l2 2 4-3" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mr-1.5 flex-shrink-0 font-mono">{(r.item as any).code ?? ''}</span>
                <span className="truncate text-[12px] text-slate-600 flex-1 min-w-0">{r.item.name}</span>
                <span className={cn('ml-1 flex-shrink-0 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide', statusBadgeCls(r.item.status))}>
                  {statusLabel(r.item.status)}
                </span>
              </div>
            );
          })}

          {plans.map(plan =>
            (plans.length === 1 || expandedPlans.has(plan.id)) && canEdit ? (
              <button
                key={`add-${plan.id}`}
                style={{ height: ROW_H, paddingLeft: plans.length > 1 ? 50 : 14 }}
                className="flex items-center pr-4 text-[11px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors border-b border-slate-50 flex-shrink-0"
                onClick={() => onAddPhase(plan.id)}
              >
                <Plus size={12} className="mr-1.5" />
                Thêm giai đoạn
              </button>
            ) : null
          )}
        </div>

        {/* ── Resize handle ── */}
        <div
          className="flex-shrink-0 relative z-30 group"
          style={{ width: 4, cursor: 'col-resize' }}
          onMouseDown={startSidebarResize}
        >
          <div className="absolute inset-y-0 left-0 w-px bg-slate-200 group-hover:bg-indigo-400 group-active:bg-indigo-500 transition-colors" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <GripVertical size={14} className="text-indigo-400" />
          </div>
        </div>

        {/* ── Gantt canvas ── */}
        <div
          ref={ganttBodyRef}
          className="flex-1 overflow-auto relative"
          style={{ scrollbarWidth: 'none' }}
          onScroll={onBodyScroll}
        >
          <div style={{ width: totalWidth, height: '100%', minHeight: Math.max(rows.length * ROW_H + ROW_H, 300), position: 'relative' }}>

            {/* Weekend shading */}
            {timeScale === 'weeks' && dayCells
              .filter(c => c.isWeekend && c.date.getDay() === 6)
              .map((c, i) => (
                <div key={i} className="absolute top-0 bottom-0 pointer-events-none"
                  style={{ left: c.leftPx, width: PPD * 2, background: 'rgba(241,245,249,0.7)' }} />
              ))}

            {/* Today column tint */}
            {timeScale === 'weeks' && todayLeft !== null && (
              <div className="absolute top-0 bottom-0 pointer-events-none"
                style={{ left: todayLeft, width: PPD, background: 'rgba(99,102,241,0.04)' }} />
            )}

            {/* Vertical grid lines — days */}
            {timeScale === 'weeks' && dayCells.map((cell, i) => (
              <div key={i} className="absolute top-0 bottom-0 pointer-events-none"
                style={{ left: cell.leftPx, width: 1, background: cell.isFirstOfMonth ? 'rgba(203,213,225,0.9)' : 'rgba(226,232,240,0.5)' }} />
            ))}

            {/* Vertical grid lines — weeks/months */}
            {timeScale !== 'weeks' && (() => {
              // top-level boundaries (stronger)
              const topLines: number[] = [];
              let x = 0;
              topCells.forEach(c => { topLines.push(x); x += c.widthPx; });
              // sub boundaries (lighter)
              const subLines: number[] = [];
              let sx = 0;
              subCells.forEach(c => { subLines.push(sx); sx += c.widthPx; });
              return (
                <>
                  {subLines.map((lx, i) => (
                    <div key={`s${i}`} className="absolute top-0 bottom-0 pointer-events-none"
                      style={{ left: lx, width: 1, background: 'rgba(226,232,240,0.5)' }} />
                  ))}
                  {topLines.map((lx, i) => (
                    <div key={`t${i}`} className="absolute top-0 bottom-0 pointer-events-none"
                      style={{ left: lx, width: 1, background: 'rgba(203,213,225,0.9)' }} />
                  ))}
                </>
              );
            })()}

            {/* Today line */}
            {todayLeft !== null && (
              <div className="absolute top-0 bottom-0 z-20 pointer-events-none"
                style={{ left: todayLeft + (timeScale === 'weeks' ? PPD / 2 : 0), width: 1.5, background: '#6366f1' }}
              >
                <div style={{ position: 'absolute', top: -1, left: -4, width: 9, height: 9, borderRadius: '50%', background: '#6366f1', border: '2px solid white' }} />
              </div>
            )}

            {/* Rows */}
            {rows.map((r, i) => {
              const top = i * ROW_H;
              const isSelected = selectedId === r.id;

              if (r.type === 'plan') {
                return <div key={r.id} style={{ position: 'absolute', top, left: 0, right: 0, height: ROW_H }} className="border-b border-slate-100" />;
              }

              if (r.type === 'phase') {
                const ph = r.item as Phase;
                const ps = previewStyle(r.planId, ph.id, 'phase', ph.startDate, ph.endDate);
                const isDragging = barDrag?.target.kind === 'phase' && (barDrag.target as any).phaseId === ph.id;
                return (
                  <div key={r.id} style={{ position: 'absolute', top, left: 0, right: 0, height: ROW_H }}
                    className={cn('border-b border-slate-100 cursor-pointer', isSelected ? 'bg-indigo-50/20' : 'hover:bg-slate-50/40')}
                    onClick={() => onSelect({ type: 'PHASE', id: ph.id, planId: r.planId })}
                  >
                    <div
                      className={cn(
                        'absolute flex items-center overflow-hidden rounded-md z-10',
                        isSelected ? 'bg-indigo-600' : 'bg-indigo-500 hover:bg-indigo-600',
                        isDragging ? 'opacity-90 ring-2 ring-indigo-300' : '',
                        canEdit ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
                      )}
                      style={{ 
                        ...ps, 
                        top: '50%', 
                        height: 24, 
                        willChange: 'left, width',
                        transition: isDragging ? 'none' : 'left .15s ease-out, width .15s ease-out',
                      }}
                      onMouseDown={canEdit ? e => startBarDrag(e, { kind: 'phase', planId: r.planId, phaseId: ph.id }, 'MOVE', ph.startDate, ph.endDate) : undefined}
                      onClick={e => { e.stopPropagation(); onSelect({ type: 'PHASE', id: ph.id, planId: r.planId }); }}
                    >
                      {canEdit && (
                        <div className="absolute left-0 top-0 bottom-0 w-2 cursor-w-resize z-20 flex items-center justify-center hover:bg-white/10"
                          onMouseDown={e => { e.stopPropagation(); startBarDrag(e, { kind: 'phase', planId: r.planId, phaseId: ph.id }, 'RESIZE_LEFT', ph.startDate, ph.endDate); }}>
                          <span className="w-px h-3 bg-white/60 rounded-full" />
                        </div>
                      )}
                      <span className="text-[11px] font-semibold text-white px-3 truncate pointer-events-none">{ph.name}</span>
                      {canEdit && (
                        <div className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize z-20 flex items-center justify-center hover:bg-white/10"
                          onMouseDown={e => { e.stopPropagation(); startBarDrag(e, { kind: 'phase', planId: r.planId, phaseId: ph.id }, 'RESIZE_RIGHT', ph.startDate, ph.endDate); }}>
                          <span className="w-px h-3 bg-white/60 rounded-full" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // task
              const tk = r.item as Task;
              const ps = previewStyle(r.planId, tk.id, 'task', tk.startDate, tk.endDate);
              const isDragging = barDrag?.target.kind === 'task' && (barDrag.target as any).taskId === tk.id;
              const sc = statusCode(tk.status);
              return (
                <div key={r.id} style={{ position: 'absolute', top, left: 0, right: 0, height: ROW_H }}
                  className={cn('border-b border-slate-50 cursor-pointer', isSelected ? 'bg-indigo-50/15' : 'hover:bg-slate-50/30')}
                  onClick={() => onSelect({ type: 'TASK', id: tk.id, planId: r.planId, phaseId: r.phaseId })}
                >
                  <div
                    className={cn('absolute rounded overflow-hidden z-10', taskBarCls(tk.status), isDragging ? 'opacity-90 ring-2 ring-indigo-300' : '', canEdit ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer')}
                    style={{ 
                      ...ps, 
                      top: '50%', 
                      height: 14, 
                      minWidth: 20, 
                      willChange: 'left, width',
                      transition: isDragging ? 'none' : 'left .15s ease-out, width .15s ease-out',
                    }}
                    onMouseDown={canEdit ? e => startBarDrag(e, { kind: 'task', planId: r.planId, phaseId: r.phaseId!, taskId: tk.id }, 'MOVE', tk.startDate, tk.endDate) : undefined}
                    onClick={e => { e.stopPropagation(); onSelect({ type: 'TASK', id: tk.id, planId: r.planId, phaseId: r.phaseId }); }}
                  >
                    <div className="absolute inset-0 bg-black/20 pointer-events-none"
                      style={{ width: sc === 'HOÀN THÀNH' ? '100%' : sc === 'ĐANG TIÊN HÀNH' ? '45%' : '0%' }} />
                    {canEdit && (
                      <>
                        <div className="absolute left-0 top-0 bottom-0 w-2 cursor-w-resize z-10"
                          onMouseDown={e => { e.stopPropagation(); startBarDrag(e, { kind: 'task', planId: r.planId, phaseId: r.phaseId!, taskId: tk.id }, 'RESIZE_LEFT', tk.startDate, tk.endDate); }} />
                        <div className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize z-10"
                          onMouseDown={e => { e.stopPropagation(); startBarDrag(e, { kind: 'task', planId: r.planId, phaseId: r.phaseId!, taskId: tk.id }, 'RESIZE_RIGHT', tk.startDate, tk.endDate); }} />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ════════ Bottom scrollbar ════════ */}
      <div className="flex bg-white border-t border-slate-200 flex-shrink-0 items-center" style={{ height: 16 }}>
        <div className="flex-shrink-0 border-r border-slate-200" style={{ width: sidebarWidth + 4 }} />
        <div ref={scrollBarRef} className="flex-1 overflow-x-auto overflow-y-hidden" style={{ height: '100%', scrollbarWidth: 'thin' }} onScroll={onBarScroll}>
          <div style={{ width: totalWidth, height: 1 }} />
        </div>
        <button className="px-2 h-full border-l border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 text-base flex-shrink-0 transition-colors"
          onClick={() => { if (ganttBodyRef.current) { ganttBodyRef.current.scrollLeft -= 150; syncRefs(ganttBodyRef.current.scrollLeft); } }}>‹</button>
        <button className="px-2 h-full border-l border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 text-base flex-shrink-0 transition-colors"
          onClick={() => { if (ganttBodyRef.current) { ganttBodyRef.current.scrollLeft += 150; syncRefs(ganttBodyRef.current.scrollLeft); } }}>›</button>
      </div>

      {/* ════════ Toolbar ════════ */}
      <div className="absolute bottom-5 right-5 z-30 flex items-center gap-2">
        <button onClick={scrollToToday} className="h-8 px-3 text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:border-slate-500 transition-all">
          Hôm nay
        </button>
        <div className="flex bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          {(['weeks', 'months', 'quarters'] as const).map((s, idx) => (
            <button key={s} onClick={() => setTimeScale(s)}
              className={cn('h-8 px-3 text-[10px] font-bold uppercase tracking-wider transition-all', idx > 0 && 'border-l border-slate-200', timeScale === s ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50')}>
              {s === 'weeks' ? 'Tuần' : s === 'months' ? 'Tháng' : 'Quý'}
            </button>
          ))}
        </div>
      </div>

      {/* Drag tooltip */}
      {dragTooltip && (
        <div className="fixed z-50 pointer-events-none" style={{ left: dragTooltip.x + 14, top: dragTooltip.y }}>
          <div className="bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
            {dragTooltip.label}
          </div>
        </div>
      )}
    </div>
  );
}

export default PlanTimeline;