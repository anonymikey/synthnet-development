export type GatewayType = "mikrotik" | "omada";
export type SubscriberStatus = "Active" | "Suspended" | "Pending Callback";

export interface Subscriber {
  id: string;
  name: string;
  unit: string;
  gateway: GatewayType;
  plan: "Base" | "Plus" | "Max";
  status: SubscriberStatus;
  balance: string;
  access: { kind: "mac"; value: string } | { kind: "pppoe"; username: string; password: string };
}

export const SUBSCRIBERS: Subscriber[] = [
  { id: "s-101", name: "Amina Wanjiku", unit: "A-101", gateway: "mikrotik", plan: "Plus", status: "Active", balance: "18.4 GB", access: { kind: "mac", value: "84:2E:27:9A:10:4C" } },
  { id: "s-102", name: "Brian Otieno", unit: "A-102", gateway: "omada", plan: "Base", status: "Pending Callback", balance: "6.2 GB", access: { kind: "mac", value: "AC:15:A2:73:91:08" } },
  { id: "s-203", name: "Cynthia Njeri", unit: "B-203", gateway: "mikrotik", plan: "Max", status: "Active", balance: "42.8 GB", access: { kind: "pppoe", username: "cynthia.b203", password: "••••••••" } },
  { id: "s-204", name: "David Kamau", unit: "B-204", gateway: "omada", plan: "Plus", status: "Suspended", balance: "0 GB", access: { kind: "mac", value: "F0:9F:C2:44:7D:2A" } },
  { id: "s-305", name: "Esther Achieng", unit: "C-305", gateway: "mikrotik", plan: "Base", status: "Active", balance: "9.7 GB", access: { kind: "pppoe", username: "esther.c305", password: "••••••••" } },
];

export const PLAN_PRICES = { Base: 600, Plus: 900, Max: 1200 } as const;

export function formatKes(amount: number) {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

export function gatewayLabel(gateway: GatewayType) {
  return gateway === "mikrotik" ? "MikroTik" : "Omada";
}

export function statusTone(status: SubscriberStatus) {
  return status === "Active" ? "success" : status === "Suspended" ? "danger" : "warning";
}

export function subscriberCounts() {
  return {
    total: SUBSCRIBERS.length,
    active: SUBSCRIBERS.filter((subscriber) => subscriber.status === "Active").length,
    pending: SUBSCRIBERS.filter((subscriber) => subscriber.status === "Pending Callback").length,
  };
}
