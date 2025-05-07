import { DRAG_ACTION_TYPES } from '../reducers/dragReducer';

/**
 * Action creator to update tasks in the drag state
 * @param tasks Array of tasks
 */
export const updateTasks = (tasks: any[]) => ({
  type: DRAG_ACTION_TYPES.UPDATE_TASKS,
  payload: Array.isArray(tasks) ? tasks : []
});

/**
 * Action creator to update draggable items in the drag state
 * @param items Record of draggable items
 */
export const updateDraggableItems = (items: Record<string, any>) => ({
  type: DRAG_ACTION_TYPES.UPDATE_DRAGGABLE_ITEMS,
  payload: items
}); 