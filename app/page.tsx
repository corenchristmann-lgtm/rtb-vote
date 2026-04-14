"use client";

import { useState } from "react";
import { IdentifyScreen } from "@/components/IdentifyScreen";
import { VoteScreen } from "@/components/VoteScreen";
import { ThanksScreen } from "@/components/ThanksScreen";
import type { Guest } from "@/lib/types";

type Step = "identify" | "vote" | "thanks";

export default function Home() {
  const [step, setStep] = useState<Step>("identify");
  const [guest, setGuest] = useState<Guest | null>(null);

  if (step === "identify") {
    return (
      <IdentifyScreen
        onIdentified={(g) => {
          setGuest(g);
          setStep("vote");
        }}
      />
    );
  }

  if (step === "vote" && guest) {
    return <VoteScreen guest={guest} onVoted={() => setStep("thanks")} />;
  }

  return <ThanksScreen />;
}
