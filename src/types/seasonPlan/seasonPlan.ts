export type PlanStatus = 'DRAFT' | 'ACTIVE' | 'READY_TO_HARVEST' | 'HARVESTING' | 'COMPLETED' | 'CANCELLED';

export interface PhaseConfig {
  name: string;
  duration: number; // in days
  description?: string;
  color?: string;
}

export interface Task {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  duration: number;
  status: PlanStatus;
  description?: string;
}

export interface Phase {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  duration: number;
  status: PlanStatus;
  color: string;
  description?: string;
  tasks: Task[];
}

export interface SeasonPlan {
  id: string;
  farmId: string;
  clonedFromId?: string | null;
  name: string;
  plotId: string;
  cropId: string;
  startDate: string;
  endDate: string;
  status: PlanStatus;
  phases: Phase[];
  description?: string;
  note?: string;
  createdById?: string;
  createdAt?: string;
  deletedAt?: string | null;
}

export interface CreateSeasonPlanRequest {
  name: string;
  plotId: string;
  cropId: string;
  startDate: string;
}

export interface UpdateSeasonPlanRequest {
  name?: string;
  status?: PlanStatus;
  phases?: Phase[];
  startDate?: string;
  endDate?: string;
}
