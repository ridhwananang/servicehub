import re

py_path = r"c:\Users\An\Herd\servicehub\create_bab3_doc.py"

with open(py_path, "r", encoding="utf-8") as f:
    content = f.read()

# Marker for Sub-bab 3.3 start
start_marker = '    # 3.3 ANALISA DAN PEMBAHASAN'
# Marker for art_dir at end
end_marker = '    art_dir = r"C:\\Users\\An\\.gemini\\antigravity\\brain\\dcbd55fb-38f6-46db-b6e3-9b160c1ca30f"'

if start_marker in content and end_marker in content:
    idx_start = content.index(start_marker)
    # Find the comment block start before start_marker if any
    prefix_start = content.rfind('    # ===', 0, idx_start)
    if prefix_start != -1 and idx_start - prefix_start < 150:
        idx_start = prefix_start

    idx_end = content.index(end_marker)

    cleaned_sub33 = (
        '    # =========================================================================\n'
        '    # 3.3 ANALISA DAN PEMBAHASAN\n'
        '    # =========================================================================\n'
        '    add_h1("3.3 Analisa dan Pembahasan")\n\n'
    )

    new_content = content[:idx_start] + cleaned_sub33 + content[idx_end:]

    with open(py_path, "w", encoding="utf-8") as f:
        f.write(new_content)

    print("Sub-bab 3.3 cleaned successfully.")
else:
    print("Markers not found:", start_marker in content, end_marker in content)
