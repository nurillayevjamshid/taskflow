"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { InvitationsInbox } from "@/components/invitations-inbox";
import { LogOut, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useDataStore } from "@/store/data-store";

interface Props {
  transparent?: boolean;
  sticky?: boolean;
  children?: React.ReactNode;
}

export function AppHeader({ transparent, sticky = true, children }: Props) {
  const router = useRouter();
  const currentUserId = useAuthStore((s) => s.currentUserId);
  const logout = useAuthStore((s) => s.logout);
  const user = useDataStore((s) =>
    s.users.find((u) => u.id === currentUserId),
  );

  return (
    <header
      className={[
        sticky ? "sticky top-0 z-30" : "",
        transparent ? "" : "glass border-b border-border",
      ].join(" ")}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Logo />
        <div className="flex-1 min-w-0">{children}</div>
        <div className="flex items-center gap-1">
          {user && <InvitationsInbox />}
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                }
              >
                <UserAvatar user={user} size="md" ring />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="flex flex-col">
                    <span className="font-semibold">{user.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {user.email}
                    </span>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard")}
                  className="cursor-pointer"
                >
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="size-4" />
                  Chiqish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                render={<Link href="/login" />}
                nativeButton={false}
                variant="ghost"
                size="sm"
              >
                Kirish
              </Button>
              <Button
                render={<Link href="/register" />}
                nativeButton={false}
                size="sm"
              >
                Ro&apos;yxatdan o&apos;tish
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
