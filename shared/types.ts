export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface User {
  id: string;
  name: string;
}
export type ReactionType = 'THUMBS_UP' | 'THUMBS_DOWN' | 'CONFUSED' | 'EYES' | 'CELEBRATE';
export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}
export interface Pin {
  id: string;
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  prompt?: string;
  reactions: Record<ReactionType, number>;
  comments: Comment[];
  createdAt: number;
}
export interface DocumentSession {
  id: string;
  title: string;
  documentUrl: string;
  creatorId: string;
  pins: Pin[];
  createdAt: number;
  codename?: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number;
}