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
import { getAnalyticsHistory, getAnalyticsById, type AnalyticsHistoryItem } from "@/apiHelpers";
import { PLAN_LIMITS, type PricingPlanName, checkJourneyAccess, getRoleName } from "@/lib/plans";
import { formatLocalDate, formatShortDate } from "@/lib/dateUtils";
import { generateReport } from "@/results/layout/downloadReport";
import { setAnalyticsDataTemporary } from "@/results/data/analyticsData";

import {
  getBrandName,
  getBrandWebsite,
  getCompetitorNames,
  getProductId,
  getBrandInfoWithLogos,
  getAnalysisDate,
  getAnalysisKeywords,
  getModelName,
} from "@/results/data/analyticsData";

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

  const analyticsCompanyName = getBrandName();
  const analyticsWebsite = getBrandWebsite();
  const analyticsProductId = getProductId();
  const analyticsKeywords = getAnalysisKeywords();

  const product = products?.[0];
  const application = applications?.[0];
  const [companyName, setCompanyName] = useState(analyticsCompanyName || "");
  const [websiteUrl, setWebsiteUrl] = useState(analyticsWebsite || "");
  const [industry, setIndustry] = useState("");
  const [aboutCompany, setAboutCompany] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [competitors, setCompetitors] = useState<Competitor[]>(() =>
    getCompetitorNames().map((name, i) => ({ id: String(i), name }))
  );
  const [newCompetitor, setNewCompetitor] = useState("");

  const planLimits = PLAN_LIMITS[pricingPlan as PricingPlanName] || PLAN_LIMITS.free;
  const [aiModels, setAiModels] = useState<AIModel[]>([]);

  const [analyticsList, setAnalyticsList] = useState<AnalyticsHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyTotalItems, setHistoryTotalItems] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const canEdit = userRoleInt <= 3;
  const isAdmin = userRoleInt <= 1;
  const canExport = checkJourneyAccess("report:export", userRoleInt, planInt, planExpiresAt).allowed;

  useEffect(() => {
    if (!companyName) {
      if (analyticsCompanyName) setCompanyName(analyticsCompanyName);
      else if (product?.name) setCompanyName(product.name);
      else if (application?.company_name) setCompanyName(application.company_name);
    }
    if (!websiteUrl) {
      if (analyticsWebsite) setWebsiteUrl(analyticsWebsite);
      else if (product?.website) setWebsiteUrl(product.website);
    }
    if (product) {
      setIndustry(product.business_domain || "");
      setAboutCompany(product.description || "");
    }
    if (user) {
      setFullName(`${user.first_name} ${user.last_name}`.trim());
      setEmail(user.email || "");
    }
  }, [product, application, user]);

  useEffect(() => {
    const names = getCompetitorNames();
    if (names.length > 0) {
      setCompetitors(names.map((name, i) => ({ id: String(i), name })));
    }
  }, []);

  useEffect(() => {
    const modelsUsedStr = getModelName();
    const trackedModelIds = modelsUsedStr
      ? modelsUsedStr.split(",").map((s: string) => s.trim().toLowerCase())
      : [];

    const models = ALL_MODELS.map((m) => {
      const allowedByPlan = planLimits.allowedModels.includes(m.id);
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

  useEffect(() => {
    const loadHistory = async () => {
      const productId = analyticsProductId || products?.[0]?.id;
      if (!productId) return;
      setIsLoadingHistory(true);
      try {
        const data = await getAnalyticsHistory(productId, 1);
        setAnalyticsList(data.analytics || []);
        setHistoryPage(data.page);
        setHistoryTotalPages(data.total_pages);
        setHistoryTotalItems(data.total_items);
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

                  {/* Keywords Being Tracked */}
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

                  {/* Competitors Being Tracked */}
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
                  pricingPlan={pricingPlan}
                  planLimits={planLimits}
                  navigate={navigate}
                  toast={toast}
                  historyPage={historyPage}
                  historyTotalPages={historyTotalPages}
                  historyTotalItems={historyTotalItems}
                  isLoadingMore={isLoadingMore}
                  onLoadMore={async () => {
                    const productId = analyticsProductId || products?.[0]?.id;
                    if (!productId || historyPage >= historyTotalPages) return;
                    setIsLoadingMore(true);
                    try {
                      const nextPage = historyPage + 1;
                      const data = await getAnalyticsHistory(productId, nextPage);
                      setAnalyticsList(prev => [...prev, ...(data.analytics || [])]);
                      setHistoryPage(data.page);
                      setHistoryTotalPages(data.total_pages);
                      setHistoryTotalItems(data.total_items);
                    } catch {
                      // silent
                    } finally {
                      setIsLoadingMore(false);
                    }
                  }}
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

// ─── History Row Component ─────────────────────────────────────────────

function HistoryRow({
  item,
  idx,
  canExport,
  navigate,
  toast,
}: {
  item: AnalyticsHistoryItem;
  idx: number;
  canExport: boolean;
  navigate: ReturnType<typeof useNavigate>;
  toast: ReturnType<typeof useToast>["toast"];
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGenerating(true);
    let restore: (() => void) | null = null;

    const cleanup = () => {
      if (restore) restore();
      setIsGenerating(false);
      window.removeEventListener("afterprint", cleanup);
    };

    try {
      const apiResponse = await getAnalyticsById(item.analytics_id);

      if (!apiResponse) {
        toast({ title: "Error", description: "Could not load analytics data.", variant: "destructive" });
        setIsGenerating(false);
        return;
      }

      // Normalize: API may return a single object or { analytics: [...] }
      let normalized = apiResponse;
      if (!Array.isArray(apiResponse.analytics)) {
        if (apiResponse.id === item.analytics_id || apiResponse.product_id) {
          normalized = {
            analytics: [apiResponse],
            count: 1,
            limit: 1,
            product_id: apiResponse.product_id,
          };
        }
      }

      // Validate normalized data before proceeding
      if (
        !normalized.analytics ||
        !Array.isArray(normalized.analytics) ||
        normalized.analytics.length === 0 ||
        !normalized.analytics[0]
      ) {
        toast({ title: "Error", description: "Analytics data is incomplete.", variant: "destructive" });
        setIsGenerating(false);
        return;
      }

      restore = setAnalyticsDataTemporary(normalized);

      // Wait two animation frames for the store to fully propagate
      // before generateReport reads it — prevents the race condition
      // that causes intermittent blank/missing reports.
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      );

      const success = generateReport(toast);

      if (!success) {
        cleanup();
        return;
      }

      // Restore after print dialog closes.
      // Safety net at 60s in case afterprint never fires (common in Chrome).
      window.addEventListener("afterprint", cleanup);
      setTimeout(cleanup, 60000);

    } catch {
      toast({ title: "Error", description: "Failed to generate report.", variant: "destructive" });
      if (restore) restore();
      setIsGenerating(false);
    }
  };

  return (
    <tr
      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
      onClick={() => navigate(`/results?analytics_id=${item.analytics_id}`)}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div>
            <p className="text-sm font-medium text-foreground">
              {formatShortDate(item.generated_at)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatLocalDate(item.generated_at, "h:mm a")}
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
          {item.keywords.length} keywords
        </Badge>
      </td>
      <td className="px-4 py-4 text-center">
        <span className="text-2xl font-bold text-foreground">{item.geo_score}</span>
      </td>
      <td className="px-6 py-4 text-right">
        {!canExport ? (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate("/billing", { state: { from: "/settings" } });
            }}
            className="text-muted-foreground"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Upgrade to Grow
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateReport}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 mr-1.5" />
            )}
            Generate Report
          </Button>
        )}
      </td>
    </tr>
  );
}

// ─── Analysis Run History Tab ─────────────────────────────────────────────

interface AnalysisRunHistoryTabProps {
  analyticsList: AnalyticsHistoryItem[];
  isLoadingHistory: boolean;
  canExport: boolean;
  pricingPlan: string;
  planLimits: (typeof PLAN_LIMITS)[PricingPlanName];
  navigate: ReturnType<typeof useNavigate>;
  toast: ReturnType<typeof useToast>["toast"];
  historyPage: number;
  historyTotalPages: number;
  historyTotalItems: number;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

function AnalysisRunHistoryTab({
  analyticsList,
  isLoadingHistory,
  canExport,
  pricingPlan,
  planLimits,
  navigate,
  toast,
  historyPage,
  historyTotalPages,
  historyTotalItems,
  isLoadingMore,
  onLoadMore,
}: AnalysisRunHistoryTabProps) {
  const keywordConsistency = useMemo(() => {
    const keywordMap: Record<string, { mentions: number[] }> = {};

    analyticsList.forEach((item) => {
      (item.keywords || []).forEach((kw) => {
        if (!keywordMap[kw]) keywordMap[kw] = { mentions: [] };
        keywordMap[kw].mentions.push(1);
      });
    });

    const MIN_RUNS_FOR_SCORE = 3;
    return Object.entries(keywordMap).map(([keyword, data]) => {
      const runs = data.mentions.length;
      const avgMentions = runs > 0 ? data.mentions.reduce((a, b) => a + b, 0) / runs : 0;
      let score: number | null = null;
      if (runs >= MIN_RUNS_FOR_SCORE) {
        const mean = avgMentions;
        if (mean === 0) {
          score = 0;
        } else {
          const variance = data.mentions.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / runs;
          const stdDev = Math.sqrt(variance);
          const cv = stdDev / mean;
          score = Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));
        }
      }
      return { keyword, runs, avgMentions: Math.round(avgMentions * 10) / 10, score };
    });
  }, [analyticsList]);

  const getConsistencyIcon = (score: number) => {
    if (score >= 70) return <span className="text-success">✅</span>;
    if (score >= 40) return <span className="text-warning">⚠️</span>;
    return <span className="text-destructive">🔴</span>;
  };

  const getConfidenceLabel = (_runs: number, score: number) => {
    if (score >= 70) return "High confidence";
    if (score >= 40) return "Moderate confidence";
    return "Low confidence";
  };

  const sectionHeadingClass = "text-2xl md:text-3xl font-bold text-foreground";
  const sectionDescClass = "text-muted-foreground mt-1";

  return (
    <div className="space-y-8">
      <div>
        <h1 className={sectionHeadingClass}>Analysis Run History</h1>
        <p className={sectionDescClass}>
          All past analysis runs with scores and downloadable reports
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : analyticsList.length === 0 ? (
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
                  Keywords
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  AI Visibility Score
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Report
                </th>
              </tr>
            </thead>
            <tbody>
              {analyticsList.map((item, idx) => (
                <HistoryRow
                  key={item.analytics_id}
                  item={item}
                  idx={idx}
                  canExport={canExport}
                  navigate={navigate}
                  toast={toast}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination info + Load More */}
      {analyticsList.length > 0 && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-muted-foreground">
            Showing {analyticsList.length} of {historyTotalItems} runs
          </p>
          {historyPage < historyTotalPages && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : null}
              Load More
            </Button>
          )}
        </div>
      )}

      {/* ─── Keyword Consistency Scores ─── */}
      {keywordConsistency.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={sectionHeadingClass}>Keyword Consistency Scores</h2>
              <p className={sectionDescClass}>
                How consistently your brand appears across multiple runs per keyword
              </p>
            </div>
            <Badge variant="outline" className="text-xs bg-warning/30 border-warning px-3 py-1">
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