import React, { useMemo, useState } from 'react';
import baseResumeHtml from '../assets/AakarshikaPriydarshi_resume.html?raw';
import {
  buildCustomResumeHtml,
  buildCustomResumeMarkdown,
  getAvailableResumeTypes,
  getResumeTypeMap,
} from '../utils/customResumeBuilder';

const customMarkdownFiles = import.meta.glob('../assets/custom-res/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const toOptionLabel = (value) =>
  value
    .split('-')
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ');

const CustomResumePage = () => {
  const resumeTypeMap = useMemo(() => getResumeTypeMap(customMarkdownFiles), []);
  const resumeTypes = useMemo(() => getAvailableResumeTypes(resumeTypeMap), [resumeTypeMap]);
  const [selectedType, setSelectedType] = useState('fullstack');

  const resumeHtml = useMemo(() => {
    if (!selectedType) {
      return '';
    }

    return buildCustomResumeHtml({
      baseHtml: baseResumeHtml,
      expMarkdown: resumeTypeMap[selectedType]?.exp ?? '',
      projectsMarkdown: resumeTypeMap[selectedType]?.projects ?? '',
      skillsMarkdown: resumeTypeMap[selectedType]?.skills ?? '',
    });
  }, [resumeTypeMap, selectedType]);

  const resumeMarkdown = useMemo(() => {
    if (!selectedType) {
      return '';
    }

    return buildCustomResumeMarkdown({
      baseHtml: baseResumeHtml,
      expMarkdown: resumeTypeMap[selectedType]?.exp ?? '',
      projectsMarkdown: resumeTypeMap[selectedType]?.projects ?? '',
      skillsMarkdown: resumeTypeMap[selectedType]?.skills ?? '',
    });
  }, [resumeTypeMap, selectedType]);

  const handleDownloadResumeHtml = () => {
    if (!resumeHtml || !selectedType) return;

    const blob = new Blob([resumeHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AakarshikaPriydarshi_${selectedType}_resume.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadResumePdf = () => {
    if (!resumeHtml) return;
    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(resumeHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 400);
  };

  const handleDownloadResumeMd = () => {
    if (!resumeMarkdown || !selectedType) return;

    const blob = new Blob([resumeMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AakarshikaPriydarshi_${selectedType}_resume.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintResume = () => {
    if (!resumeHtml) return;
    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(resumeHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  return (
    <div className="h-full bg-gradient-to-b from-blue-900 to-black px-4 md:px-8">
      <div className="relative mx-auto max-w-7xl">
        <div className="sticky top-0 right-0 flex items-center justify-center gap-3 py-2">
          <label htmlFor="custom-resume-type" className="text-white text-sm">
            Resume Type
          </label>
          <select
            id="custom-resume-type"
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value)}
            className="rounded-lg bg-black/20 border border-white/20 px-3 py-2 text-white"
          >
            {resumeTypes.map((type) => (
              <option key={type} value={type} className="text-black">
                {toOptionLabel(type)}
              </option>
            ))}
          </select>
          <button
            onClick={handleDownloadResumePdf}
            className="px-6 py-2 rounded-lg bg-black/10 border border-black/20 m-2 mr-1 text-white hover:border-white hover:text-white transition-all duration-300"
          >
            Download PDF
          </button>
          <button
            onClick={handleDownloadResumeHtml}
            className="px-6 py-2 rounded-lg bg-black/10 border border-black/20 m-2 mr-1 text-white hover:border-white hover:text-white transition-all duration-300"
          >
            Download HTML
          </button>
          <button
            onClick={handleDownloadResumeMd}
            className="px-6 py-2 rounded-lg bg-black/10 border border-black/20 m-2 mr-1 text-white hover:border-white hover:text-white transition-all duration-300"
          >
            Download MD
          </button>
          <button
            onClick={handlePrintResume}
            className="px-6 py-2 rounded-lg bg-black/10 border border-black/20 m-2 mr-1 text-white hover:border-white hover:text-white transition-all duration-300"
          >
            Print
          </button>
        </div>
        <div className="flex justify-center">
          <div className="w-[210mm] bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <iframe
              srcDoc={resumeHtml}
              title="Aakarshika Priydarshi Custom Resume"
              className="w-[210mm] h-screen bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomResumePage;
