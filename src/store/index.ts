import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import farmReducer from './farmSlice';
import plotReducer from './plotSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    farm: farmReducer,
    plot: plotReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;