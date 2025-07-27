const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAPI() {
    try {
        const genAI = new GoogleGenerativeAI('AIzaSyDiwB3lig9_fvI5wbBlILl32Ztqj41XO2I');
        
        // Teste simples com Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        console.log('Testando API do Gemini...');
        const result = await model.generateContent('Olá, como você está?');
        const response = await result.response;
        console.log('Resposta do Gemini:', response.text());
        
        console.log('\nTestando Imagen 3...');
        const imageModel = genAI.getGenerativeModel({ model: 'imagen-3.0-generate-002' });
        const imageResult = await imageModel.generateContent('Um gato simples');
        console.log('Resposta do Imagen:', imageResult.response);
        
    } catch (error) {
        console.error('Erro:', error.message);
    }
}

testAPI(); 