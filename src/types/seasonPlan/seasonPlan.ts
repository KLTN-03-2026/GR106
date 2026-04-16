export type PlanStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

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
  name: string;
  plotId: string;
  cropId: string;
  startDate: string;
  endDate: string;
  status: PlanStatus;
  phases: Phase[];
  description?: string;
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
