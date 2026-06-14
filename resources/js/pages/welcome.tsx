import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login } from '@/routes';
import type { SharedData } from '@/types';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <div className="min-h-screen bg-[#050505] font-sans text-[#FAFAFA] selection:bg-[#E2FF4D] selection:text-[#050505]">
            <Head title="Project Management">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            {/* Navigation */}
            <nav className="fixed top-0 z-50 w-full border-b border-[#FFFFFF10] bg-[#05050580] backdrop-blur-xl">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#E2FF4D] to-[#B8D900] shadow-[0_0_20px_rgba(226,255,77,0.3)]">
                            <svg
                                className="h-6 w-6 text-[#050505]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 6v12M6 12h12"
                                />
                            </svg>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-[#FFFFFF]">
                            Project Flow
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="group relative overflow-hidden rounded-full bg-[#FFFFFF] px-8 py-3 text-sm font-semibold text-[#050505] transition-all hover:scale-105 active:scale-95"
                            >
                                <span className="relative z-10">
                                    Go to Dashboard
                                </span>
                                <div className="absolute inset-x-0 bottom-0 h-0 bg-[#E2FF4D] transition-all group-hover:h-full" />
                            </Link>
                        ) : (
                            <Link
                                href={login()}
                                className="group relative overflow-hidden rounded-full border border-[#FFFFFF20] bg-[#FFFFFF10] px-8 py-3 text-sm font-semibold text-[#FFFFFF] backdrop-blur-sm transition-all hover:bg-[#FFFFFF20] active:scale-95"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative pt-32 pb-20 lg:pt-48">
                {/* Background Blobs */}
                <div className="absolute top-0 -z-10 h-full w-full overflow-hidden">
                    <div className="absolute -top-[10%] -left-[10%] h-[500px] w-[500px] rounded-full bg-[#E2FF4D10] blur-[120px]" />
                    <div className="absolute top-[20%] -right-[10%] h-[400px] w-[400px] rounded-full bg-[#B8D90010] blur-[100px]" />
                </div>

                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="flex flex-col items-center gap-16 lg:flex-row">
                        {/* Text Content */}
                        <div className="flex-1 text-center lg:text-left">
                            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#E2FF4D40] bg-[#E2FF4D10] px-4 py-1.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E2FF4D] opacity-75"></span>
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E2FF4D]"></span>
                                </span>
                                <span className="text-xs font-semibold tracking-wide text-[#E2FF4D] uppercase">
                                    Version 2.0 is live
                                </span>
                            </div>
                            <h1 className="mb-8 text-5xl leading-tight font-bold text-[#FFFFFF] lg:text-7xl lg:leading-[1.1]">
                                Managing Projects,
                                <br />
                                <span className="animate-gradient bg-gradient-to-r from-[#E2FF4D] via-[#B8D900] to-[#E2FF4D] bg-clip-text text-transparent">
                                    Simplified.
                                </span>
                            </h1>
                            <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-[#A1A1AA] lg:mx-0 lg:text-xl">
                                Streamline your workflow, track progress in
                                real-time, and collaborate seamlessly with your
                                team. Project Flow is the ultimate hub for
                                modern teams.
                            </p>
                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                                <Link
                                    href={login()}
                                    className="w-full rounded-full bg-[#E2FF4D] px-10 py-4 text-lg font-bold text-[#050505] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(226,255,77,0.4)] active:scale-95 sm:w-auto"
                                >
                                    Get Started Free
                                </Link>
                                <button className="w-full rounded-full border border-[#FFFFFF20] px-10 py-4 text-lg font-semibold text-[#FFFFFF] transition-all hover:bg-[#FFFFFF05] sm:w-auto">
                                    Watch Demo
                                </button>
                            </div>
                        </div>

                        {/* Image/Mockup Container */}
                        <div className="relative w-full flex-1 lg:max-w-none">
                            <div className="relative z-10 overflow-hidden rounded-2xl border border-[#FFFFFF15] bg-[#FFFFFF05] p-4 shadow-2xl backdrop-blur-sm">
                                <img
                                    src="/hero.png"
                                    alt="Project Flow Dashboard Preview"
                                    className="h-auto w-full rounded-lg shadow-inner"
                                />
                                {/* Floating Tags/Accents */}
                                <div className="animate-bounce-slow absolute -bottom-6 -left-6 hidden md:block">
                                    <div className="rounded-2xl border border-[#FFFFFF20] bg-[#05050580] p-4 shadow-xl backdrop-blur-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-2 rounded-full bg-[#10B981]" />
                                            <span className="text-sm font-medium text-[#FFFFFF]">
                                                Sprint Active
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Glow Effect */}
                            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-tr from-[#E2FF4D20] to-transparent opacity-50 blur-xl" />
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-20 border-t border-[#FFFFFF10] py-12">
                <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
                    <p className="text-sm text-[#71717A]">
                        &copy; {new Date().getFullYear()} Project Flow. All
                        rights reserved. Built with passion for modern teams.
                    </p>
                </div>
            </footer>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient {
                    background-size: 200% auto;
                    animation: gradient 5s linear infinite;
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 4s ease-in-out infinite;
                }
            `,
                }}
            />
        </div>
    );
}
