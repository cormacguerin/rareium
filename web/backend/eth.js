/*
 *  Require('dotenv').config({path:__dirname+'.env'});
 * require("dotenv").config();
 */
import dotenv from "dotenv";
import {ERC20ABI, shinoViNFTABI, shinoViMarketplaceABI, shinoViMultiNFTFactoryABI, shinoViNFTFactoryABI, shinoViPlatformABI} from "./abi.js";

import Web3 from "web3";
import postgres from "./postgres.js";

dotenv.config();

const pg = new postgres({"database": process.env.DATABASE});

/*
 * WARNING : off chain data stored here combines local env variables with onchain data.
 * These variables are in the .env web file.
 * It is imperative that these variables from web and backend are in sync.
 * For example if the frontend contracts changed, but they backend was not restarted (updated)
 * you will end up with out of sync data in the database
 */

class eth {

    constructor () {
        
        const main = async () => {

            this.chainId = {};
            this.BACKEND_WEB3_PROVIDER = {};
            this.VUE_APP_PLATFORM_ADDRESS = {};
            this.VUE_APP_MARKETPLACE_ADDRESS = {};
            this.VUE_APP_NFT_FACTORY_ADDRESS = {};

            this.chainId['matic'] = "137";
            this.BACKEND_WEB3_PROVIDER['matic'] = process.env.BACKEND_MATIC_PROVIDER
            this.VUE_APP_PLATFORM_ADDRESS['matic'] = process.env.VUE_APP_MATIC_PLATFORM_ADDRESS
            this.VUE_APP_MARKETPLACE_ADDRESS['matic'] = process.env.VUE_APP_MATIC_MARKETPLACE_ADDRESS
            this.VUE_APP_NFT_FACTORY_ADDRESS['matic'] = process.env.VUE_APP_MATIC_NFT_FACTORY_ADDRESS

            this.chainId['eth'] = "1";
            this.BACKEND_WEB3_PROVIDER['eth'] = process.env.BACKEND_ETH_PROVIDER
            this.VUE_APP_PLATFORM_ADDRESS['eth'] = process.env.VUE_APP_ETH_PLATFORM_ADDRESS
            this.VUE_APP_MARKETPLACE_ADDRESS['eth'] = process.env.VUE_APP_ETH_MARKETPLACE_ADDRESS
            this.VUE_APP_NFT_FACTORY_ADDRESS['eth'] = process.env.VUE_APP_ETH_NFT_FACTORY_ADDRESS

            // const web3 = await new Web3(new Web3.providers.WebsocketProvider("wss://polygon-mumbai.g.alchemy.com/v2/3mcshFR1fP7dAGneFbWB_5E7aLycDg6P"));
            const options = {

                // Enable auto reconnection
                reconnect: {

                    auto: true,
                    delay: 5000,
                    maxAttempts: 25,
                    onTimeout: false

                }

            };

            const web3eth = await new Web3(new Web3.providers.WebsocketProvider(this.BACKEND_WEB3_PROVIDER['eth'], options));
            const web3matic = await new Web3(new Web3.providers.WebsocketProvider(this.BACKEND_WEB3_PROVIDER['matic'], options));

            return {web3eth, web3matic};

          /*
            const account = async () => {

                const result = await web3.eth.accounts.privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);
                return result;

            };

            return {web3,
                account};
          */

        };

        main().then((n) => {

            setTimeout(
                () => {

                    this.web3 = {};
                    this.web3['eth'] = n.web3eth;
                    this.web3['matic'] = n.web3matic;

                },
                1000
            );

        });

    }

    isAddress (address) {

        return this.web3['eth'].utils.isAddress(address);

    }

    toChecksumAddress (address) {

        return this.web3['eth'].utils.toChecksumAddress(address);

    }

    verifySignature (message, signature) {

        return this.web3['eth'].eth.accounts.recover(
            this.web3['eth'].utils.utf8ToHex(message),
            signature
        );

    }

