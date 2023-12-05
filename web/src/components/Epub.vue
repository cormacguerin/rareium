<template>
  <div class="reader-outer-container">
    <div class="reader-container">
      <div
        v-if="bibiUrl"
        class="reader-preview"
      >
        <iframe
          style="width: 100%; height: 480px;"
          class="bibi-frame"
          frameborder="0"
          scrolling="auto"
          allowfullscreen="true"
          :src="bibiUrl"
        />
      </div>
    </div>
  </div>
</template>

<script>

import {computed, defineExpose, inject, onMounted, reactive, ref, toRefs, watch} from "vue";
import {translationStore} from "@/stores/translation";

export default {
    "name": "Loading",
    "components": {
    },
    "props": {
        "epub": Object,
        "nft_address": String,
        "chain_id": String
    },
    setup (props, {emit}) {

        const translation = translationStore(),
            input = toRefs(props),
            web3 = inject("web3"),
            book = ref(),
            bibiUrl = ref(),
            chainId = ref(),
            account = ref(),
            isPreview = ref(true),
            rendition = ref(null),
            serverConfig = inject("serverConfig"),
            scaleRatio = ref(2),
            epubSrc = function () {

                if (input.epub.value && chainId.value && account.value) {

                    // ACL info
                    const queryParams = {

                            "contractAddress": input.nft_address.value,
                            "userAddress": account.value,
                            "chainId": chainId.value,
                            "tokenId": 0

                        },

                        // Convert the query parameters object into a query string
                        queryString = Object.keys(queryParams).
                            map((key) => `${key}=${encodeURIComponent(queryParams[key])}`).
                            join("&"),

                        // Combine the base URL and the query string
                        baseSrc = `${process.env.VUE_APP_SERVER_URI}bibi/?book=${input.epub.value}`;
                    bibiUrl.value = queryString
                        ? `${baseSrc}&${queryString}`
                        : baseSrc;
                    console.log("bibiUrl.value");
                    console.log(bibiUrl.value);

                }

            },
            getAccount = async function (callback) {

                const acc = await web3.value.eth.getAccounts();

                if (acc.length > 0) {

                    account.value = acc[0];
                    callback(account.value);
                    return acc[0];

                } else if (window.ethereum) {

                    const accounts = await ethereum.request({"method": "eth_requestAccounts"});
                    account.value = acc[0];
                    callback(account.value);


                } else {

                    console.log("window.open(https://metamask.io");
                    window.open("https://metamask.io");

                }

            },
            toggleView = async function () {

                window.open(
                    bibiUrl.value,
                    "_blank"
                );

            };

        defineExpose({

            toggleView

        });

        onMounted(() => {

            if (input.chain_id.value === 137) {

                chainId.value = "matic";

            } else if (input.chain_id.value === 1) {

                chainId.value = "eth";

            }

            getAccount(() => {

                epubSrc();

            });

            const epubScript = document.createElement("script");

            epubScript.setAttribute(
                "src",
                `${process.env.VUE_APP_SERVER_URI}bibi/and/jo.js`
            );
            document.head.appendChild(epubScript);

            watch(

                () => serverConfig.windowWidth,
                () => {
                }
            );

            watch(

                () => input.epub.value,
                () => {

                    console.log("input.epub.value");
                    console.log(input.epub.value);

                    epubSrc();

                }
            );

            watch(

                () => input.epub,
                () => {

                    console.log("input.epub");
                    console.log(input.epub);

                    epubSrc();

                }
            );

        });

        return {

            isPreview,
            getAccount,
            translation,
            epubSrc,
            bibiUrl,
            toggleView,
            book,
            serverConfig

        };


    }

};
</script>

<style scoped>

.reader-outer-container {
  font-family: sans-serif;
  text-align: center;
  display: flex;
  width: 100%;
}

.reader-container {
  flex: 0 1 50%;
  margin: 0 auto;
}

#reader {
}

.reader-preview {
  height: 500px;
  width: 100%;
  height: 5
/*
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 50px;
*/
}

.inner {
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.inner.one {
  left: 0%;
  top: 0%;
  animation: rotate-one 1s linear infinite;
  border-bottom: 3px solid #ff0081;
}

.inner.two {
  right: 0%;
  top: 0%;
  animation: rotate-two 1s linear infinite;
  border-right: 3px solid #ff0081;
}

.inner.three {
  right: 0%;
  bottom: 0%;
  animation: rotate-three 1s linear infinite;
  border-top: 3px solid #ff0081;
}

@keyframes rotate-one {
  0% {
    transform: rotateX(35deg) rotateY(-45deg) rotateZ(0deg);
  }
  100% {
    transform: rotateX(35deg) rotateY(-45deg) rotateZ(360deg);
  }
}

@keyframes rotate-two {
  0% {
    transform: rotateX(50deg) rotateY(10deg) rotateZ(0deg);
  }
  100% {
    transform: rotateX(50deg) rotateY(10deg) rotateZ(360deg);
  }
}

@keyframes rotate-three {
  0% {
    transform: rotateX(35deg) rotateY(55deg) rotateZ(0deg);
  }
  100% {
    transform: rotateX(35deg) rotateY(55deg) rotateZ(360deg);
  }
}
</style>
