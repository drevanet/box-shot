import { Webhooks } from "@polar-sh/nextjs";
import { recordPolarWebhook } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const webhookSecret = process.env.POLAR_WEBHOOK_SECRET?.trim();

if (!webhookSecret) {
  console.error("POLAR_WEBHOOK_SECRET is missing.");
}

export const POST = Webhooks({
  webhookSecret: webhookSecret || "",

  onPayload: async (payload: any) => {
    try {
      const data = payload?.data || {};
      const eventType = String(payload?.type || "unknown");

      await recordPolarWebhook({
        eventType,

        eventId: data?.id
          ? String(data.id)
          : null,

        externalCustomerId:
          data?.customer?.external_id
            ? String(data.customer.external_id)
            : null,

        subscriptionId:
          eventType.startsWith("subscription.")
            ? data?.id
              ? String(data.id)
              : null
            : null,

        status:
          data?.status
            ? String(data.status)
            : null,

        // IMPORTANT: pass the object, not JSON.stringify(payload)
        payload,
      });

      console.log("POLAR WEBHOOK PROCESSED:", eventType);
    } catch (error) {
      console.error(
        "POLAR WEBHOOK DATABASE ERROR:",
        error
      );

      // Don't throw here if you want the webhook
      // verification to remain successful.
    }
  },
});