
export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export enum SoftwareType {
  MATLAB = 'MATLAB',
  SOLIDWORKS = 'SolidWorks',
  PROTEUS = 'Proteus',
  VSCODE = 'VS Code',
  AUTOCAD = 'AutoCAD',
  ARDUINO = 'Arduino',
  GITHUB = 'GitHub'
}

export interface SoftwareToolConfig {
  id: SoftwareType;
  name: string;
  url: string;
  description: string;
  iconBg: string;
  logoUrl: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  password?: string;
  passwordHint?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  members: string[]; 
  status: 'active' | 'archived' | 'completed';
  lastActivity: string;
}

export interface MeetingRecording {
  id: string;
  projectId: string;
  title: string;
  date: string;
  duration: string;
  thumbnailUrl: string;
  videoUrl: string;
  participants: User[];
  summary?: string;
}

export interface SoftwareSession {
  id: string;
  projectId: string;
  userId: string;
  software: SoftwareType;
  date: string;
  totalDuration: string;
  sessionCount: number;
  videoUrl: string;
  status: 'processing' | 'ready';
}

export interface ChatMessage {
  id: string;
  projectId: string;
  userId: string;
  userName?: string;
  avatar?: string;
  content: string;
  timestamp: string;
  editedAt?: string;
  type: 'text' | 'system';
}

export interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

export interface Announcement {
  id: string;
  projectId: string;
  authorId: string;
  content: string;
  timestamp: string;
  reactions: Reaction[];
}

export interface DraftMessage {
  projectId: string;
  userId: string;
  userName?: string;
  content: string;
  updatedAt: string;
}

export type ViewState = 'DASHBOARD' | 'PROJECT_DETAIL';

export interface AppState {
  currentView: ViewState;
  selectedProjectId: string | null;
  activeTab: 'overview' | 'meetings' | 'sessions' | 'chat' | 'announcements';
  darkMode: boolean;
}
