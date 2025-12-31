<template>
  <header class="bg-[#f93910]">
    <nav class="mx-auto flex container flex-wrap items-center justify-between" aria-label="Global"
      @mouseleave="closeDropdowns">
      <div :class="{'lg:flex-1': token, 'mx-auto': !token && isMobile}">
        <div class="flex">
          <router-link to="/">
          <img class="h-[100px] py-2 w-auto" src="../../../Publico/Imagens/Decoracao/icon.png" alt="Logo CME" />
        </router-link>
        </div>
      </div>

      <div v-if="token" class="hidden md:flex items-center gap-4">
        <div class="relative">
          <button type="button" @click="toggleDropdownRegister"
            class="flex items-center gap-x-1 text-sm font-medium leading-6 text-[#FFFFFF]" aria-expanded="false">
            Cadastro
            <svg class="h-5 w-5 flex-none text-[#FFFFFF]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clip-rule="evenodd" />
            </svg>
          </button>

          <div class="absolute z-10 mt-3 w-48 bg-white shadow-lg rounded-lg ring-1 ring-gray-900/5" :class="{
            'scale-y-0': !isDropdownOpenRegister,
            'scale-y-100': isDropdownOpenRegister,
          }">
            <div class="p-2">
              <router-link v-if="isOffline || userRole === 'admin' || userRole === 'vendedor'" to="/cadastrar/orcamento"
                class="flex flex-col block px-4 py-2 text-sm leading-6 text-gray-900 hover:bg-gray-50">
                <div class="flex items-center">
                  <i class="fas fa-plus-circle text-[#ff6608] h-4 w-4 mr-2"></i>
                  <span class="text-xs whitespace-nowrap">Cadastro de Orçamento</span>
                </div>
                <span class="block text-xs text-gray-500 mt-1">
                  Iniciar cadastro de orçamento
                </span>
              </router-link>
              <router-link v-if="isOffline || (!isOffline && (userRole === 'admin' || userRole === 'vendedor'))" to="/cadastrar/cliente"
                class="flex flex-col block px-4 py-2 text-sm leading-6 text-gray-900 hover:bg-gray-50">
                <div class="flex items-center">
                  <i class="fas fa-user-friends text-[#ff6608] h-4 w-4 mr-2"></i>
                  <span class="text-xs whitespace-nowrap">Cadastro de Cliente</span>
                </div>
                <span class="block text-xs text-gray-500 mt-1">
                  Iniciar cadastro de cliente
                </span>
              </router-link>
              <router-link v-if="!isOffline && (userRole === 'admin' || userRole === 'vendedor')" to="/cadastrar/produto"
                class="flex flex-col block px-4 py-2 text-sm leading-6 text-gray-900 hover:bg-gray-50">
                <div class="flex items-center">
                  <i class="fas fa-box text-[#ff6608] h-4 w-4 mr-2"></i>
                  <span class="text-xs whitespace-nowrap">Cadastro de Produto</span>
                </div>
                <span class="block text-xs text-gray-500 mt-1">
                  Iniciar cadastro de produto
                </span>
              </router-link>
              <router-link v-if="!isOffline && userRole === 'admin'" to="/cadastrar/usuario"
                class="flex flex-col block px-4 py-2 text-sm leading-6 text-gray-900 hover:bg-gray-50">
                <div class="flex items-center">
                  <i class="fas fa-user-plus text-[#ff6608] h-4 w-4 mr-2"></i>
                  <span class="text-xs whitespace-nowrap">Cadastro de Usuário</span>
                </div>
                <span class="block text-xs text-gray-500 mt-1">
                  Iniciar cadastro de usuário
                </span>
              </router-link>
            </div>
          </div>
        </div>

        <div class="relative">
          <button type="button" @click="toggleDropdownConsult"
            class="flex items-center gap-x-1 text-sm font-medium leading-6 text-[#FFFFFF]" aria-expanded="false">
            Consulta
            <svg class="h-5 w-5 flex-none text-[#FFFFFF]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clip-rule="evenodd" />
            </svg>
          </button>

          <div class="absolute z-10 mt-3 w-48 bg-white shadow-lg rounded-lg ring-1 ring-gray-900/5" :class="{
            'scale-y-0': !isDropdownOpenConsult,
            'scale-y-100': isDropdownOpenConsult,
          }">
            <div class="p-2">
              <router-link v-if="isOffline || userRole === 'admin' || userRole === 'vendedor'" to="/consultar/orcamento"
                class="flex flex-col block px-4 py-2 text-sm leading-6 text-gray-900 hover:bg-gray-50">
                <div class="flex items-center">
                  <i class="fas fa-search-dollar text-[#ff6608] h-4 w-4 mr-2"></i>
                  <span class="text-xs whitespace-nowrap">Consulta de Orçamento</span>
                </div>
                <span class="block text-xs text-gray-500 mt-1">
                  Iniciar consulta de orçamento
                </span>
              </router-link>
              <router-link v-if="isOffline || userRole === 'admin' || userRole === 'vendedor'" to="/consultar/cliente"
                class="flex flex-col block px-4 py-2 text-sm leading-6 text-gray-900 hover:bg-gray-50">
                <div class="flex items-center">
                  <i class="fas fa-users text-[#ff6608] h-4 w-4 mr-2"></i>
                  <span class="text-xs whitespace-nowrap">Consulta de Cliente</span>
                </div>
                <span class="block text-xs text-gray-500 mt-1">
                  Iniciar consulta de cliente
                </span>
              </router-link>
              <router-link v-if="isOffline || userRole === 'admin' || userRole === 'vendedor'" to="/consultar/produto"
                class="flex flex-col block px-4 py-2 text-sm leading-6 text-gray-900 hover:bg-gray-50">
                <div class="flex items-center">
                  <i class="fas fa-box text-[#ff6608] h-4 w-4 mr-2"></i>
                  <span class="text-xs whitespace-nowrap">Consulta de Produto</span>
                </div>
                <span class="block text-xs text-gray-500 mt-1">
                  Iniciar consulta de produto
                </span>
              </router-link>
              <router-link v-if="!isOffline && userRole === 'admin'" to="/consultar/usuario"
                class="flex flex-col block px-4 py-2 text-sm leading-6 text-gray-900 hover:bg-gray-50">
                <div class="flex items-center">
                  <i class="fas fa-user text-[#ff6608] h-4 w-4 mr-2"></i>
                  <span class="text-xs whitespace-nowrap">Consulta de Usuário</span>
                </div>
                <span class="block text-xs text-gray-500 mt-1">
                  Iniciar consulta de usuário
                </span>
              </router-link>
            </div>
          </div>
        </div>

        <div v-if="!isOffline" class="relative">
          <button type="button" @click="toggleDropdownReport"
            class="flex items-center gap-x-1 text-sm font-medium leading-6 text-[#ffffff]" aria-expanded="false">
            Relatório
            <svg class="h-5 w-5 flex-none text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clip-rule="evenodd" />
            </svg>
          </button>
          <div class="absolute z-10 mt-3 w-48 bg-white shadow-lg rounded-lg ring-1 ring-gray-900/5" :class="{
            'scale-y-0': !isDropdownOpenReport,
            'scale-y-100': isDropdownOpenReport,
          }">
            <div class="p-2">
              <router-link to="/relatorio/orcamento"
                class="flex flex-col block px-4 py-2 text-sm leading-6 text-gray-900 hover:bg-gray-50">
                <div class="flex items-center">
                  <i class="fas fa-file-alt text-[#ff6608] h-4 w-4 mr-2"></i>
                  <span class="text-xs whitespace-nowrap">Relatório de Orçamento</span>
                </div>
                <span class="block text-xs text-gray-500 mt-1">
                  Gerar relatório de orçamento
                </span>
              </router-link>
            </div>
          </div>
        </div>

        <div class="relative">
          <button type="button" @click="toggleUserDropdown"
            class="flex items-center gap-x-2 text-sm font-medium leading-10 text-[#FFFFFF]" aria-expanded="false">
            <span>{{ username }}</span>
            <img src="../../../Publico/Imagens/Icones/iconeUsuario.svg" alt="Ícone de Usuário" class="h-5 w-5" />
            <svg class="h-5 w-5 flex-none text-[#FFFFFF]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clip-rule="evenodd" />
            </svg>
          </button>

          <div class="absolute -left-24 lg:-left-10 z-10 mt-3 w-48 bg-white shadow-lg rounded-lg ring-1 ring-gray-900/5" :class="{
            'scale-y-0': !isUserDropdownOpen,
            'scale-y-100': isUserDropdownOpen,
          }">
            <div class="p-2">
              <button @click="logout"
                class="flex block w-full px-4 py-2 text-sm leading-6 text-gray-900 hover:bg-gray-50 text-left">
                <i class="fas fa-sign-out-alt text-[#ff6608] h-4 w-4 mr-2"></i>
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="token" class="md:hidden">
        <button @click="toggleMobileMenu" class="text-white focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
    </nav>
    <transition name="slide-fade">
      <nav v-if="isMobileMenuOpen && token" class="md:hidden flex flex-col items-center space-y-4 mb-4">
        <div v-if="isOffline || userRole === 'admin' || userRole === 'vendedor'"  class="relative">
          <button type="button" @click="toggleDropdownRegister"
            class="flex items-center gap-x-1 text-sm font-medium leading-6 text-[#ffffff]" aria-expanded="false">
            Cadastro
            <svg class="h-5 w-5 flex-none text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clip-rule="evenodd" />
            </svg>
          </button>

          <div class="absolute z-10 mt-3 w-48 bg-white shadow-lg rounded-lg ring-1 ring-gray-900/5" :class="{
            'scale-y-0': !isDropdownOpenRegister,
            'scale-y-100': isDropdownOpenRegister,
          }">
            <div class="p-2">
              <router-link v-if="isOffline || userRole === 'admin' || userRole === 'vendedor'" to="/cadastrar/orcamento"
                class="flex flex-col block px-4 py-2 text-sm leading-6 text-gray-900 hover:bg-gray-50">
                <div class="flex items-center">
                  <i class="fas fa-plus-circle text-[#ff6608] h-4 w-4 mr-2"></i>
                  <span class="text-xs whitespace-nowrap">Cadastro de Orçamento</span>
                </div>
                <span class="block text-xs text-gray-500 mt-1">
                  Iniciar cadastro de orçamento
                </span>
              </router-link>
              <router-link v-if="isOffline || (!isOffline && (userRole === 'admin' || userRole === 'vendedor'))" to="/cadastrar/cliente"
                class="flex flex-col block px-4 py-2 text-sm leading-6 text-gray-900 hover:bg-gray-50">
                <div class="flex items-center">
                  <i class="fas fa-user-friends text-[#ff6608] h-4 w-4 mr-2"></i>
                  <span class="text-xs whitespace-nowrap">Cadastro de Cliente</span>
                </div>
                <span class="block text-xs text-gray-500 mt-1">
                  Iniciar cadastro de cliente
                </span>
              </router-link>
              <router-link v-if="!isOffline && (userRole === 'admin' || userRole === 'vendedor')" to="/cadastrar/produto"
                class="flex flex-col block px-4 py-2 text-sm leading-6 text-gray-900 hover:bg-gray-50">
                <div class="flex items-center">
                  <i class="fas fa-box text-[#ff6608] h-4 w-4 mr-2"></i>
                  <span class="text-xs whitespace-nowrap">Cadastro de Produto</span>
                </div>
                <span class="block text-xs text-gray-500 mt-1">
                  Iniciar cadastro de produto
                </span>
              </router-link>
              <router-link v-if="!isOffline && userRole === 'admin'" to="/cadastrar/usuario"
                class="flex flex-col block px-4 py-2 text-sm leading-6 text-gray-900 hover:bg-gray-50">
                <div class="flex items-center">
                  <i class="fas fa-user-plus text-[#ff6608] h-4 w-4 mr-2"></i>
                  <span class="text-xs whitespace-nowrap">Cadastro de Usuário</span>
                </div>
                <span class="block text-xs text-gray-500 mt-1">
                  Iniciar cadastro de usuário
                </span>
              </router-link>
            </div>
          </div>
        </div>

        <div class="relative">
          <button type="button" @click="toggleDropdownConsult"
            class="flex items-center gap-x-1 text-sm font-medium leading-6 text-[#ffffff]" aria-expanded="false">
            Consulta
            <svg class="h-5 w-5 flex-none text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clip-rule="evenodd" />
            </svg>
          </button>

          <div class="absolute z-10 mt-3 w-48 bg-white shadow-lg rounded-lg ring-1 ring-gray-900/5" :class="{
            'scale-y-0': !isDropdownOpenConsult,
            'scale-y-100': isDropdownOpenConsult,
          }">
            <div class="p-2">
              <router-link v-if="isOffline || userRole === 'admin' || userRole === 'vendedor'" to="/consultar/orcamento"
                class="flex flex-col block px-4 py-2 text-sm leading-6 text-gray-900 hover:bg-gray-50">
                <div class="flex items-center">
                  <i class="fas fa-search-dollar text-[#ff6608] h-4 w-4 mr-2"></i>
                  <span class="text-xs whitespace-nowrap">Consulta de Orçamento</span>
                </div>
                <span class="block text-xs text-gray-500 mt-1">
                  Iniciar consulta de orçamento
                </span>
              </router-link>
              <router-link v-if="isOffline || userRole === 'admin' || userRole === 'vendedor'" to="/consultar/cliente"
                class="flex flex-col block px-4 py-2 text-sm leading-6 text-gray-900 hover:bg-gray-50">
                <div class="flex items-center">
                  <i class="fas fa-users text-[#ff6608] h-4 w-4 mr-2"></i>
                  <span class="text-xs whitespace-nowrap">Consulta de Cliente</span>
                </div>
                <span class="block text-xs text-gray-500 mt-1">
                  Iniciar consulta de cliente
                </span>
              </router-link>
              <router-link v-if="isOffline || userRole === 'admin' || userRole === 'vendedor'" to="/consultar/produto"
                class="flex flex-col block px-4 py-2 text-sm leading-6 text-gray-900 hover:bg-gray-50">
                <div class="flex items-center">
                  <i class="fas fa-box text-[#ff6608] h-4 w-4 mr-2"></i>
                  <span class="text-xs whitespace-nowrap">Consulta de Produto</span>
                </div>
                <span class="block text-xs text-gray-500 mt-1">
                  Iniciar consulta de produto
                </span>
              </router-link>
              <router-link v-if="!isOffline && userRole === 'admin'" to="/consultar/usuario"
                class="flex flex-col block px-4 py-2 text-sm leading-6 text-gray-900 hover:bg-gray-50">
                <div class="flex items-center">
                  <i class="fas fa-user text-[#ff6608] h-4 w-4 mr-2"></i>
                  <span class="text-xs whitespace-nowrap">Consulta de Usuário</span>
                </div>
                <span class="block text-xs text-gray-500 mt-1">
                  Iniciar consulta de usuário
                </span>
              </router-link>
            </div>
          </div>
        </div>

        <div v-if="!isOffline" class="relative">
          <button type="button" @click="toggleDropdownReport"
            class="flex items-center gap-x-1 text-sm font-medium leading-6 text-[#ffffff]" aria-expanded="false">
            Relatório
            <svg class="h-5 w-5 flex-none text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clip-rule="evenodd" />
            </svg>
          </button>
          <div class="absolute z-10 mt-3 w-48 bg-white shadow-lg rounded-lg ring-1 ring-gray-900/5" :class="{
            'scale-y-0': !isDropdownOpenReport,
            'scale-y-100': isDropdownOpenReport,
          }">
            <div class="p-2">
              <router-link to="/relatorio/orcamento"
                class="flex flex-col block px-4 py-2 text-sm leading-6 text-gray-900 hover:bg-gray-50">
                <div class="flex items-center">
                  <i class="fas fa-file-alt text-[#ff6608] h-4 w-4 mr-2"></i>
                  <span class="text-xs whitespace-nowrap">Relatório de Orçamento</span>
                </div>
                <span class="block text-xs text-gray-500 mt-1">
                  Gerar relatório de orçamento
                </span>
              </router-link>
            </div>
          </div>
        </div>

        <div class="relative">
          <button type="button" @click="toggleUserDropdown"
            class="flex items-center gap-x-2 text-sm font-medium leading-6 text-[#ffffff]" aria-expanded="false">
            <span>{{ username }}</span>
            <img src="../../../Publico/Imagens/Icones/iconeUsuario.svg" alt="Ícone de Usuário" class="h-5 w-5" />
            <svg class="h-5 w-5 flex-none text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clip-rule="evenodd" />
            </svg>
          </button>

          <div class="absolute z-10 mt-3 w-48 bg-white shadow-lg rounded-lg ring-1 ring-gray-900/5" :class="{
            'scale-y-0': !isUserDropdownOpen,
            'scale-y-100': isUserDropdownOpen,
          }">
            <div class="p-2">
              <button @click="logout"
                class="flex block w-full px-4 py-2 text-sm leading-6 text-gray-900 hover:bg-gray-50 text-left">
                <i class="fas fa-sign-out-alt text-[#ff6608] h-4 w-4 mr-2"></i>
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>
    </transition>
  </header>
