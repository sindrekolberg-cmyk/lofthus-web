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

NODE_VERSION=$(node -p "process.versions.node")
NODE_MAJOR=$(node -p "Number(process.versions.node.split('.')[0])")
NODE_MINOR=$(node -p "Number(process.versions.node.split('.')[1])")
if [ "$NODE_MAJOR" -lt 22 ] || { [ "$NODE_MAJOR" -eq 22 ] && [ "$NODE_MINOR" -lt 13 ]; }; then
  echo "Expo SDK 57 krever Node 22.13 eller nyere. Du har v$NODE_VERSION."
  exit 1
fi

echo "Synkroniserer app-avhengigheter ..."
if ! npm install --no-audit --no-fund; then
  echo ""
  echo "Første installasjon ble hengende igjen. Rydder den lokale mobilinstallasjonen og prøver én gang til ..."
  rm -rf node_modules package-lock.json
  npm install --no-audit --no-fund
fi

echo ""
echo "Starter Lofthus."
echo "Expo Go på iPhone må være logget inn på samme Expo-konto som Expo CLI."
echo "Hvis Expo ber om innlogging i Terminal, følg innloggingslenken og kjør START.command igjen."
echo "Mac og iPhone bør være på samme Wi-Fi."
echo ""
npx expo start --lan --clear
