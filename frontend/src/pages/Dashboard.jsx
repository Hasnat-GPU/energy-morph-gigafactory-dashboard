import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import Joyride, { STATUS } from "react-joyride";

// Components
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import KPICards from "@/components/KPICards";
import MorphingHeatmap from "@/components/MorphingHeatmap";
import SNNPredictions from "@/components/SNNPredictions";
import BlockchainTracker from "@/components/BlockchainTracker";
import QueryInterface from "@/components/QueryInterface";
import ScenarioPanel from "@/components/ScenarioPanel";
import RealtimeMetrics from "@/components/RealtimeMetrics";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const { theme } = useTheme();
  const [activePanel, setActivePanel] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [runTour, setRunTour] = useState(false);
  
  // Data states
  const [kpiData, setKpiData] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [realtimeData, setRealtimeData] = useState(null);
  const [snnPredictions, setSnnPredictions] = useState(null);
  const [blockchainData, setBlockchainData] = useState(null);

  // Tour steps
  const tourSteps = [
    {
      target: '[data-testid="kpi-cards"]',
      content: "View real-time KPIs including grid uptime, efficiency gains, and renewable output.",
      disableBeacon: true,
    },
    {
      target: '[data-testid="morphing-heatmap"]',
      content: "The morphing heatmap shows power distribution across zones in real-time.",
    },
    {
      target: '[data-testid="snn-predictions"]',
      content: "SNN-powered predictions forecast grid demand and renewable output.",
    },
    {
      target: '[data-testid="blockchain-tracker"]',
      content: "Track renewable energy transactions on the simulated blockchain.",
    },
    {
      target: '[data-testid="theme-toggle"]',
      content: "Toggle between dark and light mode for your preference.",
    },
  ];

  const handleTourCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      localStorage.setItem("energy-morph-tour-completed", "true");
    }
  };

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [kpi, heatmap, realtime, snn, blockchain] = await Promise.all([
        axios.get(`${API}/kpi/summary`),
        axios.get(`${API}/heatmap/data?hours=24`),
        axios.get(`${API}/grid/realtime`),
        axios.get(`${API}/snn/predictions`),
        axios.get(`${API}/blockchain/transactions?limit=10`),
      ]);

      setKpiData(kpi.data);
      setHeatmapData(heatmap.data);
      setRealtimeData(realtime.data);
      setSnnPredictions(snn.data);
      setBlockchainData(blockchain.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Check if tour should run
    const tourCompleted = localStorage.getItem("energy-morph-tour-completed");
    if (!tourCompleted) {
      setTimeout(() => setRunTour(true), 2000);
    }

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Update realtime data more frequently
  useEffect(() => {
    const realtimeInterval = setInterval(async () => {
      try {
        const response = await axios.get(`${API}/grid/realtime`);
        setRealtimeData(response.data);
      } catch (error) {
        console.error("Realtime update failed:", error);
      }
    }, 5000);

    return () => clearInterval(realtimeInterval);
  }, []);

  const renderContent = () => {
    switch (activePanel) {
      case "analytics":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Grid Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MorphingHeatmap data={heatmapData} loading={loading} fullSize />
              <SNNPredictions data={snnPredictions} loading={loading} fullSize />
            </div>
          </div>
        );
      case "blockchain":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Blockchain Tracking</h2>
            <BlockchainTracker data={blockchainData} loading={loading} fullSize />
          </div>
        );
      case "query":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Query Interface</h2>
            <QueryInterface />
          </div>
        );
      case "scenarios":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Scenario Simulator</h2>
            <ScenarioPanel />
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {/* KPI Cards Row */}
            <div data-testid="kpi-cards">
              <KPICards data={kpiData} loading={loading} />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Heatmap - spans 2 columns */}
              <div className="lg:col-span-2" data-testid="morphing-heatmap">
                <MorphingHeatmap data={heatmapData} loading={loading} />
              </div>

              {/* Realtime Metrics */}
              <div data-testid="realtime-metrics">
                <RealtimeMetrics data={realtimeData} loading={loading} />
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div data-testid="snn-predictions">
                <SNNPredictions data={snnPredictions} loading={loading} />
              </div>
              <div data-testid="blockchain-tracker">
                <BlockchainTracker data={blockchainData} loading={loading} />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        callback={handleTourCallback}
        styles={{
          options: {
            primaryColor: "#00BFFF",
            backgroundColor: theme === "dark" ? "#0F0F10" : "#FFFFFF",
            textColor: theme === "dark" ? "#FAFAFA" : "#0F0F10",
            arrowColor: theme === "dark" ? "#0F0F10" : "#FFFFFF",
          },
        }}
      />

      {/* Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activePanel={activePanel}
        onPanelChange={setActivePanel}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onRefresh={fetchData}
          onStartTour={() => setRunTour(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePanel}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
