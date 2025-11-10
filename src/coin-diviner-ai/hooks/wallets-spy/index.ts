import { createSolanaRpc, mainnet, Address } from "@solana/kit";
import {
  checkHistoryNew,
  detectBuySell,
  generateTelegramMessage,
} from "./wallets-spy.helps";
import CryptoCoinModel from "../../routes/aggregator/aggregator.model";
import DexScreenerService from "../dexscreener";
import WalletSpyTransactionModel from "../../routes/wallets-spy-transaction/wallets-spy.model";
import NotificationSettingsModel from "../../routes/notification/notification.model";
import { WALLETS_FOR_SPY } from "./wallets-spy.constants";
import { sendMessageToChatId } from "../../helpers/telegram/telegram.helpers";
import { GetSignaturesForAddressTransaction } from "./wallets-spy.types";

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "";
const rpc = createSolanaRpc(mainnet(SOLANA_RPC_URL));

/**
 * Отримує історію транзакцій для вказаної адреси гаманця.
 * Повертає масив об'єктів транзакцій.
 */
const getTransactionHistory = async (address: string) => {
  try {
    const transactions = rpc.getSignaturesForAddress(address as Address, {
      limit: 5,
    });
    return await transactions.send();
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    return [];
  }
};

/**
 * Відображає історію транзакцій для вказаного гаманця.
 * Перевіряє нові транзакції, визначає тип (покупка/продаж) і надсилає повідомлення користувачам.
 */
const displayTransactionHistory = async (
  wallet: string,
  nameOwnerWallet: string
) => {
  try {
    const history = (await getTransactionHistory(
      wallet
    )) as GetSignaturesForAddressTransaction[];
    const newTrasactions = await checkHistoryNew(history || [], wallet);
    for (const signature of newTrasactions) {
      const tx = rpc.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
        encoding: "jsonParsed",
      });
      const result = await tx.send();
      if (!result) {
        console.log(`No transaction data for signature: ${signature}`);
        continue;
      }

      const buySellInfo = detectBuySell(result, wallet);
      if (!buySellInfo || !buySellInfo?.token) continue;
      if (buySellInfo?.token === "SOL") continue;

      let nameToken = "Unknown";

      const firstTransaction = await WalletSpyTransactionModel.findOne({
        tokenMint: buySellInfo.token,
      });
      if (firstTransaction && firstTransaction.nameOwnerWallet)
        nameToken = firstTransaction.nameToken || "Unknown";

      if (nameToken === "Unknown") {
        const coinDB = await CryptoCoinModel.findOne({
          $or: [
            { "dexscreenerData.baseToken.address": buySellInfo?.token },
            { "coinGeckoData.id": buySellInfo?.token },
            { "coinPaprikaData.contract_address.address": buySellInfo?.token },
          ],
        });
        if (coinDB) {
          if (coinDB.dexscreenerData?.baseToken?.name)
            nameToken = coinDB.dexscreenerData.baseToken.name;
          else if (coinDB.coinGeckoData?.name)
            nameToken = coinDB.coinGeckoData.name;
          else if (coinDB.coinPaprikaData?.name)
            nameToken = coinDB.coinPaprikaData.name;
        }
      }

      if (nameToken === "Unknown") {
        const originalQuery = buySellInfo.token.trim() || "";
        const searchAddress = await DexScreenerService.getByTokenId(
          originalQuery
        );
        if (
          !searchAddress ||
          !searchAddress.pairs ||
          searchAddress.pairs.length === 0
        )
          continue;

        const pair = searchAddress.pairs[0];
        nameToken = pair.baseToken.name || "Unknown";
      }

      const notificationUsers = await NotificationSettingsModel.find({
        telegram: { $ne: null },
      }).lean();
      const { firstMessage, secondMessage } = generateTelegramMessage(
        nameToken,
        buySellInfo.token,
        nameOwnerWallet,
        buySellInfo.type,
        buySellInfo.amount
      );

      for (const notifyUser of notificationUsers) {
        const chatId = notifyUser?.telegram?.chatId;
        if (!chatId) continue;

        await sendMessageToChatId(chatId, firstMessage);
        await sendMessageToChatId(chatId, secondMessage);
      }
      await WalletSpyTransactionModel.create({
        walletAddress: wallet,
        signatureId: signature,
        nameOwnerWallet,
        nameToken,
        type: buySellInfo.type,
        tokenMint: buySellInfo.token,
        amount: buySellInfo.amount,
      });
    }
  } catch (error) {
    console.error("Error displaying transaction history:", error);
  }
};

export const checkWalletsSpy = async () => {
  for (const walletData of WALLETS_FOR_SPY)
    await displayTransactionHistory(
      walletData.address,
      walletData.nameOwnerWallet
    );
};
