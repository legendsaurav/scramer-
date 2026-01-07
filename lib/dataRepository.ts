import { supabase } from './supabaseClient';
import { Announcement, ChatMessage, MeetingRecording, Project, SoftwareSession, UserRole } from '../types';

export type ProjectRow = {
  id: string;
  name: string;
  description?: string;
  members?: string[] | null;
  status?: string | null;
  last_activity?: string | null;
};

export type MeetingRow = {
  id: string;
  project_id: string;
  title: string;
  date: string;
  duration: string;
  thumbnail_url?: string | null;
  video_url?: string | null;
  participants?: { id: string; name: string; email: string; avatar?: string; role?: UserRole }[] | null;
  summary?: string | null;
};

export type SessionRow = {
  id: string;
  project_id: string;
  user_id: string;
  software: string;
  date: string;
  total_duration: string;
  session_count: number;
  video_url?: string | null;
  status: string;
};

export type AnnouncementRow = {
  id: string;
  project_id: string;
  author_id: string;
  content: string;
  timestamp: string;
  reactions?: any[] | null;
};

const mapProject = (row: ProjectRow): Project => ({
  id: row.id,
  name: row.name,
  description: row.description || '',
  members: Array.isArray(row.members) ? row.members : [],
  status: (row.status as Project['status']) || 'active',
  lastActivity: row.last_activity || new Date().toISOString()
});

const mapMeeting = (row: MeetingRow): MeetingRecording => ({
  id: row.id,
  projectId: row.project_id,
  title: row.title,
  date: row.date,
  duration: row.duration,
  thumbnailUrl: row.thumbnail_url || '',
  videoUrl: row.video_url || '',
  participants: (row.participants || []).map((p) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    avatar: p.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.email)}`,
    role: p.role || UserRole.MEMBER
  })),
  summary: row.summary || undefined
});

const mapSession = (row: SessionRow): SoftwareSession => ({
  id: row.id,
  projectId: row.project_id,
  userId: row.user_id,
  software: row.software as any,
  date: row.date,
  totalDuration: row.total_duration,
  sessionCount: row.session_count,
  videoUrl: row.video_url || '',
  status: row.status as any
});

const mapAnnouncement = (row: AnnouncementRow): Announcement => ({
  id: row.id,
  projectId: row.project_id,
  authorId: row.author_id,
  content: row.content,
  timestamp: row.timestamp,
  reactions: Array.isArray(row.reactions) ? row.reactions : []
});

export const fetchProjects = async (): Promise<Project[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('last_activity', { ascending: false });
  if (error) return [];
  return (data || []).map(mapProject);
};

export const createProject = async (
  name: string,
  description: string,
  creatorId: string
): Promise<Project | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('projects')
    .insert({
      name,
      description,
      members: [creatorId],
      status: 'active',
      last_activity: new Date().toISOString()
    })
    .select('*')
    .single();
  if (error || !data) return null;
  return mapProject(data as ProjectRow);
};

export const fetchMeetings = async (projectId: string): Promise<MeetingRecording[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('project_id', projectId)
    .order('date', { ascending: false });
  if (error) return [];
  return (data || []).map(mapMeeting);
};

export const fetchSessions = async (projectId: string): Promise<SoftwareSession[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('project_id', projectId)
    .order('date', { ascending: false });
  if (error) return [];
  return (data || []).map(mapSession);
};

export const fetchAnnouncements = async (projectId: string): Promise<Announcement[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('project_id', projectId)
    .order('timestamp', { ascending: false });
  if (error) return [];
  return (data || []).map(mapAnnouncement);
};
