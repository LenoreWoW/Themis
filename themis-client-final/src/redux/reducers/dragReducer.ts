// Define the initial state for drag operations
interface DragState {
  tasks: any[];
  draggableItems: Record<string, any>;
}

const initialState: DragState = {
  tasks: [],
  draggableItems: {}
};

// Action types
export const DRAG_ACTION_TYPES = {
  UPDATE_TASKS: 'drag/updateTasks',
  UPDATE_DRAGGABLE_ITEMS: 'drag/updateDraggableItems'
};

// Action interfaces
interface UpdateTasksAction {
  type: typeof DRAG_ACTION_TYPES.UPDATE_TASKS;
  payload: any[];
}

interface UpdateDraggableItemsAction {
  type: typeof DRAG_ACTION_TYPES.UPDATE_DRAGGABLE_ITEMS;
  payload: Record<string, any>;
}

// Union of all possible action types
type DragAction = UpdateTasksAction | UpdateDraggableItemsAction;

// Reducer function
export const dragReducer = (state = initialState, action: DragAction): DragState => {
  switch (action.type) {
    case DRAG_ACTION_TYPES.UPDATE_TASKS:
      return {
        ...state,
        // Make sure we always have an array, even if payload is somehow not an array
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        tasks: Array.isArray(action.payload) ? action.payload : []
      };
    case DRAG_ACTION_TYPES.UPDATE_DRAGGABLE_ITEMS:
      return {
        ...state,
        draggableItems: action.payload
      };
    default:
      return state;
  }
}; 