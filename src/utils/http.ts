import Axios, { AxiosPromise, AxiosRequestConfig } from "axios";

export class Http {
  public request<T>(params: AxiosRequestConfig): AxiosPromise<T> {
    return Axios.request(params);
  }
}

export const AXIOS_STATUS_CODES = {
    ALL: (s: number) => s === s,
    STATUS_2XX: (s: number) => s < 300,
    STATUS_3XX: (s: number) => s < 400,
    STATUS_4XX: (s: number) => s < 500,
};
