import React, { useState, useRef, useEffect } from 'react';
import Tree from 'react-d3-tree';
import { Box, Typography, Paper, IconButton, Stack, Tooltip } from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as CenterIcon,
  Fullscreen as FullscreenIcon
} from '@mui/icons-material';
import { Project, Task } from '../../types';
import './MindMap.css';

interface MindMapProps {
  project: Project;
  tasks: Task[];
}

// Custom node shape and content
const CustomNode = ({ nodeDatum, toggleNode }: any) => (
  <g 
    onClick={toggleNode}
    className={`mind-map-node ${nodeDatum.__type || ''}`}
  >
    <circle 
      r={nodeDatum.__type === 'project' ? 25 : nodeDatum.__type === 'category' ? 20 : 15} 
      fill={nodeDatum.__type === 'project' ? '#3f51b5' : 
            nodeDatum.__type === 'category' ? '#7986cb' : 
            nodeDatum.__type === 'milestone' ? '#e91e63' : '#90caf9'}
    />
    <text
      className="node-label"
      fill="white"
      textAnchor="middle"
      y={nodeDatum.__type === 'project' ? 5 : 4}
      style={{ fontSize: nodeDatum.__type === 'project' ? '0.8em' : '0.7em', fontWeight: 'bold' }}
    >
      {nodeDatum.name.length > 20 ? `${nodeDatum.name.substring(0, 18)}...` : nodeDatum.name}
    </text>
    {nodeDatum.attributes && (
      <text 
        className="node-attributes"
        fill="white"
        x={30}
        dy="1.2em"
        style={{ fontSize: '0.7em' }}
      >
        {Object.entries(nodeDatum.attributes).map(([key, value], i) => (
          <tspan key={key} x={30} dy={i === 0 ? 0 : '1.2em'}>
            {`${key}: ${value}`}
          </tspan>
        ))}
      </text>
    )}
  </g>
);

const MindMap: React.FC<MindMapProps> = ({ project, tasks }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [treeData, setTreeData] = useState<any>({ name: 'Root' });

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

  // Build tree data structure from project and tasks
  useEffect(() => {
    if (!project || !tasks) return;

    // Group tasks by categories (derived from task titles or attributes)
    const tasksByCategory: Record<string, Task[]> = {};
    const milestones: Task[] = [];

    tasks.forEach(task => {
      if (task.isMilestone) {
        milestones.push(task);
      } else {
        // Extract or define category from task
        const taskParts = task.title.split(':');
        const category = taskParts.length > 1 ? taskParts[0].trim() : 'General';
        
        if (!tasksByCategory[category]) {
          tasksByCategory[category] = [];
        }
        tasksByCategory[category].push(task);
      }
    });

    // Create the mind map structure
    const mindMapRoot = {
      name: project.name,
      __type: 'project',
      attributes: {
        status: project.status,
        progress: `${project.progress}%`
      },
      children: [
        // Categories branch
        {
          name: 'Categories',
          __type: 'branch',
          children: Object.keys(tasksByCategory).map(category => ({
            name: category,
            __type: 'category',
            children: tasksByCategory[category].map(task => ({
              name: task.title,
              __type: 'task',
              attributes: {
                status: task.status,
                priority: task.priority,
                assignee: task.assignee?.username || 'Unassigned'
              }
            }))
          }))
        },
        // Milestones branch
        {
          name: 'Milestones',
          __type: 'branch',
          children: milestones.map(milestone => ({
            name: milestone.title,
            __type: 'milestone',
            attributes: {
              date: new Date(milestone.dueDate).toLocaleDateString(),
              status: milestone.status
            }
          }))
        },
        // Project Info branch
        {
          name: 'Project Info',
          __type: 'branch',
          children: [
            {
              name: 'Timeline',
              __type: 'info',
              attributes: {
                start: new Date(project.startDate).toLocaleDateString(),
                end: new Date(project.endDate).toLocaleDateString()
              }
            },
            {
              name: 'Budget',
              __type: 'info',
              attributes: {
                total: `$${project.budget.toLocaleString()}`,
                spent: `$${project.actualCost.toLocaleString()}`
              }
            },
            {
              name: 'Team',
              __type: 'info',
              attributes: {
                manager: project.projectManager?.username || 'Unassigned',
                department: project.department
              }
            }
          ]
        }
      ]
    };

    setTreeData(mindMapRoot);
  }, [project, tasks]);

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

  return (
    <Paper elevation={1} sx={{ height: '100%', borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ height: '100%', position: 'relative' }}>
        <Box 
          ref={containerRef} 
          className="mind-map-container" 
          sx={{ 
            width: '100%', 
            height: '100%', 
            minHeight: '600px'
          }}
        >
          {treeData.name && (
            <Tree 
              data={treeData}
              orientation="horizontal"
              renderCustomNodeElement={CustomNode}
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

        <Box 
          className="mind-map-legend"
          sx={{ 
            position: 'absolute', 
            top: 16, 
            right: 16, 
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: 2,
            padding: 1,
            boxShadow: 1
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Legend</Typography>
          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#3f51b5', mr: 1 }} />
              <Typography variant="caption">Project</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#7986cb', mr: 1 }} />
              <Typography variant="caption">Category</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#90caf9', mr: 1 }} />
              <Typography variant="caption">Task</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#e91e63', mr: 1 }} />
              <Typography variant="caption">Milestone</Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
};

export default MindMap; 