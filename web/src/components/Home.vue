<template>
  <div>

<!--
    <div
      v-cloak
      :class="homeCarouselContainer"
    >
      <Transition>
        <Carousel
          v-if="loadCarousel"
          id="gallery"
          v-model="currentSlide"
          :wrap-around="true"
          :items-to-show="itemsToShow"
          :autoplay="50000000"
          :translition="500"
          :pause-autoplay-on-hover="true"
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
            <Pagination />
          </template>
        </Carousel>
      </Transition>

      <div
        v-if="serverConfig.view === 'desktop' || serverConfig.view === 'laptop'"
        class="platform-position-0"
      >
        <div :class="genRandSymbolClass()" />
      </div>

      <div
        v-if="serverConfig.view === 'desktop' || serverConfig.view === 'laptop'"
        class="home-header-links"
      >
        <div
          v-for="(i,j) in creatorfolios"
          :key="i.n"
        >
          {{ i.title }}
        </div>
      </div>

      <div class="platform-position-2">
        <div :class="genRandSymbolClass()" />
      </div>
    </div>
-->

    <div class="home-container-a">
      <div :class="homeContainerLeft">
        <div class="flex-row">
          <div
            class="svg-logo"
            v-html="getRawIcon('RAREIUM_LOGO_LETTER')"
          />
          <h1 class="home-header-text">
            areium
          </h1>
        </div>
        <div class="home-header-text-container">
          <h2 class="home-header-text">
            Digital tokens physically backed by rare earth metals
          </h2>
          <div class="home-header-text">
  Rareium Tokens provide investors with a convenient and efficient means to own high-quality rare earth metals built on top of blockchain technology. Every Rareium Token is supported by a defined quantity of rare earth metals, securely stored in the bank grade metlock facilit in Germany. When you possess Rareium tokens, you hold direct ownership of the underlying rare earth metals, safeguarded by the custodianship of Rareium."
          </div>
        </div>
        <div class="home-register-container">
          <CInput
            class="margin-top"
            :value="email.value"
            :title="localize('TEXT_ENTER_EMAIL')"
            :placeholder="localize('Enter Email')"
            @inputValue="email.value = $event"
          />
          <div class="home-register-button">
            Register
          </div>
        </div>
      </div>
      <div :class="homeContainerRight">
        <div
          class="home-container-a-box"
        >
          <div
            v-for="(i,k) in tokens"
            class="home-container-item"
          >
            <div class="flex-row-center">
              <div
                :class="i.icon"
              />
              <div class="home-container-a-ticker">
                {{ i.ticker }}
              </div>
              <div class="home-container-metal-name">
                {{k}}
              </div>
            </div>
            <div class="flex-row-center-space">
              <div class="home-container-a-price">
                $ {{ i.price }}
              </div>
              <div
                v-if="i.ytd > 0"
                class="home-container-a-ytd-pos"
              >
                {{ i.ytd }} %
              </div>
              <div
                v-else-if="i.ytd < 0"
                class="home-container-a-ytd-neg"
              >
                {{ i.ytd }} %
              </div>
              <div
                v-else
                class="home-container-a-ytd"
              >
                {{ i.ytd }} %
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="voxels-container">
      <div
        v-for="y in 300"
        class="voxels"
      />
      <div class="voxels-text-container">
        Rare Metals Commodities Exchange
      </div>
    </div>

    <div
      @click="gotoTab('mint/0xeE9c5255820FFA0E3eE7d59727d50290E1F19768')"
      class="promo-link"
    />

    <div
      v-if="serverConfig.view != 'mobile'"
      class="home-news-container-desktop"
    >
      <div
        v-for="(i,j) in news"
        class="home-news-absolute"
      >
        <transition
          :duration="300"
          name="news-slide-fade"
        >
          <div
            v-if="displayNewsItem == i.id && i.title"
            class="flex-row-center home-news-container-inner"
          >
            <img
              class="home-news-image"
              :src="'../public/images/news_item_' + i.id + '.png'"
            >
            <div :class="newsText">
              <div>
                <b>{{ i.title }}</b>
              </div>
              <div>
                {{ i.text }}
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <div class="home-header">
    </div>

    <!--
    <div :class="genRandPositionClass()">
      <div :class="genRandSymbolClass()" />
    </div>
