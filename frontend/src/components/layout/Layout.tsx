import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-800/60 py-6 text-center text-slate-600 text-sm">
        MTG Marketplace &mdash; Magic: The Gathering cards are property of Wizards of the Coast.
      </footer>
    </div>
  );
}
