import React, { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { clearSelection, selectCard, selectGroup } from '../../store/slices/canvasSlice';
import useCanvasViewport from '../../hooks/canvas/useCanvasViewport';
import { Box, TextField, Popover, List, ListItem, ListItemText, Typography, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';

const SearchContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  width: '300px',
  zIndex: 100,
}));

const SearchResultItem = styled(ListItem)(({ theme }) => ({
  cursor: 'pointer',
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

/**
 * Canvas Search Component
 * 
 * Provides search functionality within the canvas:
 * - Search for cards by title and content
 * - Search for groups by title
 * - Click on results to navigate to the item
 */
const CanvasSearch: React.FC = () => {
  const dispatch = useDispatch();
  const { cards, groups } = useSelector((state: RootState) => state.canvas);
  const { fitToContent } = useCanvasViewport();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{
    id: string;
    type: 'card' | 'group';
    title: string;
    content?: string;
  }[]>([]);
  
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl) && searchResults.length > 0;
  
  // Perform search when the search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const results: {
      id: string;
      type: 'card' | 'group';
      title: string;
      content?: string;
    }[] = [];
    
    // Search in cards
    Object.values(cards).forEach(card => {
      const title = card.data?.title?.toLowerCase() || '';
      const content = card.data?.content?.toLowerCase() || '';
      
      if (title.includes(term) || content.includes(term)) {
        results.push({
          id: card.id,
          type: 'card',
          title: card.data?.title || 'Untitled Card',
          content: card.data?.content
        });
      }
    });
    
    // Search in groups
    Object.values(groups).forEach(group => {
      const title = group.title.toLowerCase();
      
      if (title.includes(term)) {
        results.push({
          id: group.id,
          type: 'group',
          title: group.title
        });
      }
    });
    
    setSearchResults(results);
  }, [searchTerm, cards, groups]);
  
  // Handle search field focus
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle search field blur
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Handle clicking on a search result
  const handleResultClick = useCallback((result: {
    id: string;
    type: 'card' | 'group';
  }) => {
    dispatch(clearSelection());
    
    if (result.type === 'card') {
      dispatch(selectCard(result.id));
      
      // Find the card and fit to it
      const card = cards[result.id];
      if (card) {
        fitToContent({
          minX: card.position.x,
          minY: card.position.y,
          maxX: card.position.x + card.size.width,
          maxY: card.position.y + card.size.height
        }, 50);
      }
    } else if (result.type === 'group') {
      dispatch(selectGroup(result.id));
      
      // Find the group and fit to it
      const group = groups[result.id];
      if (group) {
        fitToContent({
          minX: group.position.x,
          minY: group.position.y,
          maxX: group.position.x + group.size.width,
          maxY: group.position.y + group.size.height
        }, 50);
      }
    }
    
    handleClose();
  }, [dispatch, cards, groups, fitToContent]);
  
  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
  };
  
  return (
    <SearchContainer>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search canvas..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={handleFocus}
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: searchTerm ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleClearSearch}
                edge="end"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
          sx: { borderRadius: 20, backgroundColor: theme => theme.palette.background.paper }
        }}
      />
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: { width: '300px', maxHeight: '400px', mt: 1 }
        }}
      >
        <List>
          {searchResults.length === 0 ? (
            <ListItem>
              <ListItemText primary="No results found." />
            </ListItem>
          ) : (
            <>
              <ListItem>
                <Typography variant="subtitle2" color="text.secondary">
                  {searchResults.length} results found
                </Typography>
              </ListItem>
              
              {searchResults.map((result) => (
                <SearchResultItem
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                >
                  <ListItemText
                    primary={result.title}
                    secondary={result.type === 'card' ? (
                      result.content && result.content.length > 40
                        ? `${result.content.substring(0, 40)}...`
                        : result.content
                    ) : `Group with ${groups[result.id]?.cardIds.length || 0} cards`}
                    primaryTypographyProps={{
                      fontWeight: 500,
                    }}
                  />
                </SearchResultItem>
              ))}
            </>
          )}
        </List>
      </Popover>
    </SearchContainer>
  );
};

export default CanvasSearch; 