import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Mail,
  Eye,
  BarChart2,
  Users,
  ChevronDown,
  Check,
  X,
  MoreHorizontal,
  Crown,
  Search,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Send,
  Info,
  ArrowLeft,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { sendInvitation } from "@/apiHelpers";
import { useAuth } from "@/contexts/auth-context";
import { PLAN_LIMITS, type PricingPlanName } from "@/lib/plans";

// ─── Data ─────────────────────────────────────────────────────────────
const ROLES = {
  admin: {
    key: "admin",
    label: "Admin",
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    dot: "bg-violet-500",
    icon: Crown,
    description: "Full control over the workspace",
    permissions: [
      "Add & manage users",
      "Manage billing & plans",
      "Add application URLs",
      "Run new analysis",
      "Generate & export reports",
      "Chat with Geo AI",
      "Add/edit competitors",
      "Add keywords to track",
      "View all analysis results",
    ],
  },
  editor: {
    key: "editor",
    label: "Editor",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-500",
    icon: BarChart2,
    description: "Run analyses and manage content",
    permissions: [
      "Run new analysis",
      "Generate & export reports",
      "Chat with Geo AI",
      "Edit competitors",
      "Edit keywords to track",
      "View analysis results",
    ],
  },
  viewer: {
    key: "viewer",
    label: "Viewer",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    icon: Eye,
    description: "Read-only access to dashboards",
    permissions: ["View analysis results & dashboards", "Chat with Geo AI"],
  },
} as const;

type RoleKey = keyof typeof ROLES;
type MemberStatus = "active" | "pending" | "declined";

interface Member {
  id: string;
  name: string;
  email: string;
  role: RoleKey;
  status: MemberStatus;
  initials: string;
  joinedAt?: string;
  invitedAt?: string;
  isYou?: boolean;
}

// No more hardcoded data - we use collaborators from auth context

const STATUS_CONFIG = {
  active: {
    label: "Active",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
    dot: "bg-emerald-400",
  },
  pending: {
    label: "Invite Sent",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-100",
    dot: "bg-amber-400",
  },
  declined: {
    label: "Declined",
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-100",
    dot: "bg-red-400",
  },
};

const AVATAR_COLORS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-blue-600",
  "from-fuchsia-500 to-violet-600",
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as any,
    },
  }),
};

// ─── Inline Dropdown ──────────────────────────────────────────────────
function InlineDropdown({
  open,
  onClose,
  children,
  align = "right",
  width = 210,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  align?: "left" | "right";
  width?: number;
}) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          ...(align === "right" ? { right: 0 } : { left: 0 }),
          width,
          zIndex: 50,
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow:
            "0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 32px -4px rgba(0,0,0,0.13)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────
