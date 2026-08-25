export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-black/10 bg-sand">
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-navy/70">
        <p className="font-semibold text-navy">ORCA AUSTRALIA</p>
        <p className="mt-2 max-w-md">
          Men&apos;s swim shorts and Tencel modal boxer briefs, designed for
          Australian summers. Shipping across Australia.
        </p>
        <p className="mt-6 text-xs text-navy/50">
          &copy; {new Date().getFullYear()} Orca Australia. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
