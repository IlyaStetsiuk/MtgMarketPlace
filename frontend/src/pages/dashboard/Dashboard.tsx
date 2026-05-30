import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import MyListings from './MyListings';
import MyBids from './MyBids';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Gavel, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();

  const tabs = [
    { to: '/dashboard/listings', label: 'My Listings', icon: <ShoppingBag size={15} /> },
    { to: '/dashboard/bids', label: 'My Bids', icon: <Gavel size={15} /> },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-100">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, <span className="text-gold">@{user?.username}</span></p>
        </div>
        <Link to={`/sellers/${user?.id}`} className="btn-secondary text-sm flex items-center gap-2">
          <User size={14} /> Public Profile
        </Link>
      </div>

      <div className="flex border-b border-slate-800 mb-6">
        {tabs.map(t => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-5 py-3 text-sm border-b-2 transition-colors ${
                isActive ? 'border-gold text-gold' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`
            }
          >
            {t.icon}{t.label}
          </NavLink>
        ))}
      </div>

      <Routes>
        <Route index element={<Navigate to="listings" replace />} />
        <Route path="listings" element={<MyListings />} />
        <Route path="bids" element={<MyBids />} />
      </Routes>
    </div>
  );
}
