import { BookingForm } from "@/components/BookingForm";

export default function BookPage() {
    return (
        <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">Book Your Cleaning</h1>
                    <p className="text-lg text-slate-600">Takes less than 2 minutes.</p>
                </div>

                <BookingForm />
            </div>
        </main>
    );
}
