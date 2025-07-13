import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MetricRow } from '@/types/analytics';

interface MonthlyChangeSectionProps {
  data: MetricRow[];
}

export function MonthlyChangeSection({ data }: MonthlyChangeSectionProps) {
  const getChangeIcon = (isPositive: boolean | null) => {
    if (isPositive === null) return <Minus className="h-3 w-3" />;
    return isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
  };

  const getChangeBadgeClass = (isPositive: boolean | null) => {
    if (isPositive === null) return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    return isPositive 
      ? 'bg-green-100 text-green-800 hover:bg-green-100' 
      : 'bg-red-100 text-red-800 hover:bg-red-100';
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-green-50 border-b">
        <CardTitle className="flex items-center text-xl">
          <Calendar className="h-5 w-5 text-green-600 mr-3" />
          Monthly Change Analysis
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">Comparison of last 30 days vs previous 60 days</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-500 uppercase tracking-wider">Metric</TableHead>
                <TableHead className="font-semibold text-gray-500 uppercase tracking-wider">Last 30 Days</TableHead>
                <TableHead className="font-semibold text-gray-500 uppercase tracking-wider">Previous 60 Days</TableHead>
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
