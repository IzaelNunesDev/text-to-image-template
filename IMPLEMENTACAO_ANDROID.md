# 📱 **Implementação Android - Correções Necessárias**

## 🎯 **Arquivos que Precisam ser Modificados**

### 1. **ImageGenerationService.kt** (core-data)

#### **Problema Atual:**
```kotlin
// Timeout muito baixo
connection.connectTimeout = 30000 // 30 segundos
connection.readTimeout = 30000    // 30 segundos
```

#### **Solução - Implementar:**
```kotlin
class ImageGenerationService {
    private val WORKER_URL = "https://text-to-image-template.izaelnunesred.workers.dev"
    
    suspend fun generateRecipeImage(recipeName: String): String {
        Log.d("ImageGeneration", "=== INICIANDO GERAÇÃO DE IMAGEM ===")
        Log.d("ImageGeneration", "Receita: $recipeName")
        
        try {
            // Teste de conectividade básica
            Log.d("ImageGeneration", "🌐 Testando conectividade...")
            testBasicConnectivity()
            
            // Geração da imagem
            val url = "$WORKER_URL?prompt=${URLEncoder.encode(recipeName, "UTF-8")}"
            Log.d("ImageGeneration", "🔗 URL do Worker: $url")
            
            val startTime = System.currentTimeMillis()
            val response = makeRequestWithTimeout(url)
            val endTime = System.currentTimeMillis()
            
            Log.d("ImageGeneration", "⏱️ Tempo de resposta: ${endTime - startTime}ms")
            Log.d("ImageGeneration", "📊 Status code: ${response.code}")
            
            if (response.isSuccessful) {
                val jsonResponse = response.body?.string()
                Log.d("ImageGeneration", "📄 Resposta completa do Worker: $jsonResponse")
                
                val jsonObject = JSONObject(jsonResponse)
                
                if (jsonObject.getBoolean("success")) {
                    val imageUrl = jsonObject.getString("imageUrl")
                    Log.d("ImageGeneration", "🎉 IMAGEM GERADA COM SUCESSO!")
                    Log.d("ImageGeneration", "🖼️ URL da imagem: $imageUrl")
                    return imageUrl
                } else {
                    throw Exception("Worker retornou success=false")
                }
            } else {
                throw Exception("HTTP ${response.code}: ${response.message}")
            }
            
        } catch (e: Exception) {
            Log.e("ImageGeneration", "❌ Erro na geração de imagem: ${e.message}")
            throw e
        }
    }
    
    private suspend fun makeRequestWithTimeout(url: String): Response {
        val client = OkHttpClient.Builder()
            .connectTimeout(120, TimeUnit.SECONDS)  // 120 segundos
            .readTimeout(120, TimeUnit.SECONDS)     // 120 segundos
            .writeTimeout(120, TimeUnit.SECONDS)    // 120 segundos
            .addInterceptor { chain ->
                val request = chain.request()
                Log.d("Network", "🌐 Requisição: ${request.url}")
                chain.proceed(request)
            }
            .build()
            
        val request = Request.Builder()
            .url(url)
            .addHeader("User-Agent", "NutriLivre-Android/1.0")
            .build()
            
        return client.newCall(request).execute()
    }
    
    private suspend fun testBasicConnectivity() {
        try {
            val testUrl = "https://www.google.com"
            val response = URL(testUrl).openConnection() as HttpURLConnection
            response.connectTimeout = 5000
            response.readTimeout = 5000
            response.requestMethod = "HEAD"
            response.connect()
            
            if (response.responseCode == 200) {
                Log.d("ImageGeneration", "✅ Conectividade OK (Google response: ${response.responseCode})")
            } else {
                Log.w("ImageGeneration", "⚠️ Conectividade limitada (Google response: ${response.responseCode})")
            }
        } catch (e: Exception) {
            Log.w("ImageGeneration", "⚠️ Problema de conectividade: ${e.message}")
        }
    }
}
```

### 2. **GeminiServiceImpl.kt** (core-data)

