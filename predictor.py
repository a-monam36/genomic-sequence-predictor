import torch

from transformers import AutoTokenizer, AutoModelForMaskedLM

MODEL_NAME = "facebook/esm2_t6_8M_UR50D"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

model = AutoModelForMaskedLM.from_pretrained(MODEL_NAME)

model.eval() # into evaluation mode

print("AI Model loaded successfully!")


def prepare_masked_input(wt_aa: str, pos1_based: int, window_size: int = 50):
    pos0_based = pos1_based - 1

    actual_letter = WT_SEQUENCE[pos0_based]

    if actual_letter != wt_aa:
        raise ValueError(f"Position {pos_1based} is actually '{actual_letter}', not '{wt_aa}'!")


    start_ind = max(0, pos0_based - window_size)
    end_ind = min(len(WT_SEQ), pos0_based + window_size + 1)
    sub_seq = WT_SEQ[start_ind:end_ind]

    target_ind_in_sub = pos0_based - start_ind


    masked_sequence = (
        sub_seq[:target_ind_in_sub] + "<mask>" 
        + sub_seq[target_ind_in_sub + 1:]
    )

    tokenized_inputs = tokenizer(masked_sequence, return_tensors= "pt")

    mask_token_id = tokenizer.mask_token_id
    mask_position = torch.where(tokenized_inputs["input_ids"] == mask_token_id)[1].item()

    return tokenized_inputs, mask_position


inputs, mask_pos = prepare_masked_input(wt_aa="L", pos_1based=54)
print(f"Mask created successfully at token index: {mask_pos}")