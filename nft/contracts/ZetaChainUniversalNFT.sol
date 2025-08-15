// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {ERC721BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import {ERC721EnumerableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import {ERC721PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721PausableUpgradeable.sol";
import {ERC721URIStorageUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

// Import UniversalNFTCore for universal NFT functionality
import "@zetachain/standard-contracts/contracts/nft/contracts/zetachain/UniversalNFTCore.sol";

struct NFTMintPayload {
    address recipient;
    string metadata_uri;
    bytes32 unique_id;
}

contract ZetaChainUniversalNFT is
    Initializable, // Allows upgradeable contract initialization
    ERC721Upgradeable, // Base ERC721 implementation
    ERC721URIStorageUpgradeable, // Enables metadata URI storage
    ERC721EnumerableUpgradeable, // Provides enumerable token support
    ERC721PausableUpgradeable, // Allows pausing token operations
    OwnableUpgradeable, // Restricts access to owner-only functions
    ERC721BurnableUpgradeable, // Adds burnable functionality
    UUPSUpgradeable, // Supports upgradeable proxy pattern
    UniversalNFTCore // Custom core for additional logic
{
    uint256 private _nextTokenId; // Track next token ID for minting
    // Track minted NFTs by unique ID
    mapping(bytes32 => bool) public mintedIds;
    // Store allowed origin chain (set in initialize)
    uint256 public solanaChainId;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address initialOwner,
        string memory name,
        string memory symbol,
        address payable gatewayAddress, // Include EVM gateway address
        uint256 gas, // Set gas limit for universal NFT calls
        address uniswapRouterAddress,
        uint256 _solanaChainId
    ) public initializer {
        __ERC721_init(name, symbol);
        __ERC721Enumerable_init();
        __ERC721URIStorage_init();
        __ERC721Pausable_init();
        __Ownable_init(initialOwner);
        __ERC721Burnable_init();
        __UUPSUpgradeable_init();
        __UniversalNFTCore_init(gatewayAddress, gas, uniswapRouterAddress); // Initialize universal NFT core
        solanaChainId = _solanaChainId;
    }

    function safeMint(
        address to,
        string memory uri
    ) public onlyOwner whenNotPaused {
        // Generate globally unique token ID, feel free to supply your own logic
        uint256 hash = uint256(
            keccak256(
                abi.encodePacked(address(this), block.number, _nextTokenId++)
            )
        );

        uint256 tokenId = hash & 0x00FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function _update(
        address to,
        uint256 tokenId,
        address auth
    )
        internal
        override(
            ERC721Upgradeable,
            ERC721EnumerableUpgradeable,
            ERC721PausableUpgradeable
        )
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721Upgradeable, ERC721EnumerableUpgradeable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(
        uint256 tokenId
    )
        public
        view
        override(
            ERC721Upgradeable,
            ERC721URIStorageUpgradeable,
            UniversalNFTCore // Include UniversalNFTCore for URI overrides
        )
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(
            ERC721Upgradeable,
            ERC721EnumerableUpgradeable,
            ERC721URIStorageUpgradeable,
            UniversalNFTCore // Include UniversalNFTCore for interface overrides
        )
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function onMessageReceived(
        bytes calldata /* originSenderAddress */,
        uint256 originChainId,
        bytes calldata message
    ) external payable onlyGateway {
        require(originChainId == solanaChainId, "Invalid origin chain");

        // Check if this is an NFT mint message
        require(message.length >= 9, "Invalid message length"); // "NFT_MINT" + minimum data
        
        // Verify magic number
        string memory magic = string(message[:9]);
        require(keccak256(abi.encodePacked(magic)) == keccak256(abi.encodePacked("NFT_MINT")), "Invalid message type");
        
        // Decode the message: recipient (20 bytes) + uri_length (4 bytes) + uri + unique_id (32 bytes)
        require(message.length >= 65, "Message too short"); // 9 + 20 + 4 + 32 minimum
        
        // Extract recipient address (20 bytes after magic)
        address recipient;
        assembly {
            recipient := shr(96, calldataload(add(message.offset, 9)))
        }
        
        // Extract URI length (4 bytes after recipient)
        uint32 uriLength;
        assembly {
            uriLength := shr(224, calldataload(add(message.offset, 29)))
        }
        
        // Extract URI string
        require(message.length >= 33 + uriLength, "URI length mismatch");
        string memory uri = string(message[33:33+uriLength]);
        
        // Extract unique ID (32 bytes after URI)
        require(message.length >= 33 + uriLength + 32, "Message incomplete");
        bytes32 uniqueId;
        assembly {
            uniqueId := calldataload(add(message.offset, add(33, uriLength)))
        }

        require(!mintedIds[uniqueId], "NFT already minted");

        uint256 tokenId = _nextTokenId++;
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, uri);

        mintedIds[uniqueId] = true;
        
        emit NFTMinted(recipient, tokenId, uri, uniqueId);
    }

    receive() external payable {} // Receive ZETA to pay for gas
    
    // Events
    event NFTMinted(address indexed recipient, uint256 indexed tokenId, string metadataUri, bytes32 uniqueId);
}
