import {
  JobApplication,
  JobStatus,
  InterviewStage,
  CalendarEvent,
  InterviewType,
  Salary,
} from '../types';

const STORAGE_KEY = 'jobApplications';
const EVENTS_KEY = 'calendarEvents';

export const storage = {
  getApplications: (): JobApplication[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveApplication: (application: JobApplication): void => {
    const applications = storage.getApplications();
    const existingIndex = applications.findIndex(
      (app) => app.id === application.id
    );

    if (existingIndex >= 0) {
      applications[existingIndex] = application;
    } else {
      applications.push(application);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  },

  deleteApplication: (id: string): void => {
    const applications = storage.getApplications();
    const filtered = applications.filter((app) => app.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  searchApplications: (query: string): JobApplication[] => {
    const applications = storage.getApplications();
    const lowerQuery = query.toLowerCase();

    return applications.filter(
      (app) =>
        app.jobTitle.toLowerCase().includes(lowerQuery) ||
        app.companyName.toLowerCase().includes(lowerQuery) ||
        app.location.toLowerCase().includes(lowerQuery) ||
        app.notes?.toLowerCase().includes(lowerQuery)
    );
  },

  filterApplications: (filters: {
    status?: JobStatus[];
    jobType?: JobApplication['jobType'][];
    companySize?: JobApplication['companySize'][];
    remote?: boolean;
    dateRange?: { start: string; end: string };
  }): JobApplication[] => {
    let applications = storage.getApplications();

    if (filters.status?.length) {
      applications = applications.filter((app) =>
        filters.status?.includes(app.status)
      );
    }

    if (filters.jobType?.length) {
      applications = applications.filter((app) =>
        filters.jobType?.includes(app.jobType)
      );
    }

    if (filters.companySize?.length) {
      applications = applications.filter(
        (app) =>
          app.companySize &&
          filters.companySize?.includes(app.companySize)
      );
    }

    if (filters.remote !== undefined) {
      applications = applications.filter((app) => app.remote === filters.remote);
    }

    if (filters.dateRange) {
      applications = applications.filter((app) => {
        const appDate = new Date(app.dateApplied);
        const start = new Date(filters.dateRange!.start);
        const end = new Date(filters.dateRange!.end);
        return appDate >= start && appDate <= end;
      });
    }

    return applications;
  },

  getEvents(): CalendarEvent[] {
    const data = localStorage.getItem(EVENTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  addEvent(event: CalendarEvent): void {
    let events = this.getEvents();
    events.push(event);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  },

  addInterviewToApplication: (
    appId: string,
    interview: InterviewStage,
    event: CalendarEvent
  ): void => {
    const applications = storage.getApplications();
    const appIndex = applications.findIndex((app) => app.id === appId);
    if (appIndex !== -1) {
      const application = applications[appIndex];
      application.interviewStages = application.interviewStages || [];
      application.interviewStages.push(interview);
      application.events = application.events || [];
      application.events.push(event);
      storage.saveApplication(application);
    }
  },

  getSankeyData: () => {
    const applications = storage.getApplications();
    
    if (applications.length === 0) {
      return { nodes: [], links: [] };
    }

    // Create a special node for total applications
    const totalNode = 'Total Applications';
    const nodes: string[] = [totalNode];

    // Count applications by status
    const statusCounts = new Map<JobStatus, number>();
    applications.forEach(app => {
      const count = statusCounts.get(app.status) || 0;
      statusCounts.set(app.status, count + 1);
    });

    // Add nodes for statuses that have applications
    const activeStatuses = Array.from(statusCounts.keys());
    nodes.push(...activeStatuses);

    // Create links from total to each status
    const links: { source: string; target: string; value: number }[] = [];
    
    // Add links from total to each status
    activeStatuses.forEach(status => {
      const count = statusCounts.get(status) || 0;
      if (count > 0) {
        links.push({
          source: totalNode,
          target: status,
          value: count
        });
      }
    });

    return {
      nodes,
      links: links.filter(link => link.value > 0)
    };
  }
};
