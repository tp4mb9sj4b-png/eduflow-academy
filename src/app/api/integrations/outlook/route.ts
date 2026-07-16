import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Real Microsoft OAuth2 (Azure AD v2) flow for admins to connect Outlook Calendar.
// Requires MICROSOFT_CLIENT_ID / MICROSOFT_CLIENT_SECRET / MICROSOFT_TENANT_ID
// in .env — see .env.example. Uses Microsoft Graph's /me/calendar once connected.
// GET  /api/integrations/outlook           -> redirects admin to Microsoft consent screen
// GET  /api/integrations/outlook?code=...  -> OAuth callback, stores tokens on Admin

const TENANT = process.env.MICROSOFT_TENANT_ID || "common";
const AUTH_BASE = `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0`;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  if (!process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "MICROSOFT_CLIENT_ID / MICROSOFT_CLIENT_SECRET manquants dans .env" },
      { status: 501 }
    );
  }

  const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/outlook`;
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    const params = new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID,
      response_type: "code",
      redirect_uri: redirectUri,
      response_mode: "query",
      scope: "offline_access Calendars.ReadWrite",
    });
    return NextResponse.redirect(`${AUTH_BASE}/authorize?${params.toString()}`);
  }

  const tokenRes = await fetch(`${AUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const tokens = await tokenRes.json();

  await prisma.admin.update({
    where: { email: session.user.email },
    data: { outlookTokens: JSON.stringify(tokens) },
  });

  return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/admin?connected=outlook`);
}