#### **Problema Atual:**
```kotlin
// Sem retry logic
override suspend fun generateImageForRecipe(recipe: ReceitaEntity): ReceitaEntity {
    val imageUrl = imageGenerationService.generateRecipeImage(recipe.nome)
    return recipe.copy(imagemUrl = imageUrl)
}
```

#### **Solução - Implementar:**
```kotlin
override suspend fun generateImageForRecipe(recipe: ReceitaEntity): ReceitaEntity {
    Log.d("GeminiServiceImpl", "🎨 Iniciando geração de imagem para receita: ${recipe.nome}")
    
    try {
        val imageUrl = imageGenerationService.generateRecipeImageWithRetry(recipe.nome)
        Log.d("GeminiServiceImpl", "✅ Imagem gerada com sucesso para: ${recipe.nome}")
        Log.d("GeminiServiceImpl", "🖼️ URL da imagem: $imageUrl")
        return recipe.copy(imagemUrl = imageUrl)
    } catch (e: Exception) {
        Log.e("GeminiServiceImpl", "❌ Erro ao gerar imagem para ${recipe.nome}: ${e.message}")
        // Fallback: retornar receita sem imagem
        return recipe.copy(imagemUrl = "")
    }
}

// Adicionar método com retry
suspend fun generateImageForRecipeWithRetry(recipe: ReceitaEntity): ReceitaEntity {
    val maxRetries = 3
    var lastException: Exception? = null
    
    repeat(maxRetries) { attempt ->
        try {
            Log.d("GeminiServiceImpl", "📞 Tentativa ${attempt + 1}/$maxRetries para gerar imagem")
            return generateImageForRecipe(recipe)
        } catch (e: Exception) {
            lastException = e
            Log.w("GeminiServiceImpl", "❌ Tentativa ${attempt + 1} falhou: ${e.message}")
            
            if (attempt < maxRetries - 1) {
                val delay = 2000L * (attempt + 1)
                Log.d("GeminiServiceImpl", "⏳ Aguardando ${delay}ms antes da próxima tentativa...")
                delay(delay)
            }
        }
    }
    
    Log.e("GeminiServiceImpl", "❌ Todas as tentativas falharam para: ${recipe.nome}")
    throw lastException ?: Exception("Falha na geração de imagem após $maxRetries tentativas")
}
```

### 3. **ChatViewModel.kt** (feature-receitas)

#### **Problema Atual:**
```kotlin
// Sem logs detalhados
fun generateRecipeFromChat() {
    viewModelScope.launch {
        val recipe = chatService.generateRecipeFromConversation(...)
        val recipeWithImage = chatService.generateImageForRecipe(recipe)
        receitasRepository.addReceita(recipeWithImage)
    }
}
```

