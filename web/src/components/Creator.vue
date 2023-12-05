<template>
  <div>
    <div class="isrelative">
      <CreatorFolio
        :title="input.title"
        :about="input.about"
        :image="input.image"
        :video="input.video"
        :video-thumbnail="input.videoThumbnail"
        :effect="input.effect"
        :primary-color="input.primaryColor"
        :secondary-color="input.secondaryColor"
        :n="input.n"
      >
        <template #edit>
          <div
            v-if="userInfo.user_id == owner"
            class="creatorfolio-edit-container"
          >
            <div class="creatorfolio-edit-box">
              <div class="swatches-item">
                <div
                  class="edit-creator-field"
                >
                  Edit Text
                </div>
                <div
                  class="edit-icon"
                  @click="setTextModal = true"
                />
              </div>
              <form class="swatches-item">
                <div
                  class="edit-creator-field"
                  @click="setTextModal = true"
                >
                  Set Image
                </div>
                <label
                  class="creator-file-upload"
                  for="creator-file-upload"
                />
                <input
                  id="creator-file-upload"
                  type="file"
                  accept="image/*,video/*"
                  @change="setCreatorBackdrop"
                >
              </form>
              <div class="flex-col swatches-edit">
                <div class="swatches-item">
                  <div class="edit-creator-color">
                    Primary
                  </div>
                  <VSwatches
                    v-model="input.primaryColor"
                    class="swatch-style"
                    label="Primary Color"
                    show-border="true"
                    :swatches="swatches"
                    row-length="6"
                    swatch-size="24"
                    shapes="squares"
                    popover-x="left"
                    show-fallback
                    fallback-input-type="color"
                  >
                    <template #trigger>
                      <input
                        :style="'background-color: '
                          + input.primaryColor
                          + '; width:20px; height: 20px; border: 1px solid; border-radius: 3px; margin: 5px; cursor: pointer;'"
                        readonly
                      >
                    </template>
                  </VSwatches>
                </div>
                <div class="swatches-item">
                  <div class="edit-creator-color">
                    Secondary
                  </div>
                  <VSwatches
                    v-model="input.secondaryColor"
                    class="swatch-style"
                    label="Secondary Color"
                    show-border="true"
                    :swatches="swatches"
                    row-length="6"
                    swatch-size="24"
                    shapes="squares"
                    popover-x="left"
                    show-fallback
                    fallback-input-type="color"
                  >
                    <template #trigger>
                      <input
                        :style="'background-color: '
                          + input.secondaryColor
                          + '; width:20px; height: 20px; border: 1px solid; border-radius: 3px; margin: 5px; cursor: pointer;'"
                        readonly
                      >
                    </template>
                  </VSwatches>
                </div>
              </div>
              <div
                class="save-creator"
                @click="saveCreatorFolio"
              >
                {{ localize('TEXT_SAVE') }}
              </div>
            </div>
          </div>
        </template>
      </CreatorFolio>
      <div class="creatorfolio-add-container">
        <div class="creatorfolio-add-container-left">
          <div
            v-if="userInfo.user_id == owner"
            class="flex-row"
          >
            <div
              class="generic-button"
            >
              <span class="plus-icon">
                +
              </span>
              <div
                class="creator-create-text"
                @click="createTokenModal = true"
              >
                {{ localize('TEXT_CREATE_NFT') }}
              </div>
            </div>
            <div
              v-if="isEcommerceEnabled() == true"
              class="generic-button"
            >
              <span class="plus-icon">
                +
              </span>
              <div
                class="creator-create-text"
                @click="gotoTab('create-product')"
              >
                {{ localize('TEXT_CREATE_PRODUCT') }}
              </div>
            </div>
            <div
              class="generic-button"
              @click="createPostModal = true"
            >
              <span class="plus-icon">
                +
              </span>
              <div class="creator-create-text">
                {{ localize('TEXT_POST_UPDATE') }}
              </div>
            </div>
            <div
              v-if="userInfo.user_id == owner"
              class="generic-button"
              @click="openSmModal = true"
            >
              <span class="plus-icon">
                +
              </span>
              <div class="creator-create-text">
                {{ localize('TEXT_EDIT_SOCIAL') }}
              </div>
            </div>
            <div
              v-if="userInfo.user_id == owner"
              class="generic-button"
              @click="addSectionModal = true"
            >
              <span class="plus-icon">
                +
              </span>
              <div class="creator-create-text">
                {{ localize('ADD_SECTION') }}
              </div>
            </div>
          </div>
        </div>
        <div class="creatorfolio-add-container-right">
          <div
            v-if="sm.website"
            class="sm-website"
            @click="gotoUrl(sm.website)"
          />
          <div
            v-if="sm.instagram"
            class="sm-instagram"
            @click="gotoUrl(sm.instagram)"
          />
          <div
            v-if="sm.twitter"
            class="sm-twitter"
            @click="gotoUrl(sm.twitter)"
          />
          <div
            v-if="sm.twitch"
            class="sm-twitch"
            @click="gotoUrl(sm.twitch)"
          />
          <div
            v-if="sm.youtube"
            class="sm-youtube"
            @click="gotoUrl(sm.youtube)"
          />
        </div>
      </div>
    </div>
    <div class="content-container">
      <ProjectComponent
        v-for="i in project"
        data="i"
        class="project-contaner"
      />
    </div>
    <div
      v-for="i in creatorposts"
      :key="i.id"
      :class="creatorpostsClass"
    >
      <div class="creatorposts-wrapper">
        <div>
          <CreatorPost
            :id="i.id"
            :content="i.content"
            :url="i.preview.url"
            :title="i.preview.title"
            :site-name="i.preview.siteName"
            :description="i.preview.description"
            :media-type="i.preview.mediaType"
            :content-type="i.preview.contentType"
            :image="i.preview.image"
            :video="i.preview.video"
            :favicons="i.preview.favicons"
            :owner="owner"
            :created="i.created"
            :edited="i.edited"
            @edit-post="editPost(i)"
          />
        </div>
      </div>
    </div>

    <CollectionPreview
      v-for="a in collections"
      class="mid-section"
      :collection="a"
      @click="gotoCollection(a.nft_address)"
    />

    <CModal
      v-if="createTokenModal"
      color="#995dd4"
      width="medium"
      @close="createTokenModal = false"
    >
      <template #header>
        <div> {{ localize('CREATE_TOKENS_MODAL_TITLE') }} </div>
      </template>
      <template #body>
        <div class="flex-col">
          <div class="flex-row">
            <div
              class="erc-button-outer"
            >
              <div
                class="erc-button-inner"
                @click="gotoTab('create-erc-20')"
              >
                NFT ERC-20
              </div>
            </div>
            <div class="erc-description">
              {{ localize('CREATE_ERC20') }}
            </div>
          </div>
          <div class="flex-row">
            <div
              class="erc-button-outer"
            >
              <div
                class="erc-button-inner"
                @click="gotoTab('create-erc-721')"
              >
                NFT ERC-721
              </div>
            </div>
            <div class="erc-description">
              {{ localize('CREATE_ERC721') }}
            </div>
          </div>
          <div class="flex-row">
            <div
              class="erc-button-outer"
            >
              <div
                class="erc-button-inner"
                @click="gotoTab('create-erc-1155')"
              >
                NFT ERC-1155
              </div>
            </div>
            <div class="erc-description">
              {{ localize('CREATE_ERC1155') }}
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="hidden" />
      </template>
    </CModal>

    <CModal
      v-if="saveFolioModal"
      color="#995dd4"
      @close="closeSaveFolioModal"
    >
      <template #header>
        <div> Save Folio </div>
      </template>
      <template #body>
        {{ saveFolioModalMessage }}
      </template>
      <template #footer>
        <div class="hidden" />
      </template>
    </CModal>

    <CModal
      v-if="openSmModal"
      color="#995dd4"
      width="large"
      @close="openSmModal = false"
    >
      <template #header>
        <div> Create Post </div>
      </template>
      <template #body>
        <div class="creator-modal-edit">
          <input
            v-model="sm.website"
            class="text-input"
            placeholder="Website"
            type="text"
          >
          <input
            v-model="sm.instagram"
            class="text-input"
            placeholder="Instagram"
            type="text"
          >
          <input
            v-model="sm.twitter"
            class="text-input"
            placeholder="Twitter"
            type="text"
          >
          <input
            v-model="sm.twitch"
            class="text-input"
            placeholder="Twitch"
            type="text"
          >
          <input
            v-model="sm.youtube"
            class="text-input"
            placeholder="Youtube"
            type="text"
          >
          <div class="flex-row">
            <div
              class="save-creator"
              @click="saveSm"
            >
              {{ localize('TEXT_SAVE') }}
            </div>
            <div
              class="close-edit"
              @click="openSmModal = false"
            >
              Close
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="hidden" />
      </template>
    </CModal>

    <CModal
      v-if="createPostModal"
      color="#995dd4"
      width="large"
      @close="closeCreatePostModal"
    >
      <template #header>
        <div> Create Post </div>
      </template>
      <template #body>
        <CreatePost
          :pid="currentPost.pid"
          :preview="currentPost.preview"
          :content="currentPost.content"
          @close="createPostEvent"
        >
          Post Update
        </CreatePost>
      </template>
      <template #footer>
        <div class="hidden" />
      </template>
    </CModal>

    <CModal
      v-if="setTextModal"
      width="medium"
      color="#995dd4"
      @close="setTextModal = false"
    >
      <template #header>
        <div> Edit </div>
      </template>
      <template #body>
        <div class="creator-modal-edit">
          <input
            v-model="input.title"
            class="text-input"
            placeholder="Title"
            type="text"
          >
          <textarea
            v-model="input.about"
            class="text-input"
            placeholder="description"
            type="text"
          />
          <div
            class="close-edit"
            @click="setTextModal = false"
          >
            Close
          </div>
        </div>
      </template>
      <template #footer>
        <div class="hidden" />
      </template>
    </CModal>

    <CModal
      v-if="addSectionModal"
      color="#995dd4"
      width="large"
      @close="addSectionModal = false"
    >
      <template #header>
        <div> Add Section </div>
      </template>
      <template #body>
        <div
          @click="addFullpageComponent"
        >
          Add a Full Page Component.
        </div>
        <div
          @click="addRoadmapComponent"
        >
          Add a Roadmap Component.
        </div>
        <div
          @click="addTeamComponent"
        >
          Add a Team Component.
        </div>
        <div
          @click="addColumnComponent"
        >
          Add a column Information Component.
        </div>
        <div
          @click="addRowComponent"
        >
          Add a row Information component.
        </div>
        <div
          @click="addCarouselComponent"
        >
          Add a carousel component.
        </div>
      </template>
      <template #footer>
        <div class="hidden" />
      </template>
    </CModal>

  </div>