-->

    <CModal
      v-if="showModal"
      color="#f9b115"
      title="Sign up."
      size="small"
      @close="showModal = false"
    >
      <template #header>
        <div> Sign Up </div>
      </template>
      <template #body>
        <Login color="#47357378" />
      </template>
      <template #footer>
        <div class="hidden" />
      </template>
    </CModal>
  </div>
</template>
<script>

import {Carousel, Navigation, Pagination, Slide, toRaw} from "vue3-carousel";
import {inject, onMounted, reactive, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {translationStore} from "@/stores/translation";
import Login from "./Login.vue";
import CreatorFolio from "./CreatorFolio.vue";
import CollectionPreview from "./CollectionPreview.vue";
import Axios from "axios";
import {iconStore} from "@/stores/icon";

export default {
    "name": "Home",
    "components": {
        Login,
        CreatorFolio,
        Carousel,
        Slide,
        Pagination,
        Navigation,
        CollectionPreview
    },
    setup () {

        const translation = translationStore(),
            serverConfig = inject("serverConfig"),
            loadCarousel = ref(false),
            route = useRoute(),
            router = useRouter(),
            currentSlide = ref(),
            icon = iconStore(),
            email = ref(""),
            homeContainerLeft = ref(""),
            homeContainerRight = ref(""),
            homeSectionMission = ref("home-section-mission"),
            homeHeaderText = ref("home-header-text"),
            homeContentText = ref("home-content-text"),
            homeHeaderTextBlack = ref("home-header-text-black"),
            homeContentTextBlack = ref("home-content-text-black"),
            tokens = ref({
                
                "Gallium":{
                    icon: "GALLIUM_ICON",
                    ticker: "RGA",
                    price: 160,
                    ytd: -11
                },
                "Dysprosium":{
                    icon: "DYSPROSIUM_ICON",
                    ticker: "RDY",
                    price: 578,
                    ytd: -11.48
                },
                "Neodymium":{
                    icon: "NEODYMIUM_ICON",
                    ticker: "RND",
                    price: 123,
                    ytd: -41
                },
                "Praseodymium":{
                    icon: "PRASEODYMIUM_ICON",
                    ticker: "RPR",
                    price: 122,
                    ytd: -38
                },
                "Terbium":{
                    icon: "TERBIUM_ICON",
                    ticker: "RTB",
                    price: 2230.40,
                    ytd: -44.58
                },
                "Gallium":{
                    icon: "GALLIUM_ICON",
                    ticker: "RGA",
                    price: 755,
                    ytd: 17.95
                },
                "Germanium":{
                    icon: "GERMANIUM_ICON",
                    ticker: "RGE",
                    price: 2839.40,
                    ytd: 21.11
                },
                "Hafnium":{
                    icon: "HAFNIUM_ICON",
                    ticker: "RHF",
                    price: 5298.90,
                    ytd: 16.20
                },
                "Indium":{
                    icon: "INDIUM_ICON",
                    ticker: "RIN",
                    price: 561.60,
                    ytd: 26.97
                },
                "Rhenium":{
                    icon: "RHENIUM_ICON",
                    ticker: "RRE",
                    price: 1942.20 ,
                    ytd: 20.89
                }

            }),
            slideTo = function (v) {

                currentSlide.value = v;

            },
            getIcon = function (i) {

                if (serverConfig.visualMode.value === "dark") {

                    return icon.get(`${i}_DARK`);

                }
                return icon.get(`${i}_LIGHT`);

            },
            getRawIcon = function (i) {

                return icon.get(`${i}`);

            },
            gotoTab = function (t) {

                router.push({"path": `/${t}/`}).catch((err) => {

                    throw err;

                });

            },
            gotoCollection = function (address) {

                router.push({"path": `/collection/${address}/`}).catch((err) => {

                    throw err;

                });

            },
            getNews = function () {

                news.splice(0);
                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}getNews`,
                    {
                    }
                ).
                    then((response) => {

                        for (const n in response.data) {

                            news.push(response.data[n]);

                        }

                    });

            },
            genRandSymbolClass = function () {

                const s = Math.floor(Math.random() * 6) + 1,
                    e = Math.floor(Math.random() * 6) + 1;
                return `platform-symbol-${s} ` + `platform-effect-${e}`;

            },
            genRandPositionClass = function () {

                const p = Math.floor(Math.random() * 6) + 1;
                return `platform-position-${p}`;

            },
            genRandStr = function () {

                return (new Date().getSeconds() * Math.random()).toString(36).replace(
                    ".",
                    ""
                );

            },
            updateView = function () {

                if (serverConfig.view === "desktop") {

                    homeContainerRight.value = "home-container-a-right-desktop"
                    homeContainerLeft.value = "home-container-a-left-desktop"

                } else if (serverConfig.view === "laptop") {

                    homeContainerRight.value = "home-container-a-right-desktop"
                    homeContainerLeft.value = "home-container-a-left-desktop"

                } else if (serverConfig.view === "tablet") {

                    homeContainerRight.value = "home-container-a-right-desktop"
                    homeContainerLeft.value = "home-container-a-left-desktop"

                } else if (serverConfig.view === "mobile") {

                    homeContainerRight.value = "home-container-a-right-mobile"
                    homeContainerLeft.value = "home-container-a-left-mobile"

                } else {

                    homeContainerRight.value = "home-container-a-right-mobile"
                    homeContainerLeft.value = "home-container-a-left-mobile"

                }

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

                            for (const j in response.data) {

                                if (response.data[j].image || response.data[j].video) {

                                }

                            }

                            loadCarousel.value = true;

                        }

                    }).
                    catch((error) => {

                        throw error;

                    });

            },
            getCollections = function (e) {

                Axios.get(

                    `${process.env.VUE_APP_SERVER_URI}getCollections`,
                    {
                        "params": {
                        }
                    }

                ).
                    then((response) => {

                        if (response.data) {

                            for (let i = 0; i < response.data.length; i++) {

                            }

                        }

                    });

            };
        onMounted(() => {

            getCollections();
            updateView();

            watch(
                () => currentSlide.value,

                (first, second) => {

                    if (creatorfolios[first]) {

                    }

                }

            );

            setTimeout(
                () => {

                },
                100
            );

            const runNews = function () {

                setTimeout(
                    () => {

                    },
                    5000
                );

            };
            runNews();

            watch(

                () => serverConfig.view,
                () => {

                    updateView();

                }

            );

        });

        return {"localize": translation.localize,
            email,
            genRandStr,
            currentSlide,
            getIcon,
            getRawIcon,
            gotoTab,
            gotoCollection,
            genRandSymbolClass,
            genRandPositionClass,
            homeContainerLeft,
            homeContainerRight,
            homeSectionMission,
            homeHeaderText,
            homeContentText,
            homeHeaderTextBlack,
            homeContentTextBlack,
            loadCarousel,
            tokens,
            serverConfig};

    }
};

</script>
<style scoped>
.separado {
  width: 20px;
  height: 20px;
}
.subtitle {
  max-width: 500px;
  padding: 20px;
}
.carousel-item {
}
.simple-content-text {
  font-size: 1em;
  font-family: Helvetica,"system-ui";
  font-size: 1em;
  padding: 20px;
  color: #5b702c;
  max-width: 800px;
  margin-top: 30px;
  margin-bottom: 30px;
  margin-left: auto;
  margin-right: auto;
}
.normal-content-text {
  font-size: 1em;
  font-family: Helvetica,"system-ui";
  font-size: 1em;
  margin: 20px;
  padding: 20px;
  color: #5b702c;
  border-radius: 20px;
  background: linear-gradient(1deg,#e2e5db63,transparent);
}
.cursive-content-text {
  max-width: 1000px;
  font-size: 4vh;
  margin-left: auto;
  margin-right: auto;
}
.forty-cent {
  width: 40%;
  margin: 10px;
  align-items: center;
  display: flex;
}
.home-header-container {
  position: relative;
}
video.eq-bg-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  aspect-ratio: 1.1;
  width: 100%;
}
.home-section-mission-mobile {
  position: relative;
  margin-top: 100vh;
  margin-top: calc(100vh - 60px);
  min-width: 100%;
  background: linear-gradient(-45deg, #23d5ab, #a6a55e, #23a6d5, #23d5ab);
	background-size: 400% 400%;
	animation: gradient 15s ease infinite;
}
.home-section-mission {
  position: relative;
  margin-top: 100vh;
  min-width: 100%;
  background: linear-gradient(-45deg, #23d5ab, #a6a55e, #23a6d5, #23d5ab);
	background-size: 400% 400%;
	animation: gradient 15s ease infinite;
}
.home-mission-text-container {
  padding-top: 100px;
}
.home-carousel-container {
  min-height: 820px;
}
h1.home-content-text {
  display: flex;
  align-items: flex-end;
  color: #4e4e4e;
  margin-top: 25px;
  font-size: 5em;
  margin: 0px;
  padding-top: 30px;
}
.home-content-text {
  display: flex;
  align-items: flex-end;
  color: #4e4e4e;
  margin-top: 25px;
  font-size: 2em;
  font-size: 6vh;
  margin: 0px;
}
h1.home-header-text {
  color: #4d4d4d;
}
h2.home-header-text {
  color: #4d4d4d;
}
.home-header-text {
  font-weight: bold;
  color: #4d4d4d;
}
.home-content-text-mobile {
  color: white;
  font-size: 1.2em;
  font-size: 4vh;
  margin: 0px 50px;
}
h1.home-header-text-mobile {
  margin: 50px;
  color: white;
  font-size: 3em;
  font-size: 10vh;
}
.home-content-text-black {
  color: #5f7237;
  font-size: 2em;
  font-size: 6vh;
  margin: 50px;
}
h1.home-header-text-black {
  margin: 50px;
  color: #000;
  font-size: 5em;
  font-size: 15vh;
}
.home-content-text-mobile-black {
  margin: 30px;
  color: #5f7237;
  font-size: 1.2em;
  font-size: 4vh;
}
h1.home-header-text-mobile-black {
  color: #000; 
  font-size: 3em;
  font-size: 10vh;
}
.home-platform-text-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
img.large-platform-img {
  margin: 10px;
  width: 90%;
}
img.platform-img {
  margin: 10px;
  width: 100%;
}

@keyframes gradient {
	0% {
		background-position: 0% 50%;
	}
	50% {
		background-position: 100% 50%;
	}
	100% {
		background-position: 0% 50%;
	}
}
.home-curve-container {
}
svg.home-mission-curve {
  position: absolute;
  background: transparent;
  left: 0;
  bottom: 0;
}
svg.home-curve {
  z-index: -2;
  position: absolute;
  background: radial-gradient(ellipse at 50% 70%,#7d5cff,rgba(255,92,244,.47000000000000003));
  left: 0;
}
.rareium-logo {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;
  align-items: center;
  bottom: 10%;
}
.rareium-logo-img {
  width: 30%;
  max-width: 500px;
  min-width: 300px;
  margin-bottom: 50px;
}
.colorstroke {
  width: 100%;
  height: 100%;
  max-height: 100px;
  max-width: 800px;
  margin-top: 20px;
  margin-bottom: 20px;
  margin-left: auto;
  margin-right: auto;
}
.governance-backdrop {
  background-size: auto;
  background-position: center;
  margin-left: 10px;
  margin-right: 10px;
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
.good-link {
  color: #3783bb;
}
.home-roadmap-container {
  font-size: 1.1em;
  width: 90%;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
}
.home-roadmap-box-left-a {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 10px;
  border-bottom: 10px solid #ced4c2;
  border-right: 10px solid #ced4c2;
  background-color: #f8faff;
}
.home-roadmap-box-right-a {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  width: 100%;
  background-color: #f8faff;
}
.home-roadmap-box-left-b {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  width: 100%;
  background-color: #f8faff;
}
.home-roadmap-box-right-b {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  width: 100%;
  border-left: 10px solid #ced4c2;
  border-bottom: 10px solid #ced4c2;
  background-color: #f8faff;
}
.founders-container {
  max-width: 800px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
}
.greenconflict-logo {
  cursor: pointer;
  width: 100%;
  height: 100px;
  background-image: url('../assets/GC_logo_OK350.png');
  margin: 20px;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  background-position: center;
  background-size: contain;
  max-width: 300px;
}
.compdeep-logo {
  cursor: pointer;
  width: 100%;
  height: 100px;
  background-image: url('../assets/compdeep-banner-plain.png');
  margin: 20px;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  background-position: center;
  background-size: contain;
  max-width: 300px;
}
.home-footer {
  width: 100%;
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.voxels-container {
  position: relative;
  padding: 0;
  width: 100%;
  display: grid;
  place-content: center;
  background: #19abe5;
  grid-template-columns: repeat(33,3%);
}
.voxels {
  background: #088cbf;
  height: 50px;
  width: 50px;
  border-radius: 5px;
  scale: 0;
  opacity: 0;
  animation: box 5s linear infinite;
}
@keyframes box {
  0%, 50%, 90% { scale: 1; opacity: 1 }
  25%, 75%, 100% { scale: 0; opacity: 0 }
}
.home-container-a {
  display: flex;
  justify-content: space-evenly;
  margin-left: auto;
  margin-right: auto;
  flex-direction: row;
  margin: 50px;
  max-width: 1600px;
  flex-wrap: wrap;
}
.home-container-a-left-mobile {
  width: 100%;
}
.home-container-a-right-mobile {
  width: 100%;
}
.home-container-a-left-desktop {
  width: 50%;
}
.home-container-a-right-desktop {
  width: 30%;
}
.home-container-a-box {
  box-sizing: border-box;
  border: 1px solid #dcdcdc;
  margin: 0;
  min-width: 300px;
  text-align: center;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  padding: 0;
  border-radius: 20px;
  background-color: #ececec;
}
.GALLIUM_ICON {
  width: 48px;
  height: 48px;
  background-image: url('../assets/gallium-icon.png');
  background-size: contain;
}
.INDIUM_ICON {
  width: 48px;
  height: 48px;
  background-image: url('../assets/gallium-icon.png');
  background-size: contain;
}
.DYSPROSIUM_ICON {
  width: 48px;
  height: 48px;
  background-image: url('../assets/gallium-icon.png');
  background-size: contain;
}
.TERBIUM_ICON {
  width: 48px;
  height: 48px;
  background-image: url('../assets/gallium-icon.png');
  background-size: contain;
}
.NEODYMIUM_ICON {
  width: 48px;
  height: 48px;
  background-image: url('../assets/gallium-icon.png');
  background-size: contain;
}
.PRASEODYMIUM_ICON {
  width: 48px;
  height: 48px;
  background-image: url('../assets/gallium-icon.png');
  background-size: contain;
}
.GERMANIUM_ICON {
  width: 48px;
  height: 48px;
  background-image: url('../assets/gallium-icon.png');
  background-size: contain;
}
.HAFNIUM_ICON {
  width: 48px;
  height: 48px;
  background-image: url('../assets/gallium-icon.png');
  background-size: contain;
}
.RHENIUM_ICON {
  width: 48px;
  height: 48px;
  background-image: url('../assets/gallium-icon.png');
  background-size: contain;
}
.home-container-a-price {
  background-color: none;
  text-align: left;
  -webkit-flex: unset;
  -ms-flex: unset;
  flex: unset;
}
.home-container-metal-name {
  color: #505050;
  font-size: 0.8em;
}
.home-container-a-ticker {
  color: #505050;
  font-weight: bold;
  font-size: 1em;
  margin-left: 5px;
  margin-right: 5px;
}
.home-container-a-price {
  color: #505050;
}
.home-container-a-ytd {
  color: grey; 
  font-weight: bold;
}
.home-container-a-ytd-neg {
  color: #e91919; 
  font-weight: bold;
}
.home-container-a-ytd-pos {
  color: #08b608; 
  font-weight: bold;
}
.home-container-item {
  padding: 24px 24px 4px 24px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.flex-row-center {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.flex-row-center-space {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 40%;
}
.voxels-text-container {
  position: absolute;
  color: white;
  margin: 50px;
  font-size: 4em;
}
.svg-logo {
  display: flex;
}
.home-header-text-container {
  margin: 10px;
}
.home-register-container {
  display: flex;
  align-items: flex-end;
  margin: 10px;
}
.home-register-button {
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
  border-radius: 20px;
  border: none;
  box-shadow: 0px 15px 20px 2px rgb(139 106 224 / 33%);
  cursor: pointer;
  background: linear-gradient(338deg,#ff7cf5,#46b6ff);
}
</style>

<style lang="scss" scoped>

  @for $i from 1 through 1000 {
    .voxels {
      &:nth-child(#{$i}) {
        animation-delay: calc(
          -10s * #{$i} * sin(#{$i})
        );
      }
    }
  }

  @keyframes m {
    0%, 50%, 90% { scale: 1; opacity: 1 }
    25%, 75%, 100% { scale: 0; opacity: 0 }
  }
</style>
