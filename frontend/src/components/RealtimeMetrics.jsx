import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Activity, Zap, Gauge } from "lucide-react";

const RealtimeMetrics = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <Card className="bg-card/50 border-border/50 h-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "optimal": return "#228B22";
      case "nominal": return "#00BFFF";
      case "high_demand": return "#E82127";
      default: return "#C0C0C0";
    }
  };

  const gridBalance = ((data.total_generation - data.total_demand) / data.total_generation * 100).toFixed(1);
  const isPositiveBalance = parseFloat(gridBalance) >= 0;

  return (
    <Card className="bg-card/50 border-border/50 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#00BFFF] animate-pulse" />
          Real-Time Status
          <Badge variant="outline" className="ml-auto font-mono text-xs">
            LIVE
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Grid Overview */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-sm bg-muted/30 border border-border/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Generation</span>
              <Zap className="w-4 h-4 text-[#228B22]" />
            </div>
            <span className="text-xl font-mono font-bold text-[#228B22]">
              {data.total_generation} MW
            </span>
          </div>
          <div className="p-3 rounded-sm bg-muted/30 border border-border/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Demand</span>
              <Activity className="w-4 h-4 text-[#E82127]" />
            </div>
            <span className="text-xl font-mono font-bold text-[#E82127]">
              {data.total_demand} MW
            </span>
          </div>
        </div>

        {/* Grid Balance */}
        <div className="p-3 rounded-sm bg-muted/30 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Grid Balance</span>
            <span className={`text-sm font-mono font-bold ${isPositiveBalance ? "text-[#228B22]" : "text-[#E82127]"}`}>
              {isPositiveBalance ? "+" : ""}{gridBalance}%
            </span>
          </div>
          <Progress 
            value={50 + parseFloat(gridBalance)}
            className="h-2"
          />
        </div>

        {/* Grid Frequency */}
        <div className="p-3 rounded-sm bg-muted/30 border border-border/50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Grid Frequency</span>
            <Gauge className="w-4 h-4 text-[#00BFFF]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-mono font-bold text-[#00BFFF]">
              {data.grid_frequency}
            </span>
            <span className="text-sm text-muted-foreground">Hz</span>
            <Badge 
              variant="outline" 
              className={`ml-auto ${
                Math.abs(data.grid_frequency - 60) < 0.05 
                  ? "text-[#228B22] border-[#228B22]" 
                  : "text-[#E82127] border-[#E82127]"
              }`}
            >
              {Math.abs(data.grid_frequency - 60) < 0.05 ? "Stable" : "Warning"}
            </Badge>
          </div>
        </div>

        {/* Zone Status Summary */}
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wide block mb-2">
            Zone Status
          </span>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(data.zones || {}).slice(0, 6).map(([zone, info]) => (
              <motion.div
                key={zone}
                data-testid={`realtime-zone-${zone}`}
                className="p-2 rounded-sm bg-muted/20 border border-border/30"
                animate={{
                  borderColor: getStatusColor(info.status) + "50",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{zone}</span>
                  <div 
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: getStatusColor(info.status) }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    {info.power_output} MW
                  </span>
                  <span className="text-xs font-mono" style={{ color: getStatusColor(info.status) }}>
                    {(info.efficiency * 100).toFixed(0)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealtimeMetrics;
