import { Logo } from "@/components/ui/Logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
      <div className="mb-8 flex flex-col items-center gap-3">
        <Link href="/" aria-label="Back to home">
          <Logo className="h-8 w-auto" />
        </Link>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Instant Capital · Invisible Compliance
        </p>
      </div>

      <div className="w-full max-w-md">{children}</div>

      <p className="mt-10 font-body-md text-body-md text-on-surface-variant/50">
        Stellar Mainnet · Supabase · Philippines-first
      </p>
    </div>
  );
}
