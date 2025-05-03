import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Excel from 'exceljs';
import { Project, Task, Risk, Issue, FinancialEntry, KPI, User } from '../types';

// Extend jsPDF type to include autoTable plugin and internal properties
interface ExtendedJsPDF extends jsPDF {
  autoTable: (options: any) => void;
  internal: any;
}

/**
 * Format date from ISO string to readable format
 */
const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format currency
 */
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  });
};

/**
 * Add company header to PDF document
 */
const addCompanyHeader = (doc: ExtendedJsPDF, title: string): void => {
  // Add logo
  // doc.addImage(logo, 'PNG', 14, 10, 30, 30);
  
  // Add company info
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('THEMIS Project Management System', 14, 20);
  
  // Add title
  doc.setFontSize(16);
  doc.setTextColor(0, 51, 102);
  doc.text(title, 14, 35);
  
  // Add separator
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(14, 38, doc.internal.pageSize.width - 14, 38);
};

/**
 * Export projects to PDF
 */
export const exportProjectsToPdf = (projects: Project[], title = 'Projects Report'): void => {
  const doc = new jsPDF() as ExtendedJsPDF;
  
  addCompanyHeader(doc, title);
  
  const tableColumn = [
    'Project Name', 
    'Status', 
    'Progress', 
    'Start Date', 
    'End Date', 
    'Budget', 
    'Actual Cost'
  ];
  
  const tableRows = projects.map(project => [
    project.name,
    project.status,
    `${project.progress}%`,
    formatDate(project.startDate),
    formatDate(project.endDate),
    formatCurrency(project.budget),
    formatCurrency(project.actualCost)
  ]);
  
  doc.autoTable({
    startY: 45,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    styles: { lineColor: [0, 51, 102], lineWidth: 0.1 },
    headStyles: { fillColor: [235, 237, 244], textColor: [0, 51, 102] }
  });
  
  // Add footer with date
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Generated: ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`Projects_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
};

/**
 * Export project details to PDF
 */
export const exportProjectDetailsToPdf = (
  project: Project, 
  tasks: Task[], 
  risks: Risk[], 
  issues: Issue[],
  financials: FinancialEntry[],
  kpis: KPI[]
): void => {
  const doc = new jsPDF() as ExtendedJsPDF;
  const title = `Project Details: ${project.name}`;
  
  addCompanyHeader(doc, title);
  
  let yPos = 45;
  
  // Project overview section
  doc.setFontSize(12);
  doc.setTextColor(0, 51, 102);
  doc.text('Project Overview', 14, yPos);
  yPos += 5;
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  // Project info
  const projectInfo = [
    { label: 'Status', value: project.status },
    { label: 'Progress', value: `${project.progress}%` },
    { label: 'Start Date', value: formatDate(project.startDate) },
    { label: 'End Date', value: formatDate(project.endDate) },
    { label: 'Budget', value: formatCurrency(project.budget) },
    { label: 'Actual Cost', value: formatCurrency(project.actualCost) },
    { label: 'Project Manager', value: project.projectManager ? `${project.projectManager.firstName} ${project.projectManager.lastName}` : 'Not Assigned' },
    { label: 'Department', value: project.department || 'N/A' },
  ];
  
  doc.autoTable({
    startY: yPos,
    head: [['Property', 'Value']],
    body: projectInfo.map(item => [item.label, item.value]),
    theme: 'grid',
    styles: { lineColor: [0, 51, 102], lineWidth: 0.1 },
    headStyles: { fillColor: [235, 237, 244], textColor: [0, 51, 102] },
    margin: { left: 14, right: 14 },
    tableWidth: 'auto'
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Tasks section
  doc.setFontSize(12);
  doc.setTextColor(0, 51, 102);
  doc.text('Tasks', 14, yPos);
  yPos += 5;
  
  doc.autoTable({
    startY: yPos,
    head: [['Task', 'Status', 'Priority', 'Due Date', 'Assignee']],
    body: tasks.map(task => [
      task.title,
      task.status,
      task.priority,
      formatDate(task.dueDate),
      task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'
    ]),
    theme: 'grid',
    styles: { lineColor: [0, 51, 102], lineWidth: 0.1 },
    headStyles: { fillColor: [235, 237, 244], textColor: [0, 51, 102] },
    margin: { left: 14, right: 14 }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Risks section
  if (yPos > doc.internal.pageSize.height - 60) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(12);
  doc.setTextColor(0, 51, 102);
  doc.text('Risks', 14, yPos);
  yPos += 5;
  
  doc.autoTable({
    startY: yPos,
    head: [['Risk', 'Status', 'Impact', 'Probability', 'Owner']],
    body: risks.map(risk => [
      risk.title,
      risk.status,
      risk.impact,
      `${risk.probability}%`,
      risk.owner ? `${risk.owner.firstName} ${risk.owner.lastName}` : 'Unassigned'
    ]),
    theme: 'grid',
    styles: { lineColor: [0, 51, 102], lineWidth: 0.1 },
    headStyles: { fillColor: [235, 237, 244], textColor: [0, 51, 102] },
    margin: { left: 14, right: 14 }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Issues section
  if (yPos > doc.internal.pageSize.height - 60) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(12);
  doc.setTextColor(0, 51, 102);
  doc.text('Issues', 14, yPos);
  yPos += 5;
  
  doc.autoTable({
    startY: yPos,
    head: [['Issue', 'Status', 'Impact', 'Owner']],
    body: issues.map(issue => [
      issue.title,
      issue.status,
      issue.impact,
      issue.owner ? `${issue.owner.firstName} ${issue.owner.lastName}` : 'Unassigned'
    ]),
    theme: 'grid',
    styles: { lineColor: [0, 51, 102], lineWidth: 0.1 },
    headStyles: { fillColor: [235, 237, 244], textColor: [0, 51, 102] },
    margin: { left: 14, right: 14 }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Financials section
  if (yPos > doc.internal.pageSize.height - 60) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(12);
  doc.setTextColor(0, 51, 102);
  doc.text('Financials', 14, yPos);
  yPos += 5;
  
  doc.autoTable({
    startY: yPos,
    head: [['Category', 'Description', 'Amount', 'Type', 'Date']],
    body: financials.map(entry => [
      entry.category,
      entry.description,
      formatCurrency(entry.amount),
      entry.type,
      formatDate(entry.date)
    ]),
    theme: 'grid',
    styles: { lineColor: [0, 51, 102], lineWidth: 0.1 },
    headStyles: { fillColor: [235, 237, 244], textColor: [0, 51, 102] },
    margin: { left: 14, right: 14 }
  });
  
  // Add footer with date
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Generated: ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`Project_Details_${project.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
};

/**
 * Export data to Excel
 */
export const exportToExcel = async (data: any[], columns: any[], title: string): Promise<void> => {
  // Create a new workbook
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet(title);
  
  // Add headers
  worksheet.columns = columns.map(col => ({
    header: col.headerName,
    key: col.field,
    width: 20
  }));
  
  // Add data rows
  data.forEach(item => {
    const row: any = {};
    columns.forEach(col => {
      // Format dates if needed
      if (typeof item[col.field] === 'object' && item[col.field] instanceof Date) {
        row[col.field] = formatDate(item[col.field]);
      } else {
        row[col.field] = item[col.field];
      }
    });
    worksheet.addRow(row);
  });
  
  // Style the header row
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell(cell => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '2196F3' }
    };
    cell.font = {
      bold: true,
      color: { argb: 'FFFFFF' }
    };
  });
  
  // Generate the Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  
  // Create download link and trigger click
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Export project charter to PDF
 */
