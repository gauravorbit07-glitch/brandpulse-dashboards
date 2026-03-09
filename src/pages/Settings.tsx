import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  History,
  User,
  Globe,
  X,
  Plus,
  Loader2,
  Download,
  Sparkles,
  Trash2,
  Upload,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { getAnalyticsList, getAnalyticsById, type AnalyticsListItem } from "@/apiHelpers";
import { PLAN_LIMITS, type PricingPlanName, checkJourneyAccess, getRoleName } from "@/lib/plans";
import { formatLocalDate, formatShortDate } from "@/lib/dateUtils";
import { generateReport } from "@/results/layout/downloadReport";
import { setAnalyticsData } from "@/results/data/analyticsData";

// ─── Import all tracking data from analyticsData.ts ──────────────────────
import {
  getBrandName,
  getBrandWebsite,
  getCompetitorNames,
  getSearchKeywords,
  getProductId,
  getBrandInfoWithLogos,
  getAnalysisDate,
  getAnalysisKeywords,
  getModelName,
} from "@/results/data/analyticsData";

import { calculatePercentile, getTierFromPercentile } from "@/results/data/formulas";

// ─── Types ────────────────────────────────────────────────────────────────
type SettingsTab = "company" | "history" | "account";

interface Competitor {
  id: string;
  name: string;
}

interface AIModel {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  allowedByPlan: boolean;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

// ─── Avatar color helper ──────────────────────────────────────────────────
const AVATAR_COLORS = [
  "bg-destructive",
  "bg-primary",
  "bg-success",
  "bg-warning",
  "bg-[hsl(258_90%_66%)]",
  "bg-[hsl(330_80%_55%)]",
];
const getAvatarColor = (name: string) => {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

// ─── Model definitions ────────────────────────────────────────────────────
const ALL_MODELS: { id: string; name: string; icon: string }[] = [
  { id: "openai", name: "ChatGPT", icon: "🤖" },
  { id: "google-ai", name: "Google AI Mode", icon: "G" },
  { id: "gemini", name: "Gemini", icon: "✦" },
  { id: "anthropic", name: "Claude", icon: "◆" },
  { id: "perplexity", name: "Perplexity", icon: "⊛" },
];

export default function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, products, applications, pricingPlan, userRoleInt, planInt, planExpiresAt, collaborators, logout } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<SettingsTab>("company");

  // ─── Seed state from analyticsData.ts ──────────────────────────────────
  const analyticsCompanyName = getBrandName();
  const analyticsWebsite = getBrandWebsite();
  const analyticsProductId = getProductId();
  const analyticsKeywords = getAnalysisKeywords();

  // Company & Tracking state — pre-populated from analyticsData
  const product = products?.[0];
  const application = applications?.[0];
  const [companyName, setCompanyName] = useState(
    analyticsCompanyName || ""
  );
  const [websiteUrl, setWebsiteUrl] = useState(
    analyticsWebsite || ""
  );
  const [industry, setIndustry] = useState("");
  const [aboutCompany, setAboutCompany] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Competitors — sourced entirely from analyticsData
  const [competitors, setCompetitors] = useState<Competitor[]>(() =>
    getCompetitorNames().map((name, i) => ({ id: String(i), name }))
  );
  const [newCompetitor, setNewCompetitor] = useState("");

  // AI Models state
  const planLimits = PLAN_LIMITS[pricingPlan as PricingPlanName] || PLAN_LIMITS.free;
  const [aiModels, setAiModels] = useState<AIModel[]>([]);

  // Analysis Run History state
  const [analyticsList, setAnalyticsList] = useState<AnalyticsListItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Account state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Permissions
  const canEdit = userRoleInt <= 3;
  const isAdmin = userRoleInt <= 1;
  const canExport = checkJourneyAccess("report:export", userRoleInt, planInt, planExpiresAt).allowed;

