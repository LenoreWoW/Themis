import React, { useState, useRef, useEffect, useCallback } from 'react';
import Tree from 'react-d3-tree';
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton, 
  Stack, 
  Tooltip, 
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Divider
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as CenterIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Menu as MenuIcon,
  Refresh as ReLayoutIcon,
  Save as SaveIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { Project, Task, TaskStatus, TaskPriority, UserRole } from '../../types';
import './MindMap.css';
import { useTasks } from '../../context/TaskContext';

// Define the structure of a node in the mind map
interface MindMapNode {
  id: string;
  name: string;
  type?: 'task' | 'project' | 'category' | 'milestone' | 'custom';
  status?: TaskStatus;
  attributes?: Record<string, any>;
  taskId?: string; // Reference to actual task ID if applicable
  children?: MindMapNode[];
}

interface EnhancedMindMapProps {
  project?: Project;
  tasks?: Task[];
  mode: 'tasks' | 'blank';
  onSave?: (data: any) => void;
  initialData?: MindMapNode;
  customizeEnabled?: boolean;
}

// Props for the CustomNode component
interface CustomNodeProps {
  nodeDatum: any;
  toggleNode: () => void;
  onNodeClick: (nodeDatum: any) => void;
  onAddChild: (nodeDatum: any) => void;
  onAddSibling: (nodeDatum: any) => void;
  onDeleteNode: (nodeDatum: any) => void;
  onEditNode: (nodeDatum: any) => void;
}

// Component to render the custom node
const CustomNode: React.FC<CustomNodeProps> = ({
  nodeDatum,
  toggleNode,
  onNodeClick,
  onAddChild,
  onAddSibling,
  onDeleteNode,
  onEditNode
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  
  const handleMenuOpen = (e: React.MouseEvent<SVGCircleElement | SVGTextElement>) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget as unknown as HTMLElement);
  };
  
  const handleMenuClose = () => {
    setMenuAnchor(null);
  };
  
  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMenuClose();
    onAddChild(nodeDatum);
  };

  const handleAddSibling = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMenuClose();
    onAddSibling(nodeDatum);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMenuClose();
    onDeleteNode(nodeDatum);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMenuClose();
    onEditNode(nodeDatum);
  };
  
  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleNode();
    onNodeClick(nodeDatum);
  };
  
  // Determine node color based on type or status
  const getNodeColor = () => {
    if (nodeDatum.__type === 'project') return 'var(--mind-map-node-project-color)';
    if (nodeDatum.__type === 'category') return 'var(--mind-map-node-category-color)';
    if (nodeDatum.__type === 'milestone') return 'var(--mind-map-node-milestone-color)';
    
    // For task nodes, color by status
    if (nodeDatum.__type === 'task') {
      switch(nodeDatum.status) {
        case TaskStatus.TODO: return '#9e9e9e';
        case TaskStatus.IN_PROGRESS: return '#2196f3';
        case TaskStatus.REVIEW: return '#ff9800';
        case TaskStatus.DONE: return '#4caf50';
        default: return 'var(--mind-map-node-task-color)';
      }
    }
    
    // Default color for custom nodes
    return 'var(--mind-map-node-task-color)';
  };

  return (
    <g 
      onClick={handleNodeClick}
      className={`mind-map-node ${nodeDatum.__type || 'custom'}`}
    >
      <circle 
        r={nodeDatum.__type === 'project' ? 25 : nodeDatum.__type === 'category' ? 20 : 15} 
        fill={getNodeColor()}
      />
      
      <text
        className="node-label"
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
        y={nodeDatum.__type === 'project' ? 0 : 0}
        style={{ 
          fontSize: nodeDatum.__type === 'project' ? 'var(--mind-map-font-size-large)' : 'var(--mind-map-font-size-medium)', 
          fontWeight: 'bold',
          fontFamily: 'var(--mind-map-font-primary)',
          textShadow: '0px 1px 2px rgba(0,0,0,0.5)'
        }}
      >
        {nodeDatum.name.length > 20 ? `${nodeDatum.name.substring(0, 18)}...` : nodeDatum.name}
      </text>
      
      {nodeDatum.attributes && (
        <text 
          className="node-attributes"
          fill="white"
          x={30}
          dy="1.2em"
          style={{ 
            fontSize: 'var(--mind-map-font-size-small)',
            fontFamily: 'var(--mind-map-font-primary)',
            textShadow: '0px 1px 2px rgba(0,0,0,0.3)'
          }}
        >
          {Object.entries(nodeDatum.attributes).map(([key, value], i) => (
            <tspan key={key} x={30} dy={i === 0 ? 0 : '1.2em'}>
              {`${key}: ${value}`}
            </tspan>
          ))}
        </text>
      )}
      
      {/* Drag diamond indicator */}
      <circle
        className="drag-indicator"
        r={5}
        cx={40}
        cy={0}
        fill="#f5f5f5"
        stroke="#333"
        strokeWidth={1}
        style={{ cursor: 'grab' }}
      />
      
      {/* Action button */}
      <g className="action-button-group">
        <circle
          onClickCapture={handleMenuOpen}
          className="action-button"
          r={8}
          cx={-35}
          cy={0}
          fill="#f5f5f5"
          stroke="#ccc"
          strokeWidth={1}
          style={{ cursor: 'pointer' }}
        />
        
        <text
          onClickCapture={handleMenuOpen}
          x={-35}
          y={3}
          textAnchor="middle"
          style={{ 
            fontSize: 'var(--mind-map-font-size-medium)', 
            fill: '#555', 
            cursor: 'pointer',
            fontFamily: 'var(--mind-map-font-primary)'
          }}
        >
          ⋮
        </text>
      </g>
      
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <MenuItem onClick={handleAddChild}>
          <AddIcon fontSize="small" sx={{ mr: 1 }} />
          Add Child
        </MenuItem>
        <MenuItem onClick={handleAddSibling}>
          <AddIcon fontSize="small" sx={{ mr: 1 }} />
          Add Sibling
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </g>
  );
};

