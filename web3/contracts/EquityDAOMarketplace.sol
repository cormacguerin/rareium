// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

interface IEquityDAOPlatform {

    struct PlatformFee {
        address recipientA;
        uint256 feeA;
        address recipientB;
        uint256 feeB;
    }

    function getDefaultFees() external returns (PlatformFee memory);

    function getCustomFees(address _address) external returns (PlatformFee memory);

    function isEquityDAOAdmin() external view returns (bool);

    function isEquityDAONFT(address _nft) external view returns (bool);

    function getPlatformFees(address _nft, uint256 _tokenId, address _seller) external returns (PlatformFee memory);

    function getRoyaltyFee(address _nft) external returns (uint256);

    function getRoyaltyRecipient(address _nft) external returns (address);

}

struct Listing {
    address nft;
    uint256 tokenId;
    uint256 amount;
    address owner;
    uint256 price;
    uint256 chainId;
    address payableToken;
    bool sold;
}

struct Offer {
    bool accepted;
    uint256 tokenId;
    uint256 amount;
    uint256 offerPrice;
    address payable offerer;
    address nft;
    address payableToken;
}

struct Transaction {
    bool transferFrom;
    uint256 tokenId;
    uint256 amount;
    uint256 price;
    address nft;
    address payableToken;
    address seller;
    address buyer;
}

