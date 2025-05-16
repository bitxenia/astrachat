import { AstraDb } from "@bitxenia/astradb";
import { Chat, ChatMessageCallback } from "./chat";
import { Astrachat, AstrachatInit, ChatMessage } from "./index";
import { createMessage } from "./message";
import { logger } from "./utils/logger";
import { createAstraDb } from "@bitxenia/astradb";

export class AstrachatNode implements Astrachat {
  chatSpace: string;
  alias: string;
  astraDb: AstraDb;

  constructor(chatSpace: string) {
    this.chatSpace = chatSpace;
  }

  public async init(init: AstrachatInit): Promise<void> {
    logger.debug("Creating AstraDb...");
    this.astraDb = await createAstraDb({
      dbName: this.chatSpace,
      loginKey: init.loginKey,
      isCollaborator: init.isCollaborator,
      datastore: init.datastore,
      blockstore: init.blockstore,
      publicIp: init.publicIp,
      tcpPort: init.tcpPort,
      webRTCDirectPort: init.webrtcDirectPort,
      dataDir: init.dataDir,
      bootstrapProviderPeers: init.bootstrapProviderPeers,
      offlineMode: init.offlineMode,
    });
    logger.debug("AstraDb created");

    if (!init.alias) {
      logger.debug("No alias found, setting public key as alias");
    }
    this.alias = init.alias || this.astraDb.getLoginPublicKey();
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
    const message = createMessage(this.getUserId(), this.alias, "Chat created");
    await chat.sendMessage(message);
    logger.debug(`[${this.alias}] Chat "${chatName}" created`);
  }

  public async getMessages(
    chatName: string,
    onNewMessage?: ChatMessageCallback,
  ): Promise<ChatMessage[]> {
    logger.info(`[${this.alias}] Getting messages from ${chatName}...`);
    const chat = await Chat.create(
      this.chatSpace,
      chatName,
      this.astraDb,
      onNewMessage,
    );
    logger.debug(`[${this.alias}] Chat found, getting messages...`);
    return chat.getMessages();
  }

  public async sendMessage(
    chatName: string,
    text: string,
    parentId?: string,
  ): Promise<void> {
    logger.debug(`[${this.alias}] Sending message for ${chatName}...`);
    const chat = await Chat.create(this.chatSpace, chatName, this.astraDb);
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
}
