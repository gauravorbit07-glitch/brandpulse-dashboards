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
    <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-5 md:p-6 mb-6 overflow-hidden">
      {/* Accent gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/60 via-primary to-primary/60 rounded-t-2xl" />
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3.5">
          {brandLogo ? (
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-center p-2 flex-shrink-0">
              <img 
                src={brandLogo} 
                alt={brandName} 
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-base font-bold text-primary">
                {brandName.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight">{brandName}</h2>
            {brandWebsite && (
              <a 
                href={brandWebsite} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors mt-0.5"
              >
                <span className="truncate">{brandWebsite}</span>
                <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
              </a>
            )}
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2.5">
                {keywords.map((keyword, idx) => (
                  <Badge 
                    key={idx} 
                    className="bg-primary/8 text-primary border-primary/15 hover:bg-primary/12 text-[10px] font-medium px-2 py-0.5"
                    variant="outline"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Mobile: date + models */}
            <div className="flex flex-col gap-1.5 mt-2.5 md:hidden">
              {analysisDate && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{analysisDate}</span>
                </div>
              )}
              {models.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">Analyzed by:</span>
                  <div className="flex items-center gap-1">
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
        <div className="hidden md:flex md:flex-col md:items-end gap-1.5">
          {analysisDate && (
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-lg border border-border/30">
              <Calendar className="w-3 h-3" />
              <span>{analysisDate}</span>
            </div>
          )}
          {models.length > 0 && (
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[10px] text-muted-foreground">Analyzed by</span>
              <div className="flex items-center gap-1">
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
