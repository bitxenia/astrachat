import { Chat } from "../src/chat";
import { ChatMessage } from "../src/message";
import { logger } from "../src/utils/logger";
import { MockAstraDb } from "./mock/mockAstraDb";

test("Chat.create loads existing messages", async () => {
  logger.setLevel("error");
  const mockDb = new MockAstraDb();

  const message: ChatMessage = {
    id: "1",
    parentId: "",
    senderAlias: "Bob",
    sender: "123",
    message: "Hello",
    timestamp: Date.now(),
  };
  await mockDb.add("room1", JSON.stringify(message));

  const chat = await Chat.create("chatspace", "room1", mockDb as any);
  const messages = chat.getMessages();

  expect(messages).toHaveLength(1);
  expect(messages[0].message).toBe("Hello");
});

test("Chat.sendMessage emits and stores a message", async () => {
  logger.setLevel("error");
  const mockDb = new MockAstraDb();
  const receivedMessages: ChatMessage[] = [];

  const chat = await Chat.create("chatspace", "room1", mockDb as any, (msg) =>
    receivedMessages.push(msg),
  );

  const message: ChatMessage = {
    id: "1",
    parentId: "",
    sender: "123",
    senderAlias: "Bob",
    message: "Hi again!",
    timestamp: Date.now(),
  };

  await chat.sendMessage(message);

  expect(receivedMessages).toHaveLength(1);
  expect(receivedMessages[0].message).toBe("Hi again!");
});

test("Chat.getMessages returns existing messages", async () => {
  logger.setLevel("error");
  const mockDb = new MockAstraDb();

  const message: ChatMessage = {
    id: "1",
    parentId: "",
    sender: "123",
    senderAlias: "Alice",
    message: "Hey there!",
    timestamp: Date.now(),
  };

  await mockDb.add("room1", JSON.stringify(message));

  const chat = await Chat.create("chatspace", "room1", mockDb as any);
  const messages = chat.getMessages();

  expect(messages).toHaveLength(1);
  expect(messages[0]).toEqual(message);
});

test("Chat listens to new messages and calls callback", async () => {
  logger.setLevel("error");
  const mockDb = new MockAstraDb();
  const received: ChatMessage[] = [];

  const chat = await Chat.create("chatspace", "room1", mockDb as any, (msg) =>
    received.push(msg),
  );

  const newMessage: ChatMessage = {
    id: "3",
    parentId: "",
    sender: "123",
    senderAlias: "Bob",
    message: "What’s up?",
    timestamp: Date.now(),
  };

  await chat.sendMessage(newMessage);

  expect(received).toHaveLength(1);
  expect(received[0]).toEqual(newMessage);
});
