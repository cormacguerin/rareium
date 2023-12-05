<template>
  <div>
    <div
      v-cloak
      class="home-page-container"
    >

      <div class="home-video-container">
        <div class="equity-dao-logo">
          <img src="../assets/equitydaot_480_square_w.png" class="equity-dao-logo-img">
          <div :class="homeContentText">
          </div>
        </div>
      </div>

      <div :class="homeSectionMission">

        <div class="home-mission-text-container">

          <h1 :class="homeHeaderText">
            Mission.
          </h1>

          <div class="home-carousel-container">

            <Carousel id="gallery" :autoplay="18000" :items-to-show="1" :wrap-around="true">

              <slide v-for="(j,i) in missionTexts" :key="i">
                <div :class="homeContentText">
                  {{ j }}
                </div>
              </slide>

              <template #addons>
                <Navigation />
              </template>

            </Carousel>

            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" class="home-mission-curve"><defs data-v-53df7d9a=""><radialGradient data-v-53df7d9a="" id="grad" x1="50%" y1="70%" x2="100%" y2="100%"><stop data-v-53df7d9a="" offset="0%" stop-color="#ff5d99"></stop><stop data-v-53df7d9a="" offset="100%" stop-color="#ff5cfc78"></stop></radialGradient></defs><path data-v-53df7d9a="" data-v-2f1a2f6e="" fill="#fafbfb" fill-opacity="1" d="M 0 192 L 30 176 C 60 160 120 128 180 144 C 240 160 300 224 360 245.3 C 420 267 480 245 540 224 C 600 203 660 181 720 165.3 C 780 149 840 139 900 154.7 C 960 171 1020 213 1080 197.3 C 1140 181 1206.328 145.755 1266.328 118.755 C 1326.328 91.755 1409.832 100.937 1439.832 111.237 L 1440 320 L 1410 320 C 1380 320 1320 320 1260 320 C 1200 320 1140 320 1080 320 C 1020 320 960 320 900 320 C 840 320 780 320 720 320 C 660 320 600 320 540 320 C 480 320 420 320 360 320 C 300 320 240 320 180 320 C 120 320 60 320 30 320 L 0 320 L 0 192 Z"></path></svg>

          </div>

        </div>

        <div class="home-mission-curve-container">

        </div>

      </div>

      <div class="home-section-wwd">

        <div class="founders-container" v-motion-slide-visible-once-right>
          <div @click="gotoURL('https://greenconflict.com/')" class="greenconflict-logo" />
          <div @click="gotoURL('https://www.compdeep.com/')" class="compdeep-logo" />
        </div>

        <div class="home-footer">
          <div>
            contact : <a href="mailto:contact@compdeep.com"> contact@compdeep.com </a>
          </div>
          <div>
            copyright: compdeep.com
          </div>
        </div>

      </div>

    </div>

    <div
      v-motion
      :initial="{
        scale: 1,
      }"
      :enter="{
        scale: 2,
        transition: {
          delay: 1000,
        },
      }"
    />

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

import {inject, onMounted, reactive, ref, watch} from "vue";
import {Carousel, Navigation, Pagination, Slide, toRaw} from "vue3-carousel";
import {useRoute, useRouter} from "vue-router";
import {translationStore} from "@/stores/translation";
import Login from "./Login.vue";
import Axios from "axios";

