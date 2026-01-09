import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { 
  X, 
  ChevronRight, 
  ChevronLeft,
  LayoutDashboard,
  Activity,
  Brain,
  Link2,
  Sun,
  Download
} from "lucide-react";

const tourSteps = [
  {
    id: 1,
    title: "Welcome to Energy-Morph",
    description: "A cutting-edge dashboard for Tesla Gigafactory power grid management. Let's take a quick tour of the main features!",
    icon: LayoutDashboard,
    highlight: null,
  },
  {
    id: 2,
    title: "KPI Dashboard",
    description: "Monitor real-time grid metrics including uptime, efficiency gains, renewable output, and CO₂ savings. Each card shows sparklines for trend visualization.",
    icon: Activity,
    highlight: "kpi-cards",
  },
  {
    id: 3,
    title: "Power Zone Heatmap",
    description: "Visualize power distribution across 6 zones. Toggle between Power (MW) and Efficiency views. Zone status updates in real-time.",
    icon: LayoutDashboard,
    highlight: "morphing-heatmap",
  },
  {
    id: 4,
    title: "SNN Predictions",
    description: "Our Spiking Neural Network predicts grid demand, solar, and wind output for the next 24 hours. View neural activity patterns in the second tab.",
    icon: Brain,
    highlight: "snn-predictions",
  },
  {
    id: 5,
    title: "Blockchain Tracking",
    description: "Track renewable energy transactions on our simulated blockchain. See energy source breakdown and verified transaction history.",
    icon: Link2,
    highlight: "blockchain-tracker",
  },
  {
    id: 6,
    title: "Theme & Export",
    description: "Toggle between dark and light modes using the sun/moon icon. Export your dashboard as PDF, CSV, or generate detailed reports.",
    icon: Sun,
    highlight: "theme-toggle",
  },
  {
    id: 7,
    title: "Navigation",
    description: "Use the sidebar to explore Grid Analytics, Blockchain details, Query Interface for custom analyses, and Scenario simulations.",
    icon: LayoutDashboard,
    highlight: "sidebar",
  },
  {
    id: 8,
    title: "You're All Set!",
    description: "Start exploring the dashboard. Click the help icon (?) anytime to restart this tour. Happy monitoring!",
    icon: Download,
    highlight: null,
  },
];

const OnboardingTour = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const step = tourSteps[currentStep];
    if (step?.highlight) {
      const element = document.querySelector(`[data-testid="${step.highlight}"]`);
      if (element) {
        element.classList.add("tour-highlight");
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    return () => {
      tourSteps.forEach((s) => {
        if (s.highlight) {
          const el = document.querySelector(`[data-testid="${s.highlight}"]`);
          if (el) el.classList.remove("tour-highlight");
        }
      });
    };
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    localStorage.setItem("energy-morph-tour-completed", "true");
    onClose();
  };

  const step = tourSteps[currentStep];
  const Icon = step.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Tour Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-card border border-border/50 rounded-sm shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#00BFFF]/20 to-[#228B22]/20 p-6 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="absolute top-2 right-2 h-8 w-8"
                  data-testid="tour-close"
                >
                  <X className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-sm bg-gradient-to-br from-[#00BFFF] to-[#228B22] flex items-center justify-center">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">{step.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      Step {currentStep + 1} of {tourSteps.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Progress */}
              <div className="px-6 pb-2">
                <div className="flex gap-1">
                  {tourSteps.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        idx <= currentStep ? "bg-[#00BFFF]" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 flex items-center justify-between border-t border-border/50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-muted-foreground"
                >
                  Skip Tour
                </Button>

                <Button
                  size="sm"
                  onClick={handleNext}
                  className="gap-1 bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-white"
                  data-testid="tour-next"
                >
                  {currentStep === tourSteps.length - 1 ? "Get Started" : "Next"}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OnboardingTour;
