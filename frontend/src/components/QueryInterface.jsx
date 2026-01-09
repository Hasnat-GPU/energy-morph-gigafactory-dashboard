import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Search, Play, Clock, Database } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const queryTypes = [
  { value: "efficiency", label: "Efficiency Analysis" },
  { value: "demand", label: "Demand Trends" },
  { value: "renewable", label: "Renewable Sources" },
  { value: "zone", label: "Zone Performance" },
];

const dateRanges = [
  { value: "1h", label: "Last Hour" },
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
];

const zones = ["Zone_A", "Zone_B", "Zone_C", "Zone_D", "Zone_E", "Zone_F"];

const QueryInterface = () => {
  const [queryType, setQueryType] = useState("efficiency");
  const [dateRange, setDateRange] = useState("24h");
  const [selectedZone, setSelectedZone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [queryHistory, setQueryHistory] = useState([]);

  const executeQuery = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/query/execute`, {
        query_type: queryType,
        date_range: dateRange,
        zone: selectedZone || null,
      });

      setResults(response.data);
      
      // Add to history
      setQueryHistory(prev => [{
        type: queryType,
        range: dateRange,
        zone: selectedZone,
        time: new Date().toLocaleTimeString(),
        queryTime: response.data.query_time_ms,
      }, ...prev.slice(0, 9)]);

      toast.success(`Query executed in ${response.data.query_time_ms}ms`);
    } catch (error) {
      console.error("Query failed:", error);
      toast.error("Failed to execute query");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Query Builder */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5 text-[#00BFFF]" />
            Query Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="query-type">Query Type</Label>
            <Select value={queryType} onValueChange={setQueryType}>
              <SelectTrigger id="query-type" data-testid="query-type-select">
                <SelectValue placeholder="Select query type" />
              </SelectTrigger>
              <SelectContent>
                {queryTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-range">Date Range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger id="date-range" data-testid="date-range-select">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {queryType === "zone" && (
            <div className="space-y-2">
              <Label htmlFor="zone">Zone</Label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger id="zone" data-testid="zone-select">
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            data-testid="execute-query-btn"
            onClick={executeQuery}
            disabled={isLoading}
            className="w-full btn-energy"
          >
            {isLoading ? (
              <span className="animate-spin mr-2">⟳</span>
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Execute Query
          </Button>

          {/* Query History */}
          {queryHistory.length > 0 && (
            <div className="mt-4">
              <span className="text-xs text-muted-foreground uppercase tracking-wide block mb-2">
                Recent Queries
              </span>
              <ScrollArea className="h-[150px]">
                <div className="space-y-2">
                  {queryHistory.map((query, index) => (
                    <div
                      key={index}
                      className="p-2 rounded-sm bg-muted/20 border border-border/30 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {query.type}
                        </Badge>
                        <span className="text-muted-foreground">{query.time}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3" />
                        <span className="font-mono">{query.queryTime}ms</span>
                        {query.zone && (
                          <Badge variant="secondary" className="text-xs">
                            {query.zone}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="bg-card/50 border-border/50 lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="w-5 h-5 text-[#228B22]" />
            Query Results
            {results && (
              <Badge variant="outline" className="ml-auto font-mono text-xs">
                {results.query_time_ms}ms
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!results ? (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Execute a query to see results</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Aggregations */}
              {Object.keys(results.aggregations).length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide block mb-2">
                    Aggregations
                  </span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(results.aggregations).map(([key, value]) => (
                      <div
                        key={key}
                        className="p-2 rounded-sm bg-muted/30 border border-border/50 text-center"
                      >
                        <span className="text-xs text-muted-foreground block capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="text-sm font-mono font-bold text-[#00BFFF]">
                          {typeof value === "number" ? value.toLocaleString() : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Results Table */}
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide block mb-2">
                  Results ({results.results.length} rows)
                </span>
                <ScrollArea className="h-[300px] border border-border/50 rounded-sm">
                  <table className="table-energy">
                    <thead className="sticky top-0 bg-card">
                      <tr>
                        {results.results.length > 0 &&
                          Object.keys(results.results[0]).map((key) => (
                            <th key={key} className="capitalize">
                              {key.replace(/_/g, " ")}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.results.map((row, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.02 }}
                        >
                          {Object.values(row).map((value, vIndex) => (
                            <td key={vIndex} className="font-mono text-xs">
                              {typeof value === "number"
                                ? value.toLocaleString()
                                : value}
                            </td>
                          ))}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QueryInterface;
