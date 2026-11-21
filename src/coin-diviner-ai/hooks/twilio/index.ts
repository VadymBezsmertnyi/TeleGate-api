import twilio from "twilio";

const TWILIO_ACCOUNT_SID_COIN_DIVINER_AI =
  process.env.TWILIO_ACCOUNT_SID_COIN_DIVINER_AI || "";
const TWILIO_AUTH_TOKEN_COIN_DIVINER_AI =
  process.env.TWILIO_AUTH_TOKEN_COIN_DIVINER_AI || "";
const TWILIO_PHONE_NUMBER_COIN_DIVINER_AI =
  process.env.TWILIO_PHONE_NUMBER_COIN_DIVINER_AI || "";

const twilioClient = twilio(
  TWILIO_ACCOUNT_SID_COIN_DIVINER_AI,
  TWILIO_AUTH_TOKEN_COIN_DIVINER_AI,
  { lazyLoading: true }
);

interface MakeCallOptions {
  to: string;
  twimlUrl?: string;
  statusCallback?: string;
}

interface MakeCallResult {
  success: boolean;
  callSid?: string;
  status?: string;
  error?: string;
}

export const makeCall = async ({
  to,
  twimlUrl,
  statusCallback,
}: MakeCallOptions): Promise<MakeCallResult> => {
  try {
    if (!TWILIO_PHONE_NUMBER_COIN_DIVINER_AI)
      return {
        success: false,
        error: "Номер телефону Twilio не налаштовано",
      };

    const call = await twilioClient.calls.create({
      to,
      from: TWILIO_PHONE_NUMBER_COIN_DIVINER_AI,
      url: twimlUrl,
      statusCallback,
    });

    return {
      success: true,
      callSid: call.sid,
      status: call.status,
    };
  } catch (error) {
    console.warn("Помилка при здійсненні дзвінка:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Невідома помилка",
    };
  }
};
