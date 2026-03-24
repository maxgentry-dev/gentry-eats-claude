import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="pt-28 pb-24">
      {/* Hero */}
      <section className="px-6 mb-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="aspect-[4/5] relative bg-linen">
            <Image
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80"
              alt="In the kitchen"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="lg:pl-8">
            <p className="text-sm tracking-widest uppercase text-warm-gray mb-3">
              About
            </p>
            <h1 className="font-serif text-4xl md:text-6xl mb-6 leading-tight">
              The Heart
              <br />
              Behind the
              <br />
              <em className="font-normal">Kitchen</em>
            </h1>
            <div className="space-y-4 text-charcoal-light leading-relaxed">
              <p>
                Gentry Eats was born from a deep love of cooking at home &mdash;
                the kind of cooking that fills the house with aroma, gathers
                people around the table, and turns an ordinary evening into
                something memorable.
              </p>
              <p>
                Here, recipes are more than instructions. They are stories. Each
                dish carries a memory, a season, a reason for being. From the
                farmers market haul that inspired a new salad to the
                grandmother&apos;s recipe that deserves to be shared with the
                world.
              </p>
              <p>
                Whether you are a seasoned home cook or just beginning your
                journey in the kitchen, this space is for you. Pull up a chair.
                Pour a glass. Let&apos;s cook something beautiful.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 bg-charcoal text-cream">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-center mb-16">
            What Gentry Eats Is About
          </h2>
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <p className="font-serif text-5xl text-accent-light mb-4">01</p>
              <h3 className="font-serif text-xl mb-3">Seasonal Cooking</h3>
              <p className="text-cream/70 text-sm leading-relaxed">
                Recipes inspired by what is fresh, local, and in season. Cooking
                with the rhythms of nature makes everything taste better.
              </p>
            </div>
            <div>
              <p className="font-serif text-5xl text-accent-light mb-4">02</p>
              <h3 className="font-serif text-xl mb-3">Storytelling</h3>
              <p className="text-cream/70 text-sm leading-relaxed">
                Every recipe has a why. The stories behind the food are just as
                nourishing as the meals themselves.
              </p>
            </div>
            <div>
              <p className="font-serif text-5xl text-accent-light mb-4">03</p>
              <h3 className="font-serif text-xl mb-3">Elegant Simplicity</h3>
              <p className="text-cream/70 text-sm leading-relaxed">
                Beautiful food does not have to be complicated. These are
                approachable recipes that look and taste extraordinary.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
