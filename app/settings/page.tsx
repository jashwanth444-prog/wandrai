'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Moon, Sun, Globe, DollarSign, Ruler, Bell, Plane,
  Palette, Languages, Check, Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import SectionHeading from '@/components/shared/SectionHeading';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

/* ============================================================================
 * Types & static option data
 * ========================================================================== */

type ThemeId = 'dark' | 'light' | 'auto';
type CurrencyId = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CHF' | 'AED' | 'IDR' | 'THB' | 'AUD' | 'CAD';
type UnitSystem = 'metric' | 'imperial';
type TravelStyle = 'adventure' | 'cultural' | 'relaxation' | 'luxury' | 'backpacker';
type HotelPreference = 'budget' | 'midrange' | 'luxury' | 'boutique' | 'hostel';
type TransportPreference = 'flight' | 'train' | 'road' | 'bus' | 'cruise';

interface SettingsState {
  theme: ThemeId;
  language: string;
  currency: CurrencyId;
  units: UnitSystem;
  notifications: {
    tripReminders: boolean;
    safetyAlerts: boolean;
    priceDrops: boolean;
    newsletter: boolean;
    newFeatures: boolean;
  };
  travel: {
    style: TravelStyle;
    hotel: HotelPreference;
    maxBudget: number;
    transport: TransportPreference;
  };
}

const DEFAULT_SETTINGS: SettingsState = {
  theme: 'dark',
  language: 'English',
  currency: 'USD',
  units: 'metric',
  notifications: {
    tripReminders: true,
    safetyAlerts: true,
    priceDrops: false,
    newsletter: true,
    newFeatures: true,
  },
  travel: {
    style: 'adventure',
    hotel: 'midrange',
    maxBudget: 3000,
    transport: 'flight',
  },
};

const STORAGE_KEY = 'wandrai-settings';

const THEMES: { id: ThemeId; label: string; icon: typeof Moon; available: boolean }[] = [
  { id: 'dark', label: 'Dark', icon: Moon, available: true },
  { id: 'light', label: 'Light', icon: Sun, available: false },
  { id: 'auto', label: 'Auto', icon: Palette, available: false },
];

const LANGUAGES: { name: string; flag: string; native: string }[] = [
  { name: 'English', flag: '🇬🇧', native: 'English' },
  { name: 'French', flag: '🇫🇷', native: 'Français' },
  { name: 'Spanish', flag: '🇪🇸', native: 'Español' },
  { name: 'Japanese', flag: '🇯🇵', native: '日本語' },
  { name: 'German', flag: '🇩🇪', native: 'Deutsch' },
  { name: 'Arabic', flag: '🇦🇪', native: 'العربية' },
];

