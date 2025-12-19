
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
  password?: string; // Optional for mock users, required for new users
  passwordHint?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  members: string[]; // User IDs
  status: 'active' | 'archived' | 'completed';
  lastActivity: string;
}

export interface MeetingRecording {
  id: string;
  projectId: string;
  title: string;
  date: string; // ISO String
  duration: string; // e.g., "45:00"
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
  date: string; // YYYY-MM-DD
  totalDuration: string; // "3h 20m"
  sessionCount: number; // How many fragments were merged
  videoUrl: string;
  status: 'processing' | 'ready';
}

export interface ChatMessage {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  timestamp: string;
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

export type ViewState = 'DASHBOARD' | 'PROJECT_DETAIL';

export interface AppState {
  currentUser: User;
  currentView: ViewState;
  selectedProjectId: string | null;
  activeTab: 'overview' | 'meetings' | 'sessions' | 'chat' | 'announcements';
  darkMode: boolean;
}
