import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Tabs,
  Tab,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilePresent as DocumentIcon,
  Image as ImageIcon,
  UploadFile as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Description as DescriptionIcon,
  Folder as FolderIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Project } from '../types';
import { formatDate } from '../utils/helpers';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`repository-tabpanel-${index}`}
      aria-labelledby={`repository-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Mock data for repository items
interface RepositoryItem {
  id: string;
  name: string;
  description: string;
  type: 'document' | 'image' | 'template' | 'policy';
  category: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  size: string;
  downloadUrl: string;
  tags: string[];
  projectId?: string;
  projectName?: string;
}

const CentralRepositoryPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get tab from URL query parameter or from location state
  const getInitialTabValue = () => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    
    if (tabParam !== null) {
      const tabValue = parseInt(tabParam);
      return isNaN(tabValue) ? 0 : tabValue;
    }
    
    return location.state?.activeTab ?? 0;
  };

  const [projects, setProjects] = useState<Project[]>([]);
  const [documents, setDocuments] = useState<RepositoryItem[]>([]);
  const [templates, setTemplates] = useState<RepositoryItem[]>([]);
  const [policies, setPolicies] = useState<RepositoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get the initial tab value from URL or location state
  const [tabValue, setTabValue] = useState(getInitialTabValue());

  // Dialog states
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RepositoryItem | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newItemData, setNewItemData] = useState({
    name: '',
    description: '',
    type: 'document',
    category: 'general',
    tags: '',
    projectId: ''
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.projects.getAllProjects('');
      if (response.data) {
        const allProjects = response.data;
        setProjects(allProjects);

        // Create mock repository data
        const categories = ['Planning', 'Execution', 'Monitoring', 'General', 'Technical', 'Business'];
        const fileTypes = ['pdf', 'docx', 'xlsx', 'pptx', 'txt', 'jpg', 'png'];
        const documentNames = [
          'Project Charter', 'Requirements Document', 'Technical Specification',
          'Status Report', 'Risk Assessment', 'Change Request Form',
          'Meeting Minutes', 'Budget Forecast', 'Timeline Document',
          'Stakeholder Analysis'
        ];
        const policyNames = [
          'Project Management Policy', 'Change Management Process',
          'Project Governance Framework', 'Risk Management Guidelines',
          'Quality Assurance Standards', 'Documentation Standards',
          'Project Closure Process', 'Communication Guidelines'
        ];
        const templateNames = [
          'Project Plan Template', 'Status Report Template',
          'Risk Register Template', 'Change Request Template',
          'Meeting Minutes Template', 'Project Charter Template',
          'Resource Allocation Template', 'Budget Template'
        ];
        
        const createMockItem = (
          name: string, 
          type: 'document' | 'image' | 'template' | 'policy',
          project?: Project
        ): RepositoryItem => {
          const now = new Date();
          const createdDate = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000);
          const category = categories[Math.floor(Math.random() * categories.length)];
          const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
          const fileSize = `${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * 90) + 10} MB`;
          
          return {
            id: `repo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: name,
            description: `This is a ${type} used for project management. It helps with organization and standardization.`,
            type,
            category,
            createdAt: createdDate.toISOString(),
            updatedAt: new Date(createdDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: 'System Administrator',
            size: fileSize,
            downloadUrl: `#download-mock-${type}-${name.toLowerCase().replace(/\s+/g, '-')}`,
            tags: [category, type, fileType, project?.department?.name || 'General'],
            projectId: project?.id,
            projectName: project?.name
          };
        };
        
        // Create documents linked to projects
        const documentItems: RepositoryItem[] = [];
        allProjects.forEach((project: Project, index: number) => {
          const numDocs = Math.floor(Math.random() * 3) + 1;
          for (let i = 0; i < numDocs; i++) {
            const docName = `${project.name} - ${documentNames[Math.floor(Math.random() * documentNames.length)]}`;
            documentItems.push(createMockItem(docName, 'document', project));
          }
        });
        
        // Create global templates
        const templateItems: RepositoryItem[] = templateNames.map(name => 
          createMockItem(name, 'template')
        );
        
        // Create global policies
        const policyItems: RepositoryItem[] = policyNames.map(name => 
          createMockItem(name, 'policy')
        );
        
        setDocuments(documentItems);
        setTemplates(templateItems);
        setPolicies(policyItems);
      } else {
        setError('Failed to fetch projects');
      }
    } catch (err) {
      setError('An error occurred while fetching data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  // Update URL when tab changes
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    navigate(`/repository${newValue > 0 ? `?tab=${newValue}` : ''}`, { replace: true });
  };

  const handleViewProject = (projectId?: string) => {
    if (projectId) {
      navigate(`/projects/${projectId}`);
    }
  };

  const handleOpenDetailsDialog = (item: RepositoryItem) => {
    setSelectedItem(item);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setSelectedItem(null);
  };

  const handleOpenUploadDialog = () => {
    setUploadDialogOpen(true);
    if (projects.length > 0) {
      setNewItemData({
        ...newItemData,
        projectId: projects[0].id
      });
    }
  };

  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
    setNewItemData({
      name: '',
      description: '',
      type: 'document',
      category: 'general',
      tags: '',
      projectId: ''
    });
    setFile(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      
      // Auto-fill name field if it's empty
      if (!newItemData.name) {
        const fileName = selectedFile.name.replace(/\.[^/.]+$/, ""); // Remove extension
        setNewItemData({
          ...newItemData,
          name: fileName
        });
      }
    }
  };

  const handleUpload = () => {
    // In a real application, this would call an API to upload the file
    // For now, we'll simulate it by adding to our local state
    
    const { name, description, type, category, tags, projectId } = newItemData;
    
    if (!name || !description || !file) {
      setError('Please fill in all required fields and select a file');
      return;
    }
    
    const now = new Date();
    const selectedProject = projectId ? projects.find(p => p.id === projectId) : undefined;
    
    const newItem: RepositoryItem = {
      id: `repo-new-${Date.now()}`,
      name,
      description,
      type: type as 'document' | 'image' | 'template' | 'policy',
      category,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      createdBy: `${user?.firstName} ${user?.lastName}`,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      downloadUrl: `#download-mock-${type}-${name.toLowerCase().replace(/\s+/g, '-')}`,
      tags: tags.split(',').map(tag => tag.trim()),
      projectId: selectedProject?.id,
      projectName: selectedProject?.name
    };
    
    // Add to appropriate list
    if (type === 'document') {
      setDocuments(prev => [newItem, ...prev]);
    } else if (type === 'template') {
      setTemplates(prev => [newItem, ...prev]);
    } else if (type === 'policy') {
      setPolicies(prev => [newItem, ...prev]);
    }
    
    // Close dialog
    handleCloseUploadDialog();
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filterItems = (items: RepositoryItem[]) => {
    if (!searchQuery) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.description.toLowerCase().includes(query) || 
      item.category.toLowerCase().includes(query) || 
      item.tags.some(tag => tag.toLowerCase().includes(query)) ||
      (item.projectName && item.projectName.toLowerCase().includes(query))
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <DocumentIcon fontSize="small" />;
      case 'image':
        return <ImageIcon fontSize="small" />;
      case 'template':
        return <DescriptionIcon fontSize="small" />;
      case 'policy':
        return <FolderIcon fontSize="small" />;
      default:
        return <DocumentIcon fontSize="small" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'document':
        return t('repository.document', 'Document');
      case 'image':
        return t('repository.image', 'Image');
      case 'template':
        return t('repository.template', 'Template');
      case 'policy':
        return t('repository.policy', 'Policy');
      default:
        return type;
    }
  };

  const renderRepositoryTable = (items: RepositoryItem[]) => {
    const filteredItems = filterItems(items);
    
    if (filteredItems.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">
            {searchQuery 
              ? t('repository.noSearchResults', 'No items match your search criteria.')
              : t('repository.noItemsFound', 'No items found in this category.')}
          </Typography>
        </Paper>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('repository.name')}</TableCell>
              <TableCell>{t('repository.type')}</TableCell>
              <TableCell>{t('repository.category')}</TableCell>
              <TableCell>{t('repository.lastUpdated')}</TableCell>
              <TableCell>{t('repository.size')}</TableCell>
              <TableCell align="right">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getTypeIcon(item.type)}
                    <Typography variant="body2">
                      {item.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getTypeLabel(item.type)} 
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{formatDate(item.updatedAt)}</TableCell>
                <TableCell>{item.size}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    onClick={() => handleOpenDetailsDialog(item)}
                    sx={{ mr: 1 }}
                  >
                    {t('common.view')}
                  </Button>
                  
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    href={item.downloadUrl}
                  >
                    {t('repository.download')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {t('repository.title', 'Central Repository')}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={handleOpenUploadDialog}
            >
              {t('repository.upload', 'Upload File')}
            </Button>
            <IconButton onClick={handleRefresh} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder={t('repository.searchPlaceholder', 'Search by name, description, category or tags...')}
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            size="small"
          />
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={t('repository.documents', 'Documents')} />
            <Tab label={t('repository.templates', 'Templates')} />
            <Tab label={t('repository.policies', 'Policies')} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderRepositoryTable(documents)
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderRepositoryTable(templates)
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderRepositoryTable(policies)
          )}
        </TabPanel>
      </Box>
      
      {/* Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={handleCloseDetailsDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('repository.fileDetails', 'File Details')}
          <IconButton
            aria-label="close"
            onClick={handleCloseDetailsDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {getTypeIcon(selectedItem.type)}
                    <Typography variant="h6">
                      {selectedItem.name}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('repository.type')}
                  </Typography>
                  <Chip 
                    label={getTypeLabel(selectedItem.type)} 
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('repository.category')}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {selectedItem.category}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('repository.description')}
                  </Typography>
                  <Typography variant="body2" paragraph sx={{ mt: 1 }}>
                    {selectedItem.description}
                  </Typography>
                </Grid>
                
                {selectedItem.projectName && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('repository.project')}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mt: 1, 
                        color: 'primary.main', 
                        cursor: 'pointer',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                      onClick={() => {
                        handleCloseDetailsDialog();
                        handleViewProject(selectedItem.projectId);
                      }}
                    >
                      {selectedItem.projectName}
                    </Typography>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('repository.tags')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {selectedItem.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('repository.size')}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {selectedItem.size}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('repository.createdBy')}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {selectedItem.createdBy}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('repository.lastUpdated')}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {formatDate(selectedItem.updatedAt)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsDialog}>
            {t('common.close')}
          </Button>
          
          {selectedItem && (
            <Button 
              startIcon={<DownloadIcon />}
              href={selectedItem.downloadUrl}
              variant="contained"
            >
              {t('repository.download')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Upload Dialog */}
      <Dialog 
        open={uploadDialogOpen} 
        onClose={handleCloseUploadDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('repository.uploadFile', 'Upload File')}
          <IconButton
            aria-label="close"
            onClick={handleCloseUploadDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 3,
                  mb: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                component="label"
              >
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                />
                <CloudUploadIcon fontSize="large" color="primary" sx={{ mb: 1 }} />
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {t('repository.dragDropOr', 'Drag and drop a file here, or click to select')}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {t('repository.maxFileSize', 'Maximum file size: 50 MB')}
                </Typography>
              </Box>
              {file && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  {getTypeIcon(file.type.includes('image') ? 'image' : 'document')}
                  <Typography variant="body2">
                    {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </Typography>
                </Box>
              )}
            </Card>
            
            <TextField
              label={t('repository.name')}
              value={newItemData.name}
              onChange={(e) => setNewItemData({...newItemData, name: e.target.value})}
              fullWidth
              required
            />
            
            <TextField
              label={t('repository.description')}
              value={newItemData.description}
              onChange={(e) => setNewItemData({...newItemData, description: e.target.value})}
              fullWidth
              multiline
              rows={3}
              required
            />
            
            <FormControl fullWidth>
              <InputLabel>{t('repository.type')}</InputLabel>
              <Select
                value={newItemData.type}
                label={t('repository.type')}
                onChange={(e) => setNewItemData({...newItemData, type: e.target.value})}
              >
                <MenuItem value="document">{t('repository.document', 'Document')}</MenuItem>
                <MenuItem value="template">{t('repository.template', 'Template')}</MenuItem>
                <MenuItem value="policy">{t('repository.policy', 'Policy')}</MenuItem>
                <MenuItem value="image">{t('repository.image', 'Image')}</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>{t('repository.category')}</InputLabel>
              <Select
                value={newItemData.category}
                label={t('repository.category')}
                onChange={(e) => setNewItemData({...newItemData, category: e.target.value})}
              >
                <MenuItem value="general">{t('repository.general', 'General')}</MenuItem>
                <MenuItem value="planning">{t('repository.planning', 'Planning')}</MenuItem>
                <MenuItem value="execution">{t('repository.execution', 'Execution')}</MenuItem>
                <MenuItem value="monitoring">{t('repository.monitoring', 'Monitoring')}</MenuItem>
                <MenuItem value="technical">{t('repository.technical', 'Technical')}</MenuItem>
                <MenuItem value="business">{t('repository.business', 'Business')}</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label={t('repository.tags')}
              value={newItemData.tags}
              onChange={(e) => setNewItemData({...newItemData, tags: e.target.value})}
              fullWidth
              placeholder={t('repository.tagsPlaceholder', 'Enter tags separated by commas')}
            />
            
            <FormControl fullWidth>
              <InputLabel>{t('repository.relatedProject', 'Related Project (Optional)')}</InputLabel>
              <Select
                value={newItemData.projectId}
                label={t('repository.relatedProject', 'Related Project (Optional)')}
                onChange={(e) => setNewItemData({...newItemData, projectId: e.target.value})}
              >
                <MenuItem value="">{t('repository.noProject', 'No specific project')}</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleUpload}
            variant="contained"
            disabled={!newItemData.name || !newItemData.description || !file}
            startIcon={<UploadIcon />}
          >
            {t('repository.upload')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CentralRepositoryPage; 