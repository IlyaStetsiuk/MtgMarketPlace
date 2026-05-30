import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Browse from './pages/Browse';
import ListingDetail from './pages/ListingDetail';
import AuctionDetail from './pages/AuctionDetail';
import SellerProfile from './pages/SellerProfile';
import CreateListing from './pages/CreateListing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import { useAuth } from './context/AuthContext';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="browse" element={<Browse />} />
        <Route path="listings/:id" element={<ListingDetail />} />
        <Route path="auctions/:id" element={<AuctionDetail />} />
        <Route path="sellers/:id" element={<SellerProfile />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route
          path="create"
          element={<PrivateRoute><CreateListing /></PrivateRoute>}
        />
        <Route
          path="dashboard/*"
          element={<PrivateRoute><Dashboard /></PrivateRoute>}
        />
      </Route>
    </Routes>
  );
}
