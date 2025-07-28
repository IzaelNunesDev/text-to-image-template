# 🔍 **Investigação do Worker - Pontos de Verificação**

## 🎯 **Objetivo**
Identificar por que o Worker não está gerando imagens e não aparecem logs no Android Studio.

## 📋 **Checklist de Investigação**

### 1. **🔗 Teste de Conectividade Básica**

#### 1.1 Verificar se o Worker está online
```bash
# Teste via cURL
curl -I "https://text-to-image-template.izaelnunesred.workers.dev"

# Teste com prompt
curl "https://text-to-image-template.izaelnunesred.workers.dev?prompt=bolo de chocolate"
```

#### 1.2 Verificar resposta do Worker
- **Status Code**: Deve retornar 200
- **Headers**: Verificar se `Content-Type: application/json`
- **CORS**: Verificar se `Access-Control-Allow-Origin: *`

### 2. **🔑 Verificação de Credenciais**

#### 2.1 API Key do Gemini
```bash
# Verificar se a chave está configurada
wrangler secret list
```

#### 2.2 Supabase Credentials
- **URL**: `https://zfbkkrtpnoteapbxfuos.supabase.co`
- **Bucket**: `receitas` (deve ser público)
- **Anon Key**: Verificar se está válida

#### 2.3 Teste de Credenciais
```bash
# Testar upload para Supabase
curl -X POST "https://zfbkkrtpnoteapbxfuos.supabase.co/storage/v1/object/list/bucket/receitas" \
  -H "apikey: [ANON_KEY]" \
  -H "Authorization: Bearer [ANON_KEY]"
```

### 3. **📊 Logs do Cloudflare Workers**

#### 3.1 Verificar Logs em Tempo Real
```bash
# Acompanhar logs do Worker
wrangler tail text-to-image-template
```

