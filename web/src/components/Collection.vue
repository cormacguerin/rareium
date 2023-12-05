<template>
  <div>
    <Dashboard>
      <div id="collection-banner" />
      <div id="collection-header">
        <div class="collection-header-contents">
          <div
            id="collection-image"
          />
          <div id="collection-detail">
            <div
              v-if="collection.vue.name"
              class="collection-header-name"
            >
              {{ collection.vue.name }}
            </div>
            <div class="flex-row">
              <div
                v-if="collection.vue.symbol"
                class="symbol-text"
              >
                <b>/ {{ collection.vue.symbol }}</b>
              </div>
              <div
                v-if="collection.vue.creator_name"
                class="symbol-text"
                @click="gotoTab('collection.vue.creator_name.value')"
              >
                <b> @ {{ collection.vue.creator_name }}</b>
              </div>
            </div>
            <div>
              <Markdown
                v-if="collection.vue.description"
                :source="collection.vue.description"
                class="collection-description"
                @click="expandDescription"
              >
                <!-- {{ collection.vue.description }} -->
                &#x21A1
              </Markdown>
            </div>
          </div>
        </div>
      </div>
      <div class="collection-container">
        <div
          v-if="collection.vue.coming_soon"
          class="coming-soon"
        >
          <div class="coming-soon-header">
            {{ localize('TEXT_COMING_SOON_HEADER') }}
          </div>
          <div class="coming-soon-text">
            {{ localize('TEXT_COMING_SOON_TEXT') }}
          </div>
        </div>

        <div
          class="creator-subscript creator-edit share-icon"
          @click="openShareModal = true"
        />

        <div class="flex-row-wrap">
          <NFTCard
            v-for="(n,i) in pageTokens"
            :key="n.token_id"
            :address="collection.vue.nft_address"
            :symbol="collection.vue.symbol"
            :owner="n.owner"
            :price="n.price"
            :metadata="n.metadata"
            :metadata_url="n.token_uri"
            :token_id="n.token_id"
            :chain_id="n.chain_id"
            @reload-token="getTokensByCollectionAddress(nftAddress)"
          />
        </div>

        <div
          class="collection-pages"
        >
          <div
            v-for="i in pages"
            class="collection-page"
            @click="loadPage(i)"
          >
            {{ i }}
          </div>
        </div>

        <CModal
          v-if="showNFTModal"
          color="#f9b115"
          title="Please Wait"
          width="medium"
          @close="showNFTModal = false"
        >
          <template #header>
            <div> Load NFT Collection </div>
          </template>
          <template #body>
            <div v-for="c,i in contracts">
              <div
                @click="gotoContract(c,i)"
              >
                {{ c }}
              </div>
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
                    :title="collection.vue.name"
                    :media="getImageUrl()"
                    :description="collection.vue.description"
                  />
                </div>

                <div
                  class="sn-weibo-icon"
                >
                  <ShareNetwork
                    class="sn-block"
                    network="weibo"
                    :url="getUrl()"
                    :title="collection.vue.name"
                    :media="getImageUrl()"
                    :description="collection.vue.description"
                  />
                </div>

                <div
                  class="sn-facebook-icon"
                >
                  <ShareNetwork
                    class="sn-block"
                    network="facebook"
                    :url="getUrl()"
                    :title="collection.vue.name"
                    :media="getImageUrl()"
                    :description="collection.vue.description"
                  />
                </div>

                <div
                  class="sn-linkedin-icon"
                >
                  <ShareNetwork
                    class="sn-block"
                    network="linkedin"
                    :url="getUrl()"
                    :title="collection.vue.name"
                    :media="getImageUrl()"
                    :description="collection.vue.description"
                  />
                </div>

                <div
                  class="sn-reddit-icon"
                >
                  <ShareNetwork
                    class="sn-block"
                    network="reddit"
                    :url="getUrl()"
                    :title="collection.vue.name"
                    :media="getImageUrl()"
                    :description="collection.vue.description"
                  />
                </div>

                <div
                  class="sn-twitter-icon"
                >
                  <ShareNetwork
                    class="sn-block"
                    network="Twitter"
                    :url="getUrl()"
                    :title="collection.vue.name"
                    :media="getImageUrl()"
                    :description="collection.vue.description"
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
import {rareiumMarketplaceABI, rareiumNFTABI, rareiumPlatformABI} from "../abi.js";

