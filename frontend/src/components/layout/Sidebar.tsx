import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  ShieldCheck,
  GitBranch,
  Gauge,
  Lightbulb,
  Network,
  Bot,
  GitPullRequest,
  ShieldHalf,
} from "lucide-react";

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/baseline', label: 'Baseline Controls', icon: ShieldCheck },
  { to: '/digital-twin', label: 'Digital Twin', icon: GitBranch },
  { to: '/risk-analysis', label: 'Risk Analysis', icon: Gauge },
  { to: '/recommendations', label: 'Recommendations', icon: Lightbulb },
  { to: '/attack-graph', label: 'Attack Graph', icon: Network },
  { to: '/copilot', label: 'AI Copilot', icon: Bot },
  { to: '/Change-Requests', label: 'Change Request', icon: GitPullRequest },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-border bg-surface/60 h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-border">
        <div className="h-8 w-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
          <ShieldHalf size={18} />
        </div>
        <span className="font-semibold tracking-tight text-text">SecureTwin</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-ring ${
                isActive
                  ? 'bg-accent/15 text-accent'
                  : 'text-muted hover:text-text hover:bg-surface-hover'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-border text-xs text-muted">
        v1.0.0 · Cyber Digital Twin Platform
      </div>
    </aside>
  );
}
