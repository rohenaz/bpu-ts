declare module "bitcoind-rpc" {
  export type Config = {
    protocol: string;
    user: string;
    host: string;
    port: string;
    pass: string;
  };

  export default class RpcClient {
    constructor(config: Config);
    getRawTransaction(tx, callback);
  }
}
