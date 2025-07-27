import { GoogleGenerativeAI } from '@google/generative-ai';

interface Env {
    GEMINI_API_KEY: string;
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
              const prompt = url.searchParams.get('prompt') || 'A beautiful, appetizing, professional food photograph';

            // Initialize Google Generative AI
            const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

            // First, enhance the prompt using Gemini
            const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

            const enhancedPrompt = await geminiModel.generateContent(`
                    You are a professional food photographer. Create a detailed, appetizing description for a food photograph of: ${prompt}

                                    The description should be:
                                            - Specific and detailed
                                                    - Focus on visual appeal and presentation
                                                            - Include lighting, composition, and styling details
                                                                    - Make the food look delicious and professional
                                                                            - Keep it under 200 words

                                                                                            Return only the enhanced description, nothing else.
                                                                                                  `);

            const enhancedText = enhancedPrompt.response.text();

            // Generate image using Imagen 3
            const imageModel = genAI.getGenerativeModel({ model: 'imagen-3.0-generate-002' });

            const imageResult = await imageModel.generateImages({
                      prompt: enhancedText,
                      numberOfImages: 1,
                      outputMimeType: 'image/jpeg',
                      aspectRatio: '4:3'
            });

            if (!imageResult.images || imageResult.images.length === 0) {
                      throw new Error('No image generated');
            }

            const imageData = imageResult.images[0];

            // Convert base64 to Uint8Array (compatible with Cloudflare Workers)
            const imageBytes = Uint8Array.from(atob(imageData.data), c => c.charCodeAt(0));

            return new Response(imageBytes, {
                      headers: {
                                  'content-type': 'image/jpeg',
                                  'Access-Control-Allow-Origin': '*',
                                  'Cache-Control': 'public, max-age=3600',
                      },
            });

      } catch (error: any) {
              console.error('Error generating image:', error);

            // Return a fallback image or error response
            return new Response(JSON.stringify({ 
                                                       error: 'Failed to generate image',
                      message: error.message 
            }), {
                      status: 500,
                      headers: {
                                  'content-type': 'application/json',
                                  'Access-Control-Allow-Origin': '*',
                      },
            });
      }
    },
};
