import axios, { AxiosError, AxiosRequestConfig, Method } from "axios";
import { StringUtils } from "@/utils/StringUtils";

const Host = "/"

const DefaultTimeout = 120000;

export type Itf<I = any, O = any> = (data?: I, headers?) => Promise<O>

export function post<I = any, O = any>(
  p1: string, p2?: string): Itf<I, O> {
  const opt = makeInterfaceOption("POST", p1, p2);
  return (d, h) => request(new Interface(opt), d, h);
}
export function get<I = any, O = any>(
  p1: string, p2?: string): Itf<I, O> {
  const opt = makeInterfaceOption("GET", p1, p2);
  return (d, h) => request(new Interface(opt), d, h)
}
export function put<I = any, O = any>(
  p1: string, p2?: string): Itf<I, O> {
  const opt = makeInterfaceOption("PUT", p1, p2);
  return (d, h) => request(new Interface(opt), d, h)
}
export function del<I = any, O = any>(
  p1: string, p2?: string): Itf<I, O> {
  const opt = makeInterfaceOption("DELETE", p1, p2);
  return (d, h) => request(new Interface(opt), d, h)
}

function makeInterfaceOption(method: Method, hostOrRoute: string, route?: string): InterfaceOptions {
  return typeof route === "string" ?
    { method, host: hostOrRoute, route } :
    { method, route: hostOrRoute };
}

export class RequestError<T = any> extends Error {

  status: number
  code: number
  message: string
  payload?: T

  get name() {
    const code = this.status >= 200 && this.status < 300 ?
      this.code : this.status;
    return `Request Error: ${code}`;
  }

  constructor(status, code, message, payload?: T) {
    super();
    this.status = status;
    this.code = code;
    this.message = message;
    this.payload = payload;
  }
}

export interface InterfaceOptions {
  method: Method;
  host?: string;
  route: string;
}

export class Interface implements InterfaceOptions {

  public method: Method;
  public host: string;
  public route: string;

  public get isGet() { return this.method.toUpperCase() == 'GET' }

  constructor(options: InterfaceOptions) {
    this.method = options.method
    this.host = options.host || Host
    this.route = options.route
  }
}

const customHeader = {};

/**
 * 发起请求
 */
export async function request<T = any>(
  interface_: Interface, data: any = {}, headers: any = {}): Promise<T> {

  headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": 69420,
    ...customHeader, ...headers
  }

  let sendData, url = interface_.route;
  // TODO: 拓展表单的情况
  if (data instanceof FormData) sendData = data;
  else {
    sendData = { ...data };
    url = StringUtils.fillData2StrInUrl(url, sendData); // 填充URL里面的参数
  }

  url = (interface_.host + url).replace(/(^|[^:])\/{2,}/g, "/");

  const config: AxiosRequestConfig = {
    // baseURL: interface_.host,
    url,
    method: interface_.method, headers,
    timeout: DefaultTimeout
  }
  if (interface_.isGet) config.params = sendData;
  else config.data = sendData

  let response
  try {
    response = await axios.request(config)
  } catch (e) {
    if (e instanceof AxiosError) response = e.response
    else throw e;
  }

  const status = response?.status;
  const code = response?.data?.code || 0;
  const res = response?.data?.data ||
    "payload" in response?.data ?
    response?.data.payload : response?.data;

  if (status >= 200 && status < 300 &&
    code === 0 || code === 200) return res;

  const message = response.data?.message ||
    response.data?.reason || response.statusText;
  // Toaster("error", message)
  throw new RequestError(status, code, message, res);
}
