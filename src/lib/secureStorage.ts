import CryptoJS from "crypto-js";
import SecureStorage from "secure-web-storage";

const SECURE_STORAGE_SECRET =
  import.meta.env.VITE_SECURE_STORAGE_SECRET || "georankers-secure-storage-2026";

const createSecureStorage = (storage: Storage) =>
  new SecureStorage(storage, {
    hash: (key: string) => CryptoJS.SHA256(`${key}${SECURE_STORAGE_SECRET}`).toString(),
    encrypt: (value: string) =>
      CryptoJS.AES.encrypt(value, SECURE_STORAGE_SECRET).toString(),
    decrypt: (value: string) =>
      CryptoJS.AES.decrypt(value, SECURE_STORAGE_SECRET).toString(CryptoJS.enc.Utf8),
  });

const secureSessionStorage = createSecureStorage(sessionStorage);
const secureLocalStorage = createSecureStorage(localStorage);

const CRITICAL_LOCAL_KEYS = [
  "session_id",
  "user_id",
  "application_id",
  "first_name",
] as const;

const ACCESS_TOKEN_KEY = "access_token";

const migrateLegacyLocalToSecureLocal = (key: string): string | null => {
  const secureValue = secureLocalStorage.getItem(key);
  if (secureValue !== null && secureValue !== undefined && secureValue !== "") {
    return String(secureValue);
  }

  const legacyValue = localStorage.getItem(key);
  if (legacyValue !== null) {
    secureLocalStorage.setItem(key, legacyValue);
    localStorage.removeItem(key);
    return legacyValue;
  }

  return null;
};

const migrateLegacyLocalToSecureSession = (key: string): string | null => {
  const secureValue = secureSessionStorage.getItem(key);
  if (secureValue !== null && secureValue !== undefined && secureValue !== "") {
    return String(secureValue);
  }

  const legacyValue = localStorage.getItem(key);
  if (legacyValue !== null) {
    secureSessionStorage.setItem(key, legacyValue);
    localStorage.removeItem(key);
    return legacyValue;
  }

  return null;
};

export const setSecureAccessToken = (token: string) => {
  secureSessionStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const getSecureAccessToken = (): string => {
  return migrateLegacyLocalToSecureSession(ACCESS_TOKEN_KEY) || "";
};

export const clearSecureAccessToken = () => {
  secureSessionStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const setSecureSessionId = (sessionId: string) => {
  secureLocalStorage.setItem("session_id", sessionId);
};

export const getSecureSessionId = (): string => {
  return migrateLegacyLocalToSecureLocal("session_id") || "";
};

export const setSecureUserId = (userId: string) => {
  secureLocalStorage.setItem("user_id", userId);
};

export const getSecureUserId = (): string => {
  return migrateLegacyLocalToSecureLocal("user_id") || "";
};

export const setSecureApplicationId = (applicationId: string) => {
  secureLocalStorage.setItem("application_id", applicationId);
};

export const getSecureApplicationId = (): string => {
  return migrateLegacyLocalToSecureLocal("application_id") || "";
};

export const setSecureFirstName = (firstName: string) => {
  secureLocalStorage.setItem("first_name", firstName);
};

export const getSecureFirstName = (): string => {
  return migrateLegacyLocalToSecureLocal("first_name") || "";
};

export const clearSecureAuthStorage = () => {
  clearSecureAccessToken();
  CRITICAL_LOCAL_KEYS.forEach((key) => {
    secureLocalStorage.removeItem(key);
    localStorage.removeItem(key);
  });
};
