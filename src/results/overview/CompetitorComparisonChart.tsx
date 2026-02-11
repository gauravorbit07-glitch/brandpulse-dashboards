import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getBrandInfoWithLogos, getBrandName } from "@/results/data/analyticsData";
import { TrendingUp } from "lucide-react";
import { useState, useMemo } from "react";
import { useResults } from "@/results/context/ResultsContext";

type ViewMode = "geo_score" | "mentions";

const competitorColors = [
  "hsl(142, 40%, 60%)",
  "hsl(45, 70%, 65%)",
  "hsl(258, 55%, 70%)",
  "hsl(0, 65%, 70%)",
  "hsl(28, 65%, 65%)"
];

export const CompetitorComparisonChart = () => {
  const { analyticsVersion } = useResults();
  const [viewMode, setViewMode] = useState<ViewMode>("geo_score");
  const brandInfo = getBrandInfoWithLogos();
  const brandName = getBrandName();

  const brandColors = useMemo(() => {
    const map: Record<string, string> = {};
    let colorIndex = 0;
    brandInfo.forEach((b) => {
      map[b.brand] =
        b.brand === brandName
          ? "hsl(var(--primary))"
          : competitorColors[colorIndex++ % competitorColors.length];
    });
    return map;
  }, [brandInfo, brandName, analyticsVersion]);

  const sortedBrands = useMemo(() => {
    const myBrand = brandInfo.find(b => b.brand === brandName);
    const competitors = brandInfo.filter(b => b.brand !== brandName);
    return myBrand ? [myBrand, ...competitors.reverse()] : competitors.reverse();
  }, [brandInfo, brandName, analyticsVersion]);

  const chartData = useMemo(() => {
    return sortedBrands.map((brand) => ({
      name: brand.brand,
      value: viewMode === "geo_score" ? brand.geo_score : brand.mention_count,
      geoScore: brand.geo_score,
      mentionCount: brand.mention_count,
      mentionScore: brand.mention_score,
      logo: brand.logo,
      isBrand: brand.brand === brandName,
      color: brandColors[brand.brand],
    }));
  }, [sortedBrands, viewMode, brandName, brandColors, analyticsVersion]);

  const maxValue = useMemo(
    () => Math.max(...chartData.map((d) => d.value), 1),
    [chartData]
  );

  // Dynamic insight
  const insight = useMemo(() => {
    const brand = chartData.find(d => d.isBrand);
    if (!brand) return null;
    const sorted = [...chartData].sort((a, b) => b.value - a.value);
    const rank = sorted.findIndex(d => d.isBrand) + 1;
    const leader = sorted[0];
    if (rank === 1) return `${brandName} leads the competitive landscape`;
    return `${leader.name} leads — ${brandName} ranks #${rank} of ${chartData.length}`;
  }, [chartData, brandName]);

  return (
    <div className="bg-card rounded-2xl border border-border/60 p-5 md:p-6 overflow-hidden shadow-card hover:shadow-elevated transition-shadow duration-300">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-base font-semibold text-foreground">
            Competitive Landscape
          </h3>
        </div>
        <div className="flex items-center gap-0.5 bg-muted/60 rounded-lg p-0.5">
          {(["geo_score", "mentions"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                viewMode === mode
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {mode === "geo_score" ? "Visibility Score" : "Mentions"}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-5">
        {viewMode === "geo_score"
          ? "How you stack up against competitors in AI search results"
          : "Who gets mentioned most across AI platforms"}
      </p>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal vertical={false} />
            <XAxis
              type="number"
              stroke="hsl(var(--muted-foreground))"
              axisLine={false}
              tickLine={false}
              domain={[0, maxValue]}
              fontSize={11}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              width={150}
              tick={({ x, y, payload }) => {
                const brand = chartData.find((b) => b.name === payload.value);
                return (
                  <g transform={`translate(${x},${y})`}>
                    <foreignObject x={-120} y={-12} width={120} height={24}>
                      <div className="flex items-center gap-2 justify-end">
                        {brand?.logo && (
                          <img
                            src={brand.logo}
                            alt={payload.value}
                            className="w-4 h-4 rounded-full bg-white object-contain"
                          />
                        )}
                        <span
                          className={`text-xs truncate ${
                            brand?.isBrand
                              ? "text-primary font-semibold"
                              : "text-muted-foreground"
                          }`}
                        >
                          {payload.value}
                        </span>
                      </div>
                    </foreignObject>
                  </g>
                );
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 12,
                boxShadow: "var(--shadow-elevated)",
              }}
              formatter={(value, name, props) => {
                const data = props.payload;
                return [
                  <div className="space-y-1 text-sm">
                    <div>Visibility Score: <strong>{data.geoScore}</strong></div>
                    <div>Mentions: <strong>{data.mentionCount}</strong></div>
                  </div>,
                  null,
                ];
              }}
              labelFormatter={(label) => (
                <span className="font-semibold text-sm">{label}</span>
              )}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insight + Legend */}
      {insight && (
        <p className="text-xs text-muted-foreground text-center mt-4 pt-3 border-t border-border/50 italic">
          💡 {insight}
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-4 mt-3">
        {chartData.map((brand, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: brand.color }} />
            <span className="text-[11px] text-muted-foreground">{brand.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
