import React from "react";
import MemberTable from "../../../components/admin/MemberTable";
import type { Member } from "../../../components/admin/MemberTable";

const ReportedMembers: React.FC = () => {
    return <MemberTable title="Reported Members" context="reported" />;
};

export default ReportedMembers;
