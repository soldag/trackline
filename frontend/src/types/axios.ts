import "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    retry?: boolean;
  }
}
