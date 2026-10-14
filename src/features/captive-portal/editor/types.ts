import type { PortalConfig } from "@/types/portal";

export interface PanelProps {
  config: PortalConfig;
  onChange: (next: PortalConfig) => void;
}

export interface ImagePanelProps extends PanelProps {
  onError: (message: string) => void;
}
