import { Capacitor } from '@capacitor/core';
import { verificarHealth } from '../tasks/health.ts';
import { API_BASE_URL, API_REMOTA_URL } from "../../api-config.ts";
import { requisicaoPorEndpoint } from '../sql/requisicaoPorEntidade.ts';
import axios, { AxiosRequestConfig } from 'axios';

async function obterURLBase(): Promise<string> {
  const estaNoTauri = !!window.__TAURI__;
  const estaNoMobile = Capacitor.isNativePlatform();
  const online = await verificarHealth();

  if (estaNoMobile) {
    if (online) {
      return API_REMOTA_URL;
    }
    return 'sqlite://';
  }

  if (!online && estaNoTauri) {
    return API_BASE_URL;
  }

  return API_REMOTA_URL;
}


export async function requisicaoAPI<T = any>(
  endpoint: string,
  opcoes: AxiosRequestConfig = {},
  params?: Record<string, string | number | boolean>
): Promise<T> {
  const baseUrl = await obterURLBase();

  if (baseUrl === 'sqlite://') {
    return requisicaoPorEndpoint<T>(endpoint, {
      ...opcoes,
      params
    });
  }

  const url = `${baseUrl}/${endpoint}`;

  const resposta = await axios.request<T>({
    url,
    method: opcoes.method,
    ...opcoes,
    params,
  });

  return resposta.data;
}