</template>

<script>
import { verificarHealth } from '../../tasks/health.ts';

export default {
  data() {
    return {
      token: null,
      username: '',
      isDropdownOpenRegister: false,
      isDropdownOpenConsult: false,
      isDropdownOpenReport: false,
      isUserDropdownOpen: false,
      isMobileMenuOpen: false,
      isRootUser: false,
      isMobile: false,
      isOffline: false,
      statusTimer: null,
    };
  },
  computed: {
    userRole() {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return payload.aud;
        } catch (error) {
          return null;
        }
      }
      return null;
    }
    // Removido o computed isOffline
  },
  watch: {
    isOffline(newValue, oldValue) {
      console.log('isOffline changed from', oldValue, 'to', newValue);
    }
  },
  async mounted() {
    this.token = localStorage.getItem("token");
    this.username = this.getUsernameFromToken();
    this.isRootUser = this.checkIfRootUser();
    this.isMobile = window.innerWidth <= 768;
    window.addEventListener('resize', this.handleResize);

    // Consulta inicial do health
    this.isOffline = !(await verificarHealth());

    // Atualiza periodicamente a cada 10 minutos
    this.statusTimer = setInterval(async () => {
      this.isOffline = !(await verificarHealth());
    }, 10 * 60 * 1000);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    // Clear the timer
    if (this.statusTimer) {
      clearInterval(this.statusTimer);
    }
  },
  methods: {
    toggleDropdownRegister() {
      this.isDropdownOpenRegister = !this.isDropdownOpenRegister;
      if (this.isDropdownOpenRegister) {
        this.isDropdownOpenConsult = false;
        this.isDropdownOpenReport = false;
        this.isUserDropdownOpen = false;
      }
    },
    goToLogin() {
      this.$router.push('/');
    },
    getUsernameFromToken() {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));

        const username = payload.nome
        return username;
      }
    },
    checkIfRootUser() {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.aud === 'raiz';
      }
      return false;
    },
    toggleDropdownConsult() {
      this.isDropdownOpenConsult = !this.isDropdownOpenConsult;
      if (this.isDropdownOpenConsult) {
        this.isDropdownOpenRegister = false;
        this.isDropdownOpenReport = false;
        this.isUserDropdownOpen = false;
      }
    },
    toggleDropdownReport() {
      this.isDropdownOpenReport = !this.isDropdownOpenReport;
      if (this.isDropdownOpenReport) {
        this.isDropdownOpenRegister = false;
        this.isDropdownOpenConsult = false;
        this.isUserDropdownOpen = false;
      }
    },
    toggleUserDropdown() {
      this.isUserDropdownOpen = !this.isUserDropdownOpen;
      if (this.isUserDropdownOpen) {
        this.isDropdownOpenConsult = false;
        this.isDropdownOpenRegister = false;
        this.isDropdownOpenReport = false;
      }
    },
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
      if (this.isMobileMenuOpen) {
        this.closeDropdowns();
      }
    },
    logout() {
      localStorage.removeItem("token");
      this.token = null;
      this.username = '';
      this.$router.push('/');
    },
    closeDropdowns() {
      this.isDropdownOpenRegister = false;
      this.isDropdownOpenConsult = false;
      this.isDropdownOpenReport = false;
      this.isUserDropdownOpen = false;
    },
    handleResize() {
      this.isMobile = window.innerWidth <= 768;
    }
  }
};
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-enter {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
