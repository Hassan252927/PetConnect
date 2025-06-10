import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import petReducer from './petSlice';
import postReducer from './postSlice';
import chatReducer from './chatSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    pet: petReducer,
    post: postReducer,
    chat: chatReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 