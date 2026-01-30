'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

import { DropZone } from '@/components/ui/drop-zone';
import { PasswordInput } from '@/components/ui/password-input';
import { FilePreview } from '@/components/ui/file-preview';
import { ProgressRing } from '@/components/ui/progress-ring';
import { useHistory } from '@/hooks/use-history';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { type EncodingResult as BaseEncodingResult } from '@/lib/encoder/pngx-encoder';
import { decodeImageToFile, type DecodingResult } from '@/lib/decoder/pngx-decoder';

export interface EncodingResult extends BaseEncodingResult {
    fileName?: string;
}
import { ShareModal } from '@/components/share-modal';
import { generateSecurityNote, createNoteFile, downloadNoteFile, copyToClipboard, type GeneratedNote } from '@/lib/crypto/note-generator';
import { Download, ShieldCheck, RefreshCw, X, Copy, FileText, Share2, Lock, HelpCircle, Info, Unlock } from 'lucide-react';
import { formatBytes, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useSignMessage, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { PNGX_BACKUP_ABI, PNGX_CONTRACT_ADDRESS } from '@/lib/web3/abi';
import { encryptNote } from '@/lib/web3/encryption';
import { WalletConnect } from '@/components/web3/wallet-connect';
import { ImageIcon, Database } from 'lucide-react';
import { BlockchainBackups } from '@/components/blockchain-backups';
import { useStegWorker } from '@/hooks/use-steg-worker';
import { StepUpload } from './secure-processor/step-upload';
import { StepMode } from './secure-processor/step-mode';
import { StepEncrypt } from './secure-processor/step-encrypt';

export function SecureProcessor() {
    const { addHistoryItem } = useHistory();
    const { encode, decode, isProcessing: isWorkerProcessing, progress: workerProgress, stage: workerStage } = useStegWorker();

    React.useEffect(() => {
        const handler = (event: PromiseRejectionEvent) => {
            if (event.reason?.code === 'unavailable' || event.reason?.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
                toast.error('Network blocked. Please disable AdBlock or Firewalls for Firebase/Firestore.');
            }
        };
        window.addEventListener('unhandledrejection', handler);
        return () => window.removeEventListener('unhandledrejection', handler);
    }, []);

    const [activeTab, setActiveTab] = React.useState<string>('encode');
    const [encryptionMode, setEncryptionMode] = React.useState<'quick' | 'steganography' | null>(null);
    const [file, setFile] = React.useState<File | null>(null);
    const [coverImage, setCoverImage] = React.useState<File | null>(null);
    const [capacityStats, setCapacityStats] = React.useState<{ max: number; used: number } | null>(null);

    const [note, setNote] = React.useState(''); // Used for decoding input
    const [generatedNote, setGeneratedNote] = React.useState<GeneratedNote | null>(null); // Used for encoding
    const [isShareOpen, setIsShareOpen] = React.useState(false);

    const [isProcessing, setIsProcessing] = React.useState(false);
    const [progress, setProgress] = React.useState(0);

    const [encodingResult, setEncodingResult] = React.useState<EncodingResult | null>(null);
    const [decodingResult, setDecodingResult] = React.useState<DecodingResult | null>(null);
    const [decodeError, setDecodeError] = React.useState<string | null>(null);

    // Web3 State
    const { isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const { writeContractAsync, isPending: isTxPending } = useWriteContract();

    const handleBackupChain = async () => {
        if (!generatedNote || !file || !isConnected) return;

        try {
            toast.loading('Please sign the message to encrypt your note...', { id: 'backup-status' });

            // 1. Get Signature (Key)
            // CRITICAL: We use a static message to allow key recovery later
            const signature = await signMessageAsync({
                message: 'Sign this message to encrypt/decrypt your PNGX backups.\n\nWARNING: Signing this allows access to your secured notes.'
            });

            toast.loading('Encrypting note with signature...', { id: 'backup-status' });

            // 2. Encrypt Note
            const encryptedNote = await encryptNote(generatedNote.note, signature);

            // 3. Compute note hash for on-chain verification
            const noteBytes = new TextEncoder().encode(encryptedNote);
            const hashBuffer = await crypto.subtle.digest('SHA-256', noteBytes);
            const noteHash = '0x' + Array.from(new Uint8Array(hashBuffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('') as `0x${string}`;

            // INTERIM: Store encrypted note directly in greenfieldObjectId field
            // TODO: Replace with actual Greenfield upload once SDK is integrated
            // Format: "encrypted:<base64_encrypted_note>" to distinguish from future Greenfield IDs
            const greenfieldObjectId = `encrypted:${encryptedNote}`;

            toast.loading('Confirm transaction in wallet...', { id: 'backup-status' });

            // 4. Send to Contract
            const hash = await writeContractAsync({
                abi: PNGX_BACKUP_ABI,
                address: PNGX_CONTRACT_ADDRESS,
                functionName: 'addBackup',
                args: [noteHash, greenfieldObjectId, file.name],
            });

            toast.success('Backup saved on-chain successfully!', { id: 'backup-status' });
        } catch (error) {
            console.error(error);
            toast.error('Backup failed: ' + (error instanceof Error ? error.message : 'Unknown error'), { id: 'backup-status' });
        }
    };

    const resetState = () => {
        setFile(null);
        setEncryptionMode(null);
        setCoverImage(null);
        setCapacityStats(null);
        setNote('');
        setGeneratedNote(null);
        setEncodingResult(null);
        setDecodingResult(null);
        setProgress(0);
        setDecodeError(null);
    };

    // Calculate Capacity
    React.useEffect(() => {
        if (coverImage && file) {
            createImageBitmap(coverImage).then((bmp) => {
                const totalPixels = bmp.width * bmp.height;
                const capacityBits = totalPixels * 3;

                // 328 bytes header + file + 16 bytes tag overhead
                const payloadBytes = 328 + file.size + 16;
                // 32 bits LSB header + payload bits
                const neededBits = 32 + (payloadBytes * 8);

                setCapacityStats({
                    max: capacityBits,
                    used: neededBits
                });
                bmp.close();
            }).catch(() => setCapacityStats(null));
        } else {
            setCapacityStats(null);
        }
    }, [coverImage, file]);

    const handleTabChange = (val: string) => {
        setActiveTab(val);
        resetState();
    };

    const handleEncode = async () => {
        if (!file) {
            toast.error('Please provide a file.');
            return;
        }

        // Auto-generate note
        const newNote = generateSecurityNote('phrase');
        setGeneratedNote(newNote);

        setIsProcessing(true);
        setProgress(10);

        try {
            let result: EncodingResult;
            let targetCoverImage = coverImage;

            // Encryption Mode: Quick (Generate Noise) vs Steganography (User Image)
            if (!targetCoverImage) {
                // Quick Mode: Generate a Noise Cover Image
                // LSB Capacity: 3 bits per pixel (RGB). Need (Size * 8) bits.
                // Size = Sqrt((Bytes * 8 + 64) / 3)
                const totalBits = (file.size + 1024) * 8; // Be generous + header
                const pixelsNeeded = Math.ceil(totalBits / 3);
                const dim = Math.ceil(Math.sqrt(pixelsNeeded));

                const canvas = document.createElement('canvas');
                canvas.width = dim;
                canvas.height = dim;
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error("Canvas init failed");

                const imgData = ctx.createImageData(dim, dim);
                for (let i = 0; i < imgData.data.length; i += 4) {
                    imgData.data[i] = Math.floor(Math.random() * 256);
                    imgData.data[i + 1] = Math.floor(Math.random() * 256);
                    imgData.data[i + 2] = Math.floor(Math.random() * 256);
                    imgData.data[i + 3] = 255;
                }
                ctx.putImageData(imgData, 0, 0);

                await new Promise<void>((resolve, reject) => {
                    canvas.toBlob((blob) => {
                        if (blob) {
                            targetCoverImage = new File([blob], "noise_cover.png", { type: 'image/png' });
                            resolve();
                        } else {
                            reject(new Error("Failed to generate noise"));
                        }
                    });
                });
            }

            if (!targetCoverImage) throw new Error("Cover image preparation failed");

            // Use LSB Worker for BOTH modes (Robust)
            const workerResult = await encode(file, targetCoverImage, newNote.note);

            // Fetch dimensions for result display
            const img = new Image();
            img.src = workerResult.imageUrl;
            await new Promise(r => img.onload = r);

            result = {
                imageUrl: workerResult.imageUrl,
                width: img.width,
                height: img.height,
                encryptedSize: workerResult.encryptedSize
            };

            setProgress(100);

            // Generate unique secure filename
            const timestamp = Math.floor(Date.now() / 1000);
            const randomSuffix = Math.random().toString(36).substring(2, 6);
            const secureFileName = `pngx_${timestamp}_${randomSuffix}.png`;

            setEncodingResult({ ...result, fileName: secureFileName });
            toast.success('File encrypted successfully!');

            await addHistoryItem({
                type: 'encode',
                fileName: secureFileName,
                fileSize: result.encryptedSize,
                fileType: 'image/png',
                blobUrl: result.imageUrl,
            });
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : 'Encoding failed');
            setProgress(0);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDecode = async () => {
        if (!file || !note) {
            toast.error('Please provide the PNGX image and your security note.');
            return;
        }

        setIsProcessing(true);
        setProgress(10);

        try {
            let result: DecodingResult;

            try {
                // Try LSB First (current encoding method)
                const decryptedFile = await decode(file, note);
                result = {
                    file: decryptedFile,
                    decryptedSize: decryptedFile.size
                };
            } catch (lsbError) {
                // If LSB fails, try Legacy decoder for backward compatibility
                try {
                    result = await decodeImageToFile({
                        imageFile: file,
                        secretNote: note,
                    });
                } catch (legacyError) {
                    // Both methods failed
                    throw new Error(`Decryption failed. The file may be corrupted, or the note is incorrect.\nSteganography Error: ${(lsbError as Error).message}\nLegacy Error: ${(legacyError as Error).message}`);
                }
            }

            setProgress(100);
            setDecodingResult(result);
            toast.success('File decrypted successfully!');

            // Add to history
            await addHistoryItem({
                type: 'decode',
                fileName: result.file.name,
                fileSize: result.file.size,
                fileType: result.file.type,
            });
        } catch (error) {
            console.error(error);
            const errorMsg = error instanceof Error ? error.message : 'Decryption failed. Incorrect note or password.';
            setDecodeError(errorMsg);
            setProgress(0);
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadFile = (file: File) => {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const downloadImage = (url: string, name: string) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleCopyNote = async () => {
        if (generatedNote) {
            const success = await copyToClipboard(generatedNote.note);
            if (success) toast.success('Security note copied to clipboard');
            else toast.error('Failed to copy note');
        }
    };

    const handleDownloadNote = () => {
        if (generatedNote && file && encodingResult) {
            // Use secure filename for note too
            const secureBaseName = encodingResult.fileName?.split('.')[0] || 'secure_file';
            const blob = createNoteFile(generatedNote.note, file.name, {
                fileSize: file.size,
                dimensions: `${encodingResult.width} x ${encodingResult.height}`,
                createdAt: generatedNote.createdAt
            });
            downloadNoteFile(blob, `pngx-key-${secureBaseName}.txt`);
            toast.success('Security note downloaded');
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-3 sm:p-4 space-y-6 sm:space-y-8">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 sm:mb-8 bg-muted/20 p-1 rounded-xl">
                    <TabsTrigger value="encode" className="text-base sm:text-lg py-2.5 sm:py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 transition-all">
                        Encode (Hide)
                    </TabsTrigger>
                    <TabsTrigger value="decode" className="text-base sm:text-lg py-2.5 sm:py-3 rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-secondary/25 transition-all">
                        Decode (Recover)
                    </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                    {isProcessing ? (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center justify-center min-h-[400px] space-y-8"
                        >
                            <ProgressRing progress={isWorkerProcessing ? workerProgress : progress} size={160} />
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary animate-pulse">
                                    {isWorkerProcessing ? workerStage : (activeTab === 'encode' ? 'Encrypting & Rendering...' : 'Decrypting & Verifying...')}
                                </h3>
                                <p className="text-muted-foreground">
                                    {isWorkerProcessing ? 'Processing in background worker...' : 'Running local client-side cryptography...'}
                                </p>
                            </div>
                        </motion.div>
                    ) : encodingResult ? (
                        <motion.div
                            key="result-encode"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <Card className="border-primary/20 bg-primary/5 overflow-hidden">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ShieldCheck className="w-6 h-6 text-primary" />
                                        Encryption Complete
                                    </CardTitle>
                                    <CardDescription>
                                        Your file has been secured inside this PNG image.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-col md:flex-row gap-6 items-center">
                                        <div className="relative border-4 border-dashed border-primary/20 rounded-xl p-2 bg-background">
                                            <img src={encodingResult.imageUrl} alt="Result" className="max-w-[200px] h-auto rounded-lg shadow-2xl" />
                                        </div>
                                        <div className="space-y-4 flex-1">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="p-3 bg-background rounded-lg border">
                                                    <p className="text-muted-foreground">Dimensions</p>
                                                    <p className="font-mono font-bold">{encodingResult.width} x {encodingResult.height} px</p>
                                                </div>
                                                <div className="p-3 bg-background rounded-lg border">
                                                    <p className="text-muted-foreground">Encrypted Size</p>
                                                    <p className="font-mono font-bold">{formatBytes(encodingResult.encryptedSize)}</p>
                                                </div>
                                            </div>
                                            <div className="bg-muted/40 p-4 rounded-xl border space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-sm font-medium text-muted-foreground">Security Note (Save This!)</Label>
                                                    <div className="flex gap-2">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyNote} title="Copy Note">
                                                            <Copy className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownloadNote} title="Download Note">
                                                            <FileText className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-background border rounded-lg font-mono text-lg font-bold text-center tracking-wider text-primary break-all select-all">
                                                    {generatedNote?.note}
                                                </div>
                                                <p className="text-xs text-muted-foreground text-center">
                                                    You need this exact note to recover your file. We do not store it.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="bg-muted/30 px-6 py-4 border-t flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-orange-500/10 text-orange-500">
                                            <Database className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-medium">Backup Note to Blockchain</p>
                                            <p className="text-xs text-muted-foreground">Store your key securely on-chain.</p>
                                        </div>
                                    </div>
                                    {isConnected ? (
                                        <Button
                                            variant="default"
                                            onClick={handleBackupChain}
                                            disabled={isTxPending}
                                            className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl border-none"
                                        >
                                            <Database className="w-4 h-4 mr-2" />
                                            {isTxPending ? 'Backing up...' : 'Backup Now'}
                                        </Button>
                                    ) : (
                                        <WalletConnect />
                                    )}
                                </div>
                                <CardFooter className="flex gap-4 justify-end bg-background/50 border-t p-6">
                                    <Button variant="outline" onClick={resetState}>
                                        <RefreshCw className="mr-2 w-4 h-4" /> New
                                    </Button>
                                    <Button variant="outline" onClick={() => setIsShareOpen(true)} className="border-blue-500/20 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10">
                                        <Share2 className="mr-2 w-4 h-4" /> Share
                                    </Button>
                                    <Button
                                        onClick={() => downloadImage(encodingResult.imageUrl, encodingResult.fileName || `pngx_secured_${Math.floor(Date.now() / 1000)}.png`)}
                                        className="bg-primary hover:bg-primary/90"
                                    >
                                        <Download className="mr-2 w-4 h-4" /> Download PNG
                                    </Button>
                                </CardFooter>
                            </Card>

                            <ShareModal
                                isOpen={isShareOpen}
                                onClose={() => setIsShareOpen(false)}
                                fileData={{
                                    fileName: encodingResult.fileName || 'secured-file.png',
                                    fileType: file?.type || 'application/octet-stream',
                                    fileSize: encodingResult.encryptedSize,
                                    imageUrl: encodingResult.imageUrl
                                }}
                            />
                        </motion.div>
                    ) : decodingResult ? (
                        <motion.div
                            key="result-decode"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <Card className="border-secondary/20 bg-secondary/5 overflow-hidden">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ShieldCheck className="w-6 h-6 text-secondary" />
                                        Decryption Successful
                                    </CardTitle>
                                    <CardDescription>
                                        We verified the integrity of your file and recovered it.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    <FilePreview file={decodingResult.file} />
                                </CardContent>
                                <CardFooter className="flex gap-4 justify-end bg-background/50 border-t p-6">
                                    <Button variant="outline" onClick={resetState}>
                                        <RefreshCw className="mr-2 w-4 h-4" /> Decode Another
                                    </Button>
                                    <Button
                                        onClick={() => downloadFile(decodingResult.file)}
                                        className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                                    >
                                        <Download className="mr-2 w-4 h-4" /> Download File
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="forms"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <TabsContent value="encode" className="space-y-12">
                                {/* Step 1: File Selection */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="space-y-6"
                                >
                                    {/* Step 1: File Upload */}
                                    <StepUpload
                                        file={file}
                                        onFileSelect={setFile}
                                        onFileRemove={resetState}
                                    />

                                    {/* Step 2: Choose Encryption Mode (Quick vs Steganography) */}
                                    <StepMode
                                        encryptionMode={encryptionMode}
                                        setEncryptionMode={setEncryptionMode}
                                        coverImage={coverImage}
                                        setCoverImage={setCoverImage}
                                        onCoverSelect={setCoverImage}
                                        capacityStats={capacityStats}
                                        sourceFileSize={file?.size}
                                    />

                                    {/* Step 3: Encrypt */}
                                    <StepEncrypt
                                        onEncrypt={handleEncode}
                                        isProcessing={isWorkerProcessing}
                                        isDisabled={!file || isWorkerProcessing || (encryptionMode === 'steganography' && !coverImage) || (capacityStats ? capacityStats.used > capacityStats.max : false)}
                                        progress={workerProgress}
                                        stage={workerStage}
                                    />
                                </motion.div>
                            </TabsContent>

                            <TabsContent value="decode" className="space-y-12">
                                {/* Step 1: Image Upload */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-sm">1</div>
                                        <h3 className="text-lg font-semibold">Upload PNGX Image</h3>
                                    </div>
                                    <DropZone
                                        onFileSelect={setFile}
                                        accept={{ 'image/png': ['.png'] }}
                                        title="Upload PNGX Image"
                                        description="Upload the encrypted PNG image to decode"
                                    />
                                    {file && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="flex items-center justify-between p-4 bg-secondary/5 border border-secondary/20 rounded-xl"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                                                    <ImageIcon className="w-5 h-5 text-secondary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium truncate max-w-[200px] sm:max-w-[300px]">{file.name}</p>
                                                    <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="hover:bg-destructive/10 hover:text-destructive">
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </motion.div>
                                    )}
                                </motion.div>

                                {/* Step 2: Security Note */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-sm">2</div>
                                            <h3 className="text-lg font-semibold">Enter Security Note</h3>
                                        </div>
                                        <BlockchainBackups onNoteRecovered={(recovered) => setNote(recovered)} />
                                    </div>

                                    <div className="p-4 bg-muted/30 rounded-xl border border-muted/50 space-y-4">
                                        <Textarea
                                            id="d-note"
                                            placeholder="Paste your security note here..."
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            className="min-h-[120px] resize-none bg-background border-muted"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            This is the note you received when encrypting. Without it, your file cannot be recovered.
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Step 3: Decrypt */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="space-y-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-sm">3</div>
                                        <h3 className="text-lg font-semibold">Decrypt & Recover</h3>
                                    </div>

                                    <Button
                                        size="lg"
                                        onClick={handleDecode}
                                        disabled={!file || !note}
                                        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl"
                                    >
                                        <Unlock className="w-5 h-5 mr-2" />
                                        Unlock & Restore File
                                    </Button>
                                </motion.div>
                            </TabsContent>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Tabs>

            {/* History Panel */}


            {/* Decode Error Dialog */}
            <AnimatePresence>
                {decodeError && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
                        onClick={() => setDecodeError(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-zinc-950 border border-destructive/30 rounded-2xl shadow-2xl p-6 max-w-md mx-4 space-y-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                                    <X className="w-6 h-6 text-destructive" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-destructive">Decryption Failed</h3>
                                    <p className="text-sm text-muted-foreground">Unable to recover your file</p>
                                </div>
                            </div>
                            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                                <p className="text-sm">{decodeError}</p>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <p className="font-medium">Common causes:</p>
                                <ul className="list-disc list-inside space-y-1 pl-2">
                                    <li>Incorrect security note</li>
                                    <li>Wrong password (if password-protected)</li>
                                    <li>Corrupted or modified PNG file</li>
                                    <li>File not encoded with PNGX</li>
                                </ul>
                            </div>
                            <Button
                                className="w-full"
                                variant="outline"
                                onClick={() => setDecodeError(null)}
                            >
                                Try Again
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
