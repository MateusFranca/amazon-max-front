# Amazon Max Front

Sistema de gerenciamento comercial para cadastro e controle de clientes, produtos, orçamentos e usuários.

## Tecnologias

- **Vue 3** - Framework JavaScript progressivo
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **Vue Router** - Roteamento SPA
- **Axios** - Cliente HTTP
- **Vuelidate** - Validação de formulários
- **jsPDF** - Geração de PDFs
- **XLSX** - Exportação para Excel
- **Luxon** - Manipulação de datas
- **SQLite** - Banco de dados local (offline)

### Plataformas

- **Web** - Aplicação SPA
- **Mobile** - Android/iOS via Capacitor
- **Desktop** - Windows/macOS/Linux via Tauri

## Funcionalidades

- Autenticação de usuários com controle de acesso por roles (admin/vendedor)
- Cadastro e consulta de clientes
- Cadastro e consulta de produtos
- Criação e gerenciamento de orçamentos
- Geração de relatórios em PDF
- Exportação de dados para Excel
- Suporte offline com sincronização
- Validação de CPF/CNPJ

## Requisitos

- Node.js 18+
- npm ou yarn

## Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build
```

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run preview` | Preview do build de produção |
| `npm run tauri` | Inicia em modo Tauri (desktop) |
| `npm run tauri:build` | Build para desktop |
| `npm run build:capacitor` | Build para mobile (Android) |

## Estrutura do Projeto

```
src/
├── api/              # Configuração de API e comunicação
├── Componentes/      # Componentes Vue reutilizáveis
│   ├── Esqueleto/    # Layout (Cabeçalho, Rodapé)
│   ├── Modais/       # Componentes de modal
│   └── Outros/       # Botões, Cards, Tabelas, Paginação
├── Paginas/          # Páginas da aplicação
│   ├── Autenticacao/ # Login e conexão
│   ├── Cadastrar/    # Formulários de cadastro
│   ├── Consulta/     # Telas de listagem
│   ├── Relatorio/    # Relatórios
│   └── Senha/        # Recuperação de senha
├── router/           # Configuração de rotas
├── sql/              # Banco de dados local e entidades
├── utils/            # Funções utilitárias
└── assets/           # Recursos estáticos
```

## IDE Recomendada

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## Licença

Projeto privado - Todos os direitos reservados.
