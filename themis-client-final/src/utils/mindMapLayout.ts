interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface Node {
  id: string;
  position: Position;
  size: Size;
  data: any;
}

interface Connection {
  id: string;
  fromId: string;
  toId: string;
  data: any;
}

/**
 * Arranges nodes in a radial layout around a center node
 * 
 * @param nodes - Array of nodes to arrange
 * @param connections - Array of connections between nodes
 * @param centerNodeId - ID of the node to use as center
 * @param radius - Base radius for the layout
 * @param startAngle - Starting angle in radians
 * @param endAngle - Ending angle in radians
 * @returns Array of nodes with updated positions
 */
export function radialLayout(
  nodes: Node[],
  connections: Connection[],
  centerNodeId: string,
  radius = 300,
  startAngle = 0,
  endAngle = 2 * Math.PI
): Node[] {
  const centerNode = nodes.find(n => n.id === centerNodeId);
  if (!centerNode) return nodes;
  
  // Create a copy of the nodes to modify
  const resultNodes = [...nodes];
  
  // Find all connections from the center node
  const directConnections: { nodeId: string, connection: Connection }[] = [];
  
  connections.forEach(conn => {
    if (conn.fromId === centerNodeId) {
      directConnections.push({ nodeId: conn.toId, connection: conn });
    } else if (conn.toId === centerNodeId) {
      directConnections.push({ nodeId: conn.fromId, connection: conn });
    }
  });
  
  // If there are no direct connections, return the original nodes
  if (directConnections.length === 0) return nodes;
  
  // Calculate angle step between nodes
  const angleStep = (endAngle - startAngle) / directConnections.length;
  
  // Position directly connected nodes around center
  directConnections.forEach((conn, index) => {
    const node = resultNodes.find(n => n.id === conn.nodeId);
    if (!node) return;
    
    // Calculate position on a circle
    const angle = startAngle + (index * angleStep);
    node.position = {
      x: centerNode.position.x + radius * Math.cos(angle),
      y: centerNode.position.y + radius * Math.sin(angle)
    };
    
    // Recursively layout second-level connections for this node
    positionChildNodes(
      resultNodes,
      connections,
      node.id,
      centerNodeId,
      2,
      angle - (angleStep / 4),
      angle + (angleStep / 4),
      radius * 0.8
    );
  });
  
  return resultNodes;
}

/**
 * Recursively position child nodes in a hierarchical layout
 * 
 * @param nodes - All nodes
 * @param connections - All connections
 * @param nodeId - Current node ID
 * @param excludeNodeId - Node ID to exclude from connections
 * @param maxDepth - Maximum depth for recursion
 * @param startAngle - Starting angle for child layout
 * @param endAngle - Ending angle for child layout
 * @param radius - Radius for child layout
 * @param currentDepth - Current recursion depth
 */
function positionChildNodes(
  nodes: Node[],
  connections: Connection[],
  nodeId: string,
  excludeNodeId: string,
  maxDepth = 3,
  startAngle = 0,
  endAngle = 2 * Math.PI,
  radius = 200,
  currentDepth = 1
): void {
  if (currentDepth >= maxDepth) return;
  
  const parentNode = nodes.find(n => n.id === nodeId);
  if (!parentNode) return;
  
  // Find all connections from this node excluding the parent
  const childConnections: { nodeId: string, connection: Connection }[] = [];
  
  connections.forEach(conn => {
    if (conn.fromId === nodeId && conn.toId !== excludeNodeId) {
      childConnections.push({ nodeId: conn.toId, connection: conn });
    } else if (conn.toId === nodeId && conn.fromId !== excludeNodeId) {
      childConnections.push({ nodeId: conn.fromId, connection: conn });
    }
  });
  
  // If there are no child connections, return
  if (childConnections.length === 0) return;
  
  // Calculate angle step between child nodes
  const angleStep = (endAngle - startAngle) / childConnections.length;
  
  // Position child nodes
  childConnections.forEach((conn, index) => {
    const node = nodes.find(n => n.id === conn.nodeId);
    if (!node) return;
    
    // Calculate position on a circle segment
    const angle = startAngle + (index * angleStep) + (angleStep / 2);
    node.position = {
      x: parentNode.position.x + radius * Math.cos(angle),
      y: parentNode.position.y + radius * Math.sin(angle)
    };
    
    // Recursively position next level
    positionChildNodes(
      nodes,
      connections,
      node.id,
      nodeId,
      maxDepth,
      angle - (angleStep / 4),
      angle + (angleStep / 4),
      radius * 0.8,
      currentDepth + 1
    );
  });
}

