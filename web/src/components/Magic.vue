<template>
  <div class="rmodal-dialog">
    <!--
    DEBUG BUTTONS
    <div
      @click="connect"
      class="rbutton"
    >
      connect
    </div>
    <div
      @click="wallet"
      class="rbutton"
    >
      wallet
    </div>
    <div
      @click="logout"
      class="rbutton"
    >
      logout
    </div>
    <div
      @click="login"
      class="rbutton"
    >
      login
    </div>
    <div
      @click="logit"
      class="rbutton"
    >
      log it
    </div>
-->
  </div>
</template>

<script>

import {emit, inject, onMounted, ref, toRefs, watch} from "vue";
import {ExtensionError, Magic, RPCError, SDKError} from "magic-sdk";
import {translationStore} from "@/stores/translation";
import Web3 from "web3";

export default {
    "name": "Magic",
    "components": {
    },
    "props": {
        "magicClicks": Object
    },
    "emits": [
        "do-magic-auth",
        "request-accounts"
    ],
    setup (props, {emit}) {

        const provider = ref(),

            serverConfig = toRefs(inject("serverConfig")),
            web3 = ref({}),
            translation = translationStore(),
            clicks = toRefs(props.magicClicks),
            logit = function () {

                console.log(provider);
                console.log(provider.value);
                console.log("magic.value");
                console.log(magic.value);

            },
            connect = function () {

                emit(
                    "do-magic-auth",
                    web3.value
                );

            },
            login = async function () {

                // clear previous session if any remains
                await magic.value.user.logout();

                localStorage.setItem(
                    "selectedProvider",
                    "magic"
                );

                try {

                    const accounts = await magic.value.wallet.connectWithUI();
                    emit(
                        "do-magic-auth",
                        web3.value
                    );
                    emit("request-accounts");

                } catch (e) {

                    console.log("error");
                    console.log(e);

                }

            },
            logout = async function () {

                await magic.value.user.logout();

            },
            wallet = async function () {

                try {

                    await magic.value.wallet.showUI();

                } catch (e) {

                    console.log("error");
                    console.log(e);

                }

            },

            addChains = function () {

                if (window.location.hostname === "shinovi.io") {

                } else {

                }

            },

            changeChain = async function (chainId) {

                let customNodeOptions;

                if (chainId == 80001 || chainId == 137) {

                    customNodeOptions = {

                        "rpcUrl": process.env.VUE_APP_MATIC_PROVIDER,
                        chainId

                    };

                } else if (chainId == 1 || chainId == 11155111) {

                    customNodeOptions = {

                        "rpcUrl": process.env.VUE_APP_ETH_PROVIDER,
                        chainId

                    };

                }

                try {

                    magic.value = new Magic(
                        process.env.VUE_APP_MAGIC_API_KEY,
                        {"network": customNodeOptions}
                    );

                    const provider = await magic.value.wallet.getProvider();

                    web3.value = new Web3(provider);
                    web3.value.currentProvider.on(
                        "accountsChanged",
                        handleAccountsChanged
                    );
                    web3.value.currentProvider.on(
                        "chainChanged",
                        handleChainChanged
                    );

                } catch (e) {

                    console.log(e);

                } finally {

                    const selectedProvider = localStorage.getItem("selectedProvider");

                    if (selectedProvider === "magic") {

                        console.log("EMIT NEW CHAIN PROCIDER ");
                        console.log(customNodeOptions);
                        emit(
                            "do-magic-auth",
                            web3.value
                        );

                    }

                }

            },

            handleAccountsChanged = function (ac) {

                console.log("Magic handleAccountsChanged");
                console.log(ac);

            },

            handleChainChanged = function (id) {

                console.log("Magic handleChainChanged");
                console.log(id);

            },

            magic = ref({});

        onMounted(async () => {

            console.log(serverConfig);

            changeChain(serverConfig.chainId);

            /*
             *try {
             *
             *  console.log('new maggic onmounted serverconfig')
             *  console.log(serverConfig)
             *
             *  magic.value = new Magic(process.env.VUE_APP_MAGIC_API_KEY, {
             *    network: customNodeOptions, // connect to Ethereum Testnet!
             *  });
             *
             *  const provider = await magic.value.wallet.getProvider();
             *
             *  // const web3 = new Web3(provider);
             *  web3.value = new Web3(provider);
             *
             *  // Listen for events
             *  web3.value.currentProvider.on('accountsChanged', handleAccountsChanged);
             *  web3.value.currentProvider.on('chainChanged', handleChainChanged);
             *
             *} catch (error) {
             *
             *  console.log(error);
             *
             *} finally {
             *
             *}
             */

            watch(
                serverConfig.chainId,
                () => {

                    changeChain(serverConfig.chainId.value);

                }
            );

            watch(
                clicks.wallet,
                () => {

                    wallet();

                }
            );

            watch(
                clicks.connect,
                () => {

                    connect();

                }
            );

            watch(
                clicks.login,
                () => {

                    login();

                }
            );

            watch(
                clicks.logout,
                () => {

                    logout();

                }
            );

        });
        return {"localize": translation.localize,
            serverConfig,
            logit,
            login,
            logout,
            connect,
            wallet,
            changeChain,
            handleChainChanged,
            handleAccountsChanged,
            web3,
            magic,
            translation};

    }
};

</script>
<style scoped>
  .rbutton {
    display: block;
    padding: 5px;
    margin: 5px;
    cursor: pointer;
    color: #9f71e7;
    border: 1px solid #9f71e7;
    background-color: #fff;
    border-radius: 10px;
    font-size: .9em;
  }
.rmodal-dialog {
display:flex;
}
</style>
