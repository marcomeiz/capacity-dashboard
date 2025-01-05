import { Card, CardHeader, CardTitle, CardContent } from '../atoms/Card';

interface MetricsData {
  totalHours: number;
  availableHours: number;
  utilizationRate: number;
  activeCollaborators: number;
}

interface MetricsSummaryProps {
  data: MetricsData;
  className?: string;
}

export function MetricsSummary({ data, className = '' }: MetricsSummaryProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>Total Horas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-gray-900">{data.totalHours.toFixed(1)}h</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Horas Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-gray-900">{data.availableHours.toFixed(1)}h</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasa de Utilización</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-gray-900">{(data.utilizationRate * 100).toFixed(1)}%</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Colaboradores Activos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-gray-900">{data.activeCollaborators}</p>
        </CardContent>
      </Card>
    </div>
  );
}