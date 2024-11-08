// src/components/Calendar.tsx

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
  const [isAddInterviewOpen, setIsAddInterviewOpen] = useState<boolean>(
    false
  );
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
        return 'bg-accent text-primary border-accent';
      case 'FOLLOW_UP':
        return 'bg-secondary text-primary border-secondary';
      case 'DEADLINE':
        return 'bg-secondary text-primary border-secondary';
      default:
        return 'bg-gray-900 text-white border-gray-700';
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
      title: `${newInterview.type.replace(/_/g, ' ')} Interview`,
      startDate: newInterview.scheduledDate,
      endDate: addMinutes(
        parseISO(newInterview.scheduledDate),
        newInterview.duration
      ).toISOString(),
      isAllDay: false,
      location: newInterview.location,
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
    <div className="p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Previous
          </button>
          <button
            onClick={nextMonth}
            className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Next
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="bg-gray-100 dark:bg-gray-800 p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400"
          >
            {day}
          </div>
        ))}

        {days.map((day) => {
          const dayApplications = getApplicationsForDay(day);
          const dayEvents = getEventsForDay(day);
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[120px] bg-white dark:bg-gray-800 p-2 ${
                isToday(day) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              } relative`}
              onClick={() => handleDayClick(day)}
            >
              <div className="flex justify-between items-start">
                <span
                  className={`text-sm ${
                    isToday(day)
                      ? 'font-bold text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {format(day, 'd')}
                </span>
                <Menu as="div" className="relative inline-block text-left">
                  <div>
                    <Menu.Button
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <EllipsisVerticalIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </Menu.Button>
                  </div>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="origin-top-right absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => {
                                setSelectedDate(day);
                                setIsAddEventOpen(true);
                              }}
                              className={`${
                                active ? 'bg-gray-100 dark:bg-gray-600' : ''
                              } w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-gray-100`}
                            >
                              Add Event
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => {
                                setSelectedDate(day);
                                setIsAddInterviewOpen(true);
                              }}
                              className={`${
                                active ? 'bg-gray-100 dark:bg-gray-600' : ''
                              } w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-gray-100`}
                            >
                              Add Interview
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>

              <div className="mt-2 space-y-1">
                {dayApplications.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => onSelectApplication(app)}
                    className="w-full text-left p-1 text-xs rounded hover:bg-gray-50 dark:hover:bg-gray-700 truncate border border-gray-200 dark:border-gray-600"
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {app.jobTitle}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">
                      {app.companyName}
                    </div>
                  </button>
                ))}

                {dayEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => onSelectEvent?.(event)}
                    className={`w-full text-left p-1.5 text-xs rounded hover:opacity-80 truncate border ${getEventColor(
                      event.type
                    )}`}
                  >
                    <div className="font-medium flex items-center gap-1">
                      {event.type === 'INTERVIEW' && (
                        <CalendarIcon className="h-3 w-3" />
                      )}
                      {event.title}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <ClockIcon className="h-3 w-3" />
                      {formatEventTime(event)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/20 rounded"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/20 rounded"></div>
          <span>Interview</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-100 dark:bg-gray-700 rounded"></div>
          <span>Follow-up</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-100 dark:bg-gray-700 rounded"></div>
          <span>Deadline</span>
        </div>
        <div className="flex items-center gap-1">
          <PlusIcon className="h-4 w-4" />
          <span>Add application</span>
        </div>
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
