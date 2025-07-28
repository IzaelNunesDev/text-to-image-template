# 🎨 Text-to-Image Template com Supabase

Este projeto é um Cloudflare Worker que gera imagens usando IA e faz upload para o Supabase Storage, resolvendo o problema de Data URLs muito grandes no Android.

## 🚀 Funcionalidades

- ✅ Geração de imagens com Stable Diffusion XL
- ✅ Aprimoramento de prompts com Gemini Flash
- ✅ Upload automático para Supabase Storage
- ✅ URLs públicas compatíveis com Coil (Android)
- ✅ Resolução do problema de Data URLs grandes

## 📋 Pré-requisitos

1. **Conta no Cloudflare** (gratuita)
2. **Conta no Supabase** (gratuita)
3. **Chave API do Google Gemini** (gratuita)

## 🔧 Configuração

### 1. Configurar Supabase

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá para **Storage** e crie um bucket chamado `receitas`
4. Configure as permissões do bucket:

```sql
-- Permitir upload anônimo
CREATE POLICY "Allow anonymous uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'receitas');

-- Permitir leitura pública
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'receitas');
```

### 2. Configurar Variáveis de Ambiente

Execute os seguintes comandos:

```bash
# Configurar URL do Supabase
wrangler secret put SUPABASE_URL

# Configurar chave anônima do Supabase
wrangler secret put SUPABASE_ANON_KEY

# Configurar chave do Gemini (se ainda não configurada)
wrangler secret put GEMINI_API_KEY
```

### 3. Encontrar Credenciais do Supabase

1. **URL do Projeto**: Dashboard → Settings → API → Project URL
2. **Chave Anônima**: Dashboard → Settings → API → anon public key

### 4. Deploy do Worker

```bash
# Instalar dependências
npm install

# Deploy
wrangler deploy
```

## 🧪 Teste

Use o arquivo `test-worker.html` para testar a funcionalidade:

1. Abra `test-worker.html` no navegador
2. Digite uma descrição de receita
3. Clique em "Gerar Imagem"
4. Verifique se a imagem é gerada e aparece

## 📱 Integração com Android

O Worker agora retorna JSON em vez de Data URL:

```json
{
  "imageUrl": "https://your-project.supabase.co/storage/v1/object/public/receitas/ai_generated_recipe_1234567890.jpg",
  "success": true,
  "prompt": "Receita original",
  "enhancedPrompt": "Prompt aprimorado pelo Gemini",
  "model": "stable-diffusion-xl-base-1.0-with-gemini-enhancement"
}
```

### Modificação no Android

No seu projeto Android, modifique o `ImageGenerationService.kt`:

```kotlin
suspend fun generateRecipeImage(recipeName: String): String {
    return withContext(Dispatchers.IO) {
        try {
            val workerUrl = "https://text-to-image-template.izaelnunesred.workers.dev"
            val encodedPrompt = URLEncoder.encode(recipeName, "UTF-8")
            val url = "$workerUrl?prompt=$encodedPrompt"
            
            val connection = URL(url).openConnection() as HttpURLConnection
            // ... configurações ...
            
            if (connection.responseCode == 200) {
                val responseText = connection.inputStream.reader().readText()
                val response = JSONObject(responseText)
                
                // Extrair URL da resposta
                return@withContext response.getString("imageUrl")
            }
            
            return@withContext getFallbackImageUrl(recipeName)
        } catch (e: Exception) {
            return@withContext getFallbackImageUrl(recipeName)
        }
    }
}
```

## 🔒 Segurança

- ✅ URLs públicas para leitura
- ✅ Upload controlado pelo Worker
- ✅ Nomes de arquivo únicos com timestamp
- ✅ Sanitização do prompt no nome do arquivo

## 🚨 Troubleshooting

### Erro 401 - Unauthorized
- Verifique se a chave anônima do Supabase está correta
- Verifique se o bucket existe

### Erro 403 - Forbidden
- Verifique as políticas de permissão do bucket
- Certifique-se de que o bucket permite upload anônimo

### Erro 404 - Not Found
- Verifique se o bucket `receitas` foi criado
- Verifique se a URL do projeto está correta

### Imagens não aparecem no Android
- Verifique se o Coil está configurado corretamente
- Teste a URL diretamente no navegador
- Verifique se a URL é pública e acessível

## 📊 Benefícios da Solução

1. **Resolve o problema original**: Não mais Data URLs grandes
2. **Compatibilidade com Coil**: URLs HTTP/HTTPS funcionam perfeitamente
3. **Melhor performance**: Cache automático do Coil
4. **Menos uso de memória**: Não carrega imagem inteira na memória
5. **URLs persistentes**: Imagens ficam disponíveis permanentemente

## 🎯 Resultado Esperado

- ✅ Imagens geradas pela IA aparecem no card
- ✅ URLs públicas compatíveis com Coil
- ✅ Performance otimizada
- ✅ Cache automático
- ✅ Menos uso de memória no dispositivo

---

**Nota**: Certifique-se de configurar corretamente as variáveis de ambiente do Supabase antes de fazer o deploy. 