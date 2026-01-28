import React from "react";
import MemberTable from "../../../components/admin/MemberTable";

const ApprovedMembers: React.FC = () => {
    return <MemberTable title="Approved Members" defaultStatus="Active" context="approved" />;
};

export default ApprovedMembers;
