import { AstraDb } from "@bitxenia/astradb";
import { Chat, ChatMessageCallback } from "./chat";
import { Astrachat, ChatMessage } from "./index";
import { createMessage } from "./message";

export class AstrachatNode implements Astrachat {
  chatSpace: string;
  alias: string;
  astraDb: AstraDb;
  chats: Map<string, Chat>;

  constructor(chatSpace: string, alias: string, astraDb: AstraDb) {
    this.chatSpace = chatSpace;
    this.astraDb = astraDb;
    this.chats = new Map();

    if (!alias) {
      this.alias = this.astraDb.getLoginPublicKey();
    }
    this.alias = alias;
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

  public async sendMessage(
    chatName: string,
    text: string,
    parentId?: string,
  ): Promise<void> {
    const chat = await this.getChat(chatName);
    const message = createMessage(this.getUserId(), this.alias, text, parentId);
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

  public getAlias(): string {
    return this.alias;
  }

  public setChatAlias(alias: string): void {
    this.alias = alias;
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
