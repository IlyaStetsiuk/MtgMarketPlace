import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { messagesApi } from '../api/messages.api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Spinner from '../components/ui/Spinner';
import { ChevronLeft, Send } from 'lucide-react';
import { format } from 'date-fns';
import { Conversation, Message } from '../types/api';

function getOtherUser(conv: Conversation, myId: string) {
  return conv.user1Id === myId ? conv.user2 : conv.user1;
}

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const socket = useSocket();
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: conv, isLoading } = useQuery({
    queryKey: ['conversation', id],
    queryFn: () => messagesApi.getConversation(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('join:conversation', id);
    return () => { socket.emit('leave:conversation', id); };
  }, [socket, id]);

  useEffect(() => {
    if (!socket || !id) return;

    const handler = (msg: Message) => {
      queryClient.setQueryData<Conversation>(['conversation', id], (old) => {
        if (!old) return old;
        const already = old.messages?.find((m) => m.id === msg.id);
        if (already) return old;
        return { ...old, messages: [...(old.messages ?? []), msg] };
      });
    };

    socket.on('message:new', handler);
    return () => { socket.off('message:new', handler); };
  }, [socket, id, queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conv?.messages?.length]);

  async function handleSend() {
    if (!input.trim() || !id || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);
    try {
      const msg = await messagesApi.sendMessage(id, content);
      queryClient.setQueryData<Conversation>(['conversation', id], (old) => {
        if (!old) return old;
        const already = old.messages?.find((m) => m.id === msg.id);
        if (already) return old;
        return { ...old, messages: [...(old.messages ?? []), msg] };
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } finally {
      setSending(false);
    }
  }

  if (isLoading) return <div className="flex items-center justify-center py-32"><Spinner size={40} /></div>;
  if (!conv) return <div className="text-center py-32 text-slate-500">Conversation not found</div>;

  const other = getOtherUser(conv, user!.id);
  const messages = conv.messages ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <Link to="/messages" className="text-slate-500 hover:text-gold">
          <ChevronLeft size={20} />
        </Link>
        <div className="w-9 h-9 rounded-full bg-obsidian-light flex items-center justify-center text-gold font-bold text-sm border border-slate-700">
          {other.username[0].toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-slate-200">{other.username}</p>
          {(conv.auctionId || conv.listingId) && (
            <p className="text-xs text-gold/60">
              {conv.auctionId ? (
                <Link to={`/auctions/${conv.auctionId}`} className="hover:text-gold">View Auction</Link>
              ) : (
                <Link to={`/listings/${conv.listingId}`} className="hover:text-gold">View Listing</Link>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.length === 0 && (
          <p className="text-slate-600 text-sm text-center py-8">No messages yet. Say hello!</p>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.senderId === user!.id;
          const showDate = i === 0 || format(new Date(messages[i - 1].createdAt), 'yyyy-MM-dd') !== format(new Date(msg.createdAt), 'yyyy-MM-dd');
          return (
            <div key={msg.id}>
              {showDate && (
                <div className="text-center text-[10px] text-slate-600 my-2">
                  {format(new Date(msg.createdAt), 'MMMM d, yyyy')}
                </div>
              )}
              <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? 'bg-gold/20 text-slate-100 rounded-br-sm'
                      : 'bg-obsidian-light border border-slate-700 text-slate-200 rounded-bl-sm'
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-gold/50 text-right' : 'text-slate-600'}`}>
                    {format(new Date(msg.createdAt), 'HH:mm')}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-end gap-2 pt-3 border-t border-slate-800 shrink-0">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Type a message…"
          rows={1}
          className="flex-1 bg-obsidian-light border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-gold/50 resize-none"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="w-10 h-10 rounded-xl bg-gold text-obsidian-dark flex items-center justify-center hover:bg-gold-light transition-colors disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
