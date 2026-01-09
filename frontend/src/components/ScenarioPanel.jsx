import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FlaskConical, 
  Play, 
  Cpu, 
  Sun, 
  Wind, 
  Zap,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const scenarioIcons = {
  peak_ai: Cpu,
  solar_peak: Sun,
  grid_outage: AlertTriangle,
  demand_surge: Zap,
  wind_drop: Wind,
};

const scenarioColors = {
  peak_ai: "#E82127",
  solar_peak: "#00BFFF",
  grid_outage: "#E82127",
  demand_surge: "#E82127",
  wind_drop: "#228B22",
};

const ScenarioPanel = () => {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const response = await axios.get(`${API}/scenarios/list`);
        setScenarios(response.data.scenarios);
      } catch (error) {
        console.error("Failed to fetch scenarios:", error);
      }
    };

    fetchScenarios();
  }, []);

  const runSimulation = async (scenarioId) => {
    setIsSimulating(true);
    setSelectedScenario(scenarioId);
    setSimulationResult(null);

    try {
      // Simulate loading
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const response = await axios.post(`${API}/scenarios/simulate?scenario_id=${scenarioId}`);
      setSimulationResult(response.data);
      toast.success("Simulation completed successfully");
    } catch (error) {
      console.error("Simulation failed:", error);
      toast.error("Simulation failed");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Scenario Selection */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-[#00BFFF]" />
            Simulation Scenarios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {scenarios.map((scenario) => {
            const Icon = scenarioIcons[scenario.id] || Zap;
            const color = scenarioColors[scenario.id] || "#00BFFF";
            const isSelected = selectedScenario === scenario.id;

            return (
              <motion.div
                key={scenario.id}
                data-testid={`scenario-${scenario.id}`}
                whileHover={{ scale: 1.01 }}
                className={`p-4 rounded-sm border cursor-pointer transition-all ${
                  isSelected
                    ? "border-[#00BFFF] bg-[#00BFFF]/10"
                    : "border-border/50 bg-muted/20 hover:border-border"
                }`}
                onClick={() => !isSimulating && setSelectedScenario(scenario.id)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-sm flex items-center justify-center"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{scenario.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {scenario.description}
                    </p>
                  </div>
                  {isSelected && !isSimulating && (
                    <Button
                      data-testid={`run-scenario-${scenario.id}`}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        runSimulation(scenario.id);
                      }}
                      className="btn-energy"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Run
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>

      {/* Simulation Results */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#228B22]" />
            Simulation Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isSimulating ? (
            <div className="h-[400px] flex flex-col items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-[#00BFFF] border-t-transparent rounded-full"
              />
              <p className="mt-4 text-muted-foreground">Running simulation...</p>
              <Progress value={66} className="w-48 mt-4 h-1" />
            </div>
          ) : !simulationResult ? (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <FlaskConical className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a scenario to run simulation</p>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Status */}
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={
                    simulationResult.simulation_result === "success"
                      ? "text-[#228B22] border-[#228B22]"
                      : "text-[#E82127] border-[#E82127]"
                  }
                >
                  {simulationResult.simulation_result === "success"
                    ? "Simulation Successful"
                    : "Simulation Failed"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(simulationResult.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {/* Parameters */}
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide block mb-2">
                  Scenario Parameters
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(simulationResult.parameters).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="p-2 rounded-sm bg-muted/30 border border-border/50"
                      >
                        <span className="text-xs text-muted-foreground block capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="text-sm font-mono font-bold">
                          {typeof value === "boolean"
                            ? value
                              ? "Yes"
                              : "No"
                            : typeof value === "number"
                            ? `${value > 0 ? "+" : ""}${value}%`
                            : value}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Impact */}
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide block mb-2">
                  Impact Analysis
                </span>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs">Grid Stability</span>
                      <span className="text-xs font-mono text-[#228B22]">
                        {(simulationResult.impact.grid_stability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={simulationResult.impact.grid_stability * 100}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs">Renewable Utilization</span>
                      <span className="text-xs font-mono text-[#00BFFF]">
                        {(simulationResult.impact.renewable_utilization * 100).toFixed(
                          1
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={simulationResult.impact.renewable_utilization * 100}
                      className="h-2"
                    />
                  </div>
                  <div className="p-3 rounded-sm bg-muted/30 border border-border/50">
                    <span className="text-xs text-muted-foreground block">
                      Cost Impact
                    </span>
                    <span
                      className={`text-xl font-mono font-bold ${
                        simulationResult.impact.cost_impact_usd >= 0
                          ? "text-[#E82127]"
                          : "text-[#228B22]"
                      }`}
                    >
                      {simulationResult.impact.cost_impact_usd >= 0 ? "+" : ""}$
                      {simulationResult.impact.cost_impact_usd.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScenarioPanel;
