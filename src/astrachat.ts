import { AstraDb } from "@bitxenia/astradb";
import { Chat, ChatMessageCallback } from "./chat.js";
import { Astrachat, ChatMessage } from "./index.js";

export class AstrachatNode implements Astrachat {
  chatSpace: string;
  astraDb: AstraDb;
  chats: Map<string, Chat>;

  constructor(chatSpace: string, astraDb: AstraDb) {
    this.chatSpace = chatSpace;
    this.astraDb = astraDb;
    this.chats = new Map();
  }

  public async createChat(
    chatName: string,
    callback?: (message: ChatMessage) => void,
  ): Promise<void> {
    const chat = await Chat.create(
      this.chatSpace,
      chatName,
      this.astraDb,
      callback,
    );
    this.chats.set(chatName, chat);
  }

  public async getMessages(
    chatName: string,
    onNewMessage?: ChatMessageCallback,
  ): Promise<ChatMessage[]> {
    const chat = await this.getChat(chatName);
    return chat.getMessages(onNewMessage);
  }

  public async sendMessage(chatName: string, text: string, alias: string) {
    const chat = await this.getChat(chatName);
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      sender: this.getUserId(),
      senderAlias: alias,
      message: text,
      timestamp: Date.now(),
    };
    await chat.sendMessage(message);
  }

  public async getChatList(): Promise<string[]> {
    return await this.astraDb.getAllKeys();
  }

  public getUserId(): string {
    return this.astraDb.getLoginPublicKey();
  }

  public async getLoginKey(): Promise<string> {
    return await this.astraDb.getLoginPrivateKey();
  }

  private async getChat(chatName: string): Promise<Chat> {
    let chat = this.chats.get(chatName);
    if (!chat) {
      chat = await Chat.create(this.chatSpace, chatName, this.astraDb);
      this.chats.set(chatName, chat);
    }
    return chat;
  }
}
