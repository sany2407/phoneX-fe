import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin — phoneX",
    template: "%s | Admin — phoneX",
  },
  robots: { index: false, follow: false },
};

// Login page sits directly under /admin/login and must NOT get the sidebar.
// The AdminShell is applied only inside the (dashboard) route group.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
