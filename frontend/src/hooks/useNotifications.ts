import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notifications.api';
import { useSocket } from '../context/SocketContext';
import { Notification } from '../types/api';

export function useNotifications() {
  const socket = useSocket();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getAll,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!socket) return;

    const handler = (notification: Notification) => {
      queryClient.setQueryData<{ data: Notification[]; unreadCount: number }>(
        ['notifications'],
        (old) => {
          if (!old) return { data: [notification], unreadCount: 1 };
          return {
            data: [notification, ...old.data],
            unreadCount: old.unreadCount + 1,
          };
        },
      );
    };

    socket.on('notification:new', handler);
    return () => { socket.off('notification:new', handler); };
  }, [socket, queryClient]);

  return query;
}
