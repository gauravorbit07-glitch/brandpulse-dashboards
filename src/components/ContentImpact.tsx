import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ContentImpactProps {
  contentImpact: {
    [key: string]: {
      brands: Array<{
        brand: string;
        mentions: { Value: number };
        visibility: { Value: number };
        tier: string;
      }>;
      our_brand: {
        brand: string;
        mentions: { Value: number };
        visibility: { Value: number };
        tier: string;
      };
    };
  };
}

export const ContentImpact = ({ contentImpact }: ContentImpactProps) => {
  const maxBrands = Math.max(...Object.values(contentImpact).map(data => data.brands.length));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Content Impact Analysis</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Platform</TableHead>
              {Array.from({ length: maxBrands }, (_, i) => (
                <TableHead key={i} className="text-center min-w-[120px]">Rank {i + 1}</TableHead>
              ))}
              <TableHead className="text-center min-w-[120px]">Your Brand</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(contentImpact).map(([platform, data]) => (
              <TableRow key={platform}>
                <TableCell className="font-medium">{platform}</TableCell>
                {data.brands.map((brand, index) => (
                  <TableCell key={index} className="text-center">
                    <div className="space-y-1">
                      <div className="font-semibold">{brand.brand}</div>
                      <div className="text-xs text-muted-foreground">
                        Mentions: {brand.mentions.Value}
                      </div>
                      <div className="text-xs text-primary font-medium">
                        Visibility: {brand.visibility.Value}
                      </div>
                    </div>
                  </TableCell>
                ))}
                {Array.from({ length: maxBrands - data.brands.length }, (_, i) => (
                  <TableCell key={`empty-${i}`} className="text-center text-muted-foreground">-</TableCell>
                ))}
                <TableCell className="text-center">
                  <div className="bg-primary/5 rounded p-2 space-y-1">
                    <div className="font-bold text-primary">{data.our_brand.brand}</div>
                    <div className="text-xs text-muted-foreground">
                      Mentions: {data.our_brand.mentions.Value}
                    </div>
                    <div className="text-xs text-primary font-medium">
                      Visibility: {data.our_brand.visibility.Value}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};