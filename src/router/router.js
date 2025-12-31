import { createRouter, createWebHistory } from "vue-router";
import AlterarSenha from "../Paginas/Senha/AlterarSenha.vue";
import RedefinirSenha from "../Paginas/Senha/RedefinirSenha.vue";
import RecuperarSenha from "../Paginas/Senha/RecuperarSenha.vue";
import NaoEncontrado from "../Paginas/Visualizacacao/NaoEncontrado.vue";
import CadastrarUsuario from "../Paginas/Cadastrar/Usuario/CadastrarUsuario.vue";
import ConsultaUsuario from "../Paginas/Consulta/Usuario/ConsultaUsuario.vue";
import Contato from "../Paginas/Visualizacacao/Contato.vue";
import ConsultaProduto from "../Paginas/Consulta/Produto/ConsultaProduto.vue";
import CadastrarProduto from "../Paginas/Cadastrar/Produto/CadastrarProduto.vue";
import CadastrarCliente from "../Paginas/Cadastrar/Cliente/CadastrarCliente.vue";
import CadastrarOrcamento from "../Paginas/Cadastrar/Orcamento/CadastrarOrcamento.vue";
import ConsultaCliente from "../Paginas/Consulta/Cliente/ConsultaCliente.vue";
import ConsultaOrcamento from "../Paginas/Consulta/Orcamento/ConsultaOrcamento.vue";
import RelatorioOrcamento from "../Paginas/Relatorio/Orcamento/RelatorioOrcamento.vue";
import Conexao from "../Paginas/Autenticacao/Conexao.vue";


const verificarTokenNoUrl = (to, from, next) => {
  if (to.query.token) {
    next();
  } else {
    next('/');
  }
};

const routes = [
  {
    path: "/",
    name: "conectar",
    component: Conexao,
    meta: { requiresAuth: false },
  },
  {
    path: "/contato",
    name: "contato",
    component: Contato,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "nao-encotrado",
    component: NaoEncontrado,
    meta: { requiresAuth: false },
  },
  {
    path: "/cadastrar/produto/:id?",
    name: "cadastrar-produto",
    component: CadastrarProduto,
    props: true,
    meta: { roles: ['admin', 'vendedor']},
  },
  {
    path: "/cadastrar/orcamento/:id?",
    name: "cadastrar-orcamento",
    component: CadastrarOrcamento,
    props: true,
    meta: { roles: ['admin', 'vendedor']},
  },
  {
    path: "/consultar/orcamento",
    name: "consultar-orcamento",
    component: ConsultaOrcamento,
    meta: { roles: ['admin', 'vendedor']},
  },
  {
    path: "/cadastrar/cliente/:id?",
    name: "cadastrar-cliente",
    component: CadastrarCliente,
    props: true,
    meta: { roles: ['admin', 'vendedor']},
  },
  {
    path: "/consultar/cliente",
    name: "consultar-cliente",
    component: ConsultaCliente,
    meta: { roles: ['admin', 'vendedor']},
  },
  {
    path: "/consultar/produto",
    name: "consultar-produto",
    component: ConsultaProduto,
    meta: { roles: ['admin', 'vendedor']},
  },
  {
    path: "/cadastrar/usuario",
    name: "cadastrar-usuario",
    component: CadastrarUsuario,
    props: false,
    meta: { roles: ['admin'] },
  },
  {
    path: "/atualizar/usuario/:id",
    name: "atualizar-usuario",
    component: CadastrarUsuario,
    props: true,
    meta: { roles: ['admin'] },
  },
  {
    path: "/consultar/usuario",
    name: "consulta-usuario",
    component: ConsultaUsuario,
    meta: { roles: ['admin']},
  },
  {
    path: "/relatorio/orcamento",
    name: "relatorio-orcamento",
    component: RelatorioOrcamento,
    meta: { roles: ['admin']},
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const publicPages = ['/', '/contato'];
  if (publicPages.includes(to.path)) {
    return next();
  }
  if (!token) {
    return next('/');
  }
  const payload = JSON.parse(atob(token.split('.')[1]));
  const role = payload.aud;

  const routeRoles = {
    '/cadastrar/usuario': ['admin'],
    '/consultar/usuario': ['admin'],
    '/cadastrar/produto': ['admin', 'vendedor'],
    '/cadastrar/orcamento': ['admin', 'vendedor'],
    '/cadastrar/cliente': ['admin', 'vendedor'],
    '/consultar/produto': ['admin', 'vendedor'],
    '/consultar/orcamento': ['admin', 'vendedor'],
    '/consultar/cliente': ['admin', 'vendedor'],
  };

  const allowedRoles = routeRoles[to.path];
  if (allowedRoles && !allowedRoles.includes(role)) {
    return next('/');
  }
  next();
});

export default router;
