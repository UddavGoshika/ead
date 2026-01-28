import React from "react";
import { useParams } from "react-router-dom";
import MemberTable from "../../../components/admin/MemberTable";
import type { MemberContext } from "../../../components/admin/MemberTable";

const TelecallerMembers: React.FC = () => {
    const { status } = useParams<{ status: string }>();

    let title = "All Members";
    let defaultStatus = "All";
    let context: MemberContext = "all";

    switch (status) {
        case "free":
            title = "Free Members";
            defaultStatus = "Free";
            context = "free";
            break;
        case "premium":
            title = "Premium Members";
            defaultStatus = "Premium";
            context = "premium";
            break;
        case "approved":
            title = "Approved Members";
            defaultStatus = "Active";
            context = "approved";
            break;
        case "pending":
            title = "Pending Members";
            defaultStatus = "Pending";
            context = "pending";
            break;
        case "deactivated":
            title = "Deactivated Members";
            defaultStatus = "Inactive";
            context = "deactivated";
            break;
        case "blocked":
            title = "Blocked Members";
            defaultStatus = "Blocked";
            context = "blocked";
            break;
        case "reported":
            title = "Reported Members";
            defaultStatus = "Reported";
            context = "reported";
            break;
        case "deleted":
            title = "Deleted Members";
            defaultStatus = "Deleted";
            context = "deleted";
            break;
    }

    return <MemberTable title={title} defaultStatus={defaultStatus} context={context} />;
};

export default TelecallerMembers;
