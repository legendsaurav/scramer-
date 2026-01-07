type Ann = { id: string; project_id: string; author_id: string; content: string; timestamp: string };
type Msg = { id: string; project_id: string; user_id: string; content: string; type: string; timestamp: string };

const keyA = (pid: string) => `fallback_announcements_${pid}`;
const keyM = (pid: string) => `fallback_messages_${pid}`;

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function write<T>(key: string, value: T[]): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export const FallbackCloud = {
  getAnnouncements(projectId: string): Ann[] {
    return read<Ann>(keyA(projectId));
  },
  addAnnouncement(projectId: string, ann: Ann): void {
    const list = read<Ann>(keyA(projectId));
    write(keyA(projectId), [ann, ...list]);
  },
  getMessages(projectId: string): Msg[] {
    return read<Msg>(keyM(projectId));
  },
  addMessage(projectId: string, msg: Msg): void {
    const list = read<Msg>(keyM(projectId));
    write(keyM(projectId), [...list, msg]);
  }
};

export type { Ann as FallbackAnnouncement, Msg as FallbackMessage };