import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SeasonPlan } from '../types/seasonPlan';

interface SeasonPlanState {
  plans: SeasonPlan[];
  loading: boolean;
  error: string | null;
}

const initialState: SeasonPlanState = {
  plans: [
    {
      id: 'plan-rice-2024',
      farmId: '',
      name: 'Vụ lúa Đông Xuân 2024',
      plotId: 'plot-1',
      cropId: 'crop-rice',
      startDate: '2024-04-01',
      endDate: '2024-06-30',
      status: 'IN_PROGRESS',
      phases: [
        {
          id: 'phase-prep',
          name: 'Chuẩn bị đất',
          startDate: '2024-04-01',
          endDate: '2024-04-10',
          duration: 10,
          status: 'COMPLETED',
          color: 'bg-violet-500',
          tasks: [
            { id: 'task-1', name: 'Cày bừa, làm cỏ', startDate: '2024-04-01', endDate: '2024-04-05', duration: 5, status: 'COMPLETED' },
            { id: 'task-2', name: 'Bón lót phân chuồng', startDate: '2024-04-06', endDate: '2024-04-10', duration: 5, status: 'COMPLETED' }
          ]
        },
        {
          id: 'phase-sow',
          name: 'Gieo sạ',
          startDate: '2024-04-11',
          endDate: '2024-04-15',
          duration: 5,
          status: 'IN_PROGRESS',
          color: 'bg-emerald-500',
          tasks: [
            { id: 'task-3', name: 'Ngâm ủ hạt giống', startDate: '2024-04-11', endDate: '2024-04-12', duration: 2, status: 'COMPLETED' },
            { id: 'task-4', name: 'Gieo sạ trực tiếp', startDate: '2024-04-13', endDate: '2024-04-15', duration: 3, status: 'IN_PROGRESS' }
          ]
        },
        {
          id: 'phase-care',
          name: 'Chăm sóc & Bón phân',
          startDate: '2024-04-16',
          endDate: '2024-06-15',
          duration: 60,
          status: 'DRAFT',
          color: 'bg-blue-500',
          tasks: [
            { id: 'task-5', name: 'Bón phân đợt 1', startDate: '2024-04-20', endDate: '2024-04-22', duration: 2, status: 'DRAFT' },
            { id: 'task-6', name: 'Làm cỏ đợt 1', startDate: '2024-04-25', endDate: '2024-04-30', duration: 5, status: 'DRAFT' }
          ]
        }
      ]
    },
    {
      id: 'plan-corn-2024',
      farmId: '',
      name: 'Vụ Ngô Hè Thu 2024',
      plotId: 'plot-2',
      cropId: 'crop-corn',
      startDate: '2024-05-01',
      endDate: '2024-08-30',
      status: 'DRAFT',
      phases: [
        {
          id: 'phase-corn-prep',
          name: 'Làm đất & Bón lót',
          startDate: '2024-05-01',
          endDate: '2024-05-15',
          duration: 15,
          status: 'DRAFT',
          color: 'bg-violet-500',
          tasks: [
            { id: 'task-c1', name: 'Cày sâu phơi ải', startDate: '2024-05-01', endDate: '2024-05-07', duration: 7, status: 'DRAFT' },
            { id: 'task-c2', name: 'Bón vôi khử chua', startDate: '2024-05-08', endDate: '2024-05-15', duration: 8, status: 'DRAFT' }
          ]
        },
        {
          id: 'phase-corn-sow',
          name: 'Gieo hạt',
          startDate: '2024-05-16',
          endDate: '2024-05-20',
          duration: 5,
          status: 'DRAFT',
          color: 'bg-emerald-500',
          tasks: [
            { id: 'task-c3', name: 'Xử lý thuốc hạt giống', startDate: '2024-05-16', endDate: '2024-05-17', duration: 2, status: 'DRAFT' },
            { id: 'task-c4', name: 'Gieo hạt cơ giới', startDate: '2024-05-18', endDate: '2024-05-20', duration: 3, status: 'DRAFT' }
          ]
        }
      ]
    },
    {
      id: 'plan-durian-2024',
      farmId: '',
      name: 'Vụ Sầu Riêng nghịch vụ 2024',
      plotId: 'plot-3',
      cropId: 'crop-durian',
      startDate: '2024-06-01',
      endDate: '2024-12-30',
      status: 'IN_PROGRESS',
      phases: [
        {
          id: 'phase-dr-flower',
          name: 'Xử lý ra hoa',
          startDate: '2024-06-01',
          endDate: '2024-07-15',
          duration: 45,
          status: 'COMPLETED',
          color: 'bg-violet-500',
          tasks: [
            { id: 'task-d1', name: 'Tạo mầm hoa đợt 1', startDate: '2024-06-01', endDate: '2024-06-10', duration: 10, status: 'COMPLETED' },
            { id: 'task-d2', name: 'Xiết nước tạo khô hạn', startDate: '2024-06-11', endDate: '2024-07-15', duration: 35, status: 'COMPLETED' }
          ]
        },
        {
          id: 'phase-dr-fruit',
          name: 'Nuôi trái & Chăm sóc',
          startDate: '2024-07-16',
          endDate: '2024-11-30',
          duration: 135,
          status: 'IN_PROGRESS',
          color: 'bg-orange-500',
          tasks: [
            { id: 'task-d3', name: 'Tuyển trái đợt 1', startDate: '2024-07-20', endDate: '2024-07-25', duration: 5, status: 'COMPLETED' },
            { id: 'task-d4', name: 'Bón phân hữu cơ nở trái', startDate: '2024-08-01', endDate: '2024-11-30', duration: 121, status: 'IN_PROGRESS' }
          ]
        }
      ]
    }
  ],
  loading: false,
  error: null,
};

