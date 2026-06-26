import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "../../store/authStore";
import { getAuthorizationHeaders } from "../axioClient";

describe("authorization headers", () => {
    beforeEach(() => {
        useAuthStore.setState({
            user: null,
            profile: null,
            token: null,
            isAuthenticated: false,
        });
    });

    it("reads the current token for every request", () => {
        useAuthStore.setState({ token: "first-token" });
        expect(getAuthorizationHeaders()).toEqual({
            Authorization: "Bearer first-token",
        });

        useAuthStore.setState({ token: "renewed-token" });
        expect(getAuthorizationHeaders()).toEqual({
            Authorization: "Bearer renewed-token",
        });
    });

    it("fails clearly when the session token is missing", () => {
        expect(() => getAuthorizationHeaders()).toThrow(
            "La sesión no está disponible"
        );
    });
});
