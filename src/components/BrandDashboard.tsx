import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, Globe, FileText, Building2, Eye, ThumbsUp, MessageSquare, TrendingUp, BarChart3, Target, Users, Heart } from 'lucide-react';
import { format } from 'date-fns';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--accent))', 'hsl(var(--secondary))', 'hsl(var(--muted))', 'hsl(var(--border))'];

interface BrandDashboardProps {
  analyticsData?: any;
  brandName?: string;
  brandWebsite?: string;
  reportDate?: string;
}

export default function BrandDashboard({ analyticsData, brandName, brandWebsite, reportDate }: BrandDashboardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'PPP');
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility?.toLowerCase()) {
      case 'high': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'medium': return 'text-warning bg-warning/10 border-warning/20';
      case 'low': return 'text-success bg-success/10 border-success/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'text-success bg-success/10 border-success/20';
      case 'negative': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'neutral': return 'text-warning bg-warning/10 border-warning/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort?.toLowerCase()) {
      case 'high': return 'border-destructive';
      case 'medium': return 'border-warning';
      case 'low': return 'border-success';
      default: return 'border-border';
    }
  };

  // Prepare source analysis chart data
  const sourceChartData = (analyticsData?.source_analysis || []).map((source: any) => ({
    name: source.category.replace(' Platforms', '').replace(' Pages', ''),
    citations: source.total_citations?.Value || source.total_citations || 0,
    visibility: source.visibility
  }));

  // Prepare content impact pie chart data
  const contentImpactData = Object.entries(analyticsData?.content_impact || {}).map(([key, value]: [string, any], index) => ({
    name: key.replace(' Platforms', '').replace(' Pages', ''),
    value: value.our_brand_position?.visibility?.Value || value.our_brand_position?.visibility || 0,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground gradient-text">AI Visibility Report</h1>
              <p className="text-muted-foreground mt-2">Brand Intelligence Analysis for {brandName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Report Generated</p>
              <p className="font-semibold text-foreground">{formatDate(reportDate)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Overall Insights */}
        <Card className="card-gradient border-border shadow-elevated">
          <CardHeader className="bg-gradient-primary text-primary-foreground">
            <CardTitle className="text-2xl">Overall Insights</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Key performance metrics and brand visibility overview
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* AI Visibility Score */}
              <div className="bg-card/50 p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">AI Visibility</span>
                  </div>
                  <Badge className={getVisibilityColor(analyticsData?.overall_insights?.ai_visibility?.tier || 'Low')}>
                    {analyticsData?.overall_insights?.ai_visibility?.tier || 'Low'}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-primary mb-1">
                  {analyticsData?.overall_insights?.ai_visibility?.ai_visibility_score?.Value || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  Score: {analyticsData?.overall_insights?.ai_visibility?.ai_visibility_score?.Value || 0}
                </p>
              </div>

              {/* Geo Score */}
              <div className="bg-card/50 p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-success" />
                    <span className="font-medium text-foreground">Geo Score</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-success mb-1">
                  {analyticsData?.overall_insights?.ai_visibility?.geo_score?.Value || 0}
                </div>
                <p className="text-sm text-muted-foreground">Geographic reach</p>
              </div>

              {/* Brand Mentions */}
              <div className="bg-card/50 p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-accent" />
                    <span className="font-medium text-foreground">Brand Mentions</span>
                  </div>
                  <Badge className={getVisibilityColor(analyticsData?.overall_insights?.brand_mentions?.level || 'Low')}>
                    {analyticsData?.overall_insights?.brand_mentions?.level || 'Low'}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-accent mb-1">
                  {analyticsData?.overall_insights?.brand_mentions?.mentions_count?.Value || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  Of {analyticsData?.overall_insights?.brand_mentions?.total_sources_checked?.Value || 0} sources
                </p>
              </div>

              {/* Query Count */}
              <div className="bg-card/50 p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-warning" />
                    <span className="font-medium text-foreground">Queries</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-warning mb-1">
                  {analyticsData?.overall_insights?.ai_visibility?.distinct_queries_count?.Value || 0}
                </div>
                <p className="text-sm text-muted-foreground">Distinct queries</p>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">Executive Summary</h3>
              <p className="text-muted-foreground">
                {analyticsData?.overall_insights?.summary || 'Analysis summary not available'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* AI Sentiment - Moved above Source Analysis */}
        <Card className="card-gradient border-border shadow-elevated">
          <CardHeader className="bg-gradient-to-r from-success to-success/80 text-success-foreground">
            <CardTitle className="text-xl flex items-center">
              <Heart className="mr-2 h-5 w-5" />
              AI Sentiment Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl font-bold text-foreground">
                  {analyticsData?.overall_insights?.dominant_sentiment?.sentiment || 'Neutral'}
                </div>
                <Badge className={getSentimentColor(analyticsData?.overall_insights?.dominant_sentiment?.sentiment || 'Neutral')}>
                  {analyticsData?.overall_insights?.dominant_sentiment?.sentiment || 'Neutral'}
                </Badge>
              </div>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg border border-border">
              <p className="text-foreground">
                {analyticsData?.overall_insights?.dominant_sentiment?.statement || 'Sentiment analysis not available'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Source Analysis */}
        <Card className="card-gradient border-border shadow-elevated">
          <CardHeader className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
            <CardTitle className="text-xl flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Source Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Source Citation Chart */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Citation Frequency</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sourceChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                      fill="hsl(var(--muted-foreground))"
                    />
                    <YAxis fill="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <Bar dataKey="citations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Source Analysis Table */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Detailed Metrics</h3>
                <div className="overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 text-sm font-semibold text-foreground">Source</th>
                        <th className="text-center py-3 text-sm font-semibold text-foreground">Citations</th>
                        <th className="text-center py-3 text-sm font-semibold text-foreground">Visibility</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(analyticsData?.source_analysis || []).map((source: any, index: number) => (
                        <tr key={index} className="border-b border-border/50">
                          <td className="py-3">
                            <div className="font-medium text-foreground">{source.category}</div>
                            <div className="text-sm text-muted-foreground">
                              {source.sources?.slice(0, 2).join(', ')}
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <span className="font-semibold text-foreground">{source.total_citations?.Value || 0}</span>
                          </td>
                          <td className="py-3 text-center">
                            <Badge className={getVisibilityColor(source.visibility)}>
                              {source.visibility}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competitor Analysis */}
        <Card className="card-gradient border-border shadow-elevated">
          <CardHeader className="bg-gradient-to-r from-accent to-accent-foreground text-primary-foreground">
            <CardTitle className="text-xl flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Competitor Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Competitor Table */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Brand Positioning</h3>
                <div className="overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 text-sm font-semibold text-foreground">Dimension</th>
                        <th className="text-center py-3 text-sm font-semibold text-foreground">Our Position</th>
                        <th className="text-center py-3 text-sm font-semibold text-foreground">Visibility</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(analyticsData?.competitor_analysis?.table_1_by_dimension || []).map((item: any, index: number) => (
                        <tr key={index} className="border-b border-border/50">
                          <td className="py-3">
                            <div className="font-medium text-foreground">{item.dimension}</div>
                          </td>
                          <td className="py-3 text-center">
                            <Badge className={
                              item.our_brand_position?.Value <= 2 ? 'bg-success/10 text-success border-success/20' :
                              item.our_brand_position?.Value <= 4 ? 'bg-warning/10 text-warning border-warning/20' :
                              'bg-destructive/10 text-destructive border-destructive/20'
                            }>
                              #{item.our_brand_position?.Value || 'N/A'}
                            </Badge>
                          </td>
                          <td className="py-3 text-center">
                            <span className="font-semibold text-foreground">{item.our_brand_visibility_count?.Value || 0}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Competitor Profiles */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Competitor Profiles</h3>
                <div className="space-y-4">
                  {(analyticsData?.competitor_analysis?.table_2_brand_profiles || []).slice(0, 4).map((brand: any, index: number) => (
                    <div key={index} className="p-4 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-foreground">{brand.brand_name}</h4>
                        <Badge className={getSentimentColor(brand.ai_sentiment)}>
                          {brand.ai_sentiment}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{brand.ai_description}</p>
                      <div className="text-xs text-muted-foreground">
                        <strong>Sources:</strong> {brand.sources?.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Impact */}
        <Card className="card-gradient border-border shadow-elevated">
          <CardHeader className="bg-gradient-to-r from-secondary to-primary text-primary-foreground">
            <CardTitle className="text-xl flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Content Impact Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Content Impact Chart */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Visibility Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={contentImpactData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {contentImpactData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Content Impact Table */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Performance Breakdown</h3>
                <div className="overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 text-sm font-semibold text-foreground">Content Type</th>
                        <th className="text-center py-3 text-sm font-semibold text-foreground">Position</th>
                        <th className="text-center py-3 text-sm font-semibold text-foreground">Visibility</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(analyticsData?.content_impact || {}).map(([key, value]: [string, any], index) => (
                        <tr key={index} className="border-b border-border/50">
                          <td className="py-3">
                            <div className="font-medium text-foreground">{key}</div>
                          </td>
                          <td className="py-3 text-center">
                            <Badge className={
                              value.our_brand_position?.position?.Value <= 2 ? 'bg-success/10 text-success border-success/20' :
                              value.our_brand_position?.position?.Value <= 4 ? 'bg-warning/10 text-warning border-warning/20' :
                              'bg-destructive/10 text-destructive border-destructive/20'
                            }>
                              #{value.our_brand_position?.position?.Value || 'N/A'}
                            </Badge>
                          </td>
                          <td className="py-3 text-center">
                            <span className="font-semibold text-foreground">{value.our_brand_position?.visibility?.Value || 0}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategic Recommendations */}
        <Card className="card-gradient border-border shadow-elevated">
          <CardHeader className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
            <CardTitle className="text-xl flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Strategic Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(analyticsData?.recommendations || []).map((rec: any, index: number) => (
                <Card key={index} className={`border-l-4 shadow-card ${getEffortColor(rec.effort)}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{rec.category}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={
                              rec.effort?.toLowerCase().includes('high') ? 'bg-destructive/10 text-destructive border-destructive/20' :
                              rec.effort?.toLowerCase().includes('medium') ? 'bg-warning/10 text-warning border-warning/20' :
                              'bg-success/10 text-success border-success/20'
                            }>
                              {rec.effort?.toLowerCase().includes('high') ? 'High' : 
                               rec.effort?.toLowerCase().includes('medium') ? 'Medium' : 'Low'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{rec.timeframe}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-1">ACTION</h4>
                        <p className="text-sm text-muted-foreground">{rec.action}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-1">RATIONALE</h4>
                        <p className="text-sm text-muted-foreground">{rec.rationale}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>EXPECTED IMPACT</span>
                        </h4>
                        <p className="text-sm text-success font-medium">{rec.expected_impact}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}