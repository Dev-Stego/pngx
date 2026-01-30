'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { getHistory, deleteHistoryItem, clearHistory } from '@/lib/firestore/history';
import { HistoryItem } from '@/lib/firestore/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, FileImage, FileText, Loader2, Clock, Link2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { FullPageModal } from '@/components/ui/full-page-modal';

export default function HistoryPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [history, setHistory] = React.useState<HistoryItem[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    React.useEffect(() => {
        const fetchHistory = async () => {
            if (user) {
                const items = await getHistory(user.uid);
                setHistory(items);
            }
            setLoading(false);
        };

        if (user) {
            fetchHistory();
        }
    }, [user]);

    const handleDelete = async (itemId: string) => {
        if (!user) return;

        const success = await deleteHistoryItem(user.uid, itemId);
        if (success) {
            setHistory(history.filter(item => item.id !== itemId));
            toast.success('Item deleted');
        } else {
            toast.error('Failed to delete item');
        }
    };

    const handleClearAll = async () => {
        if (!user) return;

        const success = await clearHistory(user.uid);
        if (success) {
            setHistory([]);
            toast.success('History cleared');
        } else {
            toast.error('Failed to clear history');
        }
    };

    const formatDate = (timestamp: Timestamp | Date) => {
        try {
            const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
            return formatDistanceToNow(date, { addSuffix: true });
        } catch {
            return 'Unknown';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const ClearAction = history.length > 0 ? (
        <Button variant="destructive" size="sm" onClick={handleClearAll}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
        </Button>
    ) : null;

    return (
        <FullPageModal
            title="Conversion History"
            action={ClearAction}
        >
            <div className="max-w-3xl mx-auto">
                {history.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="font-semibold text-lg mb-2">No history yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Your conversion history will appear here when you encode or decode files.
                            </p>
                            <Button onClick={() => router.push('/')}>
                                Start Encoding
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {history.map((item) => (
                            <Card key={item.id} className="overflow-hidden">
                                <div className="flex items-center p-4 gap-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${item.type === 'encode'
                                        ? 'bg-primary/10 text-primary'
                                        : 'bg-secondary/10 text-secondary'
                                        }`}>
                                        {item.type === 'encode' ? (
                                            <FileImage className="w-6 h-6" />
                                        ) : (
                                            <FileText className="w-6 h-6" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{item.fileName}</p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span className={`px-2 py-0.5 rounded text-xs ${item.type === 'encode'
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-secondary/10 text-secondary'
                                                }`}>
                                                {item.type === 'encode' ? 'Encoded' : 'Decoded'}
                                            </span>
                                            <span>{formatFileSize(item.fileSize)}</span>
                                            <span>•</span>
                                            <span>{formatDate(item.timestamp)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {item.shareId && (
                                            <Button variant="ghost" size="icon" title="Share link">
                                                <Link2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => item.id && handleDelete(item.id)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </FullPageModal>
    );
}
