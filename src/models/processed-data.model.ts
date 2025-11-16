export interface ProcessedData {
  cleaned: string;
  keypoints: string[];
  definitions: { term: string; definition: string }[];
  formulas: { formula: string; result: string }[];
  summary: string;
}

export interface MindmapNode {
  id: string;
  label: string;
  parent: string | null;
}
