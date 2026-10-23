import { api } from "@/lib/api-client";

export interface HealthStatus {
  status: string;
  timestamp?: string;
  environment?: string;
}

export const healthService = {
  /** GET /health — liveness probe (public). */
  ping(): Promise<HealthStatus> {
    return api.get<HealthStatus>("/health", { public: true });
  },
};
