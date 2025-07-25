# Guia de Configuração - Gestão Familiar

## Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Conta no Supabase (gratuita)

## Passo a Passo da Configuração

### 1. Configuração do Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Aguarde a criação do projeto (pode levar alguns minutos)
4. Vá em **Settings > API** no painel do Supabase
5. Copie as seguintes informações:
   - **Project URL** (ex: `https://your-project-id.supabase.co`)
   - **anon public** key (ex: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 2. Configuração das Variáveis de Ambiente

1. Na raiz do projeto, crie um arquivo chamado `.env`
2. Adicione as seguintes variáveis:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANTE**: Substitua os valores pelos que você copiou do Supabase.

### 3. Configuração do Banco de Dados

No painel do Supabase, vá em **SQL Editor** e execute os seguintes comandos:

#### Criar tabela de usuários:
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Criar tabela de categorias:
```sql
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Criar tabela de transações:
```sql
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_id UUID REFERENCES categories(id),
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Criar tabela de lista de compras:
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

#### Criar tabela de agenda:
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

### 4. Configuração de Políticas de Segurança (RLS)

Para garantir que os usuários só acessem seus próprios dados, configure as políticas RLS:

#### Política para usuários:
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);
```

#### Política para categorias:
```sql
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own categories" ON categories
  FOR ALL USING (auth.uid()::text = user_id::text);
```

#### Política para transações:
```sql
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own transactions" ON transactions
  FOR ALL USING (auth.uid()::text = user_id::text);
```

#### Política para lista de compras:
```sql
ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own shopping list" ON shopping_list
  FOR ALL USING (auth.uid()::text = user_id::text);
```

#### Política para agenda:
```sql
ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own agenda" ON agenda
  FOR ALL USING (auth.uid()::text = user_id::text);
```

### 5. Configuração de Autenticação

1. No painel do Supabase, vá em **Authentication > Settings**
2. Em **Site URL**, adicione: `http://localhost:5173` (para desenvolvimento)
3. Em **Redirect URLs**, adicione: `http://localhost:5173/dashboard`
4. Salve as configurações

### 6. Instalação e Execução

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

### 7. Configuração de Autorização (Opcional)

Se você quiser limitar o acesso a emails específicos:

1. Abra o arquivo `src/pages/Login/index.tsx`
2. Localize a seção de configuração de autorização
3. Descomente e adicione os emails autorizados:

```typescript
const authorizedEmails = [
  'seu-email@exemplo.com',
  'outro-usuario@exemplo.com',
];
```

## Solução de Problemas

### Erro de conexão com Supabase
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o projeto Supabase está ativo
- Verifique se as políticas RLS estão configuradas corretamente

### Erro de autenticação
- Verifique se a URL de redirecionamento está configurada no Supabase
- Confirme se o email está na lista de autorizados (se configurado)

### Erro de banco de dados
- Verifique se todas as tabelas foram criadas corretamente
- Confirme se as políticas RLS estão ativas
- Verifique se as chaves estrangeiras estão configuradas

## Próximos Passos

Após a configuração inicial, você pode:

1. Personalizar o tema da aplicação
2. Adicionar novas funcionalidades
3. Configurar notificações push
4. Implementar backup automático dos dados
5. Adicionar integração com outros serviços

## Suporte

Se encontrar problemas durante a configuração:

1. Verifique se todos os passos foram seguidos corretamente
2. Consulte a documentação do Supabase
3. Verifique os logs do console do navegador
4. Abra uma issue no repositório do projeto 