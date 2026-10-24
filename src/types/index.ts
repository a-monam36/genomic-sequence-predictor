export type SequenceType = 'PROTEIN' | 'DNA';

export type PredictionMode = 'mutation' | 'mask';

export interface SequencePreset {
  id: string;
  name: string;
  badge: string;
  organism: string;
  type: SequenceType;
  description: string;
  sequence: string;
  defaultTargetPos: number;
  defaultMutant: string;
  referenceNote: string;
}

export interface SequenceStats {
  length: number;
  type: SequenceType;
  gcContent?: number; // for DNA (%)
  hydrophobicRatio: number; // (%)
  chargeEstimate: number; // net charge
  molecularWeight: number; // approximate kDa
  valid: boolean;
  errorMessage?: string;
}

export interface MaskCandidate {
  residue: string;
  name: string;
  category: string;
  probability: number;
  logProb: number;
}

export interface VariantResult {
  targetPos: number;
  wtResidue: string;
  mutResidue: string;
  mode: PredictionMode;
  llr: number;
  p_wt: number;
  p_mut: number;
  verdict: 'pathogenic' | 'vus' | 'tolerated';
  verdictLabel: string;
  verdictColor: string;
  description: string;
  topCandidates: MaskCandidate[];
  contextSnippet: {
    left: string;
    target: string;
    right: string;
    fullContext: string;
    startPos: number;
    endPos: number;
  };
  source: 'backend' | 'simulation';
  latencyMs: number;
  timestamp: string;
}

export interface InferenceRequest {
  sequence: string;
  targetPos: number;
  wtResidue: string;
  mutResidue: string;
  mode: PredictionMode;
  windowSize: number;
  backendUrl?: string;
  useBackend?: boolean;
}

