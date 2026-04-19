import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { SeasonPlan, Task, CreateSeasonPlanRequest } from '../types/seasonPlan';
import { seasonPlanService } from '../services/seasonplan/seasonPlanService';
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

// --- PLAN THUNKS ---

export const fetchPlans = createAsyncThunk(
  'seasonPlan/fetchPlans',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const currentFarmId = state.auth.currentFarmId;
      if (!currentFarmId) return rejectWithValue('Chưa chọn farm');
      return await seasonPlanService.getPlans();
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createPlan = createAsyncThunk(
  'seasonPlan/createPlan',
  async (data: CreateSeasonPlanRequest, { rejectWithValue }) => {
    try {
      return await seasonPlanService.createPlan(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updatePlan = createAsyncThunk(
  'seasonPlan/updatePlan',
  async ({ planId, data }: { planId: string; data: Partial<SeasonPlan> }, { rejectWithValue }) => {
    try {
      return await seasonPlanService.updatePlan(planId, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removePlan = createAsyncThunk(
  'seasonPlan/deletePlan',
  async (planId: string, { rejectWithValue }) => {
    try {
      await seasonPlanService.deletePlan(planId);
      return planId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// --- PLAN PLOT THUNKS ---

export const fetchPlanPlots = createAsyncThunk(
  'seasonPlan/fetchPlanPlots',
  async (planId: string, { rejectWithValue }) => {
    try {
      const plots = await seasonPlanService.getPlanPlots(planId);
      return { planId, plots };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addPlotsToPlan = createAsyncThunk(
  'seasonPlan/addPlotsToPlan',
  async ({ planId, plotIds }: { planId: string; plotIds: string[] }, { rejectWithValue }) => {
    try {
      const result = await seasonPlanService.addPlotsToPlan(planId, plotIds);
      return { planId, addedPlots: result.addedPlots };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


// --- STAGE THUNKS ---

export const fetchStages = createAsyncThunk(
  'seasonPlan/fetchStages',
  async (planId: string, { rejectWithValue }) => {
    try {
      return { planId, phases: await seasonPlanService.getStages(planId) };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createPhase = createAsyncThunk(
  'seasonPlan/createPhase',
  async ({ planId, data }: { planId: string; data: { name: string; startDate: string; endDate: string } }, { rejectWithValue }) => {
    try {
      return { planId, phase: await seasonPlanService.createStage(planId, data) };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removePhase = createAsyncThunk(
  'seasonPlan/removePhase',
  async ({ planId, stageId }: { planId: string; stageId: string }, { rejectWithValue }) => {
    try {
      await seasonPlanService.deleteStage(planId, stageId);
      return { planId, stageId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// --- TASK THUNKS ---

export const fetchTasks = createAsyncThunk(
  'seasonPlan/fetchTasks',
  async ({ planId, stageId }: { planId: string; stageId: string }, { rejectWithValue }) => {
    try {
      return { planId, stageId, tasks: await seasonPlanService.getTasks(planId, stageId) };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createSeasonTask = createAsyncThunk(
  'seasonPlan/createTask',
  async (
    { planId, stageId, data }: { planId: string; stageId: string; data: { name: string; description: string; startDate: string; endDate: string; plotId: string } },
    { rejectWithValue }
  ) => {
    try {
      return { planId, stageId, task: await seasonPlanService.createTask(planId, stageId, data) };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateSeasonTask = createAsyncThunk(
  'seasonPlan/updateTask',
  async (
    { planId, stageId, taskId, data }: { planId: string; stageId: string; taskId: string; data: Partial<Task> },
    { rejectWithValue }
  ) => {
    try {
      return { planId, stageId, task: await seasonPlanService.updateTask(planId, stageId, taskId, data) };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeSeasonTask = createAsyncThunk(
  'seasonPlan/removeTask',
  async ({ planId, stageId, taskId }: { planId: string; stageId: string; taskId: string }, { rejectWithValue }) => {
    try {
      await seasonPlanService.deleteTask(planId, stageId, taskId);
      return { planId, stageId, taskId };
    } catch (error: any) {
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
  },
  extraReducers: (builder) => {
    builder
      // Plans
      .addCase(fetchPlans.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPlans.fulfilled, (state, action) => { state.loading = false; state.plans = action.payload; })
      .addCase(fetchPlans.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createPlan.fulfilled, (state, action) => { state.plans.push(action.payload); })
      .addCase(updatePlan.fulfilled, (state, action) => {
        const index = state.plans.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          // Bảo vệ phases hiện tại không bị ghi đè bởi response (vốn thường không kèm phases)
          const existingPhases = state.plans[index].phases;
          state.plans[index] = { ...action.payload, phases: existingPhases };
        }
      })
      .addCase(removePlan.fulfilled, (state, action) => {
        state.plans = state.plans.filter(p => p.id !== action.payload);
      })

      // Plan Plots
      .addCase(fetchPlanPlots.fulfilled, (state, action) => {
        const plan = state.plans.find(p => p.id === action.payload.planId);
        if (plan) plan.plots = action.payload.plots;
      })
      .addCase(addPlotsToPlan.fulfilled, (state, action) => {
        const plan = state.plans.find(p => p.id === action.payload.planId);
        if (plan) {
          if (!plan.plots) plan.plots = [];
          // Add new plots if not already there
          action.payload.addedPlots.forEach(newP => {
            if (!plan.plots?.some(p => p.plotId === newP.plotId)) {
              plan.plots?.push(newP);
            }
          });
        }
      })


      // Stages
      .addCase(fetchStages.fulfilled, (state, action) => {
        const plan = state.plans.find(p => p.id === action.payload.planId);
        if (plan) plan.phases = action.payload.phases;
      })
      .addCase(createPhase.fulfilled, (state, action) => {
        const plan = state.plans.find(p => p.id === action.payload.planId);
        if (plan) {
          if (!plan.phases) plan.phases = [];
          plan.phases.push(action.payload.phase);
        }
      })
      .addCase(removePhase.fulfilled, (state, action) => {
        const plan = state.plans.find(p => p.id === action.payload.planId);
        if (plan) plan.phases = plan.phases.filter(ph => ph.id !== action.payload.stageId);
      })

      // Tasks
      .addCase(fetchTasks.fulfilled, (state, action) => {
        const plan = state.plans.find(p => p.id === action.payload.planId);
        if (plan) {
          const phase = plan.phases.find(ph => ph.id === action.payload.stageId);
          if (phase) phase.tasks = action.payload.tasks;
        }
      })
      .addCase(createSeasonTask.fulfilled, (state, action) => {
        const plan = state.plans.find(p => p.id === action.payload.planId);
        if (plan) {
          const phase = plan.phases.find(ph => ph.id === action.payload.stageId);
          if (phase) {
            if (!phase.tasks) phase.tasks = [];
            phase.tasks.push(action.payload.task);
          }
        }
      })
      .addCase(updateSeasonTask.fulfilled, (state, action) => {
        const plan = state.plans.find(p => p.id === action.payload.planId);
        if (plan) {
          const phase = plan.phases.find(ph => ph.id === action.payload.stageId);
          if (phase) {
            const index = phase.tasks.findIndex(t => t.id === action.payload.task.id);
            if (index !== -1) phase.tasks[index] = action.payload.task;
          }
        }
      })
      .addCase(removeSeasonTask.fulfilled, (state, action) => {
        const plan = state.plans.find(p => p.id === action.payload.planId);
        if (plan) {
          const phase = plan.phases.find(ph => ph.id === action.payload.stageId);
          if (phase) phase.tasks = phase.tasks.filter(t => t.id !== action.payload.taskId);
        }
      });
  }
});

export const { setPlans, addPlan } = seasonPlanSlice.actions;
export default seasonPlanSlice.reducer;

