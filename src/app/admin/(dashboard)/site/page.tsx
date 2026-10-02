import { getSite, STORAGE_MODE } from "@/lib/store";
import SiteForm from "@/components/admin/SiteForm";

export default async function AdminSitePage() {
  const site = await getSite();
  return <SiteForm site={site} storageMode={STORAGE_MODE} />;
}
