import React from "react";
import MemberTable from "../../../components/admin/MemberTable";

const DeactivatedMembers: React.FC = () => {
    return <MemberTable title="Deactivated Members" defaultStatus="Deactivated" context="deactivated" />;
};

export default DeactivatedMembers;
