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

      // First, use Gemini to generate a better prompt for image generation
      const geminiTextResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `Generate a detailed, appetizing description for a food photograph of "${prompt}". The description should be suitable for an AI image generator. Focus on visual details like colors, textures, presentation, lighting, and composition. Return only the description, no other text.`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 200,
            }
          })
        }
      );

      if (!geminiTextResponse.ok) {
        throw new Error(`Gemini text API error: ${geminiTextResponse.status}`);
      }

      const geminiTextData = await geminiTextResponse.json() as any;
      const enhancedPrompt = geminiTextData.candidates?.[0]?.content?.parts?.[0]?.text || prompt;

      // Use a free image generation service as fallback
      // For now, we'll use a placeholder service that generates food-related images
      const imageUrl = `https://source.unsplash.com/featured/?food,${encodeURIComponent(prompt)}`;
      
      // Fetch the image from Unsplash
      const imageResponse = await fetch(imageUrl);
      
      if (!imageResponse.ok) {
        throw new Error(`Image service error: ${imageResponse.status}`);
      }

      const imageBuffer = await imageResponse.arrayBuffer();

      return new Response(imageBuffer, {
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
} satisfies ExportedHandler<Env>;
