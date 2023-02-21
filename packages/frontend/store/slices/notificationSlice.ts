import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../store';

export interface NotificationState {
  error: string;
  message: string;
}

const initialState: NotificationState = {
  error: '',
  message: '',
};

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setErrorMessage: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    setMessage: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
    },
  },
});

export const { setErrorMessage, setMessage } = notificationSlice.actions;

export const selectNotificationMessage = (state: RootState) =>
  state.notification.message;
export const selectNotificationErrorMessage = (state: RootState) =>
  state.notification.error;

export default notificationSlice.reducer;
