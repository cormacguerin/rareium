<template>
  <div>
    <Dashboard>
      <div class="product-container">
        <div class="create-product-header">
          <h2 class="createtitletext">
            {{ localize('TEXT_PRODUCTS') }}
          </h2>
          <div class="flex-row">
            <div
              class="product-button"
              @click="createProduct"
            >
              {{ localize('TEXT_NEW_PRODUCT') }}
            </div>
            <div
              class="product-button"
              @click="showProductModal = true"
            >
              {{ localize('TEXT_ANOTHER_PRODUCT') }}
            </div>
            <div
              v-if="parseInt(parseInt($route.params.id))"
              class="product-button"
              @click="deleteProduct"
            >
              {{ localize('TEXT_DELETE_PRODUCT') }}
            </div>
          </div>
        </div>

        <div
          v-if="parseInt($route.params.id)"
        >
          <ProductPreview
            :product="product"
            :product-media="productMedia"
            @banner="updateBanner"
            @delete-media="deleteProductMedia"
          />

          <div class="create-upload-container">
            <div class="sub-script">
              {{ localize('CREATE_CHOOSE_FILE') }}
            </div>
            <form class="create-upload-box">
              <label
                class="create-file-upload"
                for="create-file-upload"
              />
              <input
                id="create-file-upload"
                type="file"
                accept="image/*,video/*"
                @change="addCreativeFiles"
              >
            </form>
          </div>

          <div class="create-sub-header">
            {{ localize('CREATE_PRODUCT_TITLE') }}
          </div>
          <div class="step-1-container">
            <div class="define-product-left">
              <CInput
                class="margin-top"
                :value="product.name"
                :title="localize('TEXT_PRODUCT_NAME')"
                :placeholder="localize('TEXT_PRODUCT_NAME_PLACEHOLDER')"
                @inputValue="product.name = $event"
              />
              <CInput
                class="margin-top"
                :value="product.synopsis"
                :title="localize('TEXT_PRODUCT_SYNOPSIS')"
                :placeholder="localize('TEXT_PRODUCT_SYNOPSIS_PLACEHOLDER')"
                @inputValue="product.synopsis = $event"
              />
              <CTextArea
                class="margin-top"
                :value="product.description"
                :title="localize('TEXT_PRODUCT_DESCRIPTION')"
                :placeholder="localize('TEXT_PRODUCT_DESCRIPTION_PLACEHOLDER')"
                @inputValue="product.description = $event"
              />
            </div>

            <div class="define-product-right">
              <div class="flex-row">
                <CDropdown
                  :title="localize('TEXT_CATEGORY')"
                  :toggler-text="localize(product.category)"
                  class="create-dropdown-item"
                >
                  <CDropdownItem
                    v-for="([k,v],i) in Object.entries(productCategory)"
                    :key="i"
                    @click.native="product.category = k"
                  >
                    {{ localize(k) }}
                  </CDropdownItem>
                </CDropdown>
                <CDropdown
                  :title="localize('TEXT_CATEGORY')"
                  :toggler-text="localize(product.subcategory)"
                  class="create-dropdown-item"
                >
                  <CDropdownItem
                    v-for="(c,i) in productCategory[product.category]"
                    :key="i"
                    @click.native="product.subcategory = c"
                  >
                    {{ localize(c) }}
                  </CDropdownItem>
                </CDropdown>
              </div>

              <div class="flex-row">
                <CDropdown
                  :title="localize('TEXT_CURRENCY')"
                  :toggler-text="localize(product.currency)"
                  class="create-dropdown-item"
                >
                  <CDropdownItem
                    v-for="(k,i) in productCurrency"
                    :key="i"
                    @click.native="product.currency = k"
                  >
                    {{ localize(k) }}
                  </CDropdownItem>
                </CDropdown>
                <CInput
                  class="input-margin"
                  :value="setPrice(product.price)"
                  :title="localize('TEXT_PRODUCT_PRICE')"
                  :placeholder="localize('TEXT_PRODUCT_PRICE_PLACEHOLDER')"
                  @inputValue="product.price = setPrice($event)"
                />
                <CInput
                  class="input-margin"
                  :value="product.stock"
                  :title="localize('TEXT_PRODUCT_STOCK')"
                  :placeholder="localize('TEXT_PRODUCT_STOCK_PLACEHOLDER')"
                  @inputValue="product.stock = $event"
                />
              </div>

              <div
                class="flex-row"
              >
                <CInput
                  class="margin-top"
                  :value="newCustomName"
                  :title="localize('TEXT_NEW_CUSTOMIZATION')"
                  :placeholder="localize('TEXT_NEW_CUSTOMIZATION_PLACEHOLDER')"
                  @inputValue="newCustomName = $event"
                />
                <div
                  class="simple-text-button"
                  @click="addAttribute"
                >
                  {{ localize('TEXT_ADD_CUSTOMIZATION') }}
                </div>
              </div>
              <div
                class="flex-row"
              >
                <div class="step-2-3-container">
                  <div class="step-2-3-container-right">
                    <div
                      v-for="([k,v],i) in Object.entries(product.attributes)"
                      v-if="product.attributes"
                    >
                      <div class="product-attribute">
                        {{ k }}
                      </div>
                      <div
                        v-for="(a,j) in product.attributes[k]"
                        class="create-product-attributes"
                      >
                        <CInput
                          class="create-margin-right"
                          :value="a.value"
                          :title="localize('TEXT_VALUE')"
                          :placeholder="localize('TEXT_PRODUCT_VALUE_PLACEHOLDER')"
                          @inputValue="a['value'] = $event"
                        />
                        <CInput
                          :value="setPrice(a.price_mod)"
                          :title="localize('TEXT_PRICE_MOD')"
                          :placeholder="localize('TEXT_PRICE_MOD_PLACEHOLDER')"
                          @inputValue="a['price_mod'] = setPrice($event)"
                        />
                      </div>
                      <div
                        class="add-attribute-media-unit-button"
                        @click="addCustomAttribute(k)"
                      >
                        <span class="plus-icon">
                          +
                        </span>
                        Add Custom Attribute
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                class="flex-row"
              />
            </div>
          </div>
        </div>

        <CModal
          v-if="showLoadModal"
          color="#f9b115"
          title="Please Wait"
          @close="showLoadModal = false"
        >
          <template #header>
            <div> Transaction In Progress </div>
          </template>
          <template #body>
            <div>
              Tranaction In Progress.

              Please Wait ..
            </div>
          </template>
          <template #footer>
            <div class="hidden" />
          </template>
        </CModal>

        <CModal
          v-if="showCreateProductErrorModal"
          color="#f9b115"
          title="Create Product Error"
          @close="showCreateProductErrorModal = false"
        >
          <template #header>
            <div> All fields are mandatory  </div>
          </template>
          <template #body>
            <div>
              <div>
                image : " {{ product.image }} "
              </div>
              <div>
                banner : " {{ product.banner }} "
              </div>
              <div>
                symbol : " {{ product.symbol }} "
              </div>
              <div>
                name : " {{ product.name }} "
              </div>
              <div>
                description : " {{ product.description }} "
              </div>
            </div>
          </template>
          <template #footer>
            <div class="hidden" />
          </template>
        </CModal>

        <CModal
          v-if="showProductModal"
          color="#f9b115"
          title="Please Wait"
          width="medium"
          @close="showProductModal = false"
        >
          <template #header>
            <div> Load Product Product </div>
          </template>
          <template #body>
            <div
              v-for="p in products"
              class="contract-items"
              @click="setProduct(p)"
            >
              <div class="contract-item">
                {{ p.id }}
              </div>
              <div class="contract-item">
                {{ p.name }}
              </div>
            </div>
          </template>
          <template #footer>
            <div class="hidden" />
          </template>
        </CModal>

        <CModal
          v-if="showValidationErrorModal"
          color="#f9b115"
          title="Please Wait"
          @close="showValidationErrorModal = false"
        >
          <template #header>
            <div> Invalid Data </div>
          </template>
          <template #body>
            <div>
              {{ validationErrorText }}
            </div>
          </template>
          <template #footer>
            <div class="hidden" />
          </template>
        </CModal>
      </div>
    </Dashboard>
  </div>
