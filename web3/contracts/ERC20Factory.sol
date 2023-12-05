pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract baseToken is ERC20 {

    constructor(
        string memory name,
        string memory symbol,
        uint initialSupply
    ) ERC20(name, symbol) {
        require(initialSupply > 0, "Initial supply has to be greater than 0");
        _mint(msg.sender, initialSupply * 10**18);
    }

}

contract ERC20Factory {

    // owner -> tokens[]
    mapping(address => address[]) public contracts;
    // token -> owner
    mapping(address => address) public owners;
    address owner;

    //constructor(address _platform) {
    constructor() {
      owner = msg.sender;
    }

    function create(
        string calldata name,
        string calldata symbol,
        uint256 initialSupply
    ) external returns (baseToken creditsAddress) {

        baseToken newCredits = new baseToken(
            name,
            symbol,
            initialSupply
        );

        contracts[msg.sender].push(address(newCredits));
        owners[address(newCredits)] = msg.sender;
        return newCredits;

    }

    function sendTokens(
          address to,
          address payable token,
          uint256 amount) external payable returns (uint balanceRemain){
        require(msg.sender == owners[token], "not owner.");
        require(amount <= IERC20(token).balanceOf(address(this)), "insufficient balance.");
        IERC20(token).transfer(to, amount);
        return IERC20(token).balanceOf(address(this));
    }

}
