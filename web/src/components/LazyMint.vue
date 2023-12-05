<template>
  <div>
    <Dashboard>
      <div class="lazymint-container">
        <div id="collection-lazymint-background" />
        <div
          v-if="serverConfig.view == 'mobile'"
          class="mobile-pad"
        >
          <Transition
            v-if="nft.id"
            name="slide-fade"
            mode="out-in"
          >
            <LazyMintVoucher
              :key="nft.id"
              :nft="nft"
              @scroll="setToken('loop', $event)"
            >
              <template #navigate>
                <div>
                  <div class="voucher-nav">
                    <div
                      class="nav-button"
                      @click="setToken('prev', $event)"
                    >
                      <div
                        class="token-token-icon"
                      >
                        &lt;
                      </div>
                      <div class="hspace" />
                      <div>
                        {{ localize('TEXT_PREV') }}
                      </div>
                    </div>
                    <div
                      class="nav-button"
                      @click="setToken('next', $event)"
                    >
                      <div>
                        {{ localize('TEXT_NEXT') }}
                      </div>
                      <div class="hspace" />
                      <div
                        class="token-token-icon"
                      >
                        &gt;
                      </div>
                    </div>
                  </div>
                  <div
                    class="mint-container"
                  >
                    <div
                      class="flex-row mobile-mint-container"
                    >
                      <div
                        v-if="nft.minted === true"
                        class="lazy-mint-collection-button-minted"
                      >
                        {{ localize('TEXT_MINTED') }}
                      </div>
                      <div
                        v-if="nft.minted === false"
                        class="lazy-mint-collection-button-mint"
                        @click="mintVoucher()"
                      >
                        {{ localize('TEXT_MINT') }}
                      </div>
                      <div
                        class="flex-row-center"
                      >
                        <div class="flex-row-center">
                          <div
                            class="mint-token-chain"
                          >
                            <div
                              v-if="collection.chain_id == 137"
                              class="token-token-icon"
                              v-html="getIcon('POLYGON_LIGHT')"
                            />
                            <div
                              v-if="collection.chain_id == 1"
                              class="token-token-icon"
                              v-html="getIcon('ETHEREUM_PURPLE')"
                            />
                          </div>
                        </div>
                        <div
                          v-if="nft.voucher"
                          class="flex-price flex-col"
                        >
                          <div>
                            {{ localize('TEXT_PRICE') }}
                          </div>
                          &nbsp;
                          <div>
                            {{ nft.metadata.mintprice }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      v-if="nft.voucher"
                      class="regular-text"
                    >
                      {{ localize('TEXT_VOUCHER') }}  {{ nft.voucher.id }}
                    </div>
                  </div>
                </div>
              </template>
            </LazyMintVoucher>
          </Transition>
        </div>
        <div class="lazy-mint-layout-desktop">
          <div id="collection-lazymint-header">
            <div class="collection-header-contents">
              <div id="collection-detail">
                <div
                  v-if="collection.name"
                  class="collection-header-name"
                >
                  {{ collection.name }} # {{ lastTokenId+1 }}
                </div>
                <div class="flex-row-wrap">
                  <div
                    id="collection-lazymint-image"
                  />
                  <div class="mint-container">
                    <div
                      class="flex-row"
                    >
                      <div
                        v-if="nft.minted === true"
                        class="lazy-mint-collection-button-minted"
                      >
                        {{ localize('TEXT_MINTED') }}
                      </div>
                      <div
                        v-if="nft.minted === false"
                        class="lazy-mint-collection-button-mint"
                        @click="mintVoucher()"
                      >
                        {{ localize('TEXT_MINT') }}
                      </div>
                      <div
                        class="flex-row-center"
                      >
                        <div class="flex-row-center">
                          <div
                            class="mint-token-chain"
                          >
                            <div
                              v-if="collection.chain_id == 137"
                              class="token-token-icon"
                              v-html="getIcon('POLYGON_LIGHT')"
                            />
                            <div
                              v-if="collection.chain_id == 1"
                              class="token-token-icon"
                              v-html="getIcon('ETHEREUM_PURPLE')"
                            />
                          </div>
                        </div>
                        <div
                          v-if="nft"
                          class="flex-price flex-col"
                        >
                          <div>
                            {{ localize('TEXT_PRICE') }}
                          </div>
                          &nbsp;
                          <div>
                            {{ nft.metadata.mintprice }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      v-if="nft.voucher"
                      class="regular-text"
                    >
                      {{ localize('TEXT_VOUCHER') }}  {{ nft.voucher.id }}
                    </div>
                  </div>
                </div>
                <div class="flex-row-wrap">
                  <div class="flex-row">
                    <div
                      v-if="collection.symbol"
                      class="symbol-text"
                      @click="gotoTab('collection/' + route.params.address)"
                    >
                      <b>/ {{ collection.symbol }}</b>
                    </div>
                    <div
                      v-if="collection.creator_name"
                      class="symbol-text"
                      @click="gotoTab(collection.creator_name)"
                    >
                      <b> @ {{ collection.creator_name }}</b>
                    </div>
                  </div>
                  <div
                    class="symbol-text flex-row"
                  >
                    {{ localize('MINT_SUPPLY') }} : {{ vouchers.length - lastTokenId }} / {{ vouchers.length }}
                  </div>
                </div>
                <div class="flex-row">
                  <Markdown
                    v-if="collection.description"
                    :source="collection.description"
                    :style="markdownStyle"
                    class="collection-description"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="serverConfig.view == 'desktop' || serverConfig.view == 'tablet'"
            class="asset-container"
          >
            <Transition
              v-if="nft.id"
              name="slide-fade"
              mode="out-in"
            >
              <LazyMintVoucher
                :key="nft.id"
                :nft="nft"
                @scroll="setToken('loop', $event)"
              >
                <template #navigate>
                  <div class="voucher-nav">
                    <div
                      class="nav-button"
                      @click="setToken('prev')"
                    >
                      <div
                        class="token-token-icon"
                      >
                        &lt;
                      </div>
                      <div class="hspace" />
                      <div>
                        {{ localize('TEXT_PREV') }}
                      </div>
                    </div>
                    <div
                      class="nav-button"
                      @click="setToken('next')"
                    >
                      <div>
                        {{ localize('TEXT_NEXT') }}
                      </div>
                      <div class="hspace" />
                      <div
                        class="token-token-icon"
                      >
                        &gt;
                      </div>
                    </div>
                  </div>
                </template>
              </LazyMintVoucher>
            </Transition>
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
          v-if="showSuccessModal"
          color="#995dd4"
          width="small"
          @close="showSuccessModal = false"
        >
          <template #header>
            <div class="hidden" />
          </template>
          <template #body>
            <div>
              <LazyMintVoucher
                :key="nft.id"
                :nft="nft"
              >
                <template #footer>
                  <div class="hidden" />
                </template>
                <template #metadata>
                  <div class="hidden" />
                </template>
              </LazyMintVoucher>
              <div class="token-mint-success">
                <div class="token-minted">
                  {{ localize('TEXT_TOKEN_MINTED') }}
                </div>
                <div
                  class="lazy-minted-button"
                  @click="gotoToken"
                >
                  {{ localize('TEXT_ACCESS_NFT') }}
                </div>
                <div
                  class="text-button"
                  @click="closeToken"
                >
                  {{ localize('TEXT_MINT_MORE') }}
                </div>
              </div>
            </div>
          </template>
          <template #footer>
            <div class="hidden" />
          </template>
        </CModal>

        <CModal
          v-if="showFailedModal"
          color="#995dd4"
          width="small"
          @close="showFailedModal = false"
        >
          <template #header>
            <div> Error </div>
          </template>
          <template #body>
            <div>
              Error Minting Token.
            </div>
          </template>
          <template #footer>
            <div class="hidden" />
          </template>
        </CModal>

        <div class="">
          <CModal
            v-if="showShareModal"
            color="#995dd4"
            width="large"
            @close="showShareModal = false"
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
                      :media="getImageUrl()"
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
                      :media="getImageUrl()"
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
                      :media="getImageUrl()"
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
                      :media="getImageUrl()"
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
                      :media="getImageUrl()"
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
                      :media="getImageUrl()"
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
                  @click="showShareModal = false"
                >
                  Close
                </div>
              </div>
            </template>
            <template #footer>
              <div class="hidden" />
            </template>
          </CModal>
        </div>
      </div>
    </Dashboard>
  </div>
</template>
<script>

import {iconStore} from "@/stores/icon";
import {inject, onMounted, reactive, ref, watch, watchEffect} from "vue";
import {translationStore} from "@/stores/translation";
import Axios from "axios";
import Markdown from "vue3-markdown-it";
import {ERC20ABI, rareiumMarketplaceABI, rareiumNFTABI, rareiumPlatformABI} from "../abi.js";
import LazyMintVoucher from "./LazyMintVoucher.vue";

export default {
    "name": "LazyMint",
    "components": {
        LazyMintVoucher,
        Markdown
    },
    "props": {
        "preview": {
            "type": Boolean,
            "default": true
        },
        "refresh": Number
    },
    setup (props) {

        const translation = translationStore(),
            serverConfig = inject("serverConfig"),
            eBus = inject("eBus"),
            userInfo = inject("userInfo"),
            route = inject("route"),
            router = inject("router"),
            icon = iconStore(),
            web3 = inject("web3"),
            markdownStyle = ref(),
            wallet = ref(),
            preview = ref(props.preview),
            pages = ref(1),
            tokens = reactive([]),
            pageTokens = reactive([]),
            filterTokens = reactive([]),
            payableToken = ref("0x0000000000000000000000000000000000001010"),
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
            collection = reactive({
                "id": 0,
                "name": "",
                "symbol": "",
                "description": "",
                "owner": "",
                "image": "",
                "banner": "",
                "video": "",
                "file": {},
                "primary_color": "#000",
                "secondary_color": "#dde6e8"
            }),
            nft = ref({
                "token_id": String,
                "chain_id": String,
                "chain_uri": String,
                "owner": String,
                "previous_owner": String,
                "standard": String,
                "metadata": Object,
                "address": String,
                "minted": Boolean,
                "key": String
            }),
            tokenId = ref(false),
            showShareModal = ref(false),
            showSuccessModal = ref(false),
            showFailedModal = ref(false),
            showBalanceModal = ref(false),
            showWalletModal = ref(false),
            xyz = reactive([]),
            selectedVoucher = ref(),
            lastTokenId = ref(0),
            vouchers = reactive([]),
            gotoToken = function () {

                if (tokenId.value) {

                    router.push({"path": `/collection/${collection.nft_address}/${tokenId.value}`}).catch((err) => {

                        throw err;

                    });

                }

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
            connectWallet = async function () {

                if (parseInt(userInfo.user_id) > 0) {

                    const acc = await web3.value.eth.getAccounts();

                    if (acc.length > 0) {

                        wallet.value = acc[0];

                    } else if (window.ethereum) {

                        const accounts = await ethereum.request({"method": "eth_requestAccounts"});
                        wallet.value = acc[0];

                    }

                } else {

                    eBus.emit(
                        "app-event",
                        {
                            "action": "showLoginModal",
                            "data": ""
                        }
                    );

                }

            },
            addAlpha = function (color, alpha) {

                const _opacity = Math.round(Math.min(
                    Math.max(
                        alpha || 1,
                        0
                    ),
                    1
                ) * 255);
                return color + _opacity.toString(16).toUpperCase();

            },
            expandDescription = function () {

                const i = document.getElementById("collection-detail");

                if (i.style["-webkit-line-clamp"] === 5) {

                    i.style["-webkit-line-clamp"] = "unset";

                } else {

                    i.style["-webkit-line-clamp"] = 5;

                }

            },
            setToken = function (d, e) {

                if (e) {

                    e.preventDefault();

                }

                if (d === "prev" && selectedVoucher.value > 0) {

                    selectedVoucher.value--;

                }

                if (d === "next" && selectedVoucher.value < vouchers.length - 1) {

                    selectedVoucher.value++;

                }

                if (d === "loop") {

                    if (selectedVoucher.value < vouchers.length - 1) {

                        selectedVoucher.value++;

                    } else {

                        selectedVoucher.value = 0;

                    }

                }

                route.params.token_id = selectedVoucher.value;

            },
            getImageUrl = function () {

                return collection.banner.replace(
                    "ipfs://",
                    "https://w3s.link/ipfs/"
                );

            },
            copyUrl = function () {

                navigator.clipboard.writeText(getUrl());

            },
            getUrl = function () {

                return `${process.env.VUE_APP_SERVER_URI}` + `mint/${collection.nft_address}`;

            },
            mintVoucher = async function () {

                const voucher = {
                    "id": vouchers[selectedVoucher.value].voucher.id,
                    "price": vouchers[selectedVoucher.value].voucher.price,
                    "uri": vouchers[selectedVoucher.value].voucher.uri,
                    "signature": vouchers[selectedVoucher.value].voucher.signature
                };

                await connectWallet();

                const amc = new web3.value.eth.Contract(
                        rareiumNFTABI,
                        collection.nft_address
                    ),
                    ptc = new web3.value.eth.Contract(
                        ERC20ABI,
                        payableToken.value
                    ),
                    vp = web3.value.utils.toWei(voucher.price.toString());

                // make sure we are on the correct chain
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
                let balance;
                if (payableToken.value == "0x0000000000000000000000000000000000001010") {

                    balance = await web3.value.eth.getBalance(wallet.value);

                } else {

                    balance = await ptc.methods.balanceOf(wallet.value).call();

                }
                balance = web3.value.utils.toWei(balance);

                // ensure the user has sufficient balance.
                if (web3.value.utils.toBN(balance).lt(web3.value.utils.toBN(vp))) {

                    showBalanceModal.value = true;
                    return;

                }

                let gasLimit = await amc.methods.lazyMint(
                    wallet.value,
                    voucher
                ).estimateGas(
                    {
                        "value": voucher.price,
                        "from": wallet.value
                    },
                    (error, estimatedGas) => {
                    }
                );

                gasLimit = gasLimit <= 50000
                    ? Math.floor(gasLimit * 3)
                    : Math.floor(gasLimit * 1.2);
                let gasPrice = await web3.value.eth.getGasPrice();
                gasPrice = Math.floor(gasPrice * 1.2);

                await amc.methods.lazyMint(
                    wallet.value,
                    voucher
                ).send({
                    "from": wallet.value,
                    "value": voucher.price,
                    "gasPrice": web3.value.utils.toHex(gasPrice),
                    gasLimit
                }).
                    then((jsonRpcResult) => {

                        console.log(jsonRpcResult);
                        if (jsonRpcResult.events.Transfer) {

                            tokenId.value = jsonRpcResult.events.Transfer.returnValues.tokenId;
                            if (tokenId.value) {

                                setVoucherMinted(
                                    tokenId.value,
                                    voucher.id
                                );
                                showSuccessModal.value = true;

                                return;

                            }

                        }
                        showFailedModal.value = true;

                    });

            },
            getVouchers = function () {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}getVouchers`,
                    {

                        "params": {

                            "nft_address": route.params.address

                        }

                    }
                ).
                    then((response) => {

                        vouchers.splice(0);
                        let firstUnminted;

                        for (let i = 0; i < response.data.length; i++) {

                            vouchers.push(response.data[i]);

                            if (response.data[i].voucher) {

                                if (firstUnminted === undefined && response.data[i].minted === false) {

                                    firstUnminted = i;

                                }

                                if (response.data[i].voucher.id == route.params.token_id) {

                                    selectedVoucher.value = i;

                                }

                            }

                        }

                        if (!route.params.token_id) {

                            const id = response.data[firstUnminted].voucher.id;
                            router.push({"path": `/mint/${route.params.address}/${id}/`}).catch((err) => {

                                console.error(err);

                            });
                            return;

                        }

                        if (!selectedVoucher.value) {

                            selectedVoucher.value = firstUnminted;

                        }

                    });

            },
            getLastMintID = function () {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}getLastMintID`,
                    {

                        "params": {

                            "nft_address": route.params.address

                        }

                    }
                ).
                    then((response) => {

                        if (response.status === 200) {

                            if (parseInt(response.data.id)) {

                                lastTokenId.value = response.data.id;

                            }

                        }

                    });

            },
            setVoucherMinted = function (token_id, voucher_id) {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}setVoucherMinted`,
                    {

                        "params": {

                            "nft_address": collection.nft_address,
                            "chain_id": collection.chain_id,
                            token_id,
                            voucher_id

                        }

                    }
                ).
                    then((response) => {

                        if (response.status === 200) {

                            /*
                             * TODO - delete, or keep
                             * xyz.splice(index,1);
                             */

                        }

                    }).
                    catch((error) => {

                        throw error;

                    });

            },
            getCollectionMedia = function (nft_address) {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}getCollectionMedia`,
                    {

                        "params": {

                            nft_address

                        }

                    }
                ).
                    then((response) => {

                        if (response.status === 200) {

                            xyz.splice(0);

                            for (const i in response.data) {

                                xyz.push(response.data[i]);

                            }

                        }

                    }).
                    catch((error) => {

                        throw error;

                    });

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
            gotoTab = function (t) {

                router.push({"path": `/${t}`,
                    "name": t});

            },
            closeToken = function () {

                router.go(0);

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

                        xyz.splice(0);
                        getCollectionMedia(response.data.nft_address);

                        collection.value = {};

                        // Object.assign(collection, response.data);
                        for (const key in response.data) {

                            collection[key] = response.data[key];

                        }

                        // grab the onchain data, this can be a fallback or for non platform collections
                        const grabOnChain = async () => {

                            const amc = new web3.value.eth.Contract(
                                rareiumNFTABI,
                                collection.nft_address
                            );
                            amc.methods.contractURI().call().
                                then((jsonRpcResult) => {

                                    if (jsonRpcResult) {

                                        const b64meta = JSON.parse(decodeURIComponent(escape(atob(jsonRpcResult.replace(
                                            /^data:\w+\/\w+;base64,/,
                                            ""
                                        )))));

                                        for (const key in b64meta) {

                                            if (b64meta[key]) {

                                                collection[key] = b64meta[key];

                                            }

                                        }

                                    }

                                });

                        };

                        if (collection.nft_address) {

                            if (collection.chain_id === serverConfig.chainId) {

                                grabOnChain();

                            }

                            updateView();

                        }

                    });

            },
            getIcon = function (i) {

                return icon.get(`${i}`);

            },
            updateView = function () {

                if (collection.banner) {

                    setTimeout(

                        () => {

                            const i = document.getElementById("collection-lazymint-image");

                            if (i) {

                                if (collection.image) {

                                    i.style.backgroundImage = `url(${
                                        collection.image.replace(
                                            "ipfs://",
                                            "https://w3s.link/ipfs/"
                                        )}`;

                                }

                            }

                            const b = document.getElementById("collection-lazymint-background");
                            if (b) {

                                if (collection.banner) {

                                    b.style.backgroundImage = `url(${
                                        collection.banner.replace(
                                            "ipfs://",
                                            "https://w3s.link/ipfs/"
                                        )}`;

                                }

                            }

                        },
                        300

                    );

                }

                setTimeout(

                    () => {

                        const c = document.getElementById("collection-lazymint-header");
                        if (c) {

                            if (collection.primary_color && collection.secondary_color) {

                                c.style.backgroundColor = "#00000080";
                                c.style.color = "#fff";

                                /*
                                 *c.style.color = collection.primary_color;
                                 *var alphaCol = addAlpha(collection.secondary_color, 0.5);
                                 *    c.style.backgroundColor = alphaCol;
                                 */

                            }

                            if (serverConfig.view == "mobile") {

                                c.style.width = "100%";

                            } else {

                                c.style.width = "100%";

                            }

                        }

                    },
                    100

                );

            },
            subscribeToMints = async function () {

                console.log("subscribe to events");

                const collectionAddress = web3.value.utils.toChecksumAddress(route.params.address);

                if (!collectionAddress) {

                    return;

                }

                const fromBlock = await web3.value.eth.getBlockNumber(),
                    amc = new web3.value.eth.Contract(
                        rareiumNFTABI,
                        collectionAddress
                    );

                // Replace 'Transfer' with the actual event name emitted during SafeMint
                console.log("collectionAddress");
                console.log(collectionAddress);
                console.log("fromBlock");
                console.log(fromBlock);
                console.log("wallet");
                console.log(wallet.value);

                const topic = web3.value.utils.sha3("Transfer(address,address,uint256)"),
                    topicAddress = web3.value.utils.padLeft(
                        wallet.value,
                        64
                    ),
                    filterOptions = {

                        "address": collectionAddress,
                        "topics": [
                            topic,
                            null,
                            topicAddress
                        ]

                    };
                console.log("filterOptions");
                console.log(filterOptions);

                web3.value.eth.subscribe(
                    "logs",
                    filterOptions
                ).
                    on(
                        "data",
                        (log) => {

                            // Handle the event data
                            const decodedData = web3.eth.abi.decodeLog(
                                [
                                    {"type": "address",
                                        "name": "from",
                                        "indexed": true},
                                    {"type": "address",
                                        "name": "to",
                                        "indexed": true},
                                    {"type": "uint256",
                                        "name": "tokenId",
                                        "indexed": true}
                                ],
                                log.data,
                                log.topics.slice(1)
                            );

                            console.log("Subscribe Hit");
                            console.log(`Token ID ${decodedData.tokenId} transferred from ${decodedData.from} to ${decodedData.to}`);

                        }
                    ).
                    on(
                        "error",
                        (error) => {

                            console.error(
                                "Error:",
                                error
                            );

                        }
                    );

            };

        onMounted(() => {

            getCollection(route.params.address);
            getVouchers();
            getLastMintID();

            markdownStyle.value = "a {\"color\": \"#eaeaea\"; \"text-decoration\": \"underline\";}, p {\"line-height\":\"20px\"}";

            watch(
                () => wallet.value,
                () => {

                    subscribeToMints();

                }
            );

            watch(
                () => selectedVoucher.value,
                () => {

                    console.log("watch selectedVoucher.value");
                    console.log(selectedVoucher.value);
                    nft.value = vouchers[selectedVoucher.value];

                }
            );

        });

        return {"localize": translation.localize,
            serverConfig,
            addAlpha,
            preview,
            tokens,
            tokenId,
            pages,
            pageTokens,
            setToken,
            subscribeToMints,
            getAccount,
            connectWallet,
            filterTokens,
            markdownStyle,
            expandDescription,
            getUrl,
            getVouchers,
            getLastMintID,
            lastTokenId,
            mintVoucher,
            copyUrl,
            getIcon,
            gotoTab,
            gotoToken,
            getImageUrl,
            getTokenURI,
            collection,
            nft,
            xyz,
            vouchers,
            selectedVoucher,
            setVoucherMinted,
            updateView,
            showShareModal,
            showSuccessModal,
            showFailedModal,
            showWalletModal,
            showBalanceModal,
            closeToken,
            getCollection,
            userInfo,
            eBus,
            "icon": icon.get};

    }
};

