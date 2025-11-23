import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { FormElement, FieldType } from '../types';

// Handle potential default export structure
const pdfjs = (pdfjsLib as any).default ?? pdfjsLib;

export const loadPdfDocument = async (file: File): Promise<pdfjsLib.PDFDocumentProxy> => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument(arrayBuffer);
  return loadingTask.promise;
};

export const renderPageToCanvas = async (
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageIndex: number,
  canvas: HTMLCanvasElement,
  scale: number = 1.5
): Promise<{ width: number; height: number }> => {
  const page = await pdfDoc.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale });

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  const renderContext = {
    canvasContext: canvas.getContext('2d') as CanvasRenderingContext2D,
    viewport: viewport,
  };

  await page.render(renderContext as any).promise;
  return { width: viewport.width, height: viewport.height };
};

export const extractTextFromPage = async (
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageIndex: number
): Promise<string> => {
  const page = await pdfDoc.getPage(pageIndex + 1);
  const textContent = await page.getTextContent();
  return textContent.items.map((item: any) => item.str).join(' ');
};

export const savePdfWithFields = async (
  originalPdfBytes: ArrayBuffer,
  elements: FormElement[],
  pageInfo: { [pageIndex: number]: { width: number; height: number; scale: number } }
): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(originalPdfBytes);
  const form = pdfDoc.getForm();

  // Group elements by page
  const elementsByPage: { [key: number]: FormElement[] } = {};
  elements.forEach((el) => {
    if (!elementsByPage[el.pageIndex]) elementsByPage[el.pageIndex] = [];
    elementsByPage[el.pageIndex].push(el);
  });

  for (const pageIndexStr of Object.keys(elementsByPage)) {
    const pageIndex = parseInt(pageIndexStr, 10);
    const page = pdfDoc.getPage(pageIndex);
    const pageElements = elementsByPage[pageIndex];
    const currentInfo = pageInfo[pageIndex];
    
    // If we haven't rendered this page, we can't accurately place fields based on visual coordinates
    if (!currentInfo) continue;

    const { scale } = currentInfo;

    for (const el of pageElements) {
      // Convert DOM coordinates to PDF coordinates
      // DOM: Top-Left (0,0) -> PDF: Bottom-Left (0,0)
      // We must account for the scale factor used during rendering
      
      const pdfWidth = el.width / scale;
      const pdfHeight = el.height / scale;
      
      // X is straightforward, just unscale
      const pdfX = el.x / scale;
      
      // Y needs to be flipped.
      // Visual Y is distance from TOP.
      // PDF Y is distance from BOTTOM.
      // First, unscale the visual Y.
      const unscaledVisualY = el.y / scale;
      
      // Get actual PDF page height (from pdf-lib, simpler than unscaling rendered height)
      const pageHeight = page.getHeight();
      
      // Calculate PDF Y
      const pdfY = pageHeight - unscaledVisualY - pdfHeight;

      const fieldName = el.name || `field_${el.id}`;

      if (el.type === FieldType.TEXT) {
        const textField = form.createTextField(fieldName);
        textField.setText('');
        textField.addToPage(page, {
          x: pdfX,
          y: pdfY,
          width: pdfWidth,
          height: pdfHeight,
        });
        if (el.required) textField.enableRequired();
      } else if (el.type === FieldType.CHECKBOX) {
        const checkBox = form.createCheckBox(fieldName);
        checkBox.addToPage(page, {
          x: pdfX,
          y: pdfY,
          width: pdfWidth,
          height: pdfHeight,
        });
        if (el.required) checkBox.enableRequired();
      } else if (el.type === FieldType.RADIO) {
         // Radio buttons usually belong to a group. 
         // For simplicity in this MVP, we create a unique group per radio unless names match.
         // Since our UI forces unique names per element currently, we'll make single radios.
         // In a full app, we'd manage groups.
         const radioGroup = form.createRadioGroup(fieldName);
         radioGroup.addOptionToPage('Yes', page, {
            x: pdfX,
            y: pdfY,
            width: pdfWidth,
            height: pdfHeight,
         });
      }
    }
  }

  return pdfDoc.save();
};