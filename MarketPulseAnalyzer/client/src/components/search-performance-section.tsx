import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';
import { SearchResultRow } from '@/types/analytics';

interface SearchPerformanceSectionProps {
  thisWeekData: SearchResultRow[];
  lastWeekData: SearchResultRow[];
}

export function SearchPerformanceSection({ thisWeekData, lastWeekData }: SearchPerformanceSectionProps) {
  const formatPercentage = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? value : `${(num * 100).toFixed(0)}%`;
  };

  const truncatePagePath = (path: string, maxLength: number = 60) => {
    return path.length > maxLength ? `${path.substring(0, maxLength)}...` : path;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-amber-50 border-b">
        <CardTitle className="flex items-center text-xl">
          <Search className="h-5 w-5 text-amber-600 mr-3" />
          Search Performance
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">Google Search Console data and keyword rankings</p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* This Week */}
        {thisWeekData.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Search Results - This Week 
              <span className="text-sm font-normal text-gray-500 ml-2">({thisWeekData.length} pages tracked)</span>
            </h3>
            <div className="overflow-x-auto">
              <Table className="border border-gray-200 rounded-lg">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-500 uppercase text-xs">Page</TableHead>
                    <TableHead className="font-semibold text-gray-500 uppercase text-xs">Active Users</TableHead>
                    <TableHead className="font-semibold text-gray-500 uppercase text-xs">Engagement Rate</TableHead>
                    <TableHead className="font-semibold text-gray-500 uppercase text-xs">Avg Position</TableHead>
                    <TableHead className="font-semibold text-gray-500 uppercase text-xs">CTR</TableHead>
                    <TableHead className="font-semibold text-gray-500 uppercase text-xs">Clicks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {thisWeekData.map((row, index) => (
                    <TableRow key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <TableCell className="text-sm text-gray-900 max-w-sm">
                        <div className="truncate" title={row.page}>
                          {truncatePagePath(row.page)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">{row.activeUsers}</TableCell>
                      <TableCell className="text-sm text-gray-900">{formatPercentage(row.engagementRate)}</TableCell>
                      <TableCell className="text-sm text-gray-900">{row.avgPosition}</TableCell>
                      <TableCell className="text-sm text-gray-900">{formatPercentage(row.ctr)}</TableCell>
                      <TableCell className="text-sm text-gray-900 font-medium">{row.clicks}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Last Week */}
        {lastWeekData.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Search Results - Last Week 
              <span className="text-sm font-normal text-gray-500 ml-2">({lastWeekData.length} pages tracked)</span>
            </h3>
            <div className="overflow-x-auto">
              <Table className="border border-gray-200 rounded-lg">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-500 uppercase text-xs">Page</TableHead>
                    <TableHead className="font-semibold text-gray-500 uppercase text-xs">Active Users</TableHead>
                    <TableHead className="font-semibold text-gray-500 uppercase text-xs">Engagement Rate</TableHead>
                    <TableHead className="font-semibold text-gray-500 uppercase text-xs">Avg Position</TableHead>
                    <TableHead className="font-semibold text-gray-500 uppercase text-xs">CTR</TableHead>
                    <TableHead className="font-semibold text-gray-500 uppercase text-xs">Clicks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lastWeekData.map((row, index) => (
                    <TableRow key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <TableCell className="text-sm text-gray-900 max-w-sm">
                        <div className="truncate" title={row.page}>
                          {truncatePagePath(row.page)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">{row.activeUsers}</TableCell>
                      <TableCell className="text-sm text-gray-900">{formatPercentage(row.engagementRate)}</TableCell>
                      <TableCell className="text-sm text-gray-900">{row.avgPosition}</TableCell>
                      <TableCell className="text-sm text-gray-900">{formatPercentage(row.ctr)}</TableCell>
                      <TableCell className="text-sm text-gray-900 font-medium">{row.clicks}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
