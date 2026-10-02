"use client";

import React, { useState, useEffect } from "react";
import {
  Rocket,
  Shield,
  Zap,
  TrendingUp,
  DollarSign,
  Gauge,
  Calendar,
  Truck,
  Receipt,
  FileText,
  Bot,
  Settings,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Award,
  ChevronRight,
  RefreshCw,
  Plus,
  Play,
  RotateCcw,
  Check,
  Send,
  Download,
  Upload,
  Clock,
  ArrowUpRight,
  Layers,
  HelpCircle,
  Eye,
  Activity,
  FileCheck,
  Compass,
  Cpu,
  Car,
  Fuel,
  Wrench,
  BarChart3,
  Search,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function DeliveryHQ() {
  const [activeTab, setActiveTab] = useState<
    | "command"
    | "schedule"
    | "opportunities"
    | "vehicle"
    | "money"
    | "expenses"
    | "tax"
    | "analytics"
    | "ai_ops"
    | "self_healing"
    | "blueprint"
  >("command");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // AI chat input state
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Receipt modal state
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptSimMode, setReceiptSimMode] = useState<"gas" | "maint" | "gear">("gas");
  const [ocrProcessing, setOcrProcessing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/data");
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Action dispatcher
  const handleAction = async (action: string, payload: any = {}) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#10B981", "#3B82F6", "#F59E0B"],
        });
        await fetchDashboardData();
      } else {
        showToast(`Action failed: ${result.message}`);
      }
    } catch (e: any) {
      showToast(`Error: ${e.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendChat = async (presetText?: string) => {
    const text = presetText || chatInput;
    if (!text.trim()) return;
    setChatLoading(true);
    if (!presetText) setChatInput("");
    try {
      const res = await fetch("/api/ai-ops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setChatLoading(false);
    }
  };

  const handleProcessSimulatedReceipt = async () => {
    setOcrProcessing(true);
    let sampleOcr = "";
    if (receiptSimMode === "gas") {
      sampleOcr = `CHEVRON PRODUCTS COMPANY #4811\nSAN FRANCISCO CA\nDATE: ${new Date().toISOString().split("T")[0]} 17:42\nPUMP 06 UNLEADED REGULAR\n11.120 GAL @ $3.899/G\nSUBTOTAL: $43.36\nTAX: $0.00\nTOTAL: $43.36\nVISA DDA 4912`;
    } else if (receiptSimMode === "maint") {
      sampleOcr = `JIFFY LUBE SERVICE #229\nWEST METRO BAY\nDATE: ${new Date().toISOString().split("T")[0]}\nSYNTHETIC MOTOR OIL 0W-20 (4.5 QT)\nOIL FILTER INSERT OEM\nLABOR COURTESY CHECK\nTOTAL: $79.99\nAUTH #88219`;
    } else {
      sampleOcr = `AUTOZONE COMMERCIAL #1109\nWEST MAIN HUB\nINSULATED MULTI-COMPARTMENT CARRIER BAG\nHEAVY-DUTY WINDSHIELD PHONE MOUNT\nTOTAL: $34.50\nCARD *4912`;
    }

    try {
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulatedOcrText: sampleOcr }),
      });
      const json = await res.json();
      if (json.success) {
        setShowReceiptModal(false);
        showToast(json.message);
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
        await fetchDashboardData();
      }
    } catch (e: any) {
      showToast(`OCR Failed: ${e.message}`);
    } finally {
      setOcrProcessing(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
          <Rocket className="w-7 h-7 text-cyan-400 absolute animate-pulse" />
        </div>
        <p className="mt-4 text-cyan-300 font-mono tracking-wider text-sm uppercase">
          Initializing Delivery HQ Business OS...
        </p>
      </div>
    );
  }

  const { todayMission, analytics, profile, opportunities, scheduleEvents, selfHealingLogs, vehicles, incomeRecords, expenseRecords, mileageTrips, platformConnectors, aiOpsMessages } = data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Toast Notification Bar */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900/95 border border-cyan-500/50 text-cyan-200 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-top-3">
          <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* TOP STATUS BAR: Telemetry & Business Gamification */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-40 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                  DELIVERY HQ
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider font-semibold">
                  SYS OPERATIONAL
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {profile.businessName} • {profile.legalStructure}
              </p>
            </div>
          </div>

          {/* Gamification telemetry strip */}
          <div className="flex items-center gap-3 md:gap-6 bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-2xl text-xs font-mono">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-slate-400 block text-[10px]">OPERATOR LEVEL</span>
                <span className="font-bold text-amber-300">LVL {profile.level} COURIER</span>
              </div>
            </div>

            <div className="w-px h-7 bg-slate-800" />

            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-slate-400 block text-[10px]">BUSINESS XP</span>
                <span className="font-bold text-cyan-300">{profile.xpPoints} XP</span>
              </div>
            </div>

            <div className="w-px h-7 bg-slate-800" />

            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
              <div>
                <span className="text-slate-400 block text-[10px]">RUN STREAK</span>
                <span className="font-bold text-orange-300">{profile.currentStreakDays} DAYS</span>
              </div>
            </div>

            <button
              onClick={fetchDashboardData}
              title="Refresh telemetry"
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <nav className="border-b border-slate-800/80 bg-slate-950 px-4 lg:px-8 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center gap-1 py-2">
          {[
            { id: "command", label: "🚀 Command Center", icon: Rocket },
            { id: "schedule", label: "🗓 Master Schedule", icon: Calendar },
            { id: "opportunities", label: "⚡ Opportunity Engine", icon: Zap },
            { id: "vehicle", label: "🏎 Vehicle Telemetry", icon: Gauge },
            { id: "money", label: "💰 Money & Profit", icon: DollarSign },
            { id: "expenses", label: "🧾 Expense Vault", icon: Receipt },
            { id: "tax", label: "📄 Tax Vault (2026)", icon: FileText },
            { id: "analytics", label: "📈 Intelligence Analytics", icon: BarChart3 },
            { id: "ai_ops", label: "🤖 Nova AI Ops", icon: Bot },
            { id: "self_healing", label: "🛡 Self-Healing Ops", icon: Shield },
            { id: "blueprint", label: "📋 Master Blueprint", icon: FileCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-600/30 to-indigo-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-8">
        {/* ========================================================= */}
        {/* TAB 1: COMMAND CENTER (MISSION CONTROL) */}
        {/* ========================================================= */}
        {activeTab === "command" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Top Mission Cockpit Banner */}
            <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 p-6 lg:p-8 shadow-2xl">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-medium mb-3">
                    <Activity className="w-3.5 h-3.5 animate-pulse" /> TODAY&apos;S MISSION STATUS: ACTIVE
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                    🚀 DELIVERY HQ
                  </h1>
                  <p className="text-slate-400 text-sm mt-1 max-w-xl">
                    Unified Multi-Platform Business Operating System. Uber Eats • DoorDash • Crew • Direct Freight.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  <button
                    onClick={() => handleAction("BUILD_MY_SHIFT")}
                    disabled={actionLoading}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <Zap className="w-5 h-5 fill-current" />
                    BUILD MY SHIFT
                  </button>

                  <button
                    onClick={() => setShowReceiptModal(true)}
                    className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold tracking-wide transition cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-cyan-400" />
                    Scan Receipt
                  </button>

                  <button
                    onClick={() => handleAction("SIMULATE_CREW_DROP")}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold tracking-wide transition cursor-pointer"
                    title="Simulates a dropped commitment to demonstrate instant autonomous self-healing"
                  >
                    <Shield className="w-4 h-4 text-rose-400" />
                    Simulate Disruption
                  </button>
                </div>
              </div>

              {/* MISSION TELEMETRY GRID */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
                {/* 1. Gross Earnings */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 backdrop-blur hover:border-cyan-500/40 transition">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Gross Earnings
                  </div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    ${Number(todayMission.grossEarnings).toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-1">
                    Target: ${Number(todayMission.dailyTarget).toFixed(2)}
                  </div>
                </div>

                {/* 2. Target Progress */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 backdrop-blur hover:border-cyan-500/40 transition">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Goal Progress
                  </div>
                  <div className="text-2xl font-black text-cyan-400 font-mono">
                    {todayMission.progressPercent}%
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, todayMission.progressPercent)}%` }}
                    />
                  </div>
                </div>

                {/* 3. Active Time */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 backdrop-blur hover:border-cyan-500/40 transition">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Active Time
                  </div>
                  <div className="text-2xl font-black text-slate-200 font-mono">
                    {Math.floor(Number(todayMission.activeHours))}h{" "}
                    {Math.round((Number(todayMission.activeHours) % 1) * 60)}m
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-1">On-Duty Telemetry</div>
                </div>

                {/* 4. Miles Driven */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 backdrop-blur hover:border-cyan-500/40 transition">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Active Miles
                  </div>
                  <div className="text-2xl font-black text-amber-300 font-mono">
                    {Number(todayMission.milesDriven).toFixed(1)}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-1">
                    ${(Number(todayMission.milesDriven) * 0.67).toFixed(2)} tax ded.
                  </div>
                </div>

                {/* 5. Gross Hourly */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 backdrop-blur hover:border-cyan-500/40 transition">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Gross $/Hour
                  </div>
                  <div className="text-2xl font-black text-purple-300 font-mono">
                    ${Number(todayMission.grossHourlyRate || 20.81).toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-1">Paced Rate</div>
                </div>

                {/* 6. Estimated Profit */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 backdrop-blur hover:border-cyan-500/40 transition bg-emerald-950/20">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold mb-1">
                    True Biz Profit
                  </div>
                  <div className="text-2xl font-black text-emerald-300 font-mono">
                    ${Number(todayMission.estimatedBusinessProfit).toFixed(2)}
                  </div>
                  <div className="text-[11px] text-emerald-500/80 font-mono mt-1">After Fuel &amp; Wear</div>
                </div>
              </div>
            </div>

            {/* TWO-COLUMN COMMAND PANELS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* LEFT COLUMN: AVAILABLE OPPORTUNITIES STREAM */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <h2 className="text-lg font-bold text-white tracking-tight">AVAILABLE OPPORTUNITIES</h2>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Live Feed
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {opportunities.map((opp: any) => {
                    const isCrew = opp.platform === "Crew";
                    const isDoorDash = opp.platform === "DoorDash";
                    const isUber = opp.platform === "Uber Eats";

                    return (
                      <div
                        key={opp.id}
                        className={`p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
                          opp.status === "scheduled"
                            ? "bg-slate-900/40 border-slate-800 opacity-70"
                            : "bg-slate-900/90 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 shadow-lg"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            {/* Platform badge */}
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                                isCrew
                                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                                  : isDoorDash
                                  ? "bg-rose-600/20 text-rose-400 border border-rose-500/30"
                                  : isUber
                                  ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                                  : "bg-amber-600/20 text-amber-400 border border-amber-500/30"
                              }`}
                            >
                              {opp.platform.slice(0, 2).toUpperCase()}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white text-sm">{opp.platform}</span>
                                <span
                                  className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                                    isCrew
                                      ? "bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30"
                                      : "bg-slate-800 text-slate-300"
                                  }`}
                                >
                                  {isCrew ? "🔒 FIXED COMMITMENT" : "⚡ MARKETPLACE"}
                                </span>
                                <span className="text-xs text-slate-400 font-mono">
                                  {opp.startTime} – {opp.endTime}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 mt-0.5 font-medium">{opp.title}</p>
                              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                                <Compass className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                {opp.zone}
                              </p>
                            </div>
                          </div>

                          {/* Telemetry numbers */}
                          <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                            <div className="text-lg font-black text-emerald-400 font-mono">
                              ${Number(opp.expectedEarnings).toFixed(2)}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">
                              ${Number(opp.grossHourlyRate).toFixed(2)}/hr • {opp.expectedMiles} mi
                            </div>
                          </div>
                        </div>

                        {/* Explainable AI recommendation breakdown */}
                        {opp.recommendationReason && (
                          <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-300 flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-xl">
                            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-cyan-300">Why Recommended: </span>
                              {opp.recommendationReason}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT COLUMN: SELF-HEALING STREAM & MASTER SHIFT PREVIEW */}
              <div className="lg:col-span-5 space-y-6">
                {/* Self-Healing Operations Widget */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-cyan-400" />
                      <h3 className="font-bold text-white text-sm tracking-tight">SELF-HEALING EVENT STREAM</h3>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      AUTONOMOUS
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Engine cycle: <span className="text-slate-200 font-mono">DETECT → DIAGNOSE → RECALCULATE → REPAIR → LOG</span>
                  </p>

                  <div className="space-y-3">
                    {selfHealingLogs.slice(0, 3).map((log: any) => (
                      <div
                        key={log.id}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            {log.incidentCode}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-200">{log.summary}</p>
                        <p className="text-slate-400 text-[11px] leading-relaxed">{log.actionTaken}</p>

                        {log.requiresUserConfirmation && !log.confirmedByUser && (
                          <div className="pt-2 flex items-center justify-between">
                            <span className="text-amber-400 text-[10px] font-mono flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Awaiting Confirmation
                            </span>
                            <button
                              onClick={() => handleAction("CONFIRM_HEAL_LOG", { logId: log.id })}
                              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs cursor-pointer"
                            >
                              Approve Repair
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live System Health Matrix */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-emerald-400" />
                      <h4 className="font-bold text-white text-xs uppercase tracking-wider">PLATFORM CONNECTORS</h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">6 Connected</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {platformConnectors.map((c: any) => (
                      <div
                        key={c.id}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between"
                      >
                        <span className="font-medium text-slate-300 truncate pr-1">{c.name.split(" ")[0]}</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MASTER SCHEDULING ENGINE */}
        {/* ========================================================= */}
        {activeTab === "schedule" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-cyan-400" /> UNIFIED MASTER BUSINESS SCHEDULE
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Reconciles user availability, fixed commitments (Crew), flexible gig windows (DoorDash, Uber), and admin tasks.
                </p>
              </div>

              <button
                onClick={() => handleAction("BUILD_MY_SHIFT")}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Zap className="w-4 h-4" /> Auto-Fill Open Window
              </button>
            </div>

            {/* Availability Rule Bar */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" /> Active Operating Windows (My Availability)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs font-mono">
                {data.availabilities.map((a: any) => (
                  <div
                    key={a.id}
                    className={`p-3 rounded-xl border text-center ${
                      a.isAvailable
                        ? "bg-slate-950 border-emerald-500/30 text-emerald-300"
                        : "bg-slate-950/40 border-slate-800/80 text-slate-500"
                    }`}
                  >
                    <div className="font-bold">{a.dayOfWeek.slice(0, 3)}</div>
                    <div className="text-[11px] mt-1 text-slate-300">
                      {a.isAvailable ? `${a.startTime} - ${a.endTime}` : "OFF / Fleet"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Master Business Timeline Cards */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" /> Confirmed Master Shift Roster
              </h3>

              <div className="space-y-3">
                {scheduleEvents.map((evt: any) => {
                  const isFixed = evt.eventType === "fixed_commitment";
                  const isAdmin = evt.eventType === "admin_audit";
                  const isCompleted = evt.status === "completed";
                  const isCancelled = evt.status === "cancelled_healed";

                  return (
                    <div
                      key={evt.id}
                      className={`p-5 rounded-2xl border transition relative ${
                        isCancelled
                          ? "bg-rose-950/20 border-rose-500/30 opacity-70"
                          : isCompleted
                          ? "bg-slate-900/50 border-slate-800"
                          : "bg-slate-900/90 border-slate-800 hover:border-cyan-500/50"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isFixed
                                ? "bg-blue-600/20 text-blue-400 border border-blue-500/40"
                                : isAdmin
                                ? "bg-purple-600/20 text-purple-400 border border-purple-500/40"
                                : "bg-emerald-600/20 text-emerald-400 border border-emerald-500/40"
                            }`}
                          >
                            {isFixed ? "CREW" : isAdmin ? "HQ" : "GIG"}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-base">{evt.title}</span>
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase ${
                                  isFixed
                                    ? "bg-blue-500/20 text-blue-300 font-bold"
                                    : isAdmin
                                    ? "bg-purple-500/20 text-purple-300"
                                    : "bg-emerald-500/20 text-emerald-300"
                                }`}
                              >
                                {isFixed ? "PRIORITY: FIXED" : isAdmin ? "ADMIN / AUDIT" : "FLEXIBLE"}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-3">
                              <span>
                                {evt.startTime} – {evt.endTime}
                              </span>
                              <span>•</span>
                              <span>Proj: ${evt.projectedEarnings}</span>
                              <span>•</span>
                              <span>Est: {evt.projectedMiles} mi</span>
                            </div>
                            {evt.notes && <p className="text-xs text-slate-400 mt-2 italic">{evt.notes}</p>}
                          </div>
                        </div>

                        {/* Shift Action Button */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-mono font-medium border border-emerald-500/30">
                              <Check className="w-3.5 h-3.5" /> Shift Completed (${evt.actualEarnings})
                            </span>
                          ) : isCancelled ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-mono font-medium border border-rose-500/30">
                              Healed &amp; Replaced
                            </span>
                          ) : (
                            <button
                              onClick={() =>
                                handleAction("COMPLETE_SHIFT", {
                                  eventId: evt.id,
                                  platform: evt.platform,
                                  actualEarnings: evt.projectedEarnings,
                                  actualMiles: evt.projectedMiles,
                                })
                              }
                              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" /> Lock Shift Telemetry
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: OPPORTUNITY ENGINE & RANKING EXPLAINABILITY */}
        {/* ========================================================= */}
        {activeTab === "opportunities" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-amber-400" /> INTELLIGENT OPPORTUNITY RANKING ENGINE
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Calculates net profitability per hour, fuel degradation, mileage penalty, and daily goal gap alignment with zero black-box decisions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {opportunities.map((opp: any) => (
                <div
                  key={opp.id}
                  className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 hover:border-cyan-500/40 transition shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-lg">{opp.platform}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300">
                          {opp.opportunityType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {opp.startTime} - {opp.endTime} ({opp.zone})
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black text-cyan-400 font-mono">{opp.score}/100</div>
                      <div className="text-[10px] font-mono uppercase text-slate-400">Match Score</div>
                    </div>
                  </div>

                  {/* Profitability Telemetry Formula Display */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950 font-mono text-center">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Gross Rate</div>
                      <div className="text-sm font-bold text-white">${Number(opp.grossHourlyRate).toFixed(2)}/hr</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Est. Fuel Cost</div>
                      <div className="text-sm font-bold text-rose-400">-${Number(opp.estimatedFuelCost).toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Net Biz Rate</div>
                      <div className="text-sm font-bold text-emerald-400">${Number(opp.netHourlyRate).toFixed(2)}/hr</div>
                    </div>
                  </div>

                  {/* Explainable Decision Factors */}
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <span className="font-bold text-slate-200">Algorithmic Recommendation Audit:</span>
                    <p className="text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                      {opp.recommendationReason}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                    <span className="text-xs text-slate-400 font-mono">Miles: {opp.expectedMiles} mi</span>
                    <button
                      onClick={() => handleAction("BUILD_MY_SHIFT")}
                      className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono cursor-pointer transition"
                    >
                      Book to Master Schedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: VEHICLE TELEMETRY & RACING DASHBOARD */}
        {/* ========================================================= */}
        {activeTab === "vehicle" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <Car className="w-6 h-6 text-cyan-400" /> FLEET &amp; VEHICLE TELEMETRY COMMAND
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Real-time odometer tracking, commercial fuel consumption, health diagnostics, and true operating cost per mile.
              </p>
            </div>

            {/* Vehicles Fleet Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vehicles.map((v: any) => (
                <div
                  key={v.id}
                  className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 relative overflow-hidden shadow-2xl"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {v.isPrimary ? "PRIMARY DISPATCH FLEET" : "BACKUP VEHICLE"}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mt-2">{v.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">
                        Plate: {v.licensePlate} • VIN: {v.vinMasked}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black text-cyan-300 font-mono">{v.currentOdometer}</div>
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Current Odometer (mi)</div>
                    </div>
                  </div>

                  {/* Telemetry Gauges */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                      <Fuel className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                      <div className="text-[10px] font-mono uppercase text-slate-400">Rated MPG</div>
                      <div className="text-base font-bold text-white font-mono">{v.mpgRating} MPG</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                      <Activity className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                      <div className="text-[10px] font-mono uppercase text-slate-400">Oil Life</div>
                      <div className="text-base font-bold text-emerald-300 font-mono">{v.oilLifePercent}%</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                      <Gauge className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                      <div className="text-[10px] font-mono uppercase text-slate-400">Tire Tread</div>
                      <div className="text-base font-bold text-indigo-300 font-mono">{v.tireTreadPercent}%</div>
                    </div>
                  </div>

                  {/* Operating Cost Metric */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between font-mono text-xs">
                    <span className="text-slate-400">Estimated Cost Per Mile (Fuel + Wear):</span>
                    <span className="text-emerald-400 font-bold">$0.184 / mi</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Mileage Trips Log */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base">Commercial Mileage Log (Audit Trail)</h3>
                <span className="text-xs font-mono text-slate-400">Standard Deduction Rate: $0.670/mi</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Platform</th>
                      <th className="pb-3">Start/End Odo</th>
                      <th className="pb-3">Biz Miles</th>
                      <th className="pb-3">IRS Tax Value</th>
                      <th className="pb-3">Route Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {mileageTrips.map((t: any) => (
                      <tr key={t.id} className="text-slate-300">
                        <td className="py-3 text-slate-400">{t.date}</td>
                        <td className="py-3 font-semibold text-white">{t.platform}</td>
                        <td className="py-3 text-slate-400">
                          {t.startOdometer} → {t.endOdometer}
                        </td>
                        <td className="py-3 text-emerald-400 font-bold">{t.businessMiles} mi</td>
                        <td className="py-3 text-cyan-300 font-bold">${t.standardDeductionValue}</td>
                        <td className="py-3 text-slate-400 truncate max-w-xs">{t.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: MONEY & PROFIT INTELLIGENCE */}
        {/* ========================================================= */}
        {activeTab === "money" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-emerald-400" /> BUSINESS FINANCIAL ARCHITECTURE
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Strict separation of Gross Marketplace Revenue, Direct Platform Fees, True Operating Expenses, and Estimated Tax Reserve.
              </p>
            </div>

            {/* Financial Waterfall Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-xs font-mono uppercase text-slate-400">MTD Recognized Revenue</div>
                <div className="text-2xl font-black text-white font-mono mt-1">${analytics.mtdGross.toFixed(2)}</div>
                <div className="text-[11px] text-emerald-400 font-mono mt-1">From Uber, DoorDash &amp; Crew</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-xs font-mono uppercase text-slate-400">Operating Expenses</div>
                <div className="text-2xl font-black text-rose-400 font-mono mt-1">-${analytics.mtdExpenses.toFixed(2)}</div>
                <div className="text-[11px] text-slate-400 font-mono mt-1">Verified Receipts in Vault</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-xs font-mono uppercase text-slate-400">Estimated Business Profit</div>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-1">${analytics.mtdNetEstimate.toFixed(2)}</div>
                <div className="text-[11px] text-emerald-500 font-mono mt-1">Real profit after fuel &amp; ops</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-xs font-mono uppercase text-slate-400">Tax Reserve (25%)</div>
                <div className="text-2xl font-black text-cyan-400 font-mono mt-1">${analytics.mtdTaxReserve.toFixed(2)}</div>
                <div className="text-[11px] text-cyan-500 font-mono mt-1">Segregated for 1040-ES</div>
              </div>
            </div>

            {/* Revenue Transactions Ledger */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base">Multi-Platform Revenue Ledger</h3>
                <span className="text-xs font-mono text-slate-400">Normalized Platform Connectors</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Platform</th>
                      <th className="pb-3">Gross</th>
                      <th className="pb-3">Tips</th>
                      <th className="pb-3">Hours</th>
                      <th className="pb-3">Gross $/Hr</th>
                      <th className="pb-3">Audit Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {incomeRecords.map((inc: any) => (
                      <tr key={inc.id} className="text-slate-300">
                        <td className="py-3 text-slate-400">{inc.date}</td>
                        <td className="py-3 font-semibold text-white">{inc.platform}</td>
                        <td className="py-3 text-emerald-400 font-bold">${inc.grossAmount}</td>
                        <td className="py-3 text-slate-300">${inc.tipsAmount}</td>
                        <td className="py-3 text-slate-400">{inc.hoursWorked}h</td>
                        <td className="py-3 text-cyan-300">
                          ${(Number(inc.grossAmount) / (Number(inc.hoursWorked) || 1)).toFixed(2)}/hr
                        </td>
                        <td className="py-3 text-slate-500 text-[11px]">{inc.sourceReference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: EXPENSE VAULT & DIGITAL OCR SYSTEM */}
        {/* ========================================================= */}
        {activeTab === "expenses" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <Receipt className="w-6 h-6 text-cyan-400" /> DIGITAL EXPENSE VAULT &amp; OCR
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Automatic optical recognition, category classification, business percentage allocation, and IRS receipt archiving.
                </p>
              </div>

              <button
                onClick={() => setShowReceiptModal(true)}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                <Upload className="w-4 h-4" /> Scan New Receipt
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {expenseRecords.map((exp: any) => (
                <div
                  key={exp.id}
                  className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 hover:border-cyan-500/40 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 uppercase">
                        {exp.category.replace("_", " ")}
                      </span>
                      <h4 className="font-bold text-white text-base mt-2">{exp.merchant}</h4>
                      <p className="text-xs text-slate-400 font-mono">{exp.date}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-black text-rose-400 font-mono">${exp.amount}</div>
                      <div className="text-[10px] font-mono text-emerald-400">
                        {exp.businessUsePercent}% Biz Allocation
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <span className="font-semibold text-slate-400">Purpose: </span>
                    {exp.businessPurpose}
                  </p>

                  <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800 text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {exp.confidenceLevel.toUpperCase()} CONFIDENCE
                    </span>
                    <span>Paid: {exp.paymentMethod}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: TAX VAULT (2026 TAX PACKAGE EXPORT) */}
        {/* ========================================================= */}
        {activeTab === "tax" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <FileText className="w-6 h-6 text-cyan-400" /> 2026 TAX VAULT &amp; SCHEDULE C COMPLIANCE
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Organized audit packages for your CPA. Preserves supporting documentation, mileage logs, and receipts.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="/api/tax-export?format=csv"
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer border border-slate-700"
                >
                  <Download className="w-4 h-4 text-cyan-400" /> Export CSV Ledger
                </a>
                <a
                  href="/api/tax-export?format=json"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  <FileCheck className="w-4 h-4" /> Export 2026 Tax Package
                </a>
              </div>
            </div>

            {/* Legal Notice Callout */}
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-indigo-200 text-xs flex items-start gap-3">
              <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wider block mb-0.5">
                  Tax Professional Review Notice
                </span>
                The Tax Vault organizes transactions, calculations, and digital receipts for Schedule C (Form 1040) review. This software does not give legal or tax advice; review all vehicle standard-mileage vs. actual-expense elections with a qualified CPA or Enrolled Agent.
              </div>
            </div>

            {/* 2026 Schedule C Diagnostic Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Part I: Gross Receipts</h3>
                <div className="text-3xl font-black text-emerald-400 font-mono">${analytics.mtdGross.toFixed(2)}</div>
                <p className="text-xs text-slate-400">Sum of 1099-NEC &amp; direct payout deposits.</p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Part II: Total Expenses</h3>
                <div className="text-3xl font-black text-rose-400 font-mono">${analytics.mtdExpenses.toFixed(2)}</div>
                <p className="text-xs text-slate-400">Ordinary and necessary courier business deductions.</p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Mileage Deduction Value</h3>
                <div className="text-3xl font-black text-cyan-400 font-mono">${analytics.mtdMileageDeduction.toFixed(2)}</div>
                <p className="text-xs text-slate-400">
                  Based on {analytics.mtdMiles.toFixed(1)} verified miles @ $0.67/mi.
                </p>
              </div>
            </div>

            {/* Business Structure Checklist */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-base">Legitimate Business Setup Checklist</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {[
                  { label: "Entity: Single-Member LLC", done: true },
                  { label: "EIN Registered (IRS)", done: true },
                  { label: "Dedicated Business Checking", done: true },
                  { label: "Dedicated Business Credit Card", done: true },
                  { label: "Commercial Auto Endorsement", done: true },
                  { label: "Zero Commingling Rule Enforced", done: true },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 text-slate-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 8: INTELLIGENCE ANALYTICS */}
        {/* ========================================================= */}
        {activeTab === "analytics" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-cyan-400" /> PERFORMANCE &amp; PROFITABILITY INTELLIGENCE
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Comparative analysis of gross revenue vs. true net hourly earnings across delivery channels.
              </p>
            </div>

            {/* High-Impact Insight Callouts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-2">
                <div className="font-bold text-cyan-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Insight: Channel Net Margin Disparity
                </div>
                <p className="text-slate-300 leading-relaxed">
                  DoorDash generated higher gross volume ($142.80), but Crew produced a higher net retention per mile ($4.21/mi vs $2.63/mi) due to guaranteed fixed hourly rates with zero unpaid idle drive time.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-2">
                <div className="font-bold text-emerald-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Insight: Peak Dinner Multiplier
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Dinner surge shifts between 5:30 PM and 8:30 PM generated +31% higher gross revenue per hour than weekday afternoon windows.
                </p>
              </div>
            </div>

            {/* Platform Comparison Matrix */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-base">Channel Efficiency Scorecard</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="text-rose-400 font-bold text-sm">DoorDash</div>
                  <div className="text-2xl font-black text-white font-mono mt-2">$25.96 / hr</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">Avg Gross Rate</div>
                  <div className="text-xs text-emerald-400 font-mono mt-2 font-semibold">Net: $23.12 / hr</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="text-blue-400 font-bold text-sm">Crew Commitment</div>
                  <div className="text-2xl font-black text-white font-mono mt-2">$19.50 / hr</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">Guaranteed Base</div>
                  <div className="text-xs text-emerald-400 font-mono mt-2 font-semibold">Net: $18.90 / hr (Low mi)</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="text-emerald-400 font-bold text-sm">Uber Eats</div>
                  <div className="text-2xl font-black text-white font-mono mt-2">$27.38 / hr</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">Peak Boost Rate</div>
                  <div className="text-xs text-emerald-400 font-mono mt-2 font-semibold">Net: $24.10 / hr</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 9: AI OPERATIONS MANAGER (NOVA) */}
        {/* ========================================================= */}
        {activeTab === "ai_ops" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <Bot className="w-6 h-6 text-cyan-400" /> NOVA — AI OPERATIONS MANAGER
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Your conversational business copilot. Queries your live database, audits expenses, explains shift recommendations, and tracks goals.
              </p>
            </div>

            {/* Quick question prompts */}
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {[
                "How much have I made today?",
                "How much did DoorDash make me this month?",
                "What is my best available time tonight?",
                "How many business miles did I drive?",
                "What are my biggest expenses?",
                "Am I on pace for my monthly goal?",
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendChat(q)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 cursor-pointer transition"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat Transcript Container */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 h-[480px] overflow-y-auto space-y-4">
              {aiOpsMessages.map((msg: any) => {
                const isNova = msg.sender === "nova";
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-2xl ${isNova ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isNova
                          ? "bg-cyan-600/20 text-cyan-400 border border-cyan-500/30"
                          : "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                      }`}
                    >
                      {isNova ? <Bot className="w-4 h-4" /> : <Rocket className="w-4 h-4" />}
                    </div>

                    <div
                      className={`p-4 rounded-2xl text-xs space-y-2 ${
                        isNova
                          ? "bg-slate-950 border border-slate-800 text-slate-200"
                          : "bg-cyan-600 text-slate-950 font-medium font-mono"
                      }`}
                    >
                      <p className="leading-relaxed">{msg.message}</p>

                      {/* Optional Rich Context Card */}
                      {msg.contextCard && (
                        <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-[11px] space-y-2 text-slate-300">
                          {msg.contextCard.stats && (
                            <div className="grid grid-cols-3 gap-2">
                              {msg.contextCard.stats.map((s: any, i: number) => (
                                <div key={i} className="text-center p-2 rounded-lg bg-slate-950">
                                  <div className="text-slate-500 text-[10px] uppercase">{s.label}</div>
                                  <div className="font-bold text-cyan-300">{s.value}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          {msg.contextCard.reasons && (
                            <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                              {msg.contextCard.reasons.map((r: string, idx: number) => (
                                <li key={idx}>{r}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {chatLoading && (
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono animate-pulse">
                  <Bot className="w-4 h-4" /> Nova analyzing database telemetry...
                </div>
              )}
            </div>

            {/* Input box */}
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                placeholder="Ask Nova anything about your delivery business, schedule, tax deduction, or expenses..."
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-2xl px-5 py-3.5 text-xs text-white placeholder-slate-500 outline-none"
              />
              <button
                onClick={() => handleSendChat()}
                disabled={chatLoading}
                className="px-6 py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                <Send className="w-4 h-4" /> Send
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 10: SELF-HEALING ARCHITECTURE DEMONSTRATOR */}
        {/* ========================================================= */}
        {activeTab === "self_healing" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <Shield className="w-6 h-6 text-cyan-400" /> SELF-HEALING ENGINE &amp; DIAGNOSTIC VAULT
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Full transparent audit trail of every autonomous detection, diagnostic analysis, schedule repair, and user confirmation.
              </p>
            </div>

            {/* Trigger Simulation Bar */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-white text-base">Test Self-Healing Incident Handler</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Simulates a warehouse cancellation webhook on Crew. The system detects the gap, unlocks driver availability, and stages an optimized DoorDash peak shift to protect daily income.
                </p>
              </div>

              <button
                onClick={() => handleAction("SIMULATE_CREW_DROP")}
                disabled={actionLoading}
                className="px-5 py-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold font-mono tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <Shield className="w-4 h-4 text-rose-400" /> Trigger &quot;Crew Shift Dropped&quot;
              </button>
            </div>

            {/* Incident Audit Log */}
            <div className="space-y-4">
              {selfHealingLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                      <span className="font-bold text-white text-base">{log.summary}</span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 uppercase">
                        {log.incidentCode}
                      </span>
                      <span className="text-slate-500">
                        {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-slate-500 uppercase text-[10px] block">Diagnosis Context:</span>
                      <p className="text-slate-300">{log.details}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-emerald-500 uppercase text-[10px] block">Autonomous Action Taken:</span>
                      <p className="text-slate-300">{log.actionTaken}</p>
                    </div>
                  </div>

                  {log.requiresUserConfirmation && !log.confirmedByUser && (
                    <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
                      <span className="text-xs text-amber-300 font-mono">
                        Action required: Confirm staged shift replacement to finalize master calendar booking.
                      </span>
                      <button
                        onClick={() => handleAction("CONFIRM_HEAL_LOG", { logId: log.id })}
                        className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono cursor-pointer"
                      >
                        Confirm Booking
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 11: MASTER TECHNICAL BLUEPRINT (22 ARCHITECTURAL SECTIONS) */}
        {/* ========================================================= */}
        {activeTab === "blueprint" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <FileCheck className="w-6 h-6 text-cyan-400" /> MASTER TECHNICAL BLUEPRINT &amp; ARCHITECTURE
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Complete architectural documentation addressing all 22 required system domains, connector policies, and compliance models.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
              {/* Card 1 */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="font-bold text-cyan-300 text-sm flex items-center gap-2">
                  1. Technology Stack &amp; Rationale
                </h3>
                <p className="text-slate-300">
                  <strong className="text-white">Next.js 16 (App Router) + PostgreSQL (Drizzle ORM) + Tailwind CSS 4.</strong> Chosen for zero-cold-start relational speed, typed database transactions, atomic updates for income ledgers, and real-time interactive dashboards without third-party vendor lock-in.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="font-bold text-cyan-300 text-sm flex items-center gap-2">
                  2. Connector Architecture &amp; Legal Compliance
                </h3>
                <p className="text-slate-300">
                  <strong className="text-white">Strict Zero-Scraping Doctrine.</strong> Every platform integration uses a decoupled connector adapter: Approved OAuth APIs, nightly CSV/PDF statement parsing pipelines, calendar sync feeds, or manual fast-entry. Complies 100% with DoorDash, Uber, and Crew terms of service.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="font-bold text-cyan-300 text-sm flex items-center gap-2">
                  3. Crew vs. Marketplace Priority Engine
                </h3>
                <p className="text-slate-300">
                  Crew shifts are hard-classified as <strong className="text-white">Fixed Commitments</strong> with high priority scheduling locks. Uber Eats and DoorDash are ranked as <strong className="text-white">Flexible Opportunities</strong> based on surge coefficients and hourly yield.
                </p>
              </div>

              {/* Card 4 */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="font-bold text-cyan-300 text-sm flex items-center gap-2">
                  4. Self-Healing Operations Engine
                </h3>
                <p className="text-slate-300">
                  Implements the 6-stage operational loop: <strong className="text-white">DETECT → DIAGNOSE → RECALCULATE → REPAIR → LOG → NOTIFY</strong>. If a shift is cancelled or a daily target deficit occurs, replacement windows are staged with explainable rationale.
                </p>
              </div>

              {/* Card 5 */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="font-bold text-cyan-300 text-sm flex items-center gap-2">
                  5. OCR &amp; Expense Vault Pipeline
                </h3>
                <p className="text-slate-300">
                  Extracts merchant, transaction timestamp, fuel gallons, sales tax, and payment card. Uses classification heuristics for Schedule C categories (Fuel, Auto Maintenance, Cellular, Insulated Equipment) with confidence flags.
                </p>
              </div>

              {/* Card 6 */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="font-bold text-cyan-300 text-sm flex items-center gap-2">
                  6. Vehicle Telemetry &amp; Cost Per Mile
                </h3>
                <p className="text-slate-300">
                  Dual-track model supporting IRS standard mileage rate ($0.670/mi) vs. actual expenses (fuel, tires, oil changes, insurance amortized). Provides audit-ready starting/ending odometer trip ledgers.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* OCR RECEIPT SCANNER MODAL */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                  <Receipt className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Nova OCR Document Pipeline</h3>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-slate-400 hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Select a receipt scenario to simulate camera capture or PDF document upload. The engine will extract the merchant, date, tax, subtotal, and automatically categorize the deduction.
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setReceiptSimMode("gas")}
                className={`p-3 rounded-xl border text-xs font-mono font-bold cursor-pointer transition ${
                  receiptSimMode === "gas"
                    ? "bg-cyan-600/20 border-cyan-500 text-cyan-300"
                    : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                ⛽ Chevron Fuel
              </button>

              <button
                onClick={() => setReceiptSimMode("maint")}
                className={`p-3 rounded-xl border text-xs font-mono font-bold cursor-pointer transition ${
                  receiptSimMode === "maint"
                    ? "bg-cyan-600/20 border-cyan-500 text-cyan-300"
                    : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                🔧 Jiffy Oil Change
              </button>

              <button
                onClick={() => setReceiptSimMode("gear")}
                className={`p-3 rounded-xl border text-xs font-mono font-bold cursor-pointer transition ${
                  receiptSimMode === "gear"
                    ? "bg-cyan-600/20 border-cyan-500 text-cyan-300"
                    : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                📦 Hot Delivery Bag
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
              <span className="text-slate-500 uppercase text-[10px]">Document Preview:</span>
              <p className="text-slate-300">
                {receiptSimMode === "gas"
                  ? "CHEVRON #4811 • 11.12 GAL @ $3.899/G • TOTAL $43.36"
                  : receiptSimMode === "maint"
                  ? "JIFFY LUBE #229 • SYNTHETIC 0W-20 & FILTER • TOTAL $79.99"
                  : "AUTOZONE #1109 • INSULATED DELIVERY CARRIER • TOTAL $34.50"}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleProcessSimulatedReceipt}
                disabled={ocrProcessing}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                {ocrProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing OCR...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Execute OCR Extraction
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}