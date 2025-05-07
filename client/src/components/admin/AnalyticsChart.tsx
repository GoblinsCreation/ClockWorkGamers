import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { InfoIcon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ChartType = 'area' | 'line' | 'bar' | 'pie';

interface AnalyticsChartProps {
  title: string;
  subtitle?: string;
  data: any[];
  type: ChartType;
  colors?: string[];
  dataKeys: string[];
  showXAxis?: boolean;
  showYAxis?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  height?: number;
  isLoading?: boolean;
  compareMode?: boolean;
  formattedLabels?: Record<string, string>;
  valueFormat?: (value: any) => string;
  xAxisDataKey?: string;
}

export function AnalyticsChart({
  title,
  subtitle,
  data,
  type,
  colors = ['#0ea5e9', '#f97316', '#8b5cf6', '#22c55e', '#ef4444', '#eab308', '#14b8a6'],
  dataKeys,
  showXAxis = true,
  showYAxis = true,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  height = 300,
  isLoading = false,
  compareMode = false,
  formattedLabels = {},
  valueFormat = (value) => `${value}`,
  xAxisDataKey = 'name',
}: AnalyticsChartProps) {
  const [viewMode, setViewMode] = React.useState<string>(compareMode ? 'comparison' : 'current');

  // If loading, show placeholder
  if (isLoading) {
    return (
      <Card className="card-gradient border-[hsl(var(--cwg-dark-blue))]">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-orbitron font-semibold text-[hsl(var(--cwg-orange))]">
                {title}
              </CardTitle>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {compareMode && (
              <div className="w-40 h-8 animate-pulse bg-muted rounded" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center bg-muted/10 rounded-md">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-muted mb-2" />
              <div className="h-4 w-32 bg-muted rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format tooltip
  const renderTooltip = (props: any) => {
    if (!props.active || !props.payload || !props.payload.length) return null;
    
    const { payload } = props;
    
    return (
      <div className="p-2 bg-background/95 border border-border rounded-md shadow-md">
        <p className="font-semibold text-sm mb-1">{payload[0].payload[xAxisDataKey]}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`tooltip-${index}`} className="text-xs flex items-center gap-1">
            <span 
              className="w-3 h-3 rounded-full inline-block" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium">
              {formattedLabels[entry.dataKey] || entry.dataKey}:
            </span>
            <span>{valueFormat(entry.value)}</span>
          </p>
        ))}
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--cwg-muted)/0.2)" />}
              {showXAxis && <XAxis dataKey={xAxisDataKey} tick={{ fill: 'hsla(var(--cwg-muted))' }} />}
              {showYAxis && <YAxis tick={{ fill: 'hsla(var(--cwg-muted))' }} />}
              {showTooltip && <Tooltip content={renderTooltip} />}
              {showLegend && <Legend />}
              {dataKeys.map((key, index) => (
                <Area 
                  key={key}
                  type="monotone" 
                  dataKey={key} 
                  stackId="1"
                  stroke={colors[index % colors.length]} 
                  fill={`${colors[index % colors.length]}80`} // 50% transparency
                  name={formattedLabels[key] || key}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--cwg-muted)/0.2)" />}
              {showXAxis && <XAxis dataKey={xAxisDataKey} tick={{ fill: 'hsla(var(--cwg-muted))' }} />}
              {showYAxis && <YAxis tick={{ fill: 'hsla(var(--cwg-muted))' }} />}
              {showTooltip && <Tooltip content={renderTooltip} />}
              {showLegend && <Legend />}
              {dataKeys.map((key, index) => (
                <Line 
                  key={key}
                  type="monotone" 
                  dataKey={key} 
                  stroke={colors[index % colors.length]} 
                  strokeWidth={2}
                  dot={{ fill: colors[index % colors.length], r: 4 }}
                  activeDot={{ r: 6 }}
                  name={formattedLabels[key] || key}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--cwg-muted)/0.2)" />}
              {showXAxis && <XAxis dataKey={xAxisDataKey} tick={{ fill: 'hsla(var(--cwg-muted))' }} />}
              {showYAxis && <YAxis tick={{ fill: 'hsla(var(--cwg-muted))' }} />}
              {showTooltip && <Tooltip content={renderTooltip} />}
              {showLegend && <Legend />}
              {dataKeys.map((key, index) => (
                <Bar 
                  key={key}
                  dataKey={key} 
                  fill={colors[index % colors.length]} 
                  name={formattedLabels[key] || key}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey={dataKeys[0]}
                label={(entry) => entry[xAxisDataKey]}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colors[index % colors.length]} 
                  />
                ))}
              </Pie>
              {showTooltip && <Tooltip 
                formatter={(value) => [valueFormat(value), formattedLabels[dataKeys[0]] || dataKeys[0]]}
                contentStyle={{ 
                  backgroundColor: 'hsla(var(--background)/0.9)', 
                  borderColor: 'hsla(var(--border))',
                }} 
              />}
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );
        
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <Card className="card-gradient border-[hsl(var(--cwg-dark-blue))]">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-orbitron font-semibold text-[hsl(var(--cwg-orange))]">
              {title}
            </CardTitle>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {compareMode && (
            <Tabs defaultValue={viewMode} onValueChange={setViewMode}>
              <TabsList className="bg-[hsl(var(--cwg-dark-blue))]">
                <TabsTrigger value="current">Current</TabsTrigger>
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <InfoIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No data available</p>
            </div>
          </div>
        ) : (
          renderChart()
        )}
      </CardContent>
    </Card>
  );
}