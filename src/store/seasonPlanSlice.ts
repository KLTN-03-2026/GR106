import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { SeasonPlan, Phase, CreateSeasonPlanRequest } from '../types/seasonPlan';
import { seasonPlanService } from '../services/seasonPlanService';
import { RootState } from '../store';

interface SeasonPlanState {
  plans: SeasonPlan[];
  loading: boolean;
  error: any;
}

const initialState: SeasonPlanState = {
  plans: [],
  loading: false,
  error: null,
};

// Async Thunk to fetch all plans
export const fetchPlans = createAsyncThunk(
  'seasonPlan/fetchPlans',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const currentFarmId = state.auth.currentFarmId;
      
      if (!currentFarmId) {
        console.warn('[SeasonPlan Slice] No farm selected, skipping fetchPlans');
        return rejectWithValue('Chưa chọn farm');
      }
      
      console.log('[SeasonPlan Slice] fetchPlans called, farmId:', currentFarmId);
      const plans = await seasonPlanService.getPlans();
      console.log('[SeasonPlan Slice] fetchPlans received:', plans);
      return plans;
    } catch (error: any) {
      console.error('[SeasonPlan Slice] fetchPlans error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async Thunk to create a new plan
export const createPlan = createAsyncThunk(
  'seasonPlan/createPlan',
  async (data: CreateSeasonPlanRequest, { rejectWithValue }) => {
    try {
      console.log('[SeasonPlan Slice] createPlan thunk called with data:', data);
      const newPlan = await seasonPlanService.createPlan(data);
      console.log('[SeasonPlan Slice] createPlan thunk received:', newPlan);
      return newPlan;
    } catch (error: any) {
      console.error('[SeasonPlan Slice] createPlan error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

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
        if (!plan.phases) plan.phases = [];
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
  },
  extraReducers: (builder) => {
    builder
      // fetchPlans
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('[SeasonPlan Slice] fetchPlans pending');
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false;
        console.log('[SeasonPlan Slice] fetchPlans fulfilled, payload length:', action.payload?.length);
        state.plans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.log('[SeasonPlan Slice] fetchPlans rejected, error:', action.payload);
      })
      // createPlan
      .addCase(createPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('[SeasonPlan Slice] createPlan pending');
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        state.loading = false;
        console.log('[SeasonPlan Slice] createPlan fulfilled, payload:', action.payload);
        state.plans.push(action.payload);
      })
      .addCase(createPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.log('[SeasonPlan Slice] createPlan rejected, error:', action.payload);
      });
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

