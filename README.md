<div align="center">
  <img width="250" alt="Gestão Familiar" src="https://github.com/mthalmeida/gestao-familiar/assets/logo.png">
</div>

#

<div align="center">
  ![version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=flat-square)
  ![license](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)
  ![tech](https://img.shields.io/badge/stack-React--TypeScript--Vite--Supabase-critical?style=flat-square)
</div>

<div align="center">
  <img alt="Preview" src="https://github.com/mthalmeida/gestao-familiar/assets/preview.png">
</div>

---

## 📘 Sobre o Projeto

**Gestão Familiar** é um sistema moderno de gerenciamento pessoal e familiar, com foco em tarefas do dia a dia, controle financeiro e listas organizadas. A aplicação é desenvolvida com React + TypeScript + Vite, usando Supabase como backend (auth + banco de dados PostgreSQL).

---

## 🚀 Funcionalidades

- ✅ **Autenticação com Supabase**
- 📊 **Dashboard unificada**
- 🗓️ **Agenda de tarefas e compromissos**
- 📁 **Categorias personalizadas**
- 🛒 **Lista de compras**
- 💸 **Gestão de despesas e receitas**
- 🤖 **Assistente Butler AI**

---

## ⚙️ Tecnologias e Ferramentas

<p display="inline-block">
  
![React](https://img.shields.io/badge/react-%2361DAFB.svg?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/supabase-3ECF8E.svg?style=for-the-badge&logo=supabase&logoColor=white)
![Zustand](https://img.shields.io/badge/zustand-%23black.svg?style=for-the-badge)
![Material UI](https://img.shields.io/badge/MUI-%230081CB.svg?style=for-the-badge&logo=mui&logoColor=white)

</p>

---

## 🏁 Instalação e Execução

### 🔁 Clonar o Repositório

```bash
git clone https://github.com/mthalmeida/gestao-familiar.git
cd gestao-familiar
````

### 📦 Instalar dependências

```bash
npm install
```

### ▶️ Executar localmente

```bash
npm run dev
```

### 🏗️ Gerar build de produção

```bash
npm run build
```

---

## 🔐 Configuração do Supabase

### 1. Crie uma conta

Acesse [https://supabase.com](https://supabase.com) e crie um projeto.

### 2. Variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 3. Estrutura do Banco de Dados

Copie e cole os scripts no SQL Editor do Supabase:

#### `users`

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `categories`

```sql
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `transactions`

```sql
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `shopping_list`

```sql
CREATE TABLE shopping_list (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10,2),
  is_purchased BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `agenda`

```sql
CREATE TABLE agenda (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME,
  is_completed BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🧠 Estrutura do Projeto

```
src/
├── components/        # Componentes reutilizáveis
├── contexts/          # Contextos globais (Auth, Loading)
├── database/          # Supabase config
├── hooks/             # Custom hooks
├── pages/             # Páginas principais
├── services/          # Chamadas à API e lógica de negócio
├── stores/            # Zustand stores
├── styles/            # Estilo global
├── types/             # Tipos e interfaces TS
└── utils/             # Funções utilitárias
```

---

## 🧪 ESLint (recomendado para produção)

```ts
// eslint.config.ts
export default tseslint.config({
  extends: [
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

---

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Commit suas mudanças: `git commit -m 'feat: minha feature'`
4. Envie para o GitHub: `git push origin feature/minha-feature`
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está licenciado sob os termos da licença **MIT**. Veja mais detalhes no arquivo [LICENSE](./LICENSE).

---

Desenvolvido com 💙 por [Matheus Almeida](https://github.com/mthalmeida)

```
