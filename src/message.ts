export type ChatMessage = {
  id: string;
  parentId: string;
  sender: string;
  senderAlias: string;
  message: string;
  timestamp: number;
};

export function constructMessage(rawMessage: string): ChatMessage {
  const message = JSON.parse(rawMessage);
  if (!isChatMessage(message)) {
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
