import { EventEmitter } from "events";

export class MockAstraDb {
  events = new EventEmitter();
  private db = new Map<string, string[]>();

  async getAllKeys(): Promise<string[]> {
    return [...this.db.keys()];
  }

  async get(key: string): Promise<string[]> {
    return this.db.get(key) || [];
  }

  async add(key: string, value: string): Promise<void> {
    const existing = this.db.get(key) || [];
    existing.push(value);
    this.db.set(key, existing);

    // Simulate real-time event
    this.events.emit(`chatspace::${key}`, value);
  }

  getLoginPublicKey(): string {
    return "mock-public-key";
  }
}
