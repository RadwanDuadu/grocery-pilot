"use client";

import { useCallback, useEffect, useState } from "react";
import type { GroceryItem } from "@/lib/types";

type AccountUser = { id: string; name: string | null; email: string };
type Props = {
  eircode: string;
  items: GroceryItem[];
  onRestore: (data: { eircode: string; items: GroceryItem[] }) => void;
  onUserChange?: (signedIn: boolean) => void;
};

export function AccountPanel({ eircode, items, onRestore, onUserChange }: Props) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("register");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const loadSavedList = useCallback(async () => {
    const response = await fetch("/api/lists/current");
    if (!response.ok) return;
    const data = await response.json();
    if (data.list?.items?.length) onRestore({ eircode: data.eircode, items: data.list.items });
  }, [onRestore]);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session")
      .then((response) => response.ok ? response.json() : null)
      .then(async (data) => {
        if (!active || !data?.user) return;
        setUser(data.user);
        onUserChange?.(true);
        await loadSavedList();
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [loadSavedList, onUserChange]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const values = Object.fromEntries(new FormData(event.currentTarget));

    try {
      const response = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to continue.");
      setUser(data.user);
      onUserChange?.(true);
      setOpen(false);
      if (mode === "login") await loadSavedList();
      else await saveList();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to continue.");
    } finally {
      setBusy(false);
    }
  }

  async function saveList() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/lists/current", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eircode, listName: "Weekly groceries", items }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to save your list.");
      setSavedAt(data.savedAt);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save your list.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    onUserChange?.(false);
    setSavedAt(null);
  }

  return <>
    {user ? <div className="account-actions">
      <span className="account-name">{user.name ?? user.email}</span>
      <button className="save-button" onClick={saveList} disabled={busy}>{busy ? "Saving…" : savedAt ? "Save changes" : "Save my list"}</button>
      <button className="text-button" onClick={logout}>Sign out</button>
      {savedAt && <span className="save-status" title={new Date(savedAt).toLocaleString()}>Saved ✓</span>}
    </div> : <button className="account-button" onClick={() => setOpen(true)}>Sign in to save</button>}

    {message && !open && <div className="account-toast" role="status">{message}</div>}

    {open && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
      <section className="account-modal" role="dialog" aria-modal="true" aria-labelledby="account-title">
        <button className="modal-close" onClick={() => setOpen(false)} aria-label="Close account window">×</button>
        <p className="eyebrow">Save your weekly shop</p>
        <h2 id="account-title">{mode === "register" ? "Create your account" : "Welcome back"}</h2>
        <p className="modal-intro">Your Eircode and grocery list will be stored securely and restored when you return.</p>
        <form onSubmit={submit} className="account-form">
          {mode === "register" && <label>Name<input name="name" autoComplete="name" minLength={2} required /></label>}
          <label>Email<input name="email" type="email" autoComplete="email" required /></label>
          <label>Password<input name="password" type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} minLength={10} required /></label>
          <small>Use at least 10 characters.</small>
          {message && <p className="form-error" role="alert">{message}</p>}
          <button className="modal-submit" disabled={busy}>{busy ? "Please wait…" : mode === "register" ? "Create account & save list" : "Sign in"}</button>
        </form>
        <button className="mode-switch" onClick={() => { setMode(mode === "register" ? "login" : "register"); setMessage(""); }}>{mode === "register" ? "Already have an account? Sign in" : "New here? Create an account"}</button>
      </section>
    </div>}
  </>;
}
