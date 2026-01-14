import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ExportOptions {
  filename?: string;
  backgroundColor?: string;
  scale?: number;
  orientation?: 'portrait' | 'landscape';
}

/**
 * Unified high-fidelity PDF export utility
 */
export async function exportToPdf(
  elementId: string, 
  options: ExportOptions = {}
) {
  const {
    filename = `report-${Date.now()}.pdf`,
    backgroundColor = '#09090b',
    scale = 2,
    orientation = 'landscape'
  } = options;

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  try {
    // Capture high-quality screenshot
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // Create PDF with dynamic page size based on canvas dimensions
    const pdf = new jsPDF({
      orientation,
      unit: 'px',
      format: [canvas.width, canvas.height],
      compress: true
    });

    // Add image and save
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height, undefined, 'FAST');
    pdf.save(filename);
    
    return true;
  } catch (error) {
    console.error('PDF Export Utility Error:', error);
    throw error;
  }
}
