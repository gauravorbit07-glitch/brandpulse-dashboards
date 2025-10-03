import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

interface ContentImpactProps {
  contentImpact: {
    header: string[];
    rows: (string | number)[][];
    depth_notes?: {
      [brand: string]: {
        [source: string]: {
          insight: string;
          pages_used: string[];
        };
      };
    };
  };
}

const getMentionScoreColor = (tier: string) => {
  const tierLower = tier.toLowerCase();
  if (tierLower === 'high') return 'bg-emerald-500 text-white';
  if (tierLower === 'medium') return 'bg-yellow-500 text-white';
  if (tierLower === 'low' || tierLower === 'absent') return 'bg-red-500 text-white';
  return 'bg-secondary text-secondary-foreground';
};

export const ContentImpact = ({ contentImpact }: ContentImpactProps) => {
  if (!contentImpact.rows || contentImpact.rows.length === 0) {
    return null;
  }

  // Parse the header to find brand names (excluding first "Sources" and last two "Cited By LLMs" and "pages_used")
  const brandNames: string[] = [];
  for (let i = 1; i < contentImpact.header.length - 2; i += 3) {
    brandNames.push(contentImpact.header[i]);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <BarChart3 className="h-7 w-7 text-primary" />
        Content Impact Analysis
      </h2>
    
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Platform-wise Brand Performance</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px] font-bold">Platform</TableHead>
                {brandNames.slice(0, -1).map((brand, i) => (
                  <TableHead key={i} className="text-center min-w-[120px] font-bold">Competitor</TableHead>
                ))}
                <TableHead className="text-center min-w-[120px] font-bold bg-primary/10">Your Brand</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contentImpact.rows.map((row, rowIndex) => {
                const sourceName = row[0] as string;
                const brands: Array<{ name: string; mentions: number; score: string }> = [];
                
                // Parse each brand's data (name, mentions, score pattern)
                for (let i = 1; i < row.length - 2; i += 3) {
                  if (i + 2 < row.length - 2) {
                    brands.push({
                      name: row[i] as string,
                      mentions: row[i + 1] as number,
                      score: row[i + 2] as string
                    });
                  }
                }

                return (
                  <TableRow key={rowIndex}>
                    <TableCell className="font-semibold">{sourceName}</TableCell>
                    {brands.slice(0, -1).map((brand, index) => (
                      <TableCell key={index} className="text-center">
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{brand.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Mentions: {brand.mentions}
                          </div>
                          <Badge className={getMentionScoreColor(brand.score)}>
                            {brand.score}
                          </Badge>
                        </div>
                      </TableCell>
                    ))}
                    {brands.length > 0 && (
                      <TableCell className="text-center bg-primary/5">
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{brands[brands.length - 1].name}</div>
                          <div className="text-xs text-muted-foreground">
                            Mentions: {brands[brands.length - 1].mentions}
                          </div>
                          <Badge className={getMentionScoreColor(brands[brands.length - 1].score)}>
                            {brands[brands.length - 1].score}
                          </Badge>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};