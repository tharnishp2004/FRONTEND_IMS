import DashboardLayout from "@/app/components/DashboardLayout";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout role="staff">{children}</DashboardLayout>;
}