const CURRENCIES: { id: CurrencyId; symbol: string; label: string }[] = [
  { id: 'USD', symbol: '$', label: 'US Dollar' },
  { id: 'EUR', symbol: '€', label: 'Euro' },
  { id: 'GBP', symbol: '£', label: 'British Pound' },
  { id: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { id: 'CHF', symbol: 'CHF', label: 'Swiss Franc' },
  { id: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
  { id: 'IDR', symbol: 'Rp', label: 'Indonesian Rupiah' },
  { id: 'THB', symbol: '฿', label: 'Thai Baht' },
  { id: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { id: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
];

const UNIT_SYSTEMS: { id: UnitSystem; label: string; example: string }[] = [
  { id: 'metric', label: 'Metric', example: 'km · °C · kg' },
  { id: 'imperial', label: 'Imperial', example: 'mi · °F · lb' },
];

const NOTIFICATION_OPTIONS: {
  key: keyof SettingsState['notifications'];
  label: string;
  description: string;
}[] = [
  { key: 'tripReminders', label: 'Trip reminders', description: 'Get notified before your upcoming trips and check-ins.' },
  { key: 'safetyAlerts', label: 'Safety alerts', description: 'Receive real-time alerts about safety conditions at your destinations.' },
  { key: 'priceDrops', label: 'Price drops', description: 'Be the first to know when flight and hotel prices drop for saved trips.' },
  { key: 'newsletter', label: 'Newsletter', description: 'Monthly travel inspiration, tips, and curated destination guides.' },
  { key: 'newFeatures', label: 'New features', description: 'Hear about new WandrAI tools and product updates as they ship.' },
];

const TRAVEL_STYLES: { id: TravelStyle; label: string; emoji: string }[] = [
  { id: 'adventure', label: 'Adventure', emoji: '🧗' },
  { id: 'cultural', label: 'Cultural', emoji: '🏛️' },
  { id: 'relaxation', label: 'Relaxation', emoji: '🏖️' },
  { id: 'luxury', label: 'Luxury', emoji: '💎' },
  { id: 'backpacker', label: 'Backpacker', emoji: '🎒' },
];

const HOTEL_PREFERENCES: { id: HotelPreference; label: string; price: string }[] = [
  { id: 'hostel', label: 'Hostel', price: '$' },
  { id: 'budget', label: 'Budget', price: '$$' },
  { id: 'midrange', label: 'Mid-range', price: '$$$' },
  { id: 'boutique', label: 'Boutique', price: '$$$$' },
  { id: 'luxury', label: 'Luxury', price: '$$$$$' },
];

const TRANSPORT_OPTIONS: { id: TransportPreference; label: string; emoji: string }[] = [
  { id: 'flight', label: 'Flight', emoji: '✈️' },
  { id: 'train', label: 'Train', emoji: '🚆' },
  { id: 'road', label: 'Road trip', emoji: '🚗' },
  { id: 'bus', label: 'Bus', emoji: '🚌' },
  { id: 'cruise', label: 'Cruise', emoji: '🚢' },
];

const SECTIONS = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'language', label: 'Language', icon: Languages },
  { id: 'currency', label: 'Currency', icon: DollarSign },
  { id: 'units', label: 'Units', icon: Ruler },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'travel', label: 'Travel Preferences', icon: Plane },
] as const;

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.21, 0.47, 0.32, 0.98] as const },
  }),
};

