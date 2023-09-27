export interface Task {
  type: "A" | "B" | "N" | "R" | "D" | "E";
  id: string;
  nodes: string;
}
export type FetchFunction = (requestData: {
  html: string;
  query: string;
  history: string;
}) => Promise<Response>;
export interface Action {
  type: "A" | "B" | "N" | "R" | "D";
  id: string;
  html: string;
}
export interface APIResponse {
  actions: Action[];
  history: string;
}
export type CustomNode = ElementNode | TextNode;

export interface ElementNode {
  tag: string;
  attributes: Record<string, string>;
  isLoading?: boolean;
  children: CustomNode[];
}

export interface TextNode {
  content: string;
}
