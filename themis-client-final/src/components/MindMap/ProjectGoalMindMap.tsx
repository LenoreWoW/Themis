import React, { useState, useRef, useEffect } from 'react';
import Tree from 'react-d3-tree';
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton, 
  Stack, 
  Tooltip,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as CenterIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { Project, Goal } from '../../types';
import './MindMap.css';

interface ProjectGoalMindMapProps {
  projects: Project[];
  goals?: Goal[];
  rootId?: string;
  rootType?: 'project' | 'goal';
  expandAll?: boolean;
}

// Custom node type for the mind map
interface MindMapNode {
  id: string;
  name: string;
  type: 'project' | 'goal';
  status?: string;
  progress?: number;
  attributes?: Record<string, any>;
  children?: MindMapNode[];
}

// Custom node renderer
const CustomNode = ({ nodeDatum, toggleNode }: any) => {
  const nodeType = nodeDatum.__type || 'default';
  const theme = useTheme();
  
  // Define colors based on node type
  const getNodeColor = () => {
    switch (nodeType) {
      case 'project':
        return theme.palette.primary.main;
      case 'strategic-goal':
        return theme.palette.success.main;
      case 'annual-goal':
        return theme.palette.secondary.main;
      case 'depends-on':
        return theme.palette.warning.main;
      case 'dependent':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <g className={`mind-map-node ${nodeType}`}>
      <circle r={25} fill={getNodeColor()} />
      <g className="rd3t-label">
        <text
          className="node-label"
          textAnchor="middle"
          fill="white"
          strokeWidth="0.5"
          dy=".3em"
          fontSize={12}
        >
          {nodeDatum.type.charAt(0).toUpperCase()}
        </text>
      </g>
      <text
        className="node-label"
        textAnchor="start"
        x={30}
        fill={theme.palette.text.primary}
        strokeWidth="0.5"
        dy=".3em"
        fontSize={14}
      >
        {nodeDatum.name}
      </text>
      {nodeDatum.attributes && (
        <text
          className="node-attributes"
          x={30}
          y={20}
          fill={theme.palette.text.secondary}
          fontSize={12}
        >
          {nodeDatum.progress !== undefined && `Progress: ${nodeDatum.progress}%`}
          {nodeDatum.status && ` • Status: ${nodeDatum.status}`}
        </text>
      )}
      {nodeDatum.children && nodeDatum.children.length > 0 && (
        <circle
          r={15}
          cx={-25}
          cy={0}
          fill={theme.palette.background.paper}
          stroke={theme.palette.divider}
          strokeWidth={1}
          className="toggle-button"
          onClick={toggleNode}
        />
      )}
      {nodeDatum.children && nodeDatum.children.length > 0 && (
        <g className="toggle-icon" onClick={toggleNode} style={{ cursor: 'pointer' }}>
          <text
            textAnchor="middle"
            x={-25}
            fill={theme.palette.text.primary}
            fontSize={14}
          >
            {nodeDatum.__rd3t.collapsed ? "+" : "-"}
          </text>
        </g>
      )}
    </g>
  );
};

const ProjectGoalMindMap: React.FC<ProjectGoalMindMapProps> = ({ 
  projects, 
  goals = [], 
  rootId, 
  rootType = 'project',
  expandAll = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [treeData, setTreeData] = useState<MindMapNode | null>(null);
  const [loading, setLoading] = useState(true);

  // Reset view to center
  const resetView = () => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setTranslate({ x: width / 3, y: height / 2 });
      setZoom(1);
    }
  };

  // Adjust zoom level
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));

  // Build the tree data structure for a project node
  const buildProjectNode = (project: Project, level = 0, visited: Set<string> = new Set()): MindMapNode => {
    // Prevent circular references
    if (visited.has(project.id)) {
      return {
        id: `${project.id}-${level}`,
        name: `${project.name} (circular ref)`,
        type: 'project',
        status: project.status,
        progress: project.progress,
        attributes: {
          status: project.status,
          progress: project.progress ? `${project.progress}%` : 'N/A'
        },
        children: [],
        __type: 'project'
      };
    }

    // Mark this project as visited
    visited.add(project.id);
    
    const children: MindMapNode[] = [];
    
    // Add dependencies
    if (project.projectDependencies && project.projectDependencies.length > 0) {
      project.projectDependencies.forEach(depId => {
        const depProject = projects.find(p => p.id === depId);
        if (depProject && level < 2) { // Limit depth to avoid excessive nesting
          children.push(buildProjectNode(depProject, level + 1, new Set(visited)));
        }
      });
    }
    
    // Add dependent projects
    if (project.dependentProjects && project.dependentProjects.length > 0) {
      project.dependentProjects.forEach(depId => {
        const depProject = projects.find(p => p.id === depId);
        if (depProject && level < 2) { // Limit depth to avoid excessive nesting
          children.push({
            id: depProject.id,
            name: depProject.name,
            type: 'project',
            status: depProject.status,
            progress: depProject.progress,
            attributes: {
              status: depProject.status,
              progress: depProject.progress ? `${depProject.progress}%` : 'N/A'
            },
            children: [],
            __type: 'dependent'
          });
        }
      });
    }
    
    // Add linked goals
    if (project.linkedGoals && project.linkedGoals.length > 0) {
      project.linkedGoals.forEach(goal => {
        if (goal && !visited.has(goal.id)) {
          children.push({
            id: goal.id,
            name: goal.title || goal.name || 'Unnamed Goal',
            type: 'goal',
            status: goal.status,
            progress: goal.progress,
            attributes: {
              type: goal.type,
              category: goal.category,
              status: goal.status,
              progress: goal.progress ? `${goal.progress}%` : 'N/A'
            },
            children: [],
            __type: goal.type === 'Strategic' ? 'strategic-goal' : 'annual-goal'
          });
        }
      });
    }
    
    return {
      id: project.id,
      name: project.name,
      type: 'project',
      status: project.status,
      progress: project.progress,
      attributes: {
        status: project.status,
        progress: project.progress ? `${project.progress}%` : 'N/A'
      },
      children: children,
      __type: 'project'
    };
  };

  // Build the tree data structure for a goal node
  const buildGoalNode = (goal: Goal, level = 0, visited: Set<string> = new Set()): MindMapNode => {
    // Prevent circular references
    if (visited.has(goal.id)) {
      return {
        id: `${goal.id}-${level}`,
        name: `${goal.title || goal.name || 'Unnamed Goal'} (circular ref)`,
        type: 'goal',
        status: goal.status,
        progress: goal.progress,
        attributes: {
          type: goal.type,
          category: goal.category,
          status: goal.status,
          progress: goal.progress ? `${goal.progress}%` : 'N/A'
        },
        children: [],
        __type: goal.type === 'Strategic' ? 'strategic-goal' : 'annual-goal'
      };
    }

    // Mark this goal as visited
    visited.add(goal.id);
    
    const children: MindMapNode[] = [];
    
    // Add linked projects
    if (goal.linkedProjects && goal.linkedProjects.length > 0) {
      goal.linkedProjects.forEach(link => {
        const project = projects.find(p => p.id === link.projectId);
        if (project && level < 2) { // Limit depth to avoid excessive nesting
          children.push(buildProjectNode(project, level + 1, new Set(visited)));
        }
      });
    }
    
    return {
      id: goal.id,
      name: goal.title || goal.name || 'Unnamed Goal',
      type: 'goal',
      status: goal.status,
      progress: goal.progress,
      attributes: {
        type: goal.type,
        category: goal.category,
        status: goal.status,
        progress: goal.progress ? `${goal.progress}%` : 'N/A'
      },
      children: children,
      __type: goal.type === 'Strategic' ? 'strategic-goal' : 'annual-goal'
    };
  };

  // Build the tree data
  useEffect(() => {
    const buildTreeData = () => {
      setLoading(true);
      
      try {
        // If a root node is specified
        if (rootId) {
          if (rootType === 'project') {
            const rootProject = projects.find(p => p.id === rootId);
            if (rootProject) {
              setTreeData(buildProjectNode(rootProject));
            } else {
              throw new Error(`Root project with ID ${rootId} not found`);
            }
          } else {
            const rootGoal = goals.find(g => g.id === rootId);
            if (rootGoal) {
              setTreeData(buildGoalNode(rootGoal));
            } else {
              throw new Error(`Root goal with ID ${rootId} not found`);
            }
          }
        } 
        // Otherwise build a root node with all projects
        else {
          const rootNode: MindMapNode = {
            id: 'root',
            name: 'All Projects & Goals',
            type: 'project',
            attributes: {},
            children: []
          };
          
          // Add top-level projects (those without dependencies)
          projects.forEach(project => {
            if (!project.projectDependencies || project.projectDependencies.length === 0) {
              rootNode.children?.push(buildProjectNode(project));
            }
          });

          // Add top-level goals if we have them
          if (goals && goals.length > 0) {
            goals.forEach(goal => {
              // Only add strategic goals at the top level
              if (goal.type === 'Strategic') {
                rootNode.children?.push(buildGoalNode(goal));
              }
            });
          }
          
          setTreeData(rootNode);
        }
      } catch (error) {
        console.error('Error building mind map data:', error);
        // Set basic error node
        setTreeData({
          id: 'error',
          name: 'Error Loading Data',
          type: 'project',
          attributes: {
            error: error instanceof Error ? error.message : 'Unknown error'
          },
          children: []
        });
      } finally {
        setLoading(false);
      }
    };

    buildTreeData();
  }, [projects, goals, rootId, rootType]);

  // Update dimensions when component mounts or window resizes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
        // Set initial translation to position the root node nicely
        setTranslate({ x: width / 3, y: height / 2 });
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
        {/* Controls */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 16, 
            right: 16, 
            zIndex: 1000,
            bgcolor: 'background.paper',
            boxShadow: 1,
            borderRadius: 1,
            p: 0.5
          }}
        >
          <Stack direction="row">
            <Tooltip title="Zoom In">
              <IconButton onClick={handleZoomIn} size="small">
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom Out">
              <IconButton onClick={handleZoomOut} size="small">
                <ZoomOutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Center View">
              <IconButton onClick={resetView} size="small">
                <CenterIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton 
                onClick={() => {
                  // Force re-render by setting loading to true
                  setLoading(true);
                  setTimeout(() => setLoading(false), 300);
                }} 
                size="small"
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
        
        {/* Tree container */}
        <Box 
          ref={containerRef} 
          className="mind-map-container" 
          sx={{ 
            width: '100%', 
            height: '100%', 
            minHeight: '600px'
          }}
        >
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: '100%'
            }}>
              <CircularProgress />
            </Box>
          ) : treeData ? (
            <Tree 
              data={treeData}
              orientation="horizontal"
              renderCustomNodeElement={CustomNode}
              zoomable={true}
              zoom={zoom}
              translate={{ x: translate.x, y: translate.y }}
              separation={{ siblings: 1.5, nonSiblings: 2 }}
              pathClassFunc={() => 'mind-map-link'}
              initialDepth={expandAll ? 999 : 1}
              depthFactor={300}
              dimensions={dimensions}
              draggable={true}
              collapsible={true}
              onUpdate={treeState => {
                if (treeState.zoom) {
                  setZoom(treeState.zoom);
                }
                if (treeState.translate) {
                  setTranslate(treeState.translate);
                }
              }}
            />
          ) : (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              flexDirection: 'column'
            }}>
              <Typography variant="h6" color="text.secondary">No data available</Typography>
              <Typography variant="body2" color="text.secondary">
                Please check that you have projects and goals with relationships defined
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default ProjectGoalMindMap; 