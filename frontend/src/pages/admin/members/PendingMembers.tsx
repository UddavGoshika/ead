import React from "react";
import MemberTable from "../../../components/admin/MemberTable";

const PendingMembers: React.FC = () => {
    return <MemberTable title="Unapproved Members" defaultStatus="All" context="pending" />;
};

export default PendingMembers;
