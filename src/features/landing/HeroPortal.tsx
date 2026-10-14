"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PhoneFrame } from "@/features/captive-portal/PhoneFrame";
import { PortalView } from "@/features/captive-portal/PortalView";
import { defaultPortalConfig } from "@/lib/mock-data/portal-defaults";

/** The hero's one orchestrated moment: a working captive portal, rising into place once. */
export function HeroPortal() {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <PhoneFrame label="Interactive captive portal demo">
        <PortalView config={defaultPortalConfig} />
      </PhoneFrame>
    </motion.div>
  );
}
