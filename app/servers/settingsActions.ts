"use server";

import { settings } from "../../lib/services/settingsService";

export async function getSettingsAction() {
    return settings;
}
