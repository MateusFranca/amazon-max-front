export function formatarCep(cep: string): string {
    if (!cep) return '';
    return cep.replace(/\D/g, '').replace(/^(\d{5})(\d{3})$/, '$1-$2');
}

export function formatarCpf(cpf: string): string {
    if (!cpf) return '';
    return cpf.replace(/\D/g, '').replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

export function formatarCnpj(cnpj: string): string {
    if (!cnpj) return '';
    return cnpj.replace(/\D/g, '').replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export function formatarTelefone(telefone: string): string {
    if (!telefone) return '';
    const cleaned = telefone.replace(/\D/g, '');
    if (cleaned.length === 11) {
        return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (cleaned.length === 10) {
        return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    }
    return telefone;
}

export function formatarDataBrasileira(data: string): string {
    if (!data) return '';
    const date = new Date(data);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

export function formatarEndereco(item: any): string {
    const rua = item.endereco?.rua ?? '';
    const numero = item.endereco?.numero ?? '';
    const bairro = item.endereco?.bairro ?? '';
    const cidade = item.endereco?.cidade?.nome ?? '';
    const estado = item.endereco?.cidade?.estado?.uf ?? '';
    const cep = formatarCep(item.endereco?.cep ?? '');
  
    return `${rua}, ${bairro}, ${numero} - ${cidade}/${estado} - CEP: ${cep}`;
}

export function formatarFormaPagamento(formaPagamento: string): string {
    const formasPagamento = {
        'nao_selecionado': 'Não selecionado',
        'dinheiro': 'Dinheiro',
        'cartao_credito': 'Cartão de Crédito',
        'cartao_debito': 'Cartão de Débito',
        'pix': 'PIX',
        'transferencia': 'Transferência Bancária',
        'boleto': 'Boleto',
        'parcelado': 'Parcelado'
    };

    return formasPagamento[formaPagamento as keyof typeof formasPagamento] || formaPagamento;
}

export function formatarMoeda(value: number | string): string {
    if (value === null || value === undefined || value === '') return '';
    return Number(value)
        .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarDocumento(documento: string): string {
    if (!documento) return '';
    const apenasNumeros = documento.replace(/\D/g, '');
    if (apenasNumeros.length === 11) {
        return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (apenasNumeros.length === 14) {
        return apenasNumeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return documento;
}


