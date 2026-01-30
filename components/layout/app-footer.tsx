export function AppFooter() {
    return (
        <footer className="w-full py-6 border-t border-white/5 bg-black/20 backdrop-blur-sm mt-auto">
            <div className="container mx-auto px-4 text-center">
                <p className="text-sm text-muted-foreground/60 flex items-center justify-center gap-2">
                    <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary/80 to-purple-500/80">PNGX</span>
                    <span>&copy; {new Date().getFullYear()}</span>
                </p>
            </div>
        </footer>
    );
}
