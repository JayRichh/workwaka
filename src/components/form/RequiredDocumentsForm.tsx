import { useState } from 'react';
import { RequiredDocuments } from '../../types';

interface RequiredDocumentsFormProps {
  documents: RequiredDocuments;
  onUpdate: (key: 'resume' | 'coverLetter' | 'portfolio' | 'references', checked: boolean) => void;
}

export function RequiredDocumentsForm({ documents, onUpdate }: RequiredDocumentsFormProps) {
  const [newDocument, setNewDocument] = useState('');

  const handleAddOther = () => {
    if (newDocument.trim() && !documents.other?.includes(newDocument.trim())) {
      const updatedOther = [...(documents.other || []), newDocument.trim()];
      documents.other = updatedOther;
      setNewDocument('');
    }
  };

  const handleRemoveOther = (doc: string) => {
    if (documents.other) {
      documents.other = documents.other.filter(d => d !== doc);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddOther();
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Required Documents</h3>

      {/* Standard Documents */}
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            id="resume"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-500 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
            checked={documents.resume}
            onChange={(e) => onUpdate('resume', e.target.checked)}
          />
          <label htmlFor="resume" className="ml-3 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Resume
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="coverLetter"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-500 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
            checked={documents.coverLetter}
            onChange={(e) => onUpdate('coverLetter', e.target.checked)}
          />
          <label htmlFor="coverLetter" className="ml-3 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Cover Letter
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="portfolio"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-500 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
            checked={documents.portfolio}
            onChange={(e) => onUpdate('portfolio', e.target.checked)}
          />
          <label htmlFor="portfolio" className="ml-3 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Portfolio
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="references"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-500 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
            checked={documents.references}
            onChange={(e) => onUpdate('references', e.target.checked)}
          />
          <label htmlFor="references" className="ml-3 block text-sm font-medium text-gray-900 dark:text-gray-100">
            References
          </label>
        </div>
      </div>

      {/* Additional Documents */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          Additional Documents
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            value={newDocument}
            onChange={(e) => setNewDocument(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Certification, Work Sample"
          />
          <button
            type="button"
            onClick={handleAddOther}
            className="px-3 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            Add
          </button>
        </div>

        {/* Additional Documents List */}
        {documents.other && documents.other.length > 0 && (
          <div className="mt-3 space-y-2">
            {documents.other.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700"
              >
                <span className="text-sm text-gray-900 dark:text-gray-100">{doc}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveOther(doc)}
                  className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 rounded"
                >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Status Summary */}
      <div className="mt-4 p-3 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {Object.values(documents).filter(Boolean).length > 0 ? (
              `${Object.values(documents).filter(Boolean).length} document${Object.values(documents).filter(Boolean).length === 1 ? '' : 's'} required`
            ) : (
              'No documents required yet'
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
