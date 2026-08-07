'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Edit2, Wallet, TrendingUp, TrendingDown,
  X, Calendar, DollarSign,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { EXPENSE_CATEGORIES } from '@/lib/feature-constants';
import { cn, formatCurrency } from '@/lib/utils';
import SectionHeading from '@/components/shared/SectionHeading';
import type { Expense } from '@/types';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AED', 'IDR', 'THB', 'AUD', 'CAD'];
const BUDGET_KEY = 'expense-tracker-budget';
const LOCAL_EXPENSES_KEY = 'expense-tracker-local-expenses';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function genId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type ExpenseForm = {
  category: Expense['category'];
  description: string;
  amount: string;
  currency: string;
  date: string;
};

const EMPTY_FORM: ExpenseForm = {
  category: 'food',
  description: '',
  amount: '',
  currency: 'USD',
  date: todayISO(),
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState(1000);
  const [budgetInput, setBudgetInput] = useState('1000');
  const [editingBudget, setEditingBudget] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [form, setForm] = useState<ExpenseForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  /* ----- Budget (localStorage) ----- */
  useEffect(() => {
    const saved = localStorage.getItem(BUDGET_KEY);
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0) {
        setBudget(parsed);
        setBudgetInput(String(parsed));
      }
    }
  }, []);

  const saveBudget = useCallback(() => {
    const parsed = parseFloat(budgetInput);
    if (!isNaN(parsed) && parsed >= 0) {
      setBudget(parsed);
      localStorage.setItem(BUDGET_KEY, String(parsed));
      setEditingBudget(false);
    }
  }, [budgetInput]);

  /* ----- Fetch expenses ----- */
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_EXPENSES_KEY);
    if (saved) {
      try {
        setExpenses(JSON.parse(saved));
      } catch {
        setExpenses([]);
      }
    }
    setLoading(false);
  }, []);

  /* ----- Local persistence helper ----- */
  const persistLocal = useCallback((next: Expense[]) => {
    setExpenses(next);
    localStorage.setItem(LOCAL_EXPENSES_KEY, JSON.stringify(next));
  }, []);

  /* ----- Add / Update ----- */
  const openAddModal = () => {
    setEditingExpense(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setForm({
      category: exp.category,
      description: exp.description,
      amount: String(exp.amount),
      currency: exp.currency,
      date: exp.date,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingExpense(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.description.trim() || isNaN(amount) || amount <= 0) return;

    setSubmitting(true);
    const payload = {
      category: form.category,
      description: form.description.trim(),
      amount,
      currency: form.currency,
      date: form.date,
    };

    if (editingExpense) {
      persistLocal(
        expenses.map((ex) =>
          ex.id === editingExpense.id
            ? { ...ex, ...payload }
            : ex
        )
      );
    } else {
      const newExpense: Expense = {
        id: genId(),
        user_id: 'local',
        ...payload,
        created_at: new Date().toISOString(),
      };
      persistLocal([newExpense, ...expenses]);
    }

    setSubmitting(false);
    closeModal();
  };

  /* ----- Delete ----- */
  const handleDelete = (id: string) => {
    persistLocal(expenses.filter((ex) => ex.id !== id));
  };

  /* ----- Derived data ----- */
  const totalSpent = useMemo(
    () => expenses.reduce((sum, ex) => sum + ex.amount, 0),
    [expenses]
  );
  const remaining = budget - totalSpent;
  const progressPct = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;
  const overBudget = totalSpent > budget;

  const categoryData = useMemo(() => {
    return EXPENSE_CATEGORIES.map((cat) => {
      const total = expenses
        .filter((ex) => ex.category === cat.value)
        .reduce((sum, ex) => sum + ex.amount, 0);
      return { name: cat.label, value: total, color: cat.color };
    }).filter((d) => d.value > 0);
  }, [expenses]);

  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString('en-US', { month: 'short' });
      months[key] = 0;
    }
    expenses.forEach((ex) => {
      const d = new Date(ex.date);
      if (isNaN(d.getTime())) return;
      const key = d.toLocaleDateString('en-US', { month: 'short' });
      if (key in months) months[key] += ex.amount;
    });
    return Object.entries(months).map(([month, amount]) => ({ month, amount }));
  }, [expenses]);

  const getCategoryMeta = (value: Expense['category']) =>
    EXPENSE_CATEGORIES.find((c) => c.value === value) ?? EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];

  const getCategoryColor = (value: Expense['category']) => getCategoryMeta(value).color;

  /* ----- Render ----- */
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Smart Expense Tracker"
          badgeColor="emerald"
          title="Track Your Travel Spending"
          description="Set a budget, log expenses, and visualize where your money goes — across every trip."
          align="center"
        />



        {/* Top row: Budget overview + Add button */}
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-strong rounded-2xl border border-white/10 p-6 lg:col-span-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-500/15 p-3">
                  <Wallet className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  {editingBudget ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={budgetInput}
                        onChange={(e) => setBudgetInput(e.target.value)}
                        className="w-32 rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-lg font-bold text-white outline-none focus:border-emerald-400"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && saveBudget()}
                      />
                      <button
                        onClick={saveBudget}
                        className="rounded-lg bg-emerald-500 px-3 py-1 text-sm font-medium text-white hover:bg-emerald-400"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setBudgetInput(String(budget));
                          setEditingBudget(false);
                        }}
                        className="text-sm text-muted-foreground hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="font-display text-2xl font-bold text-white">
                        {formatCurrency(budget, 'USD')}
                      </p>
                      <button
                        onClick={() => setEditingBudget(true)}
                        className="text-muted-foreground hover:text-white"
                        aria-label="Edit budget"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {formatCurrency(totalSpent, 'USD')} spent
                </span>
                <span className={cn('font-medium', overBudget ? 'text-red-400' : 'text-emerald-400')}>
                  {overBudget
                    ? `${formatCurrency(totalSpent - budget, 'USD')} over`
                    : `${formatCurrency(remaining, 'USD')} left`}
                </span>
              </div>
              <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    overBudget ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Stat tiles */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm">Total Spent</span>
                </div>
                <p className="mt-1 font-display text-xl font-bold text-white">
                  {formatCurrency(totalSpent, 'USD')}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Remaining</span>
                </div>
                <p
                  className={cn(
                    'mt-1 font-display text-xl font-bold',
                    overBudget ? 'text-red-400' : 'text-emerald-400'
                  )}
                >
                  {formatCurrency(Math.max(remaining, 0), 'USD')}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Add expense button card */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            onClick={openAddModal}
            className="glass flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 p-6 text-center transition hover:border-emerald-400/40 hover:bg-emerald-500/5"
          >
            <div className="rounded-2xl bg-emerald-500/15 p-4">
              <Plus className="h-8 w-8 text-emerald-400" />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-white">Add Expense</p>
              <p className="mt-1 text-sm text-muted-foreground">Log a new purchase</p>
            </div>
          </motion.button>
        </div>

        {/* Middle row: Charts */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Pie chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="glass rounded-2xl border border-white/10 p-6"
          >
            <h3 className="font-display text-lg font-bold text-white">Spending by Category</h3>
            {categoryData.length > 0 ? (
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={50}
                      paddingAngle={2}
                    >
                      {categoryData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                      formatter={(value: number) => formatCurrency(value, 'USD')}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="mt-4 flex h-64 items-center justify-center text-sm text-muted-foreground">
                No data yet
              </div>
            )}
            {/* Legend */}
            {categoryData.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {categoryData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-sm text-muted-foreground">{d.name}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Bar chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="glass rounded-2xl border border-white/10 p-6"
          >
            <h3 className="font-display text-lg font-bold text-white">Monthly Spending</h3>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis
                    dataKey="month"
                    stroke="rgba(255,255,255,0.4)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.4)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    formatter={(value: number) => formatCurrency(value, 'USD')}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="amount" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Bottom: Expense list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="glass mt-6 rounded-2xl border border-white/10 p-6"
        >
          <h3 className="font-display text-lg font-bold text-white">Expense History</h3>

          {loading ? (
            <div className="mt-6 flex h-40 items-center justify-center text-muted-foreground">
              Loading expenses…
            </div>
          ) : expenses.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-white/10 py-16">
              <div className="rounded-2xl bg-white/5 p-4">
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-display text-lg font-semibold text-white">No expenses yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Start tracking your spending by adding your first expense.
                </p>
              </div>
              <button
                onClick={openAddModal}
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400"
              >
                <Plus className="h-4 w-4" />
                Add Expense
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {expenses.map((exp) => {
                const meta = getCategoryMeta(exp.category);
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={exp.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20"
                  >
                    <div
                      className="rounded-lg p-2.5"
                      style={{ backgroundColor: `${meta.color}20` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: meta.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-white">{exp.description}</p>
                      <div className="mt-0.5 flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{meta.label}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(exp.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    <p className="font-display font-bold text-white">
                      {formatCurrency(exp.amount, exp.currency)}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(exp)}
                        className="rounded-lg p-2 text-muted-foreground transition hover:bg-white/10 hover:text-white"
                        aria-label="Edit expense"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-400"
                        aria-label="Delete expense"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Add / Edit modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="glass-strong w-full max-w-md rounded-2xl border border-white/10 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold text-white">
                  {editingExpense ? 'Edit Expense' : 'Add Expense'}
                </h3>
                <button
                  onClick={closeModal}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {/* Category */}
                <div>
                  <label className="mb-1.5 block text-sm text-muted-foreground">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {EXPENSE_CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const active = form.category === cat.value;
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, category: cat.value }))}
                          className={cn(
                            'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition',
                            active
                              ? 'border-transparent text-white'
                              : 'border-white/10 text-muted-foreground hover:border-white/20'
                          )}
                          style={active ? { backgroundColor: `${cat.color}25`, borderColor: cat.color } : undefined}
                        >
                          <Icon className="h-4 w-4" style={{ color: cat.color }} />
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1.5 block text-sm text-muted-foreground">Description</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="e.g. Dinner in Paris"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-muted-foreground/50 outline-none focus:border-emerald-400"
                    required
                  />
                </div>

                {/* Amount + Currency */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm text-muted-foreground">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.amount}
                      onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                      placeholder="0.00"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-muted-foreground/50 outline-none focus:border-emerald-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm text-muted-foreground">Currency</label>
                    <select
                      value={form.currency}
                      onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-emerald-400"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c} className="bg-slate-900">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="mb-1.5 block text-sm text-muted-foreground">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-emerald-400"
                    required
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {editingExpense ? 'Update' : 'Add Expense'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
