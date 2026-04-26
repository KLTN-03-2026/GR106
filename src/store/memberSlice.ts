import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Invitation, Member } from '../types/member';

interface MemberState {
  membersSnapshot: Member[];
  invitationsSnapshot: Invitation[];
}

const initialState: MemberState = {
  membersSnapshot: [],
  invitationsSnapshot: [],
};

const memberSlice = createSlice({
  name: 'member',
  initialState,
  reducers: {
    setMembersSnapshot: (state, action: PayloadAction<Member[]>) => {
      state.membersSnapshot = action.payload;
    },
    setInvitationsSnapshot: (state, action: PayloadAction<Invitation[]>) => {
      state.invitationsSnapshot = action.payload;
    },
    clearMemberState: () => initialState,
  },
});

export const { setMembersSnapshot, setInvitationsSnapshot, clearMemberState } = memberSlice.actions;
export default memberSlice.reducer;
