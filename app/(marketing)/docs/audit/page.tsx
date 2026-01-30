'use client';

// Header/Footer handled by layout
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AuditPage() {
    return (
        <section className="flex-1 py-16 md:py-24">
            <div className="max-w-3xl mx-auto px-6 text-center">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20">
                    <ShieldCheck className="w-10 h-10 text-green-500" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight mb-6">Security Audit Status</h1>
                <p className="text-xl text-muted-foreground leading-relaxed mb-12">
                    Transparent security is our core value. Here is the current status of our code integrity.
                </p>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-left">
                    <div className="flex items-center gap-4 mb-6">
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                        <h3 className="text-xl font-bold">Internal Review: Passed</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                        Our internal security team has verified the implementation of:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-8">
                        <li>AES-256 GCM Implementation (WebCrypto)</li>
                        <li>PBKDF2 Key Derivation (100k iterations)</li>
                        <li>Client-Side Isolation (No network leakage)</li>
                    </ul>

                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                        <p className="text-sm text-yellow-500 font-medium">
                            <strong>Note:</strong> A third-party external audit is currently planned for Q4 2026. Until then, use at your own risk for high-stakes nation-state level secrets.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
