import { Bell, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import MobileSidebar from './MobileSidebar';

export default function Navbar({ title }: { title: string }) {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleRoleSwitch = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    if (!userId) return;
    
    // Map DB user_id back to login payload
    let username = '';
    let password = '';
    if (userId === '1') { username = 'EMP1001'; password = 'gowtham'; }
    else if (userId === '2') { username = 'EMP3002'; password = 'gopal'; }
    else if (userId === '3') { username = 'EMP2002'; password = 'gokul'; }

    try {
      await login({ username, password });
      // Reload page to re-fetch context-specific data
      window.location.reload();
    } catch (err) {
      console.error('Failed to switch roles:', err);
      alert('Failed to switch role. Check if DB has EMP1001, EMP2002, EMP3002');
    }
  };

  return (
    <>
      <header className="h-16 border-b border-border glass-panel sticky top-0 z-10 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-muted hover:text-accent focus-ring rounded p-1 transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <h1 className="text-lg font-semibold text-text tracking-wide">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          
          {/* Quick Role Switcher for Testing */}
          <select 
            className="text-xs bg-surface border border-border rounded-lg px-2 py-1.5 text-muted hover:text-text hover:border-accent/50 transition-all focus-ring cursor-pointer"
            onChange={handleRoleSwitch}
            value={user?.id || ''}
            title="Switch User Role to test Approvals and Multi-Tenancy"
          >
            <option value="" disabled>Switch Role...</option>
            <option value="1">Engineer (EMP1001)</option>
            <option value="2">Administrator (EMP3002)</option>
            <option value="3">Security Manager (EMP2002)</option>
          </select>

          <div className="relative">
            <button 
              className="relative text-muted hover:text-accent focus-ring rounded p-1 transition-colors" 
              aria-label="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={19} />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-critical shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-72 glass-panel rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden border border-border">
                <div className="p-3 border-b border-border bg-surface/50">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                </div>
                <div className="p-6 text-center text-sm text-muted">
                  No new notifications
                </div>
              </div>
            )}
          </div>
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
