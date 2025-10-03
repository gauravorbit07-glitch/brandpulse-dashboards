import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Eye, MessageSquare } from "lucide-react";

interface ExecutiveSummary {
  purpose: string;
  ai_visibility_benchmark: {
    brand_score_and_tier: string;
    competitor_positioning: {
      competitor_name: string;
      relative_tier: string;
      relative_score: string;
    }[];
  };
  strengths: string[];
  weaknesses: string[];
  competitor_benchmarking: {
    leaders: { name: string; score: string }[];
    mid_tier: { name: string; score: string }[];
    laggards: { name: string; score: string }[];
  };
  prioritized_actions: string[];
  conclusion: string;
}

interface OverallInsightsProps {
  insights: {
    ai_visibility?: {
      tier: string;
      ai_visibility_score: { Value: number };
      weighted_mentions_total: { Value: number };
      distinct_queries_count?: { Value: number };
      breakdown?: {
        top_two_mentions: number;
        top_five_mentions: number;
        later_mentions: number;
        calculation?: string;
      };
      tier_mapping_method?: string;
      explanation?: string;
    };
    brand_mentions?: {
      level: string;
      mentions_count: { Value: number };
      total_sources_checked: { Value: number };
      queries_with_mentions?: number;
      alignment_with_visibility?: string;
    };
    dominant_sentiment?: {
      sentiment: string;
      statement: string;
      summary?: string;
    };
    summary?: string;
  };
  executiveSummary?: ExecutiveSummary;
}

