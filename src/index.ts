interface Env {
    AI: any;
    GEMINI_API_KEY: string;
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    SUPABASE_BUCKET: string;
}

export default {
    async fetch(request: Request, env: Env) {
        // Handle CORS
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            });
        }

        try {
            // Parse the request
            const url = new URL(request.url);
            const originalPrompt = url.searchParams.get('prompt') || 'A beautiful, appetizing, professional food photograph';

            console.log('🎨 Iniciando geração de imagem...');
            console.log(`📝 Prompt original: ${originalPrompt}`);

            // Step 1: Enhance the prompt using Gemini Flash
            console.log('🔄 Passo 1: Aprimorando prompt com Gemini Flash...');
            
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
            
            const promptEnhancer = genAI.getGenerativeModel({ 
                model: 'gemini-2.0-flash'
            });

            const enhancementPrompt = `You are a professional food photographer and AI prompt engineer. 
            Your task is to enhance a simple food description into a detailed, professional prompt for AI image generation.
            
            Original request: "${originalPrompt}"
            
            Create an enhanced prompt that will generate a beautiful, appetizing, professional food photograph. 
            Focus on:
            - Professional food photography style
            - Perfect lighting and composition
            - Appetizing presentation
            - High quality and visual appeal
            - Specific details about the food
            - Professional camera settings and angles
            
            Return ONLY the enhanced prompt in English, nothing else. No explanations, no additional text, just the prompt.`;

            const enhancementResult = await promptEnhancer.generateContent(enhancementPrompt);
            const enhancedPrompt = await enhancementResult.response.text();

            console.log(`📝 Prompt aprimorado: ${enhancedPrompt}`);

            // Step 2: Generate image using Stable Diffusion XL Base 1.0
            console.log('🔄 Passo 2: Gerando imagem com Stable Diffusion XL Base 1.0...');

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

            console.log('✅ Imagem gerada com sucesso!');
            console.log(`📊 Tamanho: ${response.length} bytes`);

            // Step 3: Upload to Supabase Storage
            console.log('🔄 Passo 3: Fazendo upload para Supabase Storage...');
            
            const imageUrl = await uploadToSupabase(response, originalPrompt, env);
            
            if (!imageUrl) {
                throw new Error('Falha no upload para Supabase');
            }

            console.log(`✅ Upload concluído! URL: ${imageUrl}`);

            // Return the image URL instead of the image data
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

        } catch (error: any) {
            console.error('❌ Erro ao gerar imagem:', error.message);
            
            // Return error response
            return new Response(JSON.stringify({
                error: 'Failed to generate image',
                message: error.message,
                model: 'stable-diffusion-xl-base-1.0-with-gemini-enhancement'
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }
    },
};

async function uploadToSupabase(imageBytes: ArrayBuffer, prompt: string, env: Env): Promise<string | null> {
    try {
        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedPrompt = prompt.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
        const fileName = `ai_generated_${sanitizedPrompt}_${timestamp}.jpg`;
        
        console.log(`📁 Nome do arquivo: ${fileName}`);
        console.log(`📊 Tamanho da imagem: ${imageBytes.byteLength} bytes`);

        // Upload to Supabase Storage - Direct file upload
        const uploadUrl = `${env.SUPABASE_URL}/storage/v1/object/${env.SUPABASE_BUCKET}/${fileName}`;
        
        const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'apikey': env.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
                'Content-Type': 'image/jpeg',
            },
            body: imageBytes
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error(`❌ Erro no upload Supabase: ${uploadResponse.status} - ${errorText}`);
            throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
        }

        // Get public URL
        const publicUrl = `${env.SUPABASE_URL}/storage/v1/object/public/${env.SUPABASE_BUCKET}/${fileName}`;
        
        console.log(`✅ Upload bem-sucedido! URL pública: ${publicUrl}`);
        return publicUrl;

    } catch (error) {
        console.error('❌ Erro ao fazer upload para Supabase:', error);
        return null;
    }
}