</template>
<script>

import {iconStore} from "@/stores/icon";
import {inject, onMounted, reactive, ref, toRaw, toRefs, unref, watch, watchEffect} from "vue";
import {Carousel, Navigation, Pagination, Slide} from "vue3-carousel";
import {translationStore} from "@/stores/translation";
import Axios from "axios";
import CryptoJS from "crypto-js";
import FormData from "form-data";
import {shinoViMarketplaceABI, shinoViPlatformABI, shinoViProductABI} from "../abi.js";
import Datepicker from "@vuepic/vue-datepicker";
import ProductPreview from "./ProductPreview";
import Spinner from "./Spinner.vue";
import Epub from "./Epub.vue";
import "@vuepic/vue-datepicker/dist/main.css";

export default {
    "name": "CreateProduct",
    "components": {
        Carousel,
        Slide,
        Spinner,
        Pagination,
        Navigation,
        Datepicker,
        ProductPreview,
        Epub
    },
    setup () {

        const translation = translationStore(),
            route = inject("route"),
            router = inject("router"),
            icon = iconStore(),
            web3 = inject("web3"),
            enabled = ref(false),
            carousel = ref(),
            refreshProduct = ref(0),
            productCategory = ref({
                "CLOTHES": [
                    "MENS SHIRTS",
                    "WOMENS SHIRTS"
                ],
                "FOODS": [
                    "SUPPLIMENTS",
                    "DRIED FRUITS",
                    "TEA"
                ],
                "JEWELLARY": [
                    "NECKLACES",
                    "RINGS",
                    "EARRINGS"
                ]
            }),
            productCurrency = ref([
                "USD",
                "EUR",
                "GBP",
                "JPY",
                "CNY",
                "INR",
                "AUD",
                "HKD",
                "SGD",
                "SEK",
                "SAR",
                "AED"
            ]),
            newCustomName = ref(""),
            currentSlide = ref(0),
            // contentSecret = ref(""),
            contentFile = ref(""),
            contracts = ref([]),
            product = ref({}),
            products = reactive([]),
            displayTypes = ref([
                "string",
                "number",
                "date"
            ]),
            date = ref(),
            validationErrorText = ref(""),
            showValidationErrorModal = ref(false),
            showCreateProductErrorModal = ref(false),
            showLoadModal = ref(false),
            showProductModal = ref(false),
            showDefineProductModal = ref(false),
            isTransaction = ref(false),
            homeNameClass = ref(""),
            ratioWrapper = ref(""),
            ratioWrapperLandscape = ref(""),
            productPosterVideo = ref(""),
            selectedPreviewImage = ref("select"),
            selectedPreviewMedia = reactive({"name": "select"}),
            serverConfig = toRefs(inject("serverConfig")),
            videoTypes = reactive([
                "video/mp4",
                "video/mpeg",
                "video/x-msvideo",
                "video/webm"
            ]),
            imageTypes = reactive([
                "image/gif",
                "image/jpeg",
                "image/avif",
                "image/png",
                "image/svg",
                "image/svg+xml",
                "image/webp"
            ]),
            maxVideoSize = ref("1000000000"),
            maxImageSize = ref("10000000"),
            adManagerContractAddress = ref(process.env.AD_MANAGER_ADDRESS),
            productMedia = reactive([]),
            setPrice = function (p) {

                if (!p) {

                    p = "0";

                }

                if (!parseInt(p)) {

                    return 0.00;

                }

                if (p.includes(".") == false) {

                    p = Number(p) / 100;

                } else {

                    p = Number(p);

                }

                p = p.toFixed(2);

                return p;

            },
            createProduct = function () {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}createProduct`,
                    {

                        "params": {

                        }

                    }
                ).
                    then((response) => {

                        if (response.data.id) {

                            router.push({"path": `/product/${response.data.id}/`}).catch((err) => {

                                console.error(err);

                            });

                        }

                    });

            },
            updateProduct = function () {

                // add the productMedia
                product.value.media = productMedia;

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}updateProduct`,
                    {

                        "params": {

                            "product": product.value

                        }

                    }
                ).
                    then((response) => {

                        console.log(response);

                    });

            },
            deleteProduct = function () {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}deleteProduct`,
                    {

                        "params": {

                            "id": product.value.id

                        }

                    }
                ).
                    then((response) => {

                        router.push({"path": "/product/"}).catch((err) => {

                            console.error(err);

                        });

                    });

            },
            getURL = function (endpoint) {

                return `${process.env.VUE_APP_SERVER_URI + endpoint}`;

            },
            gotoTab = function (url) {

                window.open(
                    `${process.env.VUE_APP_SERVER_URI + url}`,
                    "_blank"
                );

            },
            setEnabled = function (e) {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}setProductEnabled`,
                    {

                        "params": {

                            "enabled": e,
                            "id": product.value.id

                        }

                    }
                ).
                    then((response) => {

                        product.value.enabled = response.data.enabled;

                    });

            },
            getMyProducts = async function (callback) {

                const accounts = await ethereum.request({"method": "eth_requestAccounts"}),
                    addr = accounts[0];

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}getMyProducts`,
                    {

                        "params": {

                            addr

                        }

                    }
                ).
                    then((response) => {

                        if (response.status === 200) {

                            let i = 0;
                            for (i; i < response.data.length; i++) {

                                productMedia[response.data[i].id] = response.data[i];

                            }

                            callback();

                        }

                    }).
                    catch((error) => {

                        throw error;

                    });

            },

            getMediaDimensions = async function (f, t, c) {

                const dimensions = {};
                if (t === "video") {

                    const $video = document.createElement("video");
                    $video.src = URL.createObjectURL(f);
                    $video.addEventListener(
                        "loadedmetadata",
                        function (e) {

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

            addProductMedia = async function (file, t, callback) {

                const data = new FormData();

                data.append(
                    "file",
                    file
                );
                data.append(
                    "type",
                    t
                );

                Axios.post(
                    `${process.env.VUE_APP_SERVER_URI}addProductFile`,
                    data,
                    {

                        "headers": {

                            "Content-Type": "multipart/form-data",
                            "Content-Type": "application/json"

                        }

                    }
                ).
                    then((response) => {

                        if (response.status === 200) {

                            callback(response.data);

                        } else {

                            callback();

                        }

                    }).
                    catch((error) => {

                        throw error;

                    });

            },
            updateBanner = function (f) {

            },

            /*
             *updateProductMedia = function (id, attributes, callback) {
             *
             *    const data = {
             *        "product_id": product.value.id,
             *        attributes,
             *        id
             *    };
             *
             *    Axios.post(
             *        `${process.env.VUE_APP_SERVER_URI}updateProductMedia`,
             *        data,
             *        {
             *
             *            "headers": {
             *
             *                "Content-Type": "multipart/form-data",
             *                "Content-Type": "application/json"
             *
             *            }
             *
             *        }
             *    ).
             *        then((response) => {
             *
             *            if (response.status === 200) {
             *
             *                callback(response.data);
             *
             *            } else {
             *
             *                callback(response);
             *
             *            }
             *
             *        }).
             *        catch((error) => {
             *
             *            throw error;
             *
             *        });
             *
             *},
             */
            deleteProductMedia = function (id, index) {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}deleteProductMedia`,
                    {

                        "params": {

                            id

                        }

                    }
                ).
                    then((response) => {

                        if (response.status === 200) {

                            productMedia.splice(
                                index,
                                1
                            );
                            product.value.media = productMedia;

                        } else {

                            callback();

                        }

                    }).
                    catch((error) => {

                        throw error;

                    });

            },
            getProductMedia = function (product_id) {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}getProductMedia`,
                    {

                        "params": {

                            product_id

                        }

                    }
                ).
                    then((response) => {

                        if (response.status === 200) {

                            productMedia.splice(0);

                            for (const i in response.data) {

                                productMedia.push(response.data[i]);

                            }

                        }

                    }).
                    catch((error) => {

                        throw error;

                    });

            },
            getAccount = async function () {

                const acc = await web3.value.eth.getAccounts();

                if (acc.length > 0) {

                    return acc[0];

                } else if (window.ethereum) {

                    const accounts = await ethereum.request({"method": "eth_requestAccounts"});
                    return accounts[0];

                }

                console.log("window.open(https://metamask.io");
                window.open("https://metamask.io");


            },
            saveProduct = async function (contractResponse) {

                Axios.post(
                    `${process.env.VUE_APP_SERVER_URI}saveProduct`,
                    product.value,
                    {
                        "headers": {
                            "Content-Type": "multipart/form-data"
                        }
                    }
                ).
                    then((response) => {

                        if (response.status === 200) {

                            if (product.value.id) {

                                setProduct(product.value);

                            }

                        }

                    }).
                    catch((error) => {

                        throw error;

                    });

            },
            getProducts = async function (contractResponse) {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}getProducts`,
                    {

                        "params": {

                        }

                    }

                ).
                    then((response) => {

                        if (response.status === 200) {

                            products.splice(0);

                            for (const i in response.data) {

                                products.push(response.data[i]);

                                if (response.data[i].id == route.params.id) {

                                    product.value = response.data[i];

                                    for (const j in response.data[i].media) {

                                        productMedia.push(response.data[i].media[j]);

                                    }

                                    autoSave();

                                }

                            }

                        }

                    }).
                    catch((error) => {

                        throw error;

                    });

            },
            setProduct = function (p) {

                router.push({"path": `/product/${p.id}/`}).catch((err) => {

                    console.error(err);

                });

            },
            autoSave = function () {

                const id = product.value.id;

                let pstr = JSON.stringify(product.value),

                    doLoop = () => {

                        if (!product.value) {

                            return;

                        }

                        if (pstr != JSON.stringify(product.value)) {

                            updateProduct((r) => {

                                // console.log(r)

                            });
                            pstr = JSON.stringify(product.value);

                        }

                        if (id === product.value.id) {

                            setTimeout(
                                () => {

                                    doLoop();

                                },
                                3000
                            );

                        }

                    };
                doLoop();

            },
            addCreativeFiles = function (e) {

                const files = e.target.files;
                for (let i = 0; i < files.length; i++) {

                    const file = files[i];

                    if (imageTypes.indexOf(files[i].type) > -1) {

                        getMediaDimensions(
                            file,
                            "image",
                            (d) => {

                                const media = {};
                                media.dimensions = d;
                                media.loading = true;

                                addProductMedia(
                                    file,
                                    "image",
                                    (r) => {

                                        media.id = r.id;
                                        media.loading = false;
                                        media.media_filename = r.media_filename;
                                        media.media_filename_preview = r.media_filename_preview;
                                        media.original_filename = r.original_filename;
                                        media.url = r.url;
                                        productMedia.push(media);

                                        // important, update the product json
                                        product.value.media = productMedia;

                                    }
                                );

                            }
                        );

                    } else if (videoTypes.indexOf(files[i].type) > -1) {

                        const file = files[i];

                        getMediaDimensions(
                            file,
                            "video",
                            (d) => {

                                const media = {};
                                media.dimensions = d;
                                media.loading = true;

                                addProductMedia(
                                    file,
                                    "video",
                                    (r) => {

                                        // delay as the server side image may not be ready
                                        setTimeout(
                                            () => {

                                                media.id = r.id;
                                                media.loading = false;
                                                media.media_filename = r.media_filename;
                                                media.media_filename_preview = r.media_filename_preview;
                                                media.original_filename = r.original_filename;
                                                media.url = r.url;
                                                productMedia.push(media);

                                                // important, update the product json
                                                product.value.media = productMedia;

                                            },
                                            3000
                                        );

                                    }

                                );

                            }

                        );

                    } else {

                        console.log("not a supported type");
                        return;

                    }

                }

            },
            addAttribute = function () {

                if (!product.value.attributes) {

                    product.value.attributes = {};

                }

                if (!product.value.attributes[newCustomName.value] && newCustomName.value.length > 1) {

                    product.value.attributes[newCustomName.value] = [];
                    addCustomAttribute(newCustomName.value);

                }

            },
            addCustomAttribute = function (k) {

                product.value.attributes[k].push({
                    "attribute": k,
                    "value": "",
                    "price_mod": "0.00"
                });

            },
            removeCustomAttribute = function (k, i) {

                if (product.value.attributes[k].length === 1) {

                    delete product.value.attributes[k];

                } else {

                    product.value.attributes[k].splice(
                        i,
                        1
                    );

                }

            };

        onMounted(() => {

            getProducts();

            /*
             *if (route.params.id) {
             *
             *    autoSave();
             *
             *}
             */
            watch(
                () => product.value.id,

                (first, second) => {

                }
            );

            watch(
                () => route.params.id,

                (first, second) => {

                    showProductModal.value = false;

                }
            );

        });


        return {"localize": translation.localize,
            date,
            displayTypes,
            enabled,
            newCustomName,
            addCustomAttribute,
            addAttribute,
            removeCustomAttribute,
            getURL,
            getAccount,
            getProductMedia,
            setPrice,
            setProduct,
            getProducts,
            createProduct,
            updateProduct,
            deleteProduct,
            carousel,
            product,
            products,
            productPosterVideo,
            productCategory,
            productCurrency,
            productMedia,
            gotoTab,
            addCreativeFiles,
            refreshProduct,
            updateBanner,
            getMyProducts,
            autoSave,
            setEnabled,
            addProductMedia,
            deleteProductMedia,
            // updateProductMedia,
            getMediaDimensions,
            homeNameClass,
            validationErrorText,
            showValidationErrorModal,
            showProductModal,
            showLoadModal,
            showCreateProductErrorModal,
            showDefineProductModal,
            "icon": icon.get};

    }
};

