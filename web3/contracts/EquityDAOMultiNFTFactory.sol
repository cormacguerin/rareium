// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "./EquityDAOMultiNFT.sol";

contract EquityDAOMultiNFTFactory {

    address owner;
    address platform;

    //constructor(address _platform) {
    constructor() {
      owner = msg.sender;
    //  platform = _platform;
    }

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
      address _platformRecipientB) external returns (address) {

        // require(platform == msg.sender, "access denied");

        EquityDAOMultiNFT equityDAOMultiNFT = new EquityDAOMultiNFT(
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

        return address(equityDAOMultiNFT);

    }

    /*
    function setPlatform(address _address) external returns (bool) {
      require(owner == msg.sender, "access denied");
      platform = _address;
      return true;
    }
    */

}

