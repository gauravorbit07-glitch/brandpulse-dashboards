import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { Layout } from "@/components/Layout";
import BrandDashboard from "@/components/BrandDashboard";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { getProductAnalytics } from "@/apiHelpers";

interface InputStateAny {
  product?: { id: string; name?: string; website?: string };
  id?: string;
  productId?: string;
  website?: string;
  search_keywords?: Array<{ id?: string; keyword: string }>;
  keywords?: string[];
  analytics?: any;
}

// New interface for the API response structure
interface AnalyticsResponse {
  analytics: AnalyticsData[];
  count: number;
  limit: number;
  product_id: string;
}

// Updated AnalyticsData interface to match new nested structure
interface AnalyticsData {
  id?: string;
  product_id?: string;
  product_name?: string;
  date?: string;
  status?: string;
  analytics?: {
    id?: string;
    type?: string;
    status?: string;
    brand_name?: string;
    brand_website?: string;
    analysis?: {
      overall_insights?: {
        ai_visibility?: {
          tier?: string;
          ai_visibility_score?: { Value: number };
          geo_score?: { Value: number };
          weighted_mentions_total?: { Value: number };
          distinct_queries_count?: { Value: number };
          calculation_breakdown?: Array<{
            query: string;
            weighted_points_for_brand: { Value: number };
            explanation: string;
          }>;
        };
        brand_mentions?: {
          level?: string;
          mentions_count?: { Value: number };
          total_sources_checked?: { Value: number };
        };
        dominant_sentiment?: {
          sentiment?: string;
          statement?: string;
        };
        summary?: string;
      };
      source_analysis?: Array<{
        category: string;
        sources: string[];
        total_citations: { Value: number };
        visibility: string;
        cited_by_models: string[];
        notes: string;
      }>;
      competitor_analysis?: {
        dimensions?: Array<{
          dimension: string;
          top_3_competitors: string[];
          our_brand_position: { Value: number };
          our_brand_sentiment: string;
          evidence_snippet: string;
        }>;
        table_1_by_dimension?: Array<{
          dimension: string;
          top_5_competitors: Array<{
            brand: string;
            visibility_count: { Value: number };
          }>;
          our_brand_position: { Value: number };
          our_brand_visibility_count: { Value: number };
        }>;
        table_2_brand_profiles?: Array<{
          brand_name: string;
          ai_description: string;
          ai_sentiment: string;
          sources: string[];
          evidence_snippets: string[];
        }>;
      };
      content_impact?: {
        [key: string]: {
          top_3_brands?: Array<{
            brand: string;
            position: { Value: number };
            visibility: { Value: number };
          }>;
          our_brand_position?: {
            brand: string;
            position: { Value: number };
            visibility: { Value: number };
          };
        };
      };
      recommendations?: Array<{
        category: string;
        action: string;
        timeframe: string;
        rationale: string;
        expected_impact: string;
        effort: string;
      }>;
    };
    raw_model_outputs_mapped?: Array<{
      query: string;
      snippet: string;
      mention_positions: Array<{
        brand: string;
        first_position_index: { Value: number };
      }>;
      sources_mentioned: string[];
    }>;
  };
  created_at?: string;
  updated_at?: string;
}

interface ResultsData {
  website: string;
  product: { id: string; name?: string };
  search_keywords: Array<{ id?: string; keyword: string }>;
}

export default function Results() {
  const [resultsData, setResultsData] = useState<ResultsData | null>(null);
  const [analyticsResponse, setAnalyticsResponse] = useState<AnalyticsResponse | null>(null);
  const [currentAnalytics, setCurrentAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { user } = useAuth();
  const accessToken = localStorage.getItem("access_token") || "";
  const navigate = useNavigate();
  const location = useLocation();
  const pollingRef = useRef<{ productTimer?: number }>({});
  const mountedRef = useRef(true);

  const getCleanDomainName = (url?: string) => {
    if (!url) return "";
    try {
      const cleanUrl = url.replace(/^https?:\/\//, "");
      const withoutWww = cleanUrl.replace(/^www\./, "");
      const domain = withoutWww.split('/')[0];
      return domain;
    } catch {
      return url;
    }
  };

  // Parse and normalize location.state
  useEffect(() => {
    mountedRef.current = true;
    const state = (location.state || {}) as InputStateAny;

    if (state && state.product?.id) {
      const normalized: ResultsData = {
        website:
          (state.website ||
            state.product.website ||
            state.product.name ||
            "") + "",
        product: {
          id: state.product.id,
          name: state.product.name || state.product.website || state.product.id,
        },
        search_keywords: (state.search_keywords || []).map((k) => ({
          id: k.id,
          keyword: k.keyword,
        })),
      };
      setResultsData(normalized);
    } else if ((state as any).productId || (state as any).id) {
      const pid = (state as any).productId || (state as any).id;
      const normalized: ResultsData = {
        website: state.website || "",
        product: { id: pid.toString(), name: state.website || pid.toString() },
        search_keywords: Array.isArray(state.search_keywords)
          ? state.search_keywords.map((k) => ({ id: k.id, keyword: k.keyword }))
          : (state.keywords || []).map((k: string) => ({ keyword: k })),
      };
      setResultsData(normalized);
    } else {
      navigate("/input");
    }

    return () => {
      mountedRef.current = false;
    };
  }, [location.state, navigate]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (pollingRef.current.productTimer) {
        clearTimeout(pollingRef.current.productTimer);
      }
    };
  }, []);

  // Poll product analytics function
  const pollProductAnalytics = useCallback(
    async (productId: string) => {
      if (!productId || !accessToken || !mountedRef.current) return;
      try {
        setIsLoading(true);
        const today = new Date().toISOString().split("T")[0];
        const res = await getProductAnalytics(productId, today, accessToken);
        if (!mountedRef.current) return;

        if (res) {
          setAnalyticsResponse(res);
          if (res.analytics && res.analytics.length > 0) {
            setCurrentAnalytics(res.analytics[0]);
          }
        }

        const status = res?.analytics?.[0]?.status?.toLowerCase() || "";
        if (status !== "completed") {
          if (pollingRef.current.productTimer) {
            clearTimeout(pollingRef.current.productTimer);
          }
          pollingRef.current.productTimer = window.setTimeout(() => {
            pollProductAnalytics(productId);
          }, 5000);
        } else {
          console.log("Brand analysis completed");
          setIsLoading(false);
        }
      } catch (err) {
        toast.error("Failed to fetch analytics");
        setIsLoading(false);
      }
    },
    [accessToken]
  );

  useEffect(() => {
    if (resultsData?.product?.id) {
      if (pollingRef.current.productTimer) {
        clearTimeout(pollingRef.current.productTimer);
      }
      pollProductAnalytics(resultsData.product.id);
    }
  }, [resultsData, pollProductAnalytics]);

  // Loading state
  if (isLoading || !resultsData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4 animate-spin" />
              <h2 className="text-2xl font-bold mb-2">Analyzing...</h2>
              <p className="text-muted-foreground">
                Please wait while we prepare your results.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const overallStatus = currentAnalytics?.status || "pending";
  const analytics = currentAnalytics?.analytics;
  
  const websiteName = getCleanDomainName(
    analytics?.brand_name || 
    resultsData.website || 
    resultsData.product.name
  );

  // If analysis is not completed, show loading state
  if (overallStatus !== "completed") {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4 animate-spin" />
              <h2 className="text-2xl font-bold mb-2">Analysis in progress</h2>
              <p className="text-muted-foreground">
                We are gathering and analyzing AI answers — this usually takes a few seconds to a couple of minutes.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show the professional dashboard with Layout
  return (
    <Layout>
      <BrandDashboard 
        analyticsData={analytics?.analysis}
        brandName={analytics?.brand_name || websiteName}
        brandWebsite={analytics?.brand_website || resultsData.website}
        reportDate={currentAnalytics?.updated_at || currentAnalytics?.created_at}
      />
    </Layout>
  );
}