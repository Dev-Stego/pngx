'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getAllHistory, deleteUserFile } from '@/lib/firestore/admin';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Trash2, FileText, Search, AlertTriangle, RefreshCw, Flag, Eye } from 'lucide-react';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

export default function GlobalFileInspector() {
    const router = useRouter();
    const [files, setFiles] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [lastDoc, setLastDoc] = React.useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loadingMore, setLoadingMore] = React.useState(false);

    // In a real app we might search/filter. 
    // Firestore doesn't support full-text search without Algolia/Typesense, 
    // so client-side filtering or exact match is often used for simple admin panels.

    const fetchFiles = async (startAfterDoc?: QueryDocumentSnapshot<DocumentData>) => {
        try {
            const result = await getAllHistory(20, startAfterDoc);
            if (startAfterDoc) {
                setFiles(prev => [...prev, ...result.files]);
            } else {
                setFiles(result.files);
            }
            setLastDoc(result.lastDoc);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch files');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    React.useEffect(() => {
        fetchFiles();
    }, []);

    const handleLoadMore = () => {
        if (lastDoc) {
            setLoadingMore(true);
            fetchFiles(lastDoc);
        }
    };

    const handleDelete = async (uid: string, fileId: string) => {
        if (!confirm('Are you sure you want to delete this file record? This cannot be undone.')) return;

        try {
            await deleteUserFile(uid, fileId);
            toast.success('File record deleted');
            setFiles(prev => prev.filter(f => f.id !== fileId));
        } catch (error) {
            toast.error('Failed to delete file');
        }
    };

    // Format bytes helper
    const formatBytes = (bytes: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const sizes = ['B', 'KB', 'MB', 'GB'];
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Global File Inspector</h1>
                <p className="text-muted-foreground">Monitoring all encrypted content across the platform.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Files Scanned</CardTitle>
                        <FileText className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{files.length}{lastDoc ? '+' : ''}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
                        <Flag className="w-4 h-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Automated checks</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Actions Taken</CardTitle>
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Admin interventions</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main File Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Encrypted Files</CardTitle>
                            <CardDescription>Real-time view of user uploads.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => { setLoading(true); fetchFiles(); }}>
                            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading && !lastDoc ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="relative overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>File Name</TableHead>
                                        <TableHead>Size</TableHead>
                                        <TableHead>Owner</TableHead>
                                        <TableHead>Uploaded</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {files.map((file) => (
                                        <TableRow key={file.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-[10px] font-mono uppercase bg-primary/5 text-primary">
                                                        {file.fileType?.split('/')[1] || 'FILE'}
                                                    </div>
                                                    <span className="truncate max-w-[200px]" title={file.fileName}>{file.fileName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{formatBytes(file.fileSize)}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="link"
                                                    className="p-0 h-auto text-muted-foreground hover:text-primary"
                                                    onClick={() => router.push(`/admin/users/${file.uid}`)}
                                                >
                                                    {file.uid ? `${file.uid.slice(0, 6)}...` : 'Unknown'}
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                {file.timestamp ? formatDistanceToNow(file.timestamp.toDate ? file.timestamp.toDate() : new Date(file.timestamp), { addSuffix: true }) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/users/${file.uid}`)} title="View Owner">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(file.uid, file.id)} title="Delete Record">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {files.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground">
                                    No files found in the system.
                                </div>
                            )}
                        </div>
                    )}

                    {lastDoc && (
                        <div className="flex justify-center pt-4 border-t mt-4">
                            <Button
                                variant="ghost"
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                            >
                                {loadingMore ? 'Loading...' : 'Load More'}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
