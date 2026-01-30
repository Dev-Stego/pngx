'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getShareLink } from '@/lib/firestore/shares';
import { ShareLink } from '@/lib/firestore/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, FileIcon, Download, AlertCircle, Lock, Clock, ShieldCheck, Share2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatBytes } from '@/lib/utils';
import { ModeToggle } from '@/components/mode-toggle';

function ShareContent() {
    const params = useParams();
    const router = useRouter();
    const shareId = params.id as string;

    const [loading, setLoading] = React.useState(true);
    const [share, setShare] = React.useState<ShareLink | null>(null);
    const [password, setPassword] = React.useState('');
    const [passwordRequired, setPasswordRequired] = React.useState(false);
    const [unlocked, setUnlocked] = React.useState(false);
    const [downloading, setDownloading] = React.useState(false);

    React.useEffect(() => {
        const fetchShare = async () => {
            try {
                const shareData = await getShareLink(shareId);
                setShare(shareData);

                if (shareData?.password) {
                    setPasswordRequired(true);
                } else {
                    setUnlocked(true);
                }
            } catch (error) {
                console.error('Error fetching share:', error);
            } finally {
                setLoading(false);
            }
        };

        if (shareId) {
            fetchShare();
        }
    }, [shareId]);

    const handleUnlock = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (share?.password && password !== share.password) {
            toast.error('Incorrect password');
            setPassword('');
            return;
        }
        setUnlocked(true);
        toast.success('Access granted');
    };

    const handleDownload = async () => {
        if (!share?.downloadUrl) {
            toast.error('Download URL not found');
            return;
        }

        setDownloading(true);
        try {
            // Create a temporary anchor to trigger download
            const response = await fetch(share.downloadUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = share.fileName;
            document.body.appendChild(a);
            a.click();

            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('Download started');
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Failed to download file');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">Retrieving secure file...</p>
                </div>
            </div>
        );
    }

    if (!share) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md border-destructive/20 bg-destructive/5 backdrop-blur-xl">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center animate-bounce">
                                <AlertCircle className="w-10 h-10 text-destructive" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl">Link Expired or Invalid</CardTitle>
                        <CardDescription className="text-base mt-2">
                            This secure link has expired, reached its download limit, or never existed.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-center pb-8">
                        <Button onClick={() => router.push('/')} variant="outline" className="min-w-[140px]">
                            Go to Home
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background p-4 relative overflow-hidden">
            <div className="absolute top-4 right-4 z-50">
                <ModeToggle />
            </div>

            <div className="mb-8 flex flex-col items-center relative z-10 text-center animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/25">
                    <ShieldCheck className="w-6 h-6 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">PNGX Secure Share</h1>
                <p className="text-muted-foreground mt-1">End-to-End Encrypted File Transfer</p>
            </div>

            <AnimatePresence mode="wait">
                {passwordRequired && !unlocked ? (
                    <motion.div
                        key="lock-screen"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-md"
                    >
                        <Card className="border-primary/20 bg-card/40 backdrop-blur-xl shadow-2xl shadow-primary/10">
                            <CardHeader className="text-center pb-2">
                                <div className="flex justify-center mb-6">
                                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                                        <Lock className="w-10 h-10 text-primary" />
                                    </div>
                                </div>
                                <CardTitle className="text-2xl">Password Protected</CardTitle>
                                <CardDescription>
                                    This file is secured. Please enter the password to unlock.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleUnlock} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter password..."
                                            className="h-12 text-lg bg-background/50"
                                            autoFocus
                                        />
                                    </div>
                                    <Button type="submit" className="w-full h-12 text-lg font-medium shadow-lg shadow-primary/25">
                                        Unlock File
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content-screen"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full max-w-md"
                    >
                        <Card className="border-primary/20 bg-card/40 backdrop-blur-xl shadow-2xl shadow-primary/10 overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

                            <CardHeader className="text-center pb-2">
                                <div className="flex justify-center mb-6">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 z-10 relative">
                                            <FileIcon className="w-12 h-12 text-white" />
                                        </div>
                                        <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl z-0 animate-pulse" />
                                    </div>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <CardTitle className="text-xl sm:text-2xl break-all font-bold tracking-tight px-4">
                                        {share.fileName}
                                    </CardTitle>
                                    <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-sm text-muted-foreground">
                                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-mono uppercase">
                                            {(() => {
                                                const type = share.fileType;
                                                if (type.includes('wordprocessingml')) return 'DOCX';
                                                if (type.includes('spreadsheetml')) return 'XLSX';
                                                if (type.includes('presentationml')) return 'PPTX';
                                                if (type.includes('pdf')) return 'PDF';
                                                return type.split('/')[1] || 'FILE';
                                            })()}
                                        </span>
                                        <span>•</span>
                                        <span>{formatBytes(share.fileSize)}</span>
                                    </div>
                                </motion.div>
                            </CardHeader>

                            <CardContent className="space-y-6 pt-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-background/40 p-3 rounded-xl border flex flex-col items-center justify-center gap-1 text-center">
                                        <Clock className="w-4 h-4 text-muted-foreground mb-1" />
                                        <span className="text-xs text-muted-foreground">Expires</span>
                                        <span className="text-sm font-medium">
                                            {(() => {
                                                try {
                                                    const date = share.expiresAt as any;
                                                    // Handle Firestore Timestamp
                                                    if (date?.seconds) {
                                                        return new Date(date.seconds * 1000).toLocaleDateString();
                                                    }
                                                    // Handle JS Date object or string
                                                    return new Date(date).toLocaleDateString();
                                                } catch (e) {
                                                    return 'Never';
                                                }
                                            })()}
                                        </span>
                                    </div>
                                    <div className="bg-background/40 p-3 rounded-xl border flex flex-col items-center justify-center gap-1 text-center">
                                        <ShieldCheck className="w-4 h-4 text-muted-foreground mb-1" />
                                        <span className="text-xs text-muted-foreground">Security</span>
                                        <span className="text-sm font-medium">End-to-End</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleDownload}
                                    className="w-full h-14 text-lg font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all group"
                                    disabled={downloading}
                                >
                                    {downloading ? (
                                        <>
                                            <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                                            Downloading...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                                            Download Secure File
                                        </>
                                    )}
                                </Button>

                                <p className="text-xs text-center text-muted-foreground/80 px-8 leading-relaxed">
                                    This file uses <strong>PNGX Steganography</strong>.
                                    You will need the <span className="text-primary font-medium">Security Note</span> (Key) to unlock its contents after downloading.
                                </p>
                            </CardContent>

                            <CardFooter className="flex-col justify-center border-t bg-background/30 py-6 gap-3">
                                <div className="flex items-center gap-2 text-sm text-center text-muted-foreground opacity-75 hover:opacity-100 transition-opacity">
                                    <Share2 className="w-4 h-4" />
                                    <span>Shared via <strong>PNGX</strong></span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                                    <ShieldCheck className="w-3 h-3" />
                                    <span>Zero-Knowledge Encryption</span>
                                </div>
                            </CardFooter>
                        </Card>

                        <div className="mt-8 text-center">
                            <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="text-muted-foreground hover:text-foreground">
                                Create your own secure share link
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function SharePage() {
    return (
        <React.Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        }>
            <ShareContent />
        </React.Suspense>
    );
}
