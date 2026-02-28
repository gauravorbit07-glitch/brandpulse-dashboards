import React, { createContext, useContext, useState, useEffect } from "react";
import {
  login as loginAPI,
  register as registerAPI,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/apiHelpers";
import { setCurrentUserId, clearCurrentUserId } from "@/results/data/analyticsData";
import { setAnalysisUserId, clearAnalysisUserId } from "@/hooks/useAnalysisState";
import { STORAGE_KEYS, getUserScopedKey } from "@/lib/storageKeys";
import {
  getSecureAccessToken,
  getSecureSessionId,
  getSecureApplicationId,
  getSecureFirstName,
  setSecureUserId,
  setSecureFirstName,
  setSecureApplicationId,
  getSecureUserId,
  clearSecureAuthStorage,
  setSecureApplications,
  getSecureApplications,
  setSecureProducts,
  getSecureProducts,
  clearAllSecureData,
} from "@/lib/secureStorage";

/* =====================
   TYPES
   ===================== */
interface Product {
  id: string;
  name: string;
  description: string;
  website: string;
  business_domain: string;
  application_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface Application {
  id: string;
  user_id: string;
  company_name: string;
  project_token: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  products?: Product[];
}

interface ExtendedUser extends NonNullable<LoginResponse["user"]> {
  owned_applications?: { id: string; company_name: string; project_token: string }[];
}

interface AuthContextType {
  user: ExtendedUser | null;
  applicationId: string | null;
  applications: Application[];
  products: Product[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean | 'email_not_verified'>;
  register: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* =====================
   PROVIDER
   ===================== */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /* Restore state from localStorage on refresh */
  useEffect(() => {
    const storedAppId = getSecureApplicationId();
    const storedToken = getSecureAccessToken();
    const storedSessionId = getSecureSessionId();
    const storedFirstName = getSecureFirstName();
    const storedApplications = getSecureApplications();
    const storedProducts = getSecureProducts();
    
    if (storedAppId) {
      setApplicationId(storedAppId);
    }
    
    if (storedApplications.length > 0) {
      setApplications(storedApplications);
    }
    
    if (storedProducts.length > 0) {
      setProducts(storedProducts);
    }
    
    // If we have a token and session ID, restore user state (user is logged in)
    if (storedToken && storedSessionId) {
      const storedUserId = getSecureUserId() || "restored";
      setUser({ 
        id: storedUserId, 
        email: "user@restored.com", 
        first_name: storedFirstName || "User", 
        last_name: "User" 
      });
      
      // Restore user ID scoping
      if (storedUserId && storedUserId !== "restored") {
        setCurrentUserId(storedUserId);
        setAnalysisUserId(storedUserId);
      }
    }
  }, []);

  /* =====================
     LOGIN
     ===================== */
  const login = async (email: string, password: string): Promise<boolean | 'email_not_verified'> => {
    setIsLoading(true);
    try {
      const res = await loginAPI({ email, password });

      // Check if email is not verified
      if (!res.access_token || res.access_token.trim() === "") {
        return 'email_not_verified';
      }

      // We have a valid response with access_token
      if (res.user) {
        const extendedUser = res.user as ExtendedUser;
        setUser(extendedUser);

        const userId = extendedUser.id || "";

        // Set user ID for analytics data mapping and analysis state scoping
        setCurrentUserId(userId);
        setAnalysisUserId(userId);

        // Save user ID and first name securely
        setSecureUserId(userId);
        setSecureFirstName(extendedUser.first_name);

        // Store applications and products from response
        const appsFromResponse = (res as any).applications || [];
        setApplications(appsFromResponse);
        setSecureApplications(appsFromResponse);

        // Extract products from applications
        const allProducts: Product[] = [];
        appsFromResponse.forEach((app: Application) => {
          if (app.products && app.products.length > 0) {
            allProducts.push(...app.products);
          }
        });
        setProducts(allProducts);
        setSecureProducts(allProducts);

        // Set first_analysis flag: "1" if no products exist yet (first time user)
        const firstAnalysisKey = getUserScopedKey(STORAGE_KEYS.FIRST_ANALYSIS, userId);
        const existingFlag = localStorage.getItem(firstAnalysisKey);
        if (existingFlag === null) {
          // First time seeing this user — check if they already have products
          const isFirstAnalysis = allProducts.length === 0 ? "1" : "1";
          // Always set to "1" on first encounter; it becomes "0" when View Dashboard is clicked
          localStorage.setItem(firstAnalysisKey, isFirstAnalysis);
          console.log(`🏁 [AUTH] First analysis flag set to ${isFirstAnalysis} for user ${userId}`);
        }

        // Pick applicationId from response
        let appId: string | null = null;
        if (extendedUser.owned_applications?.length) {
          appId = extendedUser.owned_applications[0].id;
        } else if ((res as any).application?.id) {
          appId = (res as any).application.id;
        } else if (appsFromResponse.length > 0) {
          appId = appsFromResponse[0].id;
        }

        if (appId) {
          setApplicationId(appId);
          setSecureApplicationId(appId);
        }

        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Auth context: Login error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /* =====================
     REGISTER (auto-login after success)
     ===================== */
  const register = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    setIsLoading(true);
    try {
      // Split full name on first space
      const parts = fullName.trim().split(' ');
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ') || ' ';

      const payload: RegisterRequest = {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        app_name: "My App",
      };

      const response: RegisterResponse = await registerAPI(payload);

      if (response.application?.id) {
        setApplicationId(response.application.id);
        setSecureApplicationId(response.application.id);
      }

      // Save first name securely
      setSecureFirstName(firstName);
          } finally {
      setIsLoading(false);
    }
  };

  /* =====================
     LOGOUT - Clear session data but preserve analytics
     ===================== */
  const logout = () => {
    // Clear user ID references (but keep user-scoped data)
    clearAnalysisUserId();
    clearCurrentUserId();

    // Clear ALL secure storage (token, identity, product, keywords, applications, products)
    clearAllSecureData();
    
    // Clear only non-critical session-related items, NOT analytics data or analysis state
    const sessionItems = [
      'refresh_token',
      'pending_verification_email',
      // legacy cleanup (migrated to secure storage)
      'access_token',
      'session_id',
      'application_id',
      'first_name',
      'user_id',
      'product_id',
      'keywords',
      'keyword_count',
      'applications',
      'products',
    ];
    
    sessionItems.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
    });
    
    // Reset state
    setUser(null);
    setApplicationId(null);
    setApplications([]);
    setProducts([]);
  };

  return (
    <AuthContext.Provider
      value={{ user, applicationId, applications, products, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* =====================
   HOOK
   ===================== */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
