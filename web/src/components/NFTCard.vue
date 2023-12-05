<template>
  <div
    :class="superCardStyle"
    @mouseover.stop="cardOn"
    @mouseleave.stop="cardOff"
  >
    <div
      :id="cardId"
      :class="superCardStyleBefore"
    >
      <div
        class="card-buttons-container"
      >
        <div
          v-if="forMint"
          class="card-mint-button"
          @click="mintNFT"
        >
          Mint
        </div>
        <div
          v-if="forMint"
          class="card-lazy-mint-button"
          @click="enableLazyMint"
        >
          Enable Lazy Mint
        </div>
        <div
          v-if="forOffer"
          class="card-buy-button"
          @click="showOfferModal = true"
        >
          {{ localize('TEXT_OFFER') }}
        </div>
        <div
          v-if="forBuy"
          class="card-buy-button"
          @click="buyNFT"
        >
          {{ localize('TEXT_BUY') }}
        </div>
        <div
          v-if="forList"
          class="card-buy-button"
          @click="showListModal = true"
        >
          {{ localize('TEXT_SELL') }}
        </div>
        <div
          v-if="forDeList"
          class="card-buy-button"
          @click="deListNFT"
        >
          {{ localize('TEXT_DELIST') }}
        </div>
      </div>
    </div>
    <div
      :class="nftCardStyle"
    >
      <div
        ref="cardRef"
        @click="gotoCard"
      >
        <div
          v-if="nft.metadata.value"
          class="nft-creative-preview"
        >
          <video
            v-if="nft.metadata.value.animation_url"
            class="video-creative"
            loop="true"
            autoplay="autoplay"
            :src="getIPFSMedia(nft.metadata.value.animation_url)"
            muted
          />
          <img
            v-else-if="nft.metadata.value.image && hasCachedImage === true"
            class="image-creative"
            :src="getCachedMedia(nft.metadata.value.image)"
            @error="handleCachedMediaError"
          >
          <img
            v-else-if="nft.metadata.value.image || hasCachedImage === false"
            class="image-creative"
            :src="getIPFSMedia(nft.metadata.value.image)"
          >
        </div>
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
      <div
        class="nft-info-container"
      >
        <div class="flex-col">
          <div
            v-if="nft.metadata.value"
            :class="nftInfoClass"
          >
            <div
              v-if="nft.token_id"
              class="nft-card-id"
            >
              #{{ nft.token_id }}
            </div>
            <div
              v-if="nft.metadata.value.name"
              class="nft-card-name"
            >
              {{ nft.metadata.value.name }}
            </div>
          </div>
          <div
            v-if="nft.price.value > 0"
            :class="nftCardPriceClass"
          >
            {{ localize('TEXT_LAST_PRICE') }} {{ weiToEther(nft.price.value) }} {{ paymentSymbol }}
          </div>
        </div>
        <div :class="nftCardSymbolClass">
          / {{ nft.symbol.value }}
        </div>
        <div class="flex-row">
          <div class="flex-col">
            <div
              v-if="listPrice > 0"
              class="card-icon-row"
            >
              <div
                class="card-token-icon flex-row"
                v-html="paymentIcon"
              />
              <div :class="cardPriceClass">
                {{ listPrice }}
              </div>
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
      v-if="showBalanceModal"
      color="#f9b115"
      title="Please Wait"
      width="medium"
      @close="showBalanceModal = false"
    >
      <template #header>
        <div> {{ localize('TEXT_INSUFFICIENT_BALANCE') }} </div>
      </template>
      <template #body>
        <div>
          <div> {{ localize('APP_INSUFFICIENT_BALANCE_A') }} </div>
          <br>
          <div> {{ localize('APP_INSUFFICIENT_BALANCE_B') }} </div>
          <br>
          <div> {{ localize('APP_INSUFFICIENT_BALANCE_C') }} </div>
          <br>
        </div>
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
          {{ getPrice(listPrice) }}
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

    <!--
      Mint modal is displayed inside vue3-carousel, which will break due to it's bad code.
      Teleport is an inbuilt vue3 component that allows to attach code to another dom.
      Addding to body should avoid the issue
    -->

    <Teleport to="body">
      <CModal
        v-if="showMintModal"
        color="#f9b115"
        title="Please Wait"
        width="medium"
        @close="showMintModal = false"
      >
        <template #header>
          <div>{{ localize('TEXT_FREEZING_METADATA') }}</div>
        </template>
        <template #body>
          <div class="mint-text">
            {{ localize('MINT_FETCHING_METADATA_URL') }} : {{ nft.metadata_url }}
          </div>
          <div class="mint-text">
            {{ localize('TEXT_PLEASE_WAIT') }}
          </div>
          <div class="mint-text">
            {{ localize('MINT_PLEASE_ENSURE_A') }}
          </div>
          <div class="mint-text">
            {{ localize('MINT_PLEASE_ENSURE_B') }}
          </div>
        </template>
        <template #footer>
          <div class="hidden" />
        </template>
      </CModal>
    </Teleport>

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
import {emits, inject, onMounted, reactive, ref, eBus, toRefs, watch} from "vue";
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
        "mint-token",
        "reload-token"
    ],
    setup (props, {emit}) {

        const translation = translationStore(),
            eBus = inject("eBus"),
            icon = iconStore(),
            route = inject("route"),
            router = inject("router"),
            serverConfig = inject("serverConfig"),
            showMintModal = ref(false),
            showBoughtModal = ref(false),
            showListModal = ref(false),
            showBuyModal = ref(false),
            showWalletModal = ref(false),
            showOfferModal = ref(false),
            showBalanceModal = ref(false),
            hasCachedImage = ref(true),
            cardId = ref(""),
            cardRef = ref(),
            isActive = ref(false),
            web3 = inject("web3"),
            nft = toRefs(props),
            nftCardStyle = ref("nft-card-medium"),
            superCardStyle = ref("super-card-medium"),
            superCardStyleBefore = ref("super-card-medium-before"),
            mint = ref(false),
            forMint = ref(false),
            forList = ref(false),
            forDeList = ref(false),
            forBuy = ref(false),
            forOffer = ref(false),
            listPrice = ref(0),
            offerPrice = ref(0),
            paymentSymbol = ref(""),
            paymentIcon = ref(""),
            listAmount = ref(1),
            payableToken = ref("0x0000000000000000000000000000000000001010"),
            lazyMint = ref(false),
            isTransaction = ref(false),
            isOwner = ref(0),
            nftInfoClass = ref("nft-info-light"),
            nftCardPriceClass = ref("nft-card-price-light"),
            nftCardSymbolClass = ref("nft-card-symbol-light"),
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
            cardDebounce = ref(false),
            cardOn = function (e) {

                if (cardDebounce.value === false) {

                    cardDebounce.value = true;
                    updateData();
                    setTimeout(
                        () => {

                            cardDebounce.value = false;

                        },
                        3000
                    );

                }

                setCardId();

                const el = document.getElementById(cardId.value);
                if (!el) {

                    return;

                }
                nftInfoClass.value = "nft-info-dark";
                nftCardSymbolClass.value = "nft-card-symbol-dark";
                nftCardPriceClass.value = "nft-card-price-dark";
                cardPriceClass.value = "card-price-dark";
                el.style.transform = "translateY(0px)";
                isActive.value = true;

            },
            cardOff = function (e) {

                const el = document.getElementById(cardId.value);
                if (!el) {

                    return;

                }
                if (nft.styling.value === "small") {

                    el.style.transform = "translateY(350px)";

                } else if (nft.styling.value === "medium") {

                    el.style.transform = "translateY(395px)";

                } else {

                    el.style.transform = "translateY(420px)";

                }
                nftInfoClass.value = "nft-info-light";
                nftCardSymbolClass.value = "nft-card-symbol-light";
                nftCardPriceClass.value = "nft-card-price-light";
                cardPriceClass.value = "card-price-light";
                isActive.value = false;

            },
            listNFT = async function (r) {

                const addr = await getAccount(),
                    chainId = await web3.value.eth.getChainId(),
                    amc = new web3.value.eth.Contract(
                        rareiumMarketplaceABI,
                        `${serverConfig.VUE_APP_MARKETPLACE_ADDRESS}`
                    ),
                    ptc = new web3.value.eth.Contract(
                        ERC20ABI,
                        payableToken.value
                    ),
                    nftc = new web3.value.eth.Contract(
                        rareiumNFTABI,
                        nft.address.value
                    ),
                    lp = web3.value.utils.toWei(listPrice.value.toString());

                if (nft.chain_id.value != serverConfig.chainId) {

                    console.log("set network nft.chain_id.value");
                    console.log(nft.chain_id.value);

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

                // ensure the user has sufficient balance.
                var balance;
                if (payableToken.value == "0x0000000000000000000000000000000000001010") {

                    balance = await web3.value.eth.getBalance(addr);

                } else {

                    balance = await ptc.methods.balanceOf(addr).call();

                }
                balance = web3.value.utils.toWei(balance);
                console.log("balance");
                console.log(balance);

                if (web3.value.utils.toBN(balance).eq(web3.value.utils.toBN(0))) {

                    showListModal.value = false;
                    showBalanceModal.value = true;
                    return;

                }

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

                                                nft.listing = jsonRpcResult.events.ListedNFT.returnValues;
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

                    console.log("set network nft.chain_id.value");
                    console.log(nft.chain_id.value);

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

                // });

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

                    console.log("set network nft.chain_id.value");
                    console.log(nft.chain_id.value);

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


                // ensure the user has sufficient balance.
                var balance;
                if (payableToken.value == "0x0000000000000000000000000000000000001010") {

                    balance = await web3.value.eth.getBalance(addr);

                } else {

                    balance = await ptc.methods.balanceOf(addr).call();

                }
                balance = web3.value.utils.toWei(balance);
                console.log("balance");
                console.log(balance);

                if (web3.value.utils.toBN(balance).lt(web3.value.utils.toBN(op))) {

                    showOfferModal.value = false;
                    showBalanceModal.value = true;
                    return;

                }

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

                        if (jsonRpcResult.events) {

                            if (jsonRpcResult.events) {

                                if (jsonRpcResult.events.OfferredNFT) {

                                    isTransaction.value = false;

                                    emit("reload-token");

                                }

                            }

                        }

                        showListModal.value = false;

                    });

            },
            buyNFT = async function (r) {

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

                if (nft.chain_id.value != serverConfig.chainId) {

                    console.log("set network nft.chain_id.value");
                    console.log(nft.chain_id.value);

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


                // ensure the user has sufficient balance.
                var balance;
                if (payableToken.value == "0x0000000000000000000000000000000000001010") {

                    balance = await web3.value.eth.getBalance(addr);

                } else {

                    balance = await ptc.methods.balanceOf(addr).call();

                }
                balance = web3.value.utils.toWei(balance);
                console.log("balance");
                console.log(balance);

                if (web3.value.utils.toBN(balance).lt(web3.value.utils.toBN(lp))) {

                    showBuyModal.value = false;
                    showBalanceModal.value = true;
                    return;

                }

                let wei = 0;

                if (payableToken.value != "0x0000000000000000000000000000000000001010") {

                    const receipt = await ptc.methods.approve(
                        serverConfig.VUE_APP_MARKETPLACE_ADDRESS,
                        lp
                    ).send({"from": addr});

                } else {

                    wei = lp;

                }

                // DEL FROM HERE

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

                                    nft.listing = jsonRpcResult.events.ListedNFT.returnValues;
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
            toKb = function (v) {

                return Math.ceil(v / 1024);

            },
            lazyMintNFT = function () {
            },
            safeMintNFT = async function () {

                if (!nft.metadata_url.value) {

                    console.log("metadata url does not exist, please contact support@equitydao.earth");
                    return;

                }

                if (nft.metadata_url.value.substring(
                    0,
                    4
                ) === "ipfs") {

                    showMintModal.value = true;

                    const addr = await getAccount(),

                        amc = new web3.value.eth.Contract(
                            rareiumNFTABI,
                            nft.address.value
                        );

                    let gasLimit = await amc.methods.safeMint(
                        addr,
                        nft.metadata_url.value
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

                    amc.methods.safeMint(
                        addr,
                        nft.metadata_url.value
                    ).send({
                        "from": addr,
                        "gasPrice": web3.value.utils.toHex(gasPrice),
                        gasLimit
                    }).
                        then((jsonRpcResult) => {

                            emit("mint-token");
                            showMintModal.value = false;

                        });

                } else {

                    alert(`metadata url ${nft.metadata_url.value}invalid, please contact equitydao.earth`);

                }

            },
            displayButtons = async function () {

                const addr = await getAccount();

                if (nft.token_id.value === undefined) {

                    forMint.value = true;

                } else {

                    forMint.value = false;
                    forOffer.value = false;
                    forList.value = false;
                    forDeList.value = false;
                    forBuy.value = false;

                    if (addr) {

                        let hasOffer = false;

                        if (nft.offers) {

                            for (let i = 0; i < nft.offers.length; i++) {

                                if (web3.value.utils.toChecksumAddress(nft.offers[i].offerer) === web3.value.utils.toChecksumAddress(addr)) {

                                    hasOffer = true;

                                }

                            }

                        }

                        let hasListing = false;

                        if (nft.listing) {

                            if (nft.listing.nft != "0x0000000000000000000000000000000000000000") {

                                hasListing = true;

                            }

                        }

                        if (hasListing) {

                            if (web3.value.utils.toChecksumAddress(nft.listing.owner) ===
                              web3.value.utils.toChecksumAddress(addr)) {

                                if (nft.listing.sold === false) {

                                    forDeList.value = true;

                                }

                            } else if (nft.listing.sold === false) {

                                if (listPrice.value > 0) {

                                    forBuy.value = true;

                                }

                            }

                        }

                        if (web3.value.utils.toChecksumAddress(nft.owner.value) ===
                          web3.value.utils.toChecksumAddress(addr)) {

                            if (forDeList.value === false) {

                                forList.value = true;

                            }

                        } else if (forDeList.value === false) {

                            forOffer.value = true;

                        }

                    }

                }

            },
            mintNFT = function () {

                if (!nft.metadata_url.value) {

                    showMintModal.value = true;
                    mint.value = true;

                    emit("freeze-metadata");

                } else if (mint.value === true) {

                    safeMintNFT();

                }

            },
            enableLazyMint = function () {

                showMintModal.value = true;
                lazyMint.value = true;

                emit("freeze-metadata");

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

                if (acc.length > 0) {

                    return acc[0];

                } else if (window.ethereum) {

                    const accounts = await ethereum.request({"method": "eth_requestAccounts"});
                    return accounts[0];

                }

                console.log("window.open(https://metamask.io");
                window.open("https://metamask.io");


            },
            renderCreative = function () {

                if (nft.metadata.value.image) {

                    creativeImage.value = nft.metadata.value.image;

                }

                if (nft.metadata.animationUrl) {

                    creativeImage.value = nft.metadata.value.animationUrl;

                }

            },
            updateData = function () {

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

                            nft.listing = jsonRpcResult;

                            if (nft.listing.price > 0) {

                                listPrice.value = weiToEther(nft.listing.price);

                            }
                            displayButtons();

                        });

                    amc.methods.getOfferredNFT(
                        nft.address.value,
                        nft.token_id.value
                    ).
                        call().
                        then((jsonRpcResult) => {

                            nft.offers = jsonRpcResult;
                            displayButtons();

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
            switch (nft.styling.value) {

            case "small":
                nftCardStyle.value = "nft-card-small";
                superCardStyle.value = "super-card-small";
                superCardStyleBefore.value = "super-card-small-before";
                break;
            case "medium":
                nftCardStyle.value = "nft-card-medium";
                superCardStyle.value = "super-card-medium";
                superCardStyleBefore.value = "super-card-medium-before";
                break;
            case "large":
                nftCardStyle.value = "nft-card-large";
                superCardStyle.value = "super-card-large";
                superCardStyleBefore.value = "super-card-large-before";
                break;

            }

            getPaymentInfo();

            setCardId();

            // DEBUG
            renderCreative();
            // updateData();

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
                () => props.metadata_url,
                (first, second) => {

                    if (mint.value === true && nft.metadata_url.value) {

                        safeMintNFT();

                    }

                }
            );

            /*
             *watch(
             *    () => props.token_id,
             *    (first, second) => {
             *
             *        const amc = new web3.value.eth.Contract(rareiumMarketplaceABI, `${serverConfig.VUE_APP_MARKETPLACE_ADDRESS}`);
             *        amc.methods.getListedNFT(nft.address.value, nft.token_id.value)
             *          .call().then((jsonRpcResult) => {
             *              console.log('tokenidprops jsonRpcResult')
             *              console.log(jsonRpcResult)
             *              displayButtons()
             *          }
             *
             *        );
             *
             *    }
             *
             *);
             */

        });

        return {"localize": translation.localize,
            serverConfig,
            creativeImage,
            creativeVideo,
            showMintModal,
            showListModal,
            showBuyModal,
            rareiumNFTABI,
            maticPriceUSD,
            maticPriceJPY,
            formatCent,
            formatYen,
            isActive,
            isTransaction,
            gotoCard,
            updateData,
            cardDebounce,
            cardOn,
            cardOff,
            delay,
            getAccount,
            getCardRef,
            getCachedMedia,
            getIPFSMedia,
            getPaymentInfo,
            getPrice,
            hasCachedImage,
            handleCachedMediaError,
            cardId,
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
            paymentSymbol,
            paymentIcon,
            displayButtons,
            forMint,
            forList,
            forDeList,
            forBuy,
            forOffer,
            mint,
            lazyMint,
            mintNFT,
            nft,
            nftInfoClass,
            nftCardPriceClass,
            nftCardStyle,
            superCardStyle,
            superCardStyleBefore,
            nftCardSymbolClass,
            showWalletModal,
            showOfferModal,
            showBalanceModal,
            cardPriceClass,
            lazyMintNFT,
            enableLazyMint,
            weiToEther,
            toKb,
            eBus,
            renderCreative};

    }
};

