import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Stack,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Add as AddIcon,
  Link as LinkIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  TextFields as TextIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Web as WebIcon,
  FormatColorFill as ColorFillIcon,
  Group as GroupIcon,
  CenterFocusStrong as CenterIcon,
  FileCopy as DuplicateIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import './IdeationCanvas.css';
import { useTranslation } from 'react-i18next';

// Define card types
type CardType = 'text' | 'note' | 'image' | 'webpage' | 'file';

// Define card structure
interface Card {
  id: string;
  type: CardType;
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color?: string;
  url?: string;
  isEditing?: boolean;
}

// Define connection between cards
interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
  color?: string;
}

// Define card group
interface CardGroup {
  id: string;
  name: string;
  cardIds: string[];
  position: { x: number; y: number };
  size: { width: number; height: number };
  color?: string;
}

// Main IdeationCanvas component
const IdeationCanvas: React.FC = () => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [groups, setGroups] = useState<CardGroup[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [selectedConnections, setSelectedConnections] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState<{ start: { x: number; y: number }, end: { x: number; y: number } } | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [colorMenuAnchor, setColorMenuAnchor] = useState<null | HTMLElement>(null);
  const [webUrlDialog, setWebUrlDialog] = useState(false);
  const [webUrl, setWebUrl] = useState('');
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [isCreatingConnection, setIsCreatingConnection] = useState<{ sourceId: string, sourcePos: { x: number, y: number } } | null>(null);
  const [connectionEndPos, setConnectionEndPos] = useState<{ x: number, y: number } | null>(null);
  const [loading, setLoading] = useState(false);

  // Available colors for cards and connections
  const colors = [
    '#f44336', // red
    '#e91e63', // pink
    '#9c27b0', // purple
    '#673ab7', // deep purple
    '#3f51b5', // indigo
    '#2196f3', // blue
    '#03a9f4', // light blue
    '#00bcd4', // cyan
    '#009688', // teal
    '#4caf50', // green
    '#8bc34a', // light green
    '#cddc39', // lime
    '#ffeb3b', // yellow
    '#ffc107', // amber
    '#ff9800', // orange
    '#ff5722', // deep orange
    '#795548', // brown
    '#607d8b'  // blue grey
  ];

  // Handle zoom in
  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 0.1, 2));
  };

  // Handle zoom out
  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom - 0.1, 0.5));
  };

  // Reset view to center
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Generate unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Create a new text card
  const createTextCard = (position: { x: number, y: number }) => {
    const newCard: Card = {
      id: generateId(),
      type: 'text',
      content: '',
      position,
      size: { width: 200, height: 150 },
      isEditing: true
    };
    
    setCards(prevCards => [...prevCards, newCard]);
    setSelectedCards([newCard.id]);
  };

  // Handle mouse down on canvas
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    // Get canvas bounds
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to canvas with zoom and pan
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    
    // Start selection box if no element was clicked directly
    if (e.target === canvasRef.current) {
      // Start selection box
      setSelectionBox({
        start: { x, y },
        end: { x, y }
      });
      
      // Clear selection if not holding shift
      if (!e.shiftKey) {
        setSelectedCards([]);
        setSelectedConnections([]);
        setSelectedGroups([]);
      }
    }

    // Start panning if space key is pressed or middle mouse button
    if (e.buttons === 4 || (e.buttons === 1 && e.currentTarget.classList.contains('panning'))) {
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  // Handle mouse move on canvas
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    // Handle panning
    if (isPanning) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      setPan(prevPan => ({
        x: prevPan.x + dx,
        y: prevPan.y + dy
      }));
      
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }
    
    // Update selection box
    if (selectionBox) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      
      setSelectionBox({
        ...selectionBox,
        end: { x, y }
      });
      
      // Select cards that are inside the selection box
      const selectedIds = cards.filter(card => {
        const minX = Math.min(selectionBox.start.x, x);
        const maxX = Math.max(selectionBox.start.x, x);
        const minY = Math.min(selectionBox.start.y, y);
        const maxY = Math.max(selectionBox.start.y, y);
        
        return (
          card.position.x >= minX &&
          card.position.x + card.size.width <= maxX &&
          card.position.y >= minY &&
          card.position.y + card.size.height <= maxY
        );
      }).map(card => card.id);
      
      setSelectedCards(selectedIds);
    }

    // Update connection line being created
    if (isCreatingConnection) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      
      setConnectionEndPos({ x, y });
    }
  };

  // Handle mouse up on canvas
  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    // End selection box
    if (selectionBox) {
      setSelectionBox(null);
    }
    
    // End panning
    if (isPanning) {
      setIsPanning(false);
    }

    // End connection creation
    if (isCreatingConnection) {
      // Check if mouse is over a card
      const targetCard = cards.find(card => {
        const { x, y } = card.position;
        const { width, height } = card.size;
        
        // Calculate mouse position
        if (!canvasRef.current) return false;
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - pan.x) / zoom;
        const mouseY = (e.clientY - rect.top - pan.y) / zoom;
        
        return (
          mouseX >= x &&
          mouseX <= x + width &&
          mouseY >= y &&
          mouseY <= y + height
        );
      });
      
      // Create connection if target card exists and is not the source card
      if (targetCard && targetCard.id !== isCreatingConnection.sourceId) {
        const newConnection: Connection = {
          id: generateId(),
          sourceId: isCreatingConnection.sourceId,
          targetId: targetCard.id
        };
        
        setConnections(prevConnections => [...prevConnections, newConnection]);
      }
      
      setIsCreatingConnection(null);
      setConnectionEndPos(null);
    }
  };

  // Handle mouse wheel for zooming
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      
      // Zoom in/out
      const delta = -e.deltaY * 0.001;
      const newZoom = Math.max(0.5, Math.min(2, zoom + delta));
      
      setZoom(newZoom);
    }
  };

  // Handle key down events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected elements with Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Make sure we're not in a text field
        if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
          // Delete selected cards
          if (selectedCards.length > 0) {
            setCards(prevCards => prevCards.filter(card => !selectedCards.includes(card.id)));
            
            // Also delete connections connected to these cards
            setConnections(prevConnections => 
              prevConnections.filter(conn => 
                !selectedCards.includes(conn.sourceId) && !selectedCards.includes(conn.targetId)
              )
            );
          }
          
          // Delete selected connections
          if (selectedConnections.length > 0) {
            setConnections(prevConnections => 
              prevConnections.filter(conn => !selectedConnections.includes(conn.id))
            );
          }
          
          // Clear selection
          setSelectedCards([]);
          setSelectedConnections([]);
        }
      }
      
      // Space key for panning
      if (e.code === 'Space' && !e.repeat) {
        if (canvasRef.current) {
          canvasRef.current.classList.add('panning');
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      // Space key release
      if (e.code === 'Space') {
        if (canvasRef.current) {
          canvasRef.current.classList.remove('panning');
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedCards, selectedConnections]);

  // Open context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuAnchor(e.currentTarget as HTMLElement);
  };

  // Close context menu
  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  // Create new text card from menu
  const handleAddTextCard = () => {
    if (!canvasRef.current) return;
    
    // Calculate position relative to canvas
    const rect = canvasRef.current.getBoundingClientRect();
    const position = {
      x: ((menuAnchor?.getBoundingClientRect().left || rect.left) - rect.left - pan.x) / zoom,
      y: ((menuAnchor?.getBoundingClientRect().top || rect.top) - rect.top - pan.y) / zoom
    };
    
    createTextCard(position);
    handleMenuClose();
  };

  // Open web URL dialog
  const handleAddWebPage = () => {
    setWebUrlDialog(true);
    handleMenuClose();
  };

  // Create web page card
  const handleWebUrlConfirm = () => {
    if (!canvasRef.current || !webUrl) return;
    
    // Calculate position relative to canvas
    const rect = canvasRef.current.getBoundingClientRect();
    const position = {
      x: ((menuAnchor?.getBoundingClientRect().left || rect.left) - rect.left - pan.x) / zoom,
      y: ((menuAnchor?.getBoundingClientRect().top || rect.top) - rect.top - pan.y) / zoom
    };
    
    const newCard: Card = {
      id: generateId(),
      type: 'webpage',
      content: webUrl,
      position,
      size: { width: 320, height: 240 },
      url: webUrl
    };
    
    setCards(prevCards => [...prevCards, newCard]);
    setSelectedCards([newCard.id]);
    
    // Reset and close dialog
    setWebUrl('');
    setWebUrlDialog(false);
  };

  // Handle card drag
  const handleCardMouseDown = (e: React.MouseEvent, card: Card) => {
    e.stopPropagation();
    
    // Select card if not already selected
    if (!selectedCards.includes(card.id)) {
      if (!e.shiftKey) {
        setSelectedCards([card.id]);
        setSelectedConnections([]);
      } else {
        setSelectedCards(prev => [...prev, card.id]);
      }
    }
    
    // Start dragging
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // Handle card drag move
  const handleCardMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !canvasRef.current) return;
    
    const dx = (e.clientX - dragStart.x) / zoom;
    const dy = (e.clientY - dragStart.y) / zoom;
    
    // Update card positions
    setCards(prevCards => 
      prevCards.map(card => {
        if (selectedCards.includes(card.id)) {
          return {
            ...card,
            position: {
              x: card.position.x + dx,
              y: card.position.y + dy
            }
          };
        }
        return card;
      })
    );
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // Handle card drag end
  const handleCardMouseUp = () => {
    setIsDragging(false);
  };

  // Start creating a connection from a card
  const handleStartConnection = (e: React.MouseEvent, card: Card) => {
    e.stopPropagation();
    
    if (!canvasRef.current) return;
    
    // Calculate start position of the connection
    const rect = canvasRef.current.getBoundingClientRect();
    const cardCenterX = (card.position.x + card.size.width / 2) * zoom + pan.x;
    const cardCenterY = (card.position.y + card.size.height / 2) * zoom + pan.y;
    
    setIsCreatingConnection({
      sourceId: card.id,
      sourcePos: { x: cardCenterX, y: cardCenterY }
    });
    
    // Set initial end position to the same as start
    setConnectionEndPos({ x: cardCenterX, y: cardCenterY });
  };

  // Handle card edit
  const handleEditCard = (card: Card, content: string) => {
    setCards(prevCards => 
      prevCards.map(c => {
        if (c.id === card.id) {
          return {
            ...c,
            content,
            isEditing: false
          };
        }
        return c;
      })
    );
  };

  // Render the cards
  const renderCards = () => {
    return cards.map(card => {
      const isSelected = selectedCards.includes(card.id);
      
      return (
        <div
          key={card.id}
          className={`ideation-card ${card.type} ${isSelected ? 'selected' : ''}`}
          style={{
            left: card.position.x,
            top: card.position.y,
            width: card.size.width,
            height: card.size.height,
            backgroundColor: card.color || '#ffffff',
            transform: `scale(${zoom})`
          }}
          onMouseDown={(e) => handleCardMouseDown(e, card)}
        >
          {card.isEditing ? (
            <textarea
              autoFocus
              className="card-editor"
              value={card.content}
              onChange={(e) => {
                setCards(prevCards => 
                  prevCards.map(c => {
                    if (c.id === card.id) {
                      return { ...c, content: e.target.value };
                    }
                    return c;
                  })
                );
              }}
              onBlur={() => handleEditCard(card, card.content)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleEditCard(card, card.content);
                }
              }}
            />
          ) : (
            <>
              <div className="card-content">
                {card.type === 'webpage' ? (
                  <iframe src={card.url} title={card.content} width="100%" height="100%" />
                ) : (
                  <div className="text-content">{card.content}</div>
                )}
              </div>
              <div className="card-actions">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCards(prevCards => 
                      prevCards.map(c => {
                        if (c.id === card.id) {
                          return { ...c, isEditing: true };
                        }
                        return c;
                      })
                    );
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => handleStartConnection(e, card)}
                >
                  <LinkIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentCard(card);
                    setColorMenuAnchor(e.currentTarget);
                  }}
                >
                  <PaletteIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Delete card and its connections
                    setCards(prevCards => prevCards.filter(c => c.id !== card.id));
                    setConnections(prevConnections => 
                      prevConnections.filter(conn => 
                        conn.sourceId !== card.id && conn.targetId !== card.id
                      )
                    );
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </div>
            </>
          )}
          <div 
            className="resize-handle"
            onMouseDown={(e) => {
              e.stopPropagation();
              // Handle resize logic
            }}
          />
        </div>
      );
    });
  };

  // Render connections between cards
  const renderConnections = () => {
    return connections.map(connection => {
      const sourceCard = cards.find(card => card.id === connection.sourceId);
      const targetCard = cards.find(card => card.id === connection.targetId);
      
      if (!sourceCard || !targetCard) return null;
      
      // Calculate connection points
      const sourceX = sourceCard.position.x + sourceCard.size.width / 2;
      const sourceY = sourceCard.position.y + sourceCard.size.height / 2;
      const targetX = targetCard.position.x + targetCard.size.width / 2;
      const targetY = targetCard.position.y + targetCard.size.height / 2;
      
      return (
        <svg
          key={connection.id}
          className={`connection ${selectedConnections.includes(connection.id) ? 'selected' : ''}`}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          <line
            x1={sourceX}
            y1={sourceY}
            x2={targetX}
            y2={targetY}
            stroke={connection.color || '#888'}
            strokeWidth={2 / zoom}
            markerEnd="url(#arrowhead)"
          />
          {connection.label && (
            <text
              x={(sourceX + targetX) / 2}
              y={(sourceY + targetY) / 2 - 5}
              fill={connection.color || '#888'}
              fontSize={12 / zoom}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ pointerEvents: 'auto' }}
            >
              {connection.label}
            </text>
          )}
        </svg>
      );
    });
  };

  // Render temporary connection being created
  const renderTempConnection = () => {
    if (!isCreatingConnection || !connectionEndPos) return null;
    
    const sourceCard = cards.find(card => card.id === isCreatingConnection.sourceId);
    if (!sourceCard) return null;
    
    // Calculate source position
    const sourceX = sourceCard.position.x + sourceCard.size.width / 2;
    const sourceY = sourceCard.position.y + sourceCard.size.height / 2;
    
    return (
      <svg
        className="temp-connection"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
        }}
      >
        <line
          x1={sourceX}
          y1={sourceY}
          x2={connectionEndPos.x / zoom}
          y2={connectionEndPos.y / zoom}
          stroke="#aaa"
          strokeWidth={2 / zoom}
          strokeDasharray={`${4 / zoom},${4 / zoom}`}
        />
      </svg>
    );
  };

  // Render selection box
  const renderSelectionBox = () => {
    if (!selectionBox) return null;
    
    const { start, end } = selectionBox;
    
    const left = Math.min(start.x, end.x);
    const top = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    
    return (
      <div
        className="selection-box"
        style={{
          position: 'absolute',
          left,
          top,
          width,
          height,
          border: '1px dashed #3f51b5',
          backgroundColor: 'rgba(63, 81, 181, 0.1)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Paper sx={{ p: 1, mb: 1, display: 'flex', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1}>
          <Tooltip title={t('ideation.addTextCard')}>
            <IconButton onClick={() => handleAddTextCard()}>
              <TextIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('ideation.addWebPage')}>
            <IconButton onClick={() => handleAddWebPage()}>
              <WebIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        
        <Stack direction="row" spacing={1}>
          <Tooltip title={t('ideation.zoomIn')}>
            <IconButton onClick={handleZoomIn}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('ideation.zoomOut')}>
            <IconButton onClick={handleZoomOut}>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('ideation.resetView')}>
            <IconButton onClick={handleResetView}>
              <CenterIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>
      
      {/* Canvas */}
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#f5f5f5',
          cursor: isPanning ? 'grabbing' : 'default',
          border: '1px solid #e0e0e0',
          borderRadius: 1
        }}
      >
        <div
          ref={canvasRef}
          className={`ideation-canvas ${isPanning ? 'panning' : ''}`}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            transform: `translate(${pan.x}px, ${pan.y}px)`
          }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onWheel={handleWheel}
          onContextMenu={handleContextMenu}
        >
          {/* SVG defs for markers */}
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <defs>
              <marker
                id="arrowhead"
                markerWidth={10}
                markerHeight={7}
                refX={10}
                refY={3.5}
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#888" />
              </marker>
            </defs>
          </svg>
          
          {renderCards()}
          {renderConnections()}
          {renderTempConnection()}
          {renderSelectionBox()}
        </div>
        
        {/* Loading indicator */}
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 100
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </Box>
      
      {/* Context menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleAddTextCard}>
          <TextIcon fontSize="small" sx={{ mr: 1 }} />
          {t('ideation.addTextCard')}
        </MenuItem>
        <MenuItem onClick={handleAddWebPage}>
          <WebIcon fontSize="small" sx={{ mr: 1 }} />
          {t('ideation.addWebPage')}
        </MenuItem>
      </Menu>
      
      {/* Color menu */}
      <Menu
        anchorEl={colorMenuAnchor}
        open={Boolean(colorMenuAnchor)}
        onClose={() => setColorMenuAnchor(null)}
      >
        <Box sx={{ p: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 220 }}>
          {colors.map(color => (
            <div
              key={color}
              style={{
                width: 30,
                height: 30,
                backgroundColor: color,
                borderRadius: 4,
                cursor: 'pointer'
              }}
              onClick={() => {
                if (currentCard) {
                  setCards(prevCards => 
                    prevCards.map(c => {
                      if (c.id === currentCard.id) {
                        return { ...c, color };
                      }
                      return c;
                    })
                  );
                }
                setColorMenuAnchor(null);
              }}
            />
          ))}
        </Box>
      </Menu>
      
      {/* Web URL dialog */}
      <Dialog open={webUrlDialog} onClose={() => setWebUrlDialog(false)}>
        <DialogTitle>{t('ideation.addWebPage')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('ideation.enterURL')}
            type="url"
            fullWidth
            value={webUrl}
            onChange={(e) => setWebUrl(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWebUrlDialog(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleWebUrlConfirm} disabled={!webUrl}>{t('common.add')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IdeationCanvas; 