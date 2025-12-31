import { buscarTodosEstados } from "./estado";

export function requisicaoEstados<T = any>(opcoes: any): Promise<T> {
  if (opcoes.method === 'GET') {
    return buscarTodosEstados() as Promise<T>;
  } 

  return Promise.resolve({} as T);
}