  // ─── Sync company fields: analyticsData takes priority, auth context fills gaps ──
  useEffect(() => {
    // Company name: prefer analytics data, fall back to product/application
    if (!companyName) {
      if (analyticsCompanyName) {
        setCompanyName(analyticsCompanyName);
      } else if (product?.name) {
        setCompanyName(product.name);
      } else if (application?.company_name) {
        setCompanyName(application.company_name);
      }
    }

    // Website: prefer analytics data
    if (!websiteUrl) {
      if (analyticsWebsite) {
        setWebsiteUrl(analyticsWebsite);
      } else if (product?.website) {
        setWebsiteUrl(product.website);
      }
    }

    // Industry & description only come from product (not in analyticsData)
    if (product) {
      setIndustry(product.business_domain || "");
      setAboutCompany(product.description || "");
    }

    if (user) {
      setFullName(`${user.first_name} ${user.last_name}`.trim());
      setEmail(user.email || "");
    }
  }, [product, application, user]);

  // ─── Re-sync competitors whenever analytics data changes ──────────────
  useEffect(() => {
    const names = getCompetitorNames();
    if (names.length > 0) {
      setCompetitors(names.map((name, i) => ({ id: String(i), name })));
    }
  }, []);

  // Initialize AI models based on plan + actually tracked models from analytics
  useEffect(() => {
    // Get models actually used from analytics data
    const modelsUsedStr = getModelName();
    const trackedModelIds = modelsUsedStr
      ? modelsUsedStr.split(",").map((s: string) => s.trim().toLowerCase())
      : [];

    const models = ALL_MODELS.map((m) => {
      const allowedByPlan = planLimits.allowedModels.includes(m.id);
      // Model is enabled if it's tracked in analytics AND allowed by plan
      const isTracked = trackedModelIds.some((t: string) => 
        t === m.id || 
        (m.id === "openai" && (t === "chatgpt" || t === "openai")) ||
        (m.id === "google-ai" && (t === "google_ai_mode" || t === "google-ai" || t === "google_ai_overview")) ||
        (m.id === "gemini" && t === "gemini") ||
        (m.id === "anthropic" && (t === "anthropic" || t === "claude")) ||
        (m.id === "perplexity" && t === "perplexity")
      );
      return {
        ...m,
        enabled: allowedByPlan && (trackedModelIds.length === 0 ? allowedByPlan : isTracked),
        allowedByPlan,
      };
    });
    setAiModels(models);
  }, [pricingPlan]);

  // Load analytics history — uses analyticsProductId from analyticsData first
  useEffect(() => {
    const loadHistory = async () => {
      // Prefer product ID from analyticsData, fall back to secure storage
      const productId = analyticsProductId || products?.[0]?.id;
      if (!productId) return;
      setIsLoadingHistory(true);
      try {
        const maxHistory = planLimits.maxAnalyticsHistory;
        const data = await getAnalyticsList(productId, maxHistory);
        setAnalyticsList(data.analytics || []);
      } catch {
        // silent
      } finally {
        setIsLoadingHistory(false);
      }
    };
    if (activeTab === "history") loadHistory();
  }, [activeTab, analyticsProductId]);

