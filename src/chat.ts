import { AstraDb } from "@bitxenia/astradb";
import { ChatMessage, constructMessage, createMessage } from "./message";
import { logger } from "./utils/logger";

export type ChatMessageCallback = (message: ChatMessage) => void;

export class Chat {
  chatSpace: Readonly<string>;
  chatName: Readonly<string>;
  astraDb: AstraDb;
  messages: ChatMessage[];

  public static async create(
    chatSpace: string,
    chatName: string,
    astraDb: AstraDb,
    onNewMessage?: ChatMessageCallback,
  ) {
    logger.debug("Creating Chat...");
    const allChats = await astraDb.getAllKeys();
    let messages: ChatMessage[] = [];
    if (allChats.includes(chatName)) {
      logger.info("Existing Chat found, getting messages...");
      const rawMessages = await astraDb.get(chatName);
      messages = rawMessages.map((rawMessage: string) =>
        constructMessage(rawMessage),
      );
      logger.info(`Found ${messages.length} messages in existing Chat`);
    } else {
      logger.debug("New Chat detected, creating...");
      const firstMessage = createMessage("astrachat", "Astrachat", "");
      await astraDb.add(chatName, JSON.stringify(firstMessage));
      logger.debug(`${chatName} created in ${chatSpace}`);
      messages = [firstMessage];
      logger.info("New Chat created with default first message");
    }

    return new Chat(chatSpace, chatName, messages, astraDb, onNewMessage);
  }

  private constructor(
    chatSpace: string,
    chatName: string,
    messages: ChatMessage[],
    astraDb: AstraDb,
    onNewMessage?: ChatMessageCallback,
  ) {
    this.chatSpace = chatSpace;
    this.chatName = chatName;
    this.astraDb = astraDb;
    this.messages = messages;
    if (onNewMessage) {
      this.listenToNewMessages(onNewMessage);
    } else {
      this.listenToNewMessages((_) => {});
    }
  }

  public getMessages(onNewMessage?: ChatMessageCallback): ChatMessage[] {
    logger.info(`Getting messages for ${this.chatName}`);
    if (onNewMessage) this.listenToNewMessages(onNewMessage);
    this.messages.sort((a, b) => a.timestamp - b.timestamp);
    return this.messages;
  }

  public async sendMessage(message: ChatMessage) {
    logger.info(`Sending message in ${this.chatName}: ${message}`);
    await this.astraDb.add(this.chatName, JSON.stringify(message));
  }

  private listenToNewMessages(callback: ChatMessageCallback) {
    logger.info(`Setting new callback for ${this.chatName}`);
    this.astraDb.events.on(
      `${this.chatSpace}::${this.chatName}`,
      (value: string) => {
        const newMessage = constructMessage(value);
        logger.info("New message detected in callback: ", newMessage.id);
        this.messages.push(newMessage);
        logger.debug("Calling set callback...");
        callback(newMessage);
      },
    );
  }
}
