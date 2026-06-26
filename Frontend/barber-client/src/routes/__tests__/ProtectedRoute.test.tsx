import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "../../store/authStore";
import { ProtectedRoute } from "../ProtectedRoute";

function renderProtectedRoute() {
    render(
        <MemoryRouter initialEntries={["/private"]}>
            <Routes>
                <Route path="/login" element={<div>Login page</div>} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/private" element={<div>Private page</div>} />
                </Route>
            </Routes>
        </MemoryRouter>
    );
}

describe("ProtectedRoute", () => {
    beforeEach(() => {
        useAuthStore.setState({
            user: null,
            profile: null,
            token: null,
            isAuthenticated: false,
        });
    });

    it("redirects unauthenticated users to login", () => {
        renderProtectedRoute();
        expect(screen.getByText("Login page")).toBeInTheDocument();
        expect(screen.queryByText("Private page")).not.toBeInTheDocument();
    });

    it("renders private content for authenticated users", () => {
        useAuthStore.setState({
            token: "token",
            isAuthenticated: true,
        });

        renderProtectedRoute();
        expect(screen.getByText("Private page")).toBeInTheDocument();
    });
});
