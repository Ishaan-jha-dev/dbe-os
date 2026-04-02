"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarClock, BookOpen, Timer, MessageSquare, ShoppingBag, Map } from "lucide-react";

const links = [
    { href: "/", label: "Farm", icon: Map },
    { href: "/study", label: "Pomodoro", icon: Timer },
    { href: "/notes", label: "Notes", icon: BookOpen },
    { href: "/forum", label: "Rooms", icon: MessageSquare },
    { href: "/shop", label: "Shop", icon: ShoppingBag },
    { href: "/deadlines", label: "Tasks", icon: CalendarClock },
];

export default function NavLinks() {
    const pathname = usePathname();

    return (
        <>
            {links.map(({ href, label, icon: Icon }) => {
                const isActive =
                    href === "/"
                        ? pathname === "/" || pathname.match(/^\/[A-Z]{2}\d/)
                        : pathname.startsWith(href);

                return (
                    <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                            ? "bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary/20"
                            : "text-on-surface-variant hover:text-primary hover:bg-surface-container-highest"
                            }`}
                    >
                        <Icon className="w-4 h-4" />
                        <span className="hidden md:inline">{label}</span>
                    </Link>
                );
            })}
        </>
    );
}
