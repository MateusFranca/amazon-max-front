import { buscarCidadesPorEstado } from "./cidade";

export function requisicaoCidades<T = any>(opcoes: any, params: any): Promise<T> {
  
  if (opcoes.method === 'GET' && params.id_est) {
    return buscarCidadesPorEstado(params.id_est) as Promise<T>;
  }
  return Promise.resolve({} as T);
}