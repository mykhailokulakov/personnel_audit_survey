/**
 * Exports a DOM element as a multi-page PDF and triggers a browser download.
 *
 * Loaded lazily on demand — do NOT import this module statically from client
 * components, as that would pull html2canvas and jsPDF into the route's
 * preload set and trigger browser "preloaded but not used" warnings.
 *
 * @param element - Root DOM element to render. Resolves immediately when null.
 * @param code - Respondent code used to name the downloaded file.
 */
export async function exportPdf(element: HTMLDivElement | null, code: string): Promise<void> {
  if (!element) return;
  const [{ default: html2canvasLib }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);
  // Test environments can inject a stub via window.__html2canvasMock to avoid
  // headless-incompatible canvas rendering while still exercising the jsPDF path.
  const html2canvasImpl =
    (window as Window & { __html2canvasMock?: typeof html2canvasLib }).__html2canvasMock ??
    html2canvasLib;
  const canvas = await html2canvasImpl(element, { scale: 2, useCORS: true, logging: false });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // Paginate: step by a full page height so adjacent pages share no overlap.
  // Image is repositioned upward by pageHeight on each subsequent page, and
  // jsPDF clips any content that falls outside [0, pageHeight].
  let pageIndex = 0;
  while (pageIndex * pageHeight < imgHeight + 10) {
    if (pageIndex > 0) pdf.addPage();
    pdf.addImage(imgData, 'PNG', 10, 10 - pageIndex * pageHeight, imgWidth, imgHeight);
    pageIndex++;
  }

  pdf.save(`assessment-${code}.pdf`);
  // Allow test environments to observe that pdf.save() completed without error.
  (window as Window & { __onPdfSaved?: () => void }).__onPdfSaved?.();
}
