import { defineStore } from "pinia";
import { ref, computed } from "vue";
import request from "@/utils/request";

interface User {
  id: number;
  username: string;
  name: string | null;
  phone: string | null;
  role: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

export const useAuthStore = defineStore("auth", () => {
  // 从 localStorage 恢复用户信息
  const getStoredUser = (): User | null => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  };

  const user = ref<User | null>(getStoredUser());
  const token = ref<string | null>(localStorage.getItem("token"));

  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === "admin");

  // 登录
  const login = async (username: string, password: string) => {
    const data = await request.post<LoginResponse>("/auth/login", {
      username,
      password,
    });

    user.value = data.user;
    token.value = data.token;
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
  };

  // 注册
  const register = async (userData: {
    username: string;
    password: string;
    name?: string;
    phone?: string;
  }) => {
    const data = await request.post<LoginResponse>("/auth/register", userData);

    user.value = data.user;
    token.value = data.token;
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
  };

  // 获取用户信息
  const fetchProfile = async () => {
    if (!token.value) return;

    try {
      const data = await request.get<User>("/auth/profile");
      user.value = data;
      localStorage.setItem("user", JSON.stringify(data));
    } catch {
      logout();
    }
  };

  // 登出
  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // 初始化时获取用户信息（从服务器同步最新数据）
  if (token.value) {
    fetchProfile();
  }

  return {
    user,
    token,
    isLoggedIn,
    isAdmin,
    login,
    register,
    fetchProfile,
    logout,
  };
});
