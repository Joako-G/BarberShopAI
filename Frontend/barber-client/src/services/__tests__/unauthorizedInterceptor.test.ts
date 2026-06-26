import {
    AxiosError,
    AxiosHeaders,
    type AxiosAdapter,
} from "axios";
import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "../../store/authStore";
import {
    axioClient,
    SESSION_EXPIRED_STORAGE_KEY,
} from "../axioClient";

function unauthorizedAdapter(): AxiosAdapter {
    return async (config) => {
        const headers = AxiosHeaders.from(config.headers);
        const response = {
            data: {},
            status: 401,
            statusText: "Unauthorized",
            headers: {},
            config: { ...config, headers },
        };

        throw new AxiosError(
            "Unauthorized",
            "ERR_BAD_REQUEST",
            response.config,
            undefined,
            response
        );
    };
}

describe("401 response interceptor", () => {
    beforeEach(() => {
        useAuthStore.setState({
            user: null,
            profile: null,
            token: "expired-token",
            isAuthenticated: true,
        });
        sessionStorage.clear();
    });

    it("logs out after an authenticated request returns 401", async () => {
        await expect(
            axioClient.get("/appointments", {
                headers: { Authorization: "Bearer expired-token" },
                adapter: unauthorizedAdapter(),
            })
        ).rejects.toBeInstanceOf(AxiosError);

        expect(useAuthStore.getState()).toMatchObject({
            token: null,
            isAuthenticated: false,
        });
        expect(sessionStorage.getItem(SESSION_EXPIRED_STORAGE_KEY)).toBe("true");
    });

    it("does not log out when login itself returns 401", async () => {
        await expect(
            axioClient.post("/auth/login", {}, {
                adapter: unauthorizedAdapter(),
            })
        ).rejects.toBeInstanceOf(AxiosError);

        expect(useAuthStore.getState()).toMatchObject({
            token: "expired-token",
            isAuthenticated: true,
        });
        expect(sessionStorage.getItem(SESSION_EXPIRED_STORAGE_KEY)).toBeNull();
    });

    it("does not alter auth state for a public unauthenticated 401", async () => {
        useAuthStore.setState({
            token: null,
            isAuthenticated: false,
        });

        await expect(
            axioClient.get("/services", {
                adapter: unauthorizedAdapter(),
            })
        ).rejects.toBeInstanceOf(AxiosError);

        expect(useAuthStore.getState()).toMatchObject({
            token: null,
            isAuthenticated: false,
        });
        expect(sessionStorage.getItem(SESSION_EXPIRED_STORAGE_KEY)).toBeNull();
    });
});
