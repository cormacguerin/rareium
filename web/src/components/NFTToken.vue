<template>
  <div
    class="nft-token"
  >
    <div
      :class="nftTokenClass"
    >
      <div :class="nftContainer">
        <Transition>
          <div
            v-cloak
            v-if="nft.metadata"
            :class="nftCreativePreview"
          >
            <video
              v-if="nft.metadata.animation_url"
              class="video-creative"
              loop="true"
              autoplay="autoplay"
              :src="getImageUrl(nft.metadata.animation_url)"
              muted
              @click="openImage(getImageUrl(nft.metadata.animation_url))"
            />
            <img
              v-else-if="nft.metadata.image"
              class="image-creative"
              :src="getImageUrl(nft.metadata.image)"
              @click="openImage(getImageUrl(nft.metadata.image))"
            >
          </div>
        </Transition>
        <div
          class="token-buttons-container"
        >
          <div
            class="token-button-container"
          >
            <div
              v-if="forOffer"
              class="token-buy-button"
              @click="showOfferModal = true"
            >
              {{ localize('TEXT_OFFER') }}
            </div>
            <div
              v-if="forOfferCancel.includes[true]"
              class="token-buy-button"
              @click="cancelOffer"
            >
              {{ localize('TEXT_RETRACT_OFFER') }}
            </div>
            <div
              v-if="bestOffer.price > 0"
              class="flex-col"
            >
              <div
                class="token-buy-button"
                @click="acceptOffer(bestOffer.offerer,bestOffer.index)"
              >
                {{ localize('TEXT_ACCEPT') }}
              </div>
            </div>
            <div
              v-if="forBuy"
              class="token-buy-button"
              @click="buyNFT"
            >
              {{ localize('TEXT_BUY') }}
            </div>
            <div
              v-if="forList"
              class="token-buy-button"
              @click="showListModal = true"
            >
              {{ localize('TEXT_SELL') }}
            </div>
            <div
              v-if="forDeList"
              class="token-buy-button"
              @click="deListNFT"
            >
              {{ localize('TEXT_DELIST') }}
            </div>
            <div
              class="creator-subscript creator-edit share-icon"
              @click="openShareModal = true"
            />
          </div>
          <div
            v-if="bestOffer.price > 0 && (forList === true || forDeList === true)"
            class="best-offer-tupple token-header-small"
          >
            {{ localize("TEXT_BEST_OFFER") }} {{ weiToEther(bestOffer.price) }} &nbsp <sub class="token-symbol"> {{ paymentSymbol }} </sub>
          </div>
        </div>
        <div
          v-if="nft.offers"
          class="offers-box"
        >
          <div
            class="offers-item"
          >
            <div
              class="offer-tupple"
            >
              {{ localize('TEXT_PRICE') }}
            </div>
            <div
              class="offer-tupple"
            >
              {{ localize('TEXT_OFFERER') }}
            </div>
            <div
              class="offer-tupple"
            >
              {{ localize('TEXT_STATUS') }}
            </div>
            <div
              class="offer-tupple"
            >
              {{ localize('TEXT_ACTION') }}
            </div>
          </div>
          <div
            v-for="(offer,i) in nft.offers"
            class="offers-item"
          >
            <div
              v-if="offer.offerer != '0x0000000000000000000000000000000000000000'"
              class="offer-tupple"
            >
              {{ weiToEther(offer.offerPrice) }} <sub class="token-symbol"> {{ paymentSymbol }}</sub>
            </div>
            <div
              v-if="offer.offerer != '0x0000000000000000000000000000000000000000'"
              class="offer-tupple simple-link"
              :alt="offer.offerer"
              @click="gotoAddress(offer.offerer)"
            >
              {{ offer.offerer }}
            </div>
            <div
              v-if="offer.offerer != '0x0000000000000000000000000000000000000000'"
              class="offer-tupple"
            >
              <div v-if="offer.accepted">
                {{ localize('TEXT_SOLD') }}
              </div>
              <div v-else>
                {{ localize('TEXT_OPEN') }}
              </div>
            </div>
            <div
              v-if="offer.offerer != '0x0000000000000000000000000000000000000000'"
              class="offer-tupple"
            >
              <div
                v-if="forOfferAccept[i]"
                class="offer-accept-button"
                @click="acceptOffer(offer.offerer,i)"
              >
                Accept
              </div>
              <div
                v-else-if="forOfferCancel[i]"
                class="offer-accept-button"
                @click="cancelOffer(i)"
              >
                Cancel
              </div>
              <div
                v-else
              >
                - -
              </div>
            </div>
          </div>
        </div>
        <div
          v-else
          class="offers-box"
        >
          No Offers Yet
        </div>
      </div>
      <div :class="nftContainer">
        <div
          v-cloak
          v-if="nft.metadata"
          class="token-info-container"
        >
          <img
            class="token-collection-banner"
            :src="collectionBanner"
            :alt="collectionDescription"
            @click="gotoCollection(collection.nft_address)"
          >
          <div
            class="token-info-name-id margin-top-200"
          >
            <h1
              v-if="parseInt(nft.token_id) >= 0"
            >
              #{{ nft.token_id }}
            </h1>
            <h1
              v-if="nft.metadata.name != 'Object'"
            >
              {{ nft.metadata.name }}
            </h1>
          </div>
          <div class="token-info-box-item-symbol">
            <div
              class="token-collection-name"
              @click="gotoCollection(collection.nft_address)"
            >
              <b>/ {{ collectionSymbol }}</b>
            </div>
            <div
              class="token-token-chain"
            >
              <div
                class="token-token-icon"
                v-html="paymentIcon"
              />
            </div>
          </div>
          <div class="token-info-box">
            <div
              v-if="listPrice > 0"
              class="token-info-box-item"
            >
              {{ localize('TEXT_PRICE') }} : {{ listPrice }} &nbsp <sub class="token-symbol"> {{ paymentSymbol }}  </sub>
            </div>
            <div
              v-if="nft.metadata.description"
              class="token-info-box-item"
            >
              {{ nft.metadata.description }}
            </div>
            <div
              v-if="nft.owner"
              class="token-info-box-item"
              @click="gotoAddress(nft.owner)"
            >
              <div>
                owner : &nbsp
              </div>
              <div class="simple-link">
                {{ nft.owner }}
              </div>
            </div>
          </div>
          <div
            v-if="nft['metadata']['properties']"
            class="flex-row"
          >
            <div class="read-text">
            </div>
            <div
              v-for="(v,k) in nft['metadata']['properties'].contents"
              class="read-button"
              @click="openEpub(k)"
            >
              {{ localize('TEXT_LANG_CODE_' + k) }} &nbsp;
            </div>
          </div>
          <div class="token-info-name-id">
            <div>
              <h3>{{ localize('TEXT_COLLECTION') }} {{ collection.name }}</h3>
            </div>
          </div>
          <div class="token-info-box">
            <div
              v-if="collection.description"
              class="token-info-box-item"
            >
              {{ collection.description }}
            </div>
          </div>
        </div>
        <div class="token-header">
          <h3>Attributes</h3>
        </div>
        <div
          v-if="nft.metadata"
          class="token-attribute-container"
        >
          <div
            v-for="i in nft.metadata.attributes"
          >
            <div class="token-attribute">
              {{ i.trait_type }}
              <div class="token-value">
                {{ i.value }}
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
      v-if="showListModal"
      color="#f9b115"
      title="Please Wait"
      @close="showListModal = false"
    >
      <template #header>
        <div> {{ localize('TEXT_LIST_FOR_SALE') }} </div>
      </template>
      <template #body>
        <div
          v-if="showListModalAcceptOffer"
          class="accept-offer-list-first"
        >
          {{ localize('ACCEPT_OFFER_LIST_FIRST') }}
        </div>
        <div class="price-container">
          <div class="pricing-ticker-container">
            <div
              class="token-token-icon-pricing"
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
      v-if="showBought"
      color="#f9b115"
      title="Please Wait"
      width="medium"
      @close="showLoadModal = false"
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

    <CModal
      v-if="showNoReadModal"
      color="#f9b115"
      title="Please Wait"
      width="small"
      @close="showNoReadModal = false"
    >
      <template #header>
        <div> {{localize('TEXT_PERMISSION_DENIED')}} </div>
      </template>
      <template #body>
        <div>
          {{localize('EBOOK_NO_READ')}}
        </div>
      </template>
      <template #footer>
        <div class="hidden" />
      </template>
    </CModal>

    <CModal
      v-if="openShareModal"
      color="#995dd4"
      width="large"
      @close="openShareModal = false"
    >
      <template #header>
        <div> Share Post </div>
      </template>
      <template #body>
        <div class="creator-modal-edit">
          <div
            class="sn-icons"
          >
            <div
              class="sn-line-icon"
            >
              <ShareNetwork
                class="sn-block"
                network="line"
                :url="getUrl()"
                :title="collection.name"
                :media="getImageUrl(nft.metadata.image)"
                :description="collection.description"
              />
            </div>

            <div
              class="sn-weibo-icon"
            >
              <ShareNetwork
                class="sn-block"
                network="weibo"
                :url="getUrl()"
                :title="collection.name"
                :media="getImageUrl(nft.metadata.image)"
                :description="collection.description"
              />
            </div>

            <div
              class="sn-facebook-icon"
            >
              <ShareNetwork
                class="sn-block"
                network="facebook"
                :url="getUrl()"
                :title="collection.name"
                :media="getImageUrl(nft.metadata.image)"
                :description="collection.description"
              />
            </div>

            <div
              class="sn-linkedin-icon"
            >
              <ShareNetwork
                class="sn-block"
                network="linkedin"
                :url="getUrl()"
                :title="collection.name"
                :media="getImageUrl(nft.metadata.image)"
                :description="collection.description"
              />
            </div>

            <div
              class="sn-reddit-icon"
            >
              <ShareNetwork
                class="sn-block"
                network="reddit"
                :url="getUrl()"
                :title="collection.name"
                :media="getImageUrl(nft.metadata.image)"
                :description="collection.description"
              />
            </div>

            <div
              class="sn-twitter-icon"
            >
              <ShareNetwork
                class="sn-block"
                network="Twitter"
                :url="getUrl()"
                :title="collection.name"
                :media="getImageUrl(nft.metadata.image)"
                :description="collection.description"
              />
            </div>

            <div
              class="sn-copy-link"
              @click="copyUrl()"
            >
              copy link []
            </div>
          </div>

          <div
            class="close-edit"
            @click="openShareModal = false"
          >
            Close
          </div>
        </div>
      </template>
      <template #footer>
        <div class="hidden" />
      </template>
    </CModal>

    <div
      v-if="nftContainer === 'nft-container-desktop'"
      id="nftTokenBackground"
    />
  </div>
