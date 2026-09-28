import { createPolar } from "@polar-sh/sdk/2026-04";

const accessToken = process.env.POLAR_ACCESS_TOKEN?.trim();

if (!accessToken) {
  throw new Error(
    "POLAR_ACCESS_TOKEN is missing."
  );
}

export const polar = createPolar({
  accessToken,
  environment:
    process.env.POLAR_SERVER === "sandbox"
      ? "sandbox"
      : "production",
});

export async function getPolarCustomerState(
  externalCustomerId: string
) {
  return polar.customers.getStateExternal(
    externalCustomerId
  );
}