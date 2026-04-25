import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { 
  fetchMembers, 
  fetchInvitations,
  inviteMember, 
  cancelInvitation,
  removeMember, 
  changeMemberRole,
} from '../../store/memberSlice';
import { InviteMemberRequest, ChangeRoleRequest } from '../../types/member';
import { useCallback } from 'react';

export const useMembers = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    members, 
    invitations, 
    loadingMembers, 
    loadingInvitations, 
    submitting, 
    error 
  } = useSelector((state: RootState) => state.member);

  return {
    // State
    members,
    invitations,
    loadingMembers,
    loadingInvitations,
    submitting,
    error,

    // Actions
    fetchMembers: useCallback((farmId: string) => dispatch(fetchMembers(farmId)), [dispatch]),
    fetchInvitations: useCallback((farmId: string) => dispatch(fetchInvitations(farmId)), [dispatch]),
    inviteMember: useCallback((farmId: string, payload: InviteMemberRequest) => 
      dispatch(inviteMember({ farmId, payload })), [dispatch]),
    cancelInvitation: useCallback((farmId: string, invitationId: string) => 
      dispatch(cancelInvitation({ farmId, invitationId })), [dispatch]),
    removeMember: useCallback((farmId: string, memberId: string) => 
      dispatch(removeMember({ farmId, memberId })), [dispatch]),
    changeMemberRole: useCallback((farmId: string, memberId: string, payload: ChangeRoleRequest) => 
      dispatch(changeMemberRole({ farmId, memberId, payload })), [dispatch]),
  };
};
