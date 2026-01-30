'use client';

import * as React from 'react';
import { FileIcon, FileText, ImageIcon, Music, Video } from 'lucide-react';
import { cn, formatBytes } from '@/lib/utils';

interface FilePreviewProps {
    file: File;
    className?: string;
}

export function FilePreview({ file, className }: FilePreviewProps) {
    const [content, setContent] = React.useState<string | null>(null);
    const type = file.type.split('/')[0];
    const isImage = type === 'image';
    const isVideo = type === 'video';
    const isAudio = type === 'audio';
    const isText = type === 'text' || file.name.endsWith('.md') || file.name.endsWith('.txt') || file.name.endsWith('.json');

    React.useEffect(() => {
        if (isImage) {
            const url = URL.createObjectURL(file);
            setContent(url);
            return () => URL.revokeObjectURL(url);
        }
        if (isText) {
            const reader = new FileReader();
            reader.onload = (e) => setContent(e.target?.result as string);
            reader.readAsText(file);
        }
    }, [file, isImage, isText]);

    return (
        <div className={cn('w-full border rounded-lg overflow-hidden bg-card', className)}>
            <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md">
                        {isImage ? <ImageIcon className="w-5 h-5 text-primary" /> :
                            isVideo ? <Video className="w-5 h-5 text-primary" /> :
                                isAudio ? <Music className="w-5 h-5 text-primary" /> :
                                    isText ? <FileText className="w-5 h-5 text-primary" /> :
                                        <FileIcon className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                        <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(file.size)} • {file.type || 'Unknown Type'}</p>
                    </div>
                </div>
            </div>

            <div className="bg-background/50 min-h-[150px] flex items-center justify-center p-4">
                {isImage && content && (
                    <img
                        src={content}
                        alt="Preview"
                        className="max-h-[300px] w-auto object-contain rounded-md"
                    />
                )}

                {isVideo && (
                    <video
                        src={URL.createObjectURL(file)}
                        controls
                        className="max-h-[300px] w-full rounded-md"
                    />
                )}

                {isAudio && (
                    <audio
                        src={URL.createObjectURL(file)}
                        controls
                        className="w-full"
                    />
                )}

                {isText && content && (
                    <div className="w-full max-h-[300px] overflow-auto p-2 text-xs font-mono bg-muted/20 rounded border">
                        <pre className="whitespace-pre-wrap break-words">{content.slice(0, 5000)}{content.length > 5000 && '...'}</pre>
                    </div>
                )}

                {!isImage && !isVideo && !isAudio && !isText && (
                    <div className="text-center py-8">
                        <FileIcon className="w-16 h-16 text-muted-foreground/20 mx-auto mb-3" />
                        <p className="text-muted-foreground">Preview not available for this file type</p>
                    </div>
                )}
            </div>
        </div>
    );
}
