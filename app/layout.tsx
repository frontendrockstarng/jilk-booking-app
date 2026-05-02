import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: '--font-jakarta',
});

export const metadata: Metadata = {
    title: "SparkleClean | High Quality Cleaning Service",
    description: "Book your high quality cleaning service seamlessly with SparkleClean.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${jakarta.variable} font-sans bg-orbs antialiased`}>
                {children}
            </body>
        </html>
    );
}
