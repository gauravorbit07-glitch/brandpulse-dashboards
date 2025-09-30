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
          keywordsAnalyzed={analysis.overall_insights.ai_visibility.distinct_queries_count.Value}
          status={data.status}
          date={data.date}
        />
        
        <OverallInsights insights={analysis.overall_insights} />
        
        <SourceAnalysis sources={analysis.source_analysis} />
        
        {analysis.content_impact && Object.keys(analysis.content_impact).length > 0 && (
          <ContentImpact contentImpact={analysis.content_impact} />
        )}

        {(analysis.competitor_analysis.competitor_visibility_table || analysis.competitor_analysis.competitor_sentiment_table) && (
          <CompetitorAnalysis analysis={analysis.competitor_analysis} />
        )}

        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <Recommendations recommendations={analysis.recommendations} />
        )}

        {data.analytics.raw_model_outputs_mapped && data.analytics.raw_model_outputs_mapped.length > 0 && (
          <QueryAnalysis rawOutputs={data.analytics.raw_model_outputs_mapped} />
        )}
      </div>
    </div>
  );
};

export default Index;
