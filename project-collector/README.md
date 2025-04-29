# Project Collector

A standalone data-entry web application designed to facilitate the migration from legacy systems to Themis.

## Purpose

Project Collector serves as a bridge between existing legacy systems and Themis by:
- Providing a simple interface for manual project data entry
- Ensuring complete coverage of all legacy projects
- Creating a clean, structured dataset ready for import into Themis
- Eliminating the need for manual re-entry when Themis goes live

## Features

- Simple, focused data entry interface
- Project data validation and verification
- Export functionality for Themis import
- User authentication and access control
- Data integrity checks
- Progress tracking

## Setup

### Prerequisites
- Node.js v18.x
- Access to the legacy system for data reference
- API access to Themis for data export

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd project-collector
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
REACT_APP_API_URL=https://api.pmo.projects.mod.qa/api
REACT_APP_ENVIRONMENT=production
REACT_APP_BASE_URL=https://collector.pmo.projects.mod.qa
```

4. Start the development server:
```bash
npm start
```

## Data Entry Process

1. **Project Information**
   - Basic project details
   - Project status and timeline
   - Team members and roles
   - Project goals and objectives

2. **Validation**
   - Required fields check
   - Data format verification
   - Duplicate detection
   - Legacy system cross-reference

3. **Verification**
   - Data accuracy confirmation
   - Missing information flagging
   - Inconsistency resolution

## Export Process

1. **Data Preparation**
   - Format conversion
   - Data cleaning
   - Validation checks

2. **Export Options**
   - Full database export
   - Selective project export
   - Custom field mapping

3. **Import to Themis**
   - Automated import process
   - Data mapping verification
   - Import confirmation

## Deployment

The application is deployed on Netlify for easy access and updates.

### Production URL
https://collector.pmo.projects.mod.qa

### Staging URL
https://collector-staging.netlify.app

## Support

For assistance with:
- Data entry issues
- Export problems
- Technical support
- Feature requests

Contact: [Support Contact Information]

## License

[License Information] 