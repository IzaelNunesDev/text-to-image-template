# 🔧 Configuração do Supabase para o Cloudflare Worker

## 📋 Pré-requisitos

1. **Conta no Supabase** (gratuita)
2. **Projeto Supabase criado**
3. **Bucket 'receitas' configurado**

## 🚀 Configuração do Projeto

### 1. Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Crie um novo projeto
4. Anote a URL e a chave anônima

### 2. Configurar Storage Bucket
1. No dashboard do Supabase, vá para **Storage**
2. Crie um novo bucket chamado `receitas`
3. Configure as permissões:
   ```sql
   -- Permitir upload anônimo
   CREATE POLICY "Allow anonymous uploads" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'receitas');
   
   -- Permitir leitura pública
   CREATE POLICY "Allow public read access" ON storage.objects
   FOR SELECT USING (bucket_id = 'receitas');
   ```

### 3. Configurar Variáveis de Ambiente

Execute os seguintes comandos para configurar as variáveis:

```bash
# Configurar URL do Supabase
wrangler secret put SUPABASE_URL

# Configurar chave anônima do Supabase
wrangler secret put SUPABASE_ANON_KEY

# Configurar bucket (opcional, já está no wrangler.json)
wrangler secret put SUPABASE_BUCKET
```

### 4. Exemplo de Valores

**SUPABASE_URL:**
```
https://your-project-id.supabase.co
```

**SUPABASE_ANON_KEY:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjM0NTY3MjAwLCJleHAiOjE5NTAxNDMyMDB9.your-anon-key
```

## 🔍 Como Encontrar as Credenciais

### URL do Projeto
1. Dashboard do Supabase → Settings → API
2. Copie a **Project URL**

### Chave Anônima
1. Dashboard do Supabase → Settings → API
2. Copie a **anon public** key

## 🧪 Teste da Configuração

Após configurar, teste com:

```bash
# Deploy do Worker
wrangler deploy

# Teste local (opcional)
wrangler dev
```

## 📱 Integração com Android

O Android já está configurado para usar URLs do Supabase. O Worker agora retorna:

```json
{
  "imageUrl": "https://your-project.supabase.co/storage/v1/object/public/receitas/ai_generated_recipe_1234567890.jpg",
  "success": true,
  "prompt": "Receita original",
  "enhancedPrompt": "Prompt aprimorado pelo Gemini",
  "model": "stable-diffusion-xl-base-1.0-with-gemini-enhancement"
}
```

## 🔒 Segurança

- ✅ URLs públicas para leitura
- ✅ Upload controlado pelo Worker
- ✅ Nomes de arquivo únicos com timestamp
- ✅ Sanitização do prompt no nome do arquivo

## 🚨 Troubleshooting

### Erro 401 - Unauthorized
- Verifique se a chave anônima está correta
- Verifique se o bucket existe

### Erro 403 - Forbidden
- Verifique as políticas de permissão do bucket
- Certifique-se de que o bucket permite upload anônimo

### Erro 404 - Not Found
- Verifique se o bucket `receitas` foi criado
- Verifique se a URL do projeto está correta 