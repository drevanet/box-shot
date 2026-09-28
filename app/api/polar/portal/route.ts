import { CustomerPortal } from "@polar-sh/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const portalHandler = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  returnUrl: `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/editor`,
  server:
    process.env.POLAR_SERVER === "sandbox"
      ? "sandbox"
      : "production",

  getCustomerId: async () => {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Authentication required.");
    }

    // This MUST match customerExternalId used during checkout.
    return user.id;
  },
});

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.redirect(
        new URL("/login?next=/editor", request.url)
      );
    }

    if (!process.env.POLAR_ACCESS_TOKEN) {
      return NextResponse.json(
        {
          error: "POLAR_ACCESS_TOKEN is not configured.",
        },
        { status: 500 }
      );
    }

    return portalHandler(request);
  } catch (error: any) {
    console.error("POLAR PORTAL ERROR:", error);

    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? String(error?.message || "Polar portal error.")
            : "Unable to open Polar subscription portal.",
      },
      { status: 500 }
    );
  }
}