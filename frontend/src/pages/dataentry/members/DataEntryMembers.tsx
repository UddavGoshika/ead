import React from "react";
import { useParams } from "react-router-dom";
import MemberTable from "../../../components/admin/MemberTable";
import type { MemberContext } from "../../../components/admin/MemberTable";

const DataEntryMembers: React.FC = () => {
    const { status } = useParams<{ status: string }>();

    let title = "Member Audit Console";
    let defaultStatus = "All";
    let context: MemberContext = "all";

    switch (status) {
        case "free":
            title = "Free Member Registry";
            defaultStatus = "Free";
            context = "free";
            break;
        case "premium":
            title = "Premium Member Registry";
            defaultStatus = "Premium";
            context = "premium";
            break;
        case "pending":
            title = "Pending Verifications";
            defaultStatus = "Pending";
            context = "pending";
            break;
    }

    return <MemberTable title={title} defaultStatus={defaultStatus} context={context} />;
};

export default DataEntryMembers;
