import "./assets/fonts/fonts.css";
import "vue3-swatches/dist/style.css";
import "vue3-carousel/dist/carousel.css";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import "@vueup/vue-quill/dist/vue-quill.core.css";
import {CButton, CDropdown, CDropdownItem, CInput, CModal, CSearchBar, CSwitch, CTextArea} from "./components/celements/celements.ts";
import {ShareNetwork, VueSocialSharing} from "vue-social-sharing";
import {createApp, h, nextTick, onBeforeUnmount, onMounted, provide, reactive, ref, watch} from "vue";
import {createRouter, createWebHistory, useRoute} from "vue-router";
import About from "./components/About.vue";
import Admin from "./components/Admin.vue";
import App from "./App.vue";
import Axios from "axios";
import Collection from "./components/Collection.vue";
import LazyMint from "./components/LazyMint.vue";
import CreateERC20 from "./components/CreateERC20.vue";
import CreateERC721 from "./components/CreateERC721.vue";
import CreateERC1155 from "./components/CreateERC1155.vue";
import CreateProduct from "./components/CreateProduct.vue";
import Creator from "./components/Creator.vue";
import CreatorSignUp from "./components/CreatorSignUp.vue";
import Home from "./components/Home.vue";
import NFTCard from "./components/NFTCard.vue";
import NFTLineItem from "./components/NFTLineItem.vue";
import NFTToken from "./components/NFTToken.vue";
import Privacy from "./components/Privacy.vue";
import Profile from "./components/Profile.vue";
import Terms from "./components/Terms.vue";
import Tokuteishotorihiki from "./components/Tokuteishotorihiki.vue";
import VSwatches from "vue3-swatches";
import VueClickAway from "vue3-click-away";
import {createPinia} from "pinia";
import {getWeb3} from "./web3.js";
import mitt from "mitt";

window.USER_INFO = new Object();

const routes = [
        {"component": Home,
            "name": "home",
            "path": "/"},
        {"component": Profile,
            "name": "profile",
            "path": "/profile"},
        {"component": Admin,
            "name": "admin",
            "path": "/admin"},
        {"path": "/collection/",
            "children": [
                {
                    "path": ":address",
                    "name": "collection",
                    "component": Collection
                },
                {
                    "path": "/collection/:address/:token_id",
                    "name": "token",
                    "component": NFTToken
                }
            ]},
        {"component": LazyMint,
            "name": "mint",
            "path": "/mint/:address/:token_id?"},
        {"component": CreateERC20,
            "name": "create-erc-20",
            "path": "/create-erc-20/:address?"},
        {"component": CreateERC721,
            "name": "create-erc-721",
            "path": "/create-erc-721/:address?"},
        {"component": CreateERC1155,
            "name": "create-erc-1155",
            "path": "/create-erc-1155/:address?"},
        {"component": CreatorSignUp,
            "name": "creator-sign-up",
            "path": "/creator-sign-up"},
        {"component": Creator,
            "name": "creator",
            "path": "/:page"},
        {"component": CreateProduct,
            "name": "create-product",
            "path": "/product/:id?"},
        {"component": Privacy,
            "name": "privacy",
            "path": "/privacy"},
        {"component": Terms,
            "name": "terms",
            "path": "/terms"},
        {"component": About,
            "name": "about",
            "path": "/about"},
        {"component": Tokuteishotorihiki,
            "name": "tokuteishotorihiki",
            "path": "/tokuteishotorihiki"}
    ],

    router = createRouter({
        "history": createWebHistory(),
        "mode": "history",
        scrollBehavior () {

            return {"top": 0};

        },
        routes
    }),

    pinia = createPinia();