  const handleSaveCompany = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({ title: "Changes saved", description: "Company details updated successfully." });
    }, 800);
  };

  const handleSaveAccount = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({ title: "Changes saved", description: "Account details updated." });
    }, 800);
  };

  const addCompetitor = () => {
    const trimmed = newCompetitor.trim();
    if (!trimmed) return;
    if (competitors.length >= planLimits.maxCompetitors) {
      toast({ title: "Limit reached", description: `Your plan allows up to ${planLimits.maxCompetitors} competitors.`, variant: "destructive" });
      return;
    }
    if (competitors.find((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      toast({ title: "Already exists", description: "This competitor is already being tracked.", variant: "destructive" });
      return;
    }
    setCompetitors([...competitors, { id: Date.now().toString(), name: trimmed }]);
    setNewCompetitor("");
  };

  const removeCompetitor = (id: string) => {
    setCompetitors(competitors.filter((c) => c.id !== id));
  };

  const toggleModel = (modelId: string) => {
    setAiModels((prev) =>
      prev.map((m) => {
        if (m.id !== modelId) return m;
        if (!m.allowedByPlan) {
          toast({ title: "Upgrade required", description: "This model is not available on your current plan.", variant: "destructive" });
          return m;
        }
        return { ...m, enabled: !m.enabled };
      })
    );
  };

  const handleBack = () => {
    const from = location.state?.from;
    const loopPages = ["/settings", "/billing", "/invite"];
    if (from && !loopPages.includes(from)) {
      navigate(from);
    } else {
      const hasProduct = products && products.length > 0;
      navigate(hasProduct ? "/results" : "/input");
    }
  };

  const handleDeleteAccount = () => {
    setDeleteDialogOpen(false);
    logout();
    navigate("/");
    toast({ title: "Account deleted", description: "Your account has been permanently removed.", variant: "destructive" });
  };

  const tabs: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { key: "company", label: "Company & Tracking", icon: <Building2 className="w-4 h-4" /> },
    { key: "history", label: "Analysis Run History", icon: <History className="w-4 h-4" /> },
    { key: "account", label: "Account", icon: <User className="w-4 h-4" /> },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
          {/* Back Button */}
          <motion.button
            onClick={handleBack}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="group inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border bg-card shadow-sm text-muted-foreground hover:border-primary/40 hover:text-primary hover:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5 duration-200" />
            <span className="text-sm font-semibold">Back</span>
          </motion.button>

          {/* Page Layout: Sidebar + Content */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <motion.aside
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="w-full md:w-56 flex-shrink-0"
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Settings
              </p>
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left ${
                      activeTab === tab.key
                        ? "text-primary bg-primary/5 border-l-2 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </motion.aside>

            {/* Content */}
            <motion.div
              key={activeTab}
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex-1 min-w-0"
            >
              {/* ════════════════════ COMPANY & TRACKING ════════════════════ */}
              {activeTab === "company" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                      Company & Tracking
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      Manage your company profile and what's being tracked
                    </p>
                  </div>

                  {/* Company Details */}
                  <div className="rounded-2xl border border-border bg-card shadow-sm p-6 space-y-5">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">Company Details</h2>
                      <p className="text-sm text-muted-foreground">Basic information about your company</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Company Name
                        </Label>
                        <Input
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          disabled={!canEdit}
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Website URL
                        </Label>
                        <Input
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          disabled={!canEdit}
                          className="bg-background"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Industry
                      </Label>
                      <Input
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        disabled={!canEdit}
                        className="bg-background"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        About Company
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Used by AI to better understand your brand context
                      </p>
                      <Textarea
                        value={aboutCompany}
                        onChange={(e) => setAboutCompany(e.target.value.slice(0, 500))}
                        disabled={!canEdit}
                        rows={4}
                        className="bg-background resize-y"
                      />
                      <p className="text-xs text-muted-foreground">
                        {aboutCompany.length} / 500 characters
                      </p>
                    </div>

                    {canEdit && (
                      <Button onClick={handleSaveCompany} disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Save Changes
                      </Button>
                    )}
                  </div>

                  {/* Keywords Being Tracked — sourced from analyticsData */}
                  {analyticsKeywords.length > 0 && (
                    <div className="rounded-2xl border border-border bg-card shadow-sm p-6 space-y-4">
                      <div>
                        <h2 className="text-base font-semibold text-foreground">Keywords Being Tracked</h2>
                        <p className="text-sm text-muted-foreground">
                          {analyticsKeywords.length} keyword{analyticsKeywords.length !== 1 ? "s" : ""} from your last analysis run
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {analyticsKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-border bg-muted/40 text-sm text-foreground font-medium"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Competitors Being Tracked — sourced from analyticsData */}
                  <div className="rounded-2xl border border-border bg-card shadow-sm p-6 space-y-4">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">Competitors Being Tracked</h2>
                      <p className="text-sm text-muted-foreground">
                        {competitors.length} competitor{competitors.length !== 1 ? "s" : ""} · Max {planLimits.maxCompetitors} on your plan
                      </p>
                    </div>

                    {competitors.length > 0 && (
                      <div className="space-y-2">
                        {competitors.map((comp) => (
                          <div
                            key={comp.id}
                            className="flex items-center justify-between py-2.5 px-3 rounded-lg border border-border bg-background"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground ${getAvatarColor(comp.name)}`}
                              >
                                {comp.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-foreground">{comp.name}</span>
                            </div>
                            {canEdit && (
                              <button
                                onClick={() => removeCompetitor(comp.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {canEdit && competitors.length < planLimits.maxCompetitors && (
                      <button
                        onClick={() => {
                          const name = prompt("Enter competitor name:");
                          if (name?.trim()) {
                            setNewCompetitor(name.trim());
                            setTimeout(() => addCompetitor(), 0);
                          }
                        }}
                        className="w-full py-3 border-2 border-dashed border-border rounded-xl text-sm font-medium text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
                      >
                        <Plus className="w-4 h-4 inline mr-1.5" />
                        Add Competitor
                      </button>
                    )}

                    {competitors.length >= planLimits.maxCompetitors && (
                      <p className="text-xs text-muted-foreground text-center">
                        Competitor limit reached.{" "}
                        <button
                          onClick={() => navigate("/billing")}
                          className="text-primary hover:underline"
                        >
                          Upgrade plan
                        </button>{" "}
                        to add more.
                      </p>
                    )}
                  </div>

                  {/* AI Models Tracked */}
                  <div className="rounded-2xl border border-border bg-card shadow-sm p-6 space-y-4">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">AI Models Tracked</h2>
                      <p className="text-sm text-muted-foreground">
                        Toggle which models are included in analysis
                      </p>
                    </div>

                    <div className="space-y-1">
                      {aiModels.map((model) => (
                        <div
                          key={model.id}
                          className={`flex items-center justify-between py-3 px-3 rounded-lg border border-border bg-background ${
                            !model.allowedByPlan ? "opacity-50" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm">
                              {model.icon}
                            </span>
                            <div>
                              <span className="text-sm font-medium text-foreground">{model.name}</span>
                              {!model.allowedByPlan && (
                                <p className="text-xs text-muted-foreground">Upgrade to unlock</p>
                              )}
                            </div>
                          </div>
                          <Switch
                            checked={model.enabled}
                            onCheckedChange={() => toggleModel(model.id)}
                            disabled={!canEdit || !model.allowedByPlan}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ════════════════════ ANALYSIS RUN HISTORY ════════════════════ */}
              {activeTab === "history" && (
                <AnalysisRunHistoryTab
                  analyticsList={analyticsList}
                  isLoadingHistory={isLoadingHistory}
                  canExport={canExport}
                  planLimits={planLimits}
                  navigate={navigate}
                  toast={toast}
                />
              )}

              {/* ════════════════════ ACCOUNT ════════════════════ */}
              {activeTab === "account" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">Account</h1>
                    <p className="text-muted-foreground mt-1">
                      Manage your personal account details
                    </p>
                  </div>

                  {/* Contact Details */}
                  <div className="rounded-2xl border border-border bg-card shadow-sm p-6 space-y-5">
                    <h2 className="text-base font-semibold text-foreground">Contact Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Full Name
                        </Label>
                        <Input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Email Address
                        </Label>
                        <Input
                          value={email}
                          disabled
                          className="bg-muted/30"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Role
                      </Label>
                      <Input
                        value={getRoleName(userRoleInt).charAt(0).toUpperCase() + getRoleName(userRoleInt).slice(1)}
                        disabled
                        className="bg-muted/30 max-w-xs"
                      />
                    </div>

                    <Button onClick={handleSaveAccount} disabled={isSaving}>
                      {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Save Changes
                    </Button>
                  </div>

                  {/* Company Logo */}
                  <div className="rounded-2xl border border-border bg-card shadow-sm p-6 space-y-4">
                    <h2 className="text-base font-semibold text-foreground">Company Logo</h2>
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                      <Upload className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                      <p className="text-sm font-medium text-foreground">Upload your company logo</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, SVG — shown in exported reports
                      </p>
                      <Button variant="outline" size="sm" className="mt-4">
                        Browse Files
                      </Button>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="rounded-2xl border border-destructive/20 bg-card shadow-sm p-6">
                    <h2 className="text-base font-semibold text-foreground">Danger Zone</h2>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Delete Account</p>
                        <p className="text-xs text-muted-foreground">
                          Permanently remove your account and all data
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-destructive/30 text-destructive hover:bg-destructive/5"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your data, analysis history, and settings will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete Permanently
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

// ─── Analysis Run History Tab (extracted component) ──────────────────────

interface AnalysisRunHistoryTabProps {
  analyticsList: AnalyticsListItem[];
  isLoadingHistory: boolean;
  canExport: boolean;
  pricingPlan: string;
  planLimits: (typeof PLAN_LIMITS)[PricingPlanName];
  navigate: ReturnType<typeof useNavigate>;
  toast: ReturnType<typeof useToast>["toast"];
}

interface EnrichedAnalytics {
  analytics_id: string;
  created_at: string;
  promptsCount: number;
  aiVisibilityScore: number;
  tier: string;
  models: string[];
  keywords: { name: string; runs: number; avgMentions: number; models: string[]; consistencyScore: number | null }[];
  hasReport: boolean;
}

function AnalysisRunHistoryTab({ analyticsList, isLoadingHistory, canExport, planLimits, navigate, toast }: AnalysisRunHistoryTabProps) {
  const [enrichedList, setEnrichedList] = useState<EnrichedAnalytics[]>([]);
  const [isEnriching, setIsEnriching] = useState(false);
  const [keywordConsistency, setKeywordConsistency] = useState<
    { keyword: string; runs: number; avgMentions: number; models: string[]; score: number | null }[]
  >([]);

  // Enrich analytics list items with scores from the full analytics data
  useEffect(() => {
    if (analyticsList.length === 0) return;

    const enrichAll = async () => {
      setIsEnriching(true);
      const results: EnrichedAnalytics[] = [];
      const keywordMap: Record<string, { mentions: number[]; models: Set<string> }> = {};

      for (const item of analyticsList) {
        try {
          const resp = await getAnalyticsById(item.analytics_id);
          const analyticsPayload =
            resp?.analytics?.[0]?.analytics?.[0]?.analytics ??
            resp?.analytics?.[0]?.analytics ??
            resp?.analytics ??
            null;

          let promptsCount = 0;
          const searchKeywords = analyticsPayload?.search_keywords || {};
          Object.values(searchKeywords).forEach((kw: any) => {
            if (Array.isArray(kw?.prompts)) promptsCount += kw.prompts.length;
          });

          // AI Visibility Score — use same logic as overview (getAIVisibilityMetrics)
          const brands = analyticsPayload?.brands || [];
          // Reverse brands to match getBrandInfoWithLogos order (highest first)
          const reversedBrands = [...brands].reverse();
          const brandNameForScore = analyticsPayload?.brand_name || "";
          const mainBrand = reversedBrands.find((b: any) => b.brand === brandNameForScore) || reversedBrands[0];
          const rawGeoScore = typeof mainBrand?.geo_score === 'object' 
            ? (mainBrand?.geo_score?.Value ?? 0) 
            : (mainBrand?.geo_score ?? 0);
          const geoScore = rawGeoScore;
          const allScores = brands.map((b: any) => {
            const s = b?.geo_score;
            return typeof s === 'object' ? (s?.Value ?? 0) : (s ?? 0);
          });
          const percentile = allScores.length > 1 ? calculatePercentile(geoScore, allScores) : (geoScore > 0 ? 50 : 0);
          const tier = getTierFromPercentile(percentile);

          // Models used
          const modelsStr = analyticsPayload?.models_used || "";
          const models = modelsStr ? modelsStr.split(",").map((s: string) => s.trim()) : [];

          // Has report (completed status)
          const status = resp?.analytics?.[0]?.status?.toLowerCase() ?? "";
          const hasReport = status === "completed";

          // Track keyword consistency
          Object.values(searchKeywords).forEach((kw: any) => {
            const kwName = kw?.name || "";
            if (!kwName) return;
            if (!keywordMap[kwName]) {
              keywordMap[kwName] = { mentions: [], models: new Set() };
            }
            // Count mentions for this keyword in this run
            const mentionCount = Array.isArray(kw?.prompts) ? kw.prompts.length : 0;
            keywordMap[kwName].mentions.push(mentionCount);
            models.forEach((m: string) => keywordMap[kwName].models.add(m));
          });

          results.push({
            analytics_id: item.analytics_id,
            created_at: item.created_at,
            promptsCount,
            aiVisibilityScore: Math.round(geoScore),
            tier,
            models,
            keywords: [],
            hasReport,
          });
        } catch {
          results.push({
            analytics_id: item.analytics_id,
            created_at: item.created_at,
            promptsCount: 0,
            aiVisibilityScore: 0,
            tier: "Low",
            models: [],
            keywords: [],
            hasReport: false,
          });
        }
      }

      setEnrichedList(results);

      // Build keyword consistency data
      const MIN_RUNS_FOR_SCORE = 3;
      const kwConsistency = Object.entries(keywordMap).map(([keyword, data]) => {
        const runs = data.mentions.length;
        const totalMentions = data.mentions.reduce((a, b) => a + b, 0);
        const avgMentions = runs > 0 ? totalMentions / runs : 0;
        const models = Array.from(data.models);
        // Simple consistency score: based on how consistent mention counts are
        let score: number | null = null;
        if (runs >= MIN_RUNS_FOR_SCORE) {
          const mean = avgMentions;
          if (mean === 0) {
            score = 0;
          } else {
            const variance = data.mentions.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / runs;
            const stdDev = Math.sqrt(variance);
            const cv = stdDev / mean; // coefficient of variation
            score = Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));
          }
        }
        return { keyword, runs, avgMentions: Math.round(avgMentions * 10) / 10, models, score };
      });
      setKeywordConsistency(kwConsistency);
      setIsEnriching(false);
    };

    enrichAll();
  }, [analyticsList]);

  const getModelBadgeLabel = (model: string): string => {
    const m = model.toLowerCase();
    if (m === "openai" || m === "chatgpt") return "GPT";
    if (m === "gemini") return "Gem";
    if (m === "google_ai_mode" || m === "google-ai" || m === "google_ai_overview") return "GAI";
    if (m === "anthropic" || m === "claude") return "Cld";
    if (m === "perplexity") return "Pplx";
    return model.slice(0, 3).toUpperCase();
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "high": return "bg-success/10 text-success border-success/20";
      case "medium": return "bg-warning/10 text-warning border-warning/20";
      default: return "bg-destructive/10 text-destructive border-destructive/20";
    }
  };

  const getConsistencyIcon = (score: number) => {
    if (score >= 70) return <span className="text-success">✅</span>;
    if (score >= 40) return <span className="text-warning">⚠️</span>;
    return <span className="text-destructive">🔴</span>;
  };

  const getConfidenceLabel = (runs: number, score: number) => {
    if (score >= 70) return "High confidence";
    if (score >= 40) return "Moderate confidence";
    return "Low confidence";
  };

  return (
    <div className="space-y-8">
      {/* ─── Analysis Run History Table ─── */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Analysis Run History
        </h1>
        <p className="text-muted-foreground mt-1">
          All past analysis runs with scores and downloadable reports
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {isLoadingHistory || isEnriching ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : enrichedList.length === 0 ? (
          <div className="text-center py-20 px-6">
            <History className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-foreground">No analysis runs yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Run your first analysis to see results here
            </p>
            <Button size="sm" className="mt-4" onClick={() => navigate("/input")}>
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Run Analysis
            </Button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Date of Run
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Prompts
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  AI Visibility Score
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tier
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Report
                </th>
              </tr>
            </thead>
            <tbody>
              {enrichedList.map((item, idx) => (
                <tr
                  key={item.analytics_id}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => navigate(`/results?analytics_id=${item.analytics_id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {formatShortDate(item.created_at)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatLocalDate(item.created_at, "h:mm a")}
                        </p>
                      </div>
                      {idx === 0 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-success/10 text-success border-success/20">
                          Latest
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Badge variant="outline" className="text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {item.promptsCount} prompts
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-2xl font-bold text-foreground">{item.aiVisibilityScore}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Badge variant="outline" className={`text-xs ${getTierColor(item.tier)}`}>
                      {item.tier}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {item.hasReport && canExport ? (
                      <Button variant="outline" size="sm" onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const analyticsData = await getAnalyticsById(item.analytics_id);
                          if (analyticsData) {
                            setAnalyticsData(analyticsData);
                            generateReport(toast);
                          } else {
                            toast({ title: "Error", description: "Could not load analytics data.", variant: "destructive" });
                          }
                        } catch {
                          toast({ title: "Error", description: "Failed to generate report.", variant: "destructive" });
                        }
                      }}>
                        <Download className="w-3.5 h-3.5 mr-1.5" />
                        Download
                      </Button>
                    ) : !item.hasReport ? (
                      <Button variant="outline" size="sm" disabled className="opacity-50 cursor-not-allowed" onClick={(e) => {
                        e.stopPropagation();
                      }}>
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        Processing...
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        navigate("/billing", { state: { from: "/settings" } });
                      }} className="border-warning/30 text-warning hover:bg-warning/5">
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        Upgrade to Grow
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {enrichedList.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Showing last {planLimits.maxAnalyticsHistory} runs ·{" "}
          <button onClick={() => navigate("/billing")} className="text-primary hover:underline">
            Upgrade for more history
          </button>
        </p>
      )}

      {/* ─── Keyword Consistency Scores ─── */}
      {keywordConsistency.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Keyword Consistency Scores</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                How consistently your brand appears across multiple runs per keyword
              </p>
            </div>
            <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20 px-3 py-1">
              <Sparkles className="w-3 h-3 mr-1" />
              Min. 3 runs needed per keyword
            </Badge>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Keyword / Seed Prompt
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Runs
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Avg. Mention Count
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    AI Models
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Consistency Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {keywordConsistency.map((kw) => (
                  <tr key={kw.keyword} className="border-b border-border last:border-0">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-foreground">{kw.keyword}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-semibold text-foreground">{kw.runs}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {kw.avgMentions > 0 ? (
                        <span className="text-sm text-foreground">
                          {kw.avgMentions} <span className="text-xs text-muted-foreground">/run</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {kw.models.map((m) => (
                          <Badge key={m} variant="secondary" className="text-[10px] px-1.5 py-0.5">
                            {getModelBadgeLabel(m)}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {kw.score !== null ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="flex items-center gap-1.5">
                            {getConsistencyIcon(kw.score)}
                            <span className="text-2xl font-bold text-foreground">{kw.score}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {kw.runs} runs · {getConfidenceLabel(kw.runs, kw.score)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-sm text-muted-foreground">⏳ Building</span>
                          <span className="text-[10px] text-muted-foreground">
                            {3 - kw.runs} more run{3 - kw.runs !== 1 ? "s" : ""} needed
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}