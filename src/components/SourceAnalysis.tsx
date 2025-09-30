import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Database, Users, FileText } from "lucide-react";

interface SourceAnalysisProps {
  sources: Array<{
    category: string;
    sources: string[];
    total_citations: { Value: number };
    visibility: string;
    cited_by_models: string[];
    notes: string;
    visibility_score: { Value: number };
  }>;
}

const getVisibilityColor = (visibility: string) => {
  switch (visibility.toLowerCase()) {
    case 'high':
      return 'bg-positive text-positive-foreground';
    case 'medium':
      return 'bg-warning text-warning-foreground';
    case 'low':
      return 'bg-negative text-negative-foreground';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'analyst platforms':
      return <Database className="h-5 w-5 text-primary" />;
    case 'review platforms':
      return <Users className="h-5 w-5 text-primary" />;
    case 'comparison blogs':
      return <FileText className="h-5 w-5 text-primary" />;
    default:
      return <FileText className="h-5 w-5 text-primary" />;
  }
};

export const SourceAnalysis = ({ sources }: SourceAnalysisProps) => {
  const chartData = sources.map(source => ({
    category: source.category,
    citations: source.total_citations.Value,
    visibility: source.visibility
  }));

  const getBarColor = (visibility: string) => {
    switch (visibility.toLowerCase()) {
      case 'high':
        return 'hsl(var(--positive))';
      case 'medium':
        return 'hsl(var(--warning))';
      case 'low':
        return 'hsl(var(--negative))';
      default:
        return 'hsl(var(--primary))';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Source Analysis</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Citation Distribution by Source Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="category" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickFormatter={(value) => value.split(' ')[0]}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }} 
              />
              <Bar 
                dataKey="citations" 
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.visibility)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Source Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead className="text-center">Mentions</TableHead>
                <TableHead className="text-center">Visibility Score</TableHead>
                <TableHead className="text-center">Tier</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((source, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {getCategoryIcon(source.category)}
                    {source.category}
                  </TableCell>
                  <TableCell className="text-center font-semibold">{source.total_citations.Value}</TableCell>
                  <TableCell className="text-center font-semibold text-primary">{source.visibility_score.Value}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={getVisibilityColor(source.visibility)} variant="secondary">
                      {source.visibility}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{source.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};