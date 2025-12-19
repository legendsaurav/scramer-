import { User, UserRole, Project, MeetingRecording, SoftwareSession, Announcement, ChatMessage, SoftwareType, SoftwareToolConfig } from './types';

// Software Configuration
export const SOFTWARE_TOOLS: SoftwareToolConfig[] = [
  { 
    id: SoftwareType.ARDUINO, 
    name: 'Arduino IDE', 
    url: 'https://www.arduino.cc/en/software',
    description: 'Open-source electronic prototyping platform.',
    iconBg: 'bg-teal-600',
    logoUrl: 'https://cdn.worldvectorlogo.com/logos/arduino-1.svg'
  },
  { 
    id: SoftwareType.AUTOCAD, 
    name: 'AutoCAD Web', 
    url: 'https://web.autocad.com/',
    description: 'Computer-aided design (CAD) software.',
    iconBg: 'bg-red-700',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Autodesk_AutoCAD_2024_icon.svg'
  },
  { 
    id: SoftwareType.SOLIDWORKS, 
    name: 'SolidWorks', 
    url: 'https://www.solidworks.com/launch',
    description: 'Browser-based 3D CAD modeling.',
    iconBg: 'bg-red-600',
    logoUrl: 'https://cdn.worldvectorlogo.com/logos/solidworks.svg'
  },
  { 
    id: SoftwareType.MATLAB, 
    name: 'MATLAB Online', 
    url: 'https://matlab.mathworks.com/',
    description: 'Cloud-based numerical computing environment.',
    iconBg: 'bg-orange-600',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Matlab_Logo.png'
  },
  { 
    id: SoftwareType.VSCODE, 
    name: 'VS Code', 
    url: 'https://vscode.dev/',
    description: 'Code editing. Redefined.',
    iconBg: 'bg-blue-500',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg'
  },
  { 
    id: SoftwareType.PROTEUS, 
    name: 'Proteus', 
    url: 'https://labcenter.com/simulation',
    description: 'Circuit simulation and PCB design.',
    iconBg: 'bg-blue-600',
    // Using a generic reliable chip icon or finding a proteus representation
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/33/Proteus_Design_Suite_Atom_Logo.png/220px-Proteus_Design_Suite_Atom_Logo.png' 
  },
  { 
    id: SoftwareType.GITHUB, 
    name: 'GitHub', 
    url: 'https://github.com/',
    description: 'Version control and collaboration.',
    iconBg: 'bg-slate-800',
    logoUrl: 'https://cdn.worldvectorlogo.com/logos/github-icon-1.svg'
  }
];

// Mock Users
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alex Chen', email: 'alex@syncengine.io', role: UserRole.ADMIN, avatar: 'https://picsum.photos/id/1005/100/100' },
  { id: 'u2', name: 'Sarah Miller', email: 'sarah@syncengine.io', role: UserRole.MEMBER, avatar: 'https://picsum.photos/id/1011/100/100' },
  { id: 'u3', name: 'David Kim', email: 'david@syncengine.io', role: UserRole.MEMBER, avatar: 'https://picsum.photos/id/1025/100/100' },
];

// Mock Projects
export const MOCK_PROJECTS: Project[] = [
  { id: 'p1', name: 'Drone Chassis V2', description: 'Aerodynamics optimization and structural analysis for the next-gen consumer drone.', members: ['u1', 'u2'], status: 'active', lastActivity: '2023-10-24T10:30:00Z' },
  { id: 'p2', name: 'Autonomous Rover AI', description: 'MATLAB simulation and pathfinding algorithms for terrain traversal.', members: ['u1', 'u3'], status: 'active', lastActivity: '2023-10-23T14:15:00Z' },
  { id: 'p3', name: 'Circuit Board Rev 4', description: 'Power distribution unit PCB design in Proteus.', members: ['u2', 'u3'], status: 'completed', lastActivity: '2023-09-15T09:00:00Z' },
];

