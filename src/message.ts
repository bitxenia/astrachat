import { logger } from "./utils/logger";

export type ChatMessage = {
  id: string;
  parentId: string;
  sender: string;
  senderAlias: string;
  message: string;
  timestamp: number;
};

export function createMessage(
  sender: string,
  senderAlias: string,
  message: string,
  parentId?: string,
): ChatMessage {
  return {
    id: crypto.randomUUID(),
    parentId: parentId || "",
    sender,
    senderAlias,
    message,
    timestamp: Date.now(),
  };
}

export function constructMessage(rawMessage: string): ChatMessage {
  const message = JSON.parse(rawMessage);
  if (!isChatMessage(message)) {
    logger.error("Parsed object isn't a ChatMessage. Chat returned: ", message);
    throw new Error("Parsed object isn't a ChatMessage");
  }
  return message;
}

function isChatMessage(obj: any): obj is ChatMessage {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "string" &&
    typeof obj.sender === "string" &&
    typeof obj.senderAlias === "string" &&
    typeof obj.message === "string" &&
    typeof obj.timestamp === "number"
  );
}
