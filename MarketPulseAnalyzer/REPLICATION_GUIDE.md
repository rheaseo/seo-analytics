# SEO Analytics Dashboard - Replication Guide

## 🎯 Project Overview
Create a comprehensive analytics dashboard that integrates Google Analytics data from an n8n workflow webhook, featuring AI-powered SEO insights from industry experts.

## 📋 What You'll Build
- **Real-time Analytics Dashboard** displaying weekly/monthly metrics and page engagement data
- **Database Storage** for historical analytics reports with PostgreSQL
- **AI SEO Analysis** using OpenRouter API with selectable industry experts
- **Professional UI** with shadcn/ui components and Tailwind CSS styling

## 🚀 Setup Instructions for Replit

### Step 1: Create New Replit Project
```
Create a new Replit project and copy this prompt to get started
```

### Step 2: Required Dependencies
The app uses these key technologies:
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript  
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: shadcn/ui + Tailwind CSS
- **AI**: OpenRouter API integration

### Step 3: Database Setup
You'll need PostgreSQL database access. The app will automatically:
- Create user and analytics_reports tables
- Handle data storage and retrieval
- Manage historical report viewing

### Step 4: Required API Keys
You'll need to obtain:
- **OpenRouter API Key** (for AI SEO analysis)
  - Sign up at https://openrouter.ai
  - Get your API key from the dashboard
  - Add as OPENAI_API_KEY environment variable

### Step 5: Analytics Data Source
The app fetches data from an n8n workflow webhook that:
- Processes Google Analytics data
- Takes ~3.5 minutes to complete
- Returns structured HTML analytics data
- Can be replaced with your own data source

## 🔧 Detailed Implementation Prompt

Copy this prompt to Replit AI to build the complete application:

---

**BUILD REQUEST:**

Create a full-stack analytics dashboard web application with the following specifications:

## Core Features Required:

### 1. Analytics Dashboard
- Display weekly and monthly change metrics in formatted tables
- Show page engagement data (pageviews, active users, etc.)
- Auto-refresh data every 5 minutes
- Manual "Load Fresh Data" button for immediate updates
- "Load Previous Data" to view historical reports from database

### 2. Database Integration
- PostgreSQL database with Drizzle ORM
- Store analytics reports with timestamps
- Users table and analytics_reports table
- Automatic saving of new analytics data
- Historical data viewing capability

### 3. SEO Analysis Tab
- Dropdown to select SEO experts: Rand Fishkin, Eli Schwartz, Tim Soulo, Aleyda Solis, Brian Dean
- Custom expert input field
- AI-powered analysis using OpenRouter API (google/gemma-3n-e4b-it:free model)
- Professional formatting with gradient backgrounds and structured sections
- Copy button for sharing analysis results
- Smart text formatting (auto-detect headings, lists, paragraphs)

### 4. Data Processing
- Parse HTML analytics data into structured TypeScript types
- Handle weekly/monthly metrics, engagement data
- Error handling for failed API calls
- Loading states and progress indicators

### 5. UI/UX Requirements
- Modern, professional design using shadcn/ui components
- Responsive layout with proper spacing
- Purple accent color scheme for SEO sections
- Card-based layout for data sections
- Proper error states and loading indicators
- Copy functionality with confirmation feedback

## Technical Architecture:

### Frontend Structure:
```
client/src/
├── components/
│   ├── analytics-dashboard.tsx (main dashboard)
│   ├── weekly-change-section.tsx
│   ├── monthly-change-section.tsx  
│   ├── page-engagement-section.tsx
│   ├── seo-analysis-section.tsx (AI analysis tab)
│   └── ui/ (shadcn components)
├── types/analytics.ts (TypeScript interfaces)
├── lib/queryClient.ts (API requests)
└── pages/home.tsx
```

### Backend Structure:
```
server/
├── index.ts (Express server)
├── routes.ts (API endpoints)
├── db.ts (database connection)
└── storage.ts (data operations)

shared/
└── schema.ts (Drizzle database schema)
```

### Database Schema:
```typescript
// Users table
users: {
  id: serial primary key
  username: varchar(255) unique not null
  password: varchar(255) not null
}

// Analytics reports table  
analyticsReports: {
  id: serial primary key
  weeklyChange: jsonb
  monthlyChange: jsonb
  engagementThisWeek: jsonb
  engagementPriorWeek: jsonb
  rawHtml: text
  createdAt: timestamp default now()
}
```

### API Endpoints:
- `GET /api/webhook-proxy` - Fetch analytics from n8n workflow
- `POST /api/analytics` - Save analytics report to database
- `GET /api/analytics/latest` - Get most recent analytics report
- `POST /api/seo-analysis` - Generate AI SEO analysis

### Data Types:
```typescript
interface MetricRow {
  metric: string;
  current: string; 
  previous: string;
  change: string;
  changePercent?: number;
  isPositive?: boolean | null;
}

interface EngagementRow {
  page: string;
  pageViews: string;
  activeUsers: string;
  viewsPerUser: string;
  eventCount: string;
}

interface AnalyticsData {
  weeklyChange: MetricRow[];
  monthlyChange: MetricRow[];
  engagementThisWeek: EngagementRow[];
  engagementPriorWeek: EngagementRow[];
  rawHtml: string;
}
```

## Key Implementation Details:

### 1. Data Fetching
- Use TanStack Query for state management
- 5-minute auto-refresh intervals
- Timeout handling for long-running requests
- Fallback to database data on webhook failures

### 2. SEO Analysis Implementation
```typescript
// OpenRouter API integration
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'google/gemma-3n-e4b-it:free',
    messages: [{
      role: 'user', 
      content: `You are ${expert}, analyze this analytics data...`
    }],
    max_tokens: 1200,
    temperature: 0.7
  })
});
```

### 3. Text Formatting Logic
- Auto-detect markdown headers (#, ##)
- Convert bullet points to styled list items
- Format paragraphs with proper spacing
- Purple gradient backgrounds for analysis sections

### 4. Database Operations
- Use Drizzle ORM with PostgreSQL
- Automatic schema management with `npm run db:push`
- Type-safe database operations
- Connection pooling with Neon serverless

## Environment Variables Required:
```
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-or-...
```

## Build Commands:
```bash
npm run dev      # Start development server
npm run db:push  # Push database schema changes
npm run build    # Build for production
```

## Expected User Flow:
1. User loads dashboard and sees analytics data
2. Click "Load Fresh Data" to trigger n8n workflow (3.5 min wait)
3. Data automatically saves to database when received
4. Switch to SEO Analysis tab
5. Select expert (Rand Fishkin, etc.) or enter custom expert
6. Click "Get SEO Analysis" and wait 30-60 seconds
7. View formatted analysis with copy button
8. Use "Load Previous Data" to view historical reports

## Success Criteria:
- ✅ Dashboard displays real analytics data in formatted tables
- ✅ Database stores and retrieves historical reports
- ✅ SEO analysis generates expert insights with professional formatting
- ✅ Copy functionality works for sharing analysis
- ✅ Error handling for API timeouts and failures
- ✅ Responsive design with purple accent styling
- ✅ Auto-refresh and manual refresh capabilities

---

## 🎯 Final Result
You'll have a professional analytics dashboard that:
- Fetches real Google Analytics data
- Stores historical reports in PostgreSQL  
- Generates AI-powered SEO insights from industry experts
- Features a modern, responsive UI with copy/share functionality
- Handles errors gracefully with proper loading states

The entire application will be production-ready and deployable on Replit with proper error handling, professional styling, and comprehensive functionality.