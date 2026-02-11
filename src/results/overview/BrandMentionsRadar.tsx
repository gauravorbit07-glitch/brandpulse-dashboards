import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { getKeywords, getBrandName, getCompetitorData } from "@/results/data/analyticsData";
import { Target, ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";
import { toOrdinal } from "@/results/data/formulas";
import { useResults } from "@/results/context/ResultsContext";

export const BrandMentionsRadar = () => {
  const { analyticsVersion } = useResults();
  const keywords = getKeywords();
  const brandName = getBrandName();
  const competitorDataList = getCompetitorData();
  const [selectedKeyword, setSelectedKeyword] = useState<string>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const allBrands = useMemo(() => competitorDataList.map(c => c.name), [competitorDataList, analyticsVersion]);
  
  const chartData = useMemo(() => {
    return allBrands.map((brand) => {
      const competitor = competitorDataList.find(c => c.name === brand);
      if (!competitor) return { brand, score: 0 };
      if (selectedKeyword === 'all') {
        const totalScore = competitor.keywordScores.reduce((sum, score) => sum + score, 0);
        return { brand, score: totalScore };
      } else {
        const keywordIdx = keywords.indexOf(selectedKeyword);
        return { brand, score: keywordIdx >= 0 ? competitor.keywordScores[keywordIdx] || 0 : 0 };
      }
    });
  }, [allBrands, competitorDataList, selectedKeyword, keywords, analyticsVersion]);

  const maxScore = Math.max(...chartData.map(d => d.score), 1);
  
  const insight = useMemo(() => {
    const brandData = chartData.find(d => d.brand === brandName);
    if (!brandData) return `${brandName} performance overview`;
    const brandScore = brandData.score;
    const sortedData = [...chartData].sort((a, b) => b.score - a.score);
    const brandRank = sortedData.findIndex(d => d.brand === brandName) + 1;
    const topCompetitor = sortedData[0];
    
    if (selectedKeyword === 'all') {
      if (brandRank === 1) return `${brandName} leads with ${brandScore} total mentions across all keywords`;
      const gap = topCompetitor.score - brandScore;
      return `${brandName} ranks ${toOrdinal(brandRank)} — ${gap} mentions behind ${topCompetitor.brand}`;
    } else {
      if (brandRank === 1) return `${brandName} dominates "${selectedKeyword}" with ${brandScore} mentions`;
      if (brandScore === 0) return `Not mentioned for "${selectedKeyword}" — opportunity to improve`;
      return `${toOrdinal(brandRank)} for "${selectedKeyword}" with ${brandScore} mentions`;
    }
  }, [chartData, brandName, selectedKeyword]);

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-5 md:p-6 overflow-hidden hover:border-border/70 transition-all duration-300">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Target className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Mention Distribution</h3>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/40 rounded-lg text-[10px] font-medium text-foreground hover:bg-muted/60 transition-colors border border-border/30"
          >
            <span className="max-w-[100px] truncate">
              {selectedKeyword === 'all' ? 'All Keywords' : selectedKeyword}
            </span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-xl shadow-elevated z-50 max-h-56 overflow-y-auto">
              <button
                onClick={() => { setSelectedKeyword('all'); setIsDropdownOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-muted/40 transition-colors ${
                  selectedKeyword === 'all' ? 'bg-primary/5 text-primary font-medium' : 'text-foreground'
                }`}
              >
                All Keywords
              </button>
              {keywords.map((keyword, idx) => (
                <button
                  key={`keyword-${idx}`}
                  onClick={() => { setSelectedKeyword(keyword); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-muted/40 transition-colors ${
                    selectedKeyword === keyword ? 'bg-primary/5 text-primary font-medium' : 'text-foreground'
                  }`}
                >
                  {keyword}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mb-3 ml-9">
        {selectedKeyword === 'all' 
          ? 'Who dominates mentions across the keywords' 
          : `Brand mention for "${selectedKeyword}"`}
      </p>
      
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" opacity={0.5} />
            <PolarAngleAxis 
              dataKey="brand" 
              tick={({ x, y, payload }) => {
                const isBrand = payload.value === brandName;
                return (
                  <text
                    x={x}
                    y={y}
                    fill={isBrand ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                    fontSize={10}
                    fontWeight={isBrand ? 600 : 400}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {payload.value.length > 12 ? payload.value.substring(0, 12) + '...' : payload.value}
                  </text>
                );
              }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, maxScore]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.1}
              strokeWidth={1.5}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-elevated)',
                fontSize: 12,
              }}
              formatter={(value: number) => [value, 'Mentions']}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      <p className="text-[10px] text-muted-foreground text-center mt-2 pt-3 border-t border-border/30">
        <span className="text-primary font-medium">Insight:</span> {insight}
      </p>
    </div>
  );
};
