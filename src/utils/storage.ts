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
type SankeyNode = {
  id: string;
  type: 'status' | 'stage';
};

type TransitionMap = {
  [K in JobStatus]?: {
    [T in JobStatus]?: number;
  };
};

type StageTransition = {
  sourceStatus: JobStatus;
  targetStatus: JobStatus;
  stageId: string;
  count: number;
};

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
    let events = this.getEvents(); // Use 'this' to refer to storage object
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
    const nodes: SankeyNode[] = [];
    const links: { source: string; target: string; value: number }[] = [];

    // Initialize with all possible job statuses
    const allStatuses: JobStatus[] = [
      'WISHLIST', 'EMAIL_INQUIRY', 'APPLIED', 'PHONE_SCREEN',
      'TECHNICAL', 'ONSITE', 'OFFER', 'REJECTED', 'WITHDRAWN'
    ];
    
    // Add status nodes
    allStatuses.forEach(status => {
      nodes.push({ id: status, type: 'status' });
    });

    // Track interview stages
    const stageNodes = new Set<string>();
    const stageTransitions: StageTransition[] = [];

    // Count applications in each status
    const statusCounts: { [key in JobStatus]?: number } = {};
    allStatuses.forEach(status => {
      statusCounts[status] = applications.filter(app => app.status === status).length;
    });

    // Process applications with interview stages
    applications.forEach(app => {
      if (app.interviewStages && app.interviewStages.length > 0) {
        // Add interview stage nodes
        app.interviewStages.forEach(stage => {
          const stageId = `STAGE_${stage.type}`;
          if (!stageNodes.has(stageId)) {
            stageNodes.add(stageId);
            nodes.push({ id: stageId, type: 'stage' });
          }

          // Track stage transitions
          const existingTransition = stageTransitions.find(
            t => t.sourceStatus === app.status && t.stageId === stageId
          );

          if (existingTransition) {
            existingTransition.count++;
          } else {
            stageTransitions.push({
              sourceStatus: app.status,
              targetStatus: app.status, // Current status is both source and target for active stages
              stageId,
              count: 1
            });
          }
        });
      }
    });

    // Add links for applications in each status
    allStatuses.forEach(status => {
      const count = statusCounts[status] || 0;
      if (count > 0) {
        // For non-final statuses, create links to potential next statuses
        if (!['OFFER', 'REJECTED', 'WITHDRAWN'].includes(status)) {
          // Add links to interview stages if they exist
          const stagesForStatus = stageTransitions.filter(t => t.sourceStatus === status);
          stagesForStatus.forEach(transition => {
            links.push({
              source: status,
              target: transition.stageId,
              value: transition.count
            });

            // Link from stage back to status
            links.push({
              source: transition.stageId,
              target: transition.targetStatus,
              value: transition.count
            });
          });

          // Add direct links to next possible statuses
          const nextStatuses = allStatuses.filter(s => 
            allStatuses.indexOf(s) > allStatuses.indexOf(status) &&
            !['WITHDRAWN'].includes(s)
          );

          nextStatuses.forEach(nextStatus => {
            const nextCount = applications.filter(
              app => app.status === nextStatus
            ).length;

            if (nextCount > 0) {
              links.push({
                source: status,
                target: nextStatus,
                value: nextCount
              });
            }
          });
        }
      }
    });

    // Filter out nodes with no connections
    const usedNodes = new Set<string>();
    links.forEach(link => {
      usedNodes.add(link.source);
      usedNodes.add(link.target);
    });

    return {
      nodes: nodes.filter(n => usedNodes.has(n.id)).map(n => n.id),
      links: links.filter(l => l.value > 0)
    };
  }
};
