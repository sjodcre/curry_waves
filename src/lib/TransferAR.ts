// source: https://github.com/ArweaveTeam/arweave-js + https://docs.arweavekit.com/wallets/wallet-kit
import Arweave from "arweave";

const arweave = Arweave.init({});

export async function transferAR(api: any, toast: any) {
  if (!api) {
    throw new Error("Arweave Wallet not connected");
  }
  // const wallet = JSON.parse(process.env.ARWEAVE_WALLET || "{}");
  const quantity = "0.001";
  // const recipient = "FTULSLIKAkX46SpqWz7NothRsGhbicjRwbA4ONzaoLQ";
  const recipient = "cQPezCQ3WewCMBn_qQKoYvUpfdsDI3amXyXqm4Y7plk";
  let transaction = await arweave.createTransaction({
    target: recipient,
    quantity: arweave.ar.arToWinston(quantity),
  });
  // console.log(transaction)
  await api.sign(transaction);
  // await arweave.transactions.sign(transaction);
  const response = await arweave.transactions.post(transaction);
  if (response.status === 200) {
    // Toast message for successful tip
    toast({
      description: "Tip successful!",
    });
  }
  console.log(response);
  // console.log("transaction after", transaction)
  return transaction;
}
