export type MemberRole = 'owner' | 'manager' | 'worker' | 'employee';
export type MemberStatus = 'active' | 'pending' | 'rejected';

export interface Member {
  id: string;
  name: string;
  email: string;
  role: FarmRole;
  status: MemberStatus;
  isOwner: boolean;
  avatarUrl?: string;
  joinedAt?: string;
}

export interface FarmRole {
  id: string
  name: string
  description: string
}
// types/member.ts
export interface Invitation {
  id: string
  email: string
  role: FarmRole
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED'
  expiresAt: string
  farm: { id: string; name: string }
  inviter: { id: string; fullName: string; email: string }
}


export interface InviteMemberRequest {
  email: string;
  roleId: string;
}

export interface ChangeRoleRequest {
  roleId: string;
}
