const ANALYTICS_STORAGE_KEY_PREFIX = 'geo_analytics_data';
let currentAnalyticsData: any = null;
let currentUserEmail: string | null = null;

// Get storage key for specific user email
const getStorageKey = (email?: string): string => {
  const userEmail = email || currentUserEmail || localStorage.getItem('user_email') || '';
  if (userEmail) {
    return `${ANALYTICS_STORAGE_KEY_PREFIX}_${userEmail.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  }
  return ANALYTICS_STORAGE_KEY_PREFIX;
};

// Get current user email
export const getCurrentUserEmail = (): string | null => {
  return currentUserEmail || localStorage.getItem('user_email');
};

// Set current user email (call this on login)
export const setCurrentUserEmail = (email: string) => {
  currentUserEmail = email;
  localStorage.setItem('user_email', email);
  // Clear current data so it reloads for this user
  currentAnalyticsData = null;
  console.log('👤 [ANALYTICS] User email set:', email);
};

// Clear user email (call on logout)
export const clearCurrentUserEmail = () => {
  currentUserEmail = null;
  currentAnalyticsData = null;
  // Note: We don't remove user_email from localStorage to preserve it
  console.log('👤 [ANALYTICS] User email cleared from memory');
};

// Format logo URL using Google Favicon service
export const formatLogoUrl = (domain: string): string => {
  if (!domain) return '';
  // Remove protocol and www if present, keep only domain
  const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  // Build full URL for Google favicon service
  const fullUrl = `https://${cleanDomain}`;
  const template = import.meta.env.VITE_FAVICON_URL_TEMPLATE || 'https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url={domain}&size=64';
  return template.replace('{domain}', fullUrl);
};

// Load analytics from localStorage for current user
export const loadAnalyticsFromStorage = (): boolean => {
  try {
    const storageKey = getStorageKey();
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      currentAnalyticsData = JSON.parse(stored);
      console.log('📦 [ANALYTICS] Data loaded from localStorage for key:', storageKey);
      return true;
    }
    // Also try legacy key for backwards compatibility
    const legacyStored = localStorage.getItem(ANALYTICS_STORAGE_KEY_PREFIX);
    if (legacyStored) {
      currentAnalyticsData = JSON.parse(legacyStored);
      console.log('📦 [ANALYTICS] Data loaded from legacy localStorage key');
      return true;
    }
  } catch (e) {
    console.error('Failed to load analytics from localStorage:', e);
  }
  return false;
};

// Check if analytics data is available
export const hasAnalyticsData = (): boolean => {
  if (!currentAnalyticsData) {
    loadAnalyticsFromStorage();
  }
  return !!(currentAnalyticsData?.analytics?.[0]?.analytics);
};

// Get the full analytics object
export const getAnalytics = (): any => {
  if (!currentAnalyticsData) {
    loadAnalyticsFromStorage();
  }
  return currentAnalyticsData?.analytics?.[0]?.analytics || null;
};

// Get brand name
export const getBrandName = (): string => {
  const analytics = getAnalytics();
  return analytics?.brand_name || '';
};

// Get brand website
export const getBrandWebsite = (): string => {
  const analytics = getAnalytics();
  return analytics?.brand_website || '';
};

// Get model name
export const getModelName = (): string => {
  const analytics = getAnalytics();
  return analytics?.models_used || '';
};

// Get analysis date
export const getAnalysisDate = (): string => {
  if (!currentAnalyticsData) {
    loadAnalyticsFromStorage();
  }
  const rawDate = currentAnalyticsData?.analytics?.[0]?.date;
  if (!rawDate) return '';
  
  try {
    const date = new Date(rawDate);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return rawDate;
  }
};

// Get analysis keywords
export const getAnalysisKeywords = (): string[] => {
  const analytics = getAnalytics();
  const searchKeywords = analytics?.search_keywords || {};
  return Object.values(searchKeywords).map((k: any) => k.name);
};

// Get keywords with details (returns string array for compatibility)
export const getKeywords = (): string[] => {
  return getAnalysisKeywords();
};