export const exportProjectCharterToPdf = (project: Project, charter: any): void => {
  const doc = new jsPDF() as ExtendedJsPDF;
  const title = `Project Charter: ${project.name}`;
  
  addCompanyHeader(doc, title);
  
  let yPos = 45;
  
  // Project overview
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102);
  doc.text('Project Overview', 14, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  // Project info
  const projectInfo = [
    { label: 'Project Name', value: project.name },
    { label: 'Department', value: project.department },
    { label: 'Project Manager', value: project.projectManager ? `${project.projectManager.firstName} ${project.projectManager.lastName}` : 'TBD' },
    { label: 'Start Date', value: formatDate(project.startDate) },
    { label: 'End Date', value: formatDate(project.endDate) },
    { label: 'Budget', value: formatCurrency(project.budget) }
  ];
  
  doc.autoTable({
    startY: yPos,
    body: projectInfo.map(item => [item.label, item.value]),
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
    margin: { left: 14, right: 14 },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Project description
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102);
  doc.text('Project Description', 14, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(charter.description || project.description || 'No description available.', 14, yPos, { 
    maxWidth: doc.internal.pageSize.width - 28,
    align: 'justify'
  });
  
  yPos += calculateTextHeight(doc as ExtendedJsPDF, charter.description || project.description || 'No description available.', doc.internal.pageSize.width - 28) + 10;
  
  if (yPos > doc.internal.pageSize.height - 70) {
    doc.addPage();
    yPos = 20;
  }
  
  // Project objectives
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102);
  doc.text('Project Objectives', 14, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  if (charter.objectives && charter.objectives.length > 0) {
    let objectiveText = '';
    charter.objectives.forEach((obj: string, idx: number) => {
      objectiveText += `${idx + 1}. ${obj}\n`;
    });
    
    doc.text(objectiveText, 14, yPos, { 
      maxWidth: doc.internal.pageSize.width - 28,
      align: 'left'
    });
    
    yPos += calculateTextHeight(doc as ExtendedJsPDF, objectiveText, doc.internal.pageSize.width - 28) + 10;
  } else {
    doc.text('No objectives defined.', 14, yPos);
    yPos += 10;
  }
  
  if (yPos > doc.internal.pageSize.height - 70) {
    doc.addPage();
    yPos = 20;
  }
  
  // Stakeholders
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102);
  doc.text('Stakeholders', 14, yPos);
  yPos += 8;
  
  if (charter.stakeholders && charter.stakeholders.length > 0) {
    doc.autoTable({
      startY: yPos,
      head: [['Name', 'Role', 'Contact']],
      body: charter.stakeholders.map((s: any) => [s.name, s.role, s.contact]),
      theme: 'grid',
      styles: { lineColor: [0, 51, 102], lineWidth: 0.1 },
      headStyles: { fillColor: [235, 237, 244], textColor: [0, 51, 102] },
      margin: { left: 14, right: 14 }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('No stakeholders defined.', 14, yPos);
    yPos += 10;
  }
  
  // Signatures section
  if (yPos > doc.internal.pageSize.height - 70) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102);
  doc.text('Approvals', 14, yPos);
  yPos += 8;
  
  // Signature boxes
  const signatureInfo = [
    { role: 'Project Manager', name: project.projectManager ? `${project.projectManager.firstName} ${project.projectManager.lastName}` : '', date: '' },
    { role: 'Department Director', name: '', date: '' },
    { role: 'PMO Approver', name: '', date: '' }
  ];
  
  doc.autoTable({
    startY: yPos,
    head: [['Role', 'Name', 'Signature', 'Date']],
    body: signatureInfo.map(s => [s.role, s.name, '', s.date]),
    theme: 'grid',
    styles: { lineColor: [0, 51, 102], lineWidth: 0.1 },
    headStyles: { fillColor: [235, 237, 244], textColor: [0, 51, 102] },
    margin: { left: 14, right: 14 }
  });
  
  // Add footer with date
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Generated: ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`Project_Charter_${project.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
};

// Helper function to calculate text height
function calculateTextHeight(doc: ExtendedJsPDF, text: string, maxWidth: number): number {
  const textLines = doc.splitTextToSize(text, maxWidth);
  return textLines.length * doc.getTextDimensions('Text').h * 1.2;
} 