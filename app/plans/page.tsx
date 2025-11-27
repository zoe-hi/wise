import { listPlansAction } from "../servers/planActions";
import { PlansPageClient } from "./PlansPageClient";

export default async function PlansPage() {
  const plans = await listPlansAction();
  return <PlansPageClient initialPlans={plans} />;
}