</script>
<style scoped>
svg.dashboard-svg-desktop {
  position: absolute;
  background: linear-gradient(188deg, #ffe070, #ee71ff);
  padding-top: 150px;
  left: 0;
}
svg.dashboard-svg-mobile {
  position: absolute;
  background: linear-gradient(188deg, #ffe070, #ee71ff);
  padding-top: 200px;
  left: 0;
}
.titlecolor {
  color: #22255C;
}
.container {
  margin-top: -100px;
  text-align: left;
}
.paragraph {
  margin: 10px;
}
.title-mobile {
  margin-left: 0px;
}
.title-desktop {
  margin-left: 10px;
}
.text {
  color: #908ab9;
}
.createtitletext {
  color: #000;
}
.sub-title {
  color: #000;
  font-size: 1.2em;
}
.create-sub-header {
  margin-top: 20px;
  text-align: left;
  font-weight: bold;
  line-height: 35px;
  color: #22255C;
  font-size: 0.9em;
}
.sub-script {
  text-align: left;
  font-weight: bold;
  color: #afafaf;
  line-height: 30px;
  font-size: 0.8em;
}
.product-container {
  display: flex;
  flex-direction: column;
  padding: 10px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}
.create-upload-box {
  height: 150px;
  border: 1px solid #efefef;
  border-radius: 15px;
  margin-top: 10px;
  margin-bottom: 10px;
  opacity: 0.5;
  background: url("../assets/upload-icon.svg") #efefef;
  background-position: center;
  background-size: 10%;
  background-repeat: no-repeat;
}
.create-upload-box:hover {
  opacity: 1.0;
  cursor: pointer;
}
.file-items {
  padding: 10px;
  background-color: #eeebff;
  border-radius: 10px;
  font-size: 0.8em;
  margin-top: 10px;
  background: linear-gradient(1deg,#e5e5e5,transparent);
}
.file-name {
  color: #22255c;
  font-weight: bold;
  max-width: 40%;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 10px;
  white-space: nowrap;
}
.file-item {
  font-family: sans-serif;
  color: #a0a0a0;
  margin-right: 10px;
}
.remove-button {
  cursor: pointer;
  margin-right: 10px;
  font-weight: bold;
  color: #f7608a;
}
.create-product-preview-bg {
  flex-grow: 1;
  position: relative;
  overflow: hidden;
  border: 3px dashed #d295ff;
}
.create-product-preview-bg:hover {
  opacity: 0.5;
}
.create-product-container {
  padding: 20px;
  width: 33%;
}
.create-product-preview {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 40px;
  padding-left: 20px;
  border: 1px solid #fff;
  box-sizing: border-box;
  border-radius: 40px;
  justify-content: center;
}
.square {
  padding-bottom: 100%;
}
.smartphone-banner {
  padding-bottom: 16.667%;
}
/*
.ad191-1 {
  padding-bottom: 52.356%;
}
*/
.landscape {
  padding-bottom: 56.25%;
}
.ad4-5 {
  padding-bottom: 125%;
}
.billboard {
  padding-bottom: 25.7%;
}
.leaderboard {
  padding-bottom: 12.36%;
}
.medium-rectangle {
  padding-bottom: 83.33%;
}
.halfpage {
  padding-bottom: 200%;
}
.wide-skyscraper {
  padding-bottom: 266%;
}
.skyscraper {
  padding-bottom: 375%;
}
.upload-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}
.product-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.create-details {
  margin-top: 20px;
}
.create-targeting {
  margin-top: 20px;
}
h2.createtitletext {
  text-align: left;
  color: #22255C;
}
.vspace {
  width: 100%;
  height: 20px;
}
.nowrap {
  flex-wrap: nowrap;
}
.input-margin {
  margin-right: 20px;
}
.create-item {
  margin-top: 20px;
}
.spend-item {
  margin-top: 20px;
  width: 150px;
}
.create-dropdown-item {
  margin-right: 20px;
  position: relative;
  flex-grow: 1;
  width: 50%;
  max-width: 250px;
}
.create-demographies {
  flex-wrap: nowrap;
}
.create-dropdown {
  color: #22255c;
  font-size: 1.0em;
  margin-right: 10px;
  white-space: nowrap;
  flex-wrap: nowrap;
}
.create-product-unit {
  color: #22255c;
  margin-left: 20px;
  font-weight: bold;
  font-size: 1.0em;
  margin-right: 10px;
  flex-wrap: nowrap;
}
.ctags {
  margin-top: 20px;
}
.create-tags {
  margin: 10px;
  padding: 10px;
  font-size: 0.75em;
  font-weight: bold;
  background-color: #ff6096;
  border-radius: 10px;
  color: white;
}
.create-tags:hover {
  color: red !important;
  background-color: white;
  cursor: pointer;
}
input#create-file-upload {
  display: none;
}
label.create-file-upload {
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
.add-attribute-media-unit-button {
  display: flex;
  margin-top: 40px;
  margin-bottom: 40px;
  align-items: center;
  color: #404040;
  padding-left: 20px;
  cursor: pointer;
}
.pointer {
  cursor: pointer;
}
.create-product-button {
  display: flex;
  margin-top: 40px;
  align-items: center;
  width: fit-content;
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
  background: linear-gradient(338deg,#ff7c88,#ff46a4)
}
.create-save-product-button {
  display: flex;
  margin-top: 20px;
  margin-bottom: 10px;
  align-items: center;
  width: fit-content;
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
  background: linear-gradient(338deg,#ff7c88,#ff46a4)
}
.create-product-text {
  display: block;
  display: flex;
  justify-items: center;
}
.create-product-title {
  font-weight: 600;
  font-family: sans-serif;
  text-decoration: none;
  color: var(--msft-card-font-color);
  font-size: var(--msft-article-heading-font-size, 1.2em);
  line-height: var(--msft-article-heading-line-height, 24px);
  -webkit-line-clamp: var(--heading-max-lines, 3);
  text-align: center;
  margin: 10px;
  outline: 0px;
}
.create-product-body {
  color: #80868b var(--title-color, var(--neutral-foreground-rest));
  font-weight: var(--title-font-weight, 600);
  font-size: var(--title-font-size, 0.8em);
  font-family: sans-serif;
  line-height: var(--title-line-height, 20px);
  letter-spacing: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  border-bottom: none;
  text-decoration: none;
  display: -webkit-box;
  -webkit-line-clamp: var(--shopping-title-text-line-clamp, 2);
  -webkit-box-orient: vertical;
  white-space: normal;
  word-break: break-word;
  margin: 10px;
}
.ad-creative-preview {
  width: 100%;
  position:absolute;
}
.flex-row {
  display: flex;
  flex-direction: row;
}
.flex-col {
  display: flex;
  flex-direction: column;
}
.create-margin-right {
  margin-right: 20px;
}
.ipfsimagetitle {
  white-space: nowrap;
  margin-top: 15px;
  font-size: .75em;
  font-weight: 700;
  color: #a046ff;
  text-align: left;
}
.plus-icon {
  font-size: 1.2em;
  font-weight: bold;
  margin-right: 10px;
}
.metafield {
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  height: 50px;
  padding: 12px 20px;
  margin: 8px 0;
  background-color: #efefef;
  font-size: 0.9em;
  box-sizing: border-box;
  border: 2px solid #dfdfdf;
  border-radius: 15px;
  text-align: left;
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
.delete-button-small {
  font-size: 0.8em;
  margin-left: 10px;
  color: black;
  pointer: cursor;
}
.delete-button-small:hover  {
  text-decoration: underline;
}
.edit-creator-color {
  padding: 5px;
}
.step-1-container {
  display: flex;
  flex-direction: row;
  width: 1200px;
}
.step-2-3-container {
  display: flex;
  flex-direction: row;
  justify-content: inherit;
}
.step-2-3-container-left {
  width: 50%;
}
.step-2-3-container-right {
}
.swatches-item {
  margin-top: 20px;
  margin-right: 20px;
  margin-bottom: 20px;
}
.define-product-left {
  width: 50%;
  margin-right: 30px;
}
.create-product-header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.define-product-right {
  display: flex;
  flex-direction: column;
}
.step-1 {
  margin-bottom: 20px;
}
.flex-row-wrap {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
}
.contract-item {
  margin: 5px;
}
.contract-items {
  display: flex;
  font-size: 0.8em;
  color: #666666;
  padding: 5px;
  border-bottom: 2px solid #bbbbbb;
}
.enable-product {
  margin-top: 18px;
  margin-left: 25px;
}
.create-product-carousel {
  width: 100%;
}
.create-product-slide {
  width: 100%;
}
input[type=file].news-image-input {
  display: none;
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
.flex-row-space {
  display: flex;
  flex-direction: row;
  align-items: end;
  justify-content: space-between;
}
.supported-media-type {
  color: #afafaf;
  font-size: .8em;
  text-align: left;
  margin-top: 25px;
  margin-left: 10px;
}
.view-content {
  font-size: 0.8em;
  font-weight: normal;
}
.small-text {
  cursor: pointer;
  margin: 10px;
  font-size: 0.8em;
}
.small-text-inline-link {
  cursor: pointer;
  margin-top: 10px;
  font-size: 0.8em;
}
.small-text:hover {
  font-weight: bold;
}
.selected-card {
  width: 50px;
  margin-left: auto;
  margin-right: auto;
  border: 3px solid #ff46a4;
}
.media-preview {
  width: 100%;
  max-width: 300px;
  overflow: none;
  cursor: pointer;
  border-radius: 15px;
  aspect-ratio: 1/1;
  object-fit: cover;
  background-size: cover;
  background-position: 50%;
  transition: all 500ms ease-in-out;
}
.img media-preview {
  width: 100%;
}
.product-button {
  height: 20px;
  color: #ff46a4;
  border-radius: 5px;
  margin: 10px;
  font-size: .9em;
  padding: 10px 20px;
  border: 1px solid #ff46a4;
  font-weight: 700;
  background-color: #fff;
  cursor: pointer;
}
.simple-text-button {
  margin-top: 50px;
  margin-left: 10px;
  text-align: left;
  font-weight: 700;
  line-height: 35px;
  color: #22255c;
  font-size: .9em;
}
.create-product-attributes {
  display: flex;
}
.product-attribute {
  display: flex;
  justify-content: start;
  align-items: center;
  color: #ff46a4;
  font-size: .9em;
  font-weight: bold;
  margin-right: 20px;
  margin-top: 30px;

}
</style>
