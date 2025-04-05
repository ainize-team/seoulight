import { Wormhole, signSendWait, wormhole } from "@wormhole-foundation/sdk";
import evm from "@wormhole-foundation/sdk/evm";
import solana from "@wormhole-foundation/sdk/solana";
import sui from "@wormhole-foundation/sdk/sui";
import { inspect } from "util";
import { getSigner } from "../helpers/helpers";

(async function () {
  const wh = await wormhole("Testnet", [evm, solana, sui]);

  // Define the source and destination chains
  const srcChain = wh.getChain("BaseSepolia");
  const destChain = wh.getChain("ArbitrumSepolia");
  const token = await srcChain.getNativeWrappedTokenId();
  const gasLimit = BigInt(2_500_000);

  // Destination chain signer setup
  const { signer: destSigner } = await getSigner(destChain, gasLimit);
  const tbDest = await destChain.getTokenBridge();

  try {
    // 디버깅을 위한 로그 추가
    console.log(
      "Checking for wrapped asset with token:",
      JSON.stringify(token, (_, v) =>
        typeof v === "bigint" ? v.toString() : v
      )
    );

    const wrapped = await tbDest.getWrappedAsset(token).catch((error) => {
      console.error("Error details in getWrappedAsset:", error);
      // 에러 발생 시 특정 BAD_DATA 에러인 경우 처리
      if (error.code === "BAD_DATA" && error.info?.method === "wrappedAsset") {
        console.log("Handling BAD_DATA error for wrappedAsset method");
        return null;
      }
      throw error;
    });

    if (wrapped) {
      console.log(
        `Token already wrapped on ${destChain.chain}. Skipping attestation.`
      );
      return { chain: destChain.chain, address: wrapped };
    } else {
      console.log(
        `No valid wrapped token found on ${destChain.chain}. Proceeding with attestation.`
      );
    }
  } catch (e) {
    console.log(
      `No wrapped token found on ${destChain.chain}. Proceeding with attestation.`
    );
    console.error("Detailed error:", e);
  }

  // Source chain signer setup
  const { signer: origSigner } = await getSigner(srcChain);

  // Create an attestation transaction on the source chain
  const tbOrig = await srcChain.getTokenBridge();
  const attestTxns = tbOrig.createAttestation(
    token.address,
    Wormhole.parseAddress(origSigner.chain(), origSigner.address())
  );

  const txids = await signSendWait(srcChain, attestTxns, origSigner);
  console.log("txids: ", inspect(txids, { depth: null }));
  const txid = txids[0]!.txid;
  console.log("Created attestation (save this): ", txid);

  // Retrieve the Wormhole message ID from the attestation transaction
  const msgs = await srcChain.parseTransaction(txid);
  console.log("Parsed Messages:", msgs);

  const timeout = 25 * 60 * 1000;
  const vaa = await wh.getVaa(msgs[0]!, "TokenBridge:AttestMeta", timeout);
  if (!vaa) {
    throw new Error(
      "VAA not found after retries exhausted. Try extending the timeout."
    );
  }

  console.log("Token Address: ", vaa.payload.token.address);

  // Submit the attestation on the destination chain
  console.log("Attesting asset on destination chain...");

  const subAttestation = tbDest.submitAttestation(
    vaa,
    Wormhole.parseAddress(destSigner.chain(), destSigner.address())
  );

  const tsx = await signSendWait(destChain, subAttestation, destSigner);
  console.log("Transaction hash: ", tsx);

  // Poll for the wrapped asset until it's available
  async function waitForIt() {
    do {
      try {
        const wrapped = await tbDest.getWrappedAsset(token).catch((error) => {
          console.error("Error in waitForIt:", error);
          if (
            error.code === "BAD_DATA" &&
            error.info?.method === "wrappedAsset"
          ) {
            console.log("Still waiting for valid data...");
            return null;
          }
          throw error;
        });

        if (wrapped) {
          return { chain: destChain.chain, address: wrapped };
        }
      } catch (e) {
        console.error("Wrapped asset not found yet. Retrying...");
        console.error("Error details:", e);
      }
      console.log("Waiting before checking again...");
      await new Promise((r) => setTimeout(r, 2000));
    } while (true);
  }

  console.log("Wrapped Asset: ", await waitForIt());
})().catch((e) => console.error(e));
