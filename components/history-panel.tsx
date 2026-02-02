'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Download, Trash2, FileUp, FileDown, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useHistory } from '@/hooks/use-history';
import { HistoryItem } from '@/lib/firestore/types';
import { getDownloadUrl } from '@/lib/storage/s3-storage';
import { toast } from 'sonner';

export function HistoryPanel() {
    const { history, isLoading, deleteHistoryItem, clearHistory } = useHistory();
    const [isExpanded, setIsExpanded] = React.useState(false);

    const downloadItem = async (item: HistoryItem) => {
        try {
            let url = item.downloadUrl;

            // Prefer fresh signed URL if storage path exists (for private S3 objects)
            if (item.storagePath) {
                const toastId = toast.loading('Preparing download...');
                try {
                    // Pass fileName to force 'attachment' content-disposition
                    url = await getDownloadUrl(item.storagePath, item.fileName);
                    toast.dismiss(toastId);
                } catch (error) {
                    console.error('Failed to get signed URL:', error);
                    toast.error('Failed to prepare download link', { id: toastId });
                    return;
                }
            }

            if (!url) {
                toast.error('Download link not available');
                return;
            }

            const a = document.createElement('a');
            a.href = url;
            a.download = item.fileName;
            a.target = '_blank'; // Fallback for browsers
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to start download');
        }
    };

    const formatTimestamp = (dateInput: any) => {
        if (!dateInput) return '';
        const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    // If empty and not expanded, we still render the card but maybe minimal?
    // Actually, let's just render the card always so user sees "Recent Activity" is empty.
    // Logic below handles empty state in expanded view.

    return (
        <Card className="border-muted/50 bg-card/30 backdrop-blur-sm">
            <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                        <span className="text-sm text-muted-foreground">({history.length})</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                </div>
                <CardDescription>Your recent encoding and decoding operations</CardDescription>
            </CardHeader>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                                <div className="flex-1" />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => clearHistory()}
                                    className="text-destructive hover:text-destructive"
                                    disabled={isLoading || history.length === 0}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Clear All
                                </Button>
                            </div>

                            <ScrollArea className="h-[300px] pr-4">
                                <div className="space-y-3">
                                    {isLoading ? (
                                        // Loading Skeletons
                                        Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-background/20">
                                                <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                                                    <div className="h-3 w-1/3 bg-muted rounded animate-pulse" />
                                                </div>
                                            </div>
                                        ))
                                    ) : history.length === 0 ? (
                                        // Empty State
                                        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground opacity-70">
                                            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                                                <Clock className="w-6 h-6 opacity-50" />
                                            </div>
                                            <p className="text-sm font-medium">No recent activity</p>
                                            <p className="text-xs">Secure some files to get started</p>
                                        </div>
                                    ) : (
                                        history.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center justify-between p-3 rounded-lg border bg-background/50 hover:bg-background transition-colors group"
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className={`p-2 rounded-lg ${item.type === 'encode'
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'bg-secondary/10 text-secondary'
                                                        }`}>
                                                        {item.type === 'encode' ? (
                                                            <FileUp className="w-4 h-4" />
                                                        ) : (
                                                            <FileDown className="w-4 h-4" />
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm truncate">{item.fileName}</p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <span className="capitalize">{item.type}d</span>
                                                            <span>•</span>
                                                            <span>{formatBytes(item.fileSize)}</span>
                                                            <span>•</span>
                                                            <span>{formatTimestamp(item.timestamp)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    {(item.downloadUrl || item.storagePath) && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                                                            onClick={() => downloadItem(item)}
                                                            title="Download File"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => item.id && deleteHistoryItem(item.id, item.storagePath)}
                                                        title="Delete from History"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}
