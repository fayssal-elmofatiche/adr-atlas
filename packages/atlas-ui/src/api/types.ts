export interface AdrListItem {
  id: number;
  title: string;
  status: string;
  date: string | null;
  repository: string;
  filePath: string;
  tags: string[];
  components: string[];
}

export interface AdrDetail extends AdrListItem {
  authors: string[];
  context: string | null;
  decision: string | null;
  consequences: string | null;
  rawContent: string | null;
  relationships: AdrRelationship[];
}

export interface AdrRelationship {
  adrId: number;
  adrTitle: string;
  type: string;
}

export interface GraphNode {
  id: number;
  title: string;
  status: string;
  date: string | null;
  tags: string[];
  components: string[];
  connectionCount: number;
}

export interface GraphEdge {
  id: number;
  source: number;
  target: number;
  type: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface Component {
  id: number;
  name: string;
  team: string | null;
  system: string | null;
}

export interface AdrFilter {
  status?: string;
  tag?: string;
  component?: string;
}
