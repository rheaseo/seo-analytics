export interface MetricRow {
  metric: string;
  current: string;
  previous: string;
  change: string;
  changePercent?: number;
  isPositive?: boolean | null;
}

export interface EngagementRow {
  page: string;
  pageViews: string;
  activeUsers: string;
  viewsPerUser: string;
  eventCount: string;
}

export interface SearchResultRow {
  page: string;
  activeUsers: string;
  engagedSessions: string;
  engagementRate: string;
  eventCount: string;
  avgPosition: string;
  ctr: string;
  clicks: string;
  impressions: string;
}

export interface CountryRow {
  country: string;
  activeUsers: string;
  newUsers: string;
  engagementRate: string;
  engagedSessions: string;
  eventCount: string;
  totalUsers: string;
  sessions: string;
}

export interface SerpAnalysisRow {
  keyword: string;
  position: string;
  url: string;
  clicks: string;
  impressions: string;
  ctr: string;
  avgPosition: string;
}

export interface AIInsight {
  section: string;
  insight: string;
  recommendation?: string;
}

export interface AnalyticsData {
  weeklyChange: MetricRow[];
  monthlyChange: MetricRow[];
  engagementThisWeek: EngagementRow[];
  engagementPriorWeek: EngagementRow[];
  aiInsights?: AIInsight[];
  weeklyInsight?: string;
  monthlyInsight?: string;
  rawHtml: string;
}

export interface WebhookResponse {
  output: string;
}
