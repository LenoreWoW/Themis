import { ProjectTemplateType } from '../types';
import api from '../services/api';

// SVG Templates with placeholders for dynamic data
const generateDynamicTemplateSvg = (
  templateType: ProjectTemplateType, 
  data: {
    projectCount: number;
    inProgressCount: number;
    completedCount: number;
    tasksCount: number;
    averageProgress: number;
    upcomingTasks: string[];
    color: string;
    name: string;
  }
) => {
  const { 
    projectCount, 
    inProgressCount,
    completedCount,
    tasksCount,
    averageProgress, 
    upcomingTasks,
    color,
    name
  } = data;

  // Calculate progress circle arc length (complete circle circumference is 440)
  const progressCircumference = 440;
  const progressValue = Math.min(100, Math.max(0, averageProgress)); // Ensure between 0-100
  const dashArrayValue = (progressValue / 100) * progressCircumference;
  
  // Format tasks for display
  const taskItems = upcomingTasks.slice(0, 4).map((task, index) => 
    `<rect x="530" y="${240 + index * 40}" width="230" height="30" rx="3" fill="#f5f5f5" stroke="#ddd" />
     <text x="540" y="${260 + index * 40}" font-family="Arial" font-size="12" fill="#333">${task.length > 25 ? task.substring(0, 25) + '...' : task}</text>`
  ).join('');

  // Create SVG with dynamic data
  const svgContent = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="600" fill="#f0f0f0" />
      
      <!-- Header bar -->
      <rect width="800" height="60" fill="${color}" />
      <text x="20" y="38" font-family="Arial" font-size="18" fill="white">${name} Project Template</text>
      
      <!-- Left sidebar -->
      <rect x="0" y="60" width="200" height="540" fill="#e0e0e0" />
      
      <!-- Main content area with mock sections -->
      <rect x="220" y="80" width="560" height="120" rx="5" fill="white" stroke="#ccc" />
      <text x="240" y="105" font-family="Arial" font-size="14" font-weight="bold" fill="#333">Project Dashboard</text>
      <rect x="240" y="130" width="520" height="10" rx="3" fill="#ddd" />
      <rect x="240" y="150" width="520" height="10" rx="3" fill="#ddd" />
      <rect x="240" y="170" width="400" height="10" rx="3" fill="#ddd" />
      
      <!-- Chart area with actual stats -->
      <rect x="220" y="220" width="270" height="180" rx="5" fill="white" stroke="#ccc" />
      <text x="240" y="245" font-family="Arial" font-size="14" font-weight="bold" fill="#333">Project Status</text>
      
      <!-- Progress Circle -->
      <circle cx="355" cy="310" r="70" fill="none" stroke="#eee" stroke-width="30" />
      <circle cx="355" cy="310" r="70" fill="none" stroke="${color}" stroke-width="30" 
              stroke-dasharray="${dashArrayValue} ${progressCircumference}" transform="rotate(-90, 355, 310)" />
      <text x="355" y="310" font-family="Arial" font-size="24" fill="#333" text-anchor="middle" dominant-baseline="middle">${progressValue}%</text>
      <text x="355" y="340" font-family="Arial" font-size="12" fill="#777" text-anchor="middle">Completion</text>
      
      <!-- Project Stats -->
      <text x="240" y="390" font-family="Arial" font-size="12" fill="#777">Total Projects: ${projectCount}</text>
      <text x="380" y="390" font-family="Arial" font-size="12" fill="#777">In Progress: ${inProgressCount}</text>
      
      <!-- Task list area with actual tasks -->
      <rect x="510" y="220" width="270" height="180" rx="5" fill="white" stroke="#ccc" />
      <text x="530" y="245" font-family="Arial" font-size="14" font-weight="bold" fill="#333">Upcoming Tasks (${tasksCount})</text>
      
      ${taskItems}
      
      <!-- Calendar/timeline area -->
      <rect x="220" y="420" width="560" height="160" rx="5" fill="white" stroke="#ccc" />
      <text x="240" y="445" font-family="Arial" font-size="14" font-weight="bold" fill="#333">Project Timeline</text>
      <rect x="240" y="450" width="520" height="1" fill="#ddd" />
      <rect x="240" y="490" width="520" height="1" fill="#ddd" />
      <rect x="240" y="530" width="520" height="1" fill="#ddd" />
      
      <rect x="280" y="460" width="100" height="20" rx="3" fill="${color}" opacity="0.6" />
      <rect x="420" y="460" width="150" height="20" rx="3" fill="${color}" opacity="0.4" />
      <rect x="320" y="500" width="120" height="20" rx="3" fill="${color}" opacity="0.5" />
      <rect x="580" y="500" width="80" height="20" rx="3" fill="${color}" opacity="0.7" />
      <rect x="480" y="540" width="130" height="20" rx="3" fill="${color}" opacity="0.6" />
      
      <!-- Sidebar items -->
      <rect x="20" y="100" width="160" height="20" rx="3" fill="#fff" />
      <rect x="20" y="140" width="160" height="20" rx="3" fill="#fff" />
      <rect x="20" y="180" width="160" height="20" rx="3" fill="#fff" />
      <rect x="20" y="220" width="160" height="20" rx="3" fill="#fff" />
      <rect x="20" y="260" width="160" height="20" rx="3" fill="#fff" />
      
      <!-- Template name overlay for clarity -->
      <rect x="230" y="540" width="300" height="30" rx="15" fill="rgba(255,255,255,0.9)" />
      <text x="250" y="562" font-family="Arial" font-size="16" fill="${color}">${name} Template Preview</text>
    </svg>
  `;
  
  return svgContent;
};

// Fetch real project data for template preview
const fetchProjectData = async () => {
  try {
    // Default values in case API call fails
    let results = {
      projectCount: 12,
      inProgressCount: 8,
      completedCount: 2,
      tasksCount: 24,
      averageProgress: 45,
      upcomingTasks: [
        "Website Design Update",
        "Content Migration",
        "Testing Phase 1",
        "Deploy to Staging"
      ]
    };
    
    // Try to get real data from API
    const projectsResponse = await api.projects.getAllProjects('');
    if (projectsResponse.data) {
      const projects = projectsResponse.data;
      
      results.projectCount = projects.length;
      results.inProgressCount = projects.filter(p => p.status === 'IN_PROGRESS').length;
      results.completedCount = projects.filter(p => p.status === 'COMPLETED').length;
      results.averageProgress = projects.length > 0 
        ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length)
        : 0;
      
      // Try to get tasks - using the correct API method
      const tasksLists = await Promise.all(
        projects.slice(0, 3).map(p => api.tasks.getAllTasks(p.id, ''))
      );
      
      const allTasks = tasksLists.flatMap(r => r.data || []).filter(Boolean);
      results.tasksCount = allTasks.length;
      
      // Get upcoming tasks (not completed)
      const upcomingTasks = allTasks
        .filter(t => t.status !== 'COMPLETED')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .map(t => t.title);
      
      if (upcomingTasks.length > 0) {
        results.upcomingTasks = upcomingTasks;
      }
    }
    
    return results;
  } catch (error) {
    console.error("Error fetching project data for template preview:", error);
    // Return default data on error
    return {
      projectCount: 12,
      inProgressCount: 7,
      completedCount: 3,
      tasksCount: 24,
      averageProgress: 45,
      upcomingTasks: [
        "Website Design Update",
        "Content Migration",
        "Testing Phase 1",
        "Deploy to Staging"
      ]
    };
  }
};

// Cache for project data to avoid too many API calls
let cachedProjectData = null;
let lastFetchTime = 0;
const CACHE_LIFETIME = 60000; // 1 minute in milliseconds

// Function to generate placeholder images for template previews
export const generateTemplatePlaceholder = async (templateType: ProjectTemplateType): Promise<string> => {
  // Create a unique color for each template type
  const getColorForTemplate = (type: ProjectTemplateType): string => {
    switch (type) {
      case ProjectTemplateType.DEFAULT:
        return '#4A6572';
      case ProjectTemplateType.ERP:
        return '#0277BD';
      case ProjectTemplateType.MARKETING:
        return '#C2185B';
      case ProjectTemplateType.FINANCE:
        return '#00796B';
      case ProjectTemplateType.SUPPLY_CHAIN:
        return '#E65100';
      case ProjectTemplateType.WEBSITE:
        return '#6A1B9A';
      case ProjectTemplateType.INFRASTRUCTURE:
        return '#283593';
      default:
        return '#757575';
    }
  };

  // Get a name for the template
  const getTemplateName = (type: ProjectTemplateType): string => {
    switch (type) {
      case ProjectTemplateType.DEFAULT:
        return 'Default';
      case ProjectTemplateType.ERP:
        return 'ERP';
      case ProjectTemplateType.MARKETING:
        return 'Marketing';
      case ProjectTemplateType.FINANCE:
        return 'Finance';
      case ProjectTemplateType.SUPPLY_CHAIN:
        return 'Supply Chain';
      case ProjectTemplateType.WEBSITE:
        return 'Website';
      case ProjectTemplateType.INFRASTRUCTURE:
        return 'Infrastructure';
      default:
        return 'Template';
    }
  };

  // Check if we need to fetch new data
  const now = Date.now();
  if (!cachedProjectData || now - lastFetchTime > CACHE_LIFETIME) {
    cachedProjectData = await fetchProjectData();
    lastFetchTime = now;
  }
  
  // Generate an SVG placeholder with unique styling per template
  const color = getColorForTemplate(templateType);
  const name = getTemplateName(templateType);
  
  // Generate the SVG with dynamic data
  const svgContent = generateDynamicTemplateSvg(templateType, {
    ...cachedProjectData,
    color,
    name
  });
  
  // Convert the SVG to a data URL
  const svgBase64 = btoa(svgContent);
  return `data:image/svg+xml;base64,${svgBase64}`;
};

// Export template image URLs - make compatible with both async and sync usage
export const getTemplatePreviewPath = (templateType: ProjectTemplateType): string => {
  // Create a temporary SVG while the real one loads
  const color = templateType === ProjectTemplateType.DEFAULT ? '#4A6572' :
                templateType === ProjectTemplateType.ERP ? '#0277BD' :
                templateType === ProjectTemplateType.MARKETING ? '#C2185B' :
                templateType === ProjectTemplateType.FINANCE ? '#00796B' :
                templateType === ProjectTemplateType.SUPPLY_CHAIN ? '#E65100' :
                templateType === ProjectTemplateType.WEBSITE ? '#6A1B9A' :
                templateType === ProjectTemplateType.INFRASTRUCTURE ? '#283593' : '#757575';
                
  const name = templateType === ProjectTemplateType.DEFAULT ? 'Default' :
               templateType === ProjectTemplateType.ERP ? 'ERP' :
               templateType === ProjectTemplateType.MARKETING ? 'Marketing' :
               templateType === ProjectTemplateType.FINANCE ? 'Finance' :
               templateType === ProjectTemplateType.SUPPLY_CHAIN ? 'Supply Chain' :
               templateType === ProjectTemplateType.WEBSITE ? 'Website' :
               templateType === ProjectTemplateType.INFRASTRUCTURE ? 'Infrastructure' : 'Template';
  
  // Simple placeholder SVG while loading
  const simpleSvg = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="600" fill="#f5f5f5" />
      <rect width="800" height="60" fill="${color}" />
      <text x="400" y="300" font-family="Arial" font-size="24" fill="#333" text-anchor="middle">Loading ${name} Template Preview...</text>
    </svg>
  `;
  
  const svgBase64 = btoa(simpleSvg);
  
  // Start loading the actual template
  generateTemplatePlaceholder(templateType).then(dataUrl => {
    // When ready, find all images with this placeholder and replace them
    const placeholderId = `template-placeholder-${templateType}`;
    if (typeof document !== 'undefined') {
      document.querySelectorAll(`img[data-placeholder-id="${placeholderId}"]`)
        .forEach(img => {
          (img as HTMLImageElement).src = dataUrl;
        });
    }
  });
  
  return `data:image/svg+xml;base64,${svgBase64}`;
};

// Get template description based on type
export const getTemplateDescription = (templateType: ProjectTemplateType): string => {
  switch (templateType) {
    case ProjectTemplateType.DEFAULT:
      return 'A standard project layout with basic task tracking and team management.';
    case ProjectTemplateType.ERP:
      return 'Enterprise Resource Planning template with modules for operations, HR, and finance integration.';
    case ProjectTemplateType.MARKETING:
      return 'Campaign-focused template with audience analytics, content calendar, and conversion tracking.';
    case ProjectTemplateType.FINANCE:
      return 'Financial project template with budget forecasting, expense tracking, and ROI analysis tools.';
    case ProjectTemplateType.SUPPLY_CHAIN:
      return 'Supply chain management template with inventory tracking, logistics planning, and vendor management.';
    case ProjectTemplateType.WEBSITE:
      return 'Website development template with design, development, and launch phases plus SEO tracking.';
    case ProjectTemplateType.INFRASTRUCTURE:
      return 'IT infrastructure template with network diagrams, deployment planning, and maintenance scheduling.';
    default:
      return 'Select a template to see more details.';
  }
}; 