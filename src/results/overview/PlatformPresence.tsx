import { getPlatformPresence } from "@/results/data/analyticsData";
import { Globe, CheckCircle2, XCircle } from "lucide-react";

const cleanUrl = (url: string): string => {
  if (!url || typeof url !== "string") return "";
  let cleaned = url.trim();
  cleaned = cleaned.replace(/\.([a-z]+)\1(?=\/)/gi, ".$1");
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    cleaned = "https://" + cleaned;
  }
  return cleaned;
};

const extractDomain = (url: string): string => {
  try {
    const cleaned = cleanUrl(url);
    if (!cleaned) return "";
    return new URL(cleaned).origin;
  } catch {
    return "";
  }
};

const FAVICON_URL_TEMPLATE =
  import.meta.env.VITE_FAVICON_URL_TEMPLATE || 'https://www.google.com/s2/favicons?domain={domain}&sz=128';

const faviconFromUrl = (url: string): string => {
  if (!url) return "";
  const domain = extractDomain(url);
  if (!domain) return "";
  return FAVICON_URL_TEMPLATE.replace("{domain}", domain);
};

const autoLabel = (key: string): string =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const PlatformPresence = () => {
  const platformPresence = getPlatformPresence();

  const platforms = Object.entries(platformPresence).map(([key, url]) => {
    const cleanedUrl = cleanUrl(url as string);
    return {
      key,
      label: autoLabel(key),
      icon: faviconFromUrl(cleanedUrl),
      status: cleanedUrl ? "present" : "missing",
    };
  });

  const presentCount = platforms.filter((p) => p.status === "present").length;

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-5 md:p-6 overflow-hidden hover:border-border/70 transition-all duration-300">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Globe className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            Platform Presence
          </h3>
        </div>
        <span className="text-[10px] text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-md font-medium border border-border/30 tabular-nums">
          {presentCount}/{platforms.length}
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground mb-4 ml-9">
        Brand presence on key AI-relevant platforms
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {platforms.map((platform) => (
          <div
            key={platform.key}
            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
              platform.status === "present"
                ? "border-emerald-500/10 bg-emerald-500/[0.03] hover:bg-emerald-500/[0.06]"
                : "border-red-500/10 bg-red-500/[0.02] opacity-75"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <img
                src={platform.icon}
                alt={platform.label}
                className="w-3.5 h-3.5 rounded-full object-contain bg-white flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <span className="font-medium text-[11px] text-foreground">
                {platform.label}
              </span>
            </div>
            {platform.status === "present" ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
            ) : (
              <XCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
