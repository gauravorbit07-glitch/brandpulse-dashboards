import { useResults } from "@/results/context/ResultsContext";
import { useEffect, useState, useMemo } from "react";
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
      bg: "bg-primary/[0.04]",
      border: "border-primary/20",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      icon: <Sparkles className="w-5 h-5" />,
      accentLine: "bg-primary",
    },
    neutral: {
      bg: "bg-amber-500/[0.04]",
      border: "border-amber-500/20",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
      icon: <TrendingUp className="w-5 h-5" />,
      accentLine: "bg-amber-500",
    },
    warning: {
      bg: "bg-orange-500/[0.04]",
      border: "border-orange-500/20",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-500",
      icon: <AlertTriangle className="w-5 h-5" />,
      accentLine: "bg-orange-500",
    },
    critical: {
      bg: "bg-destructive/[0.04]",
      border: "border-destructive/20",
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
      icon: <Zap className="w-5 h-5" />,
      accentLine: "bg-destructive",
    },
  };

  const currentHero = heroInsight ? heroStyles[heroInsight.tone] : heroStyles.neutral;

  return (
    <div className="w-full max-w-full overflow-x-hidden p-4 md:p-6 lg:p-8 animate-fade-in">
      <BrandInfoBar />

      <div className="space-y-6">
        {/* ═══ HERO INSIGHT ═══ */}
        {heroInsight && (
          <div className={`relative rounded-xl border ${currentHero.border} ${currentHero.bg} overflow-hidden`}>
            <div className={`absolute top-0 left-0 w-1 h-full ${currentHero.accentLine} rounded-l-xl`} />
            
            <div className="p-5 md:p-6 pl-6 md:pl-8">
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-lg ${currentHero.iconBg} ${currentHero.iconColor} flex-shrink-0`}>
                  {currentHero.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-1">
                    Key Insight
                  </p>
                  <h2 className="text-lg md:text-xl font-semibold text-foreground leading-snug mb-1.5">
                    {heroInsight.headline}
                  </h2>
                  <p className="text-[13px] text-muted-foreground leading-relaxed max-w-2xl mb-3">
                    {heroInsight.subtext}
                  </p>
                  <button
                    onClick={() => navigate("/results/recommendations")}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors group"
                  >
                    {heroInsight.action}
                    <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ METRIC CARDS ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* AI Visibility Card */}
          <div className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/8">
                  <Eye className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="font-semibold text-foreground text-sm leading-none">AI Visibility</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">How AI models see you</p>
                </div>
              </div>
              <TierBadge tier={visibilityData.tier} />
            </div>

            <div className="rounded-lg bg-muted/30 p-4 mb-4 text-center">
              <span className="text-4xl font-bold text-foreground tabular-nums">{visibilityData.score}</span>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium uppercase tracking-wider">AI Visibility Score</p>
            </div>

            <div className="space-y-2.5">
              {[
                { icon: <ArrowUp className="w-3 h-3 text-emerald-500" />, label: "Top Position", value: visibilityData.positionBreakdown.topPosition, color: "text-emerald-600 dark:text-emerald-400" },
                { icon: <ArrowRight className="w-3 h-3 text-amber-500" />, label: "Mid Position (2-4)", value: visibilityData.positionBreakdown.midPosition, color: "text-amber-600 dark:text-amber-400" },
                { icon: <ArrowDown className="w-3 h-3 text-red-400" />, label: "Low Position", value: visibilityData.positionBreakdown.lowPosition, color: "text-red-500 dark:text-red-400" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {row.icon}
                    <span className="text-muted-foreground text-[12px]">{row.label}</span>
                  </div>
                  <span className={`text-[12px] font-semibold tabular-nums ${row.color}`}>{row.value}%</span>
                </div>
              ))}
            </div>

            {visibilityInsight && (
              <div className="mt-4 pt-3 border-t border-border/50">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <span className="text-primary font-medium">↗</span> {visibilityInsight}
                </p>
              </div>
            )}
          </div>

          {/* Brand Mentions Card */}
          <div className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-amber-500/8">
                  <BarChart3 className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <span className="font-semibold text-foreground text-sm leading-none">Brand Mentions</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Percentage alongside top brand</p>
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
                        <span className={`text-[12px] truncate ${item.isTestBrand ? "font-semibold text-primary" : "text-foreground"}`}>
                          {item.brand}
                        </span>
                      </div>
                      <span className={`text-[12px] font-bold tabular-nums ${item.isTestBrand ? "text-primary" : "text-foreground"}`}>
                        {item.responseRate}%
                      </span>
                    </div>
                    <div
                      className="relative h-2 bg-muted/40 rounded-full overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/results/prompts?expandAll=true&viewType=brand`)}
                    >
                      <div
                        className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out ${
                          item.isTestBrand
                            ? "bg-primary"
                            : index === 0
                              ? "bg-amber-500"
                              : "bg-muted-foreground/30"
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
              <div className="mt-4 pt-3 border-t border-border/50">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <span className="text-amber-500 font-medium">💡</span> {mentionsInsight}
                </p>
              </div>
            )}
          </div>

          {/* Sentiment Card */}
          <div className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md ${
                  sentiment.dominant_sentiment === "Positive" ? "bg-emerald-500/8" :
                  sentiment.dominant_sentiment === "Negative" ? "bg-red-500/8" :
                  "bg-amber-500/8"
                }`}>
                  <ThumbsUp className={`w-4 h-4 ${
                    sentiment.dominant_sentiment === "Positive" ? "text-emerald-500" :
                    sentiment.dominant_sentiment === "Negative" ? "text-red-500" :
                    "text-amber-500"
                  }`} />
                </div>
                <div>
                  <span className="font-semibold text-foreground text-sm leading-none">Sentiment</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">How AI talks about you</p>
                </div>
              </div>
              <TierBadge tier={sentiment.dominant_sentiment} />
            </div>

            {sentiment.summary && sentiment.summary !== "No sentiment data available" ? (
              <div className="text-[12px] text-muted-foreground leading-relaxed space-y-2">
                <ul className="space-y-2">
                  {sentiment.summary.split('\n').filter(Boolean).map((line, i) => {
                    const cleaned = line.replace(/^[-*•]\s*/, '').replace(/^\*\*(.*)\*\*:?\s*/, '$1: ');
                    return (
                      <li key={i} className="flex items-start gap-2">
                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          sentiment.dominant_sentiment === "Positive" ? "bg-emerald-400" :
                          sentiment.dominant_sentiment === "Negative" ? "bg-red-400" :
                          "bg-amber-400"
                        }`} />
                        <span className="leading-relaxed">{cleaned}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <EmptyState type="sentiment" />
            )}

            <div className={`mt-4 pt-3 border-t border-border/50`}>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {sentiment.dominant_sentiment === "Positive"
                  ? "AI models speak favorably about your brand."
                  : sentiment.dominant_sentiment === "Negative"
                  ? "AI models express concerns about your brand."
                  : sentiment.dominant_sentiment === "Neutral"
                  ? "AI models mention your brand without strong opinion."
                  : "Sentiment data not yet available."}
              </p>
            </div>
          </div>
        </div>

        {/* ═══ SECTION: Competitive Intelligence ═══ */}
        <SectionDivider label="Competitive Intelligence" icon={<Activity className="w-3.5 h-3.5" />} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CompetitorComparisonChart />
          <BrandMentionsRadar />
        </div>

        {/* ═══ SECTION: Platform & Model Analysis ═══ */}
        <SectionDivider label="Platform & Model Analysis" icon={<Layers className="w-3.5 h-3.5" />} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LLMVisibilityTable />
          <PlatformPresence />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <IntentWiseScoring />
        </div>
      </div>
    </div>
  );
};

const SectionDivider = ({ label, icon }: { label: string; icon: React.ReactNode }) => (
  <div className="flex items-center gap-3 pt-2">
    <div className="h-px flex-1 bg-border/50" />
    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.18em]">
      {icon}
      {label}
    </div>
    <div className="h-px flex-1 bg-border/50" />
  </div>
);

export default OverviewContent;
