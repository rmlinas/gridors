import os
import re
from pathlib import Path
from typing import List, Tuple, Optional, Dict
import sys
import shlex
import hashlib # Importuojame hashlib, kad galėtume sukurti failo turinio hash'ą

# === KONFIGŪRACIJA ===
# Šakninis katalogas, kuriame yra jūsų Astro projektas (pvz., ten, kur yra src/ ir public/)
# Šį skriptą rekomenduojama laikyti TIESIOGIAI jūsų Astro projekto šakniniame kataloge.
PROJECT_ROOT = Path(__file__).parent 

# Kelias į assets katalogą nuo projekto šaknies (pvz., "src/assets/images")
ASSETS_DIR_FROM_ROOT = "src/assets/images"
ASSETS_FULL_PATH = PROJECT_ROOT / ASSETS_DIR_FROM_ROOT # Pilnas kelias iki assets katalogo

# Optional: if you want to read image dimensions for fixing missing width/height
try:
    from PIL import Image as PILImage 
except ImportError:
    PILImage = None
    print("PIL (Pillow) not found. Cannot read image dimensions for validation.")

# === PAGALBINĖS FUNKCIJOS ===
def slugify(text: str) -> str:
    """Konvertuoja tekstą į slug formatą."""
    return re.sub(r'[^a-z0-9_]+', '', text.lower().replace('-', '_'))

def get_image_dimensions(image_path: Path) -> Tuple[Optional[int], Optional[int]]:
    """Gauna vaizdo failo matmenis (plotį, aukštį)."""
    if PILImage:
        try:
            with PILImage.open(image_path) as img:
                return img.width, img.height
        except Exception as e:
            print(f"⚠️ Nepavyko gauti matmenų {image_path}: {e}")
    return None, None

def calculate_content_hash(content: str) -> str:
    """Apskaičiuoja turinio SHA256 hash'ą."""
    return hashlib.sha256(content.encode('utf-8')).hexdigest()

def resolve_layout_path(base_path: Path, layout_path_str: str) -> Optional[Path]:
    """
    Išsprendžia layout kelio stringą į absoliutų Path objektą, atsižvelgiant į bazinį kelią.
    Grąžina Path objektą, jei kelias galioja, kitaip None.
    """
    if layout_path_str.startswith('src/'):
        resolved_path = PROJECT_ROOT / layout_path_str
    elif layout_path_str.startswith('/src/'):
        resolved_path = PROJECT_ROOT / layout_path_str[1:]
    else:
        resolved_path = (base_path / layout_path_str).resolve()
    
    try:
        # Patikrinti, ar kelias yra projekto šakninio katalogo viduje
        resolved_path.relative_to(PROJECT_ROOT)
        return resolved_path
    except ValueError:
        return None

