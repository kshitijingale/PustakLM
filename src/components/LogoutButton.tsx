"use client";

export default function LogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <button onClick={logout} className="btn-ghost py-1.5 text-sm">
      Log out
    </button>
  );
}