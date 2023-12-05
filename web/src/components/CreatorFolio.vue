<template>
  <div class="fill">

    <div :style="creatorfolioContainer">

      <div
        v-if="creatorfolio.video.value"
        :style="mainBackdrop"
      >
        <video
          :id="creatorfolioVideo"
          :poster="creatorfolio.videoThumbnail.value"
          autoplay
          muted
          loop
          class="creator-video-desktop"
        >
          <source
            :src="creatorfolioMainVideo"
            type="video/mp4"
          >
        </video>
        <slot name="edit" />
        <div :style="creatorfolioText">
          <div :class="creatorTitle">
            {{ creatorfolio.title.value }}
          </div>
          <div class="subtitle-desktop">
            {{ creatorfolio.about.value }}
          </div>
        </div>
      </div>

      <div
        v-if="creatorfolio.image.value"
        :style="mainBackdrop"
      >
        <slot name="edit" />
        <div
          v-if="creatorfolio.title.value"
          :style="creatorfolioText"
        >
          <div :class="creatorTitle">
            {{ creatorfolio.title.value }}
          </div>
          <div class="subtitle-desktop">
            {{ creatorfolio.about.value }}
          </div>
        </div>
      </div>

    </div>

  </div>
</template>
<script>

import {inject, onMounted, ref, toRefs, watch} from "vue";
import {translationStore} from "@/stores/translation";
import {useRoute} from "vue-router";
import Login from "./Login.vue";

export default {
    "name": "CreatorFolio",
    "components": {
        Login
    },
    "props": {
        "name": String,
        "title": String,
        "about": String,
        "image": String,
        "video": String,
        "videoThumbnail": String,
        "primaryColor": String,
        "secondaryColor": String,
        "effect": String,
        "n": String,
        "refresh": Number
    },
    setup (props) {

        const translation = translationStore(),
            route = useRoute(),
            creatorfolio = toRefs(props),
            creatorfolioVideo = ref(`creator-folio-video-${props.n}`),
            creatorfolioContainer = ref(""),
            mainBackdrop = ref(""),
            creatorfolioText = ref(""),
            creatorfolioMainVideo = ref(""),
            serverConfig = inject("serverConfig"),
            creatorTitle = ref(""),
            listening = ref(false),
            updateView = function () {

                if (creatorfolio.image.value) {

                    setTimeout(

                        () => {

                            const mbd = {
                                "display": "flex",
                                "flexDirection": "row",
                                "width": "100%",
                                "height": "100%",
                                "position": "relative",
                                "justifyContent": "space-between",
                                "alignItems": "end",
                                "backgroundSize": "cover",
                                "backgroundRepeat": "no-repeat",
                                "backgroundPosition": "center",
                                "backgroundImage": `url(${creatorfolio.image.value})`
                            };
                            mainBackdrop.value = mbd;

                        },
                        100

                    );

                } 
                if (creatorfolio.video.value) {

                    const mbd = {
                        "display": "flex",
                        "flexDirection": "row",
                        "width": "100%",
                        "height": "100%",
                        "position": "relative",
                        "justifyContent": "flex-end",
                        "alignItems": "end",
                        "backgroundSize": "cover",
                        "backgroundRepeat": "no-repeat",
                        "backgroundPosition": "center"
                    };
                    mainBackdrop.value = mbd;
                    creatorfolioMainVideo.value = creatorfolio.video.value;

                }
                setTimeout(

                    () => {

                        const ccd = {
                                "display": "flex",
                                "flexDirection": "column",
                                "justifyContent": "flex-end",
                                "position": "relative",
                                "height": "100vh",
                                "min-height": "600px",
                                "background": "linear-gradient(45deg, " + creatorfolio.secondaryColor.value + ", transparent)",
                                "zIndex": "1"
                            },
                            ctd = {
                                "display": "flex",
                                "flexDirection": "column",
                                "textAlign": "left",
                                "padding": "10px",
                                "bottom": 0,
                                "width": "100%",
                                "color": creatorfolio.primaryColor.value,
                                "background": "transparent",
                                "zIndex": "1"
                            };
                        creatorfolioContainer.value = ccd;
                        creatorfolioText.value = ctd;

                    },
                    100
                );

                if (serverConfig.view === "desktop") {

                    creatorTitle.value = "creator-title-large";

                } else if (serverConfig.view === "laptop") {

                    creatorTitle.value = "creator-title";

                } else if (serverConfig.view === "tablet") {

                    creatorTitle.value = "creator-title-large";

                } else if (serverConfig.view === "mobile") {

                    creatorTitle.value = "creator-title";

                } else {

                    creatorTitle.value = "creator-title";

                }

            },
            handleVideo = function (e) {

                const pb = document.getElementById("play-button");
                if (video.paused == false) {

                    pb.style.display = "block";

                } else {

                    pb.style.display = "none";

                }

            };

        onMounted(() => {

            if (!creatorfolio.secondaryColor.value) {

                creatorfolio.secondaryColor.value = black;

            }

            if (!creatorfolio.primaryColor.value) {

                creatorfolio.primaryColor.value = white;

            }

            updateView();

            watch(
                () => props.primaryColor,

                (first, second) => {

                    updateView();

                }

            );

            watch(
                () => props.secondaryColor,

                (first, second) => {

                    updateView();

                }

            );

            watch(
                () => props.image,

                (first, second) => {

                    updateView();

                }

            );

            watch(
                () => props.video,

                (first, second) => {

                    updateView();

                }

            );

            watch(
                () => props.n,

                (first, second) => {

                    updateView();

                }

            );

            watch(
                () => props.refresh,

                (first, second) => {

                    if (props.n == first) {

                        // play video if exists
                        const v = document.getElementById(`creator-folio-video-${first}`);

                        if (v) {
                            //                                v.load()
                        }

                        if (v && !listening.value) {

                            listening.value = true;
                            v.addEventListener(
                                "playing",
                                (e) => {

                                    console.log("now playing");

                                }
                            );

                            v.addEventListener(
                                "canplay",
                                (e) => {

                                    console.log("can play");
                                    v.load();

                                }
                            );

                        }

                    }

                }

            );

            watch(

                () => serverConfig.view,
                () => {

                    updateView();

                }

            );

        });

        return {"localize": translation.localize,
            creatorfolioContainer,
            creatorfolioMainVideo,
            creatorfolioVideo,
            creatorfolioText,
            mainBackdrop,
            creatorfolioText,
            updateView,
            serverConfig,
            creatorfolio,
            creatorTitle};

    }
};

