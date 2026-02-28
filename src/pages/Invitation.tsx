import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus, Mail, Eye, BarChart2,
  Users, ChevronDown, Check, X, Ban,
  MoreHorizontal, Crown, Search, AlertTriangle, RefreshCw,
  Trash2, Send, Copy, Link2, Info, ArrowLeft,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { useNavigate } from "react-router-dom";

// ─── Role definitions ───────────────────────────────────────────────
const ROLES = {
  admin: {
    key: "admin", label: "Admin", color: "text-violet-700", bg: "bg-violet-50",
    border: "border-violet-200", dot: "bg-violet-500", icon: Crown,
    description: "Full control over the workspace",
    permissions: [
      "Add & manage users", "Manage billing & plans", "Add application URLs",
      "Run new analysis", "Generate & export reports", "Chat with Geo AI",
      "Add/edit competitors", "Add keywords to track", "View all analysis results",
    ],
  },
  analyst: {
    key: "analyst", label: "Analyst", color: "text-blue-700", bg: "bg-blue-50",
    border: "border-blue-200", dot: "bg-blue-500", icon: BarChart2,
    description: "Run analyses and manage content",
    permissions: [
      "Run new analysis", "Generate & export reports", "Chat with Geo AI",
      "Edit competitors", "Edit keywords to track", "View analysis results",
    ],
  },
  viewer: {
    key: "viewer", label: "Viewer", color: "text-emerald-700", bg: "bg-emerald-50",
    border: "border-emerald-200", dot: "bg-emerald-500", icon: Eye,
    description: "Read-only access to dashboards",
    permissions: ["View analysis results & dashboards", "Chat with Geo AI"],
  },
} as const;

type RoleKey = keyof typeof ROLES;
type MemberStatus = "active" | "pending" | "declined" | "blocked";

interface Member {
  id: string; name: string; email: string; role: RoleKey;
  status: MemberStatus; initials: string;
  joinedAt?: string; invitedAt?: string; isYou?: boolean;
}

