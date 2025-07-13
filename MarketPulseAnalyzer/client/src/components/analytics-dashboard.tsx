import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartLine, RefreshCw, AlertCircle, CheckCircle, Clock, Lightbulb, TrendingDown, Brain } from 'lucide-react';
import { WeeklyChangeSection } from './weekly-change-section';
import { MonthlyChangeSection } from './monthly-change-section';
import { PageEngagementSection } from './page-engagement-section';
import { SEOAnalysisSection } from './seo-analysis-section';
import { parseAnalyticsHTML } from '@/lib/analytics-parser';
import { WebhookResponse, AnalyticsData } from '@/types/analytics';

const WEBHOOK_URL = '/api/webhook-proxy';
const LATEST_DATA_URL = '/api/analytics/latest';

export function AnalyticsDashboard() {
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [dataSource, setDataSource] = useState<'live' | 'previous'>('live');
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [showHistoryList, setShowHistoryList] = useState(false);
  const queryClient = useQueryClient();

  // Get all reports for history list
  const { data: allReports } = useQuery<any[]>({
    queryKey: ['/api/analytics/all'],
    enabled: dataSource === 'previous',
  });

  const currentUrl = (() => {
    if (dataSource === 'previous') {
      return selectedReportId ? `/api/analytics/${selectedReportId}` : LATEST_DATA_URL;
    }
    return WEBHOOK_URL;
  })();

  const { data: webhookData, isLoading, error, refetch, isRefetching } = useQuery<any>({
    queryKey: [currentUrl],
    enabled: dataSource === 'previous' || false, // Auto-fetch for previous data, manual for live data
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (dataSource === 'previous') {
        return failureCount < 2; // Fewer retries for database calls
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const analyticsData: AnalyticsData | null = (() => {
    if (!webhookData) return null;
    
    if (dataSource === 'previous') {
      // Database response: direct analytics data
      return {
        weeklyChange: webhookData.weeklyChange || [],
        monthlyChange: webhookData.monthlyChange || [],
        engagementThisWeek: webhookData.engagementThisWeek || [],
        engagementPriorWeek: webhookData.engagementPriorWeek || [],

        weeklyInsight: webhookData.weeklyInsight,
        monthlyInsight: webhookData.monthlyInsight,
        rawHtml: webhookData.rawHtml || '',
      };
    } else {
      // Webhook response: parse HTML output
      return webhookData.length > 0 && webhookData[0].output
        ? parseAnalyticsHTML(webhookData[0].output)
        : null;
    }
  })();

  useEffect(() => {
    if (webhookData && !isLoading) {
      setLastUpdateTime(new Date());
      setShowSuccessBanner(true);
      setTimeout(() => setShowSuccessBanner(false), 5000);
    }
  }, [webhookData, isLoading]);

  const handleRefresh = async () => {
    await refetch();
  };

  // Save analytics data to database when new data is fetched from webhook
  useEffect(() => {
    if (analyticsData && dataSource === 'live' && !isLoading && webhookData) {
      // Save to database
      fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsData),
      }).then(response => {
        if (response.ok) {
          console.log('Analytics data saved to database');
        } else {
          console.error('Failed to save analytics data to database');
        }
      }).catch(error => {
        console.error('Error saving analytics data:', error);
      });
    }
  }, [analyticsData, dataSource, isLoading, webhookData]);

  const toggleDataSource = () => {
    if (dataSource === 'live') {
      setDataSource('previous');
      setShowHistoryList(true);
    } else if (selectedReportId) {
      // If viewing a specific report, go back to history list
      setShowHistoryList(true);
      setSelectedReportId(null);
    } else {
      // If viewing history list, go back to live data
      setDataSource('live');
      setShowHistoryList(false);
      setSelectedReportId(null);
    }
    queryClient.invalidateQueries({ queryKey: [currentUrl] });
  };

  const selectReport = (reportId: number) => {
    setSelectedReportId(reportId);
    setShowHistoryList(false);
    // Trigger data fetch for the selected report
    queryClient.invalidateQueries({ queryKey: [`/api/analytics/${reportId}`] });
  };

  const LoadingSkeleton = () => (
    <div className="space-y-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const ErrorState = () => (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full mb-4">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Data</h3>
      <p className="text-gray-600 mb-4">
        {error instanceof Error ? error.message : 'Unable to fetch analytics data from the webhook endpoint.'}
      </p>
      <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700">
        Try Again
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <ChartLine className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  {lastUpdateTime 
                    ? `Last updated: ${lastUpdateTime.toLocaleTimeString()}`
                    : 'Last updated: --'
                  }
                </span>
              </div>
              <Badge variant={dataSource === 'previous' ? "secondary" : "outline"} className="text-xs">
                {dataSource === 'previous' ? 'Previous Data' : 'Live Data'}
              </Badge>
              <Button 
                onClick={toggleDataSource} 
                variant="outline"
                size="sm"
                className="text-xs"
              >
                {dataSource === 'previous' 
                  ? (selectedReportId ? `Back to History (Report #${selectedReportId})` : 'Back to Live Data')
                  : 'View History'
                }
              </Button>
              <Button 
                onClick={handleRefresh} 
                disabled={isLoading || isRefetching || dataSource === 'previous'}
                className="bg-green-600 hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${(isLoading || isRefetching) ? 'animate-spin' : ''}`} />
                {dataSource === 'previous' 
                  ? 'Switch to Live Data to Run Workflow'
                  : isLoading || isRefetching 
                    ? 'Running n8n Workflow...' 
                    : 'Run n8n Workflow'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        {showSuccessBanner && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Data updated successfully
            </AlertDescription>
          </Alert>
        )}

        {isLoading && dataSource === 'live' && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
            <AlertDescription className="text-blue-800">
              Running n8n workflow to fetch your latest analytics data... This takes about 3.5 minutes to complete.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Connection error: {error instanceof Error ? error.message : 'Unknown error occurred'}
            </AlertDescription>
          </Alert>
        )}

        {/* History List View */}
        {showHistoryList && allReports && allReports.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Analytics History ({allReports.length} reports)
              </CardTitle>
              <CardDescription>
                Select a previous analytics report to view
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allReports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => selectReport(report.id)}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-medium">
                        Report #{report.id}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(report.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {report.weeklyChange?.length || 0} weekly • {report.monthlyChange?.length || 0} monthly • {report.engagementThisWeek?.length || 0} pages
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Content */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState />
        ) : analyticsData && !showHistoryList ? (
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dashboard">Analytics Dashboard</TabsTrigger>
              <TabsTrigger value="seo-analysis">SEO Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="space-y-8">
            {analyticsData.weeklyInsight && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                    Weekly Analysis Insight
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 italic">{analyticsData.weeklyInsight}</p>
                </CardContent>
              </Card>
            )}
            
            <WeeklyChangeSection data={analyticsData.weeklyChange} />
            
            {analyticsData.monthlyInsight && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingDown className="h-5 w-5 mr-2 text-orange-500" />
                    Monthly Analysis Insight
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 italic">{analyticsData.monthlyInsight}</p>
                </CardContent>
              </Card>
            )}
            
            <MonthlyChangeSection data={analyticsData.monthlyChange} />
            <PageEngagementSection 
              thisWeekData={analyticsData.engagementThisWeek}
              priorWeekData={analyticsData.engagementPriorWeek}
            />
            </TabsContent>
            
            <TabsContent value="seo-analysis">
              <SEOAnalysisSection analyticsData={analyticsData} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 text-gray-400 rounded-full mb-4">
              <ChartLine className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Load Analytics Data</h3>
            <p className="text-gray-600 mb-4">Click "Run n8n Workflow" above to fetch your latest analytics data.<br />The workflow takes about 3.5 minutes to complete.</p>
            <Button onClick={handleRefresh} className="bg-green-600 hover:bg-green-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Run n8n Workflow
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
