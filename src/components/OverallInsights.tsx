import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Eye, MessageSquare } from "lucide-react";

interface OverallInsightsProps {
  insights: {
    ai_visibility: {
      tier: string;
      ai_visibility_score: { Value: number };
      weighted_mentions_total: { Value: number };
      distinct_queries_count: { Value: number };
    };
    brand_mentions: {
      level: string;
      mentions_count: { Value: number };
      total_sources_checked: { Value: number };
    };
    dominant_sentiment: {
      sentiment: string;
      statement: string;
    };
    summary: string;
  };
}

const getTierColor = (tier: string) => {
  switch (tier.toLowerCase()) {
    case 'high':
      return 'bg-positive text-positive-foreground';
    case 'medium':
      return 'bg-warning text-warning-foreground';
    case 'low':
      return 'bg-negative text-negative-foreground';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
};

const getSentimentColor = (sentiment: string) => {
  switch (sentiment.toLowerCase()) {
    case 'positive':
      return 'bg-positive text-positive-foreground';
    case 'negative':
      return 'bg-negative text-negative-foreground';
    case 'neutral':
      return 'bg-warning text-warning-foreground';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
};

export const OverallInsights = ({ insights }: OverallInsightsProps) => {
  const visibilityScore = insights.ai_visibility.ai_visibility_score.Value;
  const queriesWithMentions = insights.brand_mentions.mentions_count.Value;
  const totalQueries = insights.brand_mentions.total_sources_checked.Value;
  const mentionsPercentage = totalQueries > 0 ? (queriesWithMentions / totalQueries) * 100 : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Overall Insights</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={`border-2 ${
          insights.ai_visibility.tier.toLowerCase() === 'high' ? 'border-positive shadow-positive/20 shadow-lg' :
          insights.ai_visibility.tier.toLowerCase() === 'medium' ? 'border-warning shadow-warning/20 shadow-lg' :
          insights.ai_visibility.tier.toLowerCase() === 'low' ? 'border-negative shadow-negative/20 shadow-lg' :
          'border-border'
        }`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                AI Visibility
              </CardTitle>
              <Badge className={getTierColor(insights.ai_visibility.tier)} variant="secondary">
                {insights.ai_visibility.tier}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Visibility Score</span>
                <span className="font-semibold">{visibilityScore}</span>
              </div>
              <Progress value={Math.min((visibilityScore / 300) * 100, 100)} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 text-center">
              <div>
                <div className="text-xl font-bold text-primary">{insights.ai_visibility.weighted_mentions_total.Value}</div>
                <div className="text-xs text-muted-foreground">Total Mentions</div>
              </div>
              <div>
                <div className="text-xl font-bold text-primary">{insights.ai_visibility.distinct_queries_count.Value}</div>
                <div className="text-xs text-muted-foreground">Query Types</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-2 ${
          insights.brand_mentions.level.toLowerCase() === 'high' ? 'border-positive shadow-positive/20 shadow-lg' :
          insights.brand_mentions.level.toLowerCase() === 'medium' ? 'border-warning shadow-warning/20 shadow-lg' :
          insights.brand_mentions.level.toLowerCase() === 'low' ? 'border-negative shadow-negative/20 shadow-lg' :
          'border-border'
        }`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Brand Mentions
              </CardTitle>
              <Badge className={getTierColor(insights.brand_mentions.level)} variant="secondary">
                {insights.brand_mentions.level}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Mention Coverage</span>
                <span className="font-semibold">{mentionsPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={mentionsPercentage} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 text-center">
              <div>
                <div className="text-xl font-bold text-primary">{queriesWithMentions}</div>
                <div className="text-xs text-muted-foreground">Queries with Mentions</div>
              </div>
              <div>
                <div className="text-xl font-bold text-muted-foreground">{totalQueries}</div>
                <div className="text-xs text-muted-foreground">Total Queries</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-2 ${
          insights.dominant_sentiment.sentiment.toLowerCase() === 'positive' ? 'border-positive shadow-positive/20 shadow-lg' :
          insights.dominant_sentiment.sentiment.toLowerCase() === 'negative' ? 'border-negative shadow-negative/20 shadow-lg' :
          insights.dominant_sentiment.sentiment.toLowerCase() === 'neutral' ? 'border-warning shadow-warning/20 shadow-lg' :
          'border-border'
        }`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Sentiment Analysis
              </CardTitle>
              <Badge className={getSentimentColor(insights.dominant_sentiment.sentiment)} variant="secondary">
                {insights.dominant_sentiment.sentiment}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {insights.dominant_sentiment.statement}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{insights.summary}</p>
        </CardContent>
      </Card>
    </div>
  );
};