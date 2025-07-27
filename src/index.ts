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

      // Call Gemini API to generate image
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:generateContent?key=${env.GEMINI_API_KEY}`,
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
                    text: `A beautiful, appetizing, professional food photograph of ${prompt}.`
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: 'image/jpeg',
              candidateCount: 1
            }
          })
        }
      );

      if (!geminiResponse.ok) {
        throw new Error(`Gemini API error: ${geminiResponse.status}`);
      }

      const geminiData = await geminiResponse.json() as any;
      
      // Extract the image data from Gemini response
      const imageData = geminiData.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      
      if (!imageData) {
        throw new Error('No image data received from Gemini API');
      }

      // Convert base64 to buffer
      const imageBuffer = Uint8Array.from(atob(imageData), c => c.charCodeAt(0));

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
