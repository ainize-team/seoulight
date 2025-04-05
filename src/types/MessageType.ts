export type BotMessageType = {
  id: string;
  sender: MessageType.BOT;
  contents: { content: string };
  photoCards?: PhotoCard[];
  embedContents?: string[];
  suggestedQuestions?: SuggestedQuestion[];
  isComplete: boolean;
};

export type UserMessageType = {
  id?: string;
  sender: MessageType.USER;
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

export type Message = UserMessageType | BotMessageType;

export enum MessageType {
  BOT = "BOT",
  USER = "USER"
}
