<template>
  <div id="vue-app">
    <!-- Header & Navbar -->
    <div
      class="app-flex"
    >
      <div
        id="header"
        class="header-white"
      >
        <div
          id="navbar-background"
          :class="navbarBackgroundClass"
        />
        <div
          class="navbar"
          justify="start"
        >
          <div
            id="Nav"
          >
            <div
              class="top-bar-flex"
            >
<!--
              <CSearchBar
                :class="navbarSearchDesktop"
                @inputValue="query = $event"
              >
                <template #results>
                  <div class="query-response-container">
                    <div
                      v-for="i in queryCollections"
                      class="query-response-line"
                    >
                      <transition
                        name="lineitem"
                        appear
                      >
                        <div
                          class="query-result"
                          @click="gotoPath('collection/' + i.nft_address)"
                        >
                          / {{ i.symbol }} - {{ i.name }}
                        </div>
                      </transition>
                    </div>
                    <div
                      v-for="i in queryCreators"
                      class="query-response-line"
                    >
                      <transition
                        name="lineitem"
                        appear
                      >
                        <div
                          class="query-result"
                          @click="gotoPath(i.name + '/')"
                        >
                          + {{ i.name }} - {{ i.title }}
                        </div>
                      </transition>
                    </div>
                  </div>
                </template>
              </CSearchBar>
                <div
                  class="nav-icon"
                  v-html="getIcon('MESSAGES')"
                />
                <div
                  class="nav-icon"
                  v-html="getIcon('ALERTS')"
                />
                <div
                  class="nav-tab chain-icon-container"
                >
                  <div
                    class="nav-icon chain-icon"
                    @click="showChainModal = true"
                    v-html="getIcon(chains[activeChain].icon)"
                  />
                  <div
                    class="nav-menu-container-chains"
                  >
                    <div
                      class="nav-menu"
                    >
                      <div
                        v-for="i in chains"
                      >
                        <div
                          v-if="i.active === false"
                          class="nav-circle-icon"
                          @click="switchChain(i.id)"
                          v-html="getIconRaw(i.icon)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
