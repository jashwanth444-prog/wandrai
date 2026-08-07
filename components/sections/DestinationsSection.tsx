'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { DESTINATIONS } from '@/lib/constants';
import { DestinationCard } from '@/components/cards/DestinationCard';
import SectionHeading from '@/components/shared/SectionHeading';

export default function DestinationsSection() {
  return (
    <section id="destinations" className="relative py-24 sm:py-32 scroll-mt-20">
      <div className="absolute inset-0 bg-glass-radial" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            badge="Trending Now"
            badgeColor="amber"
            align="left"
            title={
              <>
                <span className="text-white">Popular </span>
                <span className="text-gradient-blue">Destinations</span>
              </>
            }
            description="Hand-picked cities loved by millions of travelers, with everything you need to start planning."
          />
          <Link
            href="/planner"
            className="group flex items-center gap-2 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
          >
            View All Destinations
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DESTINATIONS.map((dest, i) => (
            <DestinationCard key={dest.id} destination={dest} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