#### 3.2 Verificar Métricas
- Acessar [Cloudflare Dashboard](https://dash.cloudflare.com)
- Verificar se há requisições chegando
- Verificar se há erros nos logs

### 4. **🧪 Teste do Worker Localmente**

#### 4.1 Executar Worker Local
```bash
# Instalar dependências
npm install

# Executar localmente
npm run dev
```

#### 4.2 Teste Local
```bash
# Testar endpoint local
curl "http://localhost:8787?prompt=bolo de chocolate"
```

### 5. **🔍 Verificação do Código do Worker**

#### 5.1 Estrutura de Resposta Esperada
```json
{
  "imageUrl": "https://zfbkkrtpnoteapbxfuos.supabase.co/storage/v1/object/public/receitas/ai_generated_bolo_de_chocolate_caseiro_1234567890.jpg",
  "success": true,
  "prompt": "bolo de chocolate",
  "enhancedPrompt": "Professional food photography of a homemade chocolate cake...",
  "model": "stable-diffusion-xl-base-1.0-with-gemini-enhancement"
}
```

#### 5.2 Pontos de Falha no Código
- **Linha 1-10**: CORS headers
- **Linha 15-25**: Parsing do prompt
- **Linha 30-50**: Chamada para Gemini API
- **Linha 55-75**: Geração de imagem com Stable Diffusion
- **Linha 80-100**: Upload para Supabase
- **Linha 105-120**: Retorno da resposta

### 6. **📱 Teste no Android**

#### 6.1 Logs Específicos para Verificar
```kotlin
// Filtros para Logcat
ImageGenerationService
GeminiServiceImpl
ChatViewModel
TelaInicial
```

#### 6.2 Teste Manual no Android
```kotlin
// Adicionar este código temporariamente na TelaInicial
val testUrl = "https://text-to-image-template.izaelnunesred.workers.dev?prompt=test"
Log.d("TEST", "URL: $testUrl")
```

### 7. **🌐 Teste via Navegador**

#### 7.1 Interface Web
- Acessar: `https://text-to-image-template.izaelnunesred.workers.dev/test-simple.html`
- Clicar em "🚀 Testar Worker"
- Verificar se a imagem aparece

#### 7.2 Teste Direto
- Acessar: `https://text-to-image-template.izaelnunesred.workers.dev?prompt=bolo de chocolate`
- Verificar se retorna JSON válido

### 8. **🐛 Debugging Avançado**

#### 8.1 Adicionar Logs no Worker
```typescript
// Adicionar no início do fetch
console.log('Request received:', request.url);
console.log('Prompt:', originalPrompt);

// Adicionar após cada etapa
console.log('Gemini response:', enhancedPrompt);
console.log('Image generated, uploading to Supabase...');
console.log('Upload complete:', imageUrl);
```

#### 8.2 Verificar Timeouts
- **Gemini API**: 30s
- **Stable Diffusion**: 60s
- **Supabase Upload**: 30s
- **Total**: ~120s (pode estar causando timeout no Android)

### 9. **📊 Análise de Performance**

#### 9.1 Métricas de Tempo
- **Tempo total**: 10-15 segundos
- **Tempo por etapa**:
  - Gemini: 2-3s
  - Stable Diffusion: 8-10s
  - Supabase: 2-3s

#### 9.2 Verificar Limitações
- **Cloudflare Workers**: 30s timeout (gratuito)
- **Stable Diffusion**: Pode demorar mais de 30s
- **Android**: 90s timeout configurado

### 10. **🚨 Possíveis Problemas**

#### 10.1 Timeout do Worker
```typescript
// O Worker pode estar demorando mais de 30s
// Solução: Upgrade para plano pago ou otimizar
```

#### 10.2 Erro na API do Gemini
```typescript
// Verificar se a API key está válida
// Verificar se há quota disponível
```

#### 10.3 Erro no Supabase
```typescript
// Verificar se o bucket existe
// Verificar se as permissões estão corretas
```

#### 10.4 Problema de CORS
```typescript
// Verificar se os headers CORS estão corretos
// Pode estar bloqueando requisições do Android
```

## 🎯 **Próximos Passos**

1. **Execute os testes básicos** (cURL, navegador)
2. **Verifique os logs do Cloudflare**
3. **Teste localmente** se possível
4. **Compartilhe os resultados** para análise específica

## 📝 **Comandos para Executar**

```bash
# 1. Teste básico
curl -I "https://text-to-image-template.izaelnunesred.workers.dev"

# 2. Teste com prompt
curl "https://text-to-image-template.izaelnunesred.workers.dev?prompt=bolo de chocolate"

# 3. Verificar logs
wrangler tail text-to-image-template

# 4. Teste local (se possível)
npm run dev
curl "http://localhost:8787?prompt=test"
```

## 🔧 **Arquivos do Worker para Verificar**

### 📁 Estrutura do Projeto
```
text-to-image-template/
├── src/
│   └── index.ts          # Código principal do Worker
├── wrangler.json         # Configuração do Cloudflare
├── package.json          # Dependências
├── test-simple.html      # Interface de teste
└── README.md            # Documentação
```

### 🔍 Pontos Críticos no Código

#### 1. **CORS Headers** (linhas 1-15)
```typescript
if (request.method === 'OPTIONS') {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
```

#### 2. **Parsing do Prompt** (linhas 20-25)
```typescript
const url = new URL(request.url);
const originalPrompt = url.searchParams.get('prompt') || 'A beautiful, appetizing, professional food photograph';
```

#### 3. **Chamada Gemini** (linhas 30-50)
```typescript
const { GoogleGenerativeAI } = await import('@google/generative-ai');
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const promptEnhancer = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
```

#### 4. **Geração de Imagem** (linhas 55-75)
```typescript
const response = await env.AI.run(
    '@cf/stabilityai/stable-diffusion-xl-base-1.0',
    {
        prompt: enhancedPrompt,
        num_steps: 20,
        guidance: 7.5,
        width: 1024,
        height: 1024,
        seed: Math.floor(Math.random() * 1000000)
    }
);
```

#### 5. **Upload Supabase** (linhas 80-100)
```typescript
const imageUrl = await uploadToSupabase(response, originalPrompt, env);
if (!imageUrl) {
    throw new Error('Falha no upload para Supabase');
}
```

#### 6. **Retorno da Resposta** (linhas 105-120)
```typescript
return new Response(JSON.stringify({
    imageUrl: imageUrl,
    success: true,
    prompt: originalPrompt,
    enhancedPrompt: enhancedPrompt,
    model: 'stable-diffusion-xl-base-1.0-with-gemini-enhancement'
}), {
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
    },
});
```

## 🚨 **Problemas Comuns e Soluções**

### 1. **Timeout do Worker**
**Sintoma**: Worker retorna erro 500 após 30s
**Solução**: 
- Upgrade para plano pago do Cloudflare
- Otimizar prompts para gerar mais rápido
- Reduzir `num_steps` no Stable Diffusion

### 2. **API Key Inválida**
**Sintoma**: Erro 401 ou 403
**Solução**:
```bash
# Reconfigurar API key
wrangler secret put GEMINI_API_KEY
```

### 3. **Bucket Supabase Inexistente**
**Sintoma**: Erro 404 no upload
**Solução**:
- Criar bucket `receitas` no Supabase
- Configurar permissões públicas
- Verificar anon key

### 4. **CORS Bloqueando**
**Sintoma**: Erro no navegador/Android
**Solução**:
- Verificar headers CORS no Worker
- Testar com diferentes User-Agents

### 5. **Quota Excedida**
**Sintoma**: Erro 429
**Solução**:
- Verificar limites da API Gemini
- Verificar limites do Cloudflare Workers
- Aguardar reset da quota

## 📊 **Métricas de Monitoramento**

### Tempos Esperados
- **Worker Response**: < 30s
- **Gemini API**: 2-5s
- **Stable Diffusion**: 8-15s
- **Supabase Upload**: 2-5s

### Status Codes
- **200**: Sucesso
- **400**: Bad Request (prompt inválido)
- **401**: Unauthorized (API key inválida)
- **429**: Too Many Requests (quota excedida)
- **500**: Internal Server Error (timeout/erro interno)

## 🎯 **Checklist de Verificação**

- [ ] Worker responde a requisições básicas
- [ ] API key do Gemini está configurada
- [ ] Supabase bucket existe e é público
- [ ] CORS headers estão corretos
- [ ] Logs aparecem no Cloudflare Dashboard
- [ ] Teste local funciona
- [ ] Interface web funciona
- [ ] Android consegue conectar
- [ ] Timeout não está sendo excedido
- [ ] Quota não está excedida

Execute estes testes e compartilhe os resultados para identificarmos o problema específico! 🔍 # 🔍 **Investigação do Worker - Pontos de Verificação**

## 🎯 **Objetivo**
Identificar por que o Worker não está gerando imagens e não aparecem logs no Android Studio.

## 📋 **Checklist de Investigação**

### 1. **🔗 Teste de Conectividade Básica**

#### 1.1 Verificar se o Worker está online
```bash
# Teste via cURL
curl -I "https://text-to-image-template.izaelnunesred.workers.dev"

# Teste com prompt
curl "https://text-to-image-template.izaelnunesred.workers.dev?prompt=bolo de chocolate"
```

#### 1.2 Verificar resposta do Worker
- **Status Code**: Deve retornar 200
- **Headers**: Verificar se `Content-Type: application/json`
- **CORS**: Verificar se `Access-Control-Allow-Origin: *`

### 2. **🔑 Verificação de Credenciais**

#### 2.1 API Key do Gemini
```bash
# Verificar se a chave está configurada
wrangler secret list
```

#### 2.2 Supabase Credentials
- **URL**: `https://zfbkkrtpnoteapbxfuos.supabase.co`
- **Bucket**: `receitas` (deve ser público)
- **Anon Key**: Verificar se está válida

#### 2.3 Teste de Credenciais
```bash
# Testar upload para Supabase
curl -X POST "https://zfbkkrtpnoteapbxfuos.supabase.co/storage/v1/object/list/bucket/receitas" \
  -H "apikey: [ANON_KEY]" \
  -H "Authorization: Bearer [ANON_KEY]"
```

### 3. **📊 Logs do Cloudflare Workers**

#### 3.1 Verificar Logs em Tempo Real
```bash
# Acompanhar logs do Worker
wrangler tail text-to-image-template
```

#### 3.2 Verificar Métricas
- Acessar [Cloudflare Dashboard](https://dash.cloudflare.com)
- Verificar se há requisições chegando
- Verificar se há erros nos logs

### 4. **🧪 Teste do Worker Localmente**

#### 4.1 Executar Worker Local
```bash
# Instalar dependências
npm install

# Executar localmente
npm run dev
```

#### 4.2 Teste Local
```bash
# Testar endpoint local
curl "http://localhost:8787?prompt=bolo de chocolate"
```

### 5. **🔍 Verificação do Código do Worker**

#### 5.1 Estrutura de Resposta Esperada
```json
{
  "imageUrl": "https://zfbkkrtpnoteapbxfuos.supabase.co/storage/v1/object/public/receitas/ai_generated_bolo_de_chocolate_caseiro_1234567890.jpg",
  "success": true,
  "prompt": "bolo de chocolate",
  "enhancedPrompt": "Professional food photography of a homemade chocolate cake...",
  "model": "stable-diffusion-xl-base-1.0-with-gemini-enhancement"
}
```

#### 5.2 Pontos de Falha no Código
- **Linha 1-10**: CORS headers
- **Linha 15-25**: Parsing do prompt
- **Linha 30-50**: Chamada para Gemini API
- **Linha 55-75**: Geração de imagem com Stable Diffusion
- **Linha 80-100**: Upload para Supabase
- **Linha 105-120**: Retorno da resposta

### 6. **📱 Teste no Android**

#### 6.1 Logs Específicos para Verificar
```kotlin
// Filtros para Logcat
ImageGenerationService
GeminiServiceImpl
ChatViewModel
TelaInicial
```

#### 6.2 Teste Manual no Android
```kotlin
// Adicionar este código temporariamente na TelaInicial
val testUrl = "https://text-to-image-template.izaelnunesred.workers.dev?prompt=test"
Log.d("TEST", "URL: $testUrl")
```

### 7. **🌐 Teste via Navegador**

#### 7.1 Interface Web
- Acessar: `https://text-to-image-template.izaelnunesred.workers.dev/test-simple.html`
- Clicar em "🚀 Testar Worker"
- Verificar se a imagem aparece

#### 7.2 Teste Direto
- Acessar: `https://text-to-image-template.izaelnunesred.workers.dev?prompt=bolo de chocolate`
- Verificar se retorna JSON válido

### 8. **🐛 Debugging Avançado**

#### 8.1 Adicionar Logs no Worker
```typescript
// Adicionar no início do fetch
console.log('Request received:', request.url);
console.log('Prompt:', originalPrompt);

// Adicionar após cada etapa
console.log('Gemini response:', enhancedPrompt);
console.log('Image generated, uploading to Supabase...');
console.log('Upload complete:', imageUrl);
```

#### 8.2 Verificar Timeouts
- **Gemini API**: 30s
- **Stable Diffusion**: 60s
- **Supabase Upload**: 30s
- **Total**: ~120s (pode estar causando timeout no Android)

### 9. **📊 Análise de Performance**

#### 9.1 Métricas de Tempo
- **Tempo total**: 10-15 segundos
- **Tempo por etapa**:
  - Gemini: 2-3s
  - Stable Diffusion: 8-10s
  - Supabase: 2-3s

#### 9.2 Verificar Limitações
- **Cloudflare Workers**: 30s timeout (gratuito)
- **Stable Diffusion**: Pode demorar mais de 30s
- **Android**: 90s timeout configurado

### 10. **🚨 Possíveis Problemas**

#### 10.1 Timeout do Worker
```typescript
// O Worker pode estar demorando mais de 30s
// Solução: Upgrade para plano pago ou otimizar
```

#### 10.2 Erro na API do Gemini
```typescript
// Verificar se a API key está válida
// Verificar se há quota disponível
```

#### 10.3 Erro no Supabase
```typescript
// Verificar se o bucket existe
// Verificar se as permissões estão corretas
```

#### 10.4 Problema de CORS
```typescript
// Verificar se os headers CORS estão corretos
// Pode estar bloqueando requisições do Android
```

## 🎯 **Próximos Passos**

1. **Execute os testes básicos** (cURL, navegador)
2. **Verifique os logs do Cloudflare**
3. **Teste localmente** se possível
4. **Compartilhe os resultados** para análise específica

## 📝 **Comandos para Executar**

```bash
# 1. Teste básico
curl -I "https://text-to-image-template.izaelnunesred.workers.dev"

# 2. Teste com prompt
curl "https://text-to-image-template.izaelnunesred.workers.dev?prompt=bolo de chocolate"

# 3. Verificar logs
wrangler tail text-to-image-template

# 4. Teste local (se possível)
npm run dev
curl "http://localhost:8787?prompt=test"
```

## 🔧 **Arquivos do Worker para Verificar**

### 📁 Estrutura do Projeto
```
text-to-image-template/
├── src/
│   └── index.ts          # Código principal do Worker
├── wrangler.json         # Configuração do Cloudflare
├── package.json          # Dependências
├── test-simple.html      # Interface de teste
└── README.md            # Documentação
```

### 🔍 Pontos Críticos no Código

#### 1. **CORS Headers** (linhas 1-15)
```typescript
if (request.method === 'OPTIONS') {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
```

#### 2. **Parsing do Prompt** (linhas 20-25)
```typescript
const url = new URL(request.url);
const originalPrompt = url.searchParams.get('prompt') || 'A beautiful, appetizing, professional food photograph';
```

#### 3. **Chamada Gemini** (linhas 30-50)
```typescript
const { GoogleGenerativeAI } = await import('@google/generative-ai');
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const promptEnhancer = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
```

#### 4. **Geração de Imagem** (linhas 55-75)
```typescript
const response = await env.AI.run(
    '@cf/stabilityai/stable-diffusion-xl-base-1.0',
    {
        prompt: enhancedPrompt,
        num_steps: 20,
        guidance: 7.5,
        width: 1024,
        height: 1024,
        seed: Math.floor(Math.random() * 1000000)
    }
);
```

#### 5. **Upload Supabase** (linhas 80-100)
```typescript
const imageUrl = await uploadToSupabase(response, originalPrompt, env);
if (!imageUrl) {
    throw new Error('Falha no upload para Supabase');
}
```

#### 6. **Retorno da Resposta** (linhas 105-120)
```typescript
return new Response(JSON.stringify({
    imageUrl: imageUrl,
    success: true,
    prompt: originalPrompt,
    enhancedPrompt: enhancedPrompt,
    model: 'stable-diffusion-xl-base-1.0-with-gemini-enhancement'
}), {
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
    },
});
```

## 🚨 **Problemas Comuns e Soluções**

### 1. **Timeout do Worker**
**Sintoma**: Worker retorna erro 500 após 30s
**Solução**: 
- Upgrade para plano pago do Cloudflare
- Otimizar prompts para gerar mais rápido
- Reduzir `num_steps` no Stable Diffusion

### 2. **API Key Inválida**
**Sintoma**: Erro 401 ou 403
**Solução**:
```bash
# Reconfigurar API key
wrangler secret put GEMINI_API_KEY
```

### 3. **Bucket Supabase Inexistente**
**Sintoma**: Erro 404 no upload
**Solução**:
- Criar bucket `receitas` no Supabase
- Configurar permissões públicas
- Verificar anon key

### 4. **CORS Bloqueando**
**Sintoma**: Erro no navegador/Android
**Solução**:
- Verificar headers CORS no Worker
- Testar com diferentes User-Agents

### 5. **Quota Excedida**
**Sintoma**: Erro 429
**Solução**:
- Verificar limites da API Gemini
- Verificar limites do Cloudflare Workers
- Aguardar reset da quota

## 📊 **Métricas de Monitoramento**

### Tempos Esperados
- **Worker Response**: < 30s
- **Gemini API**: 2-5s
- **Stable Diffusion**: 8-15s
- **Supabase Upload**: 2-5s

### Status Codes
- **200**: Sucesso
- **400**: Bad Request (prompt inválido)
- **401**: Unauthorized (API key inválida)
- **429**: Too Many Requests (quota excedida)
- **500**: Internal Server Error (timeout/erro interno)

## 🎯 **Checklist de Verificação**

- [ ] Worker responde a requisições básicas
- [ ] API key do Gemini está configurada
- [ ] Supabase bucket existe e é público
- [ ] CORS headers estão corretos
- [ ] Logs aparecem no Cloudflare Dashboard
- [ ] Teste local funciona
- [ ] Interface web funciona
- [ ] Android consegue conectar
- [ ] Timeout não está sendo excedido
- [ ] Quota não está excedida

Execute estes testes e compartilhe os resultados para identificarmos o problema específico! 🔍 