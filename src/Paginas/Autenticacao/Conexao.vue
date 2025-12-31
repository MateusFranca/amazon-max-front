<template>
  <div class="min-h-screen grid grid-cols-1 md:grid-cols-2">

    <div class="hidden md:flex items-center justify-center bg-[#e44c25]">
      <img src="../../../Publico/Imagens/Decoracao/icon.png" alt="Logo" class="max-w-xs max-h-64 object-contain" />
    </div>

    <div class="flex items-center justify-center p-6">
      <div class="w-full max-w-md">
        <h2 class="text-2xl font-semibold text-center mb-6 text-[#3F3D56]">Login</h2>
        <form @submit.prevent="enviarFormularioConexao" class="space-y-4">
          <div>
            <label for="usuario" class="block font-medium text-[#3F3D56] mb-1">Usuário:</label>
            <input v-model="conexao.email" type="text" id="usuario" placeholder="Informe seu usuário"
              class="border-2 border-[#e6401a] p-2 w-full rounded-lg" />
          </div>

          <div>
            <label for="senha" class="block font-medium text-[#3F3D56] mb-1">Senha:</label>
            <input v-model="conexao.senha" type="password" id="senha" placeholder="Informe sua senha"
              class="border-2 border-[#e6401a] p-2 w-full rounded-lg" />
          </div>

          <div class="mt-4">
            <BotaoComponente type="submit" title="Entrar" class="w-full" />
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BotaoComponente from "../../Componentes/Outros/BotaoComponente.vue";
import { requisicaoAPI } from "../../api/comunicador";
import { sincronizarBanco } from "../../sql/banco";
import { isOfflineClientToken } from "../../utils/tokenUtils";

export default defineComponent({
  name: "Login",
  components: { BotaoComponente },
  data() {
    return {
      conexao: {
        email: "viniciustomax@gmail.com",
        senha: "Vinicius123@",
      },
    };
  },
  methods: {
    async enviarFormularioConexao() {
      this.$toast.info("Conectando, por favor aguarde...");
      try {
        const resposta = await requisicaoAPI('autenticacao/conectar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          data: this.conexao
        });
        this.$toast.success("Conectado com sucesso!");
        localStorage.setItem("token", resposta.token);
        if (!isOfflineClientToken()) {
          await sincronizarBanco();
        }
        this.$router.push({ name: "consultar-produto" });
      } catch (erro: any) {
        this.$toast.error("Por favor, verifique suas credenciais e tente novamente");
        console.error("Erro ao fazer login:", erro?.message || erro);
      }
    },
  },
});
</script>
