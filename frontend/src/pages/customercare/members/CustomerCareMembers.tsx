import React from "react";
import { useParams } from "react-router-dom";
import MemberTable from "../../../components/admin/MemberTable";
import type { MemberContext } from "../../../components/admin/MemberTable";

const CustomerCareMembers: React.FC = () => {
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
    }

    return <MemberTable title={title} defaultStatus={defaultStatus} context={context} />;
};

export default CustomerCareMembers;