contract EquityDAOMarketplace is Initializable, ReentrancyGuardUpgradeable  {

    event ListedNFT(
        address indexed nft,
        uint256 indexed tokenId,
        uint256 amount,
        address payableToken,
        uint256 price,
        address indexed owner
    );

    event SoldNFT(
        address indexed nft,
        uint256 indexed tokenId,
        uint256 amount,
        address payableToken,
        uint256 price,
        address owner,
        address indexed buyer
    );

    event OfferredNFT(
        address indexed nft,
        uint256 indexed tokenId,
        uint256 amount,
        address payableToken,
        uint256 offerPrice,
        address indexed offerer
    );

    event CanceledOffer(
        address indexed nft,
        uint256 indexed tokenId,
        uint256 amount,
        address payableToken,
        uint256 offerPrice,
        address indexed offerer
    );

    event AcceptedOffer(
        address indexed nft,
        uint256 indexed tokenId,
        uint256 amount,
        address payableToken,
        uint256 offerPrice,
        address offerer,
        address indexed nftOwner
    );

    event CreatedAuction(
        address indexed nft,
        uint256 indexed tokenId,
        uint256 amount,
        address payableToken,
        uint256 price,
        uint256 minBid,
        uint256 startTime,
        uint256 endTime,
        address indexed creator
    );

    event PlacedBid(
        address indexed nft,
        uint256 indexed tokenId,
        uint256 amount,
        address payableToken,
        uint256 bidPrice,
        address indexed bidder
    );

    event AuctionResult(
        address indexed nft,
        uint256 indexed tokenId,
        uint256 amount,
        address creator,
        address indexed winner,
        uint256 price,
        address caller
    );


    // Native eth token
    address nativeToken;
    // token => isPayable
    mapping(address => bool) private payableTokens;
    // nft => tokenId => listing 
    mapping(address => mapping(uint256 => Listing)) private listings;
    // nft => tokenId => offer array
    mapping(address => mapping(uint256 => Offer[])) private offers;


    IEquityDAOPlatform private equityDAOPlatform;
    function initialize(address _equityDAOPlatform) public initializer {
        equityDAOPlatform = IEquityDAOPlatform(_equityDAOPlatform);
        nativeToken = 0x0000000000000000000000000000000000001010;
        payableTokens[nativeToken] = true;
    }

    modifier isAdmin() {
        require(equityDAOPlatform.isEquityDAOAdmin() == true, "access denied");
        _;
    }

    modifier isEquityDAONFT(address _nft) {
        require(equityDAOPlatform.isEquityDAONFT(_nft) == true, "unrecognized NFT collection");
        _;
    }

    modifier isListed(address _nft, uint256 _tokenId) {
        require(
             listings[_nft][_tokenId].owner != address(0) &&  listings[_nft][_tokenId].sold == false,
            "not listed"
        );
        _;
    }

    modifier isPayableToken(address _payableToken) {
        require(
            _payableToken != address(0) && payableTokens[_payableToken],
            "invalid pay token"
        );
        _;
    }

    modifier isOfferred(
        address _nft,
        uint256 _tokenId,
        address _offerer,
        uint256 _index
    ) {
        require(
            offers[_nft][_tokenId][_index].offerPrice > 0 && offers[_nft][_tokenId][_index].offerer != address(0),
            "not on offer"
        );
        _;
    }

    function listNFT(
        address _nft,
        uint256 _tokenId,
        uint256 _amount,
        uint256 _price,
        uint256 _chainId,
        address _payableToken)
        external
        isEquityDAONFT(_nft)
        isPayableToken(_payableToken)
        nonReentrant
    {

        require(_amount > 0, "access denied");

        safeTransferFrom(_nft, msg.sender, address(this), _tokenId, _amount);

        listings[_nft][_tokenId] = Listing({
            nft: _nft,
            tokenId: _tokenId,
            amount: _amount,
            owner: msg.sender,
            price: _price,
            chainId: _chainId,
            payableToken: _payableToken,
            sold: false
        });

        emit ListedNFT(_nft, _tokenId, _amount, _payableToken, _price, msg.sender);

    }

    // delist the nft
    function deListing(address _nft, uint256 _tokenId)
        external
        isListed(_nft, _tokenId)
        nonReentrant
    {

        Listing memory thisNFT = listings[_nft][_tokenId];
        require(thisNFT.owner == msg.sender, "access denied");
        require(thisNFT.sold == false, "nft has already been sold");

        delete listings[_nft][_tokenId];
        safeTransferFrom(_nft, address(this), msg.sender, _tokenId, thisNFT.amount);

    }

    // purchase listing
    function purchaseNFT(
        address _nft,
        uint256 _tokenId,
        address _payableToken,
        uint256 _price)
        external
        payable
        isListed(_nft, _tokenId)
        nonReentrant
    {
        Listing storage thisNFT = listings[_nft][_tokenId];
        require(
            _payableToken != address(0) && _payableToken == thisNFT.payableToken,
            "invalid pay token"
        );
        require(thisNFT.sold == false, "nft has already been sold");
        require(_price >= thisNFT.price, "invalid price");

        if (nativeToken == _payableToken) {

            require(msg.value >= thisNFT.price);

        }
        thisNFT.sold = true; 

        Transaction memory t = Transaction({
            nft: _nft,
            tokenId: _tokenId,
            amount: thisNFT.amount,
            price: _price,
            payableToken: _payableToken,
            seller: thisNFT.owner,
            buyer: msg.sender,
            transferFrom: true
        });
        processTransaction(t);

        emit SoldNFT(
            thisNFT.nft,
            thisNFT.tokenId,
            thisNFT.amount,
            thisNFT.payableToken,
            _price,
            thisNFT.owner,
            msg.sender
        );

    }

    function createOffer(
        address _nft,
        uint256 _tokenId,
        uint256 _amount,
        address _payableToken,
        uint256 _offerPrice)
        external
        payable
        //isListed(_nft, _tokenId)
        isEquityDAONFT(_nft)
        nonReentrant
    {
        require(_offerPrice > 0, "price must be greater than zero.");

        if (nativeToken == _payableToken) {

            require(msg.value >= _offerPrice);

        } else {

            IERC20(_payableToken).transferFrom(
                msg.sender,
                address(this),
                _offerPrice
            );

        }        

        offers[_nft][_tokenId].push(Offer({
            nft: _nft,
            tokenId: _tokenId,
            amount: _amount,
            offerer: payable(msg.sender),
            payableToken: _payableToken,
            offerPrice: _offerPrice,
            accepted: false
        }));

        emit OfferredNFT(
            _nft,
            _tokenId,
            _amount,
            _payableToken,
            _offerPrice,
            msg.sender
        );
        
    }

    function cancelOffer(address _nft, uint256 _tokenId, uint _index)
        external
        payable
        isOfferred(_nft, _tokenId, msg.sender, _index)
        nonReentrant
    {
        Offer memory offer = offers[_nft][_tokenId][_index];
        require(offer.offerer == msg.sender, "not offerer");
        require(offer.accepted == false, "offer already accepted");
        delete offers[_nft][_tokenId][_index];

        if (nativeToken == offer.payableToken) {

            offer.offerer.transfer(offer.offerPrice);

        } else {

            IERC20(offer.payableToken).transfer(offer.offerer, offer.offerPrice);

        }
        
        emit CanceledOffer(
            offer.nft,
            offer.tokenId,
            offer.amount,
            offer.payableToken,
            offer.offerPrice,
            msg.sender
        );

    }

    function acceptOffer(
        address _nft,
        uint256 _tokenId,
        address _offerer,
        uint256 _index
    )
        external
        isOfferred(_nft, _tokenId, _offerer, _index)
        isListed(_nft, _tokenId)
        nonReentrant
    {
        require(
            listings[_nft][_tokenId].owner == msg.sender,
            "not listed owner"
        );
        Offer storage offer = offers[_nft][_tokenId][_index];
        Listing storage list = listings[offer.nft][offer.tokenId];
        require(list.sold == false, "item already sold");
        require(offer.accepted == false, "offer already accepted");

        list.sold = true;
        offer.accepted = true;

        Transaction memory t = Transaction({
            nft: _nft,
            tokenId: _tokenId,
            amount: offer.amount,
            price: offer.offerPrice,
            payableToken: offer.payableToken,
            seller: msg.sender,
            buyer: offer.offerer,
            transferFrom: false
        });
        processTransaction(t);

        emit AcceptedOffer(
            offer.nft,
            offer.tokenId,
            offer.amount,
            offer.payableToken,
            offer.offerPrice,
            offer.offerer,
            list.owner
        );

    }

    function processTransaction(Transaction memory t) private {

        uint256 totalAmount = t.price;
        address royaltyRecipient = equityDAOPlatform.getRoyaltyRecipient(t.nft);
        uint256 royaltyFee = equityDAOPlatform.getRoyaltyFee(t.nft);

        if (royaltyFee > 1000) {

            royaltyFee = 1000;

        }

        if (royaltyFee > 0) {

            uint256 royaltyAmount = (t.price * royaltyFee) / 10000;

            if (nativeToken == t.payableToken) {

                payable(royaltyRecipient).transfer(royaltyAmount);

            } else {

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

            }
            totalAmount -= royaltyAmount;

        }

        IEquityDAOPlatform.PlatformFee memory platformFees = equityDAOPlatform.getPlatformFees(t.nft, t.tokenId, t.seller);

        // process platform fees

        uint256 platformFeeA = (t.price * platformFees.feeA) / 10000;
        uint256 platformFeeB = (t.price * platformFees.feeB) / 10000;

        if (nativeToken == t.payableToken) {

            payable(platformFees.recipientA).transfer(platformFeeA);
            totalAmount -= platformFeeA;
            payable(platformFees.recipientB).transfer(platformFeeB);
            totalAmount -= platformFeeB;
            payable(t.seller).transfer(totalAmount);

            safeTransferFrom(t.nft, address(this), t.buyer, t.tokenId, t.amount);

        } else {

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
                // safeTransferFrom(t.nft, t.seller, t.buyer, t.tokenId, t.amount);

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
                safeTransferFrom(t.nft, address(this), t.buyer, t.tokenId, t.amount);

            }

        }

    }

    function safeTransferFrom(address _nft, address _from, address _to, uint256 _tokenId, uint256 _amount) internal {

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

            revert("invalid request");

        }

    }

    function getListedNFT(address _nft, uint256 _tokenId)
        external
        view
        returns (Listing memory)
    {
        return listings[_nft][_tokenId];
    }


    function getOfferredNFT(address _nft, uint256 _tokenId)
        external
        view
        returns (Offer[] memory)
    {
        return offers[_nft][_tokenId];
    }

    function setPayableToken(address _token, bool _enable) external isAdmin {
        require(_token != address(0), "invalid token");
        payableTokens[_token] = _enable;
    }

    function setEquityDAONFTPlatform(address _address) isAdmin public returns (bool) {
        equityDAOPlatform = IEquityDAOPlatform(_address);
        return true;
    }

}

