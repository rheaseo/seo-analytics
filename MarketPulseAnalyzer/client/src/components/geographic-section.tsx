import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Globe } from 'lucide-react';
import { CountryRow } from '@/types/analytics';

interface GeographicSectionProps {
  thisWeekData: CountryRow[];
  lastWeekData: CountryRow[];
}

export function GeographicSection({ thisWeekData, lastWeekData }: GeographicSectionProps) {
  const formatPercentage = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? value : `${(num * 100).toFixed(0)}%`;
  };

  const getCountryFlag = (country: string) => {
    // Simple flag representation using colored squares
    const flagColors: { [key: string]: string } = {
      'United States': 'bg-blue-600',
      'Canada': 'bg-red-600',
      'United Kingdom': 'bg-blue-800',
      'Germany': 'bg-black',
      'France': 'bg-blue-500',
    };
    
    return flagColors[country] || 'bg-gray-400';
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-indigo-50 border-b">
        <CardTitle className="flex items-center text-xl">
          <Globe className="h-5 w-5 text-indigo-600 mr-3" />
          Geographic Performance
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">User engagement by country and region</p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* This Week */}
        {thisWeekData.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Country Views - This Week 
              <span className="text-sm font-normal text-gray-500 ml-2">({thisWeekData.length} countries tracked)</span>
            </h3>
            <div className="overflow-x-auto">
              <Table className="border border-gray-200 rounded-lg">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-500 uppercase text-xs">Country</TableHead>
                    <TableHead className="font-semibold text-gray-500 uppercase text-xs">Active Users</TableHead>
                    <TableHead className="font-semibold text-gray-500 uppercase text-xs">New Users</TableHead>
                    <TableHead className="font-semibold text-gray-500 uppercase text-xs">Engagement Rate</TableHead>
                    <TableHead className="font-semibold text-gray-500 uppercase text-xs">Sessions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {thisWeekData.map((row, index) => (
                    <TableRow key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <TableCell className="text-sm text-gray-900 font-medium">
                        <div className="flex items-center">
                          <span className={`inline-block w-6 h-4 ${getCountryFlag(row.country)} rounded mr-2`}></span>
                          {row.country}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">{row.activeUsers}</TableCell>
                      <TableCell className="text-sm text-gray-900">{row.newUsers}</TableCell>
                      <TableCell className="text-sm text-gray-900">{formatPercentage(row.engagementRate)}</TableCell>
                      <TableCell className="text-sm text-gray-900">{row.sessions}</TableCell>
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
              Country Views - Last Week 
              <span className="text-sm font-normal text-gray-500 ml-2">({lastWeekData.length} countries tracked)</span>
            </h3>
            <div className="overflow-x-auto">
              <Table className="border border-gray-200 rounded-lg">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-500 uppercase text-xs">Country</TableHead>
                    <TableHead className="font-semibold text-gray-500 uppercase text-xs">Active Users</TableHead>
                    <TableHead className="font-semibold text-gray-500 uppercase text-xs">New Users</TableHead>
                    <TableHead className="font-semibold text-gray-500 uppercase text-xs">Engagement Rate</TableHead>
                    <TableHead className="font-semibold text-gray-500 uppercase text-xs">Sessions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lastWeekData.map((row, index) => (
                    <TableRow key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <TableCell className="text-sm text-gray-900 font-medium">
                        <div className="flex items-center">
                          <span className={`inline-block w-6 h-4 ${getCountryFlag(row.country)} rounded mr-2`}></span>
                          {row.country}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">{row.activeUsers}</TableCell>
                      <TableCell className="text-sm text-gray-900">{row.newUsers}</TableCell>
                      <TableCell className="text-sm text-gray-900">{formatPercentage(row.engagementRate)}</TableCell>
                      <TableCell className="text-sm text-gray-900">{row.sessions}</TableCell>
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
