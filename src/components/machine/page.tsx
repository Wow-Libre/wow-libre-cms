"use client";
import React from "react";
import { SlotMachine } from "@/features/slot-machine";

interface MachineProps {
  serverId: number;
  characterId: number;
  token: string;
  accountId: number;
  t: (key: string, options?: any) => string;
  language: string;
}

const SlotMachinePage: React.FC<MachineProps> = ({
  serverId,
  characterId,
  accountId,
  token,
  t,
  language,
}) => {
  return (
    <SlotMachine
      serverId={serverId}
      characterId={characterId}
      accountId={accountId}
      token={token}
      t={t}
      language={language}
    />
  );
};

export default SlotMachinePage;
