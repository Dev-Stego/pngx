/**
 * PNGXBackup Contract ABI
 * Supports BNB Greenfield integration for decentralized storage
 */
export const PNGX_BACKUP_ABI = [
    // ============ Events ============
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "name": "user", "type": "address" },
            { "indexed": true, "name": "index", "type": "uint256" },
            { "indexed": false, "name": "noteHash", "type": "bytes32" },
            { "indexed": false, "name": "greenfieldObjectId", "type": "string" },
            { "indexed": false, "name": "timestamp", "type": "uint256" }
        ],
        "name": "BackupCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "name": "user", "type": "address" },
            { "indexed": true, "name": "index", "type": "uint256" },
            { "indexed": false, "name": "timestamp", "type": "uint256" }
        ],
        "name": "BackupDeleted",
        "type": "event"
    },
    // ============ Constants ============
    {
        "inputs": [],
        "name": "MAX_NOTE_LENGTH",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "MAX_BACKUPS_PER_USER",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "", "type": "address" }],
        "name": "activeBackupCount",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    // ============ Write Functions ============
    {
        "inputs": [
            { "name": "_noteHash", "type": "bytes32" },
            { "name": "_greenfieldObjectId", "type": "string" },
            { "name": "_fileHash", "type": "string" }
        ],
        "name": "addBackup",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "name": "_index", "type": "uint256" }],
        "name": "deleteBackup",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    // ============ Read Functions ============
    {
        "inputs": [
            { "name": "_start", "type": "uint256" },
            { "name": "_limit", "type": "uint256" }
        ],
        "name": "getBackups",
        "outputs": [
            {
                "components": [
                    { "name": "noteHash", "type": "bytes32" },
                    { "name": "greenfieldObjectId", "type": "string" },
                    { "name": "fileHash", "type": "string" },
                    { "name": "timestamp", "type": "uint256" },
                    { "name": "deleted", "type": "bool" }
                ],
                "name": "backups",
                "type": "tuple[]"
            },
            { "name": "total", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getMyActiveBackups",
        "outputs": [
            {
                "components": [
                    { "name": "noteHash", "type": "bytes32" },
                    { "name": "greenfieldObjectId", "type": "string" },
                    { "name": "fileHash", "type": "string" },
                    { "name": "timestamp", "type": "uint256" },
                    { "name": "deleted", "type": "bool" }
                ],
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "_index", "type": "uint256" }],
        "name": "getBackup",
        "outputs": [
            {
                "components": [
                    { "name": "noteHash", "type": "bytes32" },
                    { "name": "greenfieldObjectId", "type": "string" },
                    { "name": "fileHash", "type": "string" },
                    { "name": "timestamp", "type": "uint256" },
                    { "name": "deleted", "type": "bool" }
                ],
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "_user", "type": "address" }],
        "name": "getBackupCount",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "_index", "type": "uint256" },
            { "name": "_noteHash", "type": "bytes32" }
        ],
        "name": "verifyNoteHash",
        "outputs": [{ "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    // ============ Errors ============
    {
        "inputs": [
            { "name": "provided", "type": "uint256" },
            { "name": "max", "type": "uint256" }
        ],
        "name": "NoteTooLong",
        "type": "error"
    },
    {
        "inputs": [{ "name": "max", "type": "uint256" }],
        "name": "MaxBackupsReached",
        "type": "error"
    },
    {
        "inputs": [
            { "name": "index", "type": "uint256" },
            { "name": "length", "type": "uint256" }
        ],
        "name": "InvalidIndex",
        "type": "error"
    },
    {
        "inputs": [{ "name": "index", "type": "uint256" }],
        "name": "BackupAlreadyDeleted",
        "type": "error"
    }
] as const;

// Contract address - set in .env.local after deployment
// Deploy to: BNB Smart Chain (mainnet: 56, testnet: 97)
export const PNGX_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PNGX_CONTRACT_ADDRESS as `0x${string}` || '0x0000000000000000000000000000000000000000';

// BNB Greenfield configuration
export const GREENFIELD_CONFIG = {
    // Testnet
    testnet: {
        chainId: 5600,
        grpcUrl: 'https://gnfd-testnet-fullnode-tendermint-us.bnbchain.org',
        bucketName: 'pngx-backups-testnet',
    },
    // Mainnet
    mainnet: {
        chainId: 1017,
        grpcUrl: 'https://greenfield-chain.bnbchain.org',
        bucketName: 'pngx-backups',
    },
} as const;

// Backup struct type for TypeScript
export interface BackupStruct {
    noteHash: `0x${string}`;
    greenfieldObjectId: string;
    fileHash: string;
    timestamp: bigint;
    deleted: boolean;
}
