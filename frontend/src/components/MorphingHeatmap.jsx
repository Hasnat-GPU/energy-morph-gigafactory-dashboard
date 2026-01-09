import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { useTheme } from "../App";
import { RefreshCw } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Custom Heatmap using CSS Grid
const HeatmapCell = ({ value, maxValue, type }) => {
  const intensity = Math.min(value / maxValue, 1);
  const color = type === "power" 
    ? `rgba(0, 191, 255, ${0.2 + intensity * 0.8})`
    : `rgba(34, 139, 34, ${0.2 + intensity * 0.8})`;
  
  return (
    <div 
      className="w-full h-8 rounded-sm transition-all duration-300 flex items-center justify-center text-xs font-mono"
      style={{ backgroundColor: color }}
    >
      {value.toFixed(1)}
    </div>
  );
};

const MorphingHeatmap = ({ data, loading, fullSize = false }) => {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState("power");
  const [morphData, setMorphData] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const fetchMorphData = useCallback(async () => {
    try {
      setIsAnimating(true);
      const response = await axios.get(`${API}/heatmap/realtime`);
      setMorphData(response.data);
    } catch (error) {
      console.error("Failed to fetch morph data:", error);
    } finally {
      setTimeout(() => setIsAnimating(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchMorphData();
    const interval = setInterval(fetchMorphData, 5000);
    return () => clearInterval(interval);
  }, [fetchMorphData]);

  if (loading) {
    return (
      <Card className="bg-card/50 border-border/50 h-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const values = viewMode === "power" ? data?.power_values : data?.efficiency_values;
  const maxValue = values ? Math.max(...values.flat()) : 100;

  return (
    <Card className="bg-card/50 border-border/50 h-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00BFFF] animate-pulse" />
          Power Zone Distribution
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            data-testid="heatmap-power-btn"
            variant={viewMode === "power" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("power")}
            className="text-xs h-7"
          >
            Power
          </Button>
          <Button
            data-testid="heatmap-efficiency-btn"
            variant={viewMode === "efficiency" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("efficiency")}
            className="text-xs h-7"
          >
            Efficiency
          </Button>
          <Button
            data-testid="heatmap-refresh-btn"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={fetchMorphData}
          >
            <RefreshCw className={`w-4 h-4 ${isAnimating ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <motion.div 
          className={`${fullSize ? "h-[500px]" : "h-[280px]"} overflow-auto`}
          animate={{ opacity: isAnimating ? 0.7 : 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Heatmap Grid */}
          <div className="space-y-1">
            {/* Header row with time labels */}
            <div className="flex gap-1 mb-2">
              <div className="w-16 shrink-0" />
              {[...Array(12)].map((_, i) => (
                <div key={i} className="flex-1 text-center text-xs text-muted-foreground">
                  {i * 2}h
                </div>
              ))}
            </div>
            
            {/* Zone rows */}
            {data?.zones?.map((zone, zoneIdx) => (
              <motion.div 
                key={zone}
                className="flex gap-1 items-center"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: zoneIdx * 0.05 }}
              >
                <div className="w-16 shrink-0 text-xs font-medium">{zone}</div>
                <div className="flex-1 grid grid-cols-12 gap-1">
                  {values?.[zoneIdx]?.slice(0, 12).map((val, idx) => (
                    <HeatmapCell 
                      key={idx}
                      value={val}
                      maxValue={maxValue}
                      type={viewMode}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-20 h-3 rounded-sm bg-gradient-to-r from-[rgba(0,191,255,0.2)] to-[rgba(0,191,255,1)]" />
              <span className="text-xs text-muted-foreground">
                {viewMode === "power" ? "Low → High MW" : "Low → High %"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Realtime Zone Status */}
        {morphData && (
          <div className="mt-4 grid grid-cols-3 md:grid-cols-6 gap-2">
            {Object.entries(morphData.zones).map(([zone, info]) => (
              <motion.div
                key={zone}
                data-testid={`zone-status-${zone}`}
                className="p-2 rounded-sm bg-muted/30 border border-border/50 text-center"
                animate={{ 
                  borderColor: info.status === "optimal" ? "#228B22" : 
                              info.status === "high_load" ? "#E82127" : "#00BFFF"
                }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-xs text-muted-foreground block">{zone}</span>
                <span className="text-sm font-mono font-medium">{info.power_level}%</span>
                <span className={`text-xs block ${
                  info.status === "optimal" ? "text-[#228B22]" : 
                  info.status === "high_load" ? "text-[#E82127]" : "text-[#00BFFF]"
                }`}>
                  {info.status}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MorphingHeatmap;
