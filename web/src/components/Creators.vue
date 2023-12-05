<template>
  <div>
    <div
      v-cloak
      class="home-carousel-container"
    >
      <Transition>
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
            <!--
            <Pagination />
-->
          </template>
        </Carousel>
      </Transition>

      <div v-if="serverConfig.view === 'desktop' || serverConfig.view === 'laptop'">
        <Carousel
          v-if="loadCarousel"
          id="thumbnails"
          ref="carousel"
          v-model="currentSlide"
          :wrap-around="true"
          :items-to-show="5"
        >
          <Slide
            v-for="(i,j) in creatorfolios"
            :key="i.n"
          >
            <div
              v-if="i.image"
              class="carousel-item"
              @click="slideTo(j)"
            >
              <img
                :class="carouselItem"
                :src="i.image"
              >
            </div>
            <div
              v-else-if="i.video"
              @click="slideTo(j)"
            >
              <video
                autoplay
                muted
                loop
                :class="carouselItem"
                :poster="i.videoThumbnail"
              >
                <source
                  :src="i.video"
                  type="video/mp4 "
                >
              </video>
            </div>
          </Slide>
        </Carousel>
      </div>
      <div v-else>
        <Carousel
          v-if="loadCarousel"
          id="thumbnails"
          ref="carousel"
          v-model="currentSlide"
          :wrap-around="true"
          :items-to-show="2.5"
        >
          <Slide
            v-for="(i,j) in creatorfolios"
            :key="i.n"
          >
            <div
              v-if="i.image"
              class="carousel-item"
              @click="slideTo(j)"
            >
              <img
                :class="carouselItem"
                :src="i.image"
              >
            </div>
            <div
              v-else-if="i.video"
              @click="slideTo(j)"
            >
              <video
                autoplay
                muted
                loop
                :class="carouselItem"
                :poster="i.videoThumbnail"
              >
                <source
                  :src="i.video"
                  type="video/mp4 "
                >
              </video>
            </div>
          </Slide>
        </Carousel>
      </div>
    </div>

    <div class="home-header">
      New Collections
    </div>

    <div
      v-for="a in collections"
      @click="gotoCollection(a.nft_address)"
    >
      <CollectionPreview
        class="mid-section"
        :collection="a"
      />
    </div>

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
            loadCarousel = ref(false),
            creatorFolio = ref(),
            creatorfolios = reactive([]),
            collections = reactive([]),
            serverConfig = inject("serverConfig"),
            showModal = ref(false),
            shinobi = ref(""),
            carouselItem = ref("carousel-item-desktop"),
            currentSlide = ref(0),
            route = useRoute(),
            router = useRouter(),
            slideTo = function (v) {

                currentSlide.value = v;

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
            genRandStr = function () {

                return (new Date().getSeconds() * Math.random()).toString(36).replace(
                    ".",
                    ""
                );

            },
            settings = ref({

                /*
                 * autoplay:true,
                 * autoplayTimeout:5000,
                 * transition:500
                 */
            }),
            updateView = function () {

                if (serverConfig.view === "desktop") {

                    shinobi.value = "shinobi-desktop";
                    carouselItem.value = "carousel-item-desktop";

                } else if (serverConfig.view === "laptop") {

                    shinobi.value = "shinobi-desktop";
                    carouselItem.value = "carousel-item-desktop";

                } else if (serverConfig.view === "tablet") {

                    shinobi.value = "shinobi-mobile";
                    carouselItem.value = "carousel-item-desktop";

                } else if (serverConfig.view === "mobile") {

                    shinobi.value = "shinobi-mobile";
                    carouselItem.value = "carousel-item-mobile";

                } else {

                    shinobi.value = "shinobi-mobile";
                    carouselItem.value.view = "carousel-item-mobile";

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

                                    creatorfolios.push(response.data[j]);
                                    creatorfolios[creatorfolios.length - 1].primaryColor = response.data[j].primary_color;
                                    creatorfolios[creatorfolios.length - 1].secondaryColor = response.data[j].secondary_color;
                                    creatorfolios[creatorfolios.length - 1].n = genRandStr();
                                    creatorfolios[creatorfolios.length - 1].refresh = currentSlide.value;

                                }

                            }

                            /*
                             *creatorfolios.value = response.data;
                             *for (var i=0; i < response.data.length; i++) {
                             *
                             *    if (response.data[i].image == null && response.data[i].video == null) {
                             *        response.data.splice(i,1)
                             *    }
                             *
                             *    creatorfolios.push(response.data[i])
                             *    if (creatorfolios[i].primary_color)
                             *      creatorfolios[i].primaryColor = creatorfolios[i].primary_color;
                             *    if (creatorfolios[i].secondary_color)
                             *      creatorfolios[i].secondaryColor = creatorfolios[i].secondary_color;
                             *    if (response.data[i].image) {
                             *      creatorfolios[i].image = response.data[i].image;
                             *      creatorfolios[i].video = ""
                             *    } else if (response.data[i].video) {
                             *      creatorfolios[i].video = response.data[i].video;
                             *      if (response.data[i].video_thumbnail)
                             *        creatorfolios[i].videoThumbnail = response.data[i].video_thumbnail;
                             *      creatorfolios[i].image = ""
                             *    }
                             *    creatorfolios[i].n = genRandStr();
                             *    creatorfolios[i].refresh = currentSlide.value;
                             *
                             *}
                             */

                            loadCarousel.value = true;

                        }
                        console.log("creatorfolios");
                        console.log(creatorfolios);

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

                                if (response.data[i].image && response.data[i].name && response.data[i].symbol && response.data[i].banner) {

                                    collections.push(response.data[i]);
                                    collections[collections.length - 1].primaryColor = response.data[i].primary_color;
                                    collections[collections.length - 1].secondaryColor = response.data[i].secondary_color;

                                }

                            }

                        }

                    });

            };
        onMounted(() => {

            getCollections();

            watch(
                () => currentSlide.value,

                (first, second) => {

                    if (creatorfolios[first]) {

                        creatorfolios[first].refresh = currentSlide.value;

                    }

                }

            );

            setTimeout(
                () => {

                    getFolios();

                },
                100
            );

            watch(

                () => serverConfig.view,
                () => {

                    updateView();

                }

            );

        });

        return {"localize": translation.localize,
            genRandStr,
            gotoTab,
            gotoCollection,
            loadCarousel,
            settings,
            collections,
            creatorfolios,
            creatorFolio,
            getFolios,
            getCollections,
            showModal,
            updateView,
            currentSlide,
            carouselItem,
            slideTo,
            shinobi,
            serverConfig};

    }
};