</template>
<script>

import {iconStore} from "@/stores/icon";
import {emits, inject, onMounted, reactive, ref, toRaw, toRefs, watch} from "vue";
import {translationStore} from "@/stores/translation";
import {ERC20ABI, rareiumMarketplaceABI, rareiumNFTABI, rareiumPlatformABI} from "../abi.js";
import Spinner from "./Spinner.vue";
import Axios from "axios";
import FormData from "form-data";

export default {
    "name": "NFTToken",
    "components": {
        Spinner
    },
    "props": {
    },
    setup (props, {emit}) {

        const translation = translationStore(),
            eBus = inject("eBus"),
            icon = iconStore(),
            route = inject("route"),
            router = inject("router"),
            userInfo = inject("userInfo"),
            nftTokenClass = ref("nft-token-desktop"),
            nftTokenBackdround = ref("nft-token-desktop"),
            nftContainer = ref("nft-container-desktop"),
            nftCreativePreview = ref("nft-creative-preview"),
            serverConfig = inject("serverConfig"),
            showLoadModal = ref(false),
            showNoReadModal = ref(false),
            openShareModal = ref(false),
            showListModal = ref(false),
            showListModalAcceptOffer = ref(false),
            showBuyModal = ref(false),
            showWalletModal = ref(false),
            showBalanceModal = ref(false),
            showOfferModal = ref(false),
            tokenRef = ref(),
            isActive = ref(false),
            bibiUrl = ref(),
            epubComponent = ref(),
            isTransaction = ref(false),
            collectionSymbol = ref(""),
            collectionBanner = ref(""),
            collectionImage = ref(""),
            collectionDescription = ref(""),
            web3 = inject("web3"),
            nft = reactive({
                "token_id": String,
                "chain_id": String,
                "chain_uri": String,
                "owner": String,
                "previous_owner": String,
                "standard": String,
                "metadata": Object,
                "address": String,
                "key": String
            }),
            collection = reactive({
                "banner": String,
                "category": String,
                "collaborators": String,
                "description": "",
                "external_link": String,
                "image": String,
                "media": String,
                "name": String,
                "chain_id": String,
                "nft_address": String,
                "owner_address": String,
                "primary_color": String,
                "secondary_color": String,
                "symbol": String
            }),
            forList = ref(false),
            forDeList = ref(false),
            forBuy = ref(false),
            forOffer = ref(true),
            forOfferAccept = ref([]),
            forOfferCancel = ref([]),
            myOffer = ref(),
            bestOffer = reactive({"index": 0,
                "offerer": "",
                "price": 0}),
            listPrice = ref(0),
            offerPrice = ref(0),
            listAmount = ref(1),
            payableToken = ref("0x0000000000000000000000000000000000001010"),
            paymentSymbol = ref(""),
            paymentIcon = ref(""),
            isOwner = ref(0),
            nftInfoClass = ref("nft-info-light"),
            nftCardSymbolClass = ref("nft-token-symbol-light"),
            tokenPriceClass = ref("token-price-light"),
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
            gotoCollection = function (address) {

                router.push({"path": `/collection/${address}/`}).catch((err) => {

                    throw err;

                });

            },
            openImage = function (url) {

                window.open(url);

            },
            gotoAddress = async function (address) {

                const chainId = await web3.value.eth.getChainId();

                if (chainId === 80001) {

                    window.open(`https://mumbai.polygonscan.com/address/${address}`);

                }

                if (chainId === 137) {

                    window.open(`https://polygonscan.com/address/${address}`);

                }

                if (chainId === 1) {

                    window.open(`https://etherscan.io/address/${address}`);

                }

            },
            openEpub = async function (k) {

                console.log("nft.metadata.properties.contents")
                console.log(nft.metadata.properties.contents)

                if (!userInfo.user_id) {

                    eBus.emit(
                        "app-event",
                        {
                            "action": "showLoginModal",
                            "data": ""
                        }
                    );

                }

                const addr = await getAccount(),
                    chainId = await web3.value.eth.getChainId(),
                    epubUrl = nft.metadata.properties.contents[k];

                if (web3.value.utils.toChecksumAddress(nft.owner) != web3.value.utils.toChecksumAddress(addr)) {

                    showNoReadModal.value = true;
                    return;

                }

                if (chainId != collection.chain_id) {

                    eBus.emit(
                        "app-event",
                        {
                            "action": "setNetwork",
                            "data": collection.chain_id
                        }
                    );
                    return;

                }

                var chain;
                if (chainId === 137) {

                    chain = "matic";

                } else if (chainId === 1) {

                    chain = "eth";

                }

                // ACL info
                const queryParams = {

                        "contractAddress": collection.nft_address,
                        "userAddress": addr,
                        "chainId": chain,
                        "tokenId": nft.token_id

                    },
                    // Convert the query parameters object into a query string
                    queryString = Object.keys(queryParams).
                        map((key) => `${key}=${encodeURIComponent(queryParams[key])}`).
                        join("&"),

                    // Combine the base URL and the query string
                    baseSrc = `${process.env.VUE_APP_SERVER_URI}bibi/?book=${epubUrl}`;

                bibiUrl.value = queryString
                    ? `${baseSrc}&${queryString}`
                    : baseSrc;
                console.log("bibiUrl.value");
                console.log(bibiUrl.value);

                var w = window.open(
                    bibiUrl.value,
                    "_blank"
                );

                setTimeout(
                    () => {

                      w.location.reload(true);

                    },
                    1000
                );

            },
            copyUrl = function () {

                navigator.clipboard.writeText(getUrl());

            },
            getUrl = function () {

                return `${process.env.VUE_APP_SERVER_URI}` + `collection/${route.params.address}/${route.params.token_id}`;

            },
            getCardRef = function () {

                return tokenRef.value;

            },
            tokenOn = function (e) {

                const el = document.getElementById(`pop-${nft.symbol.value}-${nft.token_id}`);
                nftInfoClass.value = "nft-info-dark";
                nftCardSymbolClass.value = "nft-token-symbol-dark";
                tokenPriceClass.value = "token-price-dark";
                el.style.transform = "translateY(0px)";
                isActive.value = true;

            },
            tokenOff = function (e) {

                const el = document.getElementById(`pop-${nft.symbol.value}-${nft.token_id}`);
                el.style.transform = "translateY(420px)";
                nftInfoClass.value = "nft-info-light";
                nftCardSymbolClass.value = "nft-token-symbol-light";
                tokenPriceClass.value = "token-price-light";
                isActive.value = false;

            },
            listNFT = async function (accept) {

                const addr = await getAccount(),
                    chainId = await web3.value.eth.getChainId(),
                    amc = new web3.value.eth.Contract(
                        rareiumMarketplaceABI,
                        `${serverConfig.VUE_APP_MARKETPLACE_ADDRESS}`
                    ),
                    nftc = new web3.value.eth.Contract(
                        rareiumNFTABI,
                        nft.address
                    ),
                    ptc = new web3.value.eth.Contract(
                        ERC20ABI,
                        payableToken.value
                    ),
                    lp = web3.value.utils.toWei(listPrice.value.toString());

                // make sure we are on the correct chain
console.log("serverConfig.chainId")
console.log(serverConfig.chainId)
console.log(serverConfig)

                if (collection.chain_id != serverConfig.chainId) {

                    console.log("set network collection.chain_id");
                    console.log(collection.chain_id);

                    eBus.emit(
                        "app-event",
                        {
                            "action": "setNetwork",
                            "data": collection.chain_id
                        }
                    );
                    return;

                }

                // make sure that this is a valid contract (prevent spend to non contract)
                const code = await web3.value.eth.getCode(collection.nft_address);
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
                    nft.token_id
                ).estimateGas(
                    {
                        "from": addr
                    },
                    (error, estimatedGas) => {
                    }
                );

                // gasLimit = Math.floor(gasLimit*2.5)
                console.log(`before gasLimit ${gasLimit}`);
                gasLimit = gasLimit <= 50000
                    ? gasLimit * 2
                    : gasLimit * Math.floor(1.5);
                gasLimit = gasLimit >= 300000
                    ? gasLimit * 1.5
                    : gasLimit * 2;
                gasLimit += 30000;
                console.log(`after gasLimit ${gasLimit}`);

                const x = await web3.value.eth.getBlock("latest").gasLimit,

                    gasPrice = await web3.value.eth.getGasPrice();

                isTransaction.value = true;

                nftc.methods.approve(
                    serverConfig.VUE_APP_MARKETPLACE_ADDRESS,
                    nft.token_id
                ).send({
                    "from": addr,
                    "gasPrice": web3.value.utils.toHex(gasPrice),
                    gasLimit
                }).
                    on(
                        "receipt",
                        async (receipt) => {

                            let gasLimit = await amc.methods.listNFT(
                                nft.address,
                                nft.token_id,
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

                            // gasLimit = Math.floor(gasLimit*2.5)
                            console.log(`before gasLimit ${gasLimit}`);
                            gasLimit = gasLimit <= 50000
                                ? gasLimit * 2
                                : gasLimit * Math.floor(1.5);
                            gasLimit = gasLimit >= 300000
                                ? gasLimit * 1.5
                                : gasLimit * 2;
                            gasLimit += 30000;
                            console.log(`after gasLimit ${gasLimit}`);

                            const gasPrice = await web3.value.eth.getGasPrice();

                            amc.methods.listNFT(
                                nft.address,
                                nft.token_id,
                                listAmount.value,
                                lp,
                                chainId,
                                payableToken.value
                            ).send({
                                "from": addr,
                                "gasPrice": web3.value.utils.toHex(gasPrice),
                                gasLimit
                            }).
                                then(async (jsonRpcResult) => {

                                    console.log("listNFT jsonRpcResult");
                                    console.log(jsonRpcResult);

                                    if (jsonRpcResult.events) {

                                        if (jsonRpcResult.events.ListedNFT) {

                                            nft.listing = jsonRpcResult.events.ListedNFT.returnValues;
                                            listPrice.value = weiToEther(nft.listing.price);

                                            isTransaction.value = false;
                                            showListModalAcceptOffer.value = false;

                                            await delay(2000);

                                            getToken(
                                                route.params.address,
                                                route.params.token_id,
                                                () => {

                                                    // renderCreative();
                                                    updateData();

                                                }
                                            );

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
                        nft.address
                    ),
                    ptc = new web3.value.eth.Contract(
                        ERC20ABI,
                        payableToken.value
                    ),
                    lp = web3.value.utils.toWei(listPrice.value.toString());

                // ensure we are on the correct chain
                if (collection.chain_id != serverConfig.chainId) {

                    console.log("set network collection.chain_id");
                    console.log(collection.chain_id);

                    eBus.emit(
                        "app-event",
                        {
                            "action": "setNetwork",
                            "data": collection.chain_id
                        }
                    );
                    return;

                }

                // make sure that this is a valid contract (prevent spend to non contract)
                const code = await web3.value.eth.getCode(collection.nft_address);
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

                    showBalanceModal.value = true;
                    return;

                }

                let gasLimit = await amc.methods.deListing(
                    nft.address,
                    nft.token_id
                ).estimateGas(
                    {
                        "from": addr
                    },
                    (error, estimatedGas) => {

                        console.log("estimatedGas");
                        console.log(estimatedGas);

                    }
                );
                console.log(`before gasLimit ${gasLimit}`);
                gasLimit = gasLimit <= 50000
                    ? gasLimit * 2
                    : gasLimit * Math.floor(1.5);
                gasLimit = gasLimit >= 300000
                    ? gasLimit * 1.5
                    : gasLimit * 2;
                console.log(`after gasLimit ${gasLimit}`);

                const gasPrice = await web3.value.eth.getGasPrice();

                amc.methods.deListing(
                    nft.address,
                    nft.token_id
                ).send({
                    "from": addr,
                    "gasPrice": web3.value.utils.toHex(gasPrice),
                    gasLimit
                }).
                    then(async (jsonRpcResult) => {

                        console.log("jsonRpcResult");
                        console.log(jsonRpcResult);
                        await delay(2000);

                        getToken(
                            route.params.address,
                            route.params.token_id,
                            () => {

                                // renderCreative();
                                updateData();

                            }
                        );


                    });

            },
            cancelOffer = async function (index) {

                if (!parseInt(index)) {

                    index = myOffer.value;

                }

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
                    ptc = new web3.value.eth.Contract(
                        ERC20ABI,
                        payableToken.value
                    ),
                    wei = 0;

                // ensure we are on the correct chain
                if (collection.chain_id != serverConfig.chainId) {

                    console.log("set network collection.chain_id");
                    console.log(collection.chain_id);

                    eBus.emit(
                        "app-event",
                        {
                            "action": "setNetwork",
                            "data": collection.chain_id
                        }
                    );
                    return;

                }

                // make sure that this is a valid contract (prevent spend to non contract)
                const code = await web3.value.eth.getCode(collection.nft_address);
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

                    showBalanceModal.value = true;
                    return;

                }

                let gasLimit = await amc.methods.cancelOffer(
                    nft.address,
                    nft.token_id,
                    index
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
                console.log(`before gasLimit ${gasLimit}`);
                gasLimit = gasLimit <= 50000
                    ? gasLimit * 2
                    : gasLimit * Math.floor(1.5);
                gasLimit = gasLimit >= 300000
                    ? gasLimit * 1.5
                    : gasLimit * 2;
                gasLimit += 30000;
                console.log(`after gasLimit ${gasLimit}`);

                const gasPrice = await web3.value.eth.getGasPrice();

                amc.methods.cancelOffer(
                    nft.address,
                    nft.token_id,
                    index
                ).send({
                    "from": addr,
                    "value": wei,
                    "gasPrice": web3.value.utils.toHex(gasPrice),
                    gasLimit
                }).
                    then(async (jsonRpcResult) => {

                        console.log("listNFT jsonRpcResult");
                        console.log(jsonRpcResult);
                        await delay(2000);

                        getToken(
                            route.params.address,
                            route.params.token_id,
                            () => {

                                // renderCreative();
                                updateData();

                            }
                        );

                    });

            },
            offerNFT = async function (r) {

                if (!userInfo.user_id) {

                    eBus.emit(
                        "app-event",
                        {
                            "action": "showLoginModal",
                            "data": ""
                        }
                    );
                    return;

                }

                const addr = await getAccount();

                // ensure the user has a wallet
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

                // ensure we are on the correct chain
                if (collection.chain_id != serverConfig.chainId) {

                    console.log("set network collection.chain_id");
                    console.log(collection.chain_id);

                    eBus.emit(
                        "app-event",
                        {
                            "action": "setNetwork",
                            "data": collection.chain_id
                        }
                    );
                    return;

                }

                // make sure that this is a valid contract (prevent spend to non contract)
                const code = await web3.value.eth.getCode(collection.nft_address);
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
                    nft.address,
                    nft.token_id,
                    1,
                    payableToken.value,
                    op
                ).estimateGas(
                    {
                        "from": addr,
                        "value": wei
                    },
                    (error, estimatedGas) => {

                        if (error) {

                            console.log("error");

                        } else {

                            console.log("estimatedGas");
                            console.log(estimatedGas);

                        }

                    }
                );

                console.log(`before gasLimit ${gasLimit}`);
                gasLimit = gasLimit <= 50000
                    ? gasLimit * 2
                    : gasLimit * Math.floor(1.5);
                gasLimit = gasLimit >= 300000
                    ? gasLimit * 1.5
                    : gasLimit * 2;
                gasLimit += 30000;
                console.log(`after gasLimit ${gasLimit}`);

                const gasPrice = await web3.value.eth.getGasPrice();
                isTransaction.value = true;

                amc.methods.createOffer(
                    nft.address,
                    nft.token_id,
                    1,
                    payableToken.value,
                    op
                ).send({
                    "from": addr,
                    "value": wei,
                    "gasPrice": web3.value.utils.toHex(gasPrice),
                    gasLimit
                }).
                    then(async (jsonRpcResult) => {

                        console.log("jsonRpcResult");
                        console.log(jsonRpcResult);

                        isTransaction.value = false;

                        if (jsonRpcResult.events) {

                            if (jsonRpcResult.events.OfferredNFT) {

                                nft.offers = jsonRpcResult.events.OfferredNFT.returnValues;
                                offerPrice.value = weiToEther(nft.offers.offerPrice);
                                showOfferModal.value = false;

                                await delay(2000);

                                getToken(
                                    route.params.address,
                                    route.params.token_id,
                                    () => {

                                        // renderCreative();
                                        updateData();

                                    }
                                );

                            }

                        }

                        showListModal.value = false;

                    });

            },
            acceptOffer = async function (offerer, index) {

                const addr = await getAccount();

                if (!addr) {

                    showWalletModal.value = true;
                    return;

                }

                if (nft.listing.length > 0) {

                    if (nft.listing.nft === "0x0000000000000000000000000000000000000000" ||
                        nft.listing.sold === true) {

                        showListModal.value = true;
                        showListModalAcceptOffer.value = true;
                        return;

                    }

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

                let wei = 0;

                if (payableToken.value != "0x0000000000000000000000000000000000001010") {

                    const receipt = await ptc.methods.approve(
                        serverConfig.VUE_APP_MARKETPLACE_ADDRESS,
                        op
                    ).send({"from": addr});

                } else {

                    wei = op;

                }

                // ensure we are on the correct chain
                if (collection.chain_id != serverConfig.chainId) {

                    console.log("set network collection.chain_id");
                    console.log(collection.chain_id);

                    eBus.emit(
                        "app-event",
                        {
                            "action": "setNetwork",
                            "data": collection.chain_id
                        }
                    );
                    return;

                }

                // make sure that this is a valid contract (prevent spend to non contract)
                const code = await web3.value.eth.getCode(collection.nft_address);
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

                    showBalanceModal.value = true;
                    return;

                }

                let gasLimit = await amc.methods.acceptOffer(
                    nft.address,
                    nft.token_id,
                    offerer,
                    index
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
                console.log(`before gasLimit ${gasLimit}`);
                gasLimit = gasLimit <= 50000
                    ? gasLimit * 2
                    : gasLimit * Math.floor(1.5);
                gasLimit = gasLimit >= 300000
                    ? gasLimit * 1.5
                    : gasLimit * 2;
                gasLimit += 30000;
                console.log(`after gasLimit ${gasLimit}`);

                const gasPrice = await web3.value.eth.getGasPrice();
                isTransaction.value = true;

                amc.methods.acceptOffer(
                    nft.address,
                    nft.token_id,
                    offerer,
                    index
                ).send({
                    "from": addr,
                    "value": wei,
                    "gasPrice": web3.value.utils.toHex(gasPrice),
                    gasLimit
                }).
                    then(async (jsonRpcResult) => {

                        console.log("jsonRpcResult");
                        console.log(jsonRpcResult);
                        showListModalAcceptOffer.value = false;
                        showListModal.value = false;
                        isTransaction.value = false;

                        if (jsonRpcResult.events) {

                            await delay(2000);

                            getToken(
                                route.params.address,
                                route.params.token_id,
                                () => {

                                    // renderCreative();
                                    updateData();

                                }
                            );

                        }

                    });

            },
            buyNFT = async function (r) {

                if (!userInfo.user_id) {

                    eBus.emit(
                        "app-event",
                        {
                            "action": "showLoginModal",
                            "data": ""
                        }
                    );
                    return;

                }

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

                // ensure we are on the correct chain
                if (collection.chain_id != serverConfig.chainId) {

                    console.log("set network collection.chain_id");
                    console.log(collection.chain_id);

                    eBus.emit(
                        "app-event",
                        {
                            "action": "setNetwork",
                            "data": collection.chain_id
                        }
                    );
                    return;

                }

                // make sure that this is a valid contract (prevent spend to non contract)
                const code = await web3.value.eth.getCode(collection.nft_address);
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

                let gasLimit = await amc.methods.purchaseNFT(
                    nft.address,
                    nft.token_id,
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
                    ? gasLimit * 2
                    : gasLimit * Math.floor(1.5);
                gasLimit = gasLimit >= 300000
                    ? gasLimit * 1.5
                    : gasLimit * 2;
                gasLimit += 30000;
                console.log(`after gasLimit ${gasLimit}`);

                const gasPrice = await web3.value.eth.getGasPrice();

                amc.methods.purchaseNFT(
                    nft.address,
                    nft.token_id,
                    payableToken.value,
                    lp
                ).send({
                    "from": addr,
                    "value": wei,
                    "gasPrice": web3.value.utils.toHex(gasPrice),
                    gasLimit
                }).
                    then(async (jsonRpcResult) => {

                        console.log("jsonRpcResult");
                        console.log(jsonRpcResult);

                        if (jsonRpcResult.events) {

                            if (jsonRpcResult.events.ListedNFT) {

                                nft.listing = jsonRpcResult.events.ListedNFT.returnValues;
                                listPrice.value = weiToEther(nft.listing.price);

                            }

                            await delay(1000);

                            getToken(
                                route.params.address,
                                route.params.token_id,
                                () => {

                                    // renderCreative();
                                    updateData();

                                }
                            );

                        }

                        showListModal.value = false;

                    });

            },
            getIcon = function (i) {

                if (serverConfig.visualMode === "dark") {

                    return icon.get(`${i}_DARK`);

                }
                return icon.get(`${i}_LIGHT`);

            },
            getPaymentInfo = async function () {

                await delay(1000);

                const chainId = nft.chain_id;

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

                const chainId = nft.chain_id,

                    priceFeed = serverConfig.priceFeed,
                    maticPriceYEN = priceFeed.maticPriceYEN,
                    maticPriceUSD = priceFeed.maticPriceUSD,
                    ethPriceYEN = priceFeed.ethPriceYEN,
                    ethPriceUSD = priceFeed.ethPriceUSD;

                let priceFormat;

                if (chainId === 1 || chainId === 11155111) {

                    priceFormat = `${formatYen(ethPriceYEN * price)} / ${formatCent(ethPriceUSD * price)}`;

                }

                if (chainId === 137 || chainId === 80001) {

                    priceFormat = `${formatYen(maticPriceYEN * price)} / ${formatCent(maticPriceUSD * price)}`;

                }

                return priceFormat;

            },
            getCollection = function (address) {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}getCollection`,

                    {

                        "params": {

                            address

                        }

                    }

                ).
                    then((response) => {
console.log("getCollection response.data")
console.log(response.data)

                        collection.name = response.data.name;
                        collection.royalty = response.data.royalty;
                        collection.chain_id = response.data.chain_id;
                        collection.nft_address = response.data.nft_address;
                        collectionBanner.value = response.data.banner.replace(
                            "ipfs://",
                            "https://w3s.link/ipfs/"
                        );
                        collectionImage.value = response.data.image.replace(
                            "ipfs://",
                            "https://w3s.link/ipfs/"
                        );
                        collectionSymbol.value = response.data.symbol;
                        collectionDescription.value = response.data.description;

                        // set the background
                        if (nftContainer.value === "nft-container-desktop") {

                            const bg = document.getElementById("nftTokenBackground");
                            bg.style.height = "102%";
                            bg.style.width = "103%";
                            bg.style.position = "absolute";
                            bg.style.display = "flex";
                            bg.style.flexDirection = "column";
                            bg.style.alignItems = "center";
                            bg.style.background = `url(${collectionBanner.value})`;
                            bg.style.backgroundRepeat = "no-repeat";
                            bg.style.backgroundSize = "cover";
                            bg.style.backgroundPosition = "center";
                            bg.style.height = "103vh";
                            bg.style.filter = "blur(8px)";
                            bg.style["-webkit-filter"] = "blur(10px)";

                        }

                    });

            },
            updateView = function () {

                const gbd = document.getElementById("ethicaladDesktop"),
                    gbm = document.getElementById("ethicaladMobile");

                if (serverConfig.view === "desktop") {

                    nftTokenClass.value = "nft-token-desktop";
                    nftContainer.value = "nft-container-desktop";

                } else if (serverConfig.view === "laptop") {

                    nftContainer.value = "nft-container-desktop";
                    nftTokenClass.value = "nft-token-desktop";

                } else if (serverConfig.view === "tablet") {

                    nftTokenClass.value = "nft-token-mobile";
                    nftContainer.value = "nft-container-mobile";

                } else {

                    nftTokenClass.value = "nft-token-mobile";
                    nftContainer.value = "nft-container-mobile";

                }

            },
            getImageUrl = function (i) {

                if (i) {

                    console.log(i.replace(
                        "ipfs://",
                        "https://w3s.link/ipfs/"
                    ));
                    return i.replace(
                        "ipfs://",
                        "https://w3s.link/ipfs/"
                    );

                }

            },
            toKb = function (v) {

                return Math.ceil(v / 1024);

            },

            /*
             * Function to show which are the relevant buy, offer, list buttons to show based on the user.
             * This is quite the mess... Also worry abou the web3 api changing in the future..
             */
            displayButtons = async function () {

                const addr = await getAccount();

                forOffer.value = true;

                if (listPrice.value > 0) {

                    forBuy.value = true;

                }

                if (addr) {

                    if (nft.offers) {

                        for (let i = 0; i < nft.offers.length; i++) {

                            forOfferCancel.value[i] = false;
                            forOfferAccept.value[i] = false;

                            if (web3.value.utils.toChecksumAddress(nft.offers[i].offerer) === web3.value.utils.toChecksumAddress(addr)) {

                                myOffer.value = i;

                                if (nft.offers[i].accepted === false) {

                                    forOfferCancel.value[i] = true;
                                    forOffer.value = false;

                                }

                            }

                            if (web3.value.utils.toChecksumAddress(nft.owner) === web3.value.utils.toChecksumAddress(addr) ||
                               web3.value.utils.toChecksumAddress(nft.previous_owner) === web3.value.utils.toChecksumAddress(addr) &&
                                web3.value.utils.toChecksumAddress(serverConfig.VUE_APP_MARKETPLACE_ADDRESS) ===
                                  web3.value.utils.toChecksumAddress(nft.owner)) {

                                forOffer.value = false;
                                forBuy.value = false;

                                if (nft.offers[i].accepted === false) {

                                    forOfferAccept.value[i] = true;

                                    if (web3.value.utils.toBN(bestOffer.price).lt(web3.value.utils.toBN(nft.offers[i].offerPrice))) {

                                        bestOffer.index = i;
                                        bestOffer.offerer = nft.offers[i].offerer;
                                        bestOffer.price = nft.offers[i].offerPrice;
                                        updateData(2000);

                                    }

                                }

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

                                forList.value = false;
                                forDeList.value = true;
                                forBuy.value = false;
                                forOffer.value = false;

                            } else {

                                forList.value = false;
                                forDeList.value = false;
                                forBuy.value = false;

                                /*
                                 * TODO investigate here, seems like we don't need this forOffer?
                                 * forOffer.value = false;
                                 */

                            }

                        } else {

                            forList.value = false;
                            forDeList.value = false;

                            if (nft.listing.sold === true) {

                                forBuy.value = false;

                            }

                        }

                    }

                    if (web3.value.utils.toChecksumAddress(nft.owner) ===
                      web3.value.utils.toChecksumAddress(addr)) {

                        forList.value = true;
                        forDeList.value = false;
                        forBuy.value = false;
                        forOffer.value = false;

                    } else {
                    }

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

                        nft.token_id = response.data.token_id;
                        nft.chain_id = response.data.chain_id;
                        nft.metadata = response.data.metadata;
                        nft.address = response.data.nft_address;
                        nft.owner = response.data.owner;
                        nft.previous_owner = response.data.previous_owner;
                        nft.standard = response.data.standard;
                        nft.token_uri = response.data.token_uri;
                        nft.transaction_hash = response.data.transaction_hash;

                        if (nft.chain_id == serverConfig.chainId) {

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

                                            nft.address = address;
                                            nft.owner = owner;
                                            nft.metadata = tokenData.data;
                                            nft.token_id = token_id;
console.log('callback')
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

                if (nft.token_id >= 0) {

                    const amc = new web3.value.eth.Contract(
                        rareiumMarketplaceABI,
                        `${serverConfig.VUE_APP_MARKETPLACE_ADDRESS}`
                    );
                    amc.methods.getListedNFT(
                        nft.address,
                        nft.token_id
                    ).
                        call().
                        then((jsonRpcResult) => {

                            console.log("amc.methods.getListedNFT");
                            console.log(jsonRpcResult);
                            nft.listing = jsonRpcResult;
                            listPrice.value = weiToEther(nft.listing.price);

                        });

                    amc.methods.getOfferredNFT(
                        nft.address,
                        nft.token_id
                    ).
                        call().
                        then((jsonRpcResult) => {

                            console.log("amc.methods.getOfferredNFT");
                            console.log(jsonRpcResult);
                            nft.offers = jsonRpcResult;

                        });

                    const anc = new web3.value.eth.Contract(
                        rareiumNFTABI,
                        nft.address
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

            updateView();

            getCollection(route.params.address);

            getPaymentInfo();

            getToken(
                route.params.address,
                route.params.token_id,
                () => {

                    // renderCreative();
                    updateData();

                }
            );

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

        });

        return {"localize": translation.localize,
            serverConfig,

            /*
             *     creativeImage,
             *       creativeVideo,
             */
            getUrl,
            getImageUrl,
            openEpub,
            bibiUrl,
            userInfo,
            epubComponent,
            copyUrl,
            collectionSymbol,
            collectionBanner,
            collectionImage,
            collectionDescription,
            openImage,
            showLoadModal,
            showListModal,
            showListModalAcceptOffer,
            showBuyModal,
            showNoReadModal,
            rareiumNFTABI,
            maticPriceUSD,
            maticPriceJPY,
            nftTokenClass,
            nftContainer,
            nftCreativePreview,
            formatCent,
            formatYen,
            paymentIcon,
            paymentSymbol,
            getIcon,
            getPaymentInfo,
            getPrice,
            collection,
            nft,
            getToken,
            getTokenURI,
            isActive,
            gotoCollection,
            gotoAddress,
            tokenOn,
            tokenOff,
            getAccount,
            getCardRef,
            tokenRef,
            listNFT,
            updateData,
            delay,
            deListNFT,
            buyNFT,
            offerNFT,
            cancelOffer,
            acceptOffer,
            isTransaction,
            listPrice,
            offerPrice,
            listAmount,
            payableToken,
            displayButtons,
            forList,
            forDeList,
            forBuy,
            forOffer,
            forOfferAccept,
            forOfferCancel,
            myOffer,
            bestOffer,
            nftInfoClass,
            nftCardSymbolClass,
            showWalletModal,
            showBalanceModal,
            showOfferModal,
            openShareModal,
            tokenPriceClass,
            weiToEther,
            eBus,
            toKb};
        // renderCreative};

    }
};

</script>
<style scoped>

.nft-token {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.token-info-container {
  position: relative;
  border: 3px solid #fff;
  border-radius: 17px;
  padding: 20px;
  background: white;
}
.token-info-box {
}
.token-info-box-item {
  display: flex;
  justify-content: start;
  align-items: center;
  padding: 10px;
  font-size: 0.8em;
  border-bottom: 10px solid #e9dbff;
}
.token-info-box-item-symbol {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  font-size: 0.8em;
  border-bottom: 10px solid #e9dbff;
}
.token-info-name-id {
  font-weight: 800;
  display: flex;
  justify-content: space-between;
}
.nft-token-desktop {
  display: flex;
  flex-direction: row;
  width: 100%;
  max-width: 1200px;
  transition: all 0.3s;
  margin: 10px;
  justify-content: center;
}
.nft-token-mobile {
  display: flex;
  flex-direction: column;
  width: 100%;
  transition: all 0.3s;
  margin: 10px;
  justify-content: center;
}
.regular-token-style-before {
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
	transition: all 0.3s;
  transform: translateY(420px);
	background: linear-gradient(135deg, #efefef 25%, #c481e3 25%);
}
.token-token-icon {
  width: 20px;
  padding: 5px;
}
.token-token-icon-pricing {
  width: 20px;
  padding-left: 10px;
}
.token-token-chain {
  margin: -15px 10px;
  width: 30px;
  height: 30px;
  border-radius: 50px;
  background-color: white;
}
.token-attribute-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.token-attribute {
  font-size: 0.8em;
  margin: 10px;
  padding: 10px;
  display: flex;
  min-width: 100px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #e9dbff;
  color: #4a4a4a;
  border: 1px solid #d8adff;
  border-radius: 5px;
}
.token-value {
  color: #8b42ff;
  margin-top: 7px;
}
.nft-container-desktop {
  display: flex;
  flex-direction: column;
  width: 50%;
  margin: 10px;
  z-index: 1;
}
.nft-container-mobile {
  display: flex;
  flex-direction: column;
  margin: 10px;
}
.nft-container {
  flex-wrap: nowrap;
  background: #fff;
  box-sizing: border-box;
  -webkit-backdrop-filter: blur(9.60224px);
  backdrop-filter: blur(9.60224px);
  border-radius: 20px;
}
.nft-info-container {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
.nft-info-light {
  justify-content: space-between;
  display: flex;
  flex-direction: row;
  margin-left: 10px;
  margin-right: 10px;
  color: #565656;
  font-weight: 700;
}
.nft-info-dark {
  justify-content: space-between;
  display: flex;
  flex-direction: row;
  margin-left: 10px;
  margin-right: 10px;
  color: #fff;
  font-weight: 700;
}
img.image-creative {
  width: 100%;
  height: 100%;
  overflow: none;
  cursor: zoom-in;
  border-radius: 15px;
  object-fit: cover;
}
video.video-creative {
  width: 100%;
  overflow: none;
  cursor: pointer;
  border-radius: 15px;
  object-fit: cover;
}
.token-buttons-container {
}
.token-buy-button {
  height: 20px;
  color: #ff46a4;
  border-radius: 5px;
  margin: 10px;
  font-size: 0.9em;
  padding: 10px 20px;
  border: 1px solid #ff46a4;
  font-weight: bold;
  background-color: white;
  cursor: pointer;
}
.token-buy-button:hover {
  color: white;
  background-color: #ff46a4;
}
.token-price-light {
  font-size: .9em;
  font-weight: bold;
  color: #2e2e2e;
  padding: 6px;
}
.token-price-dark {
  font-size: .9em;
  font-weight: bold;
  color: #fff;
  padding: 6px;
}
.list-button {
  position: relative;
  display: flex;
  margin-top: 40px;
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
.spinner-absolute {
  position: absolute;
  margin-left: 200px;
}
.pricing-ticker-container {
  margin: 7px;
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
.nft-token-symbol-light {
  display: flex;
  justify-content: end;
  color: grey;
}
.nft-token-symbol-dark {
  display: flex;
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
  font-size: .8em;
  margin: 20px;
  font-size: 0.9em;
  color: #5d585e;
}
.token-price-symbol {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.token-button-container {
  display: flex;
  margin: 10px;
}
.token-header-small {
  display: flex;
  align-items: center;
  width: 100%;
  color: #fff;
  font-size: 1.5em;
  font-weight: 700;
  padding-left: 25px;
  margin-top: 10px;
  margin-bottom: 10px;
  max-width: 1600px;
  margin-left: auto;
  margin-right: auto;
  text-shadow: 2px 3px 0 #925ab1, 3px 3px 0 #925ab1, 2px 2px 0 #925ab1, 1px 1px 0 #925ab1
}
.token-header {
  display: flex;
  align-items: center;
  width: 100%;
  color: #fff;
  font-size: 1.5em;
  font-weight: 700;
  padding-left: 25px;
  margin-top: 10px;
  margin-bottom: 10px;
  max-width: 1600px;
  margin-left: auto;
  margin-right: auto;
  text-shadow: 4px 4px 0 #925ab1, 1px -1px 0 #925ab1, -1px 1px 0 #925ab1, 1px 1px 0 #925ab1;
}
.card-token-icon-pricing {
  width: 24px;
  height: 24px;
}
.price-ticket-symbol {
  font-size: 0.7em;
}
.offers-box {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  border: 1px solid #dfdfdf;
  border-radius: 15px;
  padding: 10px;
  font-size: 0.9em;
  background: white;
}
.offers-item {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.offer-tupple {
  width: 25%;
  margin: 10px;
  padding: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  border-top: 1px solid #efefef;
  font-size: 0.8em;
}
.best-offer-tupple {
  display: flex;
  height: 40px;
  width: 70%;
  margin: 10px;
  padding: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  border-top: 1px solid #efefef;
  font-size: 0.8em;
  align-items: center;
}
.offer-accept-button {
  padding: 5px;
  font-size: .8em;
  border-radius: 10px;
  color: #ff46a4;
  border-top: 1px solid #efefef;
  border: 1px solid #ff46a433;
  font-weight: 700;
  text-align: center;
  justify-content: center;
  box-shadow: 0 5px 10px 0 rgb(139 106 224 / 33%);
  cursor: pointer;
}
.offer-accept-button:hover {
  padding: 5px;
  font-size: .8em;
  border-radius: 10px;
  color: #ff46a4;
  border-top: 1px solid #efefef;
  border: 1px solid #ff46a433;
  font-weight: 700;
  justify-content: center;
  box-shadow: 0 5px 10px 0 rgb(139 106 224 / 33%);
  cursor: pointer;
}
.simple-link {
  pointer: cursor;
  color: #0784c3;
}
.simple-link:hover {
  cursor: pointer;
  text-decoration: underline;
}
sub.token-symbol {
  font-size: 0.6em;
  font-weight: bold;
}
.accept-offer-list-first {
  margin: 10px;
  padding: 10px;
  border: 1px solid;
  border-radius: 15px;
  background: #c085ff;
  color: white;
}
.token-collection-banner {
  top: 0;
  left: 0;
  position: absolute;
  width: 100%;
  height: 200px;
  object-fit: cover;
  background-position: center;
  aspect-ratio: 1/1;
  border-radius: 12px 12px 0px 0px;
  cursor: pointer;
}
.margin-top-200 {
  margin-top: 200px;
}
.token-collection-name {
  cursor: pointer;
}
.nft-creative-preview {
  flex-wrap: nowrap;
  background: #fff;
  border: 3px solid white;
  box-sizing: border-box;
  -webkit-backdrop-filter: blur(9.60224px);
  backdrop-filter: blur(9.60224px);
  border-radius: 20px;
}
.nft-creative-preview-fullscreen {
  background-size: contain;
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: 10000;
  top: 0;
  left: 0;
  cursor: zoom-out;
}
.share-icon {
  display: block;
  margin: 15px;
  width: 48px;
  height: 32px;
  padding: 0;
  cursor: pointer;
  background-image: url('../assets/share-icon.png');
  background-size: contain;
  background-repeat: no-repeat;
}
.sn-icons {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}
.sn-line-icon {
  cursor: pointer;
  height: 48px;
  min-width: 200px;
  margin: 10px;
  background-image: url('../assets/line-icon.png');
  background-size: contain;
  background-repeat: no-repeat;
}
.sn-weibo-icon {
  cursor: pointer;
  height: 48px;
  min-width: 200px;
  margin: 10px;
  background-image: url('../assets/weibo-icon.png');
  background-size: contain;
  background-repeat: no-repeat;
}
.sn-facebook-icon {
  cursor: pointer;
  height: 48px;
  min-width: 200px;
  margin: 10px;
  background-image: url('../assets/facebook-icon.png');
  background-size: contain;
  background-repeat: no-repeat;
}
.sn-twitter-icon {
  cursor: pointer;
  height: 48px;
  min-width: 200px;
  margin: 10px;
  background-image: url('../assets/twitter-icon.png');
  background-size: contain;
  background-repeat: no-repeat;
}
.sn-reddit-icon {
  cursor: pointer;
  height: 48px;
  min-width: 200px;
  margin: 10px;
  background-image: url('../assets/reddit-icon.png');
  background-size: contain;
  background-repeat: no-repeat;
}
.sn-linkedin-icon {
  cursor: pointer;
  height: 48px;
  min-width: 200px;
  margin: 10px;
  background-image: url('../assets/linkedin-icon.png');
  background-size: contain;
  background-repeat: no-repeat;
}
.sn-copy-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  height: 28px;
  min-width: 100px;
  margin: 10px;
  color: white;
  padding: 10px;
  border-radius: 4px;
  background-color: #505050;
  background-size: contain;
  background-repeat: no-repeat;
  cursor: pointer;
}
.sn-block {
  display: block;
  width: 100%;
  height: 100%;
}
.read-button {
  width: fit-content;
  height: 15px;
  color: #ffffff;
  border-radius: 5px;
  margin: 10px;
  font-size: .9em;
  padding: 10px 15px 12px 15px;
  border: 2px solid #ff89ea;
  font-weight: 700;
  background-color: #e144c1;
  cursor: pointer;
}
.read-button:hover {
}
.read-text {
  display: flex;
  justify-content: center;
  align-items: center;
}
.symbol-text {
  margin-top: 10px;
  margin-right: 10px;
}
</style>
