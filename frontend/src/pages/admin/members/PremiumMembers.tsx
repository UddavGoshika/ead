import React from "react";
import MemberTable from "../../../components/admin/MemberTable";
import type { Member } from "../../../components/admin/MemberTable";

const PremiumMembers: React.FC = () => {
    return <MemberTable title="Premium Members" context="premium" />;
};

export default PremiumMembers;
