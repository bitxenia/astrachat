import type { Blockstore } from "interface-blockstore";
import type { Datastore } from "interface-datastore";
import { MemoryBlockstore } from "blockstore-core";
import { MemoryDatastore } from "datastore-core";
import { ChatMessage } from "./message";
import { AstrachatNode } from "./astrachat";
import { ChatMessageCallback } from "./chat";
import { createAstraDb } from "@bitxenia/astradb";

export interface AstrachatInit {
  chatSpace?: string;
  alias?: string;
  loginKey?: string;
  isCollaborator?: boolean;
  datastore?: Datastore;
  blockstore?: Blockstore;
  publicIp?: string;
  tcpPort?: number;
  wsPort?: number;
  wssPort?: number;
  dataDir?: string;
}

export async function createAstrachat(
  init: AstrachatInit,
): Promise<AstrachatNode> {
  const chatSpace = init.chatSpace ?? "bitxenia-chat";
  const alias = init.alias ?? "";
  const astraDb = await createAstraDb({
    dbName: chatSpace,
    loginKey: init.loginKey,
    isCollaborator: init.isCollaborator ?? false,
    datastore: init.datastore ?? new MemoryDatastore(),
    blockstore: init.blockstore ?? new MemoryBlockstore(),
    publicIp: init.publicIp ?? "0.0.0.0",
    TcpPort: init.tcpPort ?? 50001,
    WSPort: init.wsPort ?? 50002,
    WSSPort: init.wssPort ?? 50003,
    dataDir: init.dataDir,
  });

  return new AstrachatNode(chatSpace, alias, astraDb);
}

export interface Astrachat {
  createChat(
    chatName: string,
    onNewMessage?: ChatMessageCallback,
  ): Promise<void>;

  getMessages(
    chatName: string,
    onNewMessage?: ChatMessageCallback,
  ): Promise<ChatMessage[]>;

  sendMessage(chatName: string, text: string, parentId?: string): Promise<void>;

  getChatList(): Promise<string[]>;

  getUserId(): string;

  getLoginKey(): Promise<string>;

  getAlias(): string;

  setChatAlias(alias: string): void;
}

export { ChatMessage } from "./message";
