export interface StatusObject {
  id: string;
  code: string;
  name: string;
  color: string;
}

export type PlanStatus = 'DRAFT' | 'ACTIVE' | 'READY_TO_HARVEST' | 'HARVESTING' | 'COMPLETED' | 'CANCELLED' | 'UNASSIGNED' | 'ASSIGNED' | 'OVERDUE';

export interface PhaseConfig {
  name: string;
  duration: number; // in days
  description?: string;
  color?: string;
}

export interface Task {
  id: string;
  planStageId: string;
  farmId?: string;
  plotId: string | null;
  name: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: StatusObject;
  progressPercent: number;
  acceptedAt?: string;
  completedAt?: string;
  createdBy?: string;
  createdAt?: string;
  // Local/Extended fields for resource management
  assignedMembers?: string[];
  materials?: { id: string; name: string; quantity: number }[];
}

export interface Phase {
  id: string;
  planId: string;
  name: string;
  source: 'TEMPLATE' | 'MANUAL' | 'CUSTOM';
  orderIndex: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: StatusObject;
  aiSuggestionCache?: string;
  description?: string; // Not in API snippet but useful
  tasks: Task[]; // Usually fetched separately but managed together in UI
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
  status: PlanStatus | StatusObject; // Handle both legacy and new API
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