</script>
<style scoped>
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
.carousel-item {
  align-items: center;
  display: flex;
  justify-content: center;
  margin: 10px;
}
img.carousel-item-desktop {
  overflow: none;
  cursor: pointer;
  border-radius: 15px;
  max-width: 200px;
  aspect-ratio: 1.4;
  object-fit: cover;
  margin: 20px;
  box-shadow: 0px 5px 20px 0px rgb(110 94 136);
}
video.carousel-item-desktop {
  overflow: none;
  cursor: pointer;
  border-radius: 15px;
  max-width: 200px;
  aspect-ratio: 1.4;
  object-fit: cover;
  margin: 20px;
  box-shadow: 0px 5px 20px 0px rgb(110 94 136);
}
img.carousel-item-mobile {
  overflow: none;
  cursor: pointer;
  border-radius: 15px;
  max-width: 150px;
  aspect-ratio: 1.4;
  object-fit: cover;
  background-color: grey;
  margin: 20px;
  box-shadow: 0px 5px 20px 0px rgb(110 94 136);
}
video.carousel-item-mobile {
  overflow: none;
  cursor: pointer;
  border-radius: 15px;
  max-width: 150px;
  aspect-ratio: 1.4;
  object-fit: cover;
  background-color: grey;
  margin: 20px;
  box-shadow: 0px 5px 20px 0px rgb(110 94 136);
}
.titletext {
  text-align: left;
  font-size: 2.0em;
  font-weight: bold;
}
.titletextcyan {
  text-align: left;
  font-size: 2.0em;
  font-weight: bold;
  color: #1FB6DC;
}
.comingsoonlogo {
  background-size:contain;
  background-position: 70%;
  width: 100%;
  height: 400px;
}
.comingsoontext {
  color:black;
  font-size: 1.2em;
  margin-top: -100px;
}
.home-header {
  disply: flex;
  justify-content: center;
  font-size: 2em;
  margin-top: 100px;
  margin-bottom: 50px;
}
.home-list {
  color: black;
  margin-top: 10px
}
.home-head-desktop {
  font-size: 1.0em;
  text-align: left;
  line-height: 30px;
  margin: 10px;
  color: #908AB9;
}
.home-head-mobile {
  margin-top: 10px;
  font-size: 1.0em;
  width: 250px;
  color: #908AB9;
}
.relative {
  position: relative;
}
#ethicaladDesktop {
  max-width: 500px;
  min-width: 250px;
  margin-left: 100px;
  margin-top: 200px;
  flex: 1 1 0px;
}
#ethicaladMobile {
  margin-left: auto;
  margin-right: auto;
  margin-top: 10px;
  flex: 1 1 0px;
}
.home-head-container {
}
.home-carousel-container {
  min-height: 820px;
}
.desktop-margin {
  margin-left: 100px;
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
.fill {
  position: relative;
  width: 100%;
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
.headerDesktop {
  max-width: 650px;
  margin: 10px;
  text-align: left;
  color: #322E6A;
}
.headerMobile {
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
img.creator-img-desktop {
  width: 100%;
  padding-left: 25%;
  z-index: -2;
}
img.creator-img-mobile {
  width: 100%;
  padding-left: a5%;
  z-index: -2;
}
#home {
  min-height: 1000px;
}
.spacer {
  width: 20px;
}
.mid-section {
  height: 550px;
  margin: 50px 10px;
  justify-content: center;
  height: 600px;
  cursor: pointer;
}
/*
  background-image: url('../assets/12-req.body.symbol.jpg');
  background-size: cover;
  background-repeat: no-repeat;
  background-size: cover;
*/
.text-left {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: end;
  width: 60%;
  top: 0;
  bottom: 0;
  left: 0;
  text-align: left;
  padding-top: 100px;
}
.text-top {
  position: absolute;
  display: flex;
  align-items: end;
  width: 100%;
  top: 0;
  bottom: 0;
  left: 0;
  padding-top: 100px;
  text-align: left;
}
.blur-left {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 60%;
  backdrop-filter: blur(0.4em);
}
.folio-style {
  margin-left: 10px;
  margin-right: 10px;
  cursor: pointer;
}
svg.carousel__icon {
  width: var(--vc-icn-width);
  height: var(--vc-icn-width);
  fill: white;
  background-color: #2196f387;
  color: white;
  border-radius: 50%;
  min-width: 40px;
  min-height: 40px;
}
</style>
