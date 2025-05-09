import React, { useState, useEffect } from 'react';
import Tree from 'react-d3-tree';
import {
  Project,
  ProjectStatus
} from '../../types';
import { MindMapNode } from '../../types/MindMapTypes';
import './MindMap.css';

// Define the enums locally since they're not exported properly
enum GoalStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD'
}

enum GoalType {
  STRATEGIC = 'STRATEGIC',
  ANNUAL = 'ANNUAL',
  QUARTERLY = 'QUARTERLY',
  MONTHLY = 'MONTHLY'
}

// Define interfaces for Goal and related types
interface Goal {
  id: string;
  title: string;
  description: string;
  type: GoalType;
  status: GoalStatus;
  progress: number;
  startDate: string;
  endDate: string;
  assignedTo: string;
  linkedProjects?: ProjectLink[];
  linkedGoals?: GoalLink[];
  isProgressAutoCalculated: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProjectLink {
  projectId: string;
  weight: number;
}

interface GoalLink {
  goalId: string;
  weight: number;
}

interface ProjectGoalMindMapProps {
  projects: Project[];
  goals: Goal[];
  rootId?: string;
  rootType?: 'project' | 'goal';
  expandAll?: boolean;
}

// Wrapper component to use the theme hook and pass colors to the CustomNode
const ProjectGoalMindMapWrapper: React.FC<ProjectGoalMindMapProps> = (props) => {
  return <ProjectGoalMindMap {...props} />;
};

// Custom node renderer for the mind map
const CustomNode = ({ nodeDatum, toggleNode }: any) => {
  // Determine node color based on status
  const getNodeColor = () => {
    if (nodeDatum.type === 'project') {
      return nodeDatum.status === ProjectStatus.COMPLETED
        ? '#4CAF50'
        : nodeDatum.status === ProjectStatus.IN_PROGRESS
        ? '#2196F3'
        : '#FFC107';
    } else if (nodeDatum.type === 'goal') {
      return nodeDatum.status === GoalStatus.COMPLETED
        ? '#4CAF50'
        : nodeDatum.status === GoalStatus.IN_PROGRESS
        ? '#2196F3'
        : '#FFC107';
    }
    return '#9E9E9E'; // Default color for other node types
  };

  return (
    <g>
      <circle r={20} fill={getNodeColor()} onClick={toggleNode} />
      <text
        x={30}
        dy="0.31em"
        strokeWidth="1"
        textAnchor="start"
        style={{ fill: '#555', fontSize: '14px' }}
      >
        {nodeDatum.name}
      </text>
      {nodeDatum.attributes && (
        <text
          x={30}
          dy="1.31em"
          strokeWidth="1"
          textAnchor="start"
          style={{ fill: '#777', fontSize: '12px' }}
        >
          {Object.entries(nodeDatum.attributes).map(([key, value], i) => (
            <tspan key={i} x={30} dy={i > 0 ? '1.2em' : '0'}>
              {`${key}: ${value}`}
            </tspan>
          ))}
        </text>
      )}
    </g>
  );
};

const ProjectGoalMindMap: React.FC<ProjectGoalMindMapProps> = ({
  projects,
  goals,
  rootId,
  rootType = 'project',
  expandAll = false
}) => {
  const [treeData, setTreeData] = useState<MindMapNode | null>(null);
  const [loading, setLoading] = useState(true);

  // Reset view to center
  const [zoom, setZoom] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  // Handle zoom buttons
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));

  useEffect(() => {
    buildMindMapData();
  }, [projects, goals, rootId, rootType]);

  const buildMindMapData = () => {
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
        setTreeData(buildOrganizationNode());
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
        } as any, // Use type assertion to bypass type checking
        children: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Build the tree data structure for a project node
  const buildProjectNode = (project: Project, level = 0, visited: Set<string> = new Set()): MindMapNode => {
    // Prevent circular dependencies by tracking visited nodes
    if (visited.has(project.id)) {
      return {
        id: `${project.id}-circular-${level}`,
        name: `${project.name} (circular ref)`,
        type: 'project',
        status: project.status,
        progress: project.progress,
        attributes: {
          status: project.status,
          progress: `${project.progress}%`
        },
        children: [],
        __type: 'project'
      };
    }
    
    // Add this project to visited set
    visited.add(project.id);
    
    // Create children array for dependencies
    const children: MindMapNode[] = [];
    
    // Add project dependencies
    if (project.dependentProjects && project.dependentProjects.length > 0) {
      project.dependentProjects.forEach(depId => {
        const depProject = projects.find(p => p.id === depId);
        if (depProject) {
          children.push(buildProjectNode(depProject, level + 1, new Set(visited)));
        }
      });
    }
    
    // Find related goals for this project
    goals.forEach(goal => {
      if (goal.linkedProjects && goal.linkedProjects.some(p => p.projectId === project.id)) {
        children.push(buildGoalNode(goal, level + 1, new Set(visited)));
      }
    });
    
    return {
      id: project.id,
      name: project.name,
      type: 'project',
      status: project.status,
      progress: project.progress,
      attributes: {
        status: project.status,
        progress: `${project.progress}%`
      },
      children,
      __type: 'project'
    };
  };

  // Build the tree data structure for a goal node
  const buildGoalNode = (goal: Goal, level = 0, visited: Set<string> = new Set()): MindMapNode => {
    // Prevent circular dependencies
    if (visited.has(goal.id)) {
      return {
        id: `${goal.id}-circular-${level}`,
        name: `${goal.title} (circular ref)`,
        type: 'goal',
        status: goal.status,
        attributes: {
          status: goal.status,
          type: goal.type
        },
        children: [],
        __type: 'goal'
      };
    }
    
    // Mark this goal as visited
    visited.add(goal.id);
    
    // Create children array
    const children: MindMapNode[] = [];
    
    // Add related goals
    if (goal.linkedGoals && goal.linkedGoals.length > 0) {
      goal.linkedGoals.forEach(linkedGoal => {
        const childGoal = goals.find(g => g.id === linkedGoal.goalId);
        if (childGoal) {
          children.push(buildGoalNode(childGoal, level + 1, new Set(visited)));
        }
      });
    }
    
    // Add related projects
    if (goal.linkedProjects && goal.linkedProjects.length > 0) {
      goal.linkedProjects.forEach(linkedProject => {
        const project = projects.find(p => p.id === linkedProject.projectId);
        if (project) {
          children.push(buildProjectNode(project, level + 1, new Set(visited)));
        }
      });
    }
    
    return {
      id: goal.id,
      name: goal.title,
      type: 'goal',
      status: goal.status,
      attributes: {
        status: goal.status,
        type: goal.type
      },
      children,
      __type: 'goal'
    };
  };

  const buildOrganizationNode = (): MindMapNode => {
    const rootNode: MindMapNode = {
      id: 'root',
      name: 'All Projects & Goals',
      type: 'organization',
      attributes: {},
      children: [],
      __type: 'organization'
    };
    
    // Add top-level projects (those without dependencies)
    projects.forEach(project => {
      // Check if the project has dependencies
      const hasNoDependencies = !project.dependentProjects || project.dependentProjects.length === 0;
      if (hasNoDependencies) {
        rootNode.children?.push(buildProjectNode(project));
      }
    });

    // Add top-level goals if we have them
    if (goals && goals.length > 0) {
      goals.forEach(goal => {
        // Only add top-level goals (strategic goals)
        if (goal.type === GoalType.STRATEGIC) {
          rootNode.children?.push(buildGoalNode(goal));
        }
      });
    }
    
    return rootNode;
  };

  if (loading) {
    return <div>Loading mind map...</div>;
  }

  return (
    <div className="mind-map-container">
      <div className="mind-map-controls">
        <button onClick={handleZoomIn}>Zoom In</button>
        <button onClick={handleZoomOut}>Zoom Out</button>
        <button onClick={() => { setZoom(1); setTranslate({ x: 0, y: 0 }); }}>
          Reset View
        </button>
      </div>
      <div className="mind-map-wrapper">
        {treeData && (
          <Tree
            data={treeData}
            orientation="horizontal"
            translate={{ x: 200 + translate.x, y: 200 + translate.y }}
            zoom={zoom}
            nodeSize={{ x: 200, y: 100 }}
            renderCustomNodeElement={CustomNode}
            pathFunc="straight"
            initialDepth={expandAll ? undefined : 1}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectGoalMindMapWrapper; 