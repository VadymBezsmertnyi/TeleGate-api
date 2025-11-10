import WalletSpyTransactionModel from "../../routes/wallets-spy-transaction/wallets-spy.model";
import { GetSignaturesForAddressTransaction } from "./wallets-spy.types";

/**
 * Видслідковує транзакцію, щоб визначити, чи є вона покупкою або продажем токена для вказаного гаманця.
 * Порівнює баланси токенів до і після транзакції.
 */
export const detectBuySell = (tx: any, wallet: string) => {
  const pre = tx.meta?.preTokenBalances ?? [];
  const post = tx.meta?.postTokenBalances ?? [];
  if (!post.length && !pre.length) return null;

  const preMine = pre.filter((b: any) => b.owner === wallet);
  const postMine = post.filter((b: any) => b.owner === wallet);
  for (const postTok of postMine) {
    const preTok = preMine.find((b: any) => b.mint === postTok.mint);
    const preAmount = preTok?.uiTokenAmount?.uiAmount ?? 0;
    const postAmount = postTok?.uiTokenAmount?.uiAmount ?? 0;
    if (!preTok || (preAmount === 0 && postAmount > 0))
      return {
        signature: tx.transaction.signatures[0],
        type: "buy",
        token: postTok.mint,
        amount: postAmount - preAmount,
        date: tx.blockTime ? new Date(Number(tx.blockTime) * 1000) : null,
      };
    if (preAmount < postAmount)
      return {
        signature: tx.transaction.signatures[0],
        type: "sell",
        token: postTok.mint,
        amount: preAmount - postAmount,
        date: tx.blockTime ? new Date(Number(tx.blockTime) * 1000) : null,
      };
  }

  return null;
};

/**
 * Перевіряє історію транзакцій і повертає підписи нових транзакцій, яких немає в базі даних.
 */
export const checkHistoryNew = async (
  history: GetSignaturesForAddressTransaction[],
  wallet: string
) => {
  try {
    const results = [];
    for (const { signature } of history) {
      const transactionDB = await WalletSpyTransactionModel.findOne({
        walletAddress: wallet,
        signature,
      });
      if (transactionDB) continue;
      results.push(signature);
    }
    return results;
  } catch (error) {
    console.error("Error checking new history:", error);
    return [];
  }
};

/**
 * Генерує повідомлення для Telegram на основі інформації про транзакцію.
 */
export const generateTelegramMessage = (
  nameToken: string,
  mint: string,
  nameOwnerWallet: string,
  type: string,
  amount: number,
  date: Date | null
) => {
  const firstMainTitle = type === "buy" ? "🟢 Купівля" : "🔴 Продаж";
  const mainTitle = `${firstMainTitle} токена ${nameToken} (${nameOwnerWallet})`;
  const message = `Тип: ${type.toUpperCase()}\nМінт: ${mint}\nКількість: ${amount}\n\n`;
  const footer = `Дата: ${date ? date.toUTCString() : "Невідома"}. Токен ID:`;
  const firstMessage = `${mainTitle}\n${message}\n${footer}`;

  return {
    firstMessage,
    secondMessage: mint,
  };
};
