import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { logoBase64 } from "../../../assets/logoBase64.ts";
import { formatarDocumento, formatarTelefone, formatarDataBrasileira } from "../../../utils/formatters.ts";
import { formatToBRL } from "../../../utils/currencyMaskUtils.ts";

type ProdutoOrcamento = {
  id_pro_fk: string;
  valor_unitario: string;
  valor_final_unitario: number;
  quantidade: number;
};

type Cliente = {
  id: string;
  nome: string;
  documento: string;
  telefone: string;
};

type Orcamento = {
  id_cli_fk: string;
  valor_final: string;
  forma_pagamento: string;
  prazo: string;
  observacao: string;
  percentual_comissao: number;
  parcelas: number;
  codigo_finame: string;
};

type GerarPdfOrcamentoParams = {
  orcamento: Orcamento;
  produtosOrcamento: ProdutoOrcamento[];
  listaClientes: Cliente[];
  listaProdutos: { id: string; nome: string }[];
  nomeProduto: (id: string) => string;
};

export function gerarPdfOrcamento({
  orcamento,
  produtosOrcamento,
  listaClientes,
  nomeProduto,
  nomeArquivo // novo parâmetro opcional
}: GerarPdfOrcamentoParams & { nomeArquivo?: string }) {
  const doc = new jsPDF();

  const corPrincipal = "#FF6608";
  const corSecundaria = "#6C6B7F";

  doc.addImage(logoBase64, "PNG", 14, 10, 30, 22);

  doc.setFontSize(22);
  doc.setTextColor(corPrincipal);
  doc.text("Orçamento", 50, 22);

  doc.setDrawColor(corPrincipal);
  doc.setLineWidth(1.5);
  doc.line(50, 25, 196, 25);

  doc.setFontSize(12);
  doc.setTextColor(corSecundaria);
  const cliente = listaClientes.find(cli => cli.id === orcamento.id_cli_fk);
  const documentoFormatado = cliente?.documento ? formatarDocumento(cliente.documento) : 'N/A';
  const telefoneFormatado = cliente?.telefone ? formatarTelefone(cliente.telefone) : 'N/A';
  doc.text(`Cliente: ${cliente?.nome || 'Não informado'}`, 14, 35);
  doc.text(`Documento: ${documentoFormatado}`, 14, 42);
  doc.text(`Telefone: ${telefoneFormatado}`, 14, 49);

  if (orcamento.codigo_finame) {
    doc.text(`Código Finame: ${orcamento.codigo_finame}`, 14, 56);
  }

  doc.text(
    `Prazo do Orçamento: ${
      orcamento.prazo
        ? formatarDataBrasileira(orcamento.prazo)
        : 'N/A'
    }`,
    120,
    35
  );

  type FormaPagamento = 'nao_selecionado' | 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'transferencia' | 'boleto' | 'parcelado';

  const formaPagamentoMap: Record<FormaPagamento, string> = {
    'nao_selecionado': 'Não selecionado',
    'dinheiro': 'Dinheiro',
    'cartao_credito': 'Cartão de Crédito',
    'cartao_debito': 'Cartão de Débito',
    'pix': 'PIX',
    'transferencia': 'Transferência Bancária',
    'boleto': 'Boleto',
    'parcelado': 'Parcelado'
  };

  doc.text(
    `Forma de Pagamento: ${
      formaPagamentoMap[orcamento.forma_pagamento as FormaPagamento] || 'Não informado'
    }`,
    120,
    42
  );

  if (orcamento.parcelas && orcamento.parcelas > 1) {
    doc.text(`Quantidade de Parcelas: ${orcamento.parcelas}`, 120, 49);
  }

  const observacaoTexto = orcamento.observacao 
    ? orcamento.observacao 
    : 'N/A';

  let tableStartY = 77;
  if (observacaoTexto.length > 50) {
    doc.text('Observação:', 14, 70);
    const splitText = doc.splitTextToSize(observacaoTexto, 180);
    doc.text(splitText, 14, 77);
    const observationLines = splitText.length;
    tableStartY = 77 + (observationLines * 5);
  } else {
    doc.text(`Observação: ${observacaoTexto}`, 14, 70);
  }

  autoTable(doc, {
    startY: tableStartY,
    head: [[
      "Produto",
      "Quantidade",
      "Valor Unit.",
      "Preço Unit.",
      "Valor Total Unit."
    ]],
    body: produtosOrcamento.map(item => [
      nomeProduto(item.id_pro_fk),
      item.quantidade,
      formatToBRL(item.valor_unitario),
      formatToBRL(item.valor_final_unitario),
      formatToBRL(item.valor_final_unitario * item.quantidade)
    ]),
    theme: "grid",
    headStyles: {
      fillColor: [255, 102, 8],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 11,
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
      textColor: [63, 61, 86],
      fontSize: 10,
    },
    alternateRowStyles: {
      fillColor: [255, 238, 224],
    },
    styles: {
      cellPadding: 3,
      lineColor: [255, 102, 8],
      lineWidth: 0.2,
    },
    margin: { left: 14, right: 14 },
  });

  let finalY = (doc as any).lastAutoTable?.finalY || 70;

  doc.setFontSize(12);
  doc.setTextColor(corPrincipal);
  doc.text(`Valor Final:`, 14, finalY + 12);
  doc.setTextColor("#000");
  doc.text(formatToBRL(orcamento.valor_final), 50, finalY + 12);

  doc.setTextColor(corPrincipal);
  doc.text(`Comissão do Vendedor:`, 14, finalY + 19);
  doc.setTextColor("#000");
  doc.text(`${orcamento.percentual_comissao}%`, 63, finalY + 19);

  doc.setFontSize(14);
  doc.setTextColor(corPrincipal);
  doc.setFont('helvetica', 'bold');
  const dataEmissao = new Date();
  doc.text(`Data de emissão: ${dataEmissao.toLocaleDateString('pt-BR')}`, 14, finalY + 29)
  
  doc.setFont('helvetica', 'normal');

  // Geração do nome do arquivo
  let nomeArquivoFinal = nomeArquivo;
  if (!nomeArquivoFinal) {
    const cliente = listaClientes.find(cli => cli.id === orcamento.id_cli_fk);
    const nomeCliente = cliente?.nome || 'Cliente';
    const dataFormatada = new Date().toISOString().split('T')[0];
    nomeArquivoFinal = `Orcamento_${nomeCliente.replace(/\s+/g, '_')}_${dataFormatada}.pdf`;
  }

  return {
    blob: doc.output("blob"),
    nomeArquivo: nomeArquivoFinal
  };
}
