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
     * IMPORTANT:
     * Your checkout uses:
     *
     * customerExternalId = user.id
     *
     * Therefore we first resolve the Polar customer
     * using that external ID.
     */
    const customer = await polar.customers.getExternal(user.id);

    if (!customer) {
      return NextResponse.redirect(
        new URL("/pricing?error=customer-not-found", request.url)
      );
    }

    /*
     * Create a Polar customer portal session.
     */
    const session =
      await polar.customerSessions.create({
        customerId: customer.id,
      });

    /*
     * Redirect the browser directly to Polar.
     */
    return NextResponse.redirect(session.url);
  } catch (error: any) {
    console.error("POLAR PORTAL ERROR:", {
      message: error?.message,
      statusCode: error?.statusCode,
      body: error?.body,
      stack: error?.stack,
    });

    return NextResponse.redirect(
      new URL("/pricing?error=portal", request.url)
    );
  }
}