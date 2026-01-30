import React from "react";
import MemberTable from "../../../components/admin/MemberTable";
import type { Member } from "../../../components/admin/MemberTable";

const FreeMembers: React.FC = () => {
    return (
        <MemberTable
            title="Free Members"
            context="free"
        />
    );
};

export default FreeMembers;
