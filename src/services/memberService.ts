import { axiosInstance } from '../config/axios';
import { ApiResponse } from '../types/auth';
import { 
  Member, 
  Invitation, 
  InviteMemberRequest, 
  ChangeRoleRequest 
} from '../types/member';

export const memberService = {
  /**
   * Lấy danh sách thành viên của farm
   */
  async getMembers(farmId: string): Promise<ApiResponse<Member[]>> {
    const response = await axiosInstance.get<ApiResponse<Member[]>>(
      `/api/v1/farms/${farmId}/members`
    );
    return response.data;
  },

  /**
   * Mời thành viên
   */
  async inviteMember(farmId: string, data: InviteMemberRequest): Promise<ApiResponse<any>> {
    const response = await axiosInstance.post<ApiResponse<any>>(
      `/api/v1/farms/${farmId}/invitations`,
      data
    );
    return response.data;
  },

  /**
   * Thay đổi vai trò thành viên
   */
  async changeRole(farmId: string, memberId: string, data: ChangeRoleRequest): Promise<ApiResponse<Member>> {
    const response = await axiosInstance.patch<ApiResponse<Member>>(
      `/api/v1/farms/${farmId}/members/${memberId}/role`,
      data
    );
    return response.data;
  },

  /**
   * Xóa thành viên khỏi trang trại
   */
  async removeMember(farmId: string, memberId: string): Promise<ApiResponse<string>> {
    const response = await axiosInstance.delete<ApiResponse<string>>(
      `/api/v1/farms/${farmId}/members/${memberId}`
    );
    return response.data;
  },

  /**
   * Lấy danh sách lời mời
   */
  async getInvitations(farmId: string): Promise<ApiResponse<Invitation[]>> {
    const response = await axiosInstance.get<ApiResponse<Invitation[]>>(
      `/api/v1/farms/${farmId}/invitations`
    );
    return response.data;
  },

  /**
   * Hủy lời mời
   */
  async cancelInvitation(farmId: string, invitationId: string): Promise<ApiResponse<string>> {
    const response = await axiosInstance.patch<ApiResponse<string>>(
      `/api/v1/farms/${farmId}/invitations/${invitationId}/cancel`
    );
    return response.data;
  }
};
