import React, { useState, useRef, useEffect } from 'react';
import './MindMap.css';

const initialNodes = [
  {
    id: 1,
    text: 'Project Planning',
    x: 400,
    y: 150,
    type: 'main',
    color: '#7b68ee'
  },
  {
    id: 2,
    text: 'Requirements',
    x: 200,
    y: 80,
    type: 'sub',
    color: '#64b5f6'
  },
  {
    id: 3,
    text: 'Design',
    x: 200,
    y: 220,
    type: 'sub',
    color: '#4caf50'
  },
  {
    id: 4,
    text: 'Development',
    x: 600,
    y: 80,
    type: 'sub',
    color: '#ff9800'
  },
  {
    id: 5,
    text: 'Testing',
    x: 600,
    y: 220,
    type: 'sub',
    color: '#e57373'
  },
  {
    id: 6,
    text: 'User Stories',
    x: 80,
    y: 40,
    type: 'sub-sub',
    color: '#64b5f6'
  },
  {
    id: 7,
    text: 'Technical Specs',
    x: 80,
    y: 120,
    type: 'sub-sub',
    color: '#64b5f6'
  },
  {
    id: 8,
    text: 'UI Mockups',
    x: 80,
    y: 180,
    type: 'sub-sub',
    color: '#4caf50'
  },
  {
    id: 9,
    text: 'Architecture',
    x: 80,
    y: 260,
    type: 'sub-sub',
    color: '#4caf50'
  }
];

const initialEdges = [
  { from: 1, to: 2 },
  { from: 1, to: 3 },
  { from: 1, to: 4 },
  { from: 1, to: 5 },
  { from: 2, to: 6 },
  { from: 2, to: 7 },
  { from: 3, to: 8 },
  { from: 3, to: 9 }
];