export default {
    "name": "Collection",
    "components": {
        Markdown
    },
    "props": {
        "preview": {
            "type": Boolean,
            "default": true
        },
        "refresh": Number,
        "nftAddress": String
    },
    setup (props) {

        const translation = translationStore(),
            serverConfig = inject("serverConfig"),
            route = inject("route"),
            router = inject("router"),
            icon = iconStore(),
            web3 = inject("web3"),
            nftAddress = ref(props.nftAddrress),
            preview = ref(props.preview),
            pages = ref(1),
            tokens = reactive([]),
            pageTokens = reactive([]),
            filterTokens = reactive([]),
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
            selectedNFT = ref(0),
            collection = reactive({"vue": {
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
            }}),
            showLoadModal = ref(false),
            openShareModal = ref(false),
            showNFTModal = ref(false),
            nfts = reactive([]),
            loadPage = function (p) {

                pageTokens.splice(0);
                for (let i = (p - 1) * 16; i < p * 16; i++) {

                    if (i < filterTokens.length) {

                        pageTokens.push(filterTokens[i]);

                    }

                }

            },
            expandDescription = function () {

                const i = document.getElementById("collection-detail");
                console.log(i.style);
                console.log(i.style["-webkit-line-clamp"]);
                if (i.style["-webkit-line-clamp"] === 5) {

                    i.style["-webkit-line-clamp"] = "unset";

                } else {

                    i.style["-webkit-line-clamp"] = 5;

                }

            },
            getImageUrl = function () {

                return collection.vue.banner.replace(
                    "ipfs://",
                    "https://w3s.link/ipfs/"
                );

            },
            copyUrl = function () {

                navigator.clipboard.writeText(getUrl());

            },
            getUrl = function () {

                return `${process.env.VUE_APP_SERVER_URI}` + `collection/${collection.vue.nft_address}`;

            },
            getTokensByCollectionAddress = function (address) {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}getTokensByCollectionAddress`,
                    {

                        "params": {

                            address

                        }

                    }
                ).
                    then((response) => {

                        tokens.splice(0);
                        pageTokens.splice(0);
                        filterTokens.splice(0);

                        for (let i = 0; i < response.data.length; i++) {

                            if (response.data[i].metadata) {

                                filterTokens.push(response.data[i]);

                            } else {

                                continue;

                            }

                            pages.value = parseInt((filterTokens.length - 1) / 16) + 1;

                            if (filterTokens.length < 17) {

                                pageTokens.push(response.data[i]);

                            }

                            pageTokens.sort((a, b) => a.token_id - b.token_id);

                            // REMOVE THE BELOW, WE ONLY READ BLOCKCHAIN ON VISIBLE CARDS NOW
                            /*
                             *getTokenURI(address, response.data[i].token_id, response.data[i].owner, (token_id, owner, uri) => {
                             *
                             *    uri = uri.replace('ipfs://','https://w3s.link/ipfs/')
                             *    Axios.get(
                             *        uri,
                             *        {
                             *
                             *            "params": {
                             *
                             *            }
                             *
                             *        }
                             *    ).
                             *    then((tokenData) => {
                             *
                             *        tokenData.token_id = token_id;
                             *        tokenData.owner = owner;
                             *        tokens.push(tokenData);
                             *
                             *        // doFilter
                             *        filterTokens.push(tokenData)
                             *
                             *        pages.value = parseInt((filterTokens.length-1) / 16) + 1;
                             *
                             *        if (filterTokens.length < 16) {
                             *
                             *            pageTokens.push(tokenData);
                             *
                             *        }
                             *
                             *    }).
                             *    catch((error) => {
                             *
                             *        throw error;
                             *
                             *    });
                             *
                             *})
                             */

                        }

                    });

            },
            mintCollectionMedia = function (id, index) {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}mintCollectionMedia`,
                    {

                        "params": {

                            id,
                            "nft_address": collection.vue.nft_address

                        }

                    }
                ).
                    then((response) => {

                        getTokensByCollectionAddress(nftAddress.value);

                        if (response.status === 200) {

                            /*
                             * TODO - delete, or keep
                             * nfts.splice(index,1);
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

                            nfts.splice(0);

                            for (const i in response.data) {

                                nfts.push(response.data[i]);

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

            /*
             *fetchMyNFTs = async function () {
             *
             *      //  const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
             *    const accounts = await web3.value.eth.requestAccounts();
             *    const addr = accounts[0];
             *    const amc = new web3.value.eth.Contract(rareiumPlatformABI, `${serverConfig.VUE_APP_PLATFORM_ADDRESS}`);
             *    amc.methods.fetchMyNFTs().call({'from': addr}).then((jsonRpcResult) => {
             *
             *     //       contracts.value = [];
             *            for (var i in jsonRpcResult) {
             *     //           contracts.push(jsonRpcResult[i]);
             *            }
             *
             *        });
             *
             *
             *},
             */
            // create collection on-chain
            selectCard = function (i) {

                selectedNFT.value = i;
                autoSave(i);

            },
            mintToken = function (id, index) {

                mintCollectionMedia(
                    id,
                    index
                );

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

                        nfts.splice(0);
                        getCollectionMedia(response.data.nft_address);

                        collection.vue.value = {};

                        // Object.assign(collection, response.data);
                        for (const key in response.data) {

                            collection.vue[key] = response.data[key];

                        }

                        // grab the onchain data, this can be a fallback or for non shinovi collections
                        const grabOnChain = async () => {

                            const amc = new web3.value.eth.Contract(
                                rareiumNFTABI,
                                collection.vue.nft_address
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

                                                collection.vue[key] = b64meta[key];

                                            }

                                        }

                                    }

                                });

                        };

                        if (collection.vue.nft_address) {

                            if (collection.vue.chain_id === serverConfig.chainId) {

                                grabOnChain();

                            }

                            updateView();

                        }

                    });

            },
            updateView = function () {

                if (collection.vue.banner) {

                    setTimeout(

                        () => {

                            const i = document.getElementById("collection-image");

                            if (i) {

                                if (collection.vue.image) {

                                    i.style.backgroundImage = `url(${
                                        collection.vue.image.replace(
                                            "ipfs://",
                                            "https://w3s.link/ipfs/"
                                        )}`;

                                }

                            }

                            const b = document.getElementById("collection-banner");
                            if (b) {

                                if (collection.vue.banner) {

                                    b.style.backgroundImage = `url(${
                                        collection.vue.banner.replace(
                                            "ipfs://",
                                            "https://w3s.link/ipfs/"
                                        )}`;

                                }

                            }

                        },
                        300

                    );

                }

                if (collection.vue.secondary_color) {

                    setTimeout(

                        () => {

                            const c = document.getElementById("collection-header");
                            if (c) {

                                c.style.backgroundColor = collection.vue.secondary_color;

                            }

                        },
                        300

                    );

                }

                if (collection.vue.primary_color) {

                    setTimeout(

                        () => {

                            const c = document.getElementById("collection-header");
                            if (c) {

                                c.style.color = collection.vue.primary_color;

                            }

                        },
                        300

                    );

                }

                /*
                 *if (serverConfig.view === "desktop") {
                 *
                 *    collectionHeaderClass.value = "collection-header-desktop";
                 *
                 *} else if (serverConfig.view === "tablet") {
                 *
                 *    collectionHeaderClass.value = "collection-header-laptop";
                 *
                 *} else {
                 *
                 *    collectionHeaderClass.value = "collection-header-mobile";
                 *
                 *}
                 *
                 *inUpdateView.value = false;
                 */

            };

        onMounted(() => {

            if (route.params.address) {

                nftAddress.value = route.params.address;

            }

            getCollection(nftAddress.value);
            getTokensByCollectionAddress(nftAddress.value);

            watch(
                () => route.name,
                () => {

                    // updateView();

                }
            );

            watch(
                () => serverConfig.view,
                () => {

                    // updateView();

                }
            );

            /*
             *watch(
             *    () => selectedNFT,
             *    () => {
             *
             *        console.log("watch");
             *        console.log(selectedNFT.value);
             *
             *    }
             *);
             */
            watch(
                () => props.refresh,
                () => {

                    for (let i = 0; i < 3; i++) {

                        setTimeout(
                            () => {

                                getTokensByCollectionAddress(nftAddress.value);

                            },
                            i * 1000 + 1000 ^ 2
                        );

                    }

                }

            );

        });

        return {"localize": translation.localize,
            serverConfig,
            nftAddress,
            preview,
            tokens,
            loadPage,
            pages,
            pageTokens,
            filterTokens,
            expandDescription,
            getUrl,
            copyUrl,
            gotoTab,
            getImageUrl,
            getTokenURI,
            getTokensByCollectionAddress,
            collection,
            nfts,
            mintToken,
            mintCollectionMedia,
            updateView,
            selectCard,
            selectedNFT,
            showNFTModal,
            showLoadModal,
            openShareModal,

            /*
             * fetchMyNFTs,
             * fetchNFTData,
             */
            getCollection,
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
h2.nft-collection {
  margin: 100px 10px;
  text-align: left;
  font-size: 2em;
  font-weight: 700;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}
#collection-banner {
  height: 90%;
  height: calc(100vh - 300px);
  width: 100%;
  background-size: cover;
  aspect-ratio: 2/1;
  -o-object-fit: cover;
  object-fit: cover;
  background-position: 50%;
  background-repeat: no-repeat;
}
#collection-header {
  align-items: center;
  height: 100%;
  padding: 20px;
}
#collection-image {
  display: flex;
  flex-grow: 1;
  min-width: 200px;
  max-width: 200px;
  border-radius: 20px;
  background-size: cover;
  aspect-ratio: 1/1;
  -o-object-fit: cover;
  object-fit: cover;
  background-position: 50%;
  background-repeat: no-repeat;
}
.container {
  margin-top: -100px;
  text-align: left;
}
.collection-container {
  display: flex;
  flex-direction: column;
  padding: 20px;
}
.flex-row-wrap {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
}
.coming-soon {
  margin-left: auto;
  margin-right: auto;
  max-width: 800px;
  margin-top: 50px;
  padding: 50px;
  border-radius: 50px;
  color: black;
  border: 3px solid #dfdfdf;
}
.coming-soon-header {
  font-size: 2em;
}
.coming-soon-text {
  margin-top: 10px;
  font-size: 0.8em;
  color: black;
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
  display: flex;
  align-items: center;
  max-width: 1600px;
  margin-left: auto;
  margin-right: auto;
}
.collection-header-name {
  color: inherit;
  font-size: 2em;
  font-size: 6vw;
  -webkit-line-clamp: 3;
  display: -webkit-box;
  line-height: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
#collection-detail {
  padding-left: 20px;
  padding-right: 20px;
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
.symbol-text {
  margin-top: 10px;
  margin-right: 10px;
}
.collection-description {
  line-height: 25px;
  margin-top: 10px;
}
</style>
