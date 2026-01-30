'use client';

import * as React from 'react';
import { useAccount, useReadContract, useSignMessage } from 'wagmi';
import { PNGX_BACKUP_ABI, PNGX_CONTRACT_ADDRESS, type BackupStruct } from '@/lib/web3/abi';
import { decryptNote } from '@/lib/web3/encryption';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Copy, Key, Calendar, FileText, Database, ShieldAlert, BadgeCheck, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { copyToClipboard } from '@/lib/crypto/note-generator';

interface BlockchainBackupsProps {
    onNoteRecovered?: (note: string) => void;
}

// Check if contract is deployed (not zero address)
const isContractDeployed = PNGX_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000';

export function BlockchainBackups({ onNoteRecovered }: BlockchainBackupsProps) {
    const { isConnected, address } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const [isRecovering, setIsRecovering] = React.useState<number | null>(null);
    const [isOpen, setIsOpen] = React.useState(false);
    const [recoveredNotes, setRecoveredNotes] = React.useState<Record<number, string>>({});

    // Read active backups from contract (only if contract is deployed)
    const { data: backups, isLoading, refetch } = useReadContract({
        abi: PNGX_BACKUP_ABI,
        address: PNGX_CONTRACT_ADDRESS,
        functionName: 'getMyActiveBackups',
        account: address,
        query: {
            enabled: isConnected && isOpen && isContractDeployed,
        }
    });

    const handleRecover = async (backup: BackupStruct, index: number) => {
        try {
            if (recoveredNotes[index]) {
                // If already recovered, copy or autofill
                if (onNoteRecovered) onNoteRecovered(recoveredNotes[index]);
                toast.success('Note copied!', { id: 'recover-status' });
                return;
            }

            setIsRecovering(index);
            
            // Check storage format
            const objectId = backup.greenfieldObjectId;
            
            // Handle different storage formats
            let encryptedNote: string;
            
            if (objectId.startsWith('encrypted:')) {
                // INTERIM FORMAT: Encrypted note stored directly in field
                encryptedNote = objectId.slice('encrypted:'.length);
            } else if (objectId.startsWith('greenfield:') || objectId.startsWith('bnb://')) {
                // FUTURE: Greenfield storage
                toast.error('Greenfield recovery not yet implemented. Coming soon!', { id: 'recover-status' });
                return;
            } else if (objectId.startsWith('pending/')) {
                // Old placeholder format - can't recover
                toast.error('This backup was created before full storage was implemented. Cannot recover.', { id: 'recover-status' });
                return;
            } else {
                // Unknown format - try to use as encrypted note directly
                encryptedNote = objectId;
            }

            toast.loading('Please sign to decrypt this backup...', { id: 'recover-status' });

            // 1. Get Signature (Key) - MUST MATCH SecureProcessor message exactly
            const signature = await signMessageAsync({
                message: 'Sign this message to encrypt/decrypt your PNGX backups.\n\nWARNING: Signing this allows access to your secured notes.'
            });

            toast.loading('Decrypting note...', { id: 'recover-status' });

            // 2. Decrypt the note
            const decryptedNote = await decryptNote(encryptedNote, signature);
            
            // 3. Store and notify
            setRecoveredNotes(prev => ({ ...prev, [index]: decryptedNote }));
            
            if (onNoteRecovered) {
                onNoteRecovered(decryptedNote);
            }
            
            toast.success('Note recovered successfully!', { id: 'recover-status' });

        } catch (error) {
            console.error(error);
            toast.error('Recovery failed. Note might be corrupted or wrong wallet.', { id: 'recover-status' });
        } finally {
            setIsRecovering(null);
        }
    };

    const copyNote = (note: string) => {
        copyToClipboard(note);
        toast.success('Note copied to clipboard');
    };

    // Don't show if not connected or contract not deployed
    if (!isConnected || !isContractDeployed) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-orange-500/20 text-orange-600 hover:text-orange-700 hover:bg-orange-500/10">
                    <Database className="w-4 h-4" />
                    Recover from Chain
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-orange-500" />
                        Blockchain Backups
                    </DialogTitle>
                    <DialogDescription>
                        Recover your security notes stored on the blockchain.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : !backups || backups.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground space-y-3 bg-muted/30 rounded-lg">
                            <Database className="w-10 h-10 mx-auto opacity-20" />
                            <p>No backups found on this account.</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[300px] pr-4">
                            <div className="space-y-4">
                                {(backups as BackupStruct[]).filter(b => !b.deleted).map((backup, i) => (
                                    <div key={i} className="p-3 border rounded-lg bg-background/50 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-medium truncate max-w-[150px]">
                                                        {backup.fileHash || 'Unknown File'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDistanceToNow(new Date(Number(backup.timestamp) * 1000), { addSuffix: true })}
                                                </div>
                                                {backup.greenfieldObjectId && (
                                                    <div className="flex items-center gap-1 text-xs text-blue-500">
                                                        <Database className="w-3 h-3" />
                                                        <span className="truncate max-w-[180px]">{backup.greenfieldObjectId}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {recoveredNotes[i] ? (
                                                <div className="flex gap-1">
                                                    <Button size="sm" variant="ghost" onClick={() => copyNote(recoveredNotes[i])}>
                                                        <Copy className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    disabled={isRecovering === i}
                                                    onClick={() => handleRecover(backup, i)}
                                                >
                                                    {isRecovering === i ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlock className="w-3 h-3 mr-1" />}
                                                    Decrypt
                                                </Button>
                                            )}
                                        </div>

                                        {recoveredNotes[i] && (
                                            <div className="p-2 bg-green-500/10 border border-green-500/20 rounded text-xs font-mono break-all text-green-700 dark:text-green-400">
                                                {recoveredNotes[i]}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                <div className="flex justify-between items-center text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" />
                        <span>Decryption requires wallet signature</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