export default {
    "name": "Home",
    "components": {
        Login,
        Carousel,
        Slide,
        Pagination,
        Navigation
    },
    setup () {

        const translation = translationStore(),
        serverConfig = inject("serverConfig"),
        showModal = ref(false),
        shinobi = ref(""),
        homeSectionMission = ref("home-section-mission"),
        homeHeaderText = ref("home-header-text"),
        homeContentText = ref("home-content-text"),
        homeHeaderTextBlack = ref("home-header-text-black"),
        homeContentTextBlack = ref("home-content-text-black"),
        missionTexts = reactive(["At rareium, our mission is to drive a carbon neutral world and empower sustainable development projects across the world. Our platform enables open transparent carbon markets and enacts positive change by providing essential assistance, certification, liquidity via digital tokenization.",
        "Through the decentralized autonomous organization (DAO) model, we aim to revolutionize the way sustainable initiatives are funded and supported. By leveraging cutting-edge technology, transparent governance, and a global network of contributors, we unlock the full potential of developing communities and promote long-term socio-economic growth.",
        "Our focus lies in identifying and nurturing projects that align with our values of environmental stewardship, social equity, and strong governance practices. We believe in empowering local entrepreneurs, organizations, and communities by providing them with the necessary resources, knowledge, and financial tools to drive sustainable development at a grassroots level.",
        "Join us on this transformative journey as we leverage the power of decentralized technologies and our decades of experience to build a brighter, more equitable future for all, where ESG goals are met, microeconomies thrive, and opportunity of equality becomes a reality for all."]),
        carouselItem = ref("carousel-item-desktop"),
        currentSlide = ref(0),
        route = useRoute(),
        router = useRouter(),
        gotoTab = function (t) {

            router.push({"path": `/${t}/`}).catch((err) => {

                throw err;

            });

        },
        gotoURL = function(t) {
            window.open(t);
        },
        updateView = function () {
          console.log('updateView')

            if (serverConfig.view === "desktop") {

                homeSectionMission.value = "home-section-mission";
                homeHeaderText.value = "home-header-text";
                homeContentText.value = "home-content-text";
                homeHeaderTextBlack.value = "home-header-text-black";
                homeContentTextBlack.value = "home-content-text-black";
                shinobi.value = "shinobi-desktop";
                carouselItem.value = "carousel-item-desktop";

            } else if (serverConfig.view === "laptop") {

                homeSectionMission.value = "home-section-mission";
                homeHeaderText.value = "home-header-text";
                homeContentText.value = "home-content-text";
                homeHeaderTextBlack.value = "home-header-text-black";
                homeContentTextBlack.value = "home-content-text-black";
                shinobi.value = "shinobi-desktop";
                carouselItem.value = "carousel-item-desktop";

            } else if (serverConfig.view === "tablet") {

                homeSectionMission.value = "home-section-mission";
                homeHeaderText.value = "home-header-text";
                homeContentText.value = "home-content-text";
                homeHeaderTextBlack.value = "home-header-text-black";
                homeContentTextBlack.value = "home-content-text-black";
                shinobi.value = "shinobi-mobile";
                carouselItem.value = "carousel-item-desktop";

            } else if (serverConfig.view === "mobile") {

                homeSectionMission.value = "home-section-mission-mobile";
                homeHeaderText.value = "home-header-text-mobile";
                homeContentText.value = "home-content-text-mobile";
                homeHeaderTextBlack.value = "home-header-text-mobile-black";
                homeContentTextBlack.value = "home-content-text-mobile-black";
                shinobi.value = "shinobi-mobile";
                carouselItem.value = "carousel-item-mobile";

            } else {

                homeHeaderText.value = "home-header-text-mobile";
                homeContentText.value = "home-content-text-mobile";
                homeHeaderTextBlack.value = "home-header-text-mobile-black";
                homeContentTextBlack.value = "home-content-text-mobile-black";
                shinobi.value = "shinobi-mobile";
                carouselItem.value.view = "carousel-item-mobile";

            }

        };

        onMounted(() => {

            watch(

                () => serverConfig.view,
                () => {

                    updateView();

                }

            );

        });

        return {
          "localize": translation.localize,
          serverConfig,
          showModal,
          shinobi,
          homeSectionMission,
          homeHeaderText,
          homeContentText,
          homeHeaderTextBlack,
          homeContentTextBlack,
          missionTexts,
          carouselItem,
          currentSlide,
          route,
          router,
          gotoTab,
          gotoURL,
          updateView
        };

    }
};

</script>
<style scoped>

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
  font-family: Caveat,Helvetica,"system-ui";
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
.home-page-container {
  width: 100%;
  height: 1000px;
  height: 100vh;
}
.home-header-container {
  position: relative;
}
.home-video-container {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
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
  margin-top: calc(100vh - 60px);
  min-width: 100%;
  background: linear-gradient(-45deg, #23d5ab, #a6a55e, #23a6d5, #23d5ab);
	background-size: 400% 400%;
	animation: gradient 15s ease infinite;
}
.home-section-mission {
  position: relative;
  margin-top: calc(100vh - 100px);
  min-width: 100%;
  background: linear-gradient(-45deg, #23d5ab, #a6a55e, #23a6d5, #23d5ab);
	background-size: 400% 400%;
	animation: gradient 15s ease infinite;
}
.home-mission-text-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 100px;
}
.home-carousel-container {
  min-height: 820px;
}
.home-content-text {
  color: white;
  font-size: 2em;
  font-size: 6vh;
  margin: 0px 50px;
}
h1.home-header-text {
  margin: 50px;
  color: white;
  font-size: 5em;
  font-size: 15vh;
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
.equity-dao-logo {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;
  align-items: center;
  bottom: 10%;
}
.equity-dao-logo-img {
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
  justify-content: center;
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
.home-roadmap-box-container {
  display: flex;
  flex-direction: row;
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

</style>