# === PAGRINDINĖ ATKŪRIMO IR TAISYMO LOGIKA ===
def repair_mdx_file(mdx_path: str) -> bool:
    """
    Atkuria ir taiso MDX failo turinį:
    - Pašalina dubliuotus frontmatter blokus.
    - Pašalina dubliuotus importų blokus ir atskirus importus.
    - Pašalina pasikartojantį pagrindinį turinį.
    - Taiso <Image> komponento sintaksės klaidas (pvz., width=123 į width={123}).
    - Pridėtas trūkstamus width/height atributus <Image> komponentams, jei įmanoma.
    - Tikrina importuotų vaizdo failų egzistavimą diske.
    - Pataiso skaitmenų skyriklių klaidas (pvz., 123_ į 123).
    - Pataiso <br> žymes į savaime užsidarančias <br /> žymes.
    - Agresyviai šalina potencialiai klaidingus JavaScript blokus.
    - Pervadina importuojamus kintamuosius, kurie prasideda skaitmeniu.
    - Tikrina ir pataiso layout failo kelio teisingumą (pvz., src/layouts/BaseLayout.astro -> ../../layouts/Layout.astro).
    - Agresyviai šalina bendras HTML struktūras (html, head, body, header, nav, footer, main, doctype).
    - Konvertuoja HTML antraštes (h1, h2, h3 ir t.t.) į Markdown antraštes.
    - Konvertuoja tiesiogines <img> žymes į Astro <Image> komponentus (įskaitant URL).
    - Pašalina kelias iš eilės einančias tuščias eilutes.
    - Pašalina "layout:" eilutę iš frontmatter'io.
    """
    mdx_file = Path(mdx_path)
    if not mdx_file.exists() or mdx_file.suffix != '.mdx':
        print(f"❌ Neteisingas .mdx failas: {mdx_path}")
        return False

    print(f"🔧 Atkuriamas ir taisomas: {mdx_file.name}...")
    original_content = mdx_file.read_text(encoding='utf-8')
    changes_made = False
    file_errors = [] 

    # --- DUPLIKATŲ ŠALINIMO LOGIKA ---

    # 1. Išskiriam frontmatter
    frontmatter_match = re.match(r'^(---|\+{3})\s*\n(.*?)\n\1\s*\n', original_content, re.DOTALL)
    frontmatter = ''
    frontmatter_content = '' # Bus naudojamas layout patikrinimui
    content_after_frontmatter = original_content

    if frontmatter_match:
        frontmatter = frontmatter_match.group(0).strip()
        frontmatter_content = frontmatter_match.group(2) # Išskiriame tik turinį tarp ---
        content_after_frontmatter = original_content[frontmatter_match.end():]

        # --- Pašaliname layout eilutę ---
        layout_line_pattern = r'^(layout:\s*.+?)\s*$'
        if re.search(layout_line_pattern, frontmatter_content, re.MULTILINE):
            frontmatter_content = re.sub(layout_line_pattern, '', frontmatter_content, flags=re.MULTILINE).strip()
            # Atnaujiname visą frontmatter bloką, kad atspindėtų pakeitimą
            frontmatter = f"---{os.linesep}{frontmatter_content}{os.linesep}---"
            print(f"ℹ️ Pašalinta 'layout' eilutė iš {mdx_file.name} frontmatter'io.")
            changes_made = True
        
        # --- PABAIGA PATAISYTO LAYOUT TIKRINIMO ---
    
    # 2. Renkam import blokus ir pagrindinį turinį
    import_lines = []
    body_lines_raw = []
    seen_imports = set()
    
    renamed_imports_map = {}

    for line in content_after_frontmatter.splitlines():
        stripped_line = line.strip()
        if stripped_line.startswith('import'):
            # Pervardijame importuojamus kintamuosius, kurie prasideda skaitmeniu
            import_match = re.match(r"import\s+(.+?)\s+from\s+['\"].+?['\'];", stripped_line)
            if import_match:
                imported_part = import_match.group(1).strip()
                # Tikriname, ar tai ne {} importas ir ar prasideda skaitmeniu
                if not imported_part.startswith('{') and re.match(r'^\d', imported_part):
                    original_var_name = imported_part
                    # Sukuriame naują pavadinimą, pašalindami ne raidinius-skaitmeninius simbolius ir pridėdami priešdėlį
                    new_var_name = "image" + re.sub(r'[^a-zA-Z0-9_]', '', original_var_name)
                    
                    if original_var_name != new_var_name:
                        renamed_imports_map[original_var_name] = new_var_name
                        line = line.replace(original_var_name, new_var_name, 1) # Pakeičiame tik pirmąjį pasitaikymą
                        print(f"ℹ️ Pervadintas importo kintamasis: '{original_var_name}' -> '{new_var_name}' faile {mdx_file.name}.")
                        changes_made = True
            
            if line.strip() not in seen_imports:
                import_lines.append(line)
                seen_imports.add(line.strip())
            else:
                print(f"ℹ️ Pašalintas dubliuojantis importas: {line.strip()} faile {mdx_file.name}.")
                changes_made = True
        else:
            body_lines_raw.append(line)

    # 3. Pagrindinio turinio apdorojimas
    body_content_before_dedup = "\n".join(body_lines_raw).strip()

    # Atnaujiname Image komponentų src atributus pagal pervadintus importus
    for original_name, new_name in renamed_imports_map.items():
        # Naudojame \b žodžio ribai, kad išvengtume dalinių atitikmenų
        pattern = r'src=\s*\{' + re.escape(original_name) + r'\b\}'
        
        if re.search(pattern, body_content_before_dedup):
            body_content_before_dedup = re.sub(
                pattern,
                f'src={{{new_name}}}',
                body_content_before_dedup
            )
            changes_made = True


    # --- Image komponentų taisymas ---
    # Atnaujintas regex, kad atitiktų <Image ... />
    image_component_pattern = re.compile(
        r'(<Image\s+[^>]*?\/>)',
        re.DOTALL
    )

    def fix_image_component_match(match):
        nonlocal changes_made, file_errors, import_lines, seen_imports
        full_tag = match.group(1)
        
        # Greitas patikrinimas, ar jau atrodo gerai (src={var}, alt="...", width={num}, height={num})
        if re.search(r'src=\{[^}]+\}', full_tag) and \
           re.search(r'alt="[^"]*"', full_tag) and \
           re.search(r'(width|height)=\{\d+\}', full_tag) and \
           not re.search(r'(width|height)=\d+(?!\})', full_tag): # Įsitikinkite, kad nėra width=123 be skliaustelių
            return full_tag

        tag_content_match = re.match(r'<Image\s+(.*?)\s*/>', full_tag, re.DOTALL)
        if not tag_content_match:
            return full_tag

        attrs_raw_str = tag_content_match.group(1)
        
        # Naudojame shlex, kad saugiai išanalizuotume atributus
        lexer = shlex.shlex(attrs_raw_str, posix=True)
        lexer.whitespace_split = True
        lexer.quotes = '"\'' # Leidžiame viengubas ir dvigubas kabutes
        
        raw_attrs: Dict[str, Optional[str]] = {}
        try:
            for token in lexer:
                if '=' in token:
                    key, value = token.split('=', 1)
                    raw_attrs[key.strip()] = value.strip()
                else:
                    raw_attrs[token.strip()] = None # Atributai be reikšmės (pvz., `loading`)
        except ValueError as e:
            print(f"❌ Klaida analizuojant atributus su shlex {mdx_file.name}: {full_tag}. Klaida: {e}. Praleidžiamas taisymas.")
            return full_tag 

        fixed_attrs_list = []
        
        src_val = raw_attrs.get('src')
        alt_val = raw_attrs.get('alt')

        # SRC atributo tvarkymas
        if src_val is None:
            file_errors.append(f"{mdx_file.name}: ❌ Trūksta 'src' atributo Image komponente: `{full_tag.strip()}`")
            return full_tag # Negalime tęsti be src
        
        # Užtikriname, kad src būtų {kintamasis} formatu
        if not src_val.startswith('{') or not src_val.endswith('}'):
            print(f"⚠️ 'src' atributas nėra {{kintamasis}} formatu {mdx_file.name}: {full_tag}. Bandoma pataisyti.")
            src_val = src_val.strip('"\'') # Pašaliname kabutes, jei yra
            src_val = f"{{{src_val}}}" # Pridedame garbanotus skliaustelius
            changes_made = True
        fixed_attrs_list.append(f'src={src_val}')

        # ALT atributo tvarkymas
        if alt_val is None:
            file_errors.append(f"{mdx_file.name}: ❌ <Image ...> be `alt` atributo: `{full_tag.strip()}`")
            alt_val = "" # Nustatome tuščią alt, kad būtų validu
            changes_made = True
        
        # Pataisymas: naudojame replace() metodų grandinę, kad išvengtume atvirkštinių brūkšnių f-string'e
        cleaned_alt_val = alt_val.replace("'", "").replace('"', '').replace('{', '').replace('}', '')
        fixed_attrs_list.append(f'alt="{cleaned_alt_val}"')

        # WIDTH ir HEIGHT atributų tvarkymas
        for attr_key in ['width', 'height']:
            attr_val_raw = raw_attrs.get(attr_key)
            
            if attr_val_raw is not None:
                original_attr_val_formatted = attr_val_raw # Išsaugome originalų formatą palyginimui
                
                # Pašaliname skaitmenų skyriklius, jei yra
                cleaned_val_for_int_check = attr_val_raw.strip('\'"{}\'')
                
                if '_' in cleaned_val_for_int_check:
                    print(f"⚠️ Pašalinti skaitmenų skyrikliai iš '{attr_key}' atributo: '{cleaned_val_for_int_check}' faile {mdx_file.name}.")
                    cleaned_val_for_int_check = cleaned_val_for_int_check.replace('_', '')
                    changes_made = True

                try:
                    int_val = int(cleaned_val_for_int_check)
                    formatted_val = f'{{{int_val}}}'
                    fixed_attrs_list.append(f'{attr_key}={formatted_val}')
                    
                    if original_attr_val_formatted != formatted_val:
                        print(f"ℹ️ Pataisytas '{attr_key}' atributo formatas {mdx_file.name}: {full_tag} -> {attr_key}={formatted_val}")
                        changes_made = True
                except ValueError:
                    # Jei reikšmė nėra skaičius, bet nėra kabutėse ar skliausteliuose, įdedame į kabutes
                    if not (original_attr_val_formatted.startswith('"') and original_attr_val_formatted.endswith('"')) and \
                       not (original_attr_val_formatted.startswith('{') and original_attr_val_formatted.endswith('}')) and \
                       not (original_attr_val_formatted.startswith('\'') and original_attr_val_formatted.endswith('\'')):
                        
                        formatted_val = f'"{original_attr_val_formatted}"'
                        fixed_attrs_list.append(f'{attr_key}={formatted_val}')
                        print(f"ℹ️ Pataisytas '{attr_key}' atributo formatas (ne skaičius) {mdx_file.name}: {full_tag} -> {attr_key}=\"{formatted_val}\"")
                        changes_made = True
                    else: # Jau tinkamai formatuota (kabutėse ar skliausteliuose)
                        fixed_attrs_list.append(f'{attr_key}={original_attr_val_formatted}')
            
            elif raw_attrs.get(attr_key) is None: # Atributas visiškai trūksta
                file_errors.append(f"{mdx_file.name}: ❌ <Image ...> be `{attr_key}` atributo: `{full_tag.strip()}`")
                
                # Bandoma gauti matmenis iš importuoto vaizdo failo
                if PILImage and src_val and src_val.startswith('{') and src_val.endswith('}'):
                    src_var_name = src_val.strip('{}')
                    image_path_from_import = None
                    for imp_line in import_lines:
                        # Patikriname, ar kintamasis buvo pervadintas
                        src_var_name_to_check = renamed_imports_map.get(src_var_name, src_var_name)

                        if f"import {src_var_name_to_check} from '" in imp_line or f"import {src_var_name_to_check} from \"" in imp_line:
                            match_path = re.search(r"from\s+['\"]([^'\"]+)['\'];", imp_line)
                            if match_path:
                                image_path_from_import = match_path.group(1)
                                break
                    
                    if image_path_from_import:
                        full_disk_path = None
                        # Bandoma išspręsti importo kelią į fizinį failą diske
                        if image_path_from_import.startswith('/'):
                            full_disk_path = PROJECT_ROOT / image_path_from_import.lstrip('/')
                        elif image_path_from_import.startswith('./'):
                            full_disk_path = mdx_file.parent / image_path_from_import
                        else: # Gali būti tik failo pavadinimas, ieškome assets kataloge
                            image_name_from_path = Path(image_path_from_import).name
                            full_disk_path = ASSETS_FULL_PATH / image_name_from_path 
                        
                        if full_disk_path and full_disk_path.exists():
                            w, h = get_image_dimensions(full_disk_path)
                            if attr_key == 'width' and w is not None:
                                fixed_attrs_list.append(f'width={{{w}}}')
                                changes_made = True
                                print(f"ℹ️ Pridėtas trūkstamas 'width' atributas į {mdx_file.name} iš vaizdo matmenų.")
                            elif attr_key == 'height' and h is not None:
                                fixed_attrs_list.append(f'height={{{h}}}')
                                changes_made = True
                                print(f"ℹ️ Pridėtas trūkstamas 'height' atributas į {mdx_file.name} iš vaizdo matmenų.")
                        else:
                            if full_disk_path:
                                print(f"⚠️ Nepavyko rasti vaizdo failo matmenims: {full_disk_path}")
                            else:
                                print(f"⚠️ Nepavyko išspręsti vaizdo kelio iš importo: {image_path_from_import}")
                else:
                    # Jei nepavyko gauti matmenų, pridedame numatytąjį plotį, kad būtų išvengta klaidų
                    if attr_key == 'width': # Paprastai pakanka pločio, aukštis gali būti automatinis
                        fixed_attrs_list.append(f'width={{{600}}}') # Numatytasis plotis
                        changes_made = True
                        print(f"ℹ️ Pridėtas numatytasis 'width' atributas į {mdx_file.name}.")
        
        # Pridedame visus kitus atributus, kurie nebuvo src, alt, width, height
        for key, value in raw_attrs.items():
            if key not in ['src', 'alt', 'width', 'height']: 
                if value is None: # Atributas be reikšmės (pvz., `loading`)
                    fixed_attrs_list.append(key)
                elif value.startswith('{') and value.endswith('}'):
                    fixed_attrs_list.append(f'{key}={value}')
                elif value.startswith('"') and value.endswith('"'):
                    fixed_attrs_list.append(f'{key}={value}')
                elif value.startswith('\'') and value.endswith('\''):
                    fixed_attrs_list.append(f'{key}={value}')
                else: # Reikšmė be kabučių, įdedame į dvigubas kabutes
                    fixed_attrs_list.append(f'{key}="{value}"') 
                
                # Patikriname, ar buvo atlikti pakeitimai
                if value != raw_attrs.get(key) or (value is not None and not (value.startswith('{') and value.endswith('}')) and not (value.startswith('"') and value.endswith('"')) and not (value.startswith('\'') and value.endswith('\''))):
                    changes_made = True

        fixed_tag = f"<Image {' '.join(fixed_attrs_list)} />"
        if fixed_tag != full_tag:
            changes_made = True
            print(f"✅ Pataisyta Image komponento sintaksė {mdx_file.name}:")
            print(f"   Senas: {full_tag}")
            print(f"   Naujas: {fixed_tag}")
        return fixed_tag
    
    body_content_after_image_fix = image_component_pattern.sub(fix_image_component_match, body_content_before_dedup)

    # --- <br> žymių taisymas ---
    # Regex, kad atitiktų <br> be uždaromojo brūkšnio, bet ne <br />
    br_tag_pattern = re.compile(r'<br(?!\s*/\s*>)(?![^>]*/>)>')
    
    def fix_br_tag(match):
        nonlocal changes_made
        original_br = match.group(0)
        fixed_br = '<br />'
        if original_br != fixed_br:
            print(f"ℹ️ Pataisyta <br> žymė {mdx_file.name}: '{original_br}' -> '{fixed_br}'")
            changes_made = True
        return fixed_br

    body_content_after_br_fix = br_tag_pattern.sub(fix_br_tag, body_content_after_image_fix)
    # --- PABAIGA NAUJOS LOGIKOS ---

    # --- Agresyvus JavaScript bloko valymas ---
    # Regex, kad atitiktų funkcijų deklaracijas ar kintamųjų priskyrimus su funkcijomis
    js_block_pattern = re.compile(
        r'^\s*(?:export\s+)?(?:const|let|var|function)\s+\w+\s*\(.*?\)\s*\{.*?^\}\s*$',
        re.DOTALL | re.MULTILINE
    )
    # Regex, kad atitiktų bet kokį bloką, prasidedantį ir pasibaigiantį garbanotais skliausteliais, esantį atskirose eilutėse
    js_curly_block_pattern = re.compile(
        r'^\s*\{.*?^\}\s*$',
        re.DOTALL | re.MULTILINE
    )

    original_body_content_after_br_fix = body_content_after_br_fix
    body_content_after_js_fix = js_block_pattern.sub('', original_body_content_after_br_fix)
    if body_content_after_js_fix != original_body_content_after_br_fix:
        print(f"ℹ️ Pašalintas potencialiai klaidingas JavaScript funkcijų blokas faile {mdx_file.name}.")
        changes_made = True
        original_body_content_after_br_fix = body_content_after_js_fix

    body_content_after_js_fix = js_curly_block_pattern.sub('', original_body_content_after_br_fix)
    if body_content_after_js_fix != original_body_content_after_br_fix:
        print(f"ℹ️ Pašalintas potencialiai klaidingas JavaScript garbanotų skliaustų blokas faile {mdx_file.name}.")
        changes_made = True
    # --- PABAIGA NAUJOS LOGIKOS ---

    # --- Agresyvus bendrų HTML struktūrų valymas ---
    html_structure_patterns = [
        re.compile(r'<html\b[^>]*>.*?</html>', re.DOTALL | re.IGNORECASE),
        re.compile(r'<head\b[^>]*>.*?</head>', re.DOTALL | re.IGNORECASE),
        re.compile(r'<body\b[^>]*>.*?</body>', re.DOTALL | re.IGNORECASE),
        re.compile(r'<header\b[^>]*>.*?</header>', re.DOTALL | re.IGNORECASE),
        re.compile(r'<nav\b[^>]*>.*?</nav>', re.DOTALL | re.IGNORECASE),
        re.compile(r'<footer\b[^>]*>.*?</footer>', re.DOTALL | re.IGNORECASE),
        re.compile(r'<main\b[^>]*>.*?</main>', re.DOTALL | re.IGNORECASE),
        re.compile(r'<!DOCTYPE html>', re.DOTALL | re.IGNORECASE)
    ]

    cleaned_body_content_final = body_content_after_js_fix
    for pattern in html_structure_patterns:
        if pattern.search(cleaned_body_content_final):
            cleaned_body_content_final = pattern.sub('', cleaned_body_content_final)
            print(f"ℹ️ Pašalinta bendra HTML struktūra/žymė faile {mdx_file.name}.")
            changes_made = True
    # --- PABAIGA NAUJOS LOGIKOS ---

    # --- HTML antraščių (h1, h2, ...) konvertavimas į Markdown antraštes ---
    def convert_html_headings_to_markdown(text_content):
        nonlocal changes_made
        # Pakeičiame h1
        text_content, num_h1_replacements = re.subn(r'<h1>(.*?)</h1>', r'# \1', text_content, flags=re.DOTALL | re.IGNORECASE)
        if num_h1_replacements > 0:
            print(f"ℹ️ Konvertuota {num_h1_replacements} <h1> žymių į Markdown antraštes faile {mdx_file.name}.")
            changes_made = True
        # Pakeičiame h2
        text_content, num_h2_replacements = re.subn(r'<h2>(.*?)</h2>', r'## \1', text_content, flags=re.DOTALL | re.IGNORECASE)
        if num_h2_replacements > 0:
            print(f"ℹ️ Konvertuota {num_h2_replacements} <h2> žymių į Markdown antraštes faile {mdx_file.name}.")
            changes_made = True
        # Pakeičiame h3
        text_content, num_h3_replacements = re.subn(r'<h3>(.*?)</h3>', r'### \1', text_content, flags=re.DOTALL | re.IGNORECASE)
        if num_h3_replacements > 0:
            print(f"ℹ️ Konvertuota {num_h3_replacements} <h3> žymių į Markdown antraštes faile {mdx_file.name}.")
            changes_made = True
        # Galima pridėti ir h4, h5, h6, jei reikia
        return text_content

    cleaned_body_content_final = convert_html_headings_to_markdown(cleaned_body_content_final)
    # --- PABAIGA NAUJOS LOGIKOS ---

    # --- Tiesioginių <img> žymių konvertavimas į <Image> komponentus ---
    # Atnaujintas regex, kad būtų lankstesnis su atributų tvarka ir trūkstamais atributais
    img_tag_pattern = re.compile(r'<img\s+([^>]*?)src="([^"]+)"([^>]*?)(?:\s+alt="([^"]*)")?(?:\s+width="(\d+)")?(?:\s+height="(\d+)")?[^>]*?>', re.DOTALL | re.IGNORECASE)

    def convert_img_to_image_component(match):
        nonlocal changes_made, import_lines, seen_imports # Reikia pasiekti import_lines ir seen_imports
        
        # Išskiriame atributus ir reikšmes
        pre_src_attrs = match.group(1)
        img_src = match.group(2)
        post_src_attrs = match.group(3)
        img_alt = match.group(4) if match.group(4) else ""
        img_width = match.group(5)
        img_height = match.group(6)

        # Surinkti visus atributus į vieną eilutę, kad būtų galima juos išanalizuoti
        all_attrs_raw = f"{pre_src_attrs} src=\"{img_src}\"{post_src_attrs}"
        if img_alt:
            all_attrs_raw += f" alt=\"{img_alt}\""
        if img_width:
            all_attrs_raw += f" width=\"{img_width}\""
        if img_height:
            all_attrs_raw += f" height=\"{img_height}\""

        # Naudojame shlex, kad saugiai išanalizuotume atributus
        lexer = shlex.shlex(all_attrs_raw, posix=True)
        lexer.whitespace_split = True
        lexer.quotes = '"\'' 
        
        raw_attrs: Dict[str, Optional[str]] = {}
        try:
            for token in lexer:
                if '=' in token:
                    key, value = token.split('=', 1)
                    raw_attrs[key.strip()] = value.strip()
                else:
                    raw_attrs[token.strip()] = None 
        except ValueError as e:
            print(f"❌ Klaida analizuojant atributus su shlex iš <img> žymės {mdx_file.name}: {match.group(0)}. Klaida: {e}. Praleidžiamas taisymas.")
            return match.group(0) # Grąžiname originalų, jei nepavyko analizuoti

        image_component_attrs = []

        # Alt atributas (privalomas Astro Image)
        # Pataisymas: naudojame replace() metodų grandinę, kad išvengtume atvirkštinių brūkšnių f-string'e
        current_alt = raw_attrs.get('alt', '')
        cleaned_alt_val = current_alt.replace("'", "").replace('"', '').replace('{', '').replace('}', '')
        image_component_attrs.append(f'alt="{cleaned_alt_val}"')

        # Width ir Height atributai
        for attr_key in ['width', 'height']:
            attr_val = raw_attrs.get(attr_key)
            if attr_val:
                # Pašaliname kabutes ir skliaustelius, jei yra, ir įdedame į garbanotus skliaustelius
                cleaned_val = attr_val.strip('\'"{}\'')
                if '_' in cleaned_val: # Pašaliname skaitmenų skyriklius
                    cleaned_val = cleaned_val.replace('_', '')
                try:
                    int_val = int(cleaned_val)
                    image_component_attrs.append(f'{attr_key}={{{int_val}}}')
                except ValueError:
                    image_component_attrs.append(f'{attr_key}="{cleaned_val}"') # Jei ne skaičius, paliekame kaip stringą
            elif PILImage and img_src and not (img_src.startswith('http://') or img_src.startswith('https://')):
                # Bandoma gauti matmenis iš vietinio failo, jei trūksta
                full_disk_path = None
                # Šis import_path čia yra tiesiogiai iš img src
                if img_src.startswith('/'):
                    full_disk_path = PROJECT_ROOT / img_src.lstrip('/')
                elif img_src.startswith('./'):
                    full_disk_path = mdx_file.parent / img_src
                else: # Gali būti tik failo pavadinimas, ieškome assets kataloge
                    image_name_from_path = Path(img_src).name
                    full_disk_path = ASSETS_FULL_PATH / image_name_from_path 
                
                if full_disk_path and full_disk_path.exists():
                    w, h = get_image_dimensions(full_disk_path)
                    if attr_key == 'width' and w is not None:
                        image_component_attrs.append(f'width={{{w}}}')
                        print(f"ℹ️ Pridėtas trūkstamas 'width' atributas į <Image> iš <img> žymės {mdx_file.name} iš vaizdo matmenų.")
                    elif attr_key == 'height' and h is not None:
                        image_component_attrs.append(f'height={{{h}}}')
                        print(f"ℹ️ Pridėtas trūkstamas 'height' atributas į <Image> iš <img> žymės {mdx_file.name} iš vaizdo matmenų.")
        
        # Kiti atributai (pvz., class, loading)
        for key, value in raw_attrs.items():
            if key not in ['src', 'alt', 'width', 'height']:
                if value is None:
                    image_component_attrs.append(key)
                else:
                    image_component_attrs.append(f'{key}={value}')


        # Patikriname, ar src yra išorinis URL arba vietinis kelias
        if img_src.startswith('http://') or img_src.startswith('https://'):
            # Išorinis URL, naudojame jį tiesiogiai src
            new_image_component = f"<Image src='{img_src}' {' '.join(image_component_attrs)} />"
            print(f"ℹ️ Konvertuota <img> žymė su išoriniu URL į <Image> komponentą faile {mdx_file.name}.")
            changes_made = True
            return new_image_component
        else:
            # Vietinis kelias, bandome importuoti
            var_name_raw = Path(img_src).stem
            # Sukuriame saugų kintamojo pavadinimą
            var_name = re.sub(r'[^a-zA-Z0-9_]', '', var_name_raw)
            # Pridedame hash, kad būtų unikalus ir išvengtume kolizijų
            img_hash = hashlib.sha256(img_src.encode('utf-8')).hexdigest()[:8]
            final_var_name = f"img_{var_name}_{img_hash}"

            import_statement = f"import {final_var_name} from '{img_src}';"
            if import_statement.strip() not in seen_imports:
                import_lines.append(import_statement)
                seen_imports.add(import_statement.strip())
                print(f"ℹ️ Pridėtas naujas importas: '{import_statement}' faile {mdx_file.name}.")
                changes_made = True

            new_image_component = f"<Image src={{{final_var_name}}} {' '.join(image_component_attrs)} />"
            print(f"ℹ️ Konvertuota <img> žymė į <Image> komponentą faile {mdx_file.name}.")
            changes_made = True
            return new_image_component

    cleaned_body_content_final = img_tag_pattern.sub(convert_img_to_image_component, cleaned_body_content_final)
    # --- PABAIGA NAUJOS LOGIKOS ---


    # Dabar atliekame eilutės lygio dublikatų šalinimą po visų taisymų
    body_lines_after_all_fixes = cleaned_body_content_final.splitlines()
    unique_body_lines = []
    seen_body_lines = set()

    for line in body_lines_after_all_fixes:
        stripped_line = line.strip()
        if stripped_line not in seen_body_lines:
            unique_body_lines.append(line)
            seen_body_lines.add(stripped_line)
        else:
            print(f"ℹ️ Pašalinta dubliuojanti pagrindinio turinio eilutė: '{stripped_line}' faile {mdx_file.name}.")
            changes_made = True
    
    cleaned_body = "\n".join(unique_body_lines).strip()

    # --- Pašaliname kelias iš eilės einančias tuščias eilutes ---
    # Leidžiame ne daugiau kaip dvi tuščias eilutes (\n\n)
    cleaned_body = re.sub(r'\n{3,}', '\n\n', cleaned_body)
    if re.search(r'\n{3,}', cleaned_body):
        print(f"ℹ️ Pašalintos perteklinės tuščios eilutės faile {mdx_file.name}.")
        changes_made = True
    # --- PABAIGA NAUJOS LOGIKOS ---

    # 4. Tikrinam import keliai
    current_imports_text = '\n'.join(import_lines)
    # Atnaujintas regex, kad atitiktų importus su ar be kabučių
    import_lines_for_validation = re.findall(r'import\s+(?:\{[^}]+\}|\w+)\s+from\s+[\'"](.+?)[\'"];?', current_imports_text)
    
    for import_path in import_lines_for_validation:
        is_local_asset_import = False
        full_path_on_disk = None

        # Tikriname, ar tai nėra išorinis URL
        if import_path.startswith('http://') or import_path.startswith('https://'):
            continue # Praleidžiame išorinius URL, nes jų egzistavimo diske netikriname

        # Bandoma išspręsti vietinius kelius
        if import_path.startswith("../assets/images") or import_path.startswith("/src/assets/images"):
            full_path_on_disk = PROJECT_ROOT / import_path.lstrip('/')
            is_local_asset_import = True
        elif import_path.startswith("./"):
            full_path_on_disk = mdx_file.parent / import_path
            is_local_asset_import = True
        else:
            # Jei kelias neprasideda ./ ar ../ ar /, bandoma ieškoti assets kataloge pagal failo pavadinimą
            image_name_from_path = Path(import_path).name
            potential_full_path = ASSETS_FULL_PATH / image_name_from_path
            if potential_full_path.exists():
                full_path_on_disk = potential_full_path
                is_local_asset_import = True

        if is_local_asset_import and full_path_on_disk and not full_path_on_disk.exists():
            file_errors.append(f"{mdx_file.name}: ❌ Vaizdo failas nerastas diske: `{import_path}`.")

    # 5. Atkuriame failo turinį
    final_content_parts = []
    if frontmatter:
        final_content_parts.append(frontmatter)
    
    if import_lines:
        final_content_parts.append('\n'.join(import_lines))
    
    if cleaned_body:
        final_content_parts.append(cleaned_body)

    new_content = "\n\n".join(final_content_parts).strip() + "\n"

    if new_content != original_content:
        mdx_file.write_text(new_content, encoding='utf-8')
        print(f"✅ Sėkmingai pataisyta ir išsaugota {mdx_file.name}.")
        changes_made = True
    else:
        print(f"✅ Nereikia jokių pakeitimų {mdx_file.name}.")
    
    if file_errors:
        print(f"\n--- Klaidos faile {mdx_file.name}: ---")
        for error in file_errors:
            print(error)
        print("----------------------------------")
        return True # Grąžiname True, jei buvo klaidų, net jei failas nebuvo pakeistas
    
    return changes_made

# === Masinė validacija ir taisymas ===
def batch_validate_and_fix(directory: str):
    """
    Vykdo masinę MDX failų validaciją ir taisymą nurodytame kataloge.
    """
    target_dir = Path(directory)
    if not target_dir.is_dir():
        print(f"❌ Neteisingas katalogas: {directory}")
        return

    print(f"\n--- Pradedama MDX validacija ir taisymas kataloge {directory} ---")
    fixed_count = 0
    for file in target_dir.rglob('*.mdx'):
        if repair_mdx_file(str(file)):
            fixed_count += 1
    print(f"\n--- MDX validacija ir taisymas baigta. Pataisytų/patikrintų failų: {fixed_count}. ---")

# === Vykdymas ===
if __name__ == '__main__':
    # Nustatykite savo turinio katalogą (pvz., 'src/content')
    batch_validate_and_fix('src/content')
