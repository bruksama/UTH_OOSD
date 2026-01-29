import React from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
} from 'recharts';

/**
 * Reusable chart components for Dashboard
 * Following DRY principle - these components can be used across admin and student dashboards
 * 
 * @author SPTS Team
 */

// =====================
// Types
// =====================

interface ChartDataItem {
    [key: string]: string | number | undefined;
}

// =====================
// GRADIENT DEFINITIONS
// =====================

export const GRADIENT_COLORS = {
    primary: ['#6366f1', '#8b5cf6'],
    success: ['#10b981', '#34d399'],
    warning: ['#f59e0b', '#fbbf24'],
    danger: ['#ef4444', '#f87171'],
    info: ['#0ea5e9', '#38bdf8'],
    purple: ['#a855f7', '#c084fc'],
};

export const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9'];

// =====================
// CUSTOM TOOLTIP
// =====================

interface TooltipProps {
    active?: boolean;
    payload?: { name: string; value: number; color?: string }[];
    label?: string;
}

export const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg bg-slate-800 px-4 py-3 shadow-xl">
                <p className="text-sm font-semibold text-white">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm text-slate-300">
                        {entry.name}: <span className="font-medium text-white">{entry.value}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// =====================
// STAT CARD
// =====================

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: { value: number; isPositive: boolean };
    gradient?: string[];
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    trend,
    gradient = GRADIENT_COLORS.primary
}) => (
    <div
        className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
        style={{
            background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`
        }}
    >
        {/* Decorative circles */}
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
        <div className="absolute -right-8 top-8 h-16 w-16 rounded-full bg-white/5" />

        <div className="relative z-10">
            {icon && <div className="mb-3 text-3xl opacity-90">{icon}</div>}
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="mt-1 text-3xl font-bold">{value}</p>
            {trend && (
                <div className={`mt-2 flex items-center text-sm ${trend.isPositive ? 'text-green-200' : 'text-red-200'}`}>
                    <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
                    <span className="ml-1 text-white/60">vs last period</span>
                </div>
            )}
        </div>
    </div>
);

// =====================
// CHART CARD WRAPPER
// =====================

interface ChartCardProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
    title,
    subtitle,
    children,
    className = ''
}) => (
    <div className={`rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl ${className}`}>
        <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        {children}
    </div>
);

// =====================
// BAR CHART COMPONENT
// =====================

interface BarChartWidgetProps {
    data: ChartDataItem[];
    bars: { dataKey: string; name: string; fill?: string; gradient?: boolean }[];
    xAxisKey: string;
    height?: number;
    layout?: 'horizontal' | 'vertical';
}

export const BarChartWidget: React.FC<BarChartWidgetProps> = ({
    data,
    bars,
    xAxisKey,
    height = 300,
    layout = 'horizontal',
}) => (
    <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout={layout}>
                <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                {layout === 'vertical' ? (
                    <>
                        <XAxis type="number" allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis dataKey={xAxisKey} type="category" width={80} tick={{ fill: '#64748b', fontSize: 12 }} />
                    </>
                ) : (
                    <>
                        <XAxis dataKey={xAxisKey} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    </>
                )}
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {bars.map((bar, idx) => (
                    <Bar
                        key={bar.dataKey}
                        dataKey={bar.dataKey}
                        name={bar.name}
                        fill={bar.gradient ? 'url(#barGradient)' : bar.fill || CHART_COLORS[idx % CHART_COLORS.length]}
                        radius={layout === 'vertical' ? [0, 8, 8, 0] : [8, 8, 0, 0]}
                    />
                ))}
            </BarChart>
        </ResponsiveContainer>
    </div>
);

// =====================
// DONUT/PIE CHART COMPONENT
// =====================

interface PieChartWidgetProps {
    data: { name: string; value: number; color?: string }[];
    height?: number;
    innerRadius?: number;
    showLabels?: boolean;
    centerLabel?: { value: string | number; label: string };
}

export const PieChartWidget: React.FC<PieChartWidgetProps> = ({
    data,
    height = 280,
    innerRadius = 60,
    showLabels = false,
    centerLabel,
}) => (
    <div style={{ height }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={innerRadius}
                    outerRadius={100}
                    paddingAngle={innerRadius > 0 ? 3 : 0}
                    label={showLabels ? ({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)` : undefined}
                    labelLine={showLabels ? { stroke: '#64748b' } : false}
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                        />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
            </PieChart>
        </ResponsiveContainer>
        {centerLabel && innerRadius > 0 && (
            <div
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                style={{ transform: 'translateX(-40px)' }}
            >
                <p className="text-3xl font-bold text-slate-800">{centerLabel.value}</p>
                <p className="text-sm text-slate-500">{centerLabel.label}</p>
            </div>
        )}
    </div>
);

// =====================
// AREA CHART COMPONENT
// =====================

interface AreaChartWidgetProps {
    data: ChartDataItem[];
    areas: { dataKey: string; name: string; color: string }[];
    xAxisKey: string;
    height?: number;
}

export const AreaChartWidget: React.FC<AreaChartWidgetProps> = ({
    data,
    areas,
    xAxisKey,
    height = 300,
}) => (
    <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <defs>
                    {areas.map((area) => (
                        <linearGradient key={`gradient-${area.dataKey}`} id={`gradient-${area.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={area.color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={area.color} stopOpacity={0} />
                        </linearGradient>
                    ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey={xAxisKey} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {areas.map((area) => (
                    <Area
                        key={area.dataKey}
                        type="monotone"
                        dataKey={area.dataKey}
                        name={area.name}
                        stroke={area.color}
                        fill={`url(#gradient-${area.dataKey})`}
                        strokeWidth={2}
                    />
                ))}
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

// =====================
// RADAR CHART COMPONENT
// =====================

interface RadarChartWidgetProps {
    data: ChartDataItem[];
    radars: { dataKey: string; name: string; color: string }[];
    angleAxisKey: string;
    height?: number;
}

export const RadarChartWidget: React.FC<RadarChartWidgetProps> = ({
    data,
    radars,
    angleAxisKey,
    height = 300,
}) => (
    <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey={angleAxisKey} tick={{ fill: '#64748b', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                {radars.map((radar) => (
                    <Radar
                        key={radar.dataKey}
                        name={radar.name}
                        dataKey={radar.dataKey}
                        stroke={radar.color}
                        fill={radar.color}
                        fillOpacity={0.3}
                    />
                ))}
                <Legend />
                <Tooltip content={<CustomTooltip />} />
            </RadarChart>
        </ResponsiveContainer>
    </div>
);

// =====================
// LOADING SPINNER
// =====================

export const LoadingSpinner: React.FC = () => (
    <div className="flex h-screen items-center justify-center">
        <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-indigo-200" />
            <div className="absolute left-0 top-0 h-16 w-16 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
    </div>
);

// =====================
// EMPTY STATE
// =====================

interface EmptyStateProps {
    icon: string;
    message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, message }) => (
    <div className="text-center py-8 text-slate-400">
        <p className="text-4xl mb-2">{icon}</p>
        <p>{message}</p>
    </div>
);
