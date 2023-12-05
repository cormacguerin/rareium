// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract EquityDAONFT is ERC721, ERC721Burnable, ERC721URIStorage, Ownable {

    using Counters for Counters.Counter;
    
    struct Voucher {
        uint256 id;
        uint256 price;
        string uri;
        bytes signature;
    }

    // Mapping for minters (tokenId, to)
    mapping(uint256 => address) private minters;

    // Mapping for vouchers Minted (Voucher.id, tokenId)
    mapping(uint256 => uint256) public vouchers;

    // Mapping for whitelist 
    mapping(address => bool) private whitelist;

    // Token Counter
    Counters.Counter private _tokenIdCounter;

    // Content metadata (for displaying on marketplaces)
    string contractMetadata;

    // Royalties
    uint256 private royaltyFee;
    address private royaltyRecipient;
    uint256 platformFeeA;
    address platformRecipientA;
    uint256 platformFeeB;
    address platformRecipientB;

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _contractMetadata,
        address _owner,
        uint256 _royaltyFee,
        address _royaltyRecipient,
        uint256 _platformFeeA,
        address _platformRecipientA,
        uint256 _platformFeeB,
        address _platformRecipientB
    ) ERC721(_name, _symbol) {
        require(_royaltyFee <= 10000, "Max royalty is 10 percent");
        require(_royaltyRecipient != address(0), "Royalty recipient null");
        contractMetadata = _contractMetadata;
        royaltyFee = _royaltyFee;
        royaltyRecipient = _royaltyRecipient;
        platformFeeA = _platformFeeA;
        platformRecipientA = _platformRecipientA;
        platformFeeB = _platformFeeB;
        platformRecipientB = _platformRecipientB;
        transferOwnership(_owner);
        whitelist[_owner] = true;
    }

    function setWhitelist(address account, bool value) public onlyOwner {
        require(account != address(0), "To address null");
        whitelist[account] = value;
    }

    function batchMint(address to, string[] memory uri) public onlyOwner {
        require(to != address(0), "To address null");
        require(whitelist[msg.sender] == true, "Not whitelisted");

        for (uint256 i = 0; i < uri.length; i++) {

            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            minters[tokenId] = to;
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, uri[i]);

        }

    }

    function lazyMint(address to, Voucher calldata voucher) public payable returns (uint256) {

        require(to != address(0), "To address null");
        require(_verify(voucher) == true, "Invalid voucher");
        require(msg.value >= voucher.price, "Mint price not met");
        require(vouchers[voucher.id] == 0, "Voucher already used");

        uint256 _platformFeeA = (voucher.price * platformFeeA) / 10000;
        uint256 _platformFeeB = (voucher.price * platformFeeB) / 10000;
        uint256 totalAmount = msg.value;

        payable(platformRecipientA).transfer(
            _platformFeeA
        );
        totalAmount -= _platformFeeA;

        payable(platformRecipientB).transfer(
            _platformFeeB
        );
        totalAmount -= _platformFeeB;

        // Finally pay creator remainder and transfer NFT to minter.
        payable(owner()).transfer(totalAmount);

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        minters[tokenId] = to;
        vouchers[voucher.id] = tokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, voucher.uri);

        return tokenId;

    }

    function _verify(Voucher calldata voucher) internal view returns (bool) {

        bytes32 digest = keccak256(abi.encodePacked(voucher.id, voucher.price, voucher.uri));
        address _sig = ECDSA.recover(ECDSA.toEthSignedMessageHash(digest), voucher.signature);

        if (_sig == owner()) {
            return true;
        } else {
            return false;
        }

    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function contractURI() public view returns (string memory) {
        return contractMetadata;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function getRoyaltyFee() external view returns (uint256) {
        return royaltyFee;
    }

    function getRoyaltyRecipient() external view returns(address) {
        return royaltyRecipient;
    }

    // add ERC2981 compatibility
    function royaltyInfo(uint256 /* _tokenId */, uint256 _salePrice) external view returns (address, uint256) {
        uint256 royaltyAmount = (_salePrice * royaltyFee) / 10000;
        return (royaltyRecipient, royaltyAmount);
    }

    function isMinter(uint256 tokenId) external view returns(address)  {
        return address(minters[tokenId]);
    }

    function updateRoyaltyFee(uint256 _royaltyFee) external onlyOwner {
        require(_royaltyFee <= 10000, "can't more than 10 percent");
        royaltyFee = _royaltyFee;
    }

    function setContractURI(string memory _metadata) external onlyOwner {
        contractMetadata = _metadata;
    }

    function withdraw() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

}

