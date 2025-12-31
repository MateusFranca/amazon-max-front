import insertEstadosSQL from './insert_estados.sql?raw';
import { abrirConexao } from '../../banco';



export async function criarTabelaEstado(): Promise<void> {
    const db = await abrirConexao();
    await db.execute(`
        CREATE TABLE IF NOT EXISTS estados (
            id INTEGER PRIMARY KEY NOT NULL,
            uf TEXT NOT NULL,
            nome TEXT NOT NULL
        );
    `);
}

export async function inserirEstados(): Promise<void> {
    const db = await abrirConexao();
    await db.execute(insertEstadosSQL);
}

export async function buscarTodosEstados(): Promise<any[]> {
    const db = await abrirConexao();
    const response = await db.query('SELECT * FROM estados');

    return response.values ?? [];
}
