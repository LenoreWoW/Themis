import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { query } from './db';
import fs from 'fs';
import path from 'path';

interface ReportSchema {
  title: string;
  description?: string;
  sections: ReportSection[];
  settings?: ReportSettings;
}

interface ReportSection {
  type: 'table' | 'chart' | 'text' | 'kpi';
  title?: string;
  description?: string;
  data?: any;
  query?: string;
  queryParams?: any[];
  chartType?: string;
  textContent?: string;
  kpiLabel?: string;
  kpiValue?: string | number;
  kpiTrend?: 'up' | 'down' | 'neutral';
  formatting?: any;
}

interface ReportSettings {
  orientation?: 'portrait' | 'landscape';
  pageSize?: string;
  header?: {
    text?: string;
    includeDate?: boolean;
    includeLogo?: boolean;
  };
  footer?: {
    text?: string;
    includePageNumbers?: boolean;
  };
  styles?: any;
}

/**
 * Generate a PDF report based on the provided schema
 */
export async function generatePdfReport(
  schema: ReportSchema,
  reportId: string,
  outputPath: string
): Promise<string> {
  // Create new PDF document
  const orientation = schema.settings?.orientation || 'portrait';
  const pageSize = schema.settings?.pageSize || 'a4';
  
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize
  });
  
  // Set metadata
  doc.setProperties({
    title: schema.title,
    subject: schema.description || schema.title,
    creator: 'Themis Report Generator',
    keywords: 'themis, report'
  });
  
  // Add title
  doc.setFontSize(18);
  doc.text(schema.title, 14, 20);
  
  // Add description if available
  if (schema.description) {
    doc.setFontSize(12);
    doc.text(schema.description, 14, 30);
  }
  
  let yPosition = 40;
  
  // Process each section
  for (const section of schema.sections) {
    yPosition = await renderPdfSection(doc, section, yPosition, reportId);
    yPosition += 10; // Add spacing between sections
  }
  
  // Add footer
  if (schema.settings?.footer) {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      if (schema.settings.footer.text) {
        doc.setFontSize(10);
        doc.text(schema.settings.footer.text, 14, doc.internal.pageSize.height - 10);
      }
      
      if (schema.settings.footer.includePageNumbers) {
        doc.setFontSize(10);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width - 30,
          doc.internal.pageSize.height - 10
        );
      }
    }
  }
  
  // Save PDF
  doc.save(outputPath);
  
  return outputPath;
}

/**
 * Render a specific section in the PDF
 */
async function renderPdfSection(
  doc: any,
  section: ReportSection,
  yPosition: number,
  reportId: string
): Promise<number> {
  // Add section title
  if (section.title) {
    doc.setFontSize(14);
    doc.text(section.title, 14, yPosition);
    yPosition += 8;
  }
  
  // Add section description
  if (section.description) {
    doc.setFontSize(10);
    doc.text(section.description, 14, yPosition);
    yPosition += 6;
  }
  
  // Handle section content based on type
  switch (section.type) {
    case 'text':
      return renderPdfTextSection(doc, section, yPosition);
      
    case 'table':
      return await renderPdfTableSection(doc, section, yPosition, reportId);
      
    case 'kpi':
      return renderPdfKpiSection(doc, section, yPosition);
      
    case 'chart':
      return await renderPdfChartSection(doc, section, yPosition, reportId);
      
    default:
      return yPosition;
  }
}

/**
 * Render text section in PDF
 */
function renderPdfTextSection(doc: any, section: ReportSection, yPosition: number): number {
  if (!section.textContent) return yPosition;
  
  doc.setFontSize(11);
  
  // Split text into lines
  const textLines = doc.splitTextToSize(
    section.textContent,
    doc.internal.pageSize.width - 30
  );
  
  doc.text(textLines, 14, yPosition);
  
  // Calculate new Y position
  return yPosition + (textLines.length * 6);
}

/**
 * Render table section in PDF
 */
async function renderPdfTableSection(
  doc: any,
  section: ReportSection,
  yPosition: number,
  reportId: string
): Promise<number> {
  // Get table data
  const tableData = await getTableData(section, reportId);
  
  if (!tableData || !tableData.headers || !tableData.rows) {
    return yPosition;
  }
  
  // Create the table
  autoTable(doc, {
    startY: yPosition,
    head: [tableData.headers],
    body: tableData.rows,
    margin: { top: 10, right: 14, bottom: 10, left: 14 },
    styles: {
      fontSize: 10,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold'
    }
  });
  
  // Return the new Y position after the table
  return doc.lastAutoTable.finalY + 10;
}

