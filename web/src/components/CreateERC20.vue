<template>
  <div>
    <Dashboard>
      <div class="token-container">
        <div class="create-token-header">
          <h2 class="createtitletext">
            {{ localize('TEXT_CREATE_CRYPTO_TOKEN') }}
          </h2>
          <div
            style="font-size: 0.8em; font-weight: bold; margin-top: 40px;"
            @click="showTokenModal = true"
          >
            {{ localize('TEXT_ANOTHER_TOKEN') }}
          </div>
        </div>

        <div class="create-sub-header">
          {{ localize('CREATE_ERC20_DEFINE') }}
        </div>
        <div class="step-1-container">
          <div class="define-nft-left">
            <CInput
              class="margin-top"
              :value="token.name"
              :title="localize('TEXT_TOKEN_NAME')"
              :placeholder="localize('TEXT_TOKEN_NAME_PLACEHOLDER')"
              @inputValue="token.name = $event"
            />
            <CInput
              class="margin-top"
              :value="token.symbol"
              :title="localize('TEXT_TOKEN_SYMBOL')"
              :placeholder="localize('TEXT_TOKEN_SYMBOL_PLACEHOLDER')"
              @inputValue="token.symbol = $event"
            />
            <CInput
              class="margin-top"
              :value="token.supply"
              :title="localize('TEXT_TOKEN_SUPPLY')"
              :placeholder="localize('TEXT_TOKEN_SUPPLYPLACEHOLDER')"
              @inputValue="token.supply = $event"
            />
          </div>

          <div class="define-nft-left">
            <CTextArea
              class="token-description"
              :value="token.description"
              :title="localize('TEXT_TOKEN_DESCRIPTION')"
              :placeholder="localize('TEXT_TOKEN_DESCRIPTION_PLACEHOLDER')"
              @inputValue="token.description = $event"
            />
            <div
              class="create-save-token-button"
              @click="createToken"
            >
              {{ localize('TEXT_CREATE_TOKEN') }}
            </div>
          </div>
        </div>

        - - - -
        {{ contracts }}
        - - - -
        {{ contracts[0] }}
        - - - -

        <div>
          <div class="define-nft-left">
            <CInput
              class="margin-top"
              :value="sendToken.to"
              :title="localize('TEXT_TOKEN_TO')"
              :placeholder="localize('TEXT_TOKEN_TO_PLACEHOLDER')"
              @inputValue="sendToken.to = $event"
            />
            <CInput
              class="margin-top"
              :value="sendToken.token"
              :title="localize('TEXT_TOKEN_ADDRESS')"
              :placeholder="localize('TEXT_TOKEN_ADDRESS_PLACEHOLDER')"
              @inputValue="sendToken.token = $event"
            />
            <CInput
              class="margin-top"
              :value="sendToken.amount"
              :title="localize('TEXT_TOKEN_AMOUNT')"
              :placeholder="localize('TEXT_TOKEN_AMOUNT_PLACEHOLDER')"
              @inputValue="sendToken.amount = $event"
            />
          </div>
          <div
            class="create-save-token-button"
            @click="sendTokens"
          >
            {{ localize('TEXT_SEND_TOKEN') }}
          </div>
        </div>

        <CModal
          v-if="showTokenModal"
          color="#f9b115"
          title="Please Wait"
          @close="showTokenModal = false"
        >
          <template #header>
            <div> {{ localize('TEXT_TRANSACTION_IN_PROGRESS') }} </div>
          </template>
          <template #body>
            <div>
              {{ localize('TEXT_PLEASE_WAIT_TRANSACTION_IN_PROGRESS') }}
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
import {translationStore} from "@/stores/translation";
import {inject, onMounted, reactive, ref, toRaw, toRefs, unref, watch, watchEffect} from "vue";
import Axios from "axios";
import FormData from "form-data";
import {ERC20FactoryABI} from "../abi.js";

