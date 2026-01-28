import React from "react";
import MemberTable from "../../../components/admin/MemberTable";

const PendingMembers: React.FC = () => {
    return <MemberTable title="Pending Members" defaultStatus="Pending" context="pending" />;
};

export default PendingMembers;
