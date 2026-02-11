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
    <div className="bg-card rounded-2xl border border-border/60 p-5 md:p-6 overflow-hidden shadow-card hover:shadow-elevated transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-1">
        <Bot className="w-5 h-5 text-primary" />
        <h3 className="text-base font-semibold text-foreground">
          Model-Wise Visibility
        </h3>
      </div>

      <p className="text-xs text-muted-foreground mb-5">
        Your brand's ranking & reach across AI platforms
      </p>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Platform
              </th>
              <th className="text-center py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Mentions
              </th>
              <th className="text-center py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Prompts
              </th>
              <th className="text-center py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Avg Rank
              </th>
            </tr>
          </thead>

          <tbody>
            {platformData.map((row, idx) => (
              <tr
                key={row.platform}
                className={`hover:bg-muted/30 transition-colors ${
                  idx < platformData.length - 1 ? "border-b border-border/30" : ""
                }`}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <LLMIcon platform={row.platform} size="md" />
                    <span className="font-medium text-sm text-foreground">
                      {row.displayName}
                    </span>
                  </div>
                </td>

                <td className="py-3 px-4 text-center">
                  <span className="text-base font-bold text-foreground tabular-nums">
                    {row.appearances}
                  </span>
                </td>

                <td className="py-3 px-4 text-center">
                  <Link
                    to={`/results/prompts?expandAll=true&viewType=model`}
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    {row.prompts}
                  </Link>
                </td>

                <td className="py-3 px-4 text-center">
                  <span
                    className={`font-bold text-sm ${
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
        <div className="flex flex-col items-center justify-center text-center py-10 px-4">
          <div className="p-4 rounded-2xl bg-muted/40 mb-4">
            <Bot className="w-8 h-8 text-muted-foreground" />
          </div>
          <h4 className="text-sm font-semibold text-foreground mb-1">No Model Data Yet</h4>
          <p className="text-xs text-muted-foreground max-w-md mb-2">
            AI models haven't surfaced your brand for the tracked queries yet.
          </p>
          <p className="text-[11px] text-muted-foreground/70 italic">
            Improve presence via documentation, blogs, and citations.
          </p>
        </div>
      )}
    </div>
  );
};
