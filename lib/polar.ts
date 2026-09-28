import { createPolar } from "@polar-sh/sdk/2026-04";

export const polar = createPolar({
  accessToken: process.env.POLAR_ACCESS_TOKEN || "",
  environment: process.env.POLAR_SERVER === "sandbox" ? "sandbox" : "production"
});

export async function getPolarCustomerState(externalCustomerId: string) {
  return polar.customers.getStateExternal(externalCustomerId);
}
