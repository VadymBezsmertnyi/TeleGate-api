import {
  Commitment,
  Signature,
  Slot,
  TransactionError,
  UnixTimestamp,
} from "@solana/kit";

export type GetSignaturesForAddressTransaction = Readonly<{
  blockTime: UnixTimestamp | null;
  confirmationStatus: Commitment | null;
  err: TransactionError | null;
  memo: string | null;
  signature: Signature;
  slot: Slot;
}>;
