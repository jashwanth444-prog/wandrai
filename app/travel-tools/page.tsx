'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  Clock,
  Ruler,
  Languages,
  Phone,
  Siren,
  Wallet,
  FileText,
  ArrowRightLeft,
  Search,
  Globe,
  Shield,
  DollarSign,
  Thermometer,
  Sun,
  Moon,
  Plus,
  ArrowRight,
  X,
  CheckCircle2,
  AlertTriangle,
  Plug,
  Syringe,
  Hospital,
  Wifi,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  CURRENCY_RATES,
  UNIT_CONVERSIONS,
  EMERGENCY_PHRASES,
  WORLD_TIMEZONES,
  COUNTRY_DETAILS,
  VISA_INFO,
} from '@/lib/feature-constants';
import { cn, formatCurrency } from '@/lib/utils';
import SectionHeading from '@/components/shared/SectionHeading';
import type { CurrencyRate, Expense, VisaInfo } from '@/types';

/* ------------------------------------------------------------------ */
/* Shared styles + helpers                                             */
/* ------------------------------------------------------------------ */

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:border-blue-500/50 focus:outline-none';

const selectClass = cn(inputClass, 'appearance-none cursor-pointer');

const QUICK_EXPENSE_KEY = 'wandrai_expenses';

type TimeZone = (typeof WORLD_TIMEZONES)[number];

function formatConverted(value: number, currency: CurrencyRate): string {
  const decimals = currency.code === 'JPY' || currency.code === 'IDR' ? 0 : 2;
  return `${currency.symbol}${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)}`;
}

