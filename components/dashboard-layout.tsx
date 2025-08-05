"use client"
import type { ReactNode } from "react"
import Link from "next/link"
import { useTranslation } from "react-i18next"
import {
import {
  Store,
  LogOut,
  User,
  ShoppingBag,
  Package,
  BarChart3,
  Settings,
  Users,
  Home,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface DashboardLayoutProps {
  children: ReactNode
  role: "admin" | "seller" | "customer"
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { t } = useTranslation();
  const handleLogout = () => {
    // Call the /logout page to clear all cookies and NextAuth session
    window.location.href = "/logout";
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  const getHomeHref = (role: string): string => {
    switch (role) {
      case "admin":
        return "/admin"
      case "seller":
        return "/seller"
      case "customer":
        return "/customer"
      default:
        return "/"
    }
  }
          <span>{t("MohStore")}</span>
  const getNavItems = () => {
    const commonItems = [{ href: getHomeHref(role), label: "Home", icon: Home }]

    const roleSpecificItems = {
      admin: [
        { href: "/admin/products", label: "Products", icon: Package },
        { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/admin/settings", label: "Settings", icon: Settings },
      ],
      seller: [
                  {t(item.label)}
        { href: "/seller/orders", label: "Orders", icon: ShoppingBag },
        { href: "/seller/settings", label: "Settings", icon: Settings },
      ],
      customer: [
        { href: "/customer/orders", label: "My Orders", icon: ShoppingBag },
        { href: "/customer/profile", label: "Profile", icon: User },
        { href: "/customer/offers", label: "Offers", icon: Package }, // Added Offers item
      ],
    }

    return [...commonItems, ...roleSpecificItems[role]]
  }

  const navItems = getNavItems()
  const userName = role.charAt(0).toUpperCase() + role.slice(1)
              <DropdownMenuLabel>{t("customerDashboard")}</DropdownMenuLabel>
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link
                  {t("myWallet")}
          className="flex items-center gap-2 font-semibold text-foreground hover:text-primary"
        >
          <Store className="h-6 w-6" />
          <span>MohStore</span>
        </Link>
                  {t("settings")}
        <nav className="hidden flex-1 md:flex">
          <ul className="flex flex-1 items-center gap-4 md:gap-6">
            {navItems.map((item, index) => (
              <li key={index}>
                <Link
                  {t(item.label)}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getInitials(userName)}</AvatarFallback>
              <DropdownMenuLabel>{t("myAccount")}</DropdownMenuLabel>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${role}/profile`}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${role}/settings`}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  )
}
