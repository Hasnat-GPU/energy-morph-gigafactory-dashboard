import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Plot from "react-plotly.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/App";
import { Maximize2, RefreshCw } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MorphingHeatmap = ({ data, loading, fullSize = false }) => {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState("power"); // power or efficiency
  const [morphData, setMorphData] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const isDark = theme === "dark";
  const bgColor = isDark ? "#0F0F10" : "#FFFFFF";
  const textColor = isDark ? "#FAFAFA" : "#0F0F10";
  const gridColor = isDark ? "rgba(192,192,192,0.1)" : "rgba(0,0,0,0.1)";

  // Fetch realtime heatmap data for morphing effect
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
  const colorscale = viewMode === "power" 
    ? [[0, "#0a2f4a"], [0.5, "#00BFFF"], [1, "#228B22"]]
    : [[0, "#1a1a2e"], [0.5, "#228B22"], [1, "#00BFFF"]];

  const plotData = [{
    type: "heatmap",
    z: values,
    x: data?.timestamps?.slice(-24).map((t, i) => `${i}h`),
    y: data?.zones,
    colorscale: colorscale,
    showscale: true,
    colorbar: {
      title: {
        text: viewMode === "power" ? "MW" : "Efficiency",
        side: "right",
        font: { color: textColor, size: 11 }
      },
      tickfont: { color: textColor, size: 10 },
      thickness: 15,
      len: 0.8,
    },
    hoverongaps: false,
    hovertemplate: "<b>%{y}</b><br>Hour: %{x}<br>Value: %{z:.2f}<extra></extra>",
  }];

  const layout = {
    paper_bgcolor: "transparent",
    plot_bgcolor: bgColor,
    font: { family: "IBM Plex Sans, sans-serif", color: textColor },
    margin: { l: 70, r: 30, t: 30, b: 50 },
    xaxis: {
      title: { text: "Time (hours ago)", font: { size: 11 } },
      tickfont: { size: 10 },
      gridcolor: gridColor,
      showgrid: false,
    },
    yaxis: {
      title: { text: "Power Zone", font: { size: 11 } },
      tickfont: { size: 10 },
      gridcolor: gridColor,
    },
    autosize: true,
  };

  const config = {
    displayModeBar: false,
    responsive: true,
  };

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
          className={`${fullSize ? "h-[500px]" : "h-[300px]"}`}
          animate={{ opacity: isAnimating ? 0.7 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <Plot
            data={plotData}
            layout={layout}
            config={config}
            style={{ width: "100%", height: "100%" }}
            useResizeHandler
          />
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
