export interface Farm {
  id: string;
  ownerId: string;
  name: string;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateFarmRequest {
  farmName: string;
  description?: string;
}

export interface FarmResponse {
  id: string;
  ownerId: string;
  name: string;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface FarmSummary {
  farmId: string;
  farmName: string;
  description?: string | null;
  ownerId: string;
  ownerFullName: string;
  ownerAvatarUrl?: string | null;
  myRole: string;
  owner: boolean;
}

export interface CreateFarmInput {
  farmName: string;
  description?: string;
}
