import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3 } from 'lucide-react';
import { EngagementRow } from '@/types/analytics';

interface PageEngagementSectionProps {
  thisWeekData: EngagementRow[];
  priorWeekData: EngagementRow[];
}

export function PageEngagementSection({ thisWeekData, priorWeekData }: PageEngagementSectionProps) {
  const truncatePageTitle = (title: string, maxLength: number = 80) => {
    return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-purple-50 border-b">
        <CardTitle className="flex items-center text-xl">
          <BarChart3 className="h-5 w-5 text-purple-600 mr-3" />
          Page Engagement Analytics
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">Detailed engagement metrics and performance data</p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* This Week */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Engagement Stats - This Week 
            <span className="text-sm font-normal text-gray-500 ml-2">({thisWeekData.length} pages tracked)</span>
          </h3>
          <div className="overflow-x-auto">
            <Table className="border border-gray-200 rounded-lg">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-500 uppercase text-xs">Page</TableHead>
                  <TableHead className="font-semibold text-gray-500 uppercase text-xs">Page Views</TableHead>
                  <TableHead className="font-semibold text-gray-500 uppercase text-xs">Active Users</TableHead>
                  <TableHead className="font-semibold text-gray-500 uppercase text-xs">Views per User</TableHead>
                  <TableHead className="font-semibold text-gray-500 uppercase text-xs">Event Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {thisWeekData.map((row, index) => (
                  <TableRow key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <TableCell className="text-sm text-gray-900 max-w-md">
                      <div className="truncate" title={row.page}>
                        {truncatePageTitle(row.page)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-900 font-medium">{row.pageViews}</TableCell>
                    <TableCell className="text-sm text-gray-900">{row.activeUsers}</TableCell>
                    <TableCell className="text-sm text-gray-900">{row.viewsPerUser}</TableCell>
                    <TableCell className="text-sm text-gray-900">{row.eventCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Prior Week */}
        {priorWeekData.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Engagement Stats - Prior Week 
              <span className="text-sm font-normal text-gray-500 ml-2">({priorWeekData.length} pages tracked)</span>
            </h3>
            <div className="overflow-x-auto">
              <Table className="border border-gray-200 rounded-lg">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-500 uppercase text-xs">Page</TableHead>
                    <TableHead className="font-semibold text-gray-500 uppercase text-xs">Page Views</TableHead>
                    <TableHead className="font-semibold text-gray-500 uppercase text-xs">Active Users</TableHead>
                    <TableHead className="font-semibold text-gray-500 uppercase text-xs">Views per User</TableHead>
                    <TableHead className="font-semibold text-gray-500 uppercase text-xs">Event Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priorWeekData.map((row, index) => (
                    <TableRow key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <TableCell className="text-sm text-gray-900 max-w-md">
                        <div className="truncate" title={row.page}>
                          {truncatePageTitle(row.page)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-900 font-medium">{row.pageViews}</TableCell>
                      <TableCell className="text-sm text-gray-900">{row.activeUsers}</TableCell>
                      <TableCell className="text-sm text-gray-900">{row.viewsPerUser}</TableCell>
                      <TableCell className="text-sm text-gray-900">{row.eventCount}</TableCell>
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
