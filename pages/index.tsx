import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import {
  SigningCosmWasmClientOptions,
  SigningCosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";
import { GasPrice, MsgSendEncodeObject } from "@cosmjs/stargate";
import { coins, coin } from "@cosmjs/stargate";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { HDKey } from "ethereum-cryptography/hdkey";
// import bip39 from "bip39";
import { Secp256k1Wallet } from "cosmwasm";
import { useState } from "react";
const bip39 = require("bip39");

const inter = Inter({ subsets: ["latin"] });
const address = "sei1966t3kgp76fsyjal9afcsw48rv3877lhgx5lg6";
const chain = "atlantic-1";
const alice = {
  mnemonic:
    "quality country dynamic april valid lesson desert visual organ amateur venture leaf",
  address0: {
    name: "Dusk",
    address: "sei12l3wrxzfluf3gneuamq4uxdfq7x4ee3uwev28dgrjhv4pksl6m6slacwpn",
  },
};
const rpc = "https://rpc-sei-test.ecostake.com/";
const defaultGasPrice = GasPrice.fromString("0.00usei");
const defaultSigningClientOptions: SigningCosmWasmClientOptions = {
  broadcastPollIntervalMs: 300,
  broadcastTimeoutMs: 8000,
  gasPrice: defaultGasPrice,
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const getSignTx = async () => {
    const seed = await bip39.mnemonicToSeed(alice.mnemonic);
    const hdKey = HDKey.fromMasterSeed(seed);

    const masterSeed: any = hdKey.derive("m/44'/118'/0'/0/0");
    let privateKey = Buffer.from(masterSeed.privateKey);

    const wallets = await Secp256k1Wallet.fromKey(privateKey, "sei");
    const walletsAddresss = await wallets.getAccounts();

    const client = await SigningCosmWasmClient.connectWithSigner(rpc, wallets, {
      ...defaultSigningClientOptions,
    });

    const msgSend: MsgSendEncodeObject = {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: {
        fromAddress: walletsAddresss[0].address,
        toAddress: "sei1gqamg5jfw5fs7y08cscskyg44ldy5h0jgmevxp",
        amount: coins(12345, "usei"),
      },
    };

    const fee = {
      amount: coins(1000, "usei"),
      gas: "222000", // 222k
    };
    const memo = "";
    const signed = await client.sign(
      walletsAddresss[0].address,
      [msgSend],
      fee,
      memo
    );

    // ensure signature is valid
    const result = await client.broadcastTx(
      Uint8Array.from(TxRaw.encode(signed).finish())
    );
    return result;
  };

  const onEnable = () => {
    window.keplr.enable("atlantic-1");
    window.keplr.experimentalSuggestChain({
      bech32Config: {
        bech32PrefixAccAddr: "juno",
        bech32PrefixAccPub: "junopub",
        bech32PrefixConsAddr: "junovalcons",
        bech32PrefixConsPub: "junovalconspub",
        bech32PrefixValAddr: "junovaloper",
        bech32PrefixValPub: "junovaloperpub",
      },
      bip44: { coinType: 118 },
      chainId: "uni-5",
      chainName: "Juno TestNet",
      coinType: 118,
      currencies: [
        { coinDecimals: 6, coinDenom: "JUNOX", coinMinimalDenom: "ujunox" },
      ],
      feeCurrencies: [
        { coinDecimals: 6, coinDenom: "JUNOX", coinMinimalDenom: "ujunox" },
      ],
      origin: "https://beta.eclipsepad.com/projects/",
      rest: "https://api.uni.junonetwork.io",
      rpc: "https://rpc.uni.junonetwork.io",
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "JUNOX",
        coinMinimalDenom: "ujunox",
      },
    });
  };

  const onSign = async () => {
    window.keplr.signArbitrary(
      chain,
      address,
      "SIGN DATA zxc zxc zxc zczxc zxc"
    );
  };

  const onSend = async () => {
    setLoading(true);
    const txRaw = await getSignTx();
    window.keplr.sendTx(chain, txRaw, "async");
    setLoading(false);
  };

  return (
    <>
      <main className={styles.main}>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className={styles.grid}>
            <button onClick={onEnable} className={styles.card}>
              <h2 className={inter.className}>Enable & Suggest Chain</h2>
            </button>

            <button onClick={onSign} className={styles.card}>
              <h2 className={inter.className}>Sign Amino</h2>
            </button>

            <button onClick={onSend} className={styles.card}>
              <h2 className={inter.className}>Send Tx</h2>
            </button>
          </div>
        )}
      </main>
    </>
  );
}
