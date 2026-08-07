'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { HOME_FAQ } from '@/lib/constants';
import SectionHeading from '@/components/shared/SectionHeading';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function FAQSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading
          badge="Questions & Answers"
          badgeColor="purple"
          title={
            <>
              <span className="text-white">Frequently Asked </span>
              <span className="text-gradient-blue">Questions</span>
            </>
          }
          description="Everything you need to know about planning your next adventure with WandrAI."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-12 glass rounded-2xl p-6 sm:p-8"
        >
          <Accordion type="single" collapsible className="space-y-2">
            {HOME_FAQ.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] px-4 transition-colors data-[state=open]:border-blue-500/20"
              >
                <AccordionTrigger className="text-left text-sm font-medium text-white hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