</script>
<style scoped>
h2 {
  margin: 10px;
  text-align: left;
  font-size: 2.0em;
  font-weight: bold;
}
.creator-title-large {
  display: flex;
  padding: 20px;
  max-width: 100vw;
  font-size: 3em;
}
.creator-title {
  display: flex;
  padding: 20px;
  max-width: 100vw;
  font-size: 3em;
  z-index: 1;
}
.subtitle-mobile {
  padding: 10px;
  font-size: 3em;
  font-size: 0.85em;
  font-weight: bold;
  line-height: 30px;
  text-align: left;
}
.subtitle-desktop {
  padding: 10px;
  font-size: 0.85em;
  font-weight: bold;
  line-height: 30px;
  max-width: 1000px;
  text-align: left;
}
.creatorfolio-overlay-desktop {
  position: absolute;
  left: 0;
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  z-index: 1;
}
.creatorfolio-overlay-mobile {
  position: absolute;
  height: 100%;
  display: flex;
  left: 0;
  z-index: 1;
  align-items: end;
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
.titletext {
  text-align: left;
  font-size: 2.0em;
  font-weight: bold;
}
.creatorfolio-list {
  color: black;
  margin-top: 10px
}
.creatorfolio-head-desktop {
  font-size: 1.0em;
  text-align: left;
  line-height: 30px;
  margin: 10px;
  color: #908AB9;
}
.creatorfolio-head-mobile {
  margin-top: 10px;
  font-size: 1.0em;
  width: 250px;
  color: #908AB9;
}
.relative {
  position: relative;
}
#ethicalad {
  max-width: 500px;
  min-width: 250px;
  margin-left: 100px;
  margin-top: 200px;
  flex: 1 1 0px;
}
#ethicalad {
  margin-left: auto;
  margin-right: auto;
  margin-top: 10px;
  flex: 1 1 0px;
}
.creatorfolio-head-container {
}
.creatorfolio-container {
}
.desktop-margin {
  margin-left: 100px;
}
.signup {
  display: flex;
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
  background: linear-gradient(160deg, #e8b7ff, #707ae6);
  transition: background .3s ease-in-out;
}
.construction {
  font-family: Comfortaa,sans-serif;
  text-align: left;
  color: #ad8bfa;
  height: 50px;
  max-width: 550px;
  margin-top: 50px;
  margin-bottom: 50px;
  margin-left: auto;
  margin-right: auto;
  line-height: 30px;
  font-weight: bold;
  padding-left: 20px;
  padding-right: 20px;
  border-radius: 30px;
  transition: background .3s ease-in-out;
}
.itemtext {
  width: 100%;
  margin: 10px;
  text-align: left;
}
.itemcontainer {
  margin: 20px;
}
.item-title {
  margin: 10px;
  font-weight: bold;
}
.signup-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  float: left;
  margin: 10px;
  z-index: 1;
}
.learnmore {
  font-weight: bold;
  font-size: 0.8em;
  color: #444;
  margin-left: 10px;
  cursor: pointer;
  white-space: nowrap;
}
.heading {
  color: black;
  max-width: 400px;
  margin-left: 50px;
  margin-bottom: 20px;
  text-align: left;
}
#shinobi-video {
  width: 100%;
  margin-top: 200px;
  margin-bottom: 200px;
  margin-left: auto;
  margin-right: auto;
  border-radius: 40px;
  box-shadow: 16px 16px 64px rgb(49 89 211 / 26%);
}
.fill {
  position: relative;
  width: 100%;
}
.shinobi-video-container {
  position: relative;
  display: block;
  width: 100%;
}
#play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 150px;
  height: 150px;
  margin: -75px 0 0 -75px;
}
#play-button:hover {
  cursor:pointer;
}
ul {
  margin: 10px;
}
li {
  margin: 0px;
}
.content-icon {
  margin-top: 20px;
  background-color: #937aeb;
  padding: 10px;
  border-radius: 50%;
  width: 100px;
}
.content-container {
  line-height: 30px;
  text-align: left;
  margin: 20px;
}
.shinobi-mobile {
  height: 500px;
  margin-top: 100px;
  min-height: 300px;
  background-position: bottom;
  background-size: contain;
  background-repeat: no-repeat;
}
.shinobi-desktop {
  margin-top: 150px;
  min-height: 500px;
  min-width: 500px;
  background-position: bottom;
  background-size: contain;
  background-repeat: no-repeat;
}
.grow {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: auto;
}
.header {
  max-width: 650px;
  margin: 10px;
  text-align: left;
  color: #322E6A;
}
.header {
  margin: 20px;
  max-width: 500px;
  font-size: 1em;
  text-align: center;
  color: #322E6A;
  z-index: 1;
}
.startHeader {
  width: 55%;
  padding: 10px;
  display: block;
  margin-top: 150px;
  margin-left: 20px;
  color: #322E6A;
  background-color: hsl(0deg 0% 100% / 70%);
}
.fifty {
  width: 50%;
}
svg {
  width: 100%;
  max-height: 560px;
  z-index: 1;
}
#creatorfolio {
  min-height: 1000px;
}
.text-top {
  display: flex;
  align-items: flex-end;
  width: 100%;
  top: 0;
  bottom: 0;
  left: 0;
  padding-top: 100px;
  text-align: left;
}
.blur-desktop {
  position: absolute;
  width: 100%;
  height: 100%;
}
.blur-mobile {
  position: absolute;
  width: 100%;
  height: 50%;
}
video.creator-video-desktop {
  position: absolute;
  width: 100%;
  top: 0;
  right: 0;
  height: 100vh;
  min-height: 600px;
  object-fit: cover;
}
video.creator-video-mobile {
  position: absolute;
  width: 100%;
  top: 0;
  right: 0;
  object-fit: cover;
}
</style>
