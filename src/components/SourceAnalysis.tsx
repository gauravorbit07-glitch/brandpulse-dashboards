import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Database, Users, FileText } from "lucide-react";

interface SourceAnalysisProps {
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
  brandName: string;
}

const getVisibilityColor = (visibility: string) => {
  switch (visibility.toLowerCase()) {
    case 'high':
      return 'bg-emerald-500 text-white';
    case 'medium':
      return 'bg-yellow-500 text-white';
    case 'low':
    case 'absent':
      return 'bg-red-500 text-white';
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

export const SourceAnalysis = ({ contentImpact, brandName }: SourceAnalysisProps) => {
  // Extract brand data from contentImpact
  const brandColumnIndex = contentImpact.header.findIndex(h => h === brandName);
  
  const sources = contentImpact.rows.map(row => {
    const sourceName = row[0] as string;
    const mentions = row[brandColumnIndex + 1] as number;
    const score = row[brandColumnIndex + 2] as string;
    
    // Get depth notes if available
    const depthNote = contentImpact.depth_notes?.[brandName]?.[sourceName];
    
    // Map source names to shorter versions for chart
    const getShortName = (name: string) => {
      const mapping: Record<string, string> = {
        'Analyst platforms': 'Analysts',
        'Review sites': 'Reviews',
        'Blogs': 'Blogs',
        'Communities': 'Communities',
        'Brand pages': 'Owned Content',
        'Tech news': 'News',
        'Social': 'Social',
        'Academic': 'Academic',
        'Podcasts': 'Podcasts',
        'Developer hubs': 'Dev Hubs',
        'Marketplaces': 'Marketplaces',
        'Events': 'Events',
        'Jobs': 'Jobs',
        'Aggregators': 'Aggregators',
        'Regional/local engines': 'Regional',
        'Integrations': 'Integrations'
      };
      return mapping[name] || name;
    };
    
    return {
      category: sourceName,
      shortCategory: getShortName(sourceName),
      mentions,
      score,
      insight: depthNote?.insight || '',
      pages_used: depthNote?.pages_used || []
    };
  });

  const chartData = sources.map(source => ({
    category: source.shortCategory,
    citations: source.mentions,
    visibility: source.score
  }));

  const getBarColor = (visibility: string) => {
    switch (visibility.toLowerCase()) {
      case 'high':
        return '#10b981';
      case 'medium':
        return '#eab308';
      case 'low':
      case 'absent':
        return '#ef4444';
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
          <CardTitle className="text-lg">Source Details for {brandName}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead className="text-center">Mentions</TableHead>
                <TableHead className="text-center">Tier</TableHead>
                <TableHead>Insights</TableHead>
                <TableHead>Pages Used</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((source, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {getCategoryIcon(source.category)}
                    {source.category}
                  </TableCell>
                  <TableCell className="text-center font-semibold">{source.mentions}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={getVisibilityColor(source.score)} variant="secondary">
                      {source.score}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{source.insight || 'No insights available'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {source.pages_used && source.pages_used.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {source.pages_used.map((page, idx) => (
                          <li key={idx}>{page}</li>
                        ))}
                      </ul>
                    ) : (
                      'No pages listed'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};