import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  TextField,
  Typography,
  Box
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import NoteIcon from '@mui/icons-material/Note';

export interface ViewModalProps {
  open: boolean;
  onClose: () => void;
  onCreateView: (viewData: ViewData) => void;
}

export interface ViewData {
  name: string;
  type: 'mindmap';
  mode: 'tasks' | 'blank';
  isPrivate: boolean;
  isPinned: boolean;
}

const ViewsModal: React.FC<ViewModalProps> = ({ open, onClose, onCreateView }) => {
  const [step, setStep] = useState<'select-type' | 'configure'>('select-type');
  const [viewData, setViewData] = useState<ViewData>({
    name: '',
    type: 'mindmap',
    mode: 'tasks',
    isPrivate: false,
    isPinned: false,
  });

  const handleTypeSelect = (mode: 'tasks' | 'blank') => {
    setViewData(prev => ({ ...prev, mode }));
    setStep('configure');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    
    if (name === 'isPrivate' || name === 'isPinned') {
      setViewData(prev => ({ ...prev, [name]: checked }));
    } else {
      setViewData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCreate = () => {
    onCreateView(viewData);
    onClose();
    // Reset the modal state for future use
    setStep('select-type');
    setViewData({
      name: '',
      type: 'mindmap',
      mode: 'tasks',
      isPrivate: false,
      isPinned: false,
    });
  };

  const handleCancel = () => {
    onClose();
    setStep('select-type');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {step === 'select-type' ? 'Add New View' : 'Configure Mind Map View'}
      </DialogTitle>
      
      <DialogContent>
        {step === 'select-type' ? (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Select View Type
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box 
                sx={{
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: '0.3s',
                  flexBasis: '50%',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    borderColor: 'primary.main',
                  }
                }}
                onClick={() => handleTypeSelect('tasks')}
              >
                <AccountTreeIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Tasks Mode
                </Typography>
                <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                  Create a mind map connected to your tasks
                </Typography>
              </Box>
              
              <Box 
                sx={{
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: '0.3s',
                  flexBasis: '50%',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    borderColor: 'primary.main',
                  }
                }}
                onClick={() => handleTypeSelect('blank')}
              >
                <NoteIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Blank Mode
                </Typography>
                <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                  Create a blank mind map for brainstorming
                </Typography>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="name"
              label="View Name"
              value={viewData.name}
              onChange={handleChange}
              fullWidth
              autoFocus
              required
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={viewData.isPrivate}
                  onChange={handleChange}
                  name="isPrivate"
                />
              }
              label="Private view (only visible to you)"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={viewData.isPinned}
                  onChange={handleChange}
                  name="isPinned"
                />
              }
              label="Pin view (always visible in Views Bar)"
            />
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        {step === 'configure' && (
          <Button 
            onClick={handleCreate} 
            variant="contained" 
            disabled={!viewData.name}
          >
            Create View
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ViewsModal; 