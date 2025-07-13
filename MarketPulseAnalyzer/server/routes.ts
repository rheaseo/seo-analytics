import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

const WEBHOOK_URL = 'https://primary-production-2a3f.up.railway.app/webhook/7854391e-77f9-4249-bf8a-354567e2e493';

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable CORS for the webhook endpoint
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    next();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Save analytics data to database
  app.post('/api/analytics', async (req, res) => {
    try {
      const analyticsData = req.body;
      const savedReport = await storage.saveAnalyticsReport({
        weeklyChange: analyticsData.weeklyChange,
        monthlyChange: analyticsData.monthlyChange,
        engagementThisWeek: analyticsData.engagementThisWeek,
        engagementPriorWeek: analyticsData.engagementPriorWeek,

        weeklyInsight: analyticsData.weeklyInsight,
        monthlyInsight: analyticsData.monthlyInsight,
        rawHtml: analyticsData.rawHtml,
      });
      res.json(savedReport);
    } catch (error) {
      console.error('Failed to save analytics data:', error);
      res.status(500).json({ error: 'Failed to save analytics data' });
    }
  });

  // Get latest analytics data from database
  app.get('/api/analytics/latest', async (req, res) => {
    try {
      const report = await storage.getLatestAnalyticsReport();
      if (!report) {
        return res.status(404).json({ error: 'No analytics data found' });
      }
      res.json(report);
    } catch (error) {
      console.error('Failed to fetch latest analytics data:', error);
      res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
  });

  // Get all analytics reports from database
  app.get('/api/analytics/all', async (req, res) => {
    try {
      const reports = await storage.getAllAnalyticsReports();
      res.json(reports);
    } catch (error) {
      console.error('Failed to fetch analytics reports:', error);
      res.status(500).json({ error: 'Failed to fetch analytics reports' });
    }
  });

  // Get specific analytics report by ID
  app.get('/api/analytics/:id', async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      if (isNaN(reportId)) {
        return res.status(400).json({ error: 'Invalid report ID' });
      }
      
      const reports = await storage.getAllAnalyticsReports();
      const report = reports.find(r => r.id === reportId);
      
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }
      
      res.json(report);
    } catch (error) {
      console.error('Failed to fetch analytics report:', error);
      res.status(500).json({ error: 'Failed to fetch analytics report' });
    }
  });

  // SEO Analysis endpoint using OpenRouter
  app.post('/api/seo-analysis', async (req, res) => {
    try {
      const { expert, analyticsData } = req.body;
      console.log(`Starting SEO analysis with expert: ${expert}`);

      if (!expert || !analyticsData) {
        return res.status(400).json({ error: 'Expert and analytics data are required' });
      }

      const prompt = `You are ${expert}, a renowned SEO expert. Analyze the following website analytics data and provide actionable SEO insights and recommendations.

Analytics Data:
- Weekly Changes: ${JSON.stringify(analyticsData.weeklyChange, null, 2)}
- Monthly Changes: ${JSON.stringify(analyticsData.monthlyChange, null, 2)}
- Page Engagement This Week: ${JSON.stringify(analyticsData.engagementThisWeek, null, 2)}
- Page Engagement Prior Week: ${JSON.stringify(analyticsData.engagementPriorWeek, null, 2)}
${analyticsData.weeklyInsight ? `- Weekly Insight: ${analyticsData.weeklyInsight}` : ''}
${analyticsData.monthlyInsight ? `- Monthly Insight: ${analyticsData.monthlyInsight}` : ''}

Please provide a comprehensive SEO analysis in your voice as ${expert}, including:
1. Key observations about the website's performance
2. Specific SEO issues or opportunities identified
3. Actionable recommendations prioritized by impact
4. Strategic advice for improving organic traffic and rankings

Write in your characteristic style and expertise level. Be specific, actionable, and focus on data-driven insights.`;

      // Test if we have the API key
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenRouter API key not found');
      }

      console.log('Making request to OpenRouter...');
      
      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const requestBody = {
        model: 'google/gemma-3n-e4b-it:free',
        messages: [
          {
            role: 'user',
            content: `You are ${expert}, a renowned SEO expert. Analyze the following website analytics data and provide actionable SEO insights.

Analytics Data:
${JSON.stringify(analyticsData, null, 2)}

Please format your response with clear sections using markdown-style headers:

# KEY OBSERVATIONS
[Your observations about performance trends]

# SEO OPPORTUNITIES  
[Specific issues and opportunities identified]

# ACTIONABLE RECOMMENDATIONS
[Prioritized recommendations with expected impact]

# STRATEGIC ADVICE
[Long-term strategic guidance]

Write in your characteristic voice as ${expert}. Be specific, actionable, and data-driven. Keep response under 1000 words.`
          }
        ],
        max_tokens: 1200,
        temperature: 0.7
      };

      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://replit.com',
          'X-Title': 'SEO Analytics Dashboard'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenRouter API error: ${response.status} - ${errorText}`);
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      console.log('OpenRouter response received, parsing...');
      const data = await response.json();
      const analysis = data.choices?.[0]?.message?.content;

      if (!analysis) {
        console.error('No analysis content in response:', data);
        throw new Error('No analysis received from OpenRouter');
      }

      console.log(`SEO analysis completed successfully for expert: ${expert}`);
      res.json({ analysis });
    } catch (error) {
      console.error('SEO Analysis error:', error);
      if (error.name === 'AbortError') {
        res.status(408).json({ error: 'Request timeout - analysis took too long' });
      } else {
        res.status(500).json({ error: 'Failed to generate SEO analysis' });
      }
    }
  });

  // Diagnostic endpoint to test different webhook approaches
  app.get('/api/webhook-diagnostic', async (req, res) => {
    const results = [];
    
    // Test 1: Quick health check with minimal timeout
    try {
      console.log('Testing webhook health check...');
      const healthResponse = await fetch(WEBHOOK_URL, {
        method: 'GET',
        headers: { 'User-Agent': 'Analytics-Dashboard/1.0' },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      results.push({
        test: 'Health Check (5s timeout)',
        status: healthResponse.status,
        success: healthResponse.ok,
        contentType: healthResponse.headers.get('content-type'),
        responseText: healthResponse.ok ? await healthResponse.text() : 'Failed'
      });
    } catch (error) {
      results.push({
        test: 'Health Check (5s timeout)',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Test 2: POST request with trigger data
    try {
      console.log('Testing webhook POST trigger...');
      const postResponse = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'User-Agent': 'Analytics-Dashboard/1.0',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trigger: 'dashboard-request' }),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });
      
      const postText = await postResponse.text();
      results.push({
        test: 'POST Trigger (10s timeout)',
        status: postResponse.status,
        success: postResponse.ok,
        contentType: postResponse.headers.get('content-type'),
        responseText: postText.substring(0, 500)
      });
    } catch (error) {
      results.push({
        test: 'POST Trigger (10s timeout)',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    res.json({
      webhookUrl: WEBHOOK_URL,
      timestamp: new Date().toISOString(),
      tests: results
    });
  });

  // Proxy endpoint for n8n webhook to avoid CORS issues  
  app.get('/api/webhook-proxy', async (req, res) => {
    try {
      console.log('Attempting to fetch from n8n webhook:', WEBHOOK_URL);
      
      const response = await fetch(WEBHOOK_URL, {
        method: 'GET',
        headers: {
          'User-Agent': 'Analytics-Dashboard/1.0',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(300000), // 5 minute timeout for n8n workflow
      });

      if (!response.ok) {
        console.error(`Webhook responded with status: ${response.status} ${response.statusText}`);
        throw new Error(`Webhook responded with status: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      console.log('Response content type:', contentType);

      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.log('Received non-JSON response, first 500 chars:', text.substring(0, 500));
        
        // Try to wrap text response in expected format
        data = [{ output: text }];
      }
      
      console.log('Successfully fetched data from n8n webhook');
      res.json(data);
    } catch (error) {
      console.error('Failed to fetch from n8n webhook:', error);
      
      // More detailed error information
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out after 5 minutes - n8n workflow is taking longer than expected';
        }
      }
      
      res.status(502).json({ 
        error: 'Failed to fetch from n8n webhook',
        message: errorMessage,
        webhookUrl: WEBHOOK_URL,
        timestamp: new Date().toISOString(),
        suggestion: 'Try checking if your n8n workflow is active or needs to be triggered manually'
      });
    }
  });

  // Mock webhook endpoint for testing when the real webhook is down
  app.get('/api/test-webhook', (req, res) => {
    const mockHtmlReport = `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; }
              h2 { color: #333; }
              table { width: 100%; border-collapse: collapse; margin: 10px 0; }
              table, th, td { border: 1px solid #ddd; }
              th, td { padding: 8px; text-align: left; }
              th { background-color: #f4f4f4; }
          </style>
      </head>
      <body>
          <p>Hi,</p>
          <p>Here is your weekly Online Marketing Report for the last 7 and 30 days</p>
          
          <h2>Weekly Change</h2>
          <p>Summary and table from Google_Analytics_Weekly:</p>
          <p>This includes detailed engagement stats for this week and prior week, search results, and country views as retrieved.</p>
          <table>
              <tr>
                  <th>Metric</th>
                  <th>Last 7 Days</th>
                  <th>Previous Week</th>
                  <th>Percentage Change</th>
              </tr>
              <tr><td>Total Page Views</td><td>473</td><td>399</td><td>18.55%</td></tr>
              <tr><td>Total Users</td><td>337</td><td>307</td><td>9.77%</td></tr>
              <tr><td>Total Sessions</td><td>397</td><td>356</td><td>11.52%</td></tr>
              <tr><td>Average Sessions per User</td><td>1.33</td><td>1.29</td><td>3.39%</td></tr>
              <tr><td>Average Session Duration</td><td>172.08s</td><td>156.05s</td><td>10.27%</td></tr>
              <tr><td>Total Purchases</td><td>0</td><td>0</td><td>N/A</td></tr>
              <tr><td>Average Revenue per Purchase</td><td>0</td><td>0</td><td>N/A</td></tr>
              <tr><td>Total Revenue</td><td>0</td><td>0</td><td>N/A</td></tr>
          </table>

          <h2>Monthly Change</h2>
          <p>The analysis reveals a general decline in key metrics such as page views, users, and sessions over the last 30 days compared to the previous 60 days, indicating reduced engagement.</p>
          <table>
              <tr>
                  <th>Metric</th>
                  <th>Last 30 Days</th>
                  <th>Previous 60 Days</th>
                  <th>Percentage Change</th>
              </tr>
              <tr><td>Total Page Views</td><td>1,708</td><td>2,705</td><td>-36.9%</td></tr>
              <tr><td>Total Users</td><td>1,259</td><td>1,851</td><td>-32.0%</td></tr>
              <tr><td>Total Sessions</td><td>1,476</td><td>2,145</td><td>-31.2%</td></tr>
              <tr><td>Average Sessions per User</td><td>1.31</td><td>1.31</td><td>0.0%</td></tr>
              <tr><td>Average Session Duration</td><td>2.5 min</td><td>2.6 min</td><td>-3.9%</td></tr>
              <tr><td>Total Purchases</td><td>0</td><td>0</td><td>0%</td></tr>
              <tr><td>Average Revenue per Purchase</td><td>$0</td><td>$0</td><td>0%</td></tr>
              <tr><td>Total Revenue</td><td>$0</td><td>$0</td><td>0%</td></tr>
          </table>

          <h3>Engagement Stats - This Week</h3>
          <table>
              <tr>
                  <th>Page</th>
                  <th>Page Views</th>
                  <th>Active Users</th>
                  <th>Views per User</th>
                  <th>Event Count</th>
              </tr>
              <tr><td>Keith Rumjahn</td><td>211</td><td>177</td><td>1.19</td><td>1018</td></tr>
              <tr><td>n8n SEO A.I. Agent System - Automate your SEO analysis with A.I.</td><td>83</td><td>53</td><td>1.57</td><td>407</td></tr>
              <tr><td>AI Augmented Living - Leveraging AI and Smart Tools for a More Efficient Life</td><td>79</td><td>43</td><td>1.84</td><td>244</td></tr>
              <tr><td>How I used A.I. to be an SEO expert and analyzed my Google analytics data in n8n and make.com - AI Augmented Living</td><td>37</td><td>17</td><td>2.18</td><td>125</td></tr>
              <tr><td>How I used A.I. to analyze 8 years of Apple Health Fitness Data to uncover actionable insights - AI Augmented Living</td><td>31</td><td>22</td><td>1.41</td><td>108</td></tr>
              <tr><td>OpenAI Codex vs Aider vs Claude Code: Which Terminal AI Coding Editor Is Best in 2025? - AI Augmented Living</td><td>30</td><td>26</td><td>1.15</td><td>117</td></tr>
              <tr><td>Automate PDF to CSV Conversion: The n8n Method That Saved Me 15 Hours/Week - AI Augmented Living</td><td>26</td><td>20</td><td>1.30</td><td>146</td></tr>
              <tr><td>Gumroad</td><td>22</td><td>12</td><td>1.83</td><td>85</td></tr>
              <tr><td>How I used A.I. to automatically track my expenses in Actual Budget - AI Augmented Living</td><td>19</td><td>12</td><td>1.58</td><td>58</td></tr>
              <tr><td>Ultimate list of BEST self hosted apps in 2025 (Without any monthly subscription fees) - AI Augmented Living</td><td>14</td><td>10</td><td>1.40</td><td>49</td></tr>
              <tr><td>How I used A.I. to categorize 82 blog posts automatically in 2 minutes with no coding experience - AI Augmented Living</td><td>13</td><td>10</td><td>1.30</td><td>54</td></tr>
              <tr><td>How to Create an A.I. Agent for Obsidian Using n8n RAG - A Step-by-Step Guide Without Coding - AI Augmented Living</td><td>12</td><td>11</td><td>1.09</td><td>45</td></tr>
              <tr><td>How A.I. Saved My Kids' School Life (And My Marriage) - AI Augmented Living</td><td>8</td><td>5</td><td>1.60</td><td>25</td></tr>
              <tr><td>Create a FREE email capture forms and verify email using Hunter.io and n8n - AI Augmented Living</td><td>6</td><td>5</td><td>1.20</td><td>22</td></tr>
              <tr><td>FireCrawl vs Crawl4AI vs ScrapeGraphAI: Which Web Scraping Tool Offers the Best Free Plan? - AI Augmented Living</td><td>6</td><td>5</td><td>1.20</td><td>22</td></tr>
              <tr><td>5-Minute Setup: OpenRouter Community Node for n8n [Step-by-Step Tutorial] - AI Augmented Living</td><td>5</td><td>5</td><td>1.00</td><td>18</td></tr>
              <tr><td>AI Tools Archives - AI Augmented Living</td><td>5</td><td>3</td><td>1.67</td><td>12</td></tr>
              <tr><td>How to create an A.I. Agent to analyze Matomo analytics using n8n for free - AI Augmented Living</td><td>5</td><td>5</td><td>1.00</td><td>21</td></tr>
              <tr><td>How to learn and become an A.I. expert after 40 (I started after 40!) - AI Augmented Living</td><td>5</td><td>5</td><td>1.00</td><td>16</td></tr>
              <tr><td>My top 3 SEO Docker Apps self hosted on my Synology NAS (So You Can Boost Your Website Traffic Today) - AI Augmented Living</td><td>5</td><td>3</td><td>1.67</td><td>16</td></tr>
          </table>
          
          <h3>Engagement Stats - Prior Week</h3>
          <table>
              <tr>
                  <th>Page</th>
                  <th>Page Views</th>
                  <th>Active Users</th>
                  <th>Views per User</th>
                  <th>Event Count</th>
              </tr>
              <tr><td>n8n SEO A.I. Agent System - Automate your SEO analysis with A.I.</td><td>102</td><td>65</td><td>1.57</td><td>520</td></tr>
              <tr><td>Keith Rumjahn</td><td>92</td><td>73</td><td>1.26</td><td>437</td></tr>
              <tr><td>AI Augmented Living - Leveraging AI and Smart Tools for a More Efficient Life</td><td>49</td><td>40</td><td>1.23</td><td>173</td></tr>
              <tr><td>How I used A.I. to be an SEO expert and analyzed my Google analytics data in n8n and make.com - AI Augmented Living</td><td>34</td><td>17</td><td>2.00</td><td>136</td></tr>
              <tr><td>OpenAI Codex vs Aider vs Claude Code: Which Terminal AI Coding Editor Is Best in 2025? - AI Augmented Living</td><td>33</td><td>27</td><td>1.22</td><td>110</td></tr>
              <tr><td>Automate PDF to CSV Conversion: The n8n Method That Saved Me 15 Hours/Week - AI Augmented Living</td><td>32</td><td>23</td><td>1.39</td><td>141</td></tr>
              <tr><td>How I used A.I. to analyze 8 years of Apple Health Fitness Data to uncover actionable insights - AI Augmented Living</td><td>31</td><td>26</td><td>1.19</td><td>123</td></tr>
              <tr><td>Gumroad</td><td>20</td><td>12</td><td>1.67</td><td>80</td></tr>
              <tr><td>How A.I. Saved My Kids' School Life (And My Marriage) - AI Augmented Living</td><td>13</td><td>8</td><td>1.63</td><td>46</td></tr>
              <tr><td>How I used A.I. to categorize 82 blog posts automatically in 2 minutes with no coding experience - AI Augmented Living</td><td>8</td><td>8</td><td>1.00</td><td>37</td></tr>
          </table>

          <h3>Search Results - This Week</h3>
          <table>
              <tr>
                  <th>Page</th>
                  <th>Active Users</th>
                  <th>Engaged Sessions</th>
                  <th>Engagement Rate</th>
                  <th>Event Count</th>
                  <th>Avg Position</th>
                  <th>CTR</th>
                  <th>Clicks</th>
                  <th>Impressions</th>
              </tr>
              <tr><td>/openai-codex-vs-aider-vs-claude-code-which-terminal-ai-coding-editor-is-best-in-2025/</td><td>28</td><td>25</td><td>0.71</td><td>130</td><td>7.42</td><td>0.07</td><td>29</td><td>389</td></tr>
          </table>

          <h3>Search Results - Last Week</h3>
          <table>
              <tr>
                  <th>Page</th>
                  <th>Active Users</th>
                  <th>Engaged Sessions</th>
                  <th>Engagement Rate</th>
                  <th>Event Count</th>
                  <th>Avg Position</th>
                  <th>CTR</th>
                  <th>Clicks</th>
                  <th>Impressions</th>
              </tr>
              <tr><td>/openai-codex-vs-aider-vs-claude-code-which-terminal-ai-coding-editor-is-best-in-2025/</td><td>32</td><td>23</td><td>0.68</td><td>126</td><td>8.41</td><td>0.12</td><td>39</td><td>328</td></tr>
          </table>

          <h3>Country Views - This Week</h3>
          <table>
              <tr>
                  <th>Country</th>
                  <th>Active Users</th>
                  <th>New Users</th>
                  <th>Engagement Rate</th>
                  <th>Engaged Sessions</th>
                  <th>Event Count</th>
                  <th>Total Users</th>
                  <th>Sessions</th>
              </tr>
              <tr><td>United States</td><td>80</td><td>81</td><td>0.44</td><td>49</td><td>395</td><td>87</td><td>111</td></tr>
          </table>

          <h3>Country Views - Last Week</h3>
          <table>
              <tr>
                  <th>Country</th>
                  <th>Active Users</th>
                  <th>New Users</th>
                  <th>Engagement Rate</th>
                  <th>Engaged Sessions</th>
                  <th>Event Count</th>
                  <th>Total Users</th>
                  <th>Sessions</th>
              </tr>
              <tr><td>United States</td><td>80</td><td>78</td><td>0.44</td><td>48</td><td>420</td><td>84</td><td>110</td></tr>
          </table>
      </body>
      </html>
    `;

    res.json([{ output: mockHtmlReport }]);
  });

  const httpServer = createServer(app);

  return httpServer;
}
