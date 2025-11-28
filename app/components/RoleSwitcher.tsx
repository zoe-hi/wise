"use client";

import { useState, useRef, useEffect } from "react";
import { useRole, Role } from "../contexts/RoleContext";

export function RoleSwitcher() {
    const { role, setRole } = useRole();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const roles: Role[] = ["PLANNER", "OWNER", "VIEWER"];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-3 rounded-full border border-gray-200 bg-white p-2 shadow-md hover:bg-gray-50"
            >
                <span className="text-sm font-semibold text-gray-800">
                    Wise Business · {role}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-700 font-bold">
                    {role.charAt(0)}
                </div>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md border border-gray-100 bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                    {roles.map((r) => (
                        <button
                            key={r}
                            onClick={() => {
                                setRole(r);
                                setIsOpen(false);
                            }}
                            className={`block w-full px-4 py-2 text-left text-sm ${role === r
                                    ? "bg-teal-50 text-teal-700"
                                    : "text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
