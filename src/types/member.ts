export type MemberRole = 'owner' | 'manager' | 'worker' | 'employee';
export type MemberStatus = 'active' | 'pending' | 'rejected';

export interface Member {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  isOwner: boolean;
  avatarUrl?: string;
  joinedAt?: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: MemberRole;
  status: 'pending' | 'expired' | 'canceled';
  invitedAt: string;
  expiresAt: string;
}

export interface InviteMemberRequest {
  email: string;
  roleId: string;
}

export interface ChangeRoleRequest {
  roleId: string;
}
