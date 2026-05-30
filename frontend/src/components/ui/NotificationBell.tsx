import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '../../hooks/useNotifications';
import { notificationsApi } from '../../api/notifications.api';
import { Notification } from '../../types/api';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useNotifications();

  const notifications = data?.data ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleOpen() {
    setOpen((v) => !v);
    if (!open && unreadCount > 0) {
      await notificationsApi.markAllRead();
      queryClient.setQueryData<{ data: Notification[]; unreadCount: number }>(
        ['notifications'],
        (old) => old ? { ...old, unreadCount: 0, data: old.data.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })) } : old,
      );
    }
  }

  async function handleNotificationClick(n: Notification) {
    setOpen(false);
    if (n.link) navigate(n.link);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="btn-ghost relative"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-obsidian border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">Notifications</span>
            {notifications.length > 0 && (
              <button
                onClick={async () => {
                  await notificationsApi.markAllRead();
                  queryClient.setQueryData<{ data: Notification[]; unreadCount: number }>(
                    ['notifications'],
                    (old) => old ? { ...old, unreadCount: 0, data: old.data.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })) } : old,
                  );
                }}
                className="text-xs text-gold hover:text-gold-light"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-obsidian-light/50 transition-colors border-b border-slate-800/50 last:border-0 ${!n.readAt ? 'bg-gold/5' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.readAt && <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />}
                    <div className={!n.readAt ? '' : 'ml-3.5'}>
                      <p className="text-sm font-medium text-slate-200 leading-tight">{n.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-snug line-clamp-2">{n.body}</p>
                      <p className="text-[10px] text-slate-600 mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