const INITIAL_MEMBERS: Member[] = [
  { id: "1", name: "Gaurav Sharma",  email: "gaurav@georankers.com", role: "admin",   status: "active",   initials: "GS", joinedAt: "Jan 3, 2025",  isYou: true },
  { id: "2", name: "Priya Mehta",    email: "priya@acme.com",        role: "analyst", status: "active",   initials: "PM", joinedAt: "Jan 15, 2025" },
  { id: "3", name: "Rahul Verma",    email: "rahul@acme.com",        role: "viewer",  status: "active",   initials: "RV", joinedAt: "Feb 2, 2025" },
  { id: "4", name: "Sarah Johnson",  email: "sarah.j@partner.io",    role: "analyst", status: "pending",  initials: "SJ", invitedAt: "Feb 20, 2025" },
  { id: "5", name: "Tom Nguyen",     email: "tom@designco.io",       role: "viewer",  status: "pending",  initials: "TN", invitedAt: "Feb 24, 2025" },
  { id: "6", name: "Lisa Park",      email: "lisa.park@corp.com",    role: "analyst", status: "declined", initials: "LP", invitedAt: "Feb 10, 2025" },
  { id: "7", name: "Mike Torres",    email: "mike.t@blocked.com",    role: "viewer",  status: "blocked",  initials: "MT", joinedAt: "Jan 28, 2025" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

const STATUS_CONFIG = {
  active:   { label: "Active",      bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", dot: "bg-emerald-400" },
  pending:  { label: "Invite Sent", bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-100",   dot: "bg-amber-400" },
  declined: { label: "Declined",    bg: "bg-red-50",     text: "text-red-600",     border: "border-red-100",     dot: "bg-red-400" },
  blocked:  { label: "Blocked",     bg: "bg-gray-100",   text: "text-gray-500",    border: "border-gray-200",    dot: "bg-gray-400" },
};

const AVATAR_COLORS = [
  "from-violet-500 to-purple-600", "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",     "from-indigo-500 to-blue-600",
  "from-fuchsia-500 to-violet-600",
];

// ─── Portal Dropdown ─────────────────────────────────────────────────
// Renders at document.body — NEVER clipped by parent overflow
function PortalDropdown({
  triggerRef,
  open,
  onClose,
  children,
  align = "right",
  width = 210,
}: {
  triggerRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  align?: "left" | "right";
  width?: number;
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  // Recalculate position every time it opens
  useEffect(() => {
    if (!open) { setPos(null); return; }
    const el = triggerRef.current;
    if (!el) return;

    // Use requestAnimationFrame so the element is fully painted
    const raf = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const approxH = 280;
      const spaceBelow = window.innerHeight - r.bottom;
      const top = spaceBelow > approxH
        ? r.bottom + window.scrollY + 6        // open downward
        : r.top + window.scrollY - approxH - 6; // flip upward
      const left = align === "right"
        ? Math.max(8, r.right + window.scrollX - width)   // right-aligned to button
        : r.left + window.scrollX;                         // left-aligned
      setPos({ top, left });
    });
    return () => cancelAnimationFrame(raf);
  }, [open, align, width]);

  if (!open || !pos) return null;

  const dropStyle: React.CSSProperties = {
    position: "absolute",
    top: pos.top,
    left: pos.left,
    width,
    zIndex: 9999,
    filter: "drop-shadow(0 8px 28px rgba(0,0,0,0.14)) drop-shadow(0 2px 6px rgba(0,0,0,0.07))",
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 2 }}
        transition={{ duration: 0.13, ease: "easeOut" }}
        style={dropStyle}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
      >
        {children}
      </motion.div>
    </>,
    document.body
  );
}

// ─── Main Page ────────────────────────────────────────────────────────
export default function TeamMembers() {
  const navigate = useNavigate();
  const [members, setMembers]             = useState<Member[]>(INITIAL_MEMBERS);
  const [inviteEmail, setInviteEmail]     = useState("");
  const [inviteRole, setInviteRole]       = useState<RoleKey>("analyst");
  const [roleDropOpen, setRoleDropOpen]   = useState(false);
  const [filterStatus, setFilterStatus]   = useState<"all" | MemberStatus>("all");
  const [search, setSearch]               = useState("");
  const [openMenuId, setOpenMenuId]       = useState<string | null>(null);
  const [editRoleId, setEditRoleId]       = useState<string | null>(null);
  const [roleInfoOpen, setRoleInfoOpen]   = useState(false);
  const [toast, setToast]                 = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // refs for portal positioning
  const inviteRoleRef  = useRef<HTMLButtonElement>(null);
  const menuRefs       = useRef<Record<string, HTMLButtonElement | null>>({});
  const roleEditRefs   = useRef<Record<string, HTMLButtonElement | null>>({});

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleInvite = () => {
    if (!inviteEmail.includes("@")) return showToast("Enter a valid email", "error");
    if (members.find(m => m.email === inviteEmail)) return showToast("Already in workspace", "error");
    setMembers(prev => [...prev, {
      id: Date.now().toString(), name: inviteEmail.split("@")[0], email: inviteEmail,
      role: inviteRole, status: "pending",
      initials: inviteEmail.slice(0, 2).toUpperCase(),
      invitedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    }]);
    setInviteEmail("");
    showToast(`Invite sent to ${inviteEmail}`);
  };

  const handleAction = (id: string, action: string) => {
    setOpenMenuId(null);
    if (action === "remove")  { setMembers(p => p.filter(m => m.id !== id)); showToast("Member removed"); }
    if (action === "block")   { setMembers(p => p.map(m => m.id === id ? { ...m, status: "blocked" } : m)); showToast("Member blocked"); }
    if (action === "unblock") { setMembers(p => p.map(m => m.id === id ? { ...m, status: "active"  } : m)); showToast("Member unblocked"); }
    if (action === "resend")  { showToast("Invite resent!"); }
  };

  const handleRoleChange = (id: string, role: RoleKey) => {
    setMembers(p => p.map(m => m.id === id ? { ...m, role } : m));
    setEditRoleId(null);
    showToast("Role updated");
  };

  const filtered = members.filter(m =>
    (filterStatus === "all" || m.status === filterStatus) &&
    (!search || m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()))
  );

  const counts = {
    all: members.length,
    active:   members.filter(m => m.status === "active").length,
    pending:  members.filter(m => m.status === "pending").length,
    declined: members.filter(m => m.status === "declined").length,
    blocked:  members.filter(m => m.status === "blocked").length,
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50/40">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 35% at 50% -5%, rgba(99,102,241,0.05) 0%, transparent 70%)" }}
        />

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">

          {/* ── Back ── */}
          <motion.button onClick={() => navigate(-1)}
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="group flex items-center gap-2.5"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 bg-white shadow-sm text-gray-500 group-hover:border-blue-300 group-hover:text-blue-600 group-hover:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all duration-200">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 duration-200" />
            </span>
            <span className="text-sm font-medium text-gray-500 group-hover:text-gray-800 transition-colors">Back</span>
          </motion.button>

          {/* ── Header ── */}
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
            className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Team Members</h1>
              <p className="text-sm text-gray-500 mt-1">Manage who has access to your GeoRankers workspace</p>
            </div>
            <button onClick={() => setRoleInfoOpen(v => !v)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
              <Info className="w-4 h-4 text-gray-400" />
              Role permissions
            </button>
          </motion.div>

          {/* ── Role Info Panel ── */}
          <AnimatePresence>
            {roleInfoOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">Role Permissions Overview</p>
                    <button onClick={() => setRoleInfoOpen(false)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    {Object.values(ROLES).map(role => {
                      const Icon = role.icon;
                      return (
                        <div key={role.key} className="p-5 space-y-3">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-8 h-8 rounded-lg ${role.bg} flex items-center justify-center`}>
                              <Icon className={`w-4 h-4 ${role.color}`} />
                            </span>
                            <div>
                              <p className={`text-sm font-bold ${role.color}`}>{role.label}</p>
                              <p className="text-[11px] text-gray-400">{role.description}</p>
                            </div>
                          </div>
                          <ul className="space-y-1.5">
                            {role.permissions.map(p => (
                              <li key={p} className="flex items-start gap-2 text-xs text-gray-600">
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

          {/* ── Invite Card ── (no overflow-hidden so invite role dropdown can show) */}
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible"
            className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Invite a team member</p>
                <p className="text-xs text-gray-400">They'll get an email with a link to join your workspace</p>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex gap-3 flex-wrap md:flex-nowrap">
                {/* Email input */}
                <div className="relative flex-1 min-w-0">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleInvite()}
                    placeholder="colleague@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition-all"
                  />
                </div>
                {/* Role picker — opens PORTAL dropdown */}
                <button
                  ref={inviteRoleRef}
                  onClick={() => setRoleDropOpen(v => !v)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all min-w-[140px] justify-between flex-shrink-0"
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${ROLES[inviteRole].dot}`} />
                    {ROLES[inviteRole].label}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>
                {/* Send button */}
                <button onClick={handleInvite}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0 transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg,#1d4ed8,#2563eb)", boxShadow: "0 3px 10px rgba(37,99,235,0.3)" }}>
                  <Send className="w-4 h-4" />
                  Send Invite
                </button>
              </div>
            </div>
          </motion.div>

          {/* ── Members List ── NOTE: NO overflow-hidden here */}
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
            className="rounded-2xl border border-gray-200 bg-white shadow-sm">

            {/* List header */}
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                  <Users className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Workspace Members</p>
                  <p className="text-xs text-gray-400">{members.length} total · {counts.active} active</p>
                </div>
              </div>
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search members…"
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition-all" />
              </div>
            </div>

            {/* Status filter tabs */}
            <div className="px-6 pt-3 pb-1 flex items-center gap-1 overflow-x-auto">
              {(["all", "active", "pending", "declined", "blocked"] as const).map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    filterStatus === s ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`}>
                  {s === "all" ? "All members" : STATUS_CONFIG[s].label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    filterStatus === s ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                  }`}>{counts[s]}</span>
                </button>
              ))}
            </div>

            {/* Member rows */}
            <div className="divide-y divide-gray-50 mt-1 pb-2">
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <div className="py-16 text-center text-sm text-gray-400">No members match your filter</div>
                ) : filtered.map((member, i) => {
                  const role   = ROLES[member.role];
                  const status = STATUS_CONFIG[member.status];
                  const RIcon  = role.icon;
                  const grad   = AVATAR_COLORS[parseInt(member.id) % AVATAR_COLORS.length];

                  return (
                    <motion.div key={member.id}
                      initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.22 }}
                      className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50/70 transition-colors ${member.status === "blocked" ? "opacity-55" : ""}`}
                    >
                      {/* Avatar */}
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm`}>
                        {member.initials}
                      </div>

                      {/* Name + email */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-800 truncate">{member.name}</span>
                          {member.isYou && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 flex-shrink-0">You</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{member.email}</p>
                        <p className="text-[10px] text-gray-300 mt-0.5">
                          {member.status === "active"   && member.joinedAt  && `Joined ${member.joinedAt}`}
                          {member.status !== "active"   && member.invitedAt && `Invited ${member.invitedAt}`}
                        </p>
                      </div>

                      {/* Role badge — triggers portal role dropdown */}
                      <div className="flex-shrink-0">
                        {!member.isYou ? (
                          <button
                            ref={el => { roleEditRefs.current[member.id] = el; }}
                            onClick={() => setEditRoleId(prev => prev === member.id ? null : member.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${role.bg} ${role.border} ${role.color} hover:brightness-95 transition-all`}
                          >
                            <RIcon className="w-3 h-3" />
                            {role.label}
                            <ChevronDown className="w-3 h-3 opacity-60" />
                          </button>
                        ) : (
                          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${role.bg} ${role.border} ${role.color}`}>
                            <RIcon className="w-3 h-3" />
                            {role.label}
                          </span>
                        )}
                      </div>

                      {/* Status badge */}
                      <div className="flex-shrink-0 hidden sm:block">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${status.bg} ${status.text} ${status.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${member.status === "pending" ? "animate-pulse" : ""}`} />
                          {status.label}
                        </span>
                      </div>

                      {/* ··· button */}
                      {!member.isYou && (
                        <button
                          ref={el => { menuRefs.current[member.id] = el; }}
                          onClick={() => setOpenMenuId(prev => prev === member.id ? null : member.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors flex-shrink-0"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      )}

                      {/* PORTAL: role change */}
                      <AnimatePresence>
                        {editRoleId === member.id && (
                          <PortalDropdown
                            triggerRef={{ current: roleEditRefs.current[member.id] }}
                            open={true}
                            onClose={() => setEditRoleId(null)}
                            align="right"
                            width={244}
                          >
                            <p className="px-3 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Change role</p>
                            {Object.values(ROLES).map(r => {
                              const RI = r.icon;
                              return (
                                <button key={r.key}
                                  onClick={() => handleRoleChange(member.id, r.key as RoleKey)}
                                  className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left ${member.role === r.key ? "bg-gray-50" : ""}`}>
                                  <span className={`w-7 h-7 rounded-lg ${r.bg} flex items-center justify-center flex-shrink-0`}>
                                    <RI className={`w-3.5 h-3.5 ${r.color}`} />
                                  </span>
                                  <div className="flex-1">
                                    <p className="text-xs font-semibold text-gray-800">{r.label}</p>
                                    <p className="text-[10px] text-gray-400">{r.description}</p>
                                  </div>
                                  {member.role === r.key && <Check className="w-3.5 h-3.5 text-blue-600" />}
                                </button>
                              );
                            })}
                          </PortalDropdown>
                        )}
                      </AnimatePresence>

                      {/* PORTAL: actions menu */}
                      <AnimatePresence>
                        {openMenuId === member.id && (
                          <PortalDropdown
                            triggerRef={{ current: menuRefs.current[member.id] }}
                            open={true}
                            onClose={() => setOpenMenuId(null)}
                            align="right"
                            width={212}
                          >
                            <div className="py-1">
                              {member.status === "pending" && (
                                <button onClick={() => handleAction(member.id, "resend")}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                  <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                                  Resend invite
                                </button>
                              )}
                              {member.status === "declined" && (
                                <button onClick={() => handleAction(member.id, "resend")}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                  <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                                  Re-invite
                                </button>
                              )}
                              {member.status === "active" && (
                                <button onClick={() => handleAction(member.id, "block")}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                  <Ban className="w-3.5 h-3.5 text-amber-500" />
                                  Block member
                                </button>
                              )}
                              {member.status === "blocked" && (
                                <button onClick={() => handleAction(member.id, "unblock")}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  Unblock member
                                </button>
                              )}
                              <div className="my-1 border-t border-gray-100" />
                              <button onClick={() => handleAction(member.id, "remove")}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                                Remove from workspace
                              </button>
                            </div>
                          </PortalDropdown>
                        )}
                      </AnimatePresence>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── Seat usage ── */}
          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
            className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Seat usage</p>
                <p className="text-xs text-gray-400">
                  {counts.active} of 3 seats used on the{" "}
                  <span className="text-blue-600 font-semibold">Grow</span> plan
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-1 max-w-xs">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-blue-500 transition-all duration-700"
                  style={{ width: `${Math.min((counts.active / 3) * 100, 100)}%` }} />
              </div>
              <span className="text-xs font-bold text-gray-600 whitespace-nowrap">{counts.active} / 3</span>
            </div>
            <button className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors flex-shrink-0">
              Upgrade for more seats →
            </button>
          </motion.div>

        </div>

        {/* ── Invite role picker (PORTAL) ── */}
        <AnimatePresence>
          {roleDropOpen && (
            <PortalDropdown
              triggerRef={inviteRoleRef}
              open={true}
              onClose={() => setRoleDropOpen(false)}
              align="left"
              width={290}
            >
              {Object.values(ROLES).map(role => {
                const Icon = role.icon;
                return (
                  <button key={role.key}
                    onClick={() => { setInviteRole(role.key as RoleKey); setRoleDropOpen(false); }}
                    className={`w-full flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left ${inviteRole === role.key ? "bg-gray-50" : ""}`}>
                    <span className={`w-8 h-8 rounded-lg ${role.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className={`w-4 h-4 ${role.color}`} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">{role.label}</span>
                        {inviteRole === role.key && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{role.description}</p>
                      <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                        {role.permissions.slice(0, 3).join(" · ")}
                        {role.permissions.length > 3 && ` · +${role.permissions.length - 3} more`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </PortalDropdown>
          )}
        </AnimatePresence>

        {/* ── Toast ── */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold ${
                toast.type === "success" ? "bg-gray-900 text-white" : "bg-red-600 text-white"
              }`}
            >
              {toast.type === "success"
                ? <Check className="w-4 h-4 text-emerald-400" />
                : <AlertTriangle className="w-4 h-4" />}
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </Layout>
  );
}