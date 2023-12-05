<template>
  <div>
    <div class="preview">
      <img
        class="preview-image"
        :src="preview.image.value"
        @click="gotoUrl"
      >
      <div class="preview-text">
        <h1 class="preview-title">
          {{ preview.title.value }}
        </h1>
        <div class="preview-description">
          {{ preview.description.value }}
        </div>
      </div>
      <div
        :id="'content-'+id"
        class="post-content"
      />
    </div>
    <div class="flex-row-end">
      <div
        v-if="preview.created"
        class="creator-subscript"
      >
        {{ getDate(preview.created.value) }}
      </div>
      <div
        v-if="preview.edited"
        class="creator-subscript"
      >
        {{ getDate(preview.edited.value) }}
      </div>
      <div
        v-if="userInfo.user_id == preview.owner.value"
        class="creator-subscript creator-edit"
        @click="editPost()"
      >
        edit
      </div>
      <div
        v-if="userInfo.user_id == preview.owner.value"
        class="creator-subscript creator-edit"
        @click="deletePost()"
      >
        delete
      </div>
      <div
        class="creator-subscript creator-edit"
        @click="copyPostLink()"
      >
        copy link
      </div>
      <div
        class="creator-subscript creator-edit share-icon"
        @click="openShareModal = true"
      />
    </div>

    <CModal
      v-if="openShareModal"
      color="#995dd4"
      width="large"
      @close="openShareModal = false"
    >
      <template #header>
        <div> Share Post </div>
      </template>
      <template #body>
        <div class="creator-modal-edit">

          <div
            class="sn-icons"
          >

            <div
              class="sn-line-icon"
            >
              <ShareNetwork
                class="sn-block"
                network="line"
                :url="getPostLink()"
                :title="getPostTitle()"
                :media="getPostImage()"
                :description="getPostDescription()"
              >
              </ShareNetwork>
            </div>

            <div
              class="sn-weibo-icon"
            >
              <ShareNetwork
                class="sn-block"
                network="weibo"
                :url="getPostLink()"
                :title="getPostTitle()"
                :media="getPostImage()"
                :description="getPostDescription()"
              >
              </ShareNetwork>
            </div>

            <div
              class="sn-facebook-icon"
            >
              <ShareNetwork
                class="sn-block"
                network="facebook"
                :url="getPostLink()"
                :title="getPostTitle()"
                :media="getPostImage()"
                :description="getPostDescription()"
              >
              </ShareNetwork>
            </div>

            <div
              class="sn-linkedin-icon"
            >
              <ShareNetwork
                class="sn-block"
                network="linkedin"
                :url="getPostLink()"
                :title="getPostTitle()"
                :media="getPostImage()"
                :description="getPostDescription()"
              >
              </ShareNetwork>
            </div>

            <div
              class="sn-reddit-icon"
            >
              <ShareNetwork
                class="sn-block"
                network="reddit"
                :url="getPostLink()"
                :title="getPostTitle()"
                :media="getPostImage()"
                :description="getPostDescription()"
              >
              </ShareNetwork>
            </div>

            <div
              class="sn-twitter-icon"
            >
              <ShareNetwork
                class="sn-block"
                network="Twitter"
                :url="getPostLink()"
                :title="getPostTitle()"
                :media="getPostImage()"
                :description="getPostDescription()"
              >
              </ShareNetwork>
            </div>

            <div
              class="sn-copy-link"
              @click="navigator.clipboard.writeText(window.location.href)"
            >
              copy link []
            </div>

          </div>

          <div
            class="close-edit"
            @click="openShareModal = false"
          >
            Close
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

import {emit, inject, onMounted, reactive, ref, toRefs, unref, watch} from "vue";
import {translationStore} from "@/stores/translation";
import {useRoute} from "vue-router";

