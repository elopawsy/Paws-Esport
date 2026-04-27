import Link from "next/link";

export default function NotFound() {
    return (
        <div className="relative flex h-[calc(100vh-80px)] w-full flex-col items-center justify-center overflow-hidden bg-background p-4 text-center">
            {/* Background Decor */}
            <div className="absolute inset-0 z-0 opacity-20">
                <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-primary blur-[100px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-2">
                {/* Icon */}


                {/* Main 404 Text */}
                <h1 className="font-display text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 md:text-9xl">
                    404
                </h1>

                <h2 className="font-display text-3xl font-bold uppercase tracking-widest text-primary md:text-4xl">
                    Page Not Found
                </h2>

                {/* Gaming Flavor Text */}
                <p className="mt-4 max-w-[450px] text-lg font-medium text-zinc-400">
                    The map you are looking for is currently out of rotation or has been removed. Check your connection or return to the lobby.
                </p>

                {/* Action Button */}
                <div className="mt-10">
                    <Link
                        href="/"
                        className="group relative inline-flex items-center justify-center overflow-hidden rounded bg-primary px-10 py-4 font-display font-bold uppercase tracking-widest text-black transition-all hover:bg-primary-hover hover:scale-105"
                    >
                        <span className="absolute inset-0 -skew-x-12 bg-white/20 transition-transform group-hover:skew-x-12" />
                        <span className="relative flex items-center gap-2">
                            <span>Return to Lobby</span>
                        </span>
                    </Link>
                </div>

                {/* Decorative elements */}
                <div className="mt-12 flex gap-4 text-xs font-mono text-zinc-600 uppercase tracking-widest">
                    <span>Error_Code: ID_10_T</span>
                    <span>•</span>
                    <span>Server: DISCONNECTED</span>
                </div>
            </div>
        </div>
    );
}
