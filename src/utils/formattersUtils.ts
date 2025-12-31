export function formatarCep(cep: string): string {
    if (!cep) return '';
    return cep.replace(/\D/g, '').replace(/^(\d{5})(\d{3})$/, '$1-$2');
}

export function formatarDocumentoCpfCnpj(documento: string): string {
    if (!documento) return '';
  
    const cleaned = documento.replace(/\D/g, '');
  
    if (cleaned.length === 11) {
      return cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    }
  
    if (cleaned.length === 14) {
      return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    }
  
    return documento;
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
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

export function formatarEndereco(item: any): string {
    const endereco = item.endereco || item;
    
    if (!endereco) return "Endereço não disponível";
    
    const rua = endereco.rua || "";
    const numero = endereco.numero || "";
    const bairro = endereco.bairro || "";
    const complemento = endereco.complemento ? `, ${endereco.complemento}` : "";
    const cep = endereco.cep ? `CEP: ${endereco.cep}` : "";
    
    if (!rua && !numero && !bairro) {
      return "Endereço incompleto";
    }
    
    return `${rua}, ${numero}${complemento} - ${bairro} ${cep}`.trim();
}
