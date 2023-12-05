<template>
  <div class="fill">
    <div v-if="loading == true">
      <Loading />
    </div>
    <div v-else>
      <CreatorPost
        :url="preview.url"
        :title="preview.title"
        :site-name="preview.siteName"
        :description="preview.description"
        :media-type="preview.mediaType"
        :content-type="preview.contentType"
        :image="preview.image"
        :video="preview.video"
        :favicons="preview.favicons"
      />
    </div>
    <QuillEditor
      v-model:content="content"
      class="quill-input"
      content-type="html"
      :modules="modules"
      toolbar="full"
      theme="snow"
      enable="true"
    />
    <div class="link-container">
      <label
        class="create-post-url"
        for="create-post-url"
      />
      <input
        id="create-post-url"
        v-model="link"
        type="text"
        class="link-input"
        placeholder="https://... add a link ."
      >
    </div>
    <div
      class="save-create"
      @click="saveCreatePost"
    >
      {{ localize('TEXT_SAVE') }}
    </div>
  </div>
</template>
<script>

import {emit, inject, onMounted, reactive, ref, toRefs, unref, watch} from "vue";
import {translationStore} from "@/stores/translation";
import {useRoute} from "vue-router";
import {QuillEditor} from "@vueup/vue-quill";
import BlotFormatter from "quill-blot-formatter";
import ImageUploader from "quill-image-uploader";
import Axios from "axios";
import CreatorPost from "./CreatorPost.vue";
import Loading from "./Loading.vue";


export default {
    "name": "CreatePost",
    "components": {
        CreatorPost,
        Loading,
        QuillEditor
    },
    "props": {
        "pid": {
            "type": Number,
            "default": ""
        },
        "preview": {
            "type": Object,
            "default": {
                "id": "",
                "url": "",
                "title": "",
                "siteName": "",
                "description": "",
                "mediaType": "",
                "contentType": "",
                "image": "",
                "video": ""
            }
        },
        "content": {
            "type": String,
            "default": ""
        }
    },
    "emits": ["close"],
    setup (props, {emit}) {

        const translation = translationStore(),
            route = useRoute(),
            loading = ref(false),
            link = ref(""),
            pid = ref(props.pid),
            preview = toRefs(props.preview),
            content = ref(props.content),
            inPost = ref(false),
            serverConfig = inject("serverConfig"),
            modules = [
                {

                    "name": "blotFormatter",
                    "module": BlotFormatter,
                    "options": {/* options */}

                },
                {

                    "name": "imageUploader",
                    "module": ImageUploader,
                    "options": {
                        "upload": (file) => {

                            console.log("file");
                            console.log(file);
                            return new Promise((resolve, reject) => {

                                const formData = new FormData();
                                formData.append(
                                    "file",
                                    file
                                );

                                Axios.post(
                                    "/uploadImage",
                                    formData
                                ).
                                    then((res) => {

                                        console.log(res);
                                        resolve(res.data.url);

                                    }).
                                    catch((err) => {

                                        reject("Upload failed");
                                        console.error(
                                            "Error:",
                                            err
                                        );

                                    });

                            });

                        }

                    }

                }
            ],
            emitHideModal = function () {

                emit(
                    "close",
                    false
                );

            },
            saveCreatePost = function () {

                if (inPost.value === true) {

                    return;

                }
                const input = {};
                input.pid = pid.value;
                input.content = unref(content);
                for (const k in preview) {

                    preview[k] = unref(preview[k]);

                }
                input.preview = preview;

                Axios.post(

                    `${process.env.VUE_APP_SERVER_URI}addPost`,
                    input,
                    {
                        "headers": {
                            "Content-Type": "application/json"
                        }
                    }

                ).
                    then((response) => {

                        if (response.data && response.status === 200) {

                            if (parseInt(response.data.pid)) {

                                pid.value = parseInt(response.data.pid);
                                emitHideModal();

                            }

                        }
                        inPost.value = false;

                    }).
                    catch((error) => {

                        inPost.value = false;
                        throw error;

                    });

            },
            updateView = function () {

                if (serverConfig.view === "desktop") {


                } else if (serverConfig.view === "laptop") {


                } else if (serverConfig.view === "tablet") {


                } else if (serverConfig.view === "mobile") {


                } else {


                }

            },
            getLinkPreview = function (e) {

                loading.value = true;

                Axios.get(

                    `${process.env.VUE_APP_SERVER_URI}getLinkPreview`,
                    {
                        "params": {
                            "url": link.value
                        }
                    }
                ).
                    then((response) => {

                        loading.value = false;

                        if (response.status === 200 && response.data) {

                            preview.url = response.data.url;
                            preview.title = response.data.title;
                            preview.siteName = response.data.siteName;
                            preview.description = response.data.description;
                            preview.mediaType = response.data.mediaType;
                            preview.contentType = response.data.contentType;
                            preview.image = response.data.images[0];
                            preview.video = response.data.videos[0];

                        }

                    }).
                    catch((error) => {

                        throw error;

                    });

            };

        onMounted(() => {

            watch(

                () => serverConfig.view,
                () => {

                    updateView();

                }

            );

            watch(

                () => preview.url,
                (first, second) => {

                    link.value = first;

                }

            );

            watch(

                () => link.value,
                (first, second) => {

                    getLinkPreview();

                }

            );

        });

        return {"localize": translation.localize,
            emitHideModal,
            getLinkPreview,
            link,
            loading,
            pid,
            preview,
            modules,
            saveCreatePost,
            serverConfig,
            content};

    }
};

</script>
<style scoped>
.save-create {
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
.link-container {
  display: flex;
  justify-content: start;
  align-items: start;
}
input.link-input {
  line-height: 30px;
  font-size: 0.8em;
  text-indent: 5px;
  padding: 5px;
  width: 100%;
  margin-top: 20px;
  border: none;
  border-bottom: 3px solid #995dd4;
  outline: 0;
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
</style>
