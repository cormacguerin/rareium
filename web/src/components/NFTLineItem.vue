<template>
  <div class="line-item-card">
    <div
      ref="cardRef"
      class="line-item-container"
      @click="gotoCard"
    >
      <div
        v-if="nft.metadata.value"
        class="line-item-creative-preview"
      >
        <img
          v-if="nft.metadata.value.image && hasCachedImage === true"
          class="line-item-image-creative"
          :src="getCachedMedia(nft.metadata.value.image)"
          @error="handleCachedMediaError"
        >
        <img
          v-else-if="nft.metadata.value.image || hasCachedImage === false"
          class="line-item-image-creative"
          :src="getIPFSMedia(nft.metadata.value.image)"
        >
      </div>
    </div>
    <div
      class="nft-line-info-container"
    >
      <div class="flex-row-space-between">
        <div class="flex-col-grow">
          <div
            v-if="nft.token_id"
            class="nft-line-item-id"
          >
            <div
              class="nft-line-item-id"
            >
              <div>
                #{{ nft.token_id }}
              </div>
              <div
                v-if="nft.metadata.value.name"
                class="line-item-name"
              >
                {{ nft.metadata.value.name }}
              </div>
            </div>
          </div>
          <div
            class="nft-line-item-id"
          >
            <div :class="nftCardSymbolClass">
              / {{ nft.symbol.value }}
            </div>
            <div class="price-small">
              <div
                v-if="listPrice > 0"
                :class="cardPriceClass"
              >
                {{ listPrice }}
              </div>
              <div
                v-else-if="nft.price"
              >
                {{ localize('TEXT_LAST_PRICE') }} {{ weiToEther(nft.price.value) }} {{ paymentSymbol }}
              </div>
            </div>
          </div>
        </div>
        <div class="flex-row-center">
          <div
            class="card-token-chain-container"
          >
            <div
              class="card-token-chain"
            >
              <div
                class="card-token-icon"
                v-html="paymentIcon"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <CModal
      v-if="showWalletModal"
      color="#f9b115"
      title="Please Wait"
      width="small"
      @close="showWalletModal = false"
    >
      <template #header>
        <div> {{ localize('TEXT_WALLET_LOGIN') }} </div>
      </template>
      <template #body>
        <div> {{ localize('APP_USE_WALLET') }} </div>
        <br>
        <a href="www.metamask.io"> Metamask </a>
      </template>
      <template #footer>
        <div class="hidden" />
      </template>
    </CModal>

    <CModal
      v-if="showOfferModal"
      color="#f9b115"
      title="Please Wait"
      @close="showOfferModal = false"
    >
      <template #header>
        <div> {{ localize('TEXT_PLACE_OFFER') }} </div>
      </template>
      <template #body>
        <div v-html="getCardRef().outerHTML" />
        <div class="price-container">
          <div class="pricing-ticker-container">
            <div
              class="card-token-icon-pricing"
              v-html="paymentIcon"
            />
            <div class="price-ticket-symbol">
              {{ paymentSymbol }}
            </div>
          </div>
          <CInput
            class="margin-top"
            :value="offerPrice"
            :title="localize('TEXT_OFFER_PRICE')"
            :placeholder="localize('TEXT_ENTER_PRICE_PLACEHOLDER')"
            @inputValue="offerPrice = $event"
          >
            {{ paymentSymbol }}
          </CInput>
        </div>
        <div class="price-display">
          {{ getPrice(offerPrice) }}
        </div>
        <div
          class="list-button"
          @click="offerNFT"
        >
          {{ localize('TEXT_PLACE_OFFER') }}
          <Spinner
            v-if="isTransaction"
            class="spinner-absolute"
          />
        </div>
      </template>
      <template #footer>
        <div class="hidden" />
      </template>
    </CModal>

    <CModal
      v-if="showListModal"
      color="#f9b115"
      title="Please Wait"
      @close="showListModal = false"
    >
      <template #header>
        <div> {{ localize('TEXT_LIST_FOR_SALE') }} </div>
      </template>
      <template #body>
        <div v-html="getCardRef().outerHTML" />
        <div class="price-container">
          <div class="pricing-ticker-container">
            <div
              class="card-token-icon-pricing"
              v-html="paymentIcon"
            />
            <div class="price-ticket-symbol">
              {{ paymentSymbol }}
            </div>
          </div>
          <CInput
            class="margin-top"
            :value="listPrice"
            :title="localize('TEXT_LIST_PRICE')"
            :placeholder="localize('TEXT_ENTER_PRICE_PLACEHOLDER')"
            @inputValue="listPrice = $event"
          >
            {{ paymentSymbol }}
          </CInput>
        </div>
        <div class="price-display">
          {{ listPrice.value }}
        </div>
        <div
          class="list-button"
          @click="listNFT"
        >
          {{ localize('TEXT_LIST') }}
          <Spinner
            v-if="isTransaction"
            class="spinner-absolute"
          />
        </div>
      </template>
      <template #footer>
        <div class="hidden" />
      </template>
    </CModal>

    <CModal
      v-if="showBoughtModal"
      color="#f9b115"
      title="Please Wait"
      width="medium"
      @close="showBoughtModal = false"
    >
      <template #header>
        <div> Success </div>
      </template>
      <template #body>
        <div>
          <b>サクセス</b>
        </div>
        購入した商品はプロフィールページで確認することができます
      </template>
      <template #footer>
        <div class="hidden" />
      </template>
    </CModal>
  </div>
