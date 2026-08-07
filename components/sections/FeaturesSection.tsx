'use client';

import { motion } from 'framer-motion';
import { FEATURES } from '@/lib/constants';
import { FeatureCard } from '@/components/cards/DestinationCard';
import SectionHeading from '@/components/shared/SectionHeading';

export default function FeaturesSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="absolute inset-0 bg-aurora opacity-50" />
      <div className="relative mx-auto max-w-7xl px-6">
        <SectionHeading
          badge="Everything You Need"
          badgeColor="purple"
          title={
            <>
              <span className="text-white">A complete travel </span>
              <span className="text-gradient-blue">intelligence platform</span>
            </>
          }
          description="Ten powerful features working together to make every trip effortless, safe, and unforgettable."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.id} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
