'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  Clock,
  Ruler,
  Languages,
  Phone,
  Hospital,
  Building2,
  WifiOff,
  ArrowRightLeft,
  Globe,
  Search,
  Siren,
  Pill,
  MapPin,
  Sun,
  Moon,
  Cloud,
  CloudRain,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  EMERGENCY_PHRASES,
  CURRENCY_RATES,
  UNIT_CONVERSIONS,
  WORLD_TIMEZONES,
  COUNTRY_DETAILS,
} from '@/lib/feature-constants';
import { cn, formatCurrency } from '@/lib/utils';
import SectionHeading from '@/components/shared/SectionHeading';
import type { CurrencyRate } from '@/types';

/* ------------------------------------------------------------------ */
/* Shared styles + helpers                                             */
/* ------------------------------------------------------------------ */

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:border-blue-500/50 focus:outline-none';

const selectClass = cn(inputClass, 'appearance-none cursor-pointer');

type TimeZone = (typeof WORLD_TIMEZONES)[number];

function formatConverted(value: number, currency: CurrencyRate): string {
  const decimals = currency.code === 'JPY' || currency.code === 'IDR' ? 0 : 2;
  return `${currency.symbol}${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)}`;
}

function convertTemperature(value: number, from: string, to: string): number {
  const celsius = from === 'Celsius' ? value : (value - 32) * (5 / 9);
  return to === 'Celsius' ? celsius : celsius * (9 / 5) + 32;
}

/* ------------------------------------------------------------------ */
/* Tab configuration                                                   */
/* ------------------------------------------------------------------ */

const TABS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'currency', label: 'Currency', icon: Calculator },
  { id: 'clock', label: 'World Clock', icon: Clock },
  { id: 'units', label: 'Units', icon: Ruler },
  { id: 'phrases', label: 'Phrases', icon: Languages },
  { id: 'contacts', label: 'Contacts', icon: Phone },
  { id: 'embassy', label: 'Embassy', icon: Building2 },
  { id: 'medical', label: 'Medical', icon: Pill },
  { id: 'offline', label: 'Offline', icon: WifiOff },
];

/* ------------------------------------------------------------------ */
/* Tool: Currency Converter                                            */
/* ------------------------------------------------------------------ */

