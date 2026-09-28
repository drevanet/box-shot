import { Checkout } from "@polar-sh/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

const checkoutHandler = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/editor?checkout=success`,
  returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing`,
  server: process.env.POLAR_SERVER === "sandbox" ? "sandbox" : "production"
});

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (!process.env.POLAR_ACCESS_TOKEN || !process.env.POLAR_PRODUCT_ID) {
    return NextResponse.json(
      { error: "Polar is not configured. Add POLAR_ACCESS_TOKEN and POLAR_PRODUCT_ID." },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const checkoutUrl = new URL(url);
  checkoutUrl.searchParams.set("products", process.env.POLAR_PRODUCT_ID);
  checkoutUrl.searchParams.set("customerExternalId", user.id);
  checkoutUrl.searchParams.set("customerEmail", user.email);
  checkoutUrl.searchParams.set("customerName", user.name || "");

  return checkoutHandler(new NextRequest(checkoutUrl));
}
