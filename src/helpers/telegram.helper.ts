import axios from "axios";

export interface TelegramUserI {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramChatMemberI {
  user: TelegramUserI;
  status:
    | "creator"
    | "administrator"
    | "member"
    | "restricted"
    | "left"
    | "kicked";
}

export async function getTelegramUserInfo(
  userId: number,
  botToken: string
): Promise<TelegramUserI | null> {
  try {
    const response = await axios.get(
      `https://api.telegram.org/bot${botToken}/getChatMember`,
      {
        params: {
          chat_id: userId,
          user_id: userId,
        },
        timeout: 5000,
      }
    );

    if (response.data.ok && response.data.result) {
      const chatMember: TelegramChatMemberI = response.data.result;
      return chatMember.user;
    }

    return null;
  } catch (error: any) {
    if (axios.isAxiosError(error))
      if (
        error.response?.data?.error_code === 400 &&
        error.response?.data?.description?.includes("chat not found")
      )
        return null;

    throw error;
  }
}

export async function validateTelegramToken(
  token: string,
  botToken: string
): Promise<{
  isValid: boolean;
  userId?: number;
  userData?: TelegramUserI;
}> {
  try {
    const tokenParts = token.split("_");
    if (tokenParts.length !== 3 || !tokenParts[0].startsWith("token"))
      return { isValid: false };

    const userId = parseInt(tokenParts[1]);
    if (isNaN(userId)) return { isValid: false };

    const userData = await getTelegramUserInfo(userId, botToken);
    if (!userData) return { isValid: false };

    return {
      isValid: true,
      userId,
      userData,
    };
  } catch (error) {
    return { isValid: false };
  }
}
