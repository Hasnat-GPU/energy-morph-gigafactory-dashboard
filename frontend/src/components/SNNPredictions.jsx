import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip,
  Legend,
  Area,
  AreaChart
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useTheme } from "../App";
import { Brain, Activity, Sparkles } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SNNPredictions = ({ data, loading, fullSize = false }) => {
  const { theme } = useTheme();
  const [neuronActivity, setNeuronActivity] = useState(null);
  const [activeTab, setActiveTab] = useState("predictions");

  const isDark = theme === "dark";

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

  // Prepare chart data
  const chartData = data?.predicted_demand?.map((demand, idx) => ({
    hour: `${idx}:00`,
    demand: demand,
    solar: data?.predicted_solar?.[idx] || 0,
    wind: data?.predicted_wind?.[idx] || 0,
  })) || [];

  // Prepare spike data for visualization
  const spikeData = data?.spike_patterns?.map((pattern) => ({
    name: pattern.neuron_group.replace(/_/g, " "),
    spikes: pattern.spike_times.length,
    firingRate: (pattern.firing_rate * 100).toFixed(1),
    potential: pattern.membrane_potential.toFixed(1),
  })) || [];

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
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E82127" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#E82127" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fontSize: 10, fill: isDark ? '#a1a1aa' : '#71717a' }}
                    axisLine={{ stroke: isDark ? '#27272a' : '#e4e4e7' }}
                    tickLine={false}
                    interval={3}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: isDark ? '#a1a1aa' : '#71717a' }}
                    axisLine={{ stroke: isDark ? '#27272a' : '#e4e4e7' }}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0F0F10' : '#FFFFFF',
                      border: '1px solid rgba(192,192,192,0.2)',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    wrapperStyle={{ fontSize: '10px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="demand"
                    stroke="#E82127"
                    fill="url(#demandGradient)"
                    strokeWidth={2}
                    name="Demand"
                  />
                  <Line
                    type="monotone"
                    dataKey="solar"
                    stroke="#00BFFF"
                    strokeWidth={2}
                    dot={false}
                    name="Solar"
                  />
                  <Line
                    type="monotone"
                    dataKey="wind"
                    stroke="#228B22"
                    strokeWidth={2}
                    dot={false}
                    name="Wind"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="spikes">
            <div className={`${fullSize ? "h-[400px]" : "h-[200px]"} space-y-2 overflow-auto`}>
              {spikeData.map((neuron, idx) => (
                <motion.div
                  key={neuron.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-3 rounded-sm bg-muted/30 border border-border/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">{neuron.name}</span>
                    <Badge variant="outline" className="text-xs font-mono">
                      {neuron.spikes} spikes
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Firing Rate: <span className="text-[#00BFFF] font-mono">{neuron.firingRate}%</span></span>
                    <span>Membrane: <span className="text-[#228B22] font-mono">{neuron.potential}mV</span></span>
                  </div>
                  {/* Spike visualization */}
                  <div className="mt-2 h-4 bg-muted/50 rounded-sm relative overflow-hidden">
                    {[...Array(neuron.spikes)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 w-0.5 bg-[#00BFFF]"
                        style={{ left: `${(i / neuron.spikes) * 100}%` }}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
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
