import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, Globe, FileText, Building2, Eye, ThumbsUp, MessageSquare, TrendingUp, BarChart3, Target, Users } from 'lucide-react';
// Import the data (we'll use props instead)
const mockData = {
  brand_name: "Kommunicate",
  brand_website: "https://www.kommunicate.io/",
  created_at: "2025-09-21T15:00:00+05:30",
  id: "brandintel-kommunicate-20250921-9a1b2c3d-4e5f-6789-abcd-0123456789ab",
  analysis: {
    overall_insights: {
      ai_visibility: { tier: "Low", ai_visibility_score: 15 },
      brand_mentions: { level: "Medium", mentions_count: 6, total_sources_checked: 7 },
      dominant_sentiment: { sentiment: "Neutral", statement: "This model frames Kommunicate as a capable mid-market chat/automation option with practical integration strengths but limited prominence." },
      summary: "From this model's internal outputs, Kommunicate appears as a functional chat/automation vendor with clear integration use-cases (widgets, React, knowledge base). Visibility is modest; the model cites it as an alternative to larger incumbents but not as market-leading."
    },
    source_analysis: [
      { category: "Analyst Platforms", total_citations: 4, visibility: "Low", examples: ["Gartner (example)", "Forrester (example)"] },
      { category: "Review Platforms", total_citations: 5, visibility: "Medium", examples: ["G2", "Capterra"] },
      { category: "Comparison Blogs", total_citations: 3, visibility: "Low", examples: ["Medium comparative posts"] },
      { category: "Communities", total_citations: 6, visibility: "Medium", examples: ["Reddit", "Stack Overflow"] },
      { category: "Brand Pages", total_citations: 7, visibility: "Medium", examples: ["Official Docs", "Product landing pages"] },
      { category: "Publications", total_citations: 2, visibility: "Low", examples: ["TechCrunch (example)"] }
    ],
    competitor_analysis: {
      table_2_brand_profiles: [
        { brand_name: "Intercom", ai_description: "Enterprise-grade customer messaging platform with deep ecosystem integrations.", ai_sentiment: "Positive", sources: ["Wikipedia", "G2"], evidence_snippets: ["Frequently cited as a leader for product messaging and automation."] },
        { brand_name: "Zendesk", ai_description: "Customer service suite focused on tickets, helpdesk, and agent workflows.", ai_sentiment: "Positive", sources: ["Wikipedia", "G2"], evidence_snippets: ["Market-recognized for support workflows and large customer base."] },
        { brand_name: "Drift", ai_description: "Conversational marketing and sales chat focused on lead capture.", ai_sentiment: "Positive", sources: ["G2", "Company Blogs"], evidence_snippets: ["Known for sales-first chat flows and account-based routing."] },
        { brand_name: "Kommunicate", ai_description: "Chat and conversational automation platform offering widget, SDKs, and knowledge-base integration.", ai_sentiment: "Neutral", sources: ["Official Docs", "G2"], evidence_snippets: ["Model describes Kommunicate as integration-focused with developer SDKs."] }
      ]
    },
    content_impact: {
      "Analyst Platforms": { our_brand_position: { visibility: 1 } },
      "Review Platforms": { our_brand_position: { visibility: 5 } },
      "Communities": { our_brand_position: { visibility: 4 } },
      "Brand Pages": { our_brand_position: { visibility: 6 } }
    },
    recommendations: [
      {
        category: "Developer Docs (Owned)",
        action: "Add a step-by-step React Quickstart at /docs/react-quickstart with JSON-LD FAQ and code snippets",
        timeframe: "4 weeks",
        rationale: "Model maps many integration queries to 'how to install' intents; a prominent quickstart increases first-mention likelihood for dev queries.",
        expected_impact: "Increase weighted_mentions_total for integration queries by +2–3 within model outputs; improves GEO_score.",
        effort: "Medium (3 dev days + 1 tech writer day)"
      },
      {
        category: "Knowledge Base (Owned + SEO)",
        action: "Publish structured KB articles for 'Kommunicate vs Intercom' and 'Kommunicate vs Freshchat' with explicit comparison table",
        timeframe: "6 weeks",
        rationale: "Model often answers 'vs' queries using comparison blogs; direct comparison content increases prominence in comparison-intent outputs.",
        expected_impact: "Shift model-ranked comparisons to list Kommunicate in top-3 for 'vs' intents; +3 visibility in comparison mapping.",
        effort: "High (content + SEO + product PM review: ~2 weeks)"
      }
    ]
  }
};

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#84cc16', '#f97316'];

