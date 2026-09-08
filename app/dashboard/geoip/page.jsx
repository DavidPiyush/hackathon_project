import { requireUser } from "@/lib/auth/dal";
import { GeoIpClient } from "@/components/dashboard/GeoIpClient";

export const metadata = {
  title: "GeoIP Intelligence",
  description:
    "Network and location context for observed sending infrastructure, with explicit limits on what geolocation can prove.",
};

export default async function GeoIpPage() {
  await requireUser("/dashboard/geoip");

  return <GeoIpClient />;
}
