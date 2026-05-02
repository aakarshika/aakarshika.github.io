/**
 * Opens resume HTML in a new tab and runs the same PDF pipeline as
 * ResumePage (`?download=pdf`): the document's embedded CDN html2pdf + buildResumePdf.
 * Custom / blob documents cannot rely on query strings, so we set globals before parse.
 *
 * @param {string} html Full document HTML (e.g. from buildCustomResumeHtml).
 * @param {string} pdfFilename Download filename, e.g. AakarshikaPriydarshi_resume_fullstack.pdf
 * @returns {boolean} False if the popup was blocked.
 */
export function openResumePdfFromHtmlString(html, pdfFilename) {
  const escapedName = JSON.stringify(pdfFilename);
  const bootstrap = `<script>window.__FORCE_RESUME_PDF_DOWNLOAD__=1;window.__RESUME_PDF_FILENAME__=${escapedName}<\/script>`;
  let htmlWithBootstrap = html.replace(/<head(\s[^>]*)?>/i, (match) => `${match}${bootstrap}`);
  if (htmlWithBootstrap === html) {
    htmlWithBootstrap = bootstrap + html;
  }

  const blob = new Blob([htmlWithBootstrap], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win) {
    URL.revokeObjectURL(url);
    return false;
  }
  setTimeout(() => URL.revokeObjectURL(url), 120_000);
  return true;
}
