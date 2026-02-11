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

  // --- Hero insight generation ---
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

  // --- Interpretive text ---
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
      gradient: "from-emerald-500/[0.08] via-emerald-400/[0.04] to-transparent",
      border: "border-emerald-500/20",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      icon: <Sparkles className="w-7 h-7" />,
      accentLine: "bg-emerald-500",
    },
    neutral: {
      gradient: "from-amber-500/[0.08] via-amber-400/[0.04] to-transparent",
      border: "border-amber-500/20",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
      icon: <TrendingUp className="w-7 h-7" />,
      accentLine: "bg-amber-500",
    },
    warning: {
      gradient: "from-orange-500/[0.08] via-orange-400/[0.04] to-transparent",
      border: "border-orange-500/20",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-500",
      icon: <AlertTriangle className="w-7 h-7" />,
      accentLine: "bg-orange-500",
    },
    critical: {
      gradient: "from-red-500/[0.08] via-red-400/[0.04] to-transparent",
      border: "border-red-500/20",
      iconBg: "bg-red-500/10",
      iconColor: "text-red-500",
      icon: <Zap className="w-7 h-7" />,
      accentLine: "bg-red-500",
    },
  };

  const currentHero = heroInsight ? heroStyles[heroInsight.tone] : heroStyles.neutral;

  return (
    <div className="w-full max-w-full overflow-x-hidden p-4 md:p-6 lg:p-8 animate-fade-in">
      <BrandInfoBar />

      <div className="space-y-10">
        {/* ═══════════════════════════════════════════
            HERO INSIGHT — Dominant, unmissable
        ═══════════════════════════════════════════ */}
        {heroInsight && (
          <div className={`relative rounded-2xl border ${currentHero.border} bg-gradient-to-br ${currentHero.gradient} backdrop-blur-sm overflow-hidden`}>
            {/* Accent line */}
            <div className={`absolute top-0 left-0 w-1.5 h-full ${currentHero.accentLine} rounded-l-2xl`} />
            
            <div className="p-6 md:p-8 lg:p-10 pl-8 md:pl-10 lg:pl-12">
              <div className="flex items-start gap-5">
                <div className={`p-3.5 rounded-2xl ${currentHero.iconBg} ${currentHero.iconColor} shadow-sm flex-shrink-0`}>
                  {currentHero.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-2">
                    Key Insight
                  </p>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight mb-3 tracking-tight">
                    {heroInsight.headline}
                  </h2>
                  <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mb-5">
                    {heroInsight.subtext}
                  </p>
                  <button
                    onClick={() => navigate("/results/recommendations")}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group"
                  >
                    {heroInsight.action}
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            METRIC CARDS — Glass, storytelling, premium
        ═══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {/* AI Visibility Card */}
          <div className="group relative bg-card rounded-2xl border border-border/60 p-6 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-0.5">
            {/* Subtle top accent */}
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="font-semibold text-foreground text-sm">AI Visibility</span>
                  <p className="text-[11px] text-muted-foreground">How AI models see you</p>
                </div>
              </div>
              <TierBadge tier={visibilityData.tier} />
            </div>

            {/* Score display */}
            <div className="rounded-xl bg-gradient-to-br from-muted/60 to-muted/30 p-5 mb-5 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent" />
              <span className="text-5xl font-bold text-foreground tracking-tight relative">{visibilityData.score}</span>
              <p className="text-xs text-muted-foreground mt-1.5 font-medium relative">Visibility Score</p>
            </div>

            {/* Position breakdown */}
            <div className="space-y-3">
              {[
                { icon: <ArrowUp className="w-3.5 h-3.5 text-emerald-500" />, label: "Top Position", value: visibilityData.positionBreakdown.topPosition, color: "text-emerald-600 dark:text-emerald-400" },
                { icon: <ArrowRight className="w-3.5 h-3.5 text-amber-500" />, label: "Mid (2-4)", value: visibilityData.positionBreakdown.midPosition, color: "text-amber-600 dark:text-amber-400" },
                { icon: <ArrowDown className="w-3.5 h-3.5 text-red-400" />, label: "Low Position", value: visibilityData.positionBreakdown.lowPosition, color: "text-red-500 dark:text-red-400" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2.5">
                    {row.icon}
                    <span className="text-muted-foreground text-xs">{row.label}</span>
                  </div>
                  <span className={`text-xs font-semibold ${row.color}`}>{row.value}%</span>
                </div>
              ))}
            </div>

            {/* Insight */}
            {visibilityInsight && (
              <div className="mt-5 pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  💡 {visibilityInsight}
                </p>
              </div>
            )}
          </div>

          {/* Brand Mentions Card */}
          <div className="group relative bg-card rounded-2xl border border-border/60 p-6 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-0.5">
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
            
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-500/5">
                  <BarChart3 className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <span className="font-semibold text-foreground text-sm">Brand Mentions</span>
                  <p className="text-[11px] text-muted-foreground">Response frequency</p>
                </div>
              </div>
              <TierBadge tier={mentionsData.tier} />
            </div>

            {brandMentionRates.length > 0 ? (
              <div className="space-y-3.5">
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">% of AI responses mentioning each brand</p>
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
                      className="relative h-2 bg-muted/60 rounded-full overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/results/prompts?expandAll=true&viewType=brand`)}
                    >
                      <div
                        className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out ${
                          item.isTestBrand
                            ? "bg-gradient-to-r from-primary/80 to-primary"
                            : index === 0
                              ? "bg-gradient-to-r from-amber-500 to-amber-400"
                              : "bg-gradient-to-r from-amber-600/70 to-amber-500/70"
                        }`}
                        style={{
                          width: animatedBars ? `${item.responseRate}%` : "0%",
                          transitionDelay: `${index * 150}ms`,
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
              <div className="mt-5 pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  💡 {mentionsInsight}
                </p>
              </div>
            )}
          </div>

          {/* Sentiment Card */}
          <div className="group relative bg-card rounded-2xl border border-border/60 p-6 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-0.5">
            <div className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent ${
              sentiment.dominant_sentiment === "Positive" ? "via-emerald-500/30" :
              sentiment.dominant_sentiment === "Negative" ? "via-red-500/30" :
              "via-amber-500/30"
            } to-transparent`} />
            
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${
                  sentiment.dominant_sentiment === "Positive" ? "from-emerald-500/15 to-emerald-500/5" :
                  sentiment.dominant_sentiment === "Negative" ? "from-red-500/15 to-red-500/5" :
                  "from-amber-500/15 to-amber-500/5"
                }`}>
                  <ThumbsUp className={`w-5 h-5 ${
                    sentiment.dominant_sentiment === "Positive" ? "text-emerald-500" :
                    sentiment.dominant_sentiment === "Negative" ? "text-red-500" :
                    "text-amber-500"
                  }`} />
                </div>
                <div>
                  <span className="font-semibold text-foreground text-sm">Sentiment</span>
                  <p className="text-[11px] text-muted-foreground">How AI talks about you</p>
                </div>
              </div>
              <TierBadge tier={sentiment.dominant_sentiment} />
            </div>

            {/* Sentiment meaning */}
            <div className={`rounded-xl p-4 mb-5 text-center border ${
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
              <div className="text-xs text-muted-foreground leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-2 prose-li:my-1 prose-ul:list-disc prose-ul:pl-5 prose-strong:text-foreground">
                <ReactMarkdown>{sentiment.summary}</ReactMarkdown>
              </div>
            ) : (
              <EmptyState type="sentiment" />
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            SECTION DIVIDER
        ═══════════════════════════════════════════ */}
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">Competitive Intelligence</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* ═══════════════════════════════════════════
            CHARTS — Premium containers
        ═══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
          <CompetitorComparisonChart />
          <BrandMentionsRadar />
        </div>

        {/* ═══════════════════════════════════════════
            SECTION DIVIDER
        ═══════════════════════════════════════════ */}
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">Platform & Model Analysis</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* ═══════════════════════════════════════════
            TABLES
        ═══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
          <LLMVisibilityTable />
          <PlatformPresence />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
          <IntentWiseScoring />
        </div>
      </div>
    </div>
  );
};

export default OverviewContent;
