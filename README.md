# Protein Variant Effect Predictor (ESM-2 Zero-Shot)

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-ee4c2c.svg)](https://pytorch.org/)
[![HuggingFace](https://img.shields.io/badge/HuggingFace-Transformers-yellow.svg)](https://huggingface.co/)
[![Model](https://img.shields.io/badge/Model-ESM--2%20(8M%20UR50D)-green.svg)](https://huggingface.co/facebook/esm2_t6_8M_UR50D)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

An in-silico variant pathogenicity prediction pipeline leveraging Meta's **ESM-2 protein language model** (`esm2_t6_8M_UR50D`). Evaluates the functional impact of missense mutations in the human dystrophin (*DMD*) gene using zero-shot masked marginal log-likelihood ratio (LLR) scoring—bypassing the need for supervised training on scarce clinical labels.

---

## Technical Highlights & Engineering Decisions

* **Zero-Shot Transfer Learning:** Uses pre-trained evolutionary representations from ESM-2 to score mutations without supervised fine-tuning, avoiding overfitting on historical label bias.
* **$O(N^2)$ Self-Attention Bottleneck Mitigation:** Dystrophin (3,685 residues) exceeds ESM-2's 1,024-token context window. Implemented an automated sliding context window ($\pm 50$ amino acids) centered on the mutation site, reducing memory overhead by over **1,000×** while preserving crucial local biochemical context.
* **Coordinate Invariant Pipeline:** Features automated 1-based biological coordinate conversion to 0-based memory indexing, coupled with runtime reference-allele verification to guard against off-by-one errors and transcript isoform mismatches.
* **Vectorized Probability Extraction:** Extracts raw unnormalized logits for the masked index, applies numerical log-softmax normalization via PyTorch, and computes log-odds differences in continuous log space to prevent underflow.

---

## Methodology

### Masked Marginal Log-Likelihood Ratio (LLR)

For a target residue at biological position $i$, the wild-type residue $x_i$ is replaced with the special `<mask>` token. The model predicts the probability distribution over all 20 canonical amino acids conditioned on the sequence context:

$$\text{LLR} = \ln P(x_i = \text{Mutant} \mid X_{\setminus i}) - \ln P(x_i = \text{Wild-Type} \mid X_{\setminus i})$$
