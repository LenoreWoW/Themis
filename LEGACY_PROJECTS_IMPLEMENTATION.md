# Legacy Projects Manual Entry Implementation

## Overview

The Legacy Projects Manual Entry feature allows PMO users (Sub PMO and Main PMO roles) to enter legacy projects one by one into the Themis system. This document outlines the implementation details, components created, and how to use the feature.

## Components Created

1. **LegacyProjectForm.tsx**
   - A multi-step form for entering legacy project details
   - Includes all fields from the regular project creation form
   - Features a "Legacy Import" toggle that is always enabled
   - Allows saving as draft or publishing the project

2. **LegacyProjectPage.tsx**
   - Container page that loads necessary data and renders the form
   - Handles permission checks to ensure only authorized users can access it
   - Manages API calls for loading departments and users data

## Changes Made

1. **Project Type Updates**
   - Added `legacyImport` and `isDraft` fields to the Project interface
   - These fields are used for filtering and displaying legacy projects

2. **Permissions**
   - Added `canManageLegacyProjects` function to restrict access to Sub PMO and Main PMO roles
   - Implemented permission checks in both UI and routing

3. **UI/UX Enhancements**
   - Added "Add Legacy Project" button to the Projects page
   - Added "Legacy Import" badge to project cards
   - Added "Draft" badge for projects in draft status

4. **Routing**
   - Added a new route `/projects/legacy/new` for creating legacy projects
   - Restricted access to Sub PMO and Main PMO roles

5. **Dashboard Integration**
   - Added "Legacy Projects" KPI to the dashboard
   - Ensured legacy projects are counted in all relevant metrics

6. **Audit Logging**
   - Added automatic audit logging for legacy project creation
   - Each legacy project is tagged with `legacyImport=true`
   - Audit logs record the user who imported the project

## How to Use

1. Log in as a user with Sub PMO or Main PMO role
2. Navigate to the Projects page
3. Click the "Add Legacy Project" button
4. Fill out the multi-step form:
   - Step 1: Basic Information
   - Step 2: Team & Timeline
   - Step 3: Budget & Documents
5. Choose to save as draft or publish immediately:
   - Drafts can be edited or deleted before publication
   - Published projects immediately appear in all reports and dashboards

## Permissions Matrix

| Action                   | Admin | Main PMO | Sub PMO | Project Manager | Director | Executive |
|--------------------------|-------|----------|---------|-----------------|----------|-----------|
| View Legacy Projects     | ✓     | ✓        | ✓       | ✓               | ✓        | ✓         |
| Create Legacy Projects   | ✗     | ✓        | ✓       | ✗               | ✗        | ✗         |
| Edit Legacy Projects     | ✗     | ✓        | ✓       | ✓*              | ✗        | ✗         |
| Delete Legacy Drafts     | ✗     | ✓        | ✓       | ✗               | ✗        | ✗         |

*Project Managers can edit legacy projects after they are published, but cannot create them

## Technical Implementation Notes

1. **Data Persistence**
   - Legacy projects are stored in the same data structure as regular projects
   - The `legacyImport` flag differentiates them from standard projects
   - Draft projects use the `isDraft` flag and are only visible to PMO users until published

2. **Audit Trail**
   - All legacy project operations are logged in the audit system
   - The logs include details about the importing user, timestamp, and the legacy flag

3. **KPI Integration**
   - Legacy projects are included in all KPI calculations
   - A separate KPI shows the count and percentage of legacy projects

4. **Form Validation**
   - The form validates required fields (name, owner, start/end dates, status)
   - Custom validation ensures end dates are after start dates
   - Backend validation confirms that only authorized users can create legacy projects

## Future Enhancements

1. **Batch Import**
   - Add capability to import multiple legacy projects via CSV/Excel
   
2. **Enhanced Metadata**
   - Add additional legacy-specific fields (original creation date, legacy system ID, etc.)
   
3. **Import Status Tracking**
   - Track the status of legacy data migration with progress indicators

## Testing Checklist

1. Verify that only Sub PMO and Main PMO roles can access the feature
2. Confirm that all form fields are properly validated
3. Test the draft save and publish functionality
4. Verify that legacy projects appear in dashboards and reports
5. Confirm the audit log properly records legacy project creation
6. Test visualization of legacy badges in the UI
7. Verify that KPIs correctly include legacy project data 