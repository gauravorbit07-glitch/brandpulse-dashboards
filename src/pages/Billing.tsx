import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion} from "framer-motion";
import {
  ArrowLeft,
  Check,
  Zap,
  CreditCard,
  Receipt,
  Package,
  AlertTriangle,
  Download,
  Sparkles,
  Shield,
  TrendingUp,
  ChevronDown,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/Layout";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.07,
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

type PlanState = "trial" | "active" | "expiring";

const plans = [
  {
    name: "Launch",
    monthlyPrice: 49,
    quarterlyPrice: 41,
    description: "Perfect for getting started",
    icon: "🚀",
    features: [
      "3 Seed Prompts",
      "Up to 25 AI Prompts Tracked",
      "ChatGPT only",
      "3 Competitors",
      "10 conversations/day/user",
      "1 Seat",
      "Run every 48 hours",
      "Last 2 Runs Analytics",
      "Email Support",
    ],
  },
  {
    name: "Grow",
    monthlyPrice: 159,
    quarterlyPrice: 129,
    popular: true,
    description: "For growing teams & brands",
    icon: "⚡",
    features: [
      "Up to 6 Seed Prompts",
      "Up to 50 AI Prompts Tracked",
      "ChatGPT, Google AI Mode, Perplexity*",
      "5 Competitors",
      "20 conversations/day/user",
      "3 Seats",
      "Run every 24 hours",
      "Last 5 Runs Analytics",
      "Report Export",
      "Email & Slack Support",
    ],
  },
  {
    name: "Enterprise",
    monthlyPrice: null,
    quarterlyPrice: null,
    description: "Custom everything, dedicated team",
    icon: "🏢",
    features: [
      "Custom Seed Prompts",
      "Custom AI Prompts Tracked",
      "ChatGPT, Google AI Mode, Perplexity*",
      "Custom Competitors",
      "Custom GEO Agent Intelligence",
      "Custom Seats",
      "Custom Analytics History",
      "Report Export",
      "Dedicated Account Manager",
      "Dedicated GEO Specialist",
    ],
  },
];

const invoices = [
  {
    id: "#INV-0012",
    date: "Dec 16, 2025",
    plan: "Grow – Monthly",
    amount: "$159.00",
    status: "Paid",
  },
  {
    id: "#INV-0011",
    date: "Nov 16, 2025",
    plan: "Grow – Monthly",
    amount: "$159.00",
    status: "Paid",
  },
  {
    id: "#INV-0010",
    date: "Oct 16, 2025",
    plan: "Launch – Monthly",
    amount: "$49.00",
    status: "Paid",
  },
  {
    id: "#INV-0009",
    date: "Sep 10, 2025",
    plan: "Launch – Monthly",
    amount: "$49.00",
    status: "Overdue",
  },
];

const Billing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { products } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly">(
    "monthly"
  );
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState("");
  const [checkoutPrice, setCheckoutPrice] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const planState = "trial" as PlanState;
  const currentPlan = "Grow";

  const handleBack = () => {
    const from = location.state?.from;
    if (from) {
      navigate(from);
    } else {
      const hasProduct = products && products.length > 0;
      if (hasProduct) {
        navigate("/results");
      } else {
        navigate("/input");
      }
    }
  };

  const openCheckout = (planName: string, price: number | null) => {
    if (!price) return;
    setCheckoutPlan(planName);
    setCheckoutPrice(`$${price}.00`);
    setCheckoutOpen(true);
  };

  const handlePay = () => {
    setCheckoutOpen(false);
    setSuccessOpen(true);
  };

  return (
    <Layout>
      {/* Subtle ambient background */}
      <div className="min-h-screen relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 40% at 50% -10%, rgba(59,130,246,0.06) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
          {/* ── Premium Back Button ── */}
          <motion.button
            onClick={handleBack}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="group flex items-center gap-2.5"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 bg-white shadow-sm text-gray-500 group-hover:border-blue-300 group-hover:text-blue-600 group-hover:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all duration-200">
              <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            </span>
            <span className="text-sm font-medium text-gray-500 group-hover:text-gray-800 transition-colors duration-200">
              Back
            </span>
          </motion.button>

          {/* ── Page Header ── */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Billing & Plans
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your subscription, usage, and payment details
            </p>
          </motion.div>

          {/* ── Trial Banner ── */}
          {planState === "trial" && (
            <motion.div
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="relative overflow-hidden rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              style={{
                background:
                  "linear-gradient(135deg, #1d4ed8 0%, #2563eb 40%, #3b82f6 100%)",
              }}
            >
              {/* Decorative circles */}
              <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
              <div className="absolute -right-4 top-6 w-24 h-24 rounded-full bg-white/5" />

              <div className="relative flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">
                    Free trial active — 5 days remaining
                  </p>
                  <p className="text-blue-100 text-xs mt-0.5">
                    9 of 14 days used. Upgrade anytime to keep full access.
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1.5 w-40 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all"
                        style={{ width: "64%" }}
                      />
                    </div>
                    <span className="text-xs text-blue-100 font-medium">
                      64%
                    </span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                className="relative z-10 bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-sm border-0 flex-shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Upgrade Now
              </Button>
            </motion.div>
          )}

          {/* ── Expiring Banner ── */}
          {planState === "expiring" && (
            <motion.div
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="relative overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-amber-900 text-sm">
                    Your {currentPlan} plan expires in 5 days
                  </p>
                  <p className="text-amber-700 text-xs mt-0.5">
                    Renew now to avoid interruption to your analysis
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-amber-300 text-amber-800 hover:bg-amber-100"
              >
                Renew Plan
              </Button>
            </motion.div>
          )}

          {/* ── Tabs ── */}
          <Tabs defaultValue="plans" className="w-full">
            <TabsList className="bg-gray-100/80 border border-gray-200 h-10 p-1 mb-8 rounded-xl">
              <TabsTrigger
                value="plans"
                className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 text-gray-500"
              >
                Plans
              </TabsTrigger>
              <TabsTrigger
                value="billing"
                className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 text-gray-500"
              >
                Billing Details
              </TabsTrigger>
              <TabsTrigger
                value="invoices"
                className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 text-gray-500"
              >
                Invoices
              </TabsTrigger>
            </TabsList>

            {/* ──────── PLANS TAB ──────── */}
            <TabsContent value="plans" className="space-y-8">
              {/* Billing Toggle */}
              <motion.div
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex items-center justify-between flex-wrap gap-3"
              >
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Choose a Plan
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    All plans include a 14-day free trial
                  </p>
                </div>
                <div className="flex items-center bg-gray-100 border border-gray-200 rounded-full p-1 gap-0.5">
                  <button
                    onClick={() => setBillingCycle("monthly")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      billingCycle === "monthly"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle("quarterly")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      billingCycle === "quarterly"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Quarterly
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                      −16%
                    </span>
                  </button>
                </div>
              </motion.div>

              {/* Plan Cards — unified height, single render path */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                {plans.map((plan, i) => {
                  const price =
                    billingCycle === "monthly"
                      ? plan.monthlyPrice
                      : plan.quarterlyPrice;
                  const isCurrent =
                    planState === "active" && plan.name === currentPlan;
                  const isPopular = !!plan.popular && !isCurrent;

                  return (
                    <motion.div
                      key={plan.name}
                      custom={i + 3}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      whileHover={{
                        scale: 1.02,
                        boxShadow: isPopular
                          ? "0 0 0 3px rgba(37,99,235,0.12), 0 20px 48px rgba(37,99,235,0.22)"
                          : "0 12px 36px rgba(0,0,0,0.14)",
                        transition: { duration: 0.18, ease: "easeOut" },
                      }}
                      className="relative flex flex-col rounded-2xl bg-white cursor-pointer"
                      style={{
                        border: isPopular
                          ? "2px solid #2563eb"
                          : isCurrent
                          ? "2px solid #10b981"
                          : "1px solid #e5e7eb",
                        boxShadow: isPopular
                          ? "0 0 0 3px rgba(37,99,235,0.08), 0 8px 24px rgba(37,99,235,0.12)"
                          : "0 1px 4px rgba(0,0,0,0.06)",
                      }}
                    >
                      {/* Popular: thin amber top accent stripe */}
                      {/* {isPopular && (
                        <div
                          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl ml-2 mr-2"
                          style={{
                            background:
                              "linear-gradient(90deg, #f59e0b, #fbbf24, #fcd34d)",
                          }}
                        />
                      )} */}

                      {/* Floating badge — amber */}
                      {isPopular && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                          <span
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold text-amber-950"
                            style={{
                              background:
                                "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                              boxShadow: "0 2px 8px rgba(245,158,11,0.4)",
                            }}
                          >
                            <Star className="w-2.5 h-2.5 fill-amber-950" />
                            Most Popular
                          </span>
                        </div>
                      )}
                      {isCurrent && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-sm">
                            <Check className="w-2.5 h-2.5" />
                            Current Plan
                          </span>
                        </div>
                      )}

                      {/* Card body — flex-col grow so all cards stretch equally */}
                      <div className="flex flex-col flex-1 p-6 pt-8">
                        {/* Plan header */}
                        <div className="flex items-center gap-2.5 mb-4">
                          <span className="text-xl">{plan.icon}</span>
                          <div>
                            <p
                              className={`text-xs font-semibold uppercase tracking-widest ${
                                isPopular ? "text-blue-600" : "text-gray-400"
                              }`}
                            >
                              {plan.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {plan.description}
                            </p>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="mb-1">
                          {price ? (
                            <div className="flex items-end gap-1">
                              <span className="text-4xl font-bold text-gray-900 tracking-tight">
                                ${price}
                              </span>
                              <span className="text-sm text-gray-400 mb-1.5 font-medium">
                                / mo
                              </span>
                            </div>
                          ) : (
                            <div className="text-4xl font-bold text-gray-900 tracking-tight">
                              Custom
                            </div>
                          )}
                        </div>

                        <p
                          className={`text-xs font-medium mb-5 ${
                            price ? "text-emerald-600" : "text-gray-400"
                          }`}
                        >
                          {price
                            ? billingCycle === "quarterly"
                              ? `Save $${
                                  (plan.monthlyPrice! - plan.quarterlyPrice!) *
                                  12
                                }/yr`
                              : `$${plan.quarterlyPrice}/mo if billed quarterly`
                            : "Tailored to your team's needs"}
                        </p>

                        {/* CTA */}
                        {isCurrent ? (
                          <button
                            disabled
                            className="w-full py-2.5 rounded-xl text-sm font-semibold border border-emerald-200 bg-emerald-50 text-emerald-600 cursor-default mb-5"
                          >
                            ✓ Current Plan
                          </button>
                        ) : isPopular ? (
                          <button
                            onClick={() => openCheckout(plan.name, price!)}
                            className="w-full py-2.5 rounded-xl text-sm font-bold text-amber-950 mb-5 transition-all duration-200 hover:brightness-105 active:scale-[0.98]"
                            style={{
                              background:
                                "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                              boxShadow: "0 3px 10px rgba(245,158,11,0.35)",
                            }}
                          >
                            Get Started →
                          </button>
                        ) : price ? (
                          <button
                            onClick={() => openCheckout(plan.name, price)}
                            className="w-full py-2.5 rounded-xl text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 hover:border-gray-300 transition-all duration-200 mb-5"
                          >
                            Get Started
                          </button>
                        ) : (
                          <button className="w-full py-2.5 rounded-xl text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 transition-colors mb-5">
                            Contact Sales →
                          </button>
                        )}

                        {/* Divider */}
                        <div className="border-t border-gray-100 mb-4" />

                        {/* Features — grow to fill remaining space */}
                        <ul className="space-y-2.5 flex-1">
                          {plan.features.map((f) => (
                            <li
                              key={f}
                              className="flex items-start gap-2.5 text-sm"
                            >
                              <span
                                className={`flex-shrink-0 w-4 h-4 mt-0.5 rounded-full flex items-center justify-center ${
                                  isPopular ? "bg-blue-100" : "bg-emerald-100"
                                }`}
                              >
                                <Check
                                  className={`w-2.5 h-2.5 ${
                                    isPopular
                                      ? "text-blue-600"
                                      : "text-emerald-600"
                                  }`}
                                />
                              </span>
                              <span className="text-gray-600">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Trust strip */}
              <motion.div
                custom={7}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-6 py-4 border-t border-gray-100 flex-wrap"
              >
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield className="w-3.5 h-3.5 text-gray-400" />
                  SSL encrypted
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Cancel anytime
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                  No setup fees
                </div>
                <p className="text-xs text-gray-400 ml-auto">
                  * Perplexity coming soon. Integrations include Google
                  Analytics & Google Search Console.
                </p>
              </motion.div>
            </TabsContent>

            {/* ──────── BILLING DETAILS TAB ──────── */}
            <TabsContent value="billing" className="space-y-5">
              {/* Current Plan */}
              <motion.div
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Current Plan
                      </p>
                      <p className="text-xs text-gray-400">
                        Your active subscription
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { label: "Plan", value: "Grow", highlight: true },
                      { label: "Billing Cycle", value: "Monthly" },
                      { label: "Next Billing", value: "Jan 16, 2026" },
                      { label: "Amount", value: "$159 / mo" },
                    ].map((item) => (
                      <div key={item.label} className="space-y-1">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                          {item.label}
                        </p>
                        <p
                          className={`text-sm font-semibold ${
                            item.highlight ? "text-blue-600" : "text-gray-800"
                          }`}
                        >
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Usage Meters */}
                  <div className="space-y-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                      Usage This Cycle
                    </p>
                    {[
                      {
                        label: "AI Prompts Used",
                        current: 32,
                        max: 50,
                        color: "bg-blue-500",
                      },
                      {
                        label: "GEO Conversations Today",
                        current: 14,
                        max: 20,
                        color: "bg-violet-500",
                      },
                      {
                        label: "Competitors Tracked",
                        current: 4,
                        max: 5,
                        color: "bg-amber-500",
                      },
                    ].map((usage) => {
                      const pct = (usage.current / usage.max) * 100;
                      return (
                        <div key={usage.label} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600 font-medium">
                              {usage.label}
                            </span>
                            <span className="font-semibold text-gray-700">
                              {usage.current}
                              <span className="text-gray-400">
                                {" "}
                                / {usage.max}
                              </span>
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${usage.color}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
                      ⬆ Change Plan
                    </button>
                    <button className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 transition-all">
                      Cancel Subscription
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Payment Method
                    </p>
                    <p className="text-xs text-gray-400">Your saved card</p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{
                          background:
                            "linear-gradient(135deg, #1a1f71 0%, #1a73e8 100%)",
                          color: "white",
                          letterSpacing: "0.05em",
                        }}
                      >
                        VISA
                      </div>
                      <div>
                        <p className="text-sm font-mono tracking-widest text-gray-800">
                          •••• •••• •••• 4242
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Expires 08 / 27
                        </p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
                      Update
                    </button>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* ──────── INVOICES TAB ──────── */}
            <TabsContent value="invoices">
              <motion.div
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Invoice History
                    </p>
                    <p className="text-xs text-gray-400">
                      {invoices.length} invoices
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {invoices.map((inv, i) => (
                    <motion.div
                      key={inv.id}
                      custom={i}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                          <Receipt className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {inv.plan}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 font-mono">
                            {inv.id} · {inv.date}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <p className="text-sm font-bold text-gray-800">
                          {inv.amount}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            inv.status === "Paid"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              inv.status === "Paid"
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                          />
                          {inv.status}
                        </span>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-all opacity-0 group-hover:opacity-100">
                          <Download className="w-3 h-3" />
                          PDF
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Checkout Modal ── */}
        <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl border-gray-200 p-0 overflow-hidden gap-0">
            <div
              className="px-6 py-5 border-b border-gray-100"
              style={{
                background:
                  "linear-gradient(135deg, rgba(59,130,246,0.04) 0%, transparent 100%)",
              }}
            >
              <DialogTitle className="text-base font-bold text-gray-900">
                Complete Your Purchase
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                Upgrading to{" "}
                <strong className="text-gray-700">{checkoutPlan}</strong> plan
              </DialogDescription>
            </div>

            <div className="p-6 space-y-5">
              {/* Order summary */}
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{checkoutPlan} Plan</span>
                  <span className="font-semibold text-gray-800">
                    {checkoutPrice}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Billing cycle</span>
                  <span className="capitalize text-gray-700">
                    {billingCycle}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-600 text-xs">
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Trial credit applied
                  </span>
                  <span>−$0.00</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200 mt-1">
                  <span className="text-gray-900">Total due today</span>
                  <span className="text-gray-900">{checkoutPrice}</span>
                </div>
              </div>

              {/* Card fields */}
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Cardholder Name
                  </Label>
                  <Input
                    placeholder="Jane Smith"
                    className="mt-1.5 rounded-xl border-gray-200 focus:border-blue-300 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Card Number
                  </Label>
                  <Input
                    placeholder="1234 5678 9012 3456"
                    className="mt-1.5 rounded-xl border-gray-200 focus:border-blue-300 focus:ring-blue-100 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Expiry
                    </Label>
                    <Input
                      placeholder="MM / YY"
                      className="mt-1.5 rounded-xl border-gray-200 font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      CVV
                    </Label>
                    <Input
                      placeholder="•••"
                      className="mt-1.5 rounded-xl border-gray-200 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 py-1">
                  <Shield className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-[11px] text-gray-400">
                    Secured with 256-bit SSL encryption. We never store your
                    card details.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCheckoutOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePay}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
                >
                  Pay {checkoutPrice}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Success Modal ── */}
        <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl border-gray-200 p-0 overflow-hidden text-center gap-0">
            <div
              className="px-6 pt-10 pb-6 flex flex-col items-center gap-3"
              style={{
                background:
                  "linear-gradient(180deg, rgba(16,185,129,0.05) 0%, transparent 60%)",
              }}
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-3xl mb-1">
                🎉
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                You're all set!
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Your <strong className="text-gray-700">{checkoutPlan}</strong>{" "}
                plan is active. A confirmation has been sent to your email.
              </DialogDescription>
            </div>

            <div className="px-6 pb-6 space-y-4">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-3">
                  Plan Activated
                </p>
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-[11px] text-gray-400">Plan</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">
                      {checkoutPlan}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">Next Billing</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">
                      Jan 16, 2026
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSuccessOpen(false);
                  handleBack();
                }}
                className="w-full py-3 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
              >
                Go to Dashboard →
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Billing;
