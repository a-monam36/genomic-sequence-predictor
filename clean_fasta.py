def clean_fasta(input_file: str, output_file: str):
    with open(input_file, "r") as f:
        lines = f.readlines()
    
    sequence = "".join(line.strip() for line in lines[1:])
    
    with open(output_file, "w") as f:
        f.write(sequence)
        
    print(f"Cleaned sequence saved to {output_file}.")
    print(f"Total length: {len(sequence)} amino acids.")

if __name__ == "__main__":
    clean_fasta("dystrophin_wt.fasta", "dystrophin_clean.txt")