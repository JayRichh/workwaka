import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { JobApplication, Salary, Contact, InterviewStage, CalendarEvent } from '../types';
import { storage } from '../utils/storage';
import { SalaryForm } from './form/SalaryForm';
import { ContactForm } from './form/ContactForm';
import { InterviewStageForm } from './form/InterviewStageForm';
import { RequiredDocumentsForm } from './form/RequiredDocumentsForm';
import { RequiredFieldsForm } from './form/RequiredFieldsForm';
import { DatesAndPriorityForm } from './form/DatesAndPriorityForm';
import { OptionalFieldsForm } from './form/OptionalFieldsForm';
import { TagsAndNotesForm } from './form/TagsAndNotesForm';

interface JobFormProps {
  job: JobApplication | null;
  initialDate: Date | null;
  onSave: () => void;
  onCancel: () => void;
}

const INITIAL_SALARY: Salary = {
  min: 0,
  max: 0,
  currency: 'USD'
};

const INITIAL_STATE: JobApplication = {
  id: '',
  jobTitle: '',
  companyName: '',
  location: '',
  jobType: 'FULL_TIME',
  status: 'WISHLIST',
  dateApplied: new Date().toISOString(),
  dateModified: new Date().toISOString(),
  remote: false,
  salary: INITIAL_SALARY,
  contacts: [],
  interviewStages: [],
  tags: [],
  events: [],
  priority: 'MEDIUM',
  industry: '',
  requiredDocuments: {
    resume: false,
    coverLetter: false,
    portfolio: false,
    references: false,
    other: []
  }
};

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
      {title}
    </h2>
  );
}

function FormSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {children}
    </div>
  );
}

