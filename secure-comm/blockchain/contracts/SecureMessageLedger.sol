// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SecureMessageLedger {
    struct MessageRecord {
        bytes32 messageHash;
        address senderAddress;
        address receiverAddress;
        uint256 timestamp;
        bytes signature;
        bool exists;
    }

    mapping(bytes32 => MessageRecord) public records;

    function storeMessageHash(
        bytes32 messageId,
        bytes32 messageHash,
        address senderAddress,
        address receiverAddress,
        uint256 timestamp,
        bytes calldata signature
    ) external {
        records[messageId] = MessageRecord(messageHash, senderAddress, receiverAddress, timestamp, signature, true);
    }

    function verifyMessageHash(bytes32 messageId, bytes32 messageHash) external view returns (bool) {
        return records[messageId].exists && records[messageId].messageHash == messageHash;
    }

    function getMessageRecord(bytes32 messageId) external view returns (MessageRecord memory) {
        return records[messageId];
    }
}
