import { API_REMOTA_URL } from "../../api-config.ts";
import { getCurrentInstance } from 'vue';
import axios from 'axios';

export async function verificarHealth(): Promise<boolean> {
  const instance = getCurrentInstance();
  const global = instance?.appContext.config.globalProperties;

  try {
    const resposta = await axios.get(`${API_REMOTA_URL}/health`, { timeout: 10000 });

    const online = resposta.status >= 200 && resposta.status < 300;

    if (global) {
      global.$apiOnline = online;
    }

    return online;
  } catch (error: unknown) {
    if (
      axios.isAxiosError(error) &&
      (error.code === 'ECONNABORTED' || error.code === 'canceled')
    ) {
    } else {
    }
    if (global) {
      global.$apiOnline = false;
    }
    return false;
  }
}