</script>
<style scoped>
svg.dashboard-svg-desktop {
  position: absolute;
  background: linear-gradient(188deg, #ffe070, #ee71ff);
  padding-top: 150px;
  left: 0;
}
svg.dashboard-svg-mobile {
  position: absolute;
  background: linear-gradient(188deg, #ffe070, #ee71ff);
  padding-top: 200px;
  left: 0;
}
#collection-lazymint-background {
  position: absolute;
  width: 100%;
  top: 0;
  bottom: 0;
  background-size: cover;
  -o-object-fit: cover;
  object-fit: cover;
  background-position: 50%;
  background-repeat: no-repeat;
  filter: blur(12px);
  transition: 2s -webkit-filter linear;
  z-index: -1;
}
#collection-lazymint-header {
  align-items: center;
  height: 100%;
  width: 50%;
  margin: 20px;
  border-radius: 20px;
  transition: all 1s;
}
#collection-lazymint-image {
  display: flex;
  flex-grow: 1;
  min-width: 150px;
  max-width: 300px;
  border-radius: 20px;
  background-size: cover;
  aspect-ratio: 2/1;
  -o-object-fit: cover;
  object-fit: cover;
  background-position: 50%;
  background-repeat: no-repeat;
}
.container {
  margin-top: -100px;
  text-align: left;
}
.asset-container {
  display: flex;
  flex-direction: column;
  margin: 20px;
  width: 100%;
}
.flex-row-wrap {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
.text-button {
  margin-top: 10px;
  font-size: 0.9em;
  color: black;
}
.text-button {
  text-decoration: underline;
  cursor: pointer;
}
.collection-pages {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: 50px;
}
.collection-page {
  width: 10px;
  height: 10px;
  margin: 20px;
  padding: 20px;
  font-size: 0.9em;
  font-weight: bold;
  color: #white;
  border: 1px solid #b967dd;
  color: #b967dd;
  border-radius: 50%;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  display: flex;
}
.collection-page:hover {
  border: 1px solid #b967dd;
  background-color: #b967dd;
  color: white;
}
.collection-header-contents {
  height: 100%;
  max-width: 1600px;
  margin-left: auto;
  margin-right: auto;
}
.collection-header-name {
  color: inherit;
  font-size: 2em;
  font-size: 4vw;
  -webkit-line-clamp: 3;
  display: -webkit-box;
  line-height: 1.4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
#collection-detail {
  color: white;
  padding: 40px;
  font-size: .9em;
  -webkit-line-clamp: 5;
  display: -webkit-box;
  margin-top: 10px;
  line-height: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all;
  transition-delay: 1s;
  cursor: pointer;
}
.padding-top {
  padding-top: 100px;
}
.lazy-mint-layout-desktop {
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: left;
  max-width: 1600px;
  margin-left: auto;
  margin-right: auto;
}
.lazy-mint-layout-mobile {
  display: flex;
  flex-direction: row-reverse;
  justify-content: center;
}
.lazy-mint-collection-button-mint {
  display: flex;
  align-items: center;
  border: 10px solid white;
  width: 50px;
  justify-content: center;
  font-family: Comfortaa,sans-serif;
  text-align: left;
  white-space: nowrap;
  color: #fff;
  font-size: 1.2em;
  height: 50px;
  font-weight: bold;
  padding-left: 20px;
  padding-right: 20px;
  border-radius: 30px;
  cursor: pointer;
  background: #00cbff;
}
.lazy-mint-collection-button-mint:hover {
  border: 10px solid #00cbff;
  background: white;
  color: #00cbff;
}
.lazy-mint-collection-button-minted {
  display: flex;
  align-items: center;
  border: 10px solid white;
  width: 50px;
  justify-content: center;
  font-family: Comfortaa,sans-serif;
  text-align: left;
  white-space: nowrap;
  color: #fff;
  font-size: 1.05em;
  height: 50px;
  font-weight: bold;
  padding-left: 20px;
  padding-right: 20px;
  border-radius: 30px;
  cursor: not-allowed;
  background: #ff9f00;
}
.lazy-mint-collection-button-minted:hover {
  border: 10px solid #ff9f00;
  background: white;
  color: #ff9f00;
}
.lazy-minted-button {
  display: flex;
  align-items: center;
  border: 10px solid white;
  justify-content: center;
  font-family: Comfortaa,sans-serif;
  text-align: left;
  white-space: nowrap;
  color: #fff;
  font-size: 1.05em;
  height: 50px;
  font-weight: bold;
  padding-left: 20px;
  padding-right: 20px;
  border-radius: 30px;
  cursor: pointer;
  background: #ff9f00;
}
.voucher-nav {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 20px;
}
.nav-button {
  display: flex;
  background: #00cbff;
  padding: 10px 20px;
  border-radius: 20px;
  color: white;
  box-shadow: 0px 5px 20px 0px rgb(110 94 136);
  cursor: pointer;
}
.mobile-pad {
  padding: 20px;
}
.token-minted {
  font-size: 1.2em;
}
.share-icon {
  display: block;
  margin: 20px;
  width: 48px;
  height: 32px;
  padding: 0;
  cursor: pointer;
  background-image: url('../assets/share-icon.png');
  background-size: contain;
  background-repeat: no-repeat;
}
.mobile-mint-container {
  padding: 10px;
  background: #ffffffcc;
  border-radius: 20px;
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
.regular-text {
  font-size: 1.0em;
  display: flex;
  margin-top: 10px;
  margin-right: 10px;
}
.symbol-text {
  font-size: 1.1em;
  display: flex;
  margin-top: 10px;
  margin-right: 10px;
}
.collection-description {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}
.lazymint-image-creative {
  width: 100%;
}
.mint-container {
  display: flex;
  flex-direction: column;
  margin: 20px;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  border-radius: 20px;
}
.flex-price {
  display: flex;
  flex-direction: row;
  font-weight: bold;
  font-size: 1.05em;
}
.token-info-box-item-symbol {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  font-size: 0.8em;
  border-bottom: 10px solid #e9dbff;
}
.mint-token-chain {
  margin: -15px 10px;
  padding: 10px 8px 8px 8px;
  width: 24px;
  height: 22px;
  border-radius: 50px;
  background-color: white;
}
.flex-row-wrap {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
.flex-row-center {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.hspace {
  width: 10px;
  height: 20px;
}
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from {
  transform: translateX(-200px);
  opacity: 0;
}
.slide-fade-leave-to {
  transform: translateX(200px);
  opacity: 0;
}
.token-mint-success {
  display: flex;
  flex-direction: column;
  padding: 20px;
  justify-content: center;
  align-items: center;
}
.lazymint-container {
  width: 100%;
  height: 100%;
  display: relative;
  min-height: 2500px;
}
</style>