</script>
<style scoped>

.nft-card-small {
  display: flex;
  flex-direction: column;
  width: 200px;
  height: 350px;
  justify-content: space-between;
}
.nft-card-medium {
  display: flex;
  flex-direction: column;
  width: 250px;
  height: 400px;
  justify-content: space-between;
}
.nft-card-large {
  display: flex;
  flex-direction: column;
  width: 300px;
  height: 450px;
  justify-content: space-between;
}
.super-card-small {
  display: block;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #e4ddff;
  padding: 0px;
  margin: 10px;
  background-color: #eeebff;
  border-radius: 25px;
  font-size: 0.8em;
  margin-top: 10px;
  background: linear-gradient(0deg, #f0f0f0, whitesmoke);
  transition: all 0.5s;
}
.super-card-small-before {
  display: flex;
  justify-content: end;
  align-items: end;
	border-radius: inherit;
  position: absolute;
  top: 0;
  left: 0;
  content: '';
  width: 100%;
  height: 355px;
	transition: all 0.5s;
  transform: translateY(355px);
	background: linear-gradient(135deg, #efefef 25%, #c481e3 25%);
}
.super-card-medium {
  display: block;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #e4ddff;
  padding: 5px;
  margin: 10px;
  background-color: #eeebff;
  border-radius: 25px;
  font-size: 0.8em;
  margin-top: 10px;
  background: linear-gradient(0deg, #f0f0f0, whitesmoke);
  transition: all 0.5s;
}
.super-card-medium-before {
  display: flex;
  justify-content: end;
  align-items: end;
	border-radius: inherit;
  position: absolute;
  top: 0;
  left: 0;
  content: '';
  width: 100%;
  height: 410px;
	transition: all 0.5s;
  transform: translateY(410px);
	background: linear-gradient(135deg, #efefef 25%, #c481e3 25%);
}
.super-card-large {
  display: block;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #e4ddff;
  padding: 10px;
  margin: 10px;
  border: 1px solid #e2e2e2;
  border-radius: 25px;
  font-size: 0.8em;
  margin-top: 10px;
  background: linear-gradient(0deg, #f0f0f0, whitesmoke);
  transition: all 0.5s;
}
.super-card-large-before {
  display: flex;
  justify-content: end;
  align-items: end;
	border-radius: inherit;
  position: absolute;
  top: 0;
  left: 0;
  content: '';
  width: 100%;
  height: 470px;
	transition: all 0.5s;
  transform: translateY(470px);
	background: linear-gradient(135deg, #efefef 25%, #c481e3 25%);
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
  width: 100%;
  height: 0px;
  justify-content: end;
}
.card-token-chain {
  margin: -35px 10px;
  width: 30px;
  height: 30px;
  border-radius: 50px;
  background-color: white;
  z-index: 1;
}
.nft-creative-preview {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: center;
  width: 100%;
  height: 200px;
  margin-bottom: 20px;
  background: #fff;
  overflow: hidden;
  /*padding: 10px;*/
  /*border: 1px solid #fff;*/
  box-sizing: border-box;
  /*box-shadow: 16px 16px 64px rgb(49 89 211 / 26%);*/
  -webkit-backdrop-filter: blur(9.60224px);
  backdrop-filter: blur(9.60224px);
  border-radius: 20px;
}
.nft-info-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
.nft-info-light {
  justify-content: space-between;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 20px;
  margin-left: 10px;
  margin-right: 10px;
  color: #565656;
  font-weight: 700;
}
.nft-info-dark {
  justify-content: space-between;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 20px;
  margin-left: 10px;
  margin-right: 10px;
  color: #fff;
  font-weight: 700;
}
.image-creative {
  width: 100%;
  overflow: none;
  cursor: pointer;
  border-radius: 15px;
  aspect-ratio: 1/1;
  object-fit: cover;
  background-size: cover;
  background-position: 50%;
  transition: all 500ms ease-in-out;
}
.image-creative:hover {
  transform: scale(1.03);
}
.video-creative {
  max-height: 100%;
  overflow: none;
  cursor: pointer;
  border-radius: 15px;
  aspect-ratio: 1/1;
  object-fit: cover;
  background-size: cover;
  background-position: 50%;
  transition: all 500ms ease-in-out;
}
.video-creative:hover {
  transform: scale(1.03);
}
.card-buy-button {
}
.card-buttons-container {
  display: flex;
  margin-right: 10px;
  margin-bottom: 10px;
}
.card-buy-button {
  color: #ff46a4;
  border-radius: 15px;
  margin-left: 10px;
  font-size: 0.85em;
  padding: 7px;
  font-weight: bold;
  background-color: white;
  cursor: pointer;
}
.card-buy-button:hover {
  color: white;
  background-color: #ff46a4;
}
.card-mint-button {
  color: #27fffb;
	background: linear-gradient(45deg, #28ffcd, #0072ff);
  border-radius: 15px;
  margin-left: 10px;
  font-size: 0.85em;
  color: white;
  padding: 7px;
  font-weight: bold;
  cursor: pointer;
}
.card-lazy-mint-button {
  background: linear-gradient(338deg,#ff00fa,#5a35ff);
  border-radius: 15px;
  margin-left: 10px;
  font-size: 0.85em;
  color: white;
  padding: 7px;
  font-weight: bold;
  cursor: pointer;
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
.nft-card-symbol-light {
  display: flex;
  margin-right: 10px;
  justify-content: end;
  color: grey;
  font-size: 0.8em;
}
.nft-card-symbol-dark {
  display: flex;
  margin-right: 10px;
  justify-content: end;
  color: white;
  font-size: 0.8em;
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
.mint-text {
  margin-top: 5px;
  font-size: 0.9em;
}
.nft-card-price-light {
  line-height: 12px;
  display: flex;
  flex-direction: row;
  justify-content: end;
  font-size: 0.66em;
  font-weight: bold;
  margin: 10px;
  color: #565656;
}
.nft-card-price-dark {
  line-height: 12px;
  display: flex;
  flex-direction: row;
  justify-content: end;
  font-size: 0.66em;
  font-weight: bold;
  margin: 10px;
  color: white;
}
.nft-card-id {
  margin-right: 10px;
}
.nft-card-name {
  text-align: end;
}
</style>
