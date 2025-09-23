import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { Brain, TrendingUp, MessageSquare, Star, Target, Users, BarChart3, Eye } from 'lucide-react';
import brandData from '@/data/data.json';

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
  'hsl(var(--chart-7))',
  'hsl(var(--chart-8))'
];

const TIER_COLORS = {
  'Low': 'hsl(var(--warning))',
  'Medium': 'hsl(var(--secondary))', 
  'High': 'hsl(var(--success))'
};

const SENTIMENT_COLORS = {
  'Positive': 'hsl(var(--success))',
  'Neutral': 'hsl(var(--muted-foreground))',
  'Negative': 'hsl(var(--destructive))'
};

const BrandDashboard = () => {
  const { analysis } = brandData;

  // Prepare chart data
  const sourceAnalysisData = analysis.source_analysis.map(source => ({
    category: source.category,
    citations: source.total_citations,
    visibility: source.visibility
  }));

  const competitorData = analysis.competitor_analysis.table_1_by_dimension.map(dim => ({
    dimension: dim.dimension,
    ourPosition: dim.our_brand_position,
    ourVisibility: dim.our_brand_visibility_count,
    topCompetitor: dim.top_5_competitors[0]?.brand || 'N/A',
    topVisibility: dim.top_5_competitors[0]?.visibility_count || 0
  }));

  const aiVisibilityBreakdown = analysis.overall_insights.ai_visibility.calculation_breakdown;

  const contentImpactData = Object.entries(analysis.content_impact).map(([platform, data]) => ({
    platform,
    ourPosition: data.our_brand_position.position,
    ourVisibility: data.our_brand_position.visibility,
    leader: data.top_3_brands[0]?.brand || 'N/A',
    leaderVisibility: data.top_3_brands[0]?.visibility || 0
  }));

  // Sentiment distribution for pie chart
  const sentimentData = [
    { name: 'Positive', value: 40, color: SENTIMENT_COLORS.Positive },
    { name: 'Neutral', value: 45, color: SENTIMENT_COLORS.Neutral },
    { name: 'Negative', value: 15, color: SENTIMENT_COLORS.Negative }
  ];

  // Source visibility trend data for line chart
  const sourceTrendData = analysis.source_analysis.map((source, index) => ({
    category: source.category.substring(0, 8),
    citations: source.total_citations,
    visibility: source.visibility === 'High' ? 3 : source.visibility === 'Medium' ? 2 : 1,
    color: CHART_COLORS[index % CHART_COLORS.length]
  }));

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold gradient-text">Brand Intelligence Dashboard</h1>
        </div>
        <div className="flex items-center justify-center gap-4 text-muted-foreground">
          <Badge variant="outline" className="text-sm">
            {brandData.brand_name}
          </Badge>
          <span>•</span>
          <span>{brandData.model_reported.report_generated_at.split('T')[0]}</span>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="metric-card bg-gradient-to-br from-primary/10 to-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Visibility Score</CardTitle>
            <Eye className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{analysis.overall_insights.ai_visibility.ai_visibility_score}</div>
            <Badge className={`tier-${analysis.overall_insights.ai_visibility.tier.toLowerCase()} mt-2`}>
              {analysis.overall_insights.ai_visibility.tier}
            </Badge>
          </CardContent>
        </Card>

        <Card className="metric-card bg-gradient-to-br from-secondary/10 to-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GEO Score</CardTitle>
            <TrendingUp className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">{analysis.overall_insights.ai_visibility.geo_score}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analysis.overall_insights.ai_visibility.weighted_mentions_total} × {analysis.overall_insights.ai_visibility.distinct_queries_count}
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card bg-gradient-to-br from-accent/10 to-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brand Mentions</CardTitle>
            <MessageSquare className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{analysis.overall_insights.brand_mentions.mentions_count}</div>
            <Badge className={`tier-${analysis.overall_insights.brand_mentions.level.toLowerCase()} mt-2`}>
              {analysis.overall_insights.brand_mentions.level}
            </Badge>
          </CardContent>
        </Card>

        <Card className="metric-card bg-gradient-to-br from-success/10 to-success/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sentiment</CardTitle>
            <Star className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <Badge className={`sentiment-${analysis.overall_insights.dominant_sentiment.sentiment.toLowerCase()}`}>
              {analysis.overall_insights.dominant_sentiment.sentiment}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              {analysis.overall_insights.dominant_sentiment.statement}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="impact">Content Impact</TabsTrigger>
          <TabsTrigger value="recommendations">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* First Row - AI Visibility & Sentiment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Visibility Breakdown */}
            <Card className="chart-container">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Brain className="h-5 w-5" />
                  AI Visibility Breakdown
                </CardTitle>
                <CardDescription>Weighted points by query performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={aiVisibilityBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="query" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                      fontSize={10}
                    />
                    <YAxis />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-card border rounded-lg p-3 shadow-lg">
                              <p className="font-medium text-sm">{label}</p>
                              <p className="text-primary">Points: {payload[0].value}</p>
                              <p className="text-xs text-muted-foreground">{payload[0].payload.explanation}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="weighted_points_for_brand" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sentiment Distribution Pie Chart */}
            <Card className="chart-container">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-secondary">
                  <Star className="h-5 w-5" />
                  Sentiment Distribution
                </CardTitle>
                <CardDescription>Overall brand sentiment breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Second Row - Source Trends & Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Source Visibility Trends */}
            <Card className="chart-container">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent">
                  <BarChart3 className="h-5 w-5" />
                  Source Visibility Trends
                </CardTitle>
                <CardDescription>Citations across different source types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={sourceTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="citations" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="visibility" 
                      stroke="hsl(var(--secondary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--secondary))', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Executive Summary */}
            <Card className="bg-gradient-to-br from-muted/30 to-background">
              <CardHeader>
                <CardTitle className="text-success">Executive Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {analysis.overall_insights.summary}
                </p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Query Coverage</span>
                      <span className="text-sm text-primary font-semibold">
                        {analysis.overall_insights.ai_visibility.distinct_queries_count}/6 queries
                      </span>
                    </div>
                    <Progress 
                      value={(analysis.overall_insights.ai_visibility.distinct_queries_count / 6) * 100} 
                      className="h-3"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Source Coverage</span>
                      <span className="text-sm text-secondary font-semibold">
                        {analysis.overall_insights.brand_mentions.mentions_count}/{analysis.overall_insights.brand_mentions.total_sources_checked} sources
                      </span>
                    </div>
                    <Progress 
                      value={(analysis.overall_insights.brand_mentions.mentions_count / analysis.overall_insights.brand_mentions.total_sources_checked) * 100} 
                      className="h-3"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Source Analysis Chart */}
            <Card className="chart-container">
              <CardHeader>
                <CardTitle>Source Category Performance</CardTitle>
                <CardDescription>Citations and visibility across platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={sourceAnalysisData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" />
                    <YAxis dataKey="category" type="category" width={120} fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="citations" 
                      fill="hsl(var(--primary))" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Source Details Table */}
            <Card>
              <CardHeader>
                <CardTitle>Source Analysis Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="data-table">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Citations</th>
                        <th>Visibility</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.source_analysis.map((source, index) => (
                        <tr key={index}>
                          <td className="font-medium">{source.category}</td>
                          <td>{source.total_citations}</td>
                          <td>
                            <Badge className={`tier-${source.visibility.toLowerCase()}`}>
                              {source.visibility}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Competitive Positioning Radar */}
            <Card className="chart-container">
              <CardHeader>
                <CardTitle>Competitive Positioning</CardTitle>
                <CardDescription>Performance across key dimensions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={competitorData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="dimension" fontSize={10} />
                    <PolarRadiusAxis domain={[0, 10]} tick={false} />
                    <Radar
                      name="Our Position"
                      dataKey="ourPosition"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Brand Profiles */}
            <Card>
              <CardHeader>
                <CardTitle>Competitor Profiles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.competitor_analysis.table_2_brand_profiles.map((brand, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{brand.brand_name}</h4>
                      <Badge className={`sentiment-${brand.ai_sentiment.toLowerCase()}`}>
                        {brand.ai_sentiment}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{brand.ai_description}</p>
                    <div className="flex flex-wrap gap-1">
                      {brand.sources.map((source, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="impact" className="space-y-6">
          <Card className="chart-container">
            <CardHeader>
              <CardTitle>Content Impact Analysis</CardTitle>
              <CardDescription>Brand positioning across content platforms</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={contentImpactData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="platform" />
                    <YAxis />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-card border rounded-lg p-4 shadow-lg">
                              <p className="font-medium text-primary">{label}</p>
                              <p className="text-warning">Our Position: #{payload[0].value}</p>
                              <p className="text-secondary">Our Visibility: {payload[1].value}</p>
                              <p className="text-xs text-muted-foreground">Leader: {payload[0].payload.leader} ({payload[0].payload.leaderVisibility})</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="ourPosition" 
                      fill="hsl(var(--warning))" 
                      name="Our Position" 
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      dataKey="ourVisibility" 
                      fill="hsl(var(--primary))" 
                      name="Our Visibility" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid gap-6">
            <h3 className="text-2xl font-bold">Strategic Recommendations</h3>
            {analysis.recommendations.map((rec, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{rec.category}</CardTitle>
                      <CardDescription className="mt-1">{rec.timeframe} • {rec.effort}</CardDescription>
                    </div>
                    <Badge variant="outline">{rec.timeframe}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{rec.action}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <h5 className="font-medium text-sm mb-2">Rationale</h5>
                      <p className="text-xs text-muted-foreground">{rec.rationale}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm mb-2">Expected Impact</h5>
                      <p className="text-xs text-muted-foreground">{rec.expected_impact}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BrandDashboard;