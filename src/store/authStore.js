"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../lib/api";

const useAuthStore = create(
  persist(
    (set) => ({
      user:         null,
      accessToken:  null,
      refreshToken: null,
      isLoggedIn:   false,

      // OTP Login
      sendOTP: async (phone) => {
        const res = await api.post("/auth/send-otp", { phone });
        return res.data;
      },

      verifyOTP: async (phone, otp, name) => {
        const res = await api.post("/auth/verify-otp", { phone, otp, name });
        const { user, accessToken, refreshToken } = res.data.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        set({ user, accessToken, refreshToken, isLoggedIn: true });
        return res.data;
      },

      // Store Owner Login
      storeLogin: async (email, password) => {
        const res = await api.post("/auth/store/login", { email, password });
        const { user, accessToken, refreshToken } = res.data.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        set({ user, accessToken, refreshToken, isLoggedIn: true });
        return res.data;
      },

      // Logout
      logout: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set({ user: null, accessToken: null, refreshToken: null, isLoggedIn: false });
        window.location.href = "/";
      },

      // Update User
      setUser: (user) => set({ user, isLoggedIn: true }),
    }),
    {
      name:    "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user:         state.user,
        accessToken:  state.accessToken,
        refreshToken: state.refreshToken,
        isLoggedIn:   state.isLoggedIn,
      }),
    }
  )
);

export default useAuthStore;