import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
    LayoutDashboard,
    UserCog,
    Settings,
    LogOut,
    Sparkles,
    Zap,
    Brain
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SidebarDemo() {
    const links = [
        {
            label: "Neural Dashboard",
            href: "/dashboard",
            icon: (
                <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Profile Settings",
            href: "/profile",
            icon: (
                <UserCog className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "System Configuration",
            href: "/settings",
            icon: (
                <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "De-authorize",
            href: "/logout",
            icon: (
                <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
        },
    ];
    const [open, setOpen] = useState(false);
    return (
        <div
            className={cn(
                "rounded-2xl flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 max-w-7xl mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
                "h-[80vh] shadow-2xl"
            )}
        >
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        {open ? <Logo /> : <LogoIcon />}
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <SidebarLink
                            link={{
                                label: "Neural Operator",
                                href: "#",
                                icon: (
                                    <img
                                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop"
                                        className="h-7 w-7 flex-shrink-0 rounded-full object-cover border border-white/20"
                                        alt="Avatar"
                                    />
                                ),
                            }}
                        />
                    </div>
                </SidebarBody>
            </Sidebar>
            <Dashboard />
        </div>
    );
}

export const Logo = () => {
    return (
        <Link
            to="/"
            className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
        >
            <div className="h-5 w-6 bg-gradient-to-br from-accent-purple to-accent-cyan rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-black dark:text-white whitespace-pre tracking-tighter"
            >
                Kynara Labs
            </motion.span>
        </Link>
    );
};

export const LogoIcon = () => {
    return (
        <Link
            to="/"
            className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
        >
            <div className="h-5 w-6 bg-gradient-to-br from-accent-purple to-accent-cyan rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
        </Link>
    );
};

// Dummy dashboard component with content
const Dashboard = () => {
    return (
        <div className="flex flex-1">
            <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-4 flex-1 w-full h-full overflow-y-auto">
                <h2 className="text-2xl font-black tracking-tighter mb-4 uppercase opacity-20">System Overview</h2>
                <div className="flex gap-4">
                    {[Sparkles, Zap, Brain, Sparkles].map((Icon, i) => (
                        <div
                            key={"first-array" + i}
                            className="h-32 w-full rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6 flex flex-col justify-between group hover:border-accent-purple/50 transition-all cursor-pointer"
                        >
                            <Icon size={20} className="text-accent-purple opacity-40 group-hover:opacity-100 transition-opacity" />
                            <div className="h-2 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                        </div>
                    ))}
                </div>
                <div className="flex gap-4 flex-1">
                    {[...new Array(2)].map((_, i) => (
                        <div
                            key={"second-array" + i}
                            className="h-full w-full rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-8 flex flex-col gap-4"
                        >
                            <div className="h-4 w-1/3 bg-neutral-200 dark:bg-neutral-700 rounded-full opacity-50" />
                            <div className="h-2 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full opacity-20" />
                            <div className="h-2 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full opacity-20" />
                            <div className="h-2 w-2/3 bg-neutral-200 dark:bg-neutral-700 rounded-full opacity-20" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
