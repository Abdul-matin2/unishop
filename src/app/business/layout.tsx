import { requireBusiness } from "@/lib/auth";
import { getBusinessByOwner } from "@/lib/db";
import { BusinessGate, type BusinessGateState } from "./business-gate";

function getInitials(name: string | null) {
  return (name ?? "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireBusiness();
  const business = await getBusinessByOwner(user.id);

  let state: BusinessGateState;
  if (!business) {
    state = { kind: "none" };
  } else if (business.status === "pending") {
    state = { kind: "pending" };
  } else if (business.status === "rejected") {
    state = { kind: "rejected", reason: business.rejection_reason };
  } else {
    state = { kind: "approved" };
  }

  return (
    <BusinessGate
      state={state}
      businessName={business?.business_name}
      user={{
        name: user.full_name ?? user.email,
        email: user.email,
        initials: getInitials(user.full_name),
      }}
    >
      {children}
    </BusinessGate>
  );
}
