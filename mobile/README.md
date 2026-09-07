# Lofthus Road Open – iPhone

Dette er den første ekte mobilversjonen av Lofthus. Den er bygget med React Native + Expo og bruker samme offentlige Lofthus-API som nettsiden.

## Første gang

1. Installer **Expo Go** på iPhone fra App Store.
2. Logg inn i Expo Go med en gratis Expo-konto. Expo Go krever innlogging for å kjøre prosjekter.
3. På Mac: åpne `mobile`-mappen og dobbeltklikk `START.command`.
4. Første oppstart installerer avhengighetene automatisk.
5. Skann QR-koden som dukker opp med Expo Go.

Mac og iPhone bør være på samme Wi‑Fi.

## Hva som virker i v0.1

- Native forside med rundestatus, kamper, topp fem, måned og snakkiser.
- Liga med live-tabell.
- Klikk fra liga til managerprofil.
- Hall of Fame.
- Analyseverktøy som mobil hub.
- Pull-to-refresh på live-sider.
- Samme Render-backend som webproduktet.

## API

Standard:

`https://lofthus-road-open-api.onrender.com`

Kan overstyres med:

`EXPO_PUBLIC_API_BASE_URL=...`

## Viktig

Dette er gratis testing gjennom Expo Go. Vi trenger ikke Apple Developer-abonnement før vi skal distribuere en selvstendig build via App Store/TestFlight eller bruke Apple-funksjoner som krever betalt medlemskap.
