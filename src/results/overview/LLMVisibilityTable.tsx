import {
  getLlmData,
  getSearchKeywordsWithPrompts,
  getModelDisplayName,
} from "@/results/data/analyticsData";
import { LLMIcon } from "@/results/ui/LLMIcon";
import { Bot } from "lucide-react";
import { Link } from "react-router-dom";

export const LLMVisibilityTable = () => {
  const llmData = getLlmData();
  const keywordsWithPrompts = getSearchKeywordsWithPrompts();

  const totalPrompts = keywordsWithPrompts.reduce(
    (sum, keyword) => sum + (keyword.prompts?.length || 0),
    0
  );

  const platformData = Object.entries(llmData).map(
    ([platform, data]: [string, any]) => ({
      platform,
      displayName: getModelDisplayName(platform),
      appearances: data.mentions_count || 0,
      prompts: totalPrompts,
      avgPosition: data.average_rank
        ? `#${data.average_rank.toFixed(1)}`
        : "0",
      sources: data.sources || 0,
    })
  );

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-5 md:p-6 overflow-hidden hover:border-border/70 transition-all duration-300">
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded-lg bg-primary/10">
          <Bot className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          Model-Wise Visibility
        </h3>
      </div>
      <p className="text-[10px] text-muted-foreground mb-4 ml-9">
        Your brand's ranking & reach across AI platforms
      </p>

      <div className="overflow-x-auto -mx-5 md:-mx-6 px-5 md:px-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/40">
              <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Platform
              </th>
              <th className="text-center py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Mentions
              </th>
              <th className="text-center py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Prompts
              </th>
              <th className="text-center py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Avg Rank
              </th>
            </tr>
          </thead>
          <tbody>
            {platformData.map((row, idx) => (
              <tr
                key={row.platform}
                className={`hover:bg-muted/20 transition-colors ${
                  idx < platformData.length - 1 ? "border-b border-border/20" : ""
                }`}
              >
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <LLMIcon platform={row.platform} size="md" />
                    <span className="font-medium text-xs text-foreground">
                      {row.displayName}
                    </span>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="text-sm font-bold text-foreground tabular-nums">
                    {row.appearances}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-center">
                  <Link
                    to={`/results/prompts?expandAll=true&viewType=model`}
                    className="text-primary text-xs font-medium hover:underline"
                  >
                    {row.prompts}
                  </Link>
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span
                    className={`font-bold text-xs ${
                      row.avgPosition !== "0" &&
                      parseFloat(row.avgPosition.slice(1)) <= 2
                        ? "text-emerald-500"
                        : row.avgPosition !== "0" &&
                          parseFloat(row.avgPosition.slice(1)) <= 3
                        ? "text-amber-500"
                        : row.avgPosition !== "0"
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {row.avgPosition}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {platformData.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-8 px-4">
          <div className="p-3 rounded-xl bg-muted/30 mb-3">
            <Bot className="w-6 h-6 text-muted-foreground" />
          </div>
          <h4 className="text-xs font-semibold text-foreground mb-1">No Model Data Yet</h4>
          <p className="text-[10px] text-muted-foreground max-w-md">
            AI models haven't surfaced your brand for the tracked queries yet.
          </p>
        </div>
      )}
    </div>
  );
};
