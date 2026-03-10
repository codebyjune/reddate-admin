/// <reference types="vite/client" />

declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare const ElMessage: {
  success: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  error: (message: string) => void;
};

declare const ElMessageBox: {
  confirm: (
    message: string,
    title: string,
    options?: {
      confirmButtonText?: string;
      cancelButtonText?: string;
      type?: string;
    }
  ) => Promise<void>;
  alert: (message: string, title?: string) => Promise<void>;
  prompt: (message: string, title?: string) => Promise<{ value: string }>;
};
