'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Globe, Coins, CalendarDays, CloudSun, Thermometer,
  Clock, Shield, Utensils, Baby, Mountain, Moon, Star, Sparkles, Hotel,
  Bus, Lightbulb, Backpack, Phone, Info, TrendingUp, HeartPulse, Flame,
  MapPinned, Compass, DollarSign,
} from 'lucide-react';
import { getDestinationById } from '@/data/destinations';
import { cn } from '@/lib/utils';

/* ---------- Page wrapper with Suspense ---------- */

export default function DestinationDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center pt-24">
          <div className="glass-strong rounded-2xl border border-white/10 px-8 py-6 text-sm text-muted-foreground">
            Loading destination...
          </div>
        </div>
      }
    >
      <DestinationDetails />
    </Suspense>
  );
}

/* ---------- Main details component ---------- */

function DestinationDetails() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') ?? '';
  const destination = getDestinationById(id);

  if (!destination) {
    return <NotFoundState />;
  }

  const estimatedTotal = destination.dailyBudget * 7;

  return (
    <div className="relative min-h-screen pt-24">
      {/* Background */}
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute inset-0 bg-aurora opacity-30" />

      {/* Hero */}
      <div className="relative h-[400px] w-full overflow-hidden">
        <img
          src={destination.heroImage}
          alt={destination.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />

        {/* Back button */}
        <Link
          href="/explore"
          className="absolute left-6 top-6 z-10 flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-md transition-all hover:border-white/20 hover:bg-black/60"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Explore
        </Link>

        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute bottom-8 left-6 right-6"
        >
          <div className="mb-2 flex items-center gap-2">
            <span
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md',
                destination.budget === 'budget'
                  ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                  : destination.budget === 'mid-range'
                    ? 'border-sky-500/30 bg-sky-500/15 text-sky-300'
                    : 'border-amber-500/30 bg-amber-500/15 text-amber-300',
              )}
            >
              {destination.budget === 'mid-range'
                ? 'Mid-range'
                : destination.budget.charAt(0).toUpperCase() + destination.budget.slice(1)}
            </span>
            <span className="flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-md">
              <MapPin className="h-3 w-3" />
              {destination.city}, {destination.country}
            </span>
          </div>
          <h1 className="font-display text-5xl font-bold tracking-tight text-white drop-shadow-lg sm:text-6xl">
            {destination.name}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-white/70">
            {destination.continent} &middot; {destination.tripDuration} &middot; Best: {destination.bestMonths}
          </p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column (2/3) */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <OverviewSection destination={destination} />
            <AttractionsSection destination={destination} />
            <RestaurantsSection destination={destination} />
            <HotelsSection destination={destination} />
            <HiddenGemsSection destination={destination} />
            <TransportationSection destination={destination} />
            <TravelTipsSection destination={destination} />
            <PackingSection destination={destination} />
            <EtiquetteSection destination={destination} />
          </div>

          {/* Right column (1/3) */}
          <div className="flex flex-col gap-6">
            <div className="lg:sticky lg:top-24 flex flex-col gap-6">
              <BudgetSection
                dailyBudget={destination.dailyBudget}
                currency={destination.currency}
                estimatedTotal={estimatedTotal}
                budget={destination.budget}
              />
              <RatingsSection destination={destination} />
              <EmergencySection destination={destination} />
              <PlanTripCard destinationId={destination.id} destinationName={destination.name} dailyBudget={destination.dailyBudget} tags={destination.tags} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Shared section wrapper ---------- */

function SectionCard({
  icon: Icon,
  title,
  children,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      className="glass-strong rounded-2xl border border-white/10 p-6"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="font-display text-xl font-semibold text-white">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

/* ---------- List renderer ---------- */

function IconList({
  items,
  icon: Icon,
  iconColor = 'text-blue-300',
}: {
  items: string[];
  icon: React.ElementType;
  iconColor?: string;
}) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: i * 0.04 }}
          className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/5 p-3 transition-colors hover:border-white/10"
        >
          <Icon className={cn('mt-0.5 h-4 w-4 flex-shrink-0', iconColor)} />
          <span className="text-sm text-white/80">{item}</span>
        </motion.li>
      ))}
    </ul>
  );
}

/* ---------- Overview ---------- */