    async PastERC721TransfersEventListener (chain, address) {

        console.log("PastERC721TransfersEventListener");

        let amc, from_block;

        try {

            amc = new this.web3[chain].eth.Contract(
                ERC20ABI,
                address
            ),

            from_block = await this.web3[chain].eth.getBlockNumber();

        } catch (e) {

            console.log(e);
            return 1;

        }

        amc.getPastEvents(
            "Transfer",
            {
                "fromBlock": from_block - 5000,
                "toBlock": "latest"
            }
        ).then((e) => {

            const ds = {};

            e.forEach((event) => {

                if (event.raw) {

                    const t = this.web3[chain].eth.abi.decodeLog(
                        [
                            {"type": "address",
                                "name": "from",
                                "indexed": "true"},
                            {"type": "address",
                                "name": "to",
                                "indexed": "true"},
                            {"type": "uint256",
                                "name": "tokenId",
                                "indexed": "true"}
                        ],
                        event.raw.data,
                        [
                            event.raw.topics[1],
                            event.raw.topics[2],
                            event.raw.topics[3]
                        ]
                    );

                    if (t.tokenId) {

                        if (!ds[t.tokenId]) {

                            ds[t.tokenId] = {};
                            ds[t.tokenId].address = event.address;
                            ds[t.tokenId].from = t.from;
                            ds[t.tokenId].to = t.to;
                            ds[t.tokenId].transactionHash = event.transactionHash;
                            ds[t.tokenId].blockNumber = event.blockNumber;

                        } else if (ds[t.tokenId].blockNumber < event.blockNumber) {

                            ds[t.tokenId].address = event.address;
                            ds[t.tokenId].from = t.from;
                            ds[t.tokenId].to = t.to;
                            ds[t.tokenId].transactionHash = event.transactionHash;
                            ds[t.tokenId].blockNumber = event.blockNumber;

                        }

                    }

                }

            });

            for (const i in ds) {

                console.log(i);
                console.log(ds[i]);

                /*
                 * add to database
                 * TODO : DELME : GRAB METADATA
                 */
                pg.updateCollectionToken(
                    ds[i].address,
                    i,
                    ds[i].to,
                    ds[i].from,
                    ds[i].transactionHash,
                    ds[i].blockNumber,
                    this.chainId[chain],
                    "ERC721",

                    (e, r) => {

                        if (e) {

                            return 1;
                            console.log(e);

                        }

                        return 0;


                    }

                );

            }

        });

    }

    backFillTransactions () {

        pg.getCollectionAddresses(async (e, r) => {

            if (e) {

                console.log(e);

            }

            if (r[0]) {

                if (r[0].array_agg) {

                    for (const idx in r[0].array_agg) {

                        await this.PastERC721TransfersEventListener(r[0].array_agg[idx]);
                        await this.sleep(10000);
                        console.log("DONE");

                    }

                }

            }

        });
        setTimeout(
            () => {

                this.backFillTransactions();

            },
            3000000
        );

    }

    async getTokenURI (chain, address, token_id, owner, callback) {

        const amc = new this.web3[chain].eth.Contract(
            shinoViNFTABI,
            address
        );
        // const amc = new web3.value.eth.Contract(shinoViNFTABI, address);
        amc.methods.tokenURI(token_id).
            call().
            then((jsonRpcResult) => {

                callback(
                    token_id,
                    owner,
                    jsonRpcResult
                );

            });

    }

    async getUserTokenBalance (chain, contract_address, user_address, token_id, callback) {

        console.log('chain')
        console.log(chain)
        console.log('contract_address')
        console.log(contract_address)
        console.log('user_address')
        console.log(user_address)

        if (!chain) {

          console.log('no chain id')
            callback()
            return

        }

        const amc = new this.web3[chain].eth.Contract(
            shinoViNFTABI,
            contract_address
        );

        amc.methods.balanceOf(user_address).call()
        .then(balance => {

            if (balance > 0) {

                console.log(`User owns ${balance} copies of NFT`);

            } else {

                console.log('User does not own this NFT.');

            }
            callback(balance);

        })
        .catch(error => {

            console.error('Error checking NFT ownership:', error);

        });

    }

    async getTokenOwner (chain, contract_address, token_id, callback) {

        console.log('contract_address')
        console.log(contract_address)
        console.log('user_address')
        console.log(user_address)

        if (!chain) {

            callback()
            return

        }

        const amc = new this.web3[chain].eth.Contract(
            shinoViNFTABI,
            contract_address
        );

        amc.methods.methods.ownerOf(token_id).call()
        .then(owner => {

            callback(owner);

        })
        .catch(error => {

            console.error('Error checking NFT ownership:', error);

        });

    }

    isVoucherMinted (chain, contract_address, voucher_id, callback) {

        if (!chain) {

            callback()
            return

        }

        const amc = new this.web3[chain].eth.Contract(
            shinoViNFTABI,
            contract_address
        );

        amc.methods.vouchers(voucher_id).call()
        .then(tokenId => {

            console.log(callback)
            console.log("amc.methods.vouchers tokenId " + tokenId)
            callback(tokenId);

        })
        .catch(error => {

            console.error('Error checking voucher : ', error);
            callback(error)

        });

    }

    sleep (ms) {

        return new Promise((resolve) => setTimeout(
            resolve,
            ms
        ));

    }

}

// new eth();
export default eth;
