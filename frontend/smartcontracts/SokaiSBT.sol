// SPDX-License-Identifier: MIT
// DEPLOYED ON REMIX
pragma solidity ^0.8.20;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.8.3/contracts/utils/Strings.sol";


/**
 * @title SokaiSBT
 * @dev Soulbound Token (SBT) for Sokai - non-transferable NFT holding dynamic player stats.
 */
contract SokaiSBT is ERC721, Ownable {
    using Strings for uint256;

    struct PlayerStats {
        uint256 score;
        uint256 timeSpent;
        string exercise;
        string date;
        string userId;
        string imageURI;
    }

    mapping(uint256 => PlayerStats) private _playerStats;
    mapping(address => bool) private _hasMinted;

    uint256 private _tokenIdCounter = 1;

    address public admin;

    constructor(address _admin) ERC721("SokaiSBT", "SOK") {
        admin = _admin;
    }

    modifier onlyAdminOrOwner() {
        require(msg.sender == owner() || msg.sender == admin, "Not authorized");
        _;
    }

    /// @notice Mint a SBT for yourself (user mint, pays gas)
    function mintSokaiNFT(
        uint256 score,
        uint256 timeSpent,
        string memory exercise,
        string memory date,
        string memory userId,
        string memory imageURI
    ) external {
        require(!_hasMinted[msg.sender], "One SBT per wallet allowed");
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(msg.sender, tokenId);
        _playerStats[tokenId] = PlayerStats(score, timeSpent, exercise, date, userId, imageURI);
        _hasMinted[msg.sender] = true;
        emit Minted(tokenId, msg.sender, score, timeSpent, exercise, date, userId, imageURI);
    }

    /// @notice Mint a SBT for another user (admin or owner pays gas)
    function mintSokaiNFTFor(
        address to,
        uint256 score,
        uint256 timeSpent,
        string memory exercise,
        string memory date,
        string memory userId,
        string memory imageURI
    ) external onlyAdminOrOwner {
        require(!_hasMinted[to], "One SBT per wallet allowed");
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
        _playerStats[tokenId] = PlayerStats(score, timeSpent, exercise, date, userId, imageURI);
        _hasMinted[to] = true;
        emit Minted(tokenId, to, score, timeSpent, exercise, date, userId, imageURI);
    }

    /// @notice Update player stats for an existing SBT (only admin/owner)
    function updateStats(
        uint256 tokenId,
        uint256 score,
        uint256 timeSpent,
        string memory exercise,
        string memory date
    ) external onlyAdminOrOwner {
        require(_exists(tokenId), "Token does not exist");
        PlayerStats storage stats = _playerStats[tokenId];
        stats.score = score;
        stats.timeSpent = timeSpent;
        stats.exercise = exercise;
        stats.date = date;
        emit Updated(tokenId, score, timeSpent, exercise, date);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        PlayerStats memory stats = _playerStats[tokenId];

        string memory json = string(abi.encodePacked(
            '{"name":"Sokai Card - ', stats.userId,
            '","description":"Soulbound NFT - Performance record for Sokai exercise ', stats.exercise,
            '","image":"', stats.imageURI,
            '","attributes":[',
                '{"trait_type":"Score","value":', stats.score.toString(), '},',
                '{"trait_type":"Total Time","value":', stats.timeSpent.toString(), '},',
                '{"trait_type":"Exercise","value":"', stats.exercise, '"},',
                '{"trait_type":"Date","value":"', stats.date, '"},',
                '{"trait_type":"Player","value":"', stats.userId, '"}',
            ']}'
        ));
        return string(abi.encodePacked("data:application/json;utf8,", json));
    }

    // === SBT Logic: Block all transfers and approvals ===
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal override {
        // Allow mint (from==0) and burn (to==0), block transfers
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: non-transferable");
        }
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function approve(address, uint256) public pure override {
        revert("Soulbound: non-transferable");
    }
    function setApprovalForAll(address, bool) public pure override {
        revert("Soulbound: non-transferable");
    }
    function transferFrom(address, address, uint256) public pure override {
        revert("Soulbound: non-transferable");
    }
    function safeTransferFrom(address, address, uint256) public pure override {
        revert("Soulbound: non-transferable");
    }
    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert("Soulbound: non-transferable");
    }

    // === Events ===
    event Minted(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 score,
        uint256 timeSpent,
        string exercise,
        string date,
        string userId,
        string imageURI
    );
    event Updated(
        uint256 indexed tokenId,
        uint256 score,
        uint256 timeSpent,
        string exercise,
        string date
    );

    function setAdmin(address _admin) public onlyOwner {
        admin = _admin;
    }

    function hasMinted(address user) external view returns (bool) {
        return _hasMinted[user];
    }

    function getPlayerStats(uint256 tokenId) external view returns (PlayerStats memory) {
        require(_exists(tokenId), "Token does not exist");
        return _playerStats[tokenId];
    }
}