-->

              <div
                class="flex-row"
              >
                <div
                  v-if="userInfo.authorized == false"
                  class="nav-tab"
                >

                  <div
                    class="svg-logo"
                    v-html="getIcon('RAREIUM_LOGO')"
                  />
                  <Burger />
                  <div
                    :class="plainText + ' ' + plainTextStyle"
                  >
                    <div class="menu-items">
                      <div class="menu-item">
                        Login
                      </div>
                      <div class="menu-item">
                        Metals
                      </div>
                      <div class="menu-item">
                        About
                      </div>
                    </div>
                  </div>

                  <div class="nav-menu-container-profile">
                    <div class="nav-menu-ten">
                      <div
                        class="nav-item"
                      >
                        {{ localize('TEXT_CONNECT') }}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  v-if="userInfo.authorized == true"
                  class="nav-tab"
                >
 
                  <div
                    class="svg-logo"
                    v-html="getIcon('RAREIUM_LOGO')"
                  />
                  <Burger />
                  <div
                    :class="plainText + ' ' + plainTextStyle"
                  >
                    <div class="menu-items">
                      <div class="menu-item">
                        Login
                      </div>
                      <div class="menu-item">
                        Metals
                      </div>
                      <div class="menu-item">
                        About
                      </div>
                    </div>
                  </div>

                  <div
                    class="profile-icon-authorized"
                    @click="gotoTab('profile')"
                  />
                  <div class="nav-menu-container-profile">
                    <div class="nav-arrow-container">
                      <div class="nav-arrow-right" />
                    </div>
                    <div class="nav-menu-ten">
                      <div
                        class="nav-item"
                        @click="gotoTab('profile')"
                      >
                        {{ localize('TEXT_PROFILE') }}
                      </div>
                      <div
                        class="nav-item"
                        @click="showEmailModal = true"
                      >
                        {{ localize('APP_SET_EMAIL') }}
                      </div>
                      <div
                        class="nav-item"
                        @click="showWallet"
                      >
                        {{ localize('TEXT_WALLET') }}
                      </div>
                      <div
                        class="nav-item"
                        @click="doLogout"
                      >
                        {{ localize('TEXT_LOGOUT') }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!--
        Magic Link
      -->
      <Magic
        :magic-clicks="magicClicks"
        @do-magic-auth="doMagicAuth"
        @request-accounts="requestAccounts"
      />

      <!-- Sidebar and Pages -->

      <div class="app-container">
        <Sidebar class="sidebar">
          <template #mobile>
            <div class="sidebar-panel-nav">
              <div>
                <div
                  class="nav-tab-no-mobile"
                  @click="gotoTab('home')"
                >
                  {{ localize('TEXT_HOME') }}
                </div>
              </div>
              <div
                v-if="userInfo.authorized == false"
              >
                <div
                  class="nav-tab-no-mobile"
                  @click="showLoginModal = true"
                >
                  {{ localize('TEXT_CONNECT') }}
                </div>
              </div>
              <div
                v-if="userInfo.authorized == true"
              >
                <div
                  class="nav-tab-no-mobile"
                  @click="doLogout"
                >
                  {{ localize('TEXT_LOGOUT') }}
                </div>
              </div>
            </div>
            <div
              class="social-mobile"
            >
              <div
                class="discord"
                @click="gotoUrl('https://discord.gg/z62K7TqNvF')"
              />
              <div
                class="twitter"
                @click="gotoUrl('https://twitter.com/equitydao')"
              />
            </div>
          </template>
          <template #desktop-compact>
            <div class="desktop-compact">
              <div
                class="compact-icon"
                v-html="icon('MARKETPLACE')"
              />
              <div
                class="compact-icon"
                v-html="icon('NEWS_FEED')"
              />
              <div
                class="compact-icon"
                v-html="icon('TRENDING')"
              />
              <div
                class="compact-icon"
                v-html="icon('FOLLOWING')"
              />
            </div>
          </template>
          <template #desktop-expand>
            <div class="desktop-expand">
              <div class="flex-row desktop-expand-item">
                <div
                  class="expand-icon"
                  v-html="icon('MARKETPLACE_SMALL')"
                />
                <div class="expand-text-title">
                  <b>NFT Marketplace </b>
                </div>
              </div>
              <div class="flex-row desktop-expand-item">
                <div
                  class="expand-icon"
                  v-html="icon('NEWS_FEED_SMALL')"
                />
                <div class="expand-text">
                  News Feeds
                </div>
              </div>
              <div class="flex-row desktop-expand-item">
                <div
                  class="expand-icon"
                  v-html="icon('TRENDING_SMALL')"
                />
                <div class="expand-text">
                  Trending
                </div>
              </div>
              <div class="flex-row desktop-expand-item">
                <div
                  class="expand-icon"
                  v-html="icon('FOLLOWING_SMALL')"
                />
                <div class="expand-text">
                  Following
                </div>
              </div>
            </div>
          </template>
        </Sidebar>
        <div :class="contentClass">
          <router-view v-slot="{Component}">
            <transition
              name="route"
              mode="out-in"
            >
              <component
                :is="Component"
                :key="$route.path"
              />
            </transition>
          </router-view>
        </div>
      </div>
      <SVFooter
        class="app-footer"
      />
    </div>

    <!-- Footer -->

    <!-- Signup Modal -->

    <CModal
      v-if="showChainModal"
      color="#5d328d"
      width="small"
      @close="showChainModal = false"
    >
      <template #header>
        <div> {{ localize("TEXT_CHANGE_CHAIN") }} </div>
      </template>
      <template #body>
        <div class="change-chain-modal">
          <div
            v-for="i in chains"
          >
            <div
              class="change-chain-modal-icon"
              @click="switchChain(i.id)"
              v-html="getIcon(i.icon)"
            />
          </div>
        </div>
      </template>
      <template #footer>
        <div class="hidden" />
      </template>
    </CModal>

    <CModal
      v-if="showEmailModal"
      color="#5d328d"
      width="small"
      @close="showEmailModal = false"
    >
      <template #header>
        <div> {{ localize("APP_SET_EMAIL") }} </div>
      </template>
      <template #body>
        <div class="flex-col">
          <CInput
            class="margin-top"
            :value="email"
            :title="localize('APP_SET_EMAIL')"
            :placeholder="localize('APP_SET_EMAIL_PLACEHOLDER')"
            @inputValue="email = $event"
          />
          <div>
            {{ localize('APP_SET_EMAIL_TEXT') }}
          </div>
          <div
            class="submit-button"
            @click="setEmail"
          >
            {{ localize('TEXT_SUBMIT') }}
          </div>
        </div>
      </template>
      <template #footer>
        <div class="hidden" />
      </template>
    </CModal>

    <CModal
      v-if="showLoginModal"
      color="#5d328d"
      width="small"
      @close="showLoginModal = false"
    >
      <template #header>
        <div> Sign Up </div>
      </template>
      <template #body>
        <div class="flex-col">
          <div class="connect-text">
            {{ localize('LOGIN_CONNECT_WALLET') }}
          </div>
          <div class="flex-col connect-wallets">
            <div
              class="connect-img-container"
              @click="metamaskLogin"
            >
              <img
                class="connect-img"
                src="./assets/metamask-small.png"
              >
              <div
                :class="walletText"
              >
                MetaMask
              </div>
            </div>
            <div
              class="connect-img-container"
              @click="magicClicks.login++"
            >
              <img
                class="connect-img"
                src="./assets/magiclink.png"
              >
              <div :class="walletText">
                MagicConnect
              </div>
            </div>
            <div
              class="connect-img-container"
              @click="walletConnect"
            >
              <img
                class="connect-img"
                src="./assets/wallet-connect-small.png"
              >
              <div :class="walletText">
                WalletConnect
              </div>
            </div>
            <div class="wallet-advice">
              <b>{{ localize('WALLET_UNSURE') }}</b>
              <br>
              <br>
              {{ localize('WALLET_ADVICE') }}
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="hidden" />
      </template>
    </CModal>

<!--
    <transition
      name="route"
      mode="out-in"
    >
      <div
        :class="helperVideoContainer"
      >
        <div
          :class="closeVideoHelper"
          @click="closeVideo()"
        >
          x
        </div>
        <video
          :class="videoHelper"
          loop="true"
          src="../public/rareiumExp.mp4"
          :controls="videoControls"
          @click="maxHelperVideo()"
        />
      </div>
    </transition>
-->
  </div>
</template>

<script>
import {inject, nextTick, onBeforeMount, onBeforeUnmount, onMounted, reactive, ref, toRefs, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import Axios from "axios";
import Burger from "./components/Burger.vue";
import Magic from "./components/Magic.vue";
import SVFooter from "./components/SVFooter.vue";
import Sidebar from "./components/Sidebar.vue";
import {iconStore} from "@/stores/icon";
import {mutations} from "@/stores/sidebar.js";
import {translationStore} from "@/stores/translation";

export default {
    "name": "App",
    // conflict between vue ordering and alphavetic ordering
    // eslint-disable-next-line
    components: {
        Burger,
        Sidebar,
        SVFooter,
        Magic
    },
    // eslint-disable-next-line
    setup (_, {emit}) {

        const eBus = inject("eBus"),
            contentClass = ref(""),
            emitAppEvent = (e, d) => {

                eBus.emit(
                    "app-event",
                    {
                        "action": e,
                        "data": d
                    }
                );

            },
            chains = reactive([]),
            query = ref(""),
            email = ref(""),
            doQuery = ref(false),
            queryInFlight = ref(false),
            queryCollections = ref([]),
            queryCreators = ref([]),
            magicClicks = reactive({
                "wallet": 0,
                "connect": 0,
                "login": 0,
                "logout": 0
            }),
            // TODO : make dynamic from database
            categories = reactive([
                {
                    "title": "TEXT_ART",
                    "url": "https://www.rareium.io/art"
                },
                {
                    "title": "TEXT_V_TUBER",
                    "url": "https://www.rareium.io/vtuber"
                },
                {
                    "title": "TEXT_MANGA",
                    "url": "https://www.rareium.io/manga"
                },
                {
                    "title": "TEXT_ANIME",
                    "url": "https://www.rareium.io/animme"
                },
                {
                    "title": "TEXT_GOTOCHI",
                    "url": "https://www.rareium.io/gotochi"
                },
                {
                    "title": "TEXT_GAMING",
                    "url": "https://www.rareium.io/gaming"
                },
                {
                    "title": "TEXT_IDOL",
                    "url": "https://www.rareium.io/"
                }
            ]),
            activeChain = ref(0),
            showChainModal = ref(false),
            ethereum = window.ethereum,
            plainText = ref("explore-text-on"),
            plainTextStyle = ref("plain-text-light"),
            exploreText = ref("explore-text-on"),
            exploreTextStyle = ref("plain-text-light"),
            icon = iconStore(),
            isWalletConnected = ref(false),
            lastScrollPosition = ref(0),
            navbarSearchDesktop = ref("navbar-search-container"),
            navbarBackgroundClass = ref("navbar-background-tall"),
            provider = inject("provider"),
            route = useRoute(),
            router = useRouter(),
            serverConfig = toRefs(inject("serverConfig")),
            showLoginModal = ref(false),
            showEmailModal = ref(false),
            translation = translationStore(),
            userInfo = inject("userInfo"),
            walletText = ref("wallet-text-desktop"),
            helperVideoContainer = ref("helper-video-container"),
            videoHelper = ref("video-helper"),
            closeVideoHelper = ref("close-video"),
            videoControls = ref(false),
            web3 = inject("web3"),
            setEmail = async function () {

                Axios.get(

                    `${process.env.VUE_APP_SERVER_URI}setEmail`,
                    {

                        "params": {

                            email

                        }

                    }

                ).
                    then((response) => {

                        if (response.status === 200) {

                            showEmailModal.value = false;

                        }

                    }).
                    catch((error) => {

                        throw error;

                    });

            },
            showWallet = async function () {

                const selectedProvider = localStorage.getItem("selectedProvider");

                if (selectedProvider === "magic") {

                    magicClicks.wallet++;

                }

                if (
                    (selectedProvider === "metamask" || selectedProvider === "walletconnect") &&
                    window.ethereum) {

                    try {

                        await window.ethereum.request({
                            "method": "eth_requestAccounts"
                        });

                    } catch (error) {

                        console.error(error);

                    }

                }

            },
            switchChain = function (id) {

                showChainModal.value = false;
                emitAppEvent(
                    "setNetwork",
                    id
                );

            },
            // Plain JS functions
            signInAccount = function (signature, account) {

                let ep = "signIn";
                if (userInfo.authorized === true) {

                    ep = "addAccount";

                }

                Axios.get(

                    process.env.VUE_APP_SERVER_URI + ep,
                    {
                        "params": {
                            account,
                            signature
                        }
                    }

                ).
                    then((response) => {

                        if (response.status === 200) {

                            isWalletConnected.value = true;
                            showLoginModal.value = false;
                            emitAppEvent("getUserInfo");

                        }

                    }).
                    catch((error) => {

                        throw error;

                    });

            },
            metamaskLogin = function () {

                localStorage.setItem(
                    "selectedProvider",
                    "metamask"
                );

                emitAppEvent(
                    "getWeb3",
                    serverConfig.value
                );
                if (web3.value) {

                    requestAccounts();

                }

            },
            loadCreatorPage = function () {

                Axios.get(

                    `${process.env.VUE_APP_SERVER_URI}getCreatorNameById`,
                    {
                        "params": {
                        }
                    }
                ).
                    then((response) => {

                        if (response.status === 200) {

                            if (response.data) {

                                router.push({"path": `/${response.data.name}/`}).catch((err) => {

                                    console.error(err);

                                });

                            } else {

                                gotoTab("creator-sign-up");

                            }

                        }

                    }).
                    catch((error) => {

                        throw error;

                    });

            },
            updateAccount = async function (accounts) {

                const selectedProvider = localStorage.getItem("selectedProvider");

                console.log('selectedProvider')
                console.log(selectedProvider)
                console.log(accounts.length)
                console.log(accounts[0])
                console.log('userInfo.engagement')
                console.log(userInfo.engagement)
                console.log('web3.value.utils.utf8ToHex(userInfo.engagement)')
                console.log(web3.value.utils.utf8ToHex(userInfo.engagement))

                if (accounts.length > 0) {

                    await web3.value.eth.personal.sign(
                        web3.value.utils.utf8ToHex(userInfo.engagement),
                        accounts[0],
                        ""
                    ).then((signature) => {

                        signInAccount(
                            signature,
                            accounts[0]
                        );

                    });

                } else if (selectedProvider === "metamask") {

                    window.location.href = "https://metamask.app.link/dapp/www.rareium.io/";

                }

            },
            doMagicAuth = function (v) {

                emitAppEvent(
                    "setWeb3",
                    v
                );

            },
            doLogout = function () {

                magicClicks.logout++;

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}/logout`,
                    {
                    }
                ).
                    then((response) => {

                        if (response.data) {

                            isWalletConnected.value = false;
                            emitAppEvent("getUserInfo");

                        }

                    });

            },
            getIcon = function (i) {

                if (serverConfig.visualMode.value === "dark") {

                    return icon.get(`${i}_DARK`);

                }
                return icon.get(`${i}_LIGHT`);

            },
            getIconRaw = function (i) {

                return icon.get(`${i}`);


            },
            gotoTab = function (t) {

                if (t === "home" && serverConfig.view.value === "mobile") {

                    mutations.toggleMobileNav();

                }
                router.push({"name": t,
                    "path": `/${t}`}).catch((err) => {

                    throw err;

                });

            },
            gotoPath = function (t) {

                query.value = "";

                router.push({"path": `/${t}`}).catch((err) => {

                    throw err;

                });

            },
            requestAccounts = async function () {

                const selectedProvider = localStorage.getItem("selectedProvider");

                if (
                    (selectedProvider === "metamask" ||
                  selectedProvider === "walletconnect") && window.ethereum) {

                    await window.ethereum.request({"method": "eth_requestAccounts"}).
                        then(updateAccount).
                        catch((err) => {

                            if (err.code === 4001) {

                                /*
                                 * EIP-1193 userRejectedRequest error
                                 * If this happens, the user rejected the connection request.
                                 */

                            } else {

                                throw err;

                            }

                        });

                } else {

                    getAccounts(updateAccount);

                }

            },
            getAccounts = function (callback) {

                if (!web3.value.eth) {

                    return;

                }

                web3.value.eth.getAccounts().
                    then(callback).
                    catch((err) => {

                        if (err.code === 4001) {

                            /*
                             * EIP-1193 userRejectedRequest error
                             * If this happens, the user rejected the connection request.
                             */

                        } else {

                            throw err;

                        }

                    });

            },
            gotoCreate = function () {

                if (userInfo.authorized === true && userInfo.creator === true) {

                    loadCreatorPage();


                } else {

                    gotoTab("creator-sign-up");


                }

            },
            gotoUrl = function (url) {

                window.location = url;

            },
            handleScroll = function () {

                const n = document.getElementById("navbar-background"),
                    h = document.getElementById("header"),
                    s = window.scrollY;
                if (s > lastScrollPosition.value && s > 100) {

                    // we are scrolling down.
                    h.style.top = "-10px";
                    navbarBackgroundClass.value = "navbar-background-short";

                } else {

                    // we are scrolling up.
                    h.style.top = "0px";
                    navbarBackgroundClass.value = "navbar-background-tall";

                }
                if (s < 100) {

                    n.style.backgroundColor = "rgb(255 255 255 / 0%)";
                    serverConfig.visualMode.value = "light";
                    exploreTextStyle.value = "explore-text-light";
                    plainTextStyle.value = "plain-text-light";

                } else {

                    n.style.backgroundColor = "#000000bf";
                    serverConfig.visualMode.value = "dark";
                    exploreTextStyle.value = "explore-text-dark";
                    plainTextStyle.value = "plain-text-dark";

                }
                lastScrollPosition.value = s;

            },
            hideModalEvent = function () {

                showLoginModal.value = false;

            },
            runQuery = function () {

                queryInFlight.value = true;

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}query`,
                    {

                        "params": {

                            "query": query.value

                        }

                    }
                ).
                    then((response) => {

                        queryCollections.value.splice(0);
                        queryCreators.value.splice(0);
                        queryInFlight.value = false;

                        for (var i in response.data.collections) {

                            queryCollections.value.push(response.data.collections[i]);

                        }

                        for (var i in response.data.creators) {

                            queryCreators.value.push(response.data.creators[i]);

                        }

                        if (doQuery.value === true) {

                            doQuery.value = false;
                            runQuery();

                        }

                    });

            },
            updateView = function () {

                /*
                 * general layout
                 * const m = document.getElementById('mobileNav')
                 * const d = document.getElementById('desktopNav')
                 */
                if (serverConfig.view.value === "desktop") {

                    // console.log("desktop");
                    /*
                     * m.style.display = 'none'
                     * d.style.display = 'initial'
                     */
                    contentClass.value = "desktop-content";
                    exploreText.value = "explore-text-on";
                    plainText.value = "plain-text-on";
                    walletText.value = "wallet-text-desktop";
                    navbarSearchDesktop.value = "navbar-search-container";

                } else if (serverConfig.view.value === "laptop") {

                    // console.log("laptop");
                    contentClass.value = "desktop-content";
                    exploreText.value = "explore-text-on";
                    plainText.value = "plain-text-on";
                    walletText.value = "wallet-text-desktop";
                    navbarSearchDesktop.value = "navbar-search-container";

                } else if (serverConfig.view.value === "tablet") {

                    // console.log("tablet");
                    contentClass.value = "mobile-content";
                    exploreText.value = "explore-text-on";
                    plainText.value = "plain-text-on";
                    walletText.value = "wallet-text-desktop";
                    navbarSearchDesktop.value = "navbar-search-container";

                } else if (serverConfig.view.value === "mobile") {

                    // console.log("mobile");
                    contentClass.value = "mobile-content";
                    exploreText.value = "explore-text-off";
                    plainText.value = "plain-text-off";
                    walletText.value = "wallet-text-mobile";
                    navbarSearchDesktop.value = "display-off";

                } else {

                    // console.log("small");
                    contentClass.value = "mobile-content";
                    exploreText.value = "explore-text-off";
                    plainText.value = "plain-text-off";
                    walletText.value = "wallet-text-mobile";
                    navbarSearchDesktop.value = "display-off";

                }

            },
            closeVideo = function () {

                if (videoHelper.value === "video-helper-max") {

                    minHelperVideo();

                } else {

                    helperVideoContainer.value = "helper-video-container-gone";

                }

            },
            maxHelperVideo = function () {

                videoControls.value = true;
                videoHelper.value = "video-helper-max";
                helperVideoContainer.value = "helper-video-container-max";
                closeVideoHelper.value = "close-video-max";

            },
            minHelperVideo = function () {

                videoControls.value = false;
                videoHelper.value = "video-helper";
                helperVideoContainer.value = "helper-video-container";
                closeVideoHelper.value = "close-video";

            },
            walletConnect = async function () {

                localStorage.setItem(
                    "selectedProvider",
                    "walletconnect"
                );

                emitAppEvent(
                    "getWeb3",
                    serverConfig.value
                );

                if (provider.isConnecting === true) {

                    provider.qrcodeModal.open(
                        provider.connector.uri,
                        {"bridge": provider.bridge}
                    );

                } else {

                    // await provider.disconnect();

                    await provider.
                        enable().
                        then().
                        catch(() => console.error("call error"));

                    setTimeout(
                        () => {

                            requestAccounts();

                        },
                        1000
                    );

                }

            };

        onBeforeMount(() => {

            document.title = "rareium";

        });

        onBeforeMount(() => {

            chains.push({
                "id": parseInt(
                    process.env.VUE_APP_ETH_CHAIN_ID,
                    10
                ),
                "name": "Ethereum",
                "icon": "ETHEREUM_PURPLE",
                "symbol": "ETH",
                "active": "false"
            });

            chains.push({
                "id": parseInt(
                    process.env.VUE_APP_MATIC_CHAIN_ID,
                    10
                ),
                "name": "Polygon",
                "icon": "POLYGON",
                "symbol": "MATIC",
                "active": "false"
            });

        });

        onMounted(() => {

            updateView();
            handleScroll();

            nextTick(async () => {

                await router.isReady();

                window.addEventListener(
                    "scroll",
                    handleScroll
                );

                if (route.query.hl) {

                    translation.setLanguage(route.query.hl);

                }

                if (route.query.ha) {

                    if (route.query.ha === "login") {

                        showLoginModal.value = true;

                    }

                }

            });

            eBus.on(
                "app-event",
                (e) => {

                    switch (e.action) {

                    case "showLoginModal":
                        showLoginModal.value = true;

                    }

                }
            );

            watch(
                () => route.name,
                () => {

                    updateView();

                }
            );
            watch(
                () => serverConfig.view.value,
                () => {

                    updateView();

                }
            );
            watch(
                () => serverConfig.chainId.value,
                () => {

                    for (let i = 0; i < chains.length; i++) {

                        if (chains[i].id == serverConfig.chainId.value) {

                            chains[i].active = true;
                            activeChain.value = i;

                        } else {

                            chains[i].active = false;

                        }

                    }

                }
            );
            watch(
                () => query.value,
                () => {

                    if (query.value.length < 2) {

                        queryCollections.value.splice(0);
                        queryCreators.value.splice(0);
                        return;

                    }

                    doQuery.value = true;

                    if (queryInFlight.value === false) {

                        runQuery();

                        setTimeout(
                            () => {

                                queryInFlight.value = false;

                            },
                            3000
                        );

                    }

                }

            );
            watch(
                () => userInfo.email,
                () => {

                    console.log(userInfo.email);

                    const re = /0x.*@rareium.io/g,
                        is = userInfo.email.match(re);

                    if (is) {

                        /*
                         * TODO : enable alerts
                         *    showEmailModal.value = true;
                         */

                    }

                }
            );
            watch(
                () => userInfo.authorized,
                () => {

                    const selectedProvider = localStorage.getItem("selectedProvider");

                    if (userInfo.authorized === true) {

                        // if we are already logged in with magic, invoke the magic provider
                        if (selectedProvider === "magic") {

                            if (userInfo.authorized === true) {

                                magicClicks.connect++;

                            } else {

                                magicClicks.login++;

                            }

                        }

                        /*
                         *getAccounts((response) => { })
                         */

                    }

                }

            );

        });

        onBeforeUnmount(() => {

            window.removeEventListener(
                "scroll",
                handleScroll
            );

        });

        return {contentClass,
            userInfo,
            doLogout,
            doMagicAuth,
            runQuery,
            query,
            queryInFlight,
            queryCollections,
            queryCreators,
            magicClicks,
            emitAppEvent,
            chains,
            query,
            categories,
            activeChain,
            ethereum,
            plainText,
            plainTextStyle,
            exploreText,
            exploreTextStyle,
            email,
            setEmail,
            getAccounts,
            getIcon,
            getIconRaw,
            gotoCreate,
            gotoTab,
            gotoPath,
            gotoUrl,
            eBus,
            handleScroll,
            hideModalEvent,
            metamaskLogin,
            "icon": icon.get,
            lastScrollPosition,
            "localize": translation.localize,
            loadCreatorPage,
            navbarBackgroundClass,
            navbarSearchDesktop,
            provider,
            route,
            requestAccounts,
            serverConfig,
            showLoginModal,
            showChainModal,
            showEmailModal,
            showWallet,
            switchChain,
            signInAccount,
            updateAccount,
            updateView,
            closeVideo,
            minHelperVideo,
            maxHelperVideo,
            videoControls,
            videoHelper,
            closeVideoHelper,
            helperVideoContainer,
            walletConnect,
            walletText,
            web3};

    }
};

