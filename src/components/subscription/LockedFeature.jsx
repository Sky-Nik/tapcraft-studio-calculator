import React, { useState } from "react";
import { Lock } from "lucide-react";
import UpgradeModal from "./UpgradeModal";

export default function LockedFeature({ children, requiredTier = "maker", featureName, hasAccess }) {
  const [showModal, setShowModal] = useState(false);

  if (hasAccess) return children;

  return (
    <>
      <div
        className="relative cursor-pointer select-none"
        onClick={() => setShowModal(true)}
      >
        <div className="pointer-events-none blur-[3px] opacity-60">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-[1px] rounded-xl z-10">
          <div className="flex items-center gap-2 bg-background/90 border border-border px-4 py-2 rounded-full shadow-lg">
            <Lock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              Upgrade to <span className="capitalize font-bold text-primary">{requiredTier}</span>
            </span>
          </div>
        </div>
      </div>
      <UpgradeModal
        open={showModal}
        onClose={() => setShowModal(false)}
        requiredTier={requiredTier}
        featureName={featureName}
      />
    </>
  );
}