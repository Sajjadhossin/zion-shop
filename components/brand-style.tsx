import { getStoreSettings } from "@/lib/queries/store";
import { brandRamp } from "@/lib/brand";

/** Injects brand-colour overrides from the store's settings (white-label). */
export async function BrandStyle() {
  const settings = await getStoreSettings();
  const css = brandRamp(settings.primaryColor);
  if (!css) return null;
  return <style dangerouslySetInnerHTML={{ __html: `:root{${css}}` }} />;
}
