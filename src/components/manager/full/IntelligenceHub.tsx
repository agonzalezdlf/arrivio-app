import React, { useState, useEffect } from "react";
import {
  Network,
  Globe2,
  ShieldCheck,
  Database,
  Zap,
  Share2,
  Users,
  ArrowUpRight,
  Activity,
  AlertCircle,
  TrendingUp,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { cn } from "../../../lib/utils";

const syncData = [
  { day: "May 19", confidence: 62, savings: 3200 },
  { day: "May 20", confidence: 65, savings: 3400 },
  { day: "May 21", confidence: 64, savings: 3100 },
  { day: "May 22", confidence: 72, savings: 3800 },
  { day: "May 23", confidence: 78, savings: 4200 },
  { day: "May 24", confidence: 85, savings: 4700 },
  { day: "May 25", confidence: 92, savings: 5100 },
];

export const SEUR_SECTOR_DATA = [
  {
    id: "MAD-NORTH-A1",
    code: "SEUR-28050",
    name: "Las Tablas / Sanchinarro",
    congestion: 14,
    status: "Normal",
    store: "Zara Las Tablas",
    latency: 8,
    color: "#10B981", // green
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
    intervention: "No action required. Flow maintains nominal limits.",
    activeVans: 5,
  },
  {
    id: "MAD-NORTH-A2",
    code: "SEUR-28020",
    name: "Plaza de Castilla Hub",
    congestion: 42,
    status: "Moderate",
    store: "Zara Castellana Depot",
    latency: 9,
    color: "#F59E0B", // orange
    badgeColor: "bg-amber-50 text-amber-700 border-amber-100",
    intervention: "Monitor northern A-1 lane restriction during commute peak.",
    activeVans: 4,
  },
  {
    id: "MAD-CENTRAL-B2",
    code: "SEUR-28004",
    name: "Gran Vía Centro Urgente",
    congestion: 28,
    status: "Normal",
    store: "Mango Gran Vía Central",
    latency: 18,
    color: "#3B82F6", // blue
    badgeColor: "bg-blue-50 text-blue-700 border-blue-100",
    intervention: "Pedestrian zones active. Standard electric delivery cargo vans recommended.",
    activeVans: 7,
  },
  {
    id: "MAD-CENTRAL-B3",
    code: "SEUR-28015",
    name: "Chamberí Delivery Unit",
    congestion: 50,
    status: "Moderate",
    store: "Inditex Alberto Aguilera",
    latency: 15,
    color: "#F59E0B", // orange
    badgeColor: "bg-amber-50 text-amber-700 border-amber-100",
    intervention: "Chamberí old quarter narrow road speeds normal. High vertical foot-logistics density.",
    activeVans: 3,
  },
  {
    id: "MAD-EAST-C4",
    code: "SEUR-28001",
    name: "Barrio de Salamanca Premium",
    congestion: 78,
    status: "Heavy Traffic",
    store: "El Corte Inglés Serrano",
    latency: 22,
    color: "#EF4444", // red
    badgeColor: "bg-rose-50 text-rose-700 border-rose-100",
    intervention: "Heavy school-zone secondary bottlenecks. Suggested M-40 bypass re-routing.",
    activeVans: 4,
  },
  {
    id: "MAD-SOUTH-D8",
    code: "SEUR-28500",
    name: "Vallecas Cargo Hub",
    congestion: 65,
    status: "Heavy Traffic",
    store: "Massimo Dutti Goya",
    latency: 12,
    color: "#EF4444", // red
    badgeColor: "bg-rose-50 text-rose-700 border-rose-100",
    intervention: "Docks close at 14:00. High delay risk on incoming trucks. Prioritize feeder runs.",
    activeVans: 5,
  },
  {
    id: "MAD-WEST-E1",
    code: "SEUR-28008",
    name: "Moncloa / Ciudad Universitaria",
    congestion: 35,
    status: "Normal",
    store: "Mango Princesa",
    latency: 11,
    color: "#10B981", // green
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
    intervention: "Student residential delivery windows clear of constraints.",
    activeVans: 2,
  },
];

const geometricCongestionData = SEUR_SECTOR_DATA.map((s) => ({
  sector: s.code,
  congestion: s.congestion,
  color: s.color,
}));

const retailLockerLatencyData = SEUR_SECTOR_DATA.map((s) => ({
  store: s.store,
  latency: s.latency,
  color: s.color,
}));

export function IntelligenceHub({
  deliveries = [],
  setDeliveries,
  routes = [],
  setRoutes,
}: {
  deliveries?: any[];
  setDeliveries?: any;
  routes?: any[];
  setRoutes?: any;
}) {
  const [activeSimulation, setActiveSimulation] = useState(false);
  const [nodeWeight, setNodeWeight] = useState(74);
  const [activeTab, setActiveTab] = useState<"network" | "congestion" | "workbench">(
    "network",
  );

  // Hovered day for Historical Sync numerical analytics display
  const [hoveredDay, setHoveredDay] = useState<any>(syncData[6]);

  const averageSystemReliability = routes && routes.length > 0
    ? Math.round(routes.reduce((acc, curr) => acc + curr.reliability, 0) / routes.length)
    : 88;

  const dynamicSyncData = syncData.map((d, idx) => {
    if (idx === syncData.length - 1) {
      return { ...d, confidence: averageSystemReliability };
    }
    return { ...d, confidence: Math.max(55, Math.min(99, averageSystemReliability - (syncData.length - 1 - idx) * 3)) };
  });

  const activeHoveredDay = hoveredDay
    ? (dynamicSyncData.find(d => d.day === hoveredDay.day) || dynamicSyncData[6])
    : dynamicSyncData[6];

  // Audit Rails state
  const [showAuditModal, setShowAuditModal] = useState(false);

  // Dynamically calculate average system-wide success rate based on real deliveries state
  const autoSuccessRate = deliveries && deliveries.length > 0
    ? Math.min(
        99.8,
        parseFloat(
          ((deliveries.reduce((sum, d) => sum + d.predictedProbability, 0) / deliveries.length) * 100).toFixed(1)
        )
      )
    : 92.4;

  // ROI simulation interactive inputs using Kilometers - set to matching Madrid standard defaults
  const [dailyVolume, setDailyVolume] = useState(1124);

  // Derived simulation parameters dynamically calculated from the single dailyVolume input
  const kmPerStopBaseline = Math.max(2.2, Math.min(4.8, Math.round((4.6 - (dailyVolume / 10000)) * 10) / 10));
  const kmPerStopOptimized = Math.max(0.6, Math.min(1.8, Math.round((1.5 - (dailyVolume / 18000)) * 10) / 10));
  const firstTimeSuccessBaseline = 74.2;
  const firstTimeSuccessOptimized = autoSuccessRate;

  // Dynamic confidence rate per node/zone
  const getZoneSuccessRate = (zoneId: string) => {
    const zoneDeliveries = deliveries.filter(d => d.assignedRoute === zoneId || d.address.includes(zoneId));
    if (zoneDeliveries.length === 0) return 92;
    return Math.round(
      (zoneDeliveries.reduce((sum, d) => sum + d.predictedProbability, 0) / zoneDeliveries.length) * 100
    );
  };

  // ROI math formulations based on €0.75 per Kilometer & €15 carrier SLA penalty
  const failedBaselineCost =
    dailyVolume * (1 - firstTimeSuccessBaseline / 100) * 15.0;
  const kmBaselineCost = dailyVolume * kmPerStopBaseline * 0.75;
  const totalBaselineCost = failedBaselineCost + kmBaselineCost;

  const failedOptimizedCost =
    dailyVolume * (1 - firstTimeSuccessOptimized / 100) * 15.0;
  const kmOptimizedCost = dailyVolume * kmPerStopOptimized * 0.75;
  const totalOptimizedCost = failedOptimizedCost + kmOptimizedCost;

  const simulationYield = Math.max(
    0,
    parseFloat(((totalBaselineCost - totalOptimizedCost) / 1000).toFixed(1)),
  );

  return (
    <div className="flex flex-col h-full bg-[#0F172A] text-slate-200">
      <header className="min-h-[72px] px-4 md:px-8 border-b border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between bg-slate-900/50 backdrop-blur-xl shrink-0 py-4 md:py-0 gap-4">
        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <div className="shrink-0 leading-tight">
            <h1 className="text-[16px] md:text-[18px] font-black text-white tracking-tight uppercase">
              Arrivio Intelligence Hub
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-[9px] md:text-[11px] text-slate-400 font-bold uppercase tracking-widest whitespace-nowrap">
                Real-time Network ROI Optimization
              </p>
            </div>
          </div>

          <div className="hidden md:block h-8 w-px bg-white/10 mx-2" />

          <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab("network")}
              className={cn(
                "px-3 md:px-4 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === "network"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-500 hover:text-slate-300",
              )}
            >
              Network
            </button>
            <button
              onClick={() => setActiveTab("congestion")}
              className={cn(
                "px-3 md:px-4 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === "congestion"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-500 hover:text-slate-300",
              )}
            >
              Congestion & Latency
            </button>
            <button
              onClick={() => setActiveTab("workbench")}
              className={cn(
                "px-3 md:px-4 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === "workbench"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-500 hover:text-slate-300",
              )}
            >
              ROI Simulator
            </button>
          </nav>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-white/5">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">
              Node Sync:
            </span>
            <span className="text-[10px] font-black text-emerald-400 uppercase">
              Synchronized
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-[1600px] mx-auto w-full">
        {activeTab === "congestion" && (
          <div className="space-y-6 text-left animate-in fade-in duration-300">
            <div className="bg-slate-900 rounded-[32px] border border-white/5 p-6 md:p-8 space-y-3 animate-in slide-in-from-top-6 duration-300">
              <h2 className="text-[18px] font-black text-white tracking-tight italic uppercase">
                Real-Time District Traffic Congestion
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Analysis of active traffic delays and congestion indexes across key Madrid carrier delivery districts.
              </p>
            </div>

            {/* Geographic Sectors Congestion - Full Width */}
            <div className="bg-slate-900 border border-white/5 rounded-[40px] p-6 md:p-8 flex flex-col justify-between min-h-[380px]">
              <div>
                <h3 className="text-[13px] font-black text-slate-200 uppercase tracking-widest mb-1 italic">
                  Geographic Sector Traffic Congestion
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-6">
                  Active delay impact % across key Madrid delivery sectors
                </p>
              </div>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={geometricCongestionData}>
                    <XAxis
                      dataKey="sector"
                      interval={0}
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 8,
                        fill: "#94A3B8",
                        fontWeight: "bold",
                      }}
                    />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1E293B",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "9px",
                      }}
                      formatter={(value: any) => [
                        `${value}% Delay Impact`,
                        "Congestion",
                      ]}
                    />
                    <Bar
                      dataKey="congestion"
                      radius={[4, 4, 0, 0]}
                      label={{
                        position: "top",
                        fill: "#CBD5E1",
                        fontSize: 9,
                        fontWeight: "black",
                        formatter: (val: any) => `${val}%`,
                      }}
                    >
                      {geometricCongestionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[9px] text-slate-500 font-black uppercase mt-6 leading-normal">
                * Alert state thresholds (Red &gt; 60%) trigger automatic dispatch offsets to protect carrier window agreements.
              </p>
            </div>
          </div>
        )}

        {activeTab === "network" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 h-full">
            {/* Left Column: Aggregated Metrics */}
            <div className="lg:col-span-3 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <MetricCard
                  title="Network Synchronizations"
                  value="1.4M Synced"
                  subValue="General system syncs / 24h"
                  trend="+12.4% Synced"
                  icon={Database}
                  color="blue"
                  description="Aggregated general system synchronization logs, capturing all multi-carrier courier GPS signals, local routing nodes, and partner retailer locker handshakes."
                />
                <MetricCard
                  title="Predictive Reliability"
                  value={`${autoSuccessRate}%`}
                  subValue="Successful first-attempt rate"
                  trend="+4.1% Lift"
                  icon={Zap}
                  color="amber"
                  description={`Achieves ${autoSuccessRate}% successful first-instance deliveries (vs. legacy 74.2% baseline limit) across all system nodes, eliminating repeated driver backtracking and delay penalties.`}
                />
                <MetricCard
                  title="Daily Recapture Yield"
                  value={`€${simulationYield}k`}
                  subValue="Recovered Loss / 24h"
                  trend="Live Peak"
                  icon={TrendingUp}
                  color="emerald"
                  description="Financial loss recaptured today by automated neighborhood parcel consolidation and preventing failed delivery returns."
                />
              </div>

              <div className="p-6 bg-slate-900 rounded-[28px] border border-white/5 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] leading-normal">
                    Prediction Reliability Cluster: Madrid
                  </h3>
                  <div className="flex items-center gap-2 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-[9px] font-black text-amber-500 uppercase shrink-0">
                    Active Nodes
                  </div>
                </div>
                <div className="space-y-3">
                  {routes.map((route) => (
                    <ConfidenceIndicator 
                      key={route.routeId}
                      label={`Node ${route.routeId.split('-').pop()}`} 
                      value={route.reliability} 
                      ordersCount={route.totalStops}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Center Column: Charts & Analysis */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-slate-900 rounded-[28px] md:rounded-[32px] border border-white/5 p-6 md:p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Network className="w-48 h-48" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
                  <div>
                    <h2 className="text-[18px] md:text-[20px] font-black text-white tracking-tight uppercase italic whitespace-nowrap">
                      Historical Sync
                    </h2>
                    <p className="text-[10px] md:text-[11px] text-slate-500 font-bold uppercase tracking-widest md:mt-1">
                      Reliability Score vs Yield Recovery
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-[9px] font-black uppercase tracking-wider bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-amber-500">Reliability Rate (%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-emerald-500">Recaptured Yield (€)</span>
                    </div>
                    <div className="px-2 py-0.5 bg-white/5 rounded border border-white/10 text-[8px] font-black text-slate-400">
                      7-Day Sync
                    </div>
                  </div>
                </div>

                {/* Interactive Metrics Bar reflecting graph data */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950/50 p-3 rounded-2xl mb-6 border border-white/5 relative z-10 text-left">
                  <div>
                    <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider block mb-0.5" title="Aggregated daily time bin of synchronized fleet sequences">
                      Sync Timeline Day (24h Bin)
                    </span>
                    <span className="text-[13px] font-black text-blue-400 tracking-tight">
                      {activeHoveredDay.day}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider block mb-0.5">
                      Reliability Score
                    </span>
                    <span className="text-[13px] font-black text-amber-500 tracking-tight">
                      {activeHoveredDay.confidence}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider block mb-0.5">
                      Est. Recaptured Yield
                    </span>
                    <span className="text-[13px] font-black text-emerald-400 tracking-tight">
                      €{activeHoveredDay.savings.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="h-[200px] md:h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={dynamicSyncData}
                      margin={{ top: 15, right: 38, left: 8, bottom: 0 }}
                      onMouseMove={(state: any) => {
                        if (
                          state &&
                          state.activePayload &&
                          state.activePayload.length > 0
                        ) {
                          setHoveredDay(state.activePayload[0].payload);
                        }
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="confidenceGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#F59E0B"
                            stopOpacity={0.15}
                          />
                          <stop
                            offset="95%"
                            stopColor="#F59E0B"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="yieldGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10B981"
                            stopOpacity={0.15}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10B981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#ffffff03"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 10,
                          fill: "#64748B",
                          fontWeight: "bold",
                        }}
                      />
                      <YAxis
                        yAxisId="left"
                        orientation="left"
                        domain={[50, 100]}
                        ticks={[50, 60, 70, 80, 90, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fill: "#F59E0B", fontWeight: "bold" }}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={[0, 6000]}
                        ticks={[0, 1200, 2400, 3600, 4800, 6000]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fill: "#10B981", fontWeight: "bold" }}
                        tickFormatter={(v) => v === 0 ? "€0" : `€${v % 1000 === 0 ? (v / 1000).toFixed(0) : (v / 1000).toFixed(1)}k`}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border border-white/10 text-left space-y-1.5 shadow-xl max-w-[240px]">
                                <p className="text-[10px] font-black uppercase text-blue-400 tracking-wider">Sync Interval Node: {data.day}</p>
                                <p className="text-[9px] text-slate-300 leading-normal">
                                  This represents a single 24-hour time bin grouping our daily shipments. Under Arrivio, this interval aggregates 1,124 distinct physical stops into optimized regional clusters.
                                </p>
                                <div className="pt-1 flex justify-between items-center text-[9px] font-black uppercase gap-4">
                                  <span className="text-amber-500">Reliability: {data.confidence}%</span>
                                  <span className="text-emerald-500">Yield: €{data.savings.toLocaleString()}</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="confidence"
                        name="Reliability Score"
                        stroke="#F59E0B"
                        strokeWidth={3}
                        fill="url(#confidenceGrad)"
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="savings"
                        name="Recaptured Yield"
                        stroke="#10B981"
                        strokeWidth={3}
                        fill="url(#yieldGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="bg-slate-900 rounded-[32px] border border-white/5 p-6 h-52 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 border border-blue-500/20">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[14px] font-black text-white italic tracking-tight">
                      Enterprise Protocol v4.2
                    </div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                      Anonymized GDPR Secure Data Layer
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Alerts & Feed */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-slate-900 rounded-[28px] border border-white/5 h-full flex flex-col p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[13px] font-black text-white uppercase tracking-widest italic">
                    Live Intelligence Feed
                  </h3>
                  <div className="px-2 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-full text-[8px] font-black uppercase">
                    3 Active Risks
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <AlertItem
                    type="risk"
                    label="Madrid Sector Traffic Delay"
                    detail="Heavy traffic on Route 42. Dynamic router automatically bypassed congestion to preserve ETAs for 14 shipments."
                    time="2m ago"
                  />
                  <AlertItem
                    type="sync"
                    label="ETA Sync Broadcast"
                    detail="Synced location data for 12,042 packages in transit. Recipient delivery notifications updated successfully."
                    time="5m ago"
                  />
                  <AlertItem
                    type="alert"
                    label="Road Block Avoided"
                    detail="Detected surprise local road closure. Bypassed block and recalculated next stops to save 22 minutes."
                    time="12m ago"
                  />
                  <AlertItem
                    type="success"
                    label="Loss Prevention Success"
                    detail="Fixed incorrect buyer postal codes, successfully saving first-attempt deliveries and returned-parcel costs."
                    time="24m ago"
                  />
                  <AlertItem
                    type="sync"
                    label="Multi-Package Consolidation"
                    detail="Consolidated multiple package drop-offs at the same physical building block into a single delivery queue."
                    time="45m ago"
                  />
                </div>

                <button
                  className="w-full mt-6 py-4 bg-slate-800 text-slate-300 rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors border border-white/5"
                  onClick={() => setShowAuditModal(true)}
                >
                  View Audit Trails
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "workbench" && (
          /* Workbench Tab: ROI Simulator */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-full animate-in fade-in duration-300">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 rounded-[32px] p-6 md:p-8 border border-white/5 space-y-6 text-left">
                <div className="space-y-2 border-b border-white/5 pb-4">
                  <h2 className="text-[18px] font-black text-white tracking-tight italic uppercase">
                    Simulation Parameters
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Adjust the single slider parameter below to auto-calculate baseline vs optimized ROI values.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Parameter Controls Panel */}
                  <div className="p-5 bg-slate-950 rounded-2xl border border-white/5 space-y-5">
                    {/* Daily Volume Slider (Single Control) */}
                    <div className="space-y-1.5 pb-2">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-400">
                        <span>Daily Volume (Input)</span>
                        <span className="text-blue-400 font-mono text-[11px]">
                          {dailyVolume.toLocaleString()} Shipments / day
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1000"
                        max="30000"
                        step="500"
                        value={dailyVolume}
                        onChange={(e) => setDailyVolume(Number(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer accent-blue-500 focus:outline-none"
                      />
                      <span className="text-[8px] text-slate-500 uppercase font-black block mt-2.5 leading-normal">
                        All advanced traditional and optimized KPIs (such as neighborhood mileage density, SLA handshake margins, first-attempt drop success, and fuel recapture buffers) are dynamically computed from daily route volume density. No other unneeded inputs required.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Efficiency Delta</span>
                    <span className="text-[11px] font-black text-blue-400 italic font-mono">
                      {(
                        ((kmPerStopBaseline - kmPerStopOptimized) /
                          kmPerStopBaseline) *
                        100
                      ).toFixed(0)}
                      % KM/Stop Reduced
                    </span>
                  </div>

                  {/* Benchmark Stats Comparison */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Efficiency Benchmarks
                    </h4>
                    <div className="space-y-3 pt-1">
                      <div className="flex justify-between items-center bg-slate-950/20 p-2.5 rounded-xl border border-white/5">
                        <span className="text-[11px] font-bold text-slate-400">
                          First-time Success
                        </span>
                        <div className="flex flex-col items-end">
                          <span className="text-[12px] font-black text-emerald-400">
                            {firstTimeSuccessOptimized}%
                          </span>
                          <span className="text-[9px] text-slate-600 line-through">
                            {firstTimeSuccessBaseline}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center bg-slate-950/20 p-2.5 rounded-xl border border-white/5">
                        <span className="text-[11px] font-bold text-slate-400">
                          Avg KM/Stop Density
                        </span>
                        <div className="flex flex-col items-end">
                          <span className="text-[12px] font-black text-blue-400">
                            {kmPerStopOptimized} km
                          </span>
                          <span className="text-[9px] text-slate-600">
                            {kmPerStopBaseline} km
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center bg-slate-950/20 p-2.5 rounded-xl border border-white/5">
                        <span className="text-[11px] font-bold text-slate-400">
                          Carbon Emissions
                        </span>
                        <div className="flex flex-col items-end">
                          <span className="text-[12px] font-black text-emerald-400">
                            -{Math.round( ( (kmPerStopBaseline - kmPerStopOptimized) / kmPerStopBaseline ) * 35 )}%
                          </span>
                          <span className="text-[9px] text-slate-600">
                            Industrial Standard
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                  <div className="p-6 bg-blue-600/5 rounded-3xl border border-blue-500/20 space-y-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <span className="text-[11px] font-black text-white uppercase italic">
                        Active ROI Optimization
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed italic">
                      System is currently processing 1.4M data points to
                      synchronize neighborhood presence. No manual intervention
                      required.
                    </p>
                  </div>

                <button className="w-full py-5 bg-slate-800 text-slate-400 rounded-[24px] text-[13px] font-black uppercase tracking-widest transition-all border border-white/5 hover:text-white">
                  Download Network Audit
                </button>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6 h-full flex flex-col">
              <div className="bg-slate-900 rounded-[40px] p-10 border border-white/5 flex-1 flex flex-col items-center justify-center relative overflow-hidden text-center">
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(#2563EB 0.5px, transparent 0.5px)",
                    backgroundSize: "32px 32px",
                  }}
                />

                <div className="relative z-10 max-w-3xl mx-auto space-y-12">
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="w-20 h-20 bg-emerald-500/10 rounded-[32px] flex items-center justify-center text-emerald-400 border border-emerald-500/20 animate-pulse">
                        <TrendingUp className="w-10 h-10" />
                      </div>
                    </div>
                    <h2 className="text-[32px] font-black text-white tracking-widest uppercase italic leading-none">
                      Intelligence ROI Yield
                    </h2>
                    <div className="text-[64px] font-black text-emerald-500 tabular-nums tracking-tighter">
                      +€{simulationYield.toFixed(1)}k{" "}
                      <span className="text-[24px] text-slate-500">/ Day</span>
                    </div>
                  </div>

                  <div className="space-y-8 w-full">
                    <div className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] text-center italic">
                      Arrivio ROI Performance Benchmarks
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left">
                      <div className="p-8 bg-slate-900 rounded-[40px] border border-white/10 flex flex-col justify-between h-64 shadow-2xl">
                        <div>
                          <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1 italic">
                            Legacy Manual Operations
                          </div>
                          <div className="text-[36px] font-black text-rose-50 italic tracking-tighter leading-none">
                            €{(simulationYield * 1.4).toFixed(1)}k{" "}
                            <span className="text-[11px] text-slate-500 block mt-1 font-mono uppercase tracking-[0.2em] font-black">
                              Daily Baseline Waste
                            </span>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed">
                            Fragmented logistics and static route planning
                            causing significant operational leakage.
                          </p>
                          <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                              <div
                                key={i}
                                className="h-1 flex-1 bg-rose-500/20 rounded-full"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="p-8 bg-slate-900 rounded-[40px] border border-white/10 flex flex-col justify-between h-64 relative overflow-hidden shadow-2xl">
                        <Zap className="absolute top-4 right-4 w-12 h-12 text-emerald-500/10" />
                        <div>
                          <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1 italic">
                            Arrivio Synchronized Network
                          </div>
                          <div className="text-[36px] font-black text-emerald-400 italic tracking-tighter leading-none text-emerald-50">
                            €{(simulationYield * 0.2).toFixed(1)}k{" "}
                            <span className="text-[11px] text-slate-500 block mt-1 font-mono uppercase tracking-[0.2em] font-black">
                              Remaining Managed Waste
                            </span>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <p className="text-[11px] text-emerald-500/60 font-medium italic leading-relaxed">
                            Real-time neighborhood sync minimizing failure.
                            Arrivio will continue to reduce this as it learns.
                          </p>
                          <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                              <div
                                key={i}
                                className={cn(
                                  "h-1.5 flex-1 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]",
                                  i <= 5
                                    ? "bg-emerald-500"
                                    : "bg-emerald-500/5",
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                      <div className="text-[11px] font-black text-blue-400 uppercase mb-2">
                        Failure Avoidance
                      </div>
                      <div className="text-[20px] font-black text-white">
                        {firstTimeSuccessOptimized}%
                      </div>
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                      <div className="text-[11px] font-black text-amber-500 uppercase mb-2">
                        Route Optimization (Efficiency Lift)
                      </div>
                      <div className="text-[20px] font-black text-white">
                        +
                        {(
                          ((kmPerStopBaseline - kmPerStopOptimized) /
                            kmPerStopBaseline) *
                          100
                        ).toFixed(0)}
                        %
                      </div>
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                      <div className="text-[11px] font-black text-emerald-500 uppercase mb-2">
                        Reliability Delta
                      </div>
                      <div className="text-[20px] font-black text-white">
                        +
                        {(
                          firstTimeSuccessOptimized - firstTimeSuccessBaseline
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Audit Trail Modal */}
        <AnimatePresence>
          {showAuditModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 border border-white/10 rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
              >
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-white/5 bg-slate-950/40 flex items-center justify-between">
                  <div className="text-left">
                    <h3 className="text-[17px] font-black text-white uppercase tracking-tight italic">
                      ENTERPRISE AUDIT TRAIL LOGS
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                      Automated Ledger Synchronizations & Security Events
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAuditModal(false)}
                    className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 text-[10px] uppercase font-black tracking-wider text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Close [ESC]
                  </button>
                </div>

                {/* Logs Content */}
                <div className="p-6 md:p-8 overflow-y-auto space-y-4 flex-1 text-left">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between mb-2">
                    <span>Authorized Actions</span>
                    <span className="text-emerald-500">System State: Active</span>
                  </div>

                  <div className="space-y-3 font-mono">
                    <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-amber-500 font-bold uppercase tracking-wider">
                          [OPTIMIZATION_SYNC]
                        </span>
                        <span className="text-slate-500">
                          2026-05-21 18:24:12 UTC
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Neighborhood presence sync executed for sector MAD-A1.
                        Recaptured 420 units in queue processing delay.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-blue-400 font-bold uppercase tracking-wider">
                          [YIELD_RECOVERY]
                        </span>
                        <span className="text-slate-500">
                          2026-05-21 17:55:04 UTC
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Automatic validation completed: €420 recovered by Node-Sync B
                        for MAD-C1. Congestion risk resolved.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-rose-500 font-bold uppercase tracking-wider">
                          [EXCEPTION_LOG]
                        </span>
                        <span className="text-slate-500">
                          2026-05-21 16:40:22 UTC
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        User MAD-C1 experienced unexpected closure. Route modified with
                        neighborhood sequence update.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-emerald-500 font-bold uppercase tracking-wider">
                          [CONSOLIDATION_EVENT]
                        </span>
                        <span className="text-slate-500">
                          2026-05-21 15:12:45 UTC
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        3 shipments automatically merged for MAD-A2 based on dynamic
                        spatial mapping score.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer info */}
                <div className="p-6 bg-slate-950/40 border-t border-white/5 flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>Secure ISO-27001 Cryptographic Ledger</span>
                  <span>Page 1 of 1</span>
                </div>
              </motion.div>
            </div>
          )}

      </AnimatePresence>
    </div>
  </div>
  );
}

function MetricCard({ title, value, subValue, trend, icon: Icon, color, description }: any) {
  const colors: any = {
    blue: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  };
  return (
    <div className="bg-slate-900 p-6 rounded-[28px] border border-white/5 relative overflow-hidden group">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2.5 rounded-xl border", colors[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-[10px] font-black text-slate-500 bg-white/5 px-2 py-1 rounded-lg uppercase">
          {trend}
        </div>
      </div>
      <div>
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
          {title}
        </div>
        <div className="text-[24px] font-black text-white italic tracking-tight">
          {value}
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">
          {subValue}
        </div>
        {description && (
          <p className="mt-3 text-[10px] leading-relaxed text-slate-400 italic bg-slate-950/40 p-2 rounded-xl border border-white/5 font-medium">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function ConfidenceIndicator({
  label,
  value,
  ordersCount,
}: {
  label: string;
  value: number;
  ordersCount?: number;
  key?: any;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </span>
        <span
          className={cn(
            "text-[9px] font-black uppercase text-right",
            value >= 90
              ? "text-emerald-500"
              : value >= 75
                ? "text-amber-500"
                : "text-rose-500",
          )}
        >
          {value}% Reliability {ordersCount ? `(${ordersCount} orders)` : ""}
        </span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-1000",
            value >= 90
              ? "bg-emerald-500"
              : value >= 75
                ? "bg-amber-500"
                : "bg-rose-500",
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function AlertItem({ type, label, detail, time }: any) {
  const icons: any = {
    risk: <AlertCircle className="w-4 h-4 text-rose-500" />,
    sync: <Network className="w-4 h-4 text-blue-500" />,
    alert: <Zap className="w-4 h-4 text-amber-550" />,
    success: <TrendingUp className="w-4 h-4 text-emerald-500" />,
  };
  return (
    <div className="flex gap-4 group cursor-pointer text-left">
      <div className="mt-1 transition-transform group-hover:scale-110">
        {icons[type]}
      </div>
      <div className="flex-1 border-b border-slate-100 pb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="text-[12px] font-black text-slate-800 tracking-tight uppercase italic">
            {label}
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase italic">
            {time}
          </span>
        </div>
        <div className="text-[10px] text-slate-500 font-medium leading-relaxed">
          {detail}
        </div>
      </div>
    </div>
  );
}

function WorkbenchSlider({
  label,
  value,
  setValue,
  min,
  max,
  icon: Icon,
}: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-blue-500" />
          <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">
            {label}
          </span>
        </div>
        <span className="text-[14px] font-black text-slate-900 italic">
          {value}%
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => setValue(parseInt(e.target.value))}
        className="w-full h-2 bg-slate-100 rounded-lg cursor-pointer accent-blue-600 focus:outline-none"
      />
    </div>
  );
}

function SimulationControl({ label, active, setActive, description }: any) {
  const [internalOn, setInternalOn] = useState(active);
  const isOn = setActive ? active : internalOn;
  const toggle = () =>
    setActive ? setActive(!active) : setInternalOn(!internalOn);

  return (
    <div className="flex gap-4 group">
      <button
        onClick={toggle}
        className={cn(
          "w-10 h-10 rounded-xl flex flex-shrink-0 items-center justify-center border transition-all",
          isOn
            ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
            : "bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300",
        )}
      >
        {isOn ? (
          <ShieldCheck className="w-5 h-5" />
        ) : (
          <Database className="w-5 h-5" />
        )}
      </button>
      <div className="flex-1 text-left">
        <div
          className={cn(
            "text-[11px] font-black uppercase transition-colors italic",
            isOn ? "text-slate-800" : "text-slate-400",
          )}
        >
          {label}
        </div>
        <div className="text-[9px] text-slate-400 font-bold italic mt-0.5">
          {description}
        </div>
      </div>
    </div>
  );
}

export function CongestionView({ pitchStage = 'scale' }: { pitchStage?: 'poc' | 'mvp' | 'scale' }) {
  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      {/* Visual Title Header */}
      <div className="bg-white rounded-[24px] border border-slate-200 p-6 md:p-8 space-y-3 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-radial-gradient from-blue-50/50 to-transparent pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-indigo-600 text-white rounded-full text-[9px] font-bold uppercase tracking-wider font-mono">
                Operator: SEUR Spain
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-widest">
                Live Madrid Feed
              </span>
            </div>
            <h2 className="text-[20px] md:text-[22px] font-bold text-slate-900 tracking-tight">
              SEUR Madrid District Congestion
            </h2>
            <p className="text-[11px] text-slate-500 font-sans leading-relaxed max-w-3xl font-medium">
              Real-time traffic delay and congestion index monitoring across key carrier districts in Madrid.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
            <div className="text-right">
              <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-bold">Average City Delay</span>
              <span className="text-[16px] font-bold text-amber-600 font-mono">44.8 mins</span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-left">
              <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-bold">Active Vans</span>
              <span className="text-[16px] font-bold text-slate-800 font-mono">
                {SEUR_SECTOR_DATA.reduce((sum, s) => sum + s.activeVans, 0)} Units
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Card - Full Width */}
      <div className="bg-white border border-slate-200 rounded-[24px] p-6 md:p-8 flex flex-col justify-between shadow-sm space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              District Traffic Congestion
            </h3>
            <span className="text-[9px] font-mono bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-lg font-bold">
              Max: 78% (Salamanca)
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
            Active delay impact percentage across SEUR Madrid sectors
          </p>
        </div>
        
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={geometricCongestionData}>
              <XAxis
                dataKey="sector"
                interval={0}
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 8,
                  fill: "#64748B",
                  fontWeight: "semibold",
                }}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  fontSize: "10px",
                  color: "#0F172A",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                }}
                formatter={(value: any) => [
                  `${value}% Delay Impact`,
                  "Congestion",
                ]}
              />
              <Bar
                dataKey="congestion"
                radius={[6, 6, 0, 0]}
                label={{
                  position: "top",
                  fill: "#475569",
                  fontSize: 10,
                  fontWeight: "bold",
                  formatter: (val: any) => `${val}%`,
                }}
              >
                {geometricCongestionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-[9.5px] text-slate-400 font-bold uppercase leading-normal border-t border-slate-100 pt-3">
          * Alert state thresholds (Red &gt; 60%) trigger automatic dispatch time offsets to preserve delivery window agreements.
        </p>
      </div>

      {/* Simple, Non-Interactive District Ledger */}
      <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden text-slate-800">
        <div className="p-6 bg-slate-50/50 border-b border-slate-200">
          <h3 className="text-[14px] font-bold text-slate-900 uppercase tracking-tight">
            SEUR District Status Overview
          </h3>
          <p className="text-[10.5px] text-slate-500 font-sans font-medium mt-0.5">
            Current status of all {SEUR_SECTOR_DATA.length} active delivery zones in Madrid.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[9px] uppercase font-bold tracking-wider">
                <th className="py-3 px-6 font-mono">SEUR Code</th>
                <th className="py-3 px-6">District Sector</th>
                <th className="py-3 px-6 text-center">Active Vans</th>
                <th className="py-3 px-6">Road Congestion</th>
                <th className="py-3 px-6 text-right">Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SEUR_SECTOR_DATA.map((sector) => (
                <tr key={sector.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-bold text-slate-500">
                    {sector.code}
                  </td>
                  <td className="py-3.5 px-6 font-semibold text-slate-800">
                    {sector.name}
                  </td>
                  <td className="py-3.5 px-6 text-center font-bold text-slate-600">
                    {sector.activeVans} Vans
                  </td>
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-700 min-w-[28px]">{sector.congestion}%</span>
                      <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${sector.congestion}%`,
                            backgroundColor: sector.color,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider border font-mono",
                      sector.status === "Normal" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                      sector.status === "Moderate" ? "bg-amber-50 text-amber-700 border-amber-100" :
                      "bg-rose-50 text-rose-700 border-rose-100"
                    )}>
                      {sector.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function RoiSimulatorView({
  deliveries = [],
  routes = [],
  pitchStage = 'scale'
}: {
  deliveries?: any[];
  routes?: any[];
  pitchStage?: 'poc' | 'mvp' | 'scale';
}) {
  const [dailyVolume, setDailyVolume] = useState(1124);

  // Dynamically calculate average system-wide success rate based on real deliveries state
  const autoSuccessRate = deliveries && deliveries.length > 0
    ? Math.min(
        99.8,
        parseFloat(
          ((deliveries.reduce((sum, d) => sum + d.predictedProbability, 0) / deliveries.length) * 100).toFixed(1)
        )
      )
    : 92.4;

  const kmPerStopBaseline = Math.max(2.2, Math.min(4.8, Math.round((4.6 - (dailyVolume / 10000)) * 10) / 10));
  const kmPerStopOptimized = Math.max(0.6, Math.min(1.8, Math.round((1.5 - (dailyVolume / 18000)) * 10) / 10));
  const firstTimeSuccessBaseline = 74.2;
  const firstTimeSuccessOptimized = autoSuccessRate;

  const failedBaselineCost = dailyVolume * (1 - firstTimeSuccessBaseline / 100) * 15.0;
  const kmBaselineCost = dailyVolume * kmPerStopBaseline * 0.75;
  const totalBaselineCost = failedBaselineCost + kmBaselineCost;

  const failedOptimizedCost = dailyVolume * (1 - firstTimeSuccessOptimized / 100) * 15.0;
  const kmOptimizedCost = dailyVolume * kmPerStopOptimized * 0.75;
  const totalOptimizedCost = failedOptimizedCost + kmOptimizedCost;

  const simulationYield = Math.max(
    0,
    parseFloat(((totalBaselineCost - totalOptimizedCost) / 1000).toFixed(1)),
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-full animate-in fade-in duration-300">
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-[24px] p-6 md:p-8 border border-slate-200 space-y-6 text-left shadow-sm">
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <h2 className="text-[18px] font-black text-slate-900 tracking-tight uppercase">
              Simulation Parameters
            </h2>
            <p className="text-[11px] text-slate-500 font-sans">
              Adjust the daily volumes parameter below to auto-calculate baseline vs optimized ROI values.
            </p>
          </div>

          <div className="space-y-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-5">
              <div className="space-y-1.5 pb-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <span>Daily Volume (Input)</span>
                  <span className="text-blue-600 font-mono text-[11px] font-bold">
                    {dailyVolume.toLocaleString()} Shipments / day
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="30000"
                  step="500"
                  value={dailyVolume}
                  onChange={(e) => setDailyVolume(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer accent-blue-600 focus:outline-none"
                />
                <span className="text-[8px] text-slate-400 uppercase font-bold block mt-2.5 leading-normal">
                  All advanced KPIs are dynamically computed from daily route volume density. No other unneeded inputs required.
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Efficiency Delta</span>
              <span className="text-[11px] font-black text-blue-600 italic font-mono">
                {(((kmPerStopBaseline - kmPerStopOptimized) / kmPerStopBaseline) * 100).toFixed(0)}% KM/Stop Reduced
              </span>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Efficiency Benchmarks
              </h4>
              <div className="space-y-3 pt-1">
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500">
                    First-time Success
                  </span>
                  <div className="flex flex-col items-end">
                    <span className="text-[12px] font-black text-emerald-600">
                      {firstTimeSuccessOptimized}%
                    </span>
                    <span className="text-[9px] text-slate-400 line-through">
                      {firstTimeSuccessBaseline}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500">
                    Avg KM/Stop Density
                  </span>
                  <div className="flex flex-col items-end">
                    <span className="text-[12px] font-black text-blue-600">
                      {kmPerStopOptimized} km
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {kmPerStopBaseline} km
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500">
                    Carbon Emissions
                  </span>
                  <div className="flex flex-col items-end">
                    <span className="text-[12px] font-black text-emerald-600">
                      -{Math.round(((kmPerStopBaseline - kmPerStopOptimized) / kmPerStopBaseline) * 35)}%
                    </span>
                    <span className="text-[9px] text-slate-400">
                      Industrial Standard
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-[11px] font-black text-slate-800 uppercase italic">
                Active ROI Optimization
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
              System is currently processing 1.4M data points to synchronize neighborhood presence.
            </p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-8 space-y-6 h-full flex flex-col">
        <div className="bg-white rounded-[24px] p-10 border border-slate-200 flex-1 flex flex-col items-center justify-center relative overflow-hidden text-center min-h-[500px] shadow-sm">
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(#2563EB 0.5px, transparent 0.5px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative z-10 max-w-3xl mx-auto space-y-12">
            <div className="space-y-4 animate-[pulse_3s_infinite]">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-[24px] flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
                  <TrendingUp className="w-10 h-10" />
                </div>
              </div>
              <h2 className="text-[28px] font-black text-slate-900 tracking-widest uppercase italic leading-none">
                Intelligence ROI Yield
              </h2>
              <div className="text-[54px] font-black text-emerald-600 tabular-nums tracking-tighter">
                +€{simulationYield.toFixed(1)}k{" "}
                <span className="text-[20px] text-slate-400">/ Day</span>
              </div>
            </div>

            <div className="space-y-8 w-full">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center italic">
                Arrivio ROI Performance Benchmarks
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left">
                <div className="p-8 bg-slate-50 rounded-[24px] border border-slate-200 flex flex-col justify-between h-64 shadow-sm">
                  <div>
                    <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1 italic">
                      Legacy Manual Operations
                    </div>
                    <div className="text-[32px] font-black text-slate-900 italic tracking-tighter leading-none">
                      €{(simulationYield * 1.4).toFixed(1)}k{" "}
                      <span className="text-[11px] text-slate-455 block mt-0.5 font-mono uppercase tracking-[0.2em] font-black">
                        Daily Baseline Waste
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[11px] text-slate-500 font-sans italic leading-relaxed">
                      Fragmented logistics and static route planning causing significant operational leakage.
                    </p>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-1 flex-1 bg-rose-200 rounded-full" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-8 bg-emerald-50/40 rounded-[24px] border border-emerald-100 flex flex-col justify-between h-64 relative overflow-hidden shadow-sm">
                  <Zap className="absolute top-4 right-4 w-12 h-12 text-emerald-600/5 animate-bounce" />
                  <div>
                    <div className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1 italic">
                      Arrivio Synchronized Network
                    </div>
                    <div className="text-[32px] font-black text-slate-900 italic tracking-tighter leading-none">
                      €{(simulationYield * 0.2).toFixed(1)}k{" "}
                      <span className="text-[11px] text-slate-455 block mt-0.5 font-mono uppercase tracking-[0.2em] font-black">
                        Remaining Managed Waste
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[11px] text-emerald-700/85 font-sans italic leading-relaxed">
                      Real-time neighborhood sync minimizing failure. Arrivio will continue to reduce this as it learns.
                    </p>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-1.5 flex-1 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.1)]",
                            i <= 5 ? "bg-emerald-500" : "bg-emerald-100"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
                <div className="text-[11px] font-black text-blue-600 uppercase mb-2">
                  Failure Avoidance
                </div>
                <div className="text-[20px] font-black text-slate-900">
                  {firstTimeSuccessOptimized}%
                </div>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
                <div className="text-[11px] font-black text-amber-600 uppercase mb-2">
                  Route Optimization Density
                </div>
                <div className="text-[20px] font-black text-slate-900">
                  +{(((kmPerStopBaseline - kmPerStopOptimized) / kmPerStopBaseline) * 100).toFixed(0)}%
                </div>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
                <div className="text-[11px] font-black text-emerald-600 uppercase mb-2">
                  Reliability Delta
                </div>
                <div className="text-[20px] font-black text-slate-900">
                  +{(firstTimeSuccessOptimized - firstTimeSuccessBaseline).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HistoricalSyncView({
  routes = [],
  deliveries = [],
  pitchStage = 'scale'
}: {
  routes?: any[];
  deliveries?: any[];
  pitchStage?: 'poc' | 'mvp' | 'scale';
}) {
  const [hoveredDay, setHoveredDay] = useState<any>(syncData[6]);
  const [showAuditModal, setShowAuditModal] = useState(false);

  const averageSystemReliability = routes && routes.length > 0
    ? Math.round(routes.reduce((acc, curr) => acc + curr.reliability, 0) / routes.length)
    : 88;

  const dynamicSyncData = syncData.map((d, idx) => {
    if (idx === syncData.length - 1) {
      return { ...d, confidence: averageSystemReliability };
    }
    return { ...d, confidence: Math.max(55, Math.min(99, averageSystemReliability - (syncData.length - 1 - idx) * 3)) };
  });

  const activeHoveredDay = hoveredDay
    ? (dynamicSyncData.find(d => d.day === hoveredDay.day) || dynamicSyncData[6])
    : dynamicSyncData[6];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-full animate-in fade-in duration-300 text-left">
      {/* Center Column: Charts & Analysis */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white rounded-[24px] border border-slate-200 p-6 md:p-8 relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 p-8 text-slate-100 opacity-25 group-hover:opacity-40 transition-opacity pointer-events-none">
            <Network className="w-48 h-48" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
            <div>
              <h2 className="text-[18px] md:text-[20px] font-bold text-slate-900 tracking-tight">
                7-Day Performance History
              </h2>
              <p className="text-[10px] md:text-[11px] text-slate-400 font-bold uppercase tracking-wider md:mt-1">
                Daily On-Time Reliability vs Total Cost Savings
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[9px] font-bold uppercase tracking-wider bg-slate-5 p-2 rounded-xl border border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-amber-600 font-mono">On-Time Rate (%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-emerald-500 font-mono">Cost Savings (€)</span>
              </div>
              <div className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200 text-[8px] font-bold">
                7-Day Overview
              </div>
            </div>
          </div>

          {/* Interactive Metrics Bar reflecting graph data */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl mb-6 border border-slate-200 relative z-10">
            <div>
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                Date
              </span>
              <span className="text-[13px] font-bold text-indigo-600 tracking-tight">
                {activeHoveredDay.day}
              </span>
            </div>
            <div>
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                On-Time Reliability
              </span>
              <span className="text-[13px] font-bold text-amber-500 tracking-tight">
                {activeHoveredDay.confidence}%
              </span>
            </div>
            <div>
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                Estimated Savings
              </span>
              <span className="text-[13px] font-bold text-emerald-600 tracking-tight">
                €{activeHoveredDay.savings.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dynamicSyncData}
                margin={{ top: 15, right: 38, left: 8, bottom: 0 }}
                onMouseMove={(state: any) => {
                  if (
                    state &&
                    state.activePayload &&
                    state.activePayload.length > 0
                  ) {
                    setHoveredDay(state.activePayload[0].payload);
                  }
                }}
              >
                <defs>
                  <linearGradient id="confidenceGradNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="yieldGradNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fill: "#64748B",
                    fontWeight: "bold",
                  }}
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  domain={[50, 100]}
                  ticks={[50, 60, 70, 80, 90, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: "#D97706", fontWeight: "bold" }}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 6000]}
                  ticks={[0, 1200, 2400, 3600, 4800, 6000]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: "#059669", fontWeight: "bold" }}
                  tickFormatter={(v) => v === 0 ? "€0" : `€${v % 1000 === 0 ? (v / 1000).toFixed(0) : (v / 1000).toFixed(1)}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 rounded-xl border border-slate-200 text-left space-y-1.5 shadow-md max-w-[240px]">
                          <p className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">Date: {data.day}</p>
                          <p className="text-[9px] text-slate-500 leading-normal font-sans">
                            Daily performance summary showing on-time delivery rate alongside total logistics cost savings.
                          </p>
                          <div className="pt-1 flex justify-between items-center text-[9px] font-bold uppercase gap-4">
                            <span className="text-amber-600">Reliability: {data.confidence}%</span>
                            <span className="text-emerald-600 font-sans">Savings: €{data.savings.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="confidence"
                  name="Reliability Score"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  fill="url(#confidenceGradNew)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="savings"
                  name="Recaptured Yield"
                  stroke="#10B981"
                  strokeWidth={3}
                  fill="url(#yieldGradNew)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Right Column: Live Alerts & Feed */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-[24px] border border-slate-200 h-full flex flex-col p-6 min-h-[380px] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider animate-pulse">
              System Events Feed
            </h3>
            <div className="px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-[8px] font-bold uppercase">
              3 Active Risks
            </div>
          </div>

          <div className="space-y-4 flex-1">
            <AlertItem
              type="risk"
              label="Madrid Sector Traffic"
              detail="Heavy traffic on Route 42. Dynamic router automatically bypassed congestion to preserve ETAs."
              time="2m ago"
            />
            <AlertItem
              type="sync"
              label="ETA Update Broadcast"
              detail="Updated location data for active transit packages and notified recipients."
              time="5m ago"
            />
            <AlertItem
              type="alert"
              label="Road Block Avoided"
              detail="Detected surprise local closure. Bypassed block and recalculated routes to save 22 minutes."
              time="12m ago"
            />
          </div>

          <button
            className="w-full mt-6 py-4 bg-slate-50 text-slate-600 hover:text-slate-900 rounded-[20px] text-[10px] font-bold uppercase tracking-wider transition-all border border-slate-200 cursor-pointer shadow-sm"
            onClick={() => setShowAuditModal(true)}
          >
            System Audit Logs
          </button>
        </div>
      </div>

      {/* Dynamic Audit Trail Modal inside the Historical Sync view */}
      <AnimatePresence>
        {showAuditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-[24px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-left"
            >
              <div className="p-6 md:p-8 border-b border-secondary-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-[17px] font-bold text-slate-900 uppercase tracking-tight">
                    SYSTEM AUDIT LOGS
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 font-sans">
                    Automated route updates and delivery logs
                  </p>
                </div>
                <button
                  onClick={() => setShowAuditModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl border border-slate-200 hover:bg-slate-200 text-[10px] uppercase font-bold tracking-wider text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto space-y-4 flex-1 bg-slate-50">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between mb-2">
                  <span>Authorized Actions</span>
                  <span className="text-emerald-600 font-bold">System State: Active</span>
                </div>

                <div className="space-y-3 font-mono text-[11px]">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-amber-600 font-bold uppercase tracking-wider">
                        [ROUTE_OPTIMIZATION]
                      </span>
                      <span className="text-slate-400">
                        Just now
                      </span>
                    </div>
                    <p className="text-slate-600">
                      Route optimization successfully recalculated for Salamanca sector. Resolved 15-minute traffic delay.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-indigo-600 font-bold uppercase tracking-wider">
                        [COST_SAVED]
                      </span>
                      <span className="text-slate-400">
                        10m ago
                      </span>
                    </div>
                    <p className="text-slate-600">
                      Completed route adjustment: €420 in transit costs saved by re-sequencing delivery sequence.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-150 flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Secure System Audit Ledger</span>
                <span>Page 1 of 1</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

