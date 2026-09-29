import api from "../api/client";

export interface AgoraTokenResponse {
  rtc: {
    token: string;
    appId: string;
    channel: string;
    uid: number;
  };
  rtm: {
    token: string;
    appId: string;
    uid: string;
  };
}

export const agoraService = {
  async getToken(
    bookingId: string,
    userId: number,
  ): Promise<AgoraTokenResponse> {
    const response = await api.get<AgoraTokenResponse>(
      `/agora/token?channel=class-${bookingId}&uid=${userId}`,
    );
    return response.data;
  },
};
