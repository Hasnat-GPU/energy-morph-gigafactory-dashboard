import { useTheme } from "../App";
import { Button } from "./ui/button";
import { 
  Sun, 
  Moon, 
  RefreshCw, 
  HelpCircle, 
  Download,
  Bell
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Header = ({ onRefresh, onStartTour }) => {
  const { theme, toggleTheme } = useTheme();

  const handleExportCSV = async () => {
    try {
      const response = await axios.get(`${API}/export/csv`);
      const { headers, rows, filename } = response.data;
      
      // Convert to CSV
      const csvContent = [
        headers.join(","),
        ...rows.map(row => headers.map(h => row[h]).join(","))
      ].join("\n");
      
      // Download
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      
      toast.success("CSV exported successfully");
    } catch (error) {
      toast.error("Failed to export CSV");
    }
  };

  const handleGenerateReport = async () => {
    try {
      const response = await axios.get(`${API}/export/report`);
      const report = response.data;
      
      // Format report as text
      const reportText = `
${report.report_title}
Generated: ${new Date(report.generated_at).toLocaleString()}
Period: ${report.period}

=== SUMMARY ===
Grid Uptime: ${report.summary.grid_uptime}
Efficiency Gain: ${report.summary.efficiency_gain}
Renewable Ratio: ${report.summary.renewable_ratio}
CO2 Savings: ${report.summary.co2_savings}

=== HIGHLIGHTS ===
${report.highlights.map(h => `• ${h}`).join("\n")}

=== RECOMMENDATIONS ===
${report.recommendations.map(r => `• ${r}`).join("\n")}
      `.trim();
      
      // Download
      const blob = new Blob([reportText], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `energy_morph_report_${new Date().toISOString().split("T")[0]}.txt`;
      a.click();
      
      toast.success("Report generated successfully");
    } catch (error) {
      toast.error("Failed to generate report");
    }
  };

  return (
    <header 
      data-testid="header"
      className="h-16 border-b border-border/50 bg-card/30 backdrop-blur-sm flex items-center justify-between px-4 md:px-6"
    >
      {/* Left - Title */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Power Grid Dashboard</h2>
          <p className="text-xs text-muted-foreground">
            Tesla Gigafactory Energy Management
          </p>
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button
          data-testid="notifications-btn"
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E82127] rounded-full" />
        </Button>

        {/* Refresh */}
        <Button
          data-testid="refresh-btn"
          variant="ghost"
          size="icon"
          onClick={onRefresh}
        >
          <RefreshCw className="w-5 h-5" />
        </Button>

        {/* Export Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              data-testid="export-btn"
              variant="ghost"
              size="icon"
            >
              <Download className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleExportCSV}>
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleGenerateReport}>
              Generate Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help / Tour */}
        <Button
          data-testid="help-btn"
          variant="ghost"
          size="icon"
          onClick={onStartTour}
        >
          <HelpCircle className="w-5 h-5" />
        </Button>

        {/* Theme Toggle */}
        <Button
          data-testid="theme-toggle"
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="border-border/50"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-[#00BFFF]" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>
      </div>
    </header>
  );
};

export default Header;
