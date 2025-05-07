import { legacy_createStore as createStore, Store } from 'redux';

// Define the initial state
const initialState = {
  tasks: [],
  draggableItems: {}
};

// Define the action interface
interface ReduxAction {
  type: string;
  payload?: any;
}

// Create the reducer
const reducer = (state = initialState, action: ReduxAction) => {
  switch (action.type) {
    default:
      return state;
  }
};

// Function to configure and create the store
export const configureStore = (): Store => {
  return createStore(reducer);
};

// Export a function to get the store instance for components that need it
let storeInstance: Store | null = null;

export const getStore = (): Store => {
  if (!storeInstance) {
    storeInstance = configureStore();
  }
  return storeInstance;
}; 