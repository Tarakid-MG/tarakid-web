import api from "../api/client";
import type {
  AuthResponse,
  MessageResponse,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from "../types/auth";

export const authService = {
  async login(dto: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", dto);
    return response.data;
  },

  async register(dto: RegisterDto): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>("/auth/register", dto);
    return response.data;
  },

  async forgotPassword(email: string): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>("/auth/forgot-password", {
      email,
    });
    return response.data;
  },

  async resetPassword(dto: ResetPasswordDto): Promise<MessageResponse> {
    const { token, password } = dto;
    const response = await api.post<MessageResponse>(
      `/auth/reset-password?token=${token}`,
      { password },
    );
    return response.data;
  },

  async verifyEmail(token: string): Promise<MessageResponse> {
    const response = await api.get<MessageResponse>(
      `/auth/verify?token=${token}`,
    );
    return response.data;
  },

  async resendVerification(email: string): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>(
      "/auth/resend-verification",
      { email },
    );
    return response.data;
  },
};
