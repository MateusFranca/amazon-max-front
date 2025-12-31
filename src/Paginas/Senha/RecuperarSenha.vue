<template>
  <form @submit.prevent="submitPasswordReset" class="flex flex-col justify-center">
    <FormsRegister imgPath="../../../../Publico/Imagens/Decoracao/redefinirSenha.svg">
      <h1 class="text-2xl md:text-3xl font-bold text-center text-[#3F3D56] mt-[-1rem] mb-2">
        Recuperar Senha
      </h1>

      <div class="flex flex-col w-full space-y-3 md:space-y-4 mt-[-0.5rem]">
        <p class="text-base md:text-lg text-gray-600 text-center">
          Para recuperar a sua senha, informe seu endereço de email que nós
          enviaremos um link para a alteração da senha.
        </p>
      </div>

      <div class="flex flex-col w-full space-y-3 md:space-y-4">
        <label for="email" class="font-medium text-[#3F3D56] mt-2">
          E-mail:
        </label>
        <input
          v-model="state.email"
          type="email"
          name="email"
          id="email"
          placeholder="Digite seu e-mail"
          :class="{ 'border-red-500': v$.email.$error }"
          class="border-2 border-[#A5DAFF] p-2 w-full max-w-lg rounded-lg"
        />
        <span v-if="v$.email.$error" class="text-red-500 text-sm">
          {{ v$.email.$errors[0].$message }}
        </span>
      </div>

      <BotaoComponente
        title="Enviar e-mail de redefinição"
        imgPath="../../Publico/Imagens/Icones/iconSendEmail.svg"
        @click.prevent="submitPasswordReset"
        class="mt-4"
      />
    </FormsRegister>
  </form>
</template>

<script>
import BotaoComponente from "../../Componentes/Outros/BotaoComponente.vue";
import FormsRegister from "../../Componentes/Esqueleto/FormularioCadastrarComponente.vue";
import { API_BASE_URL } from "../../../api-config";
import { reactive, getCurrentInstance } from 'vue';
import useValidate from "@vuelidate/core";
import { required, email, helpers } from "@vuelidate/validators";
import axios from "axios";

export default {
  name: "PasswordReset",
  components: { FormsRegister, BotaoComponente },

  setup() {
    const { proxy } = getCurrentInstance();

    const state = reactive({
      email: "",
    });

    const rules = {
      email: {
        required: helpers.withMessage("E-mail é obrigatório", required),
        email: helpers.withMessage("E-mail inválido", email)
      }
    };

    const v$ = useValidate(rules, state);

    const resetForm = () => {
      state.email = "";
      v$.value.$reset();
    };

    const submitPasswordReset = async () => {
      const result = await v$.value.$validate();
      if (!result) {
        proxy.$toast.error("Por favor, corrija os erros no formulário.");
        return;
      }

      try {
        await axios.post(`${API_BASE_URL}/usuarios/recuperar-senha`, {
          email: state.email,
        });

        proxy.$toast.info("Se houver uma conta associada a este e-mail, enviamos um link de recuperação");
        resetForm();
      } catch (error) {
        proxy.$toast.error("Ocorreu um erro ao processar a solicitação.");
      }
    };

    return {
      state,
      v$,
      submitPasswordReset,
      resetForm
    };
  }
};
</script>

<style scoped>
.decorationRegister img {
  margin-top: 2rem;
}
</style>
