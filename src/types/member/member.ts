export type MemberRole = 'owner' | 'manager' | 'worker' | 'employee';
export type MemberStatus = 'active' | 'pending' | 'rejected';

export interface Member {
  userId: string       // API trả về userId, không phải id
  fullName: string     // không phải name
  email: string
  role: FarmRole       // object, không phải string
  isActive: boolean    // không phải status
  joinedAt: string
  avatarUrl?: string | null
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