function OverviewSection({ destination }: { destination: NonNullable<ReturnType<typeof getDestinationById>> }) {
  const facts = [
    { icon: MapPin, label: 'Country', value: destination.country },
    { icon: Globe, label: 'City', value: destination.city },
    { icon: Globe, label: 'Language', value: destination.language },
    { icon: Coins, label: 'Currency', value: destination.currency },
    { icon: CalendarDays, label: 'Best Months', value: destination.bestMonths },
    { icon: CloudSun, label: 'Weather', value: destination.weather },
    { icon: Thermometer, label: 'Avg Temp', value: `${destination.avgTemp}°C` },
    { icon: Clock, label: 'Trip Duration', value: destination.tripDuration },
  ];

  return (
    <SectionCard icon={Compass} title="Overview">
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        {destination.description}
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {facts.map((f) => (
          <div
            key={f.label}
            className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-3"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/5 text-blue-300">
              <f.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{f.label}</p>
              <p className="truncate text-sm font-medium text-white">{f.value}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

/* ---------- Attractions ---------- */

function AttractionsSection({ destination }: { destination: NonNullable<ReturnType<typeof getDestinationById>> }) {
  return (
    <SectionCard icon={MapPinned} title="Top Attractions" delay={0.05}>
      <IconList items={destination.attractions} icon={Star} iconColor="text-amber-400" />
    </SectionCard>
  );
}

/* ---------- Restaurants ---------- */

function RestaurantsSection({ destination }: { destination: NonNullable<ReturnType<typeof getDestinationById>> }) {
  return (
    <SectionCard icon={Utensils} title="Top Restaurants" delay={0.05}>
      <IconList items={destination.restaurants} icon={Utensils} iconColor="text-orange-400" />
    </SectionCard>
  );
}

/* ---------- Hotels ---------- */

function HotelsSection({ destination }: { destination: NonNullable<ReturnType<typeof getDestinationById>> }) {
  return (
    <SectionCard icon={Hotel} title="Top Hotels" delay={0.05}>
      <IconList items={destination.hotels} icon={Hotel} iconColor="text-purple-400" />
    </SectionCard>
  );
}

/* ---------- Hidden Gems ---------- */

function HiddenGemsSection({ destination }: { destination: NonNullable<ReturnType<typeof getDestinationById>> }) {
  return (
    <SectionCard icon={Sparkles} title="Hidden Gems" delay={0.05}>
      <IconList items={destination.hiddenGems} icon={Sparkles} iconColor="text-pink-400" />
    </SectionCard>
  );
}

/* ---------- Transportation ---------- */

function TransportationSection({ destination }: { destination: NonNullable<ReturnType<typeof getDestinationById>> }) {
  return (
    <SectionCard icon={Bus} title="Transportation" delay={0.05}>
      <IconList items={destination.transportation} icon={Bus} iconColor="text-sky-400" />
    </SectionCard>
  );
}

/* ---------- Travel Tips ---------- */

function TravelTipsSection({ destination }: { destination: NonNullable<ReturnType<typeof getDestinationById>> }) {
  return (
    <SectionCard icon={Lightbulb} title="Travel Tips" delay={0.05}>
      <IconList items={destination.travelTips} icon={Lightbulb} iconColor="text-yellow-400" />
    </SectionCard>
  );
}

/* ---------- Packing ---------- */

function PackingSection({ destination }: { destination: NonNullable<ReturnType<typeof getDestinationById>> }) {
  return (
    <SectionCard icon={Backpack} title="Packing Suggestions" delay={0.05}>
      <IconList items={destination.packingSuggestions} icon={Backpack} iconColor="text-emerald-400" />
    </SectionCard>
  );
}

/* ---------- Etiquette ---------- */

function EtiquetteSection({ destination }: { destination: NonNullable<ReturnType<typeof getDestinationById>> }) {
  return (
    <SectionCard icon={Info} title="Local Etiquette" delay={0.05}>
      <IconList items={destination.localEtiquette} icon={Info} iconColor="text-blue-400" />
    </SectionCard>
  );
}

/* ---------- Budget Breakdown ---------- */

function BudgetSection({
  dailyBudget,
  currency,
  estimatedTotal,
  budget,
}: {
  dailyBudget: number;
  currency: string;
  estimatedTotal: number;
  budget: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="glass-strong rounded-2xl border border-white/10 p-6"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
          <TrendingUp className="h-5 w-5" />
        </div>
        <h2 className="font-display text-xl font-semibold text-white">Budget Breakdown</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4">
          <div>
            <p className="text-xs text-muted-foreground">Daily Budget</p>
            <p className="font-display text-2xl font-bold text-white">
              ${dailyBudget}
              <span className="ml-1 text-sm font-normal text-muted-foreground">{currency}</span>
            </p>
          </div>
          <DollarSign className="h-6 w-6 text-emerald-400" />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4">
          <div>
            <p className="text-xs text-muted-foreground">Est. Total (7 days)</p>
            <p className="font-display text-2xl font-bold text-white">
              ${estimatedTotal}
              <span className="ml-1 text-sm font-normal text-muted-foreground">{currency}</span>
            </p>
          </div>
          <CalendarDays className="h-6 w-6 text-sky-400" />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4">
          <p className="text-xs text-muted-foreground">Category</p>
          <span
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-semibold',
              budget === 'budget'
                ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                : budget === 'mid-range'
                  ? 'border-sky-500/30 bg-sky-500/15 text-sky-300'
                  : 'border-amber-500/30 bg-amber-500/15 text-amber-300',
            )}
          >
            {budget === 'mid-range' ? 'Mid-range' : budget.charAt(0).toUpperCase() + budget.slice(1)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- Ratings ---------- */

const RATING_META = [
  { key: 'safetyRating', label: 'Safety', icon: Shield, color: 'bg-emerald-500' },
  { key: 'nightlifeRating', label: 'Nightlife', icon: Moon, color: 'bg-purple-500' },
  { key: 'familyRating', label: 'Family', icon: Baby, color: 'bg-sky-500' },
  { key: 'adventureRating', label: 'Adventure', icon: Mountain, color: 'bg-orange-500' },
  { key: 'foodRating', label: 'Food', icon: Utensils, color: 'bg-amber-500' },
] as const;

function RatingsSection({ destination }: { destination: NonNullable<ReturnType<typeof getDestinationById>> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: 0.05 }}
      className="glass-strong rounded-2xl border border-white/10 p-6"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-300">
          <Star className="h-5 w-5" />
        </div>
        <h2 className="font-display text-xl font-semibold text-white">Ratings</h2>
      </div>

      <div className="space-y-4">
        {RATING_META.map((r) => {
          const value = destination[r.key as keyof typeof destination] as number;
          return (
            <div key={r.key}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-white/80">
                  <r.icon className="h-4 w-4 text-muted-foreground" />
                  {r.label}
                </span>
                <span className="text-sm font-semibold text-white">{value}/10</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${value * 10}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={cn('h-full rounded-full', r.color)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ---------- Emergency Info ---------- */

function EmergencySection({ destination }: { destination: NonNullable<ReturnType<typeof getDestinationById>> }) {
  const contacts = [
    { label: 'Police', value: destination.emergencyNumbers.police, icon: Shield, color: 'border-blue-500/30 bg-blue-500/10 text-blue-300' },
    { label: 'Ambulance', value: destination.emergencyNumbers.ambulance, icon: HeartPulse, color: 'border-rose-500/30 bg-rose-500/10 text-rose-300' },
    { label: 'Fire', value: destination.emergencyNumbers.fire, icon: Flame, color: 'border-orange-500/30 bg-orange-500/10 text-orange-300' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-strong rounded-2xl border border-white/10 p-6"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-300">
          <Phone className="h-5 w-5" />
        </div>
        <h2 className="font-display text-xl font-semibold text-white">Emergency Info</h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {contacts.map((c) => (
          <div
            key={c.label}
            className={cn('rounded-xl border p-3 text-center', c.color)}
          >
            <c.icon className="mx-auto mb-2 h-5 w-5" />
            <p className="text-[11px] uppercase tracking-wide opacity-80">{c.label}</p>
            <p className="mt-1 font-display text-lg font-bold">{c.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ---------- Plan Trip Card ---------- */

function PlanTripCard({ destinationId, destinationName, dailyBudget, tags }: { destinationId: string; destinationName: string; dailyBudget: number; tags: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="glass-strong rounded-2xl border border-white/10 p-6"
    >
      <h3 className="font-display text-lg font-semibold text-white">Ready to go?</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Build a custom itinerary for {destinationName} with budgets, dates, and interests.
      </p>
      <Link
        href={`/planner?dest=${destinationId}&budget=${dailyBudget * 7}&duration=7&style=${tags.includes('adventure') ? 'adventure' : tags.includes('luxury') ? 'luxury' : tags.includes('family') ? 'family' : 'cultural'}`}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-500 hover:to-indigo-500"
      >
        <Compass className="h-4 w-4" />
        Plan Trip
      </Link>
      <Link
        href="/explore"
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-all hover:border-white/20 hover:bg-white/10"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Explore
      </Link>
    </motion.div>
  );
}

/* ---------- Not Found ---------- */

function NotFoundState() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 pt-24 text-center">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute inset-0 bg-aurora opacity-30" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-strong relative rounded-2xl border border-white/10 px-10 py-12"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
          <Compass className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="font-display text-3xl font-bold text-white">Destination not found</h1>
        <p className="mt-3 max-w-sm text-sm text-muted-foreground">
          The destination you&apos;re looking for doesn&apos;t exist or may have been moved. Head back
          to the Explore page to discover more places.
        </p>
        <Link
          href="/explore"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-500/20 px-5 py-2.5 text-sm font-medium text-blue-300 transition-all hover:bg-blue-500/30"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Explore
        </Link>
      </motion.div>
    </div>
  );
}
