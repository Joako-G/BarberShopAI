import { axioClient } from "./axioClient";
import type { LoginRequest, LoginResponse } from "../types/auth";


export const loginRequest = async (
    credential: LoginRequest
): Promise<LoginResponse> => {
    const response = await axioClient.post("/auth/login", credential);
    return response.data.data;
}