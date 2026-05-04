# Sorteador da Fairy Tail

Aplicativo mobile em React Native com Expo e TypeScript para montar duplas, trios e quartetos sem repetir participantes, com persistencia offline via AsyncStorage.

## Estrutura

```text
assets/
components/
hooks/
screens/
storage/
utils/
App.tsx
app.json
eas.json
```

## Rodar localmente

1. Instale as dependencias:

```bash
npm install
```

2. Inicie o projeto:

```bash
npx expo start
```

## Build Android APK

1. Instale a CLI do EAS:

```bash
npm install -g eas-cli
```

2. Faça login:

```bash
eas login
```

3. Gere o build Android:

```bash
eas build -p android --profile preview-apk
```

4. Para Google Play Store, gere o bundle de producao:

```bash
eas build -p android --profile production
```

## Pacotes principais

- `expo-linear-gradient`
- `expo-blur`
- `react-native-reanimated`
- `react-native-gesture-handler`
- `@react-native-async-storage/async-storage`
- `expo-clipboard`
- `expo-haptics`
