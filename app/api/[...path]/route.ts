import { NextRequest, NextResponse } from "next/server";

async function forwardRequest(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const resolvedParams = await params;
    const path = (resolvedParams.path || []).join("/");
    const url = new URL(request.url);
    const rawBackendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    const backendUrl = rawBackendUrl.replace(/\/+$/, "");
    const targetUrl = `${backendUrl}/${path}${url.search}`;

    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("origin");

    const reqInit: RequestInit = {
      method: request.method,
      headers: headers,
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      const body = await request.text();
      if (body) {
        reqInit.body = body;
      }
    }

    const response = await fetch(targetUrl, reqInit);
    const data = await response.text();

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });

    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to communicate with backend server" },
      { status: 502 }
    );
  }
}

export const GET = forwardRequest;
export const POST = forwardRequest;
export const PUT = forwardRequest;
export const PATCH = forwardRequest;
export const DELETE = forwardRequest;
export const OPTIONS = forwardRequest;
