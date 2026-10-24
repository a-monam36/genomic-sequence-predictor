import { SequenceType, SequenceStats } from '../types';

export interface ResidueInfo {
  code: string;
  threeLetter: string;
  name: string;
  category: 'hydrophobic' | 'polar' | 'positive' | 'negative' | 'special' | 'dna';
  color: string;
  mw: number; // molecular weight
  charge: number;
}

export const AMINO_ACIDS: Record<string, ResidueInfo> = {
  A: { code: 'A', threeLetter: 'Ala', name: 'Alanine', category: 'hydrophobic', color: '#06b6d4', mw: 89.1, charge: 0 },
  R: { code: 'R', threeLetter: 'Arg', name: 'Arginine', category: 'positive', color: '#3b82f6', mw: 174.2, charge: +1 },
  N: { code: 'N', threeLetter: 'Asn', name: 'Asparagine', category: 'polar', color: '#38bdf8', mw: 132.1, charge: 0 },
  D: { code: 'D', threeLetter: 'Asp', name: 'Aspartate', category: 'negative', color: '#f43f5e', mw: 133.1, charge: -1 },
  C: { code: 'C', threeLetter: 'Cys', name: 'Cysteine', category: 'polar', color: '#2dd4bf', mw: 121.2, charge: 0 },
  E: { code: 'E', threeLetter: 'Glu', name: 'Glutamate', category: 'negative', color: '#e11d48', mw: 147.1, charge: -1 },
  Q: { code: 'Q', threeLetter: 'Gln', name: 'Glutamine', category: 'polar', color: '#67e8f9', mw: 146.2, charge: 0 },
  G: { code: 'G', threeLetter: 'Gly', name: 'Glycine', category: 'special', color: '#cbd5e1', mw: 75.1, charge: 0 },
  H: { code: 'H', threeLetter: 'His', name: 'Histidine', category: 'positive', color: '#60a5fa', mw: 155.2, charge: +0.5 },
  I: { code: 'I', threeLetter: 'Ile', name: 'Isoleucine', category: 'hydrophobic', color: '#0ea5e9', mw: 131.2, charge: 0 },
  L: { code: 'L', threeLetter: 'Leu', name: 'Leucine', category: 'hydrophobic', color: '#0284c7', mw: 131.2, charge: 0 },
  K: { code: 'K', threeLetter: 'Lys', name: 'Lysine', category: 'positive', color: '#2563eb', mw: 146.2, charge: +1 },
  M: { code: 'M', threeLetter: 'Met', name: 'Methionine', category: 'hydrophobic', color: '#0891b2', mw: 149.2, charge: 0 },
  F: { code: 'F', threeLetter: 'Phe', name: 'Phenylalanine', category: 'hydrophobic', color: '#0369a1', mw: 165.2, charge: 0 },
  P: { code: 'P', threeLetter: 'Pro', name: 'Proline', category: 'special', color: '#94a3b8', mw: 115.1, charge: 0 },
  S: { code: 'S', threeLetter: 'Ser', name: 'Serine', category: 'polar', color: '#22d3ee', mw: 105.1, charge: 0 },
  T: { code: 'T', threeLetter: 'Thr', name: 'Threonine', category: 'polar', color: '#00f2fe', mw: 119.1, charge: 0 },
  W: { code: 'W', threeLetter: 'Trp', name: 'Tryptophan', category: 'hydrophobic', color: '#1d4ed8', mw: 204.2, charge: 0 },
  Y: { code: 'Y', threeLetter: 'Tyr', name: 'Tyrosine', category: 'polar', color: '#7dd3fc', mw: 181.2, charge: 0 },
  V: { code: 'V', threeLetter: 'Val', name: 'Valine', category: 'hydrophobic', color: '#0ea5e9', mw: 117.1, charge: 0 },
};

