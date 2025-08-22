export async function getAdminName(): Promise<string | null> {
  try {
    const res = await fetch("/api/admin/profile", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to fetch admin name");

    const data = await res.json();
    return data?.name || null;
  } catch (err) {
    console.error("getAdminName error:", err);
    return null;
  }
}