// Get search keywords with prompts
export const getSearchKeywordsWithPrompts = (): Array<{ id: string; name: string; prompts: string[] }> => {
  const analytics = getAnalytics();
  const searchKeywords = analytics?.search_keywords || {};
  return Object.entries(searchKeywords).map(([id, data]: [string, any]) => ({
    id,
    name: data.name || '',
    prompts: data.prompts || []
  }));
};

// Get search keywords (simple list)
export const getSearchKeywords = (): string[] => {
  return getAnalysisKeywords();
};

// Get LLM data
export const getLlmData = (): Record<string, any> => {
  const analytics = getAnalytics();
  return analytics?.llm_wise_data || {};
};

// Get executive summary
export const getExecutiveSummary = (): any => {
  const analytics = getAnalytics();
  return analytics?.executive_summary || {
    brand_score_and_tier: '',
    strengths: [],
    weaknesses: [],
    competitor_positioning: { leaders: [], mid_tier: [], laggards: [] },
    prioritized_actions: [],
    conclusion: ''
  };
};

// Get recommendations
export const getRecommendations = (): Array<{
  overall_insight: string;
  suggested_action: string;
  overall_effort: string;
  impact: string;
}> => {
  const analytics = getAnalytics();
  return analytics?.recommendations || [];
};

// Get platform presence
export const getPlatformPresence = (): Record<string, string> => {
  const analytics = getAnalytics();
  return analytics?.platform_presence || {};
};

// Get sources data
export const getSourcesData = (): Record<string, any> => {
  const analytics = getAnalytics();
  return analytics?.sources_and_content_impact || {};
};

// Get depth notes from sources
export const getDepthNotes = (): Array<{ source: string; notes: string[] }> => {
  const sourcesData = getSourcesData();
  return Object.entries(sourcesData).map(([source, data]: [string, any]) => ({
    source,
    notes: data.pages_used || []
  }));
};

// Get brand websites map
export const getBrandWebsites = (): Record<string, string> => {
  const analytics = getAnalytics();
  return analytics?.brand_websites || {};
};

// Get product ID
export const getProductId = (): string => {
  if (!currentAnalyticsData) {
    loadAnalyticsFromStorage();
  }
  return currentAnalyticsData?.product_id || '';
};

// ============ CORE DATA FUNCTION - MUST BE DEFINED BEFORE DEPENDENT FUNCTIONS ============

// Get brand info with logos - REVERSED ORDER for correct ranking
export const getBrandInfoWithLogos = (): Array<{
  brand: string;
  geo_score: number;
  mention_score: number;
  mention_count: number;
  logo: string;
  geo_tier: string;
  mention_tier: string;
  summary: string;
  outlook: string;
  mention_breakdown: Record<string, number> | null;
}> => {
  const analytics = getAnalytics();
  
  // Early return with empty array if no analytics
  if (!analytics) {
    return [];
  }
  
  const brands = analytics?.brands;
  
  // Only warn once per session about missing brands array
  if (!brands || !Array.isArray(brands)) {
    const hasWarned = sessionStorage.getItem('analytics_brands_warning');
    if (!hasWarned) {
      console.warn('⚠️ [ANALYTICS] No brands array found in analytics data');
      sessionStorage.setItem('analytics_brands_warning', 'true');
    }
    return [];
  }
  
  // CRITICAL FIX: Reverse the brands array to get descending order (highest score first)
  // The API returns brands in ascending order by score, so we reverse it
  const reversedBrands = [...brands].reverse();
  
  // Map the data to ensure consistent field names and format logos
  return reversedBrands.map((brand: any) => ({
    brand: brand.brand,
    geo_score: brand.geo_score || 0,
    mention_score: brand.mention_score || 0,
    mention_count: brand.mention_count || 0,
    logo: formatLogoUrl(brand.logo || ''),
    geo_tier: brand.geo_tier || 'Low',
    mention_tier: brand.mention_tier || 'Low',
    summary: brand.summary || '',
    outlook: brand.outlook || 'Neutral',
    mention_breakdown: brand.mention_breakdown || null
  }));
};

// ============ DEPENDENT FUNCTIONS - USE getBrandInfoWithLogos ============

