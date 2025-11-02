# Painel Administrativo - Guia de Configuração

## 🚀 Configuração Inicial

### 1. Configurar Variáveis de Ambiente

Adicione no arquivo `.env`:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_USE_SUPABASE=true
```

Para usar mock-data (desenvolvimento sem Supabase):
```bash
VITE_USE_SUPABASE=false
```

### 2. Criar Usuário Admin

Execute no SQL Editor do Supabase:

```sql
-- Primeiro, crie um usuário via Supabase Auth Dashboard
-- Depois, adicione na tabela admins:

INSERT INTO admins (id, email, name, role)
VALUES (
  'user-uuid-from-auth-users',
  'admin@exemplo.com',
  'Admin',
  'admin'
);
```

**Alternativa via Dashboard:**
1. Vá em Authentication > Users no Supabase Dashboard
2. Crie um novo usuário com email e senha
3. Copie o UUID do usuário criado
4. Execute o SQL acima substituindo o UUID

### 3. Acessar o Painel

Acesse: `http://localhost:5173/admin`

Login com as credenciais criadas no passo 2.

---

## 📊 Estrutura do Banco de Dados

### Tabelas Criadas:

#### `admins`
- Gerenciamento de usuários administradores
- Campos: id, email, name, role, created_at, updated_at

#### `products`
- Catálogo completo de produtos
- Campos: id, name, slug, price, discount_price, category, subcategory, main_image, images, description, variations, stock, rating, review_count, active, created_at, updated_at

#### `banners`
- Banners promocionais da página inicial
- Campos: id, image, title, subtitle, link, position, active, created_at, updated_at

#### `site_config`
- Configurações globais do site
- Campos: id, site_name, logo, favicon, tagline, description, cores, contatos, redes sociais, created_at, updated_at

---

## 🔐 Segurança (RLS - Row Level Security)

Todas as tabelas têm RLS habilitado:

- **Admins**: Apenas admins autenticados podem gerenciar
- **Products**: Público vê apenas ativos, admins gerenciam todos
- **Banners**: Público vê apenas ativos, admins gerenciam todos
- **Site Config**: Público lê, admins editam

---

## 🎯 Funcionalidades do Painel

### Dashboard
- Visão geral de produtos, banners e estatísticas
- Ações rápidas para criar novos itens

### Produtos
- ✅ Listar todos os produtos
- ✅ Criar novo produto
- ✅ Editar produto existente
- ✅ Excluir produto
- ✅ Ativar/desativar produto
- ✅ Upload de múltiplas imagens
- ✅ Geração automática de slug
- ✅ Busca de produtos

### Banners
- ✅ Listar todos os banners
- ✅ Criar novo banner
- ✅ Editar banner existente
- ✅ Excluir banner
- ✅ Ativar/desativar banner
- ✅ Ordenação por posição
- ✅ Preview de imagem

### Configurações
- ✅ Nome da loja e branding
- ✅ Logo e favicon
- ✅ Informações de contato
- ✅ Redes sociais
- ✅ Tagline e descrição

---

## 💡 Dicas de Uso

### Adicionando Produtos

1. Vá em Produtos > Novo Produto
2. Preencha os campos obrigatórios (*)
3. O slug é gerado automaticamente ao digitar o nome
4. Adicione imagens via URL (use serviços como Pexels, Unsplash)
5. Defina se o produto está ativo
6. Salve

### Gerenciando Banners

1. Vá em Banners > Novo Banner
2. Adicione URL da imagem (recomendado: 1200x400px)
3. Defina título e subtítulo
4. Configure o link de destino
5. Ajuste a posição (ordem de exibição)
6. Ative o banner

### Personalizando a Loja

1. Vá em Configurações
2. Edite nome, logo, tagline
3. Configure contatos e redes sociais
4. Salve as alterações
5. As mudanças aparecem imediatamente no site

---

## 🔄 Modo de Operação

### Usando Supabase (Produção)
```bash
VITE_USE_SUPABASE=true
```
- Dados persistentes no banco
- Gerenciamento via admin panel
- RLS para segurança

### Usando Mock Data (Desenvolvimento)
```bash
VITE_USE_SUPABASE=false
```
- Dados do diretório `/public/mock-data`
- Útil para testes sem banco
- Sem persistência

---

## 🐛 Troubleshooting

### Erro ao fazer login
- Verifique se o usuário existe na tabela `admins`
- Confirme que as credenciais estão corretas
- Verifique as variáveis de ambiente do Supabase

### Produtos não aparecem
- Verifique se os produtos estão marcados como `active = true`
- Confirme que `VITE_USE_SUPABASE=true` está definido
- Verifique as políticas RLS no Supabase

### Erro de permissão
- Confirme que o usuário logado está na tabela `admins`
- Verifique as políticas RLS das tabelas
- Certifique-se que está autenticado

---

## 📱 Recursos Responsivos

O painel admin é totalmente responsivo:
- Desktop: Sidebar fixa
- Tablet/Mobile: Menu hamburguer
- Formulários adaptáveis
- Tabelas com scroll horizontal

---

## 🎨 Interface

O painel usa a mesma identidade visual do site:
- Cores: Slate/Gray (cinza escuro profissional)
- Design limpo e moderno
- Ícones Lucide React
- Tailwind CSS para estilização
- Feedback visual em todas as ações

---

## 🔗 URLs Importantes

- Site: `http://localhost:5173`
- Admin: `http://localhost:5173/admin`
- Supabase Dashboard: `https://app.supabase.com`

---

## ✅ Checklist de Setup

- [ ] Variáveis de ambiente configuradas
- [ ] Migração do banco executada
- [ ] Usuário admin criado
- [ ] Login no painel funcionando
- [ ] Primeiro produto cadastrado
- [ ] Banner criado
- [ ] Configurações personalizadas
- [ ] Site exibindo dados do banco

---

Painel criado e pronto para uso! 🎉
