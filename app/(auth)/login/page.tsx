"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Truck,
  Shield,
  Briefcase,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Zap,
  Building2,
  BarChart3,
  KeyRound,
  MapPin,
  Fuel,
  Activity,
  Check,
  ArrowUpRight,
  Compass,
  Radio,
  Clock,
  Layers,
  Award,
  LogOut,
  UserCheck,
  Database,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface DemoRole {
  id: string;
  name: string;
  roleTitle: string;
  email: string;
  pass: string;
  badge: string;
  colorScheme: "indigo" | "amber" | "emerald";
  description: string;
  icon: typeof Shield;
}

const DEMO_ROLES: DemoRole[] = [
  {
    id: "admin",
    name: "Vikramaditya S.",
    roleTitle: "Super Admin",
    email: "admin@rapone.com",
    pass: "Admin@12345",
    badge: "Full Command",
    colorScheme: "indigo",
    description: "Executive P&L, Fleet Master, Rates & Multi-Branch Control",
    icon: Shield,
  },
  {
    id: "ops",
    name: "Amitabh Verma",
    roleTitle: "Operations Mgr",
    email: "ops@rapone.com",
    pass: "Ops@12345",
    badge: "Hub Dispatch",
    colorScheme: "amber",
    description: "Consignment routing, DPD advances & live dispatch radar",
    icon: Briefcase,
  },
  {
    id: "driver",
    name: "Rajesh K. Sharma",
    roleTitle: "Driver Cockpit",
    email: "driver@rapone.com",
    pass: "Driver@12345",
    badge: "Field Ops",
    colorScheme: "emerald",
    description: "Trip GPS route, digital POD upload & diesel slip claims",
    icon: Truck,
  },
];

interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  phone?: string;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("admin@rapone.com");
  const [password, setPassword] = useState("Admin@12345");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("admin");
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUser | null>(null);

  const handleSelectRole = (role: DemoRole, autoSubmit: boolean = false) => {
    setEmail(role.email);
    setPassword(role.pass);
    setSelectedRole(role.id);
    setError(null);

    if (autoSubmit) {
      executeLogin(role.email, role.pass);
    }
  };

  const executeLogin = async (loginEmail: string, loginPass: string) => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Invalid credentials. Please verify your email and password.");
        toast.error(data.error || "Authentication failed");
        setLoading(false);
        return;
      }

      toast.success(`Access Granted: Welcome ${data.user.name}`);
      setAuthenticatedUser(data.user);
      setLoading(false);
    } catch {
      setError("Unable to reach authentication server. Please check your internet connection.");
      toast.error("Network error during login");
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setAuthenticatedUser(null);
    toast.info("Session closed successfully");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeLogin(email, password);
  };

  return (
    <div className="min-h-screen w-full bg-[#050811] text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Tech Grid & Ambient Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute -top-40 -left-32 w-[550px] h-[550px] bg-gradient-to-br from-indigo-600/20 via-blue-600/10 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] bg-gradient-to-bl from-cyan-500/15 via-indigo-600/10 to-transparent rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/10 via-blue-600/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* Top Demo Bar / Navigation */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur opacity-40 group-hover:opacity-75 transition duration-300" />
              <div className="relative h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md">
                <Truck className="h-5 w-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-mono">
                  RAPID<span className="text-cyan-400">TMS</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
                  Enterprise
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                High-Speed Transport & Logistics Management Suite
              </p>
            </div>
          </div>

          {/* Real-time System Indicators */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-slate-300 text-[11px] font-medium">Fleet Radar: 142 Active</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 text-[11px] font-semibold">99.8% On-Time SLA</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Live Client Demo</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Demo Presentation & Live Telemetry Feature Showcase */}
          <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col justify-between space-y-7">
            {/* Header Badge & Title */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 shadow-inner">
                <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                <span className="text-xs font-semibold text-slate-300">
                  Integrated Fleet Telemetry & Accounting Engine
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
                The Modern OS for{" "}
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                  High-Throughput
                </span>{" "}
                Logistics & Fleets.
              </h1>

              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl font-normal">
                Purpose-engineered for commercial transport operations: real-time DPD tracking, driver cash advances, automated diesel ledgers, and instant multi-hub dispatch control.
              </p>
            </div>

            {/* Interactive Live Fleet Telemetry Card (Demo Eye-Catcher) */}
            <div className="relative group overflow-hidden rounded-2xl border border-slate-800/90 bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-xl p-5 shadow-2xl transition-all duration-300 hover:border-indigo-500/40">
              <div className="absolute top-0 right-0 h-28 w-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                    <Compass className="h-4 w-4 animate-spin-slow" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-mono">TRIP #TRP-9042</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        In Transit
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Tata Signa 4825.TK • HR-55-AN-4421</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-emerald-400">₹84,500 Freight Value</span>
                  <p className="text-[10px] text-slate-500">DPD Port Delivery • Container 40FT</p>
                </div>
              </div>

              {/* Progress Line */}
              <div className="py-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-blue-400" /> Delhi Hub (NH-48)
                  </span>
                  <span className="text-cyan-400 font-mono text-[11px]">78% Completed • 842 / 1,240 km</span>
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-400" /> JNPT Port Mumbai
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
                  <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 rounded-full w-[78%] relative">
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full animate-pulse shadow-sm shadow-white" />
                  </div>
                </div>
              </div>

              {/* Telemetry Metrics Bar */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <Activity className="h-3 w-3 text-cyan-400" /> GPS Speed
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">64 km/h</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <Fuel className="h-3 w-3 text-amber-400" /> Diesel Advance
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">₹22,000 Paid</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3 text-emerald-400" /> Est. Arrival
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">Today, 18:30</div>
                </div>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Zap className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white">Dynamic DPD Management</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Direct Port Delivery logs, advance approvals & demurrage shield</p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <BarChart3 className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white">Automated Ledger & P&L</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Real-time driver settlements, fuel slips & net margin calculation</p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Truck className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white">Driver Field Cockpit</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Digital e-POD camera uploads, GPS check-ins & toll receipts</p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white">Role-Based RBAC Security</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Strict isolation between Super Admin, Ops Dispatch & Drivers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance & Trust Badges */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Award className="h-3.5 w-3.5 text-indigo-400" /> Enterprise Demo Platform
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Fastag & Vahan API Ready
              </span>
              <span>•</span>
              <span>256-Bit SSL Encrypted Session</span>
            </div>
          </div>

          {/* Right Column: Demo Station & Login Command Console */}
          <div className="order-1 lg:order-2 lg:col-span-5 w-full max-w-md mx-auto">
            {/* The Glass Console Box */}
            <div className="relative rounded-3xl border border-slate-800/90 bg-slate-900/90 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_30px_rgba(99,102,241,0.15)] p-6 sm:p-7 space-y-6">
              
              {authenticatedUser ? (
                /* Authenticated Station Cockpit Card */
                <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                      </span>
                      <h2 className="text-base font-bold text-white tracking-tight">
                        Station Session Active
                      </h2>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Verified
                    </span>
                  </div>

                  {/* User Profile Card */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                        {authenticatedUser.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-white truncate">
                          {authenticatedUser.name}
                        </h3>
                        <p className="text-xs text-slate-400 truncate">
                          {authenticatedUser.email}
                        </p>
                        <div className="mt-1">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Role: {authenticatedUser.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Privileges Overview */}
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60 flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Database className="h-3.5 w-3.5 text-cyan-400" /> Cloud Database
                      </span>
                      <span className="text-cyan-400 font-mono text-[11px] font-semibold">TiDB Cloud (Tokyo)</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60 flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-2">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Security Clearance
                      </span>
                      <span className="text-emerald-400 font-semibold text-[11px]">Level 4 (Full Access)</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60 flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Truck className="h-3.5 w-3.5 text-indigo-400" /> Fleet Control
                      </span>
                      <span className="text-slate-200 font-semibold text-[11px]">142 Units Online</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <Button
                      type="button"
                      onClick={() => setAuthenticatedUser(null)}
                      className="w-full h-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 rounded-xl transition-all gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Switch Role / Test Another Account</span>
                    </Button>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full py-2 px-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5 text-rose-400" />
                      <span>Sign Out Session</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Login Form State */
                <>
                  {/* Header */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-md">
                          <KeyRound className="h-4 w-4" />
                        </div>
                        <h2 className="text-lg font-bold text-white tracking-tight">
                          Command Center Access
                        </h2>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Live Demo
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Select a pre-configured demo role below for instant 1-click access or enter your credentials.
                    </p>
                  </div>

                  {/* ⚡ One-Click Demo Role Selector */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> Quick Demo Role Switcher
                      </span>
                      <span className="text-[10px] text-slate-500">Auto-fills & ready</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {DEMO_ROLES.map((role) => {
                        const isSelected = selectedRole === role.id;
                        const IconComponent = role.icon;

                        return (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() => handleSelectRole(role, false)}
                            className={`group relative text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "bg-indigo-950/40 border-indigo-500/80 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                                : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                                  role.colorScheme === "indigo"
                                    ? "bg-indigo-500/15 border border-indigo-500/30 text-indigo-400"
                                    : role.colorScheme === "amber"
                                    ? "bg-amber-500/15 border border-amber-500/30 text-amber-400"
                                    : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                                }`}
                              >
                                <IconComponent className="h-4.5 w-4.5" />
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-white">{role.roleTitle}</span>
                                  <span
                                    className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                                      role.colorScheme === "indigo"
                                        ? "bg-indigo-500/20 text-indigo-300"
                                        : role.colorScheme === "amber"
                                        ? "bg-amber-500/20 text-amber-300"
                                        : "bg-emerald-500/20 text-emerald-300"
                                    }`}
                                  >
                                    {role.badge}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                  {role.name} • {role.email}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 pl-2 shrink-0">
                              {isSelected ? (
                                <span className="h-5 w-5 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow">
                                  <Check className="h-3 w-3" />
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500 group-hover:text-slate-300 font-medium">
                                  Select
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Error Alert */}
                  {error && (
                    <Alert
                      variant="destructive"
                      className="py-2.5 px-3 bg-rose-500/10 border-rose-500/30 text-rose-300 text-xs rounded-xl"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Form Controls */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> Workstation Email
                      </Label>
                      <Input
                        type="email"
                        placeholder="admin@rapone.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setSelectedRole("");
                        }}
                        required
                        disabled={loading}
                        className="bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500 h-10 text-xs font-medium rounded-xl transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-slate-400" /> Station Password
                        </Label>
                        <span className="text-[10px] text-indigo-400 hover:text-indigo-300 cursor-pointer">
                          Demo Hash: Active
                        </span>
                      </div>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••••••"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setSelectedRole("");
                          }}
                          required
                          disabled={loading}
                          className="bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500 h-10 text-xs font-medium rounded-xl pr-10 transition-all font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Primary Submit Button */}
                    <div className="space-y-2 pt-1">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-indigo-600/30 rounded-xl transition-all gap-2 cursor-pointer"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Authenticating Session...
                          </>
                        ) : (
                          <>
                            Launch Command Center <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>

                      {/* 1-Click Fast Track Button */}
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          const activeRoleObj =
                            DEMO_ROLES.find((r) => r.id === selectedRole) || DEMO_ROLES[0];
                          handleSelectRole(activeRoleObj, true);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Zap className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Instant 1-Click Demo Login</span>
                      </button>
                    </div>
                  </form>

                  {/* Secure Session Info */}
                  <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Isolated Demo Sandbox • Real-time DB Sync • Zero Installation</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Prominent Footer: Designed by Rapid Web Technologies */}
      <footer className="relative z-20 border-t border-slate-800/90 bg-slate-950/90 backdrop-blur-2xl py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left info */}
          <div className="flex items-center gap-2.5 text-center md:text-left">
            <div className="h-7 w-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <Truck className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white tracking-wide">
                RAPID TMS <span className="text-slate-400 font-normal">| Enterprise Transport & Fleet OS</span>
              </p>
              <p className="text-[10px] text-slate-400">
                Commercial Logistics • DPD Clearance • Driver Advances • Multi-Hub Accounting
              </p>
            </div>
          </div>

          {/* Center Brand Badge: Designed by Rapid Web Technologies */}
          <div className="flex items-center">
            <div className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 hover:border-cyan-400/50 shadow-lg shadow-indigo-950/50 transition-all duration-300">
              <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-semibold text-slate-200">
                Designed by{" "}
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-blue-400">
                  Rapid Web Technologies
                </span>
              </span>
              <Sparkles className="h-3.5 w-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>

          {/* Right copyright & health status */}
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              System Status: 100% Operational
            </span>
            <span>•</span>
            <span>© 2026 Rapid Web Technologies</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#050811] text-white text-xs">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
            <span>Loading Rapid TMS Command Center...</span>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
