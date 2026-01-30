// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title PNGXBackup
 * @author PNGX Team
 * @notice Stores encrypted security note references on-chain with BNB Greenfield integration.
 * @dev Notes are encrypted client-side. Only a hash/reference is stored on-chain.
 *      Full encrypted data is stored on BNB Greenfield for cost efficiency.
 */
contract PNGXBackup {
    // ============ Constants ============
    uint256 public constant MAX_NOTE_LENGTH = 500;      // Max bytes for on-chain note (hash/reference)
    uint256 public constant MAX_BACKUPS_PER_USER = 100; // Prevent unbounded storage
    
    // ============ Structs ============
    struct Backup {
        bytes32 noteHash;           // Keccak256 hash of the encrypted note (for verification)
        string greenfieldObjectId;  // BNB Greenfield object ID (bucket/object path)
        string fileHash;            // SHA-256 hash of original file (for identification)
        uint256 timestamp;
        bool deleted;
    }

    // ============ State ============
    mapping(address => Backup[]) private userBackups;
    mapping(address => uint256) public activeBackupCount;

    // ============ Events ============
    event BackupCreated(
        address indexed user, 
        uint256 indexed index, 
        bytes32 noteHash,
        string greenfieldObjectId,
        uint256 timestamp
    );
    event BackupDeleted(address indexed user, uint256 indexed index, uint256 timestamp);

    // ============ Errors ============
    error NoteTooLong(uint256 provided, uint256 max);
    error MaxBackupsReached(uint256 max);
    error InvalidIndex(uint256 index, uint256 length);
    error BackupAlreadyDeleted(uint256 index);

    // ============ External Functions ============

    /**
     * @notice Add a new backup reference
     * @param _noteHash Keccak256 hash of the encrypted note (computed client-side)
     * @param _greenfieldObjectId BNB Greenfield object path (e.g., "pngx-backups/user123/note1.enc")
     * @param _fileHash SHA-256 hash of the original file for identification
     */
    function addBackup(
        bytes32 _noteHash,
        string calldata _greenfieldObjectId,
        string calldata _fileHash
    ) external {
        if (bytes(_greenfieldObjectId).length > MAX_NOTE_LENGTH) {
            revert NoteTooLong(bytes(_greenfieldObjectId).length, MAX_NOTE_LENGTH);
        }
        if (activeBackupCount[msg.sender] >= MAX_BACKUPS_PER_USER) {
            revert MaxBackupsReached(MAX_BACKUPS_PER_USER);
        }

        userBackups[msg.sender].push(Backup({
            noteHash: _noteHash,
            greenfieldObjectId: _greenfieldObjectId,
            fileHash: _fileHash,
            timestamp: block.timestamp,
            deleted: false
        }));

        activeBackupCount[msg.sender]++;

        emit BackupCreated(
            msg.sender, 
            userBackups[msg.sender].length - 1, 
            _noteHash,
            _greenfieldObjectId,
            block.timestamp
        );
    }

    /**
     * @notice Soft-delete a backup (marks as deleted, doesn't remove from array)
     * @param _index Index of the backup to delete
     */
    function deleteBackup(uint256 _index) external {
        if (_index >= userBackups[msg.sender].length) {
            revert InvalidIndex(_index, userBackups[msg.sender].length);
        }
        if (userBackups[msg.sender][_index].deleted) {
            revert BackupAlreadyDeleted(_index);
        }

        userBackups[msg.sender][_index].deleted = true;
        activeBackupCount[msg.sender]--;

        emit BackupDeleted(msg.sender, _index, block.timestamp);
    }

    /**
     * @notice Get backups with pagination
     * @param _start Starting index
     * @param _limit Maximum number of backups to return
     * @return backups Array of backups (may include deleted ones)
     * @return total Total number of backups (including deleted)
     */
    function getBackups(
        uint256 _start, 
        uint256 _limit
    ) external view returns (Backup[] memory backups, uint256 total) {
        total = userBackups[msg.sender].length;
        
        if (_start >= total) {
            return (new Backup[](0), total);
        }

        uint256 end = _start + _limit;
        if (end > total) {
            end = total;
        }

        uint256 resultLength = end - _start;
        backups = new Backup[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            backups[i] = userBackups[msg.sender][_start + i];
        }

        return (backups, total);
    }

    /**
     * @notice Get all active (non-deleted) backups for the caller
     * @dev Use getBackups() for large lists to avoid gas issues
     */
    function getMyActiveBackups() external view returns (Backup[] memory) {
        uint256 total = userBackups[msg.sender].length;
        uint256 activeCount = activeBackupCount[msg.sender];
        
        Backup[] memory active = new Backup[](activeCount);
        uint256 j = 0;
        
        for (uint256 i = 0; i < total && j < activeCount; i++) {
            if (!userBackups[msg.sender][i].deleted) {
                active[j] = userBackups[msg.sender][i];
                j++;
            }
        }
        
        return active;
    }

    /**
     * @notice Get a single backup by index
     * @param _index Index of the backup
     */
    function getBackup(uint256 _index) external view returns (Backup memory) {
        if (_index >= userBackups[msg.sender].length) {
            revert InvalidIndex(_index, userBackups[msg.sender].length);
        }
        return userBackups[msg.sender][_index];
    }

    /**
     * @notice Get total backup count (including deleted)
     */
    function getBackupCount(address _user) external view returns (uint256) {
        return userBackups[_user].length;
    }

    /**
     * @notice Verify a note hash matches stored hash
     * @param _index Backup index
     * @param _noteHash Hash to verify
     */
    function verifyNoteHash(uint256 _index, bytes32 _noteHash) external view returns (bool) {
        if (_index >= userBackups[msg.sender].length) {
            return false;
        }
        return userBackups[msg.sender][_index].noteHash == _noteHash;
    }
}
