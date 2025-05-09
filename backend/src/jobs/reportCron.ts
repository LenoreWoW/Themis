import cron from 'node-cron';
import { RRule } from 'rrule';
import { query, update } from '../lib/db';
import { generatePdfReport } from '../lib/reportGenerator';
import { generateExcelReport } from '../lib/reportGenerator';
import { sendEmail } from '../lib/email';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

// Directory for storing generated reports
const REPORTS_DIR = path.join(__dirname, '../../reports');

// Ensure the reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

/**
 * Process scheduled reports every hour
 */
cron.schedule('0 * * * *', async () => {
  try {
    console.log('Running scheduled report generation...');
    
    // Get current date/time
    const now = new Date();
    
    // Fetch all scheduled reports
    const schedulesResult = await query(
      `SELECT 
        rs.id, rs.report_id, rs.rrule, rs.recipients, rs.format, rs.subject, rs.message,
        r.name, r.schema, r.owner_id, u.email as owner_email, u.full_name as owner_name
      FROM 
        report_schedules rs
      JOIN 
        reports r ON rs.report_id = r.id
      JOIN 
        users u ON r.owner_id = u.id`
    );
    
    if (schedulesResult.rowCount === 0) {
      console.log('No scheduled reports found');
      return;
    }
    
    console.log(`Found ${schedulesResult.rowCount} scheduled reports`);
    
    // Process each schedule
    for (const schedule of schedulesResult.rows) {
      try {
        await processSchedule(schedule, now);
      } catch (error) {
        console.error(`Error processing schedule ${schedule.id}:`, error);
      }
    }
    
    console.log('Scheduled report generation completed');
  } catch (error) {
    console.error('Error in report scheduling cron job:', error);
  }
});

/**
 * Process a single report schedule
 */
async function processSchedule(schedule: any, now: Date): Promise<void> {
  // Parse RRule from string
  let rrule: RRule;
  try {
    rrule = RRule.fromString(schedule.rrule);
  } catch (error) {
    console.error(`Invalid RRule format for schedule ${schedule.id}:`, error);
    return;
  }
  
  // Check if the report should run now
  const nextOccurrences = rrule.between(
    new Date(now.getTime() - 3600000), // 1 hour ago
    now,
    true
  );
  
  if (nextOccurrences.length === 0) {
    // No occurrences in the last hour, nothing to do
    return;
  }
  
  console.log(`Generating report ${schedule.report_id} (${schedule.name})`);
  
  // Generate the report file
  let filePath: string;
  const fileId = uuidv4().substring(0, 8);
  const filePrefix = schedule.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const fileName = `${filePrefix}_${fileId}_${formatDate(now)}`;
  
  try {
    if (schedule.format === 'pdf') {
      filePath = path.join(REPORTS_DIR, `${fileName}.pdf`);
      await generatePdfReport(schedule.schema, schedule.report_id, filePath);
    } else {
      filePath = path.join(REPORTS_DIR, `${fileName}.xlsx`);
      await generateExcelReport(schedule.schema, schedule.report_id, filePath);
    }
  } catch (error) {
    console.error(`Failed to generate ${schedule.format} report:`, error);
    return;
  }
  
  // Send email to recipients
  const subject = schedule.subject || `Themis Report: ${schedule.name}`;
  const message = schedule.message || 
    `Please find attached the scheduled report "${schedule.name}" generated on ${formatDate(now)}.`;
  
  try {
    await sendEmail({
      to: schedule.recipients,
      cc: [schedule.owner_email],
      subject,
      text: message,
      html: `<p>${message}</p>`,
      attachments: [{
        filename: path.basename(filePath),
        path: filePath
      }]
    });
    
    console.log(`Sent ${schedule.format} report to ${schedule.recipients.join(', ')}`);
    
    // Log successful report generation
    await logReportExecution(schedule.id, schedule.report_id, filePath, true);
    
    // Clean up file after sending
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error('Failed to send report email:', error);
    await logReportExecution(schedule.id, schedule.report_id, filePath, false, String(error));
  }
}

/**
 * Log report execution in the database
 */
async function logReportExecution(
  scheduleId: string,
  reportId: string,
  filePath: string,
  success: boolean,
  error?: string
): Promise<void> {
  try {
    await query(
      `INSERT INTO report_executions (
        id, schedule_id, report_id, execution_time, file_path, success, error_message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [uuidv4(), scheduleId, reportId, new Date(), filePath, success, error || null]
    );
  } catch (logError) {
    console.error('Failed to log report execution:', logError);
  }
}

/**
 * Format date for filenames
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0].replace(/-/g, '');
}

// Log that the report scheduler has started
console.log('Report scheduler initialized'); 