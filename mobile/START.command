#!/bin/bash
set -e
cd "$(dirname "$0")"

echo ""
echo "LOFTHUS ROAD OPEN — iPHONE"
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js mangler. Installer Node 22.13 eller nyere og prøv igjen."
  exit 1
fi

NODE_MAJOR=$(node -p "Number(process.versions.node.split('.')[0])")
if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "Expo SDK 57 krever Node 22.13 eller nyere. Du har $(node -v)."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Første oppstart: installerer appen ..."
  npm install
  npx expo install --fix
fi

echo ""
echo "Starter Lofthus. Åpne Expo Go på iPhone og skann QR-koden."
echo "Mac og iPhone bør være på samme Wi-Fi."
echo ""
npx expo start --lan