const getTierColor = (tier: string) => {
  switch (tier.toLowerCase()) {
    case "high":
      return "bg-positive text-positive-foreground";
    case "medium":
      return "bg-warning text-warning-foreground";
    case "low":
      return "bg-negative text-negative-foreground";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

const getSentimentColor = (sentiment: string) => {
  switch (sentiment.toLowerCase()) {
    case "positive":
      return "bg-positive text-positive-foreground";
    case "negative":
      return "bg-negative text-negative-foreground";
    case "neutral":
      return "bg-warning text-warning-foreground";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

export const OverallInsights = ({
  insights,
  executiveSummary,
}: OverallInsightsProps) => {
  const visibilityScore =
    insights?.ai_visibility?.ai_visibility_score?.Value || 0;
  const queriesWithMentions =
    insights?.brand_mentions?.mentions_count?.Value || 0;
  const totalQueries =
    insights?.brand_mentions?.total_sources_checked?.Value || 0;
  const mentionsPercentage =
    totalQueries > 0 ? (queriesWithMentions / totalQueries) * 100 : 0;
  const distinctQueriesCount =
    insights?.ai_visibility?.distinct_queries_count?.Value ||
    queriesWithMentions;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Overall Insights</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className={`border-2 ${
            insights?.ai_visibility?.tier?.toLowerCase() === "high"
              ? "border-positive shadow-positive/20 shadow-lg"
              : insights?.ai_visibility?.tier?.toLowerCase() === "medium"
              ? "border-warning shadow-warning/20 shadow-lg"
              : insights?.ai_visibility?.tier?.toLowerCase() === "low"
              ? "border-negative shadow-negative/20 shadow-lg"
              : "border-border"
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                AI Visibility
              </CardTitle>
              <Badge
                className={getTierColor(insights?.ai_visibility?.tier || "")}
                variant="secondary"
              >
                {insights?.ai_visibility?.tier || "N/A"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Visibility Score</span>
                <span className="font-semibold">{visibilityScore}</span>
              </div>
              <Progress
                value={Math.min((visibilityScore / 300) * 100, 100)}
                className="h-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 text-center">
              <div>
                <div className="text-xl font-bold text-primary">
                  {insights?.ai_visibility?.weighted_mentions_total?.Value || 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  Total Mentions
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-primary">
                  {distinctQueriesCount}
                </div>
                <div className="text-xs text-muted-foreground">Query Types</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`border-2 ${
            insights?.brand_mentions?.level?.toLowerCase() === "high"
              ? "border-positive shadow-positive/20 shadow-lg"
              : insights?.brand_mentions?.level?.toLowerCase() === "medium"
              ? "border-warning shadow-warning/20 shadow-lg"
              : insights?.brand_mentions?.level?.toLowerCase() === "low"
              ? "border-negative shadow-negative/20 shadow-lg"
              : "border-border"
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Brand Mentions
              </CardTitle>
              <Badge
                className={getTierColor(insights?.brand_mentions?.level || "")}
                variant="secondary"
              >
                {insights?.brand_mentions?.level || "N/A"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Mention Coverage</span>
                <span className="font-semibold">
                  {mentionsPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress value={mentionsPercentage} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 text-center">
              <div>
                <div className="text-xl font-bold text-primary">
                  {queriesWithMentions}
                </div>
                <div className="text-xs text-muted-foreground">
                  Queries with Mentions
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-muted-foreground">
                  {totalQueries}
                </div>
                <div className="text-xs text-muted-foreground">
                  Total Queries
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`border-2 ${
            insights?.dominant_sentiment?.sentiment?.toLowerCase() ===
            "positive"
              ? "border-positive shadow-positive/20 shadow-lg"
              : insights?.dominant_sentiment?.sentiment?.toLowerCase() ===
                "negative"
              ? "border-negative shadow-negative/20 shadow-lg"
              : insights?.dominant_sentiment?.sentiment?.toLowerCase() ===
                "neutral"
              ? "border-warning shadow-warning/20 shadow-lg"
              : "border-border"
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Sentiment Analysis
              </CardTitle>
              <Badge
                className={getSentimentColor(
                  insights?.dominant_sentiment?.sentiment || ""
                )}
                variant="secondary"
              >
                {insights?.dominant_sentiment?.sentiment || "N/A"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {insights?.dominant_sentiment?.statement ||
                "No sentiment analysis available"}
            </p>
          </CardContent>
        </Card>
      </div>

      {executiveSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm text-muted-foreground">
            {/* Purpose */}
            <div>
              <h3 className="font-semibold text-foreground">Purpose</h3>
              <p>{executiveSummary.purpose}</p>
            </div>

            {/* Benchmark */}
            <div>
              <h3 className="font-semibold text-foreground">
                AI Visibility Benchmark
              </h3>
              <p>
                {executiveSummary.ai_visibility_benchmark.brand_score_and_tier}
              </p>
              <ul className="list-disc pl-5">
                {executiveSummary.ai_visibility_benchmark.competitor_positioning.map(
                  (c, idx) => (
                    <li key={idx}>
                      <span className="font-medium">{c.competitor_name}</span> —{" "}
                      {c.relative_score} ({c.relative_tier})
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Strengths */}
            <div>
              <h3 className="font-semibold text-foreground">Strengths</h3>
              <ul className="list-disc pl-5">
                {executiveSummary.strengths.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div>
              <h3 className="font-semibold text-foreground">Weaknesses</h3>
              <ul className="list-disc pl-5">
                {executiveSummary.weaknesses.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>

            {/* Competitor Benchmarking */}
            <div>
              <h3 className="font-semibold text-foreground">
                Competitor Benchmarking
              </h3>
              <div>
                <p className="font-medium">Leaders</p>
                <ul className="list-disc pl-5">
                  {executiveSummary.competitor_benchmarking.leaders.map(
                    (l, idx) => (
                      <li key={idx}>
                        {l.name} — {l.score}
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div>
                <p className="font-medium">Mid-Tier</p>
                <ul className="list-disc pl-5">
                  {executiveSummary.competitor_benchmarking.mid_tier.map(
                    (m, idx) => (
                      <li key={idx}>
                        {m.name} — {m.score}
                      </li>
                    )
                  )}
                </ul>
              </div>
              {executiveSummary.competitor_benchmarking.laggards.length > 0 && (
                <div>
                  <p className="font-medium">Laggards</p>
                  <ul className="list-disc pl-5">
                    {executiveSummary.competitor_benchmarking.laggards.map(
                      (lag, idx) => (
                        <li key={idx}>
                          {lag.name} — {lag.score}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions */}
            <div>
              <h3 className="font-semibold text-foreground">
                Prioritized Actions
              </h3>
              <ul className="list-disc pl-5">
                {executiveSummary.prioritized_actions.map((a, idx) => (
                  <li key={idx}>{a}</li>
                ))}
              </ul>
            </div>

            {/* Conclusion */}
            <div className="border-t border-border pt-4">
              <h3 className="font-semibold text-foreground">Conclusion</h3>
              <p>{executiveSummary.conclusion}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
