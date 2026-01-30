'use client';

import * as React from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { cn, formatBytes } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DropZoneProps {
    onFileSelect: (file: File) => void;
    className?: string;
    maxSize?: number; // bytes
    disabled?: boolean;
    accept?: Record<string, string[]>; // MIME type restrictions e.g. { 'image/*': ['.png', '.jpg'] }
    title?: string; // Custom title text
    description?: string; // Custom description text
}

export function DropZone({
    onFileSelect,
    className,
    maxSize = 50 * 1024 * 1024, // 50MB default
    disabled = false,
    accept,
    title,
    description,
}: DropZoneProps) {
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

    const onDrop = React.useCallback(
        (acceptedFiles: File[], fileRejections: FileRejection[]) => {
            if (fileRejections.length > 0) {
                fileRejections.forEach(({ file, errors }) => {
                    if (errors[0]?.code === 'file-too-large') {
                        toast.error(`File too large. Max size is ${formatBytes(maxSize)}`);
                    } else {
                        toast.error(errors[0]?.message);
                    }
                });
                return;
            }

            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                setSelectedFile(file);
                onFileSelect(file);
            }
        },
        [maxSize, onFileSelect]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        maxSize,
        disabled,
        accept,
    });

    const clearFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedFile(null);
    };

    return (
        <div className={className}>
            <div
                {...getRootProps()}
                className={cn(
                    'relative flex flex-col items-center justify-center w-full min-h-[250px] p-6 text-center border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer',
                    isDragActive
                        ? 'border-primary bg-primary/5 ring-4 ring-primary/10'
                        : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
                    disabled && 'opacity-50 cursor-not-allowed',
                    selectedFile ? 'border-primary/50 bg-background' : ''
                )}
            >
                <input {...getInputProps()} />

                {selectedFile ? (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 bg-primary/10 rounded-full ring-4 ring-primary/5">
                            <FileIcon className="w-8 h-8 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatBytes(selectedFile.size)}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 group-hover:border-destructive group-hover:text-destructive transition-colors"
                            onClick={clearFile}
                        >
                            Change File
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-4 bg-muted rounded-full mb-2 group-hover:bg-background transition-colors">
                            <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <h3 className="text-lg font-semibold tracking-tight">
                            {isDragActive ? 'Drop it here!' : (title || 'Click or Drag file')}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            {description || `Support for images, docs, videos, and archives up to ${formatBytes(maxSize)}`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
