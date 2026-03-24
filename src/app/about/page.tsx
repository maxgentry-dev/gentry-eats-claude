"use client";

import Image from "next/image";
import { InlineEdit } from "@/components/InlineEdit";

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
            <InlineEdit
              contentKey="about_label"
              fallback="About"
              as="p"
              className="text-sm tracking-widest uppercase text-warm-gray mb-3"
            />
            <InlineEdit
              contentKey="about_heading"
              fallback="The Heart Behind the Kitchen"
              as="h1"
              className="font-serif text-4xl md:text-6xl mb-6 leading-tight"
            />
            <div className="space-y-4 text-charcoal-light leading-relaxed">
              <InlineEdit
                contentKey="about_para_1"
                fallback="Gentry Eats was born from a deep love of cooking at home — the kind of cooking that fills the house with aroma, gathers people around the table, and turns an ordinary evening into something memorable."
                as="p"
                multiline
              />
              <InlineEdit
                contentKey="about_para_2"
                fallback="Here, recipes are more than instructions. They are stories. Each dish carries a memory, a season, a reason for being. From the farmers market haul that inspired a new salad to the grandmother's recipe that deserves to be shared with the world."
                as="p"
                multiline
              />
              <InlineEdit
                contentKey="about_para_3"
                fallback="Whether you are a seasoned home cook or just beginning your journey in the kitchen, this space is for you. Pull up a chair. Pour a glass. Let's cook something beautiful."
                as="p"
                multiline
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 bg-charcoal text-cream">
        <div className="max-w-5xl mx-auto">
          <InlineEdit
            contentKey="about_values_heading"
            fallback="What Gentry Eats Is About"
            as="h2"
            className="font-serif text-3xl md:text-4xl text-center mb-16"
          />
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <p className="font-serif text-5xl text-accent-light mb-4">01</p>
              <InlineEdit
                contentKey="about_value_1_title"
                fallback="Seasonal Cooking"
                as="h3"
                className="font-serif text-xl mb-3"
              />
              <InlineEdit
                contentKey="about_value_1_text"
                fallback="Recipes inspired by what is fresh, local, and in season. Cooking with the rhythms of nature makes everything taste better."
                as="p"
                className="text-cream/70 text-sm leading-relaxed"
                multiline
              />
            </div>
            <div>
              <p className="font-serif text-5xl text-accent-light mb-4">02</p>
              <InlineEdit
                contentKey="about_value_2_title"
                fallback="Storytelling"
                as="h3"
                className="font-serif text-xl mb-3"
              />
              <InlineEdit
                contentKey="about_value_2_text"
                fallback="Every recipe has a why. The stories behind the food are just as nourishing as the meals themselves."
                as="p"
                className="text-cream/70 text-sm leading-relaxed"
                multiline
              />
            </div>
            <div>
              <p className="font-serif text-5xl text-accent-light mb-4">03</p>
              <InlineEdit
                contentKey="about_value_3_title"
                fallback="Elegant Simplicity"
                as="h3"
                className="font-serif text-xl mb-3"
              />
              <InlineEdit
                contentKey="about_value_3_text"
                fallback="Beautiful food does not have to be complicated. These are approachable recipes that look and taste extraordinary."
                as="p"
                className="text-cream/70 text-sm leading-relaxed"
                multiline
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
