const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, Range',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Missing id parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const downloadUrl = `https://drive.google.com/uc?export=download&id=${id}`;
    const rangeHeader = req.headers.get('Range');
    
    const headers: HeadersInit = {};
    if (rangeHeader) {
      headers['Range'] = rangeHeader;
    }

    const response = await fetch(downloadUrl, { headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const responseHeaders = new Headers(corsHeaders);
    responseHeaders.set('Content-Type', response.headers.get('Content-Type') || 'audio/mpeg');
    
    const contentLength = response.headers.get('Content-Length');
    if (contentLength) responseHeaders.set('Content-Length', contentLength);
    
    const contentRange = response.headers.get('Content-Range');
    if (contentRange) responseHeaders.set('Content-Range', contentRange);
    
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Cache-Control', 'public, max-age=31536000');

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});