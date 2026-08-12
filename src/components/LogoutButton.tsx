"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <Button variant="ghost" size="sm" onClick={logout}>
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Log out</span>
    </Button>
  );
}
