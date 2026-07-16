import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { google } from "googleapis";

// Real Google OAuth2 flow for admins to connect their Google Calendar.
// Requires GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in .env — see .env.example.
// GET  /api/integrations/google           -> redirects admin to Google consent screen
// GET  /api/integrations/google?code=...  -> OAuth callback, stores tokens on Admin

function getOAuthClient() {
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/google`;
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET manquants dans .env" },
      { status: 501 }
    );
  }

  const code = req.nextUrl.searchParams.get("code");
  const oauth2Client = getOAuthClient();

  if (!code) {
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["https://www.googleapis.com/auth/calendar"],
    });
    return NextResponse.redirect(url);
  }

  const { tokens } = await oauth2Client.getToken(code);
  await prisma.admin.update({
    where: { email: session.user.email },
    data: { googleTokens: JSON.stringify(tokens) },
  });

  return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/admin?connected=google`);
}
