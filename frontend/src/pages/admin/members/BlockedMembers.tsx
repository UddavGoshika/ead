import React from "react";
import MemberTable from "../../../components/admin/MemberTable";

const BlockedMembers: React.FC = () => {
    return <MemberTable title="Blocked Members" defaultStatus="Blocked" context="blocked" />;
};

export default BlockedMembers;
