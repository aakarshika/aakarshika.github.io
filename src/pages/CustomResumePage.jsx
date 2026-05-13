import React, { useMemo, useRef, useState } from 'react';
import baseResumeHtml from '../assets/AakarshikaPriydarshi_resume.html?raw';
import {
  buildCustomResumeHtml,
  buildCustomResumeMarkdown,
  getAvailableResumeTypes,
  getResumeTypeMap,
  parseResumeBundle,
} from '../utils/customResumeBuilder';
import { openResumePdfFromHtmlString } from '../utils/openResumePdfFromHtml';
import AnimatedResume from '../components/AnimatedResume';

const resumeDownloadBaseName = (type) => `AakarshikaPriydarshi_resume_${type}`;

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

// ── Amber palette ──────────────────────────────────────────────────────────
const amber = {
  faint:  'rgba(200,169,110,0.07)',
  dim:    'rgba(200,169,110,0.15)',
  mid:    'rgba(200,169,110,0.35)',
  bright: '#c8a96e',
  text:   'rgba(220,200,165,0.75)',
};

const PILL_BG   = 'rgba(18,15,11,0.82)';
const PAGE_BG   = '#0f0d0b';
const GLOW_BG   = 'radial-gradient(ellipse at 50% 15%, #1e1912 0%, #0f0d0b 65%)';

// ── Shared button style ────────────────────────────────────────────────────
const BtnBase = ({ onClick, disabled, children }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    style={{
      padding: '5px 16px',
      borderRadius: 8,
      border: `1px solid ${amber.dim}`,
      background: 'transparent',
      color: amber.text,
      fontSize: 12,
      letterSpacing: '0.04em',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.35 : 1,
      transition: 'border-color 0.18s, color 0.18s',
      whiteSpace: 'nowrap',
    }}
    onMouseEnter={(e) => {
      if (disabled) return;
      e.currentTarget.style.borderColor = amber.mid;
      e.currentTarget.style.color = amber.bright;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = amber.dim;
      e.currentTarget.style.color = amber.text;
    }}
  >
    {children}
  </button>
);

