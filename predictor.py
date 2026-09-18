import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForMaskedLM

print("Loading healthy reference sequence...")
try:
    with open("dystrophin_clean.txt", "r") as file:
        WT_SEQUENCE = file.read().strip()
    print(f"Loaded a healthy sequence of {len(WT_SEQUENCE)} letters.")
except FileNotFoundError:
    print("Error: 'dystrophin_clean.txt' not found. Please run clean_fasta.py first.")
    exit()

MODEL_NAME = "facebook/esm2_t6_8M_UR50D"
print(f"\nLoading model: {MODEL_NAME}...")

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForMaskedLM.from_pretrained(MODEL_NAME)
model.eval()

print("AI Model loaded successfully!")

def prepare_masked_input(wt_aa: str, pos_1based: int, window_size: int = 50):
    pos_0based = pos_1based - 1

    actual_letter = WT_SEQUENCE[pos_0based]
    if actual_letter != wt_aa:
        raise ValueError(f"Position {pos_1based} is actually '{actual_letter}', not '{wt_aa}'!")

    start_idx = max(0, pos_0based - window_size)
    end_idx = min(len(WT_SEQUENCE), pos_0based + window_size + 1)
    sub_sequence = WT_SEQUENCE[start_idx:end_idx]

    target_idx_in_sub = pos_0based - start_idx

    masked_sequence = (
        sub_sequence[:target_idx_in_sub] 
        + "<mask\>" 
        + sub_sequence[target_idx_in_sub + 1:]
    )

    tokenized_inputs = tokenizer(masked_sequence, return_tensors="pt")
    mask_token_id = tokenizer.mask_token_id
    mask_position = torch.where(tokenized_inputs["input_ids"] == mask_token_id)[1].item()

    return tokenized_inputs, mask_position

def score_mutation(wt_aa: str, pos_1based: int, mut_aa: str, window_size: int = 50):
    inputs, mask_pos = prepare_masked_input(wt_aa, pos_1based, window_size)
    
    with torch.no_grad():
        outputs = model(**inputs)
        
    logits = outputs.logits[0, mask_pos, :]
    log_probs = F.log_softmax(logits, dim=-1)
    
    wt_token_id = tokenizer.convert_tokens_to_ids(wt_aa)
    mut_token_id = tokenizer.convert_tokens_to_ids(mut_aa)
    
    log_prob_wt = log_probs[wt_token_id].item()
    log_prob_mut = log_probs[mut_token_id].item()
    
    llr = log_prob_mut - log_prob_wt
    
    return llr, log_prob_wt, log_prob_mut

if __name__ == "__main__":
    print("\n--- Running Variant Evaluation ---")
    
    target_pos = 54
    wt = "L"
    mut = "R"
    
    print(f"Evaluating mutation: p.{wt}{target_pos}{mut}")
    
    try:
        llr_score, p_wt, p_mut = score_mutation(wt_aa=wt, pos_1based=target_pos, mut_aa=mut)
        
        print(f"Log-Prob (Wild-Type {wt}): {p_wt:.4f}")
        print(f"Log-Prob (Mutant {mut}):   {p_mut:.4f}")
        print(f"Log-Likelihood Ratio (LLR): {llr_score:.4f}")
        
        if llr_score < -3.0:
            print("Prediction: Highly Disruptive (Likely Pathogenic)")
        elif llr_score < -1.5:
            print("Prediction: Moderately Disruptive (VUS / Potentially Pathogenic)")
        else:
            print("Prediction: Tolerated (Likely Benign)")
            
    except ValueError as e:
        print(f"Execution Halted: {e}")