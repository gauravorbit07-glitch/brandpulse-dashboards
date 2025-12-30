import { createRoot } from "react-dom/client";
import {
  getBrandName,
  getBrandWebsite,
  getBrandInfoWithLogos,
  getAnalytics,
  getExecutiveSummary,
  getRecommendations,
  getSearchKeywordsWithPrompts,
  getLlmData,
  getAIVisibilityMetrics,
  getMentionsPosition,
} from '@/results/data/analyticsData';

// Type definitions for print data
interface SourceMention {
  count: number;
  score: number;
  insight: string;
}

interface SourceData {
  mentions: Record<string, SourceMention>;
  pages_used: string[];
}

interface LlmDataItem {
  mentions_count: number;
  prompts: number;
  average_rank: number;
  sources: number;
}

interface PrintableContentProps {
  brandName: string;
  brandWebsite: string;
  brandInfo: Array<{
    brand: string;
    geo_score: number;
    mention_score: number;
    mention_count: number;
    logo: string;
    geo_tier: string;
    mention_tier: string;
    summary: string;
    outlook: string;
  }>;
  executiveSummary: {
    brand_score_and_tier?: string;
    strengths?: string[];
    weaknesses?: string[];
    prioritized_actions?: string[];
    conclusion?: string;
    competitor_positioning?: {
      leaders?: Array<{ name: string; summary: string }>;
      mid_tier?: Array<{ name: string; summary: string }>;
      laggards?: Array<{ name: string; summary: string }>;
    };
  };
  recommendations: Array<{
    overall_insight: string;
    suggested_action: string;
    overall_effort: string;
    impact: string;
  }>;
  keywords: Array<{ id: string; name: string; prompts: string[] }>;
  llmData: Record<string, LlmDataItem>;
  aiVisibility: {
    score: number;
    tier: string;
    brandPosition: number;
    totalBrands: number;
  };
  mentionsData: {
    position: number;
    tier: string;
    totalBrands: number;
    brandMentions: number;
  };
  sourcesAndContentImpact: Record<string, SourceData>;
}

