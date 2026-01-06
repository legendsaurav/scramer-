import { useCallback, useEffect, useMemo, useState } from 'react';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { ChatMessage, DraftMessage, User } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const EDIT_WINDOW_MS = 5 * 60 * 1000;

type MessageRow = {
  id: string;
  project_id: string;
  user_id: string;
  user_name?: string;
  avatar?: string;
  content?: string;
  // App originally used created_at; your table uses timestamp
  timestamp?: string; // messages.timestamp
  created_at?: string; // legacy/chat_messages.created_at
  edited_at?: string | null;
};

const mapMessageRow = (row: MessageRow): ChatMessage => ({
  id: row.id,
  projectId: row.project_id,
  userId: row.user_id,
  userName: row.user_name || row.user_id,
  avatar: row.avatar,
  content: row.content || '',
  timestamp: row.created_at || new Date().toISOString(),
  editedAt: row.edited_at || undefined,
  type: 'text'
});

// Drafts are kept client-side only unless you add a `drafts` table.
const mapDraftRow = (row: { project_id: string; user_id: string; user_name?: string; content?: string; updated_at?: string; }): DraftMessage => ({
  projectId: row.project_id,
  userId: row.user_id,
  userName: row.user_name || row.user_id,
  content: row.content || '',
  updatedAt: row.updated_at || new Date().toISOString()
});

const sortByTimestamp = (messages: ChatMessage[]) =>
  [...messages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

const sortDrafts = (drafts: DraftMessage[]) =>
  [...drafts].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

export const useRealtimeChat = (projectId: string | null, currentUser: User | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [drafts, setDrafts] = useState<DraftMessage[]>([]);
  const [currentDraft, setCurrentDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const canEditMessage = useCallback(
    (message: ChatMessage, userId: string) => {
      if (message.userId !== userId) return false;
      const messageAge = Date.now() - new Date(message.timestamp).getTime();
      return messageAge <= EDIT_WINDOW_MS;
    },
    []
  );

  useEffect(() => {
    if (!projectId || !supabase || !isSupabaseConfigured) {
      setMessages([]);
      setDrafts([]);
      setCurrentDraft('');
      return;
    }

    let cancelled = false;
    const fetchInitial = async () => {
      setError(null);
      // Use the "messages" table (existing in your project)
      const { data: messageRows, error: messageError } = await supabase
        .from('messages')
        .select('*')
        .eq('project_id', projectId)
        // Prefer "timestamp" if present; otherwise created_at
        .order('timestamp', { ascending: true })
        .order('created_at', { ascending: true });

      if (cancelled) return;

      if (messageError) {
        setError(messageError.message || 'Unable to load chat');
        setMessages([]);
        setDrafts([]);
        setCurrentDraft('');
        return;
      }

      setMessages(sortByTimestamp((messageRows || []).map(mapMessageRow)));
      // Keep drafts client-side unless you add a table
      setDrafts([]);
      setCurrentDraft('');
    };

    fetchInitial();

    return () => {
      cancelled = true;
    };
  }, [projectId, currentUser?.id]);

  useEffect(() => {
    if (!projectId || !supabase || !isSupabaseConfigured) return;

    const channel = supabase
      .channel(`messages-${projectId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `project_id=eq.${projectId}` },
        (payload: RealtimePostgresChangesPayload<MessageRow>) => {
          setMessages((prev) => {
            if (payload.eventType === 'DELETE' && payload.old) {
              return prev.filter((msg) => msg.id !== (payload.old as any).id);
            }
            if (!payload.new) return prev;
            const incoming = mapMessageRow(payload.new as MessageRow);
            const existingIndex = prev.findIndex((msg) => msg.id === incoming.id);
            if (existingIndex === -1) return sortByTimestamp([...prev, incoming]);
            const clone = [...prev];
            clone[existingIndex] = incoming;
            return sortByTimestamp(clone);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  // Drafts realtime removed; keep client-only. If you add a `drafts` table,
  // re-enable a realtime channel here similar to messages.

  const sendMessage = useCallback(
    async (content: string) => {
      if (!projectId || !currentUser || !supabase || !isSupabaseConfigured) return;
      const trimmed = content.trim();
      if (!trimmed) return;

      const { error: insertError } = await supabase.from('messages').insert({
        project_id: projectId,
        user_id: currentUser.id,
        content: trimmed,
        timestamp: new Date().toISOString(),
        type: 'text'
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      setCurrentDraft('');
    },
    [projectId, currentUser?.id]
  );

  const editMessage = useCallback(
    async (messageId: string, content: string) => {
      if (!projectId || !currentUser || !supabase || !isSupabaseConfigured) return false;
      const trimmed = content.trim();
      if (!trimmed) return false;

      const { error: updateError } = await supabase
        .from('messages')
        .update({ content: trimmed, edited_at: new Date().toISOString() })
        .match({ id: messageId, user_id: currentUser.id, project_id: projectId });

      if (updateError) {
        setError(updateError.message);
        return false;
      }

      return true;
    },
    [projectId, currentUser?.id]
  );

  const saveDraft = useCallback(
    async (value: string) => {
      setCurrentDraft(value);
      if (!projectId || !currentUser || !supabase || !isSupabaseConfigured) return;
      // Keep drafts client-side only for now.
    },
    [projectId, currentUser?.id]
  );

  const value = useMemo(
    () => ({
      messages,
      drafts,
      currentDraft,
      error,
      sendMessage,
      editMessage,
      saveDraft,
      canEditMessage,
      editWindowMs: EDIT_WINDOW_MS
    }),
    [messages, drafts, currentDraft, error, sendMessage, editMessage, saveDraft, canEditMessage]
  );

  return value;
};
