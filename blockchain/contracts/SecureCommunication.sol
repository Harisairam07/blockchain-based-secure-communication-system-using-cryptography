// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SecureCommunication {
    struct MessageRecord {
        bytes32 messageHash;
        address sender;
        address receiver;
        uint256 timestamp;
        bytes signature;
    }

    uint256 public messageCount;
    mapping(uint256 => MessageRecord) private records;
    mapping(bytes32 => bool) private hashExists;

    event MessageStored(
        uint256 indexed id,
        bytes32 indexed messageHash,
        address indexed sender,
        address receiver,
        uint256 timestamp
    );

    function storeMessageHash(
        bytes32 messageHash,
        address sender,
        address receiver,
        uint256 timestamp,
        bytes calldata signature
    ) external returns (uint256) {
        require(!hashExists[messageHash], "Message hash already exists");

        messageCount += 1;

        records[messageCount] = MessageRecord({
            messageHash: messageHash,
            sender: sender,
            receiver: receiver,
            timestamp: timestamp,
            signature: signature
        });

        hashExists[messageHash] = true;

        emit MessageStored(messageCount, messageHash, sender, receiver, timestamp);
        return messageCount;
    }

    function verifyMessageHash(bytes32 messageHash) external view returns (bool) {
        return hashExists[messageHash];
    }

    function getMessageRecord(uint256 id) external view returns (MessageRecord memory) {
        require(id > 0 && id <= messageCount, "Record not found");
        return records[id];
    }
}
