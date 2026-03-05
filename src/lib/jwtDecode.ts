import { jwtDecode } from "jwt-decode";
import { getPricingPlanName, getRoleName } from "./plans";

export interface JWTPayload {
  sub: string;           // user_id
  email: string;
  first_name?: string;
  last_name?: string;
  role: number;          // int role level
  pricing_plan: number;  // int pricing plan
  plan_expires_at?: number | null; // unix timestamp
  application_id?: string;
  session_id?: string;
  exp: number;
  iat: number;
}

export interface DecodedTokenInfo {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  roleInt: number;
  roleName: string;
  planInt: number;
  planName: string;
  planExpiresAt: number | null;
  applicationId: string;
  sessionId: string;
  expiresAt: number;
}

export const decodeAccessToken = (token: string): DecodedTokenInfo | null => {
  try {
    const payload = jwtDecode<JWTPayload>(token);
    
    return {
      userId: payload.sub || "",
      email: payload.email || "",
      firstName: payload.first_name || "",
      lastName: payload.last_name || "",
      roleInt: payload.role ?? 4, // default to viewer
      roleName: getRoleName(payload.role ?? 4),
      planInt: payload.pricing_plan ?? 0,
      planName: getPricingPlanName(payload.pricing_plan ?? 0),
      planExpiresAt: payload.plan_expires_at || null,
      applicationId: payload.application_id || "",
      sessionId: payload.session_id || "",
      expiresAt: payload.exp || 0,
    };
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
};
