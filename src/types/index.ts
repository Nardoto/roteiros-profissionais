export interface ScriptInput {
  title: string;
  synopsis: string;
  knowledgeBase?: string;
}

export interface GeneratedScript {
  roteiro: string;
  trilha: string;
  textoNarrado: string;
  personagens: string;
  titulo: string;
}

export interface ProgressUpdate {
  progress: number;
  message: string;
  currentFile?: string;
}

export type FileType = 'roteiro' | 'trilha' | 'textoNarrado' | 'personagens' | 'titulo';
