# EquityDAO Hardhat instructions

in web3 dir compile contracts as follows

- NFT Factory & NFT MultiFactory
- NFT Platform
- NFT Marketplace

npx hardhat compile.




```shell - default comments
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat --network mumbai run scripts/deploy_nft_factory.js
```



Generating ABI

enter the abi folder 
cd abi
../node_modules/solc/solc.js EquityDAOPlatform.sol --abi --bin