function convertTemperature(value: number, from: string, to: string): number {
  // Normalize to Celsius first
  const celsius = from === 'Celsius' ? value : (value - 32) * (5 / 9);
  // Then convert to target
  return to === 'Celsius' ? celsius : celsius * (9 / 5) + 32;
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

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function genId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ------------------------------------------------------------------ */
/* Tab configuration                                                   */
/* ------------------------------------------------------------------ */

const TABS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'currency', label: 'Currency', icon: Calculator },
  { id: 'clock', label: 'World Clock', icon: Clock },
  { id: 'units', label: 'Units', icon: Ruler },
  { id: 'emergency', label: 'Emergency', icon: Siren },
  { id: 'phrases', label: 'Phrases', icon: Languages },
  { id: 'budget', label: 'Budget', icon: Wallet },
  { id: 'expenses', label: 'Expenses', icon: DollarSign },
  { id: 'visa', label: 'Visa', icon: FileText },
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
        <motion.p
          key={`${fromCur}-${toCur}-${result.toFixed(2)}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-1 font-display text-3xl font-bold text-white"
        >
          {formatConverted(result, target)}
        </motion.p>
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
        {WORLD_TIMEZONES.map((tz: TimeZone, i) => {
          const daytime = isDaytime(tz.tz, now);
          return (
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
                {daytime ? (
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
          );
        })}
      </div>
    </div>
  );
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

  const categoryIcon: Record<string, LucideIcon> = {
    Temperature: Thermometer,
    Distance: Ruler,
    Weight: DollarSign,
    Volume: Wallet,
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
        {UNIT_CONVERSIONS.map((u) => {
          const Icon = categoryIcon[u.category] ?? Ruler;
          const active = category === u.category;
          return (
            <button
              key={u.category}
              onClick={() => handleCategoryChange(u.category)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all',
                active
                  ? 'bg-blue-500/20 text-blue-200'
                  : 'bg-white/5 text-muted-foreground hover:text-white'
              )}
            >
              <Icon className="h-3.5 w-3.5" /> {u.category}
            </button>
          );
        })}
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
        <motion.p
          key={`${category}-${result.toFixed(2)}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-1 font-display text-2xl font-bold text-white"
        >
          {numericValue} {fromU.symbol} = {result.toFixed(2)} {toU.symbol}
        </motion.p>
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
/* Tool: Emergency Toolkit                                             */
/* ------------------------------------------------------------------ */

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

function EmergencyToolkit() {
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
              <Siren className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">Emergency Toolkit</h3>
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
              <ContactChip icon={Phone} label="Police" value={c.emergencyNumbers.police} tone="sky" />
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

/* ------------------------------------------------------------------ */
/* Tool: Travel Phrasebook                                             */
/* ------------------------------------------------------------------ */

function TravelPhrasebook() {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
          <Languages className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-white">Travel Phrasebook</h3>
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
                        <div key={t.language} className="rounded-lg bg-white/5 px-3 py-2.5">
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
/* Tool: Budget Calculator                                             */
/* ------------------------------------------------------------------ */

function BudgetCalculator() {
  const [days, setDays] = useState('7');
  const [dailyBudget, setDailyBudget] = useState('80');
  const [currency, setCurrency] = useState('USD');
  const [flights, setFlights] = useState('600');
  const [hotels, setHotels] = useState('120');

  const numDays = parseInt(days) || 0;
  const numDaily = parseFloat(dailyBudget) || 0;
  const numFlights = parseFloat(flights) || 0;
  const numHotels = parseFloat(hotels) || 0;

  const dailyTotal = numDays * numDaily;
  const lodgingTotal = numDays * numHotels;
  const grandTotal = dailyTotal + lodgingTotal + numFlights;

  const breakdown = [
    { label: 'Daily spending', value: dailyTotal, sub: `${numDays} days × ${formatCurrency(numDaily, currency)}` },
    { label: 'Accommodation', value: lodgingTotal, sub: `${numDays} nights × ${formatCurrency(numHotels, currency)}` },
    { label: 'Flights', value: numFlights, sub: 'Round-trip estimate' },
  ];

  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
          <Wallet className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-white">Budget Calculator</h3>
          <p className="text-xs text-muted-foreground">Estimate your total trip cost</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Trip Duration (days)
          </label>
          <input
            type="number"
            min="1"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Daily Budget
          </label>
          <input
            type="number"
            min="0"
            value={dailyBudget}
            onChange={(e) => setDailyBudget(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Currency
          </label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={selectClass}>
            {CURRENCY_RATES.map((c) => (
              <option key={c.code} value={c.code} className="bg-slate-900">
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Flight Cost
          </label>
          <input
            type="number"
            min="0"
            value={flights}
            onChange={(e) => setFlights(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Accommodation (per night)
          </label>
          <input
            type="number"
            min="0"
            value={hotels}
            onChange={(e) => setHotels(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Breakdown */}
      <div className="mt-6 space-y-3">
        {breakdown.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-white">{row.label}</p>
              <p className="text-xs text-muted-foreground">{row.sub}</p>
            </div>
            <p className="font-display text-lg font-bold text-white">
              {formatCurrency(row.value, currency)}
            </p>
          </div>
        ))}
      </div>

      {/* Grand total */}
      <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-5 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-amber-300">
            Estimated Total
          </p>
          <p className="text-xs text-muted-foreground">{numDays} day trip</p>
        </div>
        <motion.p
          key={grandTotal}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="font-display text-3xl font-bold text-white"
        >
          {formatCurrency(grandTotal, currency)}
        </motion.p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tool: Expense Tracker Quick Access                                  */
/* ------------------------------------------------------------------ */

const QUICK_CATEGORIES: { value: Expense['category']; label: string }[] = [
  { value: 'food', label: 'Food' },
  { value: 'transport', label: 'Transport' },
  { value: 'hotels', label: 'Hotels' },
  { value: 'flights', label: 'Flights' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'activities', label: 'Activities' },
  { value: 'other', label: 'Other' },
];

function ExpenseQuickAccess() {
  const [category, setCategory] = useState<Expense['category']>('food');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [recent, setRecent] = useState<Expense[]>([]);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(QUICK_EXPENSE_KEY);
      if (saved) setRecent(JSON.parse(saved).slice(0, 3));
    } catch {
      /* ignore */
    }
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!description.trim() || isNaN(numAmount) || numAmount <= 0) return;

    const newExpense: Expense = {
      id: genId(),
      user_id: 'local',
      category,
      description: description.trim(),
      amount: numAmount,
      currency: 'USD',
      date: todayISO(),
      created_at: new Date().toISOString(),
    };

    try {
      const saved = localStorage.getItem(QUICK_EXPENSE_KEY);
      const existing: Expense[] = saved ? JSON.parse(saved) : [];
      const next = [newExpense, ...existing];
      localStorage.setItem(QUICK_EXPENSE_KEY, JSON.stringify(next));
      setRecent(next.slice(0, 3));
    } catch {
      /* ignore */
    }

    setAmount('');
    setDescription('');
    setCategory('food');
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2500);
  };

  return (
    <div className="space-y-5">
      {/* Summary card with link */}
      <div className="glass-strong rounded-2xl p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">Expense Tracker</h3>
              <p className="text-xs text-muted-foreground">Quick-log spending or open the full tracker</p>
            </div>
          </div>
          <a
            href="/expenses"
            className="flex shrink-0 items-center gap-2 rounded-xl bg-emerald-500/15 px-4 py-2.5 text-sm font-semibold text-emerald-300 transition-all hover:bg-emerald-500/25 hover:text-emerald-200"
          >
            Open Full Expense Tracker
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Quick add form + recent */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <form onSubmit={handleAdd} className="glass-strong rounded-2xl p-6 lg:col-span-3">
          <h4 className="mb-4 font-display text-base font-semibold text-white">Quick Add Expense</h4>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Expense['category'])}
                className={selectClass}
              >
                {QUICK_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value} className="bg-slate-900">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Amount (USD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Lunch in Paris"
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-400"
          >
            <Plus className="h-4 w-4" />
            Add Quick Expense
          </button>

          <AnimatePresence>
            {justAdded && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300"
              >
                <CheckCircle2 className="h-4 w-4" />
                Expense saved! View it in the full tracker.
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Recent quick expenses */}
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <h4 className="mb-4 font-display text-base font-semibold text-white">Recent Quick Adds</h4>
          {recent.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2 text-center">
              <Wallet className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No expenses logged yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((exp) => {
                const catMeta =
                  QUICK_CATEGORIES.find((c) => c.value === exp.category) ?? QUICK_CATEGORIES[QUICK_CATEGORIES.length - 1];
                return (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{exp.description}</p>
                      <p className="text-xs text-muted-foreground">{catMeta.label}</p>
                    </div>
                    <p className="ml-2 shrink-0 font-display text-sm font-bold text-white">
                      {formatCurrency(exp.amount, exp.currency)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tool: Visa Information                                              */
/* ------------------------------------------------------------------ */

const ADVISORY_STYLES: Record<string, { label: string; cls: string }> = {
  low: { label: 'Low Risk', cls: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' },
  moderate: { label: 'Moderate', cls: 'text-amber-300 bg-amber-500/10 border-amber-500/20' },
  high: { label: 'High Risk', cls: 'text-orange-300 bg-orange-500/10 border-orange-500/20' },
  extreme: { label: 'Extreme', cls: 'text-red-300 bg-red-500/10 border-red-500/20' },
};

function VisaDetail({ visa, onClose }: { visa: VisaInfo; onClose: () => void }) {
  const advisory = ADVISORY_STYLES[visa.advisoryLevel] ?? ADVISORY_STYLES.low;

  const rows: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: FileText, label: 'Visa Type', value: visa.visaType },
    { icon: Shield, label: 'Passport Validity', value: visa.passportValidity },
    { icon: Clock, label: 'Timezone', value: visa.timezone },
    { icon: Plug, label: 'Plug Type', value: visa.plugType },
    { icon: DollarSign, label: 'Currency', value: visa.currency },
    { icon: Wifi, label: 'Internet', value: `${visa.internetSpeed}` },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="glass-strong rounded-2xl p-6"
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{visa.flag}</span>
          <div>
            <h3 className="font-display text-xl font-bold text-white">{visa.country}</h3>
            <p className="text-xs text-muted-foreground">{visa.code}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close details"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground transition-all hover:border-white/20 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Visa required badge */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div
          className={cn(
            'inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium',
            visa.visaRequired
              ? 'border-amber-500/20 bg-amber-500/10 text-amber-300'
              : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
          )}
        >
          {visa.visaRequired ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          {visa.visaRequired ? 'Visa Required' : 'Visa Free'}
        </div>
        <div
          className={cn(
            'inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium',
            advisory.cls
          )}
        >
          <Shield className="h-4 w-4" />
          {advisory.label}
        </div>
      </div>

      {/* Detail rows */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-3.5"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-muted-foreground">
              <row.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {row.label}
              </p>
              <p className="mt-0.5 text-sm text-white">{row.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Vaccinations */}
      <div className="mt-4 rounded-xl border border-white/5 bg-white/5 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Syringe className="h-4 w-4 text-emerald-400" />
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Vaccinations
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {visa.vaccinations.map((v) => (
            <span
              key={v}
              className="rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300"
            >
              {v}
            </span>
          ))}
        </div>
      </div>

      {/* Travel advisory */}
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-amber-300">
            Travel Advisory
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{visa.travelAdvisory}</p>
        </div>
      </div>

      {/* Emergency contacts */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <ContactChip icon={Phone} label="Police" value={visa.emergencyContacts.police} tone="sky" />
        <ContactChip icon={Hospital} label="Ambulance" value={visa.emergencyContacts.ambulance} tone="emerald" />
        <ContactChip icon={Siren} label="Fire" value={visa.emergencyContacts.fire} tone="amber" />
      </div>
    </motion.div>
  );
}

function VisaInformation() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<VisaInfo | null>(null);

  const filtered = useMemo(
    () =>
      VISA_INFO.filter((v) =>
        v.country.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  return (
    <div>
      <div className="glass-strong mb-5 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">Visa Information</h3>
              <p className="text-xs text-muted-foreground">Search a country to view visa & travel details</p>
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

      <AnimatePresence mode="wait">
        {selected ? (
          <VisaDetail key="detail" visa={selected} onClose={() => setSelected(null)} />
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((v, i) => (
                <motion.button
                  key={v.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  onClick={() => setSelected(v)}
                  className="glass group rounded-2xl p-5 text-left transition-all hover:border-sky-500/30 hover:bg-sky-500/5"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="text-3xl">{v.flag}</span>
                    <div className="min-w-0">
                      <p className="font-display text-base font-semibold text-white">{v.country}</p>
                      <p className="truncate text-xs text-muted-foreground">{v.visaType}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium',
                        v.visaRequired
                          ? 'border-amber-500/20 bg-amber-500/10 text-amber-300'
                          : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                      )}
                    >
                      {v.visaRequired ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                      {v.visaRequired ? 'Visa Required' : 'Visa Free'}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-sky-300">
                      Details
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </motion.button>
              ))}
              {filtered.length === 0 && (
                <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
                  No countries found.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function TravelToolsPage() {
  const [activeTab, setActiveTab] = useState('currency');

  const renderTool = () => {
    switch (activeTab) {
      case 'currency':
        return <CurrencyConverter />;
      case 'clock':
        return <WorldClock />;
      case 'units':
        return <UnitConverter />;
      case 'emergency':
        return <EmergencyToolkit />;
      case 'phrases':
        return <TravelPhrasebook />;
      case 'budget':
        return <BudgetCalculator />;
      case 'expenses':
        return <ExpenseQuickAccess />;
      case 'visa':
        return <VisaInformation />;
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
          badge="Travel Tools"
          badgeColor="blue"
          title={
            <>
              <span className="text-white">Travel </span>
              <span className="text-gradient-blue">Tools</span>
            </>
          }
          description="Eight essential travel utilities in one place — convert currencies, check world clocks, estimate budgets, look up visas, and more."
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
