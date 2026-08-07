'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, Loader2, MapPin, Users, Calendar, Wallet, Hotel, Plane, Car, Train } from 'lucide-react';
import { DESTINATIONS } from '@/lib/constants';
import { EXPLORE_DESTINATIONS } from '@/data/destinations';
import { formatCurrency, daysBetween, formatDate } from '@/lib/utils';
import { generateItinerary } from '@/services/itinerary-generator';
import type { Destination, GeneratedItinerary, TripPlanForm, TravelStyle, Interest } from '@/types';
import ItineraryDisplay from '@/components/planner/ItineraryDisplay';
import { PDFExportButton, ShareTripButton } from '@/components/shared/PdfExport';

const PlannerGlobe = dynamic(() => import('@/components/3d/PlannerGlobe'), { ssr: false });

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AED', 'IDR', 'THB', 'AUD', 'CAD'];

const TRAVEL_STYLES: { value: TravelStyle; label: string; emoji: string }[] = [
  { value: 'luxury', label: 'Luxury', emoji: '💎' },
  { value: 'adventure', label: 'Adventure', emoji: '🏔' },
  { value: 'budget', label: 'Budget', emoji: '🎒' },
  { value: 'cultural', label: 'Cultural', emoji: '🏛' },
  { value: 'relaxation', label: 'Relaxation', emoji: '🏖' },
  { value: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
];

const INTERESTS: { value: Interest; label: string }[] = [
  { value: 'food', label: 'Food & Drink' },
  { value: 'history', label: 'History' },
  { value: 'nature', label: 'Nature' },
  { value: 'nightlife', label: 'Nightlife' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'art', label: 'Art & Museums' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'beaches', label: 'Beaches' },
];

const TRANSPORT_OPTIONS: { value: TripPlanForm['transportation']; label: string; icon: typeof Plane }[] = [
  { value: 'flight', label: 'Flight', icon: Plane },
  { value: 'train', label: 'Train', icon: Train },
  { value: 'car', label: 'Car', icon: Car },
  { value: 'mixed', label: 'Mixed', icon: MapPin },
];
const HOTEL_OPTIONS: { value: TripPlanForm['hotelPreference']; label: string }[] = [
  { value: 'budget', label: 'Budget' },
  { value: 'mid-range', label: 'Mid-Range' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'boutique', label: 'Boutique' },
];

const schema = z.object({
  destinationId: z.string().min(1, 'Select a destination'),
  budget: z.number().min(100, 'Budget must be at least $100'),
  currency: z.string(),
  travelers: z.number().min(1, 'At least 1 traveler').max(20, 'Max 20 travelers'),
  startDate: z.string().min(1, 'Pick a start date'),
  endDate: z.string().min(1, 'Pick an end date'),
  travelStyle: z.string().min(1, 'Choose a style'),
  interests: z.array(z.string()).min(1, 'Pick at least one interest'),
  transportation: z.string(),
  hotelPreference: z.string(),
});

const ALL_DESTINATIONS = [
  ...DESTINATIONS,
  ...EXPLORE_DESTINATIONS.filter((ed) => !DESTINATIONS.some((d) => d.id === ed.id)).map((ed) => ({
    id: ed.id,
    name: ed.name,
    country: ed.country,
    continent: ed.continent,
    image: ed.heroImage,
    rating: 4.5,
    reviews: 0,
    budgetPerDay: ed.dailyBudget,
    currency: ed.currency,
    bestSeason: ed.bestMonths,
    description: ed.description,
    attractions: ed.attractions,
    coordinates: ed.coordinates,
    color: ed.color,
  })),
];

function PlannerContent() {
  const searchParams = useSearchParams();
  const presetDest = searchParams.get('dest');
  const presetBudget = searchParams.get('budget');
  const presetDuration = searchParams.get('duration');
  const presetStyle = searchParams.get('style');
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [generating, setGenerating] = useState(false);

  const presetBudgetNum = presetBudget ? parseInt(presetBudget, 10) : 2000;
  const validStyle = (['luxury', 'adventure', 'budget', 'cultural', 'relaxation', 'family'] as const).includes(presetStyle as TravelStyle)
    ? (presetStyle as TravelStyle)
    : 'cultural';

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TripPlanForm>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      destinationId: presetDest || '',
      budget: presetBudgetNum,
      currency: 'USD',
      travelers: 2,
      startDate: '',
      endDate: '',
      travelStyle: validStyle,
      interests: ['food', 'history'],
      transportation: 'flight',
      hotelPreference: 'mid-range',
    },
  });

  useEffect(() => {
    if (presetDest) setValue('destinationId', presetDest, { shouldValidate: true });
    if (presetBudget) setValue('budget', presetBudgetNum, { shouldValidate: true });
    if (presetStyle) setValue('travelStyle', validStyle, { shouldValidate: true });
    if (presetDuration) {
      const days = parseInt(presetDuration, 10);
      const today = new Date();
      const start = today.toISOString().split('T')[0];
      const end = new Date(today.getTime() + days * 86400000).toISOString().split('T')[0];
      setValue('startDate', start, { shouldValidate: true });
      setValue('endDate', end, { shouldValidate: true });
    }
  }, [presetDest, presetBudget, presetStyle, presetDuration, setValue, presetBudgetNum, validStyle]);

  const selectedDestId = watch('destinationId');
  const selectedBudget = watch('budget');
  const selectedCurrency = watch('currency');
  const selectedTravelers = watch('travelers');
  const selectedStyle = watch('travelStyle');
  const selectedInterests = watch('interests') as Interest[];
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const selectedDestination: Destination | null =
    ALL_DESTINATIONS.find((d) => d.id === selectedDestId) ?? null;

  const tripDays = daysBetween(startDate, endDate);

  const onSubmit = (data: TripPlanForm) => {
    setGenerating(true);
    setItinerary(null);
    setTimeout(() => {
      const result = generateItinerary(data);
      setItinerary(result);
      setGenerating(false);
    }, 1800);
  };

  const toggleInterest = (interest: Interest) => {
    const current = selectedInterests;
    const updated = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest];
    setValue('interests', updated, { shouldValidate: true });
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
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">AI Trip Generator</span>
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="text-white">Design Your </span>
            <span className="text-gradient-blue">Perfect Trip</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Tell us your preferences and let AI craft a detailed day-by-day itinerary with budget breakdowns.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-strong rounded-2xl p-6 sm:p-8"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Destination */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                  <MapPin className="h-4 w-4 text-blue-400" /> Destination
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 max-h-[200px] overflow-y-auto scrollbar-hide">
                  {ALL_DESTINATIONS.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setValue('destinationId', d.id, { shouldValidate: true })}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all ${
                        selectedDestId === d.id
                          ? 'border-blue-500/50 bg-blue-500/15 text-white'
                          : 'border-white/10 bg-white/5 text-muted-foreground hover:border-white/20'
                      }`}
                    >
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.color }} />
                      <span className="truncate">{d.name}</span>
                    </button>
                  ))}
                </div>
                {errors.destinationId && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.destinationId.message}</p>
                )}
              </div>

              {/* Budget + Currency */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                    <Wallet className="h-4 w-4 text-emerald-400" /> Budget: {formatCurrency(selectedBudget, selectedCurrency)}
                  </label>
                  <input
                    type="range"
                    min={100}
                    max={20000}
                    step={100}
                    {...register('budget', { valueAsNumber: true })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Currency</label>
                  <select
                    {...register('currency')}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-blue-500/50 focus:outline-none"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c} className="bg-card">{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Travelers */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                  <Users className="h-4 w-4 text-purple-400" /> Travelers: {selectedTravelers}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setValue('travelers', Math.max(1, selectedTravelers - 1), { shouldValidate: true })}
                    className="flex h-9 w-9 items-center justify-center rounded-lg glass text-lg font-bold"
                  >
                    –
                  </button>
                  <div className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-center text-sm text-white">
                    {selectedTravelers} {selectedTravelers === 1 ? 'person' : 'people'}
                  </div>
                  <button
                    type="button"
                    onClick={() => setValue('travelers', Math.min(20, selectedTravelers + 1), { shouldValidate: true })}
                    className="flex h-9 w-9 items-center justify-center rounded-lg glass text-lg font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                    <Calendar className="h-4 w-4 text-amber-400" /> Start Date
                  </label>
                  <input
                    type="date"
                    {...register('startDate')}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-blue-500/50 focus:outline-none [color-scheme:dark]"
                  />
                  {errors.startDate && <p className="mt-1.5 text-xs text-red-400">{errors.startDate.message}</p>}
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                    <Calendar className="h-4 w-4 text-amber-400" /> End Date
                  </label>
                  <input
                    type="date"
                    {...register('endDate')}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-blue-500/50 focus:outline-none [color-scheme:dark]"
                  />
                  {errors.endDate && <p className="mt-1.5 text-xs text-red-400">{errors.endDate.message}</p>}
                </div>
              </div>
              {tripDays > 0 && (
                <div className="rounded-lg bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
                  Trip duration: {tripDays} {tripDays === 1 ? 'day' : 'days'}
                </div>
              )}

              {/* Travel Style */}
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Travel Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {TRAVEL_STYLES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setValue('travelStyle', s.value, { shouldValidate: true })}
                      className={`rounded-lg border px-3 py-3 text-center text-sm transition-all ${
                        selectedStyle === s.value
                          ? 'border-purple-500/50 bg-purple-500/15 text-white'
                          : 'border-white/10 bg-white/5 text-muted-foreground hover:border-white/20'
                      }`}
                    >
                      <div className="text-lg">{s.emoji}</div>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Interests</label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => {
                    const active = selectedInterests.includes(interest.value);
                    return (
                      <button
                        key={interest.value}
                        type="button"
                        onClick={() => toggleInterest(interest.value)}
                        className={`rounded-full border px-3.5 py-1.5 text-sm transition-all ${
                          active
                            ? 'border-blue-500/50 bg-blue-500/15 text-white'
                            : 'border-white/10 bg-white/5 text-muted-foreground hover:border-white/20'
                        }`}
                      >
                        {interest.label}
                      </button>
                    );
                  })}
                </div>
                {errors.interests && <p className="mt-1.5 text-xs text-red-400">{errors.interests.message as string}</p>}
              </div>

              {/* Transport + Hotel */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Transportation</label>
                  <div className="grid grid-cols-4 gap-2">
                    {TRANSPORT_OPTIONS.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setValue('transportation', t.value)}
                        className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs transition-all ${
                          watch('transportation') === t.value
                            ? 'border-blue-500/50 bg-blue-500/15 text-white'
                            : 'border-white/10 bg-white/5 text-muted-foreground'
                        }`}
                      >
                        <t.icon className="h-4 w-4" />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                    <Hotel className="h-4 w-4 text-sky-400" /> Hotel Preference
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {HOTEL_OPTIONS.map((h) => (
                      <button
                        key={h.value}
                        type="button"
                        onClick={() => setValue('hotelPreference', h.value)}
                        className={`rounded-lg border px-3 py-2.5 text-sm transition-all ${
                          watch('hotelPreference') === h.value
                            ? 'border-sky-500/50 bg-sky-500/15 text-white'
                            : 'border-white/10 bg-white/5 text-muted-foreground'
                        }`}
                      >
                        {h.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={generating}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-base font-semibold text-white shadow-neon transition-all hover:shadow-neon-purple disabled:opacity-60"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating Your Itinerary…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate Trip
                  </>
                )}
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </button>
            </form>
          </motion.div>

          {/* Globe + Itinerary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="glass-strong relative h-[400px] overflow-hidden rounded-2xl">
              <PlannerGlobe selectedDestination={selectedDestination} />
              {!selectedDestination && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <MapPin className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Select a destination to see it on the globe</p>
                  </div>
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {generating && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass rounded-2xl p-8 text-center"
                >
                  <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-blue-400" />
                  <p className="text-sm text-muted-foreground">AI is crafting your perfect itinerary…</p>
                  <div className="mx-auto mt-4 max-w-xs space-y-2">
                    <div className="h-2 animate-pulse rounded-full bg-white/10" />
                    <div className="h-2 w-3/4 animate-pulse rounded-full bg-white/5" />
                  </div>
                </motion.div>
              )}

              {itinerary && !generating && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <PDFExportButton itinerary={itinerary} currency={selectedCurrency} label="Download PDF" />
                    <ShareTripButton tripName={`${itinerary.destination.name} Trip`} tripId={itinerary.destination.id} />
                  </div>
                  <ItineraryDisplay key="itinerary" itinerary={itinerary} currency={selectedCurrency} />
                </div>
              )}

              {!itinerary && !generating && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass rounded-2xl p-8 text-center"
                >
                  <Sparkles className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Fill out the form and click Generate Trip to see your personalized itinerary.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center pt-24">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-500" />
        </div>
      }
    >
      <PlannerContent />
    </Suspense>
  );
}
