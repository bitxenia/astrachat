import type { Blockstore } from "interface-blockstore";
import type { Datastore } from "interface-datastore";
import { MemoryBlockstore } from "blockstore-core";
import { MemoryDatastore } from "datastore-core";
import { ChatMessage } from "./message";
import { AstrachatNode } from "./astrachat";
import { ChatMessageCallback } from "./chat";
import { logger, LogLevel } from "./utils/logger";

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
  webrtcDirectPort?: number;
  dataDir?: string;
  bootstrapProviderPeers?: string[];
  logLevel?: LogLevel;

  /**
   * If true, the node will not connect to the network and will only work locally.

   * This is useful for testing purposes.
   *
   * @default false
   */
  offlineMode?: boolean;
}

export async function createAstrachat(
  init: AstrachatInit,
): Promise<AstrachatNode> {
  // Set default values for the parameters if not provided
  init.chatSpace = init.chatSpace ?? "bitxenia-chat";
  init.alias = init.alias ?? "";
  init.loginKey = init.loginKey ?? "";
  init.isCollaborator = init.isCollaborator ?? false;
  init.datastore = init.datastore ?? new MemoryDatastore();
  init.blockstore = init.blockstore ?? new MemoryBlockstore();
  init.publicIp = init.publicIp ?? "0.0.0.0";
  init.tcpPort = init.tcpPort ?? 50001;
  init.wsPort = init.wsPort ?? 50002;
  init.wssPort = init.wssPort ?? 50003;
  init.webrtcDirectPort = init.webrtcDirectPort ?? 50001;
  init.dataDir = init.dataDir ?? "./data/astrachat";
  init.bootstrapProviderPeers = init.bootstrapProviderPeers ?? [];
  init.offlineMode = init.offlineMode ?? false;

  if (init.logLevel) logger.setLevel(init.logLevel);

  logger.info("Creating Astrachat node...");
  const node = new AstrachatNode(init.chatSpace);
  await node.init(init);
  logger.info("Astrachat node created & initialized");
  return node;
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
