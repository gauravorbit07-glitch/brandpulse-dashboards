import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Zap,
  CreditCard,
  Receipt,
  Package,
  AlertTriangle,
  ChevronRight,
  Download,
  X,
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
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
    },
  }),
};

type PlanState = "trial" | "active" | "expiring";

const plans = [
  {
    name: "Launch",
    monthlyPrice: 49,
    quarterlyPrice: 41,
    features: [
      "3 Seed Prompts",
      "Up to 25 AI Prompts Tracked",
      "ChatGPT only",
      "3 Competitors",
      "10 conversations/day",
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
    features: [
      "Up to 6 Seed Prompts",
      "Up to 50 AI Prompts Tracked",
      "ChatGPT, Google AI Mode, Perplexity*",
      "5 Competitors",
      "20 conversations/day",
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

  // Determine plan state (mock — replace with real subscription data)
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

  interface LayoutProps {
    children: React.ReactNode;
    hideNav?: boolean;
  }

  return (
    <Layout>
      <div className="">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-6 space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="inline">Back</span>
          </Button>
          {/* Back button + Page title */}
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">
                Billing & Plans
              </h1>
              <p className="text-xs text-muted-foreground">
                Manage your subscription, usage, and payment details
              </p>
            </div>
          </div>
          {/* Trial Banner */}
          {planState === "trial" && (
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="rounded-xl bg-gradient-to-r from-purple-600 to-purple-800 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white shadow-elevated"
            >
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">
                    Your free trial is active
                  </p>
                  <p className="text-xs opacity-85">
                    9 of 14 days used — upgrade anytime to keep full access
                  </p>
                  <div className="mt-2 h-1.5 w-48 bg-white/25 rounded-full overflow-hidden">
                    <div className="h-full w-[64%] bg-white rounded-full" />
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-purple-700 hover:bg-white/90 font-semibold"
              >
                Upgrade Now
              </Button>
            </motion.div>
          )}

          {/* Expiring Banner */}
          {planState === "expiring" && (
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="rounded-xl bg-gradient-to-r from-warning to-amber-700 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white shadow-elevated"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">
                    Your {currentPlan} plan expires in 5 days
                  </p>
                  <p className="text-xs opacity-85">
                    Renew now to avoid interruption to your analysis
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-amber-700 hover:bg-white/90 font-semibold"
              >
                Renew Plan
              </Button>
            </motion.div>
          )}

          <Tabs defaultValue="plans" className="w-full">
            <TabsList className="bg-muted/50 border border-border mb-6">
              <TabsTrigger value="plans">Plans</TabsTrigger>
              <TabsTrigger value="billing">Billing Details</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
            </TabsList>

            {/* ──────── PLANS TAB ──────── */}
            <TabsContent value="plans" className="space-y-6">
              {/* Billing Toggle */}
              <motion.div
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex items-center justify-between flex-wrap gap-3"
              >
                <h3 className="text-base font-semibold text-foreground">
                  Choose a Plan
                </h3>
                <div className="flex items-center bg-card border border-border rounded-full p-1 gap-0.5">
                  <button
                    onClick={() => setBillingCycle("monthly")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      billingCycle === "monthly"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle("quarterly")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      billingCycle === "quarterly"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Quarterly
                    <Badge
                      variant="outline"
                      className={`text-[11px] px-2 py-0 ${
                        billingCycle === "quarterly"
                          ? "bg-success text-white"
                          : "bg-success/10 text-success border-success/30"
                      }`}
                    >
                      SAVE 16%
                    </Badge>
                  </button>
                </div>
              </motion.div>

              {/* Plan Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan, i) => {
                  const price =
                    billingCycle === "monthly"
                      ? plan.monthlyPrice
                      : plan.quarterlyPrice;
                  const isCurrent =
                    planState === "active" && plan.name === currentPlan;

                  return (
                    <motion.div
                      key={plan.name}
                      custom={i + 2}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      className={`relative rounded-xl border bg-card p-6 transition-all hover:shadow-card ${
                        isCurrent
                          ? "border-primary ring-2 ring-primary/10"
                          : plan.popular
                          ? "border-primary/50"
                          : "border-border"
                      }`}
                    >
                      {/* Badges */}
                      {isCurrent && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="bg-primary text-primary-foreground text-[11px] font-bold px-3">
                            ✓ Current Plan
                          </Badge>
                        </div>
                      )}
                      {!isCurrent && plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="bg-gradient-to-r from-warning to-destructive text-white text-[11px] font-bold px-3 border-0">
                            Most Popular
                          </Badge>
                        </div>
                      )}

                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        {plan.name}
                      </p>
                      <div className="text-3xl font-bold text-foreground tracking-tight mb-0.5">
                        {price ? `$${price}` : "Custom"}
                        {price && (
                          <span className="text-sm font-normal text-muted-foreground">
                            {" "}
                            / month
                          </span>
                        )}
                      </div>
                      {price && (
                        <p className="text-xs text-success font-medium mb-4">
                          {billingCycle === "quarterly"
                            ? `→ Save $${
                                (plan.monthlyPrice! - plan.quarterlyPrice!) * 12
                              }/yr vs monthly`
                            : `$${
                                plan.quarterlyPrice
                              }/mo billed quarterly → Save $${
                                (plan.monthlyPrice! - plan.quarterlyPrice!) * 12
                              }/yr`}
                        </p>
                      )}
                      {!price && (
                        <p className="text-xs text-muted-foreground mb-4">
                          Tailored to your team's needs
                        </p>
                      )}

                      <div className="border-t border-border my-4" />

                      <ul className="space-y-2.5 mb-6">
                        {plan.features.map((f) => (
                          <li
                            key={f}
                            className="flex items-start gap-2 text-sm text-foreground"
                          >
                            <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>

                      {isCurrent ? (
                        <Button
                          variant="outline"
                          className="w-full border-primary text-primary cursor-default"
                          disabled
                        >
                          ✓ Current Plan
                        </Button>
                      ) : price ? (
                        <Button
                          variant={plan.popular ? "default" : "outline"}
                          className="w-full"
                          onClick={() => openCheckout(plan.name, price)}
                        >
                          Select Plan
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full">
                          Contact Sales
                        </Button>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground">
                * Perplexity coming soon. Integrations include Google Analytics
                & Google Search Console.
              </p>
            </TabsContent>

            {/* ──────── BILLING DETAILS TAB ──────── */}
            <TabsContent value="billing" className="space-y-6">
              {/* Current Plan Status */}
              <motion.div
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="rounded-xl border border-border bg-card p-6 space-y-5"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Package className="w-4 h-4" />
                  Current Plan
                  <Badge className="bg-success/10 text-success border-success/30 text-[11px]">
                    Active
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Plan", value: "Grow", accent: true },
                    { label: "Billing Cycle", value: "Monthly" },
                    { label: "Next Billing", value: "Jan 16, 2026" },
                    { label: "Amount", value: "$159 / mo" },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        {item.label}
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          item.accent ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Usage Meters */}
                <div className="space-y-3">
                  {[
                    { label: "AI Prompts Used", current: 32, max: 50 },
                    { label: "GEO Conversations Today", current: 14, max: 20 },
                    { label: "Competitors Tracked", current: 4, max: 5 },
                  ].map((usage) => (
                    <div key={usage.label}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground font-medium">
                          {usage.label}
                        </span>
                        <span className="font-semibold text-foreground">
                          {usage.current} / {usage.max}
                        </span>
                      </div>
                      <Progress
                        value={(usage.current / usage.max) * 100}
                        className="h-1.5"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm">
                    ⬆ Change Plan
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/50 hover:bg-destructive/10"
                  >
                    Cancel Subscription
                  </Button>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="rounded-xl border border-border bg-card p-6 space-y-4"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <CreditCard className="w-4 h-4" />
                  Payment Method
                </div>
                <div className="flex items-center justify-between bg-muted/50 border border-border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-gradient-to-br from-amber-300 to-amber-500 rounded flex items-center justify-center text-[9px] font-bold text-amber-900">
                      VISA
                    </div>
                    <div>
                      <p className="text-sm font-mono tracking-wider text-foreground">
                        •••• •••• •••• 4242
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Expires 08 / 27
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Update Card
                  </Button>
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
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
                  <Receipt className="w-4 h-4" />
                  Invoice History
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {[
                          "Invoice",
                          "Date",
                          "Plan",
                          "Amount",
                          "Status",
                          "",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pb-3 pr-4"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr
                          key={inv.id}
                          className="border-b border-border last:border-b-0"
                        >
                          <td className="py-3 pr-4 font-mono text-xs text-foreground">
                            {inv.id}
                          </td>
                          <td className="py-3 pr-4 text-foreground">
                            {inv.date}
                          </td>
                          <td className="py-3 pr-4 text-foreground">
                            {inv.plan}
                          </td>
                          <td className="py-3 pr-4 font-semibold text-foreground">
                            {inv.amount}
                          </td>
                          <td className="py-3 pr-4">
                            <Badge
                              variant="outline"
                              className={
                                inv.status === "Paid"
                                  ? "bg-success/10 text-success border-success/30"
                                  : "bg-warning/10 text-warning border-warning/30"
                              }
                            >
                              {inv.status}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <button className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Checkout Modal */}
        <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Complete Your Purchase</DialogTitle>
              <DialogDescription>
                You're upgrading to <strong>{checkoutPlan}</strong> plan
              </DialogDescription>
            </DialogHeader>

            <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>{checkoutPlan} Plan</span>
                <span>{checkoutPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Billing cycle</span>
                <span className="capitalize">{billingCycle}</span>
              </div>
              <div className="flex justify-between text-success text-xs">
                <span>✓ Trial credit applied</span>
                <span>-$0.00</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-border mt-2">
                <span>Total due today</span>
                <span>{checkoutPrice}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase">
                  Cardholder Name
                </Label>
                <Input placeholder="John Doe" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase">
                  Card Number
                </Label>
                <Input placeholder="1234 5678 9012 3456" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">
                    Expiry Date
                  </Label>
                  <Input placeholder="MM / YY" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">
                    CVV
                  </Label>
                  <Input placeholder="•••" />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                🔒 Secured with 256-bit SSL encryption
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCheckoutOpen(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handlePay}>
                Pay & Activate Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Success Modal */}
        <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
          <DialogContent className="sm:max-w-md text-center">
            <div className="text-5xl mb-4">🎉</div>
            <DialogTitle className="text-xl">You're all set!</DialogTitle>
            <DialogDescription>
              Your <strong>{checkoutPlan}</strong> plan is now active. A
              confirmation has been sent to your email.
            </DialogDescription>
            <div className="bg-success/5 border border-success/20 rounded-lg p-4 text-left mt-2">
              <p className="text-xs font-semibold text-success uppercase tracking-wider mb-2">
                Plan Activated
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">Plan</span>
                  <p className="font-semibold text-foreground">
                    {checkoutPlan}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">
                    Next Billing
                  </span>
                  <p className="font-semibold text-foreground">Jan 16, 2026</p>
                </div>
              </div>
            </div>
            <Button
              className="w-full mt-4"
              onClick={() => {
                setSuccessOpen(false);
                handleBack();
              }}
            >
              Go to Dashboard
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Billing;
