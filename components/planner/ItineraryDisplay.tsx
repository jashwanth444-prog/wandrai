'use client';

import { motion } from 'framer-motion';
import {
  Clock, Hotel, Utensils, Wallet, MapPin, Calendar,
  Sun, Cloud, CloudRain, CloudSun, CloudSnow, Zap,
  Shield, Phone, Hospital, Pill, Backpack, Lightbulb,
  Coffee, UtensilsCrossed, Moon, Navigation, Star,
  CheckCircle2, Info, Sparkles,
} from 'lucide-react';
import type { GeneratedItinerary } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PACKING_CHECKLIST, TRAVEL_TIPS, WEATHER_DAYS } from '@/lib/constants';
import { getDestinationById } from '@/data/destinations';

const CATEGORY_COLORS: Record<string, string> = {
  sightseeing: 'text-blue-400 bg-blue-500/10',
  food: 'text-amber-400 bg-amber-500/10',
  transport: 'text-sky-400 bg-sky-500/10',
  relaxation: 'text-emerald-400 bg-emerald-500/10',
  shopping: 'text-rose-400 bg-rose-500/10',
  nightlife: 'text-purple-400 bg-purple-500/10',
  adventure: 'text-orange-400 bg-orange-500/10',
};

const CATEGORY_ICONS: Record<string, typeof Clock> = {
  sightseeing: MapPin,
  food: Utensils,
  transport: Navigation,
  relaxation: Sun,
  shopping: Wallet,
  nightlife: Moon,
  adventure: Zap,
};

const WEATHER_ICONS: Record<string, typeof Sun> = {
  sun: Sun,
  'cloud-sun': CloudSun,
  cloud: Cloud,
  'cloud-rain': CloudRain,
  'cloud-snow': CloudSnow,
};

const TIP_ICONS: Record<string, typeof Zap> = {
  clock: Clock,
  wallet: Wallet,
  phone: Phone,
  shield: Shield,
  utensils: Utensils,
  camera: MapPin,
};

function ChecklistItem({ item }: { item: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-white/20 bg-white/5" />
      {item}
    </li>
  );
}

