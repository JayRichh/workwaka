export type JobStatus = 
  | 'WISHLIST'           // Haven't applied yet, but interested
  | 'EMAIL_INQUIRY'      // Initial email sent
  | 'APPLIED'           // Application submitted
  | 'PHONE_SCREEN'      // First interview/phone screen
  | 'TECHNICAL'         // Technical interview
  | 'ONSITE'           // Onsite/Final rounds
  | 'OFFER'            // Received offer
  | 'REJECTED'         // Application rejected
  | 'WITHDRAWN';       // Withdrew application

export type JobType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'INTERNSHIP'
  | 'FREELANCE';

export type CompanySize =
  | 'STARTUP'      // <50 employees
  | 'SMALL'        // 50-200 employees
  | 'MEDIUM'       // 201-1000 employees
  | 'LARGE'        // 1001-5000 employees
  | 'ENTERPRISE';  // 5000+ employees

export type InterviewType =
  | 'PHONE_SCREEN'
  | 'TECHNICAL'
  | 'BEHAVIORAL'
  | 'SYSTEM_DESIGN'
  | 'CODING'
  | 'ONSITE'
  | 'TEAM_FIT'
  | 'HIRING_MANAGER'
  | 'HR_FINAL'
  | 'OTHER';

export type InterviewOutcome =
  | 'SCHEDULED'    // Interview is scheduled but hasn't happened yet
  | 'PENDING'      // Interview happened, waiting for feedback
  | 'PASSED'       // Successfully passed the interview
  | 'FAILED'       // Did not pass the interview
  | 'CANCELLED'    // Interview was cancelled
  | 'RESCHEDULED'; // Interview was rescheduled

export interface Salary {
  min: number;
  max: number;
  currency: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

export interface InterviewStage {
  id: string;
  type: InterviewType;
  scheduledDate: string;  // ISO date string
  duration: number;       // Duration in minutes
  location?: string;      // Physical location or video call link
  isRemote: boolean;
  interviewers?: Contact[];
  notes?: string;
  outcome: InterviewOutcome;
  feedback?: string;
  nextSteps?: string;
  followUpDate?: string;  // ISO date string
}

export interface CalendarEvent {
  id: string;
  applicationId: string;
  type: 'INTERVIEW' | 'FOLLOW_UP' | 'DEADLINE';
  title: string;
  description?: string;
  startDate: string;     // ISO date string
  endDate: string;       // ISO date string
  isAllDay: boolean;
  location?: string;
  interviewStageId?: string;  // Reference to InterviewStage if type is 'INTERVIEW'
}

export interface RequiredDocuments {
  resume: boolean;
  coverLetter: boolean;
  portfolio: boolean;
  references: boolean;
  other?: string[];
}

export interface JobApplication {
  id: string;
  jobTitle: string;
  companyName: string;
  location: string;
  jobType: JobType;
  status: JobStatus;
  salary?: Salary;
  dateApplied: string;     // ISO date string
  dateModified: string;    // ISO date string
  applicationDeadline?: string;  // ISO date string
  companySize?: CompanySize;
  industry?: string;       // e.g., "Technology", "Healthcare", "Finance"
  remote?: boolean;
  source?: string;         // e.g., "LinkedIn", "Company Website", "Referral"
  notes?: string;
  contacts: Contact[];
  interviewStages: InterviewStage[];
  tags: string[];          // Custom tags for filtering
  url?: string;            // Job posting URL
  followUpDate?: string;   // Next follow-up date
  events: CalendarEvent[]; // All calendar events related to this application
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  requiredDocuments?: RequiredDocuments;
}

export interface FilterOptions {
  search: string;
  status: JobStatus[];
  jobType: JobType[];
  companySize: CompanySize[];
  remote: boolean | null;
  dateRange: {
    start: string;
    end: string;
  } | null;
  hasUpcomingEvents: boolean;
  priority: ('LOW' | 'MEDIUM' | 'HIGH')[];
  tags: string[];
}

export interface CalendarViewOptions {
  view: 'month' | 'week' | 'day' | 'agenda';
  showEventTypes: {
    interviews: boolean;
    followUps: boolean;
    deadlines: boolean;
  };
  groupBy: 'none' | 'company' | 'status' | 'type';
}

export interface SortOptions {
  field: keyof JobApplication | 'nextEvent';
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
}
