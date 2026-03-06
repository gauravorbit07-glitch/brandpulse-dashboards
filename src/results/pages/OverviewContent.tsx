import { useResults } from "@/results/context/ResultsContext";
import { useEffect, useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import {
  getAIVisibilityMetrics,
  getMentionsPosition,
  getBrandMentionResponseRates,
  getSentiment,
  hasAnalyticsData,
} from "@/results/data/analyticsData";
import { LLMVisibilityTable } from "@/results/overview/LLMVisibilityTable";
import { SourceIntelligence } from "@/results/overview/SourceIntelligence";
import { CompetitorComparisonChart } from "@/results/overview/CompetitorComparisonChart";
import { BrandMentionsRadar } from "@/results/overview/BrandMentionsRadar";
import BrandInfoBar from "@/results/overview/BrandInfoBar";
import { IntentWiseScoring } from "@/results/overview/IntentWiseScoring";
import { TierBadge } from "@/results/ui/TierBadge";
import { toOrdinal } from "@/results/data/formulas";
import {
  Info,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  Search,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Trophy,
  Medal,
  Award,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

// Parse summary string with ● delimiters into individual points
const parseSummaryToPoints = (summary: string): string[] => {
  if (!summary) return [];
  const parts = summary
    .split(/[•.]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return parts;
};

const OverviewContent = () => {
  const { dataReady, analyticsVersion } = useResults();
  const [animatedBars, setAnimatedBars] = useState(false);
  const navigate = useNavigate();
  // FIX 1: Check if analytics data is available first
  const analyticsAvailable = hasAnalyticsData();

  // FIX 2: Only compute derived values when data is actually available
  // Use empty fallbacks to maintain hook order
  const visibilityData = useMemo(() => {
    if (!analyticsAvailable) {
      return {
        score: 0,
        tier: "Low",
        brandPosition: 0,
        totalBrands: 0,
        positionBreakdown: {
          topPosition: 0,
          midPosition: 0,
          lowPosition: 0,
        },
      };
    }
    return getAIVisibilityMetrics();
  }, [analyticsAvailable, analyticsVersion]);

  const mentionsData = useMemo(() => {
    if (!analyticsAvailable) {
      return {
        position: 0,
        tier: "Low",
        totalBrands: 0,
        topBrandMentions: 0,
        brandMentions: 0,
        allBrandMentions: {},
      };
    }
    return getMentionsPosition();
  }, [analyticsAvailable, analyticsVersion]);

  const brandMentionRates = useMemo(() => {
    if (!analyticsAvailable) return [];
    const rates = getBrandMentionResponseRates();
    const allBrandMentions = (getMentionsPosition().allBrandMentions ||
      {}) as Record<string, number>;

    return [...rates].sort((a, b) => {
      // Primary: responseRate descending
      if (b.responseRate !== a.responseRate)
        return b.responseRate - a.responseRate;
      // Tiebreaker: raw mention count descending (NOT AI visibility)
      const aScore = allBrandMentions[a.brand] ?? 0;
      const bScore = allBrandMentions[b.brand] ?? 0;
      if (bScore !== aScore) return bScore - aScore;
      // Final tiebreaker: non-test brand goes first (test brand sinks on ties)
      if (a.isTestBrand && !b.isTestBrand) return 1;
      if (!a.isTestBrand && b.isTestBrand) return -1;
      return 0;
    });
  }, [analyticsAvailable, analyticsVersion]);

  const sentiment = useMemo(() => {
    if (!analyticsAvailable) {
      return { dominant_sentiment: "N/A", summary: "" };
    }
    return getSentiment();
  }, [analyticsAvailable, analyticsVersion]);

  useEffect(() => {
    if (dataReady && analyticsAvailable) {
      const timer = setTimeout(() => setAnimatedBars(true), 100);
      return () => clearTimeout(timer);
    }
  }, [dataReady, analyticsAvailable]);

  const getMedalIcon = (index: number, isTestBrand: boolean) => {
    if (index === 0) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (index === 1) return <Medal className="w-4 h-4 text-gray-400" />;
    if (index === 2) return <Medal className="w-4 h-4 text-amber-600" />;
    return <Award className="w-4 h-4 text-muted-foreground" />;
  };

  const mentionsInsight = useMemo(() => {
    const { position, totalBrands } = mentionsData;

    if (!position || position <= 0) return null;

    if (position === 1) {
      return `Your brand is leading in brand mention score among ${totalBrands} brands.`;
    }

    return `Your brand ranked at ${toOrdinal(
      position
    )} position out of ${totalBrands} brands.`;
  }, [mentionsData]);

  const visibilityInsight = useMemo(() => {
    const { brandPosition, totalBrands } = visibilityData;

    if (!brandPosition || brandPosition <= 0 || totalBrands <= 0) return null;

    const percentileRank = Math.round(
      ((totalBrands - brandPosition) / totalBrands) * 100
    );

    if (brandPosition === 1) {
      return `Your visibility score is higher than ${percentileRank} percent of brands tested for these queries.`;
    }

    return `Your visibility score is higher than ${percentileRank} percent of brands tested for these queries.`;
  }, [visibilityData]);

  // FIX 3: Show loading state properly
  if (!dataReady || !analyticsAvailable) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4 animate-spin" />
            <h2 className="text-2xl font-bold mb-2">Analysis Started</h2>
            <p className="text-muted-foreground">
              We are preparing your brand's comprehensive analysis.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden p-4 md:p-6">
      {/* Brand Info Bar - Only on Overview page */}
      <BrandInfoBar />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            Overall Insights
          </h1>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Comprehensive overview of your brand's AI performance.</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Main metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* AI Visibility Card */}
          <div className="bg-card rounded-xl border p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-foreground">
                    AI Visibility
                  </span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">
                        Measures how prominently your brand appears in
                        AI-generated responses. This score is calculated based
                        on your selected prompts/queries and ranked against
                        competitors.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <TierBadge tier={visibilityData.tier} />
            </div>

            {/* Header */}
            <div className="grid grid-cols-[auto_1fr_auto] gap-3 text-xs text-muted-foreground mb-3 pb-2 border-b border-border">
              <span>
                A weighted score based on where and how often your brand appears
                in AI responses across multiple LLMs
              </span>
            </div>

            {/* Score Display */}
            <div className="border-2 border-border rounded-lg p-3 mb-4">
              <div className="text-center">
                <span className="text-xl text-muted-foreground">
                  AI Visibility Score:{" "}
                </span>
                <span className="text-2xl font-bold text-foreground">
                  {visibilityData.score}
                </span>
              </div>
            </div>

            {/* Position Breakdown */}
            <div className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-between text-sm cursor-help hover:bg-muted/50 rounded-md px-2 py-1 -mx-2 transition-colors">
                    <div className="flex items-center gap-2">
                      <ArrowUp className="w-4 h-4 text-emerald-500" />
                      <span className="text-foreground">Top Position</span>
                    </div>
                    <span className="font-semibold text-foreground">
                      {visibilityData.positionBreakdown.topPosition}%
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-sm">
                    Percentage of queries where your brand ranked 1 across
                    Gemini and OpenAI.
                  </p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-between text-sm cursor-help hover:bg-muted/50 rounded-md px-2 py-1 -mx-2 transition-colors">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-amber-500" />
                      <span className="text-foreground">
                        Mid Position (2-4)
                      </span>
                    </div>
                    <span className="font-semibold text-foreground">
                      {visibilityData.positionBreakdown.midPosition}%
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-sm">
                    Percentage of queries where your brand ranked 2nd to 4th
                    across Gemini and OpenAI.
                  </p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-between text-sm cursor-help hover:bg-muted/50 rounded-md px-2 py-1 -mx-2 transition-colors">
                    <div className="flex items-center gap-2">
                      <ArrowDown className="w-4 h-4 text-red-500" />
                      <span className="text-foreground">Low Position</span>
                    </div>
                    <span className="font-semibold text-foreground">
                      {visibilityData.positionBreakdown.lowPosition}%
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-sm">
                    Percentage of queries where your brand ranked 5th or lower
                    across Gemini and OpenAI.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>

            {visibilityData.brandPosition > 0 && visibilityInsight && (
              <p className="text-sm text-foreground font-medium border-t pt-3 mt-4">
                {visibilityInsight}
              </p>
            )}
          </div>

          {/* Brand Mention Score Card */}
          <div className="bg-card rounded-xl border border-border p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                </div>
                <span className="font-semibold text-foreground">
                  Brand Mentions
                </span>
              </div>
              <TierBadge tier={mentionsData.tier} />
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-[auto_1fr_auto] gap-3 text-xs text-muted-foreground mb-3 pb-2 border-b border-border">
              <span>% of AI responses where your brand is mentioned</span>
            </div>

            {/* FIX 4: Add unique keys using brand name + index */}
            <div className="space-y-3 py-2">
              {brandMentionRates.map((item, index) => {
                return (
                  <div
                    key={`brand-mention-${item.brand}-${index}`}
                    className="grid grid-cols-[auto_1fr_auto] gap-3 items-center"
                  >
                    <div className="flex items-center gap-2 min-w-[100px]">
                      {getMedalIcon(index, item.isTestBrand)}
                      <span
                        className={`text-sm truncate ${
                          item.isTestBrand
                            ? "font-semibold text-primary"
                            : "text-foreground"
                        }`}
                      >
                        {item.brand}
                      </span>
                    </div>

                    <div
                      className="relative h-6 bg-muted rounded overflow-hidden cursor-pointer"
                      onClick={() => {
                        navigate(
                          `/results/prompts?expandAll=true&viewType=brand`
                        );
                      }}
                    >
                      <div
                        className={`absolute left-0 top-0 h-full rounded transition-all duration-700 ease-out ${
                          item.isTestBrand
                            ? "bg-gradient-to-r from-primary/80 to-primary"
                            : index === 0
                            ? "bg-gradient-to-r from-amber-500 to-amber-400"
                            : "bg-gradient-to-r from-amber-600/80 to-amber-500/80"
                        }`}
                        style={{
                          width: animatedBars ? `${item.responseRate}%` : "0%",
                          transitionDelay: `${index * 150}ms`,
                        }}
                      />
                    </div>

                    <span
                      className={`text-sm font-medium min-w-[50px] text-right ${
                        item.isTestBrand ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {item.responseRate}%
                    </span>
                  </div>
                );
              })}
            </div>

            {mentionsData.position > 0 && mentionsInsight && (
              <p className="text-sm text-foreground font-medium border-t pt-3 mt-4">
                {mentionsInsight}
              </p>
            )}
          </div>

          {/* Sentiment Card */}
          <div className="bg-card rounded-xl border p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <ThumbsUp className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                </div>
                <span className="font-semibold text-foreground">Sentiment</span>
              </div>
              <TierBadge tier={sentiment.dominant_sentiment} />
            </div>
            {/* Header */}
            <div className="grid grid-cols-[auto_1fr_auto] gap-3 text-xs text-muted-foreground mb-3 pb-2 border-b border-border">
              <span>How AI models perceives your brand</span>
            </div>
            <div className="py-2">
              <div className="space-y-2 pl-2 text-sm text-foreground leading-relaxed">
                {sentiment.summary ? (
                  parseSummaryToPoints(sentiment.summary).map(
                    (point, index) => (
                      <p
                        key={`sentiment-${index}`}
                        className="flex items-start gap-2"
                      >
                        <span className="text-foreground">●</span>
                        <span>{point}</span>
                      </p>
                    )
                  )
                ) : (
                  <p className="text-muted-foreground">
                    No sentiment data available
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <CompetitorComparisonChart />
          <BrandMentionsRadar />
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <LLMVisibilityTable />
          <SourceIntelligence />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <IntentWiseScoring />
        </div>
      </div>
    </div>
  );
};

export default OverviewContent;
