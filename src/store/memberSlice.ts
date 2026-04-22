import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { memberService } from '../services/members/memberService';
import type {
  ChangeRoleRequest,
  Invitation,
  InviteMemberRequest,
  Member,
} from '../types/member';

interface MemberState {
  members: Member[];
  invitations: Invitation[];
  loadingMembers: boolean;
  loadingInvitations: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: MemberState = {
  members: [],
  invitations: [],
  loadingMembers: false,
  loadingInvitations: false,
  submitting: false,
  error: null,
};

export const fetchMembers = createAsyncThunk(
  'member/fetchMembers',
  async (farmId: string, { rejectWithValue }) => {
    try {
      const response = await memberService.getMembers(farmId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Không thể tải danh sách thành viên');
    }
  },
);

export const fetchInvitations = createAsyncThunk(
  'member/fetchInvitations',
  async (farmId: string, { rejectWithValue }) => {
    try {
      const response = await memberService.getInvitations(farmId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Không thể tải danh sách lời mời');
    }
  },
);

export const inviteMember = createAsyncThunk(
  'member/inviteMember',
  async (
    { farmId, payload }: { farmId: string; payload: InviteMemberRequest },
    { dispatch, rejectWithValue },
  ) => {
    try {
      await memberService.inviteMember(farmId, payload);
      await dispatch(fetchInvitations(farmId));
      await dispatch(fetchMembers(farmId));
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Không thể gửi lời mời');
    }
  },
);

export const cancelInvitation = createAsyncThunk(
  'member/cancelInvitation',
  async (
    { farmId, invitationId }: { farmId: string; invitationId: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      await memberService.cancelInvitation(farmId, invitationId);
      await dispatch(fetchInvitations(farmId));
      return invitationId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Không thể hủy lời mời');
    }
  },
);

export const removeMember = createAsyncThunk(
  'member/removeMember',
  async (
    { farmId, memberId }: { farmId: string; memberId: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      await memberService.removeMember(farmId, memberId);
      await dispatch(fetchMembers(farmId));
      return memberId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Không thể xóa thành viên');
    }
  },
);

export const changeMemberRole = createAsyncThunk(
  'member/changeMemberRole',
  async (
    {
      farmId,
      memberId,
      payload,
    }: { farmId: string; memberId: string; payload: ChangeRoleRequest },
    { dispatch, rejectWithValue },
  ) => {
    try {
      await memberService.changeRole(farmId, memberId, payload);
      await dispatch(fetchMembers(farmId));
      return memberId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Không thể đổi vai trò');
    }
  },
);

const memberSlice = createSlice({
  name: 'member',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembers.pending, (state) => {
        state.loadingMembers = true;
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.loadingMembers = false;
        state.members = action.payload;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loadingMembers = false;
        state.error = (action.payload as string) || 'Không thể tải danh sách thành viên';
      })
      .addCase(fetchInvitations.pending, (state) => {
        state.loadingInvitations = true;
        state.error = null;
      })
      .addCase(fetchInvitations.fulfilled, (state, action) => {
        state.loadingInvitations = false;
        state.invitations = action.payload;
      })
      .addCase(fetchInvitations.rejected, (state, action) => {
        state.loadingInvitations = false;
        state.error = (action.payload as string) || 'Không thể tải danh sách lời mời';
      })
      .addMatcher(
        (action) =>
          action.type.startsWith('member/') &&
          action.type.endsWith('/pending') &&
          !action.type.includes('fetchMembers') &&
          !action.type.includes('fetchInvitations'),
        (state) => {
          state.submitting = true;
          state.error = null;
        },
      )
      .addMatcher(
        (action) =>
          action.type.startsWith('member/') &&
          action.type.endsWith('/fulfilled') &&
          !action.type.includes('fetchMembers') &&
          !action.type.includes('fetchInvitations'),
        (state) => {
          state.submitting = false;
        },
      )
      .addMatcher(
        (action) =>
          action.type.startsWith('member/') &&
          action.type.endsWith('/rejected') &&
          !action.type.includes('fetchMembers') &&
          !action.type.includes('fetchInvitations'),
        (state, action: any) => {
          state.submitting = false;
          state.error = (action.payload as string) || 'Thao tác thành viên thất bại';
        },
      );
  },
});

export default memberSlice.reducer;
