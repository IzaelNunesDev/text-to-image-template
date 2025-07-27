interface Env {
    AI: any;
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

            // Enhance the prompt for better image generation
            const enhancedText = `Create a detailed, professional image of: ${prompt}. 
            The image should be:
            - High quality and visually appealing
            - Well-lit and properly composed
            - Professional and artistic
            - Detailed and realistic`;

            // Generate image using Cloudflare Workers AI with Stable Diffusion
            const imageResult = await env.AI.run('@cf/stabilityai/stable-diffusion-xl-base-1.0', {
                      prompt: enhancedText,
                      num_steps: 20,
                      width: 1024,
                      height: 1024
            });

            if (!imageResult) {
                      throw new Error('No image generated');
            }

            return new Response(imageResult, {
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
