import re

with open("create_bab3_doc.py", "r", encoding="utf-8") as f:
    text = f.read()

start_marker = "    # =========================================================================" + "\n" + "    # 3.3.1 PEMBAHASAN ALGORITMA"
end_marker = "    art_dir = r\"C:\\Users\\An\\.gemini\\antigravity\\brain"

s_idx = text.find(start_marker)
e_idx = text.find(end_marker)

print(f"Start index: {s_idx}, End index: {e_idx}")
if s_idx != -1 and e_idx != -1:
    print("Section 3.3.1 length:", e_idx - s_idx)