function CurrencyConverter() {
  const [amount, setAmount] = useState('100');
  const [fromCur, setFromCur] = useState('USD');
  const [toCur, setToCur] = useState('EUR');

  const source = CURRENCY_RATES.find((c) => c.code === fromCur)!;
  const target = CURRENCY_RATES.find((c) => c.code === toCur)!;
  const numericAmount = parseFloat(amount) || 0;
  const result = numericAmount * (target.rate / source.rate);
  const unitRate = target.rate / source.rate;

  const swap = () => {
    setFromCur(toCur);
    setToCur(fromCur);
  };

  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-white">Currency Converter</h3>
          <p className="text-xs text-muted-foreground">Live reference rates relative to USD</p>
        </div>
      </div>

      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Amount
      </label>
      <input
        type="number"
        min="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0"
        className={inputClass}
      />

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            From
          </label>
          <select value={fromCur} onChange={(e) => setFromCur(e.target.value)} className={selectClass}>
            {CURRENCY_RATES.map((c) => (
              <option key={c.code} value={c.code} className="bg-slate-900">
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={swap}
          aria-label="Swap currencies"
          className="mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground transition-all hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-300"
        >
          <ArrowRightLeft className="h-4 w-4" />
        </button>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            To
          </label>
          <select value={toCur} onChange={(e) => setToCur(e.target.value)} className={selectClass}>
            {CURRENCY_RATES.map((c) => (
              <option key={c.code} value={c.code} className="bg-slate-900">
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-white/5 bg-white/5 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {formatCurrency(numericAmount, fromCur)} equals
        </p>
        <p className="mt-1 font-display text-3xl font-bold text-white">
          {formatConverted(result, target)}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          1 {fromCur} = {formatConverted(unitRate, target)} {toCur}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tool: World Clock                                                   */
/* ------------------------------------------------------------------ */

function WorldClock() {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <div className="glass-strong mb-5 flex items-center justify-between rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">World Clock</h3>
            <p className="text-xs text-muted-foreground">Local time across major cities</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Updates every second
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {WORLD_TIMEZONES.map((tz: TimeZone, i) => (
          <motion.div
            key={tz.city}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="glass rounded-2xl p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-display text-base font-semibold text-white">{tz.city}</p>
                <p className="text-xs text-muted-foreground">
                  UTC{tz.offset >= 0 ? '+' : ''}
                  {tz.offset}
                </p>
              </div>
              {isDaytime(tz.tz, now) ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5 text-indigo-300" />
              )}
            </div>
            <p className="font-display text-2xl font-bold tabular-nums text-white">
              {formatClockTime(tz.tz, now)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{formatClockDate(tz.tz, now)}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function isDaytime(tz: string, now: Date): boolean {
  const hourStr = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: '2-digit',
    hour12: false,
  }).format(now);
  const hour = parseInt(hourStr, 10);
  return hour >= 6 && hour < 18;
}

function formatClockTime(tz: string, now: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(now);
}

function formatClockDate(tz: string, now: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(now);
}

/* ------------------------------------------------------------------ */
/* Tool: Unit Converter                                                */
/* ------------------------------------------------------------------ */

function UnitConverter() {
  const [category, setCategory] = useState('Distance');
  const [value, setValue] = useState('10');
  const [fromUnit, setFromUnit] = useState('Kilometers');
  const [toUnit, setToUnit] = useState('Miles');

  const cat = UNIT_CONVERSIONS.find((u) => u.category === category)!;
  const fromU = cat.units.find((u) => u.name === fromUnit) ?? cat.units[0];
  const toU = cat.units.find((u) => u.name === toUnit) ?? cat.units[1] ?? cat.units[0];
  const numericValue = parseFloat(value) || 0;
  const result =
    category === 'Temperature'
      ? convertTemperature(numericValue, fromU.name, toU.name)
      : numericValue * (toU.factor / fromU.factor);

  const handleCategoryChange = (next: string) => {
    const nextCat = UNIT_CONVERSIONS.find((u) => u.category === next)!;
    setCategory(next);
    setFromUnit(nextCat.units[0].name);
    setToUnit(nextCat.units[1]?.name ?? nextCat.units[0].name);
  };

  const swap = () => {
    setFromUnit(toU.name);
    setToUnit(fromU.name);
  };

  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
          <Ruler className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-white">Unit Converter</h3>
          <p className="text-xs text-muted-foreground">Temperature, distance, weight & volume</p>
        </div>
      </div>

      {/* Category pills */}
      <div className="mb-5 flex flex-wrap gap-2">
        {UNIT_CONVERSIONS.map((u) => (
          <button
            key={u.category}
            onClick={() => handleCategoryChange(u.category)}
            className={cn(
              'rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all',
              category === u.category
                ? 'bg-blue-500/20 text-blue-200'
                : 'bg-white/5 text-muted-foreground hover:text-white'
            )}
          >
            {u.category}
          </button>
        ))}
      </div>

      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Value
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="0"
        className={inputClass}
      />

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            From
          </label>
          <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className={selectClass}>
            {cat.units.map((u) => (
              <option key={u.name} value={u.name} className="bg-slate-900">
                {u.name} ({u.symbol})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={swap}
          aria-label="Swap units"
          className="mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground transition-all hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-300"
        >
          <ArrowRightLeft className="h-4 w-4" />
        </button>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            To
          </label>
          <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className={selectClass}>
            {cat.units.map((u) => (
              <option key={u.name} value={u.name} className="bg-slate-900">
                {u.name} ({u.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-white/5 bg-white/5 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Result</p>
        <p className="mt-1 font-display text-2xl font-bold text-white">
          {numericValue} {fromU.symbol} = {result.toFixed(2)} {toU.symbol}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {category === 'Temperature'
            ? 'Temperature uses exact C ⇄ F conversion.'
            : `1 ${fromU.symbol} = ${(toU.factor / fromU.factor).toFixed(4)} ${toU.symbol}`}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tool: Emergency Phrases                                             */
/* ------------------------------------------------------------------ */

function EmergencyPhrases() {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
          <Languages className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-white">Emergency Phrases</h3>
          <p className="text-xs text-muted-foreground">Tap a phrase to reveal translations</p>
        </div>
      </div>

      <div className="space-y-3">
        {EMERGENCY_PHRASES.map((p, i) => {
          const isOpen = expanded === i;
          return (
            <div
              key={p.phrase}
              className={cn(
                'overflow-hidden rounded-xl border transition-colors',
                isOpen ? 'border-purple-500/30 bg-purple-500/5' : 'border-white/5 bg-white/5'
              )}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
              >
                <span className="text-sm font-medium text-white">{p.phrase}</span>
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-lg leading-none text-muted-foreground transition-transform',
                    isOpen && 'rotate-180'
                  )}
                >
                  +
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="grid grid-cols-1 gap-2 px-4 pb-4 sm:grid-cols-2">
                      {p.translations.map((t) => (
                        <div
                          key={t.language}
                          className="rounded-lg bg-white/5 px-3 py-2.5"
                        >
                          <p className="text-xs font-medium uppercase tracking-wide text-purple-300">
                            {t.language}
                          </p>
                          <p className="mt-0.5 text-sm text-white">{t.translation}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tool: Emergency Contacts                                            */
/* ------------------------------------------------------------------ */

function EmergencyContacts() {
  const [search, setSearch] = useState('');
  const filtered = useMemo(
    () =>
      COUNTRY_DETAILS.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  return (
    <div>
      <div className="glass-strong mb-5 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">Emergency Contacts</h3>
              <p className="text-xs text-muted-foreground">Police, ambulance & fire by country</p>
            </div>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search countries…"
              className={cn(inputClass, 'pl-10')}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className="glass rounded-2xl p-5"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="text-3xl">{c.flag}</span>
              <div>
                <p className="font-display text-base font-semibold text-white">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.capital}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <ContactChip icon={Siren} label="Police" value={c.emergencyNumbers.police} tone="sky" />
              <ContactChip icon={Hospital} label="Ambulance" value={c.emergencyNumbers.ambulance} tone="emerald" />
              <ContactChip icon={Siren} label="Fire" value={c.emergencyNumbers.fire} tone="amber" />
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
            No countries found.
          </p>
        )}
      </div>
    </div>
  );
}

function ContactChip({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: 'sky' | 'emerald' | 'amber';
}) {
  const tones: Record<string, string> = {
    sky: 'bg-sky-500/10 text-sky-300',
    emerald: 'bg-emerald-500/10 text-emerald-300',
    amber: 'bg-amber-500/10 text-amber-300',
  };
  return (
    <div className={cn('rounded-lg p-2.5 text-center', tones[tone])}>
      <Icon className="mx-auto mb-1 h-4 w-4" />
      <p className="text-[10px] font-medium uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-0.5 font-display text-lg font-bold tabular-nums text-white">{value}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tool: Embassy Information                                           */
/* ------------------------------------------------------------------ */

function EmbassyInfo() {
  const [search, setSearch] = useState('');
  const filtered = useMemo(
    () =>
      COUNTRY_DETAILS.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  return (
    <div>
      <div className="glass-strong mb-5 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">Embassy Information</h3>
              <p className="text-xs text-muted-foreground">Where to find help abroad</p>
            </div>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search countries…"
              className={cn(inputClass, 'pl-10')}
            />
          </div>
        </div>
        <p className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-relaxed text-amber-200/90">
          <Siren className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          Embassy details vary by your nationality. Confirm your embassy&apos;s address and 24/7
          emergency hotline before you travel, and save them offline.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className="glass rounded-2xl p-5"
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="text-3xl">{c.flag}</span>
              <div>
                <p className="font-display text-base font-semibold text-white">{c.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {c.capital}
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/5 p-3">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Building2 className="h-3.5 w-3.5 text-sky-400" />
                Embassies are typically located in the capital city.
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                No verified embassy directory available for this country yet — confirm your
                nationality&apos;s embassy location locally before your trip.
              </p>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
            No countries found.
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tool: Medical Information                                           */
/* ------------------------------------------------------------------ */

const MEDICAL_TIPS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Hospital,
    title: 'Know the ambulance number',
    text: 'Ambulance services and response times vary widely. Save the local number before you need it.',
  },
  {
    icon: Pill,
    title: 'Carry essential medication',
    text: 'Pack a small first-aid kit plus any prescription meds in their original packaging, with a copy of the prescription.',
  },
  {
    icon: Siren,
    title: 'Get travel insurance',
    text: 'Medical evacuation can cost tens of thousands. Confirm your policy covers healthcare abroad before you fly.',
  },
];

function MedicalInfo() {
  return (
    <div>
      <div className="glass-strong mb-5 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <Pill className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">Medical Information</h3>
            <p className="text-xs text-muted-foreground">Stay healthy & prepared on the road</p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {MEDICAL_TIPS.map((tip, i) => (
          <motion.div
            key={tip.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="glass rounded-2xl p-5"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <tip.icon className="h-5 w-5" />
            </div>
            <h4 className="mb-1.5 font-display text-sm font-semibold text-white">{tip.title}</h4>
            <p className="text-xs leading-relaxed text-muted-foreground">{tip.text}</p>
          </motion.div>
        ))}
      </div>

      {/* Ambulance numbers per country */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {COUNTRY_DETAILS.map((c) => (
          <div key={c.id} className="glass rounded-xl p-4 text-center">
            <span className="text-2xl">{c.flag}</span>
            <p className="mt-1.5 text-xs font-medium text-white">{c.name}</p>
            <div className="mt-2 flex items-center justify-center gap-1.5 text-emerald-300">
              <Hospital className="h-3.5 w-3.5" />
              <span className="font-display text-lg font-bold tabular-nums text-white">
                {c.emergencyNumbers.ambulance}
              </span>
            </div>
            <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              Ambulance
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tool: Offline Travel Tips                                           */
/* ------------------------------------------------------------------ */

const OFFLINE_TIPS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: MapPin,
    title: 'Download offline maps',
    text: 'Save your destination city in Google or Apple Maps for turn-by-turn navigation with no signal.',
  },
  {
    icon: WifiOff,
    title: 'Save key pages offline',
    text: 'Screenshot bookings, tickets, boarding passes and confirmation emails in case you lose connectivity.',
  },
  {
    icon: CloudRain,
    title: 'Check the weather early',
    text: 'Review forecasts before heading off-grid so you can pack the right layers for unexpected conditions.',
  },
  {
    icon: Cloud,
    title: 'Cache weather forecasts',
    text: 'Download forecasts for your route so you still know what is coming even without a connection.',
  },
  {
    icon: Sun,
    title: 'Carry a power bank',
    text: 'A 10,000 mAh power bank and a spare cable keep your phone alive during long offline stretches.',
  },
  {
    icon: Globe,
    title: 'Pre-download translations',
    text: 'Download language packs in Google Translate so you can converse offline with locals.',
  },
];

function OfflineTips() {
  return (
    <div>
      <div className="glass-strong mb-5 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
            <WifiOff className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">Offline Travel Tips</h3>
            <p className="text-xs text-muted-foreground">Stay ready when the signal drops</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {OFFLINE_TIPS.map((tip, i) => (
          <motion.div
            key={tip.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="glass rounded-2xl p-5"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <tip.icon className="h-5 w-5" />
            </div>
            <h4 className="mb-1.5 font-display text-sm font-semibold text-white">{tip.title}</h4>
            <p className="text-xs leading-relaxed text-muted-foreground">{tip.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ToolkitPage() {
  const [activeTab, setActiveTab] = useState('currency');

  const renderTool = () => {
    switch (activeTab) {
      case 'currency':
        return <CurrencyConverter />;
      case 'clock':
        return <WorldClock />;
      case 'units':
        return <UnitConverter />;
      case 'phrases':
        return <EmergencyPhrases />;
      case 'contacts':
        return <EmergencyContacts />;
      case 'embassy':
        return <EmbassyInfo />;
      case 'medical':
        return <MedicalInfo />;
      case 'offline':
        return <OfflineTips />;
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen pt-24">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute inset-0 bg-aurora opacity-30" />

      <div className="relative mx-auto max-w-7xl px-6 py-12">
        <SectionHeading
          badge="Emergency Toolkit"
          badgeColor="red"
          title={
            <>
              <span className="text-white">Travel </span>
              <span className="text-gradient-blue">Toolkit</span>
            </>
          }
          description="Everything you need on the road — currency, time, units, phrases and emergency info, all in one place."
        />

        {/* Tab bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-10 flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        >
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all',
                  active
                    ? 'border-blue-500/50 bg-blue-500/10 text-white'
                    : 'border-white/5 bg-white/5 text-muted-foreground hover:border-white/15 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </motion.div>

        {/* Active tool */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderTool()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
