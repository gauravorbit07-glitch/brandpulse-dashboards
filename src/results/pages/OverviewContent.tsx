import { useResults } from "@/results/context/ResultsContext";
import { useEffect, useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import {
  getAIVisibilityMetrics,
  getMentionsPosition,
  getBrandMentionResponseRates,
  getSentiment,
  hasAnalyticsData,
  getBrandName,
  getBrandInfoWithLogos,
} from "@/results/data/analyticsData";
import { LLMVisibilityTable } from "@/results/overview/LLMVisibilityTable";
import { PlatformPresence } from "@/results/overview/PlatformPresence";
import { CompetitorComparisonChart } from "@/results/overview/CompetitorComparisonChart";
import { BrandMentionsRadar } from "@/results/overview/BrandMentionsRadar";
import BrandInfoBar from "@/results/overview/BrandInfoBar";
import { IntentWiseScoring } from "@/results/overview/IntentWiseScoring";
import { TierBadge } from "@/results/ui/TierBadge";
import { toOrdinal } from "@/results/data/formulas";
import { OverviewSkeleton } from "@/results/overview/OverviewSkeleton";
import { EmptyState } from "@/results/overview/EmptyState";
import {
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Trophy,
  Medal,
  Award,
  Sparkles,
  AlertTriangle,
  Zap,
  Eye,
  BarChart3,
  ArrowUpRight,
  Activity,
  Layers,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const OverviewContent = () => {
  const { dataReady, analyticsVersion } = useResults();
  const [animatedBars, setAnimatedBars] = useState(false);
  const navigate = useNavigate();
  const analyticsAvailable = hasAnalyticsData();

  const visibilityData = useMemo(() => {
    if (!analyticsAvailable) {
      return {
        score: 0, tier: "Low", brandPosition: 0, totalBrands: 0,
        positionBreakdown: { topPosition: 0, midPosition: 0, lowPosition: 0 },
      };
    }
    return getAIVisibilityMetrics();
  }, [analyticsAvailable, analyticsVersion]);

  const mentionsData = useMemo(() => {
    if (!analyticsAvailable) {
      return { position: 0, tier: "Low", totalBrands: 0, topBrandMentions: 0, brandMentions: 0, allBrandMentions: {} };
    }
    return getMentionsPosition();
  }, [analyticsAvailable, analyticsVersion]);

  const brandMentionRates = useMemo(() => {
    if (!analyticsAvailable) return [];
    return getBrandMentionResponseRates();
  }, [analyticsAvailable, analyticsVersion]);

  const sentiment = useMemo(() => {
    if (!analyticsAvailable) return { dominant_sentiment: "N/A", summary: "" };
    return getSentiment();
  }, [analyticsAvailable, analyticsVersion]);

  const brandName = useMemo(() => analyticsAvailable ? getBrandName() : "", [analyticsAvailable, analyticsVersion]);

  useEffect(() => {
    if (dataReady && analyticsAvailable) {
      const timer = setTimeout(() => setAnimatedBars(true), 100);
      return () => clearTimeout(timer);
    }
  }, [dataReady, analyticsAvailable]);

  const heroInsight = useMemo(() => {
    if (!analyticsAvailable || !brandName) return null;
    const { score, tier, brandPosition, totalBrands } = visibilityData;
    if (tier === "High" || brandPosition === 1) {
      return {
        headline: `${brandName} is leading in AI visibility`,
        subtext: `Ranked #${brandPosition} out of ${totalBrands} brands. You're being actively recommended by AI models — keep building on this momentum.`,
        tone: "positive" as const,
        action: "See what's working →",
      };
    }
    if (tier === "Medium") {
      return {
        headline: `${brandName} has room to grow in AI search`,
        subtext: `Ranked #${brandPosition} out of ${totalBrands} brands. Targeted content improvements could push you into the top tier.`,
        tone: "neutral" as const,
        action: "View recommendations →",
      };
    }
    if (score === 0) {
      return {
        headline: `${brandName} isn't appearing in AI results yet`,
        subtext: `AI models aren't surfacing your brand for tracked queries. Potential customers asking AI about your space won't find you.`,
        tone: "critical" as const,
        action: "Start improving →",
      };
    }
    return {
      headline: `${brandName} needs attention — competitors lead`,
      subtext: `Ranked #${brandPosition} out of ${totalBrands} brands. Competitors are being recommended ahead of you in AI responses.`,
      tone: "warning" as const,
      action: "See action plan →",
    };
  }, [visibilityData, brandName, analyticsAvailable]);

  const visibilityInsight = useMemo(() => {
    const { brandPosition, totalBrands, score } = visibilityData;
    if (!brandPosition || brandPosition <= 0) return null;
    if (score === 0) return "Your brand is invisible in AI responses. This is an opportunity to establish presence before competitors solidify their lead.";
    if (brandPosition === 1) return `Top-ranked brand among ${totalBrands} competitors. AI models actively recommend you.`;
    const aheadOf = totalBrands - brandPosition;
    return `Ahead of ${aheadOf} brand${aheadOf !== 1 ? "s" : ""}, but ${brandPosition - 1} competitor${brandPosition - 1 !== 1 ? "s" : ""} rank${brandPosition - 1 === 1 ? "s" : ""} higher.`;
  }, [visibilityData]);

  const mentionsInsight = useMemo(() => {
    const { position, totalBrands } = mentionsData;
    if (!position || position <= 0) return null;
    if (position === 1) return `Leading in mention frequency — AI models reference you more than any competitor.`;
    return `${toOrdinal(position)} in mentions out of ${totalBrands} brands. The top brand gets significantly more AI references.`;
  }, [mentionsData]);

  const getMedalIcon = (index: number, isTestBrand: boolean) => {
    if (index === 0) return <Trophy className="w-4 h-4 text-amber-500" />;
    if (index === 1) return <Medal className="w-4 h-4 text-muted-foreground" />;
    if (isTestBrand) return <Award className="w-4 h-4 text-primary" />;
    return <Award className="w-4 h-4 text-amber-600" />;
  };

  if (!dataReady || !analyticsAvailable) {
    return <OverviewSkeleton />;
  }

  const heroStyles = {
    positive: {
      gradient: "from-emerald-500/[0.06] via-emerald-400/[0.03] to-transparent",
      border: "border-emerald-500/15",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      icon: <Sparkles className="w-6 h-6" />,
      accentLine: "from-emerald-400 to-emerald-600",
      glow: "shadow-[0_0_80px_-20px_hsl(142_76%_36%/0.15)]",
    },
    neutral: {
      gradient: "from-amber-500/[0.06] via-amber-400/[0.03] to-transparent",
      border: "border-amber-500/15",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
      icon: <TrendingUp className="w-6 h-6" />,
      accentLine: "from-amber-400 to-amber-600",
      glow: "shadow-[0_0_80px_-20px_hsl(45_93%_58%/0.15)]",
    },
    warning: {
      gradient: "from-orange-500/[0.06] via-orange-400/[0.03] to-transparent",
      border: "border-orange-500/15",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-500",
      icon: <AlertTriangle className="w-6 h-6" />,
      accentLine: "from-orange-400 to-orange-600",
      glow: "shadow-[0_0_80px_-20px_hsl(25_95%_53%/0.15)]",
    },
    critical: {
      gradient: "from-red-500/[0.06] via-red-400/[0.03] to-transparent",
      border: "border-red-500/15",
      iconBg: "bg-red-500/10",
      iconColor: "text-red-500",
      icon: <Zap className="w-6 h-6" />,
      accentLine: "from-red-400 to-red-600",
      glow: "shadow-[0_0_80px_-20px_hsl(0_84%_60%/0.15)]",
    },
  };

  const currentHero = heroInsight ? heroStyles[heroInsight.tone] : heroStyles.neutral;

  return (
    <div className="w-full max-w-full overflow-x-hidden p-4 md:p-6 lg:p-8 animate-fade-in">
      <BrandInfoBar />

      <div className="space-y-8">
        {/* ═══ HERO INSIGHT ═══ */}
        {heroInsight && (
          <div className={`relative rounded-2xl border ${currentHero.border} bg-gradient-to-br ${currentHero.gradient} backdrop-blur-sm overflow-hidden ${currentHero.glow} transition-shadow duration-500`}>
            <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${currentHero.accentLine} rounded-l-2xl`} />
            
            <div className="p-6 md:p-8 pl-7 md:pl-10">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${currentHero.iconBg} ${currentHero.iconColor} flex-shrink-0 ring-1 ring-inset ring-white/10`}>
                  {currentHero.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-1.5">
                    Key Insight
                  </p>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground leading-tight mb-2 tracking-tight">
                    {heroInsight.headline}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mb-4">
                    {heroInsight.subtext}
                  </p>
                  <button
                    onClick={() => navigate("/results/recommendations")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors group bg-primary/5 hover:bg-primary/10 px-3.5 py-2 rounded-lg"
                  >
                    {heroInsight.action}
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ METRIC CARDS ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
          {/* AI Visibility Card */}
          <div className="group relative bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-5 hover:border-primary/20 transition-all duration-300 hover:shadow-elevated">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Eye className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="font-semibold text-foreground text-sm">AI Visibility</span>
                  <p className="text-[10px] text-muted-foreground leading-tight">How AI models see you</p>
                </div>
              </div>
              <TierBadge tier={visibilityData.tier} />
            </div>

            <div className="rounded-xl bg-muted/40 p-4 mb-4 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent" />
              <span className="text-4xl font-bold text-foreground tracking-tight relative tabular-nums">{visibilityData.score}</span>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium relative uppercase tracking-wider">Visibility Score</p>
            </div>

            <div className="space-y-2.5">
              {[
                { icon: <ArrowUp className="w-3 h-3 text-emerald-500" />, label: "Top Position", value: visibilityData.positionBreakdown.topPosition, color: "text-emerald-600 dark:text-emerald-400" },
                { icon: <ArrowRight className="w-3 h-3 text-amber-500" />, label: "Mid (2-4)", value: visibilityData.positionBreakdown.midPosition, color: "text-amber-600 dark:text-amber-400" },
                { icon: <ArrowDown className="w-3 h-3 text-red-400" />, label: "Low Position", value: visibilityData.positionBreakdown.lowPosition, color: "text-red-500 dark:text-red-400" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {row.icon}
                    <span className="text-muted-foreground text-xs">{row.label}</span>
                  </div>
                  <span className={`text-xs font-semibold tabular-nums ${row.color}`}>{row.value}%</span>
                </div>
              ))}
            </div>

            {visibilityInsight && (
              <div className="mt-4 pt-3 border-t border-border/40">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <span className="text-primary font-medium">Insight:</span> {visibilityInsight}
                </p>
              </div>
            )}
          </div>

          {/* Brand Mentions Card */}
          <div className="group relative bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-5 hover:border-amber-500/20 transition-all duration-300 hover:shadow-elevated">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <BarChart3 className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <span className="font-semibold text-foreground text-sm">Brand Mentions</span>
                  <p className="text-[10px] text-muted-foreground leading-tight">Response frequency</p>
                </div>
              </div>
              <TierBadge tier={mentionsData.tier} />
            </div>

            {brandMentionRates.length > 0 ? (
              <div className="space-y-3">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">% of AI responses mentioning each brand</p>
                {brandMentionRates.map((item, index) => (
                  <div key={`brand-mention-${item.brand}-${index}`} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getMedalIcon(index, item.isTestBrand)}
                        <span className={`text-xs truncate ${item.isTestBrand ? "font-semibold text-primary" : "text-foreground"}`}>
                          {item.brand}
                        </span>
                      </div>
                      <span className={`text-xs font-bold tabular-nums ${item.isTestBrand ? "text-primary" : "text-foreground"}`}>
                        {item.responseRate}%
                      </span>
                    </div>
                    <div
                      className="relative h-1.5 bg-muted/50 rounded-full overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/results/prompts?expandAll=true&viewType=brand`)}
                    >
                      <div
                        className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out ${
                          item.isTestBrand
                            ? "bg-gradient-to-r from-primary/80 to-primary"
                            : index === 0
                              ? "bg-gradient-to-r from-amber-500 to-amber-400"
                              : "bg-gradient-to-r from-muted-foreground/40 to-muted-foreground/30"
                        }`}
                        style={{
                          width: animatedBars ? `${item.responseRate}%` : "0%",
                          transitionDelay: `${index * 120}ms`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState type="mentions" />
            )}

            {mentionsInsight && (
              <div className="mt-4 pt-3 border-t border-border/40">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <span className="text-amber-500 font-medium">Insight:</span> {mentionsInsight}
                </p>
              </div>
            )}
          </div>

          {/* Sentiment Card */}
          <div className="group relative bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-5 hover:border-emerald-500/20 transition-all duration-300 hover:shadow-elevated">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${
                  sentiment.dominant_sentiment === "Positive" ? "bg-emerald-500/10" :
                  sentiment.dominant_sentiment === "Negative" ? "bg-red-500/10" :
                  "bg-amber-500/10"
                }`}>
                  <ThumbsUp className={`w-4 h-4 ${
                    sentiment.dominant_sentiment === "Positive" ? "text-emerald-500" :
                    sentiment.dominant_sentiment === "Negative" ? "text-red-500" :
                    "text-amber-500"
                  }`} />
                </div>
                <div>
                  <span className="font-semibold text-foreground text-sm">Sentiment</span>
                  <p className="text-[10px] text-muted-foreground leading-tight">How AI talks about you</p>
                </div>
              </div>
              <TierBadge tier={sentiment.dominant_sentiment} />
            </div>

            <div className={`rounded-xl p-3.5 mb-4 text-center border ${
              sentiment.dominant_sentiment === "Positive" ? "bg-emerald-500/[0.04] border-emerald-500/10" :
              sentiment.dominant_sentiment === "Negative" ? "bg-red-500/[0.04] border-red-500/10" :
              "bg-amber-500/[0.04] border-amber-500/10"
            }`}>
              <p className="text-sm font-medium text-foreground leading-snug">
                {sentiment.dominant_sentiment === "Positive"
                  ? "AI models speak favorably about your brand"
                  : sentiment.dominant_sentiment === "Negative"
                  ? "AI models express concerns about your brand"
                  : sentiment.dominant_sentiment === "Neutral"
                  ? "AI models mention your brand without strong opinion"
                  : "Sentiment data not yet available"}
              </p>
            </div>

            {sentiment.summary && sentiment.summary !== "No sentiment data available" ? (
              <div className="text-[11px] text-muted-foreground leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-2 prose-li:my-1 prose-ul:list-disc prose-ul:pl-5 prose-strong:text-foreground">
                <ReactMarkdown>{sentiment.summary}</ReactMarkdown>
              </div>
            ) : (
              <EmptyState type="sentiment" />
            )}
          </div>
        </div>

        {/* ═══ SECTION: Competitive Intelligence ═══ */}
        <SectionDivider label="Competitive Intelligence" icon={<Activity className="w-3.5 h-3.5" />} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
          <CompetitorComparisonChart />
          <BrandMentionsRadar />
        </div>

        {/* ═══ SECTION: Platform & Model Analysis ═══ */}
        <SectionDivider label="Platform & Model Analysis" icon={<Layers className="w-3.5 h-3.5" />} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
          <LLMVisibilityTable />
          <PlatformPresence />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
          <IntentWiseScoring />
        </div>
      </div>
    </div>
  );
};

const SectionDivider = ({ label, icon }: { label: string; icon: React.ReactNode }) => (
  <div className="flex items-center gap-3 py-1">
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/60 to-transparent" />
    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] bg-muted/40 px-3 py-1.5 rounded-full border border-border/40">
      {icon}
      {label}
    </div>
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/60 to-transparent" />
  </div>
);

export default OverviewContent;
