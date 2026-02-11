import { getDepthNotes, getBrandName } from "@/results/data/analyticsData";
import { FileText, Lightbulb, Link } from "lucide-react";

export const SourceInsights = () => {
  const depthNotes = getDepthNotes();
  const brandName = getBrandName();
  
  const sources = Object.entries(depthNotes).map(([source, data]: [string, any]) => ({
    source,
    insight: data.insight,
    pagesUsed: data.pages_used || []
  }));

  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-5 md:p-6 overflow-hidden hover:border-border/70 transition-all duration-300">
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded-lg bg-amber-500/10">
          <Lightbulb className="w-4 h-4 text-amber-500" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Source Insights for {brandName}</h3>
      </div>
      <p className="text-[10px] text-muted-foreground mb-4 ml-9">Key insights from different source categories</p>
      
      <div className="space-y-3">
        {sources.map((item) => (
          <div 
            key={item.source}
            className="p-3.5 rounded-xl bg-muted/20 border border-border/30 hover:border-primary/20 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  <h4 className="font-semibold text-foreground text-xs">{item.source}</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{item.insight}</p>
              </div>
            </div>
            
            {item.pagesUsed.length > 0 && (
              <div className="mt-2.5 pt-2.5 border-t border-border/30">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Link className="w-2.5 h-2.5 text-muted-foreground" />
                  <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Pages Used</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.pagesUsed.map((page: string, pageIdx: number) => (
                    <span 
                      key={pageIdx}
                      className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/8 text-primary text-[10px] font-medium border border-primary/10"
                    >
                      {page}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
