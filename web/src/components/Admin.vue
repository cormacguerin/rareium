<template>
  <div>
    <div class="admin-bg-head">
      <div class="admin-contents">
        <div>
          <h1 style="color: #ca7fdd; padding-top: 20px;">
            Admin Panel
          </h1>
        </div>

        <h1>Basic Admin Controls </h1>

        <Carousel
          v-if="loadCarousel"
          id="gallery"
          v-model="currentSlide"
          :wrap-around="true"
          :items-to-show="1.15"
        >
          <Slide
            v-for="(i,j) in creatorfolios"
            :key="j"
          >
            <CreatorFolio
              :title="i.title"
              :about="i.about"
              :image="i.image"
              :video="i.video"
              :video-thumbnail="i.videoThumbnail"
              :effect="i.effect"
              :primary-color="i.primaryColor"
              :secondary-color="i.secondaryColor"
              :refresh="i.refresh"
              :n="i.n"
              class="folio-style"
              @click="gotoTab(i.name)"
            />
          </Slide>

          <template #addons>
            <Navigation />
          </template>
        </Carousel>

        <div class="admin-box">
          <h2>Manage Creators</h2>
          <br>
          <div class="o-flex-grid w-100 c-grid">
            <div class="o-flex-grid--item-a">
              Id
            </div>
            <div class="o-flex-grid--item-b">
              Name
            </div>
            <div class="o-flex-grid--item-c">
              Address
            </div>
            <div class="o-flex-grid--item-d">
              GeoIP
            </div>
            <div class="o-flex-grid--item-e">
              Promoted
            </div>
            <div class="o-flex-grid--item-f">
              Remove
            </div>
          </div>
          <div v-for="(c,i) in creators">
            <div class="o-flex-grid w-100 c-grid">
              <div class="o-flex-grid--item-a">
                {{ c.id }}
              </div>
              <div class="o-flex-grid--item-b">
                {{ c.name }}
              </div>
              <div class="o-flex-grid--item-c">
                {{ c.email }}
              </div>
              <div
                v-if="c.geoip.length > 0"
                class="o-flex-grid--item-d"
              >
                <div
                  v-for="i in c.geoip"
                >
                  <span
                    v-if="i"
                  >
                    {{ i }}
                  </span>
                </div>
              </div>
              <div
                class="o-flex-grid--item-e"
                @click="togglePromoted(c.id, c.promoted)"
              >
                {{ c.promoted }}
              </div>
              <div
                class="o-flex-grid--item-f"
                @click="removeCreatorOnChain(c.id,c.addresses)"
              >
                <b>X</b>
              </div>
            </div>
          </div>
        </div>

        <div class="admin-box">
          <h2>Set News Box</h2>

          <div
            v-for="(j,i) in news"
            :key="j.id"
          >
            <div class="flex-row">
              <div class="flex-col">
                <div class="flex-row-end">
                  <CInput
                    class="admin-box-margin"
                    :value="j.title"
                    :title="localize('NEWS_ITEM_TITLE')"
                    :placeholder="localize('NEWS_ITEM_ITLE')"
                    @inputValue="j.title = $event"
                  />
                  <CInput
                    class="admin-box-margin"
                    :value="j.text"
                    :title="localize('NEWS_ITEM_TEXT')"
                    :placeholder="localize('TEXT_ITEM_TEXT')"
                    @inputValue="j.text= $event"
                  />
                </div>
                <div class="flex-row-end">
                  <CInput
                    class="admin-box-margin"
                    :value="j.link"
                    :title="localize('NEWS_ITEM_PATH')"
                    :placeholder="localize('TEXT_ITEM_PATH')"
                    @inputValue="j.link = $event"
                  />
                  <div class="news-image-container">
                    <label
                      :id="'file-label-' + j.id"
                      :for="'img' + j.id"
                      class="file-label"
                    />
                    <input
                      :id="'img' + j.id"
                      type="file"
                      :name="'img' + j.id"
                      accept="image/*"
                      class="news-image-input"
                      @input="setNewsImage"
                    >
                  </div>
                  <div>
                    <div
                      class="admin-save-button"
                      @click="setNewsItems(j.id)"
                    >
                      {{ localize('TEXT_SET') }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex-row home-news-container-desktop">
                <img
                  class="home-news-image"
                  :src="newsImg[j.id]"
                >
                <div class="news-text">
                  <div class="news-text">
                    <b>{{ j.title }}</b>
                  </div>
                  <div class="news-text">
                    {{ j.text }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h1>Web 3 Admin Controls</h1>

        <div class="admin-box">
          <h2>Enable Creator</h2>
          <br>
          <div>
            <div
              class="admin-save-button"
              @click="showCreatorModal = true"
            >
              {{ localize('ADD_CREATOR') }}
            </div>
          </div>
          <br>
          <h2>Set Creator Platform Fees</h2>
          <CInput
            class="admin-box-margin"
            :value="creatorAddress"
            :title="localize('CREATOR_ADDRESS')"
            :placeholder="localize('TEXT_COLLECTION_NAME_PLACEHOLDER')"
            @inputValue="creatorAddress = $event"
          />
          <div class="admin-buttom-end">
            <CInput
              class="admin-box-margin"
              :value="platformAAddress"
              :title="localize('PLATFORM_A_ADDRESS')"
              :placeholder="localize('TEXT_COLLECTION_NAME_PLACEHOLDER')"
              @inputValue="platformAAddress = $event"
            />
            <CInput
              class="admin-box-margin"
              :value="platformAFee"
              :title="localize('PLATFORM_A_FEE')"
              :placeholder="localize('TEXT_COLLECTION_NAME_PLACEHOLDER')"
              @inputValue="platformAFee = $event"
            />
          </div>
          <div class="admin-buttom-end">
            <CInput
              class="admin-box-margin"
              :value="platformBAddress"
              :title="localize('PLATFORM_B_ADDRESS')"
              :placeholder="localize('TEXT_COLLECTION_NAME_PLACEHOLDER')"
              @inputValue="platformBAddress = $event"
            />
            <CInput
              class="admin-box-margin"
              :value="platformBFee"
              :title="localize('PLATFORM_B_FEE')"
              :placeholder="localize('TEXT_COLLECTION_NAME_PLACEHOLDER')"
              @inputValue="platformBFee = $event"
            />
          </div>
          <div>
            <div
              class="admin-save-button"
              @click="setCustomFees"
            >
              {{ localize('SET_CUSTOM_FEES') }}
            </div>
          </div>
        </div>
        <h1> {{ localize('ADMIN_DANGER_ZONE') }} </h1>
        <div class="admin-box">
          <h2> {{ localize('SET_DEFAULT_FEES') }} </h2>
          <div class="admin-buttom-end">
            <CInput
              class="admin-box-margin"
              :value="platformAAddress"
              :title="localize('PLATFORM_A_ADDRESS')"
              :placeholder="localize('TEXT_COLLECTION_NAME_PLACEHOLDER')"
              @inputValue="platformAAddress = $event"
            />
            <CInput
              class="admin-box-margin"
              :value="platformAFee"
              :title="localize('PLATFORM_A_FEE')"
              :placeholder="localize('TEXT_COLLECTION_NAME_PLACEHOLDER')"
              @inputValue="platformAFee = $event"
            />
          </div>
          <div class="admin-buttom-end">
            <CInput
              class="admin-box-margin"
              :value="platformBAddress"
              :title="localize('PLATFORM_B_ADDRESS')"
              :placeholder="localize('TEXT_COLLECTION_NAME_PLACEHOLDER')"
              @inputValue="platformBAddress = $event"
            />
            <CInput
              class="admin-box-margin"
              :value="platformBFee"
              :title="localize('PLATFORM_B_FEE')"
              :placeholder="localize('TEXT_COLLECTION_NAME_PLACEHOLDER')"
              @inputValue="platformBFee = $event"
            />
          </div>
          <div>
            <div
              class="admin-save-button"
              @click="setPlatformFees"
            >
              {{ localize('SET_PLATFORMFEES') }}
            </div>
          </div>
        </div>
        <div class="admin-box">
          <CInput
            class="admin-box-margin"
            :value="nftFactoryAddress"
            :title="localize('NFT_FACTORY_ADDRESS')"
            :placeholder="localize('TEXT_COLLECTION_NAME_PLACEHOLDER')"
            @inputValue="nftFactoryAddress = $event"
          />
          <div>
            <div
              class="admin-save-button"
              @click="setNFTFactoryAddress"
            >
              {{ localize('SET_NFT_FACTORY_ADDRESS') }}
            </div>
          </div>
        </div>
        <div class="admin-box">
          <div>
            <div
              class="admin-save-button"
              @click="showAdminModal = true"
            >
              {{ localize('ADD_ADMIN') }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="admin-bg-main" />
    <CModal
      v-if="showAdminModal"
      width="medium"
      color="#5d328d"
      :title="localize('ADD_CREATOR')"
      @close="showAdminModal = false"
    >
      <template #header>
        <div> Edit Admin </div>
      </template>
      <template #body>
        <div class="flex-col">
          <CInput
            :value="pAdmin"
            :title="localize('TEXT_ADDRESS')"
            :placeholder="localize('PROFILE_NAME_PLACEHOLDER')"
            type="string"
            class="admin-item"
            @inputValue="pAdmin = $event"
          />
          <div
            class="cinputTitle"
          >
            {{ localize('TEXT_ABOUT') }}
          </div>
          <div>
            <div
              class="admin-save-button"
              @click="addAdminOnChain"
            >
              {{ localize('TEXT_ADD_ADMIN') }}
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="hidden" />
      </template>
    </CModal>
    <CModal
      v-if="showCreatorModal"
      width="medium"
      color="#5d328d"
      :title="localize('ADD_CREATOR')"
      @close="showCreatorModal = false"
    >
      <template #header>
        <div> Edit Admin </div>
      </template>
      <template #body>
        <div class="flex-col">
          <CInput
            :value="pAccount"
            :title="localize('TEXT_ADDRESS')"
            :placeholder="localize('PROFILE_NAME_PLACEHOLDER')"
            type="string"
            class="admin-item"
            @inputValue="pAccount = $event"
          />
          <div v-if="pUserId">
            {{ localize('TEXT_FOUND') }}
          </div>
          <div
            class="cinputTitle"
          >
            {{ localize('TEXT_ABOUT') }}
          </div>
          <div>
            <div
              class="admin-save-button"
              @click="addCreatorOnChain"
            >
              {{ localize('TEXT_ADD_CREATOR') }}
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="hidden" />
      </template>
    </CModal>
  </div>
</template>
<script>

import {iconStore} from "@/stores/icon";
import {Carousel, Navigation, Pagination, Slide, toRaw} from "vue3-carousel";
import {inject, onMounted, reactive, ref, watch} from "vue";
import {translationStore} from "@/stores/translation";
import Axios from "axios";
import FormData from "form-data";
import CreatorFolio from "./CreatorFolio.vue";
import {rareiumPlatformABI} from "../abi.js";

export default {
    "name": "Admin",
    "components": {
        CreatorFolio,
        Carousel,
        Slide,
        Pagination,
        Navigation
    },
    "props": {
    },
    setup () {

        const icon = iconStore(),
            serverConfig = inject("serverConfig"),
            translation = translationStore(),
            userInfo = inject("userInfo"),
            loadCarousel = ref(false),
            currentSlide = ref(""),
            newsImg = reactive({}),
            creatorfolios = reactive([]),
            showCreatorModal = ref(false),
            showAdminModal = ref(false),
            nftFactoryAddress = ref(""),
            creatorAddress = ref(""),
            platformAAddress = ref("0xa44D4A769a4e4A9914b83e91Df2a2848781Ea44a"),
            platformAFee = ref(""),
            platformBAddress = ref("0x820Ac7703768638C5F539aC7C5Ac08d7811c754C"),
            platformBFee = ref(""),
            pAccount = ref(""),
            pAdmin = ref(""),
            pUserId = ref(""),
            news = reactive([]),
            web3 = inject("web3"),
            creators = reactive([]),
            // plain JS functions
            togglePromoted = function (id, current) {

                let value = false;

                if (current === false) {

                    value = true;

                }

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}togglePromoted`,
                    {
                        "params": {
                            value,
                            id
                        }
                    }
                ).
                    then((response) => {

                        console.log(response.data);
                        getCreators();
                        getFolios();

                    });

            },
            getNews = function () {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}getNews`,
                    {
                    }
                ).
                    then((response) => {

                        console.log(response.data);
                        for (const i in response.data) {

                            news.push(response.data[i]);

                            const id = response.data[i].id;
                            newsImg[id] = `/public/images/news_item_${id}.png` + `?t=${Date.now()}`;

                        }

                    });

            },
            setNewsItems = function (i) {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}setNews`,
                    {
                        "params": {
                            "news": JSON.stringify(news[i])
                        }
                    }
                ).
                    then((response) => {

                        console.log(response.data);
                        if (response.status === 200) {

                        }

                    });

            },
            setNewsImage = function (e) {

                if (e.target.files[0].type != "image/png") {

                    alert("pngのみをアップロードしてください");
                    return;

                }

                if (e.target.files[0].size > 110000) {

                    alert("ファイルサイズは100k未満である必要があります");
                    return;

                }

                const id = e.target.id.charAt(3);
                newsImg[id] = "/public/images/dot-loading.gif";

                const data = new FormData();
                data.append(
                    "id",
                    e.target.id.charAt(3)
                );
                data.append(
                    "file",
                    e.target.files[0]
                );
                Axios.post(

                    `${process.env.VUE_APP_SERVER_URI}addNewsImage`,
                    data,
                    {

                        "headers": {

                            "Content-Type": "multipart/form-data"
                            // "Content-Type": "application/json"

                        }

                    }


                ).
                    then((response) => {

                        if (response.data) {

                            setTimeout(
                                () => {

                                    newsImg[id] = `/public/images/news_item_${id}.png` + `?t=${Date.now()}`;

                                },
                                3000
                            );

                        }

                    });

            },
            getIcon = function (i) {

                if (serverConfig.visualMode === "dark") {

                    return icon.get(`${i}_DARK`);

                }
                return icon.get(`${i}_LIGHT`);

            },
            genRandStr = function () {

                return (new Date().getSeconds() * Math.random()).toString(36).replace(
                    ".",
                    ""
                );

            },
            getCreatorOnChain = async function (user_address, index) {

                if (web3.value.utils.isAddress(user_address) === true) {

                    const accounts = await ethereum.request({"method": "eth_requestAccounts"}),
                        addr = accounts[0],

                        amc = new web3.value.eth.Contract(
                            rareiumPlatformABI,
                            `${serverConfig.VUE_APP_PLATFORM_ADDRESS}`
                        );

                    amc.methods.isRareiumCreator(user_address).send({"from": addr}).
                        then((jsonRpcResult) => {

                            if (jsonRpcResult === true) {

                                creators[index].addresses = user_address;

                            }

                        });

                } else {

                    alert("please provide a vaid ethereum address");

                }

            },
            getNFTFactoryAddress = async function () {

                /*
                 *amc accounts = await ethereum.request({"method": "eth_requestAccounts"}),
                 *addr = accounts[0];
                 *
                 *const amc = new web3.value.eth.Contract(rareiumPlatformABI, `${serverConfig.VUE_APP_PLATFORM_ADDRESS}`);
                 *amc = await myContract.methods.getRareiumMultiNFTFactory().call()
                 */
            },
            setNFTFactoryAddress = async function () {

                if (nftFactoryAddress.value) {

                    if (web3.value.utils.isAddress(nftFactoryAddress.value) === true) {

                        const accounts = await ethereum.request({"method": "eth_requestAccounts"}),
                            addr = accounts[0],

                            amc = new web3.value.eth.Contract(
                                rareiumPlatformABI,
                                `${serverConfig.VUE_APP_PLATFORM_ADDRESS}`
                            ),
                            gasEstimate = await amc.methods.setRareiumNFTFactory(nftFactoryAddress.value).estimateGas({"from": addr,
                                "gas": 100000});

                        console.log(gasEstimate);

                        const _gas = Math.ceil(gasEstimate * 1.1);
                        console.log(`new gas suggestion : ${_gas}`);

                        amc.methods.setRareiumNFTFactory(nftFactoryAddress.value).send({"from": addr}).
                            then((jsonRpcResult) => {

                                console.log("jsonRpcResult");

                            });

                    } else {

                        alert("please provide a vaid ethereum address");

                    }

                }

            },
            setCustomFees = async function () {

                console.log("creatorAddress.value");
                console.log(creatorAddress.value);
                console.log("[platformAAddress.value,platformAFee.value,platformBAddress.value,platformBFee.value]");
                console.log([
                    platformAAddress.value,
                    platformAFee.value,
                    platformBAddress.value,
                    platformBFee.value
                ]);
                if (platformAAddress.value && platformAFee.value && platformBAddress.value && platformBFee.value) {

                    console.log("XX");

                    if (web3.value.utils.isAddress(platformAAddress.value) === true &&
                      web3.value.utils.isAddress(platformBAddress.value)) {

                        console.log("YY");

                        const accounts = await ethereum.request({"method": "eth_requestAccounts"}),
                            addr = accounts[0],

                            amc = new web3.value.eth.Contract(
                                rareiumPlatformABI,
                                `${serverConfig.VUE_APP_PLATFORM_ADDRESS}`
                            );

                        /*
                         *var gasLimit = await amc.methods.setCustomFees(
                         *    creatorAddress.value,
                         *    [platformAAddress.value,platformAFee.value,platformBAddress.value,platformBFee.value]
                         *).estimateGas({from:addr, gas: 100000});
                         */
                        /*
                         *var gasLimit = await amc.methods.setCustomFees(
                         *    creatorAddress.value,
                         *    [platformAAddress.value,platformAFee.value,platformBAddress.value,platformBFee.value]
                         *).estimateGas({from:addr, gas: 100000});
                         */
                        let suggestion_gas = await web3.value.eth.getGasPrice();
                        suggestion_gas = Math.floor(suggestion_gas * 1.2);

                        let gasLimit = 0;
                        gasLimit = gasLimit <= 300000
                            ? Math.floor(gasLimit * 4)
                            : Math.floor(gasLimit * 1.5);

                        amc.methods.setCustomFees(
                            creatorAddress.value,
                            [
                                platformAAddress.value,
                                platformAFee.value,
                                platformBAddress.value,
                                platformBFee.value
                            ]
                        ).send({
                            "from": addr,
                            "gasPrice": web3.value.utils.toHex(suggestion_gas),
                            gasLimit
                        }).
                            then((jsonRpcResult) => {

                                console.log("jsonRpcResult");

                            });

                    } else {

                        alert("please provide a vaid ethereum address");

                    }

                }

            },
            setPlatformFees = async function () {

                if (platformAAddress.value && platformAFee.value && platformBAddress.value && platformBFee.value) {

                    if (web3.value.utils.isAddress(platformAAddress.value) === true &&
                      web3.value.utils.isAddress(platformBAddress.value)) {

                        const accounts = await ethereum.request({"method": "eth_requestAccounts"}),
                            addr = accounts[0],

                            amc = new web3.value.eth.Contract(
                                rareiumPlatformABI,
                                `${serverConfig.VUE_APP_PLATFORM_ADDRESS}`
                            );
                        let gasLimit = await amc.methods.setDefaultFees([
                                platformAAddress.value,
                                platformAFee.value,
                                platformBAddress.value,
                                platformBFee.value
                            ]).estimateGas({"from": addr,
                                "gas": 100000}),

                            suggestion_gas = await web3.value.eth.getGasPrice();
                        suggestion_gas = Math.floor(suggestion_gas * 1.2);

                        gasLimit = gasLimit <= 300000
                            ? Math.floor(gasLimit * 4)
                            : Math.floor(gasLimit * 1.5);

                        amc.methods.setDefaultFees([
                            platformAAddress.value,
                            platformAFee.value,
                            platformBAddress.value,
                            platformBFee.value
                        ]).send({
                            "from": addr,
                            "gasPrice": web3.value.utils.toHex(suggestion_gas),
                            gasLimit
                        }).
                            then((jsonRpcResult) => {

                                console.log("jsonRpcResult");

                            });

                    } else {

                        alert("please provide a vaid ethereum address");

                    }

                }

            },
            addAdminOnChain = async function () {

                if (pAdmin.value) {

                    console.log("${serverConfig.VUE_APP_PLATFORM_ADDRESS}");
                    console.log(`${serverConfig.VUE_APP_PLATFORM_ADDRESS}`);

                    if (web3.value.utils.isAddress(pAdmin.value) === true) {


                        /*
                         *let accounts = await ethereum.request({"method": "eth_requestAccounts"}),
                         *    addr = accounts[0];
                         *    addr = web3.value.utils.toChecksumAddress(addr);
                         *    console.log(addr);
                         *
                         *const amc = new web3.value.eth.Contract(
                         *        rareiumPlatformABI,
                         *        `${serverConfig.VUE_APP_PLATFORM_ADDRESS}`
                         *    )
                         *
                         *    gasEstimate = await amc.methods.addRareiumAdmin(pAdmin.value).estimateGas({"from": addr,
                         *        "gas": 100000});
                         *
                         *console.log(gasEstimate);
                         *
                         *const _gas = Math.ceil(gasEstimate * 1.2);
                         *console.log(`new gas suggestion : ${_gas}`);
                         *
                         *amc.methods.addRareiumAdmin(pAdmin.value).send({"from": addr}).
                         *    then((jsonRpcResult) => {
                         *
                         *        console.log("jsonRpcResult");
                         *        console.log(jsonRpcResult);
                         *        // addAdmin();
                         *
                         *    });
                         */
                        const accounts = await ethereum.request({"method": "eth_requestAccounts"}),
                            addr = accounts[0],

                            amc = new web3.value.eth.Contract(
                                rareiumPlatformABI,
                                `${serverConfig.VUE_APP_PLATFORM_ADDRESS}`
                            );
                        let gasLimit = await amc.methods.addRareiumAdmin(pAdmin.value).estimateGas({"from": addr,
                                "gas": 100000}),

                            suggestion_gas = await web3.value.eth.getGasPrice();
                        suggestion_gas = Math.floor(suggestion_gas * 1.1);

                        gasLimit = gasLimit <= 300000
                            ? Math.floor(gasLimit * 4)
                            : Math.floor(gasLimit * 1.5);

                        amc.methods.addRareiumAdmin(pAdmin.value).send({
                            "from": addr,
                            "gasPrice": web3.value.utils.toHex(suggestion_gas),
                            gasLimit
                        }).
                            then((jsonRpcResult) => {

                                console.log("jsonRpcResult");
                                showAdminModal.value = false;
                                // addAdmin();

                            });

                    } else {

                        alert("please provide a vaid ethereum address");

                    }

                }

            },
            addCreatorOnChain = async function () {

                if (pAccount.value) {

                    if (web3.value.utils.isAddress(pAccount.value) === true) {

                        const accounts = await ethereum.request({"method": "eth_requestAccounts"}),
                            addr = accounts[0],

                            amc = new web3.value.eth.Contract(
                                rareiumPlatformABI,
                                `${serverConfig.VUE_APP_PLATFORM_ADDRESS}`
                            );
                        let gasLimit = await amc.methods.addRareiumCreator(pAccount.value).estimateGas({"from": addr,
                                "gas": 100000}),

                            suggestion_gas = await web3.value.eth.getGasPrice();
                        suggestion_gas = Math.floor(suggestion_gas * 1.1);

                        gasLimit = gasLimit <= 300000
                            ? Math.floor(gasLimit * 4)
                            : Math.floor(gasLimit * 1.5);

                        amc.methods.addRareiumCreator(pAccount.value).send({
                            "from": addr,
                            "gasPrice": web3.value.utils.toHex(suggestion_gas),
                            gasLimit
                        }).
                            then((jsonRpcResult) => {

                                console.log("jsonRpcResult");
                                enableCreator();

                            });

                    } else {

                        alert("please provide a vaid ethereum address");

                    }

                }

            },
            removeCreatorOnChain = async function (user_id, address) {

                if (web3.value.utils.isAddress(address[0]) === true) {

                    const accounts = await ethereum.request({"method": "eth_requestAccounts"}),
                        addr = accounts[0],

                        amc = new web3.value.eth.Contract(
                            rareiumPlatformABI,
                            `${serverConfig.VUE_APP_PLATFORM_ADDRESS}`
                        );
                    let gasLimit = await amc.methods.removeRareiumCreator(address[0]).estimateGas({"from": addr,
                            "gas": 100000}),

                        suggestion_gas = await web3.value.eth.getGasPrice();
                    suggestion_gas = Math.floor(suggestion_gas * 1.1);

                    gasLimit = gasLimit <= 400000
                        ? Math.floor(gasLimit * 4)
                        : Math.floor(gasLimit * 1.5);

                    amc.methods.removeRareiumCreator(address[0]).send({
                        "from": addr,
                        "gasPrice": web3.value.utils.toHex(suggestion_gas),
                        gasLimit
                    }).
                        then((jsonRpcResult) => {

                            removeCreator(user_id);

                        });

                } else {

                    alert("please provide a vaid ethereum address");

                }

            },
            enableCreator = function () {

                const user_id = pUserId.value;

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}enableCreator`,
                    {
                        "params": {
                            user_id
                        }
                    }
                ).
                    then((response) => {

                        console.log(response);
                        if (response.status === 200) {

                            showCreatorModal.value = false;
                            getCreators();

                        }

                    });

            },
            removeCreator = function (user_id) {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}removeCreator`,
                    {
                        "params": {
                            user_id
                        }
                    }
                ).
                    then((response) => {

                        console.log(response);
                        if (response.status === 200) {

                            showCreatorModal.value = false;
                            getCreators();

                        }

                    });

            },
            findCreator = function (address) {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}findCreator`,
                    {
                        "params": {
                            address
                        }
                    }
                ).
                    then((response) => {

                        console.log(response.data);
                        if (response.status === 200) {

                            pUserId.value = response.data.user_id;

                        }

                    });

            },
            getCreators = function () {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}getCreators`,
                    {
                        "params": {
                        }
                    }
                ).
                    then((response) => {

                        console.log(response.data);
                        if (response.status === 200) {

                            console.log(response.data);
                            creators.splice(0);
                            for (let i = 0; i < response.data.length; i++) {

                                creators.push(response.data[i]);
                                creators.geoip = [];
                                for (const j in response.data[i].geoip) {

                                    if (response.data[i].geoip[j]) {

                                        creators.geoip.push(response.data[i].geoip[j].replace(
                                            "{\"country\":\"",
                                            ""
                                        ).replace(
                                            "\"}",
                                            ""
                                        ));

                                    }

                                }

                            }

                        }

                    });

            },
            getFolios = function (e) {

                Axios.get(

                    `${process.env.VUE_APP_SERVER_URI}getFolios`,
                    {
                        "params": {
                        }
                    }

                ).
                    then((response) => {

                        if (response.status === 200) {

                            creatorfolios.splice(0);
                            for (const j in response.data) {

                                if (response.data[j].image || response.data[j].video) {

                                    creatorfolios.push(response.data[j]);
                                    creatorfolios[creatorfolios.length - 1].primaryColor = response.data[j].primary_color;
                                    creatorfolios[creatorfolios.length - 1].secondaryColor = response.data[j].secondary_color;
                                    creatorfolios[creatorfolios.length - 1].n = genRandStr();
                                    creatorfolios[creatorfolios.length - 1].refresh = currentSlide.value;

                                }

                            }

                            loadCarousel.value = true;

                        }

                    }).
                    catch((error) => {

                        throw error;

                    });

            },
            updateView = function () {

                /*
                 *       if (serverConfig.view === "desktop") {
                 *       } else if (serverConfig.view === "laptop") {
                 *       } else if (serverConfig.view === "tablet") {
                 *       } else if (serverConfig.view === "mobile") {
                 *       } else {
                 *       }
                 */

            },
            hideModalEvent = function () {

                showCreatorModal.value = false;

            };

        onMounted(() => {

            getNews();
            getCreators();
            getFolios();
            watch(
                () => pAccount.value,
                () => {

                    findCreator(pAccount.value);

                }
            );
            watch(
                () => userInfo.accounts,
                () => {

                }
            );

        });

        return {"localize": translation.localize,
            "icon": icon.get,
            getNews,
            getIcon,
            togglePromoted,
            hideModalEvent,
            loadCarousel,
            pAccount,
            pAdmin,
            pUserId,
            currentSlide,
            news,
            newsImg,
            addAdminOnChain,
            addCreatorOnChain,
            enableCreator,
            setNewsImage,
            setNewsItems,
            setCustomFees,
            setPlatformFees,
            setNFTFactoryAddress,
            getNFTFactoryAddress,
            genRandStr,
            nftFactoryAddress,
            creatorAddress,
            platformAAddress,
            platformAFee,
            platformBAddress,
            platformBFee,
            removeCreatorOnChain,
            removeCreator,
            findCreator,
            creators,
            creatorfolios,
            getCreators,
            getFolios,
            serverConfig,
            userInfo,
            showAdminModal,
            showCreatorModal};

    }
};

</script>
<style scoped>
h2 {
  margin-top: 10px;
  margin-bottom: 10px;
  text-align: left;
  font-weight: bold;
}
input.admin-avatar {
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
.admin-buttom-end {
  display: flex;
  flex-direction: row;
  align-items: end;
}
.flex-col {
  display: flex;
  flex-direction: column;
}
.admin-bg-head {
  position: relative;
  width: 100%;
  background-size: cover;
}
.admin-card {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 20px;
  background: white;
  border: 1px #e766ff solid;
  display: flex;
}
.admin-bg-main {
  position: relative;
  width: 100%;
  background: #fff;
}
.admin-card-content {
  text-align: left;
  display: flex;
  flex-direction: row;
}
.admin-contents {
  width: 70%;
  padding-top: 50px;
  margin-left: auto;
  margin-right: auto;
}
img.admin-card-avatar {
  width: 128px;
  height: 128px;
}
.admin-save-button {
  display: flex;
  margin: 10px;
  align-items: center;
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
  width: fit-content;
  background: linear-gradient(338deg,#ff7c88,#ff46a4)
}
.admin-modal {
  width: 700px;
}
.c-grid .o-flex-grid--item {
  background: #fff;
}
.o-flex-grid {
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  margin: 0 auto;
  overflow: auto;
}

.o-flex-grid--item-a {
  overflow: auto;
  width: 5%;
  border-radius: 5px;
  box-shadow: 0 3px 6px rgba(0,0,0,0.2);
  justify-content: center;
  margin: 5px;
  padding: 20px;
}

.o-flex-grid--item-b {
  overflow: auto;
  width: 30%;
  border-radius: 5px;
  box-shadow: 0 3px 6px rgba(0,0,0,0.2);
  justify-content: center;
  margin: 5px;
  padding: 20px;
}

.o-flex-grid--item-c {
  overflow: auto;
  width: 30%;
  border-radius: 5px;
  box-shadow: 0 3px 6px rgba(0,0,0,0.2);
  justify-content: center;
  margin: 5px;
  padding: 20px;
}

.o-flex-grid--item-d {
  overflow: auto;
  width: 15%;
  border-radius: 5px;
  box-shadow: 0 3px 6px rgba(0,0,0,0.2);
  justify-content: center;
  margin: 5px;
  padding: 20px;
}

.o-flex-grid--item-e {
  cursor: pointer;
  overflow: auto;
  width: 15%;
  border-radius: 5px;
  box-shadow: 0 3px 6px rgba(0,0,0,0.2);
  justify-content: center;
  margin: 5px;
  padding: 20px;
}

.o-flex-grid--item-f {
  overflow: auto;
  color: red;
  cursor: pointer;
  width: 10%;
  border-radius: 5px;
  box-shadow: 0 3px 6px rgba(0,0,0,0.2);
  justify-content: center;
  margin: 5px;
  padding: 20px;
}

.w-100 {
  width: 100%;
}

@media(max-width:800px)
.o-flex-grid {
  background: white;
  flex-direction: column;
  flex-wrap: nowrap;
}

.o-flex-grid--item {
  width: 100% !important;
}
.admin-box {
  margin-top: 50px;
  margin-bottom: 50px;
  background: white;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid #9f71e7;
}
.news-image-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: end;
  margin: 10px;
}
.file-label {
  cursor: pointer;
  width: 50px;
  height: 50px;
  padding: 12px 20px;
  margin: -2px 0px;
  font-size: .9em;
  box-sizing: border-box;
  border: 2px solid #dfdfdf;
  border-radius: 15px;
  background-image: url("../assets/default-image-icon.png");
  background-size: contain;
  background-repeat: no-repeat;
}
input[type=file].news-image-input {
  display: none;
}
.admin-box-margin {
  margin-right: 10px;
}
.flex-row-end {
  display: flex;
  flex-direction: row;
  align-items: end;
}
.home-news-container-desktop {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 700px;
  height: 250px;
  width: 100%;
  display: flex;
  background-image: url("../assets/news-bg.png");
  background-repeat: no-repeat;
  background-size: contain;
  background-color: #f8faff;
  margin-left: auto;
  margin-right: auto;
}
.news-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 10px;
  margin-right: 70px;
  max-height: 250px;
  overflow: hidden;
}
.home-news-image {
  margin: 10px 10px 10px 70px;
  background-size: contain;
  height: 128px;
}
</style>