function MealRow({ icon: Icon, label, value, color }: { icon: typeof Coffee; label: string; value: string; color: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg bg-white/5 p-2.5">
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} />
      <div>
        <p className="text-xs font-medium text-white">{label}</p>
        <p className="text-xs text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}

export default function ItineraryDisplay({
  itinerary,
  currency,
}: {
  itinerary: GeneratedItinerary;
  currency: string;
}) {
  const exploreDest = getDestinationById(itinerary.destination.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Trip Summary Header */}
      <div className="glass-strong rounded-2xl">
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <img
              src={itinerary.destination.image}
              alt={itinerary.destination.name}
              className="h-14 w-14 rounded-xl object-cover"
            />
            <div>
              <h3 className="font-display text-lg font-bold text-white">
                {itinerary.destination.name}, {itinerary.destination.country}
              </h3>
              <p className="text-sm text-muted-foreground">
                {itinerary.totalDays} days · {formatCurrency(itinerary.totalCost, currency)} estimated
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-white/5 p-3 text-center">
              <Calendar className="mx-auto mb-1 h-4 w-4 text-blue-400" />
              <p className="text-xs text-muted-foreground">Days</p>
              <p className="font-display text-lg font-bold text-white">{itinerary.totalDays}</p>
            </div>
            <div className="rounded-lg bg-white/5 p-3 text-center">
              <Wallet className="mx-auto mb-1 h-4 w-4 text-emerald-400" />
              <p className="text-xs text-muted-foreground">Total Cost</p>
              <p className="font-display text-sm font-bold text-white">{formatCurrency(itinerary.totalCost, currency)}</p>
            </div>
            <div className="rounded-lg bg-white/5 p-3 text-center">
              <MapPin className="mx-auto mb-1 h-4 w-4 text-purple-400" />
              <p className="text-xs text-muted-foreground">Daily Avg</p>
              <p className="font-display text-sm font-bold text-white">{formatCurrency(Math.round(itinerary.totalCost / itinerary.totalDays), currency)}</p>
            </div>
          </div>
        </div>

        {/* Daily Timeline */}
        <div className="max-h-[600px] space-y-4 overflow-y-auto p-5 scrollbar-hide">
          {itinerary.days.map((day, idx) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              {/* Day header */}
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <span className="rounded-md bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-300">
                    Day {day.day}
                  </span>
                  <h4 className="mt-1.5 font-display text-base font-semibold text-white">{day.title}</h4>
                  <p className="text-xs text-muted-foreground">{formatDate(day.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Day cost</p>
                  <p className="font-display text-sm font-bold text-emerald-400">{formatCurrency(day.totalCost, currency)}</p>
                </div>
              </div>

              {/* Timeline activities */}
              <div className="relative space-y-2.5 border-l border-white/10 pl-4">
                {day.activities.map((act, i) => {
                  const Icon = CATEGORY_ICONS[act.category] ?? Clock;
                  return (
                    <div key={i} className="relative">
                      <div className={`absolute -left-[21px] flex h-4 w-4 items-center justify-center rounded-full ${CATEGORY_COLORS[act.category] ?? 'bg-white/5'}`}>
                        <div className="h-1.5 w-1.5 rounded-full bg-current" />
                      </div>
                      <div className="rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/[0.07]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${CATEGORY_COLORS[act.category] ?? 'text-muted-foreground bg-white/5'}`}>
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <p className="text-sm font-medium text-white">{act.title}</p>
                          </div>
                          <span className="shrink-0 text-xs text-muted-foreground">{act.time}</span>
                        </div>
                        <p className="mt-1.5 pl-9 text-xs leading-relaxed text-muted-foreground">{act.description}</p>
                        <p className="mt-1 pl-9 text-xs font-medium text-emerald-400">{formatCurrency(act.cost, currency)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Meals section */}
              <div className="mt-3 space-y-2 border-t border-white/5 pt-3">
                <p className="mb-1 text-xs font-semibold text-white">Meals</p>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                  <MealRow icon={Coffee} label="Breakfast" value={day.meals.breakfast} color="text-amber-400" />
                  <MealRow icon={UtensilsCrossed} label="Lunch" value={day.meals.lunch} color="text-orange-400" />
                  <MealRow icon={Moon} label="Dinner" value={day.meals.dinner} color="text-purple-400" />
                </div>
              </div>

              {/* Accommodation */}
              <div className="mt-2 flex items-center gap-2 border-t border-white/5 pt-2">
                <Hotel className="h-3.5 w-3.5 shrink-0 text-sky-400" />
                <p className="text-xs text-muted-foreground">{day.accommodation}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Weather Forecast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-strong rounded-2xl p-5"
      >
        <h4 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold text-white">
          <Sun className="h-4 w-4 text-amber-400" />
          5-Day Weather Forecast
        </h4>
        <div className="grid grid-cols-5 gap-2">
          {WEATHER_DAYS.map((day, i) => {
            const WeatherIcon = WEATHER_ICONS[day.icon] ?? Sun;
            return (
              <div key={i} className="rounded-xl bg-white/5 p-3 text-center">
                <p className="mb-1.5 text-xs text-muted-foreground">{day.day}</p>
                <WeatherIcon className="mx-auto mb-1.5 h-6 w-6 text-blue-400" />
                <p className="text-xs font-semibold text-white">{day.high}°</p>
                <p className="text-xs text-muted-foreground">{day.low}°</p>
              </div>
            );
          })}
        </div>
        {exploreDest && (
          <p className="mt-3 text-xs text-muted-foreground">
            Current weather in {exploreDest.name}: {exploreDest.weather}, average {exploreDest.avgTemp}°C
          </p>
        )}
      </motion.div>

      {/* Packing Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-strong rounded-2xl p-5"
      >
        <h4 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold text-white">
          <Backpack className="h-4 w-4 text-purple-400" />
          Packing Checklist
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PACKING_CHECKLIST.map((category) => (
            <div key={category.category} className="rounded-xl bg-white/5 p-4">
              <p className="mb-2 text-xs font-semibold text-white">{category.category}</p>
              <ul className="space-y-1.5">
                {category.items.map((item) => (
                  <ChecklistItem key={item} item={item} />
                ))}
              </ul>
            </div>
          ))}
          {exploreDest && exploreDest.packingSuggestions.length > 0 && (
            <div className="rounded-xl bg-purple-500/5 border border-purple-500/10 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-white">
                <Sparkles className="h-3 w-3 text-purple-400" />
                Specific to {exploreDest.name}
              </p>
              <ul className="space-y-1.5">
                {exploreDest.packingSuggestions.map((item) => (
                  <ChecklistItem key={item} item={item} />
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>

      {/* Travel Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-strong rounded-2xl p-5"
      >
        <h4 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold text-white">
          <Lightbulb className="h-4 w-4 text-amber-400" />
          Travel Tips
        </h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TRAVEL_TIPS.map((tip, i) => {
            const Icon = TIP_ICONS[tip.icon] ?? Zap;
            return (
              <div key={i} className="flex gap-3 rounded-xl bg-white/5 p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                  <Icon className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{tip.title}</p>
                  <p className="text-xs text-muted-foreground">{tip.description}</p>
                </div>
              </div>
            );
          })}
          {exploreDest && exploreDest.travelTips.map((tip, i) => (
            <div key={`local-${i}`} className="flex gap-3 rounded-xl bg-amber-500/5 border border-amber-500/10 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                <Lightbulb className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-xs text-muted-foreground pt-1">{tip}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Emergency Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-strong rounded-2xl p-5"
      >
        <h4 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold text-white">
          <Shield className="h-4 w-4 text-red-400" />
          Emergency Information
        </h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {exploreDest ? (
            <>
              <div className="rounded-xl bg-red-500/5 border border-red-500/10 p-4">
                <Phone className="mb-2 h-5 w-5 text-red-400" />
                <p className="text-xs font-semibold text-white">Police</p>
                <p className="mt-1 font-display text-lg font-bold text-white">{exploreDest.emergencyNumbers.police}</p>
              </div>
              <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-4">
                <Hospital className="mb-2 h-5 w-5 text-emerald-400" />
                <p className="text-xs font-semibold text-white">Ambulance</p>
                <p className="mt-1 font-display text-lg font-bold text-white">{exploreDest.emergencyNumbers.ambulance}</p>
              </div>
              <div className="rounded-xl bg-orange-500/5 border border-orange-500/10 p-4">
                <Zap className="mb-2 h-5 w-5 text-orange-400" />
                <p className="text-xs font-semibold text-white">Fire</p>
                <p className="mt-1 font-display text-lg font-bold text-white">{exploreDest.emergencyNumbers.fire}</p>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl bg-red-500/5 border border-red-500/10 p-4">
                <Phone className="mb-2 h-5 w-5 text-red-400" />
                <p className="text-xs font-semibold text-white">Emergency Numbers</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Police, ambulance, and fire contacts are available in the Safety Hub for your destination.
                </p>
              </div>
              <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-4">
                <Hospital className="mb-2 h-5 w-5 text-emerald-400" />
                <p className="text-xs font-semibold text-white">Nearby Hospitals</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Find the closest medical facilities and pharmacies with real-time availability.
                </p>
              </div>
              <div className="rounded-xl bg-purple-500/5 border border-purple-500/10 p-4">
                <Pill className="mb-2 h-5 w-5 text-purple-400" />
                <p className="text-xs font-semibold text-white">Health & Vaccinations</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Check required vaccinations and medical advisories before you travel.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Local Etiquette */}
        {exploreDest && exploreDest.localEtiquette.length > 0 && (
          <div className="mt-4">
            <h5 className="mb-2 flex items-center gap-2 text-xs font-semibold text-white">
              <Info className="h-3.5 w-3.5 text-blue-400" />
              Local Etiquette in {exploreDest.name}
            </h5>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {exploreDest.localEtiquette.map((etiquette, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-blue-500/5 border border-blue-500/10 p-2.5">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" />
                  <p className="text-xs text-muted-foreground">{etiquette}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 rounded-xl bg-blue-500/5 border border-blue-500/10 p-3">
          <p className="text-xs text-muted-foreground">
            For full safety details, emergency contacts, and real-time alerts, visit the{' '}
            <a href="/safety" className="font-medium text-blue-400 hover:text-blue-300">Safety Hub</a>.
          </p>
        </div>
      </motion.div>

      {/* Destination Ratings */}
      {exploreDest && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-strong rounded-2xl p-5"
        >
          <h4 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold text-white">
            <Star className="h-4 w-4 text-amber-400" />
            Destination Ratings
          </h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              { label: 'Safety', value: exploreDest.safetyRating, color: 'bg-emerald-500' },
              { label: 'Food', value: exploreDest.foodRating, color: 'bg-amber-500' },
              { label: 'Nightlife', value: exploreDest.nightlifeRating, color: 'bg-purple-500' },
              { label: 'Family', value: exploreDest.familyRating, color: 'bg-blue-500' },
              { label: 'Adventure', value: exploreDest.adventureRating, color: 'bg-orange-500' },
            ].map((rating) => (
              <div key={rating.label} className="rounded-xl bg-white/5 p-3 text-center">
                <p className="mb-2 text-xs text-muted-foreground">{rating.label}</p>
                <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${rating.value * 10}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${rating.color}`}
                  />
                </div>
                <p className="font-display text-sm font-bold text-white">{rating.value}/10</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