// Get brand logo - accepts optional brand name parameter
export const getBrandLogo = (brandName?: string): string => {
  if (brandName) {
    // Get logo for specific brand from brandInfoWithLogos
    const brandInfo = getBrandInfoWithLogos();
    const brand = brandInfo.find(b => b.brand === brandName);
    if (brand?.logo) return brand.logo;
    
    // Fallback to brand_websites mapping
    const analytics = getAnalytics();
    const brandWebsites = analytics?.brand_websites || {};
    const website = brandWebsites[brandName];
    if (website) {
      return formatLogoUrl(website);
    }
  }
  
  // Default: get primary brand logo
  const brandWebsite = getBrandWebsite();
  if (!brandWebsite) return '';
  return formatLogoUrl(brandWebsite);
};

// Get AI visibility metrics - Now uses already-reversed order from getBrandInfoWithLogos
export const getAIVisibilityMetrics = (): {
  score: number;
  tier: string;
  brandPosition: number;
  totalBrands: number;
  positionBreakdown: { topPosition: number; midPosition: number; lowPosition: number };
} => {
  const brandInfoWithLogos = getBrandInfoWithLogos();
  const brandName = getBrandName();
  const llmData = getLlmData();
  
  if (!brandInfoWithLogos.length || !brandName) {
    return {
      score: 0,
      tier: 'Low',
      brandPosition: 0,
      totalBrands: 0,
      positionBreakdown: { topPosition: 0, midPosition: 0, lowPosition: 0 }
    };
  }
  
  const brandInfo = brandInfoWithLogos.find(b => b.brand === brandName);
  
  // SIMPLIFIED: The array is already sorted in descending order (highest score first)
  // No need to sort again - just find the index
  const brandIndex = brandInfoWithLogos.findIndex(b => b.brand === brandName);
  
  // Calculate aggregated position breakdown from llm_wise_data
  // Sum t1, t2, t3 across all LLMs and average them
  let totalT1 = 0;
  let totalT2 = 0;
  let totalT3 = 0;
  let llmCount = 0;
  
  Object.values(llmData).forEach((llm: any) => {
    if (llm && typeof llm === 'object') {
      totalT1 += llm.t1 || 0;
      totalT2 += llm.t2 || 0;
      totalT3 += llm.t3 || 0;
      llmCount++;
    }
  });
  
  // Calculate averages
  const topPosition = llmCount > 0 ? Math.round(totalT1 / llmCount) : 0;
  const midPosition = llmCount > 0 ? Math.round(totalT2 / llmCount) : 0;
  const lowPosition = llmCount > 0 ? Math.round(totalT3 / llmCount) : 0;
  
  return {
    score: brandInfo?.geo_score || 0,
    tier: brandInfo?.geo_tier || 'Low',
    brandPosition: brandIndex + 1,
    totalBrands: brandInfoWithLogos.length,
    positionBreakdown: { topPosition, midPosition, lowPosition }
  };
};

// Get competitor data with expected shape (name, keywordScores, etc.)
export const getCompetitorData = (): Array<{
  name: string;
  brand: string;
  geo_score: number;
  mention_score: number;
  logo: string;
  keywordScores: number[];
}> => {
  const brandInfoWithLogos = getBrandInfoWithLogos();
  const analytics = getAnalytics();
  const searchKeywords = analytics?.search_keywords || {};
  const keywordIds = Object.keys(searchKeywords);
  
  return brandInfoWithLogos.map(b => {
    // Build keyword scores array from mention_breakdown
    const keywordScores = keywordIds.map(keyId => {
      return b.mention_breakdown?.[keyId] || 0;
    });
    
    return {
      name: b.brand,
      brand: b.brand,
      geo_score: b.geo_score,
      mention_score: b.mention_score,
      logo: b.logo,
      keywordScores
    };
  });
};

// Legacy competitor data export - use as a getter function, NOT a constant
// Components should use getCompetitorData() instead
export const competitorData = {
  get data() {
    return getCompetitorData();
  }
};

// Get competitor names
export const getCompetitorNames = (): string[] => {
  const brandInfoWithLogos = getBrandInfoWithLogos();
  const brandName = getBrandName();
  return brandInfoWithLogos
    .filter(b => b.brand !== brandName)
    .map(b => b.brand);
};

