import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { VouchersView } from "@/features/vouchers/VouchersView";
export const metadata: Metadata = { title: "Vouchers" };
export default function VouchersPage() { return <><PageHeader title="Vouchers" description="Create scratch-card batches for counter sales and test the customer voucher flow." /><VouchersView /></>; }
