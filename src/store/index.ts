import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import farmReducer from './farmSlice';
import plotReducer from './plotSlice';
import cropReducer from './cropSlice';
import seasonPlanReducer from './seasonPlanSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    farm: farmReducer,
    plot: plotReducer,
    crop: cropReducer,
    seasonPlan: seasonPlanReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;