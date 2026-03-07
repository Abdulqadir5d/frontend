"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { aiApi, notificationApi } from "@/api/clinic";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const roleNav: Record<string, { label: string; href: string; icon: string }[]> = {
  admin: [
    { label: "Dashboard Overview", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { label: "Staff Registry", href: "/dashboard/users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { label: "Clinical Records", href: "/dashboard/patients", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { label: "Consultation Queue", href: "/dashboard/appointments", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { label: "Laboratory Center", href: "/dashboard/labs", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { label: "AI Intelligence", href: "/dashboard/ai", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
    { label: "Systems Analytics", href: "/dashboard/analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  ],
  doctor: [
    { label: "Dashboard Overview", href: "/dashboard", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
    { label: "Clinical Records", href: "/dashboard/patients", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { label: "Consultation Queue", href: "/dashboard/appointments", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Pharmacy Directives", href: "/dashboard/prescriptions", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    { label: "Laboratory Center", href: "/dashboard/labs", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { label: "AI Intelligence", href: "/dashboard/ai", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  ],
  nurse: [
    { label: "Dashboard Overview", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { label: "Clinical Records", href: "/dashboard/patients", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { label: "Vitals Monitor", href: "/dashboard/vitals", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
    { label: "Consultation Queue", href: "/dashboard/appointments", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Laboratory Center", href: "/dashboard/labs", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  ],
  pharmacist: [
    { label: "Dashboard Overview", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { label: "Pharmacy Hub", href: "/dashboard/pharmacy", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.673.337a4 4 0 01-2.586.346l-2.387-.477a2 2 0 00-1.022.547l-4 4a2 2 0 102.828 2.828l3.414-3.414a2 2 0 00.511-.274l2.387.477a6 6 0 003.86-.517l.673-.337a4 4 0 012.586-.346l2.387.477a2 2 0 001.022-.547l4-4a2 2 0 10-2.828-2.828l-3.414 3.414z" },
    { label: "Clinical Records", href: "/dashboard/patients", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { label: "Consultation Queue", href: "/dashboard/appointments", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  ],
  lab_technician: [
    { label: "Dashboard Overview", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { label: "Laboratory Center", href: "/dashboard/labs", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { label: "Consultation Queue", href: "/dashboard/appointments", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Clinical Records", href: "/dashboard/patients", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
  ],
  receptionist: [
    { label: "Dashboard Overview", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { label: "Consultation Queue", href: "/dashboard/appointments", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { label: "Clinical Records", href: "/dashboard/patients", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    // { label: "Financial Records", href: "/dashboard/labs", icon: "M9 17v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v8m-6 0a2 2 0 002 2h2a2 2 0 002-2" },
  ],
  patient: [
    { label: "My Health Hub", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { label: "My Appointments", href: "/dashboard/appointments", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { label: "Medical History", href: "/dashboard/history", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { label: "My Prescriptions", href: "/dashboard/prescriptions", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiChat, setAiChat] = useState<{ role: "user" | "ai"; content: string }[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const assistantRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close overlays on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assistantRef.current && !assistantRef.current.contains(event.target as Node)) {
        setIsAssistantOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    const userMsg = aiQuery;
    setAiQuery("");
    setAiChat(prev => [...prev, { role: "user", content: userMsg }]);
    setIsAiLoading(true);

    try {
      const response = await aiApi.generalChat(userMsg);
      const aiMsg = response.response || "I've analyzed your query and suggest cross-referencing with clinical records.";
      setAiChat(prev => [...prev, { role: "ai", content: aiMsg }]);
    } catch (error) {
      setAiChat(prev => [...prev, { role: "ai", content: "I'm having trouble connecting to the medical intelligence core. Please try again." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const queryClient = useQueryClient();

  // Fetch Notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationApi.list,
    refetchInterval: 10000, // Refetch every 10s
  });

  const markReadMutation = useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  const nav = roleNav[user.role] || roleNav.patient || [];

  return (
    <div className="flex h-screen overflow-hidden bg-white selection:bg-emerald-100 selection:text-emerald-900">
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar (Desktop persistent, Mobile drawer) */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#2E7D32] text-white shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 ${isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:w-20"}`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center justify-between border-b border-emerald-700/50 px-6">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-900/20 border border-emerald-400/30">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              {(isSidebarOpen || !isSidebarOpen) && <span className={`text-xl font-black tracking-tight uppercase ${!isSidebarOpen && 'lg:hidden'}`}>Shifa<span className="text-emerald-300 italic">AI</span></span>}
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="text-emerald-100 hover:text-white lg:hidden">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-6">
            {nav.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
                  className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${isActive
                    ? "bg-[#A5D6A7] text-[#1B5E20] shadow-sm"
                    : "text-emerald-50 hover:bg-emerald-700/40"
                    }`}
                >
                  <svg className={`h-5 w-5 flex-shrink-0 transition-colors ${isActive ? "text-[#1B5E20]" : "text-emerald-200 group-hover:text-white"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span className={!isSidebarOpen ? "lg:hidden" : ""}>{item.label}</span>
                  {isActive && <div className="absolute right-2 h-1.5 w-1.5 rounded-full bg-[#1B5E20]" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer User Profile */}
          <div className="border-t border-emerald-700/50 p-4">
            <div className={`flex items-center ${isSidebarOpen ? "gap-4" : "lg:justify-center"} rounded-xl bg-black/10 p-3`}>
              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-emerald-100/20">
                <div className="flex h-full w-full items-center justify-center text-emerald-100 font-bold">
                  {user.name.charAt(0)}
                </div>
              </div>
              <div className={`flex-1 overflow-hidden ${!isSidebarOpen && 'lg:hidden'}`}>
                <p className="truncate text-sm font-bold leading-tight">{user.name}</p>
                <p className="truncate text-[11px] font-medium uppercase tracking-wider text-emerald-200/80">{user.role}</p>
              </div>
            </div>
            <button
              onClick={() => logout().then(() => router.push("/login"))}
              className={`mt-3 flex w-full items-center ${isSidebarOpen ? "px-4" : "lg:justify-center"} py-2.5 text-sm font-semibold text-emerald-100 hover:text-white hover:bg-white/10 rounded-xl transition-all`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className={!isSidebarOpen ? "lg:hidden" : "ml-3"}>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-hidden bg-[#F1F8F4]">
        {/* Top Header */}
        <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-8 shadow-sm z-10">
          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-400 hover:text-emerald-600 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="relative w-64 xl:w-96 hidden md:block">
              <span className="absolute inset-y-0 left-4 flex items-center text-gray-300 pointer-events-none group-focus-within:text-emerald-500 transition-colors">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Query clinical databases..."
                className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 py-3 pl-12 pr-4 text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all font-medium placeholder:text-gray-400"
              />
            </div>
            {/* Mobile Title */}
            <h2 className="md:hidden text-lg font-black tracking-tight text-gray-900">Shifa<span className="text-emerald-600">AI</span></h2>
          </div>

          <div className="flex items-center gap-2 md:gap-5 relative">
            <div ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all border shadow-sm ${isNotificationsOpen ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-50 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 border-gray-100'}`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-red-500 ring-4 ring-white"></span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 rounded-3xl bg-white shadow-2xl shadow-black/10 border border-gray-100 py-4 z-50 animate-fadeIn">
                  <div className="px-6 pb-3 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Notifications</h3>
                    <button
                      onClick={() => markAllReadMutation.mutate()}
                      className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((n: any) => (
                        <div
                          key={n._id}
                          onClick={() => markReadMutation.mutate(n._id)}
                          className="px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer group"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!n.isRead ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                            <div>
                              <p className={`text-sm leading-tight ${!n.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-500'}`}>{n.title}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-6 py-10 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">No Alerts</div>
                    )}
                  </div>
                  <div className="px-6 pt-3 text-center">
                    <Link href="/dashboard/notifications" className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 hover:text-emerald-700">View All Alerts</Link>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setIsAssistantOpen(true);
                if (aiChat.length === 0) {
                  setAiChat([{ role: "ai", content: `Welcome, ${user.name}. I am the ShifaAI Core. How can I assist with clinical procedures today?` }]);
                }
              }}
              className="btn-primary group h-11 px-6 shadow-xl shadow-emerald-600/10 border-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md">
                  <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Ask Assistant</span>
              </div>
            </button>
          </div>
        </header>

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto page-transition overflow-x-hidden">
          {children}
        </div>

        {/* AI Assistant Slide-over */}
        <div
          className={`fixed inset-y-0 right-0 w-96 bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-50 transform transition-transform duration-500 ease-out border-l border-emerald-50 ${isAssistantOpen ? 'translate-x-0' : 'translate-x-full'}`}
          ref={assistantRef}
        >
          <div className="flex h-full flex-col">
            <div className="bg-emerald-600 p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 animate-shimmer opacity-10 pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight uppercase">ShifaAI</h3>
                    <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest">Medical Intelligence Core</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAssistantOpen(false)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30">
              {aiChat.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none shadow-emerald-600/10'
                    : 'bg-white text-gray-800 border border-emerald-50 rounded-tl-none font-medium'
                    }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-emerald-50 p-5 rounded-3xl rounded-tl-none shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce" />
                      <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-gray-100 bg-white">
              <form onSubmit={handleAskAi} className="relative">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Inquire about clinical data..."
                  className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-4 pl-5 pr-14 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={isAiLoading}
                  className="absolute right-2 top-2 h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 disabled:opacity-50 hover:bg-emerald-700 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </form>
              <p className="mt-4 text-[10px] text-center font-black text-gray-400 uppercase tracking-widest">Endorsed Medical Intelligence V2.4</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