// Mock Meetings
export const MOCK_MEETINGS: MeetingRecording[] = [
  { 
    id: 'm1', 
    projectId: 'p1', 
    title: 'Weekly Sync: Aerodynamics Review', 
    date: '2023-10-24T10:00:00Z', 
    duration: '45:20', 
    thumbnailUrl: 'https://picsum.photos/id/1/400/225', 
    videoUrl: 'https://meet.google.com/iwb-tirx-vct', 
    participants: [MOCK_USERS[0], MOCK_USERS[1]],
    summary: 'Discussed drag coefficient results from SolidWorks Flow Simulation. Agreed to modify the arm struts.'
  },
  { 
    id: 'm2', 
    projectId: 'p1', 
    title: 'Sprint Planning', 
    date: '2023-10-20T09:00:00Z', 
    duration: '30:00', 
    thumbnailUrl: 'https://picsum.photos/id/2/400/225', 
    videoUrl: 'https://meet.google.com/iwb-tirx-vct', 
    participants: [MOCK_USERS[0], MOCK_USERS[1], MOCK_USERS[2]] 
  },
  { 
    id: 'm3', 
    projectId: 'p2', 
    title: 'Algorithm Debugging Session', 
    date: '2023-10-23T14:00:00Z', 
    duration: '1:15:00', 
    thumbnailUrl: 'https://picsum.photos/id/3/400/225', 
    videoUrl: 'https://meet.google.com/iwb-tirx-vct', 
    participants: [MOCK_USERS[0], MOCK_USERS[2]] 
  },
];

// Mock Software Sessions
export const MOCK_SESSIONS: SoftwareSession[] = [
  { id: 's1', projectId: 'p1', userId: 'u1', software: SoftwareType.SOLIDWORKS, date: '2023-10-24', totalDuration: '4h 15m', sessionCount: 3, videoUrl: '#', status: 'ready' },
  { id: 's2', projectId: 'p1', userId: 'u2', software: SoftwareType.MATLAB, date: '2023-10-24', totalDuration: '2h 30m', sessionCount: 2, videoUrl: '#', status: 'ready' },
  { id: 's3', projectId: 'p2', userId: 'u1', software: SoftwareType.VSCODE, date: '2023-10-23', totalDuration: '6h 00m', sessionCount: 5, videoUrl: '#', status: 'ready' },
  { id: 's4', projectId: 'p2', userId: 'u3', software: SoftwareType.PROTEUS, date: '2023-10-22', totalDuration: '1h 45m', sessionCount: 1, videoUrl: '#', status: 'ready' },
];

// Mock Announcements
export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { 
    id: 'a1', 
    projectId: 'p1', 
    authorId: 'u1', 
    content: '🚨 The final chassis STL files are uploaded. Please run the stress test simulations by Friday.', 
    timestamp: '2023-10-24T08:30:00Z',
    reactions: [
      { emoji: '👍', count: 2, userReacted: true },
      { emoji: '🔥', count: 1, userReacted: false }
    ]
  },
  { 
    id: 'a2', 
    projectId: 'p1', 
    authorId: 'u1', 
    content: 'Client meeting moved to next Tuesday due to holiday.', 
    timestamp: '2023-10-22T16:00:00Z',
    reactions: [
      { emoji: '✅', count: 3, userReacted: true }
    ]
  }
];

// Mock Chat
export const MOCK_CHAT: ChatMessage[] = [
  { id: 'c1', projectId: 'p1', userId: 'u2', content: 'Hey Alex, did you check the interference on the battery mount?', timestamp: '2023-10-24T11:00:00Z', type: 'text' },
  { id: 'c2', projectId: 'p1', userId: 'u1', content: 'Checking now. I think we have 2mm clearance.', timestamp: '2023-10-24T11:02:00Z', type: 'text' },
  { id: 'c3', projectId: 'p1', userId: 'u2', content: 'That might be too tight with thermal expansion.', timestamp: '2023-10-24T11:03:00Z', type: 'text' },
  { id: 'c4', projectId: 'p1', userId: 'u1', content: 'Agreed. I will move it 1mm outward.', timestamp: '2023-10-24T11:05:00Z', type: 'text' },
];