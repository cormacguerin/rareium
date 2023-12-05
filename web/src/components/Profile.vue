<template>
  <div>
    <div class="profile-bg-head" />

    <h2 class="nft-collection">
      {{ localize('PROFILE_COLLECTED_NFTS') }}
    </H2>

    <div class="flex-row-wrap">
      <NFTCard
        v-for="(n,i) in tokens"
        :id="n.id"
        :key="n.id"
        :address="n.nft_address"
        :owner="n.owner"
        :metadata="n.data"
        :metadata_url="n.metadata_url"
        :token_id="n.token_id"
      />
    </div>
  </div>
</template>
<script>

import {iconStore} from "@/stores/icon";
import {inject, onMounted, reactive, ref, watch} from "vue";
import {translationStore} from "@/stores/translation";
import {shinoViMarketplaceABI, shinoViNFTABI, shinoViPlatformABI} from "../abi.js";
import Axios from "axios";
import FormData from "form-data";

export default {
    "name": "Profile",
    "components": {
    },
    "props": {
    },
    setup () {

        const account = ref(null),
            icon = iconStore(),
            web3 = inject("web3"),
            serverConfig = inject("serverConfig"),
            translation = translationStore(),
            tokens = reactive([]),
            getTokenURI = async function (address, token_id, owner, nft_address, id, callback) {

                const amc = new web3.value.eth.Contract(
                    shinoViNFTABI,
                    address
                );
                amc.methods.tokenURI(token_id).
                    call().
                    then((jsonRpcResult) => {

                        callback(
                            token_id,
                            owner,
                            jsonRpcResult,
                            nft_address,
                            id
                        );

                    });

            },
            getIcon = function (i) {

                if (serverConfig.visualMode === "dark") {

                    return icon.get(`${i}_DARK`);

                }
                return icon.get(`${i}_LIGHT`);

            },
            getAccount = async function () {

                const acc = await web3.value.eth.getAccounts();

                if (acc.length > 0) {

                    return acc[0];

                } else if (window.ethereum) {

                    const accounts = await ethereum.request({"method": "eth_requestAccounts"});
                    return accounts[0];

                }

                console.log("window.location = 'https://metamask.io'");
                return null;


            },
            getTokensByOwnerAddress = async function (address) {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}getTokensByOwnerAddress`,
                    {

                        "params": {

                            address

                        }

                    }
                ).
                    then((response) => {

                        tokens.splice(0);

                        for (let i = 0; i < response.data.length; i++) {

                            getTokenURI(
                                response.data[i].nft_address,
                                response.data[i].token_id,
                                response.data[i].owner,
                                response.data[i].nft_address,
                                response.data[i].id,
                                (token_id, owner, uri, nft_address, id) => {

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

                                            tokenData.nft_address = nft_address;
                                            tokenData.token_id = token_id;
                                            tokenData.owner = owner;
                                            tokenData.id = id;
                                            tokens.push(tokenData);

                                        }).
                                        catch((error) => {

                                            throw error;

                                        });

                                }
                            );

                        }

                    });

            };

        onMounted(async () => {

            const addr = await getAccount();

            getTokensByOwnerAddress(addr);

        });


        return {"localize": translation.localize,
            "icon": icon.get,
            serverConfig,
            getAccount,
            getTokenURI,
            getTokensByOwnerAddress,
            tokens};

    }

};

</script>
<style scoped>
h2.nft-collection {
  margin: 100px 10px;
  text-align: left;
  font-size: 2em;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
input.profile-avatar {
  display: none;
}
.subtitle {
  max-width: 500px;
  padding: 20px;
  font-size: 3em;
  font-size: 1.0em;
  line-height: 30px;
  text-align: left;
}
a.contactus {
  color: #322e6a;
  text-decoration: underline;
  cursor: pointer;
}
.flex-row {
  display: flex;
  flex-direction: row;
}
.flex-col {
  display: flex;
  flex-direction: column;
}
.profile-bg-head {
  position: relative;
  height: 500px;
  width: 100%;
  background: url(../assets/profile-bg.jpg);
  background-size: cover;
}
.profile-card {
  height: 760px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.profile-bg-main {
  position: relative;
  height: 500px;
  width: 100%;
  background: #fff;
}
.profile-card-outer {
  position: relative;
  width: 700px;
  border-radius: 10px;
  background-repeat: no-repeat;
  background-size: contain;
  background: url(../assets/gradient-purple-hexagonal.jpg);
  z-index: 1;
}
.profile-corner-cut-out {
  width: 0;
  height: 0;
  border-left: 25px solid transparent;
  border-right: 0px solid transparent;
  border-bottom: 50px solid #555;
  background-color: white;
  float: right;
  top: 10px;
  bottom: 0;
}
.profile-card-inner {
  display: flex;
  flex-direction: column;
  margin: 20px;
  padding: 20px;
  background-color: white;
  overflow: hidden;
}
.profile-card-content {
  text-align: left;
  display: flex;
  flex-direction: row;
}
img.profile-card-avatar {
  width: 128px;
  height: 128px;
}
.profile-card-details {
  display: flex;
  margin: 10px;
  flex-direction: column;
  text-overflow: elepsis;
  overflow: hidden;
  white-space: nowrap;
}
.profile-card-name {
  font-size: 1.4em;
  font-weight: bold;
  text-overflow: elepsis;
  overflow: hidden;
  white-space: nowrap;
  margin: 5px;
}
.profile-card-address {
  margin-top: 8px;
  font-size: 0.8em;
}
.profile-card-website {
  font-weight: bold;
  margin: 5px;
}
.profile-card-text {
  height: 120px;
  font-weight: 0.9em;
  color: #777E90;
  text-align: left;
}
.profile-card-controls {
  display: flex;
  flex-direction: row;
}
.profile-card-edit {
  display: flex;
  flex-direction: column;
  color: #fff;
  justify-content: center;
  font-weight: 700;
  margin-left: 20px;
  border-radius: 25px;
  width: 100px;
  height: 30px;
  text-align: center;
  padding: 10px;
  background: linear-gradient(45deg, #4b8bff, #cf1ec1);
  cursor: pointer;
}
.profile-card-upload {
  margin-left: 10px;
  border-radius: 25px;
  width: 30px;
  border: 1px solid #b7b7b7;
  padding: 10px;
  cursor: pointer;
}
.profile-svg-icon {
  margin: 5px;
  width: 20px;
  height: 20px;
}
.profile-contents {
  margin-left: auto;
  margin-right: auto;
  max-width: 1200px;
}
.profile-textarea {
  padding: 10px;
  margin-top: 10px;
  max-width: 100%;
  height: 150px;
  font-size: .9em;
  box-sizing: border-box;
  border: 2px solid #dfdfdf;
  border-radius: 15px;
}
.profile-save-button {
  display: flex;
  margin-top: 20px;
  margin-bottom: 20px;
  align-items: center;
  width: 50px;
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
.flex-row-wrap {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
}
</style>

