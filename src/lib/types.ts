export type Role = "teacher" | "leadership" | "admin";

export type LearnHow = "team_evening" | "video_doc" | "one_on_one";

export type Institution = {
  id: string;
  symbol: string;
  name: string;
  domain: string;
};

export type Teacher = {
  id: string;
  institutionId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
};

export type Period = {
  id: string;
  name: string;
  months: string;
  order: number;
};

export type Tool = {
  id: string;
  periodId: string;
  name: string;
  subtitle: string;
  icon: "classroom" | "gemini" | "forms" | "drive" | "meet" | "sites";
  color: string;
  description: string;
  order: number;
};

export type Capability = {
  id: string;
  toolId: string;
  title: string;
  description: string;
  order: number;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
};

export type Lesson = {
  id: string;
  capabilityId: string;
  title: string;
  body: string;
  videoUrl?: string;
  quiz: QuizQuestion[];
  autoCompleteOnQuiz: boolean;
};

export type CapabilityResponse = {
  teacherId: string;
  capabilityId: string;
  wantToLearn: boolean;
  learnHow?: LearnHow;
  mastered: boolean;
  hasProduct: boolean;
  readyToTeach: boolean;
  savedForLater: boolean;
  completedLearning: boolean;
  updatedAt: string;
};

export type Reaction = {
  teacherId: string;
  capabilityId: string;
  liked: boolean;
  productNote?: string;
  productImage?: string;
  createdAt: string;
};

export type Meeting = {
  id: string;
  title: string;
  topic: string;
  datetime: string;
  location: string;
  description: string;
};

export type MeetingRsvp = {
  teacherId: string;
  meetingId: string;
  planningToAttend: boolean;
  attended: boolean;
};

export type BadgeDef = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export type Settings = {
  adminEmails: string[];
  praiseNote: string;
  weakIdFormOpen: boolean;
};

export type AppData = {
  institutions: Institution[];
  teachers: Teacher[];
  periods: Period[];
  tools: Tool[];
  capabilities: Capability[];
  lessons: Lesson[];
  responses: CapabilityResponse[];
  reactions: Reaction[];
  meetings: Meeting[];
  rsvps: MeetingRsvp[];
  badges: BadgeDef[];
  settings: Settings;
};

export type Session = {
  institutionId: string;
  teacherId: string;
  email: string;
  googleLinked: boolean;
};

export type RouteName =
  | "welcome"
  | "who"
  | "checklist"
  | "learn"
  | "lesson"
  | "profile"
  | "meetings"
  | "admin"
  | "cms";
