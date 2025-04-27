# Themis Project Collector

A separate application designed to be deployed before the main Themis system to allow users to input their current projects for later import.

## Purpose

This standalone application serves as a data collection tool to:
- Allow users to register their existing legacy projects
- Build a repository of project data before Themis goes live
- Ensure a smooth transition to the full Themis platform
- Reduce the initial data entry burden when onboarding to the main system

## Features

- **Simple Authentication**: Users can log in with their organization credentials
- **Project Entry**: Form-based interface for entering project details
- **Project List**: View and manage previously entered projects
- **Basic File Attachments**: Upload key project documents
- **Export/Import**: Tools to facilitate migration to the main Themis system

## Technical Details

This application is intentionally separate from Themis but designed for compatibility:
- Uses a compatible database schema (subset relevant to projects)
- API endpoints follow the same patterns as planned for Themis
- Authentication system works with the same user credentials
- Stores data in a separate database that will be exported and imported into Themis

## Deployment

The Project Collector will be deployed before the main Themis system, with its own infrastructure and database.

## How It Works

1. Users access the Project Collector application
2. They authenticate using their organizational credentials
3. They can create, view, and update their project data
4. When Themis launches, administrators will export all collected project data
5. The exported data will then be imported into the main Themis system

## Data Schema

The project collector uses a simplified version of the Themis data schema focusing on:

- Project Details (name, description, dates, status)
- Basic Team Information
- Document Attachments
- Department Associations

## Migration Strategy

When Themis is ready for launch:
1. Export data from Project Collector database
2. Transform data if necessary to match final Themis schema
3. Import into Themis database
4. Verify data integrity
5. Notify users that their projects are now available in the main system 