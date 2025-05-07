import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Breadcrumbs,
  Link,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  FolderOpen as OpenIcon,
  Add as AddIcon,
  Info as InfoIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Canvas from '../components/Canvas';

interface ICanvasFile {
  id: string;
  name: string;
  lastModified: Date;
}

const IdeationPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentCanvas, setCurrentCanvas] = useState<ICanvasFile | null>(null);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [createCanvasDialogOpen, setCreateCanvasDialogOpen] = useState(false);
  const [newCanvasName, setNewCanvasName] = useState('');

  // Handle creating a new canvas
  const handleCreateCanvas = () => {
    if (!newCanvasName.trim()) return;
    
    const newCanvas: ICanvasFile = {
      id: Date.now().toString(),
      name: newCanvasName,
      lastModified: new Date()
    };
    
    setCurrentCanvas(newCanvas);
    setCreateCanvasDialogOpen(false);
    setNewCanvasName('');
  };

  return (
    <Box sx={{ py: 3, px: 2 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          color="inherit" 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
        >
          {t('navigation.home')}
        </Link>
        <Typography color="text.primary">{t('ideation.title', 'Ideation')}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {currentCanvas 
              ? `${currentCanvas.name} - ${t('ideation.canvas')}`
              : t('ideation.title', 'Ideation')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('ideation.description', 'Capture, organize, and connect ideas on an infinite visual canvas.')}
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={1}>
          {!currentCanvas ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateCanvasDialogOpen(true)}
            >
              {t('ideation.createCanvas', 'Create New Canvas')}
            </Button>
          ) : (
            <>
              <Button 
                variant="outlined"
                startIcon={<SaveIcon />}
              >
                {t('common.save')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<OpenIcon />}
              >
                {t('common.open')}
              </Button>
            </>
          )}
          
          <Tooltip title={t('ideation.info', 'About Ideation Canvas')}>
            <IconButton onClick={() => setInfoDialogOpen(true)}>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Instructions panel */}
      {!currentCanvas && (
        <Paper sx={{ mb: 3, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('ideation.gettingStarted', 'Getting Started')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('ideation.canvasIntro', 'Visual note-taking leverages spatial cues—size, position, color, and connecting lines—to reveal relationships that linear notes often hide. Grouping related cards and drawing links helps teams spot patterns, priorities, and gaps at a glance.')}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            {t('ideation.instructions', 'Quick Instructions')}
          </Typography>
          
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Chip 
                label={t('ideation.addContent', 'Add Content')}
                color="primary"
                size="small"
                sx={{ mr: 2, mt: 0.5 }}
              />
              <Typography variant="body2">
                {t('ideation.addContentDesc', 'Double-click empty space or use the toolbar to add text cards, media, and web pages.')}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Chip 
                label={t('ideation.navigate', 'Navigate')}
                color="primary"
                size="small"
                sx={{ mr: 2, mt: 0.5 }}
              />
              <Typography variant="body2">
                {t('ideation.navigateDesc', 'Pan by holding Space + drag or middle mouse button. Zoom with Ctrl/Cmd + wheel or toolbar buttons.')}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Chip 
                label={t('ideation.connect', 'Connect')}
                color="primary"
                size="small"
                sx={{ mr: 2, mt: 0.5 }}
              />
              <Typography variant="body2">
                {t('ideation.connectDesc', 'Click the link button on a card to create connections between ideas. Select connections to delete or edit them.')}
              </Typography>
            </Box>
          </Stack>
          
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setCreateCanvasDialogOpen(true)}
          >
            {t('ideation.getStarted', 'Get Started with a New Canvas')}
          </Button>
        </Paper>
      )}

      {/* Canvas container */}
      {currentCanvas && (
        <Paper sx={{ height: 'calc(100vh - 260px)', minHeight: '500px', mb: 3 }}>
          <Canvas />
        </Paper>
      )}

      {/* Info dialog */}
      <Dialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        maxWidth="md"
      >
        <DialogTitle>{t('ideation.aboutCanvas', 'About Ideation Canvas')}</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>{t('ideation.objective', '1. Objective')}</Typography>
          <Typography paragraph>
            {t('ideation.objectiveDesc', 'Introduce an Ideation tab where users can capture, organize, and connect ideas on an infinite visual canvas.')}
          </Typography>
          
          <Typography variant="h6" gutterBottom>{t('ideation.whyCanvas', '2. Why Canvas?')}</Typography>
          <Typography paragraph>
            {t('ideation.whyCanvasDesc', 'Visual note-taking leverages spatial cues—size, position, color, and connecting lines—to reveal relationships that linear notes often hide. Grouping related cards and drawing links helps teams spot patterns, priorities, and gaps at a glance.')}
          </Typography>
          
          <Typography variant="h6" gutterBottom>{t('ideation.gettingStarted', '3. Getting Started')}</Typography>
          <Typography component="div">
            <ul>
              <li>{t('ideation.getStartedItem1', 'Create a canvas from the button in the header.')}</li>
              <li>{t('ideation.getStartedItem2', 'Double-click the canvas to add text cards.')}</li>
              <li>{t('ideation.getStartedItem3', 'Use the toolbar to add different types of content.')}</li>
            </ul>
          </Typography>
          
          <Typography variant="h6" gutterBottom>{t('ideation.addingContent', '4. Adding Content')}</Typography>
          <Typography component="div">
            <ul>
              <li>{t('ideation.contentItem1', 'Text card – Double-click empty space or use the text icon in the toolbar.')}</li>
              <li>{t('ideation.contentItem2', 'Web page – Click the web icon in the toolbar and enter a URL.')}</li>
              <li>{t('ideation.contentItem3', 'Media – Coming soon: ability to add images and other media types.')}</li>
            </ul>
          </Typography>
          
          <Typography variant="h6" gutterBottom>{t('ideation.advanced', '5. Advanced Features')}</Typography>
          <Typography paragraph>
            {t('ideation.advancedDesc', 'Coming soon: Collaboration features to enable real-time co-ideation, card grouping, and canvas export/import capabilities.')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoDialogOpen(false)}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
      
      {/* Create canvas dialog */}
      <Dialog
        open={createCanvasDialogOpen}
        onClose={() => setCreateCanvasDialogOpen(false)}
      >
        <DialogTitle>{t('ideation.createNew', 'Create New Canvas')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('ideation.canvasName', 'Canvas Name')}
            fullWidth
            value={newCanvasName}
            onChange={(e) => setNewCanvasName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateCanvasDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button 
            onClick={handleCreateCanvas}
            disabled={!newCanvasName.trim()}
          >
            {t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IdeationPage; 