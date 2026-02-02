'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Link2, Loader2, Share2, Shield, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { createShareLink, getShareUrl } from '@/lib/firestore/shares';
import { useAuth } from '@/components/auth/auth-provider';
import { uploadFile } from '@/lib/storage';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileData: {
        fileName: string;
        fileType: string;
        fileSize: number;
        imageUrl: string;
    };
}

export function ShareModal({ isOpen, onClose, fileData }: ShareModalProps) {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = React.useState(false);
    const [shareUrl, setShareUrl] = React.useState<string | null>(null);

    // Form states
    const [expiresIn, setExpiresIn] = React.useState('7');
    const [maxDownloads, setMaxDownloads] = React.useState('10');
    const [password, setPassword] = React.useState('');

    const handleCreateLink = async () => {
        if (!user) {
            toast.error('You must be logged in to share files');
            return;
        }

        setIsLoading(true);
        try {
            // Upload file to Firebase Storage first (if we have a blob url)
            let storagePath: string | undefined;
            let downloadUrl: string | undefined;

            try {
                // Fetch the blob from the blob URL
                const response = await fetch(fileData.imageUrl);
                const blob = await response.blob();

                // Create a File object
                const fileToUpload = new File([blob], fileData.fileName, { type: 'image/png' });

                const uploadResult = await uploadFile(
                    user.uid,
                    fileToUpload,
                    fileData.fileName
                );

                storagePath = uploadResult.storagePath;
                downloadUrl = uploadResult.downloadUrl;
            } catch (uploadError) {
                console.error('Upload failed:', uploadError);
                toast.error('Failed to save file for sharing');
                setIsLoading(false);
                return;
            }

            const shareId = await createShareLink(user.uid, {
                fileName: fileData.fileName,
                fileType: fileData.fileType,
                fileSize: fileData.fileSize,
                storagePath: storagePath,
                downloadUrl: downloadUrl,
                expiresInDays: parseInt(expiresIn),
                maxAccessCount: maxDownloads === 'unlimited' ? undefined : parseInt(maxDownloads),
                password: password || undefined,
            });

            if (shareId) {
                const url = getShareUrl(shareId);
                setShareUrl(url);
                toast.success('Share link created!');
            } else {
                toast.error('Failed to create share link');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (shareUrl) {
            navigator.clipboard.writeText(shareUrl);
            toast.success('Link copied to clipboard');
        }
    };

    const reset = () => {
        setShareUrl(null);
        setPassword('');
        setExpiresIn('7');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && reset()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-primary" />
                        Share Secure Details
                    </DialogTitle>
                    <DialogDescription>
                        Create a secure link to share this file.
                    </DialogDescription>
                </DialogHeader>

                {!shareUrl ? (
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Expires In
                                </Label>
                                <Select value={expiresIn} onValueChange={setExpiresIn}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 Day</SelectItem>
                                        <SelectItem value="3">3 Days</SelectItem>
                                        <SelectItem value="7">7 Days</SelectItem>
                                        <SelectItem value="30">30 Days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Max Downloads</Label>
                                <Select value={maxDownloads} onValueChange={setMaxDownloads}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 Download</SelectItem>
                                        <SelectItem value="5">5 Downloads</SelectItem>
                                        <SelectItem value="10">10 Downloads</SelectItem>
                                        <SelectItem value="unlimited">Unlimited</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                <Shield className="w-3 h-3" /> Password Protection (Optional)
                            </Label>
                            <Input
                                type="password"
                                placeholder="Enter a password..."
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                            Note: Does not include the security note. You must share both the link and the security note (key) with the recipient securely.
                        </div>
                    </div>
                ) : (
                    <div className="py-6 space-y-6">
                        <div className="flex items-center space-x-2">
                            <div className="grid flex-1 gap-2">
                                <Label htmlFor="link" className="sr-only">
                                    Link
                                </Label>
                                <Input
                                    id="link"
                                    defaultValue={shareUrl}
                                    readOnly
                                    className="bg-muted font-mono text-sm"
                                />
                            </div>
                            <Button size="icon" className="px-3" onClick={copyToClipboard}>
                                <span className="sr-only">Copy</span>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center block">
                                Or Share Directly
                            </Label>
                            <div className="flex justify-center gap-4">
                                <SocialButton
                                    platform="whatsapp"
                                    url={shareUrl}
                                    icon={<WhatsappIcon className="w-5 h-5" />}
                                    label="WhatsApp"
                                    color="hover:bg-[#25D366] hover:text-white"
                                />
                                <SocialButton
                                    platform="telegram"
                                    url={shareUrl}
                                    icon={<TelegramIcon className="w-5 h-5" />}
                                    label="Telegram"
                                    color="hover:bg-[#0088cc] hover:text-white"
                                />
                                <SocialButton
                                    platform="twitter"
                                    url={shareUrl}
                                    icon={<TwitterIcon className="w-4 h-4" />}
                                    label="X / Twitter"
                                    color="hover:bg-black hover:text-white"
                                />
                                <SocialButton
                                    platform="linkedin"
                                    url={shareUrl}
                                    icon={<LinkedinIcon className="w-5 h-5" />}
                                    label="LinkedIn"
                                    color="hover:bg-[#0077b5] hover:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <div className="text-sm text-center text-muted-foreground flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Link created successfully!
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    {!shareUrl ? (
                        <>
                            <Button variant="outline" onClick={reset}>Cancel</Button>
                            <Button onClick={handleCreateLink} disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Link2 className="mr-2 w-4 h-4" />
                                        Create Link
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <Button onClick={reset} className="w-full">Done</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function SocialButton({ platform, url, icon, label, color }: { platform: string, url: string, icon: React.ReactNode, label: string, color: string }) {
    const handleShare = () => {
        let shareLink = '';
        const text = 'Check out this secure file I shared with you via PNGX.';

        switch (platform) {
            case 'twitter':
                shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
                break;
            case 'facebook':
                shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'linkedin':
                shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                break;
            case 'whatsapp':
                shareLink = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
                break;
            case 'telegram':
                shareLink = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
                break;
        }

        window.open(shareLink, '_blank', 'width=600,height=400');
    };

    return (
        <Button
            variant="outline"
            size="icon"
            className={`rounded-full w-10 h-10 transition-colors duration-200 ${color}`}
            onClick={handleShare}
            title={`Share on ${label}`}
        >
            {icon}
            <span className="sr-only">Share on {label}</span>
        </Button>
    );
}

// Icons
function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
        </svg>
    );
}

function WhatsappIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );
}

function TelegramIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
    );
}
