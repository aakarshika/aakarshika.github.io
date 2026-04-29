import React, { useRef } from 'react';

const resumeHtmlUrl = new URL('../assets/AakarshikaPriydarshi_resume.html', import.meta.url).href;

const ResumePage = () => {
  const resumeFrameRef = useRef(null);

  const handleDownloadResumePdf = () => {
    window.open(`${resumeHtmlUrl}?download=pdf`, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadResumeHtml = () => {
    window.open(`${resumeHtmlUrl}?download=html`, '_blank', 'noopener,noreferrer');
  };

  const handlePrintResume = () => {
    const printWindow = resumeFrameRef.current?.contentWindow;
    if (printWindow) {
      printWindow.focus();
      printWindow.print();
      return;
    }

    window.open(`${resumeHtmlUrl}?print=true`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="h-full bg-gradient-to-b from-blue-900 to-black px-4 md:px-8">
      <div className="relative mx-auto max-w-7xl">
        <div className="sticky top-0 right-0 flex justify-center ">
          <button
            onClick={handleDownloadResumePdf}
            className=" px-6 py-2 rounded-lg bg-black/10 border border-black/20 m-2 mr-5 text-white hover:border-white hover:text-white transition-all duration-300"
          >
            Download  PDF
          </button>
          <button
            onClick={handleDownloadResumeHtml}
            className=" px-6 py-2 rounded-lg bg-black/10 border border-black/20 m-2 mr-5 text-white hover:border-white hover:text-white transition-all duration-300"
          >
            Download HTML
          </button>

          <button
            onClick={handlePrintResume}
            className=" px-6 py-2 rounded-lg bg-black/10 border border-black/20 m-2 mr-5 text-white hover:border-white hover:text-white transition-all duration-300"
          >
            Print
          </button>
        </div>
        <div className="flex justify-center">
          <div className="w-full w-[210mm] bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <iframe
              ref={resumeFrameRef}
              src={resumeHtmlUrl}
              title="Aakarshika Priydarshi Resume"
              className="w-full h-screen bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePage;