const CustomResumePage = () => {
  const resumeFrameRef = useRef(null);
  const resumeTypeMap  = useMemo(() => getResumeTypeMap(customMarkdownFiles), []);
  const resumeTypes    = useMemo(() => getAvailableResumeTypes(resumeTypeMap), [resumeTypeMap]);

  const [selectedType, setSelectedType] = useState('fullstack');

  const handleTypeChange = (newType) => {
    if (newType === selectedType) return;
    setSelectedType(newType);
  };

  const resumeBundle = useMemo(() => {
    if (!selectedType) return null;
    return parseResumeBundle({
      baseHtml:         baseResumeHtml,
      expMarkdown:      resumeTypeMap[selectedType]?.exp      ?? '',
      projectsMarkdown: resumeTypeMap[selectedType]?.projects ?? '',
      skillsMarkdown:   resumeTypeMap[selectedType]?.skills   ?? '',
    });
  }, [resumeTypeMap, selectedType]);

  const resumeHtml = useMemo(() => {
    if (!selectedType) return '';
    return buildCustomResumeHtml({
      baseHtml:         baseResumeHtml,
      expMarkdown:      resumeTypeMap[selectedType]?.exp      ?? '',
      projectsMarkdown: resumeTypeMap[selectedType]?.projects ?? '',
      skillsMarkdown:   resumeTypeMap[selectedType]?.skills   ?? '',
    });
  }, [resumeTypeMap, selectedType]);

  const resumeMarkdown = useMemo(() => {
    if (!selectedType) return '';
    return buildCustomResumeMarkdown({
      baseHtml:         baseResumeHtml,
      expMarkdown:      resumeTypeMap[selectedType]?.exp      ?? '',
      projectsMarkdown: resumeTypeMap[selectedType]?.projects ?? '',
      skillsMarkdown:   resumeTypeMap[selectedType]?.skills   ?? '',
    });
  }, [resumeTypeMap, selectedType]);

  const handleDownloadResumeHtml = () => {
    if (!resumeHtml || !selectedType) return;
    const blob = new Blob([resumeHtml], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = `${resumeDownloadBaseName(selectedType)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openResumeInPrintWindow = () => {
    if (!resumeHtml) return;
    const pw = window.open('', '_blank');
    if (!pw) return;
    pw.document.open();
    pw.document.write(resumeHtml);
    pw.document.close();
    const trigger = () => { pw.focus(); pw.print(); };
    if (pw.document.readyState === 'complete') { trigger(); return; }
    pw.onload = trigger;
  };

  const handlePrint = () => {
    const fw = resumeFrameRef.current?.contentWindow;
    if (fw) { fw.focus(); fw.print(); return; }
    openResumeInPrintWindow();
  };

  const handleDownloadResumePdf = () => {
    if (!resumeHtml || !selectedType) return;
    const filename = `${resumeDownloadBaseName(selectedType)}.pdf`;
    const opened   = openResumePdfFromHtmlString(resumeHtml, filename);
    if (!opened) console.warn('PDF: allow pop-ups for this site, or use Print → Save as PDF.');
  };

  const handleDownloadResumeMd = () => {
    if (!resumeMarkdown || !selectedType) return;
    const blob = new Blob([resumeMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = `${resumeDownloadBaseName(selectedType)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: '100vh', background: GLOW_BG, backgroundColor: PAGE_BG }}>

      {/* ── Sticky frosted pill bar ─────────────────────────────────────── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', justifyContent: 'center', padding: '14px 24px' }}>
        <div
          style={{
            display:        'inline-flex',
            alignItems:     'center',
            gap:            10,
            padding:        '8px 16px',
            borderRadius:   999,
            background:     PILL_BG,
            border:         `1px solid ${amber.faint}`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow:      `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${amber.faint}`,
            flexWrap:       'wrap',
            justifyContent: 'center',
          }}
        >
          {/* Type selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 4 }}>
            <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(200,169,110,0.45)' }}>
              Résumé
            </span>
            <select
              id="custom-resume-type"
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value)}
              style={{
                background:   amber.faint,
                border:       `1px solid ${amber.dim}`,
                borderRadius: 7,
                padding:      '4px 10px',
                color:        amber.bright,
                fontSize:     12,
                letterSpacing:'0.03em',
                cursor:       'pointer',
                outline:      'none',
              }}
            >
              {resumeTypes.map((type) => (
                <option key={type} value={type} style={{ background: '#1a1612', color: '#e0c98a' }}>
                  {toOptionLabel(type)}
                </option>
              ))}
            </select>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: amber.faint, margin: '0 4px' }} />

          <BtnBase disabled={!resumeHtml} onClick={handleDownloadResumePdf}>↓ PDF</BtnBase>
          <BtnBase onClick={handleDownloadResumeHtml}>↓ HTML</BtnBase>
          <BtnBase onClick={handleDownloadResumeMd}>↓ MD</BtnBase>
          <BtnBase onClick={handlePrint}>⎙ Print</BtnBase>
        </div>
      </div>

      {/* ── Resume stage ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 24px 64px' }}>
        <div style={{ position: 'relative' }}>
          {/* Ambient glow behind the paper */}
          <div
            aria-hidden
            style={{
              position:   'absolute',
              inset:      '-40px -60px',
              background: 'radial-gradient(ellipse at 50% 30%, rgba(200,160,80,0.09) 0%, transparent 70%)',
              pointerEvents: 'none',
              filter:     'blur(30px)',
              zIndex:     0,
            }}
          />

          {/* Animated, native-React resume */}
          <div
            style={{
              position:     'relative',
              zIndex:       1,
              borderRadius: 12,
              overflow:     'visible',
            }}
          >
            <AnimatedResume bundle={resumeBundle} />
          </div>
        </div>
      </div>

      {/* ── Hidden iframe (kept for handlePrint via contentWindow.print) ── */}
      <iframe
        ref={resumeFrameRef}
        srcDoc={resumeHtml}
        title="Aakarshika Priydarshi Resume (print source)"
        aria-hidden="true"
        tabIndex={-1}
        style={{
          position:   'absolute',
          width:      '1px',
          height:     '1px',
          opacity:    0,
          pointerEvents: 'none',
          left:       '-9999px',
          top:        '-9999px',
          border:     'none',
        }}
      />
    </div>
  );
};

export default CustomResumePage;
