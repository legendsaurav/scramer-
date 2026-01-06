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
  created_at?: string;
  edited_at?: string | null;
};

type DraftRow = {
  project_id: string;
  user_id: string;
  user_name?: string;
  content?: string;
  updated_at?: string;
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

const mapDraftRow = (row: DraftRow): DraftMessage => ({
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
      const [{ data: messageRows, error: messageError }, { data: draftRows, error: draftError }] = await Promise.all([
        supabase
          .from('chat_messages')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true }),
        supabase
          .from('chat_drafts')
          .select('*')
          .eq('project_id', projectId)
      ]);

      if (cancelled) return;

      if (messageError || draftError) {
        setError(messageError?.message || draftError?.message || 'Unable to load chat');
        setMessages([]);
        setDrafts([]);
        setCurrentDraft('');
        return;
      }

      setMessages(sortByTimestamp((messageRows || []).map(mapMessageRow)));
      const mappedDrafts = sortDrafts((draftRows || []).map(mapDraftRow));
      setDrafts(mappedDrafts);
      if (currentUser) {
        const mine = mappedDrafts.find((draft) => draft.userId === currentUser.id);
        setCurrentDraft(mine?.content || '');
      } else {
        setCurrentDraft('');
      }
    };

    fetchInitial();

    return () => {
      cancelled = true;
    };
  }, [projectId, currentUser?.id]);

  useEffect(() => {
    if (!projectId || !supabase || !isSupabaseConfigured) return;

    const channel = supabase
      .channel(`chat-messages-${projectId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_messages', filter: `project_id=eq.${projectId}` },
        (payload: RealtimePostgresChangesPayload<MessageRow>) => {
          setMessages((prev) => {
            if (payload.eventType === 'DELETE' && payload.old) {
              return prev.filter((msg) => msg.id !== payload.old.id);
            }

            if (!payload.new) return prev;
            const incoming = mapMessageRow(payload.new as MessageRow);
            const existingIndex = prev.findIndex((msg) => msg.id === incoming.id);
            if (existingIndex === -1) {
              return sortByTimestamp([...prev, incoming]);
            }
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

  useEffect(() => {
    if (!projectId || !supabase || !isSupabaseConfigured) return;

    const channel = supabase
      .channel(`chat-drafts-${projectId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_drafts', filter: `project_id=eq.${projectId}` },
        (payload: RealtimePostgresChangesPayload<DraftRow>) => {
          setDrafts((prev) => {
            if (payload.eventType === 'DELETE' && payload.old) {
              const filtered = prev.filter((draft) => draft.userId !== payload.old.user_id);
              return sortDrafts(filtered);
            }

            if (!payload.new) return prev;
            const incoming = mapDraftRow(payload.new as DraftRow);
            const filtered = prev.filter((draft) => draft.userId !== incoming.userId);
            return sortDrafts([...filtered, incoming]);
          });

          if (currentUser && (payload.new as DraftRow)?.user_id === currentUser.id) {
            setCurrentDraft((payload.new as DraftRow)?.content || '');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, currentUser?.id]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!projectId || !currentUser || !supabase || !isSupabaseConfigured) return;
      const trimmed = content.trim();
      if (!trimmed) return;

      const { error: insertError } = await supabase.from('chat_messages').insert({
        project_id: projectId,
        user_id: currentUser.id,
        user_name: currentUser.name,
        avatar: currentUser.avatar,
        content: trimmed
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      await supabase
        .from('chat_drafts')
        .delete()
        .match({ project_id: projectId, user_id: currentUser.id });
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
        .from('chat_messages')
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

      const trimmed = value.trim();
      if (!trimmed) {
        await supabase
          .from('chat_drafts')
          .delete()
          .match({ project_id: projectId, user_id: currentUser.id });
        return;
      }

      await supabase.from('chat_drafts').upsert(
        {
          project_id: projectId,
          user_id: currentUser.id,
          user_name: currentUser.name,
          content: value,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'project_id,user_id' }
      );
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
