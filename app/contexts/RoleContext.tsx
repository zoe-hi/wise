"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";

export type Role = "PLANNER" | "OWNER" | "VIEWER";

export type DemoUser = {
    id: string;
    name: string;
    role: Role;
};

type RoleContextValue = {
    role: Role;
    user: DemoUser;
    setRole: (role: Role) => void;
};

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

function userForRole(role: Role): DemoUser {
    return {
        id: `demo-${role.toLowerCase()}`,
        name: `${role.charAt(0)}${role.slice(1).toLowerCase()} Demo`,
        role,
    };
}

export function RoleProvider({ children }: { children: ReactNode }) {
    const [role, setRoleState] = useState<Role>("PLANNER");

    useEffect(() => {
        const savedRole = localStorage.getItem("convert-wisely-role") as Role;
        if (
            savedRole &&
            ["PLANNER", "OWNER", "VIEWER"].includes(savedRole)
        ) {
            setRoleState(savedRole);
        }
    }, []);

    const setRole = (newRole: Role) => {
        setRoleState(newRole);
        localStorage.setItem("convert-wisely-role", newRole);
    };

    const user = userForRole(role);

    return (
        <RoleContext.Provider value={{ role, user, setRole }}>
            {children}
        </RoleContext.Provider>
    );
}

export function useRole(): RoleContextValue {
    const ctx = useContext(RoleContext);
    if (!ctx) throw new Error("useRole must be used within a RoleProvider");
    return ctx;
}