export default {
    "name": "CreatorPost",
    "components": {
    },
    "props": {
        "id": Number,
        "url": String,
        "title": String,
        "siteName": String,
        "description": String,
        "mediaType": String,
        "contentType": String,
        "image": String,
        "video": String,
        "content": String,
        "created": String,
        "edited": String,
        "owner": String
    },
    "emits": [
        "edit-post",
    ],
    setup (props, {emit}) {

        const translation = translationStore(),
            route = useRoute(),
            userInfo = inject("userInfo"),
            serverConfig = inject("serverConfig"),
            preview = toRefs(props),
            previewImage = ref(),
            previewVideo = ref(),
            openShareModal =ref(false),
            gotoUrl = function () {

                window.open(preview.url.value);
                console.log(preview.url.value);

            },

            getDate = function (d) {

                return new Date(parseInt(d)).toDateString();

            },

            editPost = function () {

                emit("edit-post", preview)

            },

            deletePost = function () {

                Axios.get(

                    `${process.env.VUE_APP_SERVER_URI}deletePost`,
                    {
                        "params": {
                            "pid": preview.id
                        }
                    }
                ).
                    then((response) => {

                        if (response.status === 200) {
                        }

                    });

            },

            copyPostLink = function () {

                let name = route.path.slice(
                    1,
                    -1
                );
                let p = route.path.substring(1);
                navigator.clipboard.writeText(`${process.env.VUE_APP_SERVER_URI}${p}#${preview.id.value}`);

            },

            getPostLink = function () {

                let name = route.path.slice(
                    1,
                    -1
                );
                let p = route.path.substring(1);
                return `${process.env.VUE_APP_SERVER_URI}${p}#${preview.id.value}`;

            },

            getPostTitle = function () {

                if (preview.title.value) {

                    return preview.title.value

                } else {

                    let t = preview.content.value.replace(/(\s*<.*?>\s*)+/g, ' ').trim()
                    console.log(t)
                    return t.substring(0,22) + "..";

                }

            },

            getPostDescription = function () {

                if (preview.title.value) {

                    return preview.description.value

                } else {

                    let t = preview.content.value.replace(/(\s*<.*?>\s*)+/g, ' ').trim()
                    console.log(t)
                    return t.substring(0,122) + "..";

                }

            },

            getPostImage = function () {

                if (preview.description.value) {

                    return preview.description.value

                } else {

                    var doc = document.createElement("html");
                    doc.innerHTML = preview.content.value;
                    var img = doc.getElementsByTagName("img")[0]
                    if (img) {

                        return img.getAttribute('src');

                    } else {

                        return "https://shinovi.io/public/shinovi-logo.svg"

                    }

                }

            },

            updateView = function () {

                if (serverConfig.view === "desktop") {


                } else if (serverConfig.view === "laptop") {


                } else if (serverConfig.view === "tablet") {


                } else if (serverConfig.view === "mobile") {


                } else {


                }

            };

        onMounted(() => {

            if (preview.id.value) {

                const c = document.getElementById(`content-${preview.id.value}`);
                c.innerHTML = unref(preview.content);

            }

            watch(

                () => serverConfig.view,
                () => {

                    updateView();

                }

            );

        });

        return {"localize": translation.localize,
            serverConfig,
            editPost,
            deletePost,
            userInfo,
            copyPostLink,
            getPostLink,
            getPostTitle,
            getPostDescription,
            getPostImage,
            openShareModal,
            gotoUrl,
            getDate,
            preview};

    }
};

</script>
<style scoped>
.save-creator {
  display: flex;
  margin-top: 20px;
  width: 100px;
  justify-content: center;
  font-size: 0.9em;
  font-family: Comfortaa,sans-serif;
  text-align: left;
  white-space: nowrap;
  color: #fff;
  font-weight: 500;
  padding: 5px;
  border-radius: 3px;
  border: none;
  cursor: pointer;
  background: linear-gradient(338deg,#ff7c88,#ff46a4);
}
.creator-subscript {
  margin: 20px;
  font-size: .8em;
  color: #404040;
  display: flex;
  align-items: end;
}
.creator-edit:hover {
  cursor: pointer;
  text-decoration: underline;
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
.preview {
  color: #404040;
}
.preview-description {
  font-size: 0.9em;
}
.preview-text {
  overflow: hidden;
  margin: 20px;
}
.post-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  margin: 20px;
}
h1.preview-title {
  font-family: var(--font_family_headings, var(--font_family_headings_preset, 'SF Compact Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'));
  font-weight: var(--font_weight_headings_preset, bold);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: antialiased;
  font-size: var(--font-size-32);
  line-height: var(--line-height-36);
}
img.preview-image {
  cursor: pointer;
  width: 100%;
  border-radius: 15px 15px 0 0;
}
.quill-input {
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
.flex-row-end {
  display: flex;
  flex-direction: row;
  justify-content: end;
}
.share-icon {
  display: block;
  margin: 20px;
  width: 48px;
  height: 32px;
  padding: 0;
  cursor: pointer;
  background-image: url('../assets/share-icon.png');
  background-size: contain;
  background-repeat: no-repeat;
}
.sn-icons {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}
.sn-line-icon {
  cursor: pointer;
  height: 48px;
  min-width: 200px;
  margin: 10px;
  background-image: url('../assets/line-icon.png');
  background-size: contain;
  background-repeat: no-repeat;
}
.sn-weibo-icon {
  cursor: pointer;
  height: 48px;
  min-width: 200px;
  margin: 10px;
  background-image: url('../assets/weibo-icon.png');
  background-size: contain;
  background-repeat: no-repeat;
}
.sn-facebook-icon {
  cursor: pointer;
  height: 48px;
  min-width: 200px;
  margin: 10px;
  background-image: url('../assets/facebook-icon.png');
  background-size: contain;
  background-repeat: no-repeat;
}
.sn-twitter-icon {
  cursor: pointer;
  height: 48px;
  min-width: 200px;
  margin: 10px;
  background-image: url('../assets/twitter-icon.png');
  background-size: contain;
  background-repeat: no-repeat;
}
.sn-reddit-icon {
  cursor: pointer;
  height: 48px;
  min-width: 200px;
  margin: 10px;
  background-image: url('../assets/reddit-icon.png');
  background-size: contain;
  background-repeat: no-repeat;
}
.sn-linkedin-icon {
  cursor: pointer;
  height: 48px;
  min-width: 200px;
  margin: 10px;
  background-image: url('../assets/linkedin-icon.png');
  background-size: contain;
  background-repeat: no-repeat;
}
.sn-copy-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  height: 28px;
  min-width: 100px;
  margin: 10px;
  color: white;
  padding: 10px;
  border-radius: 3px;
  background-color: #505050;
  background-size: contain;
  background-repeat: no-repeat;
}
.sn-block {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
