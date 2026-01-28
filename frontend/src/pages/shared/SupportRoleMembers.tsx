import React from "react";
import { useParams } from "react-router-dom";
import MemberTable from "../../components/admin/MemberTable";
import type { MemberContext } from "../../components/admin/MemberTable";

export const CallSupportMembers: React.FC = () => {
    const { status } = useParams<{ status: string }>();
    let title = "Call Support - Member Intelligence";
    let defaultStatus = "All";
    let context: MemberContext = "all";

    switch (status) {
        case "free": title = "Free Registry"; defaultStatus = "Free"; context = "free"; break;
        case "premium": title = "Premium Registry"; defaultStatus = "Premium"; context = "premium"; break;
        case "approved": title = "Verified Contacts"; defaultStatus = "Active"; context = "approved"; break;
    }
    return <MemberTable title={title} defaultStatus={defaultStatus} context={context} />;
};

export const LiveChatMembers: React.FC = () => {
    const { status } = useParams<{ status: string }>();
    let title = "Chat Support - Member Audit";
    let defaultStatus = "All";
    let context: MemberContext = "all";

    switch (status) {
        case "free": title = "Free Registry"; defaultStatus = "Free"; context = "free"; break;
        case "premium": title = "Premium Portfolio"; defaultStatus = "Premium"; context = "premium"; break;
        case "approved": title = "Verified Signals"; defaultStatus = "Active"; context = "approved"; break;
    }
    return <MemberTable title={title} defaultStatus={defaultStatus} context={context} />;
};

export const PersonalAssistantMembers: React.FC = () => {
    const { status } = useParams<{ status: string }>();
    let title = "Concierge Portfolio Management";
    let defaultStatus = "All";
    let context: MemberContext = "all";

    switch (status) {
        case "premium": title = "VIP Portfolio"; defaultStatus = "Premium"; context = "premium"; break;
        case "pending": title = "Onboarding Queue"; defaultStatus = "Pending"; context = "pending"; break;
    }
    return <MemberTable title={title} defaultStatus={defaultStatus} context={context} />;
};
