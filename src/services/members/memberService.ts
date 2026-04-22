import { axiosInstance } from '../../config/axios';
import { ApiResponse } from '../../types/auth';
import {
  Member,
  Invitation,
  InviteMemberRequest,
  ChangeRoleRequest
} from '../../types/member';

// memberService.ts
export const memberService = {
  async getMembers(farmId: string): Promise<ApiResponse<Member[]>> {
    const res = await axiosInstance.get(`/api/v1/farms/${farmId}/members`);
    return res.data;
  },

  async inviteMember(farmId: string, data: InviteMemberRequest): Promise<ApiResponse<void>> {
    const res = await axiosInstance.post(`/api/v1/farms/${farmId}/members`, data);
    return res.data;
  },

  async getInvitations(farmId: string, status?: string): Promise<ApiResponse<Invitation[]>> {
    const res = await axiosInstance.get(`/api/v1/farms/${farmId}/invitations`, {
      params: status ? { status } : undefined
    });
    return res.data;
  },

  async cancelInvitation(farmId: string, invitationId: string): Promise<ApiResponse<void>> {
    const res = await axiosInstance.patch(
      `/api/v1/farms/${farmId}/invitations/${invitationId}/cancel`
    );
    return res.data;
  },

  async removeMember(farmId: string, memberId: string): Promise<ApiResponse<void>> {
    const res = await axiosInstance.delete(`/api/v1/farms/${farmId}/members/${memberId}`);
    return res.data;
  },

  async changeRole(farmId: string, memberId: string, data: ChangeRoleRequest): Promise<ApiResponse<Member>> {
    const res = await axiosInstance.patch(
      `/api/v1/farms/${farmId}/members/${memberId}/role`,
      data
    );
    return res.data;
  },
  async getFarmRoles(): Promise<ApiResponse<FarmRole[]>> {
    const res = await axiosInstance.get('/api/v1/farms/roles')
    return res.data
  },
};
