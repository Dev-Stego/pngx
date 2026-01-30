import { useState, useRef, useEffect, useCallback } from 'react';
import { encode as encodePng, decode as decodePng } from 'fast-png';
import { buildPayload, parsePayload } from '@/lib/steganography/payload';
import type { WorkerMessage, WorkerResponse } from '@/lib/workers/types';

export function useStegWorker() {
    const workerRef = useRef<Worker | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [stage, setStage] = useState('');

    useEffect(() => {
        // Initialize Worker
        workerRef.current = new Worker(new URL('../lib/workers/steg.worker.ts', import.meta.url));

        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    const encode = useCallback(async (
        file: File,
        coverImage: File,
        secretNote: string
    ) => {
        if (!workerRef.current) throw new Error('Worker not initialized');
        setIsProcessing(true);
        setStatus(0, 'Preparing Payload...');

        try {
            // 1. Build Payload (Main Thread)
            const secretData = await buildPayload(file, secretNote);

            // 2. Prepare Pixel Data (Main Thread - Robust)
            // CRITICAL: Use createImageBitmap with colorSpaceConversion: 'none' to prevent
            // browser color profile transformations that corrupt LSB-encoded data.
            const bitmap = await createImageBitmap(coverImage, {
                colorSpaceConversion: 'none',
                premultiplyAlpha: 'none'
            });

            // CRITICAL: Create canvas WITHOUT colorSpace to avoid color management
            // This ensures raw pixel values are preserved in the output PNG
            const canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            const ctx = canvas.getContext('2d', {
                willReadFrequently: true
            });
            if (!ctx) throw new Error('Canvas context failed');

            ctx.drawImage(bitmap, 0, 0);
            bitmap.close(); // Free memory
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            const payloadSize = secretData.length;

            setStatus(10, 'Sending to Worker...');

            // 3. Post to Worker
            return new Promise<{ imageUrl: string, encryptedSize: number }>((resolve, reject) => {
                const worker = workerRef.current!;

                const handler = (event: MessageEvent<WorkerResponse>) => {
                    const { type } = event.data;

                    if (type === 'PROGRESS') {
                        const p = event.data as any;
                        setStatus(p.progress, p.stage);
                    } else if (type === 'ENCODE_COMPLETE') {
                        const res = event.data as any;
                        const processedImageData = res.result.imageData as ImageData;

                        // Convert ImageData to PNG using fast-png (no color management)
                        setStatus(95, 'Generating Image...');

                        try {
                            // CRITICAL: Use fast-png to create raw PNG without browser color management
                            // This preserves exact LSB values
                            const pngData = encodePng({
                                width: processedImageData.width,
                                height: processedImageData.height,
                                data: processedImageData.data,
                                depth: 8,
                                channels: 4
                            });
                            
                            const blob = new Blob([pngData.buffer as ArrayBuffer], { type: 'image/png' });
                            worker.removeEventListener('message', handler);

                            resolve({
                                imageUrl: URL.createObjectURL(blob),
                                encryptedSize: payloadSize
                            });
                            setIsProcessing(false);
                        } catch (pngError) {
                            worker.removeEventListener('message', handler);
                            reject(new Error('PNG encoding failed: ' + (pngError as Error).message));
                            setIsProcessing(false);
                        }

                    } else if (type === 'ERROR') {
                        const err = event.data as any;
                        worker.removeEventListener('message', handler);
                        reject(new Error(err.error));
                        setIsProcessing(false);
                    }
                };

                worker.addEventListener('message', handler);

                // Transfer the buffer to the worker
                worker.postMessage({
                    type: 'ENCODE',
                    payload: { imageData, secretData, fileType: file.type }
                } as WorkerMessage, [imageData.data.buffer, secretData.buffer]);
            });

        } catch (error) {
            setIsProcessing(false);
            throw error;
        }
    }, []);

    const decode = useCallback(async (
        coverImage: File,
        secretNote: string
    ) => {
        if (!workerRef.current) throw new Error('Worker not initialized');
        setIsProcessing(true);
        setStatus(0, 'Loading Image...');

        try {
            // 1. Load PNG using fast-png (bypasses browser color management completely)
            // CRITICAL: This ensures exact pixel values are preserved
            const arrayBuffer = await coverImage.arrayBuffer();
            const png = decodePng(new Uint8Array(arrayBuffer));
            
            // Convert to ImageData format for worker
            const imageData = new ImageData(
                new Uint8ClampedArray(png.data),
                png.width,
                png.height
            );

            setStatus(10, 'Sending to Worker...');

            return new Promise<File>((resolve, reject) => {
                const worker = workerRef.current!;

                const handler = async (event: MessageEvent<WorkerResponse>) => {
                    const { type } = event.data;

                    if (type === 'PROGRESS') {
                        const p = event.data as any;
                        setStatus(p.progress, p.stage);
                    } else if (type === 'DECODE_COMPLETE') {
                        const res = event.data as any;
                        const rawBytes = res.result.decryptedData as Uint8Array;

                        worker.removeEventListener('message', handler);
                        setStatus(80, 'Decrypting Content...');

                        try {
                            // Parse & Decrypt (Main Thread)
                            const file = await parsePayload(rawBytes, secretNote);
                            resolve(file);
                        } catch (e) {
                            reject(e);
                        } finally {
                            setIsProcessing(false);
                        }

                    } else if (type === 'ERROR') {
                        const err = event.data as any;
                        worker.removeEventListener('message', handler);
                        reject(new Error(err.error));
                        setIsProcessing(false);
                    }
                };

                worker.addEventListener('message', handler);

                worker.postMessage({
                    type: 'DECODE',
                    payload: { imageData }
                } as WorkerMessage, [imageData.data.buffer]);
            });

        } catch (error) {
            setIsProcessing(false);
            throw error;
        }
    }, []);

    const setStatus = (p: number, s: string) => {
        setProgress(p);
        setStage(s);
    };

    return {
        encode,
        decode,
        isProcessing,
        progress,
        stage
    };
}
