import os
import sys
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional

# Nustatome logger'į, kad matytume išvestį
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
console = logging.getLogger() # Naudosime bendrą logger'į kaip 'console'

# Sukuriame minimalistinę ExecutionContext klasę, reikalingą ImageManager
class MockExecutionContext:
    def __init__(self, project_root: str, ai_work_dir: str):
        self.project_root = Path(project_root)
        self.ai_work_dir = Path(ai_work_dir)
        self.dry_run = False # Nustatykite į True, jei norite tik peržiūrėti pakeitimus be išsaugojimo
        self.llm_manager = None # Šiam skriptui LLM nereikia, tad paliekame None
        self.all_configs = {} # Šiam skriptui konfigūracijos nereikia

# Importuojame ImageManager klasę iš images.py
# Įsitikinkite, kad images.py yra tame pačiame kataloge arba pasiekiamas Python PATH
try:
    from images import ImageManager, MarkdownPage
except ImportError:
    print("Klaida: Nepavyko importuoti ImageManager arba MarkdownPage iš images.py.")
    print("Įsitikinkite, kad images.py failas yra tame pačiame kataloge arba jo kelias yra nustatytas PYTHONPATH.")
    sys.exit(1)

def main():
    # Nustatykite savo projekto šakninį katalogą
    # Paprastai tai yra katalogas, kuriame yra src/assets ir src/content
    project_root = Path(__file__).parent.parent.parent # Pavyzdys: jei skriptas yra `utils/scripts/fix_images.py`
    # Jei skriptas paleidžiamas iš projekto šakninio katalogo, tada:
    # project_root = Path(os.getcwd())

    # Patikriname, ar src/assets/images ir src/content katalogai egzistuoja
    assets_images_path = project_root / "src" / "assets" / "images"
    content_path = project_root / "src" / "content"

    if not assets_images_path.exists():
        console.error(f"Klaida: Katalogas '{assets_images_path}' nerastas. Patikrinkite 'project_root' nustatymus.")
        sys.exit(1)
    if not content_path.exists():
        console.error(f"Klaida: Katalogas '{content_path}' nerastas. Patikrinkite 'project_root' nustatymus.")
        sys.exit(1)

    console.info(f"Projekto šakninis katalogas: {project_root}")
    console.info(f"Vaizdų katalogas: {assets_images_path}")
    console.info(f"Turinio katalogas: {content_path}")

    # Inicijuojame ExecutionContext
    context = MockExecutionContext(str(project_root), str(project_root / "ai_work_dir"))

    # Inicijuojame ImageManager
    image_manager = ImageManager(context)

    # Surinkime visus .mdx ir .md failus iš src/content
    sitemap: List[Dict[str, Any]] = []
    for root, _, files in os.walk(content_path):
        for file in files:
            if file.endswith(('.mdx', '.md')):
                full_path = Path(root) / file
                # Sukuriame sitemap įrašą, kuris yra suderinamas su ImageManager
                sitemap.append({'filepath': str(full_path), 'title': full_path.stem})

    if not sitemap:
        console.warning("Nerasta jokių .mdx ar .md failų src/content kataloge.")
        return

    console.info(f"Rasta {len(sitemap)} straipsnių apdorojimui.")

    # Paleidžiame vaizdų nuorodų audito ir taisymo darbo eigą
    # Šis metodas interaktyviai leis pasirinkti failus taisymui ir parodys skirtumus
    image_manager.audit_and_fix_image_references_workflow(sitemap)

    console.info("Vaizdų nuorodų taisymo procesas baigtas.")

if __name__ == "__main__":
    main()
