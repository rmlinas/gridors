import os
import re
import yaml
from datetime import datetime
from pathlib import Path

BLOG_DIR = Path("src/content/blog")

def fix_pubdate_in_file(filepath):
    content = filepath.read_text(encoding="utf-8")
    if not content.startswith("---"):
        return False

    parts = content.split("---")
    if len(parts) < 3:
        return False

    frontmatter_raw = parts[1]
    body = "---".join(parts[2:])

    try:
        data = yaml.safe_load(frontmatter_raw)
    except Exception as e:
        print(f"YAML error in {filepath}: {e}")
        return False

    if "pubDate" in data:
        return False  # jau yra

    if "date" in data:
        data["pubDate"] = data["date"]
    else:
        data["pubDate"] = datetime.utcnow().isoformat()

    new_frontmatter = yaml.dump(data, sort_keys=False, allow_unicode=True)
    new_content = f"---\n{new_frontmatter}---{body}"

    filepath.write_text(new_content, encoding="utf-8")
    print(f"✔ Fixed pubDate in {filepath.relative_to(BLOG_DIR.parent)}")
    return True

def main():
    files_fixed = 0
    for file in BLOG_DIR.glob("*.md"):
        if fix_pubdate_in_file(file):
            files_fixed += 1
    print(f"\n✅ Done. Total files updated: {files_fixed}")

if __name__ == "__main__":
    main()
