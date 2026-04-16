import { Phase, SeasonPlan } from '../types/seasonPlan';
import { Crop } from '../types/crop';

/**
 * Thêm số ngày vào một chuỗi ngày (YYYY-MM-DD)
 */
export const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

/**
 * Tự động sinh các giai đoạn dựa trên cấu hình cây trồng và ngày bắt đầu
 */
export const generatePhasesFromCrop = (crop: Crop, startDate: string): Phase[] => {
  if (!crop.stages || crop.stages.length === 0) {
    // Nếu không có giai đoạn, sinh 1 giai đoạn mặc định
    return [{
      id: `phase-default-${Date.now()}`,
      name: 'Chăm sóc',
      startDate: startDate,
      endDate: addDays(startDate, 30),
      duration: 30,
      status: 'DRAFT',
      color: 'bg-green-500',
      tasks: []
    }];
  }

  const phaseColors = [
    'bg-amber-600',
    'bg-emerald-500',
    'bg-green-600',
    'bg-yellow-500',
    'bg-blue-600',
    'bg-indigo-600',
  ];

  let currentDate = startDate;
  return crop.stages.map((stage, index) => {
    const duration = stage.durationDays || 1;
    const endDate = addDays(currentDate, duration);
    const phase: Phase = {
      id: `phase-${index}-${Date.now()}`,
      name: stage.name,
      startDate: currentDate,
      endDate: endDate,
      duration: duration,
      status: 'DRAFT',
      color: phaseColors[index % phaseColors.length],
      description: stage.description,
      tasks: []
    };
    currentDate = endDate;
    return phase;
  });
};

/**
 * Kiểm tra xem hai khoảng thời gian có bị chồng lấn không
 */
export const isOverlapping = (start1: string, end1: string, start2: string, end2: string): boolean => {
  return (start1 >= start2 && start1 < end2) ||
         (end1 > start2 && end1 <= end2) ||
         (start1 <= start2 && end1 >= end2);
};

/**
 * Kiểm tra lỗi chồng lấn cho một lô đất
 */
export const hasPlanOverlap = (
  plotId: string, 
  startDate: string, 
  endDate: string, 
  existingPlans: SeasonPlan[],
  excludePlanId?: string
): boolean => {
  return existingPlans.some(p => 
    p.plotId === plotId && 
    p.id !== excludePlanId &&
    p.status !== 'CANCELLED' && 
    isOverlapping(startDate, endDate, p.startDate, p.endDate)
  );
};
/**
 * Đồng bộ toàn bộ các giai đoạn phía sau khi một giai đoạn thay đổi
 */
export const rippleUpdatePhases = (phases: Phase[], changedIndex: number, newDuration?: number): Phase[] => {
  const newPhases = [...phases];
  
  const updateTasks = (phase: Phase, oldStart: string): Phase => {
    if (!phase.tasks || phase.tasks.length === 0) return phase;
    
    const oldStartDate = new Date(oldStart).getTime();
    const newStartDate = new Date(phase.startDate).getTime();
    const offset = newStartDate - oldStartDate;
    
    return {
      ...phase,
      tasks: phase.tasks.map(task => ({
        ...task,
        startDate: addDays(task.startDate, Math.round(offset / (1000 * 60 * 60 * 24))),
        endDate: addDays(task.endDate, Math.round(offset / (1000 * 60 * 60 * 24)))
      }))
    };
  };

  if (newDuration !== undefined) {
    const oldStart = newPhases[changedIndex].startDate;
    newPhases[changedIndex] = {
      ...newPhases[changedIndex],
      duration: newDuration,
      endDate: addDays(oldStart, newDuration)
    };
    // Duration change only affects current phase's end date, no task shift needed for THIS phase
    // but the sub-phases will shift
  }

  // Cập nhật tất cả các giai đoạn phía sau
  for (let i = changedIndex + 1; i < newPhases.length; i++) {
    const oldStart = newPhases[i].startDate;
    const prevPhase = newPhases[i - 1];
    const duration = newPhases[i].duration;
    
    newPhases[i] = {
      ...newPhases[i],
      startDate: prevPhase.endDate,
      endDate: addDays(prevPhase.endDate, duration)
    };
    
    // Shift tasks
    newPhases[i] = updateTasks(newPhases[i], oldStart);
  }

  return newPhases;
};

/**
 * Nhân bản kế hoạch với ngày bắt đầu mới
 */
export const clonePlanLogic = (plan: SeasonPlan, newName: string, newStartDate: string): SeasonPlan => {
  const newPhases: Phase[] = [];
  let currentDate = newStartDate;

  plan.phases.forEach((phase, index) => {
    const duration = phase.duration;
    const endDate = addDays(currentDate, duration);
    newPhases.push({
      ...phase,
      id: `phase-${index}-${Date.now()}`,
      startDate: currentDate,
      endDate: endDate,
      status: 'DRAFT' // Mặc định là bản nháp khi nhân bản
    });
    currentDate = endDate;
  });

  return {
    ...plan,
    id: `plan-clone-${Date.now()}`,
    name: newName,
    startDate: newStartDate,
    endDate: currentDate,
    status: 'DRAFT',
    phases: newPhases
  };
};
