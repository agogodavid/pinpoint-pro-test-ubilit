import { IndexedEntity } from "./core-utils";
import type { User, DocumentSession, Pin, Comment, ReactionType } from "@shared/types";
import { MOCK_USERS } from "@shared/mock-data";
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "" };
  static seedData = MOCK_USERS;
}
export class DocumentSessionEntity extends IndexedEntity<DocumentSession> {
  static readonly entityName = "doc_session";
  static readonly indexName = "doc_sessions";
  static readonly initialState: DocumentSession = {
    id: "",
    title: "",
    documentUrl: "",
    creatorId: "",
    pins: [],
    createdAt: 0
  };
  async addPin(pin: Pin): Promise<void> {
    await this.mutate(s => ({
      ...s,
      pins: [...s.pins, pin]
    }));
  }
  async addFeedback(pinId: string, feedback: { comment?: Comment; reaction?: ReactionType }): Promise<void> {
    await this.mutate(s => {
      const pins = s.pins.map(p => {
        if (p.id !== pinId) return p;
        const newPin = { ...p };
        if (feedback.comment) {
          newPin.comments = [...newPin.comments, feedback.comment];
        }
        if (feedback.reaction) {
          newPin.reactions = {
            ...newPin.reactions,
            [feedback.reaction]: (newPin.reactions[feedback.reaction] || 0) + 1
          };
        }
        return newPin;
      });
      return { ...s, pins };
    });
  }
}