"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { webProps } from "@/constants/configs";
import { socialLinks } from "../../constants/socialLinks";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const seamlessRoutes = [
    "/register",
    "/help",
    "/news",
    "/recovery",
    "/bank",
    "/community",
    "/guild",
  ];
  const hasSeamlessJoin = seamlessRoutes.some((route) =>
    pathname?.startsWith(route),
  );

  return (
    <footer
      className={`relative overflow-hidden border-t border-sky-500/20 bg-[#050508] ${hasSeamlessJoin ? "mt-0" : "mt-10 md:mt-14"}`}
    >
      <div
        className="pointer-events-none absolute inset-0 scale-105 bg-cover bg-center opacity-40 blur-[1px] saturate-[0.95]"
        style={{
          backgroundImage:
            "url('https://static.wixstatic.com/media/5dd8a0_0f8a518f22884179b5a40e90d9fa216d~mv2.png')",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-contain bg-bottom bg-no-repeat opacity-90 saturate-100"
        style={{
          backgroundImage:
            "url('https://static.wixstatic.com/media/5dd8a0_0f8a518f22884179b5a40e90d9fa216d~mv2.png')",
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-[1] opacity-80 mix-blend-screen [background-image:radial-gradient(circle,rgba(56,189,248,0.70)_0_2px,transparent_3px),radial-gradient(circle,rgba(14,165,233,0.60)_0_1.6px,transparent_2.6px),radial-gradient(circle,rgba(59,130,246,0.55)_0_1.2px,transparent_2px)] [background-size:180px_180px,240px_220px,300px_260px] [animation:embers-drift-blue_9.2s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-black/50 to-black/80" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(56,189,248,0.12),transparent_35%),radial-gradient(circle_at_78%_45%,rgba(59,130,246,0.16),transparent_38%)]" />

      <div className="relative min-h-[400px] pt-8 md:min-h-[480px] md:pt-12">
        <nav className="absolute left-1/2 top-12 z-10 w-[min(1100px,92%)] -translate-x-1/2 border-y border-amber-200/20 bg-black/40 px-4 py-3 shadow-[0_10px_28px_rgba(0,0,0,0.55)] backdrop-blur-[1.5px] md:top-14 md:px-7">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-100 md:gap-x-7 md:text-sm">
            <Link
              href="/guild"
              className="relative pr-4 transition-colors hover:text-amber-100 md:pr-7 after:pointer-events-none after:absolute after:right-0 after:top-1/2 after:h-3 after:w-px after:-translate-y-1/2 after:bg-amber-200/30"
            >
              {t("navbar-minimalist.sections.position-two")}
            </Link>
            <Link
              href="/news"
              className="relative pr-4 transition-colors hover:text-amber-100 md:pr-7 after:pointer-events-none after:absolute after:right-0 after:top-1/2 after:h-3 after:w-px after:-translate-y-1/2 after:bg-amber-200/30"
            >
              {t("navbar-minimalist.sections.position-five")}
            </Link>
            <Link
              href="/bank"
              className="relative pr-4 transition-colors hover:text-amber-100 md:pr-7 after:pointer-events-none after:absolute after:right-0 after:top-1/2 after:h-3 after:w-px after:-translate-y-1/2 after:bg-amber-200/30"
            >
              {t("navbar-minimalist.sections.position-three")}
            </Link>
            <Link
              href="/store"
              className="relative pr-4 transition-colors hover:text-amber-100 md:pr-7 after:pointer-events-none after:absolute after:right-0 after:top-1/2 after:h-3 after:w-px after:-translate-y-1/2 after:bg-amber-200/30"
            >
              {t("navbar-minimalist.sections.position-four")}
            </Link>
            <Link
              href="/help"
              className="transition-colors hover:text-amber-100"
            >
              {t("navbar-minimalist.sections.position-six")}
            </Link>
          </div>
        </nav>

        <div className="absolute bottom-8 left-1/2 z-10 w-[92%] -translate-x-1/2 space-y-6 md:bottom-10">
          <div className="flex justify-center space-x-6">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 transition duration-150 ease-in-out hover:text-gray-100"
              >
                <span className="sr-only">{link.name}</span>
                <img className="h-8 w-8" src={link.icon} alt={link.alt} />
              </a>
            ))}
          </div>
          <div className="text-center text-xs font-medium uppercase tracking-[0.12em] text-zinc-300/90">
            <p className="mb-3">
              {t("footer.copyright", {
                year: currentYear,
                serverName: webProps.serverName,
              })}
            </p>
            <p className="mx-auto max-w-5xl text-[10px] normal-case tracking-normal text-zinc-300/75 md:text-xs">
              {t("footer.about")}
            </p>
            <div className="mt-4 flex items-center justify-center gap-6 text-[11px]">
              <Link
                href="/terms"
                className="transition-colors hover:text-zinc-100"
              >
                {t("footer.terms-of-use")}
              </Link>
              <Link
                href="/privacy"
                className="transition-colors hover:text-zinc-100"
              >
                {t("footer.privacy-policy")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
