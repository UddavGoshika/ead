import React from "react";
import MemberTable from "../../../components/admin/MemberTable";

const DeletedMembers: React.FC = () => {
    return <MemberTable title="Deleted Members" defaultStatus="Deleted" context="deleted" />;
};

export default DeletedMembers;
