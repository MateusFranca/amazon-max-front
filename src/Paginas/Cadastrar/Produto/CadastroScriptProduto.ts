import { reactive, computed, getCurrentInstance, toRef, onMounted, watch } from "vue";
import useValidate from '@vuelidate/core';
import { required, helpers, maxLength } from '@vuelidate/validators';
import { requisicaoAPI } from '../../../api/comunicador.ts';
import { useCurrencyMask } from '../../../utils/currencyMaskUtils.ts';
import { getIdFromToken, getAuthHeader } from '../../../utils/tokenUtils.ts';
import { handleFileUpload, removeImage } from '../../../utils/imageUtils.ts';
import { useRouter, useRoute } from 'vue-router'

export function cadastroScriptProduto(id: string|number|null) {
  const route = useRoute();
  const router = useRouter();
  const { proxy } = getCurrentInstance()!
  const isEditing = computed(() => !!id)

  const state = reactive({
    formularioProduto: {
      marca: "",
      modelo: "",
      valor_completo: "",
      valor_medio: "",
      valor_reduzido: "",
      valor_exclusivo: "",
      foto: [] as { file: File | null; url?: string; nome?: string }[],
      descricao_tecnica: "",
    },
    isUploading: false,
  });

  const rules = computed(() => ({
    formularioProduto: {
      marca: { required: helpers.withMessage("Por favor, preencha a marca", required) },
      modelo: { required: helpers.withMessage("Por favor, preencha o modelo", required) },
      valor_completo: { required: helpers.withMessage("Por favor, preencha o valor completo", required) },
      valor_medio: { required: helpers.withMessage("Por favor, preencha o valor médio", required) },
      valor_reduzido: { required: helpers.withMessage("Por favor, preencha o valor reduzido", required) },
      valor_exclusivo: { required: helpers.withMessage("Por favor, preencha o valor exclusivo", required) },
      foto: {
        required: helpers.withMessage("Por favor, adicione ao menos uma foto", (val) => Array.isArray(val) && val.length > 0),
        imageType: helpers.withMessage("Apenas imagens JPEG, PNG, SVG ou JPG são permitidas", (val) => {
          if (!Array.isArray(val) || val.length === 0) return true;
          const allowed = ["image/jpeg", "image/png", "image/svg+xml", "image/jpg"];
          return val.every((item) => !item.file || allowed.includes(item.file.type));
        }),
        maxFiles: helpers.withMessage("O limite é de 6 imagens", (val) => Array.isArray(val) && val.length <= 6),
      },
      descricao_tecnica: {
        required: helpers.withMessage("Por favor, preencha a descrição técnica", required),
        maxLength: helpers.withMessage("A descrição não pode ter mais de 250 caracteres", maxLength(250)),
      },
    },
  }));

  // Máscaras para os campos de valor
  const valorCompletoRef = toRef(state.formularioProduto, 'valor_completo');
  const valorMedioRef = toRef(state.formularioProduto, 'valor_medio');
  const valorReduzidoRef = toRef(state.formularioProduto, 'valor_reduzido');
  const valorExclusivoRef = toRef(state.formularioProduto, 'valor_exclusivo');
  useCurrencyMask(valorCompletoRef);
  useCurrencyMask(valorMedioRef);
  useCurrencyMask(valorReduzidoRef);
  useCurrencyMask(valorExclusivoRef);

  const v$ = useValidate(rules, state);

  const carregarProduto = async () => {
    try {
      const data = await requisicaoAPI(`produtos/${id}`, {
        method: 'GET',
        headers: getAuthHeader()
      });

      let fotoArrayRaw: Array<{ urlImagem: string; nomeImagem?: string }> = [];
      if (Array.isArray(data.foto)) {
        fotoArrayRaw = data.foto;
      } else if (typeof data.foto === 'string') {
        try {
          fotoArrayRaw = JSON.parse(data.foto);
        } catch {
          fotoArrayRaw = [];
        }
      }

      state.formularioProduto.marca = data.marca;
      state.formularioProduto.modelo = data.modelo;
      state.formularioProduto.valor_completo = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(data.valor_completo ?? 0);
      state.formularioProduto.valor_medio = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(data.valor_medio ?? 0);
      state.formularioProduto.valor_reduzido = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(data.valor_reduzido ?? 0);
      state.formularioProduto.valor_exclusivo = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(data.valor_exclusivo ?? 0);
      state.formularioProduto.descricao_tecnica = data.descricao_tecnica;

      state.formularioProduto.foto = fotoArrayRaw.map(f => ({
        file: null as File | null,
        url: f.urlImagem,
        nome: f.nomeImagem || f.urlImagem.split('/').pop()!
      }));

      v$.value.$reset();
    } catch (err) {
      proxy?.$toast.error('Erro ao carregar produto');
      console.error(err);
    }
  };

  const enviarFormularioProduto = async () => {
    try {
      const dados = {
        marca: state.formularioProduto.marca,
        modelo: state.formularioProduto.modelo,
        valor_completo: state.formularioProduto.valor_completo.replace(/[R$\s.]/g, '').replace(',', '.'),
        valor_medio: state.formularioProduto.valor_medio.replace(/[R$\s.]/g, '').replace(',', '.'),
        valor_reduzido: state.formularioProduto.valor_reduzido.replace(/[R$\s.]/g, '').replace(',', '.'),
        valor_exclusivo: state.formularioProduto.valor_exclusivo.replace(/[R$\s.]/g, '').replace(',', '.'),
        descricao_tecnica: state.formularioProduto.descricao_tecnica,
        id_usu_fk: getIdFromToken(),
      };

      const response = await requisicaoAPI('produtos', {
        method: 'POST',
        headers: getAuthHeader(),
        data: dados
      });
      const produtoId = response.id;

      if (state.formularioProduto.foto?.length > 0) {
        const formData = new FormData();
        state.formularioProduto.foto.forEach(item => {
          if (item.file) {
            formData.append("foto", item.file);
          }
        });

        await requisicaoAPI(`produtos/imagens/${produtoId}`, {
          method: 'PUT',
          headers: getAuthHeader(),
          data: formData
        });
      }

      proxy?.$toast.success("Produto cadastrado com sucesso!");
      reiniciarFormulario();
    } catch (error) {
      proxy?.$toast.error("Erro ao cadastrar produto");
    }
  };

  const editarProduto = async () => {
    try {
      const dadosAtualizados: any = {
        marca: state.formularioProduto.marca,
        modelo: state.formularioProduto.modelo,
        valor_completo: state.formularioProduto.valor_completo.replace(/[R$\s.]/g, "").replace(",", "."),
        valor_medio: state.formularioProduto.valor_medio.replace(/[R$\s.]/g, "").replace(",", "."),
        valor_reduzido: state.formularioProduto.valor_reduzido.replace(/[R$\s.]/g, "").replace(",", "."),
        valor_exclusivo: state.formularioProduto.valor_exclusivo.replace(/[R$\s.]/g, "").replace(",", "."),
        descricao_tecnica: state.formularioProduto.descricao_tecnica,
        id_usu_fk: getIdFromToken(),
      };

      const fotosAntigasParaManter = state.formularioProduto.foto
        .filter(item => item.file === null)
        .map(item => ({
          urlImagem: item.url!,
          nomeImagem: item.nome!
      }));

      dadosAtualizados.foto = fotosAntigasParaManter;

      const response = await requisicaoAPI(`produtos/${id}`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        data: dadosAtualizados
      });
      const produtoId = response.id;

      const formData = new FormData();
      state.formularioProduto.foto.forEach(item => {
        if (item.file) {
          formData.append("foto", item.file);
        }
      });

      if (formData.has("foto")) {
        await requisicaoAPI(`produtos/imagens/${produtoId}`, {
          method: 'PUT',
          headers: getAuthHeader(),
          data: formData
        });
      }

      proxy?.$toast.success("Produto atualizado com sucesso!");
      reiniciarFormulario();
      return response;
    } catch (err) {
      console.error("Erro ao editar produto:", err);
      proxy?.$toast.error("Falha ao atualizar o produto. Tente novamente.");
      throw err;
    }
  };

  const save = async () => {
    v$.value.formularioProduto.$touch()
    if (v$.value.formularioProduto.$invalid) {
      proxy?.$toast.error('Preencha todos os campos obrigatórios');
      return
    }
    try {
      if (isEditing.value) {
        await editarProduto()
      } else {
        await enviarFormularioProduto()
      }
      router.push({ name: 'consultar-produto' })
    } catch (error) {
      console.error(error)
        proxy?.$toast.error('Erro ao salvar produto');
    }
  };

  const reiniciarFormulario = () => {
    state.formularioProduto.marca = "";
    state.formularioProduto.modelo = "";
    state.formularioProduto.valor_completo = "";
    state.formularioProduto.valor_medio = "";
    state.formularioProduto.valor_reduzido = "";
    state.formularioProduto.valor_exclusivo = "";
    state.formularioProduto.foto = [];
    state.formularioProduto.descricao_tecnica = "";
    v$.value.$reset();
  };

  const triggerFileUploadProxy = () => {
    const input = document.getElementById("foto") as HTMLInputElement;
    input?.click();
  };

  const handleFileUploadProxy = async (event: Event) => {
    state.isUploading = true;
    try {
      if (state.formularioProduto.foto.length >= 6) {
        proxy?.$toast.error("Limite de 6 fotos atingido!");
        return;
      }

      await handleFileUpload(event, state, proxy);
    } finally {
      state.isUploading = false;
    }
  };

  const removeImageProxy = (index: number) => removeImage(state, index, proxy);

  onMounted(() => { if (isEditing.value) carregarProduto() })

  watch(() => route.params.id, (newId) => {
    if (newId) {
      id = Array.isArray(newId) ? newId[0] : newId;
      carregarProduto();
    } else {
      id = null;
      reiniciarFormulario();
    }
  });
    
  return {
    state,
    v$,
    save,
    triggerFileUploadProxy,
    handleFileUploadProxy,
    removeImageProxy,
  };
}
