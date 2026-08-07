'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plane,
  ShieldCheck,
  Syringe,
  AlertTriangle,
  Phone,
  Coins,
  Plug,
  Clock,
  Wifi,
  FileText,
  CheckCircle2,
  XCircle,
  MapPin,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { VISA_INFO } from '@/lib/feature-constants';
import { cn, safetyLevelColor, safetyLevelLabel } from '@/lib/utils';
import SectionHeading from '@/components/shared/SectionHeading';
import type { VisaInfo } from '@/types';

/* ------------------------------------------------------------------ */
/* Small reusable building blocks kept local to the page               */
/* ------------------------------------------------------------------ */

type DetailRowProps = {
  icon: LucideIcon;
  iconClass?: string;
  label: string;
  children: React.ReactNode;
};

function DetailRow({ icon: Icon, iconClass = 'text-blue-400', label, children }: DetailRowProps) {
  return (
    <div className="rounded-xl bg-white/5 p-4">
      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        <Icon className={cn('h-4 w-4', iconClass)} /> {label}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ContactLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function VisaPage() {
  const [selectedVisa, setSelectedVisa] = useState<VisaInfo>(VISA_INFO[0]);
  const [search, setSearch] = useState('');

  const filteredVisas = useMemo(
    () =>
      VISA_INFO.filter((v) =>
        v.country.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  return (
    <div className="relative min-h-screen pt-24">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute inset-0 bg-aurora opacity-30" />
      <div className="relative mx-auto max-w-7xl px-6 py-12">
        <SectionHeading
          badge="Visa & Travel Requirements"
          badgeColor="blue"
          title={
            <>
              <span className="text-white">Visa </span>
              <span className="text-gradient-blue">Center</span>
            </>
          }
          description="Visa requirements, vaccinations, travel advisories and essential info for every destination — so you arrive ready."
        />

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mt-8 max-w-xl"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search countries…"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-muted-foreground focus:border-blue-500/50 focus:outline-none"
            />
          </div>
        </motion.div>

        {/* Country list + detail panel */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: scrollable country list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-2xl p-5"
          >
            <h3 className="mb-3 font-display text-sm font-semibold text-white">
              Countries
            </h3>
            <div className="max-h-[600px] space-y-2 overflow-y-auto scrollbar-hide">
              {filteredVisas.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No countries found.
                </p>
              ) : (
                filteredVisas.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVisa(v)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border p-3 transition-all',
                      selectedVisa.id === v.id
                        ? 'border-blue-500/50 bg-blue-500/10'
                        : 'border-white/5 bg-white/5 hover:border-white/15'
                    )}
                  >
                    <span className="text-2xl">{v.flag}</span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white">{v.country}</p>
                      <p className="text-xs text-muted-foreground">
                        {v.visaRequired ? 'Visa required' : 'Visa-free'}
                      </p>
                    </div>
                    {v.visaRequired ? (
                      <XCircle className="h-4 w-4 text-amber-400" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>

          {/* Right: detailed visa info panel */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedVisa.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="glass-strong rounded-2xl p-5"
              >
                {/* Header */}
                <div className="mb-5 flex flex-wrap items-center gap-4">
                  <span className="text-4xl">{selectedVisa.flag}</span>
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">
                      {selectedVisa.country}
                    </h3>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {selectedVisa.code}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium',
                        selectedVisa.visaRequired
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                          : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      )}
                    >
                      {selectedVisa.visaRequired ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      {selectedVisa.visaRequired ? 'Visa Required' : 'Visa-Free'}
                    </span>
                  </div>
                </div>

                {/* Quick facts */}
                <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DetailRow icon={FileText} label="Visa Type">
                    <p className="text-sm font-medium text-white">
                      {selectedVisa.visaType}
                    </p>
                  </DetailRow>

                  <DetailRow icon={ShieldCheck} iconClass="text-emerald-400" label="Passport Validity">
                    <p className="text-sm font-medium text-white">
                      {selectedVisa.passportValidity}
                    </p>
                  </DetailRow>
                </div>

                {/* Vaccinations + advisory */}
                <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DetailRow icon={Syringe} iconClass="text-purple-400" label="Vaccinations">
                    <div className="flex flex-wrap gap-1.5">
                      {selectedVisa.vaccinations.map((vac) => (
                        <span
                          key={vac}
                          className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs text-purple-300"
                        >
                          {vac}
                        </span>
                      ))}
                    </div>
                  </DetailRow>

                  <div className="rounded-xl bg-white/5 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-white">
                        <AlertTriangle className="h-4 w-4 text-amber-400" /> Travel Advisory
                      </h4>
                      <span
                        className={cn(
                          'rounded-full border px-2.5 py-0.5 text-xs font-medium',
                          safetyLevelColor(selectedVisa.advisoryLevel)
                        )}
                      >
                        {safetyLevelLabel(selectedVisa.advisoryLevel)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {selectedVisa.travelAdvisory}
                    </p>
                  </div>
                </div>

                {/* Emergency contacts + utility grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DetailRow icon={Phone} iconClass="text-red-400" label="Emergency Contacts">
                    <ContactLine label="Police" value={selectedVisa.emergencyContacts.police} />
                    <ContactLine label="Ambulance" value={selectedVisa.emergencyContacts.ambulance} />
                    <ContactLine label="Fire" value={selectedVisa.emergencyContacts.fire} />
                  </DetailRow>

                  <DetailRow icon={Coins} iconClass="text-amber-400" label="Currency">
                    <p className="text-sm font-medium text-white">{selectedVisa.currency}</p>
                  </DetailRow>

                  <DetailRow icon={Plug} iconClass="text-sky-400" label="Electric Plug & Voltage">
                    <p className="text-sm font-medium text-white">{selectedVisa.plugType}</p>
                    <p className="text-xs text-muted-foreground">{selectedVisa.voltage}</p>
                  </DetailRow>

                  <DetailRow icon={Clock} iconClass="text-indigo-400" label="Time Zone">
                    <p className="text-sm font-medium text-white">{selectedVisa.timezone}</p>
                  </DetailRow>

                  <DetailRow
                    icon={Wifi}
                    iconClass={selectedVisa.internetAvailable ? 'text-emerald-400' : 'text-red-400'}
                    label="Internet"
                  >
                    <div className="flex items-center gap-2">
                      {selectedVisa.internetAvailable ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                      <span className="text-sm font-medium text-white">
                        {selectedVisa.internetAvailable ? 'Available' : 'Limited'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {selectedVisa.internetSpeed}
                    </p>
                  </DetailRow>

                  <DetailRow icon={Plane} iconClass="text-blue-400" label="Country Code">
                    <p className="text-sm font-medium text-white">{selectedVisa.code}</p>
                  </DetailRow>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
