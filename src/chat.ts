import { AstraDb } from "@bitxenia/astradb";
import { ChatMessage, constructMessage } from "./message";

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
    const allChats = await astraDb.getAllKeys();
    let messages: ChatMessage[] = [];
    if (allChats.includes(chatName)) {
      const rawMessages = await astraDb.get(chatName);
      messages = rawMessages.map((rawMessage: string) =>
        constructMessage(rawMessage),
      );
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
    if (onNewMessage) this.listenToNewMessages(onNewMessage);
    return this.messages;
  }

  public async sendMessage(message: ChatMessage) {
    await this.astraDb.add(this.chatName, JSON.stringify(message));
  }

  private listenToNewMessages(callback: ChatMessageCallback) {
    this.astraDb.events.on(
      `${this.chatSpace}::${this.chatName}`,
      (value: string) => {
        const newMessage = constructMessage(value);
        this.messages.push(newMessage);
        callback(newMessage);
      },
    );
  }
}
