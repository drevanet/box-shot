import { CustomerPortal } from "@polar-sh/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { polar } from "@/lib/polar";

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
      return "";
    }

    try {
      // Your checkout uses user.id as customerExternalId.
      // Resolve that external ID to Polar's real customer ID.
      const customer =
        await polar.customers.getExternal(user.id);

      return customer.id;
    } catch (error) {
      console.error("POLAR CUSTOMER LOOKUP ERROR:", error);
      return "";
    }
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
          error: "Polar is not configured.",
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
            ? String(
                error?.message ||
                  "Unable to open the subscription portal."
              )
            : "Unable to open the subscription portal.",
      },
      { status: 500 }
    );
  }
}