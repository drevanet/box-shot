import { Webhooks } from "@polar-sh/nextjs";
import { recordPolarWebhook } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const webhookSecret = process.env.POLAR_WEBHOOK_SECRET?.trim();

export const POST = Webhooks({
  webhookSecret: webhookSecret || "",

  onPayload: async (payload: any) => {
    try {
      const data = payload?.data || {};
      const eventType = String(payload?.type || "unknown");

      const externalCustomerId =
        data?.customer?.external_id
          ? String(data.customer.external_id)
          : null;

      const subscriptionId =
        eventType.startsWith("subscription.")
          ? String(data?.id || "")
          : null;

      const status =
        data?.status
          ? String(data.status)
          : null;

      console.log("POLAR WEBHOOK:", {
        eventType,
        eventId: payload?.id ?? null,
        externalCustomerId,
        subscriptionId,
        status,
      });

      await recordPolarWebhook({
        eventType,
        eventId: payload?.id
          ? String(payload.id)
          : null,
        externalCustomerId,
        subscriptionId,
        status,
        payload,
      });

      console.log("POLAR WEBHOOK SAVED");
    } catch (error) {
      console.error(
        "POLAR WEBHOOK PERSISTENCE ERROR:",
        error
      );

      throw error;
    }
  },
});