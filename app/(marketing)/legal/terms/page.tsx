'use client';

// Header/Footer handled by layout
import { Scale, AlertTriangle, CheckCircle } from 'lucide-react';

export default function TermsPage() {
    return (
        <section className="flex-1 py-16 md:py-24">
            <div className="max-w-4xl mx-auto px-6">
                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-500 mb-6">
                        <Scale className="w-3 h-3" />
                        Terms of Service
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Terms of Service</h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        By using PNGX, you agree to these terms. We provide the tools; you provide the responsibility.
                    </p>
                </div>

                <div className="space-y-12">
                    <div className="prose prose-invert max-w-none">
                        <h2>1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using PNGX, you accept and agree to be bound by the terms and provision of this agreement.
                        </p>

                        <h2>2. Permissible Use</h2>
                        <div className="not-prose grid gap-4 mb-6">
                            <div className="flex items-start gap-3 p-4 bg-green-500/5 rounded-lg border border-green-500/10">
                                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                                <div className="text-sm">
                                    <strong>Privacy Protection:</strong> You may use this tool to protect your personal data, whistleblowing materials, and private communications.
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-red-500/5 rounded-lg border border-red-500/10">
                                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                                <div className="text-sm">
                                    <strong>Prohibited Acts:</strong> You must not use this tool for illegal activities, including but not limited to: malware distribution, copyright infringement, or hiding illicit content.
                                </div>
                            </div>
                        </div>

                        <h2>3. Disclaimer of Liability</h2>
                        <p className="p-4 bg-white/5 border border-white/10 rounded-xl italic">
                            "THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED..."
                        </p>
                        <p>
                            PNGX is an open-source project. We are not liable for any damages arising from the use or inability to use this software, including data loss or security breaches caused by user error (e.g., weak passwords).
                        </p>

                        <h2>4. Encryption & Data Loss</h2>
                        <p>
                            <strong>There is no "Forgot Password" feature.</strong> If you lose your encryption key, your data is mathematically unrecoverable. We cannot help you retrieve it because we do not have your keys.
                        </p>

                        <h2>5. Blockchain & Cryptocurrency</h2>
                        <p>
                            If you use blockchain backup features:
                        </p>
                        <ul>
                            <li>You are solely responsible for your wallet security and private keys.</li>
                            <li>Blockchain transactions are irreversible. Gas fees are non-refundable.</li>
                            <li>We do not provide financial advice. Any tokens or NFTs are utility-only.</li>
                            <li>You agree to comply with all applicable laws in your jurisdiction regarding cryptocurrency.</li>
                        </ul>

                        <h2>6. Updates to Terms</h2>
                        <p>
                            We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of the new terms.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
