import { Bell, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import MobileSidebar from './MobileSidebar';

export default function Navbar({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="h-16 border-b border-border bg-bg/80 backdrop-blur sticky top-0 z-10 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-muted hover:text-text focus-ring rounded p-1"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <h1 className="text-lg font-semibold text-text">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative text-muted hover:text-text focus-ring rounded p-1" aria-label="Notifications">
            <Bell size={19} />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-critical" />
          </button>
          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-border">
            <div className="h-8 w-8 rounded-full bg-accent/15 text-accent flex items-center justify-center text-sm font-semibold">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-medium text-text">{user?.name ?? 'User'}</p>
              <p className="text-xs text-muted">{user?.role ?? 'analyst'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-muted hover:text-critical focus-ring rounded p-1"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut size={19} />
          </button>
        </div>
      </header>
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