// Get competitor visibility with expected shape (name, visibility, totalScore)
export const getCompetitorVisibility = (): Array<{
  name: string;
  brand: string;
  score: number;
  tier: string;
  logo: string;
  visibility: number;
  totalScore: number;
}> => {
  const brandInfoWithLogos = getBrandInfoWithLogos();
  
  // Calculate max mention score for visibility percentage
  const maxMentionScore = Math.max(...brandInfoWithLogos.map(b => b.mention_score), 1);
  
  return brandInfoWithLogos.map(b => ({
    name: b.brand,
    brand: b.brand,
    score: b.geo_score,
    tier: b.geo_tier,
    logo: b.logo,
    visibility: Math.round((b.mention_score / maxMentionScore) * 100),
    totalScore: b.mention_score
  }));
};

// Get competitor sentiment with expected shape (outlook)
export const getCompetitorSentiment = (): Array<{
  brand: string;
  name: string;
  sentiment: string;
  outlook: string;
  summary: string;
  logo: string;
}> => {
  const brandInfoWithLogos = getBrandInfoWithLogos();
  return brandInfoWithLogos.map(b => ({
    brand: b.brand,
    name: b.brand,
    sentiment: b.outlook,
    outlook: b.outlook,
    summary: b.summary,
    logo: b.logo
  }));
};

// Get mentions position - Now uses already-reversed order from getBrandInfoWithLogos
export const getMentionsPosition = (): { 
  position: number; 
  tier: string; 
  totalBrands: number;
  topBrandMentions: number;
  brandMentions: number;
  allBrandMentions: Record<string, number>;
} => {
  const brandName = getBrandName();
  const brandInfoWithLogos = getBrandInfoWithLogos();
  
  // Safety check - return default values if no data
  if (!brandInfoWithLogos.length || !brandName) {
    return {
      position: 0,
      tier: 'Low',
      totalBrands: 0,
      topBrandMentions: 0,
      brandMentions: 0,
      allBrandMentions: {}
    };
  }
  
  // Use mention_score for all calculations
  const allMentionScores: Record<string, number> = {};
  brandInfoWithLogos.forEach(b => {
    allMentionScores[b.brand] = b.mention_score;
  });
  
  // SIMPLIFIED: The array is already sorted by scores, but we need to sort by mention_score specifically
  // Sort by mention_score descending, then alphabetically as tiebreaker
  const sortedByMentions = [...brandInfoWithLogos].sort((a, b) => {
    if (b.mention_score !== a.mention_score) {
      return b.mention_score - a.mention_score;
    }
    return a.brand.localeCompare(b.brand);
  });
  
  const brandIndex = sortedByMentions.findIndex(b => b.brand === brandName);
  const position = brandIndex >= 0 ? brandIndex + 1 : sortedByMentions.length;
  
  const brandInfo = brandInfoWithLogos.find(b => b.brand === brandName);
  const brandMentionScore = brandInfo?.mention_score || 0;
  const topMentionScore = sortedByMentions[0]?.mention_score || 0;
  
  const tier = brandInfo?.mention_tier || 'Low';
  
  return {
    position,
    tier,
    totalBrands: brandInfoWithLogos.length,
    topBrandMentions: topMentionScore,
    brandMentions: brandMentionScore,
    allBrandMentions: allMentionScores
  };
};

// Get brand mention response rates - Now uses already-reversed order
export const getBrandMentionResponseRates = (): Array<{
  brand: string;
  responseRate: number;
  logo: string;
  isTestBrand: boolean;
}> => {
  const brandName = getBrandName();
  const brandInfoWithLogos = getBrandInfoWithLogos();
  
  // Safety check
  if (!brandInfoWithLogos.length || !brandName) {
    return [];
  }
  
  // Map all brands with their mention_score
  const allBrandsWithRates = brandInfoWithLogos.map(b => ({
    brand: b.brand,
    responseRate: b.mention_score,
    logo: b.logo,
    isTestBrand: b.brand === brandName
  }));
  
  // Sort all brands by mention_score descending, then alphabetically
  const sortedBrands = [...allBrandsWithRates].sort((a, b) => {
    if (b.responseRate !== a.responseRate) {
      return b.responseRate - a.responseRate;
    }
    return a.brand.localeCompare(b.brand);
  });
  
  // Get top 2 competitors (non-test brands with highest scores)
  const topTwoCompetitors = sortedBrands.filter(b => !b.isTestBrand).slice(0, 2);
  
  // Get the test brand
  const testBrand = sortedBrands.find(b => b.isTestBrand);
  
  // Combine all three brands
  const combinedBrands = [...topTwoCompetitors];
  if (testBrand) {
    combinedBrands.push(testBrand);
  }
  
  // Sort the final result by responseRate descending, then alphabetically
  return combinedBrands.sort((a, b) => {
    if (b.responseRate !== a.responseRate) {
      return b.responseRate - a.responseRate;
    }
    return a.brand.localeCompare(b.brand);
  });
};

