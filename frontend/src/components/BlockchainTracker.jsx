import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Progress } from "./ui/progress";
import { Link2, CheckCircle, Clock, Leaf } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BlockchainTracker = ({ data, loading, fullSize = false }) => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get(`${API}/blockchain/summary`);
        setSummary(response.data);
      } catch (error) {
        console.error("Failed to fetch blockchain summary:", error);
      }
    };

    fetchSummary();
    const interval = setInterval(fetchSummary, 15000);
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

  const truncateHash = (hash) => {
    if (!hash) return "";
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const getEnergyIcon = (type) => {
    switch (type) {
      case "solar": return "sun";
      case "wind": return "wind";
      case "hydro": return "droplets";
      default: return "zap";
    }
  };

  const getEnergyColor = (type) => {
    switch (type) {
      case "solar": return "#00BFFF";
      case "wind": return "#228B22";
      case "hydro": return "#0066CC";
      default: return "#C0C0C0";
    }
  };

  return (
    <Card className="bg-card/50 border-border/50 h-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Link2 className="w-5 h-5 text-[#228B22]" />
          Blockchain Energy Tracking
        </CardTitle>
        <Badge variant="outline" className="font-mono text-xs">
          Block #{summary?.last_block?.toLocaleString()}
        </Badge>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-sm bg-muted/30 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Total Tracked</span>
                <Leaf className="w-4 h-4 text-[#228B22]" />
              </div>
              <span className="text-xl font-mono font-bold text-[#228B22]">
                {summary.total_tracked_kwh.toLocaleString()} kWh
              </span>
            </div>
            <div className="p-3 rounded-sm bg-muted/30 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Renewable %</span>
                <CheckCircle className="w-4 h-4 text-[#00BFFF]" />
              </div>
              <span className="text-xl font-mono font-bold text-[#00BFFF]">
                {summary.renewable_percentage}%
              </span>
            </div>
          </div>
        )}

        {/* Energy Source Breakdown */}
        {summary?.by_source && (
          <div className="mb-4 space-y-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Energy Sources
            </span>
            {Object.entries(summary.by_source).map(([source, percentage]) => (
              <div key={source} className="flex items-center gap-2">
                <span className="text-xs w-20 capitalize">{source}</span>
                <Progress 
                  value={percentage} 
                  className="flex-1 h-2"
                  style={{ 
                    "--progress-background": getEnergyColor(source) 
                  }}
                />
                <span className="text-xs font-mono w-12 text-right">{percentage}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Transaction List */}
        <div className="mt-4">
          <span className="text-xs text-muted-foreground uppercase tracking-wide block mb-2">
            Recent Transactions
          </span>
          <ScrollArea className={`${fullSize ? "h-[300px]" : "h-[150px]"}`}>
            <div className="space-y-2">
              {data?.map((tx, index) => (
                <motion.div
                  key={tx.id}
                  data-testid={`blockchain-tx-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-2 rounded-sm bg-muted/20 border border-border/30 hover:border-[#228B22]/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <code className="text-xs font-mono text-[#00BFFF]">
                      {truncateHash(tx.tx_hash)}
                    </code>
                    {tx.verified ? (
                      <Badge className="badge-verified text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="badge-pending text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {tx.source} → {tx.destination}
                    </span>
                    <span className="font-mono" style={{ color: getEnergyColor(tx.energy_type) }}>
                      {tx.amount_kwh} kWh
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <Badge variant="outline" className="text-xs capitalize">
                      {tx.energy_type}
                    </Badge>
                    <span className="text-muted-foreground">
                      {formatTime(tx.timestamp)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlockchainTracker;
