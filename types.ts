export enum FieldType {
  TEXT = 'Text',
  CHECKBOX = 'Checkbox',
  RADIO = 'Radio',
}

export interface FormElement {
  id: string;
  type: FieldType;
  pageIndex: number; // 0-based index
  x: number; // Rendered coordinate (dom pixels relative to container)
  y: number; // Rendered coordinate (dom pixels relative to container)
  width: number;
  height: number;
  name: string;
  description?: string;
  required: boolean;
  options?: string[]; // For radio groups (not fully implemented in UI MVP, but good for structure)
}

export interface PdfPageInfo {
  pageIndex: number;
  width: number;
  height: number;
  scale: number; // The scale factor used to render the canvas
}

export interface GeminiSuggestion {
  name: string;
  type: FieldType;
  reason: string;
}
