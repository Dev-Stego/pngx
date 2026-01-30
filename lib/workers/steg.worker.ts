import { encodeLSB, decodeLSB } from '../steganography/lsb';
import type { WorkerMessage, WorkerResponse } from './types';

// Web Workers in TS context
const ctx: Worker = self as any;

ctx.onmessage = async (event: MessageEvent<WorkerMessage>) => {
    const { type, payload } = event.data;

    try {
        if (type === 'ENCODE') {
            const { imageData, secretData } = payload as any;

            ctx.postMessage({ type: 'PROGRESS', progress: 30, stage: 'Injecting Bits' });

            // 2. Perform LSB Encoding (Directly on transfered buffer)
            const processedImageData = encodeLSB(imageData, secretData);

            ctx.postMessage({ type: 'PROGRESS', progress: 90, stage: 'Finalizing' });

            // 3. Return
            ctx.postMessage({
                type: 'ENCODE_COMPLETE',
                result: { imageData: processedImageData }
            }, [processedImageData.data.buffer]);

        } else if (type === 'DECODE') {
            const { imageData } = payload as any;

            ctx.postMessage({ type: 'PROGRESS', progress: 50, stage: 'Extracting Bits' });

            const decryptedData = decodeLSB(imageData);

            ctx.postMessage({
                type: 'DECODE_COMPLETE',
                result: { decryptedData }
            }, [decryptedData.buffer]);
        }
    } catch (error) {
        ctx.postMessage({ type: 'ERROR', error: error instanceof Error ? error.message : "Worker Error" });
    }
};
