# replit.md

## Overview

This is a modern full-stack web application built with React, TypeScript, and Express.js. The application appears to be an analytics dashboard that displays web analytics data, including page views, user engagement, search performance, and geographic insights. The frontend uses shadcn/ui components with Tailwind CSS for styling, while the backend is a minimal Express server that primarily serves the frontend and provides basic API endpoints.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Module System**: ESM (ES Modules)
- **Development**: tsx for TypeScript execution in development
- **Production**: esbuild for bundling the server code

### Database Architecture
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Database**: PostgreSQL (using Neon serverless database)
- **Migrations**: Drizzle Kit for schema management
- **Storage**: Includes both database storage and in-memory storage implementation

## Key Components

### Analytics Dashboard
The main feature is a comprehensive analytics dashboard that displays:
- Weekly and monthly change metrics
- Page engagement statistics
- Search performance data from Google Search Console
- Geographic user distribution
- Real-time data fetching from external webhooks

### UI Components
Extensive set of shadcn/ui components including:
- Cards, tables, and charts for data visualization
- Form components with validation
- Navigation and layout components
- Accessibility-focused interactive elements

### Data Management
- Type-safe data parsing and transformation
- Real-time updates with automatic refresh intervals
- Error handling and loading states
- Webhook integration for external data sources

## Data Flow

1. **External Data Source**: Analytics data comes from an external webhook URL (hosted on Railway)
2. **Client Fetching**: React components use TanStack Query to fetch data from the webhook
3. **Data Processing**: Raw HTML analytics data is parsed and transformed into structured TypeScript types
4. **UI Rendering**: Processed data is displayed in various dashboard sections with appropriate visualizations
5. **Real-time Updates**: Auto-refresh every 5 minutes to keep data current

## External Dependencies

### Core Framework Dependencies
- React ecosystem (React, React DOM, React Query)
- Express.js for backend server
- Drizzle ORM with PostgreSQL driver

### UI and Styling
- Radix UI primitives for accessible components
- Tailwind CSS for utility-first styling
- Lucide React for icons
- Class Variance Authority for component variants

### Development Tools
- Vite with React plugin for development
- TypeScript for type safety
- PostCSS with Tailwind for CSS processing
- Replit-specific plugins for integration

### External Services
- Neon Database for PostgreSQL hosting
- Railway for webhook hosting
- Google Analytics/Search Console data (via webhook)

## Deployment Strategy

### Development
- Vite development server with HMR (Hot Module Replacement)
- tsx for running TypeScript directly in development
- Replit integration with development banner and error overlay

### Production
- Frontend: Vite builds optimized static assets
- Backend: esbuild bundles the Express server
- Single deployment artifact with both frontend and backend
- Environment variable configuration for database connection

### Database Management
- Drizzle migrations for schema changes
- Environment-based configuration
- Connection pooling through Neon serverless

## Changelog
- July 06, 2025. Initial setup
- July 06, 2025. Expanded dashboard to display ALL data from n8n workflow:
  - Added comprehensive page engagement tables (20+ pages tracked)
  - Integrated AI insights from Weekly/Monthly analysis 
  - Enhanced test endpoint with full dataset structure
  - Added data count indicators to show total pages tracked
  - Improved error handling with fallback to test data
- July 07, 2025. Fixed data parsing to extract ALL data from n8n workflow:
  - Increased webhook timeout to 5 minutes (for 3.5 minute n8n workflow)
  - Fixed search performance parsing to extract all pages from n8n data
  - Fixed geographic data parsing to extract all countries from n8n data
  - Added comprehensive table parsing for search console data
  - Added progress indicators for long-running n8n workflow
  - Removed hardcoded sample data in favor of real n8n data extraction
  - Fixed fetch runtime error with proper error handling in queryClient.ts
  - Changed to manual trigger mode - workflow only runs when user clicks button
  - Updated UI messaging for manual workflow control and 3.5-minute timing
  - Added PostgreSQL database integration for storing analytics reports
  - Replaced test data functionality with "Load Previous Data" from database
  - Added automatic saving of new analytics data to database
  - Enhanced UI to switch between live n8n data and stored database data
  - Removed Search Performance and Geographic Performance sections per user request
  - Updated database schema to remove search console and geographic data fields
  - Streamlined dashboard to focus on core metrics: Weekly/Monthly changes and Page Engagement
  - Added SEO Analysis tab with expert selection (Rand Fishkin, Eli Schwartz, Tim Soulo, Aleyda Solis, Brian Dean)
  - Integrated OpenRouter API using google/gemma-3n-e4b-it:free model for AI-powered SEO insights
  - Added custom expert input field and comprehensive analysis prompts

## User Preferences

Preferred communication style: Simple, everyday language.

## Replication Guide

A comprehensive replication guide has been created in `REPLICATION_GUIDE.md` that others can use to reproduce this exact application on Replit. The guide includes:
- Complete technical specifications
- Required dependencies and API keys
- Detailed implementation prompts
- Database schema and API endpoints
- Expected user flow and success criteria

This makes the project easily shareable and reproducible for other developers.