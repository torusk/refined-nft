// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title MarathonChallengeNFT
 * @dev NFT contract for Marathon Challenge Protocol
 * Issues achievement medals based on marathon challenge results
 */
contract MarathonChallengeNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    // Achievement levels
    enum AchievementLevel { BRONZE, SILVER, GOLD }

    // Challenge data structure
    struct Challenge {
        string eventName;
        uint256 eventDate;
        string goalType;
        uint256 targetTime;
        uint256 actualTime;
        bool isCompleted;
        AchievementLevel achievement;
        string evidenceHash;
    }

    // Mapping from token ID to challenge data
    mapping(uint256 => Challenge) public challenges;
    
    // Mapping from challenge ID (external) to token ID
    mapping(string => uint256) public challengeToToken;
    
    // Events
    event ChallengeNFTMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        string challengeId,
        string eventName,
        AchievementLevel achievement
    );

    constructor() ERC721("Marathon Challenge Protocol", "MCP") {}

    /**
     * @dev Mint NFT for completed challenge
     * @param to Address to mint NFT to
     * @param challengeId External challenge ID
     * @param eventName Name of the marathon event
     * @param eventDate Date of the event (timestamp)
     * @param goalType Type of goal (completion, sub4, etc.)
     * @param targetTime Target time in seconds (0 for completion goal)
     * @param actualTime Actual time in seconds (0 if DNF)
     * @param isCompleted Whether the challenge was completed
     * @param achievement Achievement level earned
     * @param evidenceHash Hash of evidence image
     * @param tokenURI Metadata URI for the NFT
     */
    function mintChallengeNFT(
        address to,
        string memory challengeId,
        string memory eventName,
        uint256 eventDate,
        string memory goalType,
        uint256 targetTime,
        uint256 actualTime,
        bool isCompleted,
        AchievementLevel achievement,
        string memory evidenceHash,
        string memory tokenURI
    ) public onlyOwner {
        require(challengeToToken[challengeId] == 0, "Challenge NFT already minted");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        // Store challenge data
        challenges[tokenId] = Challenge({
            eventName: eventName,
            eventDate: eventDate,
            goalType: goalType,
            targetTime: targetTime,
            actualTime: actualTime,
            isCompleted: isCompleted,
            achievement: achievement,
            evidenceHash: evidenceHash
        });
        
        // Map challenge ID to token ID
        challengeToToken[challengeId] = tokenId;
        
        // Mint NFT
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        emit ChallengeNFTMinted(tokenId, to, challengeId, eventName, achievement);
    }

    /**
     * @dev Get challenge data for a token
     */
    function getChallengeData(uint256 tokenId) public view returns (Challenge memory) {
        require(_exists(tokenId), "Token does not exist");
        return challenges[tokenId];
    }

    /**
     * @dev Get token ID for a challenge ID
     */
    function getTokenIdByChallenge(string memory challengeId) public view returns (uint256) {
        uint256 tokenId = challengeToToken[challengeId];
        require(tokenId != 0, "Challenge NFT not found");
        return tokenId;
    }

    /**
     * @dev Get total number of minted tokens
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev Get all token IDs owned by an address
     */
    function tokensOfOwner(address owner) public view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < _tokenIdCounter.current(); i++) {
            if (_exists(i) && ownerOf(i) == owner) {
                tokenIds[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return tokenIds;
    }

    /**
     * @dev Update token URI (for metadata updates)
     */
    function updateTokenURI(uint256 tokenId, string memory newTokenURI) public onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        _setTokenURI(tokenId, newTokenURI);
    }

    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}