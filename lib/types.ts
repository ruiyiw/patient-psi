import { Message } from 'ai'
import type { DefaultSession } from '@/node_modules/.pnpm/@auth+core@0.18.4/node_modules/@auth/core/types';

export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: Message[]
  sharePath?: string
}

export interface CCDResult extends Record<string, any> {
  userId: string;
  chatId: string;
  createdAt: Date;
  checkedHelpless: {
    id: string;
    label: string;
  }[];
  checkedUnlovable: {
    id: string;
    label: string;
  }[];
  checkedWorthless: {
    id: string;
    label: string;
  }[];
  intermediateBelief: string;
  intermediateBeliefDepression: string;
  copingStrategies: string;
  situation: string;
  autoThought: string;
  checkedEmotion: {
    id: string;
    label: string;
  }[];
  behavior: string;
}

export interface CCDTruth extends Record<string, any> {
  userId: string;
  chatId: string;
  createdAt: Date;
  relatedHistory: string;
  Helpless: [string];
  Unlovable: [string];
  Worthless: [string];
  intermediateBelief: string;
  intermediateBeliefDepression: string;
  copingStrategies: string;
  situation: string;
  autoThought: string;
  Emotion: [string];
  behavior: string;
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
    error: string
  }
>

export interface Session {
  user: {
    id: string
    // email: string
  }
}

export interface AuthResult {
  type: string
  message: string
}

export interface User extends Record<string, any> {
  id: string
  // email: string
  // password: string
  // userId: string
  // salt: string
}
