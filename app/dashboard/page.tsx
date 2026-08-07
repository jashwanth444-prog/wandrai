'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plane, MapPin, Wallet, Globe2, Heart, Calendar, Bell, Activity as ActivityIcon,
  TrendingUp, TrendingDown, Clock, Star, ArrowRight, Sparkles, Plus, Shield,
  Compass, Settings, Lightbulb, History,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { DESTINATIONS, AI_RECOMMENDATIONS, QUICK_ACTIONS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import type { Trip, Activity } from '@/types';
import Link from 'next/link';

const TRIPS_DATA: Trip[] = [
  {
    id: 't1',
    user_id: 'demo',
    destination_id: 'paris',
    destination_name: 'Paris',
    country: 'France',
    start_date: '2026-08-15',
    end_date: '2026-08-22',
    budget: 2400,
    currency: 'EUR',
    status: 'upcoming',
    travelers: 2,
    cover_image: DESTINATIONS[0].image,
    itinerary: null,
    created_at: '2026-07-01T10:00:00Z',
  },
  {
    id: 't2',
    user_id: 'demo',
    destination_id: 'tokyo',
    destination_name: 'Tokyo',
    country: 'Japan',
    start_date: '2026-10-03',
    end_date: '2026-10-10',
    budget: 3200,
    currency: 'JPY',
    status: 'planning',
    travelers: 1,
    cover_image: DESTINATIONS[1].image,
    itinerary: null,
    created_at: '2026-07-15T14:00:00Z',
  },
  {
    id: 't3',
    user_id: 'demo',
    destination_id: 'bali',
    destination_name: 'Bali',
    country: 'Indonesia',
    start_date: '2026-03-10',
    end_date: '2026-03-17',
    budget: 900,
    currency: 'IDR',
    status: 'completed',
    travelers: 2,
    cover_image: DESTINATIONS[2].image,
    itinerary: null,
    created_at: '2026-02-01T10:00:00Z',
  },
];

const ACTIVITIES: Activity[] = [
  { id: 'a1', type: 'trip_created', title: 'Paris trip created', description: '7-day cultural itinerary for 2 travelers', timestamp: '2 hours ago' },
  { id: 'a2', type: 'destination_saved', title: 'Saved Tokyo', description: 'Added to your favorites list', timestamp: '5 hours ago' },
  { id: 'a3', type: 'safety_checked', title: 'Safety check: Indonesia', description: 'Reviewed safety alerts for Bali', timestamp: '1 day ago' },
  { id: 'a4', type: 'trip_completed', title: 'Bali trip completed', description: 'Marked your Bali trip as completed', timestamp: '3 days ago' },
  { id: 'a5', type: 'review_added', title: 'Reviewed Bali', description: 'Rated Bali 4.7 stars', timestamp: '4 days ago' },
];

const MONTHLY_DATA = [
  { month: 'Jan', trips: 1, spend: 900 },
  { month: 'Feb', trips: 0, spend: 0 },
  { month: 'Mar', trips: 1, spend: 900 },
  { month: 'Apr', trips: 2, spend: 1600 },
  { month: 'May', trips: 1, spend: 1200 },
  { month: 'Jun', trips: 3, spend: 2800 },
  { month: 'Jul', trips: 2, spend: 2400 },
];

const SPENDING_BREAKDOWN = [
  { name: 'Flights', value: 3200, color: '#3b82f6' },
  { name: 'Hotels', value: 2800, color: '#8b5cf6' },
  { name: 'Food', value: 1600, color: '#f59e0b' },
  { name: 'Activities', value: 1200, color: '#10b981' },
  { name: 'Transport', value: 600, color: '#f43f5e' },
];

const NOTIFICATIONS = [
  { id: 'n1', title: 'Trip reminder', message: 'Your Paris trip starts in 22 days', time: '1h ago', unread: true },
  { id: 'n2', title: 'Safety alert', message: 'New weather alert for Japan', time: '3h ago', unread: true },
  { id: 'n3', title: 'Price drop', message: 'Flights to Tokyo dropped 15%', time: '6h ago', unread: false },
];

const COUNTRIES_VISITED = ['France', 'Japan', 'Indonesia', 'UAE', 'Italy', 'Spain'];

const STATUS_COLORS: Record<string, string> = {
  upcoming: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  planning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

const ACTIVITY_ICONS: Record<string, typeof Plane> = {
  trip_created: Plane,
  destination_saved: Heart,
  trip_completed: MapPin,
  review_added: Star,
  safety_checked: Bell,
};

const QUICK_ACTION_ICONS: Record<string, typeof Plane> = {
  plus: Plus,
  shield: Shield,
  compass: Compass,
  settings: Settings,
};

const REC_ICONS: Record<string, typeof Sparkles> = {
  destination: MapPin,
  deal: Wallet,
  tip: Lightbulb,
  alert: Bell,
};

const REC_COLORS: Record<string, string> = {
  destination: 'border-blue-500/20 bg-blue-500/5',
  deal: 'border-emerald-500/20 bg-emerald-500/5',
  tip: 'border-amber-500/20 bg-amber-500/5',
  alert: 'border-red-500/20 bg-red-500/5',
};

function ProgressRing({ value, size = 120, color = '#3b82f6' }: { value: number; size?: number; color?: string }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display text-2xl font-bold text-white">{value}%</span>
      </div>
    </div>
  );
}

function WidgetCard({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`glass-strong rounded-2xl p-5 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function DashboardPage() {
  const [trips] = useState<Trip[]>(TRIPS_DATA);
  const [activities] = useState<Activity[]>(ACTIVITIES);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const upcomingTrips = trips.filter((t) => t.status === 'upcoming');
  const savedTrips = trips.filter((t) => t.status !== 'completed');
  const totalBudget = trips.reduce((sum, t) => sum + t.budget, 0);
  const completedTrips = trips.filter((t) => t.status === 'completed').length;
  const budgetUsed = Math.round((completedTrips / trips.length) * 100);

  return (
    <div className="relative min-h-screen pt-24">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="relative mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center"
        >
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">
              <span className="text-white">Welcome back, </span>
              <span className="text-gradient-blue">Traveler</span>
            </h1>
            <p className="mt-2 text-muted-foreground">Here's your travel overview at a glance.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-neon">
              <Plane className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Explorer Plan</p>
              <p className="text-xs text-muted-foreground">3 trips this year</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6 flex flex-wrap gap-3"
        >
          {QUICK_ACTIONS.map((qa) => {
            const Icon = QUICK_ACTION_ICONS[qa.icon] ?? Plus;
            return (
              <Link
                key={qa.id}
                href={qa.href}
                className="group flex items-center gap-2 rounded-xl glass px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10 hover:shadow-card-hover"
              >
                <Icon className="h-4 w-4 text-blue-400" />
                {qa.label}
              </Link>
            );
          })}
        </motion.div>

        {/* Top row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <WidgetCard delay={0.05}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-white">Upcoming Trips</h3>
              <Plane className="h-4 w-4 text-blue-400" />
            </div>
            <div className="space-y-3">
              {upcomingTrips.map((trip) => (
                <div key={trip.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                  <img src={trip.cover_image} alt={trip.destination_name} className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{trip.destination_name}</p>
                    <p className="text-xs text-muted-foreground">{trip.start_date} · {trip.travelers} travelers</p>
                  </div>
                  <span className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_COLORS[trip.status]}`}>
                    {trip.status}
                  </span>
                </div>
              ))}
              {upcomingTrips.length === 0 && <p className="text-sm text-muted-foreground">No upcoming trips yet.</p>}
            </div>
          </WidgetCard>

          <WidgetCard delay={0.1}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-white">Budget Tracking</h3>
              <Wallet className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex flex-col items-center">
              <ProgressRing value={budgetUsed} color="#10b981" />
              <p className="mt-3 text-sm text-muted-foreground">of {formatCurrency(totalBudget, 'USD')} planned</p>
              <div className="mt-3 flex w-full gap-2">
                <div className="flex-1 rounded-lg bg-emerald-500/10 p-2 text-center">
                  <TrendingDown className="mx-auto mb-1 h-3 w-3 text-emerald-400" />
                  <p className="text-xs text-emerald-400">{formatCurrency(totalBudget - 900, 'USD')}</p>
                  <p className="text-[10px] text-muted-foreground">Remaining</p>
                </div>
                <div className="flex-1 rounded-lg bg-blue-500/10 p-2 text-center">
                  <TrendingUp className="mx-auto mb-1 h-3 w-3 text-blue-400" />
                  <p className="text-xs text-blue-400">{formatCurrency(900, 'USD')}</p>
                  <p className="text-[10px] text-muted-foreground">Spent</p>
                </div>
              </div>
            </div>
          </WidgetCard>

          <WidgetCard delay={0.15}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-white">Countries Visited</h3>
              <Globe2 className="h-4 w-4 text-purple-400" />
            </div>
            <div className="flex flex-col items-center">
              <ProgressRing value={Math.round((COUNTRIES_VISITED.length / 195) * 100)} size={120} color="#8b5cf6" />
              <p className="mt-3 font-display text-2xl font-bold text-white">{COUNTRIES_VISITED.length}</p>
              <p className="text-xs text-muted-foreground">of 195 countries</p>
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {COUNTRIES_VISITED.slice(0, 4).map((c) => (
                  <span key={c} className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">{c}</span>
                ))}
                <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs text-purple-400">+{COUNTRIES_VISITED.length - 4}</span>
              </div>
            </div>
          </WidgetCard>
        </div>

        {/* Charts row */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <WidgetCard delay={0.2}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-white">Travel Statistics</h3>
              <ActivityIcon className="h-4 w-4 text-blue-400" />
            </div>
            {mounted && (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={MONTHLY_DATA}>
                  <defs>
                    <linearGradient id="tripsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(240 10% 6%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="trips" stroke="#3b82f6" strokeWidth={2} fill="url(#tripsGrad)" />
                  <Area type="monotone" dataKey="spend" stroke="#8b5cf6" strokeWidth={2} fill="url(#spendGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </WidgetCard>

          <WidgetCard delay={0.25}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-white">Spending Breakdown</h3>
              <Wallet className="h-4 w-4 text-emerald-400" />
            </div>
            {mounted && (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={220}>
                  <PieChart>
                    <Pie data={SPENDING_BREAKDOWN} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                      {SPENDING_BREAKDOWN.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: 'hsl(240 10% 6%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {SPENDING_BREAKDOWN.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-medium text-white">{formatCurrency(item.value, 'USD')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </WidgetCard>
        </div>

        {/* Bottom row */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <WidgetCard delay={0.3}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-white">Saved Trips</h3>
              <Heart className="h-4 w-4 text-rose-400" />
            </div>
            <div className="space-y-3">
              {savedTrips.map((trip) => (
                <div key={trip.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                  <img src={trip.cover_image} alt={trip.destination_name} className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{trip.destination_name}, {trip.country}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(trip.budget, 'USD')}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </WidgetCard>

          <WidgetCard delay={0.35}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-white">Recent Activity</h3>
              <Clock className="h-4 w-4 text-sky-400" />
            </div>
            <div className="space-y-3">
              {activities.map((act) => {
                const Icon = ACTIVITY_ICONS[act.type] ?? ActivityIcon;
                return (
                  <div key={act.id} className="flex gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
                      <Icon className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{act.title}</p>
                      <p className="text-xs text-muted-foreground">{act.description}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground/60">{act.timestamp}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </WidgetCard>

          <WidgetCard delay={0.4}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-white">Notifications</h3>
              <Bell className="h-4 w-4 text-amber-400" />
            </div>
            <div className="space-y-3">
              {NOTIFICATIONS.map((n) => (
                <div key={n.id} className={`rounded-xl p-3 ${n.unread ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-white/5'}`}>
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium text-white">{n.title}</p>
                    {n.unread && <span className="h-2 w-2 rounded-full bg-blue-400" />}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground/60">{n.time}</p>
                </div>
              ))}
            </div>
          </WidgetCard>
        </div>

        {/* AI Recommendations */}
        <div className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 flex items-center gap-2"
          >
            <Sparkles className="h-5 w-5 text-purple-400" />
            <h3 className="font-display text-lg font-semibold text-white">AI Recommendations</h3>
            <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs text-purple-400">Powered by AI</span>
          </motion.div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {AI_RECOMMENDATIONS.map((rec, i) => {
              const Icon = REC_ICONS[rec.type] ?? Sparkles;
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`rounded-2xl border p-4 ${REC_COLORS[rec.type] ?? ''}`}
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="mb-1 text-sm font-semibold text-white">{rec.title}</h4>
                  <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{rec.description}</p>
                  <Link
                    href={rec.href}
                    className="group inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300"
                  >
                    {rec.action}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Travel History */}
        <div className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 flex items-center gap-2"
          >
            <History className="h-5 w-5 text-sky-400" />
            <h3 className="font-display text-lg font-semibold text-white">Travel History</h3>
          </motion.div>
          <WidgetCard>
            <div className="space-y-3">
              {trips.filter((t) => t.status === 'completed').map((trip) => (
                <div key={trip.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                  <img src={trip.cover_image} alt={trip.destination_name} className="h-10 w-10 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{trip.destination_name}, {trip.country}</p>
                    <p className="text-xs text-muted-foreground">{trip.start_date} → {trip.end_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Spent</p>
                    <p className="text-sm font-bold text-emerald-400">{formatCurrency(trip.budget, 'USD')}</p>
                  </div>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-400">
                    Completed
                  </span>
                </div>
              ))}
              {trips.filter((t) => t.status === 'completed').length === 0 && (
                <p className="text-sm text-muted-foreground">No completed trips yet. Your travel history will appear here.</p>
              )}
            </div>
          </WidgetCard>
        </div>
      </div>
    </div>
  );
}
