import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

type StatsCardProps = {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
};

export function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <Card className="bg-card text-card-foreground shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          {icon ?? <TrendingUp className="size-5" />}
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </div>
        <div className="text-2xl font-bold">{value}</div>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
}