/* ============================================================================
 * Main page component
 * ========================================================================== */

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('appearance');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  /* ---------- Hydrate from localStorage on mount ---------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SettingsState>;
        // Deep-merge with defaults so missing keys never break the UI.
        setSettings((prev) => ({
          ...prev,
          ...parsed,
          notifications: { ...prev.notifications, ...(parsed.notifications ?? {}) },
          travel: { ...prev.travel, ...(parsed.travel ?? {}) },
        }));
      }
    } catch {
      /* corrupt/missing storage — keep defaults */
    }
    setHydrated(true);
  }, []);

  /* ---------- Scroll-spy: highlight the active sidebar nav item ---------- */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [hydrated]);

  const scrollToSection = (id: string) => {
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  /* ---------- Persist ---------- */
  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* storage full / disabled — non-fatal */
    }
    toast({
      title: 'Saved!',
      description: 'Your settings have been saved successfully.',
    });
  };

  /* ---------- Generic updaters ---------- */
  const updateField = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const updateNotification = (key: keyof SettingsState['notifications'], value: boolean) =>
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));

  const updateTravel = <K extends keyof SettingsState['travel']>(key: K, value: SettingsState['travel'][K]) =>
    setSettings((prev) => ({
      ...prev,
      travel: { ...prev.travel, [key]: value },
    }));

  const selectedCurrency = CURRENCIES.find((c) => c.id === settings.currency);

  return (
    <div className="relative min-h-screen pt-24">
      {/* Background flourishes */}
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute inset-0 bg-aurora opacity-30" />

      <div className="relative mx-auto max-w-7xl px-6 py-12">
        {/* Heading */}
        <SectionHeading
          badge="Personalize Your Experience"
          badgeColor="purple"
          title={
            <>
              <span className="text-white">Settings</span>
            </>
          }
          description="Customize WandrAI to match your travel style, currency, language, and notification preferences — all saved locally on your device."
        />

        {/* Main layout: sidebar + content */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          {/* ---------------- Sidebar nav ---------------- */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <nav className="glass rounded-2xl p-3">
              <div className="mb-3 flex items-center gap-2 px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Settings className="h-3.5 w-3.5" /> Sections
              </div>
              <ul className="space-y-1">
                {SECTIONS.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <li key={section.id}>
                      <button
                        onClick={() => scrollToSection(section.id)}
                        className={cn(
                          'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                          isActive
                            ? 'bg-blue-500/15 text-blue-300'
                            : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0 transition-colors',
                            isActive ? 'text-blue-400' : 'text-muted-foreground group-hover:text-white'
                          )}
                        />
                        {section.label}
                        {isActive && (
                          <motion.span
                            layoutId="nav-active"
                            className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400"
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </motion.aside>

          {/* ---------------- Content column ---------------- */}
          <div className="space-y-8">
            {/* 1. Appearance */}
            <SettingsCard index={0} icon={Palette} title="Appearance" description="Choose how WandrAI looks. We&apos;re dark-first — more themes are on the way.">
              <div
                id="appearance"
                ref={(el) => { sectionRefs.current['appearance'] = el; }}
                className="-m-6 p-6"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {THEMES.map((theme) => {
                    const Icon = theme.icon;
                    const isActive = settings.theme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        disabled={!theme.available}
                        onClick={() => theme.available && updateField('theme', theme.id)}
                        className={cn(
                          'group relative flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all',
                          isActive
                            ? 'border-blue-500/50 bg-blue-500/10'
                            : theme.available
                              ? 'border-white/10 bg-white/5 hover:border-white/20'
                              : 'cursor-not-allowed border-white/5 bg-white/[0.02] opacity-60',
                          theme.available && 'hover:-translate-y-0.5'
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-12 w-12 items-center justify-center rounded-xl',
                            isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-muted-foreground'
                          )}
                        >
                          <Icon className="h-6 w-6" />
                        </span>
                        <span className={cn('font-display text-sm font-semibold', isActive ? 'text-white' : 'text-muted-foreground')}>
                          {theme.label}
                        </span>
                        {isActive && (
                          <motion.span
                            layoutId="theme-active"
                            className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500"
                          >
                            <Check className="h-3 w-3 text-white" />
                          </motion.span>
                        )}
                        {!theme.available && (
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            Coming soon
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </SettingsCard>

            {/* 2. Language */}
            <SettingsCard index={1} icon={Languages} title="Language" description="Pick your preferred interface language. Changes are saved on this device.">
              <div
                id="language"
                ref={(el) => { sectionRefs.current['language'] = el; }}
                className="-m-6 p-6"
              >
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {LANGUAGES.map((lang) => {
                    const isActive = settings.language === lang.name;
                    return (
                      <button
                        key={lang.name}
                        onClick={() => updateField('language', lang.name)}
                        className={cn(
                          'group relative flex items-center gap-3 rounded-xl border p-3 text-left transition-all',
                          isActive
                            ? 'border-blue-500/50 bg-blue-500/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:-translate-y-0.5'
                        )}
                      >
                        <span className="text-2xl">{lang.flag}</span>
                        <div className="min-w-0">
                          <p className={cn('truncate text-sm font-semibold', isActive ? 'text-white' : 'text-white/90')}>
                            {lang.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{lang.native}</p>
                        </div>
                        {isActive && (
                          <motion.span
                            layoutId="lang-active"
                            className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500"
                          >
                            <Check className="h-2.5 w-2.5 text-white" />
                          </motion.span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </SettingsCard>

            {/* 3. Currency */}
            <SettingsCard index={2} icon={DollarSign} title="Currency" description="Set the default currency used for budgets, expenses, and price estimates.">
              <div
                id="currency"
                ref={(el) => { sectionRefs.current['currency'] = el; }}
                className="-m-6 p-6"
              >
                {/* Custom dropdown */}
                <div className="relative max-w-xs">
                  <button
                    onClick={() => setCurrencyOpen((o) => !o)}
                    className={cn(
                      'glass flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors',
                      currencyOpen ? 'border-blue-500/40' : 'hover:border-white/20'
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 font-display text-sm font-bold text-blue-300">
                        {selectedCurrency?.symbol}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-white">{settings.currency}</span>
                        <span className="block text-xs text-muted-foreground">{selectedCurrency?.label}</span>
                      </span>
                    </span>
                    <Globe className={cn('h-4 w-4 text-muted-foreground transition-transform', currencyOpen && 'rotate-180')} />
                  </button>

                  <AnimatePresence>
                    {currencyOpen && (
                      <motion.ul
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                        className="glass-strong absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl p-1.5 scrollbar-hide"
                      >
                        {CURRENCIES.map((c) => {
                          const isActive = settings.currency === c.id;
                          return (
                            <li key={c.id}>
                              <button
                                onClick={() => {
                                  updateField('currency', c.id);
                                  setCurrencyOpen(false);
                                }}
                                className={cn(
                                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                                  isActive ? 'bg-blue-500/15 text-blue-300' : 'hover:bg-white/5'
                                )}
                              >
                                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/5 font-display text-xs font-bold text-white/80">
                                  {c.symbol}
                                </span>
                                <span className="flex-1">
                                  <span className="block text-sm font-semibold text-white">{c.id}</span>
                                  <span className="block text-xs text-muted-foreground">{c.label}</span>
                                </span>
                                {isActive && <Check className="h-4 w-4 text-blue-400" />}
                              </button>
                            </li>
                          );
                        })}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </SettingsCard>

            {/* 4. Units */}
            <SettingsCard index={3} icon={Ruler} title="Units" description="Choose between metric and imperial for distances, temperature, and weight.">
              <div
                id="units"
                ref={(el) => { sectionRefs.current['units'] = el; }}
                className="-m-6 p-6"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {UNIT_SYSTEMS.map((unit) => {
                    const isActive = settings.units === unit.id;
                    return (
                      <button
                        key={unit.id}
                        onClick={() => updateField('units', unit.id)}
                        className={cn(
                          'group relative flex items-center justify-between rounded-2xl border p-5 transition-all',
                          isActive
                            ? 'border-blue-500/50 bg-blue-500/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:-translate-y-0.5'
                        )}
                      >
                        <div>
                          <p className={cn('font-display text-base font-semibold', isActive ? 'text-white' : 'text-white/90')}>
                            {unit.label}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{unit.example}</p>
                        </div>
                        <span
                          className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors',
                            isActive ? 'border-blue-500 bg-blue-500' : 'border-white/20'
                          )}
                        >
                          {isActive && <Check className="h-3.5 w-3.5 text-white" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </SettingsCard>

            {/* 5. Notifications */}
            <SettingsCard index={4} icon={Bell} title="Notifications" description="Decide what WandrAI pings you about. You can change these anytime.">
              <div
                id="notifications"
                ref={(el) => { sectionRefs.current['notifications'] = el; }}
                className="-m-6 space-y-1 p-6"
              >
                {NOTIFICATION_OPTIONS.map((opt) => (
                  <div
                    key={opt.key}
                    className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 transition-colors hover:border-white/10"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">{opt.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{opt.description}</p>
                    </div>
                    <Switch
                      checked={settings.notifications[opt.key]}
                      onCheckedChange={(v) => updateNotification(opt.key, v)}
                      aria-label={opt.label}
                    />
                  </div>
                ))}
              </div>
            </SettingsCard>

            {/* 6. Travel Preferences */}
            <SettingsCard index={5} icon={Plane} title="Travel Preferences" description="Tell us how you like to travel so we can tailor recommendations and itineraries.">
              <div
                id="travel"
                ref={(el) => { sectionRefs.current['travel'] = el; }}
                className="-m-6 space-y-6 p-6"
              >
                {/* Travel style */}
                <FieldGroup label="Default travel style">
                  <div className="flex flex-wrap gap-2">
                    {TRAVEL_STYLES.map((style) => {
                      const isActive = settings.travel.style === style.id;
                      return (
                        <button
                          key={style.id}
                          onClick={() => updateTravel('style', style.id)}
                          className={cn(
                            'flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all',
                            isActive
                              ? 'border-blue-500/50 bg-blue-500/15 text-blue-200'
                              : 'border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-white'
                          )}
                        >
                          <span>{style.emoji}</span>
                          {style.label}
                        </button>
                      );
                    })}
                  </div>
                </FieldGroup>

                {/* Hotel preference */}
                <FieldGroup label="Default hotel preference">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {HOTEL_PREFERENCES.map((hotel) => {
                      const isActive = settings.travel.hotel === hotel.id;
                      return (
                        <button
                          key={hotel.id}
                          onClick={() => updateTravel('hotel', hotel.id)}
                          className={cn(
                            'flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition-all',
                            isActive
                              ? 'border-blue-500/50 bg-blue-500/10'
                              : 'border-white/10 bg-white/5 hover:border-white/20 hover:-translate-y-0.5'
                          )}
                        >
                          <span className={cn('text-sm font-semibold', isActive ? 'text-white' : 'text-white/90')}>
                            {hotel.label}
                          </span>
                          <span className="text-xs font-medium text-amber-400">{hotel.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </FieldGroup>

                {/* Max budget slider */}
                <FieldGroup label="Max budget per trip">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="mb-4 flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">Drag to set your ceiling</span>
                      <motion.span
                        key={settings.travel.maxBudget}
                        initial={{ scale: 1.08 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.15 }}
                        className="font-display text-2xl font-bold text-gradient-blue"
                      >
                        {selectedCurrency?.symbol}
                        {settings.travel.maxBudget.toLocaleString()}
                      </motion.span>
                    </div>
                    <Slider
                      value={[settings.travel.maxBudget]}
                      onValueChange={(v) => updateTravel('maxBudget', v[0] ?? settings.travel.maxBudget)}
                      min={500}
                      max={20000}
                      step={100}
                      className="[&_[data-orientation=horizontal]>span:first-child]:bg-secondary"
                    />
                    <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                      <span>{selectedCurrency?.symbol}500</span>
                      <span>{selectedCurrency?.symbol}20,000</span>
                    </div>
                  </div>
                </FieldGroup>

                {/* Preferred transport */}
                <FieldGroup label="Preferred transport">
                  <div className="flex flex-wrap gap-2">
                    {TRANSPORT_OPTIONS.map((t) => {
                      const isActive = settings.travel.transport === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => updateTravel('transport', t.id)}
                          className={cn(
                            'flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all',
                            isActive
                              ? 'border-blue-500/50 bg-blue-500/15 text-blue-200'
                              : 'border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-white'
                          )}
                        >
                          <span>{t.emoji}</span>
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </FieldGroup>
              </div>
            </SettingsCard>

            {/* ---------------- Save bar ---------------- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="glass-strong sticky bottom-6 z-10 flex items-center justify-between gap-4 rounded-2xl p-4"
            >
              <p className="hidden text-sm text-muted-foreground sm:block">
                Changes are saved to this device only.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="group ml-auto inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-display text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-500"
              >
                <Save className="h-4 w-4 transition-transform group-hover:scale-110" />
                Save settings
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Toast renderer — mounted locally so toasts always show */}
      <Toaster />
    </div>
  );
}

/* ============================================================================
 * Presentational sub-components
 * ========================================================================== */

function SettingsCard({
  index,
  icon: Icon,
  title,
  description,
  children,
}: {
  index: number;
  icon: typeof Settings;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className="glass-strong scroll-mt-24 overflow-hidden rounded-2xl"
    >
      <div className="flex items-start gap-4 border-b border-white/[0.08] p-6 pb-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-display text-lg font-bold text-white">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </motion.section>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
