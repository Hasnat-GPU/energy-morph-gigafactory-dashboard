import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Plot from "react-plotly.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/App";
import { Brain, Activity, Sparkles } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SNNPredictions = ({ data, loading, fullSize = false }) => {
  const { theme } = useTheme();
  const [neuronActivity, setNeuronActivity] = useState(null);
  const [activeTab, setActiveTab] = useState("predictions");

  const isDark = theme === "dark";
  const bgColor = isDark ? "#0F0F10" : "#FFFFFF";
  const textColor = isDark ? "#FAFAFA" : "#0F0F10";
  const gridColor = isDark ? "rgba(192,192,192,0.1)" : "rgba(0,0,0,0.1)";

  useEffect(() => {
    const fetchNeuronActivity = async () => {
      try {
        const response = await axios.get(`${API}/snn/neuron-activity`);
        setNeuronActivity(response.data);
      } catch (error) {
        console.error("Failed to fetch neuron activity:", error);
      }
    };

    fetchNeuronActivity();
    const interval = setInterval(fetchNeuronActivity, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="bg-card/50 border-border/50 h-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const hours = [...Array(24)].map((_, i) => `${i}:00`);

  const predictionPlotData = [
    {
      type: "scatter",
      mode: "lines",
      name: "Demand",
      x: hours,
      y: data?.predicted_demand,
      line: { color: "#E82127", width: 2 },
      fill: "tozeroy",
      fillcolor: "rgba(232, 33, 39, 0.1)",
    },
    {
      type: "scatter",
      mode: "lines",
      name: "Solar",
      x: hours,
      y: data?.predicted_solar,
      line: { color: "#00BFFF", width: 2 },
    },
    {
      type: "scatter",
      mode: "lines",
      name: "Wind",
      x: hours,
      y: data?.predicted_wind,
      line: { color: "#228B22", width: 2 },
    },
  ];

  const predictionLayout = {
    paper_bgcolor: "transparent",
    plot_bgcolor: bgColor,
    font: { family: "IBM Plex Sans, sans-serif", color: textColor, size: 10 },
    margin: { l: 50, r: 20, t: 20, b: 40 },
    legend: {
      orientation: "h",
      y: -0.15,
      x: 0.5,
      xanchor: "center",
      font: { size: 10 },
    },
    xaxis: {
      title: { text: "Hour", font: { size: 10 } },
      tickfont: { size: 9 },
      gridcolor: gridColor,
      showgrid: true,
      tickangle: -45,
    },
    yaxis: {
      title: { text: "MW", font: { size: 10 } },
      tickfont: { size: 9 },
      gridcolor: gridColor,
    },
    autosize: true,
    showlegend: true,
  };

  // Spike raster plot data
  const spikeData = data?.spike_patterns?.map((pattern, idx) => ({
    type: "scatter",
    mode: "markers",
    name: pattern.neuron_group,
    x: pattern.spike_times,
    y: Array(pattern.spike_times.length).fill(idx),
    marker: {
      symbol: "line-ns",
      size: 12,
      color: ["#00BFFF", "#228B22", "#E82127", "#C0C0C0", "#00BFFF"][idx],
    },
    hovertemplate: `${pattern.neuron_group}<br>Time: %{x:.2f}ms<extra></extra>`,
  })) || [];

  const spikeLayout = {
    paper_bgcolor: "transparent",
    plot_bgcolor: bgColor,
    font: { family: "IBM Plex Sans, sans-serif", color: textColor, size: 10 },
    margin: { l: 120, r: 20, t: 20, b: 40 },
    xaxis: {
      title: { text: "Time (ms)", font: { size: 10 } },
      tickfont: { size: 9 },
      gridcolor: gridColor,
      range: [0, 100],
    },
    yaxis: {
      ticktext: data?.spike_patterns?.map(p => p.neuron_group) || [],
      tickvals: [...Array(5)].map((_, i) => i),
      tickfont: { size: 9 },
    },
    showlegend: false,
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
          <Brain className="w-5 h-5 text-[#00BFFF]" />
          SNN Grid Predictions
        </CardTitle>
        <Badge 
          variant="outline" 
          className="border-[#228B22] text-[#228B22] font-mono"
        >
          {(data?.confidence * 100)?.toFixed(1)}% confidence
        </Badge>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="predictions" data-testid="snn-predictions-tab">
              <Activity className="w-4 h-4 mr-2" />
              Predictions
            </TabsTrigger>
            <TabsTrigger value="spikes" data-testid="snn-spikes-tab">
              <Sparkles className="w-4 h-4 mr-2" />
              Neural Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predictions">
            <div className={`${fullSize ? "h-[400px]" : "h-[200px]"}`}>
              <Plot
                data={predictionPlotData}
                layout={predictionLayout}
                config={config}
                style={{ width: "100%", height: "100%" }}
                useResizeHandler
              />
            </div>
          </TabsContent>

          <TabsContent value="spikes">
            <div className={`${fullSize ? "h-[400px]" : "h-[200px]"}`}>
              <Plot
                data={spikeData}
                layout={spikeLayout}
                config={config}
                style={{ width: "100%", height: "100%" }}
                useResizeHandler
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Neuron Activity Stats */}
        {neuronActivity && (
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-sm bg-muted/30 border border-border/50">
              <span className="text-xs text-muted-foreground block">Total Spikes</span>
              <span className="text-lg font-mono font-bold text-[#00BFFF]">
                {neuronActivity.total_spikes}
              </span>
            </div>
            <div className="p-2 rounded-sm bg-muted/30 border border-border/50">
              <span className="text-xs text-muted-foreground block">Network State</span>
              <span className="text-sm font-medium text-[#228B22] uppercase">
                {neuronActivity.network_state}
              </span>
            </div>
            <div className="p-2 rounded-sm bg-muted/30 border border-border/50">
              <span className="text-xs text-muted-foreground block">Learning Rate</span>
              <span className="text-lg font-mono font-bold">
                {neuronActivity.learning_rate}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SNNPredictions;
