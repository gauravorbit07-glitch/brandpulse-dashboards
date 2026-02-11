import { Search, TrendingUp, FileText, Sparkles } from "lucide-react";

interface EmptyStateProps {
  type?: "visibility" | "mentions" | "sentiment" | "general" | "analyzing";
  className?: string;
}

const EMPTY_STATES = {
  analyzing: {
    icon: Search,
    title: "Analysis in Progress",
    description: "We're scanning AI platforms to understand how your brand appears in search results. This typically takes 2–5 minutes.",
    suggestion: "You'll be notified as soon as results are ready.",
    iconColor: "text-primary",
  },
  visibility: {
    icon: TrendingUp,
    title: "No Visibility Data Yet",
    description: "We haven't detected your brand in AI-generated responses for the tracked queries yet.",
    suggestion: "This usually improves after publishing authoritative content, documentation, and getting cited by high-trust sources.",
    iconColor: "text-amber-500",
  },
  mentions: {
    icon: FileText,
    title: "No Mentions Detected",
    description: "AI models haven't mentioned your brand in responses to the tracked prompts.",
    suggestion: "Try expanding your tracked keywords or improving your brand's presence on platforms AI models commonly reference.",
    iconColor: "text-amber-500",
  },
  sentiment: {
    icon: Sparkles,
    title: "Sentiment Unavailable",
    description: "We need more brand mentions to determine how AI models perceive your brand.",
    suggestion: "Once your brand appears in more AI responses, we'll analyze the tone and context of each mention.",
    iconColor: "text-primary",
  },
  general: {
    icon: Search,
    title: "No Data Available",
    description: "We're still gathering information for this section.",
    suggestion: "Check back after your next analysis run for updated insights.",
    iconColor: "text-muted-foreground",
  },
};

export const EmptyState = ({ type = "general", className = "" }: EmptyStateProps) => {
  const state = EMPTY_STATES[type];
  const Icon = state.icon;

  return (
    <div className={`flex flex-col items-center justify-center text-center py-8 px-4 ${className}`}>
      <div className={`p-4 rounded-2xl bg-muted/50 mb-4`}>
        <Icon className={`w-8 h-8 ${state.iconColor}`} />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{state.title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-3">{state.description}</p>
      <p className="text-xs text-muted-foreground/80 max-w-sm italic">{state.suggestion}</p>
    </div>
  );
};