interface BrandDashboardProps {
  analyticsData?: any;
  brandName?: string;
  brandWebsite?: string;
  reportDate?: string;
}

const BrandDashboard: React.FC<BrandDashboardProps> = ({ 
  analyticsData, 
  brandName = mockData.brand_name,
  brandWebsite = mockData.brand_website,
  reportDate = mockData.created_at
}) => {
  const analysisData = analyticsData || mockData;
  
  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get sentiment badge style
  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'neutral':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get tier badge style
  const getTierBadge = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'high':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Prepare source analysis chart data
  const sourceChartData = analysisData.analysis.source_analysis.map((source: any) => ({
    name: source.category.replace(' Platforms', '').replace(' Pages', ''),
    citations: source.total_citations,
    visibility: source.visibility
  }));

  // Prepare content impact pie chart data
  const contentImpactData = Object.entries(analysisData.analysis.content_impact).map(([key, value]: [string, any], index) => ({
    name: key.replace(' Platforms', '').replace(' Pages', ''),
    value: value.our_brand_position?.visibility || 0,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{brandName}</h1>
                <p className="text-indigo-100 mt-1">Brand Intelligence Report</p>
                <div className="flex items-center space-x-4 mt-2 text-sm">
                  <div className="flex items-center space-x-1">
                    <Globe className="w-4 h-4" />
                    <span>{brandWebsite}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>Report Type:</span>
                    <Badge className="bg-indigo-500 text-white border-indigo-400">
                      Brand Intelligence
                    </Badge>
                    <span>Sentiment:</span>
                    <Badge className={getSentimentBadge(analysisData.analysis.overall_insights.dominant_sentiment.sentiment)}>
                      {analysisData.analysis.overall_insights.dominant_sentiment.sentiment}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-indigo-100">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Completed</span>
              </div>
              <p className="text-lg font-semibold">{formatDate(reportDate)}</p>
              <p className="text-xs text-indigo-200 mt-1">
                Analysis ID: {analysisData.id.slice(-20)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Analysis Summary */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="text-xl text-gray-800">Analysis Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gray-600 leading-relaxed">
              {analysisData.analysis.overall_insights.summary}
            </p>
          </CardContent>
        </Card>

        {/* Overall Insights */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Overall Insights</h2>
          <p className="text-gray-600 mb-6">Key performance indicators derived from available data</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* AI Visibility Score */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-700">AI Visibility Score</span>
                  </div>
                  <Badge className={getTierBadge(analysisData.analysis.overall_insights.ai_visibility.tier)}>
                    {analysisData.analysis.overall_insights.ai_visibility.tier}
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {analysisData.analysis.overall_insights.ai_visibility.ai_visibility_score}
                </div>
                <p className="text-sm text-gray-600">
                  Based on market performance. Dominant
                </p>
              </CardContent>
            </Card>

            {/* AI Sentiment */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <ThumbsUp className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium text-gray-700">Sentiment Score</span>
                  </div>
                  <Badge className={getSentimentBadge(analysisData.analysis.overall_insights.dominant_sentiment.sentiment)}>
                    {analysisData.analysis.overall_insights.dominant_sentiment.sentiment}
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  {analysisData.analysis.overall_insights.dominant_sentiment.sentiment}
                </div>
                <p className="text-sm text-gray-600">
                  Based on privacy sentiment analysis
                </p>
              </CardContent>
            </Card>

            {/* Total Brand Mentions */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-700">Total Brand Mentions</span>
                  </div>
                  <Badge className={getTierBadge(analysisData.analysis.overall_insights.brand_mentions.level)}>
                    {analysisData.analysis.overall_insights.brand_mentions.level}
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {analysisData.analysis.overall_insights.brand_mentions.mentions_count}
                </div>
                <p className="text-sm text-gray-600">
                  Total mentions across sources: {analysisData.analysis.overall_insights.brand_mentions.total_sources_checked}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Sentiment Details */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
            <CardTitle className="text-xl text-gray-800">AI Sentiment Analysis</CardTitle>
            <p className="text-gray-600 text-sm">Detailed sentiment breakdown and insights</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">
                {analysisData.analysis.overall_insights.dominant_sentiment.statement}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Source Analysis */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Source Analysis</h2>
          <p className="text-gray-600 mb-6">Source Intelligence Data - Citation frequency across all results</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Source Citation Frequency Chart */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Source Citation Frequency</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sourceChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="citations" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Detailed Source Metrics Table */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Detailed Source Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 text-sm font-semibold text-gray-700">Source</th>
                        <th className="text-left py-3 text-sm font-semibold text-gray-700">Example Websites</th>
                        <th className="text-center py-3 text-sm font-semibold text-gray-700">Citations</th>
                        <th className="text-center py-3 text-sm font-semibold text-gray-700">Visibility Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisData.analysis.source_analysis.map((source: any, index: number) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3">
                            <div className="font-medium text-gray-800">{source.category}</div>
                          </td>
                          <td className="py-3">
                            <div className="text-sm text-gray-600">
                              {source.examples?.slice(0, 2).join(', ')}
                              {source.examples?.length > 2 && <span className="text-gray-400"> +{source.examples.length - 2} more</span>}
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <span className="font-semibold text-gray-800">{source.total_citations}</span>
                          </td>
                          <td className="py-3 text-center">
                            <Badge className={getTierBadge(source.visibility)}>
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
        </div>

        {/* Competitor Analysis */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Competitor Analysis</h2>
          <p className="text-gray-600 mb-6">Competitive positioning across key dimensions</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Comprehensive Competitor Analysis Table */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Comprehensive Competitor Analysis</CardTitle>
                <p className="text-sm text-gray-600">Brand positioning across key competitive dimensions</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 text-sm font-semibold text-gray-700">Brand</th>
                        <th className="text-center py-3 text-sm font-semibold text-gray-700">Innovation</th>
                        <th className="text-center py-3 text-sm font-semibold text-gray-700">Pricing</th>
                        <th className="text-center py-3 text-sm font-semibold text-gray-700">Technology</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisData.analysis.competitor_analysis.table_2_brand_profiles.map((brand: any, index: number) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3">
                            <div className="font-medium text-gray-800">{brand.brand_name}</div>
                          </td>
                          <td className="py-3 text-center">
                            {brand.brand_name === 'Intercom' ? (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">#1</Badge>
                            ) : brand.brand_name === 'Drift' ? (
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200">#2</Badge>
                            ) : brand.brand_name === 'Ada' ? (
                              <Badge className="bg-purple-100 text-purple-800 border-purple-200">#3</Badge>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                          <td className="py-3 text-center">
                            {brand.brand_name === 'Tidio' ? (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">#1</Badge>
                            ) : brand.brand_name === 'Kommunicate' ? (
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200">#5</Badge>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                          <td className="py-3 text-center">
                            {brand.brand_name === 'Intercom' ? (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">#1</Badge>
                            ) : brand.brand_name === 'Kommunicate' ? (
                              <Badge className="bg-purple-100 text-purple-800 border-purple-200">#3</Badge>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Competitor Profiles */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Competitor Profiles</CardTitle>
                <p className="text-sm text-gray-600">AI-generated brand descriptions and sentiment analysis</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisData.analysis.competitor_analysis.table_2_brand_profiles.slice(0, 4).map((brand: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                        index === 0 ? 'bg-purple-500' : 
                        index === 1 ? 'bg-teal-500' :
                        index === 2 ? 'bg-pink-500' :
                        index === 3 ? 'bg-blue-500' : 'bg-orange-500'
                      }`}>
                        {brand.brand_name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-800">{brand.brand_name}</h4>
                          <Badge className={getSentimentBadge(brand.ai_sentiment)}>
                            {brand.ai_sentiment}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{brand.ai_description}</p>
                        <div className="text-xs text-gray-500">
                          <strong>Sources:</strong> {brand.sources.join(', ')}
                        </div>
                        {brand.evidence_snippets && brand.evidence_snippets.length > 0 && (
                          <div className="text-xs text-gray-600 mt-1 italic">
                            <strong>Key Evidence:</strong> {brand.evidence_snippets[0]}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Content Impact */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Content Impact</h2>
          <p className="text-gray-600 mb-6">How much visibility comes from each content type</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Content Impact Distribution */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Content Impact Distribution</CardTitle>
                <p className="text-sm text-gray-600">Kommunicate visibility across different content types</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={contentImpactData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {contentImpactData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[
                    { name: 'Analyst Platforms', color: '#6366f1' },
                    { name: 'Brand Pages', color: '#8b5cf6' },
                    { name: 'Communities', color: '#f59e0b' },
                    { name: 'Review Platforms', color: '#10b981' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs text-gray-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content Impact Analysis Table */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Content Impact Analysis</CardTitle>
                <p className="text-sm text-gray-600">Brand visibility across different content categories</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 text-sm font-semibold text-gray-700">Content Category</th>
                        <th className="text-center py-3 text-sm font-semibold text-gray-700">Our Position</th>
                        <th className="text-center py-3 text-sm font-semibold text-gray-700">Our Visibility Score</th>
                        <th className="text-center py-3 text-sm font-semibold text-gray-700">Top Performer</th>
                        <th className="text-center py-3 text-sm font-semibold text-gray-700">Top Score</th>
                        <th className="text-center py-3 text-sm font-semibold text-gray-700">Gap</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 font-medium text-gray-800">Analyst Platforms</td>
                        <td className="py-3 text-center">
                          <Badge className="bg-red-100 text-red-800 border-red-200">#7</Badge>
                        </td>
                        <td className="py-3 text-center font-semibold">1</td>
                        <td className="py-3 text-center">Intercom</td>
                        <td className="py-3 text-center font-semibold">12</td>
                        <td className="py-3 text-center">
                          <Badge className="bg-red-100 text-red-800 border-red-200">-11</Badge>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 font-medium text-gray-800">Review Platforms</td>
                        <td className="py-3 text-center">
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">#3</Badge>
                        </td>
                        <td className="py-3 text-center font-semibold">5</td>
                        <td className="py-3 text-center">Intercom</td>
                        <td className="py-3 text-center font-semibold">14</td>
                        <td className="py-3 text-center">
                          <Badge className="bg-red-100 text-red-800 border-red-200">-9</Badge>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 font-medium text-gray-800">Communities</td>
                        <td className="py-3 text-center">
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">#3</Badge>
                        </td>
                        <td className="py-3 text-center font-semibold">4</td>
                        <td className="py-3 text-center">Intercom</td>
                        <td className="py-3 text-center font-semibold">11</td>
                        <td className="py-3 text-center">
                          <Badge className="bg-red-100 text-red-800 border-red-200">-7</Badge>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 font-medium text-gray-800">Brand Pages</td>
                        <td className="py-3 text-center">
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">#3</Badge>
                        </td>
                        <td className="py-3 text-center font-semibold">6</td>
                        <td className="py-3 text-center">Zendesk</td>
                        <td className="py-3 text-center font-semibold">13</td>
                        <td className="py-3 text-center">
                          <Badge className="bg-red-100 text-red-800 border-red-200">-7</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Strategic Recommendations */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Strategic Recommendations</h2>
          <p className="text-gray-600 mb-6">Actionable insights to improve AI platform visibility and performance</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analysisData.analysis.recommendations.map((rec: any, index: number) => (
              <Card key={index} className={`border-l-4 shadow-lg ${
                rec.category.includes('High') ? 'border-l-red-500' :
                rec.category.includes('Medium') || rec.effort === 'Medium (3 dev days + 1 tech writer day)' ? 'border-l-amber-500' :
                'border-l-emerald-500'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-red-500' :
                        index === 2 ? 'bg-amber-500' :
                        index === 3 ? 'bg-purple-500' :
                        'bg-emerald-500'
                      }`}>
                        {index === 0 ? '📚' : index === 1 ? '🔍' : index === 2 ? '⭐' : index === 3 ? '👥' : '📄'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{rec.category.replace(/\s*\([^)]*\)/, '')}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={
                            rec.effort.includes('High') ? 'bg-red-100 text-red-800' :
                            rec.effort.includes('Medium') ? 'bg-amber-100 text-amber-800' :
                            'bg-emerald-100 text-emerald-800'
                          }>
                            {rec.effort.includes('High') ? 'High' : rec.effort.includes('Medium') ? 'Medium' : 'Low'}
                          </Badge>
                          <span className="text-xs text-gray-500">{rec.timeframe}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">ACTION</h4>
                      <p className="text-sm text-gray-600">{rec.action}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">RATIONALE</h4>
                      <p className="text-sm text-gray-600">{rec.rationale}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1 flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>EXPECTED IMPACT</span>
                      </h4>
                      <p className="text-sm text-emerald-600 font-medium">{rec.expected_impact}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandDashboard;