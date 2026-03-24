import Link from "next/link";

export default function NotFound() {
  return (
    <div className="pt-28 pb-24 px-6 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="font-serif text-8xl text-linen mb-4">404</p>
        <h1 className="font-serif text-3xl mb-4">Page Not Found</h1>
        <p className="text-charcoal-light mb-8">
          This recipe seems to have wandered off. Let&apos;s get you back to the
          kitchen.
        </p>
        <Link href="/" className="btn-primary inline-block">
          Back Home
        </Link>
      </div>
    </div>
  );
}
