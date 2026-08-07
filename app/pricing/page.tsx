'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, Sparkles, Zap, Shield, Crown } from 'lucide-react';
import { PRICING_PLANS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const PLAN_ICONS = [Zap, Sparkles, Crown];

const FAQ = [
  { q: 'Can I cancel my subscription anytime?', a: 'Yes, you can cancel at any time from your dashboard. Your plan remains active until the end of the billing period.' },
  { q: 'Is there a free trial?', a: 'The Voyager and Elite plans come with a 14-day free trial. No credit card required to start.' },
  { q: 'Do you offer refunds?', a: 'We offer a 30-day money-back guarantee on all paid plans. If you are not satisfied, contact our support team.' },
  { q: 'Can I upgrade or downgrade later?', a: 'Absolutely. You can switch plans at any time, and we will prorate the difference automatically.' },
  { q: 'How does the AI itinerary generation work?', a: 'Our AI analyzes your destination, budget, interests, and travel style to create a personalized day-by-day itinerary with activities, dining, and cost estimates.' },
  { q: 'Is my data safe?', a: 'Yes. We use bank-grade encryption and never share your personal data with third parties. You can delete your data at any time.' },
];

const COMPARISON_FEATURES = [
  { feature: 'AI itinerary generations', explorer: '3/month', voyager: 'Unlimited', elite: 'Unlimited' },
  { feature: 'Destinations available', explorer: '50', voyager: '195', elite: '195' },
  { feature: 'Safety scores', explorer: 'Basic', voyager: 'Real-time', elite: 'Real-time' },
  { feature: 'Budget optimizer', explorer: false, voyager: true, elite: true },
  { feature: 'Flight suggestions', explorer: false, voyager: true, elite: true },
  { feature: 'Hotel recommendations', explorer: false, voyager: true, elite: true },
  { feature: 'Emergency SOS', explorer: false, voyager: false, elite: true },
  { feature: 'Concierge AI', explorer: false, voyager: false, elite: true },
  { feature: 'Dedicated travel manager', explorer: false, voyager: false, elite: true },
  { feature: 'Priority support', explorer: false, voyager: true, elite: true },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="relative min-h-screen pt-24">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="relative mx-auto max-w-7xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">Simple, Transparent Pricing</span>
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="text-white">Choose Your </span>
            <span className="text-gradient-blue">Adventure Plan</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Start free, upgrade when you are ready. No hidden fees, cancel anytime.
          </p>

          <div className="mt-8 inline-flex items-center gap-3 rounded-full glass p-1.5">
            <button
              onClick={() => setYearly(false)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${!yearly ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-neon' : 'text-muted-foreground'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${yearly ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-neon' : 'text-muted-foreground'}`}
            >
              Yearly
              <span className="ml-1.5 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-xs text-emerald-400">Save 17%</span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PRICING_PLANS.map((plan, i) => {
            const Icon = PLAN_ICONS[i] ?? Sparkles;
            const price = yearly ? plan.price.yearly : plan.price.monthly;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-6 ${
                  plan.highlighted
                    ? 'glass-strong border-2 border-blue-500/40 shadow-neon lg:-mt-4 lg:mb-4'
                    : 'glass border border-white/10'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1 text-xs font-semibold text-white shadow-neon">
                    Most Popular
                  </div>
                )}
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${plan.highlighted ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'glass'}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-display text-xl font-bold text-white">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-5 mb-5">
                  <span className="font-display text-4xl font-bold text-white">{formatCurrency(price, 'USD')}</span>
                  <span className="text-sm text-muted-foreground">/{yearly ? 'year' : 'month'}</span>
                </div>
                <Link
                  href="/planner"
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-neon hover:shadow-neon-purple'
                      : 'glass text-white hover:bg-white/10'
                  }`}
                >
                  {plan.cta}
                </Link>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h2 className="mb-6 text-center font-display text-2xl font-bold text-white">Compare All Features</h2>
          <div className="overflow-hidden rounded-2xl glass">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-4 text-left font-medium text-white">Feature</th>
                    <th className="p-4 text-center font-medium text-white">Explorer</th>
                    <th className="p-4 text-center font-medium text-blue-400">Voyager</th>
                    <th className="p-4 text-center font-medium text-purple-400">Elite</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_FEATURES.map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? 'bg-white/[0.02]' : ''}>
                      <td className="p-4 text-muted-foreground">{row.feature}</td>
                      {(['explorer', 'voyager', 'elite'] as const).map((plan) => (
                        <td key={plan} className="p-4 text-center">
                          {typeof row[plan] === 'boolean' ? (
                            row[plan] ? <Check className="mx-auto h-4 w-4 text-emerald-400" /> : <span className="text-muted-foreground/40">—</span>
                          ) : (
                            <span className="text-white">{row[plan]}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h2 className="mb-6 text-center font-display text-2xl font-bold text-white">Frequently Asked Questions</h2>
          <div className="mx-auto max-w-3xl glass rounded-2xl p-6">
            <Accordion type="single" collapsible>
              {FAQ.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left text-sm font-medium text-white hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
