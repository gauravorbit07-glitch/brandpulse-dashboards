import { getBrandName, getBrandWebsite, getModelName, getAnalysisKeywords, getBrandLogo, getAnalysisDate } from "@/results/data/analyticsData";
import { LLMIcon } from "@/results/ui/LLMIcon";
import { ExternalLink, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const BrandInfoBar = () => {
  const brandName = getBrandName();
  const brandWebsite = getBrandWebsite();
  const modelName = getModelName();
  const keywords = getAnalysisKeywords();
  const brandLogo = getBrandLogo();
  const analysisDate = getAnalysisDate();
  
  const models = modelName
    ?.split(",")
    .map((m) => m.trim())
    .filter(Boolean) || [];
  
  if (!brandName) return null;
  
  return (
    <div className="relative bg-card rounded-2xl border border-border/60 p-5 md:p-6 mb-8 shadow-card overflow-hidden">
      {/* Subtle gradient accent at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-hero rounded-t-2xl" />
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Brand info */}
        <div className="flex items-start gap-4">
          {brandLogo ? (
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center p-2 flex-shrink-0 shadow-sm">
              <img 
                src={brandLogo} 
                alt={brandName} 
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-lg font-bold text-primary">
                {brandName.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">{brandName}</h2>
            {brandWebsite && (
              <a 
                href={brandWebsite} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors mt-0.5"
              >
                <span className="truncate">{brandWebsite}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            )}
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {keywords.map((keyword, idx) => (
                  <Badge 
                    key={idx} 
                    className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 text-[11px] font-medium px-2.5 py-0.5"
                    variant="outline"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Mobile: date + models */}
            <div className="flex flex-col gap-2 mt-3 md:hidden">
              {analysisDate && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{analysisDate}</span>
                </div>
              )}
              {models.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">Analyzed by:</span>
                  <div className="flex items-center gap-1.5">
                    {models.map((model) => (
                      <LLMIcon key={model} platform={model} size="lg" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Desktop: date + models */}
        <div className="hidden md:flex md:flex-col md:items-end gap-2">
          {analysisDate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
              <Calendar className="w-3.5 h-3.5" />
              <span>{analysisDate}</span>
            </div>
          )}
          {models.length > 0 && (
            <div className="flex flex-col items-end gap-1">
              <span className="text-[11px] text-muted-foreground">Analyzed by</span>
              <div className="flex items-center gap-1.5">
                {models.map((model) => (
                  <LLMIcon key={model} platform={model} size="lg" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandInfoBar;
