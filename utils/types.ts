export type DrawMode = number;

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