</template>
<script>

import {iconStore} from "@/stores/icon";
import {emits, inject, onMounted, reactive, eBus, ref, toRefs, watch} from "vue";
import {translationStore} from "@/stores/translation";
import {ERC20ABI, rareiumMarketplaceABI, rareiumNFTABI, rareiumPlatformABI} from "../abi.js";
import Spinner from "./Spinner.vue";
import Axios from "axios";
import FormData from "form-data";

export default {
    "name": "NFTCard",
    "components": {
        Spinner
    },
    "props": {
        "id": String,
        "token_id": String,
        "chain_id": Number,
        "symbol": String,
        "owner": String,
        "price": String,
        "metadata": Object,
        "metadata_url": String,
        "status": Object,
        "address": String,
        "key": String,
        "styling": String
    },
    "emits": [
        "freeze-metadata",
        "reload-token"
    ],
    setup (props, {emit}) {

        const translation = translationStore(),
            eBus = inject("eBus"),
            icon = iconStore(),
            route = inject("route"),
            router = inject("router"),
            serverConfig = inject("serverConfig"),
            showBoughtModal = ref(false),
            showListModal = ref(false),
            showBuyModal = ref(false),
            showWalletModal = ref(false),
            showOfferModal = ref(false),
            hasCachedImage = ref(true),
            cardId = ref(""),
            cardRef = ref(),
            isActive = ref(false),
            web3 = inject("web3"),
            nft = toRefs(props),
            forList = ref(false),
            forDeList = ref(false),
            forBuy = ref(false),
            forOffer = ref(false),
            listPrice = ref(0),
            offerPrice = ref(0),
            listAmount = ref(1),
            payableToken = ref("0x0000000000000000000000000000000000001010"),
            paymentSymbol = ref(""),
            paymentIcon = ref(""),
            isTransaction = ref(false),
            isOwner = ref(0),
            nftCardSymbolClass = ref("line-item-symbol-light"),
            cardPriceClass = ref("card-price-light"),
            creativeImage = ref(),
            creativeVideo = ref(),
            maticPriceUSD = ref(),
            maticPriceJPY = ref(),
            NFTcategory = ref([
                "VTuber",
                "Manga",
                "Anime",
                "Gotochi",
                "Gaming",
                "Idol",
                "Sport",
                "Influencer",
                "Launchpad"
            ]),
            NFTMedia = ref([
                "Art",
                "Music",
                "Film",
                "Event",
                "Key",
                "Game"
            ]),
            videoTypes = reactive([
                "video/mp4",
                "video/mpeg",
                "video/x-msvideo",
                "video/webm"
            ]),
            imageTypes = reactive([
                "image/gif",
                "image/jpeg",
                "image/png",
                "image/svg",
                "image/webp"
            ]),
            gotoCard = function () {

                if (parseInt(nft.token_id.value) >= 0) {

                    router.push({"path": `/collection/${nft.address.value}/${nft.token_id.value}`}).catch((err) => {

                        throw err;

                    });

                }

            },
            setCardId = function () {

                if (parseInt(nft.id.value) >= 0) {

                    cardId.value = `media-${nft.id.value}`;

                } else if (parseInt(nft.token_id.value) >= 0) {

                    cardId.value = `token-${nft.symbol.value}-${nft.token_id.value}`;

                }

            },
            getCardRef = function () {

                return cardRef.value;

            },
            listNFT = async function (r) {

                const addr = await getAccount(),
                    chainId = await web3.value.eth.getChainId(),
                    amc = new web3.value.eth.Contract(
                        rareiumMarketplaceABI,
                        `${serverConfig.VUE_APP_MARKETPLACE_ADDRESS}`
                    ),
                    nftc = new web3.value.eth.Contract(
                        rareiumNFTABI,
                        nft.address.value
                    ),
                    lp = web3.value.utils.toWei(listPrice.value.toString());

                let gasLimit = await nftc.methods.approve(
                    serverConfig.VUE_APP_MARKETPLACE_ADDRESS,
                    nft.token_id.value
                ).estimateGas(
                    {
                        "from": addr
                    },
                    (error, estimatedGas) => {
                    }
                );

                if (nft.chain_id.value != serverConfig.chainId) {

                    eBus.emit(
                        "app-event",
                        {
                            "action": "setNetwork",
                            "data": nft.chain_id.value
                        }
                    );
                    return;

                }

                // make sure that this is a valid contract (prevent spend to non contract)
                const code = await web3.value.eth.getCode(nft.address.value);
                if (code === "0x") {

                    return;

                }

                // TODO - add balance checking code.

                isTransaction.value = true;

                gasLimit = gasLimit <= 50000
                    ? Math.floor(gasLimit * 3)
                    : Math.floor(gasLimit * 1.2);
                let gasPrice = await web3.value.eth.getGasPrice();
                gasPrice = Math.floor(gasPrice * 1.2);

                nftc.methods.approve(
                    serverConfig.VUE_APP_MARKETPLACE_ADDRESS,
                    nft.token_id.value
                ).send({
                    "from": addr,
                    "gasPrice": web3.value.utils.toHex(gasPrice),
                    gasLimit
                }).
                    on(
                        "receipt",
                        async (receipt) => {

                            let gasLimit = await amc.methods.listNFT(
                                nft.address.value,
                                nft.token_id.value,
                                listAmount.value,
                                lp,
                                chainId,
                                payableToken.value
                            ).estimateGas(
                                {
                                    "from": addr
                                },
                                (error, estimatedGas) => {
                                }
                            );

                            gasLimit = gasLimit <= 50000
                                ? Math.floor(gasLimit * 3)
                                : Math.floor(gasLimit * 1.2);
                            let gasPrice = await web3.value.eth.getGasPrice();
                            gasPrice = Math.floor(gasPrice * 1.2);

                            amc.methods.listNFT(
                                nft.address.value,
                                nft.token_id.value,
                                listAmount.value,
                                lp,
                                chainId,
                                payableToken.value
                            ).send({
                                "from": addr,
                                "gasPrice": web3.value.utils.toHex(gasPrice),
                                gasLimit
                            }).
                                then((jsonRpcResult) => {

                                    isTransaction.value = false;

                                    if (jsonRpcResult.events) {

                                        if (jsonRpcResult.events) {

                                            if (jsonRpcResult.events.ListedNFT) {

                                                nft.listing.value = jsonRpcResult.events.ListedNFT.returnValues;
                                                listPrice.value = weiToEther(nft.listing.price);

                                                emit("reload-token");

                                            }

                                        }

                                    }

                                    showListModal.value = false;

                                });

                        }
                    );

            },
            weiToEther = function (v) {

                if (v && web3.value) {

                    if (web3.value.utils) {

                        return web3.value.utils.fromWei(
                            v,
                            "ether"
                        );

                    }


                } else {


                }

            },
            deListNFT = async function (r) {

                const addr = await getAccount(),
                    chainId = await web3.value.eth.getChainId(),
                    amc = new web3.value.eth.Contract(
                        rareiumMarketplaceABI,
                        `${serverConfig.VUE_APP_MARKETPLACE_ADDRESS}`
                    ),
                    nftc = new web3.value.eth.Contract(
                        rareiumNFTABI,
                        nft.address.value
                    ),
                    lp = web3.value.utils.toWei(listPrice.value.toString());

                if (nft.chain_id.value != serverConfig.chainId) {

                    eBus.emit(
                        "app-event",
                        {
                            "action": "setNetwork",
                            "data": nft.chain_id.value
                        }
                    );
                    return;

                }

                // make sure that this is a valid contract (prevent spend to non contract)
                const code = await web3.value.eth.getCode(nft.address.value);
                if (code === "0x") {

                    return;

                }

                // TODO - add balance checking code.

                let gasLimit = await amc.methods.deListing(
                    nft.address.value,
                    nft.token_id.value
                ).estimateGas(
                    {
                        "from": addr
                    },
                    (error, estimatedGas) => {

                        console.log("estimatedGas");
                        console.log(estimatedGas);

                    }
                );

                gasLimit = gasLimit <= 50000
                    ? Math.floor(gasLimit * 3)
                    : Math.floor(gasLimit * 1.2);
                let gasPrice = await web3.value.eth.getGasPrice();
                gasPrice = Math.floor(gasPrice * 1.2);

                amc.methods.deListing(
                    nft.address.value,
                    nft.token_id.value
                ).send({
                    "from": addr,
                    "gasPrice": web3.value.utils.toHex(gasPrice),
                    gasLimit
                }).
                    then((jsonRpcResult) => {

                        console.log("jsonRpcResult");
                        console.log(jsonRpcResult);
                        emit("reload-token");
                        // showListModal.value = false;

                    });

            },
            offerNFT = async function (r) {

                const addr = await getAccount();

                if (!addr) {

                    showWalletModal.value = true;
                    return;

                }

                const chainId = await web3.value.eth.getChainId(),
                    amc = new web3.value.eth.Contract(
                        rareiumMarketplaceABI,
                        `${serverConfig.VUE_APP_MARKETPLACE_ADDRESS}`
                    ),
                    op = web3.value.utils.toWei(offerPrice.value.toString()),
                    ptc = new web3.value.eth.Contract(
                        ERC20ABI,
                        payableToken.value
                    );

                if (nft.chain_id.value != serverConfig.chainId) {

                    eBus.emit(
                        "app-event",
                        {
                            "action": "setNetwork",
                            "data": nft.chain_id.value
                        }
                    );
                    return;

                }

                // make sure that this is a valid contract (prevent spend to non contract)
                const code = await web3.value.eth.getCode(nft.address.value);
                if (code === "0x") {

                    return;

                }

                // TODO - add balance checking code.

                let wei = 0;

                if (payableToken.value != "0x0000000000000000000000000000000000001010") {

                    const receipt = await ptc.methods.approve(
                        serverConfig.VUE_APP_MARKETPLACE_ADDRESS,
                        op
                    ).send({"from": addr});

                } else {

                    wei = op;

                }

                let gasLimit = await amc.methods.createOffer(
                    nft.address.value,
                    nft.token_id.value,
                    1,
                    payableToken.value,
                    op
                ).estimateGas(
                    {
                        "from": addr,
                        "value": wei
                    },
                    (error, estimatedGas) => {

                        console.log("estimatedGas");
                        console.log(estimatedGas);

                    }
                );

                gasLimit = gasLimit <= 50000
                    ? Math.floor(gasLimit * 3)
                    : Math.floor(gasLimit * 1.2);
                let gasPrice = await web3.value.eth.getGasPrice();
                gasPrice = Math.floor(gasPrice * 1.2);

                isTransaction.value = true;

                amc.methods.createOffer(
                    nft.address.value,
                    nft.token_id.value,
                    1,
                    payableToken.value,
                    op
                ).send({
                    "from": addr,
                    "value": wei,
                    "gasPrice": web3.value.utils.toHex(gasPrice),
                    gasLimit
                }).
                    then((jsonRpcResult) => {

                        console.log("listNFT jsonRpcResult");
                        console.log(jsonRpcResult);

                        if (jsonRpcResult.events) {

                            if (jsonRpcResult.events) {

                                if (jsonRpcResult.events.ListedNFT) {

                                    isTransaction.value = false;
                                    nft.listing.value = jsonRpcResult.events.ListedNFT.returnValues;
                                    offerPrice.value = weiToEther(nft.listing.price);

                                    emit("reload-token");

                                }

                            }

                        }

                        showListModal.value = false;

                    });

            },
            buyNFT = async function (r) {

                console.log("BUY BUTTON");

                const addr = await getAccount();

                if (!addr) {

                    showBuyModal.value = true;
                    return;

                }

                const chainId = await web3.value.eth.getChainId(),
                    amc = new web3.value.eth.Contract(
                        rareiumMarketplaceABI,
                        `${serverConfig.VUE_APP_MARKETPLACE_ADDRESS}`
                    ),
                    lp = web3.value.utils.toWei(listPrice.value.toString()),
                    ptc = new web3.value.eth.Contract(
                        ERC20ABI,
                        payableToken.value
                    );

                let wei = 0;

                if (payableToken.value != "0x0000000000000000000000000000000000001010") {

                    const receipt = await ptc.methods.approve(
                        serverConfig.VUE_APP_MARKETPLACE_ADDRESS,
                        lp
                    ).send({"from": addr});

                } else {

                    wei = lp;

                }

                if (nft.chain_id.value != serverConfig.chainId) {

                    eBus.emit(
                        "app-event",
                        {
                            "action": "setNetwork",
                            "data": nft.chain_id.value
                        }
                    );
                    return;

                }

                // make sure that this is a valid contract (prevent spend to non contract)
                const code = await web3.value.eth.getCode(nft.address.value);
                if (code === "0x") {

                    return;

                }

                // TODO - add balance checking code.

                const platform = new web3.value.eth.Contract(
                    rareiumPlatformABI,
                    `${serverConfig.VUE_APP_PLATFORM_ADDRESS}`
                );
                platform.methods.getPlatformFees(
                    nft.address.value,
                    nft.token_id.value,
                    nft.listing.owner
                ).
                    call().
                    then((jsonRpcResult) => {

                        console.log("platformFees");
                        console.log(jsonRpcResult);

                    });
                platform.methods.getRoyaltyRecipient(nft.address.value).
                    call().
                    then((jsonRpcResult) => {

                        console.log("royalatyReccipient");
                        console.log(jsonRpcResult);

                    });
                platform.methods.getRoyaltyFee(nft.address.value).
                    call().
                    then((jsonRpcResult) => {

                        console.log("royalatyFee");
                        console.log(jsonRpcResult);

                    });

                // DEL TO HERE

                let gasLimit = await amc.methods.purchaseNFT(
                    nft.address.value,
                    nft.token_id.value,
                    payableToken.value,
                    lp
                ).estimateGas(
                    {
                        "from": addr,
                        "value": wei
                    },
                    (error, estimatedGas) => {

                        console.log("estimatedGas");
                        console.log(estimatedGas);

                    }
                );

                gasLimit = gasLimit <= 50000
                    ? Math.floor(gasLimit * 3)
                    : Math.floor(gasLimit * 1.2);
                let gasPrice = await web3.value.eth.getGasPrice();
                gasPrice = Math.floor(gasPrice * 1.2);

                amc.methods.purchaseNFT(
                    nft.address.value,
                    nft.token_id.value,
                    payableToken.value,
                    lp
                ).send({
                    "from": addr,
                    "value": wei,
                    "gasPrice": web3.value.utils.toHex(gasPrice),
                    gasLimit
                }).
                    then((jsonRpcResult) => {

                        console.log("listNFT jsonRpcResult");
                        console.log(jsonRpcResult);

                        if (jsonRpcResult.events) {

                            if (jsonRpcResult.events) {

                                if (jsonRpcResult.events.ListedNFT) {

                                    nft.listing.value = jsonRpcResult.events.ListedNFT.returnValues;
                                    listPrice.value = weiToEther(nft.listing.price);

                                    emit("reload-token");

                                }

                            }

                        }

                        showListModal.value = false;

                    });

            },
            getPaymentInfo = async function () {

                await delay(300);

                const chainId = nft.chain_id.value;

                if (chainId === 1 || chainId === 11155111) {

                    paymentSymbol.value = "ETH";
                    paymentIcon.value = icon.get("ETHEREUM_PURPLE_LIGHT");

                }

                if (chainId === 137 || chainId === 80001) {

                    paymentSymbol.value = "MATIC";
                    paymentIcon.value = icon.get("POLYGON_LIGHT");

                }

            },
            getPrice = function (price) {

                const chainId = nft.chain_id.value,

                    priceFeed = serverConfig.priceFeed,
                    maticPriceYEN = priceFeed.maticPriceYEN,
                    maticPriceUSD = priceFeed.maticPriceUSD,
                    ethPriceYEN = priceFeed.ethPriceYEN,
                    ethPriceUSD = priceFeed.ethPriceUSD;

                let priceFormat;

                if (chainId.value === 1 || chainId.value === 11155111) {

                    priceFormat = `${formatYen(ethPriceYEN * price)} / ${formatCent(ethPriceUSD * price)}`;

                }

                if (chainId.value === 137 || chainId.value === 80001) {

                    priceFormat = `${formatYen(maticPriceYEN * price)} / ${formatCent(maticPriceUSD * price)}`;

                }

                return priceFormat;

            },
            updateView = function () {

                const gbd = document.getElementById("ethicaladDesktop"),
                    gbm = document.getElementById("ethicaladMobile");
                if (serverConfig.view === "desktop") {
                } else if (serverConfig.view === "laptop") {
                } else if (serverConfig.view === "tablet") {
                } else {
                }

            },
            getCachedMedia = function (i) {

                if (i) {

                    const cached_img = `${process.env.VUE_APP_SERVER_URI}public/imgcache/${i.replace(
                        "ipfs://",
                        ""
                    )}_s.jpg`;

                    return cached_img;

                }

            },
            handleCachedMediaError = function (e) {

                console.log(e);
                console.log(`error loading ${nft.metadata.image}`);
                hasCachedImage.value = false;

            },
            getIPFSMedia = function (i) {

                if (i) {

                    return i.replace(
                        "ipfs://",
                        "https://w3s.link/ipfs/"
                    );

                }

            },
            formatCent = function (centValue) {

                return Math.round(centValue * 100) / 100;

            },
            formatYen = function (yenValue) {

                let yenDisplay = "",

                    manEn = Math.floor(yenValue / 10000);

                yenValue = yenValue.toFixed(0);

                if (manEn > 0) {

                    yenDisplay = `${manEn}万`;
                    yenValue = yenValue.slice(-4);

                }

                return `${yenDisplay + yenValue}円`;

            },
            getAccount = async function () {

                const acc = await web3.value.eth.getAccounts();

                // ensure the user has a wallet
                if (!acc) {

                    showWalletModal.value = true;
                    return;

                }

                if (acc.length > 0) {

                    return acc[0];

                } else if (window.ethereum) {

                    const accounts = await ethereum.request({"method": "eth_requestAccounts"});
                    return accounts[0];

                }

                console.log("window.location = 'https://metamask.io'");
                return null;

            },
            toKb = function (v) {

                return Math.ceil(v / 1024);

            },
            getTokenURI = async function (address, token_id, owner, callback) {

                const amc = new web3.value.eth.Contract(
                    rareiumNFTABI,
                    address
                );
                amc.methods.tokenURI(token_id).
                    call().
                    then((jsonRpcResult) => {

                        callback(
                            token_id,
                            owner,
                            jsonRpcResult
                        );

                    });

            },
            getToken = function (address, tokenId, callback) {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}getToken`,
                    {

                        "params": {

                            address,
                            tokenId

                        }

                    }
                ).
                    then((response) => {

                        nft.token_id.value = response.data.token_id;
                        nft.chain_id.value = response.data.chain_id;
                        nft.metadata.value = response.data.metadata;
                        nft.address.value = response.data.nft_address;
                        nft.owner.value = response.data.owner;
                        nft.previous_owner.value = response.data.previous_owner;
                        nft.standard.value = response.data.standard;
                        nft.token_uri.value = response.data.token_uri;
                        nft.transaction_hash.value = response.data.transaction_hash;

                        if (response.data.chainId == serverConfig.chainId.value) {

                            getTokenURI(
                                address,
                                response.data.token_id,
                                response.data.owner,
                                (token_id, owner, uri) => {

                                    uri = uri.replace(
                                        "ipfs://",
                                        "https://w3s.link/ipfs/"
                                    );
                                    Axios.get(
                                        uri,
                                        {

                                            "params": {

                                            }

                                        }
                                    ).
                                        then((tokenData) => {

                                            nft.address.value = address;
                                            nft.owner.value = owner;
                                            nft.metadata.value = tokenData.data;
                                            nft.token_id.value = token_id;
                                            callback();

                                        }).
                                        catch((error) => {

                                            throw error;

                                        });

                                }
                            );

                        }

                    });

            },
            updateData = async function (ms) {

                await delay(ms);

                if (nft.token_id.value >= 0) {

                    const amc = new web3.value.eth.Contract(
                        rareiumMarketplaceABI,
                        `${serverConfig.VUE_APP_MARKETPLACE_ADDRESS}`
                    );
                    amc.methods.getListedNFT(
                        nft.address.value,
                        nft.token_id.value
                    ).
                        call().
                        then((jsonRpcResult) => {

                            console.log("amc.methods.getListedNFT");
                            console.log(jsonRpcResult);
                            nft.listing.value = jsonRpcResult;
                            listPrice.value = weiToEther(nft.listing.price);

                        });

                    amc.methods.getOfferredNFT(
                        nft.address.value,
                        nft.token_id.value
                    ).
                        call().
                        then((jsonRpcResult) => {

                            console.log("amc.methods.getOfferredNFT");
                            console.log(jsonRpcResult);
                            nft.offers.value = jsonRpcResult;

                        });

                    const anc = new web3.value.eth.Contract(
                        rareiumNFTABI,
                        nft.address.value
                    );
                    anc.methods.contractURI().
                        call().
                        then((jsonRpcResult) => {

                            if (jsonRpcResult) {

                                const b64meta = JSON.parse(decodeURIComponent(escape(atob(jsonRpcResult.replace(
                                    /^data:\w+\/\w+;base64,/,
                                    ""
                                )))));

                                console.log("b64meta");
                                console.log(b64meta);
                                for (const key in b64meta) {

                                    if (b64meta[key]) {

                                        collection[key] = b64meta[key];

                                    }

                                    displayButtons();

                                }

                            }

                        });

                } else {

                    displayButtons();

                }

            },
            delay = function (ms) {

                if (!ms) {

                    ms = 50;

                }

                return new Promise((resolve) => {

                    setTimeout(
                        () => {

                            resolve("");

                        },
                        ms
                    );

                });

            };

        onMounted(() => {

            // set style
            getPaymentInfo();

            setCardId();

            watch(
                () => route.name,
                () => {

                    updateView();

                }
            );

            watch(
                () => serverConfig.view,
                () => {

                    updateView();

                }
            );

            watch(
                () => nft,
                (first, second) => {

                    console.log("watch nft");
                    console.log(nft);

                }
            );

        });

        return {"localize": translation.localize,
            serverConfig,
            creativeImage,
            creativeVideo,
            hasCachedImage,
            getCachedMedia,
            getIPFSMedia,
            handleCachedMediaError,
            showListModal,
            showBuyModal,
            rareiumNFTABI,
            maticPriceUSD,
            maticPriceJPY,
            paymentSymbol,
            paymentIcon,
            formatCent,
            formatYen,
            getPaymentInfo,
            getPrice,
            isActive,
            isTransaction,
            gotoCard,
            updateData,
            getAccount,
            getCardRef,
            cardId,
            delay,
            setCardId,
            cardRef,
            listNFT,
            deListNFT,
            buyNFT,
            offerNFT,
            listPrice,
            offerPrice,
            listAmount,
            payableToken,
            forList,
            forDeList,
            forBuy,
            forOffer,
            nft,
            nftCardSymbolClass,
            showWalletModal,
            showOfferModal,
            cardPriceClass,
            weiToEther,
            eBus,
            toKb};

    }
};

</script>
<style scoped>

.line-item-card {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 78px;
  margin: 5px;
  padding: 5px;
}
.card-token-icon {
  width: 20px;
  margin: 5px;
}
.card-icon-row {
  display: flex;
  flex-direction: row;
  margin: 5px;
}
.card-token-icon-pricing {
  width: 24px;
  height: 24px;
}
.card-token-chain-container {
  display: flex;
  height: 0px;
  margin-left: 10px;
}
.card-token-chain {
  margin: -15px 10px;
  width: 30px;
  height: 30px;
  border-radius: 50px;
  background-color: white;
  z-index: 1;
}
.line-item-creative-preview {
  width: 64px;
  height: 64px;
}
.line-item-image-creative {
  overflow: none;
  width: 100%;
  cursor: pointer;
  border-radius: 15px;
  aspect-ratio: 1/1;
  object-fit: cover;
  transition: all 500ms ease-in-out;
}
.image-creative:hover {
  transform: scale(1.03);
}
.card-buttons-container {
  display: flex;
  margin-right: 20px;
  margin-bottom: 10px;
}
.card-buy-button {
  color: #ff46a4;
  border-radius: 5px;
  margin-left: 10px;
  font-size: 0.9em;
  padding: 6px;
  font-weight: bold;
  background-color: white;
  cursor: pointer;
}
.card-buy-button:hover {
  color: white;
  background-color: #ff46a4;
}
.card-price-light {
  font-size: .9em;
  font-weight: bold;
  color: #2e2e2e;
  padding: 7px 0px 5px 5px;
}
.card-price-dark {
  font-size: .9em;
  font-weight: bold;
  color: #fff;
  padding: 7px 0px 5px 5px;
}
.list-button {
  display: flex;
  margin: 40px;
  margin-left: auto;
  margin-right: auto;
  align-items: center;
  width: 100px;
  font-family: Comfortaa,sans-serif;
  text-align: left;
  white-space: nowrap;
  color: white;
  height: 50px;
  font-weight: bold;
  padding-left: 20px;
  padding-right: 20px;
  border-radius: 30px;
  border: none;
  justify-content: center;
  box-shadow: 0px 15px 20px 2px rgb(139 106 224 / 33%);
  cursor: pointer;
  background: linear-gradient(338deg,#ff7c88,#ff46a4)
}
.pricing-ticker-container {
  margin: 5px;
  display: flex;
  align-items: center;
  flex-direction: column;
}
.price-container {
  display: flex;
  flex-direction: revert;
  align-items: end;
  justify-content: center;
}
.line-item-symbol-light {
  display: flex;
  margin-right: 10px;
  color: grey;
}
.line-item-symbol-dark {
  display: flex;
  margin-right: 10px;
  justify-content: end;
  color: white;
}
.price-ticker-symbol {
  margin-bottom: 5px;
  margin-right: 20px;
  font-size: 0.8em;
  color: #5d585e;
  font-weight: bold;
}
.price-display {
  font-size: 0.9em;
  color: #5d585e;
}
.card-price-symbol {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.card-button-container {
  display: flex;
}
.price-ticket-symbol {
  font-size: 0.7em;
}
.spinner-absolute {
  position: absolute;
  margin-left: 200px;
}
.nft-line-info-container {
  flex-grow: 1;
  margin-left: 10px;
  margin-right: 10px;
}
.nft-line-item-id {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.flex-row-end {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
}
.price-small {
  white-space: nowrap;
  font-size: 0.8em;
}
.flex-row-space-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.flex-row-center {
  display: flex;
  height: 0;
  margin-left: 10px;
}
.flex-col-grow {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.line-item-name {
  font-size: 0.9em;
  font-weight: bold;
}
</style>
