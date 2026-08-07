'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  ShieldCheck, AlertTriangle, Siren, Phone, Hospital, Building2,
  Pill, Search, CloudLightning, CloudRain, Activity, HeartPulse,
} from 'lucide-react';
import { COUNTRIES_SAFETY, SAFETY_ALERTS } from '@/lib/constants';
import { safetyScoreColor, safetyLevelColor, safetyLevelLabel } from '@/lib/utils';
import type { CountrySafety, SafetyAlert } from '@/types';

const SafetyGlobe = dynamic(() => import('@/components/3d/SafetyGlobe'), { ssr: false });

const ALERT_TYPE_ICONS: Record<string, typeof AlertTriangle> = {
  weather: CloudRain,
  'natural-disaster': CloudLightning,
  political: AlertTriangle,
  health: HeartPulse,
};

const SEVERITY_ORDER: Record<string, number> = { extreme: 0, high: 1, moderate: 2, low: 3 };

export default function SafetyPage() {
  const [selectedCountry, setSelectedCountry] = useState<CountrySafety>(COUNTRIES_SAFETY[0]);
  const [search, setSearch] = useState('');
  const [sosActive, setSosActive] = useState(false);
  const [sosProgress, setSosProgress] = useState(0);
  const sosIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sosTriggeredRef = useRef(false);

  const filteredCountries = COUNTRIES_SAFETY.filter((c) =>
    c.country.toLowerCase().includes(search.toLowerCase())
  );

  const sortedAlerts = [...SAFETY_ALERTS].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
  );

  const clearSosInterval = () => {
    if (sosIntervalRef.current) {
      clearInterval(sosIntervalRef.current);
      sosIntervalRef.current = null;
    }
  };

  const handleSosPress = () => {
    setSosActive(true);
    sosTriggeredRef.current = false;
    clearSosInterval();
    sosIntervalRef.current = setInterval(() => {
      setSosProgress((p) => {
        if (p >= 100) {
          clearSosInterval();
          setSosActive(false);
          setSosProgress(0);
          sosTriggeredRef.current = true;
          return 0;
        }
        return p + 4;
      });
    }, 50);
  };

  const handleSosRelease = () => {
    clearSosInterval();
    setSosActive(false);
    setSosProgress(0);
  };

  return (
    <div className="relative min-h-screen pt-24">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute inset-0 bg-aurora opacity-30" />
      <div className="relative mx-auto max-w-7xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/20 px-4 py-1.5">
            <ShieldCheck className="h-4 w-4 text-red-400" />
            <span className="text-sm font-medium text-red-300">Travel Safety Intelligence</span>
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="text-white">Your Safety, </span>
            <span className="text-gradient-blue">Our Priority</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Real-time safety scores, emergency contacts, and alerts for every country — so you travel prepared.
          </p>
        </motion.div>

        {/* Globe + SOS */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong relative col-span-1 h-[400px] overflow-hidden rounded-2xl lg:col-span-2"
          >
            <SafetyGlobe />
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Safe (85+)
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-amber-400" /> Caution (50-84)
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-red-400" /> Risky (&lt;50)
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-strong flex flex-col items-center justify-center rounded-2xl p-6"
          >
            <h3 className="mb-2 font-display text-lg font-semibold text-white">Emergency SOS</h3>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Press and hold to alert your emergency contacts and share your location.
            </p>
            <button
              onMouseDown={handleSosPress}
              onTouchStart={handleSosPress}
              onMouseUp={handleSosRelease}
              onTouchEnd={handleSosRelease}
              onMouseLeave={() => { if (sosActive) handleSosRelease(); }}
              className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-700 shadow-[0_0_40px_rgba(239,68,68,0.5)] transition-transform active:scale-95"
            >
              <Siren className="h-10 w-10 text-white" />
              {sosActive && (
                <svg className="absolute inset-0 -rotate-90" width={128} height={128}>
                  <circle cx={64} cy={64} r={58} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                  <circle
                    cx={64} cy={64} r={58} fill="none" stroke="#fff" strokeWidth="4"
                    strokeDasharray={2 * Math.PI * 58}
                    strokeDashoffset={2 * Math.PI * 58 * (1 - sosProgress / 100)}
                    strokeLinecap="round"
                  />
                </svg>
              )}
              <span className="absolute -bottom-7 text-xs font-semibold text-red-400">SOS</span>
            </button>
            <p className="mt-8 text-center text-xs text-muted-foreground">
              Hold for 3 seconds to activate
            </p>
          </motion.div>
        </div>

        {/* Country selector + details */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-2xl p-5"
          >
            <div className="mb-4">
              <h3 className="mb-3 font-display text-sm font-semibold text-white">Country Safety Scores</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search countries…"
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground focus:border-blue-500/50 focus:outline-none"
                />
              </div>
            </div>
            <div className="max-h-[500px] space-y-2 overflow-y-auto scrollbar-hide">
              {filteredCountries.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCountry(c)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 transition-all ${
                    selectedCountry.id === c.id
                      ? 'border-blue-500/50 bg-blue-500/10'
                      : 'border-white/5 bg-white/5 hover:border-white/15'
                  }`}
                >
                  <span className="text-2xl">{c.flag}</span>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white">{c.country}</p>
                    <p className="text-xs text-muted-foreground">{safetyLevelLabel(c.crimeLevel)}</p>
                  </div>
                  <span className={`font-display text-lg font-bold ${safetyScoreColor(c.score)}`}>{c.score}</span>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            key={selectedCountry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-2xl p-5 lg:col-span-2"
          >
            <div className="mb-5 flex items-center gap-4">
              <span className="text-4xl">{selectedCountry.flag}</span>
              <div>
                <h3 className="font-display text-xl font-bold text-white">{selectedCountry.country}</h3>
                <p className="text-sm text-muted-foreground">Overall Safety Score</p>
              </div>
              <div className="ml-auto text-right">
                <span className={`font-display text-4xl font-bold ${safetyScoreColor(selectedCountry.score)}`}>
                  {selectedCountry.score}
                </span>
                <p className="text-xs text-muted-foreground">/ 100</p>
              </div>
            </div>

            <div className="mb-5 grid grid-cols-3 gap-3">
              {([
                ['Crime', selectedCountry.crimeLevel],
                ['Medical', selectedCountry.medicalLevel],
                ['Political', selectedCountry.politicalStability],
              ] as const).map(([label, level]) => (
                <div key={label} className="rounded-xl bg-white/5 p-3 text-center">
                  <p className="mb-1.5 text-xs text-muted-foreground">{label} Risk</p>
                  <span className={`inline-block rounded-full border px-2.5 py-1 text-xs font-medium ${safetyLevelColor(level)}`}>
                    {safetyLevelLabel(level)}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-white/5 p-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <Phone className="h-4 w-4 text-red-400" /> Emergency Numbers
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Police</span>
                    <span className="font-medium text-white">{selectedCountry.emergencyNumbers.police}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ambulance</span>
                    <span className="font-medium text-white">{selectedCountry.emergencyNumbers.ambulance}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fire</span>
                    <span className="font-medium text-white">{selectedCountry.emergencyNumbers.fire}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white/5 p-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <Hospital className="h-4 w-4 text-emerald-400" /> Hospitals
                </h4>
                <div className="space-y-2">
                  {selectedCountry.hospitals.map((h, i) => (
                    <div key={i}>
                      <p className="text-sm font-medium text-white">{h.name}</p>
                      <p className="text-xs text-muted-foreground">{h.phone}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-white/5 p-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <Building2 className="h-4 w-4 text-sky-400" /> Embassies
                </h4>
                <div className="space-y-2">
                  {selectedCountry.embassies.map((e, i) => (
                    <div key={i}>
                      <p className="text-sm font-medium text-white">{e.name}</p>
                      <p className="text-xs text-muted-foreground">{e.phone}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-white/5 p-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <Pill className="h-4 w-4 text-purple-400" /> Medical Info
                </h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Vaccinations</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {selectedCountry.medicalInfo.vaccinations.map((v) => (
                        <span key={v} className="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs text-purple-300">{v}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{selectedCountry.medicalInfo.notes}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Alerts */}
        <div className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center gap-2"
          >
            <Activity className="h-5 w-5 text-amber-400" />
            <h3 className="font-display text-lg font-semibold text-white">Active Travel Alerts</h3>
            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-400">{sortedAlerts.length} active</span>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedAlerts.map((alert: SafetyAlert, i) => {
              const Icon = ALERT_TYPE_ICONS[alert.type] ?? AlertTriangle;
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl border p-4 ${safetyLevelColor(alert.severity)}`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium text-white">{alert.country}</span>
                    </div>
                    <span className={`rounded-full border px-2 py-0.5 text-xs ${safetyLevelColor(alert.severity)}`}>
                      {safetyLevelLabel(alert.severity)}
                    </span>
                  </div>
                  <h4 className="mb-1 text-sm font-semibold text-white">{alert.title}</h4>
                  <p className="text-xs leading-relaxed text-muted-foreground">{alert.message}</p>
                  <p className="mt-2 text-[10px] text-muted-foreground/60">{alert.timestamp}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
