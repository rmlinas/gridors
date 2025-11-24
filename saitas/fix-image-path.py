import os
import re
from pathlib import Path

# --- KONFIGŪRACIJA ---

# Nurodykite pagrindinį turinio katalogą.
# Skriptas rekursyviai ieškos failų šiame kataloge.
CONTENT_DIR = Path(__file__).parent / "src" / "content"

# Kelias, kurio ieškosime ir kurį taisysime.
# Ieškosime eilučių, prasidedančių `image: /assets/images/...`
INCORRECT_PREFIX = "/assets/images/"
CORRECT_PREFIX = "/src/assets/images/"

# --- SKRIPTO LOGIKA ---

def fix_frontmatter_image_paths():
    """
    Peržiūri visus .md ir .mdx failus nurodytame kataloge ir
    pataiso 'image:' laukelio kelią frontmatter dalyje,
    pridėdamas '/src' pradžioje.
    """
    if not CONTENT_DIR.is_dir():
        print(f"❌ KLAIDA: Turinio katalogas nerastas: '{CONTENT_DIR}'")
        return

    print(f"--- 🔍 Pradedama kelių paieška kataloge: {CONTENT_DIR} ---")

    # Ieškome .md ir .mdx failų
    file_extensions = ("*.md", "*.mdx")
    files_to_check = []
    for ext in file_extensions:
        files_to_check.extend(CONTENT_DIR.rglob(ext))

    updated_files_count = 0
    skipped_files_count = 0

    for file_path in files_to_check:
        try:
            content = file_path.read_text(encoding="utf-8")

            # Regex, kad rastume 'image:' eilutę su neteisingu keliu
            # ieškome `image:` po kurio eina tarpai ir kelias, prasidedantis INCORRECT_PREFIX
            pattern = re.compile(r"^(image:\s*)(" + re.escape(INCORRECT_PREFIX) + r".*)$", re.MULTILINE)

            # Pakeičiame rastą eilutę, pridėdami CORRECT_PREFIX
            # \1 - pirma grupė (image: ), \2 - antra grupė (kelias be /assets/images/)
            # Pataisymas: \g<1> išlaiko `image: ` dalį, o `CORRECT_PREFIX` prideda teisingą kelią.
            # `match.group(2).lstrip(INCORRECT_PREFIX)` pašalina seną prefix'ą, kad nebūtų dubliavimo.
            def replacer(match):
                image_path_suffix = match.group(2).lstrip(INCORRECT_PREFIX)
                return f"{match.group(1)}{CORRECT_PREFIX}{image_path_suffix}"

            new_content, num_replacements = pattern.subn(replacer, content)

            if num_replacements > 0:
                file_path.write_text(new_content, encoding="utf-8")
                print(f"✅ Atnaujinta: {file_path.relative_to(CONTENT_DIR.parent)}")
                updated_files_count += 1
            else:
                skipped_files_count += 1

        except Exception as e:
            print(f"❌ KLAIDA skaitant ar rašant failą {file_path}: {e}")

    print("\n--- ✨ Pabaiga ---")
    print(f"Total files updated: {updated_files_count}")
    print(f"Total files checked without changes: {skipped_files_count}")

if __name__ == "__main__":
    fix_frontmatter_image_paths()
