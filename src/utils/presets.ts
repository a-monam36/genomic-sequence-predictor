import { SequencePreset } from '../types';

export const PRESETS: SequencePreset[] = [
  {
    id: 'dystrophin-human',
    name: 'Dystrophin (Human DMD)',
    badge: 'Muscular Dystrophy',
    organism: 'Homo sapiens',
    type: 'PROTEIN',
    description: 'Human DMD actin-binding N-terminal & rod domain snippet. Target of known cardiomyopathy and Duchenne muscular dystrophy pathogenic missense variants.',
    sequence: 'MLWWEEVEDCYEREDVQKKTFTKWVNAQFSKFGKQHIENLFSDLQDGRRLLDLLEGLTGQKLPKEKGSTRVHALNNVNKALRVLQNNNVDLVNIGSTDIVDGNHKLTLGLIWNIILHWQVKNVMKNIMAGLQQTNSEKILLSWVRQSTRNYPQVNVINFTTSWSDGLALNALIHSHRPDLFDWNSVVCQQSATQRLEHAFNIARYQLGIEKLLDPEDVDTTYPDKKSILMYITSLFQVLPQQVSIEAIQEVEML',
    defaultTargetPos: 54,
    defaultMutant: 'R',
    referenceNote: 'p.Leu54Arg: disrupts hydrophobic packing in actin-binding CH1 domain; validated pathogenic in ESM-2 benchmark.'
  },
  {
    id: 'p53-tumor-suppressor',
    name: 'p53 Core Domain (TP53)',
    badge: 'Oncogenic Hotspot',
    organism: 'Homo sapiens',
    type: 'PROTEIN',
    description: 'Central DNA-binding domain of Cellular tumor antigen p53. Contains critical structural zinc-binding and minor groove contact residues.',
    sequence: 'MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQWFTEDPGPDEAPRMPEAAPPVAPAPAAPTPAAPAPAPSWPLSSSVPSQKTYQGSYGFRLGFLHSGTAKSVTCTYSPALNKMFCQLAKTCPVQLWVDSTPPPGTRVRAMAIYKQSQHMTEVVRRCPHHERCSDSDGLAPPQHLIRVEGNLRVEYLDDRNTFRHSVVVPYEPPEVGSDCTTIHYNYMCNSSCMGGMNRRPILTIITLEDSSGNLLGRNSFEVRVCACPGRDRRTEEENL',
    defaultTargetPos: 175,
    defaultMutant: 'H',
    referenceNote: 'p.Arg175His: canonical dominant-negative cancer driver mutation causing zinc coordination collapse.'
  },
  {
    id: 'synthetic-dna-helix',
    name: 'Synthetic DNA Test Strand',
    badge: 'Bioluminescent DNA',
    organism: 'Synthetic Biolab Construct',
    type: 'DNA',
    description: 'Engineered 72-bp double-helix template with alternating GC-rich and AT-rich promoter motifs for nucleotide substitution testing.',
    sequence: 'ATGCGATCGATCGTCGAACCGGATCCATAGCGTAGCCGATCGATAGCTAGCTAGCGTACGATCGTACGATCG',
    defaultTargetPos: 24,
    defaultMutant: 'T',
    referenceNote: 'G->T transversion inside conserved core promoter motif altering transcription factor binding.'
  },
  {
    id: 'gfp-chromophore',
    name: 'GFP Chromophore (A. victoria)',
    badge: 'Fluorescence Triad',
    organism: 'Aequorea victoria',
    type: 'PROTEIN',
    description: 'Green Fluorescent Protein barrel domain housing the autocatalytic Ser65-Tyr66-Gly67 fluorophore triad.',
    sequence: 'MSKGEELFTGVVPILVELDGDVNGHKFSVSGEGEGDATYGKLTLKFICTTGKLPVPWPTLVTTFSYGVQCFSRYPDHMKQHDFFKSAMPEGYVQERTIFFKDDGNYKTRAEVKFEGDTLVNRIELKGIDFKEDGNILGHKLEYNYNSHNVYIMADKQKNGIKVNFKIRHNIEDGSVQLADHYQQNTPIGDGPVLLPDNHYLSTQSALSKDPNEKRDHMVLLEFVTAAGITHGMDELYK',
    defaultTargetPos: 65,
    defaultMutant: 'T',
    referenceNote: 'p.Ser65Thr: the signature "Enhanced GFP" (EGFP) mutation dramatically increasing excitation wavelength and quantum yield.'
  }
];

