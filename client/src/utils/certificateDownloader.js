import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Sanitizes strings for safe filenames
 */
const sanitizeFilename = (str) => {
  return String(str || 'Certificate')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_');
};

/**
 * Generates and downloads the certificate as an official, high-resolution A4 Landscape PDF
 */
export const downloadCertificateAsPDF = async (element, certificate) => {
  if (!element) {
    throw new Error('Certificate element not found for PDF export.');
  }

  // 1. Render certificate element to crisp canvas (scale 2.5 for high DPI)
  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    imageTimeout: 15000,
    windowWidth: 1200
  });

  const imgData = canvas.toDataURL('image/png', 1.0);

  // 2. Initialize jsPDF in Landscape A4 (297mm x 210mm)
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 8; // 8mm margin for border breathing room

  const availableWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - margin * 2;

  const imgAspectRatio = canvas.width / canvas.height;
  let renderWidth = availableWidth;
  let renderHeight = renderWidth / imgAspectRatio;

  if (renderHeight > availableHeight) {
    renderHeight = availableHeight;
    renderWidth = renderHeight * imgAspectRatio;
  }

  const posX = (pageWidth - renderWidth) / 2;
  const posY = (pageHeight - renderHeight) / 2;

  pdf.addImage(imgData, 'PNG', posX, posY, renderWidth, renderHeight, undefined, 'FAST');

  // 3. Filename
  const studentName = sanitizeFilename(certificate?.studentName || 'Student');
  const courseCode = sanitizeFilename(certificate?.courseCode || 'Course');
  const certNumber = sanitizeFilename(certificate?.certificateNumber || 'MoES');
  const fileName = `${studentName}_Certificate_${courseCode}_${certNumber}.pdf`;

  pdf.save(fileName);
  return fileName;
};

/**
 * Generates and downloads the certificate as a high-resolution PNG image
 */
export const downloadCertificateAsImage = async (element, certificate) => {
  if (!element) {
    throw new Error('Certificate element not found for image export.');
  }

  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    imageTimeout: 15000,
    windowWidth: 1200
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  const studentName = sanitizeFilename(certificate?.studentName || 'Student');
  const courseCode = sanitizeFilename(certificate?.courseCode || 'Course');
  const fileName = `${studentName}_Certificate_${courseCode}.png`;

  const link = document.createElement('a');
  link.href = imgData;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return fileName;
};
