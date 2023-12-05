// Require('dotenv').config({path:__dirname+'.env'});
//require("dotenv").config();
import dotenv from 'dotenv';
import { rareiumNFTABI, rareiumNFTFactoryABI, rareiumMultiNFTFactoryABI, rareiumPlatformABI, rareiumMarketplaceABI, ERC20ABI } from './backend/abi.js';

import Web3 from "web3";
import postgres from './backend/postgres.js';
import fetch from 'node-fetch';

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

    constructor (ipfs) {
        
        const main = async () => {

            var arg = process.argv[2]

            if (arg) {

                if (arg === 'matic') {
                    this.chainId = "137";
                    this.BACKEND_WEB3_PROVIDER = process.env.BACKEND_MATIC_PROVIDER
                    this.VUE_APP_PLATFORM_ADDRESS = process.env.VUE_APP_MATIC_PLATFORM_ADDRESS
                    this.VUE_APP_MARKETPLACE_ADDRESS = process.env.VUE_APP_MATIC_MARKETPLACE_ADDRESS
                    this.VUE_APP_NFT_FACTORY_ADDRESS = process.env.VUE_APP_MATIC_NFT_FACTORY_ADDRESS
                } else if (arg == 'eth') {
                    this.chainId = "1";
                    this.BACKEND_WEB3_PROVIDER = process.env.BACKEND_ETH_PROVIDER
                    this.VUE_APP_PLATFORM_ADDRESS = process.env.VUE_APP_ETH_PLATFORM_ADDRESS
                    this.VUE_APP_MARKETPLACE_ADDRESS = process.env.VUE_APP_ETH_MARKETPLACE_ADDRESS
                    this.VUE_APP_NFT_FACTORY_ADDRESS = process.env.VUE_APP_ETH_NFT_FACTORY_ADDRESS
                } else if (arg == 'matictest') {
                    this.chainId = "80001";
                    this.BACKEND_WEB3_PROVIDER = process.env.BACKEND_MATIC_PROVIDER
                    this.VUE_APP_PLATFORM_ADDRESS = process.env.VUE_APP_MATIC_PLATFORM_ADDRESS
                    this.VUE_APP_MARKETPLACE_ADDRESS = process.env.VUE_APP_MATIC_MARKETPLACE_ADDRESS
                    this.VUE_APP_NFT_FACTORY_ADDRESS = process.env.VUE_APP_MATIC_NFT_FACTORY_ADDRESS
                } else {
                  console.error("Must provide ether argument of 'matic' or 'eth'")
                  process.exit(1)
                }

            } else {
              console.error("Must provide ether argument of 'matic' or 'eth'")
              process.exit(1)
            }

            if (!this.BACKEND_WEB3_PROVIDER) {

                console.error('NO WEBSOCKET_PROVIDER')
                process.exit(1)

            }

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

            const web3 = await new Web3(new Web3.providers.WebsocketProvider(this.BACKEND_WEB3_PROVIDER, options));

            if (!web3.eth) {

                console.error('NO ETH PROVIDER')
                process.exit(1)

            }

            const account = async () => {

                const result = await web3.eth.accounts.privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);
                return result;

            };

            return {web3,
                account};

        };

        main().then((n) => {

            setTimeout(
                () => {

                    this.ERC721addresses = [];
                    this.ERC1155addresses = [];

                    this.web3 = n.web3;
                    this.ipfs = ipfs;

                    this.NFTFactoryEventListener();
                    this.NFTMarketplaceEventListener();
                    this.subscribeToNewCollections();

                    this.backFillTransactions();

                    pg.getCollectionAddresses(
                        this.chainId,

                        (e, r) => {

                            if (e) {
                              console.log(e)
                            }

                            if (r[0]) {

                                if (r[0].array_agg) {

                                    this.ERC721addresses = r[0].array_agg;
                                    this.ERC1155addresses = r[0].array_agg;
                                    console.log('this.ERC721addresses')
                                    console.log(this.ERC721addresses)

                                }

                            }

                            this.subERC721 = this.subscribeToERC721Transfers();
                          //this.subERC1155 =  this.subscribeToERC1155Transfers();

                        }

                    )

                },
                1000
            );

        });

    }

    isAddress (address) {
        return this.web3.utils.isAddress(address);
    }

    toChecksumAddress (address) {
        return this.web3.utils.toChecksumAddress(address);
    }

    verifySignature (message, signature) {
        return this.web3.eth.accounts.recover(this.web3.utils.sha3(message), signature);
    }
  
    async subscribeToNewCollections () {

        // web3.eth.abi.encodeEventSignature('createNFTEvent')
        console.log('subscribeToNewCollections')

        let options = {
            topics: [
              this.web3.utils.sha3('createNFTEvent(address,string,string,address,uint256,address)')
            ]
        };

        let subCreateCollection = this.web3.eth.subscribe('logs', options);

        subCreateCollection.on('error', err => { throw err })
        .on("connected", function(subscriptionId){
            console.log('new collections SubID: ',subscriptionId);
        })
        .on('data', event => {
            console.log(event)
            console.log("event.topics")
            console.log(event.topics)
            console.log('HEY ! subCreateCollection');

            let t = this.web3.eth.abi.decodeLog(
                [{"indexed":true,"internalType":"address","name":"nft","type":"address"},{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"string","name":"symbol","type":"string"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"royaltyFee","type":"uint256"},{"indexed":false,"internalType":"address","name":"royaltyRecipient","type":"address"}],
                event.data,
                [event.topics[1],event.topics[2]]
            )
            console.log('t')
            console.log(t)

            var nft_address, owner_address, royalty_recipient;

            if (t.nft) {

                nft_address = this.web3.utils.toChecksumAddress(t.nft)

            }

            if (t.owner) {

               owner_address = this.web3.utils.toChecksumAddress(t.owner)

            }

            if (t.royaltyRecipient) {

               royalty_recipient = this.web3.utils.toChecksumAddress(t.royaltyRecipient)

            }

            // TODO : update collections database with onchain nfo

            pg.updateCollection(
                nft_address,
                owner_address,
                t.name,
                t.symbol,
                t.royaltyFee,
                royalty_recipient,
                this.chainId,

                (e, r) => {

                   if (e) {

                     console.log(e)

                   } else {

                     console.log(r)

                   }

                }

            );
             
            if (this.ERC721addresses.includes(t.nft) === false) {

                this.ERC721addresses.push(t.nft)
                if (this.subERC721)
                  this.subERC721.unsubscribe(()=>{console.log('UNSUBSCRIBE')});
                this.subERC721 = this.subscribeToERC721Transfers();

            }
            console.log(event)
        });

    }

    subscribeToERC721Transfers () {

        if (this.ERC721addresses.length === 0) {
            return;
        }

        console.log('subscribeToERC721Transfers')
        let subERC721 = this.web3.eth.subscribe('logs', {
            address: this.ERC721addresses,
            topics: [
                this.web3.utils.sha3('Transfer(address,address,uint256)')
            ]
        }, () => {
            console.log('Subscription Callback')
            // this can be a race condition if multiple collections are made at the same time
            // an older subscriber could win. TODO add locking mech and backfill with getPastEvents 
        })
        .on('error', err => { throw err })
        .on("connected", function(subscriptionId){
            console.log('SubID: ',subscriptionId);
        })
        .on('data', event => {

            console.log('HEY ! ERC721')
            let t = this.web3.eth.abi.decodeLog([{"type":"address","name":"from","indexed":"true"},{"type":"address","name":"to","indexed":"true"},{"type":"uint256","name":"tokenId","indexed":"true"}],
                event.data,
                [event.topics[1],event.topics[2],event.topics[3]]
            )

            if (this.web3.utils.isAddress(event.address) === true &&
                this.web3.utils.isAddress(t.to) === true &&
                parseInt(t.tokenId) >= 0) {

                // get token uri from web3
                this.getTokenURI (event.address, t.tokenId, t.to, (token_id, owner, token_uri) => {

                    console.log('tranfer token_uri : ' + token_uri)

                    token_uri = token_uri.replace('ipfs://','https://w3s.link/ipfs/')

                    // get(decode) metadata from URI.
                    this.getURI(token_uri, (metadata) => {

                        // Update tokens database
                        pg.updateCollectionToken(
                            event.address,
                            t.tokenId,
                            t.to,
                            t.from,
                            event.transactionHash,
                            event.blockNumber,
                            this.chainId,
                            "ERC721",
                            token_uri,
                            metadata,

                            (e, r) => {

                                if (e) {

                                    console.log(e)

                                }

                            }

                        )

                     })

                })

                // Update token transfers database
                pg.transferTokenEvent(
                    event.address,
                    t.tokenId,
                    t.to,
                    t.from,
                    event.transactionHash,
                    event.blockNumber,
                    this.chainId,
                    "ERC721",

                    (e, r) => {

                        if (e) {

                            console.log(e)

                        }

                    }

                )
            }

        });
        return subERC721;

    }

    subscribeToERC1155Transfers () {

        if (this.ERC1155addresses.length == 0) {
            return;
        }

        let subERC1155 = this.web3.eth.subscribe('logs', {
            address: this.ERC1155addresses,
            topics: [
                this.web3.utils.sha3('TransferSingle(address,address,address,uint256,uint256)')
            ]
        }, () => {
            console.log('Subscription Callback')
            // this can be a race condition if multiple collections are made at the same time
            // an older subscriber could win. TODO add locking mech and backfill with getPastEvents 
        })
        .on('error',err => { throw err })
        .on("connected", function(subscriptionId){
            console.log('SubID: ',subscriptionId);
        })
        .on('data', event => {
            console.log('HEY ! ERC1155')
            let t = this.web3.eth.abi.decodeLog([{"type":"address","name":"operator","indexed":"true"},{"type":"address","name":"from","indexed":"true"},{"type":"address","name":"to","indexed":"true"},{"type": "uint256","name":"id"},{"type":"uint256","name":"value"}],
                event.data,
                [event.topics[1],event.topics[2],event.topics[3]]
            )
            console.log(t)
        });
        return subERC1155;

    }

    // getPastEvents listeners
  
    async NFTFactoryEventListener (options) {

        console.log(options);

        var amc, from_block;

        try {

            amc = new this.web3.eth.Contract(
                    rareiumPlatformABI,
                    this.VUE_APP_PLATFORM_ADDRESS
                ),

                from_block = await this.web3.eth.getBlockNumber();

        } catch (e) {

            // wait 10 seconds for web3 to autoconnect (5 seconds)

            console.log(e)
            setTimeout(() => {

                    this.NFTFactoryEventListener();

                },
                10000
            );
            return;

        }

        amc.getPastEvents(
            "createNFTEvent",
            {
              "fromBlock": from_block - 2000,
              "toBlock": "latest"
            }
        ).then((e) => {

            e.forEach((element) => {

                if (element.returnValues) {

                    console.log("campaign element.returnValues");
                    console.log(element.returnValues);
                    pg.createNFTEvent(
                        this.VUE_APP_NFT_FACTORY_ADDRESS,
                        element.returnValues.nft,
                        element.returnValues.name,
                        element.returnValues.symbol,
                        element.returnValues.owner,
                        element.returnValues.royalty_fee,
                        element.returnValues.royalty_recipient,
                        element.blockNumber
                    );

                }

            });

        }).
            catch((err) => console.log(err));

        setTimeout(() => {

                this.NFTFactoryEventListener();

            },
            3000000
        );

    }

    async NFTMarketplaceEventListener () {

        var amc, from_block;

        try {

            amc = new this.web3.eth.Contract(
                    rareiumMarketplaceABI,
                    this.VUE_APP_MARKETPLACE_ADDRESS
                ),

                from_block = await this.web3.eth.getBlockNumber();

        } catch (e) {

            console.log(e)
            // wait 10 seconds for web3 to autoconnect (5 seconds)

            setTimeout(() => {

                    this.NFTMarketplaceEventListener();

                },
                10000
            );
            return;

        }

        amc.getPastEvents(
            "ListedNFT",
            {
              "fromBlock": from_block - 2000,
              "toBlock": "latest"
            }
        ).then((e) => {

            e.forEach((element) => {

                if (element.returnValues) {

                    console.log("campaign element.returnValues");
                    console.log(element.returnValues);

                    pg.listedNFTEvent(
                        this.VUE_APP_MARKETPLACE_ADDRESS,
                        element.returnValues.nft,
                        element.returnValues.tokenId,
                        element.returnValues.payableToken,
                        element.returnValues.price,
                        element.returnValues.owner,
                        element.blockNumber
                    );

                }

            });

        }).
            catch((err) => console.log(err));

        amc.getPastEvents(
            "SoldNFT",
            {
              "fromBlock": from_block - 2000,
              "toBlock": "latest"
            }
        ).then((e) => {

            e.forEach((element) => {

                if (element.returnValues) {
                    console.log('element')
                    console.log(element)

                    console.log("campaign element.returnValues");
                    console.log(element.returnValues);
                    pg.soldNFTEvent(
                        this.VUE_APP_NFT_FACTORY_ADDRESS,
                        element.returnValues.nft,
                        element.returnValues.tokenId,
                        element.returnValues.payableToken,
                        element.returnValues.price,
                        element.returnValues.owner,
                        element.returnValues.buyer,
                        element.blockNumber
                    );

                }

            });

        }).
            catch((err) => console.log(err));

        amc.getPastEvents(
            "OfferredNFT",
            {
              "fromBlock": from_block - 2000,
              "toBlock": "latest"
            }
        ).then((e) => {

            console.log('OFFER')
            console.log(e)

            e.forEach((element) => {

                if (element.returnValues) {

                    console.log("offeredNFT element.returnValues");
                    console.log(element.returnValues);
                    pg.offerredNFTEvent(
                        this.VUE_APP_NFT_FACTORY_ADDRESS,
                        element.returnValues.nft,
                        element.returnValues.tokenId,
                        element.returnValues.payableToken,
                        element.returnValues.offerPrice,
                        element.returnValues.offerer,
                        element.blockNumber
                    );

                }

            });

        }).
            catch((err) => console.log(err));

        amc.getPastEvents(
            //"CancelledOffer",
            "CanceledOffer",
            {
              "fromBlock": from_block - 2000,
              "toBlock": "latest"
            }
        ).then((e) => {

            e.forEach((element) => {

                if (element.returnValues) {

                    console.log("canceled offer element.returnValues");
                    console.log(element.returnValues);
                    pg.canceledOfferEvent(
                        this.VUE_APP_NFT_FACTORY_ADDRESS,
                        element.returnValues.nft,
                        element.returnValues.tokenId,
                        element.returnValues.payableToken,
                        element.returnValues.offerPrice,
                        element.returnValues.offerer,
                        element.blockNumber
                    );

                }

            });

        }).
            catch((err) => console.log(err));

        amc.getPastEvents(
            "AcceptedOffer",
            {
              "fromBlock": from_block - 2000,
              "toBlock": "latest"
            }
        ).then((e) => {

            e.forEach((element) => {

                if (element.returnValues) {

                    console.log("campaign element.returnValues");
                    console.log(element.returnValues);
                    pg.acceptedOfferEvent(
                        this.VUE_APP_NFT_FACTORY_ADDRESS,
                        element.returnValues.nft,
                        element.returnValues.tokenId,
                        element.returnValues.payableToken,
                        element.returnValues.offerPrice,
                        element.returnValues.offerer,
                        element.returnValues.nftOwner,
                        element.blockNumber
                    );

                }

            });

        }).
            catch((err) => console.log(err));

        amc.getPastEvents(
            "CreatedAuction",
            {
              "fromBlock": from_block - 2000,
              "toBlock": "latest"
            }
        ).then((e) => {

            e.forEach((element) => {

                if (element.returnValues) {

                    console.log("campaign element.returnValues");
                    console.log(element.returnValues);
                    pg.createdAuctionEvent(
                        this.VUE_APP_NFT_FACTORY_ADDRESS,
                        element.returnValues.nft,
                        element.returnValues.tokenId,
                        element.returnValues.payableToken,
                        element.returnValues.price,
                        element.returnValues.minBid,
                        element.returnValues.startTime,
                        element.returnValues.endTime,
                        element.returnValues.creator,
                        element.blockNumber
                    );

                }

            });

        }).
            catch((err) => console.log(err));

        amc.getPastEvents(
            "PlacedBid",
            {
              "fromBlock": from_block - 2000,
              "toBlock": "latest"
            }
        ).then((e) => {

            e.forEach((element) => {

                if (element.returnValues) {

                    console.log("campaign element.returnValues");
                    console.log(element.returnValues);
                    pg.placedBidEvent(
                        this.VUE_APP_NFT_FACTORY_ADDRESS,
                        element.returnValues.nft,
                        element.returnValues.tokenId,
                        element.returnValues.payableToken,
                        element.returnValues.bidPrice,
                        element.returnValues.bidder,
                        element.blockNumber
                    );

                }

            });

        }).
            catch((err) => console.log(err));

        amc.getPastEvents(
            "AuctionResult",
            {
              "fromBlock": from_block - 2000,
              "toBlock": "latest"
            }
        ).then((e) => {

            e.forEach((element) => {

                if (element.returnValues) {

                    console.log("campaign element.returnValues");
                    console.log(element.returnValues);
                    pg.auctionResultEvent(
                        this.VUE_APP_NFT_FACTORY_ADDRESS,
                        element.returnValues.nft,
                        element.returnValues.tokenId,
                        element.returnValues.creator,
                        element.returnValues.winner,
                        element.returnValues.price,
                        element.returnValues.caller,
                        element.blockNumber
                    );

                }

            });

        }).
            catch((err) => console.log(err));

        setTimeout(() => {

                this.NFTMarketplaceEventListener();

            },
            3000000
        );

    }

    async PastERC721TransfersEventListener (address) {

        console.log("PastERC721TransfersEventListener " + address);

        var amc, from_block;

        try {

            amc = new this.web3.eth.Contract(
                    // This was here, why I don't know...
                    // ERC20ABI,
                    rareiumNFTABI,
                    address
                ),

                from_block = await this.web3.eth.getBlockNumber();

        } catch (e) {

            console.log(e)
            return 1

        }

        amc.getPastEvents(
            "Transfer",
            {
              "fromBlock": from_block - 50000,
              "toBlock": "latest"
            }
        ).then(async (e) => {

            let ds = {}

            e.forEach((event) => {

                if (event.raw) {

                    let t = this.web3.eth.abi.decodeLog([{"type":"address","name":"from","indexed":"true"},{"type":"address","name":"to","indexed":"true"},{"type":"uint256","name":"tokenId","indexed":"true"}],
                        event.raw.data,
                        [event.raw.topics[1],event.raw.topics[2],event.raw.topics[3]]
                    )
                    console.log("t.tokenId : " + t.tokenId)

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

            })

            let r = 0;
            for (var i in ds) {
                console.log(i)
                console.log(ds[i])

                r = r+100;
                await this.sleep(r)

                if (this.web3.utils.isAddress(ds[i].address) === true &&
                    this.web3.utils.isAddress(ds[i].to) === true &&
                    parseInt(i) >= 0) {


                    // get token uri from web3
                    this.getTokenURI (ds[i].address, i, ds[i].to, (token_id, owner, token_uri) => {

                        token_uri = token_uri.replace('ipfs://','https://w3s.link/ipfs/')

                        console.log("token_uri : " + token_uri);

                        // get(decode) metadata from URI.
                        this.getURI(token_uri, (metadata) => {

                            console.log('metadata for : ' + token_uri)
                            console.log(metadata)

                            // Update tokens database
                            pg.updateCollectionToken(
                                ds[token_id].address,
                                token_id,
                                ds[token_id].to,
                                ds[token_id].from,
                                ds[token_id].transactionHash,
                                ds[token_id].blockNumber,
                                this.chainId,
                                "ERC721",
                                token_uri,
                                metadata,

                                (e, r) => {

                                    if (e) {

                                        return 1
                                        console.log(e)

                                    } else {

                                        return 0

                                    }

                                }

                            )

                        });

                    });

                 }

             }

         });

    };

    async getTokenURI (address, token_id, owner, callback) {

        var amc = new this.web3.eth.Contract(
                rareiumNFTABI,
                address
            );
        // const amc = new web3.value.eth.Contract(rareiumNFTABI, address);
        amc.methods.tokenURI(token_id)
          .call().then((jsonRpcResult) => {

              callback(token_id, owner, jsonRpcResult)

        })

    }

    async getURI (uri, callback) {
        fetch(uri, {
            method: 'GET',
            headers: {
            }
        })
        .then(res => res.json())
        .then(json => callback(json))
        .catch (err => console.log(err))
    }

    backFillTransactions() {

        pg.getCollectionAddresses(
            this.chainId,

            async (e, r) => {

                if (e) {
                  console.log(e)
                }

                if (r[0]) {

                    if (r[0].array_agg) {

                        for (var idx in r[0].array_agg) {

                            await this.PastERC721TransfersEventListener(r[0].array_agg[idx]);
                            await this.sleep(10000)
                            console.log('DONE')
                  
                        }

                    }

                }

            }

        )
        setTimeout(() => {

                this.backFillTransactions()

            },
            3000000
        );


    }

    sleep(ms) {

        return new Promise(resolve => setTimeout(resolve, ms));

    }

}

new eth();
//export default eth;
