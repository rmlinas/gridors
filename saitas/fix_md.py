import os
import re

def fix_markdown_slugs(base_path):
    """
    Koreguoja Markdown failus, pašalindamas 'slug:' eilutes iš frontmatter'io,
    išskyrus 'index.md' failus.
    """
    guides_path = os.path.join(base_path, 'src', 'content', 'guides')

    if not os.path.exists(guides_path):
        print(f"Katalogas '{guides_path}' nerastas. Patikrinkite kelią.")
        return

    print(f"Pradedamas failų taisymas kataloge: {guides_path}")
    
    # Reguliarusis reiškinys 'slug:' eilutėms frontmatter'yje
    # 're.IGNORECASE' - ignoruoti didžiąsias/mažąsias raides
    # 're.MULTILINE' - ^ ir $ atitinka eilutės pradžią/pabaigą
    slug_pattern = re.compile(r'^\s*slug\s*:\s*.*$', re.IGNORECASE | re.MULTILINE)

    for root, _, files in os.walk(guides_path):
        for file_name in files:
            if file_name.endswith('.md') and file_name != 'index.md':
                file_path = os.path.join(root, file_name)
                print(f"Apdorojamas failas: {file_path}")

                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # Rasti frontmatterio ribas
                    frontmatter_match = re.match(r'^(---.*?---)', content, re.DOTALL)
                    
                    if frontmatter_match:
                        frontmatter = frontmatter_match.group(1)
                        body = content[len(frontmatter):]
                        
                        # Pašalinti 'slug:' eilutes iš frontmatterio
                        new_frontmatter = slug_pattern.sub('', frontmatter).strip()
                        
                        # Pašalinti tuščias eilutes po ištrynimo
                        new_frontmatter = re.sub(r'^\s*$\n', '', new_frontmatter, flags=re.MULTILINE)
                        
                        # Atkurti frontmatter'io ribas, jei jos nebuvo pažeistos
                        if not new_frontmatter.startswith('---'):
                            new_frontmatter = '---\n' + new_frontmatter
                        if not new_frontmatter.endswith('---'):
                             new_frontmatter += '\n---'

                        new_content = new_frontmatter + body

                        # Įrašyti pakeistą turinį atgal į failą
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"  PAKEISTA: 'slug:' eilutės pašalintos.")
                    else:
                        print(f"  Praleista: nerastas frontmatterio blokas.")

                except Exception as e:
                    print(f"  KLAIDA apdorojant {file_path}: {e}")

    print("Visų failų taisymas baigtas.")

if __name__ == "__main__":
    # Nustatykite savo projekto pagrindinį kelią. 
    # Jei skriptą paleidžiate iš 'saitas/' katalogo, šis kelias bus '.'
    # Jei paleidžiate iš kitur, jį reikės pakoreguoti.
    project_base_path = os.getcwd() 
    # Arba nurodykite absoliutų kelią, pvz.:
    # project_base_path = '/home/1477213.cloudwaysapps.com/fafwdmnuwg/public_html/saitas'

    fix_markdown_slugs(project_base_path)
