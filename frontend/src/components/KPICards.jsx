import { motion } from "framer-motion";
import { 
  Zap, 
  TrendingUp, 
  Leaf, 
  Battery, 
  Activity,
  Clock
} from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { cn } from "../lib/utils";

const SparklineChart = ({ data, color }) => {
  if (!data || data.length === 0) return null;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const width = 100;
  const height = 32;
  const padding = 2;
  
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
        fill={`url(#gradient-${color})`}
      />
    </svg>
  );
};

const kpiConfig = [
  {
    key: "grid_uptime",
    label: "Grid Uptime",
    icon: Clock,
    color: "#00BFFF",
    format: (v) => `${v}%`,
    target: "99.9%",
  },
  {
    key: "efficiency_gain",
    label: "Efficiency Gain",
    icon: TrendingUp,
    color: "#228B22",
    format: (v) => `+${v}%`,
    target: "+30%",
  },
  {
    key: "total_renewable_output",
    label: "Renewable Output",
    icon: Zap,
    color: "#00BFFF",
    format: (v) => `${v} MW`,
    target: "500 MW",
  },
  {
    key: "co2_savings",
    label: "CO₂ Savings",
    icon: Leaf,
    color: "#228B22",
    format: (v) => `${v.toLocaleString()} tons`,
    target: "1,500 tons",
  },
  {
    key: "megapack_capacity",
    label: "Megapack Capacity",
    icon: Battery,
    color: "#00BFFF",
    format: (v) => `${v}%`,
    target: "85%",
  },
  {
    key: "peak_demand_handled",
    label: "Peak Demand",
    icon: Activity,
    color: "#E82127",
    format: (v) => `${v}%`,
    target: "95%",
  },
];

const KPICards = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpiConfig.map((kpi, index) => {
        const Icon = kpi.icon;
        const value = data?.[kpi.key] ?? 0;
        
        return (
          <motion.div
            key={kpi.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              data-testid={`kpi-${kpi.key}`}
              className={cn(
                "bg-card/50 border-border/50 card-hover h-full",
                "hover:border-[#00BFFF]/50"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    {kpi.label}
                  </span>
                  <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                </div>
                
                <div className="mb-2">
                  <span 
                    className="text-2xl font-bold font-mono tracking-tight"
                    style={{ color: kpi.color }}
                  >
                    {kpi.format(value)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <SparklineChart 
                    data={data?.sparkline_data?.slice(0, 12)} 
                    color={kpi.color} 
                  />
                  <span className="text-xs text-muted-foreground">
                    Target: {kpi.target}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default KPICards;