export const DNA_BASES: Record<string, ResidueInfo> = {
  A: { code: 'A', threeLetter: 'Ade', name: 'Adenine', category: 'dna', color: '#10b981', mw: 331.2, charge: 0 },
  T: { code: 'T', threeLetter: 'Thy', name: 'Thymine', category: 'dna', color: '#f43f5e', mw: 322.2, charge: 0 },
  G: { code: 'G', threeLetter: 'Gua', name: 'Guanine', category: 'dna', color: '#00f2fe', mw: 347.2, charge: 0 },
  C: { code: 'C', threeLetter: 'Cyt', name: 'Cytosine', category: 'dna', color: '#a855f7', mw: 307.2, charge: 0 },
};

export const DNA_COMPLEMENT: Record<string, string> = {
  A: 'T',
  T: 'A',
  G: 'C',
  C: 'G',
  N: 'N'
};

export function getResidueInfo(char: string, type: SequenceType = 'PROTEIN'): ResidueInfo {
  const upper = char.toUpperCase();
  if (type === 'DNA' && DNA_BASES[upper]) {
    return DNA_BASES[upper];
  }
  if (AMINO_ACIDS[upper]) {
    return AMINO_ACIDS[upper];
  }
  return {
    code: upper || '?',
    threeLetter: 'Unk',
    name: 'Unknown',
    category: 'special',
    color: '#64748b',
    mw: 110,
    charge: 0,
  };
}

export function sanitizeSequence(rawInput: string): {
  cleanSeq: string;
  header: string | null;
  detectedType: SequenceType;
  stats: SequenceStats;
} {
  const lines = rawInput.split('\n');
  let header: string | null = null;
  const seqLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('>')) {
      if (!header) header = trimmed.substring(1).trim();
    } else {
      seqLines.push(trimmed);
    }
  }

  // Strip digits, spaces, hyphens, asterisks
  const rawSeq = seqLines.join('').replace(/[\s\d\-*]/g, '').toUpperCase();

  // Detect type: if contains only A, C, G, T, U, N -> likely DNA/RNA
  const dnaChars = rawSeq.replace(/[ACGTUN]/g, '');
  const isLikelyDNA = rawSeq.length > 0 && dnaChars.length === 0;
  const detectedType: SequenceType = isLikelyDNA ? 'DNA' : 'PROTEIN';

  // Calculate statistics
  let gcCount = 0;
  let hydrophobicCount = 0;
  let netCharge = 0;
  let totalMw = 0;

  for (let i = 0; i < rawSeq.length; i++) {
    const char = rawSeq[i];
    if (char === 'G' || char === 'C') gcCount++;
    
    if (detectedType === 'PROTEIN') {
      const info = AMINO_ACIDS[char];
      if (info) {
        if (info.category === 'hydrophobic') hydrophobicCount++;
        netCharge += info.charge;
        totalMw += info.mw;
      }
    }
  }

  const length = rawSeq.length;
  const gcContent = length > 0 && detectedType === 'DNA' ? (gcCount / length) * 100 : undefined;
  const hydrophobicRatio = length > 0 && detectedType === 'PROTEIN' ? (hydrophobicCount / length) * 100 : 0;
  const mwKDa = totalMw > 0 ? (totalMw - (length - 1) * 18.015) / 1000 : (length * 0.11);

  return {
    cleanSeq: rawSeq,
    header,
    detectedType,
    stats: {
      length,
      type: detectedType,
      gcContent: gcContent !== undefined ? Math.round(gcContent * 10) / 10 : undefined,
      hydrophobicRatio: Math.round(hydrophobicRatio * 10) / 10,
      chargeEstimate: Math.round(netCharge * 10) / 10,
      molecularWeight: Math.round(mwKDa * 10) / 10,
      valid: length > 0,
    }
  };
}

export function formatSequenceWithMask(sequence: string, targetPos: number, maskString: string = '<mask\\>'): string {
  const idx = targetPos - 1;
  if (idx < 0 || idx >= sequence.length) return sequence;
  return sequence.slice(0, idx) + maskString + sequence.slice(idx + 1);
}