#### **Solução - Implementar:**
```kotlin
fun generateRecipeFromChat() {
    viewModelScope.launch {
        try {
            _uiState.value = UiState.Loading
            
            Log.d("ChatViewModel", "🚀 INICIANDO GERAÇÃO DE RECEITA DO CHAT")
            Log.d("ChatViewModel", "👤 Usuário atual: $currentUserId")
            Log.d("ChatViewModel", "📧 Email do usuário: $currentUserEmail")
            Log.d("ChatViewModel", "💬 Mensagens no chat: ${_messages.value.size}")
            
            // 1. Gerar receita
            Log.d("ChatViewModel", "📝 Gerando receita com Gemini AI...")
            val recipe = chatService.generateRecipeFromConversation(
                _messages.value,
                currentUserId,
                currentUserEmail
            )
            
            Log.d("ChatViewModel", "📝 Receita gerada: ${recipe.nome}")
            Log.d("ChatViewModel", "🆔 ID da receita: ${recipe.id}")
            Log.d("ChatViewModel", "📋 Ingredientes: ${recipe.ingredientes.size}")
            Log.d("ChatViewModel", "👨‍🍳 Modo de preparo: ${recipe.modoPreparo.size}")
            
            // 2. Gerar imagem com retry
            Log.d("ChatViewModel", "🎨 Iniciando geração de imagem para receita: ${recipe.nome}")
            val recipeWithImage = chatService.generateImageForRecipeWithRetry(recipe)
            
            Log.d("ChatViewModel", "✅ Imagem gerada com sucesso para: ${recipe.nome}")
            Log.d("ChatViewModel", "🖼️ URL da imagem: ${recipeWithImage.imagemUrl}")
            
            // 3. Salvar no repositório
            Log.d("ChatViewModel", "💾 Salvando receita no repositório...")
            receitasRepository.addReceita(recipeWithImage)
            
            Log.d("ChatViewModel", "✅ Receita salva com sucesso!")
            Log.d("ChatViewModel", "🎉 GERAÇÃO DE RECEITA CONCLUÍDA COM SUCESSO!")
            
            _uiState.value = UiState.Success(recipeWithImage)
            
        } catch (e: Exception) {
            Log.e("ChatViewModel", "❌ Erro na geração de receita: ${e.message}")
            Log.e("ChatViewModel", "❌ Stack trace: ${e.stackTraceToString()}")
            _uiState.value = UiState.Error(e.message ?: "Erro desconhecido na geração da receita")
        }
    }
}
```

### 4. **network_security_config.xml** (app)

#### **Criar arquivo:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">text-to-image-template.izaelnunesred.workers.dev</domain>
        <domain includeSubdomains="true">zfbkkrtpnoteapbxfuos.supabase.co</domain>
    </domain-config>
</network-security-config>
```

#### **Adicionar no AndroidManifest.xml:**
```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

---

## 🔍 **Como Testar as Implementações**

### 1. **Teste Básico**
```kotlin
// No TelaInicial.kt ou em um teste
val imageService = ImageGenerationService()
try {
    val imageUrl = imageService.generateRecipeImage("Bolo de Chocolate")
    Log.d("TEST", "✅ Sucesso! URL: $imageUrl")
} catch (e: Exception) {
    Log.e("TEST", "❌ Erro: ${e.message}")
}
```

### 2. **Teste com Retry**
```kotlin
val geminiService = GeminiServiceImpl()
val recipe = ReceitaEntity(nome = "Bolo de Chocolate", ...)
try {
    val recipeWithImage = geminiService.generateImageForRecipeWithRetry(recipe)
    Log.d("TEST", "✅ Sucesso! Imagem: ${recipeWithImage.imagemUrl}")
} catch (e: Exception) {
    Log.e("TEST", "❌ Erro: ${e.message}")
}
```

### 3. **Monitorar Logs**
```bash
adb logcat | grep -E "(ChatViewModel|ImageGeneration|GeminiServiceImpl|Network)"
```

---

## ✅ **Checklist de Implementação**

- [ ] **ImageGenerationService.kt**: Aumentar timeout para 120s
- [ ] **ImageGenerationService.kt**: Adicionar logs detalhados
- [ ] **ImageGenerationService.kt**: Implementar teste de conectividade
- [ ] **GeminiServiceImpl.kt**: Adicionar retry logic
- [ ] **GeminiServiceImpl.kt**: Adicionar logs detalhados
- [ ] **ChatViewModel.kt**: Adicionar logs detalhados
- [ ] **ChatViewModel.kt**: Implementar tratamento de erros
- [ ] **network_security_config.xml**: Criar arquivo
- [ ] **AndroidManifest.xml**: Adicionar network security config
- [ ] **Testes**: Executar testes básicos
- [ ] **Logs**: Verificar logs detalhados

---

## 🚀 **Resultado Esperado**

Após implementar todas as correções:

1. **Timeout**: 120 segundos (suficiente para o Worker)
2. **Retry**: 3 tentativas automáticas
3. **Logs**: Detalhados para debug
4. **Fallback**: Receita sem imagem em caso de falha
5. **Performance**: Melhor confiabilidade

**O sistema deve funcionar perfeitamente!** 🎉 