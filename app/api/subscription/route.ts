import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPolarCustomerState } from "@/lib/polar";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ authenticated: false, active: false }, { status: 401 });
  }

  try {
    const state: any = await getPolarCustomerState(user.id);
    const activeSubscriptions = state?.active_subscriptions || [];

    return NextResponse.json({
      authenticated: true,
      active: activeSubscriptions.length > 0,
      subscriptions: activeSubscriptions.map((subscription: any) => ({
        id: subscription.id,
        productId: subscription.product_id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }))
    });
  } catch (error) {
    console.error("Subscription lookup failed:", error);
    return NextResponse.json({
      authenticated: true,
      active: false,
      subscriptions: [],
      error: "Unable to verify Polar subscription right now."
    });
  }
}
