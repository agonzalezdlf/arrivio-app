import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  LabelList,
} from "recharts";
import {
  ShieldAlert,
  Truck,
  Target,
  ChevronLeft,
  HelpCircle,
  ArrowRight,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  MapPin,
  LayoutGrid,
  Map as MapIcon,
  RotateCw,
  CheckCircle,
  Network,
  X,
  Check,
  BrainCircuit,
  Zap,
  TrendingUp,
  Timer,
  Lock,
  Layers,
  AlertCircle,
  Sparkles,
  Send,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ROUTE_SUMMARIES, MOCK_DELIVERIES } from "../../../data";
import { cn } from "../../../lib/utils";
import {
  CongestionView,
  RoiSimulatorView,
  HistoricalSyncView,
} from "./IntelligenceHub";

const trendData = [
  { name: "JAN", recovered: 94200 },
  { name: "FEB", recovered: 108400 },
  { name: "MAR", recovered: 112900 },
  { name: "APR", recovered: 125600 },
  { name: "MAY", recovered: 138400 },
  { name: "JUN", recovered: 142400 },
];

const MADRID_REAL_CODES: Record<string, string> = {
  "MAD-NORTH-A1": "SEUR-28050",
  "MAD-NORTH-A2": "SEUR-28020",
  "MAD-CENTRAL-B2": "SEUR-28004",
  "MAD-CENTRAL-B3": "SEUR-28015",
  "MAD-EAST-C4": "SEUR-28001",
  "MAD-SOUTH-D8": "SEUR-28500",
  "MAD-WEST-E1": "SEUR-28008",
};

const MADRID_REAL_OPERATORS: Record<string, string> = {
  "MAD-NORTH-A1": "SEUR Las Tablas Hub",
  "MAD-NORTH-A2": "SEUR Plaza de Castilla",
  "MAD-CENTRAL-B2": "SEUR Gran Vía",
  "MAD-CENTRAL-B3": "SEUR Chamberí Unit",
  "MAD-EAST-C4": "SEUR Barrio de Salamanca",
  "MAD-SOUTH-D8": "SEUR CTA Vallecas",
  "MAD-WEST-E1": "SEUR Moncloa Hub",
};

const ZONE_COORDS: Record<
  string,
  { label: string; x: number; y: number; color: string }
> = {
  "MAD-NORTH-A1": { label: "SEUR Sector 28050 (Las Tablas Hub)", x: 400, y: 100, color: "#3B82F6" },
  "MAD-NORTH-A2": { label: "SEUR Sector 28020 (Plaza de Castilla)", x: 480, y: 140, color: "#10B981" },
  "MAD-CENTRAL-B2": {
    label: "SEUR Sector 28004 (Gran Vía Centro)",
    x: 400,
    y: 220,
    color: "#F59E0B",
  },
  "MAD-CENTRAL-B3": {
    label: "SEUR Sector 28015 (Chamberí Hub)",
    x: 340,
    y: 250,
    color: "#10B981",
  },
  "MAD-EAST-C4": { label: "SEUR Sector 28001 (Serrano / Salamanca)", x: 500, y: 240, color: "#EF4444" },
  "MAD-SOUTH-D8": {
    label: "SEUR Sector 28500 (Vallecas Cargo Hub)",
    x: 380,
    y: 360,
    color: "#3B82F6",
  },
  "MAD-WEST-E1": { label: "SEUR Sector 28008 (Moncloa / Argüelles)", x: 260, y: 180, color: "#8B5CF6" },
};

export const STANDARD_VANS: Record<string, number> = {
  "MAD-NORTH-A1": 5,
  "MAD-NORTH-A2": 4,
  "MAD-CENTRAL-B2": 7,
  "MAD-CENTRAL-B3": 3,
  "MAD-EAST-C4": 4,
  "MAD-SOUTH-D8": 5,
  "MAD-WEST-E1": 2,
};

export const getTotalVansInMadrid = (
  systemOptimized: boolean,
  regionalTruckAdjustments: Record<string, number>
) => {
  return Object.keys(STANDARD_VANS).reduce((sum, routeId) => {
    const standard = STANDARD_VANS[routeId];
    let optAdj = 0;
    if (systemOptimized) {
      if (routeId === "MAD-CENTRAL-B2") optAdj = 1;
      else if (routeId === "MAD-NORTH-A1") optAdj = -1;
    }
    const manualAdj = regionalTruckAdjustments[routeId] || 0;
    return sum + Math.max(1, standard + optAdj + manualAdj);
  }, 0);
};

interface InterventionStrategy {
  id: string;
  name: string;
  description: string;
  costImpact: string;
  impactOnReliability: number;
  iconType: "timer" | "split" | "lock" | "truck";
}

interface ZoneRiskProfile {
  title: string;
  originalReliability: number;
  failureRiskDescription: string;
  strategies: InterventionStrategy[];
}

const ZONE_RISK_PROFILES: Record<string, ZoneRiskProfile> = {
  "MAD-NORTH-A1": {
    title: "Las Tablas - Sanchinarro (SEUR Las Tablas)",
    originalReliability: 94,
    failureRiskDescription:
      "Morning office delivery windows suffer tight schedules and loading bay congestion near Plaza de Castilla. High delay risks.",
    strategies: [
      {
        id: "slot-shift",
        name: "Afternoon Window Re-Sequence",
        description:
          "Postpone 5 central commercial drops to afternoon slots (14:30 - 15:30) to bypass 10 AM traffic spikes.",
        costImpact: "€0 - Pure sequence adjustment",
        impactOnReliability: 97,
        iconType: "timer",
      },
      {
        id: "split-load",
        name: "Assign Supporting Scooter Courier",
        description:
          "Split the heavy density sector load, deploying +1 auxiliary eco-scooter courier to clear 4 high-rise blocks.",
        costImpact: "+€30 helper dispatch cost",
        impactOnReliability: 99,
        iconType: "split",
      },
    ],
  },
  "MAD-NORTH-A2": {
    title: "Plaza de Castilla / Tetuán (SEUR Castilla Hub)",
    originalReliability: 91,
    failureRiskDescription:
      "Commercial retail hubs show significant unload line times during mid-day operations, threatening promised delivery slots.",
    strategies: [
      {
        id: "slot-shift",
        name: "End-of-Run Sequence Swap",
        description:
          "Re-arrange stop sequence so long-window retail depots are served last, saving early packages from cumulative lag.",
        costImpact: "€0 - Shifts order of stops",
        impactOnReliability: 94,
        iconType: "timer",
      },
      {
        id: "carrier-assist",
        name: "Assign Auxiliary Truck Support",
        description:
          "Dispatch support vehicle TR-NORTH-L4 to shadow the primary carrier and split heavy package handoffs.",
        costImpact: "+€45 auxiliary driver wage",
        impactOnReliability: 96,
        iconType: "truck",
      },
    ],
  },
  "MAD-CENTRAL-B2": {
    title: "Gran Vía / Sol / Chueca (SEUR Centro Histórico)",
    originalReliability: 68,
    failureRiskDescription:
      "Major pedestrian blocks and parking bans around Callao. Drivers spend over 12 minutes searching for unloading spots, putting 14 central priority orders at a high failure risk.",
    strategies: [
      {
        id: "locker-consolidation",
        name: "Automated Lockbox Consolidation",
        description:
          "Reroute 14 non-priority residential shipments to a secure Callao lockpoint tower with customer coupon opt-ins.",
        costImpact: "€15 locker rental (reclaims 2 hrs)",
        impactOnReliability: 92,
        iconType: "lock",
      },
      {
        id: "slot-shift",
        name: "Off-Peak Zone Handoff",
        description:
          "Schedule high-volume deliveries early (08:00 - 09:15) when commercial lane permits are active and traffic is low.",
        costImpact: "€0 - Shift early alignment",
        impactOnReliability: 88,
        iconType: "timer",
      },
      {
        id: "split-load",
        name: "Fleet Split: Assign Support Electric Van",
        description:
          "Split route load into 2 dense sub-quadrants. Introduce an auxiliary e-van to overlap and share the workload.",
        costImpact: "+€45 regional driver surcharge",
        impactOnReliability: 95,
        iconType: "split",
      },
    ],
  },
  "MAD-CENTRAL-B3": {
    title: "Chamberí / Arapiles / Bilbao (SEUR Chamberí Hub)",
    originalReliability: 82,
    failureRiskDescription:
      "Densely packed old-quarter buildings with no elevator access. Courier foot-travel delays degrade on-time performance.",
    strategies: [
      {
        id: "locker-consolidation",
        name: "Consolidated Calle de Goya Hub",
        description:
          "Divert student and retail drops to Goya smart locker terminal, eliminating multi-floor climbing attempts.",
        costImpact: "€20 hub partner subsidy",
        impactOnReliability: 94,
        iconType: "lock",
      },
      {
        id: "split-load",
        name: "Deploy Auxiliary Foot runner",
        description:
          "Hire a local student foot runner to travel as passenger with driver, running handoffs while main vehicle remains mobile.",
        costImpact: "+€25 runner hourly wage",
        impactOnReliability: 93,
        iconType: "split",
      },
    ],
  },
  "MAD-EAST-C4": {
    title: "Barrio de Salamanca / Retiro (SEUR Salamanca)",
    originalReliability: 89,
    failureRiskDescription:
      "Severe secondary street congestion predicted around schools on Calle de Ibiza during peak hours (16:00 - 17:30).",
    strategies: [
      {
        id: "slot-shift",
        name: "Ibiza School Zone Bypass",
        description:
          "Shift target deliveries in the school sector to before 15:30 or after 18:00 to completely avoid the traffic blocks.",
        costImpact: "€0 - Dynamic sequence reroute",
        impactOnReliability: 95,
        iconType: "timer",
      },
      {
        id: "locker-consolidation",
        name: "Menéndez Pelayo Smart locker drop",
        description:
          "Redirect Retiro apartment orders to partner lockers on Avenida de Menéndez Pelayo.",
        costImpact: "€10 handling surcharge",
        impactOnReliability: 93,
        iconType: "lock",
      },
    ],
  },
  "MAD-SOUTH-D8": {
    title: "Vallecas / Industrial Hub (SEUR Vallecas Hub)",
    originalReliability: 75,
    failureRiskDescription:
      "Receiving docks close early at 14:00. Even moderate upstream delays will trigger late gates and immediate delivery failure.",
    strategies: [
      {
        id: "slot-shift",
        name: "Priority Warehouse Front-loading",
        description:
          "Force industrial receiving locations to the absolute start of the day sequence (ETA before 11:30 AM).",
        costImpact: "€5 - Minimal dispatch calculation index",
        impactOnReliability: 93,
        iconType: "timer",
      },
      {
        id: "split-load",
        name: "Parallel Cargo Carrier Dispatch",
        description:
          "Deploy a separate heavy cargo vehicle to handle bulk warehouse stock directly, allowing light fleet to split.",
        costImpact: "+€60 heavy transport allocation",
        impactOnReliability: 96,
        iconType: "truck",
      },
    ],
  },
  "MAD-WEST-E1": {
    title: "Moncloa / Ciudad Universitaria (SEUR Moncloa Unit)",
    originalReliability: 86,
    failureRiskDescription:
      "Moncloa student housings show 25% 'Not Home' failure rate during standard lecture blocks (09:00 - 13:00).",
    strategies: [
      {
        id: "slot-shift",
        name: "Dusk Delivery Slot-Shift",
        description:
          "Move student flats to a late dusk delivery block (18:30 - 20:30) when residents are confirmed present.",
        costImpact: "€0 - Timetable adjustments",
        impactOnReliability: 96,
        iconType: "timer",
      },
      {
        id: "locker-consolidation",
        name: "Dynamic Campus Lockbox Reroute",
        description:
          "Direct E1 student orders to Ciudad Universitaria smart lockers with push-app QR codes for instant pick-up.",
        costImpact: "€12 university partner index fee",
        impactOnReliability: 95,
        iconType: "lock",
      },
    ],
  },
};

const getOptimizedReliability = (origReliability: number): number => {
  if (origReliability < 75) {
    return origReliability + 8; // e.g. 68 -> 76, 74 -> 82
  } else if (origReliability < 90) {
    return Math.min(94, origReliability + 6); // e.g. 82 -> 88, 89 -> 94
  } else {
    return Math.min(97, origReliability + 3); // e.g. 91 -> 94, 94 -> 97, 96 -> 97
  }
};

