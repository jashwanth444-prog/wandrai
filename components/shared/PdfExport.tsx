'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, Share2, Copy, Check, X,
  MessageCircle, Mail, Twitter, Linkedin, Link as LinkIcon,
  Loader2, Sparkles,
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import type { GeneratedItinerary, Expense } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { getDestinationById } from '@/data/destinations';
import { PACKING_CHECKLIST, TRAVEL_TIPS, WEATHER_DAYS } from '@/lib/constants';
import type { jsPDF } from 'jspdf';

const SHARE_PLATFORMS = [
  { platform: 'whatsapp' as const, label: 'WhatsApp', icon: MessageCircle, color: '#25D366' },
  { platform: 'email' as const, label: 'Email', icon: Mail, color: '#EA4335' },
  { platform: 'twitter' as const, label: 'X (Twitter)', icon: Twitter, color: '#1DA1F2' },
  { platform: 'linkedin' as const, label: 'LinkedIn', icon: Linkedin, color: '#0077B5' },
  { platform: 'copy' as const, label: 'Copy Link', icon: LinkIcon, color: '#6366F1' },
];

export function PDFExportButton({
  itinerary,
  currency = 'USD',
  className = '',
  label = 'Download PDF',
}: {
  itinerary?: GeneratedItinerary | null;
  currency?: string;
  className?: string;
  label?: string;
}) {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const hasItinerary = !!itinerary;

  const handleExport = useCallback(async () => {
    if (!itinerary || generating) return;

    setGenerating(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const { jsPDF } = await import('jspdf');
      const doc = generateItineraryPDF(new jsPDF(), itinerary, currency);
      doc.save(`${itinerary.destination.name}-itinerary-WandrAI.pdf`);
      toast({ title: 'PDF downloaded', description: 'Your itinerary has been saved to your downloads.' });
    } catch {
      toast({ title: 'Export failed', description: 'Could not generate the PDF. Please try again.', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  }, [itinerary, currency, generating, toast]);

  return (
    <button
      onClick={handleExport}
      disabled={!hasItinerary || generating}
      className={cn(
        'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
        hasItinerary && !generating
          ? 'glass text-white hover:bg-white/10'
          : 'cursor-not-allowed bg-white/5 text-muted-foreground',
        className
      )}
      title={!hasItinerary ? 'Generate an itinerary first to enable PDF download' : undefined}
    >
      {generating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
          Generating...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 text-blue-400" />
          {label}
        </>
      )}
    </button>
  );
}

export function PrintButton({
  className = '',
  label = 'Print',
}: {
  className?: string;
  label?: string;
}) {
  return (
    <button
      onClick={() => window.print()}
      className={cn(
        'flex items-center gap-2 rounded-lg glass px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10',
        className
      )}
    >
      <FileText className="h-4 w-4 text-purple-400" />
      {label}
    </button>
  );
}

export function ShareTripButton({
  tripName = 'My Trip',
  tripId,
  className = '',
}: {
  tripName?: string;
  tripId?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/planner?shared=${tripId ?? 'demo'}`
    : '';
  const shareText = `Check out my ${tripName} planned with WandrAI!`;

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);

    let url = '';
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodedText}&body=${encodedText}%20${encodedUrl}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast({ title: 'Link copied!', description: 'Share it anywhere.' });
        setTimeout(() => setCopied(false), 3000);
        return;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-neon transition-all hover:shadow-neon-purple',
          className
        )}
      >
        <Share2 className="h-4 w-4" />
        Share Trip
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="glass-strong relative w-full max-w-md rounded-2xl p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-white">Share Your Trip</h3>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="mb-4 text-sm text-muted-foreground">
                Share &quot;{tripName}&quot; with friends and family via your favorite platform.
              </p>

              <div className="grid grid-cols-5 gap-3">
                {SHARE_PLATFORMS.map((platform) => (
                  <button
                    key={platform.platform}
                    onClick={() => handleShare(platform.platform)}
                    className="group flex flex-col items-center gap-2"
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all group-hover:scale-110"
                      style={{ boxShadow: `0 0 0 0 ${platform.color}` }}
                    >
                      {platform.platform === 'copy' && copied ? (
                        <Check className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <platform.icon className="h-5 w-5" style={{ color: platform.color }} />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{platform.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="mb-1 text-xs text-muted-foreground">Shareable link:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 truncate rounded bg-transparent text-sm text-white"
                  />
                  <button
                    onClick={() => handleShare('copy')}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 transition-colors hover:bg-blue-500/30"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function ExpenseReportButton({
  expenses,
  currency = 'USD',
  budget = 0,
  className = '',
}: {
  expenses: Expense[];
  currency?: string;
  budget?: number;
  className?: string;
}) {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);

  const handleExport = useCallback(async () => {
    if (generating) return;
    setGenerating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const { jsPDF } = await import('jspdf');
      const doc = generateExpensePDF(new jsPDF(), expenses, currency, budget);
      doc.save('expense-report-WandrAI.pdf');
      toast({ title: 'Report downloaded', description: 'Your expense report has been saved.' });
    } catch {
      toast({ title: 'Export failed', description: 'Could not generate the report.', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  }, [expenses, currency, budget, generating, toast]);

  return (
    <button
      onClick={handleExport}
      disabled={generating || expenses.length === 0}
      className={cn(
        'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
        expenses.length > 0 && !generating
          ? 'glass text-white hover:bg-white/10'
          : 'cursor-not-allowed bg-white/5 text-muted-foreground',
        className
      )}
    >
      {generating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          Generating...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4 text-emerald-400" />
          Export Report
        </>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   PDF GENERATION (jsPDF — direct download, no window.open)
   ═══════════════════════════════════════════════════════════ */

const COLORS = {
  dark: [15, 15, 25] as [number, number, number],
  card: [22, 22, 35] as [number, number, number],
  border: [42, 42, 58] as [number, number, number],
  blue: [96, 165, 250] as [number, number, number],
  blueDark: [30, 58, 95] as [number, number, number],
  emerald: [16, 185, 129] as [number, number, number],
  amber: [245, 158, 11] as [number, number, number],
  purple: [139, 92, 246] as [number, number, number],
  orange: [249, 115, 22] as [number, number, number],
  red: [239, 68, 68] as [number, number, number],
  text: [248, 250, 252] as [number, number, number],
  muted: [148, 163, 184] as [number, number, number],
  dim: [100, 116, 139] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

function setFill(doc: jsPDF, c: [number, number, number]) {
  doc.setFillColor(c[0], c[1], c[2]);
}
function setText(doc: jsPDF, c: [number, number, number]) {
  doc.setTextColor(c[0], c[1], c[2]);
}
function setDraw(doc: jsPDF, c: [number, number, number]) {
  doc.setDrawColor(c[0], c[1], c[2]);
}

function checkPageBreak(doc: jsPDF, y: number, needed: number, pageWidth: number, pageHeight: number): number {
  if (y + needed > pageHeight - 20) {
    doc.addPage();
    setFill(doc, COLORS.dark);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    return 20;
  }
  return y;
}

function sectionHeader(doc: jsPDF, title: string, y: number, pageWidth: number, pageHeight: number): number {
  y = checkPageBreak(doc, y, 30, pageWidth, pageHeight);
  setFill(doc, COLORS.blueDark);
  doc.roundedRect(20, y, pageWidth - 40, 8, 2, 2, 'F');
  setText(doc, COLORS.blue);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(title.toUpperCase(), 24, y + 5.5);
  return y + 14;
}

function generateItineraryPDF(doc: jsPDF, itinerary: GeneratedItinerary, currency: string): jsPDF {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const exploreDest = getDestinationById(itinerary.destination.id);
  const margin = 20;
  const contentW = pageWidth - margin * 2;

  /* ── PAGE 1: COVER ── */
  setFill(doc, COLORS.dark);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Blue gradient banner
  setFill(doc, COLORS.blueDark);
  doc.rect(0, 0, pageWidth, 90, 'F');
  setFill(doc, [20, 30, 60]);
  doc.rect(0, 85, pageWidth, 5, 'F');

  // Brand
  setText(doc, COLORS.blue);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('WANDRAI — PREMIUM AI TRAVEL PLANNING', margin, 25);

  // Destination name
  setText(doc, COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(36);
  doc.text(itinerary.destination.name.toUpperCase(), margin, 50);

  // Subtitle
  setText(doc, COLORS.muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text(`${itinerary.destination.country}  ·  ${itinerary.totalDays}-Day Trip`, margin, 60);

  // Cover stats
  const statY = 105;
  const statW = contentW / 3;
  const stats = [
    { label: 'DAYS', value: String(itinerary.totalDays) },
    { label: 'TOTAL BUDGET', value: formatCurrency(itinerary.totalCost, currency) },
    { label: 'DAILY AVERAGE', value: formatCurrency(Math.round(itinerary.totalCost / itinerary.totalDays), currency) },
  ];
  stats.forEach((s, i) => {
    const x = margin + i * statW;
    setFill(doc, COLORS.card);
    doc.roundedRect(x, statY, statW - 8, 22, 3, 3, 'F');
    setText(doc, COLORS.blue);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(s.value, x + 6, statY + 10);
    setText(doc, COLORS.dim);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(s.label, x + 6, statY + 17);
  });

  // Generation date
  setText(doc, COLORS.dim);
  doc.setFontSize(9);
  doc.text(`Generated on ${formatDate(new Date().toISOString())}`, margin, 145);

  // Overview description
  if (exploreDest) {
    setText(doc, COLORS.muted);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(exploreDest.description, contentW);
    doc.text(descLines, margin, 155);
  }

  /* ── DAILY ITINERARY ── */
  let y = 180;
  y = sectionHeader(doc, 'Daily Itinerary', y, pageWidth, pageHeight);

  itinerary.days.forEach((day) => {
    y = checkPageBreak(doc, y, 50, pageWidth, pageHeight);

    // Day card
    setFill(doc, COLORS.card);
    doc.roundedRect(margin, y, contentW, 8, 2, 2, 'F');

    setText(doc, COLORS.blue);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`DAY ${day.day}`, margin + 4, y + 5.5);

    setText(doc, COLORS.white);
    doc.setFontSize(11);
    doc.text(day.title, margin + 24, y + 5.5);

    setText(doc, COLORS.emerald);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(formatCurrency(day.totalCost, currency), pageWidth - margin - 4, y + 5.5, { align: 'right' });

    setText(doc, COLORS.dim);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(formatDate(day.date), margin + 24, y + 10);

    y += 14;

    // Activities
    day.activities.forEach((act) => {
      y = checkPageBreak(doc, y, 14, pageWidth, pageHeight);

      setText(doc, COLORS.blue);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(act.time, margin + 4, y);

      setText(doc, COLORS.white);
      doc.setFontSize(10);
      doc.text(act.title, margin + 22, y);

      setText(doc, COLORS.emerald);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(formatCurrency(act.cost, currency), pageWidth - margin - 4, y, { align: 'right' });

      setText(doc, COLORS.muted);
      doc.setFontSize(8);
      const descLines = doc.splitTextToSize(act.description, contentW - 30);
      doc.text(descLines, margin + 22, y + 4);
      y += 6 + descLines.length * 4;
    });

    // Meals
    y = checkPageBreak(doc, y, 16, pageWidth, pageHeight);
    y += 2;
    const mealW = (contentW - 8) / 3;
    const meals = [
      { label: 'BREAKFAST', value: day.meals.breakfast },
      { label: 'LUNCH', value: day.meals.lunch },
      { label: 'DINNER', value: day.meals.dinner },
    ];
    meals.forEach((m, i) => {
      const x = margin + i * (mealW + 4);
      setFill(doc, COLORS.card);
      doc.roundedRect(x, y, mealW, 14, 2, 2, 'F');
      setText(doc, COLORS.blue);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text(m.label, x + 3, y + 4);
      setText(doc, COLORS.muted);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      const mealLines = doc.splitTextToSize(m.value, mealW - 6);
      doc.text(mealLines.slice(0, 2), x + 3, y + 8);
    });
    y += 18;

    // Accommodation
    y = checkPageBreak(doc, y, 8, pageWidth, pageHeight);
    setText(doc, COLORS.dim);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text(`Hotel: ${day.accommodation}`, margin + 4, y);
    y += 8;
  });

  /* ── ATTRACTIONS & HIDDEN GEMS ── */
  y += 4;
  y = sectionHeader(doc, 'Top Attractions', y, pageWidth, pageHeight);
  const attractions = exploreDest?.attractions ?? itinerary.destination.attractions;
  attractions.forEach((a) => {
    y = checkPageBreak(doc, y, 8, pageWidth, pageHeight);
    setText(doc, COLORS.blue);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('•', margin + 4, y);
    setText(doc, COLORS.text);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(a, margin + 10, y);
    y += 7;
  });

  /* ── HOTELS ── */
  y += 6;
  y = sectionHeader(doc, 'Recommended Hotels', y, pageWidth, pageHeight);
  const hotels = exploreDest?.hotels ?? [];
  if (hotels.length > 0) {
    hotels.forEach((h) => {
      y = checkPageBreak(doc, y, 8, pageWidth, pageHeight);
      setText(doc, COLORS.blue);
      doc.text('•', margin + 4, y);
      setText(doc, COLORS.text);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(h, margin + 10, y);
      y += 7;
    });
  } else {
    const seen = new Set<string>();
    itinerary.days.forEach((d) => {
      if (!seen.has(d.accommodation)) {
        seen.add(d.accommodation);
        y = checkPageBreak(doc, y, 8, pageWidth, pageHeight);
        setText(doc, COLORS.blue);
        doc.text('•', margin + 4, y);
        setText(doc, COLORS.text);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(d.accommodation, margin + 10, y);
        y += 7;
      }
    });
  }

  /* ── RESTAURANTS ── */
  y += 6;
  y = sectionHeader(doc, 'Recommended Restaurants', y, pageWidth, pageHeight);
  const restaurants = exploreDest?.restaurants ?? [];
  if (restaurants.length > 0) {
    restaurants.forEach((r) => {
      y = checkPageBreak(doc, y, 8, pageWidth, pageHeight);
      setText(doc, COLORS.amber);
      doc.text('•', margin + 4, y);
      setText(doc, COLORS.text);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(r, margin + 10, y);
      y += 7;
    });
  } else {
    const seen = new Set<string>();
    itinerary.days.forEach((d) => {
      if (!seen.has(d.meals.dinner)) {
        seen.add(d.meals.dinner);
        y = checkPageBreak(doc, y, 8, pageWidth, pageHeight);
        setText(doc, COLORS.amber);
        doc.text('•', margin + 4, y);
        setText(doc, COLORS.text);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(d.meals.dinner, margin + 10, y);
        y += 7;
      }
    });
  }

  /* ── BUDGET BREAKDOWN ── */
  y += 6;
  y = sectionHeader(doc, 'Budget Breakdown', y, pageWidth, pageHeight);
  const budgetRows = [
    { label: 'Total Estimated Cost', value: formatCurrency(itinerary.totalCost, currency) },
    { label: 'Daily Average', value: formatCurrency(Math.round(itinerary.totalCost / itinerary.totalDays), currency) },
    { label: 'Activities', value: formatCurrency(itinerary.days.reduce((s, d) => s + d.activities.reduce((a, act) => a + act.cost, 0), 0), currency) },
    { label: 'Accommodation (est.)', value: formatCurrency(itinerary.totalDays * (exploreDest?.dailyBudget ?? 80) * 0.3, currency) },
    { label: 'Meals (est.)', value: formatCurrency(itinerary.totalDays * (exploreDest?.dailyBudget ?? 80) * 0.35, currency) },
  ];
  budgetRows.forEach((row) => {
    y = checkPageBreak(doc, y, 8, pageWidth, pageHeight);
    setText(doc, COLORS.muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(row.label, margin + 4, y);
    setText(doc, COLORS.emerald);
    doc.setFont('helvetica', 'bold');
    doc.text(row.value, pageWidth - margin - 4, y, { align: 'right' });
    setDraw(doc, COLORS.border);
    doc.setLineWidth(0.2);
    doc.line(margin + 4, y + 2, pageWidth - margin - 4, y + 2);
    y += 8;
  });

  /* ── WEATHER ── */
  y += 6;
  y = sectionHeader(doc, 'Weather Forecast', y, pageWidth, pageHeight);
  if (exploreDest) {
    y = checkPageBreak(doc, y, 12, pageWidth, pageHeight);
    setText(doc, COLORS.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`${exploreDest.name}: ${exploreDest.weather}, avg ${exploreDest.avgTemp}°C`, margin + 4, y);
    y += 6;
  }
  const weatherW = (contentW - 16) / 5;
  WEATHER_DAYS.forEach((day, i) => {
    y = checkPageBreak(doc, y, 16, pageWidth, pageHeight);
    const x = margin + i * (weatherW + 4);
    setFill(doc, COLORS.card);
    doc.roundedRect(x, y, weatherW, 14, 2, 2, 'F');
    setText(doc, COLORS.muted);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(day.day, x + 3, y + 4);
    setText(doc, COLORS.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`${day.high}°`, x + 3, y + 9);
    setText(doc, COLORS.dim);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`${day.low}°`, x + 3, y + 13);
  });
  y += 18;

  /* ── SAFETY TIPS ── */
  y = sectionHeader(doc, 'Safety Tips', y, pageWidth, pageHeight);
  TRAVEL_TIPS.forEach((tip) => {
    y = checkPageBreak(doc, y, 10, pageWidth, pageHeight);
    setText(doc, COLORS.red);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('•', margin + 4, y);
    setText(doc, COLORS.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(tip.title, margin + 10, y);
    setText(doc, COLORS.muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const tipLines = doc.splitTextToSize(tip.description, contentW - 16);
    doc.text(tipLines, margin + 10, y + 4);
    y += 6 + tipLines.length * 4;
  });

  /* ── PACKING CHECKLIST ── */
  y += 4;
  y = sectionHeader(doc, 'Packing Checklist', y, pageWidth, pageHeight);
  const colW = (contentW - 8) / 2;
  PACKING_CHECKLIST.forEach((cat, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    if (col === 0) {
      y = checkPageBreak(doc, y, 6 + cat.items.length * 5, pageWidth, pageHeight);
    }
    const x = margin + col * (colW + 8);
    const baseY = y + row * 0;
    setText(doc, COLORS.blue);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(cat.category, x, baseY);
    setText(doc, COLORS.muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    cat.items.forEach((item, i) => {
      doc.text(`☐  ${item}`, x, baseY + 5 + i * 5);
    });
    if (col === 1) y += 6 + cat.items.length * 5 + 4;
  });

  if (exploreDest && exploreDest.packingSuggestions.length > 0) {
    y += 4;
    y = checkPageBreak(doc, y, 6 + exploreDest.packingSuggestions.length * 5, pageWidth, pageHeight);
    setText(doc, COLORS.purple);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`Specific to ${exploreDest.name}`, margin, y);
    setText(doc, COLORS.muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    exploreDest.packingSuggestions.forEach((item, i) => {
      doc.text(`☐  ${item}`, margin, y + 5 + i * 5);
    });
    y += 6 + exploreDest.packingSuggestions.length * 5;
  }

  /* ── EMERGENCY CONTACTS ── */
  y += 6;
  y = sectionHeader(doc, 'Emergency Contacts', y, pageWidth, pageHeight);
  const emergencies = exploreDest
    ? [
        { label: 'POLICE', value: exploreDest.emergencyNumbers.police, color: COLORS.red },
        { label: 'AMBULANCE', value: exploreDest.emergencyNumbers.ambulance, color: COLORS.emerald },
        { label: 'FIRE', value: exploreDest.emergencyNumbers.fire, color: COLORS.orange },
      ]
    : [
        { label: 'POLICE', value: '112', color: COLORS.red },
        { label: 'AMBULANCE', value: '112', color: COLORS.emerald },
        { label: 'FIRE', value: '112', color: COLORS.orange },
      ];

  const emerW = (contentW - 16) / 3;
  y = checkPageBreak(doc, y, 20, pageWidth, pageHeight);
  emergencies.forEach((e, i) => {
    const x = margin + i * (emerW + 8);
    setFill(doc, COLORS.card);
    doc.roundedRect(x, y, emerW, 18, 3, 3, 'F');
    setText(doc, e.color);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(e.label, x + 4, y + 5);
    setText(doc, COLORS.white);
    doc.setFontSize(16);
    doc.text(e.value, x + 4, y + 13);
  });
  y += 24;

  /* ── LOCAL ETIQUETTE ── */
  if (exploreDest && exploreDest.localEtiquette.length > 0) {
    y = sectionHeader(doc, 'Local Etiquette', y, pageWidth, pageHeight);
    exploreDest.localEtiquette.forEach((tip) => {
      y = checkPageBreak(doc, y, 8, pageWidth, pageHeight);
      setText(doc, COLORS.blue);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('•', margin + 4, y);
      setText(doc, COLORS.muted);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const lines = doc.splitTextToSize(tip, contentW - 16);
      doc.text(lines, margin + 10, y);
      y += 4 + lines.length * 5;
    });
  }

  /* ── FOOTER on every page ── */
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    setText(doc, COLORS.dim);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Generated by WandrAI — AI-Powered Travel Planning', pageWidth / 2, pageHeight - 8, { align: 'center' });
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  return doc;
}

function generateExpensePDF(doc: jsPDF, expenses: Expense[], currency: string, budget: number): jsPDF {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentW = pageWidth - margin * 2;
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = budget - total;

  // Cover
  setFill(doc, COLORS.dark);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  setFill(doc, COLORS.blueDark);
  doc.rect(0, 0, pageWidth, 50, 'F');

  setText(doc, COLORS.blue);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('WANDRAI — EXPENSE REPORT', margin, 20);
  setText(doc, COLORS.white);
  doc.setFontSize(24);
  doc.text('Expense Report', margin, 35);
  setText(doc, COLORS.muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(formatDate(new Date().toISOString()), margin, 42);

  // Summary
  let y = 65;
  const sumW = (contentW - 24) / 4;
  const sumStats = [
    { label: 'BUDGET', value: formatCurrency(budget, currency), color: COLORS.blue },
    { label: 'SPENT', value: formatCurrency(total, currency), color: COLORS.amber },
    { label: 'REMAINING', value: formatCurrency(remaining, currency), color: remaining >= 0 ? COLORS.emerald : COLORS.red },
    { label: 'TRANSACTIONS', value: String(expenses.length), color: COLORS.white },
  ];
  sumStats.forEach((s, i) => {
    const x = margin + i * (sumW + 8);
    setFill(doc, COLORS.card);
    doc.roundedRect(x, y, sumW, 20, 3, 3, 'F');
    setText(doc, s.color);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(s.value, x + 4, y + 9);
    setText(doc, COLORS.dim);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(s.label, x + 4, y + 15);
  });

  // Table header
  y = 100;
  setFill(doc, COLORS.card);
  doc.roundedRect(margin, y, contentW, 10, 2, 2, 'F');
  setText(doc, COLORS.blue);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('DATE', margin + 4, y + 6.5);
  doc.text('CATEGORY', margin + 40, y + 6.5);
  doc.text('DESCRIPTION', margin + 80, y + 6.5);
  doc.text('AMOUNT', pageWidth - margin - 4, y + 6.5, { align: 'right' });
  y += 14;

  // Rows
  expenses.forEach((e) => {
    y = checkPageBreak(doc, y, 10, pageWidth, pageHeight);
    setText(doc, COLORS.muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(formatDate(e.date), margin + 4, y);
    doc.text(e.category, margin + 40, y);
    const descLines = doc.splitTextToSize(e.description, 60);
    doc.text(descLines.slice(0, 1), margin + 80, y);
    setText(doc, COLORS.emerald);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(e.amount, e.currency || currency), pageWidth - margin - 4, y, { align: 'right' });
    setDraw(doc, COLORS.border);
    doc.setLineWidth(0.2);
    doc.line(margin + 4, y + 2, pageWidth - margin - 4, y + 2);
    y += 8;
  });

  // Footer
  setText(doc, COLORS.dim);
  doc.setFontSize(7);
  doc.text('Generated by WandrAI', pageWidth / 2, pageHeight - 8, { align: 'center' });

  return doc;
}
