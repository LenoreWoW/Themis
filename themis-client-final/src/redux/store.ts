import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistStore, persistReducer, Persistor } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { dragReducer } from './reducers/dragReducer';
import canvasReducer from '../store/slices/canvasSlice';
import onboardingReducer from '../store/slices/onboardingSlice';

// Configure redux-persist
const canvasPersistConfig = {
  key: 'canvas',
  storage,
  blacklist: ['history', 'selectedCardIds', 'selectedConnectionIds', 'selectedGroupIds']
};

const onboardingPersistConfig = {
  key: 'onboarding',
  storage,
  blacklist: ['isLoading', 'error']
};

const rootReducer = combineReducers({
  drag: dragReducer,
  canvas: persistReducer(canvasPersistConfig, canvasReducer),
  onboarding: persistReducer(onboardingPersistConfig, onboardingReducer),
});

export type RootState = ReturnType<typeof rootReducer>;

// Create the Redux store
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type AppDispatch = typeof store.dispatch;

// Use type assertion to fix the typing issue with persistStore
export const persistor: Persistor = persistStore(store as any);

export default store; 