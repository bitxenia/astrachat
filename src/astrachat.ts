import { AstraDb } from "@bitxenia/astradb";
import { Chat, ChatMessageCallback } from "./chat";
import { Astrachat, ChatMessage } from "./index";
import { createMessage } from "./message";
import { logger } from "./utils/logger";

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
      logger.debug("No alias found, setting public key as alias");
      this.alias = this.astraDb.getLoginPublicKey();
    }
    this.alias = alias;
  }

  public async createChat(
    chatName: string,
    callback?: (message: ChatMessage) => void,
  ): Promise<void> {
    logger.debug(`[${this.alias}] Creating chat...`);
    const chat = await Chat.create(
      this.chatSpace,
      chatName,
      this.astraDb,
      callback,
    );
    this.chats.set(chatName, chat);
    logger.debug(`[${this.alias}] Chat "${chatName}" created`);
  }

  public async getMessages(
    chatName: string,
    onNewMessage?: ChatMessageCallback,
  ): Promise<ChatMessage[]> {
    logger.info(`[${this.alias}] Getting messages from ${chatName}...`);
    const chat = await this.getChat(chatName);
    logger.debug(`[${this.alias}] Chat found, getting messages...`);
    return chat.getMessages(onNewMessage);
  }

  public async sendMessage(
    chatName: string,
    text: string,
    parentId?: string,
  ): Promise<void> {
    logger.debug(`[${this.alias}] Sending message for ${chatName}...`);
    const chat = await this.getChat(chatName);
    const message = createMessage(this.getUserId(), this.alias, text, parentId);
    logger.debug(`[${this.alias}] Sending message with ID ${message.id}`);
    await chat.sendMessage(message);
    logger.info(`[${this.alias}] Message with ID ${chatName} sent`);
  }

  public async getChatList(): Promise<string[]> {
    logger.info(`[${this.alias}] Getting chat list for ${this.chatSpace}`);
    return await this.astraDb.getAllKeys();
  }

  public getUserId(): string {
    logger.debug(`[${this.alias}] Getting user id...`);
    return this.astraDb.getLoginPublicKey();
  }

  public async getLoginKey(): Promise<string> {
    logger.debug(`[${this.alias}] Getting logging key...`);
    return await this.astraDb.getLoginPrivateKey();
  }

  public getAlias(): string {
    return this.alias;
  }

  public setChatAlias(alias: string): void {
    this.alias = alias;
    logger.info(`[${this.alias}] New alias set: ${alias}`);
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
