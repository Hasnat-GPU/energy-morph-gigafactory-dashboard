import { useState } from "react";
import { useTheme } from "../App";
import { Button } from "./ui/button";
import { 
  Sun, 
  Moon, 
  RefreshCw, 
  HelpCircle, 
  Download,
  Bell,
  FileText,
  Loader2
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
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Header = ({ onRefresh, onStartTour }) => {
  const { theme, toggleTheme } = useTheme();
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handleExportCSV = async () => {
    try {
      const response = await axios.get(`${API}/export/csv`);
      const { headers, rows, filename } = response.data;
      
      const csvContent = [
        headers.join(","),
        ...rows.map(row => headers.map(h => row[h]).join(","))
      ].join("\n");
      
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

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    toast.info("Generating PDF... Please wait");

    try {
      // Fetch current data for the report
      const [kpiRes, reportRes, blockchainRes] = await Promise.all([
        axios.get(`${API}/kpi/summary`),
        axios.get(`${API}/export/report`),
        axios.get(`${API}/blockchain/summary`)
      ]);

      const kpi = kpiRes.data;
      const report = reportRes.data;
      const blockchain = blockchainRes.data;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      let yPos = 20;

      // Helper function
      const addText = (text, x, y, options = {}) => {
        pdf.setFontSize(options.size || 12);
        pdf.setTextColor(options.color || '#333333');
        if (options.bold) pdf.setFont('helvetica', 'bold');
        else pdf.setFont('helvetica', 'normal');
        pdf.text(text, x, y);
      };

      // Header with gradient effect (simulated)
      pdf.setFillColor(0, 191, 255);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      addText('ENERGY-MORPH', margin, 18, { size: 24, color: '#FFFFFF', bold: true });
      addText('Power Grid Dashboard Summary', margin, 28, { size: 12, color: '#FFFFFF' });
      addText(`Generated: ${new Date().toLocaleString()}`, margin, 35, { size: 10, color: '#FFFFFF' });

      yPos = 55;

      // KPI Section
      addText('KEY PERFORMANCE INDICATORS', margin, yPos, { size: 14, bold: true, color: '#00BFFF' });
      yPos += 10;

      const kpis = [
        { label: 'Grid Uptime', value: `${kpi.grid_uptime}%`, target: '99.9%' },
        { label: 'Efficiency Gain', value: `+${kpi.efficiency_gain}%`, target: '+30%' },
        { label: 'Renewable Output', value: `${kpi.total_renewable_output} MW`, target: '500 MW' },
        { label: 'CO₂ Savings', value: `${kpi.co2_savings.toLocaleString()} tons`, target: '1,500 tons' },
        { label: 'Megapack Capacity', value: `${kpi.megapack_capacity}%`, target: '85%' },
        { label: 'Peak Demand Handled', value: `${kpi.peak_demand_handled}%`, target: '95%' },
      ];

      kpis.forEach((kpiItem, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const x = margin + col * 90;
        const y = yPos + row * 20;
        
        pdf.setFillColor(245, 245, 247);
        pdf.roundedRect(x, y - 5, 85, 18, 2, 2, 'F');
        
        addText(kpiItem.label, x + 3, y + 2, { size: 9, color: '#666666' });
        addText(kpiItem.value, x + 3, y + 9, { size: 12, bold: true, color: '#00BFFF' });
        addText(`Target: ${kpiItem.target}`, x + 50, y + 9, { size: 8, color: '#999999' });
      });

      yPos += 70;

      // Blockchain Section
      addText('BLOCKCHAIN ENERGY TRACKING', margin, yPos, { size: 14, bold: true, color: '#228B22' });
      yPos += 10;

      pdf.setFillColor(245, 245, 247);
      pdf.roundedRect(margin, yPos - 3, pageWidth - 30, 35, 2, 2, 'F');

      addText(`Total Tracked: ${blockchain.total_tracked_kwh.toLocaleString()} kWh`, margin + 5, yPos + 5, { size: 11 });
      addText(`Renewable Percentage: ${blockchain.renewable_percentage}%`, margin + 5, yPos + 12, { size: 11, color: '#228B22' });
      addText(`Last Block: #${blockchain.last_block.toLocaleString()}`, margin + 5, yPos + 19, { size: 10, color: '#666666' });
      
      // Energy breakdown
      addText('Energy Sources:', margin + 100, yPos + 5, { size: 10, bold: true });
      addText(`Solar: ${blockchain.by_source.solar}%`, margin + 100, yPos + 12, { size: 9 });
      addText(`Wind: ${blockchain.by_source.wind}%`, margin + 140, yPos + 12, { size: 9 });
      addText(`Hydro: ${blockchain.by_source.hydro}%`, margin + 100, yPos + 19, { size: 9 });
      addText(`Geothermal: ${blockchain.by_source.geothermal}%`, margin + 140, yPos + 19, { size: 9 });

      yPos += 45;

      // Highlights Section
      addText('PERFORMANCE HIGHLIGHTS', margin, yPos, { size: 14, bold: true, color: '#E82127' });
      yPos += 8;

      report.highlights.forEach((highlight, idx) => {
        addText(`• ${highlight}`, margin + 3, yPos + idx * 7, { size: 10 });
      });

      yPos += report.highlights.length * 7 + 10;

      // Recommendations Section
      addText('RECOMMENDATIONS', margin, yPos, { size: 14, bold: true, color: '#00BFFF' });
      yPos += 8;

      report.recommendations.forEach((rec, idx) => {
        addText(`• ${rec}`, margin + 3, yPos + idx * 7, { size: 10 });
      });

      // Footer
      pdf.setFillColor(15, 15, 16);
      pdf.rect(0, 277, pageWidth, 20, 'F');
      addText('Energy-Morph Dashboard | Tesla Gigafactory Energy Management', margin, 287, { size: 9, color: '#FFFFFF' });
      addText('Powered by SNN Predictions & Blockchain Tracking', pageWidth - 80, 287, { size: 8, color: '#00BFFF' });

      // Save PDF
      pdf.save(`energy_morph_dashboard_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("PDF exported successfully!");

    } catch (error) {
      console.error("PDF export failed:", error);
      toast.error("Failed to export PDF");
    } finally {
      setIsExportingPDF(false);
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
        {/* PDF Export Button - Prominent */}
        <Button
          data-testid="export-pdf-btn"
          variant="default"
          size="sm"
          onClick={handleExportPDF}
          disabled={isExportingPDF}
          className="hidden md:flex items-center gap-1 text-xs bg-gradient-to-r from-[#00BFFF] to-[#228B22] hover:opacity-90"
        >
          {isExportingPDF ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          Export PDF
        </Button>

        {/* CSV Export */}
        <Button
          data-testid="export-csv-btn"
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="hidden md:flex items-center gap-1 text-xs border-border/50"
        >
          <Download className="w-4 h-4" />
          CSV
        </Button>

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

        {/* Export Menu - Mobile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              data-testid="export-menu-btn"
              variant="ghost"
              size="icon"
              className="md:hidden"
            >
              <Download className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleExportPDF} disabled={isExportingPDF}>
              {isExportingPDF ? "Generating..." : "Export Dashboard PDF"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExportCSV}>
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleGenerateReport}>
              Generate Text Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help / Tour */}
        <Button
          data-testid="help-btn"
          variant="ghost"
          size="icon"
          onClick={onStartTour}
          title="Start Tour"
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
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
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
