import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-black/10 bg-sand">
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-navy/70">
        <div className="flex flex-wrap justify-between gap-8">
          <div>
            <div className="flex items-center gap-2">
              <Image src="/orca-icon-navy.png" alt="" width={20} height={20} />
              <p className="font-semibold text-navy">ORCA AUSTRALIA</p>
            </div>
            <p className="mt-2 max-w-md">
              Men&apos;s swim shorts and Tencel modal boxer briefs, designed for
              Australian summers. Shipping across Australia.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">
              Support
            </p>
            <ul className="mt-2 space-y-1">
              <li>
                <Link href="/track-order" className="hover:text-navy hover:underline">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-navy hover:underline">
                  Contact &amp; Support
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@astryks.com"
                  className="hover:text-navy hover:underline"
                >
                  support@astryks.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-8 text-xs text-navy/50">
          &copy; {new Date().getFullYear()} Orca Australia. All rights reserved.
        </p>
        <p className="mt-1 text-xs text-navy/50">
          Orca Australia, part of the Astryks Group |{" "}
          <a
            href="https://astryks.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-navy"
          >
            astryks.com
          </a>
        </p>
      </div>
    </footer>
  );
}
