const COMPARISONS = [
  {
    emoji: "🌳",
    title: "vs. Cotton",
    body: "Cotton's fine, but it's thirsty — growing it takes a huge amount of water, and it can go rough, saggy, or see-through over time. Tencel Modal comes out of the wash silky-smooth, every single time, and it's made using a fraction of the water cotton needs.",
  },
  {
    emoji: "🎋",
    title: `vs. "Bamboo"`,
    body: "Most \"bamboo\" underwear is actually bamboo viscose — bamboo turned into fabric using a pretty heavy dose of chemicals. Tencel Modal comes from a gentler, closed-loop process that recycles almost everything it uses. Same soft feel, way better manners.",
  },
  {
    emoji: "🧪",
    title: "vs. Nylon",
    body: "Nylon is plastic, plain and simple. It doesn't breathe well, it holds onto heat and odour, and it sticks around in landfill for centuries. Tencel Modal is a natural fibre that breathes, wicks moisture, and actually breaks back down — kinder to you and the planet.",
  },
];

export function TencelModalExplainer() {
  return (
    <section className="mt-16 rounded-lg border border-black/10 bg-sand p-6 sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">
        The Fabric
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-navy">
        What&apos;s Tencel Modal, and why should you care?
      </h2>
      <p className="mt-4 max-w-2xl text-navy/80">
        Our boxer briefs are made from{" "}
        <strong className="text-navy">TENCEL™ Modal</strong>, a fibre spun
        from sustainably grown beech trees by an Austrian company called
        Lenzing. Yes — your underwear started life as a tree. Stick with us,
        it gets better.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {COMPARISONS.map((item) => (
          <div key={item.title} className="rounded-lg bg-white p-5">
            <p className="text-2xl">{item.emoji}</p>
            <p className="mt-2 font-semibold text-navy">{item.title}</p>
            <p className="mt-2 text-sm text-navy/70">{item.body}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 max-w-2xl text-navy/80">
        The result: something that feels like a second skin, stays soft wash
        after wash, and doesn&apos;t cost the earth to make. Down under
        deserves the good stuff.
      </p>
    </section>
  );
}
