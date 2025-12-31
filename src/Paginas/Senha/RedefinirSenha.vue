<template>
  <form @submit.prevent="submeterRedefinicaoSenha" class="flex flex-col justify-center">
    <FormsRegister imgPath="../../../../Publico/Imagens/Decoracao/redefinirSenha.svg">
      <h1 class="text-2xl md:text-3xl font-bold text-center text-[#3F3D56] mt-[-1rem] mb-2">
        Redefinir Senha
      </h1>

      <div class="flex flex-col w-full space-y-3 md:space-y-4 mt-[-0.5rem]">
        <p class="text-base md:text-lg text-gray-600 text-center">
          Para redefinir a senha, informe sua nova senha e confirme-a.
        </p>
      </div>

      <div class="flex flex-col w-full space-y-3 md:space-y-4">
        <label for="novaSenha" class="font-medium text-[#3F3D56] mt-2">
          Nova Senha:
        </label>
        <input
          v-model="state.novaSenha"
          type="password"
          id="novaSenha"
          :class="{ 'border-red-500': v$.novaSenha.$error }"
          placeholder="Digite sua nova senha"
          class="border-2 border-[#A5DAFF] p-2 w-full max-w-lg rounded-lg"
        />
        <span v-if="v$.novaSenha.$error" class="text-red-500 text-sm">
          {{ v$.novaSenha.$errors[0].$message }}
        </span>
      </div>

      <div class="flex flex-col w-full space-y-3 md:space-y-4">
        <label for="confirmarSenha" class="font-medium text-[#3F3D56] mt-2">
          Confirmar Senha:
        </label>
        <input
          v-model="state.confirmarSenha"
          type="password"
          id="confirmarSenha"
          :class="{ 'border-red-500': v$.confirmarSenha.$error }"
          placeholder="Confirme sua nova senha"
          class="border-2 border-[#A5DAFF] p-2 w-full max-w-lg rounded-lg"
        />
        <span v-if="v$.confirmarSenha.$error" class="text-red-500 text-sm">
          {{ v$.confirmarSenha.$errors[0].$message }}
        </span>
      </div>

      <BotaoComponente title="Redefinir Senha" imgPath="/Imagens/Icones/iconSendEmail.svg"
        @click.prevent="submeterRedefinicaoSenha" class="mt-4" />
    </FormsRegister>
  </form>
</template>

<script>
import { reactive, computed, getCurrentInstance } from "vue";
import useValidate from "@vuelidate/core";
import { required, minLength, helpers } from "@vuelidate/validators";
import axios from "axios";
import { API_BASE_URL } from "../../../api-config";
import BotaoComponente from "../../Componentes/Outros/BotaoComponente.vue";
import FormsRegister from "../../Componentes/Esqueleto/FormularioCadastrarComponente.vue";

export default {
  name: "RedefinirSenha",
  components: { FormsRegister, BotaoComponente },
  setup() {
    const { proxy } = getCurrentInstance();

    const state = reactive({
      novaSenha: "",
      confirmarSenha: ""
    });

    const passwordsMatch = (value) => value === state.novaSenha;

    const rules = computed(() => ({
      novaSenha: {
        required: helpers.withMessage("Nova senha é obrigatória", required),
        minLength: helpers.withMessage("A senha deve ter no mínimo 8 caracteres", minLength(8))
      },
      confirmarSenha: {
        required: helpers.withMessage("Confirmação de senha é obrigatória", required),
        minLength: helpers.withMessage("A senha deve ter no mínimo 8 caracteres", minLength(8)),
        passwordsMatch: helpers.withMessage("As senhas não coincidem", passwordsMatch)
      }
    }));

    const v$ = useValidate(rules, state);

    const resetForm = () => {
      state.novaSenha = "";
      state.confirmarSenha = "";
      v$.value.$reset();
    };

    const submeterRedefinicaoSenha = async () => {
      const result = await v$.value.$validate();
      if (!result) {
        proxy.$toast.error("Por favor, corrija os erros no formulário.");
        return;
      }

      try {
        await axios.post(
          `${API_BASE_URL}/usuarios/redefinir-senha`,
          {
            novaSenha_aut: state.novaSenha,
            confirmarSenha_aut: state.confirmarSenha,
          },
          {
            headers: { Authorization: `Bearer ${proxy.$route.query.token}` },
          }
        );
        proxy.$toast.info("Senha redefinida com sucesso!");
        resetForm();
        proxy.$router.push('/');
      } catch (error) {
        proxy.$toast.error("Erro ao redefinir a senha.");
      }
    };

    return {
      state,
      v$,
      submeterRedefinicaoSenha,
      resetForm
    };
  },
};
</script>

<style scoped>
.decorationRegister img {
  margin-top: 2rem;
}
</style>
