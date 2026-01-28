import React from "react";
import MemberTable from "../../../components/admin/MemberTable";
import type { Member } from "../../../components/admin/MemberTable";

const members: Member[] = [
    {
        id: "1",
        code: "20250525",
        role: "Advocate",
        name: "Arhaan Malik",
        phone: "630000583",
        gender: "Male",
        verified: true,
        reported: 0,
        plan: "Free",
        coins: 0,
        since: "13-05-2025",
        status: "Active",
        image: "/avatar1.jpg",
    },
    {
        id: "2",
        code: "20250517",
        role: "Client",
        name: "Henry Lawson",
        phone: "6300009058",
        gender: "Male",
        verified: true,
        reported: 0,
        plan: "Free",
        coins: 0,
        since: "13-05-2025",
        status: "Active",
        image: "/avatar2.jpg",
    },
    {
        id: "3",
        code: "20250516",
        role: "Advocate",
        name: "Mateo Alvarez",
        phone: "6300900058",
        gender: "Male",
        verified: false,
        reported: 0,
        plan: "Free",
        coins: 0,
        since: "13-05-2025",
        status: "Active",
        image: "/avatar3.jpg",
    },
];

const FreeMembers: React.FC = () => {
    return (
        <MemberTable
            title="Free Members"
            initialMembers={members}
            context="free"
        />
    );
};

export default FreeMembers;