const EnhancedMindMap: React.FC<EnhancedMindMapProps> = ({ 
  project, 
  tasks = [], 
  mode = 'tasks',
  onSave,
  initialData,
  customizeEnabled = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [treeData, setTreeData] = useState<MindMapNode | null>(null);
  const [activeNode, setActiveNode] = useState<MindMapNode | null>(null);
  
  // Dialog state for node operations
  const [nodeDialogOpen, setNodeDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'add-child' | 'add-sibling' | 'edit'>('add-child');
  const [newNodeName, setNewNodeName] = useState('');
  
  // Customize panel state
  const [customizeOpen, setCustomizeOpen] = useState(false);
  
  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<MindMapNode | null>(null);

  const { addTask, updateTask, deleteTask } = useTasks();

  // Initialize mind map data
  useEffect(() => {
    if (initialData) {
      setTreeData(initialData);
      return;
    }
    
    if (mode === 'blank') {
      // Create a blank mind map with a single root node
      setTreeData({
        id: `root-${Date.now()}`,
        name: 'Central Idea',
        type: 'custom',
        children: []
      });
    } else if (mode === 'tasks' && project && tasks) {
      // Create a mind map based on tasks
      buildTasksBasedMindMap();
    }
  }, [project, tasks, mode, initialData]);

  // Build a mind map structure from project and tasks
  const buildTasksBasedMindMap = () => {
    if (!project || !tasks) return;

    // Group tasks by status
    const tasksByStatus: Record<string, Task[]> = {
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.REVIEW]: [],
      [TaskStatus.DONE]: []
    };

    tasks.forEach(task => {
      if (tasksByStatus[task.status]) {
        tasksByStatus[task.status].push(task);
      } else {
        tasksByStatus[TaskStatus.TODO].push(task);
      }
    });

    // Create the mind map structure
    const mindMapRoot: MindMapNode = {
      id: `project-${project.id}`,
      name: project.name,
      type: 'project',
      attributes: {
        status: project.status,
        progress: `${project.progress}%`
      },
      children: Object.entries(tasksByStatus).map(([status, statusTasks]) => ({
        id: `status-${status}`,
        name: getStatusLabel(status as TaskStatus),
        type: 'category',
        children: statusTasks.map(task => ({
          id: `task-${task.id}`,
          name: task.title,
          type: 'task',
          taskId: task.id,
          status: task.status,
          attributes: {
            priority: task.priority,
            assignee: task.assignee?.firstName 
              ? `${task.assignee.firstName} ${task.assignee.lastName}`
              : 'Unassigned',
            dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'
          }
        }))
      }))
    };

    setTreeData(mindMapRoot);
  };

  // Helper function to get status label
  const getStatusLabel = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.TODO:
        return 'To Do';
      case TaskStatus.IN_PROGRESS:
        return 'In Progress';
      case TaskStatus.REVIEW:
        return 'Review';
      case TaskStatus.DONE:
        return 'Done';
      default:
        return 'Unknown';
    }
  };

  // Function to reset view to center
  const resetView = () => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setTranslate({ x: width / 2, y: height / 3 });
      setZoom(1);
    }
  };

  // Adjust zoom level
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));

  // Handle node clicks
  const handleNodeClick = (nodeDatum: any) => {
    setActiveNode(nodeDatum);
  };

  // Generate a unique node ID
  const generateNodeId = () => `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Open dialog to add a child node
  const handleAddChild = (parentNode: any) => {
    setDialogAction('add-child');
    setActiveNode(parentNode);
    setNewNodeName('');
    setNodeDialogOpen(true);
  };

  // Open dialog to add a sibling node
  const handleAddSibling = (siblingNode: any) => {
    setDialogAction('add-sibling');
    setActiveNode(siblingNode);
    setNewNodeName('');
    setNodeDialogOpen(true);
  };

  // Open dialog to edit a node
  const handleEditNode = (node: any) => {
    setDialogAction('edit');
    setActiveNode(node);
    setNewNodeName(node.name);
    setNodeDialogOpen(true);
  };

  // Confirm deletion of a node
  const handleDeleteNode = (node: any) => {
    setNodeToDelete(node);
    setDeleteDialogOpen(true);
  };

  // Save and close node edit dialog
  const handleSaveNode = () => {
    if (!treeData || !activeNode || !newNodeName.trim()) {
      setNodeDialogOpen(false);
      return;
    }

    // Function to recursively update nodes in the tree
    const updateTreeNodes = (nodes: MindMapNode[] = []): MindMapNode[] => {
      return nodes.map(node => {
        // If this is the node to update
        if (node.id === activeNode.id && dialogAction === 'edit') {
          return { ...node, name: newNodeName };
        }
        
        // If this is a parent where we need to add a child
        if (node.id === activeNode.id && dialogAction === 'add-child') {
          const children = node.children || [];
          return {
            ...node,
            children: [
              ...children,
              {
                id: generateNodeId(),
                name: newNodeName,
                type: 'custom',
                children: []
              }
            ]
          };
        }
        
        // If this has children, recursively update them
        if (node.children && node.children.length > 0) {
          return {
            ...node,
            children: updateTreeNodes(node.children)
          };
        }
        
        return node;
      });
    };

    // Function to add a sibling
    const addSibling = (root: MindMapNode, targetNodeId: string): MindMapNode => {
      // If the root is the parent of the target node
      if (root.children?.some(child => child.id === targetNodeId)) {
        return {
          ...root,
          children: [
            ...(root.children || []),
            {
              id: generateNodeId(),
              name: newNodeName,
              type: 'custom',
              children: []
            }
          ]
        };
      }
      
      // Otherwise search deeper in the tree
      if (root.children) {
        return {
          ...root,
          children: root.children.map(child => addSibling(child, targetNodeId))
        };
      }
      
      return root;
    };

    // Update the tree data
    if (dialogAction === 'add-sibling' && treeData) {
      // Need to find the parent of the activeNode
      setTreeData(addSibling(treeData, activeNode.id));
    } else if (treeData) {
      // Handle edit or add child
      setTreeData({
        ...treeData,
        children: updateTreeNodes(treeData.children || [])
      });
    }

    setNodeDialogOpen(false);
  };

  // Execute node deletion
  const handleConfirmDelete = () => {
    if (!treeData || !nodeToDelete) {
      setDeleteDialogOpen(false);
      return;
    }

    // Function to recursively remove a node from the tree
    const removeNode = (nodes: MindMapNode[] = []): MindMapNode[] => {
      return nodes
        .filter(node => node.id !== nodeToDelete.id)
        .map(node => {
          if (node.children && node.children.length > 0) {
            return {
              ...node,
              children: removeNode(node.children)
            };
          }
          return node;
        });
    };

    // Update the tree data
    if (treeData.id === nodeToDelete.id) {
      // If we're deleting the root, this shouldn't normally happen
      setTreeData(null);
    } else {
      setTreeData({
        ...treeData,
        children: removeNode(treeData.children || [])
      });
    }

    setDeleteDialogOpen(false);
    setNodeToDelete(null);
  };

  // Automatically rearrange the layout
  const handleReLayout = () => {
    // This is a placeholder - with react-d3-tree, we'd need to manipulate
    // the tree coordinates or use a different approach to truly re-layout
    // For now, we just reset the view to center the current tree
    resetView();
  };

  // Handle saving the mind map
  const handleSave = () => {
    if (onSave && treeData) {
      onSave(treeData);
    }
  };

  // Update dimensions when component mounts or window resizes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
        setTranslate({ x: width / 2, y: height / 3 });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const handleAddNode = async (parentNode: MindMapNode, newNodeName: string) => {
    if (!project) return;

    const newTask: Task = {
      id: `temp-${Date.now()}`,
      projectId: project.id,
      title: newNodeName,
      description: '',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      startDate: new Date().toISOString(),
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        startDate: project.startDate,
        endDate: project.endDate,
        projectManager: project.projectManager,
        department: project.department,
        progress: 0, // Default value
        budget: 0, // Default value
        actualCost: 0, // Default value
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        templateType: project.templateType
      },
      assignee: undefined,
      createdBy: {
        id: 'current-user',
        firstName: 'Current',
        lastName: 'User',
        email: 'user@example.com',
        role: UserRole.PROJECT_MANAGER,
        department: project.department,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await addTask(newTask);
      // The TaskContext will automatically update the tasks list
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const handleEditTaskNode = async (node: MindMapNode, newName: string) => {
    if (!node.taskId) return;

    try {
      // Update the task with new name
      const updatedTask = { ...tasks.find(t => t.id === node.taskId), title: newName };
      await updateTask(node.taskId, updatedTask);
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteTaskNode = async (node: MindMapNode) => {
    if (!node.taskId) return;

    try {
      await deleteTask(node.taskId);
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  return (
    <Paper elevation={1} sx={{ height: '100%', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
      <Box sx={{ height: '100%', position: 'relative' }}>
        {/* Top toolbar */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            p: 1, 
            borderBottom: '1px solid #eee',
            backgroundColor: '#f9f9f9'
          }}
        >
          <Stack direction="row" spacing={1}>
            <Button 
              size="small" 
              startIcon={<DashboardIcon />}
              onClick={() => setCustomizeOpen(!customizeOpen)}
              variant={customizeOpen ? "contained" : "outlined"}
              disabled={!customizeEnabled}
            >
              Customize
            </Button>
          </Stack>
          
          <Stack direction="row" spacing={1}>
            <Button 
              size="small" 
              startIcon={<ReLayoutIcon />}
              onClick={handleReLayout}
            >
              Re-Layout
            </Button>
            
            <Button 
              size="small" 
              variant="contained" 
              color="primary" 
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!onSave}
            >
              Save
            </Button>
          </Stack>
        </Box>
        
        {/* Mind map view area */}
        <Box sx={{ display: 'flex', height: customizeEnabled ? 'calc(100% - 48px)' : '100%' }}>
          {/* Main tree visualization */}
          <Box 
            ref={containerRef} 
            className="mind-map-container" 
            sx={{ 
              width: customizeOpen ? 'calc(100% - 300px)' : '100%', 
              height: '100%',
              transition: 'width 0.3s ease-in-out'
            }}
          >
            {treeData && (
              <Tree 
                data={treeData}
                orientation="horizontal"
                renderCustomNodeElement={(rd3tProps) => (
                  <CustomNode
                    nodeDatum={rd3tProps.nodeDatum}
                    toggleNode={rd3tProps.toggleNode}
                    onNodeClick={handleNodeClick}
                    onAddChild={handleAddChild}
                    onAddSibling={handleAddSibling}
                    onDeleteNode={handleDeleteNode}
                    onEditNode={handleEditNode}
                  />
                )}
                zoomable={true}
                zoom={zoom}
                translate={{ x: translate.x, y: translate.y }}
                separation={{ siblings: 1.5, nonSiblings: 2 }}
                pathClassFunc={() => 'mind-map-link'}
                initialDepth={1}
                depthFactor={300}
                dimensions={dimensions}
                draggable={true}
                collapsible={true}
              />
            )}
          </Box>
          
          {/* Customize panel */}
          {customizeEnabled && customizeOpen && (
            <Box 
              sx={{ 
                width: 300,
                height: '100%',
                p: 2,
                borderLeft: '1px solid #eee',
                overflowY: 'auto',
                backgroundColor: '#f9f9f9'
              }}
            >
              <Typography variant="h6" gutterBottom>
                Customize Mind Map
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Mind Map Mode
                </Typography>
                <Chip 
                  label={mode === 'tasks' ? 'Tasks Mode' : 'Blank Mode'} 
                  color="primary" 
                  variant="outlined"
                  sx={{ mr: 1 }}
                />
              </Box>
              
              {activeNode && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Node
                  </Typography>
                  <Typography variant="body2">
                    <strong>Name:</strong> {activeNode.name}
                  </Typography>
                  {activeNode.type && (
                    <Typography variant="body2">
                      <strong>Type:</strong> {activeNode.type}
                    </Typography>
                  )}
                  <Box sx={{ mt: 2 }}>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      startIcon={<AddIcon />}
                      onClick={() => handleAddChild(activeNode)}
                      sx={{ mr: 1, mb: 1 }}
                    >
                      Add Child
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      startIcon={<EditIcon />}
                      onClick={() => handleEditNode(activeNode)}
                      sx={{ mr: 1, mb: 1 }}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteNode(activeNode)}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Zoom controls */}
        <Box 
          className="mind-map-controls"
          sx={{ 
            position: 'absolute', 
            bottom: 16, 
            right: 16, 
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: 2,
            padding: 1,
            boxShadow: 1
          }}
        >
          <Stack direction="row" spacing={1}>
            <Tooltip title="Zoom In">
              <IconButton size="small" onClick={handleZoomIn}>
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom Out">
              <IconButton size="small" onClick={handleZoomOut}>
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Center">
              <IconButton size="small" onClick={resetView}>
                <CenterIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Box>
      
      {/* Node edit dialog */}
      <Dialog open={nodeDialogOpen} onClose={() => setNodeDialogOpen(false)}>
        <DialogTitle>
          {dialogAction === 'add-child' 
            ? 'Add Child Node' 
            : dialogAction === 'add-sibling' 
              ? 'Add Sibling Node' 
              : 'Edit Node'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Node Name"
            fullWidth
            value={newNodeName}
            onChange={(e) => setNewNodeName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNodeDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveNode} variant="contained" disabled={!newNodeName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Node</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{nodeToDelete?.name}"? This will also remove all of its children.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default EnhancedMindMap; 