const seasonPlanSlice = createSlice({
  name: 'seasonPlan',
  initialState,
  reducers: {
    setPlans: (state, action: PayloadAction<SeasonPlan[]>) => {
      state.plans = action.payload;
    },
    addPlan: (state, action: PayloadAction<SeasonPlan>) => {
      state.plans.push(action.payload);
    },
    updatePlan: (state, action: PayloadAction<SeasonPlan>) => {
      const index = state.plans.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.plans[index] = action.payload;
      }
    },
    deletePlan: (state, action: PayloadAction<string>) => {
      state.plans = state.plans.filter(p => p.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addPhase: (state, action: PayloadAction<{ planId: string; phase: Phase }>) => {
      const plan = state.plans.find(p => p.id === action.payload.planId);
      if (plan) {
        plan.phases.push(action.payload.phase);
        // Cập nhật endDate của kế hoạch nếu giai đoạn mới vượt quá
        if (new Date(action.payload.phase.endDate) > new Date(plan.endDate)) {
          plan.endDate = action.payload.phase.endDate;
        }
      }
    },
    updatePhase: (state, action: PayloadAction<{ planId: string; phase: Phase }>) => {
      const plan = state.plans.find(p => p.id === action.payload.planId);
      if (plan) {
        const index = plan.phases.findIndex(ph => ph.id === action.payload.phase.id);
        if (index !== -1) {
          plan.phases[index] = action.payload.phase;
        }
      }
    },
    addTask: (state, action: PayloadAction<{ planId: string; phaseId: string; task: any }>) => {
      const plan = state.plans.find(p => p.id === action.payload.planId);
      if (plan) {
        const phase = plan.phases.find(ph => ph.id === action.payload.phaseId);
        if (phase) {
          if (!phase.tasks) phase.tasks = [];
          phase.tasks.push(action.payload.task);
        }
      }
    },
    updateTask: (state, action: PayloadAction<{ planId: string; phaseId: string; task: any }>) => {
      const plan = state.plans.find(p => p.id === action.payload.planId);
      if (plan) {
        const phase = plan.phases.find(ph => ph.id === action.payload.phaseId);
        if (phase) {
          const taskIndex = phase.tasks.findIndex(t => t.id === action.payload.task.id);
          if (taskIndex !== -1) {
            phase.tasks[taskIndex] = action.payload.task;
          }
        }
      }
    }
  }
});

export const { 
  setPlans, 
  addPlan, 
  updatePlan, 
  deletePlan, 
  setLoading, 
  setError,
  addPhase,
  updatePhase,
  addTask,
  updateTask
} = seasonPlanSlice.actions;
export default seasonPlanSlice.reducer;
