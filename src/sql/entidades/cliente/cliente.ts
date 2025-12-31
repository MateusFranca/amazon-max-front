import { DateTime } from 'luxon';
import { gerarUUID } from '../../../utils/gerarUUID';
import { abrirConexao } from '../../banco';

export interface Cliente {
    id: string;
    nome: string;
    documento: string;
    telefone: string;
    nascimento?: string | null;
    criadoEm: string;
    atualizadoEm: string;
    deletadoEm?: string | null;
    id_end_fk: string;
}

export interface BuscarClientesOpcoes {
    pagina?: number;
    limite?: number;
    filtroBusca?: string;
}

export async function criarTabelaCliente(): Promise<void> {
    // const db = await abrirConexao();
//     const criar = await db.execute(`
//     CREATE TABLE IF NOT EXISTS clientes (
//       id TEXT PRIMARY KEY NOT NULL,
//       nome TEXT NOT NULL,
//       documento TEXT NOT NULL,
//       telefone TEXT NOT NULL,
//       nascimento TEXT,
//       criadoEm TEXT NOT NULL,
//       atualizadoEm TEXT NOT NULL,
//       deletadoEm TEXT,
//       id_end_fk TEXT NOT NULL
//     );
//   `);

    // const a = await db.execute(`
    //   INSERT INTO clientes (
    //     id,
    //     nome,
    //     documento,
    //     telefone,
    //     nascimento,
    //     criadoEm,
    //     atualizadoEm,
    //     id_end_fk
    //   ) VALUES (
    //     'a1d77a0a-bc05-4f5c-b8ee-44d2f900260e',
    //     'Rossini Carvalho',
    //     '12345678901',
    //     '69999999999',
    //     '1990-01-01',
    //     0,
    //     datetime('now'),
    //     datetime('now'),
    //     'endereco-uuid-exemplo'
    //   );
    // `);
}

export async function inserirCliente(cliente: Cliente): Promise<void> {
    const db = await abrirConexao();

    await db.run(
        `INSERT INTO clientes (
      id, nome, documento, telefone, nascimento,
       criadoEm, atualizadoEm, deletadoEm, id_end_fk
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            gerarUUID(),
            cliente.nome,
            cliente.documento,
            cliente.telefone,
            cliente.nascimento ?? null,
            DateTime.now().setZone('America/Porto_Velho').toISO(),
            DateTime.now().setZone('America/Porto_Velho').toISO(),
            cliente.deletadoEm ?? null,
            cliente.id_end_fk
        ]
    );
}

export async function buscarClientes(): Promise<{ dado: Cliente[], meta?: any }> {
    const db = await abrirConexao();
    const result = await db.query('SELECT * FROM clientes');

    const clientesArray = (result.values || []).map((row: any) => ({
        ...row,
    }));

    return {
        dado: clientesArray,
        meta: {
            total_itens: clientesArray.length,
            total_paginas: 1,
            pagina_atual: 1,
            itens_por_pagina: clientesArray.length
        }
    };
}

// Não existe autenticação para cliente, então remova a função de autenticação

export async function sincronizarClientes(clientes: Cliente[]): Promise<void> {
    if (!clientes?.length) return;
    const db = await abrirConexao();

    const stmt = `INSERT OR REPLACE INTO clientes (
      id, nome, documento, telefone, nascimento,
      criadoEm, atualizadoEm, deletadoEm, id_end_fk
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    for (const cliente of clientes) {
        await db.run(stmt, [
            cliente.id,
            cliente.nome,
            cliente.documento,
            cliente.telefone,
            cliente.nascimento ?? null,
            cliente.criadoEm,
            cliente.atualizadoEm,
            cliente.deletadoEm ?? null,
            cliente.id_end_fk
        ]);
    }
}
