// components/resume-actions.tsx
'use client';

import { FileText, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";

export function ResumeActions({ resumeUrl, applicantName }: { resumeUrl: string; applicantName: string }) {
  const handleDownloadResume = () => {
    if (resumeUrl) {
      const link = document.createElement('a');
      link.href = resumeUrl;
      link.download = `${applicantName.replace(/\s+/g, '_')}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center gap-3 p-3 bg-white rounded-md border border-gray-200">
        <div className="bg-blue-100 p-2 rounded-md">
          <FileText className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">
            {applicantName}_Resume.pdf
          </p>
          <p className="text-xs text-gray-500">PDF Document</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button asChild variant="outline" className="flex-1">
          <a 
            href={resumeUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" /> View
          </a>
        </Button>
        <Button 
          onClick={handleDownloadResume}
          className="flex-1 gap-2"
        >
          <Download className="h-4 w-4" /> Download
        </Button>
      </div>
    </div>
  );
}