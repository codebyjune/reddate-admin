import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

// 创建 axios 实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器 - 自动携带 token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 统一处理响应和错误
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || "请求失败";
    return Promise.reject(new Error(message));
  }
);

// 封装 request 对象，提供正确的类型推断
const request = {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return axiosInstance.get(url, config) as Promise<T>;
  },
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return axiosInstance.post(url, data, config) as Promise<T>;
  },
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return axiosInstance.put(url, data, config) as Promise<T>;
  },
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return axiosInstance.delete(url, config) as Promise<T>;
  },
};

export default request;
