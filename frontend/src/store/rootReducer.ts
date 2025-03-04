import { combineReducers } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import conversationReducer from './slices/conversationSlice';
import codeReducer from './slices/codeSlice';
import feedbackReducer from './slices/feedbackSlice';
import memoryReducer from './slices/memorySlice';
import gitMergeReducer from './slices/gitMergeSlice';
import orchestrationReducer from './slices/orchestrationSlice';
import workflowReducer from './slices/workflowSlice';

const rootReducer = combineReducers({
  user: userReducer,
  conversation: conversationReducer,
  code: codeReducer,
  feedback: feedbackReducer,
  memory: memoryReducer,
  gitMerge: gitMergeReducer,
  orchestration: orchestrationReducer,
  workflow: workflowReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;