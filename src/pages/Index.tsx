import { BrandHeader } from "@/components/BrandHeader";
import { OverallInsights } from "@/components/OverallInsights";
import { SourceAnalysis } from "@/components/SourceAnalysis";
import { CompetitorAnalysis } from "@/components/CompetitorAnalysis";
import { ContentImpact } from "@/components/ContentImpact";
import { Recommendations } from "@/components/Recommendations";
import { QueryAnalysis } from "@/components/QueryAnalysis";
import analysisData from "@/data/analysis.json";

const Index = () => {
  // Brand Intelligence Dashboard
  const data = analysisData.analytics[0];
  const analysis = data.analytics.analysis;
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <BrandHeader 
          brandName={data.analytics.brand_name}
          brandWebsite={data.analytics.brand_website}
          keywordsAnalyzed={analysis.analysis_scope?.search_keywords || []}
          status={data.status}
          date={data.date}
          modelName={data.analytics.model_name}
        />
        
        <OverallInsights insights={analysis.overall_insights} executiveSummary={analysis.executive_summary} />
        
        <SourceAnalysis 
          contentImpact={analysis.content_impact}
          brandName={data.analytics.brand_name}
        />

        {(analysis.competitor_analysis.competitor_visibility_table || analysis.competitor_analysis.competitor_sentiment_table) && (
          <CompetitorAnalysis analysis={analysis.competitor_analysis} />
        )}
        
        {analysis.content_impact && analysis.content_impact.rows && analysis.content_impact.rows.length > 0 && (
          <ContentImpact contentImpact={analysis.content_impact} />
        )}

        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <Recommendations recommendations={analysis.recommendations} />
        )}
      </div>
    </div>
  );
};

export default Index;