// Get sentiment with safety check
export const getSentiment = () => {
  const brandName = getBrandName();
  const brandInfoWithLogos = getBrandInfoWithLogos();
  
  // Safety check
  if (!brandInfoWithLogos.length || !brandName) {
    return { 
      dominant_sentiment: 'N/A', 
      summary: 'No sentiment data available' 
    };
  }
  
  const brandInfo = brandInfoWithLogos.find(b => b.brand === brandName);
  
  return { 
    dominant_sentiment: brandInfo?.outlook || 'N/A', 
    summary: brandInfo?.summary || 'No sentiment data available' 
  };
};

// Set analytics data with proper cache management
export const setAnalyticsData = (apiResponse: any) => {
  if (apiResponse && apiResponse.analytics && Array.isArray(apiResponse.analytics)) {
    const mostRecent = apiResponse.analytics?.[0];
    const storageKey = getStorageKey();
    const signature = JSON.stringify({
      product_id: apiResponse.product_id || mostRecent?.product_id,
      id: mostRecent?.id,
      date: mostRecent?.date,
      updated_at: mostRecent?.updated_at,
      status: mostRecent?.status,
    });

    const existingSig = localStorage.getItem(`${storageKey}__sig`);
    
    // CRITICAL FIX: Always update in-memory cache FIRST
    currentAnalyticsData = apiResponse;
    
    // Only skip localStorage update if signature is identical
    if (existingSig === signature) {
      console.log('📦 [ANALYTICS] Data signature unchanged, using new in-memory data');
      return;
    }
    
    // Clear the warning flag when new data arrives
    sessionStorage.removeItem('analytics_brands_warning');
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(apiResponse));
      localStorage.setItem(`${storageKey}__sig`, signature);
      console.log('📦 [ANALYTICS] New data stored in localStorage for key:', storageKey);
    } catch (e) {
      console.error('Failed to store analytics data in localStorage:', e);
    }
  } else {
    console.error('Invalid analytics data format');
  }
};

// Clear analytics data for current user
export const clearAnalyticsData = () => {
  const storageKey = getStorageKey();
  currentAnalyticsData = null;
  localStorage.removeItem(storageKey);
  localStorage.removeItem(`${storageKey}__sig`);
  sessionStorage.removeItem('analytics_brands_warning');
  console.log('📦 [ANALYTICS] Cached data cleared for key:', storageKey);
};

// Force refresh analytics data (bypasses cache)
export const forceRefreshAnalytics = () => {
  clearAnalyticsData();
  console.log('🔄 [ANALYTICS] Cache cleared - next data fetch will be fresh');
};

// Get sources data formatted for the comparison table
export const getSourcesDataForTable = (): Array<{
  name: string;
  [key: string]: any; // brand mentions will be added dynamically
}> => {
  const sourcesData = getSourcesData();
  const allBrands = getBrandInfoWithLogos().map(b => b.brand);
  
  if (!sourcesData || typeof sourcesData !== 'object') {
    return [];
  }

  // Convert sources object to array format
  return Object.entries(sourcesData).map(([sourceName, sourceData]: [string, any]) => {
    const row: any = { name: sourceName };
    
    // Extract mentions for each brand from the nested mentions object
    if (sourceData && sourceData.mentions && typeof sourceData.mentions === 'object') {
      allBrands.forEach(brand => {
        const brandMentionData = sourceData.mentions[brand];
        // Get the count from the brand's mention data
        row[`${brand}Mentions`] = brandMentionData?.count || 0;
      });
    } else {
      // If no mentions data, set all brands to 0
      allBrands.forEach(brand => {
        row[`${brand}Mentions`] = 0;
      });
    }
    
    return row;
  });
};