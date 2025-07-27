    1 const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI('AIzaSyDiwB3lig9_fvI5wbBlILl32Ztqj41XO2I');
        
        console.log('Listando modelos disponíveis...');
        
        // Vamos tentar alguns modelos conhecidos
        const models = [
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-pro',
            'imagen-3.0-generate-002',
            'imagen-3.0-generate-001',
            'imagen-2.0-generate-001'
        ];
        
        for (const modelName of models) {
            try {
                console.log(`\nTestando modelo: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                
                if (modelName.includes('imagen')) {
                    // Para modelos de imagem, vamos tentar gerar uma imagem simples
                    const result = await model.generateContent('Um gato simples');
                    console.log(`✅ ${modelName} - Funcionando!`);
                } else {
                    // Para modelos de texto, vamos fazer um teste simples
                    const result = await model.generateContent('Teste');
                    console.log(`✅ ${modelName} - Funcionando!`);
                }
            } catch (error) {
                console.log(`❌ ${modelName} - Erro: ${error.message.split('[')[0]}`);
            }
        }
        
    } catch (error) {
        console.error('Erro geral:', error.message);
    }
}

listModels(); 