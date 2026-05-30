import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { messagesApi } from '../api/messages.api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';
import { MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Conversation } from '../types/api';

function getOtherUser(conv: Conversation, myId: string) {
  return conv.user1Id === myId ? conv.user2 : conv.user1;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: messagesApi.getConversations,
  });

  if (isLoading) return <div className="flex items-center justify-center py-32"><Spinner size={40} /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-display font-bold text-slate-100 mb-6 flex items-center gap-2">
        <MessageSquare className="text-gold" size={24} />
        Messages
      </h1>

      {!conversations || conversations.length === 0 ? (
        <div className="card-surface p-12 text-center text-slate-500">
          <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p>No conversations yet</p>
          <p className="text-sm mt-1">Start a conversation from a listing or auction page.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const other = getOtherUser(conv, user!.id);
            const lastMsg = conv.messages?.[0];
            const hasUnread = (conv.unreadCount ?? 0) > 0;
            return (
              <Link
                key={conv.id}
                to={`/messages/${conv.id}`}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors hover:border-gold/30 ${hasUnread ? 'bg-gold/5 border-gold/20' : 'card-surface'}`}
              >
                <div className="w-10 h-10 rounded-full bg-obsidian-light flex items-center justify-center text-gold font-bold text-sm shrink-0 border border-slate-700">
                  {other.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-medium text-sm ${hasUnread ? 'text-slate-100' : 'text-slate-300'}`}>
                      {other.username}
                    </span>
                    {conv.lastMsgAt && (
                      <span className="text-[10px] text-slate-600 shrink-0">
                        {formatDistanceToNow(new Date(conv.lastMsgAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  {lastMsg && (
                    <p className={`text-xs truncate mt-0.5 ${hasUnread ? 'text-slate-300' : 'text-slate-500'}`}>
                      {lastMsg.sender.id === user!.id ? 'You: ' : ''}{lastMsg.content}
                    </p>
                  )}
                  {(conv.auctionId || conv.listingId) && (
                    <p className="text-[10px] text-gold/60 mt-0.5">
                      {conv.auctionId ? 'Auction' : 'Listing'} conversation
                    </p>
                  )}
                </div>
                {hasUnread && (
                  <span className="w-5 h-5 rounded-full bg-gold text-obsidian-dark text-[10px] font-bold flex items-center justify-center shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
