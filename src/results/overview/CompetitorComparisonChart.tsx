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
  "hsl(210, 15%, 70%)",
  "hsl(210, 15%, 62%)",
  "hsl(210, 15%, 55%)",
  "hsl(210, 15%, 48%)",
  "hsl(210, 15%, 42%)"
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
    <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-5 md:p-6 overflow-hidden hover:border-border/70 transition-all duration-300">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            Competitive Landscape
          </h3>
        </div>
        <div className="flex items-center gap-0.5 bg-muted/40 rounded-lg p-0.5 border border-border/30">
          {(["geo_score", "mentions"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${
                viewMode === mode
                  ? "bg-card text-foreground shadow-sm border border-border/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {mode === "geo_score" ? "Visibility Score" : "Mentions"}
            </button>
          ))}
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mb-4 ml-9">
        {viewMode === "geo_score"
          ? "How you stack up against competitors in AI search results"
          : "Who gets mentioned most across AI platforms"}
      </p>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal vertical={false} opacity={0.5} />
            <XAxis
              type="number"
              stroke="hsl(var(--muted-foreground))"
              axisLine={false}
              tickLine={false}
              domain={[0, maxValue]}
              fontSize={10}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              width={140}
              tick={({ x, y, payload }) => {
                const brand = chartData.find((b) => b.name === payload.value);
                return (
                  <g transform={`translate(${x},${y})`}>
                    <foreignObject x={-115} y={-12} width={115} height={24}>
                      <div className="flex items-center gap-1.5 justify-end">
                        {brand?.logo && (
                          <img
                            src={brand.logo}
                            alt={payload.value}
                            className="w-3.5 h-3.5 rounded-full bg-white object-contain"
                          />
                        )}
                        <span
                          className={`text-[10px] truncate ${
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
                fontSize: 12,
              }}
              formatter={(value, name, props) => {
                const data = props.payload;
                return [
                  <div className="space-y-0.5 text-xs">
                    <div>Visibility Score: <strong>{data.geoScore}</strong></div>
                    <div>Mentions: <strong>{data.mentionCount}</strong></div>
                  </div>,
                  null,
                ];
              }}
              labelFormatter={(label) => (
                <span className="font-semibold text-xs">{label}</span>
              )}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {insight && (
        <p className="text-[10px] text-muted-foreground text-center mt-3 pt-3 border-t border-border/30">
          <span className="text-primary font-medium">Insight:</span> {insight}
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-3 mt-2.5">
        {chartData.map((brand, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: brand.color }} />
            <span className="text-[10px] text-muted-foreground">{brand.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
