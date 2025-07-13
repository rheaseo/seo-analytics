import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MetricRow } from '@/types/analytics';

interface WeeklyChangeSectionProps {
  data: MetricRow[];
}

export function WeeklyChangeSection({ data }: WeeklyChangeSectionProps) {
  const getChangeIcon = (isPositive: boolean | null) => {
    if (isPositive === null) return <Minus className="h-3 w-3" />;
    return isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
  };

  const getChangeBadgeVariant = (isPositive: boolean | null) => {
    if (isPositive === null) return 'secondary';
    return isPositive ? 'default' : 'destructive';
  };

  const getChangeBadgeClass = (isPositive: boolean | null) => {
    if (isPositive === null) return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    return isPositive 
      ? 'bg-green-100 text-green-800 hover:bg-green-100' 
      : 'bg-red-100 text-red-800 hover:bg-red-100';
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="flex items-center text-xl">
          <CalendarDays className="h-5 w-5 text-blue-600 mr-3" />
          Weekly Change Analysis
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">Comparison of last 7 days vs previous week</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-500 uppercase tracking-wider">Metric</TableHead>
                <TableHead className="font-semibold text-gray-500 uppercase tracking-wider">Last 7 Days</TableHead>
                <TableHead className="font-semibold text-gray-500 uppercase tracking-wider">Previous Week</TableHead>
                <TableHead className="font-semibold text-gray-500 uppercase tracking-wider">Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <TableCell className="font-medium text-gray-900">{row.metric}</TableCell>
                  <TableCell className="text-gray-900">{row.current}</TableCell>
                  <TableCell className="text-gray-900">{row.previous}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={getChangeBadgeVariant(row.isPositive)}
                      className={`${getChangeBadgeClass(row.isPositive)} flex items-center w-fit`}
                    >
                      {getChangeIcon(row.isPositive)}
                      <span className="ml-1">{row.change}</span>
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
