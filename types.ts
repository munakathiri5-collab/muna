export enum InputMode {
  TEXT = 'TEXT',
  FILE = 'FILE',
  LINK = 'LINK'
}

export interface QtiResult {
  xml: string;
  summary: string;
}

export interface FileData {
  mimeType: string;
  data: string; // base64
  name: string;
}