/**
 * Render KPI section in PDF
 */
function renderPdfKpiSection(doc: any, section: ReportSection, yPosition: number): number {
  if (!section.kpiLabel || section.kpiValue === undefined) return yPosition;
  
  // Draw KPI box
  const boxWidth = 80;
  const boxHeight = 40;
  const boxX = 14;
  
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(boxX, yPosition, boxWidth, boxHeight, 3, 3, 'FD');
  
  // Add KPI label
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(section.kpiLabel, boxX + 5, yPosition + 12);
  
  // Add KPI value
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(String(section.kpiValue), boxX + 5, yPosition + 28);
  
  // Add trend indicator if available
  if (section.kpiTrend) {
    let trendSymbol = '';
    let trendColor = [0, 0, 0];
    
    if (section.kpiTrend === 'up') {
      trendSymbol = '↑';
      trendColor = [0, 150, 0]; // Green
    } else if (section.kpiTrend === 'down') {
      trendSymbol = '↓';
      trendColor = [200, 0, 0]; // Red
    } else {
      trendSymbol = '→';
      trendColor = [100, 100, 100]; // Gray
    }
    
    doc.setTextColor(trendColor[0], trendColor[1], trendColor[2]);
    doc.text(trendSymbol, boxX + boxWidth - 15, yPosition + 28);
  }
  
  return yPosition + boxHeight + 10;
}

/**
 * Render chart section in PDF
 * Note: For complex charts, we would generate the chart as an image and insert it
 * This is a simplified implementation
 */
async function renderPdfChartSection(
  doc: any,
  section: ReportSection,
  yPosition: number,
  reportId: string
): Promise<number> {
  // Placeholder for chart implementation
  // In a real app, you would generate the chart as an image
  // and then insert it into the PDF using doc.addImage()
  
  doc.setFontSize(11);
  doc.text(
    `[Chart visualization would be rendered here: ${section.chartType}]`,
    14, 
    yPosition
  );
  
  // Return position after chart placeholder
  return yPosition + 40;
}

/**
 * Generate an Excel report based on the provided schema
 */
export async function generateExcelReport(
  schema: ReportSchema,
  reportId: string,
  outputPath: string
): Promise<string> {
  // Create a new workbook
  const workbook = new ExcelJS.Workbook();
  
  // Add metadata
  workbook.creator = 'Themis Report Generator';
  workbook.lastModifiedBy = 'Themis';
  workbook.created = new Date();
  workbook.modified = new Date();
  
  // Create main worksheet
  const worksheet = workbook.addWorksheet('Report', {
    pageSetup: {
      paperSize: 9, // A4
      orientation: schema.settings?.orientation === 'landscape' ? 'landscape' : 'portrait'
    }
  });
  
  // Add title
  worksheet.addRow([schema.title]).font = { bold: true, size: 16 };
  worksheet.addRow([]);
  
  // Add description
  if (schema.description) {
    worksheet.addRow([schema.description]);
    worksheet.addRow([]);
  }
  
  // Process each section
  for (const section of schema.sections) {
    await renderExcelSection(workbook, worksheet, section, reportId);
    worksheet.addRow([]); // Add empty row for spacing
  }
  
  // Auto-fit columns
  worksheet.columns.forEach(column => {
    column.width = 15;
  });
  
  // Write to file
  await workbook.xlsx.writeFile(outputPath);
  
  return outputPath;
}

/**
 * Render a specific section in Excel
 */
async function renderExcelSection(
  workbook: ExcelJS.Workbook,
  worksheet: ExcelJS.Worksheet,
  section: ReportSection,
  reportId: string
): Promise<void> {
  // Add section title
  if (section.title) {
    const titleRow = worksheet.addRow([section.title]);
    titleRow.font = { bold: true, size: 14 };
  }
  
  // Add section description
  if (section.description) {
    worksheet.addRow([section.description]);
  }
  
  worksheet.addRow([]); // Add spacing
  
  // Handle section content based on type
  switch (section.type) {
    case 'text':
      renderExcelTextSection(worksheet, section);
      break;
      
    case 'table':
      await renderExcelTableSection(worksheet, section, reportId);
      break;
      
    case 'kpi':
      renderExcelKpiSection(worksheet, section);
      break;
      
    case 'chart':
      await renderExcelChartSection(workbook, worksheet, section, reportId);
      break;
  }
}

