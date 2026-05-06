# Fairy Tail Art Guild

App feito para minha amada esposa, desenvolvido em React Native, Expo e TypeScript para gerenciar uma guilda mágica em formato de app, com sistema de sorteio de grupos, rankings, premiações, banimentos e backup local em JSON. O projeto possui uma interface inspirada em fantasia, utilizando cards translúcidos, brilho neon e persistência offline com AsyncStorage, facilitando campeonatos e disputas da guilda de forma prática e organizada.

## Visao geral

O app hoje concentra quatro areas principais:

- `Sorteador`: cria grupos sem repetir participantes ate fechar o ciclo atual
- `Ranking`: gerencia collabs, colaboradores e participacoes com rank automatico
- `Awards`: cadastra awards e registra motivos por colaborador
- `Banimento`: controla inatividade, historico, busca e reativacao

No topo da tela existem tres acoes globais:

- `Exportar`: compartilha o backup completo em JSON
- `Importar`: restaura um backup a partir da area de transferencia
- `Exibir ranks`: abre ou fecha a tabela visual de ranks

## Estilo da app

A interface atual segue uma direcao visual bem definida:

- wallpaper ilustrado com sobreposicao escura
- cards com efeito glassmorphism via `expo-blur`
- paleta com violeta, rosa neon, azul e dourado
- banner superior contextual por aba
- barra inferior customizada com icones simbolicos

Referencias centrais dessa identidade:

- [utils/theme.ts](/Users/pc59/Projects/nikolayevsk/fairy-tail-art-guild/utils/theme.ts:1)
- [components/MagicalBackground.tsx](/Users/pc59/Projects/nikolayevsk/fairy-tail-art-guild/components/MagicalBackground.tsx:1)
- [components/GlassCard.tsx](/Users/pc59/Projects/nikolayevsk/fairy-tail-art-guild/components/GlassCard.tsx:1)
- [components/HeaderBanner.tsx](/Users/pc59/Projects/nikolayevsk/fairy-tail-art-guild/components/HeaderBanner.tsx:1)

## Funcionalidades atuais

### Sorteador

- um participante por linha
- remove linhas vazias, espacos extras e duplicados ignorando maiusculas/minusculas
- sorteia grupos conforme o modo selecionado
- evita repeticao ate acabar a lista restante
- permite copiar e compartilhar o resultado textual
- salva o estado do sorteio localmente

### Ranking

- CRUD de `colabs`
- CRUD de `collaborators`
- ativacao e desativacao de collabs
- controle de participacao por colaborador em cada collab
- rank calculado automaticamente por numero de participacoes
- tabela visual agrupada por rank e ordenada por participacao

### Awards

- CRUD de awards
- vinculo entre award e colaborador
- multiplos motivos por vinculo, um por linha
- edicao e remocao de vinculos existentes

### Banimento

- desativacao de colaboradores ativos
- registro de motivo opcional
- historico de inatividade
- busca por nome
- reativacao de colaboradores

### Backup

- exporta `lotteryState` e `guildData` em JSON
- importa backup pela area de transferencia
- aceita restauracao parcial de `lotteryState` e/ou `guildData`

Formato:

```json
{
  "exportedAt": "2026-05-05T00:00:00.000Z",
  "lotteryState": {},
  "guildData": {}
}
```

## Regras de ranking

- `E`: 0 collabs
- `D`: 1 collab
- `C`: 2 a 3 collabs
- `B`: 4 a 6 collabs
- `A`: 7 a 9 collabs
- `S`: 10 ou mais collabs

Implementacao em [utils/ranking.ts](/Users/pc59/Projects/nikolayevsk/fairy-tail-art-guild/utils/ranking.ts:1).

## Estrutura

```text
assets/
components/
hooks/
screens/
storage/
tests/
utils/
App.tsx
app.json
eas.json
package.json
```

Arquivos mais importantes:

- [screens/HomeScreen.tsx](/Users/pc59/Projects/nikolayevsk/fairy-tail-art-guild/screens/HomeScreen.tsx:1): tela principal e navegacao por abas
- [hooks/useFairyTailDraw.ts](/Users/pc59/Projects/nikolayevsk/fairy-tail-art-guild/hooks/useFairyTailDraw.ts:1): regras do sorteador
- [hooks/useGuildData.ts](/Users/pc59/Projects/nikolayevsk/fairy-tail-art-guild/hooks/useGuildData.ts:1): estado da guilda, awards, ranking, backup e banimento
- [storage/lotteryStorage.ts](/Users/pc59/Projects/nikolayevsk/fairy-tail-art-guild/storage/lotteryStorage.ts:1): persistencia local
- [utils/types.ts](/Users/pc59/Projects/nikolayevsk/fairy-tail-art-guild/utils/types.ts:1): contratos centrais

## Rodar localmente

Instalacao:

```bash
npm install
```

Desenvolvimento:

```bash
npx expo start
```

Scripts disponiveis:

```bash
npm run start
npm run start:clear
npm run start:tunnel
npm run start:lan
npm run android
npm run ios
npm run web
npm run lint
npm run doctor
npm test
```

## Testes

A suite atual cobre:

- regras do sorteador
- geracao, serializacao e validacao de backup
- calculo e ordenacao de ranking

Execucao:

```bash
npm test
```

Status verificado neste workspace: `11` testes passando.

## Rodar no celular

Se o app ficar preso no loading do Expo Go:

1. Limpe o cache:

```bash
npm run start:clear
```

2. Se continuar falhando, use tunel:

```bash
npm run start:tunnel
```

3. Confira estes pontos:

- celular e computador na mesma rede ao usar `start` ou `start:lan`
- `Expo Go` atualizado
- nenhuma VPN ativa no celular ou no computador
- firewall nao bloqueando Node ou Expo

4. Se houver suspeita de incompatibilidade:

```bash
npm run doctor
```

Observacao: o projeto usa `Expo SDK 55`.

## Build Android

Instale a CLI do EAS:

```bash
npm install -g eas-cli
```

Login:

```bash
eas login
```

Se precisar religar ou criar o projeto EAS:

```bash
eas project:init --force
```

Build APK:

```bash
eas build -p android --profile preview-apk
```

Build de producao:

```bash
eas build -p android --profile production
```

## Dependencias principais

- `expo`
- `react`
- `react-native`
- `@react-native-async-storage/async-storage`
- `expo-blur`
- `expo-clipboard`
- `expo-haptics`
- `expo-linear-gradient`
- `react-native-gesture-handler`
- `react-native-safe-area-context`
