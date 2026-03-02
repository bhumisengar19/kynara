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
            label: "Dashboard",
            href: "/dashboard",
            icon: (
                <LayoutDashboard className="text-purple-600 h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Profile",
            href: "/profile",
            icon: (
                <UserCog className="text-purple-600 h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Settings",
            href: "/settings",
            icon: (
                <Settings className="text-purple-600 h-5 w-5 flex-shrink-0" />
            ),
        },
    ];
    const [open, setOpen] = useState(false);
    return (
        <div
            className={cn(
                "rounded-[40px] flex flex-col md:flex-row bg-white dark:bg-dark-bg w-full flex-1 max-w-7xl mx-auto border border-purple-100 dark:border-white/5 overflow-hidden",
                "h-[80vh] shadow-[0_40px_100px_rgba(168,85,247,0.1)]"
            )}
        >
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10 bg-purple-50/30 dark:bg-dark-secondary/20">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden p-4">
                        {open ? <Logo /> : <LogoIcon />}
                        <div className="mt-12 flex flex-col gap-4">
                            {links.map((link, idx) => (
                                <SidebarLink key={idx} link={link} className="hover:bg-white dark:hover:bg-white/5 rounded-2xl p-2 transition-all" />
                            ))}
                        </div>
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
            className="font-normal flex space-x-4 items-center text-sm py-1 relative z-20 group"
        >
            <div className="h-11 w-11 bg-accent-purple rounded-[18px] flex-shrink-0 shadow-xl shadow-purple-500/20 flex items-center justify-center text-white group-hover:rotate-[10deg] transition-transform duration-500">
                <Sparkles size={22} className="fill-white/20" />
            </div>
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-display font-black text-3xl text-light-text dark:text-dark-text tracking-tighter uppercase"
            >
                Kynara
            </motion.span>
        </Link>
    );
};

export const LogoIcon = () => {
    return (
        <Link
            to="/"
            className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20"
        >
            <div className="h-10 w-10 bg-purple-600 rounded-2xl flex-shrink-0 shadow-lg shadow-purple-500/20 flex items-center justify-center text-white">
                <Sparkles size={20} />
            </div>
        </Link>
    );
};

const Dashboard = () => {
    return (
        <div className="flex flex-1">
            <div className="p-12 rounded-tl-[48px] border-l border-purple-100 dark:border-white/5 bg-white dark:bg-dark-bg flex flex-col gap-10 flex-1 w-full h-full overflow-y-auto">
                <h2 className="text-2xl font-black tracking-tight text-light-text dark:text-dark-text uppercase opacity-40">System Node</h2>
                <div className="flex gap-6">
                    {[Sparkles, Zap, Brain, Sparkles].map((Icon, i) => (
                        <div
                            key={"first-array" + i}
                            className="h-40 w-full rounded-[32px] bg-purple-50/50 dark:bg-dark-secondary border border-purple-100 dark:border-white/5 p-8 flex flex-col justify-between group hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer shadow-sm"
                        >
                            <div className="p-3 bg-white dark:bg-white/5 rounded-2xl w-fit shadow-sm">
                                <Icon size={24} className="text-purple-600" />
                            </div>
                            <div className="h-3 w-3/4 bg-purple-200/50 dark:bg-white/10 rounded-full" />
                        </div>
                    ))}
                </div>
                <div className="flex gap-6 flex-1">
                    {[...new Array(2)].map((_, i) => (
                        <div
                            key={"second-array" + i}
                            className="h-full w-full rounded-[40px] bg-white dark:bg-dark-secondary border border-purple-100 dark:border-white/5 p-10 flex flex-col gap-6 shadow-sm"
                        >
                            <div className="h-4 w-1/4 bg-purple-200/50 dark:bg-white/10 rounded-full" />
                            <div className="space-y-3">
                                <div className="h-3 w-full bg-purple-50 dark:bg-white/5 rounded-full" />
                                <div className="h-3 w-full bg-purple-50 dark:bg-white/5 rounded-full" />
                                <div className="h-3 w-2/3 bg-purple-50 dark:bg-white/5 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
