export type DrawMode = number;

export type GuildTab = 'sorteador' | 'ranking' | 'awards' | 'banimento';

export type RankTier = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export type DrawGroup = {
  id: string;
  index: number;
  members: string[];
  createdAt: string;
};

export type LotteryState = {
  inputText: string;
  participants: string[];
  remainingParticipants: string[];
  groups: DrawGroup[];
  mode: DrawMode;
  isComplete: boolean;
  statusMessage: string;
};

export type Colab = {
  id: string;
  name: string;
  active: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
};

export type Collaborator = {
  id: string;
  name: string;
  active: boolean;
  entryDate: string;
  inactiveDate?: string;
  createdAt: string;
};

export type Participation = {
  id: string;
  collaboratorId: string;
  colabId: string;
  participated: boolean;
  createdAt: string;
};

export type Award = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
};

export type AwardCollaborator = {
  id: string;
  awardId: string;
  collaboratorId: string;
  notes: string[];
};

export type InactiveCollaborator = {
  id: string;
  collaboratorId: string;
  inactiveDate: string;
  reason?: string;
};

export type GuildData = {
  colabs: Colab[];
  collaborators: Collaborator[];
  participations: Participation[];
  awards: Award[];
  awardCollaborators: AwardCollaborator[];
  inactiveCollaborators: InactiveCollaborator[];
};

export type BackupPayload = {
  exportedAt: string;
  lotteryState?: LotteryState | null;
  guildData?: Partial<GuildData> | null;
};
