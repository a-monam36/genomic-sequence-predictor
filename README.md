# DMD Zero-Shot Variant Effect Predictor

## Overview
This repository implements an in-silico variant effect predictor for the human Dystrophin (*DMD*) gene using Meta's ESM-2 protein language model. By evaluating the masked marginal Log-Likelihood Ratio (LLR) between mutant and wild-type amino acids in a local structural context, the pipeline discriminates between likely benign (tolerated) and likely pathogenic (disruptive) missense mutations without requiring task-specific training data.

## Background & Methodology
* **Zero-Shot Masked Marginal Scoring:** The model predicts the fitness effect of a mutation by replacing the target residue with a `<mask\>` token. We extract the raw logits for the masked position and compute the LLR: `LLR = ln(P_mutant) - ln(P_wild_type)`. A negative LLR indicates a biologically unfavorable mutation that the model assigns a lower probability to compared to the naturally occurring sequence.
* **Context Windowing (O(N²) Optimization):** The canonical Dystrophin muscle isoform (UniProt P11532) is 3,685 amino acids long, far exceeding ESM-2's 1,024-token context limit. This pipeline extracts a 101-residue local context window (±50 residues) around the mutation site. This prevents out-of-bounds tensor errors and reduces self-attention computational memory overhead by over 1,000x while preserving the immediate biochemical environment necessary for accurate prediction.

## Repository Structure
* **`clean_fasta.py`**: Preprocessing script that strips metadata from raw UniProt FASTA downloads to generate a continuous, 0-indexed pure amino acid string.
* **`predictor.py`**: The core evaluation engine. Handles bioinformatics coordinate translation (1-based to 0-based), context window slicing, tensor preparation, ESM-2 inference, and LLR thresholding.

## Installation
The pipeline requires Python 3.8+ and standard deep learning dependencies.

```bash
# 1. Clone the repository
git clone [https://github.com/your-username/dmd-esm2-variant-effect.git](https://github.com/your-username/dmd-esm2-variant-effect.git)
cd dmd-esm2-variant-effect

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install torch transformers
