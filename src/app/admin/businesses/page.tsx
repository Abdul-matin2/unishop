import { getAllBusinesses } from "@/lib/db";
import { BusinessManagement, type BusinessWithOwner } from "./business-management";

export default async function AdminBusinessesPage() {
  const businesses = (await getAllBusinesses()) as BusinessWithOwner[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manage Businesses</h1>
        <p className="mt-1 text-muted-foreground">
          Review, approve, and manage business accounts on UniShop.
        </p>
      </div>

      <BusinessManagement businesses={businesses} />
    </div>
  );
}
