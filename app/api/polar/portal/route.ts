import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createPolar } from "@polar-sh/sdk/2026-04";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getPolar() {
  const accessToken = process.env.POLAR_ACCESS_TOKEN?.trim();

  if (!accessToken) {
    throw new Error("POLAR_ACCESS_TOKEN is missing.");
  }

  return createPolar({
    accessToken,
    environment:
      process.env.POLAR_SERVER === "sandbox"
        ? "sandbox"
        : "production",
  });
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.redirect(
        new URL("/login", request.url)
      );
    }

    const polar = getPolar();

    /*
     * Your checkout uses:
     *
     * customerExternalId = user.id
     *
     * Polar can create the customer portal session
     * directly from that external customer ID.
     */
    const session =
      await polar.customerSessions.create({
        external_customer_id: user.id,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://www.revabox.online"}/editor`,
      });

    /*
     * Polar returns customerPortalUrl,
     * NOT session.url.
     */
    if (!session?.customer_portal_url) {
      console.error(
        "POLAR PORTAL: customerPortalUrl missing",
        session
      );

      return NextResponse.redirect(
        new URL("/pricing?error=portal-url", request.url)
      );
    }

    return NextResponse.redirect(
      session.customer_portal_url
    );
  } catch (error: any) {
    console.error("POLAR PORTAL ERROR:", {
      message: error?.message,
      name: error?.name,
      statusCode: error?.statusCode,
      status: error?.status,
      body: error?.body,
      stack: error?.stack,
    });

    return NextResponse.redirect(
      new URL("/pricing?error=portal", request.url)
    );
  }
}