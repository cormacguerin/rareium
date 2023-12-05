// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "./EquityDAONFT.sol";

contract EquityDAONFTFactory {

    address platform;
    address owner;

    //constructor(address _platform) {
    constructor() {
      owner = msg.sender;
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

      //  require(platform == msg.sender, "access denied");

        EquityDAONFT equityDAONFT = new EquityDAONFT(
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

        return address(equityDAONFT);

    }

    /*
    function setPlatform(address _address) external returns (bool) {
      require(owner == msg.sender, "access denied");
      platform = _address;
      return true;
    }
    */

}

