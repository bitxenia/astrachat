import type { Blockstore } from "interface-blockstore";
import type { Datastore } from "interface-datastore";
import { MemoryBlockstore } from "blockstore-core";
import { MemoryDatastore } from "datastore-core";
import { ChatMessage } from "./message.js";
import { AstrachatNode } from "./astrachat.js";
import { ChatMessageCallback } from "./chat.js";
import { createAstraDb } from "@bitxenia/astradb";

export interface AstrachatInit {
  chatSpace?: string;
  loginKey?: string;
  isCollaborator?: boolean;
  datastore?: Datastore;
  blockstore?: Blockstore;
  publicIp?: string;
}

export async function createAstrachat(
  init: AstrachatInit,
): Promise<AstrachatNode> {
  const chatSpace = init.chatSpace ?? "bitxenia-chat";
  const astraDb = await createAstraDb({
    dbName: chatSpace,
    loginKey: init.loginKey,
    isCollaborator: init.isCollaborator ?? false,
    datastore: init.datastore ?? new MemoryDatastore(),
    blockstore: init.blockstore ?? new MemoryBlockstore(),
    publicIp: init.publicIp ?? "0.0.0.0",
  });

  return new AstrachatNode(chatSpace, astraDb);
}

export interface Astrachat {
  createChat(
    chatName: string,
    onNewMessage: ChatMessageCallback,
  ): Promise<void>;

  getMessages(
    chatName: string,
    onNewMessage: ChatMessageCallback,
  ): Promise<ChatMessage[]>;

  sendMessage(chatName: string, text: string, alias?: string): Promise<void>;

  getChatList(): Promise<string[]>;

  getUserId(): string;

  getLoginKey(): Promise<string>;
}

export { ChatMessage } from "./message";
