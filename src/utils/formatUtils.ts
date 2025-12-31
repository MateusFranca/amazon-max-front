export function formatarDocumento(documento: string): string {
    if (!documento) return "";

    const apenasNumeros = documento.replace(/\D/g, "");

    if (apenasNumeros.length === 11) {
        return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (apenasNumeros.length === 14) {
        return apenasNumeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }

    return documento;
}
