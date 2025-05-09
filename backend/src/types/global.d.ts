// This file contains global type declarations for the project

// Declare modules that don't have type definitions
declare module 'jspdf-autotable' {
  import jsPDF from 'jspdf';
  
  interface UserOptions {
    head?: any[][];
    body?: any[][];
    foot?: any[][];
    startY?: number;
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    styles?: any;
    headStyles?: any;
    bodyStyles?: any;
    footStyles?: any;
    theme?: string;
    tableWidth?: string | number;
    pageBreak?: 'auto' | 'avoid' | 'always';
    rowPageBreak?: 'auto' | 'avoid';
    columnStyles?: any;
    didParseCell?: (data: any) => void;
    willDrawCell?: (data: any) => void;
    didDrawCell?: (data: any) => void;
    didDrawPage?: (data: any) => void;
    [key: string]: any;
  }
  
  function autoTable(doc: jsPDF, options: UserOptions): void;
  
  export default autoTable;
}

// Extend Express Request interface to include custom properties
declare namespace Express {
  interface Request {
    user?: {
      id: string;
      role: string;
      department: string;
    };
  }
}

// Create custom interfaces for our data structures
interface Project {
  id: string;
  name: string;
  department: string;
  status: string;
  priority: string;
  start_date: Date;
  end_date: Date;
  completion_percentage: number;
  description: string;
  manager_id: string;
  created_at: Date;
  updated_at: Date;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: Date;
  project_id: string;
  assigned_to: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department: string;
  position: string;
  avatar_url?: string;
  created_at: Date;
}

interface Document {
  id: string;
  title: string;
  content: string;
  project_id?: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  version: number;
}

interface Report {
  id: string;
  name: string;
  description: string;
  type: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  template_id?: string;
  config: any;
}

interface ChatMessage {
  id: string;
  channel_id: string;
  sender_id: string;
  content: string;
  sent_at: Date;
  read_by: string[];
}

interface ChatChannel {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'project';
  project_id?: string;
  participants: string[];
  created_at: Date;
  updated_at: Date;
}

interface Notification {
  id: string;
  user_id: string;
  title: string;
  content: string;
  read: boolean;
  link?: string;
  created_at: Date;
}

interface UserAvailability {
  id: string;
  user_id: string;
  start_time: Date;
  end_time: Date;
  status: 'available' | 'busy' | 'tentative' | 'out_of_office';
  created_at: Date;
  updated_at: Date;
}

interface UserTutorial {
  id: string;
  user_id: string;
  tutorial_key: string;
  completed: boolean;
  completed_at?: Date;
} 