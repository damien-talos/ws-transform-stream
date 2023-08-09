import { Socket } from "net";
import { Duplex } from "stream";
import { ClientRequest } from "http";

export type TransformFunc = (message: string) => string | Promise<string>;
export interface ReceiverOpts {
  binaryType: "nodebuffer" | "arraybuffer" | "fragments";
  extensions: any;
  maxPayload: number;
}
export interface SenderOpts {
  extensions: any;
}

export interface TransformOptions {
  isToServer?: boolean;
  //   source: Socket;
  //   filter: FilterFunc;
  transform: TransformFunc;
  transformSequential?: boolean;
  sender?: SenderOpts;
  receiver?: ReceiverOpts;
  compress?: boolean;
}

export class WsTransformStream extends Duplex {
  constructor(options: TransformOptions);
  transform: TransformFunc;
  source;
  sender;
  receiver;
}

export function fromUpgradeRequest(req: ClientRequest, options: TransformOptions): WsTransformStream;
