// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "./EquityDAONFTFactory.sol";
import "./EquityDAOMultiNFTFactory.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";


interface IEquityDAONFTFactory {

    function create(
      string memory _name,
      string memory _symbol,
      string memory _metadata,
      address _owner,
      uint256 _royaltyFee,
      address _royaltyRecipient,
      uint256 _platformFeeA,
      address _platformRecipientA,
      uint256 _platformFeeB,
      address _platformRecipientB) external returns (address);

}

interface IEquityDAOMultiNFTFactory {

    function create(
      string memory _name,
      string memory _symbol,
      string memory _metadata,
      address _owner,
      uint256 _royaltyFee,
      address _royaltyRecipient,
      uint256 _platformFeeA,
      address _platformRecipientA,
      uint256 _platformFeeB,
      address _platformRecipientB) external returns (address);

}

interface IEquityDAONFT {

    function getRoyaltyFee() external view returns (uint256);

    function getRoyaltyRecipient() external view returns (address);

    function isMinter(uint256 tokenId) external view returns(address);

}

interface IEquityDAOMultiNFT {

    function getRoyaltyFee() external view returns (uint256);

    function getRoyaltyRecipient() external view returns (address);

    function isMinter(uint256 tokenId) external view returns(address);

}

contract EquityDAOPlatform is Initializable {

    mapping(address => bool) private equityDAOAdmins;
    mapping(address => bool) private equityDAOCreators;
    mapping(address => bool) private equityDAONFTs;
    mapping(address => address[]) private nfts;

    // events
    event createNFTEvent (
        address indexed nft,
        string name,
        string symbol,
        address indexed owner,
        uint256 royaltyFee,
        address royaltyRecipient
    );

    struct Transaction {
        address nft;
        uint256 tokenId;
        uint256 amount;
        uint256 price;
        address payableToken;
        address seller;
        address buyer;
        bool transferFrom;
    }

    struct PlatformFee {
        address recipientA;
        uint256 feeA;
        address recipientB;
        uint256 feeB;
    }

    PlatformFee defaultFees;
    PlatformFee lazyMintFees;
    mapping(address => PlatformFee) private customFees;

    IEquityDAONFTFactory private equityDAONFTFactory; 
    IEquityDAOMultiNFTFactory private equityDAOMultiNFTFactory;

    function initialize(address _nftFactory,
                        address _multiNFTFactory,
                        address _platformRecipientA,
                        uint256 _feeA,
                        address _platformRecipientB,
                        uint256 _feeB) public initializer {

        equityDAOAdmins[msg.sender] = true;
        defaultFees = PlatformFee(_platformRecipientA,_feeA,_platformRecipientB,_feeB);
        lazyMintFees = PlatformFee(_platformRecipientA,_feeA*3,_platformRecipientB,_feeB*3);
        equityDAONFTFactory = IEquityDAONFTFactory(_nftFactory);
        equityDAOMultiNFTFactory = IEquityDAOMultiNFTFactory(_multiNFTFactory);

    }

    /*
    constructor(address _nftFactory,
                address _platformRecipientA,
                uint256 _feeA,
                address _platformRecipientB,
                uint256 _feeB,
                address _multiNFTFactory) {
        equityDAOAdmins[msg.sender] = true;
        defaultFees = PlatformFee(_platformRecipientA,_feeA,_platformRecipientB,_feeB);
        lazyMintFees = PlatformFee(_platformRecipientA,_feeA*3,_platformRecipientB,_feeB*3);
        equityDAONFTFactory = IEquityDAONFTFactory(_nftFactory);
        equityDAOMultiNFTFactory = IEquityDAOMultiNFTFactory(_multiNFTFactory);
    }
    */

    function createERC721(
        string memory _name,
        string memory _symbol,
        string memory _metadata,
        address _owner,
        uint256 _royaltyFee,
        address _royaltyRecipient) public isCreator returns (address) {

        PlatformFee memory platformFees = defaultFees;

        uint256 _platformFeeA = platformFees.feeA;
        address _platformRecipientA = platformFees.recipientA;
        uint256 _platformFeeB = platformFees.feeB;
        address _platformRecipientB = platformFees.recipientB;

        address _nft = equityDAONFTFactory.create(
          _name,
          _symbol,
          _metadata,
          _owner,
          _royaltyFee,
          _royaltyRecipient,
          _platformFeeA,
          _platformRecipientA,
          _platformFeeB,
          _platformRecipientB
        );

        // push collection address to creator
        nfts[msg.sender].push(_nft);

        // register equityDAO NFT
        equityDAONFTs[_nft] = true;

        // finally emit the on chain event
        emit createNFTEvent(_nft, _name, _symbol, _owner, _royaltyFee, _royaltyRecipient);

        return _nft;

    }

    function createERC1155(
        string memory _name,
        string memory _symbol,
        string memory _metadata,
        address _owner,
        uint256 _royaltyFee,
        address _royaltyRecipient) public isCreator returns (address) {

        PlatformFee memory platformFees = defaultFees;

        uint256 _platformFeeA = platformFees.feeA;
        address _platformRecipientA = platformFees.recipientA;
        uint256 _platformFeeB = platformFees.feeB;
        address _platformRecipientB = platformFees.recipientB;

        address _nft = equityDAOMultiNFTFactory.create(
          _name,
          _symbol,
          _metadata,
          _owner,
          _royaltyFee,
          _royaltyRecipient,
          _platformFeeA,
          _platformRecipientA,
          _platformFeeB,
          _platformRecipientB
        );

        // push collection address to creator
        nfts[msg.sender].push(_nft);

        // register equityDAO NFT
        equityDAONFTs[_nft] = true;

        // finally emit the on chain event
        emit createNFTEvent(_nft, _name, _symbol, _owner, _royaltyFee, _royaltyRecipient);

        return _nft;
    }

    function getPlatformFees(address _nft, uint256 _tokenId, address _seller) external view returns (PlatformFee memory) {
        IEquityDAONFT nft = IEquityDAONFT(_nft);
        if (nft.isMinter(_tokenId) == _seller) {
            if (customFees[_seller].feeA > 0 ||
                customFees[_seller].feeB > 0) {
                return customFees[_seller];
            } else {
                return defaultFees;
            }
        } else {
            return defaultFees;
        }
    }

    function getRoyaltyFee(address _nft) external view returns (uint256) {
        IEquityDAONFT nft = IEquityDAONFT(_nft);
        return nft.getRoyaltyFee();
    }

    function getRoyaltyRecipient(address _nft) external view returns (address) {
        IEquityDAONFT nft = IEquityDAONFT(_nft);
        return nft.getRoyaltyRecipient();
    }

    function processTransaction(Transaction memory t) isAdmin external {

        IEquityDAONFT nft = IEquityDAONFT(t.nft);

        uint256 totalAmount = t.price;
        address royaltyRecipient = nft.getRoyaltyRecipient();
        uint256 royaltyFee = nft.getRoyaltyFee();

        if (royaltyFee > 0) {

            uint256 royaltyAmount = (t.price * royaltyFee) / 10000;

            // Process royalty
            if (t.transferFrom == true) {

                IERC20(t.payableToken).transferFrom(
                    t.buyer,
                    royaltyRecipient,
                    royaltyAmount
                );

            } else {

                IERC20(t.payableToken).transfer(
                    royaltyRecipient,
                    royaltyAmount
                );

            }
            totalAmount -= royaltyAmount;

        }

        PlatformFee memory platformFees;
        if (nft.isMinter(t.tokenId) == t.seller) {
            if (customFees[t.seller].feeA != 0 && customFees[t.seller].feeB != 0) {
              platformFees = customFees[t.seller];
            } else {
              platformFees = defaultFees;
            }
        } else {
            platformFees = defaultFees;
        }

        // process platform fees

        uint256 platformFeeA = (t.price * platformFees.feeA) / 10000;
        uint256 platformFeeB = (t.price * platformFees.feeB) / 10000;

        if (t.transferFrom == true) {

            IERC20(t.payableToken).transferFrom(
                t.buyer,
                platformFees.recipientA,
                platformFeeA
            );
            totalAmount -= platformFeeA;

            IERC20(t.payableToken).transferFrom(
                t.buyer,
                platformFees.recipientB,
                platformFeeB
            );
            totalAmount -= platformFeeB;

            // pay seller
            IERC20(t.payableToken).transferFrom(
                t.buyer,
                t.seller,
                totalAmount
            );

            // finally transfer NFT
            safeTransferFrom(t.nft, t.seller, t.buyer, t.tokenId, t.amount);

        } else {

            IERC20(t.payableToken).transfer(
                platformFees.recipientA,
                platformFeeA
            );
            totalAmount -= platformFeeA;

            IERC20(t.payableToken).transfer(
                platformFees.recipientB,
                platformFeeB
            );
            totalAmount -= platformFeeB;

            // pay seller
            IERC20(t.payableToken).transfer(
                t.seller,
                totalAmount
            );

            // finally transfer NFT
            //safeTransferFrom(t.nft, address(this), t.buyer, t.tokenId, t.amount);
            safeTransferFrom(t.nft, msg.sender, t.buyer, t.tokenId, t.amount);

        }

    }

    function safeTransferFrom(address _nft, address _from, address _to, uint256 _tokenId, uint256 _amount) isAdmin public {

        if (IERC165(_nft).supportsInterface(type(IERC721).interfaceId)) {

            IERC721 nft = IERC721(_nft);
            require(_amount == 1, "amount must be one");
            require(nft.ownerOf(_tokenId) == _from, "access denied");
            nft.transferFrom(_from, _to, _tokenId);

        } else if (IERC165(_nft).supportsInterface(type(IERC1155).interfaceId)) {

            IERC1155 nft = IERC1155(_nft);
            require(_amount > 0, "amount must be positive");
            require(nft.balanceOf(_from, _tokenId) >= _amount, "access denied");
            nft.safeTransferFrom(_from, _to, _tokenId, _amount, "");

        } else {

            revert();

        }

    }

    /*
     * User function to return their NFT's
     */
    function fetchMyNFTs() external view returns (address[] memory) {
        return nfts[msg.sender];
    }

    /*
     * Admin function to add nfts for user (hard migration)
     */
    function addNFT(address _user, address[] memory _nfts) isAdmin external returns (address[] memory) {
        for (uint i = 0; i < _nfts.length-1; i++) {
            nfts[_user].push(_nfts[i]);
        }
        return nfts[_user];
    }

    /*
     * User function to remove NFT's from their address.
     */
    function removeNFT(address _address) public returns (address[] memory) {
        for (uint i = 0; i < nfts[msg.sender].length-1; i++) {
            if (nfts[msg.sender][i] == _address) {
                delete nfts[msg.sender][i];
            }
        }
        return nfts[msg.sender];
    }

    // Getters/Setters/Removers
    function setDefaultFees(PlatformFee memory _platformFee) isAdmin public returns (bool) {
        require(_platformFee.feeA <= 10000, "can't more than 10 percent");
        require(_platformFee.feeB <= 10000, "can't more than 10 percent");
        require(_platformFee.recipientA != address(0), "can't be null address");
        require(_platformFee.recipientB != address(0), "can't be null address");
        defaultFees = _platformFee;
        return true;
    }

    function setLazyMintFees(PlatformFee memory _platformFee) isAdmin public returns (bool) {
        require(_platformFee.recipientA != address(0), "can't be null address");
        require(_platformFee.recipientB != address(0), "can't be null address");
        defaultFees = _platformFee;
        return true;
    }

    function setCustomFees(address _address, PlatformFee memory _platformFee) isAdmin public returns (bool) {
        require(_platformFee.recipientA != address(0), "can't be null address");
        require(_platformFee.recipientB != address(0), "can't be null address");
        customFees[_address] = _platformFee;
        return true;
    }

    function getDefaultFees() external view returns (PlatformFee memory) {
        return defaultFees;
    }

    function getLazyMintFees() external view returns (PlatformFee memory) {
        return lazyMintFees;
    }

    function getCustomFees(address _address) external view returns (PlatformFee memory) {
        if (customFees[_address].feeA == 0 || customFees[_address].feeB == 0) {
          return defaultFees;
        } else {
          return customFees[_address];
        }
    }

    function addEquityDAOCreator(address _address) isAdmin public returns (bool) {
        equityDAOCreators[_address] = true;
        return true;
    }

    function removeEquityDAOCreator(address _address) isAdmin public returns (bool) {
        delete equityDAOCreators[_address];
        return true;
    }

    function isEquityDAOCreator(address _address) external view returns (bool) {
        return equityDAOCreators[_address];
    }

    function addEquityDAOAdmin(address _address) isAdmin public returns (bool) {
        equityDAOAdmins[_address] = true;
        return true;
    }

    function isEquityDAONFT(address _address) external view returns (bool) {
        return equityDAONFTs[_address];
    }

    function removeEquityDAOAdmin(address _address) isAdmin public returns (bool) {
        require(_address != msg.sender, "can not remove self as admin");
        delete equityDAOAdmins[_address];
        return true;
    }

    function setEquityDAONFTFactory(address _address) isAdmin public returns (bool) {
        equityDAONFTFactory = IEquityDAONFTFactory(_address);
        return true;
    }

    function setEquityDAOMultiNFTFactory(address _address) isAdmin public returns (bool) {
        equityDAOMultiNFTFactory = IEquityDAOMultiNFTFactory(_address);
        return true;
    }

    function getEquityDAONFTFactory() public view returns (address) {
        return address(equityDAONFTFactory);
    }

    function getEquityDAOMultiNFTFactory() public view returns (address) {
        return address(equityDAOMultiNFTFactory);
    }

    function isEquityDAOAdmin(address _address) external view returns (bool) {
        return equityDAOAdmins[_address];
    }

    // Modifiers
    modifier isAdmin() {
        require(equityDAOAdmins[msg.sender] == true, "access denied");
        _;
    }

    modifier isCreator() {
        require(equityDAOCreators[msg.sender] == true, "access denied");
        _;
    }

}

