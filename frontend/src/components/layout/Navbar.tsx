import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Layers, Search, Plus, LogOut, LayoutDashboard, Gavel, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import NotificationBell from '../ui/NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-obsidian-dark/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Layers className="text-gold" size={24} />
          <span className="font-display text-gold font-bold text-lg tracking-wide hidden sm:block">
            MTG Market
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1 flex-1">
          <NavLink
            to="/browse"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${isActive ? 'text-gold bg-gold/10' : 'text-slate-400 hover:text-slate-200'}`
            }
          >
            <Search size={15} />
            Browse
          </NavLink>
          <NavLink
            to="/browse?tab=auctions"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${isActive ? 'text-gold bg-gold/10' : 'text-slate-400 hover:text-slate-200'}`
            }
          >
            <Gavel size={15} />
            Auctions
          </NavLink>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/create">
                <Button size="sm" variant="primary" className="hidden sm:inline-flex">
                  <Plus size={15} />
                  List Card
                </Button>
              </Link>
              <Link to="/messages" className="btn-ghost" aria-label="Messages">
                <MessageSquare size={18} />
              </Link>
              <NotificationBell />
              <Link to="/dashboard" className="btn-ghost flex items-center gap-1.5 text-sm">
                <LayoutDashboard size={15} />
                <span className="hidden md:block">{user.username}</span>
              </Link>
              <button onClick={handleLogout} className="btn-ghost">
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Join</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
