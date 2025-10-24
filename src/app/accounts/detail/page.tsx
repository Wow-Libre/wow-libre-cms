import AccountDetail from "@/components/account/details";
import SuspenseBoundary from "@/components/utilities/suspense-boundary";
import WowheadTooltip from "@/utils/wowhead";
import React from "react";

const AccountPage: React.FC = () => (
  <>
    <SuspenseBoundary>
      <AccountDetail />
    </SuspenseBoundary>
    <WowheadTooltip />
  </>
);

export default AccountPage;
