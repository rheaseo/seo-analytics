import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { AnalyticsData } from '@/types/analytics';
import { apiRequest } from '@/lib/queryClient';

interface SEOAnalysisSectionProps {
  analyticsData: AnalyticsData | null;
}

const SEO_EXPERTS = [
  'Rand Fishkin',
  'Eli Schwartz', 
  'Tim Soulo',
  'Aleyda Solis',
  'Brian Dean'
];

export function SEOAnalysisSection({ analyticsData }: SEOAnalysisSectionProps) {
  const [selectedExpert, setSelectedExpert] = useState<string>('');
  const [customExpert, setCustomExpert] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const analysisMutation = useMutation({
    mutationFn: async (data: { expert: string; analyticsData: AnalyticsData }) => {
      const response = await apiRequest('POST', '/api/seo-analysis', data);
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysis(data.analysis);
    }
  });

  const handleAnalyze = () => {
    if (!analyticsData) return;
    
    const expert = customExpert.trim() || selectedExpert;
    if (!expert) return;

    analysisMutation.mutate({
      expert,
      analyticsData
    });
  };

  const expertToUse = customExpert.trim() || selectedExpert;

  const copyAnalysis = async () => {
    try {
      await navigator.clipboard.writeText(analysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            SEO Expert Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expert-select">Choose SEO Expert</Label>
              <Select value={selectedExpert} onValueChange={setSelectedExpert}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an SEO expert..." />
                </SelectTrigger>
                <SelectContent>
                  {SEO_EXPERTS.map((expert) => (
                    <SelectItem key={expert} value={expert}>
                      {expert}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="custom-expert">Or Enter Custom Expert</Label>
              <Input
                id="custom-expert"
                placeholder="e.g., Your favorite SEO expert"
                value={customExpert}
                onChange={(e) => setCustomExpert(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!analyticsData || !expertToUse || analysisMutation.isPending}
            className="w-full"
          >
            {analysisMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing with {expertToUse}... (may take 30-60 seconds)
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Get SEO Analysis from {expertToUse || 'Expert'}
              </>
            )}
          </Button>

          {!analyticsData && (
            <Alert>
              <AlertDescription>
                Please load analytics data first to get expert insights.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {analysisMutation.error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            Failed to get analysis: {analysisMutation.error instanceof Error ? analysisMutation.error.message : 'Unknown error'}
          </AlertDescription>
        </Alert>
      )}

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Expert Analysis from {expertToUse}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyAnalysis}
                className="flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border-l-4 border-purple-500">
              <div className="prose prose-sm max-w-none">
                <div 
                  className="text-gray-800 leading-relaxed space-y-4"
                  style={{ whiteSpace: 'pre-line' }}
                >
                  {analysis.split('\n').map((paragraph, index) => {
                    if (paragraph.trim() === '') return null;
                    
                    // Check if it's a heading (starts with #, ##, or is all caps with keywords)
                    const isHeading = paragraph.match(/^#+\s/) || 
                                     (paragraph.length < 100 && 
                                      paragraph.toUpperCase() === paragraph && 
                                      (paragraph.includes('ANALYSIS') || 
                                       paragraph.includes('RECOMMENDATIONS') || 
                                       paragraph.includes('INSIGHTS') ||
                                       paragraph.includes('OBSERVATIONS')));
                    
                    if (isHeading) {
                      return (
                        <h3 key={index} className="text-lg font-semibold text-purple-800 mt-6 mb-3 border-b border-purple-200 pb-2">
                          {paragraph.replace(/^#+\s/, '')}
                        </h3>
                      );
                    }
                    
                    // Check if it's a list item
                    const isListItem = paragraph.match(/^[-•*]\s/) || paragraph.match(/^\d+\.\s/);
                    
                    if (isListItem) {
                      return (
                        <div key={index} className="flex items-start gap-2 ml-4">
                          <span className="text-purple-600 mt-1">•</span>
                          <span>{paragraph.replace(/^[-•*]\s/, '').replace(/^\d+\.\s/, '')}</span>
                        </div>
                      );
                    }
                    
                    // Regular paragraph
                    return (
                      <p key={index} className="mb-3">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}