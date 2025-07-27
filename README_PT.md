# 🎨 Gerador de Imagens com Imagen 3

Este projeto é um gerador de imagens baseado em texto que utiliza o **Imagen 3** da Google, um dos modelos mais avançados de geração de imagens disponíveis atualmente.

## ✨ Características

- **Modelo Avançado**: Utiliza o Imagen 3 (`imagen-3.0-generate-002`) da Google
- **Melhoria de Prompts**: Usa o Gemini para aprimorar automaticamente as descrições
- **Interface Web**: Interface simples e intuitiva para gerar imagens
- **Deploy na Cloudflare**: Executa como um Cloudflare Worker
- **CORS Habilitado**: Pode ser usado em aplicações web

## 🚀 Como Funciona

1. **Entrada do Usuário**: O usuário fornece uma descrição da imagem desejada
2. **Aprimoramento**: O Gemini melhora a descrição para resultados mais profissionais
3. **Geração**: O Imagen 3 gera a imagem baseada na descrição aprimorada
4. **Retorno**: A imagem é retornada diretamente como resposta HTTP

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- Conta no [Google AI Studio](https://makersuite.google.com/app/apikey)
- Conta no Cloudflare (para deploy)

## 🛠️ Instalação

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/IzaelNunesDev/text-to-image-template.git
   cd text-to-image-template
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure a API Key**:
   ```bash
   wrangler secret put GEMINI_API_KEY
   ```
   Quando solicitado, cole sua chave da API do Google AI Studio.

## 🏃‍♂️ Executando Localmente

1. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

2. **Teste a aplicação**:
   - Abra o arquivo `test.html` em seu navegador
   - Ou acesse `http://localhost:8787/?prompt=sua_descrição`

## 🌐 Deploy para Cloudflare Workers

1. **Faça login no Wrangler**:
   ```bash
   wrangler login
   ```

2. **Configure a variável de ambiente**:
   ```bash
   wrangler secret put GEMINI_API_KEY
   ```

3. **Deploy o projeto**:
   ```bash
   npm run deploy
   ```

## 📖 Como Usar

### Via API
```
GET https://seu-worker.workers.dev/?prompt=Um gato cyberpunk em uma cidade futurística
```

### Via Interface Web
1. Abra o arquivo `test.html` em seu navegador
2. Digite a descrição da imagem desejada
3. Clique em "Gerar Imagem"
4. Aguarde alguns segundos para a geração

## 🎯 Exemplos de Prompts

- "Um gato cyberpunk em uma cidade futurística"
- "Uma paisagem de montanha ao pôr do sol com cores vibrantes"
- "Um robô amigável servindo café em uma cafeteria moderna"
- "Uma floresta mágica com árvores brilhantes e fadas"

## 🔧 Configuração Avançada

### Personalizando o Modelo
O projeto está configurado para usar o `imagen-3.0-generate-002`. Você pode modificar o arquivo `src/index.ts` para usar outros modelos disponíveis.

### Ajustando a Qualidade
Você pode modificar os parâmetros de geração no código para ajustar:
- Número de imagens geradas
- Proporção da imagem
- Qualidade da geração

## 📁 Estrutura do Projeto

```
text-to-image-template/
├── src/
│   └── index.ts          # Código principal do Worker
├── test.html             # Interface de teste
├── package.json          # Dependências do projeto
├── wrangler.json         # Configuração do Cloudflare Workers
├── SETUP.md              # Instruções de configuração
└── README_PT.md          # Este arquivo
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🙏 Agradecimentos

- [Google AI Studio](https://makersuite.google.com/) pelo Imagen 3
- [Cloudflare Workers](https://workers.cloudflare.com/) pela plataforma de execução
- [Google Generative AI](https://ai.google.dev/) pela biblioteca JavaScript

## 📞 Suporte

Se você encontrar algum problema ou tiver dúvidas, sinta-se à vontade para abrir uma issue no repositório. 