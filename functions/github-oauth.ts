import { createClient } from "npm:@blinkdotnew/sdk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

// Simple in-memory rate limiter (per-instance)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 20; // 20 requests
const WINDOW_MS = 60000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const limitInfo = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  if (now - limitInfo.lastReset > WINDOW_MS) {
    limitInfo.count = 1;
    limitInfo.lastReset = now;
    rateLimitMap.set(ip, limitInfo);
    return false;
  }

  if (limitInfo.count >= RATE_LIMIT) {
    return true;
  }

  limitInfo.count++;
  rateLimitMap.set(ip, limitInfo);
  return false;
}

async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Get client IP for rate limiting
  // Note: In Deno Deploy, the IP is often in a specific header or available via req info
  const clientIp = req.headers.get("x-forwarded-for") || "unknown";

  if (isRateLimited(clientIp)) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    const projectId = Deno.env.get("BLINK_PROJECT_ID")!;
    const secretKey = Deno.env.get("BLINK_SECRET_KEY")!;
    const blink = createClient({ projectId, secretKey });

    if (action === "authorize") {
      const clientId = Deno.env.get("GITHUB_CLIENT_ID");
      const redirectUri = Deno.env.get("GITHUB_REDIRECT_URI");
      const scopes = ["repo", "user"];
      
      const authUrl = new URL("https://github.com/login/oauth/authorize");
      authUrl.searchParams.set("client_id", clientId!);
      authUrl.searchParams.set("redirect_uri", redirectUri!);
      authUrl.searchParams.set("scope", scopes.join(" "));
      authUrl.searchParams.set("state", crypto.randomUUID());
      
      return new Response(JSON.stringify({ url: authUrl.toString() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "callback") {
      const code = url.searchParams.get("code");
      const clientId = Deno.env.get("GITHUB_CLIENT_ID");
      const clientSecret = Deno.env.get("GITHUB_CLIENT_SECRET");
      
      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
        }),
      });
      
      const tokens = await tokenResponse.json();
      
      if (tokens.error) {
        return new Response(JSON.stringify({ error: tokens.error_description }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // In a real app, we'd store tokens in DB associated with the user
      // For now, we'll just return success
      return new Response(JSON.stringify({ success: true, tokens }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("OAuth error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

Deno.serve(handler);