</template>
<script>

import {inject, onMounted, reactive, ref, watch} from "vue";
import {translationStore} from "@/stores/translation";
import CollectionPreview from "./CollectionPreview.vue";
import CreatorFolio from "./CreatorFolio.vue";
import CreatorPost from "./CreatorPost.vue";
import CreatePost from "./CreatePost.vue";
import ProjectComponent from "./ProjectComponent.vue";
import Axios from "axios";
import {useRoute, useRouter} from "vue-router";

export default {
    "name": "Creator",
    "components": {
        CollectionPreview,
        CreatorFolio,
        CreatorPost,
        CreatePost,
        ProjectComponent
    },
    setup () {

        const translation = translationStore(),
            router = useRouter(),
            route = useRoute(),
            creatorposts = reactive([]),
            userInfo = inject("userInfo"),
            offset = ref(0),
            collections = reactive([]),
            input = reactive({
                "title": "ShinoVi",
                "about": "",
                "image": "",
                "video": "",
                "videoThumbnail": "",
                "effect": "",
                "primaryColor": "#fff0fa",
                "secondaryColor": "#dbd0e6",
                "n": 0
            }),
            sm = reactive({
                "website": "",
                "instagram": "",
                "twitter": "",
                "twitch": "",
                "youtube": ""
            }),
            swatches = [
                "#efab93",
                "#ee827c",
                "#ec6d71",
                "#e95295",
                "#d7003a",
                "#e60033",
                "#fef263",
                "#ec6d51",
                "#f8b500",
                "#ffd900",
                "#ffdb4f",
                "#e6b422",
                "#dccb18",
                "#c3d825",
                "#69821b",
                "#316745",
                "#007b43",
                "#028760",
                "#a0d8ef",
                "#89c3eb",
                "#00a3af",
                "#2ca9e1",
                "#19448e",
                "#165e83",
                "#dbd0e6",
                "#cc7eb1",
                "#674598",
                "#4d4398",
                "#55295b",
                "#884898"
            ],
            serverConfig = inject("serverConfig"),
            setTextModal = ref(false),
            addSectionModal = ref(false),
            createTokenModal = ref(false),
            openSmModal = ref(false),
            createPostModal = ref(false),
            saveFolioModal = ref(false),
            saveFolioModalMessage = ref(""),
            project = ref([]),
            creatorpostsClass = ref("creatorposts-desktop"),
            shinobi = ref(""),
            owner = ref(""),
            currentPost = reactive({

                "pid": "",
                "preview": {},
                "conetnt": ""

            }),
            addFullpageComponent = function () {

                project.value.push({page:"fullpage"});

            },
            addRoadmapComponent = function () {
            },
            addTeamComponent = function () {
            },
            addColumnComponent = function () {
            },
            addRowComponent = function () {
            },
            addCarouselComponent = function () {
            },
            editPost = function (p) {

                currentPost.pid = p.id;
                currentPost.preview = p.preview;
                currentPost.content = p.content;
                createPostModal.value = true;

            },
            isEcommerceEnabled = function (p) {

                console.log("`${process.env.VUE_APP_ECOMMERCE_MODULE}`");
                console.log(`${process.env.VUE_APP_ECOMMERCE_MODULE}`);
                console.log(process.env.VUE_APP_ECOMMERCE_MODULE);

                if (`${process.env.VUE_APP_ECOMMERCE_MODULE}` === true) {

                    return true;

                }

                return false;


            },
            gotoCollection = function (address) {

                router.push({"path": `/collection/${address}/`}).catch((err) => {

                    throw err;

                });

            },
            gotoTab = function (t) {

                router.push({"name": t,
                    "path": `/${t}`}).catch((err) => {

                    throw err;

                });

            },
            gotoUrl = function (url) {

                window.open(url);

            },
            videoTypes = reactive([
                "video/mp4",
                "video/mpeg",
                "video/x-msvideo",
                "video/webm"
            ]),
            imageTypes = reactive([
                "image/gif",
                "image/jpeg",
                "image/png",
                "image/svg",
                "image/webp"
            ]),
            file = ref(null),
            maxVideoSize = ref("1000000000"),
            maxImageSize = ref("10000000"),
            closeCreatePostModal = function () {

                createPostModal.value = false;
                creatorposts.value = [];
                getPosts();

            },
            closeSaveFolioModal = function () {

                saveFolioModal.value = false;

            },
            setCreatorBackdrop = function (e) {

                const files = e.target.files;
                file.value = files[0];

                if (imageTypes.indexOf(files[0].type) > -1) {

                    console.log("supported image type");
                    getMediaDimensions(
                        files[0],
                        "image",
                        (d) => {

                            file.value.dimensions = d;
                            input.video = "";
                            input.image = URL.createObjectURL(files[0]);

                        }
                    );

                } else if (videoTypes.indexOf(files[0].type) > -1) {

                    console.log("supported video type");
                    getMediaDimensions(
                        files[0],
                        "video",
                        (d) => {

                            file.value.dimensions = d;
                            input.image = "";
                            input.video = URL.createObjectURL(files[0]);

                        }
                    );

                } else {

                    console.log("not a supported type");

                }

            },
            getMediaDimensions = async function (f, t, c) {

                const dimensions = {};
                if (t === "video") {

                    const $video = document.createElement("video");
                    $video.src = URL.createObjectURL(f);
                    $video.addEventListener(
                        "loadedmetadata",
                        function () {

                            dimensions.x = this.videoWidth;
                            dimensions.y = this.videoLength;
                            c(dimensions);

                        }
                    );
                    setTimeout(
                        () => {

                            $video.removeEventListener(
                                "loadedmetadata",
                                () => {},
                                false
                            );

                        },
                        3000
                    );

                } else if (t === "image") {

                    const img = new Image();
                    img.src = URL.createObjectURL(f);
                    img.onload = function () {

                        dimensions.x = img.width;
                        dimensions.y = img.height;
                        c(dimensions);

                    };

                } else {

                    c();

                }

            },
            saveCreatorFolio = function () {

                input.file = file;
                input.name = route.path.slice(
                    1,
                    -1
                );

                Axios.post(

                    `${process.env.VUE_APP_SERVER_URI}addFolio`,
                    input,
                    {

                        "headers": {
                            "Content-Type": "multipart/form-data"
                        }

                    }

                ).
                    then((response) => {

                        if (response.status === 200) {

                            console.log(response);
                            saveFolioModal.value = true;
                            saveFolioModalMessage.value = translation.localize("SAVE_MODAL_MESSAGE_SUCCESS");

                        } else {

                            console.log(response);
                            saveFolioModal.value = true;
                            saveFolioModalMessage.value = translation.localize("SAVE_MODAL_MESSAGE_FAILED");

                        }

                    }).
                    catch((error) => {

                        saveFolioModal.value = true;
                        saveFolioModalMessage.value = translation.localize("SAVE_MODAL_MESSAGE_FAILED");
                        throw error;

                    });

            },

            saveSm = function (e) {

                Axios.get(

                    `${process.env.VUE_APP_SERVER_URI}updateSocialMedia`,
                    {
                        "params": {
                            "name": route.path.slice(
                                1,
                                -1
                            ),
                            "website": sm.website,
                            "instagram": sm.instagram,
                            "twitter": sm.twitter,
                            "twitch": sm.twitch,
                            "youtube": sm.youtube
                        }
                    }

                ).
                    then((response) => {

                        console.log(response);
                        if (response.status === 200) {

                            openSmModal.value = false;

                        }

                    });

            },

            getCollections = function (e) {

                Axios.get(

                    `${process.env.VUE_APP_SERVER_URI}getCollectionsByCreator`,
                    {
                        "params": {

                            "name": route.path.slice(
                                1,
                                -1
                            )

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

            },


            getPosts = function (e) {

                creatorposts.splice(0);

                Axios.get(

                    `${process.env.VUE_APP_SERVER_URI}getPosts`,
                    {
                        "params": {
                            "name": route.path.slice(
                                1,
                                -1
                            ),
                            offset
                        }
                    }
                ).
                    then((response) => {

                        if (response.status === 200) {

                            for (let i = 0; i < response.data.length; i++) {

                                creatorposts.push(response.data[i]);

                            }
                            offset.value = creatorposts.length;

                            if (route.hash) {

                                setTimeout(
                                    () => {

                                        document.getElementById(`content-${route.hash.substring(1)}`).scrollIntoView({

                                            "behavior": "smooth"

                                        });

                                    },
                                    3
                                );

                            }

                        }

                    });

            },
            getFolio = function (e) {

                Axios.get(

                    `${process.env.VUE_APP_SERVER_URI}getFolio`,
                    {
                        "params": {
                            "name": route.path.slice(
                                1,
                                -1
                            )
                        }
                    }
                ).
                    then((response) => {

                        if (response.status === 200) {

                            input.title = response.data.title;
                            input.about = response.data.about;
                            if (response.data.image) {

                                input.image = response.data.image;

                            }
                            if (response.data.video) {

                                input.video = response.data.video;

                            }
                            if (response.data.video_thumbnail) {

                                input.videoThumbnail = response.data.video_thumbnail;

                            }
                            if (response.data.effect) {

                                input.effect = response.data.effect;

                            }
                            if (response.data.primary_color) {

                                input.primaryColor = response.data.primary_color;

                            }
                            if (response.data.secondary_color) {

                                input.secondaryColor = response.data.secondary_color;

                            }
                            owner.value = response.data.user_id;

                            if (!response.data.video && !response.data.image) {

                                input.image = `${process.env.VUE_APP_SERVER_URI}public/folio/default.jpg`;

                            }
                            // socialmedia
                            sm.website = response.data.website;
                            sm.instagram = response.data.instagram;
                            sm.twitter = response.data.twitter;
                            sm.twitch = response.data.twitch;
                            sm.youtube = response.data.youtube;

                        }

                    }).
                    catch((error) => {

                        throw error;

                    });

            },
            createPostEvent = function () {

                createPostModal.value = false;
                creatorposts.value = [];
                offset.value = 0;
                getPosts();

            },
            updateView = function () {

                if (serverConfig.view === "desktop") {

                    shinobi.value = "shinobi-desktop";
                    creatorpostsClass.value = "creatorposts-desktop";

                } else if (serverConfig.view === "laptop") {

                    shinobi.value = "shinobi-desktop";
                    creatorpostsClass.value = "creatorposts-desktop";

                } else if (serverConfig.view === "tablet") {

                    shinobi.value = "shinobi-mobile";
                    creatorpostsClass.value = "creatorposts-desktop";

                } else if (serverConfig.view === "mobile") {

                    shinobi.value = "shinobi-mobile";
                    creatorpostsClass.value = "creatorposts-mobile";

                } else {

                    shinobi.value = "shinobi-mobile";
                    creatorpostsClass.value = "creatorposts-mobile";

                }

            };

        onMounted(() => {

            getCollections();

            watch(
                () => serverConfig.view,

                (first, second) => {

                    updateView();

                }

            );

            setTimeout(
                () => {

                    getPosts();

                },
                1000
            );

            setTimeout(
                () => {

                    getFolio();

                },
                1000
            );

        });

        return {"localize": translation.localize,
            input,
            sm,
            saveSm,
            project,
            editPost,
            addFullpageComponent,
            addRoadmapComponent,
            addTeamComponent,
            addColumnComponent,
            addRowComponent,
            addCarouselComponent,
            currentPost,
            createTokenModal,
            closeCreatePostModal,
            closeSaveFolioModal,
            collections,
            getCollections,
            isEcommerceEnabled,
            creatorposts,
            createPostEvent,
            offset,
            userInfo,
            owner,
            getMediaDimensions,
            getFolio,
            getPosts,
            gotoUrl,
            gotoTab,
            gotoCollection,
            setCreatorBackdrop,
            setTextModal,
            openSmModal,
            createPostModal,
            addSectionModal,
            saveFolioModal,
            saveFolioModalMessage,
            updateView,
            imageTypes,
            videoTypes,
            maxVideoSize,
            maxImageSize,
            shinobi,
            swatches,
            saveCreatorFolio,
            creatorpostsClass,
            serverConfig};

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
.content-container {
  display: flex;
  flex-direction: column;
  max-width: 1600px;
}
.create-box {
  border: 2px dashed #1d1d1d;
  min-width: 300px;
  max-width: 800px;
  height: 300px;
  width: 100%;
  padding: 20px;
}
.generic-button {
  display: flex;
  justify-content: center;
  font-family: Comfortaa,sans-serif;
  text-align: left;
  white-space: nowrap;
  color: #545454;
  padding: 10px;
  margin: 10px 0px 10px 10px;
  border-radius: 3px;
  font-size: 0.9em;
  border: 1px solid #efefef;
  cursor: pointer;
  background: #ffffff;
}
.plus-icon {
  font-size: 1.2em;
  font-weight: bold;
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
.creatorposts-mobile {
  width: 95%;
  margin-left: auto;
  margin-right: auto;
  margin-top: 50px;
  border-radius: 15px;
  box-shadow: 0px 10px 20px 10px rgb(0 0 0 / 10%), 0 8px 10px -6px rgb(0 0 0 / 10%);
}
.fill {
  position: relative;
  width: 100%;
}
.creatorposts-desktop {
  display: flex;
  flex-direction: column;
  width: 70%;
  margin-top: 100px;
  margin-left: auto;
  margin-right: auto;
  border-radius: 15px;
  box-shadow: 0px 10px 20px 10px rgb(0 0 0 / 10%), 0 8px 10px -6px rgb(0 0 0 / 10%);
}
.creatorposts-desktop {
  display: flex;
  flex-direction: column;
}
.creator-create-text {
  margin: 2px 2px 2px 10px;
}
.edit-creator-field {
  display: flex;
  justify-content: center;
  flex-direction: column;
  text-align: left;
  padding-top: 5px;
  padding-bottom: 5px;
}
.edit-creator-color {
  display: flex;
  justify-content: center;
  flex-direction: column;
}
.swatch-style {
}
.creatorfolio-add-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.sm-website {
  margin: 5px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  background-size: cover;
  background-image: url("../assets/website64.png")
}
.sm-twitter {
  margin: 5px;
  width: 38px;
  height: 32px;
  cursor: pointer;
  background-size: cover;
  background-image: url("../assets/Twitter64.webp")
}
.sm-twitch {
  margin: 5px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  background-size: cover;
  background-image: url("../assets/th64.webp")
}
.sm-instagram {
  margin: 5px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  background-size: cover;
  background-image: url("../assets/isnta64.webp")
}
.sm-youtube {
  margin: 5px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  background-size: cover;
  background-image: url("../assets/yt64.webp")
}
.isrelative {
  position: relative;
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
.creatorfolio-edit-container {
  display: flex;
  align-items: end;
  z-index: 1;
}
.creatorfolio-edit-box {
  margin: 10px;
  font-size: 0.8em;
  padding: 10px;
  display: flex;
  flex-direction: column;
  border: 1px solid #a5a5a5;
  border-radius: 5px;
  background-color: #ffffffd6;
}
.swatches-edit {
  display: flex;
  flex-direction: columns;
}
.swatches-item {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
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
.creatorfolio-add-container-right {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
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
.mid-section {
  width: 70%;
  max-width: 1600px;
  margin: 50px 10px;
  justify-content: center;
  cursor: pointer;
  margin-left: auto;
  margin-right: auto;
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
  padding-left: 25%;
  z-index: -2;
}
#home {
  min-height: 1000px;
}
.spacer {
  width: 20px;
}
.text-left {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
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
  align-items: flex-end;
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
  //-webkit-mask: linear-gradient(to right,black calc(100% - 8rem),transparent 100%);
  //mask: linear-gradient(to right,black calc(100% - 8rem),transparent 100%);
  //-webkit-backdrop-filter: blur(0.5rem);
  backdrop-filter: blur(0.4em);
}
.blur-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  -webkit-mask: linear-gradient(to top,black calc(100% - 8rem),transparent 100%);
  mask: linear-gradient(to top,black calc(100% - 8rem),transparent 100%);
  -webkit-backdrop-filter: blur(0.5rem);
  backdrop-filter: blur(0.4em);
}
.darken-left {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 60%;
  -webkit-mask: linear-gradient(to right,#000000cc calc(100% - 8rem),transparent 100%);
  mask: linear-gradient(to right,black calc(100% - 8rem),transparent 100%);
  -webkit-backdrop-filter: blur(1rem);
  backdrop-filter: blur(1rem);
}
input#creator-file-upload {
  display: none;
}
label.creator-file-upload {
  display: block;
  margin: 5px;
  width: 26px;
  height: 24px;
  padding: 0;
  color: inherit;
  border: none;
  cursor: pointer;
  outline: inherit;
  background-image: url('../assets/upload-icon-small.png');
  background-size: contain;
  background-repeat: no-repeat;
}
.edit-icon {
  display: block;
  margin: 5px;
  width: 26px;
  height: 24px;
  padding: 0;
  cursor: pointer;
  background-image: url('../assets/edit-icon.png');
  background-size: contain;
  background-repeat: no-repeat;
}
.save-creator {
  display: flex;
  margin-top: 5px;
  justify-content: center;
  width: fit-content;
  font-family: Comfortaa,sans-serif;
  text-align: left;
  white-space: nowrap;
  color: #fff;
  font-weight: 500;
  padding: 10px;
  border-radius: 3px;
  border: none;
  cursor: pointer;
  background: linear-gradient(338deg,#ff7c88,#ff46a4);
}
.creator-modal-edit {
  display: flex;
  flex-direction: column;
}
.close-edit {
  font-family: Comfortaa,sans-serif;
  text-align: left;
  font-size: 0.8em;
  margin-top: 20px;
  margin-left: 20px;
  color: ##525252;
}
.close-edit:hover {
  text-decoration: underline;
  cursor: pointer;
}
input.text-input {
  line-height: 30px;
  font-size: 0.8em;
  text-indent: 5px;
  padding: 5px;
  margin: 5px;
  border: none;
  border: 2px solid #995dd4;
  border-radius: 10px;
  outline: 0;
}
textarea.text-input {
  flex-grow: 1;
  line-height: 30px;
  font-size: 0.8em;
  text-indent: 5px;
  padding: 5px;
  margin: 5px;
  border: none;
  border: 2px solid #995dd4;
  border-radius: 10px;
  outline: 0;
}
.erc-button-inner {
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: Comfortaa,sans-serif;
  text-align: left;
  white-space: nowrap;
  color: #545454;
  padding: 10px;
  min-width: 76px;
  border-radius: 8px;
  font-size: .8em;
  font-weight: bold;
  cursor: pointer;
  background: #fff;
  border: 2px solid #08102e5e;
}
.erc-button-outer {
  display: flex;
  justify-content: center;
  font-family: Comfortaa,sans-serif;
  text-align: left;
  white-space: nowrap;
  color: #545454;
  padding: 1px;
  margin: 10px 0 10px 10px;
  min-width: 100px;
  border-radius: 10px;
  font-size: .8em;
  font-weight: bold;
  cursor: pointer;
  background: #fff;
  border: 1px solid #08102e5e;
}
.erc-description {
  padding: 10px;
  font-size: 0.8em;
}
</style>
