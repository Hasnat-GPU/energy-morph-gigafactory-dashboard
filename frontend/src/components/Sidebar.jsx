import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Activity, 
  Link2, 
  Search, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  FlaskConical
} from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "analytics", label: "Grid Analytics", icon: Activity },
  { id: "blockchain", label: "Blockchain", icon: Link2 },
  { id: "query", label: "Query Interface", icon: Search },
  { id: "scenarios", label: "Scenarios", icon: FlaskConical },
];

const Sidebar = ({ collapsed, onToggle, activePanel, onPanelChange }) => {
  return (
    <motion.aside
      data-testid="sidebar"
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "h-screen flex flex-col border-r border-border/50",
        "bg-card/50 backdrop-blur-sm"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border/50">
        <motion.div 
          className="flex items-center gap-3"
          animate={{ justifyContent: collapsed ? "center" : "flex-start" }}
        >
          <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#00BFFF] to-[#228B22] flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="font-bold text-lg tracking-tight">Energy-Morph</h1>
              <p className="text-xs text-muted-foreground">Grid Management</p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        <TooltipProvider delayDuration={0}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePanel === item.id;

            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Button
                    data-testid={`nav-${item.id}`}
                    variant="ghost"
                    onClick={() => onPanelChange(item.id)}
                    className={cn(
                      "w-full justify-start gap-3 h-11 px-3",
                      "transition-all duration-200",
                      isActive && "bg-[#00BFFF]/10 text-[#00BFFF] border border-[#00BFFF]/30",
                      !isActive && "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                      collapsed && "justify-center px-0"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 shrink-0", isActive && "text-[#00BFFF]")} />
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </Button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="bg-card border-border">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-border/50">
        <Button
          data-testid="sidebar-toggle"
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full justify-center h-9"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