// Printable Report Component
const PrintableContent = ({
  brandName,
  brandWebsite,
  brandInfo,
  executiveSummary,
  recommendations,
  keywords,
  llmData,
  aiVisibility,
  mentionsData,
  sourcesAndContentImpact,
}: PrintableContentProps) => {
  const tableHeaderStyle = { border: '1px solid #ddd', padding: '12px', textAlign: 'left' as const, backgroundColor: '#f0f0f0', fontWeight: 'bold' as const };
  const tableCellStyle = { border: '1px solid #ddd', padding: '12px' };
  const sectionStyle = { pageBreakInside: 'avoid' as const, marginBottom: '32px' };

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#333', fontSize: '14px', lineHeight: '1.6' }}>
      {/* Cover Page */}
      <div style={{ textAlign: 'center', paddingTop: '150px', paddingBottom: '150px', pageBreakAfter: 'always' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px', color: '#1a1a1a' }}>AI Visibility Analysis Report</h1>
        <h2 style={{ fontSize: '28px', color: '#666', marginBottom: '8px' }}>{brandName}</h2>
        <p style={{ fontSize: '16px', color: '#888', marginBottom: '48px' }}>{brandWebsite}</p>
        <p style={{ fontSize: '14px', color: '#666' }}>Generated on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* SECTION 1: Overview */}
      <div style={{ pageBreakAfter: 'always' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', borderBottom: '2px solid #333', paddingBottom: '8px' }}>1. Overview</h2>
        
        <div style={{ display: 'flex', gap: '40px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#444' }}>AI Visibility Score</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563eb' }}>{aiVisibility?.score || 0}</p>
            <p style={{ fontSize: '14px', color: '#666' }}>Tier: {aiVisibility?.tier || 'N/A'}</p>
            <p style={{ fontSize: '14px', color: '#666' }}>Position: {aiVisibility?.brandPosition || 0} of {aiVisibility?.totalBrands || 0} brands</p>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#444' }}>Mentions</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6' }}>{mentionsData?.brandMentions || 0}</p>
            <p style={{ fontSize: '14px', color: '#666' }}>Tier: {mentionsData?.tier || 'N/A'}</p>
            <p style={{ fontSize: '14px', color: '#666' }}>Position: {mentionsData?.position || 0} of {mentionsData?.totalBrands || 0} brands</p>
          </div>
        </div>

        {/* LLM Performance */}
        {llmData && Object.keys(llmData).length > 0 && (
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#444' }}>LLM-wise Performance</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>LLM</th>
                  <th style={tableHeaderStyle}>Mentions</th>
                  <th style={tableHeaderStyle}>Total Prompts</th>
                  <th style={tableHeaderStyle}>Avg Rank</th>
                  <th style={tableHeaderStyle}>Sources</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(llmData).map(([llm, data], idx) => (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                    <td style={{ ...tableCellStyle, textTransform: 'capitalize' }}>{llm}</td>
                    <td style={tableCellStyle}>{data.mentions_count}</td>
                    <td style={tableCellStyle}>{data.prompts}</td>
                    <td style={tableCellStyle}>{data.average_rank > 0 ? data.average_rank.toFixed(2) : 'N/A'}</td>
                    <td style={tableCellStyle}>{data.sources}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Competitor Comparison Table */}
        {brandInfo && brandInfo.length > 0 && (
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#444' }}>Competitor Comparison</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Brand</th>
                  <th style={tableHeaderStyle}>AI Visibility Score</th>
                  <th style={tableHeaderStyle}>Tier</th>
                  <th style={tableHeaderStyle}>Mention Score</th>
                  <th style={tableHeaderStyle}>Outlook</th>
                </tr>
              </thead>
              <tbody>
                {brandInfo
                  .sort((a, b) => b.geo_score - a.geo_score)
                  .map((brand, idx) => (
                  <tr key={idx} style={{ backgroundColor: brand.brand === brandName ? '#eff6ff' : (idx % 2 === 0 ? '#fff' : '#f9fafb') }}>
                    <td style={{ ...tableCellStyle, fontWeight: brand.brand === brandName ? 'bold' : 'normal' }}>{brand.brand}</td>
                    <td style={tableCellStyle}>{brand.geo_score}</td>
                    <td style={tableCellStyle}>{brand.geo_tier}</td>
                    <td style={tableCellStyle}>{brand.mention_score}</td>
                    <td style={tableCellStyle}>{brand.outlook}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: Executive Summary */}
      <div style={{ pageBreakAfter: 'always' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', borderBottom: '2px solid #333', paddingBottom: '8px' }}>2. Executive Summary</h2>
        
        {executiveSummary?.brand_score_and_tier && (
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#444' }}>Brand Score & Tier</h3>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#2563eb' }}>{executiveSummary.brand_score_and_tier}</p>
          </div>
        )}

        {executiveSummary?.strengths && executiveSummary.strengths.length > 0 && (
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#16a34a' }}>Strengths</h3>
            <ul style={{ listStyleType: 'disc', paddingLeft: '24px', margin: 0 }}>
              {executiveSummary.strengths.map((strength, idx) => (
                <li key={idx} style={{ marginBottom: '6px' }}>{strength}</li>
              ))}
            </ul>
          </div>
        )}

        {executiveSummary?.weaknesses && executiveSummary.weaknesses.length > 0 && (
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#dc2626' }}>Weaknesses</h3>
            <ul style={{ listStyleType: 'disc', paddingLeft: '24px', margin: 0 }}>
              {executiveSummary.weaknesses.map((weakness, idx) => (
                <li key={idx} style={{ marginBottom: '6px' }}>{weakness}</li>
              ))}
            </ul>
          </div>
        )}

        {executiveSummary?.conclusion && (
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#444' }}>Conclusion</h3>
            <p>{executiveSummary.conclusion}</p>
          </div>
        )}

        {/* Competitor Positioning */}
        {executiveSummary?.competitor_positioning && (
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#444' }}>Competitor Positioning</h3>
            
            {executiveSummary.competitor_positioning.leaders && executiveSummary.competitor_positioning.leaders.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#16a34a', marginBottom: '8px' }}>Leaders</h4>
                {executiveSummary.competitor_positioning.leaders.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: '8px', paddingLeft: '16px' }}>
                    <strong>{item.name}</strong>: {item.summary}
                  </div>
                ))}
              </div>
            )}

            {executiveSummary.competitor_positioning.mid_tier && executiveSummary.competitor_positioning.mid_tier.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#ca8a04', marginBottom: '8px' }}>Mid Tier</h4>
                {executiveSummary.competitor_positioning.mid_tier.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: '8px', paddingLeft: '16px' }}>
                    <strong>{item.name}</strong>: {item.summary}
                  </div>
                ))}
              </div>
            )}

            {executiveSummary.competitor_positioning.laggards && executiveSummary.competitor_positioning.laggards.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#dc2626', marginBottom: '8px' }}>Laggards</h4>
                {executiveSummary.competitor_positioning.laggards.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: '8px', paddingLeft: '16px' }}>
                    <strong>{item.name}</strong>: {item.summary}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 3: Performance Insights */}
      <div style={{ pageBreakAfter: 'always' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', borderBottom: '2px solid #333', paddingBottom: '8px' }}>3. Performance Insights</h2>

        {/* 3.1 Prompts */}
        {keywords && keywords.length > 0 && (
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#444' }}>3.1 Prompts</h3>
            
            {keywords.map((kw, idx) => (
              <div key={idx} style={{ marginBottom: '24px', pageBreakInside: 'avoid' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#2563eb' }}>
                  Keyword {idx + 1}: {kw.name}
                </h4>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ ...tableHeaderStyle, width: '50px' }}>#</th>
                      <th style={tableHeaderStyle}>Prompt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kw.prompts.map((prompt, pIdx) => (
                      <tr key={pIdx}>
                        <td style={tableCellStyle}>{pIdx + 1}</td>
                        <td style={tableCellStyle}>{prompt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3.2 Sources */}
      {sourcesAndContentImpact && Object.keys(sourcesAndContentImpact).length > 0 && (
        <div style={{ pageBreakAfter: 'always' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#444' }}>3.2 Sources & Content Impact</h3>
          
          {Object.entries(sourcesAndContentImpact).map(([sourceName, sourceData]: [string, any], idx) => (
            <div key={idx} style={{ marginBottom: '24px', pageBreakInside: 'avoid' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#2563eb' }}>{sourceName}</h4>
              
              {/* Pages Used */}
              {sourceData.pages_used && sourceData.pages_used.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Pages Used:</p>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '24px', margin: 0, fontSize: '12px', color: '#666' }}>
                    {sourceData.pages_used.map((url: string, urlIdx: number) => (
                      <li key={urlIdx}>{url}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Brand Mentions Table */}
              {sourceData.mentions && Object.keys(sourceData.mentions).length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={tableHeaderStyle}>Brand</th>
                      <th style={tableHeaderStyle}>Count</th>
                      <th style={tableHeaderStyle}>Score</th>
                      <th style={tableHeaderStyle}>Insight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(sourceData.mentions).map(([brand, mentionData]: [string, any], mIdx: number) => (
                      <tr key={mIdx} style={{ backgroundColor: brand === brandName ? '#eff6ff' : (mIdx % 2 === 0 ? '#fff' : '#f9fafb') }}>
                        <td style={{ ...tableCellStyle, fontWeight: brand === brandName ? 'bold' : 'normal' }}>{brand}</td>
                        <td style={tableCellStyle}>{mentionData.count}</td>
                        <td style={tableCellStyle}>{Math.round(mentionData.score * 100)}%</td>
                        <td style={{ ...tableCellStyle, fontSize: '12px' }}>{mentionData.insight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 3.3 Competitor Analysis */}
      {brandInfo && brandInfo.length > 0 && (
        <div style={{ pageBreakAfter: 'always' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#444' }}>3.3 Competitor Analysis</h3>
          
          {/* Brand Sentiments */}
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#444' }}>Brand Sentiment Analysis</h4>
          {brandInfo.map((brand, idx) => (
            <div key={idx} style={{ marginBottom: '16px', padding: '12px', backgroundColor: brand.brand === brandName ? '#eff6ff' : '#f9fafb', borderRadius: '4px', pageBreakInside: 'avoid' }}>
              <h5 style={{ fontWeight: '600', marginBottom: '4px' }}>{brand.brand} - {brand.outlook}</h5>
              <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>{brand.summary}</p>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 4: Actions */}
      {recommendations && recommendations.length > 0 && (
        <div style={{ pageBreakAfter: 'always' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', borderBottom: '2px solid #333', paddingBottom: '8px' }}>4. Actions</h2>
          
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#444' }}>4.1 Recommendations</h3>
          
          {recommendations.map((rec, idx) => (
            <div key={idx} style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', pageBreakInside: 'avoid' }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                <span style={{ 
                  padding: '4px 12px', 
                  borderRadius: '4px', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  backgroundColor: rec.impact === 'High' ? '#dcfce7' : rec.impact === 'Medium' ? '#fef3c7' : '#fee2e2',
                  color: rec.impact === 'High' ? '#166534' : rec.impact === 'Medium' ? '#92400e' : '#991b1b'
                }}>
                  Impact: {rec.impact}
                </span>
                <span style={{ 
                  padding: '4px 12px', 
                  borderRadius: '4px', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  backgroundColor: rec.overall_effort === 'Low' ? '#dcfce7' : rec.overall_effort === 'Medium' ? '#fef3c7' : '#fee2e2',
                  color: rec.overall_effort === 'Low' ? '#166534' : rec.overall_effort === 'Medium' ? '#92400e' : '#991b1b'
                }}>
                  Effort: {rec.overall_effort}
                </span>
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>Insight</h4>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>{rec.overall_insight}</p>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>Suggested Action</h4>
              <p style={{ fontSize: '14px', color: '#333' }}>{rec.suggested_action}</p>
            </div>
          ))}

          {/* Prioritized Actions from Executive Summary */}
          {executiveSummary?.prioritized_actions && executiveSummary.prioritized_actions.length > 0 && (
            <div style={sectionStyle}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#444' }}>Prioritized Actions</h3>
              <ol style={{ paddingLeft: '24px', margin: 0 }}>
                {executiveSummary.prioritized_actions.map((action, idx) => (
                  <li key={idx} style={{ marginBottom: '8px' }}>{action}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #ddd', textAlign: 'center', color: '#888', fontSize: '12px' }}>
        <p>Generated by GeoRankers AI Visibility Analysis Platform</p>
        <p>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      </div>
    </div>
  );
};

// Generate Report Function
export const generateReport = (toast: (props: { title: string; description: string; variant?: "default" | "destructive"; duration?: number }) => void) => {
  // Gather all data upfront before rendering
  const brandName = getBrandName();
  const brandWebsite = getBrandWebsite();
  const analytics = getAnalytics();
  const brandInfo = getBrandInfoWithLogos();
  const executiveSummary = getExecutiveSummary();
  const recommendations = getRecommendations();
  const keywords = getSearchKeywordsWithPrompts();
  const llmData = getLlmData();
  const aiVisibility = getAIVisibilityMetrics();
  const mentionsData = getMentionsPosition();
  const sourcesAndContentImpact = analytics?.sources_and_content_impact || {};

  // Check if data is available
  if (!brandName || brandInfo.length === 0) {
    toast({
      title: "No Data Available",
      description: "Please wait for the analysis to complete before generating a report.",
      variant: "destructive",
    });
    return false;
  }

  toast({
    title: "Generating Report",
    description: "Preparing your comprehensive report...",
    duration: 2000,
  });

  // Create a hidden container for the full report
  let printContainer = document.getElementById("print-report-container") as HTMLDivElement;
  
  if (!printContainer) {
    printContainer = document.createElement("div");
    printContainer.id = "print-report-container";
    printContainer.style.display = "none";
    document.body.appendChild(printContainer);
  }

  // Mount the full report content with all data passed as props
  const root = createRoot(printContainer);
  root.render(
    <PrintableContent 
      brandName={brandName}
      brandWebsite={brandWebsite}
      brandInfo={brandInfo}
      executiveSummary={executiveSummary}
      recommendations={recommendations}
      keywords={keywords}
      llmData={llmData}
      aiVisibility={aiVisibility}
      mentionsData={mentionsData}
      sourcesAndContentImpact={sourcesAndContentImpact}
    />
  );

  // Add print styles dynamically
  const printStyleId = "print-report-styles";
  let styleSheet = document.getElementById(printStyleId) as HTMLStyleElement;

  if (!styleSheet) {
    styleSheet = document.createElement("style");
    styleSheet.id = printStyleId;
    document.head.appendChild(styleSheet);
  }

  styleSheet.textContent = `
    @media print {
      @page {
        size: A4;
        margin: 15mm;
      }
      
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      /* Hide everything except the print container */
      body > *:not(#print-report-container) {
        display: none !important;
      }
      
      #print-report-container {
        display: block !important;
      }
      
      /* Hide UI elements */
      header, nav, .fixed, button, .sidebar, [data-sidebar] {
        display: none !important;
      }
      
      /* Remove shadows and transitions */
      * {
        box-shadow: none !important;
        transition: none !important;
        animation: none !important;
      }
    }
    
    @media screen {
      #print-report-container {
        display: none !important;
      }
    }
  `;

  // Small delay to ensure component renders, then trigger print
  setTimeout(() => {
    printContainer.style.display = "block";
    window.print();

    // Cleanup after print
    setTimeout(() => {
      printContainer.style.display = "none";
      root.unmount();
    }, 1000);
  }, 500);

  return true;
};
