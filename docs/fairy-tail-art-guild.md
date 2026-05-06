# Fairy Tail Art Guild

Documento funcional alinhado com o estado atual da aplicacao.

## Visao geral

Aplicativo mobile em React Native com Expo para gerenciar sorteios, collabs, colaboradores, awards, banimento e backup local.

## Navegacao atual

Abas principais:

1. `Sorteador`
2. `Ranking`
3. `Awards`
4. `Banimento`

Acoes globais no topo da tela:

- `Exportar`
- `Importar`
- `Exibir ranks` ou `Esconder ranks`

## Persistencia

- `AsyncStorage` para salvar `lotteryState` e `guildData`
- backup completo em JSON
- importacao de backup via area de transferencia
- exportacao de backup via compartilhamento nativo

## Estrutura do backup

```ts
type BackupPayload = {
  exportedAt: string
  lotteryState?: LotteryState | null
  guildData?: Partial<GuildData> | null
}
```

## Aba Sorteador

### Objetivo

- criar grupos aleatorios
- impedir repeticao antes de finalizar a lista atual
- copiar e compartilhar resultados

### Estado salvo

```ts
type LotteryState = {
  inputText: string
  participants: string[]
  remainingParticipants: string[]
  groups: DrawGroup[]
  mode: number
  isComplete: boolean
  statusMessage: string
}
```

### Regras atuais

- um participante por linha
- remove linhas vazias
- remove espacos extras
- remove nomes duplicados ignorando maiusculas e minusculas
- mantem historico de grupos enquanto os nomes ainda existirem na lista
- permite continuar sorteando ate acabar os participantes restantes

### Acoes disponiveis

- editar lista de participantes
- trocar modo de sorteio
- sortear proximo grupo
- reiniciar sorteio
- copiar resultado
- compartilhar resultado

## Aba Ranking

### Objetivo

- gerenciar collabs
- gerenciar colaboradores
- marcar participacao por collab
- calcular rank automaticamente

### Entidades

```ts
type Colab = {
  id: string
  name: string
  active: boolean
  startDate: string
  endDate: string
  createdAt: string
}

type Collaborator = {
  id: string
  name: string
  active: boolean
  entryDate: string
  inactiveDate?: string
  createdAt: string
}

type Participation = {
  id: string
  collaboratorId: string
  colabId: string
  participated: boolean
  createdAt: string
}
```

### Regras de ranking atuais

- `E`: 0 collabs
- `D`: 1 collab
- `C`: 2 a 3 collabs
- `B`: 4 a 6 collabs
- `A`: 7 a 9 collabs
- `S`: 10 ou mais collabs

### Funcionalidades atuais

- criar, editar e excluir collabs
- ativar e desativar collabs
- criar, editar e excluir colaboradores
- ativar, inativar e reativar colaboradores
- marcar participacao individual por collab
- visualizar tabela agrupada por rank

## Aba Awards

### Objetivo

- cadastrar awards
- vincular awards a colaboradores
- registrar motivos por award

### Entidades

```ts
type Award = {
  id: string
  name: string
  description: string
  createdAt: string
}

type AwardCollaborator = {
  id: string
  awardId: string
  collaboratorId: string
  notes: string[]
}
```

### Funcionalidades atuais

- criar, editar e excluir awards
- expandir e recolher awards
- selecionar colaborador por award
- salvar multiplos motivos
- editar e remover vinculos de award

## Aba Banimento

### Objetivo

- controlar inatividade
- registrar motivo opcional
- permitir reativacao

### Entidade

```ts
type InactiveCollaborator = {
  id: string
  collaboratorId: string
  inactiveDate: string
  reason?: string
}
```

### Funcionalidades atuais

- selecionar colaborador ativo para inativar
- salvar data de saida automaticamente
- salvar motivo opcional
- buscar colaborador inativo
- reativar colaborador

## Estrutura visual atual

- fundo ilustrado com atmosfera magica
- cards transluidos com blur
- banner superior contextual por aba
- barra inferior customizada
- feedback visual com badges e cores por contexto

## Observacoes tecnicas

- projeto baseado em `Expo SDK 55`
- persistencia local offline
- importacao de backup via `expo-clipboard`
- compartilhamento nativo para exportacao de backup e resultados
