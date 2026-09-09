import { api, tokenStore } from "@/lib/api-client";
import type {
  AuthTokens,
  ApiUser,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "@/lib/api-types";

export const authService = {
  /** POST /auth/register */
  async register(payload: RegisterPayload): Promise<AuthTokens> {
    const data = await api.post<AuthTokens>("/auth/register", payload, {
      public: true,
    });
    tokenStore.setAccess(data.accessToken);
    tokenStore.setRefresh(data.refreshToken);
    return data;
  },

  /** POST /auth/login */
  async login(payload: LoginPayload): Promise<AuthTokens> {
    const data = await api.post<AuthTokens>("/auth/login", payload, {
      public: true,
    });
    tokenStore.setAccess(data.accessToken);
    tokenStore.setRefresh(data.refreshToken);
    return data;
  },

  /** POST /auth/logout */
  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } finally {
      // Always clear local tokens even if the request fails
      tokenStore.clear();
    }
  },

  /** GET /auth/me */
  async me(): Promise<ApiUser> {
    return api.get<ApiUser>("/auth/me");
  },

  /** POST /auth/forgot-password */
  async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    await api.post("/auth/forgot-password", payload, { public: true });
  },

  /** POST /auth/reset-password */
  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await api.post("/auth/reset-password", payload, { public: true });
  },
};
