/**
 * Sample API service using PostgreSQL instead of localStorage
 * 
 * This is a template for converting the existing localStorage-based API
 * to use PostgreSQL with Knex query builder.
 */
import db from './db_connection';
import { User, Project, Task, ChangeRequest, ChangeRequestType } from '../types';

// Project-related API methods
export const getProjects = async (): Promise<Project[]> => {
  try {
    const projects = await db('projects')
      .select('*')
      .orderBy('created_at', 'desc');
    
    // Transform DB results to match the application's type structure
    return projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      startDate: project.start_date,
      endDate: project.end_date,
      status: project.status,
      priority: project.priority,
      budget: project.budget,
      actualCost: project.actual_cost,
      client: project.client,
      progress: project.progress,
      createdAt: project.created_at,
      updatedAt: project.updated_at
    }));
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch projects');
  }
};

export const getProjectById = async (projectId: string): Promise<Project | null> => {
  try {
    const project = await db('projects')
      .select('*')
      .where('id', projectId)
      .first();
    
    if (!project) return null;
    
    // Get project manager
    const manager = await db('users')
      .select('*')
      .where('id', project.project_manager_id)
      .first();
      
    // Get department
    const department = await db('departments')
      .select('*')
      .where('id', project.department_id)
      .first();
      
    // Get team members
    const teamMembers = await db('users')
      .select('users.*')
      .join('project_team', 'users.id', 'project_team.user_id')
      .where('project_team.project_id', projectId);
    
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      startDate: project.start_date,
      endDate: project.end_date,
      status: project.status,
      priority: project.priority,
      budget: project.budget,
      actualCost: project.actual_cost,
      client: project.client,
      progress: project.progress,
      projectManager: manager ? {
        id: manager.id,
        firstName: manager.first_name,
        lastName: manager.last_name,
        email: manager.email,
        role: manager.role
      } : undefined,
      department: department ? {
        id: department.id,
        name: department.name,
        description: department.description
      } : undefined,
      team: teamMembers.map(member => ({
        id: member.id,
        firstName: member.first_name,
        lastName: member.last_name,
        email: member.email,
        role: member.role
      })),
      createdAt: project.created_at,
      updatedAt: project.updated_at
    };
  } catch (error) {
    console.error('Database error:', error);
    throw new Error(`Failed to fetch project with ID ${projectId}`);
  }
};

export const createProject = async (project: Partial<Project>): Promise<Project> => {
  const trx = await db.transaction();
  
  try {
    // Convert camelCase to snake_case for DB insertion
    const [projectId] = await trx('projects').insert({
      name: project.name,
      description: project.description,
      start_date: project.startDate,
      end_date: project.endDate,
      status: project.status,
      priority: project.priority,
      budget: project.budget,
      actual_cost: project.actualCost,
      client: project.client,
      progress: project.progress || 0,
      project_manager_id: project.projectManager?.id,
      department_id: project.department?.id
    }).returning('id');
    
    // Add team members if provided
    if (project.team && project.team.length > 0) {
      const teamEntries = project.team.map(member => ({
        project_id: projectId,
        user_id: member.id
      }));
      
      await trx('project_team').insert(teamEntries);
    }
    
    await trx.commit();
    
    // Return the newly created project
    return await getProjectById(projectId) as Project;
  } catch (error) {
    await trx.rollback();
    console.error('Database error:', error);
    throw new Error('Failed to create project');
  }
};

// Change Request API methods
export const getChangeRequests = async (projectId: string): Promise<ChangeRequest[]> => {
  try {
    const requests = await db('change_requests')
      .select([
        'change_requests.*',
        'change_request_details.new_end_date',
        'change_request_details.new_cost',
        'change_request_details.new_scope_description',
        'change_request_details.new_project_manager_id',
        'change_request_details.closure_reason'
      ])
      .leftJoin('change_request_details', 'change_requests.id', 'change_request_details.change_request_id')
      .where('change_requests.project_id', projectId)
      .orderBy('change_requests.created_at', 'desc');
    
    // Get users for submitted_by, approved_by, etc.
    const userIds = new Set<string>();
    requests.forEach(req => {
      if (req.submitted_by) userIds.add(req.submitted_by);
      if (req.approved_by_sub_pmo) userIds.add(req.approved_by_sub_pmo);
      if (req.approved_by_main_pmo) userIds.add(req.approved_by_main_pmo);
      if (req.approved_by_director) userIds.add(req.approved_by_director);
      if (req.rejected_by) userIds.add(req.rejected_by);
    });
    
    // Fetch all users in one query
    const users = await db('users')
      .select('*')
      .whereIn('id', Array.from(userIds));
      
    const userMap = new Map(users.map(user => [user.id, user]));
    
    return requests.map(req => ({
      id: req.id,
      projectId: req.project_id,
      title: req.title,
      description: req.description,
      type: req.type as ChangeRequestType,
      impact: req.impact,
      justification: req.justification,
      alternatives: req.alternatives,
      status: req.status,
      submittedBy: getUserFromMap(userMap, req.submitted_by),
      submittedAt: req.submitted_at,
      approvedBySubPmo: getUserFromMap(userMap, req.approved_by_sub_pmo),
      approvedBySubPmoAt: req.approved_by_sub_pmo_at,
      approvedByMainPmo: getUserFromMap(userMap, req.approved_by_main_pmo),
      approvedByMainPmoAt: req.approved_by_main_pmo_at,
      approvedByDirector: getUserFromMap(userMap, req.approved_by_director),
      approvedByDirectorAt: req.approved_by_director_at,
      rejectedBy: getUserFromMap(userMap, req.rejected_by),
      rejectedAt: req.rejected_at,
      rejectionReason: req.rejection_reason,
      createdAt: req.created_at,
      updatedAt: req.updated_at,
      // Add details based on type
      details: {
        newEndDate: req.new_end_date,
        newCost: req.new_cost,
        newScopeDescription: req.new_scope_description,
        newProjectManagerId: req.new_project_manager_id,
        closureReason: req.closure_reason
      }
    }));
  } catch (error) {
    console.error('Database error:', error);
    throw new Error(`Failed to fetch change requests for project ${projectId}`);
  }
};

// Helper function to get user from map
const getUserFromMap = (userMap: Map<string, any>, userId: string): User | undefined => {
  if (!userId) return undefined;
  
  const user = userMap.get(userId);
  if (!user) return undefined;
  
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    role: user.role
  } as User;
};

// Add more methods for tasks, risks, issues, etc. following the same pattern 