/**
 * Create mind map layout data for goal-to-goal relationships
 * 
 * @param goals Array of goal objects
 * @param centerGoalId ID of the central goal
 * @returns Object with nodes and connections
 */
export function createGoalMindMap(goals: any[], centerGoalId: string) {
  // Create nodes (one per goal)
  const nodes: Node[] = goals.map(goal => ({
    id: goal.id,
    position: { x: 0, y: 0 }, // Will be set by layout algorithm
    size: { width: 180, height: 80 },
    data: {
      id: goal.id,
      title: goal.title,
      type: 'goal',
      status: goal.status,
      progress: goal.progress,
      category: goal.category
    }
  }));
  
  // Create connections between goals
  const connections: Connection[] = [];
  
  goals.forEach(goal => {
    if (goal.linkedGoals && goal.linkedGoals.length > 0) {
      goal.linkedGoals.forEach((link: any) => {
        // Determine relationship type based on pattern or weight
        let type = 'relatedTo';
        if (Math.random() > 0.6) {
          type = 'supports';
        } else if (Math.random() > 0.5) {
          type = 'supportedBy';
        }
        
        connections.push({
          id: `goal-${goal.id}-${link.goalId}`,
          fromId: goal.id,
          toId: link.goalId,
          data: {
            type,
            weight: link.weight
          }
        });
      });
    }
  });
  
  // Apply layout algorithm
  const positionedNodes = radialLayout(nodes, connections, centerGoalId);
  
  return {
    nodes: positionedNodes,
    connections
  };
}

/**
 * Create mind map layout data for project-to-goal relationships
 * 
 * @param projects Array of project objects
 * @param goals Array of goal objects
 * @param centerNodeId ID of the central node (project or goal)
 * @param centerNodeType Type of the central node ('project' or 'goal')
 * @returns Object with nodes and connections
 */
export function createProjectGoalMindMap(
  projects: any[],
  goals: any[],
  centerNodeId: string,
  centerNodeType: 'project' | 'goal' = 'goal'
) {
  // Create nodes for all projects
  const projectNodes: Node[] = projects.map(project => ({
    id: `project-${project.id}`,
    position: { x: 0, y: 0 }, // Will be set by layout algorithm
    size: { width: 180, height: 80 },
    data: {
      id: project.id,
      title: project.name,
      type: 'project',
      status: project.status,
      progress: project.progress
    }
  }));
  
  // Create nodes for all goals
  const goalNodes: Node[] = goals.map(goal => ({
    id: `goal-${goal.id}`,
    position: { x: 0, y: 0 }, // Will be set by layout algorithm
    size: { width: 180, height: 80 },
    data: {
      id: goal.id,
      title: goal.title,
      type: 'goal',
      status: goal.status,
      progress: goal.progress,
      category: goal.category
    }
  }));
  
  // Combine all nodes
  const allNodes = [...projectNodes, ...goalNodes];
  
  // Create connections between projects and goals
  const connections: Connection[] = [];
  
  // Connect projects to goals
  goals.forEach(goal => {
    if (goal.linkedProjects && goal.linkedProjects.length > 0) {
      goal.linkedProjects.forEach((link: any) => {
        connections.push({
          id: `proj-goal-${link.projectId}-${goal.id}`,
          fromId: `project-${link.projectId}`,
          toId: `goal-${goal.id}`,
          data: {
            type: 'supports',
            weight: link.weight
          }
        });
      });
    }
  });
  
  // Format center node ID to match node format
  const formattedCenterNodeId = centerNodeType === 'project' 
    ? `project-${centerNodeId}` 
    : `goal-${centerNodeId}`;
  
  // Apply layout algorithm
  const positionedNodes = radialLayout(allNodes, connections, formattedCenterNodeId);
  
  return {
    nodes: positionedNodes,
    connections
  };
} 