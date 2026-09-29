import { getSite } from "@/lib/store";
import { updateSiteAction } from "@/app/admin/actions";
import SiteForm from "@/components/admin/SiteForm";

export default async function AdminSitePage() {
  const site = await getSite();
  return (
    <div>
      <h1 className="font-caslon text-[26px] font-bold">site texts</h1>
      <SiteForm action={updateSiteAction} site={site} />
    </div>
  );
}