export function JobForm({ job, initialDate, onSave, onCancel }: JobFormProps) {
  const [formData, setFormData] = useState<JobApplication>({
    ...INITIAL_STATE,
    ...job,
    id: job?.id || uuidv4(),
    dateApplied: job?.dateApplied || (initialDate ? initialDate.toISOString() : new Date().toISOString()),
    tags: job?.tags || [],
    contacts: job?.contacts || [],
    interviewStages: job?.interviewStages || [],
    events: job?.events || [],
    salary: job?.salary || INITIAL_SALARY,
    requiredDocuments: job?.requiredDocuments || INITIAL_STATE.requiredDocuments
  });

  const [showOptional, setShowOptional] = useState(false);

  useEffect(() => {
    if (job) {
      setFormData({
        ...INITIAL_STATE,
        ...job,
        salary: job.salary || INITIAL_SALARY,
        tags: job.tags || [],
        contacts: job.contacts || [],
        interviewStages: job.interviewStages || [],
        events: job.events || [],
        requiredDocuments: job.requiredDocuments || INITIAL_STATE.requiredDocuments
      });
      setShowOptional(true);
    } else {
      setFormData({
        ...INITIAL_STATE,
        id: uuidv4(),
        dateApplied: initialDate ? initialDate.toISOString() : new Date().toISOString()
      });
    }
  }, [job, initialDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedJob = {
      ...formData,
      dateModified: new Date().toISOString()
    };
    storage.saveApplication(updatedJob);
    onSave();
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRequiredDocumentsChange = (key: 'resume' | 'coverLetter' | 'portfolio' | 'references', checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      requiredDocuments: {
        ...prev.requiredDocuments!,
        [key]: checked
      }
    }));
  };

  const handleSalaryChange = (field: keyof Salary, value: string) => {
    setFormData(prev => ({
      ...prev,
      salary: {
        ...(prev.salary || INITIAL_SALARY),
        [field]: field === 'currency' ? value : Number(value) || 0
      }
    }));
  };

  const handleAddContact = () => {
    const newContact: Contact = {
      id: uuidv4(),
      name: '',
      role: '',
    };
    setFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, newContact]
    }));
  };

  const handleContactChange = (id: string, field: keyof Contact, value: string) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.map(contact =>
        contact.id === id ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const handleRemoveContact = (id: string) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.filter(contact => contact.id !== id)
    }));
  };

  const handleAddInterview = () => {
    const newInterview: InterviewStage = {
      id: uuidv4(),
      type: 'PHONE_SCREEN',
      scheduledDate: new Date().toISOString(),
      duration: 60,
      isRemote: true,
      outcome: 'SCHEDULED'
    };

    const newEvent: CalendarEvent = {
      id: uuidv4(),
      applicationId: formData.id,
      type: 'INTERVIEW',
      title: `Interview: ${formData.companyName}`,
      startDate: newInterview.scheduledDate,
      endDate: new Date(new Date(newInterview.scheduledDate).getTime() + newInterview.duration * 60000).toISOString(),
      isAllDay: false,
      interviewStageId: newInterview.id
    };

    setFormData(prev => ({
      ...prev,
      interviewStages: [...prev.interviewStages, newInterview],
      events: [...prev.events, newEvent]
    }));
  };

  const handleInterviewChange = (id: string, field: keyof InterviewStage, value: any) => {
    setFormData(prev => ({
      ...prev,
      interviewStages: prev.interviewStages.map(stage => {
        if (stage.id !== id) return stage;
        const updatedStage = { ...stage, [field]: value };
        
        // Update corresponding calendar event
        const eventIndex = prev.events.findIndex(e => e.interviewStageId === id);
        if (eventIndex !== -1) {
          const updatedEvents = [...prev.events];
          updatedEvents[eventIndex] = {
            ...updatedEvents[eventIndex],
            startDate: updatedStage.scheduledDate,
            endDate: new Date(new Date(updatedStage.scheduledDate).getTime() + updatedStage.duration * 60000).toISOString()
          };
          prev.events = updatedEvents;
        }

        return updatedStage;
      })
    }));
  };

  const handleRemoveInterview = (id: string) => {
    setFormData(prev => ({
      ...prev,
      interviewStages: prev.interviewStages.filter(stage => stage.id !== id),
      events: prev.events.filter(event => event.interviewStageId !== id)
    }));
  };

  const handleTagsChange = (tags: string[]) => {
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-7xl mx-auto">
      {/* Basic Information Section */}
      <div className="space-y-6">
        <SectionHeader title="Basic Information" />
        <FormSection>
          <RequiredFieldsForm 
            formData={formData} 
            onUpdate={handleInputChange} 
          />
        </FormSection>
      </div>

      {/* Application Details Section */}
      <div className="space-y-6">
        <SectionHeader title="Application Details" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormSection>
            <DatesAndPriorityForm 
              formData={formData} 
              onUpdate={handleInputChange} 
            />
          </FormSection>
          <FormSection>
            <RequiredDocumentsForm
              documents={formData.requiredDocuments!}
              onUpdate={handleRequiredDocumentsChange}
            />
          </FormSection>
        </div>
      </div>

      {/* Notes and Tags Section */}
      <div className="space-y-6">
        <SectionHeader title="Notes & Tags" />
        <FormSection>
          <TagsAndNotesForm 
            formData={formData} 
            onUpdate={handleInputChange}
            onTagsChange={handleTagsChange}
          />
        </FormSection>
      </div>

      {/* Contacts Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <SectionHeader title="Contacts" />
          <button
            type="button"
            onClick={handleAddContact}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-transparent rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            + Add Contact
          </button>
        </div>
        <FormSection className="space-y-4">
          {formData.contacts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No contacts added yet</p>
          ) : (
            formData.contacts.map((contact) => (
              <ContactForm
                key={contact.id}
                contact={contact}
                onUpdate={handleContactChange}
                onRemove={handleRemoveContact}
              />
            ))
          )}
        </FormSection>
      </div>

      {/* Interview Stages Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <SectionHeader title="Interview Stages" />
          <button
            type="button"
            onClick={handleAddInterview}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-transparent rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            + Add Interview
          </button>
        </div>
        <FormSection className="space-y-4">
          {formData.interviewStages.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No interviews scheduled yet</p>
          ) : (
            formData.interviewStages.map((stage) => (
              <InterviewStageForm
                key={stage.id}
                stage={stage}
                onUpdate={handleInterviewChange}
                onRemove={handleRemoveInterview}
              />
            ))
          )}
        </FormSection>
      </div>

      {/* Additional Details Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <SectionHeader title="Additional Details" />
          <button
            type="button"
            onClick={() => setShowOptional(!showOptional)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
          >
            {showOptional ? 'Hide' : 'Show'} Details
          </button>
        </div>
        {showOptional && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FormSection>
              <OptionalFieldsForm 
                formData={formData} 
                onUpdate={handleInputChange} 
              />
            </FormSection>
            <FormSection>
              <SalaryForm
                salary={formData.salary || INITIAL_SALARY}
                onUpdate={handleSalaryChange}
              />
            </FormSection>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 border border-transparent rounded-md shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        >
          Save Application
        </button>
      </div>
    </form>
  );
}
