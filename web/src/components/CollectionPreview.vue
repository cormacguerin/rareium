<template>
  <div
    v-if="isCompact()"
    class="flex-row"
  >
    <div
      :id="collectionContainer"
      class="collection-preview-container-mobile"
    >
      <div
        v-if="bannerLoading == true"
        class="banner-loading"
      >
        <Loading />
      </div>
      <div
        v-else
        :id="collectionBanner"
        class="collection-banner-mobile"
      >
        <form
          v-if="$route.path.includes('create')"
          id="banner-upload"
        >
          <label
            class="collection-banner-upload"
            for="collection-banner-upload"
          />
          <input
            id="collection-banner-upload"
            type="file"
            accept="image/*,video/*"
            @change="setCollectionBanner"
          >
          <div class="upload-file-types" />
        </form>
      </div>
      <div class="collection-details-mobile-container">
        <div class="collection-details-mobile">
          <div class="collection-symbol-mobile">
            <div
              v-if="imageLoading == true"
              class="banner-loading"
            >
              <Loading />
            </div>
            <div
              v-else
              :id="collectionImage"
              class="flex-row collection-image"
            >
              <form
                v-if="$route.path.includes('create')"
                id="image-upload"
              >
                <label
                  class="collection-image-upload"
                  for="collection-image-upload"
                />
                <input
                  id="collection-image-upload"
                  type="file"
                  accept="image/*,video/*"
                  @change="setCollectionImage"
                >
                <div class="upload-file-types" />
              </form>
            </div>
          </div>
          <div class="collection-header-mobile-container">
            <div
              v-if="collection.name"
              class="collection-header-mobile"
            >
              {{ collection.name.value }}
            </div>
            <span>
              <div
                v-if="collection.symbol"
                class="symbol-text-mobile"
              >
                <b>/ {{ collection.symbol.value }}</b>
              </div>
              <div
                v-if="collection.creator_name"
                class="symbol-text-mobile"
              >
                <b> @ {{ collection.creator_name.value }}</b>
              </div>
            </span>
            <div>
              <div
                v-if="collection.description"
                class="collection-description"
              >
                {{ collection.description.value }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    v-else
    class="flex-row"
  >
    <div
      :id="collectionContainer"
      class="collection-preview-container-desktop"
    >
      <div class="collection-details-desktop">
        <div
          v-if="collection.name"
          :class="collectionHeaderClass"
        >
          {{ collection.name.value }}
        </div>
        <div class="collection-symbol-desktop">
          <div
            v-if="imageLoading == true"
            class="banner-loading"
          >
            <Loading />
          </div>
          <div
            v-else
            :id="collectionImage"
            class="flex-row collection-image"
          >
            <form
              v-if="$route.path.includes('create')"
              id="image-upload"
            >
              <label
                class="collection-image-upload"
                for="collection-image-upload"
              />
              <input
                id="collection-image-upload"
                type="file"
                accept="image/*,video/*"
                @change="setCollectionImage"
              >
              <div class="upload-file-types" />
            </form>
          </div>
        </div>
        <div
          v-if="collection.symbol"
          class="symbol-text-desktop"
        >
          <b>/ {{ collection.symbol.value }}</b>
        </div>
        <div
          v-if="collection.description"
          class="collection-description"
        >
          {{ collection.description.value }}
        </div>
      </div>
      <div
        v-if="bannerLoading == true"
        class="banner-loading"
      >
        <Loading />
      </div>
      <div
        v-else
        :id="collectionBanner"
        class="collection-banner-desktop"
      >
        <form
          v-if="$route.path.includes('create')"
          id="banner-upload"
        >
          <label
            class="collection-banner-upload"
            for="collection-banner-upload"
          />
          <input
            id="collection-banner-upload"
            type="file"
            accept="image/*,video/*"
            @change="setCollectionBanner"
          >
          <div class="upload-file-types" />
        </form>
      </div>
    </div>
  </div>
</template>
<script>

import {emit, inject, onMounted, reactive, ref, toRefs, watch} from "vue";
import {translationStore} from "@/stores/translation";
import {useRoute} from "vue-router";
import Loading from "./Loading.vue";

export default {
    "name": "CollectionPreview",
    "components": {
        Loading
    },
    "props": {
        "collection": Object
    },
    "emits": [
        "image",
        "banner"
    ],
    setup (props, {emit}) {

        const translation = translationStore(),
            route = useRoute(),
            serverConfig = inject("serverConfig"),
            collection = toRefs(props.collection),
            collectionImage = ref(`collection-image-${collection.id.value}`),
            collectionBanner = ref(`collection-banner-${collection.id.value}`),
            collectionContainer = ref(`collection-container-${collection.id.value}`),
            collectionHeaderClass = ref("collection-header-desktop"),
            bannerLoading = ref(false),
            imageLoading = ref(false),
            inUpdateView = ref(false),
            videoTypes = reactive([
                "video/mp4",
                "video/mpeg",
                "video/x-msvideo",
                "video/webm"
            ]),
            imageTypes = reactive([
                "banner/gif",
                "banner/jpeg",
                "banner/png",
                "banner/svg",
                "banner/webp"
            ]),
            isCompact = function () {

                if (serverConfig.view === "mobile") {

                    return true;

                } else if (route.path.includes("collection")) {

                    return false;

                } else if (serverConfig.windowWidth < 600 || serverConfig.windowWidth > 1023 && serverConfig.windowWidth < 1280) {

                    return true;

                }

                return false;


            },
            setCollectionImage = function (e) {

                imageLoading.value = true;

                const files = e.target.files;
                emit(
                    "image",
                    files[0]
                );
                const i = document.getElementById(collectionImage.value);
                if (i) {

                    i.style.backgroundImage = "none";

                }

            },
            setCollectionBanner = function (e) {

                bannerLoading.value = true;

                const files = e.target.files;
                emit(
                    "banner",
                    files[0]
                );

                const b = document.getElementById(collectionBanner.value);
                if (b) {

                    b.style.backgroundImage = "none";

                }

                /*
                 *if (imageTypes.indexOf(files[0].type) > -1) {
                 *
                 *    console.log("supported image type");
                 *    getMediaDimensions(
                 *        files[0],
                 *        "image",
                 *        (d) => {
                 *
                 *            collection.video.value = "";
                 *            collection.banner.value = URL.createObjectURL(files[0]);
                 *            console.log("video  " + collection.banner.value);
                 *            updateView();
                 *
                 *        }
                 *    );
                 *
                 *} else if (videoTypes.indexOf(files[0].type) > -1) {
                 *
                 *    console.log("supported video type");
                 *    getMediaDimensions(
                 *        files[0],
                 *        "video",
                 *        (d) => {
                 *
                 *            collection.banner.value = URL.createObjectURL(files[0]);
                 *            collection.video.value = URL.createObjectURL(files[0]);
                 *            console.log("video  " + collection.video.value);
                 *            updateView();
                 *
                 *        }
                 *    );
                 *
                 *} else {
                 *
                 *    console.log("not a supported type");
                 *    return;
                 *
                 *}
                 */

            },

            /*
             *getMediaDimensions = async function (f, t, c) {
             *
             *    const dimensions = {};
             *    if (t === "video") {
             *
             *        const $video = document.createElement("video");
             *        $video.src = URL.createObjectURL(f);
             *        $video.addEventListener(
             *            "loadedmetadata",
             *            function (e) {
             *
             *                console.log(e);
             *                dimensions.x = this.videoWidth;
             *                dimensions.y = this.videoLength;
             *                c(dimensions);
             *
             *            }
             *        );
             *        setTimeout(
             *            () => {
             *
             *                $video.removeEventListener(
             *                    "loadedmetadata",
             *                    () => {},
             *                    false
             *                );
             *
             *            },
             *            3000
             *        );
             *
             *    } else if (t === "banner") {
             *
             *        const img = new Image();
             *        img.src = URL.createObjectURL(f);
             *        img.onload = function () {
             *
             *            dimensions.x = img.width;
             *            dimensions.y = img.height;
             *            c(dimensions);
             *
             *        };
             *
             *    } else {
             *
             *        c();
             *
             *    }
             *
             *},
             */
            updateView = function () {

                if (collection.banner) {

                    if (collection.image.value) {

                        imageLoading.value = false;

                    }

                    if (collection.banner.value) {

                        bannerLoading.value = false;

                    }

                    setTimeout(

                        () => {

                            const i = document.getElementById(collectionImage.value);
                            if (i) {

                                if (collection.image.value) {

                                    const img = new Image();

                                    img.onload = () => {

                                        i.style.backgroundImage = `
                                          url(${process.env.VUE_APP_SERVER_URI}public/imgcache/${

    collection.image.value.replace(
        "ipfs://",
        ""
    )}_l.jpg)`;

                                    };

                                    img.onerror = () => {

                                        i.style.backgroundImage = `

                                          url(${

    collection.image.value.replace(
        "ipfs://",
        "https://w3s.link/ipfs/"
    )}`;

                                    };

                                    img.src = `${process.env.VUE_APP_SERVER_URI}public/imgcache/${

                                        collection.image.value.replace(
                                            "ipfs://",
                                            ""
                                        )}_l.jpg`;

                                } else {

                                    i.style.backgroundImage = `url('${process.env.VUE_APP_SERVER_URI}upload-canvas.jpg` + "')";

                                }

                            }

                            const b = document.getElementById(collectionBanner.value);
                            if (b) {

                                if (collection.banner.value) {

                                    const img = new Image();

                                    img.onload = () => {

                                        b.style.backgroundImage = `
                                          url(${process.env.VUE_APP_SERVER_URI}public/imgcache/${

    collection.banner.value.replace(
        "ipfs://",
        ""
    )}_l.jpg)`;

                                    };

                                    img.onerror = () => {

                                        b.style.backgroundImage = `

                                          url(${

    collection.banner.value.replace(
        "ipfs://",
        "https://w3s.link/ipfs/"
    )}`;

                                    };

                                    img.src = `${process.env.VUE_APP_SERVER_URI}public/imgcache/${

                                        collection.banner.value.replace(
                                            "ipfs://",
                                            ""
                                        )}_l.jpg`;

                                } else {

                                    b.style.backgroundImage = `url('${process.env.VUE_APP_SERVER_URI}upload-canvas.jpg` + "')";

                                }

                            }

                        },
                        100

                    );

                }

                if (collection.secondary_color) {

                    setTimeout(

                        () => {

                            const c = document.getElementById(collectionContainer.value);
                            if (c) {

                                c.style.backgroundColor = collection.secondary_color.value;

                            }

                        },
                        100

                    );

                }

                if (collection.primary_color) {

                    setTimeout(

                        () => {

                            const c = document.getElementById(collectionContainer.value);
                            if (c) {

                                c.style.color = collection.primary_color.value;

                            }

                        },
                        100

                    );

                }

                if (serverConfig.view === "desktop") {

                    collectionHeaderClass.value = "collection-header-desktop";

                } else if (serverConfig.view === "tablet") {

                    collectionHeaderClass.value = "collection-header-laptop";

                } else {

                    collectionHeaderClass.value = "collection-header-mobile";

                }

                inUpdateView.value = false;

            };

        onMounted(() => {

            if (collection.image) {

                watch(
                    () => collection.image.value,

                    (first, second) => {

                        updateView();

                    }

                );

            }

            if (collection.banner) {

                watch(
                    () => collection.banner.value,

                    (first, second) => {

                        updateView();

                    }

                );

            }


            if (collection.primary_color) {

                watch(
                    () => collection.primary_color.value,

                    (first, second) => {

                        updateView();

                    }

                );

            }

            if (collection.primary_color) {

                watch(
                    () => collection.secondary_color.value,

                    (first, second) => {

                        updateView();

                    }

                );

            }

            watch(

                () => serverConfig.view,
                () => {

                    updateView();

                }

            );

            watch(

                () => serverConfig.windowWidth,
                () => {

                    if (inUpdateView.value === false) {

                        inUpdateView.value = true;
                        updateView();

                    }

                }

            );

            updateView();

        });

        return {"localize": translation.localize,
            collection,
            collectionImage,
            collectionBanner,
            collectionContainer,
            collectionHeaderClass,
            serverConfig,
            setCollectionImage,
            setCollectionBanner,
            // getMediaDimensions,
            bannerLoading,
            imageLoading,
            isCompact,
            updateView,
            inUpdateView,
            collection};

    }
};

</script>
<style scoped>
.collection-image {
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 15px;
  background-size: cover;
  aspect-ratio: 2/1;
  -o-object-fit: cover;
  object-fit: cover;
  background-position: 50%;
  background-repeat: no-repeat;
}
.collection-banner-desktop {
  width: 66%;
  height: 100%;
  border-radius: 45px;
  background-size: cover;
  aspect-ratio: 2/1;
  object-fit: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.collection-banner-mobile {
  width: 100%;
  height: 100%;
  border-radius: 45px;
  background-size: cover;
  aspect-ratio: 2/1;
  object-fit: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.collection-preview-container-desktop {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 500px;
  border-radius: 50px;
  justify-content: space-between;
  align-items: center;
}
.collection-preview-container-mobile {
  display: flex;
  flex-direction: column;
  height: 500px;
  width: 100%;
  border-radius: 50px;
  justify-content: space-between;
  align-items: start;
}
.collection-details-mobile-container {
  width: 100%;
  padding: 20px;
}
.collection-details-mobile {
  display: flex;
  flex-direction: row;
  height: 250px;
  color: inherit;
  text-align: left;
}
.collection-details-desktop {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  height: 100%;
  width: 100%;
  padding: 20px;
  color: inherit;
  text-align: left;
  overflow: hidden;
}
form#image-upload {
  height: 100%;
}
input#collection-image-upload {
  display: none;
}
label.collection-image-upload {
  display: block;
  min-width: 100px;
  width: 100px;
  height: 100px;
  background: none;
  padding: 0;
  color: inherit;
  border: none;
  cursor: pointer;
  outline: inherit;
}
video.collection-video-image {
  pointer-events: none;
  border-radius: 15px;
  max-height: 400px;
  max-width: 800px;
  margin: 2px;
  width: 100%;
  aspect-ratio: 2/1;
  -o-object-fit: cover;
  object-fit: cover;
}
form#banner-upload {
  height: 100%;
}
input#collection-banner-upload {
  display: none;
}
label.collection-banner-upload {
  display: block;
  width: 100%;
  height: 100%;
  background: none;
  padding: 0;
  color: inherit;
  border: none;
  cursor: pointer;
  outline: inherit;
}
video.collection-video-banner {
  pointer-events: none;
  border-radius: 15px;
  max-height: 400px;
  max-width: 800px;
  margin: 2px;
  width: 100%;
  aspect-ratio: 2/1;
  -o-object-fit: cover;
  object-fit: cover;
}
.collection-relative {
  color: inherit;
  display: flex;
  justify-content: center;
  overflow: hidden;
  position: relative;
}
.collection-header-mobile-container {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  width: 60%;
  color: inherit;
  padding: 10px;
}
.collection-header-mobile {
  color: inherit;
  max-height: 100px;
  font-size: 1.8em;
  overflow: hidden;
}
.collection-header-laptop {
  color: inherit;
  max-height: 120px;
  font-size: 2.0em;
  overflow: hidden;
}
.collection-header-desktop {
  color: inherit;
  font-size: 2em;
  -webkit-line-clamp: 3;
  display: -webkit-box;
  line-height: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.collection-symbol-mobile {
  display: flex;
  flex-direction: column;
  color: inherit;
  width: 30%;
  height: 100%;
  text-overflow: ellipsis;
  justify-content: space-evenly;
}
.collection-symbol-desktop {
  display: flex;
  align-items: end;
  color: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
}
.collection-description {
  font-size: .9em;
  -webkit-line-clamp: 5;
  display: -webkit-box;
  line-height: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.symbol-text-desktop {
}
.symbol-text-mobile {
}
.ipfs-loading {
  height: 50px;
  padding: 12px 20px;
  margin: 8px 0;
  font-size: 0.9em;
  box-sizing: border-box;
  border: 2px solid #dfdfdf;
  border-radius: 15px;
  text-align: left;
  color: white;
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
	background-size: 400% 400%;
	animation: loadinggradient 10s ease infinite;
}
@keyframes loadinggradient {
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
.image-loading {
  display: flex;
  align-items: center;
  width: 100px;
  height: 100px;
  border-radius: 15px;
  background-size: cover;
  aspect-ratio: 2/1;
  object-fit: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.banner-loading {
  display: flex;
  align-items: center;
  width: 66%;
  height: 100%;
  border-radius: 45px;
  background-size: cover;
  aspect-ratio: 2/1;
  object-fit: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
