export type BotMessageType = {
  id: string;
  sender: string;
  contents: { content: string };
  photoCards?: PhotoCard[];
  embedContents?: string[];
  suggestedQuestions?: SuggestedQuestion[];
  isComplete: boolean;
};

export type UserMessageType = {
  id?: string;
  sender: string;
  message: string;
};

interface PhotoCard {
  category: string;
  title: string;
  image: string;
  user_message: string;
}

export interface SuggestedQuestion {
  _id: string;
  content: string;
  user_message: string;
  intent: string;
  agent: string;
  category: string;
  created_at: Date;
  updated_at: Date;
}

export type MessageType = UserMessageType | BotMessageType;

export enum Sender {
  BOT = "BOT",
  USER = "USER"
}
