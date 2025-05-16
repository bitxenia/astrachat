# Astrachat

Astrachat is an implementation of a real-time messaging service
that makes use of [IPFS](https://ipfs.tech) and
[OrbitDB](https://github.com/orbitdb/orbitdb) to achieve a community driven,
decentralized way of sending messages between users. Making use of this module,
users can create their own group chats and chat spaces.

Given that this node is completely community driven and decentralized, users
support their own chat spaces by becoming a collaborative node. This way, the
community can help make their chats persistent and fully reachable.

Note that this project is meant as a library to be used by any frontend that
supports it. It's meant to run on both Node.js and a browser environment. As an
example, bitxenia's [astrawiki-web](https://github.com/bitxenia/astrawiki-web)
browser frontend includes chat support within articles, using this library.

## Install

```sh
npm install @bitxenia/astrachat
```

## Features

- Chat with other peers without relying on a centralized organization.
- Make your own community _chat space_ to group all the relevant chats to your
  community, similar to a Discord server.
- Support the community of your choosing by becoming a collaborator. See
  [Collaborating](https://github.com/bitxenia/astrachat?tab=readme-ov-file#Collaborating)
  for more.

## Usage

To create a node instance, use the `createAstrachat` function:

```typescript
import { createAstrachat } from "@bitxenia/astrachat";

const node = await createAstrachat({
  chatSpace: "bitxenia-chat",
});

const chatList = await node.getChatList();
console.log(chatList);
```

The _chat space_ name determines where the node places the chats. Creating a
new chat using this node, for example, results in a new chat in the
**bitxenia-chat** chat space.

To create a new chat, simply specify a name for it. Additionally, Astrachat
supports callback functions to handle frontend events whenever the user
receives a new message.

```typescript
const callback = (message: ChatMessage) => console.log("New: ", message);
await node.createChat("Example chat", onNewMessage: callback);
```

Now that you've created a chat, you can start sending messages to it. Note that
the chat'll only persist in the database after you send your first message. To
do that, choose an alias to identify yourself as, and type something.

```typescript
const text = "Hi from bitxenia :)";
await node.sendMessage("Example chat", text, "Bob");
```

If you want to connect to a chat that's already made, you can get all its
messages with the node:

```typescript
const messages = await node.getMessages("Example chat");
console.log("Messages", messages);
```

You can also add a callback function when connecting to an existing chat, so that you can stay up to date with the latest messages sent.

```typescript
const callback = (message: ChatMessage) => console.log("New: ", message);
const messages = await node.getMessages("Example chat", onNewMessage: callback);
```

A chat space can contain multiple chats. Astrachat allows the user to list all
of them.

```typescript
const chatList = await node.getChatList();
console.log("All chats: ", messages);
```

## Collaborating

To collaborate on your community's chat space, simply set `isCollaborator`
to true in the `createAstrachat` arguments. This'll pin all the chats so other
users can reach it through your node. This'll help in keeping the chats
persistent, and increasing the availability within the IPFS network.

```typescript
import { createAstrachat } from "@bitxenia/astrachat";

const node = await createAstrachat({
  chatSpace: "bitxenia-chat",
  isCollaborator: true,
});
```

## Documentation

### Development

**Clone and install dependencies:**

```sh
git clone git@github.com:bitxenia/astrachat.git
cd astrachat
npm install
```

### Run Tests

```sh
npm run test
```

### Build

```sh
npm run build
```

### Run multiple nodes in a machine

To be able to run Astrachat in more than one instance per machine, you'll need
to change the ports of the instances to be unique. Also, the datastore,
blockstore, and data directories'll also need to be unique to the
instance.

```typescript
const datastore = new FsDatastore("./data/node1/datastore");
const blockstore = new FsBlockstore("./data/node1/blockstore");
return await createAstrachat({
  isCollaborator: true,
  datastore,
  blockstore,
  tcpPort: 51001,
  webrtcDirectPort: 51001,
  dataDir: "./data/node1",
});
```

## Contributions

Contributions are welcome, please check the issues to get started.

## Troubleshooting

### The node can't receive incoming connections and thus can't collaborate

If the node is set to collaborate and it fails to do so, the reason should most
likely be a port issue. The `LibP2P` implementation uses `UPnP` to
automatically open ports and detect the public IP. If the modem is outdated,
you'll need to manually open the ports and specify the public IP when
creating the node in the `createAstrachat` function.

The ports that need to be opened manually are:

- `50001` TCP port, used to receive `TCP` incoming connections.
- `50001` UDP port, used to receive `WebRTC-Direct` incoming connections.

If this doesn't work, your ISP may be using Double NAT, which prevents
incoming connections. In this case, you may need to contact your ISP to request
a solution.

## Other implementations

- https://github.com/bitxenia/astrachat-eth

## License

MIT (LICENSE-MIT / http://opensource.org/licenses/MIT)
