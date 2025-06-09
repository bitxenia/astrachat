import { publicIpv4 } from "public-ip";
import { Astrachat, createAstrachat } from "../../src";
import { FsBlockstore } from "blockstore-fs";
import { FsDatastore } from "datastore-fs";

export async function getNode(
  name: string,
  port: number,
  isCollaborator: boolean,
  peers: string[] = [],
): Promise<Astrachat> {
  const publicIp = await publicIpv4();
  if (peers.length > 0) {
    return await createAstrachat({
      chatSpace: "astrachat-test",
      isCollaborator,
      blockstore: new FsBlockstore(`./data/${name}/blockstore`),
      datastore: new FsDatastore(`./data/${name}/datastore`),
      publicIp,
      tcpPort: port,
      webrtcDirectPort: port,
      dataDir: `./data/${name}/`,
      bootstrapProviderPeers: peers,
    });
  } else {
    return await createAstrachat({
      chatSpace: "astrachat-test",
      isCollaborator,
      blockstore: new FsBlockstore(`./data/${name}/blockstore`),
      datastore: new FsDatastore(`./data/${name}/datastore`),
      publicIp,
      tcpPort: port,
      webrtcDirectPort: port,
      dataDir: `./data/${name}/`,
    });
  }
}
