<template>
  <FormsRegister imgPath="../../../../Publico/Imagens/Decoracao/redefinirSenha.svg" class="mt-12">
    <form @submit.prevent="enviarNovaSenha" class="flex flex-col justify-center">
      <h1 class="text-2xl md:text-3xl font-bold text-center text-[#3F3D56] mt-[-1rem] mb-2">
        Alterar Senha
      </h1>

      <div class="flex flex-col w-full space-y-3 md:space-y-4 mt-[-0.5rem]">
        <p class="text-base md:text-lg text-gray-600 text-center">
          Informe sua senha atual e a nova senha abaixo.
        </p>
      </div>

      <div class="flex flex-col w-full space-y-3 md:space-y-4 mb-2 mt-2">
        <label for="senhaAtual_aut" class="font-medium text-[#3F3D56]">
          Senha Atual:
        </label>
        <input v-model="formulario.senhaAtual_aut" type="password" id="senhaAtual_aut"
          placeholder="Digite sua senha atual" class="border-2 border-[#A5DAFF] p-2 w-full max-w-lg rounded-lg" />
        <span v-if="v$.senhaAtual_aut.$error || senhaAtualError" class="text-red-500">
          {{ senhaAtualError || v$.senhaAtual_aut.$errors[0].$message }}
        </span>
      </div>

      <div class="flex flex-col w-full space-y-3 md:space-y-4 mb-2">
        <label for="novaSenha_aut" class="font-medium text-[#3F3D56]">
          Nova Senha:
        </label>
        <input v-model="formulario.novaSenha_aut" type="password" id="novaSenha_aut"
          placeholder="Digite sua nova senha" class="border-2 border-[#A5DAFF] p-2 w-full max-w-lg rounded-lg" />
        <span v-if="v$.novaSenha_aut.$error" class="text-red-500">
          {{ v$.novaSenha_aut.$errors[0].$message }}
        </span>
      </div>

      <div class="flex flex-col w-full space-y-3 md:space-y-4">
        <label for="confirmarSenha_aut" class="font-medium text-[#3F3D56]">
          Confirmar Nova Senha:
        </label>
        <input v-model="formulario.confirmarSenha_aut" type="password" id="confirmarSenha_aut"
          placeholder="Confirme sua nova senha" class="border-2 border-[#A5DAFF] p-2 w-full max-w-lg rounded-lg" />
        <span v-if="v$.confirmarSenha_aut.$error" class="text-red-500">
          {{ v$.confirmarSenha_aut.$errors[0].$message }}
        </span>
      </div>

      <BotaoComponente title="Redefinir Senha" imgPath="../../Publico/Imagens/Icones/iconSendEmail.svg"
        @click.prevent="enviarNovaSenha" class="mt-4" />
    </form>
  </FormsRegister>
</template>

<script>
import { reactive, ref, getCurrentInstance } from "vue";
import useValidate from "@vuelidate/core";
import { required, minLength, sameAs, helpers } from "@vuelidate/validators";
import axios from "axios";
import { API_BASE_URL } from "../../../api-config";
import BotaoComponente from "../../Componentes/Outros/BotaoComponente.vue";
import FormsRegister from "../../Componentes/Esqueleto/FormularioCadastrarComponente.vue";

export default {
  name: "AlterarSenha",
  components: { FormsRegister, BotaoComponente },
  setup() {
    const { proxy } = getCurrentInstance();
    const senhaAtualError = ref("");
    const formulario = reactive({
      senhaAtual_aut: "",
      novaSenha_aut: "",
      confirmarSenha_aut: ""
    });

    const rules = {
      senhaAtual_aut: {
        required: helpers.withMessage("Por favor, insira sua senha atual", required),
        minLength: helpers.withMessage("A senha deve ter pelo menos 8 caracteres", minLength(8))
      },
      novaSenha_aut: {
        required: helpers.withMessage("Por favor, insira sua nova senha", required),
        minLength: helpers.withMessage("A senha deve ter pelo menos 8 caracteres", minLength(8))
      },
      confirmarSenha_aut: {
        required: helpers.withMessage("Por favor, confirme sua nova senha", required),
        minLength: helpers.withMessage("A senha deve ter pelo menos 8 caracteres", minLength(8)),
        sameAsPassword: helpers.withMessage(
          "As senhas não coincidem",
          value => value === formulario.novaSenha_aut
        )
      }
    };

    const v$ = useValidate(rules, formulario);

    const enviarNovaSenha = async () => {
      senhaAtualError.value = "";
      const isValid = await v$.value.$validate();
      if (!isValid) {
        proxy.$toast.error("Por favor, corrija os erros no formulário.");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        proxy.$toast.error("Você não está logado.");
        return;
      }

      try {
        const response = await axios.post(
          `${API_BASE_URL}/usuarios/atualizar-senha`,
          formulario,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          proxy.$toast.success("Senha redefinida com sucesso! Você será desconectado.");
          formulario.senhaAtual_aut = "";
          formulario.novaSenha_aut = "";
          formulario.confirmarSenha_aut = "";
          v$.value.$reset();
          senhaAtualError.value = "";

          setTimeout(() => {
            localStorage.removeItem("token");
            location.reload();
          }, 2000);
        }
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.message) {
          senhaAtualError.value = error.response.data.message;
          proxy.$toast.error(error.response.data.message);
        } else {
          proxy.$toast.error("Erro ao redefinir a senha. Tente novamente.");
        }
      }
    };

    return {
      formulario,
      v$,
      enviarNovaSenha,
      senhaAtualError,
    };
  },
};
</script>

<style scoped>
.decorationRegister img {
  margin-top: 2rem;
}
</style>
