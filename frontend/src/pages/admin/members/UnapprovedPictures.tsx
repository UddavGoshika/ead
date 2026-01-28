import React from "react";
import MemberTable from "../../../components/admin/MemberTable";
import type { Member } from "../../../components/admin/MemberTable";

const members: Member[] = [
    {
        id: "1",
        code: "IMG-5001",
        role: "Client",
        name: "Kol Mikaelson",
        phone: "9000000007",
        gender: "Male",
        verified: false,
        reported: 0,
        plan: "Free",
        since: "18-06-2025",
        status: "Active",
        image: "/avatar13.jpg",
        coins: 0,
    },
];

const UnapprovedPictures: React.FC = () => {
    return <MemberTable title="Unapproved Profile Pictures" initialMembers={members} />;
};

export default UnapprovedPictures;
