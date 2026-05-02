import Link from 'next/link';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8">
            <div className="z-10 max-w-5xl w-full items-center justify-between font-sans text-sm lg:flex text-center mb-10 flex-col">
                <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-7xl mb-6">
                    JILK Integrated Services
                </h1>
                <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
                    The best cleaning service for your home and office. Book now in less than 2 minutes.
                </p>
            </div>

            <Link
                href="/book"
                className="bg-primary text-primary-foreground hover:bg-blue-700 px-8 py-4 rounded-full font-semibold text-lg shadow-inner-blue transition-all"
            >
                Book Now
            </Link>
        </main>
    );
}