export default function TeamMembers() {
  const navigate = useNavigate();
  const { pricingPlan, userRoleInt, user, collaborators: authCollaborators } = useAuth();
  const planLimits = PLAN_LIMITS[pricingPlan as PricingPlanName] || PLAN_LIMITS.free;
  const maxSeats = planLimits.maxUsers;
  const isAdmin = userRoleInt <= 1;

  // Build members list from auth collaborators
  const buildMembersFromCollaborators = (): Member[] => {
    if (!authCollaborators || authCollaborators.length === 0) {
      // Fallback: show current user as only member
      if (user) {
        return [{
          id: user.id,
          name: `${user.first_name} ${user.last_name}`.trim(),
          email: user.email,
          role: userRoleInt <= 1 ? "admin" : userRoleInt <= 3 ? "editor" : "viewer",
          status: "active" as MemberStatus,
          initials: `${user.first_name.charAt(0)}${(user.last_name || "").charAt(0)}`.toUpperCase(),
          joinedAt: "Member",
          isYou: true,
        }];
      }
      return [];
    }

    return authCollaborators.map((collab: any) => {
      const collabUser = collab.user;
      const firstName = collabUser?.first_name || collab.email?.split("@")[0] || "User";
      const lastName = collabUser?.last_name || "";
      const fullName = `${firstName} ${lastName}`.trim();
      const email = collabUser?.email || collab.email || "";
      const isActive = collabUser?.is_active !== false;

      // Map role string to RoleKey
      let roleKey: RoleKey = "viewer";
      const roleStr = (collab.role || "").toLowerCase();
      if (roleStr === "admin" || roleStr === "god") roleKey = "admin";
      else if (roleStr === "editor" || roleStr === "application") roleKey = "editor";
      else roleKey = "viewer";

      const isCurrentUser = user && (collabUser?.id === user.id || collabUser?.email === user.email);

      return {
        id: collab.id || collab.user_id || email,
        name: fullName,
        email,
        role: roleKey,
        status: (isActive ? "active" : "pending") as MemberStatus,
        initials: `${firstName.charAt(0)}${lastName.charAt(0) || firstName.charAt(1) || ""}`.toUpperCase(),
        joinedAt: collab.created_at
          ? new Date(collab.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : undefined,
        isYou: !!isCurrentUser,
      };
    });
  };

  const [members, setMembers] = useState<Member[]>(buildMembersFromCollaborators);
  const seatsUsed = members.filter((m) => m.status === "active" || m.status === "pending").length;
  const seatsAtLimit = seatsUsed >= maxSeats;
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<RoleKey>("editor");
  const [inviteRoleOpen, setInviteRoleOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | MemberStatus>("all");
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editRoleId, setEditRoleId] = useState<string | null>(null);
  const [roleInfoOpen, setRoleInfoOpen] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const closeAll = () => {
    setOpenMenuId(null);
    setEditRoleId(null);
    setInviteRoleOpen(false);
  };

  const handleInvite = async () => {
    if (!inviteEmail.includes("@"))
      return showToast("Enter a valid email", "error");
    if (members.find((m) => m.email === inviteEmail))
      return showToast("Already in workspace", "error");
    // Enforce seat limit from plan
    const activeAndPending = members.filter((m) => m.status === "active" || m.status === "pending").length;
    if (activeAndPending >= maxSeats) {
      return showToast(`Seat limit reached (${maxSeats}). Upgrade your plan to add more members.`, "error");
    }
    try {
      const roleMap: Record<string, string> = {
        editor: "editor",
        viewer: "viewer",
      };
      await sendInvitation({
        email: inviteEmail,
        role: roleMap[inviteRole] || "viewer",
      });
      setMembers((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: inviteEmail.split("@")[0],
          email: inviteEmail,
          role: inviteRole,
          status: "pending",
          initials: inviteEmail.slice(0, 2).toUpperCase(),
          invitedAt: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        },
      ]);
      setInviteEmail("");
      showToast(`Invite sent to ${inviteEmail}`);
    } catch (error: any) {
      showToast(error.message || "Failed to send invite", "error");
    }
  };

  const handleAction = (id: string, action: string) => {
    closeAll();
    if (action === "remove") {
      setMembers((p) => p.filter((m) => m.id !== id));
      showToast("Member removed");
    }
    if (action === "resend") {
      showToast("Invite resent!");
    }
  };

  const handleRoleChange = (id: string, role: RoleKey) => {
    setMembers((p) => p.map((m) => (m.id === id ? { ...m, role } : m)));
    closeAll();
    showToast("Role updated");
  };

  const filtered = members.filter(
    (m) =>
      (filterStatus === "all" || m.status === filterStatus) &&
      (!search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()))
  );

  const counts = {
    all: members.length,
    active: members.filter((m) => m.status === "active").length,
    pending: members.filter((m) => m.status === "pending").length,
    declined: members.filter((m) => m.status === "declined").length,
  };

  return (
    <Layout>
      <div className="min-h-screen bg-muted/40">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 35% at 50% -5%, rgba(99,102,241,0.05) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-8 pb-32 space-y-8">
          {/* Back */}
          <motion.button
            onClick={() => {
              const from = window.history.state?.usr?.from as
                | string
                | undefined;
              if (from && !["/billing", "/invite"].includes(from))
                navigate(from);
              else navigate("/results");
            }}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="group inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border bg-card shadow-sm text-muted-foreground hover:border-primary/40 hover:text-primary hover:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5 duration-200" />
            <span className="text-sm font-semibold">Back</span>
          </motion.button>

          {/* Header */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex items-start justify-between gap-4 flex-wrap"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                Team Members
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mt-2">
                Manage who has access to your GeoRankers workspace
              </p>
            </div>
            <button
              onClick={() => setRoleInfoOpen((v) => !v)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-card text-sm font-medium text-muted-foreground hover:bg-muted transition-all shadow-sm"
            >
              <Info className="w-4 h-4" /> Role permissions
            </button>
          </motion.div>

          {/* Role Info Panel */}
          <AnimatePresence>
            {roleInfoOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="rounded-2xl border border-border bg-card shadow-sm">
                  <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">
                      Role Permissions Overview
                    </p>
                    <button
                      onClick={() => setRoleInfoOpen(false)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
                    {Object.values(ROLES).map((role) => {
                      const Icon = role.icon;
                      return (
                        <div key={role.key} className="p-5 space-y-3">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-8 h-8 rounded-lg ${role.bg} flex items-center justify-center`}
                            >
                              <Icon className={`w-4 h-4 ${role.color}`} />
                            </span>
                            <div>
                              <p className={`text-sm font-bold ${role.color}`}>
                                {role.label}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {role.description}
                              </p>
                            </div>
                          </div>
                          <ul className="space-y-1.5">
                            {role.permissions.map((p) => (
                              <li
                                key={p}
                                className="flex items-start gap-2 text-xs text-muted-foreground"
                              >
                                <Check className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                                {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Invite Card ── */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="rounded-2xl border border-border bg-card shadow-sm"
          >
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Invite a team member
                  </p>
                  <p className="text-xs text-muted-foreground">
                    They'll get an email with a link to join your workspace
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-muted-foreground px-3 py-1.5 rounded-full bg-muted border border-border">
                {members.filter((m) => m.status === "active" || m.status === "pending").length} / {maxSeats} seats used
              </span>
            </div>
            <div className="p-6">
              <div className="flex gap-3 flex-wrap md:flex-nowrap">
                {/* Email input */}
                <div className="relative flex-1 min-w-0">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                    placeholder="colleague@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>

                {/* Role picker — editor and viewer only (no admin) */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => {
                      closeAll();
                      setInviteRoleOpen((v) => !v);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-all min-w-[140px] justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${ROLES[inviteRole].dot}`}
                      />
                      {ROLES[inviteRole].label}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>

                  <InlineDropdown
                    open={inviteRoleOpen}
                    onClose={() => setInviteRoleOpen(false)}
                    align="left"
                    width={290}
                  >
                    {(
                      Object.values(ROLES).filter(
                        (role) => role.key !== "admin"
                      ) as (typeof ROLES)[Exclude<RoleKey, "admin">][]
                    ).map((role) => {
                      const Icon = role.icon;
                      const roleKey = role.key as Exclude<RoleKey, "admin">;
                      return (
                        <button
                          key={roleKey}
                          onClick={() => {
                            setInviteRole(roleKey);
                            setInviteRoleOpen(false);
                          }}
                          className={`w-full flex items-start gap-3 px-4 py-3.5 hover:bg-muted transition-colors text-left ${
                            inviteRole === roleKey ? "bg-muted" : ""
                          }`}
                        >
                          <span
                            className={`w-8 h-8 rounded-lg ${role.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}
                          >
                            <Icon className={`w-4 h-4 ${role.color}`} />
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-foreground">
                                {role.label}
                              </span>
                              {inviteRole === roleKey && (
                                <Check className="w-3.5 h-3.5 text-primary" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {role.description}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                              {role.permissions.slice(0, 3).join(" · ")}
                              {role.permissions.length > 3 &&
                                ` · +${role.permissions.length - 3} more`}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </InlineDropdown>
                </div>

                <button
                  onClick={handleInvite}
                  disabled={seatsAtLimit || !isAdmin}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground flex-shrink-0 transition-all shadow-elevated",
                    seatsAtLimit || !isAdmin
                      ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                      : "bg-primary hover:brightness-110 active:scale-[0.98]"
                  )}
                  title={!isAdmin ? "Only admins can invite users" : seatsAtLimit ? `Seat limit reached (${maxSeats})` : ""}
                >
                  <Send className="w-4 h-4" /> {seatsAtLimit ? "Seats Full" : "Send Invite"}
                </button>
              </div>
              <p className="text-xs text-foreground mt-3 text-center">
                In case you want to change the admin, please{" "}
                <a
                  href="mailto:hello@georankers.co"
                  className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
                >
                  reach out to us
                </a>
                .
              </p>
            </div>
          </motion.div>

          {/* ── Members List ── */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="rounded-2xl border border-border bg-card shadow-sm"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Users className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Workspace Members
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {members.length} total · {counts.active} active
                  </p>
                </div>
              </div>
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search members…"
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            {/* Filter tabs */}
            <div className="px-6 pt-3 pb-1 flex items-center gap-1 overflow-x-auto">
              {(["all", "active", "pending", "declined"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    filterStatus === s
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {s === "all" ? "All members" : STATUS_CONFIG[s].label}
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      filterStatus === s
                        ? "bg-background/20 text-background"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {counts[s]}
                  </span>
                </button>
              ))}
            </div>

            {/* Member rows */}
            <div className="divide-y divide-border/50 mt-1 pb-2">
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <div className="py-16 text-center text-sm text-muted-foreground">
                    No members match your filter
                  </div>
                ) : (
                  filtered.map((member, i) => {
                    const role = ROLES[member.role];
                    const status = STATUS_CONFIG[member.status];
                    const RIcon = role.icon;
                    const grad =
                      AVATAR_COLORS[parseInt(member.id) % AVATAR_COLORS.length];

                    return (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.22 }}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors"
                      >
                        {/* Avatar */}
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm`}
                        >
                          {member.initials}
                        </div>

                        {/* Name + email */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground truncate">
                              {member.name}
                            </span>
                            {member.isYou && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {member.email}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                            {member.status === "active" &&
                              member.joinedAt &&
                              `Joined ${member.joinedAt}`}
                            {member.status !== "active" &&
                              member.invitedAt &&
                              `Invited ${member.invitedAt}`}
                          </p>
                        </div>

                        {/* Role badge */}
                        <div className="relative flex-shrink-0">
                          {!member.isYou ? (
                            <button
                              onClick={() => {
                                closeAll();
                                setEditRoleId((prev) =>
                                  prev === member.id ? null : member.id
                                );
                              }}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${role.bg} ${role.border} ${role.color} hover:brightness-95 transition-all`}
                            >
                              <RIcon className="w-3 h-3" />
                              {role.label}
                              <ChevronDown className="w-3 h-3 opacity-60" />
                            </button>
                          ) : (
                            <span
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${role.bg} ${role.border} ${role.color}`}
                            >
                              <RIcon className="w-3 h-3" />
                              {role.label}
                            </span>
                          )}

                          <InlineDropdown
                            open={editRoleId === member.id}
                            onClose={() => setEditRoleId(null)}
                            align="right"
                            width={244}
                          >
                            <p className="px-3 pt-3 pb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              Change role
                            </p>
                            {Object.values(ROLES).map((r) => {
                              const RI = r.icon;
                              const rKey = r.key as RoleKey;
                              return (
                                <button
                                  key={rKey}
                                  onClick={() =>
                                    handleRoleChange(member.id, rKey)
                                  }
                                  className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted transition-colors text-left ${
                                    member.role === rKey ? "bg-muted" : ""
                                  }`}
                                >
                                  <span
                                    className={`w-7 h-7 rounded-lg ${r.bg} flex items-center justify-center flex-shrink-0`}
                                  >
                                    <RI className={`w-3.5 h-3.5 ${r.color}`} />
                                  </span>
                                  <div className="flex-1">
                                    <p className="text-xs font-semibold text-foreground">
                                      {r.label}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      {r.description}
                                    </p>
                                  </div>
                                  {member.role === rKey && (
                                    <Check className="w-3.5 h-3.5 text-primary" />
                                  )}
                                </button>
                              );
                            })}
                          </InlineDropdown>
                        </div>

                        {/* Status badge */}
                        <div className="flex-shrink-0 hidden sm:block">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${status.bg} ${status.text} ${status.border}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                status.dot
                              } ${
                                member.status === "pending"
                                  ? "animate-pulse"
                                  : ""
                              }`}
                            />
                            {status.label}
                          </span>
                        </div>

                        {/* ··· actions */}
                        {!member.isYou && (
                          <div className="relative flex-shrink-0">
                            <button
                              onClick={() => {
                                closeAll();
                                setOpenMenuId((prev) =>
                                  prev === member.id ? null : member.id
                                );
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            <InlineDropdown
                              open={openMenuId === member.id}
                              onClose={() => setOpenMenuId(null)}
                              align="right"
                              width={212}
                            >
                              <div className="py-1">
                                {member.status === "pending" && (
                                  <button
                                    onClick={() =>
                                      handleAction(member.id, "resend")
                                    }
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5 text-blue-500" />{" "}
                                    Resend invite
                                  </button>
                                )}
                                {member.status === "declined" && (
                                  <button
                                    onClick={() =>
                                      handleAction(member.id, "resend")
                                    }
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5 text-blue-500" />{" "}
                                    Re-invite
                                  </button>
                                )}
                                <div className="my-1 border-t border-gray-100" />
                                <button
                                  onClick={() =>
                                    handleAction(member.id, "remove")
                                  }
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Remove from
                                  workspace
                                </button>
                              </div>
                            </InlineDropdown>
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Seat usage */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="rounded-2xl border border-border bg-card shadow-sm p-5 flex items-center justify-between gap-4 flex-wrap"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Seat usage
                </p>
              <p className="text-xs text-muted-foreground">
                  {counts.active} of {maxSeats} seats used on the{" "}
                  <span className="text-primary font-semibold capitalize">
                    {pricingPlan}
                  </span>{" "}
                  plan
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-1 max-w-xs">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{
                    width: `${Math.min((counts.active / maxSeats) * 100, 100)}%`,
                  }}
                />
              </div>
              <span className="text-xs font-bold text-foreground whitespace-nowrap">
                {counts.active} / {maxSeats}
              </span>
            </div>
            <button 
              onClick={() => navigate("/billing", { state: { from: "/invite" } })}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-border bg-card text-foreground hover:bg-muted transition-colors flex-shrink-0"
            >
              Upgrade for more seats →
            </button>
          </motion.div>
          <p className="text-s text-foreground mt-3 text-center">
            In case you want to change the admin, please{" "}
            <a
              href="mailto:hello@georankers.co"
              className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              reach out to us
            </a>
            .
          </p>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold ${
                toast.type === "success"
                  ? "bg-gray-900 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {toast.type === "success" ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
