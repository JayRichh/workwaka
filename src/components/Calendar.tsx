import React, { useState, useEffect, Fragment } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  parseISO,
  addMinutes,
} from 'date-fns';
import {
  JobApplication,
  CalendarEvent,
  InterviewStage,
} from '../types';
import { storage } from '../utils/storage';
import {
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Modal } from './Modal';
import { v4 as uuidv4 } from 'uuid';
import { AddEventForm } from './AddEventForm';
import { AddInterviewForm } from './AddInterviewForm';

interface CalendarProps {
  onAddApplication: (date: Date) => void;
  onSelectApplication: (job: JobApplication) => void;
  onSelectEvent?: (event: CalendarEvent) => void;
}

export function Calendar({
  onAddApplication,
  onSelectApplication,
  onSelectEvent,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddEventOpen, setIsAddEventOpen] = useState<boolean>(false);
  const [isAddInterviewOpen, setIsAddInterviewOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const loadApplicationsAndEvents = () => {
      const apps = storage.getApplications();
      setApplications(apps);
      const appEvents = apps.flatMap((app) => app.events || []);
      const standaloneEvents = storage.getEvents();
      setEvents([...appEvents, ...standaloneEvents]);
    };

    loadApplicationsAndEvents();
    const interval = setInterval(loadApplicationsAndEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getApplicationsForDay = (date: Date) => {
    return applications.filter((app) =>
      isSameDay(parseISO(app.dateApplied), date)
    );
  };

  const getEventsForDay = (date: Date) => {
    return events.filter((event) =>
      isSameDay(parseISO(event.startDate), date)
    );
  };

  const getEventColor = (eventType: CalendarEvent['type']) => {
    switch (eventType) {
      case 'INTERVIEW':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 border-blue-200 dark:border-blue-800';
      case 'FOLLOW_UP':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 border-purple-200 dark:border-purple-800';
      case 'DEADLINE':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700';
    }
  };

  const formatEventTime = (event: CalendarEvent) => {
    const startTime = format(parseISO(event.startDate), 'h:mm a');
    if (event.isAllDay) return 'All day';
    if (!event.endDate) return startTime;
    const endTime = format(parseISO(event.endDate), 'h:mm a');
    return `${startTime} - ${endTime}`;
  };

  const previousMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1)
    );
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
  };

  const downloadICSFile = (event: CalendarEvent) => {
    const startDate = new Date(event.startDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = event.endDate 
      ? new Date(event.endDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      : new Date(addMinutes(new Date(event.startDate), 60)).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddEvent = (eventData: Partial<CalendarEvent>) => {
    if (!selectedDate) return;
    const newEvent: CalendarEvent = {
      id: uuidv4(),
      applicationId: '',
      type: eventData.type || 'DEADLINE',
      title: eventData.title || 'New Event',
      startDate: eventData.startDate || selectedDate.toISOString(),
      endDate:
        eventData.endDate ||
        (eventData.isAllDay
          ? selectedDate.toISOString()
          : addMinutes(selectedDate, 60).toISOString()),
      isAllDay: eventData.isAllDay || false,
      description: eventData.description || '',
      location: eventData.location || '',
    };
    storage.addEvent(newEvent);
    setEvents((prev) => [...prev, newEvent]);
    setIsAddEventOpen(false);
  };

  const handleAddInterview = (
    job: JobApplication,
    interviewData: Partial<InterviewStage>
  ) => {
    if (!selectedDate) return;
    const newInterview: InterviewStage = {
      id: uuidv4(),
      type: interviewData.type || 'PHONE_SCREEN',
      scheduledDate:
        interviewData.scheduledDate || selectedDate.toISOString(),
      duration: interviewData.duration || 60,
      isRemote: interviewData.isRemote ?? true,
      outcome: 'SCHEDULED',
      location: interviewData.location || '',
      notes: interviewData.notes || '',
    };

    const newEvent: CalendarEvent = {
      id: uuidv4(),
      applicationId: job.id,
      type: 'INTERVIEW',
      title: `${newInterview.type.replace(/_/g, ' ')} Interview - ${job.companyName}`,
      startDate: newInterview.scheduledDate,
      endDate: addMinutes(
        parseISO(newInterview.scheduledDate),
        newInterview.duration
      ).toISOString(),
      isAllDay: false,
      location: newInterview.location || (newInterview.isRemote ? 'Remote Interview' : ''),
      description: `Interview for ${job.jobTitle} position at ${job.companyName}\n\nNotes: ${newInterview.notes || 'No notes provided'}`,
      interviewStageId: newInterview.id,
    };

    storage.addInterviewToApplication(job.id, newInterview, newEvent);
    setApplications((prev) =>
      prev.map((app) =>
        app.id === job.id
          ? {
              ...app,
              interviewStages: [...(app.interviewStages || []), newInterview],
              events: [...(app.events || []), newEvent],
            }
          : app
      )
    );
    setEvents((prev) => [...prev, newEvent]);
    setIsAddInterviewOpen(false);
  };

  return (
    <div className="p-2 sm:p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={previousMonth}
            className="p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span>Interview</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-purple-500"></div>
          <span>Follow-up</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span>Deadline</span>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-sm mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
          <div key={i} className="font-medium text-gray-500 dark:text-gray-400 py-2">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day[0]}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
        {days.map((day) => {
          const dayApplications = getApplicationsForDay(day);
          const dayEvents = getEventsForDay(day);
          const totalItems = dayApplications.length + dayEvents.length;

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[140px] sm:min-h-[160px] bg-white dark:bg-gray-800 p-2 ${
                isToday(day) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              } relative`}
              onClick={() => handleDayClick(day)}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                    isToday(day)
                      ? 'bg-blue-500 text-white font-bold'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {format(day, 'd')}
                </span>
                <Menu as="div" className="relative">
                  <Menu.Button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                    <EllipsisVerticalIcon className="h-5 w-5" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-1 w-56 rounded-md bg-white dark:bg-gray-700 shadow-lg ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDate(day);
                                setIsAddEventOpen(true);
                              }}
                              className={`${
                                active ? 'bg-gray-100 dark:bg-gray-600' : ''
                              } w-full text-left px-4 py-3 text-sm flex items-center gap-2`}
                            >
                              <PlusIcon className="h-5 w-5" />
                              Add Event
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDate(day);
                                setIsAddInterviewOpen(true);
                              }}
                              className={`${
                                active ? 'bg-gray-100 dark:bg-gray-600' : ''
                              } w-full text-left px-4 py-3 text-sm flex items-center gap-2`}
                            >
                              <CalendarIcon className="h-5 w-5" />
                              Add Interview
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>

              <div className={`space-y-2 overflow-y-auto ${totalItems > 0 ? 'mt-3' : ''}`} style={{ maxHeight: '90px' }}>
                {dayApplications.map((app) => (
                  <button
                    key={app.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectApplication(app);
                    }}
                    className="w-full text-left p-2 text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md border border-gray-200 dark:border-gray-600"
                  >
                    <div className="font-medium truncate">{app.jobTitle}</div>
                    <div className="text-gray-500 dark:text-gray-400 truncate">{app.companyName}</div>
                  </button>
                ))}

                {dayEvents.map((event) => (
                  <div key={event.id} className="relative group">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent?.(event);
                      }}
                      className={`w-full text-left p-2 text-sm rounded-md border ${getEventColor(event.type)}`}
                    >
                      <div className="font-medium flex items-center gap-2 truncate">
                        {event.type === 'INTERVIEW' && <CalendarIcon className="h-4 w-4 flex-shrink-0" />}
                        {event.title}
                      </div>
                      <div className="flex items-center gap-1.5 truncate text-xs mt-1">
                        <ClockIcon className="h-4 w-4 flex-shrink-0" />
                        {formatEventTime(event)}
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadICSFile(event);
                      }}
                      className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                      title="Add to Calendar"
                    >
                      <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        title="Add New Event"
      >
        <AddEventForm
          onSubmit={handleAddEvent}
          onCancel={() => setIsAddEventOpen(false)}
          initialDate={selectedDate}
        />
      </Modal>

      <Modal
        isOpen={isAddInterviewOpen}
        onClose={() => setIsAddInterviewOpen(false)}
        title="Add New Interview"
      >
        <AddInterviewForm
          onSubmit={handleAddInterview}
          onCancel={() => setIsAddInterviewOpen(false)}
          initialDate={selectedDate}
        />
      </Modal>
    </div>
  );
}
