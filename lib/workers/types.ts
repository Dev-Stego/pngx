export type EncodePayload = {
    imageData: ImageData;
    secretData: Uint8Array;
    fileType: string;
};

export type DecodePayload = {
    imageData: ImageData;
    expectedNote?: string; // Optional integrity check
};

export type WorkerMessage =
    | { type: 'ENCODE', payload: EncodePayload }
    | { type: 'DECODE', payload: DecodePayload };

export type WorkerResponse =
    | { type: 'PROGRESS', progress: number, stage: string }
    | { type: 'ENCODE_COMPLETE', result: { imageData: ImageData } } // We return ImageData, main thread converts to Blob/URL
    | { type: 'DECODE_COMPLETE', result: { decryptedData: Uint8Array } }
    | { type: 'ERROR', error: string };

export interface StegWorker {
    onmessage: ((this: Worker, ev: MessageEvent<WorkerResponse>) => any) | null;
    postMessage(message: WorkerMessage): void;
    terminate(): void;
}
