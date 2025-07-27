# Configuração do Projeto

## Pré-requisitos

1. **Conta no Google AI Studio**: Você precisa de uma conta no [Google AI Studio](https://makersuite.google.com/app/apikey) para obter uma chave da API.

2. **Node.js**: Certifique-se de ter o Node.js instalado (versão 16 ou superior).

3. **Wrangler CLI**: Instale o Wrangler CLI globalmente:
   ```bash
   npm install -g wrangler
   ```

## Configuração da API

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em "Get API key" para criar uma nova chave
4. Copie a chave gerada

## Configuração Local

1. Configure a variável de ambiente localmente:
   ```bash
   wrangler secret put GEMINI_API_KEY
   ```
   Quando solicitado, cole sua chave da API.

## Executando Localmente

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Abra o arquivo `test.html` em seu navegador ou acesse `http://localhost:8787`

## Deploy para Cloudflare Workers

1. Faça login no Wrangler:
   ```bash
   wrangler login
   ```

2. Configure a variável de ambiente no Cloudflare:
   ```bash
   wrangler secret put GEMINI_API_KEY
   ```

3. Deploy o projeto:
   ```bash
   npm run deploy
   ```

## Como Usar

1. Acesse a URL do seu worker
2. Adicione o parâmetro `?prompt=sua_descrição_aqui` à URL
3. A imagem será gerada automaticamente

Exemplo:
```
https://seu-worker.workers.dev/?prompt=Um gato cyberpunk em uma cidade futurística
```

## Modelo Utilizado

Este projeto utiliza o **Imagen 3** (`imagen-3.0-generate-002`) da Google para geração de imagens, que é um dos modelos mais avançados disponíveis atualmente. 