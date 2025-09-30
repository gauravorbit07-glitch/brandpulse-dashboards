import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Star, Target } from "lucide-react";

interface CompetitorAnalysisProps {
  analysis: {
    competitor_visibility_table?: {
      header: string[];
      rows: Array<Array<string | number>>;
    };
    competitor_sentiment_table?: {
      header: string[];
      rows: Array<Array<string>>;
    };
  };
}

const getSentimentColor = (sentiment: string) => {
  switch (sentiment.toLowerCase()) {
    case 'positive':
      return 'bg-positive text-positive-foreground';
    case 'negative':
      return 'bg-negative text-negative-foreground';
    case 'neutral':
      return 'bg-warning text-warning-foreground';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
};

const getPositionColor = (position: number) => {
  if (position === 1) return 'text-yellow-600';
  if (position === 2) return 'text-gray-500';
  if (position === 3) return 'text-orange-600';
  return 'text-muted-foreground';
};

const getPositionIcon = (position: number) => {
  if (position === 1) return <Trophy className="h-4 w-4" />;
  if (position === 2) return <Star className="h-4 w-4" />;
  if (position === 3) return <Target className="h-4 w-4" />;
  return null;
};

export const CompetitorAnalysis = ({ analysis }: CompetitorAnalysisProps) => {
  if (!analysis.competitor_visibility_table && !analysis.competitor_sentiment_table) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Competitor Analysis</h2>
      
      {/* Competitor Visibility by Keyword */}
      {analysis.competitor_visibility_table && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Competitor Visibility by Keyword</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {analysis.competitor_visibility_table.header.map((header, index) => (
                    <TableHead key={index} className={index === 0 ? "font-semibold" : "text-center"}>
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysis.competitor_visibility_table.rows.map((row, rowIndex) => {
                  const isKommunicate = row[0] === 'Kommunicate';
                  return (
                    <TableRow key={rowIndex} className={isKommunicate ? 'bg-primary/5' : ''}>
                      <TableCell className={`font-medium ${isKommunicate ? 'text-primary font-bold' : ''}`}>
                        {row[0]}
                      </TableCell>
                      {row.slice(1).map((cell, cellIndex) => (
                        <TableCell key={cellIndex} className="text-center">
                          <span className={isKommunicate ? 'font-semibold text-primary' : ''}>
                            {cell}
                          </span>
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Competitor Sentiment Analysis */}
      {analysis.competitor_sentiment_table && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Competitor Sentiment Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.competitor_sentiment_table.rows.map((row, index) => {
                const [brand, summary, sentiment] = row;
                const isKommunicate = brand === 'Kommunicate';
                return (
                  <Card key={index} className={`border-2 ${isKommunicate ? 'border-primary shadow-primary/20 shadow-lg' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className={`text-base ${isKommunicate ? 'text-primary' : ''}`}>
                          {brand}
                          {isKommunicate && (
                            <Badge variant="outline" className="ml-2 text-xs">Your Brand</Badge>
                          )}
                        </CardTitle>
                        <Badge className={getSentimentColor(sentiment)} variant="secondary">
                          {sentiment}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{summary}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};