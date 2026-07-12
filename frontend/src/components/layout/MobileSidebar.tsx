import { NavLink } from 'react-router-dom';
import { X, ShieldHalf } from 'lucide-react';
import {
  LayoutDashboard,
  FolderKanban,
  ShieldCheck,
  GitBranch,
  Gauge,
  Lightbulb,
  Network,
  Bot,
  Settings as SettingsIcon,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/baseline', label: 'Baseline Controls', icon: ShieldCheck },
  { to: '/digital-twin', label: 'Digital Twin', icon: GitBranch },
  { to: '/risk-analysis', label: 'Risk Analysis', icon: Gauge },
  { to: '/recommendations', label: 'Recommendations', icon: Lightbulb },
  { to: '/attack-graph', label: 'Attack Graph', icon: Network },
  { to: '/copilot', label: 'AI Copilot', icon: Bot },
  { to: '/ChangeRequests', label: 'Settings', icon: SettingsIcon },
];

export default function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="md:hidden fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside className="absolute left-0 top-0 h-full w-72 bg-surface border-r border-border flex flex-col">
        <div className="flex items-center justify-between px-5 h-16 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
              <ShieldHalf size={18} />
            </div>
            <span className="font-semibold tracking-tight text-text">CyberTwin</span>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text focus-ring rounded p-1" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-ring ${
                  isActive ? 'bg-accent/15 text-accent' : 'text-muted hover:text-text hover:bg-surface-hover'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </div>
  );
}