/**
 * Render text section in Excel
 */
function renderExcelTextSection(worksheet: ExcelJS.Worksheet, section: ReportSection): void {
  if (!section.textContent) return;
  
  // Split text into lines
  const lines = section.textContent.split('\n');
  
  lines.forEach(line => {
    worksheet.addRow([line]);
  });
}

/**
 * Render table section in Excel
 */
async function renderExcelTableSection(
  worksheet: ExcelJS.Worksheet,
  section: ReportSection,
  reportId: string
): Promise<void> {
  // Get table data
  const tableData = await getTableData(section, reportId);
  
  if (!tableData || !tableData.headers || !tableData.rows) {
    return;
  }
  
  // Add headers
  const headerRow = worksheet.addRow(tableData.headers);
  headerRow.font = { bold: true };
  
  // Style header row
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4285F4' } // Blue
    };
    cell.font = {
      bold: true,
      color: { argb: 'FFFFFF' } // White
    };
  });
  
  // Add data rows
  tableData.rows.forEach(row => {
    worksheet.addRow(row);
  });
}

/**
 * Render KPI section in Excel
 */
function renderExcelKpiSection(worksheet: ExcelJS.Worksheet, section: ReportSection): void {
  if (!section.kpiLabel || section.kpiValue === undefined) return;
  
  // Add KPI label
  const labelRow = worksheet.addRow([section.kpiLabel]);
  labelRow.font = { bold: true, size: 12 };
  
  // Add KPI value with trend indicator
  let valueText = String(section.kpiValue);
  
  if (section.kpiTrend) {
    if (section.kpiTrend === 'up') {
      valueText += ' ↑';
    } else if (section.kpiTrend === 'down') {
      valueText += ' ↓';
    } else {
      valueText += ' →';
    }
  }
  
  const valueRow = worksheet.addRow([valueText]);
  valueRow.font = { size: 16 };
}

/**
 * Render chart section in Excel
 * This is a placeholder as Excel charts require more complex logic
 */
async function renderExcelChartSection(
  workbook: ExcelJS.Workbook,
  worksheet: ExcelJS.Worksheet,
  section: ReportSection,
  reportId: string
): Promise<void> {
  // Placeholder for chart implementation
  worksheet.addRow([`[Chart: ${section.chartType}]`]);
  
  // In a real implementation, you would:
  // 1. Add the chart data to the worksheet
  // 2. Create a chart using the Excel chart API
  // 3. Position it appropriately
}

/**
 * Get table data from a section definition
 */
async function getTableData(
  section: ReportSection,
  reportId: string
): Promise<{ headers: string[]; rows: any[][] } | null> {
  // If static data is provided, use it
  if (section.data) {
    return section.data;
  }
  
  // If query is provided, execute it
  if (section.query) {
    try {
      const params = section.queryParams || [];
      const result = await query(section.query, params);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      // Extract headers from first row
      const headers = Object.keys(result.rows[0]);
      
      // Convert rows to arrays
      const rows = result.rows.map(row => headers.map(header => row[header]));
      
      return { headers, rows };
    } catch (error) {
      console.error('Error executing query for report table:', error);
      return null;
    }
  }
  
  return null;
}

/**
 * Generate a report based on the format requested
 */
export async function generateReport(
  reportId: string,
  format: 'pdf' | 'excel' = 'pdf',
  outputDir: string = path.join(__dirname, '../../reports')
): Promise<string> {
  try {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Fetch report details
    const reportResult = await query(
      'SELECT * FROM reports WHERE id = $1',
      [reportId]
    );
    
    if (reportResult.rowCount === 0) {
      throw new Error(`Report with ID ${reportId} not found`);
    }
    
    const report = reportResult.rows[0];
    const schema = report.schema;
    
    // Generate unique filename
    const fileName = `report_${reportId}_${Date.now()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    const outputPath = path.join(outputDir, fileName);
    
    // Generate report based on format
    if (format === 'pdf') {
      return await generatePdfReport(schema, reportId, outputPath);
    } else {
      return await generateExcelReport(schema, reportId, outputPath);
    }
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
} 