const MindMap = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeEdit, setNodeEdit] = useState({ active: false, text: '' });
  const [dragInfo, setDragInfo] = useState({ active: false, node: null, offset: { x: 0, y: 0 } });
  const [addingEdge, setAddingEdge] = useState({ active: false, from: null });
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  const svgRef = useRef(null);
  const editInputRef = useRef(null);
  
  // Handle node selection
  const handleNodeClick = (node, event) => {
    event.stopPropagation();
    
    if (addingEdge.active) {
      // If we're adding an edge, connect nodes
      if (addingEdge.from !== node.id) {
        const newEdge = { from: addingEdge.from, to: node.id };
        setEdges([...edges, newEdge]);
      }
      setAddingEdge({ active: false, from: null });
      return;
    }
    
    setSelectedNode(node.id);
  };
  
  // Handle double click to edit
  const handleNodeDoubleClick = (node, event) => {
    event.stopPropagation();
    setSelectedNode(node.id);
    setNodeEdit({ active: true, text: node.text });
    
    // Focus on the input after it renders
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
      }
    }, 10);
  };
  
  // Save node edit
  const handleSaveEdit = () => {
    if (selectedNode) {
      const updatedNodes = nodes.map(node => 
        node.id === selectedNode ? { ...node, text: nodeEdit.text } : node
      );
      setNodes(updatedNodes);
      setNodeEdit({ active: false, text: '' });
    }
  };
  
  // Handle keyboard events during edit
  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    }
    if (e.key === 'Escape') {
      setNodeEdit({ active: false, text: '' });
    }
  };
  
  // Start node dragging
  const handleNodeDragStart = (node, event) => {
    if (nodeEdit.active) return;
    
    const svgRect = svgRef.current.getBoundingClientRect();
    const offsetX = (event.clientX - svgRect.left) / scale - node.x;
    const offsetY = (event.clientY - svgRect.top) / scale - node.y;
    
    setDragInfo({
      active: true,
      node: node.id,
      offset: { x: offsetX, y: offsetY }
    });
    
    // Prevent double click while dragging
    event.stopPropagation();
  };
  
  // Handle node dragging
  const handleMouseMove = (event) => {
    if (dragInfo.active) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const mouseX = (event.clientX - svgRect.left) / scale;
      const mouseY = (event.clientY - svgRect.top) / scale;
      
      const updatedNodes = nodes.map(node => 
        node.id === dragInfo.node 
          ? { 
              ...node, 
              x: mouseX - dragInfo.offset.x, 
              y: mouseY - dragInfo.offset.y 
            } 
          : node
      );
      
      setNodes(updatedNodes);
    }
    
    if (isPanning) {
      setPan({
        x: pan.x + (event.clientX - panStart.x) / scale,
        y: pan.y + (event.clientY - panStart.y) / scale
      });
      setPanStart({ x: event.clientX, y: event.clientY });
    }
  };
  
  // End dragging and panning
  const handleMouseUp = () => {
    setDragInfo({ active: false, node: null, offset: { x: 0, y: 0 } });
    setIsPanning(false);
  };
  
  // Start pan
  const handleMouseDown = (event) => {
    if (event.button === 1 || (event.button === 0 && event.altKey)) {
      setIsPanning(true);
      setPanStart({ x: event.clientX, y: event.clientY });
      event.preventDefault();
    }
  };
  
  // Add a new node
  const handleAddNode = () => {
    const centerX = 400;
    const centerY = 200;
    
    const newNode = {
      id: nodes.length + 1,
      text: 'New Node',
      x: centerX,
      y: centerY,
      type: 'sub',
      color: '#64b5f6'
    };
    
    setNodes([...nodes, newNode]);
    setSelectedNode(newNode.id);
  };
  
  // Delete selected node
  const handleDeleteNode = () => {
    if (!selectedNode) return;
    
    const filteredNodes = nodes.filter(node => node.id !== selectedNode);
    const filteredEdges = edges.filter(edge => 
      edge.from !== selectedNode && edge.to !== selectedNode
    );
    
    setNodes(filteredNodes);
    setEdges(filteredEdges);
    setSelectedNode(null);
  };
  
  // Start adding edge
  const handleStartAddEdge = () => {
    if (!selectedNode) return;
    setAddingEdge({ active: true, from: selectedNode });
  };
  
  // Change node color
  const handleColorChange = (color) => {
    if (!selectedNode) return;
    
    const updatedNodes = nodes.map(node => 
      node.id === selectedNode ? { ...node, color } : node
    );
    
    setNodes(updatedNodes);
  };
  
  // Clear selection on background click
  const handleBackgroundClick = () => {
    setSelectedNode(null);
    setAddingEdge({ active: false, from: null });
  };
  
  // Zoom in/out
  const handleZoom = (factor) => {
    setScale(Math.max(0.5, Math.min(2, scale * factor)));
  };
  
  // Reset view
  const handleResetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };
  
  // Mouse wheel zoom
  const handleWheel = (event) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
      setScale(Math.max(0.5, Math.min(2, scale * zoomFactor)));
    }
  };
  
  // Set up event listeners
  useEffect(() => {
    const svg = svgRef.current;
    
    svg.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      svg.removeEventListener('wheel', handleWheel);
    };
  }, [scale]);
  
  return (
    <div className="mind-map-page">
      <div className="page-header">
        <h1>Mind Map</h1>
        <div className="toolbar">
          <button onClick={handleAddNode} title="Add Node">
            + Add Node
          </button>
          <button 
            onClick={handleDeleteNode}
            disabled={!selectedNode}
            title="Delete Node"
            className={selectedNode ? '' : 'disabled'}
          >
            Delete
          </button>
          <button 
            onClick={handleStartAddEdge}
            disabled={!selectedNode}
            title="Add Connection"
            className={`${selectedNode ? '' : 'disabled'} ${addingEdge.active ? 'active' : ''}`}
          >
            Connect
          </button>
          <div className="color-selector">
            <span>Color:</span>
            <div 
              className={`color-swatch ${!selectedNode ? 'disabled' : ''}`}
              style={{ backgroundColor: '#7b68ee' }}
              onClick={() => handleColorChange('#7b68ee')}
            />
            <div 
              className={`color-swatch ${!selectedNode ? 'disabled' : ''}`}
              style={{ backgroundColor: '#64b5f6' }}
              onClick={() => handleColorChange('#64b5f6')}
            />
            <div 
              className={`color-swatch ${!selectedNode ? 'disabled' : ''}`}
              style={{ backgroundColor: '#4caf50' }}
              onClick={() => handleColorChange('#4caf50')}
            />
            <div 
              className={`color-swatch ${!selectedNode ? 'disabled' : ''}`}
              style={{ backgroundColor: '#ff9800' }}
              onClick={() => handleColorChange('#ff9800')}
            />
            <div 
              className={`color-swatch ${!selectedNode ? 'disabled' : ''}`}
              style={{ backgroundColor: '#e57373' }}
              onClick={() => handleColorChange('#e57373')}
            />
          </div>
          <div className="zoom-controls">
            <button onClick={() => handleZoom(0.9)} title="Zoom Out">−</button>
            <span>{Math.round(scale * 100)}%</span>
            <button onClick={() => handleZoom(1.1)} title="Zoom In">+</button>
            <button onClick={handleResetView} title="Reset View">Reset</button>
          </div>
        </div>
      </div>
      
      <div className="mind-map-container">
        <svg 
          ref={svgRef}
          className="mind-map-svg" 
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseDown={handleMouseDown}
          onClick={handleBackgroundClick}
        >
          <g transform={`scale(${scale}) translate(${pan.x}, ${pan.y})`}>
            {/* Draw edges */}
            {edges.map((edge, index) => {
              const fromNode = nodes.find(n => n.id === edge.from);
              const toNode = nodes.find(n => n.id === edge.to);
              
              if (!fromNode || !toNode) return null;
              
              return (
                <line
                  key={`edge-${index}`}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="#888"
                  strokeWidth="2"
                  strokeDasharray={addingEdge.active && edge.from === addingEdge.from ? "5,5" : "none"}
                />
              );
            })}
            
            {/* Draw in-progress edge when adding */}
            {addingEdge.active && selectedNode && (
              <line
                x1={nodes.find(n => n.id === addingEdge.from)?.x || 0}
                y1={nodes.find(n => n.id === addingEdge.from)?.y || 0}
                x2={dragInfo.active ? (
                  (nodes.find(n => n.id === dragInfo.node)?.x || 0)
                ) : (
                  (nodes.find(n => n.id === selectedNode)?.x || 0)
                )}
                y2={dragInfo.active ? (
                  (nodes.find(n => n.id === dragInfo.node)?.y || 0)
                ) : (
                  (nodes.find(n => n.id === selectedNode)?.y || 0)
                )}
                stroke="#888"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            )}
            
            {/* Draw nodes */}
            {nodes.map(node => (
              <g 
                key={`node-${node.id}`}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={(e) => handleNodeClick(node, e)}
                onDoubleClick={(e) => handleNodeDoubleClick(node, e)}
                onMouseDown={(e) => handleNodeDragStart(node, e)}
                className={`node ${selectedNode === node.id ? 'selected' : ''}`}
              >
                <ellipse
                  cx="0"
                  cy="0"
                  rx={node.type === 'main' ? 100 : (node.type === 'sub' ? 80 : 60)}
                  ry="30"
                  fill={node.color || '#ccc'}
                  stroke={selectedNode === node.id ? '#333' : 'transparent'}
                  strokeWidth="2"
                />
                
                {nodeEdit.active && selectedNode === node.id ? (
                  <foreignObject
                    x="-90"
                    y="-15"
                    width="180"
                    height="30"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      ref={editInputRef}
                      type="text"
                      value={nodeEdit.text}
                      onChange={(e) => setNodeEdit({ ...nodeEdit, text: e.target.value })}
                      onKeyDown={handleEditKeyDown}
                      onBlur={handleSaveEdit}
                      className="node-edit-input"
                    />
                  </foreignObject>
                ) : (
                  <text
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fill="white"
                    fontSize={node.type === 'main' ? 16 : 14}
                    fontWeight={node.type === 'main' ? 'bold' : 'normal'}
                  >
                    {node.text}
                  </text>
                )}
              </g>
            ))}
          </g>
        </svg>
      </div>
      
      {addingEdge.active && (
        <div className="edge-instruction">
          Click on another node to create a connection. Press ESC to cancel.
        </div>
      )}
    </div>
  );
};

export default MindMap; 