export default {
    "name": "CreateERC20",
    "components": {
    },
    setup () {

        const translation = translationStore(),
            serverConfig = toRefs(inject("serverConfig")),
            route = inject("route"),
            router = inject("router"),
            icon = iconStore(),
            web3 = inject("web3"),
            hasCreateTokenSub = false,
            contracts = ref([]),
            token = ref({
                "id": 0,
                "name": "",
                "symbol": "",
                "description": "",
                "supply": "",
                "chain_id": ""
            }),
            tokens = ref([]),
            sendToken = ref({
                "to": "",
                "token": "",
                "amount": ""
            }),
            showTokenModal = ref(false),
            getMyTokens = async function (callback) {

                const accounts = await ethereum.request({"method": "eth_requestAccounts"}),
                    addr = accounts[0];

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}getMyTokens`,
                    {

                        "params": {

                            addr

                        }

                    }
                ).
                    then((response) => {

                        if (response.status === 200) {

                            let i = 0;
                            for (i; i < response.data.length; i++) {

                                tokens[response.data[i].nft_address] = response.data[i];

                            }

                            callback();

                        }

                    }).
                    catch((error) => {

                        throw error;

                    });

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
            getTokenURI = async function (address, token_id, owner, callback) {

                const amc = new web3.value.eth.Contract(
                    rareiumTokenABI,
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
            gotoContract = function (c, i) {

                getToken(c);

            },
            fetchMyTokens = async function () {

                const accounts = await ethereum.request({"method": "eth_requestAccounts"}),
                    addr = accounts[0],
                    amc = new web3.value.eth.Contract(
                        ERC20FactoryABI,
                        `${serverConfig.VUE_APP_ERC20_FACTORY_ADDRESS.value}`
                    );

                amc.methods.contracts(
                    addr,
                    0
                ).call((e, r) => {

                    contracts.value.splice(0);

                    contracts.value.push(r);

                });

            },
            // create token on-chain
            createToken = async function () {

                if (!(token.value.name && token.value.symbol && token.value.supply)) {

                    console.log("bad token");
                    //  showCreateTokenErrorModal.value = true;
                    return;

                }

                showTokenModal.value = true;

                const accounts = await ethereum.request({"method": "eth_requestAccounts"}),
                    addr = accounts[0],
                    amc = new web3.value.eth.Contract(
                        ERC20FactoryABI,
                        `${serverConfig.VUE_APP_ERC20_FACTORY_ADDRESS.value}`
                    );

                let gasLimit = await amc.methods.create(
                    token.value.name,
                    token.value.symbol,
                    token.value.supply
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
                gasLimit = gasLimit <= 500000
                    ? Math.floor(gasLimit * 3)
                    : Math.floor(gasLimit * 1.2);

                let suggestion_gas = await web3.value.eth.getGasPrice();
                suggestion_gas = Math.floor(suggestion_gas * 1.2);

                amc.methods.create(
                    token.value.name,
                    token.value.symbol,
                    token.value.supply
                ).send({
                    "from": addr,
                    "gasPrice": web3.value.utils.toHex(suggestion_gas),
                    gasLimit
                }).
                    then((r) => {

                        console.log(r);
                        if (r) {

                            showTokenModal.value = false;

                        } else {

                            alert("There was an error creating Token, please contact support@compdeep.com");

                        }

                    });

            },
            sendTokens = async function () {

                if (!(sendToken.value.to && sendToken.value.token && sendToken.value.amount)) {

                    console.log("bad token");
                    // showCreateTokenErrorModal.value = true;
                    return;

                }

                showTokenModal.value = true;
                const amount = web3.value.utils.toWei(sendToken.value.amount),

                    accounts = await ethereum.request({"method": "eth_requestAccounts"}),
                    addr = accounts[0],
                    amc = new web3.value.eth.Contract(
                        ERC20FactoryABI,
                        `${serverConfig.VUE_APP_ERC20_FACTORY_ADDRESS.value}`
                    );

                let gasLimit = await amc.methods.sendTokens(
                    sendToken.value.to,
                    sendToken.value.token,
                    amount
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
                gasLimit = gasLimit <= 500000
                    ? Math.floor(gasLimit * 3)
                    : Math.floor(gasLimit * 1.2);

                let suggestion_gas = await web3.value.eth.getGasPrice();
                suggestion_gas = Math.floor(suggestion_gas * 1.2);

                amc.methods.sendTokens(
                    sendToken.value.to,
                    sendToken.value.token,
                    amount
                ).send({
                    "from": addr,
                    "gasPrice": web3.value.utils.toHex(suggestion_gas),
                    gasLimit
                }).
                    then((e, r) => {

                        console.log(r);
                        if (r) {

                            showTokenModal.value = false;

                        } else {

                            alert("There was an error creating Token, please contact support@compdeep.com");

                        }

                    });

            },
            getToken = function (address) {

                getToken(route.params.address);

            },
            subscribeToNewTokens = async function () {

                // web3.eth.abi.encodeEventSignature('createNFTEvent')
                console.log("subscribeToNewTokens");

                const accounts = await ethereum.request({"method": "eth_requestAccounts"}),
                    addr = accounts[0],

                    options = {
                        "topics": [web3.value.utils.sha3("createNFTEvent(address,string,string,address,uint256,address)")]
                    },

                    subCreateToken = web3.value.eth.subscribe(
                        "logs",
                        options
                    );

                subCreateToken.on(
                    "error",
                    (err) => {

                        throw err;

                    }
                ).
                    on(
                        "connected",
                        (subscriptionId) => {

                            console.log(
                                "new tokens SubID: ",
                                subscriptionId
                            );

                        }
                    ).
                    on(
                        "data",
                        (event) => {

                            const t = web3.value.eth.abi.decodeLog(
                                [
                                    {"indexed": true,
                                        "internalType": "address",
                                        "name": "nft",
                                        "type": "address"},
                                    {"indexed": false,
                                        "internalType": "string",
                                        "name": "name",
                                        "type": "string"},
                                    {"indexed": false,
                                        "internalType": "string",
                                        "name": "symbol",
                                        "type": "string"},
                                    {"indexed": true,
                                        "internalType": "address",
                                        "name": "owner",
                                        "type": "address"},
                                    {"indexed": false,
                                        "internalType": "uint256",
                                        "name": "royaltyFee",
                                        "type": "uint256"},
                                    {"indexed": false,
                                        "internalType": "address",
                                        "name": "royaltyRecipient",
                                        "type": "address"}
                                ],
                                event.data,
                                [
                                    event.topics[1],
                                    event.topics[2]
                                ]
                            );

                            if (web3.value.utils.toChecksumAddress(t.owner) == web3.value.utils.toChecksumAddress(addr) && t.symbol == token.value.vue.symbol && !route.params.address) {

                                showTokenModal.value = false;

                            }

                        }
                    );

            };

        onMounted(() => {

            fetchMyTokens();

            if (hasCreateTokenSub.value === false) {

                subscribeToNewTokens();
                hasCreateTokenSub.value = true;

            }

            watch(
                serverConfig.chainId,
                () => {

                    token.value.chain_id = serverConfig.chainId.value;
                    fetchMyTokens();

                }
            );

        });

        return {"localize": translation.localize,
            contracts,
            createToken,
            sendTokens,
            sendToken,
            token,
            tokens,
            icon,
            web3,
            showTokenModal,
            getAccount,
            gotoContract,
            getToken,
            serverConfig,
            subscribeToNewTokens,
            hasCreateTokenSub,
            showTokenModal,
            fetchMyTokens,
            "icon": icon.get};

    }
};

</script>
<style scoped>
.define-nft-left {
  width: 30%;
  margin-right: 20px;
}
.margin-top {
  margin-top: 20px;
}
.titlecolor {
  color: #22255C;
}
.container {
  margin-top: -100px;
  text-align: left;
}
.paragraph {
  margin: 10px;
}
.title-mobile {
  margin-left: 0px;
}
.title-desktop {
  margin-left: 10px;
}
.text {
  color: #908ab9;
}
.createtitletext {
  color: #000;
}
.sub-title {
  color: #000;
  font-size: 1.2em;
}
.create-sub-header {
  margin-top: 20px;
  text-align: left;
  font-weight: bold;
  line-height: 35px;
  color: #22255C;
  font-size: 0.9em;
}
.sub-script {
  text-align: left;
  font-weight: bold;
  color: #afafaf;
  line-height: 30px;
  font-size: 0.8em;
}
.token-container {
  display: flex;
  flex-direction: column;
  padding: 10px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}
.create-upload-box {
  height: 150px;
  border: 1px solid #efefef;
  border-radius: 15px;
  margin-top: 10px;
  margin-bottom: 10px;
  opacity: 0.5;
  background: url("../assets/upload-icon.svg") #efefef;
  background-position: center;
  background-size: 10%;
  background-repeat: no-repeat;
}
.create-upload-box:hover {
  opacity: 1.0;
  cursor: pointer;
}
.file-items {
  padding: 10px;
  background-color: #eeebff;
  border-radius: 10px;
  font-size: 0.8em;
  margin-top: 10px;
  background: linear-gradient(1deg,#e5e5e5,transparent);
}
.file-name {
  color: #22255c;
  font-weight: bold;
  max-width: 40%;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 10px;
  white-space: nowrap;
}
.file-item {
  font-family: sans-serif;
  color: #a0a0a0;
  margin-right: 10px;
}
.remove-button {
  cursor: pointer;
  margin-right: 10px;
  font-weight: bold;
  color: #f7608a;
}
.create-token-preview-bg {
  flex-grow: 1;
  position: relative;
  overflow: hidden;
  border: 3px dashed #d295ff;
}
.create-token-preview-bg:hover {
  opacity: 0.5;
}
.create-token-container {
  padding: 20px;
  width: 33%;
}
.create-token-preview {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 40px;
  padding-left: 20px;
  border: 1px solid #fff;
  box-sizing: border-box;
  border-radius: 40px;
  justify-content: center;
}
.square {
  padding-bottom: 100%;
}
.smartphone-banner {
  padding-bottom: 16.667%;
}
/*
.ad191-1 {
  padding-bottom: 52.356%;
}
*/
.landscape {
  padding-bottom: 56.25%;
}
.portrait {
  padding-bottom: 177.78%;
}
.ad4-5 {
  padding-bottom: 125%;
}
.billboard {
  padding-bottom: 25.7%;
}
.leaderboard {
  padding-bottom: 12.36%;
}
.medium-rectangle {
  padding-bottom: 83.33%;
}
.halfpage {
  padding-bottom: 200%;
}
.wide-skyscraper {
  padding-bottom: 266%;
}
.skyscraper {
  padding-bottom: 375%;
}
.upload-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}
.token-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.create-details {
  margin-top: 20px;
}
.create-targeting {
  margin-top: 20px;
}
h2.createtitletext {
  text-align: left;
  color: #22255C;
}
.vspace {
  width: 100%;
  height: 20px;
}
.nowrap {
  flex-wrap: nowrap;
}
.create-item {
  margin-top: 20px;
}
.spend-item {
  margin-top: 20px;
  width: 150px;
}
.create-token-unit {
  color: #22255c;
  margin-left: 20px;
  font-weight: bold;
  font-size: 1.0em;
  margin-right: 10px;
  flex-wrap: nowrap;
}
.pointer {
  cursor: pointer;
}
.create-save-token-button {
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
.create-token-title {
  font-weight: 600;
  font-family: sans-serif;
  text-decoration: none;
  color: var(--msft-card-font-color);
  font-size: var(--msft-article-heading-font-size, 1.2em);
  line-height: var(--msft-article-heading-line-height, 24px);
  -webkit-line-clamp: var(--heading-max-lines, 3);
  text-align: center;
  margin: 10px;
  outline: 0px;
}
.flex-row {
  display: flex;
  flex-direction: row;
}
.flex-col {
  display: flex;
  flex-direction: column;
}
.step-1-container {
  display: flex;
  flex-direction: row;
  width: 1200px;
}
.step-2-3-container {
  display: flex;
  flex-direction: row;
  justify-content: inherit;
}
.step-2-3-container-left {
  width: 50%;
}
.contract-items {
  display: flex;
  margin-top: 18px;
}
</style>
