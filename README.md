



# 🧬 Protein Variant Effect Predictor
### Zero-Shot Pathogenicity & Missense Mutation Profiling via ESM-2

[![Live Interface](https://img.shields.io/badge/Live%20Demo-Interactive%203D%20App-00f2fe?style=for-the-badge&logo=react&logoColor=black)](http://10.10.15.77:5173/)


[![Python 3.10+](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![PyTorch 2.0+](https://img.shields.io/badge/PyTorch-2.0+-EE4C2C?style=flat-square&logo=pytorch&logoColor=white)](https://pytorch.org/)
[![Hugging Face](https://img.shields.io/badge/Transformers-Hugging%20Face-FFD21E?style=flat-square&logo=huggingface&logoColor=black)](https://huggingface.co/)
[![Model](https://img.shields.io/badge/Model-ESM--2%20(8M%20UR50D)-00C853?style=flat-square)](https://huggingface.co/facebook/esm2_t6_8M_UR50D)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r128+-black?style=flat-square&logo=three.js&logoColor=white)](https://threejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-9C27B0?style=flat-square)](LICENSE)


https://github.com/user-attachments/assets/d4dc80fd-7a3a-435c-8668-5b0081b04421




An *in-silico* variant pathogenicity prediction engine powered by Meta AI's **ESM-2 protein language model** (`esm2_t6_8M_UR50D`). It quantifies the functional impact of missense mutations in human proteins—benchmarked against the human dystrophin (*DMD*) gene—using zero-shot masked marginal Log-Likelihood Ratio (LLR) scoring, accompanied by an interactive 3D bioluminescent sequence workspace.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Web Interface](#-web-interface)
- [Technical Highlights & Engineering Decisions](#-technical-highlights--engineering-decisions)
- [Methodology](#-methodology)
- [Interpretation Matrix](#-interpretation-matrix)
- [Project Architecture](#-project-architecture)
- [Quick Start](#-quick-start)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
- [License](#-license)

---

## 🔬 Overview

Traditional variant effect prediction methods rely heavily on supervised classifiers trained on clinically curated datasets (e.g., ClinVar), making them prone to ascertainment bias and limited in generalizing across rare or novel variants.

This pipeline bypasses labeled training data entirely by leveraging pre-trained evolutionary representations learned across millions of natural sequences by **ESM-2**. By computing the masked marginal log-odds difference between wild-type and mutated residues in context, the system infers whether an amino acid substitution disrupts conserved evolutionary and structural constraints.

---

## 🌐 Web Interface

The project pairs the scoring engine with a reactive web console featuring an interactive 3D bioluminescent DNA/protein chain visualizer.

- **URL:** [http://10.10.15.77:5173/](http://10.10.15.77:5173/)
- **Features:**
  - Real-time 3D double helix built with `@react-three/fiber` and custom glow materials.
  - Interactive sequence track supporting custom FASTA strings, presets, and 1-based indexing.
  - Interactive residue masking (`<mask\>`) for missing base prediction and variant substitution analysis.
  - Real-time LLR score calculation, pathogenicity categorization, and probability distributions.

---

## ⚡ Technical Highlights & Engineering Decisions

* **Zero-Shot Transfer Learning:** Uses pre-trained evolutionary representations from ESM-2 to score mutations without supervised fine-tuning, avoiding overfitting on historical label bias.
* **$O(N^2)$ Self-Attention Bottleneck Mitigation:** Full-length human dystrophin contains 3,685 amino acids, far exceeding ESM-2's 1,024-token context window. Implemented an automated sliding context window ($\pm 50$ residues centered on the mutation site), cutting compute and memory overhead by over **1,000×** while preserving local biochemical context.
* **Runtime Coordinate Invariant Validation:** Automatically converts 1-based biological coordinates into 0-based memory indices while asserting that the reference sequence matches the target wild-type allele before scoring.
* **Vectorized Log-Odds Extraction:** Extracts raw unnormalized logits for the masked index, applies numerical log-softmax normalization via PyTorch, and computes log-odds differences directly in log space to prevent floating-point underflow.

---

## 📐 Methodology

### Masked Marginal Log-Likelihood Ratio (LLR)

For a residue at position $i$, the native residue $x_i$ is replaced by ESM-2's `<mask\>` token. The language model predicts the conditional probability distribution over all 20 canonical amino acids given the surrounding sequence context $X_{\setminus i}$:

$$\text{LLR} = \ln P(x_i = \text{Mutant} \mid X_{\setminus i}) - \ln P(x_i = \text{Wild-Type} \mid X_{\setminus i})$$

```text
Wild-Type Sequence :  ... [E] [K] [ L ] [R] [T] ...
Masked Extraction  :  ... [E] [K] [<mask\>] [R] [T] ...
                                    │
                       ┌────────────┴────────────┐
                       ▼                         ▼
               P(x_i = Mutant)            P(x_i = Wild-Type)
                       └────────────┬────────────┘
                                    ▼
                      LLR = ln P(Mut) - ln P(WT)