const getSectorIssue = (routeId: string) => {
  switch (routeId) {
    case "MAD-NORTH-A1":
      return {
        issue:
          "Over-allocated capacity (5 vans assigned vs. low actual density).",
        solution:
          "Balanced capacity. Re-allocated 1 under-utilized van to congested Central-B2.",
        label: "Madrid North A1",
        office: "SEUR Las Tablas Hub",
        type: "transit",
        explanation:
          "This is a Capacity Bottleneck (Transit Risk). Deploying more trucks than required to low-density areas reduces fleet routing efficiency.",
      };
    case "MAD-NORTH-A2":
      return {
        issue: "Minor afternoon traffic congestion on ring road M-40.",
        solution: "Chronological sequence polished to bypass commute peaks.",
        label: "Madrid North A2",
        office: "SEUR Plaza de Castilla",
        type: "transit",
        explanation:
          "This is a Traffic/Congestion Bottleneck (Transit Risk). Heavy commuter traffic blocks high-speed corridors, delaying vehicle progress.",
      };
    case "MAD-CENTRAL-B2":
      return {
        issue:
          "Immense peak AM retail congestion (7 vans overloaded; delays expected).",
        solution:
          "Absorbed +1 van from North-A1, rescheduled peak retail overlap slots.",
        label: "Madrid Central B2",
        office: "SEUR Gran Vía",
        type: "transit",
        explanation:
          "This is a Fleet Congestion Bottleneck (Transit Risk). Over-density of cargo drops on a few vehicles causes rolling transit delays.",
      };
    case "MAD-CENTRAL-B3":
      return {
        issue: "Overlapping delivery corridors creating cross-backtracking.",
        solution:
          "Disentangled routing lines; sequences polished to flow West-to-East.",
        label: "Madrid Central B3",
        office: "SEUR Chamberí Unit",
        type: "transit",
        explanation:
          "This is a Routing Alignment Bottleneck (Transit Risk). Overlapping corridors mean couriers cross paths inefficiently, adding redundant mileage.",
      };
    case "MAD-EAST-C4":
      return {
        issue:
          "High commercial density causing early delivery window friction.",
        solution:
          "Reordered sequence to prioritize early commercial delivery windows.",
        label: "Madrid East C4",
        office: "SEUR Barrio de Salamanca",
        type: "ftds",
        explanation:
          "This is a Recipient Door Access Risk (First-Time Delivery Success). Commercial stores operate under strict early load-in windows; missing them means locked gates.",
      };
    case "MAD-SOUTH-D8":
      return {
        issue:
          "16 home drops scheduled during office hours (low presence risk).",
        solution:
          "Postponed 12 residential drops to high-presence evening peak (18:00-21:00).",
        label: "Madrid South D8",
        office: "SEUR CTA Vallecas",
        type: "ftds",
        explanation:
          "This is a Recipient Absence Risk (First-Time Delivery Success). Attempting home deliveries while customers are at work leads to immediate face-to-face failure.",
      };
    case "MAD-WEST-E1":
      return {
        issue: "Strict hospital reception access hours causing delivery halts.",
        solution:
          "Pinned medical drop-offs exclusively to morning hospital shift change.",
        label: "Madrid West E1",
        office: "SEUR Moncloa Hub",
        type: "ftds",
        explanation:
          "This is a Site Access Window Risk (First-Time Delivery Success). Medical centers enforce tight, non-negotiable security handoff hours for general couriers.",
      };
    default:
      return {
        issue: "Standard operational delivery bottleneck.",
        solution: "Sequence optimized by AI matching historical presence.",
        label: "Madrid Sector",
        office: "SEUR Fleet Area",
        type: "transit",
        explanation: "General operational friction or sequence mismatch.",
      };
  }
};

