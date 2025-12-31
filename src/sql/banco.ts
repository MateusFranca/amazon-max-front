import { SQLiteConnection, CapacitorSQLite, SQLiteDBConnection } from '@capacitor-community/sqlite';
// import { criarTabelaUsuario } from './entidades/usuario/usuario';
import { criarTabelaCidade } from './entidades/cidade/cidade';
import { criarTabelaEstado } from './entidades/estado/estado';
import { requisicaoAPI } from '../api/comunicador';
import { getAuthHeader } from '../utils/tokenUtils';
import { criarTabelaEndereco } from './entidades/endereco/endereco';
import { BANCO_LOCAL } from '../../api-config';
import { criarTabelaProduto, sincronizarProdutos } from './entidades/produto/produto';

const sqlite = new SQLiteConnection(CapacitorSQLite);

let conexaoAberta: SQLiteDBConnection | null = null;
let openDBPromise: Promise<SQLiteDBConnection> | null = null;

export async function inicializarBanco(): Promise<void> {
  try {
    if (
      typeof (window as any).Capacitor === 'undefined' ||
      !(window as any).Capacitor.isPluginAvailable ||
      !(window as any).Capacitor.isPluginAvailable('CapacitorSQLite')
    ) {
      console.error('CapacitorSQLite plugin is not available or not implemented on this platform.');

      return;
    }

    await criarTabelaEstado();
    await criarTabelaCidade();
    await criarTabelaEndereco();
    await criarTabelaProduto();
    // await criarTabelaUsuario();

  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
  }
}

export async function sincronizarBanco(): Promise<void> {
  
  const produtos = await requisicaoAPI('produtos', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
  });
  
    await sincronizarProdutos(produtos);
}

export async function abrirConexao(): Promise<SQLiteDBConnection> {
  
  if (conexaoAberta) {
        return conexaoAberta;
    }
    if (openDBPromise) {
        return openDBPromise;
    }

    openDBPromise = (async () => {
        try {
            const isConn = await sqlite.isConnection(BANCO_LOCAL, false);
            if (isConn.result) {
                conexaoAberta = await sqlite.retrieveConnection(BANCO_LOCAL, false);
                if (conexaoAberta && !conexaoAberta.isDBOpen()) {
                    await conexaoAberta.open();
                }
                return conexaoAberta;
            }
            try {
                conexaoAberta = await sqlite.createConnection(BANCO_LOCAL, false, 'no-encryption', 1, false);
                await conexaoAberta.open();
                return conexaoAberta;
            } catch (err: any) {
                if (typeof err?.message === 'string' && err.message.includes('already exists')) {
                    try {
                        await sqlite.closeConnection(BANCO_LOCAL, false);
                    } catch {
                    }
                    conexaoAberta = await sqlite.createConnection(BANCO_LOCAL, false, 'no-encryption', 1, false);
                    await conexaoAberta.open();
                    return conexaoAberta;
                }
                conexaoAberta = null;
                openDBPromise = null;
                throw err;
            }
        } finally {
            openDBPromise = null;
        }
    })();

    return openDBPromise;
}

export async function fecharConexao(): Promise<void> {
    if (conexaoAberta) {
        try {
            await sqlite.closeConnection(BANCO_LOCAL, false);
        } catch (err) {
        }
        conexaoAberta = null;
    }
}