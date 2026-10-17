import type { Metadata } from "next";
import ApplicationForm from "@/components/ui/application-form";
import { DONOFFONL_SCHEMA } from "@/lib/donoffonl-form";

export const metadata: Metadata = {
  title: "Đơn ứng tuyển Cộng tác viên | HSV FTU",
  description:
    "Đơn ứng tuyển Cộng tác viên Hội Sinh viên trường Đại học Ngoại thương — thế hệ thứ 24.",
  robots: { index: false, follow: false },
};

/**
 * The donoffonl link's own copy of the đơn: its own draft in the browser and
 * its own tab in the Sheet, so it never mixes with /dondangky.
 */
export default function DonOffOnlFormPage() {
  return (
    <ApplicationForm
      draftKey="hsvftu-donoffonl-draft-v1"
      sheet="donoffonl"
      homeHref="/donoffonl"
      schema={DONOFFONL_SCHEMA}
    />
  );
}
