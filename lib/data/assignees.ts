export interface Assignee {
  id: string;
  name: string;
  initials: string;
  avatarUrl: string;
  role: string;
}

// Static list of assignees with avatars from UI Avatars API
export const assignees: Assignee[] = [
  {
    id: "1",
    name: "Alex Johnson",
    initials: "AJ",
    avatarUrl: `https://ui-avatars.com/api/?name=Alex+Johnson&background=random`,
    role: "Frontend Developer",
  },
  {
    id: "2",
    name: "Taylor Smith",
    initials: "TS",
    avatarUrl: `https://api.dicebear.com/7.x/personas/svg?seed=Taylor`,
    role: "UX Designer",
  },
  {
    id: "3",
    name: "Jordan Lee",
    initials: "JL",
    avatarUrl: `https://ui-avatars.com/api/?name=Jordan+Lee&background=random`,
    role: "Backend Developer",
  },
  {
    id: "4",
    name: "Casey Morgan",
    initials: "CM",
    avatarUrl: `https://api.dicebear.com/7.x/personas/svg?seed=Casey`,
    role: "Project Manager",
  },
  {
    id: "5",
    name: "Riley Davis",
    initials: "RD",
    avatarUrl: `https://ui-avatars.com/api/?name=Riley+Davis&background=random`,
    role: "QA Engineer",
  },
];

// Alternative: Using Dicebear API for more stylized avatars
export const assigneesWithDicebearAvatars: Assignee[] = [
  {
    id: "user-1",
    name: "John Doe",
    initials: "JD",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    role: "Frontend Developer",
  },
  {
    id: "user-2",
    name: "Jane Smith",
    initials: "JS",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    role: "UX Designer",
  },
  {
    id: "user-3",
    name: "Alex Johnson",
    initials: "AJ",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    role: "Backend Developer",
  },
  {
    id: "user-4",
    name: "Sam Wilson",
    initials: "SW",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam",
    role: "Project Manager",
  },
  {
    id: "user-5",
    name: "Emily Chen",
    initials: "EC",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    role: "Data Scientist",
  },
  {
    id: "user-6",
    name: "Michael Brown",
    initials: "MB",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    role: "DevOps Engineer",
  },
  {
    id: "user-7",
    name: "Olivia Davis",
    initials: "OD",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia",
    role: "QA Engineer",
  },
  {
    id: "user-8",
    name: "David Miller",
    initials: "DM",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    role: "Product Owner",
  },
];