createApp({

    /*
     * In vue3 you need to explicity state wheter things are reactive.
     * Since usually we want everything to be reactive we need to add boilder plate on everything
     * Secondly since there is isolation in vue3 we need to provide anything that we want to be
     * Made available in other components (child components will inject these if they want to access)
     */
    setup () {

        document.title = "rareium.io";

        const serverConfig = reactive({
                "view": "",
                "windowWidth": "",
                "visualMode": "light",
                "chainId": "",
                "priceFeed": {
                    "ethPriceUSD": "",
                    "ethPriceYEN": "",
                    "maticPriceUSD": "",
                    "maticPriceYEN": ""
                }
            }),
            userInfo = reactive({
                "accounts": [],
                "authorized": false,
                "clientid": "",
                "color_code": "",
                "defaultview": "",
                "email": "",
                "engagement": "",
                "language": "",
                "networks": [],
                "user_id": "",
                "username": ""
            }),
            eBus = mitt(),
            web3 = ref({}),
            route = useRoute(),
            getUserInfo = function () {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}getUserInfo`,
                    {
                    }
                ).
                    then((response) => {

                        if (response.data) {

                            for (const i in response.data) {

                                userInfo[i] = response.data[i];

                            }

                        }

                        if (route.query.hl) {

                            userInfo.language = route.query.hl;

                        }

                    }).
                    catch((error) => {

                        throw error;

                    });

            },
            getNetwork = function () {

                const selectedProvider = localStorage.getItem("selectedProvider");

                if ((selectedProvider === "metamask" ||
                selectedProvider === "walletconnect") && window.ethereum) {

                    web3.value.eth.getChainId().
                        then((chainId) => {

                            serverConfig.chainId = parseInt(chainId);

                            window.ethereum.request({
                                "method": "wallet_switchEthereumChain",
                                "params": [{"chainId": web3.value.utils.toHex(serverConfig.chainId)}]
                            });

                            setServerConfig(chainId);

                        });

                } else {

                    /*
                     * we are in magic connect
                     * do nothing for now
                     */
                    /*
                     *if (!id) {
                     *
                     *   serverConfig.chainId = process.env.VUE_APP_ETH_CHAIN_ID;
                     *
                     *}
                     */
                    setNetwork();

                }

            },
            setNetwork = async function (id) {

                if (!id) {

                    id = localStorage.getItem("selectedChainId");

                    if (!id) {

                        id = 1;

                    }

                } else {

                    localStorage.setItem(
                        "selectedChainId",
                        id
                    );

                }

                setServerConfig(id);

                const selectedProvider = localStorage.getItem("selectedProvider");

                if ((selectedProvider === "metamask" ||
                     selectedProvider === "walletconnect") && window.ethereum) {

                    try {

                        console.log(web3.value.utils.toHex(id));

                        window.ethereum.request({
                            "method": "wallet_switchEthereumChain",
                            "params": [{"chainId": web3.value.utils.toHex(parseInt(id))}]
                        });

                    } catch (e) {

                        if (id == "137") {

                            await window.ethereum.request({
                                "method": "wallet_addEthereumChain",
                                "params": [
                                    {"chainId": web3.value.utils.toHex("137"),
                                        "rpcUrls": ["https://polygon-rpc.com"],
                                        "chainName": "Polygon Mainnet",
                                        "nativeCurrency": {
                                            "name": "MATIC",
                                            "symbol": "MATIC",
                                            "decimals": 18
                                        },
                                        "blockExplorerUrls": ["https://polygonscan.com/"]}
                                ]
                            });

                        } else if (id == "1") {

                            await window.ethereum.request({
                                "method": "wallet_addEthereumChain",
                                "params": [
                                    {"chainId": web3.value.utils.toHex("1"),
                                        "rpcUrls": ["https://polygon-rpc.com"],
                                        "chainName": "Ethereum Mainnet",
                                        "nativeCurrency": {
                                            "name": "Ethereum",
                                            "symbol": "ETH",
                                            "decimals": 18
                                        },
                                        "blockExplorerUrls": ["https://etherscan.com/"]}
                                ]
                            });

                        }

                    }

                    getNetwork();

                } else {

                    // handled by provider
                    serverConfig.chainId = id;

                }

            },
            setServerConfig = function (chainId) {

                if (chainId == 80001 || chainId == 137) {

                    serverConfig.VUE_APP_CHAIN_ID = process.env.VUE_APP_MATIC_CHAIN_ID;
                    serverConfig.VUE_APP_PROVIDER = process.env.VUE_APP_MATIC_PROVIDER;
                    serverConfig.VUE_APP_NFT_FACTORY_ADDRESS = process.env.VUE_APP_MATIC_NFT_FACTORY_ADDRESS;
                    serverConfig.VUE_APP_MULTINFT_FACTORY_ADDRESS = process.env.VUE_APP_MATIC_MULTINFT_FACTORY_ADDRESS;
                    serverConfig.VUE_APP_PLATFORM_ADDRESS = process.env.VUE_APP_MATIC_PLATFORM_ADDRESS;
                    serverConfig.VUE_APP_MARKETPLACE_ADDRESS = process.env.VUE_APP_MATIC_MARKETPLACE_ADDRESS;
                    serverConfig.VUE_APP_ERC20_FACTORY_ADDRESS = process.env.VUE_APP_MATIC_ERC20_FACTORY_ADDRESS;

                } else {

                    serverConfig.VUE_APP_CHAIN_ID = process.env.VUE_APP_ETH_CHAIN_ID;
                    serverConfig.VUE_APP_PROVIDER = process.env.VUE_APP_ETH_PROVIDER;
                    serverConfig.VUE_APP_NFT_FACTORY_ADDRESS = process.env.VUE_APP_ETH_NFT_FACTORY_ADDRESS;
                    serverConfig.VUE_APP_MULTINFT_FACTORY_ADDRESS = process.env.VUE_APP_ETH_MULTINFT_FACTORY_ADDRESS;
                    serverConfig.VUE_APP_PLATFORM_ADDRESS = process.env.VUE_APP_ETH_PLATFORM_ADDRESS;
                    serverConfig.VUE_APP_MARKETPLACE_ADDRESS = process.env.VUE_APP_ETH_MARKETPLACE_ADDRESS;
                    serverConfig.VUE_APP_ERC20_FACTORY_ADDRESS = process.env.VUE_APP_ETH_ERC20_FACTORY_ADDRESS;

                }

            },
            getPrice = function () {

                Axios.get(
                    "https://price-api.crypto.com/price/v1/exchange/polygon",
                    {

                        "params": {

                        }

                    }
                ).
                    then((response) => {

                        if (response.data) {

                            serverConfig.priceFeed.maticPriceUSD = response.data.fiat.usd;
                            serverConfig.priceFeed.maticPriceYEN = Math.ceil(response.data.fiat.usd * 149.42);
                            console.log(serverConfig.priceFeed.maticPriceUSD);

                        }

                    });

                Axios.get(
                    "https://price-api.crypto.com/price/v1/exchange/ethereum",
                    {

                        "params": {

                        }

                    }
                ).
                    then((response) => {

                        if (response.data) {

                            serverConfig.priceFeed.ethPriceUSD = response.data.fiat.usd;
                            serverConfig.priceFeed.ethPriceYEN = Math.ceil(response.data.fiat.usd * 149.42);

                        }

                    });

            },
            onResize = function () {

                // Let windowHeight = window.innerHeight
                const windowWidth = window.innerWidth;
                serverConfig.windowWidth = windowWidth;

                if (windowWidth >= 1024) {

                    serverConfig.view = "desktop";

                } else if (windowWidth >= 750) {

                    serverConfig.view = "tablet";

                } else {

                    serverConfig.view = "mobile";

                }

            };

        onMounted(() => {

            window.open = (function (open) {

                return function (url, name, features) {

                    name ||= "default_window_name";
                    return open.call(
                        window,
                        url,
                        name,
                        features
                    );

                };

            }(window.open));

            watch(
                () => userInfo.networks,
                () => {

                    getNetwork();

                }
            );

            const selectedProvider = localStorage.getItem("selectedProvider");

            // set a default provider to metamask if unset and installed.
            if (!selectedProvider && window.ethereum) {

                localStorage.setItem(
                    "selectedProvider",
                    "metamask"
                );

            }

            getWeb3({
                "VUE_APP_INFURA_ID": process.env.VUE_APP_INFURA_ID,
                "VUE_APP_PROVIDER": serverConfig.VUE_APP_PROVIDER
            }).then((w3) => {

                web3.value = w3;
                setNetwork();

            });

            getPrice();

            /*
             * We need to use 3rd party tools to do things that were native in vue2
             * provide an event bus here to listen to events emitted in child components
             * I'm defining a simple generic event schema as follows
             * {
             *  action: some-task-to-do
             *  data : some-data-to-process
             * }
             */
            eBus.on(
                "app-event",
                (e) => {

                    switch (e.action) {

                    case "getUserInfo":
                        getUserInfo();
                        break;
                    case "setNetwork":
                        setNetwork(e.data);
                        break;
                    case "setWeb3":
                        web3.value = e.data;
                        getNetwork();
                        break;
                    case "getWeb3":
                        getWeb3({
                            "VUE_APP_INFURA_ID": process.env.VUE_APP_INFURA_ID,
                            "VUE_APP_PROVIDER": serverConfig.VUE_APP_PROVIDER
                        }).then((w3) => {

                            web3.value = w3;

                        });
                        break;
                    default:
                        break;

                    }

                }
            );
            nextTick(() => {

                window.addEventListener(
                    "resize",
                    onResize
                );
                onResize();
                getUserInfo();

            });
            if (typeof window.ethereum !== "undefined") {

                window.ethereum.on(
                    "accountsChanged",
                    (accounts) => {

                        userInfo.accounts = accounts;

                    }
                );
                window.ethereum.on(
                    "networkChanged",
                    (networks) => {

                        userInfo.networks = networks;

                    }
                );

            }

        });
        onBeforeUnmount(() => {

            window.removeEventListener(
                "resize",
                onResize
            );

        });
        provide(
            "eBus",
            eBus
        );
        provide(
            "router",
            router
        );
        provide(
            "route",
            route
        );
        provide(
            "web3",
            web3
        );
        provide(
            "userInfo",
            userInfo
        );
        provide(
            "serverConfig",
            serverConfig
        );
        return {eBus,
            getUserInfo,
            onResize,
            getPrice,
            route,
            serverConfig,
            userInfo,
            getNetwork,
            setNetwork,
            setServerConfig,
            web3};

    },
    render () {

        return h(App);

    }
}).
    component(
        "CButton",
        CButton
    ).
    component(
        "CSwitch",
        CSwitch
    ).
    component(
        "CInput",
        CInput
    ).
    component(
        "CTextArea",
        CTextArea
    ).
    component(
        "NFTCard",
        NFTCard
    ).
    component(
        "NFTLineItem",
        NFTLineItem
    ).
    component(
        "CDropdown",
        CDropdown
    ).
    component(
        "CDropdownItem",
        CDropdownItem
    ).
    component(
        "CSearchBar",
        CSearchBar
    ).
    component(
        "CModal",
        CModal
    ).
    component(
        "ShareNetwork",
        ShareNetwork
    ).
    use(pinia).
    use(VueSocialSharing).
    use(VueClickAway).
    use(VSwatches).
    use(router).
    mount("#app");

