import { ref, onMounted, getCurrentInstance } from "vue";
import { getAuthHeader } from '../../../utils/tokenUtils.ts';
import { requisicaoAPI } from '../../../api/comunicador.ts';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { logoBase64 } from "../../../assets/logoBase64";
import { useDocumentoMask } from "../../../utils/useDocumentoMask";

export function useRelatorioOrcamento() {
  const { proxy } = getCurrentInstance()!;
  const usuarios = ref<{ id: string; nome: string }[]>([]);
  const usuarioSelecionado = ref<string | null>(null);
  const dataInicial = ref<string>("");
  const dataFinal = ref<string>("");
  const relatorio = ref<any[]>([]);
  const isLoading = ref(false);
  const isVendedor = ref(false);
  const usuarioId = ref<string>("");

  const verificarPermissoes = () => {
    try {
      const authHeader = getAuthHeader();
      const token = authHeader.Authorization?.split(' ')[1];
      if (token) {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          isVendedor.value = payload.cargo === "Vendedor";
          usuarioId.value = payload.id;
          
          if (isVendedor.value) {
            usuarioSelecionado.value = usuarioId.value;
          }
        }
      }
    } catch (error) {
      console.error("Erro ao verificar permissões:", error);
    }
  };

  const buscarUsuarios = async () => {
    if (isVendedor.value) return;
    
    try {
      const res = await requisicaoAPI('usuarios/nomes', {
        method: 'GET',
        headers: getAuthHeader()
      });
      usuarios.value = res || [];
    } catch (e) {
      proxy?.$toast.error("Erro ao buscar usuários");
    }
  };

  const exportarRelatorio = async () => {
    if (!dataInicial.value || !dataFinal.value) {
      proxy?.$toast.error("Preencha a data inicial e final para exportar o relatório");
      return;
    }
    isLoading.value = true;
    try {
      const filtros: any = {};
      
      if (isVendedor.value) {
        filtros.usuarioId = usuarioId.value;
      } else if (usuarioSelecionado.value) {
        filtros.usuarioId = usuarioSelecionado.value;
      }
      
      if (dataInicial.value) filtros.dataInicial = dataInicial.value;
      if (dataFinal.value) filtros.dataFinal = dataFinal.value;

      const queryParams = new URLSearchParams(filtros).toString();
      const url = `orcamentos/relatorio/exportar?${queryParams}`;
      const res = await requisicaoAPI(url, {
        method: 'GET',
        headers: getAuthHeader()
      });
      relatorio.value = res || [];

      if (!relatorio.value.length) {
        proxy?.$toast.error("Nenhum dado para exportar!");
        return;
      }

      const primaryColor = "#f93910";
      const secondaryColor = "#f4f4f4";
      const lineColor = "#cccccc";

      const doc = new jsPDF();

      doc.addImage(logoBase64, "PNG", 165, 8, 30, 30);

      doc.setFontSize(18);
      doc.setTextColor(primaryColor);
      doc.text("Relatório de Orçamentos", 14, 20);

      doc.setFontSize(11);
      doc.setTextColor("#333");
      doc.text(
        `Período: ${formatarDataBrasileira(dataInicial.value)} até ${formatarDataBrasileira(dataFinal.value)}`,
        14,
        28
      );

      let y = 38;
      const pageHeight = 297;
      const bottomMargin = 20;

      relatorio.value.forEach((orcamento: any, idx: number) => {
        const alturaBase = 51;
        const alturaProdutos = orcamento.produtosOrcamento.length * 8;
        const alturaValorTotal = 16;
        const alturaExtra = 2;
        const blocoAltura = alturaBase + alturaProdutos + alturaValorTotal + alturaExtra;

        if (y + blocoAltura + bottomMargin > pageHeight) {
          doc.addPage();
          doc.addImage(logoBase64, "PNG", 165, 8, 30, 30);
          y = 38;
        }

        doc.setFillColor(secondaryColor);
        doc.roundedRect(10, y - 4, 190, blocoAltura, 4, 4, "F");

        doc.setFontSize(16);
        doc.setTextColor(primaryColor);
        doc.setFont("helvetica", "bold");
        doc.text(`Orçamento #${idx + 1}`, 14, y + 6);

        doc.setDrawColor(lineColor);
        doc.setLineWidth(0.7);
        doc.line(12, y + 10, 198, y + 10);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor("#222");
        const cliente = orcamento.cliente;
        const endereco = cliente?.endereco;
        const cidade = endereco?.cidade;
        const estado = cidade?.estado;

        const documentoCliente = cliente?.documento || "";
        const { mascaraDocumento } = useDocumentoMask(ref(documentoCliente));
        const docFormatado = aplicarMascaraDocumento(documentoCliente, mascaraDocumento.value);

        doc.text(`Cliente: ${cliente?.nome || ""}`, 14, y + 18);
        doc.text(`CPF/CNPJ: ${docFormatado}`, 100, y + 18);

        doc.text(
          `Endereço: ${endereco?.rua || ""}, Nº ${endereco?.numero || ""}, ${endereco?.bairro || ""}`,
          14,
          y + 24
        );
        doc.text(
          `CEP: ${endereco?.cep || ""} - ${cidade?.nome || ""} / ${estado?.nome || ""} (${estado?.uf || ""})`,
          14,
          y + 30
        );

        doc.setFontSize(10);
        doc.setTextColor("#333");
        doc.text(`Vendedor: ${orcamento.usuario?.nome || orcamento.usuarioNome || ""}`, 14, y + 36);

        doc.setDrawColor(lineColor);
        doc.line(12, y + 39, 198, y + 39);

        doc.setFontSize(10);
        doc.setTextColor(primaryColor);
        doc.text("Produtos:", 14, y + 45);

        let prodY = y + 51;
        doc.setTextColor("#333");
        orcamento.produtosOrcamento.forEach((po: any, i: number) => {
          doc.text(
            `${i + 1}. Modelo: ${po.produto?.modelo || ""} | Valor Unitário: R$ ${Number(po.valor_unitario).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
            16,
            prodY
          );
          prodY += 8;
        });

        doc.setDrawColor(lineColor);
        doc.line(12, prodY, 198, prodY);

        doc.setFontSize(11);
        doc.setTextColor(primaryColor);
        doc.text(
          `Valor Total: R$ ${Number(orcamento.valor_final).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          14,
          prodY + 8
        );

        y = prodY + 22;
      });

      doc.save(`relatorio-orcamentos-${dataInicial.value}_a_${dataFinal.value}.pdf`);

    } catch (e) {
      proxy?.$toast.error("Erro ao exportar relatório");
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    verificarPermissoes();
    buscarUsuarios();
  });

  return {
    usuarios,
    usuarioSelecionado,
    dataInicial,
    dataFinal,
    relatorio,
    isLoading,
    isVendedor,
    exportarRelatorio
  };
}

function aplicarMascaraDocumento(valor: string, mascara: string): string {
  let i = 0;
  return mascara.replace(/#/g, () => valor[i++] || "");
}

export function formatarDataBrasileira(data: string): string {
  if (!data) return "";
  const [ano, mes, dia] = data.split("-");
  if (!ano || !mes || !dia) return data;
  return `${dia}/${mes}/${ano}`;
}