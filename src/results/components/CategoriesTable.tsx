import { MessageSquare, Check, X, ChevronDown, ChevronRight } from "lucide-react";
import { getLlmData, getModelDisplayName } from "@/results/data/analyticsData";
import { LLMIcon } from "@/results/ui/LLMIcon";
import { useState } from "react";

const DEFAULT_BRAND_MENTION = 0;

interface Brand {
  brand: string;
  logo?: string;
  mention_breakdown?: Record<string, number>;
}

interface Prompt {
  query: string;
  brands_per_llm: Record<string, string[]>;
  category?: string;
  keywordId?: string;
  keywordName?: string;
}

interface CategoriesTableProps {
  prompts: Prompt[];
  brandsToDisplay: Brand[];
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  brandName: string;
  getBrandLogo: (name: string) => string | undefined;
  categories: string[];
}

const CategoriesTable = ({
  prompts,
  brandsToDisplay,
  selectedBrand,
  setSelectedBrand,
  brandName,
  getBrandLogo,
  categories,
}: CategoriesTableProps) => {
  const llmData = getLlmData();
  const modelNames = Object.keys(llmData);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(categories));

  const isBrandVisibleInLLM = (prompt: Prompt, modelName: string): boolean => {
    if (!selectedBrand) return false;
    const brandsForLLM = prompt.brands_per_llm[modelName];
    return Array.isArray(brandsForLLM) && brandsForLLM.includes(selectedBrand);
  };

  // Count prompts where brand appears in at least one LLM response
  const getBrandTickCount = (categoryPrompts: Prompt[]): number => {
    const brandToUse = selectedBrand || brandName;
    let count = 0;
    categoryPrompts.forEach((prompt) => {
      const isVisible = Object.values(prompt.brands_per_llm || {}).some((brands) =>
        Array.isArray(brands) && brands.includes(brandToUse)
      );
      if (isVisible) count++;
    });
    return count;
  };

  const groupPromptsByCategory = () => {
    const grouped: Record<string, Prompt[]> = {};

    categories.forEach((cat) => {
      grouped[cat] = [];
    });
    grouped["Other"] = [];

    prompts.forEach((prompt) => {
      if (prompt.category) {
        const trimmed = prompt.category.trim();
        const matched = categories.find(
          (cat) => cat.toLowerCase() === trimmed.toLowerCase()
        );
        if (matched) {
          grouped[matched].push(prompt);
          return;
        }
      }

      const q = prompt.query.toLowerCase();

      if (
        q.includes("affordable") || q.includes("free trial") ||
        q.includes("pricing") || q.includes("price") ||
        q.includes("cost-effective") || q.includes("cheap") ||
        q.includes("budget") || q.includes("expensive")
      ) {
        grouped["Pricing"].push(prompt);
      } else if (
        q.includes(" vs ") || q.includes(" vs.") ||
        q.includes("compare") || q.includes("alternative") ||
        q.includes("alternatives") || q.includes("difference between") ||
        q.includes("switch from") || q.includes("better than")
      ) {
        grouped["Comparison"].push(prompt);
      } else if (
        q.includes("most reliable") || q.includes("most trusted") ||
        q.includes("reliable") || q.includes("trusted") ||
        q.includes("trust") || q.includes("review") ||
        q.includes("rating") || q.includes("secure") || q.includes("safe")
      ) {
        grouped["Trust"].push(prompt);
      } else if (
        q.includes("how to") || q.includes("how do i") ||
        q.includes("use case") || q.includes("for startups") ||
        q.includes("for startup") || q.includes("for enterprises") ||
        q.includes("for enterprise") || q.includes("for small business") ||
        q.includes("for mobile") || q.includes("for teams")
      ) {
        grouped["Use Case"].push(prompt);
      } else if (
        q.includes("best") || q.includes("top-rated") ||
        q.includes("top rated") || q.startsWith("top ") ||
        q.includes(" top ") || q.includes("discover") ||
        q.includes("find") || q.includes("what is") ||
        q.includes("leading") || q.includes("popular") ||
        q.includes("recommended")
      ) {
        grouped["Discovery"].push(prompt);
      } else {
        grouped["Other"].push(prompt);
      }
    });

    return grouped;
  };

  const promptsByCategory = groupPromptsByCategory();

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const renderCategoryHeader = (categoryLabel: string, categoryPrompts: Prompt[]) => {
    const isExpanded = expandedCategories.has(categoryLabel);
    const brandScore = getBrandTickCount(categoryPrompts);

    return (
      <div
        className="p-4 md:p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => toggleCategory(categoryLabel)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
          ) : (
            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          )}
          <div className="min-w-0">
            <span className="font-semibold text-foreground text-sm md:text-base block truncate">
              {categoryLabel}
            </span>
            <span className="text-xs text-muted-foreground">
              {categoryPrompts.length} prompts
            </span>
          </div>
        </div>

        {/* Brand Score Badge */}
        <div className="flex flex-col items-center flex-shrink-0 md:pr-10">
          <span
            className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${
              brandScore >= 3
                ? "bg-green-500/20 text-green-500"
                : brandScore >= 1
                ? "bg-amber-500/20 text-amber-500"
                : "bg-red-500/20 text-red-500"
            }`}
          >
            {brandScore}
          </span>
          <span className="text-[10px] text-muted-foreground mt-1">
            Your brand's mention
          </span>
        </div>
      </div>
    );
  };

  const renderPromptsTable = (categoryPrompts: Prompt[]) => (
    <div className="border-t border-border/50 bg-muted/20">
      <div className="p-4 md:p-5 space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          AI Prompts Used
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Prompt
                </th>
                {modelNames.map((modelName) => (
                  <th
                    key={modelName}
                    className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <LLMIcon platform={modelName} size="sm" />
                      <span>{getModelDisplayName(modelName)}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categoryPrompts.map((prompt, idx) => (
                <tr
                  key={idx}
                  className={idx < categoryPrompts.length - 1 ? "border-b border-border/50" : ""}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-foreground leading-relaxed">
                          {prompt.query}
                        </p>
                        {prompt.keywordName && (
                          <span className="text-xs text-muted-foreground">
                            Keyword: {prompt.keywordName}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  {modelNames.map((modelName) => {
                    const isVisible = isBrandVisibleInLLM(prompt, modelName);
                    return (
                      <td key={modelName} className="py-3 px-4 text-center">
                        {selectedBrand ? (
                          <div className="flex items-center justify-center">
                            {isVisible ? (
                              <Check className="w-5 h-5 text-green-500" />
                            ) : (
                              <X className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {categories.map((category) => {
          const categoryPrompts = promptsByCategory[category] || [];
          const isExpanded = expandedCategories.has(category);

          if (categoryPrompts.length === 0) return null;

          return (
            <div
              key={category}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              {renderCategoryHeader(category, categoryPrompts)}
              {isExpanded && renderPromptsTable(categoryPrompts)}
            </div>
          );
        })}

        {/* Other category */}
        {promptsByCategory["Other"] && promptsByCategory["Other"].length > 0 && (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {renderCategoryHeader("Other", promptsByCategory["Other"])}
            {expandedCategories.has("Other") && renderPromptsTable(promptsByCategory["Other"])}
          </div>
        )}
      </div>

      {/* Brand Mentions Summary */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <h4 className="text-sm font-semibold text-foreground mb-3">
          Brand Mentions Summary
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {brandsToDisplay.map((brand) => {
            const totalScore = Object.values(brand.mention_breakdown || {}).reduce(
              (sum: number, score: unknown) =>
                sum + (typeof score === "number" ? score : 0),
              0
            );
            const brandToUse = selectedBrand || brandName;
            const isBrand = brand.brand === brandToUse;
            return (
              <div
                key={brand.brand}
                className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                  isBrand
                    ? "bg-primary/10 border-primary/30"
                    : "bg-muted/50 border-border"
                }`}
              >
                {brand.logo && (
                  <img
                    src={brand.logo}
                    alt=""
                    className="w-8 h-8 rounded-full object-contain bg-white mb-1"
                  />
                )}
                <span
                  className={`text-[10px] font-medium text-center truncate w-full ${
                    isBrand ? "text-primary" : "text-foreground"
                  }`}
                >
                  {brand.brand}
                </span>
                <span
                  className={`text-lg font-bold ${
                    totalScore >= 3
                      ? "text-green-500"
                      : totalScore >= 1
                      ? "text-amber-500"
                      : "text-red-500"
                  }`}
                >
                  {totalScore}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoriesTable;