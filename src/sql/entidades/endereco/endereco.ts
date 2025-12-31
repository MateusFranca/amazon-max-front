import { DateTime } from 'luxon';
import { gerarUUID } from '../../../utils/gerarUUID';
import { abrirConexao } from '../../banco';

export interface Endereco {
    id: string;
    rua: string;
    bairro: string;
    cep: string;
    numero: string;
    complemento?: string | null;
    id_cid_fk: string;
    criadoEm: string;
    atualizadoEm: string;
    deletadoEm?: string | null;
}

export async function criarTabelaEndereco(): Promise<void> {
    const db = await abrirConexao();
    await db.execute(`
        CREATE TABLE IF NOT EXISTS enderecos (
            id TEXT PRIMARY KEY NOT NULL,
            rua TEXT NOT NULL,
            bairro TEXT NOT NULL,
            cep TEXT NOT NULL,  
            numero TEXT NOT NULL,
            complemento TEXT,
            id_cid_fk TEXT NOT NULL,
            criadoEm TEXT NOT NULL,
            atualizadoEm TEXT NOT NULL,
            deletadoEm TEXT
        );
    `);
}

export async function inserirEndereco(endereco: Endereco): Promise<{ id: string }> {
    const db = await abrirConexao();
    const id = gerarUUID();
    await db.run(
        `INSERT INTO enderecos (
            id, rua, bairro, cep, numero, complemento,
            id_cid_fk, criadoEm, atualizadoEm, deletadoEm
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            id,
            endereco.rua,
            endereco.bairro,
            endereco.cep,
            endereco.numero,
            endereco.complemento ?? null,
            endereco.id_cid_fk,
            DateTime.now().setZone('America/Porto_Velho').toISO(),
            DateTime.now().setZone('America/Porto_Velho').toISO(),
            endereco.deletadoEm ?? null,
        ]
    );

    return { id };
}

export async function buscarEnderecos(): Promise<{ dado: Endereco[], meta?: any }> {
    const db = await abrirConexao();
    const result = await db.query('SELECT * FROM enderecos');

    const enderecosArray = (result.values || []).map((row: any) => ({
        ...row,
    }));

    return {
        dado: enderecosArray,
        meta: {
            total_itens: enderecosArray.length,
            total_paginas: 1,
            pagina_atual: 1,
            itens_por_pagina: enderecosArray.length
        }
    };
}

export async function sincronizarEnderecos(enderecos: Endereco[]): Promise<void> {
    if (!enderecos?.length) return;
    const db = await abrirConexao();

    const stmt = `INSERT OR REPLACE INTO enderecos (
        id, rua, bairro, cep, numero, complemento,
        id_cid_fk, criadoEm, atualizadoEm, deletadoEm
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    for (const endereco of enderecos) {
        await db.run(stmt, [
            endereco.id,
            endereco.rua,
            endereco.bairro,
            endereco.cep,
            endereco.numero,
            endereco.complemento ?? null,
            endereco.id_cid_fk,
            endereco.criadoEm,
            endereco.atualizadoEm,
            endereco.deletadoEm ?? null,
        ]);
    }
}