export function Dashboard({
  setActiveTab,
  deliveries,
  setDeliveries,
  routes,
  setRoutes,
  pitchStage = "scale",
}: {
  setActiveTab?: (tab: string) => void;
  deliveries: any[];
  setDeliveries: React.Dispatch<React.SetStateAction<any[]>>;
  routes: any[];
  setRoutes: React.Dispatch<React.SetStateAction<any[]>>;
  pitchStage?: "poc" | "mvp" | "scale";
}) {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedTruck, setSelectedTruck] = useState<string | null>(null);
  const [filterRiskCategory, setFilterRiskCategory] = useState<
    "all" | "transit" | "ftds"
  >("all");
  const [expandedExplanations, setExpandedExplanations] = useState<
    Record<string, boolean>
  >({});
  const [showGlossary, setShowGlossary] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "delivery" | "pickup">(
    "all",
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "live" | "programmed"
  >("all");
  const [filterDay, setFilterDay] = useState("Today");
  const [subTab, setSubTab] = useState<
    "operations" | "congestion" | "roi" | "history"
  >("operations");

  // System-level fleet wide polish & reallator states
  const [systemOptimized, setSystemOptimized] = useState(false);
  const [isOptimizingSystem, setIsOptimizingSystem] = useState(false);
  const [systemOpStep, setSystemOpStep] = useState(0);

  // Interactive state overrides for optimization sync buttons
  const [truckOverrides, setTruckOverrides] = useState<Record<string, number>>(
    {},
  );
  const [regionalTruckAdjustments, setRegionalTruckAdjustments] = useState<
    Record<string, number>
  >({});
  const [maxFleetLimit, setMaxFleetLimit] = useState(30);
  const [syncingRouteId, setSyncingRouteId] = useState<string | null>(null);
  const [syncingTruckId, setSyncingTruckId] = useState<string | null>(null);
  const [optimizedRoutes, setOptimizedRoutes] = useState<
    Record<string, boolean>
  >({});
  const [optimizedTrucks, setOptimizedTrucks] = useState<
    Record<string, boolean>
  >({});

  // Advanced Dynamic Route Interference Optimizer states
  const [optimizerModalTarget, setOptimizerModalTarget] = useState<{
    routeId: string;
    truckId?: string;
  } | null>(null);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(
    null,
  );
  const [isExecutingIntervention, setIsExecutingIntervention] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);

  // Custom Toast state
  const [toast, setToast] = useState<{
    message: string;
    subMessage?: string;
    type: "success" | "alert" | "info";
  } | null>(null);
  const showToastMsg = (
    message: string,
    subMessage?: string,
    type: "success" | "alert" | "info" = "success",
  ) => {
    setToast({ message, subMessage, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleResetAll = () => {
    setDeliveries(MOCK_DELIVERIES);
    setRoutes(ROUTE_SUMMARIES);
    setTruckOverrides({});
    setRegionalTruckAdjustments({});
    setMaxFleetLimit(30);
    setSystemOptimized(false);
    setIsOptimizingSystem(false);
    setSystemOpStep(0);
    setOptimizedRoutes({});
    setOptimizedTrucks({});
    showToastMsg(
      "Simulation Reset",
      "Reverted all dynamic route sequences and truck re-allocations to rigid standard baselines.",
      "info",
    );
  };

  const handleAdjustTrucks = (routeId: string, change: number) => {
    const prev = regionalTruckAdjustments;
    const current = prev[routeId] || 0;
    const target = current + change;

    const baseCount = STANDARD_VANS[routeId] || 4;

    // Boundaries
    if (baseCount + target < 1) {
      showToastMsg(
        "Unsafe De-allocation",
        `District ${routeId} requires at least 1 van to maintain safe spatial presence.`,
        "alert",
      );
      return;
    }
    if (baseCount + target > 12) {
      showToastMsg(
        "High Density Cap Exceeded",
        `A maximum of 12 vans can operate in ${routeId} before creating local depot bottlenecking.`,
        "alert",
      );
      return;
    }

    // Check Madrid-wide capacity constraint!
    const nextAdjustments = { ...prev, [routeId]: target };
    const nextTotal = getTotalVansInMadrid(systemOptimized, nextAdjustments);
    
    if (change > 0 && nextTotal > maxFleetLimit) {
      showToastMsg(
        "Madrid Fleet Capacity Cap Reached",
        `Maximum of ${maxFleetLimit}/${maxFleetLimit} vans are already on the road. You must first DECREASE capacity in another district to allocate here, or increase the global fleet budget in Madrid.`,
        "alert"
      );
      return;
    }

    // Update state directly without rendering side-effects in state updaters
    setRegionalTruckAdjustments(nextAdjustments);

    // Dynamic recalculation
    setRoutes((routesPrev) => {
      return routesPrev.map((r) => {
        if (r.routeId === routeId) {
          const originalRoute = ROUTE_SUMMARIES.find(
            (x) => x.routeId === r.routeId,
          );
          const baseRel = originalRoute
            ? originalRoute.reliability
            : r.reliability;

          let newReliability = baseRel;
          if (target > 0) {
            newReliability = Math.min(99, baseRel + target * 4);
          } else if (target < 0) {
            newReliability = Math.max(48, baseRel + target * 6);
          }

          let newFailures = r.potentialFailures;
          if (change > 0) {
            newFailures = Math.max(0, Math.round(r.potentialFailures * 0.7));
          } else if (change < 0) {
            newFailures = Math.min(
              28,
              Math.round(r.potentialFailures * 1.35) + 1,
            );
          }

          return {
            ...r,
            reliability: newReliability,
            potentialFailures: newFailures,
          };
        }
        return r;
      });
    });

    setDeliveries((prevDels) => {
      return prevDels.map((d) => {
        if (d.assignedRoute === routeId) {
          const boost = change * 0.05 + (Math.random() - 0.5) * 0.02;
          const updatedProb = Math.min(
            0.99,
            Math.max(0.4, d.predictedProbability + boost),
          );
          return {
            ...d,
            predictedProbability: updatedProb,
          };
        }
        return d;
      });
    });

    showToastMsg(
      "Fleet Capacity Allocated",
      `Shifted cargo/capacity index for district ${routeId}. Total vans: ${baseCount + target}. Sector reliability recalculated.`,
      "success",
    );
  };

  const handleSystemWideOptimize = () => {
    if (systemOptimized) {
      handleResetAll();
      return;
    }

    if (pitchStage === "poc") {
      setSystemOptimized(true);
      setRoutes((prev) =>
        prev.map((r) => {
          const originalRoute = ROUTE_SUMMARIES.find(
            (x) => x.routeId === r.routeId,
          );
          const origReliability = originalRoute
            ? originalRoute.reliability
            : r.reliability;
          return {
            ...r,
            reliability: getOptimizedReliability(origReliability),
            aiInterventions: 0, // suggestions drop to 0
            potentialFailures: 0,
          };
        }),
      );
      setDeliveries((prev) =>
        prev.map((d) => ({
          ...d,
          predictedProbability: Math.min(0.96, d.predictedProbability + 0.08),
          status: "synced",
        })),
      );

      const allRoutesOpt: Record<string, boolean> = {};
      ROUTE_SUMMARIES.forEach((r) => {
        allRoutesOpt[r.routeId] = true;
      });
      setOptimizedRoutes(allRoutesOpt);

      showToastMsg(
        "System-Wide AI Polish Complete",
        "Optimized Madrid regional hours & re-allocated courier assets.",
        "success",
      );
      return;
    }

    setIsOptimizingSystem(true);
    setSystemOpStep(1);

    // Dynamic execution simulation
    setTimeout(() => {
      setSystemOpStep(2);
      setTimeout(() => {
        setSystemOpStep(3);
        setTimeout(() => {
          setSystemOptimized(true);
          const allRoutesOpt: Record<string, boolean> = {};
          setRoutes((prev) => {
            const updated = prev.map((r) => {
              const originalRoute = ROUTE_SUMMARIES.find(
                (x) => x.routeId === r.routeId,
              );
              const origReliability = originalRoute
                ? originalRoute.reliability
                : r.reliability;
              return {
                ...r,
                reliability: getOptimizedReliability(origReliability),
                aiInterventions: 0, // suggestions drop to absolute minimum
                potentialFailures: 0,
              };
            });
            updated.forEach((r) => {
              allRoutesOpt[r.routeId] = true;
            });
            return updated;
          });
          setOptimizedRoutes(allRoutesOpt);
          setDeliveries((prev) =>
            prev.map((d) => ({
              ...d,
              predictedProbability: Math.min(
                0.96,
                d.predictedProbability + 0.08,
              ),
              status: "synced",
            })),
          );
          setIsOptimizingSystem(false);
          setSystemOpStep(0);
          showToastMsg(
            "System Fleet Sync Activated",
            "Dynamic allocation live: Shifted load volumes and trucks. Suggestions solved.",
            "success",
          );
        }, 1200);
      }, 1200);
    }, 1200);
  };

  const handleReverseRoute = (e: React.MouseEvent, routeId: string) => {
    e.stopPropagation();
    const originalRoute = ROUTE_SUMMARIES.find((r) => r.routeId === routeId);
    if (!originalRoute) return;

    setRoutes((prev) =>
      prev.map((r) => (r.routeId === routeId ? { ...originalRoute } : r)),
    );
    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.assignedRoute === routeId) {
          const originalDel = MOCK_DELIVERIES.find((orig) => orig.id === d.id);
          return originalDel ? { ...originalDel } : d;
        }
        return d;
      }),
    );
    setOptimizedRoutes((prev) => ({ ...prev, [routeId]: false }));
    setSystemOptimized(false);

    showToastMsg(
      "Route Sequence Reverted",
      `District ${routeId} returned to standard rigid baseline schedules. Probability scores recalculated.`,
      "info",
    );
  };

  const handleReverseTruck = (e: React.MouseEvent, truckId: string) => {
    e.stopPropagation();
    setTruckOverrides((prev) => {
      const copy = { ...prev };
      delete copy[truckId];
      return copy;
    });
    setOptimizedTrucks((prev) => ({ ...prev, [truckId]: false }));
    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.courierId === truckId) {
          const originalDel = MOCK_DELIVERIES.find((orig) => orig.id === d.id);
          return originalDel ? { ...originalDel } : d;
        }
        return d;
      }),
    );
    showToastMsg(
      "Courier Sequence Reverted",
      `Courier ${truckId} sequence returned to initial baseline delivery priorities.`,
      "info",
    );
  };

  const handleOptimizeRoute = (e: React.MouseEvent, routeId: string) => {
    e.stopPropagation();
    if (optimizedRoutes[routeId]) {
      showToastMsg(
        "Already Optimized",
        `District ${routeId} is already running on optimal temporal stop sequences.`,
        "info",
      );
      return;
    }
    const originalRoute = ROUTE_SUMMARIES.find((r) => r.routeId === routeId);
    const originalReliability = originalRoute ? originalRoute.reliability : 85;

    // Calculate a realistic single optimization boost
    const optimizedValue = getOptimizedReliability(originalReliability);

    if (pitchStage === "poc") {
      setRoutes((prev) =>
        prev.map((r) =>
          r.routeId === routeId
            ? {
                ...r,
                reliability: optimizedValue,
                aiInterventions: 0, // suggestions optimized on run
                potentialFailures: Math.max(0, r.potentialFailures - 2),
              }
            : r,
        ),
      );
      setDeliveries((prev) =>
        prev.map((d) => {
          if (d.assignedRoute === routeId) {
            return {
              ...d,
              predictedProbability: Math.min(
                0.96,
                d.predictedProbability + 0.1,
              ),
              status: "synced",
            };
          }
          return d;
        }),
      );
      setOptimizedRoutes((prev) => ({ ...prev, [routeId]: true }));
      showToastMsg(
        "AI Local Route Rescheduled",
        `Rescheduled orders in ${routeId} to high-probability slots by reconciling historical delivery trends with active customer inputs—adjusting for conflicts where past behaviors disprove stated slots.`,
        "success",
      );
      return;
    }
    const profile =
      ZONE_RISK_PROFILES[routeId] || ZONE_RISK_PROFILES["MAD-NORTH-A1"];
    setOptimizerModalTarget({ routeId });
    setSelectedStrategyId(profile.strategies[0].id);
  };

  const handleOptimizeTruck = (e: React.MouseEvent, truckId: string) => {
    e.stopPropagation();
    if (optimizedTrucks[truckId]) {
      showToastMsg(
        "Already Optimized",
        `Courier ${truckId} is already optimized based on recipient time preferences.`,
        "info",
      );
      return;
    }
    if (pitchStage === "poc") {
      if (selectedZone) {
        setTruckOverrides((prev) => ({ ...prev, [truckId]: 92 }));
        setRoutes((prev) =>
          prev.map((r) =>
            r.routeId === selectedZone
              ? { ...r, aiInterventions: Math.max(0, r.aiInterventions - 4) }
              : r,
          ),
        );
        setOptimizedTrucks((prev) => ({ ...prev, [truckId]: true }));
        showToastMsg(
          "Vehicle Sequence Optimized",
          `Re-sequenced truck ${truckId} stops by balancing customer inputs against long-term historic success patterns to avoid over-optimizing on unreliable self-reported slots.`,
          "success",
        );
      }
      return;
    }
    if (selectedZone) {
      const profile =
        ZONE_RISK_PROFILES[selectedZone] || ZONE_RISK_PROFILES["MAD-NORTH-A1"];
      setOptimizerModalTarget({ routeId: selectedZone, truckId });
      setSelectedStrategyId(profile.strategies[0].id);
    }
  };

  const handleExecuteIntervention = () => {
    if (!optimizerModalTarget || !selectedStrategyId) return;

    setIsExecutingIntervention(true);
    setExecutionStep(1);

    // Step 1 sequencer mock delay
    setTimeout(() => {
      setExecutionStep(2);

      // Step 2 sequencer mock delay
      setTimeout(() => {
        setExecutionStep(3);

        // Step 3 sequencer final delay to apply changes
        setTimeout(() => {
          const { routeId, truckId } = optimizerModalTarget;
          const profile =
            ZONE_RISK_PROFILES[routeId] || ZONE_RISK_PROFILES["MAD-NORTH-A1"];
          const strategy =
            profile.strategies.find((s) => s.id === selectedStrategyId) ||
            profile.strategies[0];

          if (truckId) {
            // Non-uniform individual truck calculation: adds natural performance variance
            const variance = Math.floor(Math.random() * 5) - 2; // -2% to +2%
            const realisticTruckReliability = Math.min(
              98,
              Math.max(83, strategy.impactOnReliability + variance),
            );

            // Update individual truck overrides
            setTruckOverrides((prev) => ({
              ...prev,
              [truckId]: realisticTruckReliability,
            }));

            // Decrease overall zone interventions count (suggestions solved!)
            setRoutes((prev) =>
              prev.map((r) =>
                r.routeId === routeId
                  ? {
                      ...r,
                      aiInterventions: Math.max(0, r.aiInterventions - 4),
                    }
                  : r,
              ),
            );

            // Adjust associated deliveries NON-UNIFORMLY!
            const truckIdx = parseInt(truckId.split("-L").pop() || "0");
            const isPickupTruck = truckIdx % 2 === 0;
            const targetStopType = isPickupTruck ? "pickup" : "delivery";

            setDeliveries((prev) =>
              prev.map((d) => {
                if (
                  d.assignedRoute === routeId &&
                  d.stopType === targetStopType
                ) {
                  if (d.predictedProbability < 0.8) {
                    // Boost the bottleneck drops significantly (e.g. +14% to +22%) because we split the load or shifted them!
                    const targetBoost = 0.14 + Math.random() * 0.08;
                    return {
                      ...d,
                      predictedProbability: Math.min(
                        0.95,
                        d.predictedProbability + targetBoost,
                      ),
                      status: "synced",
                    };
                  } else {
                    // Standard drops drift slightly as other stops are re-ordered (-1% to +1%)
                    const drift = (Math.random() - 0.5) * 0.02;
                    return {
                      ...d,
                      predictedProbability: Math.min(
                        0.98,
                        Math.max(0.8, d.predictedProbability + drift),
                      ),
                      status: "synced",
                    };
                  }
                }
                return d;
              }),
            );

            setOptimizedTrucks((prev) => ({ ...prev, [truckId]: true }));

            showToastMsg(
              `Truck ${truckId} Rescheduled!`,
              `Dispatched strategy "${strategy.name}". Truck performance recalculated at ${realisticTruckReliability}% non-uniformly.`,
              "success",
            );
          } else {
            // Parent Route/Zone update with natural variance
            const zoneStatsVariant = Math.min(
              97,
              Math.max(
                82,
                strategy.impactOnReliability +
                  (Math.floor(Math.random() * 5) - 2),
              ),
            );

            setRoutes((prev) =>
              prev.map((r) =>
                r.routeId === routeId
                  ? {
                      ...r,
                      reliability: zoneStatsVariant,
                      aiInterventions: 0,
                      potentialFailures: 0,
                    }
                  : r,
              ),
            );

            // Adjust all deliveries in that zone in a non-uniform way (targeting failures)
            setDeliveries((prev) =>
              prev.map((d) => {
                if (d.assignedRoute === routeId) {
                  if (d.predictedProbability < 0.8) {
                    // Vulnerable drops are resolved
                    const targetBoost = 0.15 + Math.random() * 0.1;
                    return {
                      ...d,
                      predictedProbability: Math.min(
                        0.94,
                        d.predictedProbability + targetBoost,
                      ),
                      status: "synced",
                    };
                  } else {
                    // Balanced shift trade-off
                    const drift = (Math.random() - 0.6) * 0.03;
                    return {
                      ...d,
                      predictedProbability: Math.min(
                        0.97,
                        Math.max(0.8, d.predictedProbability + drift),
                      ),
                      status: "synced",
                    };
                  }
                }
                return d;
              }),
            );

            setOptimizedRoutes((prev) => ({ ...prev, [routeId]: true }));

            showToastMsg(
              `Zone ${routeId} Optimized!`,
              `Applied "${strategy.name}". Outlying risks solved, raising sector performance to ${zoneStatsVariant}% (non-uniform splits).`,
              "success",
            );
          }

          // Complete and teardown modal states
          setOptimizerModalTarget(null);
          setSelectedStrategyId(null);
          setIsExecutingIntervention(false);
          setExecutionStep(0);
        }, 1200);
      }, 1000);
    }, 1000);
  };

  const targetProfile = optimizerModalTarget
    ? ZONE_RISK_PROFILES[optimizerModalTarget.routeId]
    : null;

  // Dynamically calculate average system-wide success rate based on real deliveries state
  const autoSuccessRate = Math.min(
    99.8,
    parseFloat(
      (
        (deliveries.reduce((sum, d) => sum + d.predictedProbability, 0) /
          deliveries.length) *
        100
      ).toFixed(1),
    ),
  );

  // Synchronized ROI calculation engine matching IntelligenceHub
  const dailyVolumeROI = 1124; // Madrid node baseline volume (daily shipments)
  const firstTimeSuccessBaseline = 74.2;
  const firstTimeSuccessOptimized = autoSuccessRate;
  const kmPerStopBaseline = 3.2;
  const kmPerStopOptimized = 1.2;

  const failedBaselineCost =
    dailyVolumeROI * (1 - firstTimeSuccessBaseline / 100) * 15.0;
  const kmBaselineCost = dailyVolumeROI * kmPerStopBaseline * 0.75;
  const totalBaselineCost = failedBaselineCost + kmBaselineCost;

  const failedOptimizedCost =
    dailyVolumeROI * (1 - firstTimeSuccessOptimized / 100) * 15.0;
  const kmOptimizedCost = dailyVolumeROI * kmPerStopOptimized * 0.75;
  const totalOptimizedCost = failedOptimizedCost + kmOptimizedCost;

  const simulationYieldValue = Math.max(
    0.1,
    parseFloat(((totalBaselineCost - totalOptimizedCost) / 1000).toFixed(1)),
  );

  const prevailingDailyYield = simulationYieldValue;
  const prevailingMonthlyYield = Math.round(simulationYieldValue * 30 * 1000);

  // June's yield (index 5) represents the active month which scales with the prevailingMonthlyYield representing the active optimization state
  const dynamicTrendData = trendData.map((d, index) => {
    if (index === trendData.length - 1) {
      // Scale dynamic June yield based on prevailing monthly yield projection
      return {
        ...d,
        recovered: Math.min(
          195500,
          Math.max(142400, prevailingMonthlyYield * 2),
        ),
      };
    }
    return d;
  });

  const cumulativeYieldSum = dynamicTrendData.reduce(
    (sum, d) => sum + d.recovered,
    0,
  );

  const getUniqueCompletedStops = (truckId: string, zoneId: string) => {
    const zoneSummary = routes.find((r) => r.routeId === zoneId);
    const baseStops = zoneSummary?.completedStops || [];

    // Seed hash based on truckId to make it fully unique, deterministic and stable
    const seed = Array.from(truckId).reduce(
      (h, c) => (h << 5) - h + c.charCodeAt(0),
      0,
    );

    // Pool of high-quality Madrid streets
    const madridStreets = [
      "Calle de Alcalá",
      "Paseo de la Castellana",
      "Gran Vía",
      "Calle de Atocha",
      "Calle de Serrano",
      "Calle de José Abascal",
      "Avenida de América",
      "Calle de Goya",
      "Paseo del Prado",
      "Calle de Arturo Soria",
      "Avenida de la Ilustración",
      "Calle de Bailén",
      "Calle de San Bernardo",
      "Calle de Princesa",
      "Calle de Toledo",
      "Calle de Hortaleza",
    ];

    return baseStops.map((stop, index) => {
      const streetIdx = Math.abs(seed + index) % madridStreets.length;
      const num = (Math.abs(seed * (index + 1)) % 180) + 1;
      const uniqueAddress = `${madridStreets[streetIdx]}, ${num}, Madrid`;

      const hour = 8 + Math.floor((Math.abs(seed + index) % 120) / 60);
      const minute = Math.abs(seed * (index + 2)) % 60;
      const uniqueTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} AM`;

      return {
        ...stop,
        address: uniqueAddress,
        time: uniqueTime,
      };
    });
  };

  const filteredTrucks = (zoneId: string, applyFilters = true) => {
    const zone = routes.find((r) => r.routeId === zoneId);

    // Generate some mock trucks/vans for the zone - Mixed Distribution with dynamic length per region
    let adjustment = 0;
    if (systemOptimized) {
      if (zoneId === "MAD-CENTRAL-B2") adjustment = 1;
      else if (zoneId === "MAD-NORTH-A1") adjustment = -1;
    }
    const manualAdj = regionalTruckAdjustments[zoneId] || 0;
    adjustment += manualAdj;

    const baseCount = STANDARD_VANS[zoneId] || 4;
    const truckCount = Math.max(1, baseCount + adjustment);
    const range = Array.from({ length: truckCount }, (_, i) => i + 1);

    const totalZoneStops = zone ? zone.totalStops : 120;
    const baseStopsPerTruck = Math.floor(totalZoneStops / range.length);
    const remainder = totalZoneStops % range.length;

    const trucks = range.map((i, idx) => {
      const id = `TR-${zoneId.split("-").pop()}-L${i}`;
      const zoneReliability = zone ? zone.reliability : 85;

      // Let truck reliability vary realistically around zone reliability, capped at 99%
      const truckReliability = Math.min(
        99,
        Math.max(65, zoneReliability + (i % 2 === 0 ? 2 : -3)),
      );

      return {
        id,
        isPickup: i % 2 === 0, // Alternating roles for mixed fleet per zone
        status: i < 5 ? "live" : "programmed",
        reliability:
          truckOverrides[id] !== undefined
            ? truckOverrides[id]
            : truckReliability,
        stops: baseStopsPerTruck + (i <= remainder ? 1 : 0),
      };
    });

    if (!applyFilters) return trucks;

    return trucks.filter((t) => {
      if (
        filterType !== "all" &&
        (t.isPickup ? "pickup" : "delivery") !== filterType
      )
        return false;
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (
        searchQuery &&
        !t.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  };

  // Get active truck details if selected - pulling from the same unified and synced metrics
  const activeTruckObj =
    selectedTruck && selectedZone
      ? filteredTrucks(selectedZone, false).find((t) => t.id === selectedTruck)
      : null;
  const activeTruckStops = activeTruckObj ? activeTruckObj.stops : 24;
  const activeTruckReliability = activeTruckObj
    ? activeTruckObj.reliability
    : 98;

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      <header className="min-h-[72px] px-4 md:px-8 border-b border-[#E2E8F0] flex flex-col md:flex-row items-start md:items-center justify-between bg-white shrink-0 py-4 md:py-0 gap-3">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div>
            <h1 className="text-[18px] md:text-[20px] font-black text-[#1E293B]">
              Live Operations Ledger
            </h1>
            <p className="text-[11px] md:text-[13px] text-[#64748B] font-medium uppercase tracking-tight opacity-70 italic sm:whitespace-nowrap">
              Logic Synchronization & Failure Prevention
            </p>
          </div>
          {selectedZone && (() => {
            const extra = getSectorIssue(selectedZone);
            return (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg ml-2 md:ml-6 text-[11px]">
                <span className="font-extrabold text-blue-400 uppercase tracking-widest">
                  Zone Focus:
                </span>
                <span className="font-black text-blue-700">
                  {extra.label} • {extra.office} ({MADRID_REAL_CODES[selectedZone] || selectedZone})
                </span>
              </div>
            );
          })()}
        </div>
        <div className="flex items-center justify-end gap-3 w-full md:w-auto">
          {(routes.some((r) => r.aiInterventions === 0) ||
            Object.keys(truckOverrides).length > 0 ||
            systemOptimized) && (
            <button
              onClick={handleResetAll}
              className="py-2 px-3.5 bg-slate-100 hover:bg-slate-250 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-slate-200 cursor-pointer animate-in fade-in duration-300"
            >
              Reset Live Sequence
            </button>
          )}

          <div className="w-9 h-9 md:w-10 md:h-10 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-slate-400 font-black text-[12px]">
            AG
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6 md:space-y-8">
          {/* Sub Tab Navigation Switcher */}
          {pitchStage !== "poc" ? (
            <div className="flex flex-wrap items-center justify-between border-b border-[#E2E8F0] pb-4 gap-4">
              <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                <button
                  onClick={() => setSubTab("operations")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer border",
                    subTab === "operations"
                      ? "bg-white text-slate-900 border-slate-200 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 border-transparent hover:bg-slate-50",
                  )}
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> Fleet Ledger & Map
                </button>
                <button
                  onClick={() => setSubTab("congestion")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer border",
                    subTab === "congestion"
                      ? "bg-white text-slate-900 border-slate-200 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 border-transparent hover:bg-slate-50",
                  )}
                >
                  <BrainCircuit className="w-3.5 h-3.5" /> Congestion & Latency
                </button>
                {pitchStage === "scale" && (
                  <>
                    <button
                      onClick={() => setSubTab("roi")}
                      className={cn(
                        "px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer border",
                        subTab === "roi"
                          ? "bg-white text-slate-900 border-[#E2E8F0] shadow-sm"
                          : "text-slate-500 hover:text-slate-800 border-transparent hover:bg-slate-50",
                      )}
                    >
                      <TrendingUp className="w-3.5 h-3.5" /> Advanced ROI
                      Simulator
                    </button>
                    <button
                      onClick={() => setSubTab("history")}
                      className={cn(
                        "px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer border",
                        subTab === "history"
                          ? "bg-white text-slate-900 border-[#E2E8F0] shadow-sm"
                          : "text-slate-500 hover:text-slate-800 border-transparent hover:bg-slate-50",
                      )}
                    >
                      <Network className="w-3.5 h-3.5" /> Historical Performance
                    </button>
                  </>
                )}
              </div>

              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-55 border border-slate-200 px-3 py-1.5 rounded-lg">
                Status:{" "}
                <span className="text-emerald-500">
                  Live Orchestration Active
                </span>
              </div>
            </div>
          ) : (
            <div className="border-b border-[#E2E8F0] pb-4 text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#2563EB] font-mono mb-1 block">
                Simple POC Operational Ledger
              </span>
              <h2 className="text-[20px] font-black text-[#1E293B]">
                Fleet Ledger Tracker
              </h2>
            </div>
          )}

          {subTab === "operations" && (
            <>
              {/* KPI Row */}
              {pitchStage === "poc" ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <KPICard
                    title="Success Rate"
                    value={`${autoSuccessRate}%`}
                    trend="↑ 2.4% increase"
                    detail="vs last month"
                    up={true}
                  />
                  <KPICard
                    title="Avg Time Window"
                    value="42m"
                    trend="Narrowed"
                    detail="Saved 3.2h vs legacy"
                    up={true}
                    accent="emerald"
                  />
                  <KPICard
                    title="Failed Deliveries Avoided"
                    value="2,142"
                    trend="Redirected"
                    detail="AI-Route logic"
                    up={true}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                  <KPICard
                    title="Success Rate"
                    value={`${autoSuccessRate}%`}
                    trend="↑ 2.4% increase"
                    detail="vs last month"
                    up={true}
                  />
                  <KPICard
                    title="Avg Time Window"
                    value="42m"
                    trend="Narrowed"
                    detail="Saved 3.2h vs legacy"
                    up={true}
                    accent="emerald"
                  />
                  <KPICard
                    title="Failed Deliveries Avoided"
                    value="2,142"
                    trend="Redirected"
                    detail="AI-Route logic"
                    up={true}
                  />
                  <KPICard
                    title="On-Time Delivery"
                    value="97.8%"
                    trend="Stabilized"
                    detail="+4.2% vs last quarter"
                    up={true}
                  />
                  <KPICard
                    title="Recapture Savings"
                    value={`€${Math.round(cumulativeYieldSum / 1000)}k`}
                    trend="Cumulative"
                    detail={`Sum of Jan-Jun trend data`}
                    up={true}
                    accent="emerald"
                  />
                </div>
              )}

              {/* System-Wide AI Polish & Fleet Reallocator Banner */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 text-slate-800 relative overflow-hidden shadow-sm text-left animate-in fade-in duration-300">
                {/* Visual background sparkles */}
                <div className="absolute top-0 right-0 p-3 opacity-20 pointer-events-none">
                  <Sparkles className="w-16 h-16 text-indigo-500/30 rotate-12" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row items-start justify-between gap-6">
                  <div className="space-y-4 flex-1 w-full">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg border border-slate-200">
                          {pitchStage === "poc"
                            ? "POC SYSTEM POLISH"
                            : pitchStage === "mvp"
                              ? "MVP FLEET BALANCER"
                              : "SCALE COGNITIVE HUB"}
                        </span>
                        {systemOptimized && (
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-200/60 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            DYNAMIC ALLOCATION LIVE
                          </span>
                        )}
                      </div>
                      <h3 className="text-[18px] md:text-[20px] font-bold text-slate-900 leading-none tracking-tight">
                        Madrid System-Wide AI Polish & Load Re-balancer
                      </h3>

                      <p className="text-[12px] text-slate-500 leading-relaxed max-w-3xl font-sans font-medium">
                        {pitchStage === "poc"
                          ? "Optimizes the first-time delivery success rate by combining deep historical drop-off patterns with optional customer availability signals. Re-sequences stops by weighing active user inputs against empirical historic profiles, preventing inaccurate overrides when stated preferences conflict with verified past patterns."
                          : pitchStage === "mvp"
                            ? "Enhances the probability of first-time delivery success by cross-referencing active recipient signals with long-term delivery telemetry. Balances self-reported slots against historical sector success rates to resolve conflicting arrival signals."
                            : "Self-healing logistic balancer designed to maximize first-time delivery success. Reconciles voluntary customer response slots with empirical neighborhood history through weighted scoring to ensure fleet routes optimize around proven presence patterns."}
                      </p>
                    </div>

                    {/* Unified System Wide Progress/Telemetry Indicators for All Phases */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-[10px] text-slate-500 font-sans">
                      <div>
                        <div className="text-[8px] uppercase font-bold tracking-wider text-slate-400">
                          System Sync Status
                        </div>
                        <div
                          className={`text-[12px] font-bold mt-1 ${systemOptimized ? "text-emerald-600" : "text-amber-600"}`}
                        >
                          {systemOptimized
                            ? "OPTIMIZED & RESOLVED"
                            : "POTENTIAL CONGESTION AHEAD"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[8px] uppercase font-bold tracking-wider text-slate-400">
                          Temporal Adjustments
                        </div>
                        <div className="text-[12px] font-bold mt-1 text-slate-700">
                          {systemOptimized
                            ? "Shifted to optimal presence slots"
                            : "Waiting for AI optimization"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[8px] uppercase font-bold tracking-wider text-slate-400">
                          Fleet Re-allocations
                        </div>
                        <div className="text-[12px] font-bold mt-1 text-indigo-600 font-bold">
                          {systemOptimized
                            ? pitchStage === "poc"
                              ? "Balanced across Madrid sectors"
                              : "Shifted trucks to Central & South"
                            : "Standard distribution baseline"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[8px] uppercase font-bold tracking-wider text-slate-400">
                          Suggestions Solved
                        </div>
                        <div className="text-[12px] font-bold mt-1 text-emerald-600 font-bold">
                          {systemOptimized
                            ? "100% Solved (0 Pending)"
                            : "Active AI suggestions pending"}
                        </div>
                      </div>
                    </div>

                    {/* Madrid Grid Optimization Status - Merged & Streamlined for Lean Design */}
                    <div className="pt-4 space-y-4 select-none text-left">
                      
                      {/* Global Fleet Cap & Cost-benefit Status Bar (MVP / Full Only) */}
                      {(pitchStage === "mvp" || pitchStage === "scale") && (() => {
                        const activeTotal = getTotalVansInMadrid(systemOptimized, regionalTruckAdjustments);
                        return (
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/60 animate-in fade-in duration-300">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 font-sans">
                                  Madrid-wide Global Fleet Cap
                                </span>
                                <span className="text-[9px] text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono">
                                  Lease: €150/day per van
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-4">
                                <div>
                                  Daily Budget: <span className="text-slate-800 font-semibold">€{(maxFleetLimit * 150).toLocaleString()} / day</span>
                                </div>
                                {maxFleetLimit > 30 && (
                                  <div className="text-amber-600 font-semibold">
                                    (+€{((maxFleetLimit - 30) * 150).toLocaleString()}/day vs default)
                                  </div>
                                )}
                                {maxFleetLimit < 30 && (
                                  <div className="text-emerald-600 font-semibold">
                                    (-€{((30 - maxFleetLimit) * 150).toLocaleString()}/day saved)
                                  </div>
                                )}
                                {maxFleetLimit === 30 && (
                                  <div className="text-slate-400 italic font-medium">
                                    (Standard baseline configuration)
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                              {/* Compact adjuster */}
                              <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-sans px-1">
                                  Limit:
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (maxFleetLimit <= activeTotal) {
                                      showToastMsg(
                                        "Cannot Decrease Cap",
                                        `Active van deployment (${activeTotal}) is currently taking up all slots. Decrease a district capacity first to return a van.`,
                                        "alert"
                                      );
                                      return;
                                    }
                                    if (maxFleetLimit <= 7) {
                                      showToastMsg(
                                        "Minimum Cap Reached",
                                        "At least 7 vans are required (1 per district minimum setup).",
                                        "alert"
                                      );
                                      return;
                                    }
                                    setMaxFleetLimit(prev => Math.max(7, prev - 1));
                                    showToastMsg("Fleet Limit Decreased", `Scaled global Madrid fleet down to ${maxFleetLimit - 1} vans. Reduced overhead cost projection.`, "success");
                                  }}
                                  disabled={maxFleetLimit <= activeTotal || maxFleetLimit <= 7}
                                  className={cn(
                                    "w-6 h-6 flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-600 rounded hover:bg-slate-100 active:scale-95 transition-all cursor-pointer font-bold text-xs",
                                    (maxFleetLimit <= activeTotal || maxFleetLimit <= 7) && "opacity-45 cursor-not-allowed hover:bg-slate-50 active:scale-100"
                                  )}
                                >
                                  -
                                </button>
                                <span className="font-mono text-[12px] font-bold text-indigo-600 min-w-[20px] text-center">
                                  {maxFleetLimit}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (maxFleetLimit >= 50) {
                                      showToastMsg(
                                        "Maximum Cap Reached",
                                        "Maximum simulation cap is 50 vans to prevent depot bottlenecks.",
                                        "alert"
                                      );
                                      return;
                                    }
                                    setMaxFleetLimit(prev => Math.min(50, prev + 1));
                                    showToastMsg("Fleet Limit Increased", `Scaled global Madrid fleet up to ${maxFleetLimit + 1} vans. Daily cost adjusts by +€150.`, "success");
                                  }}
                                  disabled={maxFleetLimit >= 50}
                                  className={cn(
                                    "w-6 h-6 flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-600 rounded hover:bg-slate-100 active:scale-95 transition-all cursor-pointer font-bold text-xs",
                                    maxFleetLimit >= 50 && "opacity-45 cursor-not-allowed hover:bg-slate-50 active:scale-100"
                                  )}
                                >
                                  +
                                </button>
                              </div>

                              {/* Compact status pool progress bar */}
                              <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 font-mono text-[10px]">
                                <span className="text-slate-400 uppercase tracking-wider text-[9px] font-sans">Deployed:</span>
                                <span className="text-slate-800 font-bold">{activeTotal}</span>
                                <span className="text-slate-400">/</span>
                                <span className="text-indigo-600 font-bold">{maxFleetLimit}</span>
                                <div className="w-12 bg-slate-100 p-0.5 rounded-full border border-slate-200 overflow-hidden">
                                  <div 
                                    className={cn(
                                      "h-1 rounded-full transition-all duration-300",
                                      activeTotal >= maxFleetLimit ? "bg-amber-500" : "bg-indigo-600"
                                    )}
                                    style={{ width: `${Math.min(100, (activeTotal / maxFleetLimit) * 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono flex items-center justify-between">
                        <span>
                          Madrid Logistics Grid ({routes.length} Active Autonomous Sectors)
                        </span>
                        <span className="text-[9px] text-indigo-500 normal-case font-normal font-sans">
                          Dynamic sequence state
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                        {routes.map((r) => {
                          const isRouteOptimized = optimizedRoutes[r.routeId] || systemOptimized;
                          const sectorInfo = getSectorIssue(r.routeId);

                          const routeId = r.routeId;
                          const baseStandard = STANDARD_VANS[routeId] || 4;
                          let optAdj = 0;
                          if (systemOptimized) {
                            if (routeId === "MAD-CENTRAL-B2") optAdj = 1;
                            else if (routeId === "MAD-NORTH-A1") optAdj = -1;
                          }
                          const activeTotal = getTotalVansInMadrid(systemOptimized, regionalTruckAdjustments);
                          const manualAdj = regionalTruckAdjustments[routeId] || 0;
                          const currentVans = Math.max(1, baseStandard + optAdj + manualAdj);
                          const netChange = currentVans - baseStandard;

                          let statusLabel = "Usual";
                          let textColorClass = "text-slate-400";
                          if (netChange > 0) {
                            statusLabel = `+${netChange}`;
                            textColorClass = "text-emerald-600 font-semibold";
                          } else if (netChange < 0) {
                            statusLabel = `-${Math.abs(netChange)}`;
                            textColorClass = "text-rose-600 font-semibold";
                          }

                          return (
                            <div
                              key={r.routeId}
                              className={cn(
                                "p-3 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[124px] text-left",
                                isRouteOptimized
                                  ? "bg-emerald-50/50 border-emerald-200/70 shadow-sm"
                                  : "bg-slate-50/50 border-slate-200/80 hover:border-slate-300",
                              )}
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-[9px] font-bold text-slate-500 font-mono tracking-tight leading-none bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                  {MADRID_REAL_CODES[r.routeId] || r.routeId}
                                </span>
                                <span
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full shrink-0",
                                    isRouteOptimized
                                      ? "bg-emerald-500"
                                      : "bg-amber-400 animate-pulse",
                                  )}
                                />
                              </div>

                              <div className="flex flex-col mt-2">
                                <span className="text-[10px] font-bold text-slate-800 leading-tight truncate">
                                  {sectorInfo.label}
                                </span>
                                <span className="text-[8px] text-slate-400 font-medium truncate mt-0.5 leading-none">
                                  {sectorInfo.office}
                                </span>
                              </div>

                              {/* Unified inline Fleet Controls */}
                              {pitchStage === "poc" ? (
                                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[8px] font-mono text-slate-400">
                                  <span>Baseline</span>
                                  <span className="text-slate-600 font-semibold">{currentVans} Vans</span>
                                </div>
                              ) : (
                                <div className="mt-3 pt-2 border-t border-slate-100 space-y-1">
                                  <div className="flex items-center justify-between text-[9px] font-sans">
                                    <span className="text-slate-400">Capacity</span>
                                    <span className={cn("font-semibold text-slate-700", netChange !== 0 && "text-indigo-600")}>
                                      {currentVans} Vans
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className={cn("text-[8.5px] font-mono", netChange !== 0 ? textColorClass : "text-slate-400")}>
                                      {netChange === 0 ? "Standard" : `Adj: ${statusLabel}`}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAdjustTrucks(routeId, -1);
                                        }}
                                        disabled={currentVans <= 1}
                                        className={cn(
                                          "w-4.5 h-4.5 flex items-center justify-center bg-white border border-slate-200 text-slate-600 rounded hover:bg-slate-50 active:scale-95 transition-all cursor-pointer font-bold text-[10px] leading-none",
                                          currentVans <= 1 && "opacity-30 cursor-not-allowed hover:bg-white active:scale-100"
                                        )}
                                        title="De-allocate 1 van"
                                      >
                                        -
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAdjustTrucks(routeId, 1);
                                        }}
                                        disabled={currentVans >= 12 || activeTotal >= maxFleetLimit}
                                        className={cn(
                                          "w-4.5 h-4.5 flex items-center justify-center bg-white border border-slate-200 text-slate-600 rounded hover:bg-slate-50 active:scale-95 transition-all cursor-pointer font-bold text-[10px] leading-none",
                                          (currentVans >= 12 || activeTotal >= maxFleetLimit) && "opacity-30 cursor-not-allowed hover:bg-white active:scale-100"
                                        )}
                                        title="Allocate 1 van"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  </div>

                  <div className="shrink-0 w-full lg:w-auto flex flex-col items-center justify-center lg:self-center mt-4 lg:mt-0">
                    {isOptimizingSystem ? (
                      <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200 w-56 text-center space-y-3">
                        <RotateCw className="w-5 h-5 text-indigo-500 animate-spin" />
                        <div className="text-[11px] font-mono text-slate-600">
                          {systemOpStep === 1 && "Analyzing road friction..."}
                          {systemOpStep === 2 &&
                            "Migrating 3 courier assets..."}
                          {systemOpStep === 3 &&
                            "Broadcasting local schedules..."}
                        </div>
                        <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full animate-pulse"
                            style={{
                              width:
                                systemOpStep === 1
                                  ? "33%"
                                  : systemOpStep === 2
                                    ? "66%"
                                    : "100%",
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={handleSystemWideOptimize}
                        className={cn(
                          "py-3 px-6 rounded-2xl text-[10px] md:text-[11px] font-bold tracking-wider uppercase transition-all shadow-sm cursor-pointer w-full lg:w-56 min-h-[48px] flex items-center justify-center gap-2 border",
                          systemOptimized
                            ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-100",
                        )}
                      >
                        <Zap
                          className={cn(
                            "w-4 h-4",
                            !systemOptimized && "animate-pulse",
                          )}
                        />
                        {systemOptimized
                          ? "Reset Fleet Polish"
                          : pitchStage === "poc"
                            ? "System AI Polish"
                            : pitchStage === "mvp"
                              ? "Run Load Balancing"
                              : "De-congest Grid"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Interactive Educational Glossary Guide Card */}
              <AnimatePresence>
                {showGlossary && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-5 md:p-6 bg-gradient-to-r from-blue-50/80 via-indigo-50/45 to-slate-50 border border-indigo-100/80 rounded-[24px] shadow-sm flex flex-col gap-4 relative overflow-hidden select-none mb-6 animate-in fade-in"
                  >
                    {/* Decorative overlay element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex-1 space-y-3">
                      <div className="flex items-start md:items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 shadow-inner">
                            <HelpCircle className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <h4 className="text-[14px] font-black text-slate-900 tracking-tight leading-none mb-1">
                              Risk Diagnostic Classifier Guide
                            </h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                              Autonomous SLA Protection Node Breakdown
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowGlossary(false)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer rounded-lg hover:bg-slate-200/50"
                          title="Hide Risk Guide"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-left">
                        {/* Box 1: Transit Bottleneck Risk */}
                        <div className="p-4 bg-white rounded-xl border border-amber-200/50 shadow-xs space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                              <h5 className="text-[11.5px] font-black uppercase text-amber-800 tracking-wide">
                                Transit Bottleneck Risk (Road delays)
                              </h5>
                            </div>
                            <span className="text-[9px] font-mono font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded uppercase">
                              Roads & Traffic
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                            <strong>Cause:</strong> Overlapping delivery routes or peak commuter traffic on highways.
                          </p>
                          <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                            <strong>Impact:</strong> Delays trucks on the road and causes arrival slot misses. Solved by assigning cleaner delivery areas and avoiding overlapping routes.
                          </p>
                        </div>

                        {/* Box 2: First-Time Delivery Success Risk */}
                        <div className="p-4 bg-white rounded-xl border border-rose-200/50 shadow-xs space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                              <h5 className="text-[11.5px] font-black uppercase text-rose-800 tracking-wide">
                                First-Time Delivery Success Risk (FTDS)
                              </h5>
                            </div>
                            <span className="text-[9px] font-mono font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded uppercase">
                              Recipient Absence
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                            <strong>Cause:</strong> The customer is not home during office hours, or high waiting times at commercial unloading bays.
                          </p>
                          <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                            <strong>Impact:</strong> The package must return to the warehouse, requiring a retry tomorrow. Solved by shifting delivery times to evening slots or diverting items to pickup lockers.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!showGlossary && (
                <div className="flex justify-start mb-4 animate-in fade-in">
                  <button
                    onClick={() => setShowGlossary(true)}
                    className="py-1.5 px-3 bg-white/80 backdrop-blur-xs hover:bg-slate-50 border border-slate-250 text-slate-600 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-blue-500" /> Show
                    Risk Diagnostic Classifier Guide
                  </button>
                </div>
              )}

              <div
                className={cn(
                  "grid grid-cols-1 gap-6",
                  pitchStage === "poc" ? "lg:grid-cols-1" : "lg:grid-cols-4",
                )}
              >
                <div
                  className={cn(
                    "space-y-6",
                    pitchStage === "poc" ? "lg:col-span-1" : "lg:col-span-3",
                  )}
                >
                  <div className="panel overflow-hidden">
                    <div className="panel-header flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        {selectedZone && (
                          <button
                            onClick={() => {
                              if (selectedTruck) setSelectedTruck(null);
                              else setSelectedZone(null);
                            }}
                            className="p-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4 text-slate-600" />
                          </button>
                        )}
                        <h3 className="text-[16px] font-black text-slate-900 tracking-tight lowercase first-letter:uppercase">
                          {!selectedZone
                            ? "Operational Districts"
                            : !selectedTruck
                              ? `Live Trucks in ${selectedZone}`
                              : `Execution Record: ${selectedTruck}`}
                        </h3>
                      </div>

                      {!selectedZone && (
                        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 select-none">
                          <button
                            onClick={() => setFilterRiskCategory("all")}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all",
                              filterRiskCategory === "all"
                                ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                                : "text-slate-500 hover:text-slate-800 border border-transparent",
                            )}
                          >
                            All Regions
                          </button>
                          <button
                            onClick={() => setFilterRiskCategory("transit")}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all flex items-center gap-1 border",
                              filterRiskCategory === "transit"
                                ? "bg-amber-600/10 text-amber-800 border-amber-250/50 animate-in"
                                : "text-slate-600 hover:text-slate-850 border-transparent",
                            )}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Transit Risks (
                            {
                              routes.filter(
                                (r) =>
                                  getSectorIssue(r.routeId).type === "transit",
                              ).length
                            }
                            )
                          </button>
                          <button
                            onClick={() => setFilterRiskCategory("ftds")}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all flex items-center gap-1 border",
                              filterRiskCategory === "ftds"
                                ? "bg-rose-50 text-rose-800 border-rose-250/50 animate-in"
                                : "text-slate-600 hover:text-slate-850 border-transparent",
                            )}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            FTDS Success Risks (
                            {
                              routes.filter(
                                (r) =>
                                  getSectorIssue(r.routeId).type === "ftds",
                              ).length
                            }
                            )
                          </button>
                        </div>
                      )}

                      {selectedZone && !selectedTruck && (
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="relative hidden xs:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Truck ID..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold focus:outline-none focus:border-blue-300 w-24 md:w-32"
                            />
                          </div>
                          <select
                            value={filterType}
                            onChange={(e: any) => setFilterType(e.target.value)}
                            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-tight w-24 md:w-auto"
                          >
                            <option value="all">Any</option>
                            <option value="delivery">Delivery</option>
                            <option value="pickup">Pickup</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="min-h-[550px] bg-white flex flex-col">
                      {false ? (
                        selectedTruck ? (
                          <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden p-8">
                            <div
                              className="absolute inset-0 opacity-10 pointer-events-none"
                              style={{
                                backgroundImage:
                                  "radial-gradient(#2563EB 0.5px, transparent 0.5px)",
                                backgroundSize: "16px 16px",
                              }}
                            />
                            <div className="z-10 bg-white/80 backdrop-blur-md p-10 rounded-[48px] border border-white shadow-2xl flex flex-col items-center gap-8 max-w-lg text-center relative">
                              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-blue-600 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-blue-500/40">
                                <Truck className="w-12 h-12" />
                              </div>
                              <div className="pt-8">
                                <h4 className="text-[20px] font-black text-slate-900 tracking-tighter uppercase mb-2">
                                  Spatial Route Vector: {selectedTruck}
                                </h4>
                                <p className="text-[12px] text-slate-500 italic font-medium leading-relaxed">
                                  The individual unit map view is rendering live
                                  telemetry. In this simulation, the truck is
                                  currently traversing the{" "}
                                  <strong>{selectedZone}</strong> node cluster.
                                </p>
                              </div>

                              <div className="flex flex-col gap-3 w-full">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                                      <Check className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                      <div className="text-[11px] font-black uppercase text-slate-400">
                                        Completed
                                      </div>
                                      <div className="text-[14px] font-black text-slate-800">
                                        42 Nodes
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 italic font-black">
                                      78
                                    </div>
                                    <div className="text-left">
                                      <div className="text-[11px] font-black uppercase text-slate-400">
                                        Potential
                                      </div>
                                      <div className="text-[14px] font-black text-slate-800">
                                        Queue Remaining
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="w-full flex items-center gap-3 pt-4">
                                <button
                                  onClick={() => setViewMode("list")}
                                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest"
                                >
                                  Return to Ledger
                                </button>
                                <button className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
                                  Expand Spatial
                                </button>
                              </div>
                            </div>

                            {/* Decorative Route Line */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                              <svg
                                width="800"
                                height="400"
                                viewBox="0 0 800 400"
                                className="w-full h-full max-w-4xl px-20"
                              >
                                <motion.path
                                  d="M 50 200 Q 200 50 400 200 T 750 200"
                                  fill="none"
                                  stroke="#2563EB"
                                  strokeWidth="4"
                                  strokeDasharray="12 12"
                                  initial={{ strokeDashoffset: 100 }}
                                  animate={{ strokeDashoffset: 0 }}
                                  transition={{
                                    repeat: Infinity,
                                    duration: 10,
                                    ease: "linear",
                                  }}
                                />
                                <circle cx="50" cy="200" r="8" fill="#10B981" />
                                <circle
                                  cx="200"
                                  cy="115"
                                  r="8"
                                  fill="#10B981"
                                />
                                <circle
                                  cx="400"
                                  cy="200"
                                  r="8"
                                  fill="#2563EB"
                                  className="animate-pulse"
                                />
                                <circle
                                  cx="600"
                                  cy="285"
                                  r="8"
                                  fill="#F59E0B"
                                />
                                <circle
                                  cx="750"
                                  cy="200"
                                  r="8"
                                  fill="#94A3B8"
                                />
                              </svg>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 bg-[#090D16] p-6 md:p-10 flex flex-col items-center justify-center relative overflow-hidden min-h-[500px]">
                            {/* Ambient background glow inside the spatial map window */}
                            <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
                            <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

                            <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-left shrink-0 z-30">
                              <div>
                                <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5 italic">
                                  Interactive Spatial Grid (Madrid Operations)
                                </h4>
                                <p className="text-[10px] text-zinc-500 leading-none">
                                  Hover sectors to view telemetry. Click nodes
                                  to focus specific zone queues.
                                </p>
                              </div>
                              <div className="flex gap-4 text-[9px] font-black uppercase tracking-wider bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  <span className="text-emerald-400">
                                    Stable Node (&gt;85%)
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  <span className="text-amber-400">
                                    Action Suggested (&lt;85%)
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Madrid SVG Corridor Map */}
                            <div className="w-full h-[380px] flex items-center justify-center relative z-10 pt-8 mt-4">
                              <svg
                                viewBox="100 0 600 500"
                                className="w-[85%] h-full max-h-[380px]"
                              >
                                {/* Draw sector connection grid */}
                                <g
                                  stroke="#1E293B"
                                  strokeWidth="1"
                                  strokeDasharray="3 3"
                                >
                                  <line x1="400" y1="100" x2="480" y2="140" />
                                  <line x1="400" y1="100" x2="340" y2="250" />
                                  <line x1="400" y1="100" x2="260" y2="180" />
                                  <line x1="480" y1="140" x2="500" y2="240" />
                                  <line x1="400" y1="220" x2="480" y2="140" />
                                  <line x1="400" y1="220" x2="340" y2="250" />
                                  <line x1="400" y1="220" x2="500" y2="240" />
                                  <line x1="340" y1="250" x2="380" y2="360" />
                                  <line x1="500" y1="240" x2="380" y2="360" />
                                </g>

                                {/* Render Active Route Zones */}
                                {routes.map((route) => {
                                  const metadata = ZONE_COORDS[route.routeId];
                                  if (!metadata) return null;
                                  const isGreen = route.reliability >= 90;
                                  const isYellow =
                                    route.reliability >= 75 &&
                                    route.reliability < 90;
                                  const zoneColor = isGreen
                                    ? "#10B981"
                                    : isYellow
                                      ? "#F59E0B"
                                      : "#EF4444";
                                  const isBlinking = route.reliability < 90;
                                  const isSelected =
                                    selectedZone === route.routeId;

                                  return (
                                    <g
                                      key={route.routeId}
                                      className="cursor-pointer group"
                                      onClick={() =>
                                        setSelectedZone(route.routeId)
                                      }
                                    >
                                      {/* Zone pulse ring on hover */}
                                      <circle
                                        cx={metadata.x}
                                        cy={metadata.y}
                                        r="32"
                                        fill="none"
                                        stroke={zoneColor}
                                        strokeWidth="1"
                                        className="opacity-0 group-hover:opacity-40 transition-all duration-300 animate-ping"
                                      />
                                      {/* Outer circular node box */}
                                      <circle
                                        cx={metadata.x}
                                        cy={metadata.y}
                                        r="22"
                                        fill="#0F172A"
                                        stroke={zoneColor}
                                        strokeWidth={isSelected ? "3" : "1.5"}
                                        className="transition-all duration-300 group-hover:fill-slate-800 shadow-xl"
                                      />
                                      {/* Dynamic Blinking status led */}
                                      <circle
                                        cx={metadata.x - 10}
                                        cy={metadata.y - 10}
                                        r="3.5"
                                        fill={zoneColor}
                                        className={
                                          isBlinking ? "animate-pulse" : ""
                                        }
                                      />
                                      {/* Sector initials code */}
                                      <text
                                        x={metadata.x}
                                        y={metadata.y + 4}
                                        textAnchor="middle"
                                        fill="#fff"
                                        fontSize="9"
                                        fontWeight="900"
                                        className="font-mono"
                                      >
                                        {route.routeId.split("-").pop()}
                                      </text>
                                      {/* Sector tooltip indicator card */}
                                      <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                        <rect
                                          x={metadata.x - 70}
                                          y={metadata.y - 65}
                                          width="140"
                                          height="42"
                                          rx="8"
                                          fill="#0F172A"
                                          stroke="#334155"
                                          strokeWidth="1"
                                        />
                                        <text
                                          x={metadata.x}
                                          y={metadata.y - 50}
                                          textAnchor="middle"
                                          fill="#94A3B8"
                                          fontSize="8"
                                          fontWeight="bold"
                                          className="uppercase tracking-widest"
                                        >
                                          {metadata.label}
                                        </text>
                                        <text
                                          x={metadata.x}
                                          y={metadata.y - 38}
                                          textAnchor="middle"
                                          fill={zoneColor}
                                          fontSize="9"
                                          fontWeight="bold"
                                        >
                                          {route.reliability}% Reliability (
                                          {route.totalStops} Stops)
                                        </text>
                                      </g>
                                    </g>
                                  );
                                })}

                                {/* Glowing Truck Locator Pin traversing corridors */}
                                <g>
                                  <motion.rect
                                    width="16"
                                    height="10"
                                    rx="2"
                                    fill="#2563EB"
                                    animate={{
                                      x: [
                                        400 - 8,
                                        480 - 8,
                                        500 - 8,
                                        380 - 8,
                                        400 - 8,
                                      ],
                                      y: [
                                        100 - 5,
                                        140 - 5,
                                        240 - 5,
                                        360 - 5,
                                        100 - 5,
                                      ],
                                    }}
                                    transition={{
                                      repeat: Infinity,
                                      duration: 25,
                                      ease: "linear",
                                    }}
                                    className="shadow-[0_0_12px_#3B82F6]"
                                  />
                                  <motion.circle
                                    r="2"
                                    fill="#fff"
                                    animate={{
                                      cx: [400, 480, 500, 380, 400],
                                      cy: [100, 140, 240, 360, 100],
                                    }}
                                    transition={{
                                      repeat: Infinity,
                                      duration: 25,
                                      ease: "linear",
                                    }}
                                  />
                                </g>
                              </svg>

                              {/* Floating Zone Fleet Selector on Map */}
                              {selectedZone && (
                                <div className="absolute top-24 left-6 bg-slate-950/95 backdrop-blur-md p-5 rounded-[24px] border border-slate-800 text-left w-64 z-30 animate-in slide-in-from-left duration-300 shadow-2xl">
                                  <div className="flex justify-between items-center mb-3">
                                    <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">
                                      Zone Fleet:{" "}
                                      {selectedZone.split("-").pop()}
                                    </div>
                                    <button
                                      onClick={() => setSelectedZone(null)}
                                      className="text-zinc-500 hover:text-white transition-colors"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                    {filteredTrucks(selectedZone).map((t) => {
                                      const badgeClass =
                                        t.reliability >= 90
                                          ? "text-emerald-400 bg-emerald-950/80 border-emerald-900"
                                          : t.reliability >= 75
                                            ? "text-amber-400 bg-amber-950/80 border-amber-900"
                                            : "text-rose-400 bg-rose-950/80 border-rose-900";

                                      return (
                                        <button
                                          key={t.id}
                                          onClick={() => setSelectedTruck(t.id)}
                                          className="w-full p-2.5 bg-slate-900/50 hover:bg-blue-600 rounded-xl border border-white/5 text-left transition-all flex items-center justify-between text-white group"
                                        >
                                          <span className="text-[11px] font-black tracking-tight uppercase">
                                            {t.id}
                                          </span>
                                          <span
                                            className={cn(
                                              "text-[9px] font-mono font-black px-2 py-0.5 rounded border group-hover:bg-blue-500 group-hover:text-white group-hover:border-transparent transition-all",
                                              badgeClass,
                                            )}
                                          >
                                            {t.reliability}%
                                          </span>
                                        </button>
                                      );
                                    })}
                                    {filteredTrucks(selectedZone).length ===
                                      0 && (
                                      <p className="text-[9px] text-zinc-500 italic mt-2">
                                        No matching trucks
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between z-30 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                              <p className="text-[10px] text-zinc-400 font-bold italic tracking-wide">
                                Active spatial routing nodes computed:{" "}
                                <strong className="text-white">
                                  {routes.length} zones
                                </strong>{" "}
                                mapped correctly.
                              </p>
                              <button
                                onClick={() => setViewMode("list")}
                                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg text-[9px] font-black uppercase tracking-wider"
                              >
                                Switch to List Ledger
                              </button>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="flex-1 overflow-y-auto">
                          {selectedTruck ? (
                            <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                              <div className="p-5 md:p-6 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-5">
                                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-[20px] shadow-xl shadow-blue-200">
                                    {selectedTruck.split("-").pop()?.slice(-2)}
                                  </div>
                                  <div>
                                    <div className="text-[18px] font-black text-slate-900 tracking-tighter uppercase mb-1">
                                      {selectedTruck}
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                      <span className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />{" "}
                                        Live Sync Active
                                      </span>
                                      <span className="text-slate-300">|</span>
                                      <span className="text-slate-400 italic capitalize">
                                        {selectedZone}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-6 md:gap-8 text-right border-t sm:border-t-0 sm:border-l border-slate-200/60 sm:border-slate-100 pt-3 sm:pt-0 sm:pl-8">
                                  <div>
                                    <div className="text-[16px] font-black text-slate-900">
                                      {activeTruckStops} Stops
                                    </div>
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">
                                      Total Stop Load
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-[16px] font-black text-emerald-600 flex items-center gap-1 justify-end">
                                      {activeTruckReliability}%{" "}
                                      <CheckCircle className="w-4 h-4" />
                                    </div>
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1 text-right">
                                      Optimization Accuracy
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="p-8 space-y-10">
                                <div className="space-y-4">
                                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 italic">
                                    Execution Record (Completed)
                                  </h5>
                                  {getUniqueCompletedStops(
                                    selectedTruck,
                                    selectedZone,
                                  ).map((stop) => (
                                    <div
                                      key={stop.id}
                                      className="flex items-center gap-5 p-4 bg-slate-50 border border-slate-100 rounded-[24px] opacity-70"
                                    >
                                      <div
                                        className={cn(
                                          "w-10 h-10 rounded-xl flex items-center justify-center border text-[11px] font-black",
                                          stop.status === "success"
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                            : "bg-rose-50 text-rose-600 border-rose-100",
                                        )}
                                      >
                                        {stop.status === "success" ? (
                                          <Check className="w-5 h-5" />
                                        ) : (
                                          <X className="w-5 h-5" />
                                        )}
                                      </div>
                                      <div className="flex-1 truncate">
                                        <div className="text-[14px] font-black text-slate-600 truncate uppercase italic">
                                          {stop.address}
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                          {stop.status} @ {stop.time}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="space-y-4">
                                  <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-2 italic">
                                    Live Traversal Queue (Pending)
                                  </h5>
                                  {MOCK_DELIVERIES.filter((d) => {
                                    const matchesRoute =
                                      d.assignedRoute === selectedZone ||
                                      !selectedZone;
                                    if (!matchesRoute) return false;

                                    if (selectedTruck && selectedZone) {
                                      // Derive truck role from ID index (even = pickup, odd = delivery)
                                      const truckIdx = parseInt(
                                        selectedTruck.split("-L").pop() || "0",
                                      );
                                      const isPickupTruck = truckIdx % 2 === 0;
                                      return (
                                        d.stopType ===
                                        (isPickupTruck ? "pickup" : "delivery")
                                      );
                                    }
                                    return true;
                                  }).map((d, i) => (
                                    <motion.div
                                      key={d.id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: i * 0.05 }}
                                      className="p-4 md:p-6 bg-white border border-slate-100 rounded-[24px] md:rounded-[32px] shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-4 md:gap-6 hover:border-blue-300 transition-all group"
                                    >
                                      <div
                                        className={cn(
                                          "w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm group-hover:scale-110 transition-all",
                                          d.stopType === "pickup"
                                            ? "bg-amber-50 text-amber-600 border-amber-100"
                                            : "bg-blue-50 text-blue-600 border-blue-100",
                                        )}
                                      >
                                        {d.stopType === "pickup" ? (
                                          <ArrowDownLeft className="w-6 h-6" />
                                        ) : (
                                          <ArrowUpRight className="w-6 h-6" />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-[16px] font-black text-slate-900 group-hover:text-blue-600 uppercase tracking-tighter transition-colors mb-1 whitespace-normal break-words pr-4 text-left">
                                          {d.address}
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] font-black text-slate-400">
                                          <span className="uppercase tracking-widest">
                                            {d.suggestedSlot}
                                          </span>
                                          <span className="text-slate-300">
                                            |
                                          </span>
                                          <span className="flex items-center gap-1.5">
                                            <HelpCircle className="w-3.5 h-3.5" />{" "}
                                            Based on{" "}
                                            <strong>
                                              {d.historyCount} orders
                                            </strong>
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-8 text-right">
                                        <div className="flex flex-col items-end">
                                          <div className="text-[20px] font-black leading-none text-slate-900">
                                            {Math.round(
                                              d.predictedProbability * 100,
                                            )}
                                            %
                                          </div>
                                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 text-right italic">
                                            Reliability
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : !selectedZone ? (
                            <div className="p-8 space-y-4">
                              {routes
                                .filter((r) => {
                                  if (filterRiskCategory === "all") return true;
                                  const info = getSectorIssue(r.routeId);
                                  return info.type === filterRiskCategory;
                                })
                                .map((route) => {
                                  const sectorInfo = getSectorIssue(
                                    route.routeId,
                                  );
                                  const isOptimized =
                                    optimizedRoutes[route.routeId] ||
                                    systemOptimized;

                                  return (
                                    <div
                                      key={route.routeId}
                                      onClick={() =>
                                        setSelectedZone(route.routeId)
                                      }
                                      className="flex flex-col p-5 md:p-6 bg-white hover:bg-slate-50 border border-slate-100 hover:border-blue-200 cursor-pointer rounded-[24px] transition-all group shadow-sm text-left gap-3.5 duration-300 hover:shadow-md animate-in fade-in"
                                    >
                                      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 w-full">
                                        <div className="flex items-center justify-between md:w-32 md:shrink-0 w-full">
                                          <div>
                                            <div className="text-[14px] font-black text-slate-950 group-hover:text-blue-600 transition-colors uppercase tracking-tight font-sans">
                                              {sectorInfo.label}
                                            </div>
                                            <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                                              {sectorInfo.office}
                                            </div>
                                            <div className="text-[9px] font-extrabold text-slate-400 font-mono tracking-widest mt-1.5 uppercase">
                                              {MADRID_REAL_CODES[route.routeId] || route.routeId}
                                            </div>
                                          </div>
                                          {/* Mobile action indicator and optimizer trigger */}
                                          <div className="md:hidden flex items-center gap-2">
                                            {optimizedRoutes[route.routeId] ? (
                                              <div className="flex items-center gap-1.5">
                                                <div
                                                  className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 shadow-sm flex items-center justify-center animate-in scale-in duration-300"
                                                  title="AI stop sequence optimized"
                                                >
                                                  <Check className="w-3 h-3" />
                                                </div>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleReverseRoute(
                                                      e,
                                                      route.routeId,
                                                    );
                                                  }}
                                                  className="p-1.5 bg-rose-50 hover:bg-rose-600 border border-rose-100 text-rose-500 hover:text-white rounded-lg transition-all"
                                                  title="Undo Optimization"
                                                >
                                                  <RotateCcw className="w-3 h-3" />
                                                </button>
                                              </div>
                                            ) : (
                                              route.reliability < 99 && (
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOptimizeRoute(
                                                      e,
                                                      route.routeId,
                                                    );
                                                  }}
                                                  disabled={
                                                    syncingRouteId ===
                                                    route.routeId
                                                  }
                                                  className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all"
                                                >
                                                  <Zap
                                                    className={cn(
                                                      "w-3 h-3",
                                                      syncingRouteId ===
                                                        route.routeId &&
                                                        "animate-spin",
                                                    )}
                                                  />
                                                </button>
                                              )
                                            )}
                                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-all" />
                                          </div>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                          <div className="flex justify-between items-center px-1">
                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
                                              Prediction Reliability
                                            </div>
                                            <div
                                              className={cn(
                                                "text-[10px] font-black italic",
                                                route.reliability >= 90
                                                  ? "text-emerald-600"
                                                  : route.reliability >= 75
                                                    ? "text-amber-600"
                                                    : "text-rose-600",
                                              )}
                                            >
                                              {route.reliability}%
                                            </div>
                                          </div>
                                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative shadow-inner group/bar cursor-help">
                                            <div
                                              className={cn(
                                                "h-full transition-all duration-1000",
                                                route.reliability >= 90
                                                  ? "bg-emerald-500"
                                                  : route.reliability >= 75
                                                    ? "bg-amber-500"
                                                    : "bg-rose-500",
                                              )}
                                              style={{
                                                width: `${route.reliability}%`,
                                              }}
                                            />
                                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                                          </div>
                                        </div>
                                        <div className="hidden md:flex w-24 items-center justify-center pr-2">
                                          {optimizedRoutes[route.routeId] ? (
                                            <div className="flex items-center gap-1.5">
                                              <div
                                                className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 shadow-sm flex items-center justify-center"
                                                title="AI Stop-Order Optimized"
                                              >
                                                <Check className="w-3.5 h-3.5" />
                                              </div>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleReverseRoute(
                                                    e,
                                                    route.routeId,
                                                  );
                                                }}
                                                className="p-2 bg-rose-50 hover:bg-rose-600 border border-rose-100 text-rose-500 hover:text-white rounded-lg transition-all shadow-sm flex items-center justify-center animate-in scale-in duration-300"
                                                title="Reverse Optimization & Return to Baseline"
                                              >
                                                <RotateCcw className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          ) : (
                                            route.reliability < 99 && (
                                              <button
                                                onClick={(e) =>
                                                  handleOptimizeRoute(
                                                    e,
                                                    route.routeId,
                                                  )
                                                }
                                                disabled={
                                                  syncingRouteId ===
                                                  route.routeId
                                                }
                                                className="p-2 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 rounded-lg transition-all shadow-sm group/btn disabled:opacity-50 border border-blue-100"
                                                title="Reschedule route via customer presence"
                                              >
                                                <Zap
                                                  className={cn(
                                                    "w-3.5 h-3.5 group-hover/btn:animate-pulse",
                                                    syncingRouteId ===
                                                      route.routeId &&
                                                      "animate-spin",
                                                  )}
                                                />
                                              </button>
                                            )
                                          )}
                                        </div>
                                        <div className="flex items-center justify-between md:justify-end gap-6 md:gap-5 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4 w-full md:w-56">
                                          <div className="text-center">
                                            <div className="text-[13px] font-black text-slate-700">
                                              {route.totalStops}
                                            </div>
                                            <div className="text-[8px] font-black text-slate-400 uppercase leading-none">
                                              Stops
                                            </div>
                                          </div>
                                          <div className="text-center flex flex-col items-center">
                                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 p-0.5 rounded-[10px] shadow-sm select-none">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleAdjustTrucks(route.routeId, -1);
                                                }}
                                                className="w-5 h-5 flex items-center justify-center bg-white hover:bg-slate-100 text-slate-600 rounded-md active:scale-95 border border-slate-200 cursor-pointer text-[10px] font-black leading-none transition-all"
                                                title="De-allocate 1 truck"
                                              >
                                                -
                                              </button>
                                              <span className="text-[12px] font-black text-indigo-600 px-1 min-w-[14px]">
                                                {filteredTrucks(route.routeId).length}
                                              </span>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleAdjustTrucks(route.routeId, 1);
                                                }}
                                                className="w-5 h-5 flex items-center justify-center bg-white hover:bg-slate-100 text-slate-600 rounded-md active:scale-95 border border-slate-200 cursor-pointer text-[10px] font-black leading-none transition-all"
                                                title="Allocate 1 truck"
                                              >
                                                +
                                              </button>
                                            </div>
                                            <div className="text-[8px] font-black text-slate-400 uppercase leading-none font-sans mt-1">
                                              Active Trucks
                                            </div>
                                          </div>
                                          <div className="text-center">
                                            <div className="text-[13px] font-black text-blue-600">
                                              {route.aiInterventions}
                                            </div>
                                            <div className="text-[8px] font-black text-slate-400 uppercase leading-none font-sans">
                                              Suggestions
                                            </div>
                                          </div>
                                        </div>
                                        <ArrowRight className="hidden md:block w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-all translate-x-0 group-hover:translate-x-1" />
                                      </div>

                                      {/* Subtle Divider & Contextual Diagnostic Comment */}
                                      {(isOptimized ||
                                        route.reliability < 90) && (
                                        <div className="border-t border-slate-100 pt-3 flex flex-col gap-2 transition-all duration-300 w-full animate-in fade-in">
                                          {isOptimized ? (
                                            <div className="bg-emerald-50 text-emerald-800 border border-emerald-100/60 p-2.5 rounded-xl w-full flex items-center gap-2.5 shadow-sm animate-in fade-in slide-in-from-top-1">
                                              <span className="text-[9px] font-mono font-black tracking-wider uppercase bg-emerald-100/80 text-emerald-700 px-2 py-0.5 rounded leading-none shrink-0 border border-emerald-200">
                                                ✓ resolved
                                              </span>
                                              <span className="text-slate-650 font-semibold font-sans text-[11.5px]">
                                                {sectorInfo.solution}
                                              </span>
                                            </div>
                                          ) : (
                                            <div className="flex flex-col gap-2 w-full">
                                              <div
                                                className={cn(
                                                  "p-2.5 rounded-xl w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs border animate-in fade-in",
                                                  sectorInfo.type === "ftds"
                                                    ? "bg-rose-50/70 border-rose-100 text-rose-950"
                                                    : "bg-amber-50/75 border-amber-100 text-amber-950",
                                                )}
                                              >
                                                <div className="flex items-center gap-2.5">
                                                  <span
                                                    className={cn(
                                                      "text-[9px] font-mono font-black tracking-wider uppercase px-2 py-0.5 rounded leading-none shrink-0 border",
                                                      sectorInfo.type === "ftds"
                                                        ? "bg-rose-100/80 text-rose-700 border-rose-200"
                                                        : "bg-amber-100/80 text-amber-700 border-amber-200",
                                                    )}
                                                  >
                                                    {sectorInfo.type === "ftds"
                                                      ? "⚠️ ftds success risk"
                                                      : "⚠️ transit bottleneck risk"}
                                                  </span>
                                                  <span className="text-slate-700 font-bold font-sans text-[11.5px]">
                                                    {sectorInfo.issue}
                                                  </span>
                                                </div>

                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setExpandedExplanations(
                                                      (prev) => ({
                                                        ...prev,
                                                        [route.routeId]:
                                                          !prev[route.routeId],
                                                      }),
                                                    );
                                                  }}
                                                  className={cn(
                                                    "text-[10px] font-black uppercase self-end sm:self-auto cursor-pointer border rounded-lg px-2 py-1 transition-all bg-white shadow-xs",
                                                    sectorInfo.type === "ftds"
                                                      ? "text-rose-700 hover:bg-rose-50 border-rose-200"
                                                      : "text-amber-800 hover:bg-amber-50 border-amber-200",
                                                  )}
                                                >
                                                  {expandedExplanations[
                                                    route.routeId
                                                  ]
                                                    ? "Close Details"
                                                    : "Understand Risk ❯"}
                                                </button>
                                              </div>

                                              {expandedExplanations[
                                                route.routeId
                                              ] && (
                                                <motion.div
                                                  initial={{
                                                    opacity: 0,
                                                    height: 0,
                                                  }}
                                                  animate={{
                                                    opacity: 1,
                                                    height: "auto",
                                                  }}
                                                  className="bg-slate-50 border border-slate-200/50 p-3.5 rounded-xl text-[11px] text-slate-650 leading-relaxed font-sans shadow-inner text-left"
                                                >
                                                  <div className="flex items-center gap-2 mb-2">
                                                    <span
                                                      className={cn(
                                                        "w-2 h-2 rounded-full",
                                                        sectorInfo.type ===
                                                          "ftds"
                                                          ? "bg-rose-500"
                                                          : "bg-amber-500",
                                                      )}
                                                    />
                                                    <h5 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                                                      Interactive Diagnostic
                                                      Evaluation
                                                    </h5>
                                                  </div>
                                                  <p className="mb-2.5">
                                                    {sectorInfo.explanation}{" "}
                                                    This causes reliability
                                                    drops at target locations
                                                    due to scheduling
                                                    constraints.
                                                  </p>
                                                  <div className="bg-white border border-slate-100 p-2.5 rounded-lg">
                                                    <span className="text-[8.5px] font-mono font-black uppercase text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded leading-none shrink-0 border border-indigo-100 mr-2">
                                                      Action Dispatch Solution
                                                    </span>
                                                    <span className="text-slate-600 font-medium text-[11.5px] block mb-2.5">
                                                      {sectorInfo.solution}
                                                    </span>
                                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                                      <span className="text-[9px] font-bold text-slate-400 uppercase italic">Capacity Correction</span>
                                                      <button
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          handleAdjustTrucks(route.routeId, 1);
                                                        }}
                                                        className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-705 text-white text-[9.5px] font-black uppercase rounded-lg shadow-sm border-0 cursor-pointer active:scale-95"
                                                      >
                                                        Deploy +1 Active Van
                                                      </button>
                                                    </div>
                                                  </div>
                                                </motion.div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          ) : (
                            <div className="p-8 space-y-6">
                              <div className="flex items-center justify-between px-2 text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] italic">
                                Live In-Flight Fleet ({selectedZone})
                                <div className="flex items-center gap-4 text-slate-400">
                                  <span className="flex items-center gap-1.5">
                                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />{" "}
                                    Outbound
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <ArrowDownLeft className="w-3.5 h-3.5 text-amber-500" />{" "}
                                    Inbound
                                  </span>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 gap-4">
                                {filteredTrucks(selectedZone).map((t) => (
                                  <div
                                    key={t.id}
                                    onClick={() => setSelectedTruck(t.id)}
                                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 p-5 bg-white border border-slate-200 rounded-[24px] cursor-pointer hover:border-blue-400 hover:shadow-lg transition-all group text-left"
                                  >
                                    <div
                                      className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center border transition-colors",
                                        t.isPickup
                                          ? "bg-amber-50 text-amber-500 border-amber-100"
                                          : "bg-blue-50 text-blue-600 border-blue-100",
                                      )}
                                    >
                                      {t.isPickup ? (
                                        <ArrowDownLeft className="w-6 h-6" />
                                      ) : (
                                        <ArrowUpRight className="w-6 h-6" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-1">
                                        <div className="text-[16px] font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase italic tracking-tighter">
                                          {t.id}
                                        </div>
                                        <span
                                          className={cn(
                                            "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border",
                                            t.status === "live"
                                              ? "bg-blue-50 text-blue-600 border-blue-100 animate-pulse"
                                              : "bg-slate-50 text-slate-400 border-slate-200",
                                          )}
                                        >
                                          {t.status}
                                        </span>
                                      </div>
                                      <div className="text-[11px] font-bold text-slate-400 uppercase italic">
                                        Operational Sync: Active • {t.stops}{" "}
                                        Assigned Stops
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-6 sm:w-44 text-right">
                                      <div>
                                        <div
                                          className={cn(
                                            "text-[16px] font-black leading-none",
                                            t.reliability >= 90
                                              ? "text-emerald-600"
                                              : t.reliability >= 75
                                                ? "text-amber-600"
                                                : "text-rose-600",
                                          )}
                                        >
                                          {t.reliability}%
                                        </div>
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 text-right italic">
                                          Reliability
                                        </div>
                                      </div>
                                      {optimizedTrucks[t.id] ? (
                                        <div className="flex items-center gap-1.5 animate-in scale-in duration-300">
                                          <div
                                            className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg shadow-sm flex items-center justify-center animate-in scale-in duration-350"
                                            title="Courier Time-Windows Optimized"
                                          >
                                            <Check className="w-3.5 h-3.5" />
                                          </div>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleReverseTruck(e, t.id);
                                            }}
                                            className="p-2 bg-rose-50 hover:bg-rose-600 border border-rose-100 text-rose-500 hover:text-white rounded-lg transition-all shadow-sm"
                                            title="Undo Courier Optimization"
                                          >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      ) : (
                                        routes.find(
                                          (r) => r.routeId === selectedZone,
                                        )?.reliability !== 99 &&
                                        t.reliability < 99 && (
                                          <button
                                            onClick={(e) =>
                                              handleOptimizeTruck(e, t.id)
                                            }
                                            disabled={syncingTruckId === t.id}
                                            className="p-2 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors group/btn disabled:opacity-50"
                                            title="Sync Optimizer Logic"
                                          >
                                            <Zap
                                              className={cn(
                                                "w-3.5 h-3.5 group-hover:animate-pulse",
                                                syncingTruckId === t.id &&
                                                  "animate-spin",
                                              )}
                                            />
                                          </button>
                                        )
                                      )}
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-all" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {pitchStage !== "poc" && (
                  <div className="space-y-6">
                    <div className="panel bg-[#FDFEFF] border-emerald-100 overflow-hidden">
                      <div className="panel-header border-b border-emerald-50 flex items-center justify-between">
                        <h3 className="text-[13px] font-black text-emerald-800 uppercase tracking-widest italic">
                          Node Savings Yield
                        </h3>
                        <RotateCw className="w-3.5 h-3.5 text-emerald-400 animate-[spin_3s_linear_infinite]" />
                      </div>
                      <div className="p-8 flex flex-col">
                        <div className="h-52 w-full mb-8">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={dynamicTrendData}
                              margin={{
                                top: 20,
                                right: 0,
                                left: 0,
                                bottom: 20,
                              }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#E2E8F0"
                                opacity={0.5}
                              />
                              <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                  fontSize: 9,
                                  fontWeight: 900,
                                  fill: "#64748B",
                                }}
                                dy={10}
                              />
                              <Tooltip
                                cursor={{ fill: "transparent" }}
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    return (
                                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-200">
                                        <div className="text-[10px] font-black uppercase text-slate-400 mb-1">
                                          {payload[0].payload.name} 2026
                                        </div>
                                        <div className="text-[16px] font-black text-emerald-400 italic">
                                          €{payload[0].value?.toLocaleString()}
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Bar
                                dataKey="recovered"
                                radius={[6, 6, 0, 0]}
                                barSize={44}
                              >
                                <LabelList
                                  dataKey="recovered"
                                  position="top"
                                  content={(props: any) => {
                                    const { x, y, width, value } = props;
                                    return (
                                      <text
                                        x={x + width / 2}
                                        y={y - 12}
                                        fill="#0F172A"
                                        textAnchor="middle"
                                        fontSize={10}
                                        fontWeight={900}
                                        className="font-mono tracking-tighter"
                                      >
                                        €{Math.round(value / 1000)}k
                                      </text>
                                    );
                                  }}
                                />
                                {dynamicTrendData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      index === dynamicTrendData.length - 1
                                        ? "#10B981"
                                        : "#D1FAE5"
                                    }
                                    className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="text-center space-y-3">
                          <div className="text-[32px] font-black text-emerald-600 leading-none tracking-tighter">
                            €{cumulativeYieldSum.toLocaleString()}
                          </div>
                          <div className="inline-block px-4 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                            Cumulative Recaptured Yield
                          </div>
                          <p className="text-[11px] text-slate-500 italic leading-relaxed pt-4 border-t border-slate-100 mt-4">
                            Arrivio node-sync preventing failure at Madrid hubs.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="panel bg-[#0B1222] border border-white/5 p-8 text-white relative overflow-hidden group">
                      <div className="relative z-10 space-y-8">
                        <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
                          <Zap className="w-3.5 h-3.5" /> ROI PERFORMANCE ENGINE
                        </div>

                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-slate-900 rounded-2xl border border-white/10 shadow-inner">
                              <div className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1 italic">
                                Baseline Waste
                              </div>
                              <div className="text-[18px] font-black text-rose-50 italic tracking-tighter">
                                €74.2k{" "}
                                <span className="text-[8px] text-slate-500 block leading-none mt-1 uppercase font-bold">
                                  Initial Process Loss
                                </span>
                              </div>
                            </div>
                            <div className="p-4 bg-slate-900 rounded-2xl border border-white/10 shadow-inner">
                              <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1 italic">
                                Arrivio Impact
                              </div>
                              <div className="text-[18px] font-black text-emerald-50 italic tracking-tighter">
                                €13.1k{" "}
                                <span className="text-[8px] text-slate-500 block leading-none mt-1 uppercase font-bold">
                                  Remaining Friction
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="p-6 bg-blue-600 rounded-3xl shadow-[0_20px_50px_rgba(37,99,235,0.3)]">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-black text-blue-100 uppercase tracking-widest font-mono italic">
                                Net Recovered Value
                              </span>
                              <TrendingUp className="w-4 h-4 text-blue-200" />
                            </div>
                            <div className="text-[36px] font-black tracking-tight text-white italic leading-none">
                              €61,100{" "}
                              <span className="text-[12px] opacity-60 text-slate-500">
                                / mo
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => setSubTab("history")}
                            className="w-full py-4 bg-slate-800 hover:bg-slate-700 hover:text-white border border-white/5 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all text-slate-400 shadow-xl"
                          >
                            View Historical Sync
                          </button>
                        </div>
                      </div>
                      <Target className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 pointer-events-none rotate-12" />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {subTab === "congestion" && (
            <CongestionView pitchStage={pitchStage} />
          )}
          {subTab === "roi" && (
            <RoiSimulatorView
              deliveries={deliveries}
              routes={routes}
              pitchStage={pitchStage}
            />
          )}
          {subTab === "history" && (
            <HistoricalSyncView
              deliveries={deliveries}
              routes={routes}
              pitchStage={pitchStage}
            />
          )}
        </div>
      </div>

      {/* Dynamic Route Intervention Overlay */}
      <AnimatePresence>
        {optimizerModalTarget && targetProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
            onClick={() =>
              !isExecutingIntervention && setOptimizerModalTarget(null)
            }
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-white rounded-[32px] border border-slate-100 shadow-[0_32px_80px_rgba(15,23,42,0.18)] overflow-hidden w-full max-w-xl flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl">
                    <BrainCircuit className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="text-left animate-in fade-in slide-in-from-left duration-300">
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block leading-none">
                      AI Intervention System
                    </span>
                    <h3 className="text-[15px] font-black text-slate-800 uppercase tracking-tight mt-1">
                      {optimizerModalTarget.truckId
                        ? `Optimize Courier ${optimizerModalTarget.truckId}`
                        : `Optimize Route ${optimizerModalTarget.routeId}`}
                    </h3>
                  </div>
                </div>
                {!isExecutingIntervention && (
                  <button
                    onClick={() => setOptimizerModalTarget(null)}
                    className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-all"
                  >
                    <X className="w-5 h-5 stroke-[3]" />
                  </button>
                )}
              </div>

              {/* Progress Stepper Loading Display */}
              {isExecutingIntervention ? (
                <div className="p-8 flex-1 flex flex-col items-center justify-center min-h-[380px] bg-slate-950 text-slate-100 font-mono text-xs">
                  <div className="relative mb-8">
                    <div className="w-16 h-16 rounded-full border border-blue-500/20 flex items-center justify-center">
                      <RotateCw className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                    <Sparkles className="w-4 h-4 text-emerald-400 absolute -bottom-1 -right-1 animate-pulse" />
                  </div>

                  <div className="w-64 space-y-4 text-left">
                    <div className="border border-slate-800 p-4 rounded-xl space-y-2.5 bg-slate-900/60 max-w-full">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            executionStep >= 1
                              ? "bg-emerald-500 animate-pulse"
                              : "bg-slate-700",
                          )}
                        />
                        <span
                          className={
                            executionStep === 1
                              ? "text-blue-400 font-bold"
                              : executionStep > 1
                                ? "text-slate-400"
                                : "text-slate-500"
                          }
                        >
                          [1/3] Slot analysis...
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            executionStep >= 2
                              ? "bg-emerald-500 animate-pulse"
                              : "bg-slate-700",
                          )}
                        />
                        <span
                          className={
                            executionStep === 2
                              ? "text-blue-400 font-bold"
                              : executionStep > 2
                                ? "text-slate-400"
                                : "text-slate-500"
                          }
                        >
                          [2/3] Sequence swap...
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            executionStep >= 3
                              ? "bg-emerald-500 animate-pulse"
                              : "bg-slate-700",
                          )}
                        />
                        <span
                          className={
                            executionStep === 3
                              ? "text-blue-400 font-bold"
                              : "text-slate-500"
                          }
                        >
                          [3/3] Manifest sync...
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 px-1 animate-pulse text-[11px] text-slate-400 text-center select-none">
                      {executionStep === 1 &&
                        "⚡ Parsing client historic delivery hour windows..."}
                      {executionStep === 2 &&
                        "🗺️ Generating Madrid grid congestion bypass parameters..."}
                      {executionStep === 3 &&
                        "📡 Broadcasting dynamic sequence manifests to vehicle terminal..."}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Diagnostic Issue Block */}
                  <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex gap-3 text-left">
                    <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[11px] font-black text-rose-800 uppercase tracking-widest">
                        Delivery Bottleneck Diagnostic
                      </h4>
                      <p className="text-[12px] text-rose-700 font-bold leading-normal mt-1">
                        {targetProfile.failureRiskDescription}
                      </p>
                      <div className="mt-2.5 flex items-center gap-2">
                        <span className="text-[10px] font-black bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded uppercase">
                          Risk Level: High
                        </span>
                        <span className="text-[10px] font-black bg-white border border-rose-200 text-rose-800 px-2.5 py-0.5 rounded uppercase font-mono">
                          Baseline: {targetProfile.originalReliability}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Strategy Selector Container */}
                  <div className="space-y-3.5 text-left">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Select Strategic Intervention
                    </h4>

                    <div className="grid grid-cols-1 gap-3.5">
                      {targetProfile.strategies.map((strategy) => {
                        const isSelected = selectedStrategyId === strategy.id;

                        return (
                          <button
                            key={strategy.id}
                            onClick={() => setSelectedStrategyId(strategy.id)}
                            className={cn(
                              "flex items-start gap-4 p-4.5 rounded-2xl border transition-all text-left group w-full",
                              isSelected
                                ? "border-blue-500 bg-blue-50/40 shadow-sm"
                                : "border-slate-100 hover:border-slate-300 bg-white",
                            )}
                          >
                            <div
                              className={cn(
                                "p-2 rounded-xl border mt-0.5 transition-colors shrink-0",
                                isSelected
                                  ? "bg-blue-600 border-blue-500 text-white"
                                  : "bg-slate-50 border-slate-100 text-slate-400 group-hover:text-slate-600",
                              )}
                            >
                              {strategy.iconType === "timer" && (
                                <Timer className="w-4 h-4" />
                              )}
                              {strategy.iconType === "split" && (
                                <Layers className="w-4 h-4" />
                              )}
                              {strategy.iconType === "lock" && (
                                <Lock className="w-4 h-4" />
                              )}
                              {strategy.iconType === "truck" && (
                                <Truck className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h5
                                  className={cn(
                                    "text-[13px] font-black tracking-tight truncate",
                                    isSelected
                                      ? "text-blue-700"
                                      : "text-slate-800",
                                  )}
                                >
                                  {strategy.name}
                                </h5>
                                <span
                                  className={cn(
                                    "text-[11px] font-black px-2.5 py-0.5 rounded border leading-none shrink-0 ml-2 font-mono",
                                    isSelected
                                      ? "bg-emerald-600 border-transparent text-white"
                                      : "bg-emerald-50 border-emerald-100 text-emerald-700",
                                  )}
                                >
                                  +
                                  {strategy.impactOnReliability -
                                    targetProfile.originalReliability}
                                  % Rel
                                </span>
                              </div>

                              <p className="text-[12px] text-slate-500 mt-1 leading-relaxed font-medium">
                                {strategy.description}
                              </p>

                              <div className="mt-2.5 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
                                <span className="italic truncate">
                                  {strategy.costImpact}
                                </span>
                                <span
                                  className={cn(
                                    "shrink-0 font-mono",
                                    isSelected
                                      ? "text-blue-600 font-extrabold"
                                      : "text-slate-700",
                                  )}
                                >
                                  Outcome: {strategy.impactOnReliability}%
                                  Success
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons Footer */}
              {!isExecutingIntervention && (
                <div className="px-6 py-4.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                  <button
                    onClick={() => setOptimizerModalTarget(null)}
                    className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-[12px] hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleExecuteIntervention}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-[12px] shadow-lg shadow-blue-500/20 flex items-center gap-2"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>
                      Execute Intervention (
                      {
                        targetProfile.strategies.find(
                          (s) => s.id === selectedStrategyId,
                        )?.impactOnReliability
                      }
                      % target)
                    </span>
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Alert Portal */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={cn(
              "fixed bottom-24 lg:bottom-6 right-6 z-50 p-6 rounded-[28px] border shadow-2xl flex items-start gap-4 max-w-sm backdrop-blur-md bg-slate-900 border-slate-800",
              toast.type === "success"
                ? "bg-emerald-950/90 text-emerald-100 border-emerald-500/30"
                : "bg-slate-900 border-slate-700",
            )}
          >
            <div
              className={cn(
                "p-2 rounded-xl text-white shrink-0 mt-0.5",
                toast.type === "success" ? "bg-emerald-600" : "bg-blue-600",
              )}
            >
              <Check className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-[13px] font-black uppercase tracking-widest text-[#F8FAFC] leading-none mb-1.5">
                {toast.message}
              </h4>
              <p className="text-[11px] text-[#94A3B8] font-bold leading-relaxed">
                {toast.subMessage}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function KPICard({ title, value, trend, up, accent, detail }: any) {
  return (
    <div className="p-4 md:p-6 bg-white border border-slate-100 rounded-[20px] md:rounded-[28px] shadow-sm hover:shadow-md transition-all group min-h-[148px] md:min-h-[160px] flex flex-col justify-between">
      <div>
        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 md:mb-3 group-hover:text-blue-600 transition-colors leading-tight h-[28px] md:h-[32px] overflow-hidden line-clamp-2">
          {title}
        </p>
        <div className="text-[20px] md:text-[26px] font-black text-slate-900 tracking-tighter mb-1 leading-none">
          {value}
        </div>
      </div>
      <div>
        <div
          className={cn(
            "text-[9px] md:text-[11px] font-black uppercase tracking-widest italic flex items-center gap-2",
            accent === "emerald"
              ? "text-emerald-600"
              : up
                ? "text-blue-600"
                : "text-rose-600",
          )}
        >
          {trend}
        </div>
        {detail && (
          <div className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1 truncate">
            {detail}
          </div>
        )}
      </div>
    </div>
  );
}
