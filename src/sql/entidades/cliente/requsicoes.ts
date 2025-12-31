import { buscarClientes, inserirCliente } from "./cliente";

export function requisicaoClientes<T = any>(opcoes: any): Promise<T> {
  if (opcoes.method === 'GET') {
    return buscarClientes() as Promise<T>;
  } 

  if (opcoes.method === 'POST') {
    return inserirCliente(opcoes.data) as Promise<T>;
  }

  return Promise.resolve({} as T);
}