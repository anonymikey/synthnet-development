import type { CSSProperties } from "react";
import type { PortalFont, PortalTheme } from "@/types/portal";

/**
 * System font stacks only. A captive portal is served before the user has internet,
 * so it must not depend on web fonts or external CDNs.
 */
export const PORTAL_FONT_STACKS: Record<PortalFont, string> = {
  sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
  rounded: 'ui-rounded, "SF Pro Rounded", "Nunito", "Segoe UI", system-ui, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
};

export function portalBackgroundStyle(theme: PortalTheme): CSSProperties {
  if (theme.backgroundMode === "image" && theme.backgroundImage) {
    const shade = `rgb(0 0 0 / ${theme.imageOverlay / 100})`;
    return {
      backgroundColor: theme.backgroundColor,
      backgroundImage: `linear-gradient(${shade}, ${shade}), url("${theme.backgroundImage}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  if (theme.backgroundMode === "gradient") {
    return { backgroundImage: `linear-gradient(160deg, ${theme.backgroundColor}, ${theme.gradientEndColor})` };
  }
  return { backgroundColor: theme.backgroundColor };
}
