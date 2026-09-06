import type { Metadata } from "next";
import { NavBar } from "@/components/layout/NavBar";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "SKBL — HSV FTU",
  description: "[TODO: mô tả sự kiện SKBL]",
};

export default function SkblPage() {
  return (
    <>
      <NavBar />
      <main className="flex-1 px-5 pt-12 pb-20 sm:px-6 md:pt-20 lg:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
          <span className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
            Sự kiện
          </span>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-6xl">SKBL</h1>
          {/* TODO: build out the SKBL page — copy, schedule, lineup, register CTA. */}
          <p className="text-lg text-muted-foreground">
            [TODO] Nội dung trang SKBL sẽ được bổ sung — hiện tại đây là trang giữ chỗ để điều
            hướng hoạt động đầy đủ.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
