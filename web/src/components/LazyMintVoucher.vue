<template>
  <div>
    <div
      v-cloak
      class="mint-creative-preview"
      @click="$emit('scroll')"
    >
      <video
        v-if="nft.metadata.animation_url"
        class="mint-video-creative"
        loop="true"
        autoplay="autoplay"
        :src="displayImage(nft.metadata.animation_url)"
        muted
      />
      <img
        v-else-if="nft.metadata.image"
        class="mint-image-creative"
        :src="displayImage(nft.metadata.image)"
      >
    </div>

    <slot
      name="navigate"
    />

    <slot
      name="metadata"
    >
      <div class="mint-token-header-container">
        <div class="mint-token-header">
          <h3> {{ nft.metadata.name }} </h3>
          <div>
            <Markdown
              v-if="nft.metadata.description"
              :source="nft.metadata.description"
              class="collection-description"
            />
          </div>
          <div class="margin-top">
            <div>
              {{ localize('TEXT_MINT_SUPPLY') }} : {{ nft.metadata.supply }}
            </div>
            <div>
              {{ localize('TEXT_PRICE') }} : {{ nft.metadata.mintprice }}
            </div>
          </div>
          <div
            v-if="nft.metadata.properties"
          >
            <div
              class="margin-top flex-row"
            >
              <div>
                {{ localize('TEXT_LANGUAGES') }} : &nbsp;
              </div>
              <div
                v-for="(v,k) in nft.metadata.properties.contents"
              >
                {{ localize('TEXT_LANG_CODE_' + k) }} &nbsp;
              </div>
            </div>
            <div
              v-if="nft.metadata.properties.author"
              class="margin-top"
            >
              {{ localize('TEXT_NFT_PROPERTIES_AUTHOR') }} : {{ nft.metadata.properties.author }}
            </div>
            <div
              v-if="nft.metadata.properties.isbn"
              class="margin-top"
            >
              {{ localize('TEXT_NFT_PROPERTIES_ISBN') }} : {{ nft.metadata.properties.isbn }}
            </div>
            <div
              v-if="nft.metadata.properties.edition"
              class="margin-top"
            >
              {{ localize('TEXT_NFT_PROPERTIES_EDITION') }} : {{ nft.metadata.properties.edition }}
            </div>
            <div
              v-if="nft.metadata.properties.editors"
              class="margin-top"
            >
              {{ localize('TEXT_NFT_PROPERTIES_EDITORS') }} : {{ nft.metadata.properties.editors }}
            </div>
            <div
              v-if="nft.metadata.properties.contributors"
              class="margin-top"
            >
              {{ localize('TEXT_NFT_PROPERTIES_CONTRIBUTORS') }} : {{ nft.metadata.properties.contributors }}
            </div>
          </div>
        </div>
        <div class="mint-token-header">
          <h4>Attributes</h4>
        </div>
        <div
          class="mint-token-attribute-container"
        >
          <div
            v-for="i in nft.metadata.attributes"
          >
            <div
              v-if="i.value"
              class="mint-token-attribute"
            >
              {{ i.trait_type }}
              <div class="mint-token-value">
                {{ i.value }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </slot>
  </div>
</template>
<script>

import {iconStore} from "@/stores/icon";
import Markdown from "vue3-markdown-it";
import {emit, inject, onMounted, reactive, ref, toRefs, watch, watchEffect} from "vue";
import {translationStore} from "@/stores/translation";
import Axios from "axios";
import {rareiumMarketplaceABI, rareiumNFTABI, rareiumPlatformABI} from "../abi.js";

export default {
    "name": "LazyMintVoucher",
    "components": {
        Markdown
    },
    "props": {
        "nft": Object
    },
    "emits": ["scroll"],
    setup (props, {emit}) {

        const translation = translationStore(),
            serverConfig = inject("serverConfig"),
            route = inject("route"),
            router = inject("router"),
            icon = iconStore(),
            web3 = inject("web3"),
            nft = toRefs(props),
            NFTCategory = ref([
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
            scroll = function () {

                emit("scroll");

            },
            displayImage = function (i) {

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
            mintVoucher = async function (voucher) {

                const addr = await getAccount(),

                    amc = new web3.value.eth.Contract(
                        rareiumNFTABI,
                        nft.address
                    );

                let gasLimit = await amc.methods.lazyMint(
                    addr,
                    voucher
                ).estimateGas(
                    {
                        "value": voucher.price,
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

                await amc.methods.lazyMint(
                    addr,
                    voucher
                ).send({
                    "from": addr,
                    "value": voucher.price,
                    "gasPrice": web3.value.utils.toHex(gasPrice),
                    gasLimit
                }).
                    then((jsonRpcResult) => {

                        console.log(jsonRpcResult);

                    });

            };

        onMounted(() => {

            console.log("nft");
            console.log(nft);

        });

        return {"localize": translation.localize,
            serverConfig,
            web3,
            scroll,
            NFTCategory,
            NFTMedia,
            displayImage,
            "icon": icon.get};

    }
};

</script>
<style scoped>

.mint-creative-preview {
  flex-wrap: nowrap;
  box-sizing: border-box;
  -webkit-backdrop-filter: blur(9.60224px);
  backdrop-filter: blur(9.60224px);
  border-radius: 20px;
}
video.mint-video-creative {
  width: 100%;
  overflow: none;
  cursor: pointer;
  border-radius: 15px;
  object-fit: cover;
}
img.mint-image-creative {
  width: 100%;
  overflow: none;
  cursor: pointer;
  border-radius: 15px;
  object-fit: cover;
}
.mint-token-header-contaner {
  background: #ffffffde;
  padding: 20px;
  border-radius: 20px;
}
.mint-token-header {
  margin: 10px;
}
.mint-token-attribute-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: left;
}
.mint-token-attribute {
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
.token-info-box-item-symbol {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  font-size: 0.8em;
  border-bottom: 10px solid #e9dbff;
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
.mint-token-header-container {
  padding: 10px;
  border-radius: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  color: rgb(255, 255, 255);
}
.margin-top {
  margin-top: 5px;
}

</style>
