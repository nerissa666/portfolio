import { cleanAllTranslations } from "@/app/db/redis";

export async function cleanAllTranslationsAction() {
  await cleanAllTranslations();
}