</script>

<style>

#Nav {
  width:100%;
}
#vue-app {
  position: relative;
  height: 100%;
  font-family: 'PTSans-Regular', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 1.15em;
  scroll-behavior: smooth;
}
[v-cloak] {
    display: none !important;
}
a {
  text-decoration: none;
}
a.nav-link {
  color: white;
  padding: 0;
}
a.nav-link:hover {
  cursor: pointer;
}
svg.profile-coat {
  margin: 10px;
}
.layout {
  width:350px;
  margin-left: auto;
  margin-right: auto;
}
#background {
  position: absolute;
  width: 100%;
  overflow: hidden;
}
.navbar {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  padding: 10px;
  margin-left: auto;
  margin-right: auto;
  align-items: center;
  text-align: left;
  z-index: 3;
}
.profile-icon {
  cursor: pointer;
}
#header {
  position: fixed;
  width: 100%;
  transition: top .33s ease-in-out;
  -moz-transition: top .33s ease-in-out;
  -webkit-transition: top .33s ease-in-out;
  z-index: 2;
}
.header-white {
  display: flex;
  background-color: none;
}
.app-container {
  display: flex;
  flex-direction: row;
  max-width: 100%;
}
.navbar-right {
  flex-grow: 1;
  align-items: center;
  justify-content: space-around;
}
#navbar-background {
  position: fixed;
  width: 100%;
  height: 80px;
}
.navbar-background-tall {
  max-height: 80px;
  height: auto;
  z-index: 3;
  transition: all .25s ease-in-out;
}
.navbar-background-short {
  max-height: 65px;
  height: auto;
  z-index: 3;
  transition: all .25s ease-in-out;
}
.social-mobile {
  display: flex;
  flex-direction: row;
  margin-top: 50px;
}
.discord {
  margin: 32px;
  width: 42px;
  height: 42px;
  cursor: pointer;
  background-image: url("./assets/discord-128.png");
  background-repeat: no-repeat;
  background-size: contain;
}
.twitter {
  margin: 32px;
  width: 42px;
  height: 42px;
  cursor: pointer;
  background-image: url("./assets/twitter-128.png");
  background-repeat: no-repeat;
  background-size: contain;
}
.linkedin {
  margin: 32px;
  width: 48px;
  height: 48px;
  cursor: pointer;
  background-image: url("./assets/ln-128.png");
  background-repeat: no-repeat;
  background-size: contain;
}
.discord-small {
  margin: 15px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  background-image: url("./assets/discord-128.png");
  background-repeat: no-repeat;
  background-size: contain;
}
.twitter-small {
  margin: 15px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  background-image: url("./assets/twitter-128.png");
  background-repeat: no-repeat;
  background-size: contain;
}
.linkedin-small {
  margin: 15px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  background-image: url("./assets/ln-128.png");
  background-repeat: no-repeat;
  background-size: contain;
}
.desktop-content {
  width: 100%;
  flex-grow: 1;
  margin-top: 100px;
  margin-left: auto;
  margin-right: auto;
}
.mobile-content {
  width: 100%;
  flex-grow: 1;
  margin-top: 100px;
  margin-left: 0px;
  margin-right: 0px;
}
.nav-tab {
  position: relative;
  display: flex;
  align-items: center;
  font-size: 1em;
  color: white;
}
.nav-tab-no-menu {
  position: relative;
  display: inline-block;
  font-size: 1em;
  color: #583644;
}
.nav-tab-no-mobile {
  margin-top: 50px;
  position: relative;
  display: inline-block;
  font-size: 1em;
  font-weight: bold;
  color: #564580;
}
.nav-tab-no-menu:hover {
  cursor: pointer;
}
.nav-menu {
  top: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  border-radius: 15%;
}
.nav-menu-ten {
  top: 50px;
  margin: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  border-radius: 15%;
}
.nav-menu-container-explore {
  position: absolute;
  top: 50px;
  margin-left: -45px;
  margin-top: 50px;
  visibility: hidden;
  opacity: 0;
  transition: visibility 0s, opacity 0.2s linear, margin-top 0.2s ease-in-out;
  z-index: 1;
}
.nav-menu-container-profile {
  position: absolute;
  top: 60px;
  width: 200px;
  margin-left: 10px;
  margin-top: 50px;
  visibility: hidden;
  opacity: 0;
  transition: visibility 0s, opacity 0.2s linear, margin-top 0.2s ease-in-out;
  z-index: 1;
}
.nav-menu-container-chains {
  position: absolute;
  display: flex;
  justify-content: center;
  top: 50px;
  width: 50px;
  margin-top: 50px;
  visibility: hidden;
  opacity: 0;
  transition: visibility 0s, opacity 0.2s linear, margin-top 0.2s ease-in-out;
  z-index: 1;
}
.nav-tab:hover .nav-menu-container-chains {
  visibility: visible;
  margin-top: 0px;
  opacity: 1;
}
.nav-tab:hover .nav-menu-container-explore {
  visibility: visible;
  margin-top: 0px;
  opacity: 1;
}
.nav-tab:hover .nav-menu-container-explore::before {
  scale: 1.4;
}
.nav-tab:hover .nav-menu-container-explore::after {
  scale: 1.0;
}
.nav-tab:hover .nav-menu-container-profile {
  visibility: visible;
  margin-top: 0px;
  opacity: 1;
}
.nav-item {
  display: block;
  padding: 5px;
  margin: 5px;
  cursor: pointer;
  color: #668691;
  border: 1px solid #fff;
  background-color: white;
  border-radius: 10px;
  font-size: 0.9em;
}
.nav-item:hover {
  font-weight: bold;
}
.nav-arrow-container {
  width: 100px;
  margin: 10px;
}
.nav-arrow-left {
  position: absolute;
  width: 0;
  height: 0;
  margin-top: 1px;
  margin-left: 20px;
  border-style: solid;
  border-width: 0 7px 8px 7px;
  border-color: transparent transparent white transparent;
}
.nav-arrow-middle {
  position: absolute;
  width: 0;
  height: 0;
  margin-top: 1px;
  margin-left: 43px;
  border-style: solid;
  border-width: 0 7px 8px 7px;
  border-color: transparent transparent white transparent;
}
.nav-arrow-right {
  position: absolute;
  width: 0;
  height: 0;
  margin-top: 1px;
  margin-left: 70px;
  border-style: solid;
  border-width: 0 7px 8px 7px;
  border-color: transparent transparent white transparent;
}
.query-response-container {
  position: absolute;
  top: 50px;
  margin-left: 30px;
}
.query-response-line {
  margin-top: 10px;
  border-radius: 3px;
  padding: 7px;
  color: #fff;
  background-color: white;
  margin-top: 5px;
  opacity: 1;
  transition: all 0.5s ease-out;
}
.query-response-line:before {
  color: #fff;
  margin-top: 10px;
  background-color: white;
  opacity: 0;
}
.navbar-search-container {
  position: relative;
  display: flex;
  flex-grow: 1;
  align-items: center;
  margin: 10px;
  min-width: 200px;
}
.display-off {
  display: none;
}
.display-on {
  display: block;
}
.flex-row {
  display: flex;
  flex-direction: row;
}
.footer {
  display: flex;
  flex-direction: row;
  height: 300px;
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
  color: white;
}
.search-select {
  border: 2px solid;
}
.copyright {
  margin: 10px;
}
.sidebar {
}
.footerlinks {
  margin: 32px;
  color: #5e6b8e;
}
.footercontent {
  align-items: center;
}
.copyright {
  margin: 10px;
  color: #6e6e6e;
}
.footerlink {
  margin: 10px;
  color: #6e6e6e;
  cursor: pointer;
}
.sidebar-panel-nav {
  padding-left: 30px;
  list-style-type: none;
  text-align: left;
  cursor: default;
}
.nav-h2 {
  cursor: pointer;
  color: #fdfdfd;
  font-size: 1em;
  cursor: default;
}
.nav-circle-icon {
  display: flex;
  cursor: pointer;
  width: 22px;
  height: 22px;
  background: white;
  border-radius: 50%;
  padding: 5px;
  margin-top: 5px;
  border: 2px solid #fff;
}
.explore-text-on {
  display: block;
}
.explore-text-light {
  display: block;
  cursor: pointer;
  color: #fff;
  font-size: 1em;
  cursor: default;
}
.explore-text-dark {
  display: block;
  cursor: pointer;
  color: #fff;
  font-size: 1em;
  cursor: default;
}
.explore-text-off {
  display: none;
}
.chain-icon {
  width: 22px;
  height: 26px;
}
.chain-icon-container {
  display: flex;
  height: 50px;
  justify-content: center;
}
.wallet-advice {
  color: #8f81bd;
  font-size: 0.8em;
  text-align: left;
  margin-top: 20px;
}
.submit-button {
  display: flex;
  margin-top: 20px;
  margin-bottom: 10px;
  align-items: center;
  width: fit-content;
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
  box-shadow: 0px 15px 20px 2px rgb(139 106 224 / 33%);
  cursor: pointer;
  background: linear-gradient(338deg,#ff7c88,#ff46a4)
}
.plain-text-off {
  display: none;
}
.change-chain-modal {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  overflow: hidden;
}
.change-chain-modal-icon {
  width: 48px;
  height: 48px;
}
.plain-text-on {
  display: flex;
  align-items: center;
  font-size: 1.1em;
  color: #fff;
}
.plain-text-dark {
  color: #fff;
}
.plain-text-light {
  color: #d0d0d0;
}
.desktop-compact {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.desktop-expand-item {
  margin: 20px;
  align-items: center;
}
.expand-text-title {
  margin-left: 10px;
  font-size: 1em;
  margin-left: 10px;
  font-weight: bold;
  color: #000;
  text-align: left;
}
.expand-text {
  margin-left: 10px;
  color: #808191;
  font-size: 1em;
  margin-left: 10px;
  font-weight: bold;
  text-align: left;
}
.compact-icon {
  display: flex;
  width: 48px;
  height: 48px;
  margin: 10px;
}
.expand-icon {
  resize: 'horizontal';
  overflow: 'hidden';
  width: '100px';
  height: 'auto';
}
.sidebar-panel-nav > li > a {
  color: #fff;
  text-decoration: none;
  text-align: left;
  font-size: 1.5rem;
  display: block;
  padding-bottom: 0.5em;
  cursor: default;
}
.top-bar-flex {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.top-bar-icon {
  margin-right: 10px;
  margin-left: 20px;
}
.top-bar-icon-op {
  margin-right: 20px;
  margin-left: 10px;
}
.explore {
  margin-left: 10px;
  align-items: center;
}
.connect-img-container {
  display: flex;
  cursor: pointer;
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
  flex-grow: 1;
}
.wallet-text-desktop {
  font-size: 0.9em;
  color: #080926;
  padding: 10px;
}
.wallet-text-mobile {
  font-size: 0.8em;
  color: #080926;
  padding: 10px;
}
img.connect-img {
  width: 50px;
  height: 50px;
}
.connect-wallets {
  border: 2px solid #a046ff;
  justify-content: center;
  border-radius: 10px;
  font-size: 1em;
  padding: 20px;
}
.connect-text {
  position: absolute;
  margin: -17px 0px 0px 10px;
  padding: 10px;
  font-size: .8em;
  color: #a046ff;
  background-color: #fff;
}
.or-login {
  margin: 20px;
  color: #a046ff;
  font-size: 1em;
  font-weight: bold;
}
body {
  margin: 0px;
  -webkit-tap-highlight-color:  rgba(255, 255, 255, 0);
  background-color: #F8FAFF;
  font-size: 1em;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.animate-spin {
  animation: spin 1s linear infinite;
}
.route-enter-from {
  opacity: 0;
  transform: translateY(100px);
}
.route-leave-to {
  opacity: 0;
  transform: translateY(-100px);
}
.route-enter-active {
  transition: all 0.2s ease-out;
}
.route-leave-active {
  transition: all 0.2s ease-in;
}
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
}
.nav-icon {
  cursor: pointer;
}
.helper-video-container {
  position: fixed;
  display: flex;
  flex-direction: row;
  justify-content: end;
  border: 2px solid #fff;
  border-radius: 50%;
  margin: 20px;
  width: 100px;
  height: 100px;
  right: 0px;
  bottom: 0px;
  box-shadow: 0px 10px 20px 0px rgb(0 0 0 / 33%);
  overflow: hidden;
  cursor: pointer;
  background: white;
  transition: all 0.5s ease-out;
  animation: HoverEffect 2s linear infinite;
  z-index: 10;
}
.helper-video-container:hover {
  border-radius: 10%;
}
.helper-video-container-max {
  position: fixed;
  display: flex;
  flex-direction: row;
  justify-content: center;
  right: 0;
  bottom: 0;
  top: 100px;
  left: 0;
  z-index: 100;
  border-radius: 0;
  border: 2px solid #fff;
  margin: 20px;
  box-shadow: 0px 10px 20px 0px rgb(0 0 0 / 33%);
  background: white;
  transition: all 0.5s ease-out;
}
.helper-video-container-gone {
  position: fixed;
  display: flex;
  flex-direction: row;
  justify-content: end;
  border: 2px solid #fff;
  border-radius: 50%;
  margin: 20px;
  width: 100px;
  height: 100px;
  right: 0px;
  bottom: 0px;
  bottom: -120px;
  box-shadow: 0px 10px 20px 0px rgb(0 0 0 / 33%);
  overflow: hidden;
  cursor: pointer;
  background: white;
  transition: all 0.5s ease-out;
  z-index: 10;
}
.helper-video-container-gone:hover {
  bottom: 0px;
}
@keyframes HoverEffect {
  50% {
    transform: skewY(-2deg);
    bottom: 12px;
  }
}
.video-helper {
  background: white;
  width: 25px;
  height: 25px;
  object-fit: cover;
  height: 100%;
  width: 100%;
  max-width: 100%;
  max-height: 100%;
}
.video-helper-max {
  object-fit: cover;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
}
.close-video {
  margin-right: 5px;
  margin-top: 2px;
  background: white;
  font-size: 1em;
  font-weight: bold;
  color: red;
  z-index: 10;
  position: absolute;
}
.close-video-max {
  position: absolute;
  dsplay: flex;
  justify-conent: center;
  margin-right: 5px;
  margin-top: 5px;
  background: white;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  cursor: pointer;
  font-size: 2em;
  font-weight: bold;
  color: red;
  z-index: 22;
}
.lineitem-enter-active, .lineitem-leave-active {
	transition: all 0.3s ease-in-out;
}
/* delay leave of parent element */
.lineitem-leave-active {
  transition-delay: 0.25s;
}

.lineitem-enter-from,
.lineitem-leave-to {
  transform: translateX(50px);
  opacity: 0;
}
.query-result:hover {
  font-weight: bold;
  color: #fff;
  cursor: pointer;
}

/* we can also transition lineitem elements using lineitem selectors */
.lineitem-enter-active .query-result,
.lineitem-leave-active .query-result {
  transition: all 0.3s ease-in-out;
}
/* delay enter of lineitem element */
.lineitem-enter-active .query-result {
	transition-delay: 0.25s;
}

.lineitem-enter-from .query-result,
.lineitem-leave-to .query-result {
  transform: translateX(50px);
  opacity: 0.01;
}
.app-background-container {
  position: relative;
}
.app-footer {
  margin-top: auto;
}
.app-flex {
  min-height: calc(100vh + 300px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.no-grad {
  width: 100px;
}
.eq-grad {
  width: 100px;
  background: -webkit-repeating-linear-gradient(46deg, #fb9d0a,#d247e2,#36a0ba,#20be2b,#1d931f);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.svg-logo {
  width: 100px;
  height: 100px;
}
.menu-items {
  color: #4d4d4d;
  display: flex;
  margin-bottom: 20px;
}
.menu-item {
  margin-left: 10px;
}

</style>
