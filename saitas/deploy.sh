#!/bin/bash

# Gauti skripto ir viršesnį katalogą
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
PARENT_DIR=$(dirname "$SCRIPT_DIR")

echo "Pradedamas automatinis diegimas..."
echo "Skripto katalogas: $SCRIPT_DIR"
echo "Viršesnis katalogas: $PARENT_DIR"

echo "Valomi failai ir katalogai viršesniame kataloge, išskyrus:"
echo " - Skripto katalogą ($SCRIPT_DIR)"
echo " - analytics katalogą ($PARENT_DIR/analytics)"
echo " - api katalogą ($PARENT_DIR/api)"

# Triname viską viršesniame kataloge, išskyrus nurodytas išimtis
find "$PARENT_DIR" -mindepth 1 -maxdepth 1 \
    ! -path "$SCRIPT_DIR" \
    ! -path "$PARENT_DIR/analytics" \
    ! -path "$PARENT_DIR/api" \
    -exec rm -rf {} +

if [ $? -eq 0 ]; then
    echo "Sena versija išvalyta."
else
    echo "Klaida valant seną versiją."
    exit 1
fi

echo "Kopijuojami failai iš dist/ į viršesnį katalogą..."

# Kopijuojame dist/ turinį
cp -R "$SCRIPT_DIR/dist/"* "$PARENT_DIR/"

if [ $? -eq 0 ]; then
    echo "Nauja versija įkelta sėkmingai."
    echo "✅ Diegimas baigtas!"
else
    echo "❌ Klaida kopijuojant naują versiją."
    exit 1
fi