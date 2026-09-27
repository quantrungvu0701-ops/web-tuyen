import type { Metadata } from "next";
import ApplicationForm from "@/components/ui/application-form";

export const metadata: Metadata = {
  title: "Đơn ứng tuyển Cộng tác viên | HSV FTU",
  description:
    "Đơn ứng tuyển Cộng tác viên Hội Sinh viên trường Đại học Ngoại thương — thế hệ thứ 23.",
};

/**
 * Deliberately standalone: no nav, no footer, no scroll smoother. Someone is
 * about to spend half an hour on twenty questions and nothing on this page
 * should compete with that.
 */
export default function DonPage() {
  return <ApplicationForm />;
}
