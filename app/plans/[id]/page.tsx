import { notFound } from "next/navigation";
import {
  getPlanDetailAction,
  getPlanActivityAction,
} from "../../servers/planActions";
import { getSettingsAction } from "../../servers/settingsActions";
import { PlanDetailClient } from "./PlanDetailClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlanDetailPage({ params }: PageProps) {
  const { id } = await params;

  let planData;
  let activity;
  let settings;

  try {
    planData = await getPlanDetailAction(id);
    activity = await getPlanActivityAction(id);
    settings = await getSettingsAction();
  } catch (e) {
    return notFound();
  }

  const { plan, steps } = planData;

  return (
    <PlanDetailClient
      plan={plan}
      steps={steps}
      activity={activity}
      approvalThreshold={settings.approvalThreshold}
    />
  );
}
