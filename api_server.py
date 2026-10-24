"""
HelixESM Backend API Server
Serves facebook/esm2_t6_8M_UR50D for Variant Scoring and Missing Residue Prediction.
Run with:
    python api_server.py
or:
    uvicorn api_server:app --host 0.0.0.0 --port 8000 --reload
"""

import sys
import torch
import torch.nn.functional as F
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List

app = FastAPI(title="HelixESM Inference API", version="1.0.0")

# Enable CORS for the Vite React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_NAME = "facebook/esm2_t6_8M_UR50D"
tokenizer = None
model = None

def load_esm_model():
    global tokenizer, model
    if model is None:
        print(f"Loading {MODEL_NAME}...")
        try:
            from transformers import AutoTokenizer, AutoModelForMaskedLM
            tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
            model = AutoModelForMaskedLM.from_pretrained(MODEL_NAME)
            model.eval()
            print("ESM-2 loaded successfully!")
        except Exception as e:
            print(f"Failed to load ESM-2: {e}")
            raise e

class PredictRequest(BaseModel):
    sequence: str
    pos_1based: int
    wt_aa: str
    mut_aa: str
    window_size: int = 50
    mode: str = "mutation" # "mutation" or "mask"

class MaskCandidate(BaseModel):
    residue: str
    name: str
    category: str
    probability: float
    logProb: float

class PredictResponse(BaseModel):
    targetPos: int
    wtResidue: str
    mutResidue: str
    mode: str
    llr: float
    p_wt: float
    p_mut: float
    verdict: str
    verdictLabel: str
    verdictColor: str
    description: str
    topCandidates: List[MaskCandidate]

@app.on_event("startup")
def startup_event():
    try:
        load_esm_model()
    except Exception as e:
        print(f"Warning: Model not pre-loaded: {e}")

@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_NAME, "loaded": model is not None}

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if model is None or tokenizer is None:
        load_esm_model()

    pos_0based = req.pos_1based - 1
    seq = req.sequence

    if pos_0based < 0 or pos_0based >= len(seq):
        raise HTTPException(status_code=400, detail=f"Target position {req.pos_1based} is out of sequence bounds (1 to {len(seq)}).")

    actual_letter = seq[pos_0based]
    if actual_letter != req.wt_aa:
        print(f"Notice: sequence letter at {req.pos_1based} is '{actual_letter}', expected '{req.wt_aa}'. Using '{actual_letter}'.")
        req.wt_aa = actual_letter

    start_idx = max(0, pos_0based - req.window_size)
    end_idx = min(len(seq), pos_0based + req.window_size + 1)
    sub_sequence = seq[start_idx:end_idx]
    target_idx_in_sub = pos_0based - start_idx

    masked_sequence = (
        sub_sequence[:target_idx_in_sub]
        + "<mask\>"
        + sub_sequence[target_idx_in_sub + 1:]
    )

    tokenized_inputs = tokenizer(masked_sequence, return_tensors="pt")
    mask_token_id = tokenizer.mask_token_id
    mask_positions = torch.where(tokenized_inputs["input_ids"] == mask_token_id)
    if len(mask_positions[1]) == 0:
        raise HTTPException(status_code=500, detail="Mask token position could not be located.")

    mask_position = mask_positions[1].item()

    with torch.no_grad():
        outputs = model(**tokenized_inputs)

    logits = outputs.logits[0, mask_position, :]
    log_probs = F.log_softmax(logits, dim=-1)
    probs = F.softmax(logits, dim=-1)

    # 20 standard amino acids
    STANDARD_AAS = ['A', 'R', 'N', 'D', 'C', 'Q', 'E', 'G', 'H', 'I',
                    'L', 'K', 'M', 'F', 'P', 'S', 'T', 'W', 'Y', 'V']

    # Top candidates ranking
    candidate_scores = []
    for aa in STANDARD_AAS:
        token_id = tokenizer.convert_tokens_to_ids(aa)
        p = probs[token_id].item()
        lp = log_probs[token_id].item()
        candidate_scores.append((aa, p, lp))

    candidate_scores.sort(key=lambda x: x[1], reverse=True)
    top_5 = candidate_scores[:5]

    top_candidates = [
        MaskCandidate(
            residue=aa,
            name=aa,
            category="amino_acid",
            probability=round(p, 4),
            logProb=round(lp, 4)
        )
        for aa, p, lp in top_5
    ]

    wt_token_id = tokenizer.convert_tokens_to_ids(req.wt_aa)
    log_prob_wt = log_probs[wt_token_id].item()

    mut_target = req.mut_aa if req.mode == "mutation" else top_5[0][0]
    mut_token_id = tokenizer.convert_tokens_to_ids(mut_target)
    log_prob_mut = log_probs[mut_token_id].item()

    llr = log_prob_mut - log_prob_wt

    # Verdict criteria
    if llr < -3.0:
        verdict = "pathogenic"
        verdict_label = "Highly Disruptive / Pathogenic"
        verdict_color = "#f43f5e"
        description = "Severe negative log-likelihood penalty. Indicates catastrophic destabilization of native tertiary folding or loss of critical binding motif."
    elif llr < -1.5:
        verdict = "vus"
        verdict_label = "Moderately Disruptive / VUS"
        verdict_color = "#f59e0b"
        description = "Moderate evolutionary constraint observed. Classified as a Variant of Uncertain Significance (VUS) with potential hypomorphic impact."
    else:
        verdict = "tolerated"
        verdict_label = "Tolerated / Likely Benign"
        verdict_color = "#10b981"
        description = "Minimal structural disruption. The evolutionary language model assesses this substitution as naturally permissible."

    return PredictResponse(
        targetPos=req.pos_1based,
        wtResidue=req.wt_aa,
        mutResidue=mut_target,
        mode=req.mode,
        llr=round(llr, 4),
        p_wt=round(log_prob_wt, 4),
        p_mut=round(log_prob_mut, 4),
        verdict=verdict,
        verdictLabel=verdict_label,
        verdictColor=verdict_color,
        description=description,
        topCandidates=top_candidates
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api_server:app", host="127.0.0.1", port=8000, reload=True)

