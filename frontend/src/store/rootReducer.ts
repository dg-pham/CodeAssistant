import { combineReducers } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import conversationReducer from './slices/conversationSlice';
import codeReducer from './slices/codeSlice';
import feedbackReducer from './slices/feedbackSlice';
import memoryReducer from './slices/memorySlice';

const rootReducer = combineReducers({
  user: userReducer,
  conversation: conversationReducer,
  code: codeReducer,
  feedback: feedbackReducer,
  memory: memoryReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;