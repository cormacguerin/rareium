<template>

  <div
    :class="productLayoutClass"
  >

    <div
      :id="productContainer"
      :class="productPreviewContainer"
    >

      <div>

        <Carousel
          class="product-carousel"
          ref="carousel"
          :wrap-around="false"
          :items-to-show="1"
        >

          <Slide
            v-for="(n, i) in product.productMedia.value"
            :key="i"
          >

            <div
              :id="'product-banner-' + product.product.value.id + '-' + i"
              class="product-banner-desktop"
            >
              <video
                v-if="n.media_filename_preview"
                class="product-video"
                loop="true"
                autoplay="autoplay"
                :src="getURL(n.media_filename)"
                muted
              />
            </div>

          </Slide>

          <template #addons>
            <Navigation />
            <Pagination />
          </template>
        </Carousel>

      </div>

      <div
        class="flex-row"
        >

        <div
          v-for="(n, i) in product.productMedia.value"
          class="product-selection"
        >
          <div
              class="product-thumbnail-container"
            >
            <div
              class="media-preview" 
              v-if="n.media_filename_preview"
              @click="selectCard(i)"
            >
              <img class="media-preview" :src="getURL(n.media_filename_preview)" />
            </div>

            <div
              class="media-preview" 
              v-else-if="n.media_filename"
              @click="selectCard(i)"
            >
              <img class="media-preview" :src="getURL(n.media_filename)" />
            </div>

            <div class="flex-row mont-delete">
              <div
                class="delete-button-small"
                @click="deleteProductMedia(n.id,i)"
              >
                Delete
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="product-description"
        v-if="product.product.value"
      >
        <Markdown :source="product.product.value.description" />
      </div>

    </div>

    <div :class="productDetailsClass">
      <div
        :class="productHeaderClass"
      >
        {{ product.product.value.name }}
      </div>
      <div
        v-if="parseInt(product.product.value.price)"
        class="price-text-desktop"
      >
        <b> {{ getCurrency() +  productPrice }}</b>
        <div
          class="vat-included"
        >
          {{ localize('VAT_INCLUDED') }}
        </div>
      </div>
      <div
        class="vat"
        v-if="product.product.value"
      >
        {{ product.product.value.synopsis }}
      </div>
      <div
        class="simple-text-button"
        v-if="product.product.value"
        @clock="gotoStore"
      >
        {{ localize('SOLD_BY') }} {{ product.product.value.creators_name }}
      </div>
      <div
        class="simple-text-button"
        v-if="product.product.value"
        @clock="gotoStore"
      >
        {{ localize('STOCK_LEFT') }} {{ product.product.value.stock }}
      </div>

      <CInput
        class="product-quantity-input"
        :value="order.quantity"
        :title="localize('TEXT_QUANTITY')"
        :placeholder="order.quantity"
        @inputValue="order.quantity = parseInt($event)"
      />

      <div 
        v-if="product.product.value.attributes"
        v-for="([k,v],i) in Object.entries(product.product.value.attributes)"
      >
        <div class="attribute-dropdown-container">
          <CDropdown
            :title="k"
            :toggler-text="formatAttribute(order.attributes[k])"
            class="create-dropdown-item"
          >
            <CDropdownItem
              v-for="(a,j) in product.product.value.attributes[k]"
              :key="j"
              @click.native="order.attributes[k] = a"
            >
              {{ formatAttribute(a) }}
            </CDropdownItem>
          </CDropdown>
        </div>
      </div>
      <div>
        <div
          v-if="parseInt(getPrice())"
          class="add-to-cart-button"
          @click="addToCart"
        >
           {{localize('ADD_TO_CART')}}
        </div>
      </div>
    </div>
  </div>
</template>
<script>

import {emit, inject, onMounted, reactive, ref, toRefs, toRaw, watch} from "vue";
import {Carousel, Navigation, Pagination, Slide} from "vue3-carousel";
import Markdown from 'vue3-markdown-it';
import {translationStore} from "@/stores/translation";
import {useRoute} from "vue-router";
import Axios from "axios";
import Loading from "./Loading.vue";

export default {
    "name": "ProductPreview",
    "components": {
        Loading,
        Carousel,
        Navigation,
        Pagination,
        Markdown,
        Slide
    },
    "props": {
        "product": Object,
        "productMedia": Array
    },
    "emits": [
        "banner",
        "delete-media"
    ],
    setup (props, {emit}) {

        const translation = translationStore(),
            route = useRoute(),
            serverConfig = inject("serverConfig"),
            carousel = ref(),
            product = toRefs(props),
            productPrice = ref(0),
            productContainer = ref(),
            productLayoutClass = ref(),
            productPreviewContainer = ref("product-preview-desktop"),
            productDetailsClass = ref(),
            productHeaderClass = ref("product-header-desktop"),
            bannerLoading = ref(false),
            inUpdateView = ref(false),
            order = ref({
                user_id: "",
                order_id: "",
                order_date: "",
                order_total: "",
                product: "",
                quantity: "1",
                vat: "",
                attributes: [],
                postal_method: "",
                payment_method: "",
                billing_address: "",
                shipping_address: "",
                tracking_number: "",
                order_status: ""
            }),
            selectedMedia = ref(0),
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
            addToCart = function() {
              
            },
            gotoStore = function() {

                router.push({"path": `${product.product.value.creators_name}/#store`}).catch((err) => {

                    console.error(err);

                });
                
            },
            setPrice = function(p) {

                if (!p) {

                    p = "0";

                }

                if (!parseInt(p)) {

                    return 0.00;

                }

                if (p.includes(".") == false) {

                    p = (Number(p) / 100);

                } else {

                    p = Number(p);

                }

                p = p.toFixed(2);

                return p;

            },
            getCurrency = function() {

                switch(product.product.value.currency) {
                    case "USD":
                      return "$ ";
                    break;
                    case "EUR":
                      return "€";
                    break;
                    case "GBP":
                      return "£";
                    break;
                    case "JPY":
                      return "JPY¥";
                    break;
                    case "CNY":
                      return "CN¥";
                    break;
                    case "INR":
                      return "₹";
                    break;
                    case "AUD":
                      return "AU$";
                    break;
                    case "HKD":
                      return "HK$";
                    break;
                    case "SGD":
                      return "S$";
                    break;
                    case "SEK":
                      return "kr";
                    break;
                    case "SAR":
                      return "﷼(SAR)";
                    break;
                    case "AED":
                      return "د.إ(AED)";
                    break;
                }

            },
            getPrice = function() {

                let price = product.product.value.price;

                for (var k in order.attributes) {

                    console.log("order.attributes[k]")
                    console.log(order.attributes[k])
                    console.log(order.attributes[k.price_mod])

                }

                if (parseInt(order.value.quantity) > 1) {

                    price *= parseInt(order.value.quantity);

                }
/*
                // add delivery
                if (!address) {
                }

                // add tax
                if (!tax) {
                }
*/
                if (price.constructor === Number) {

                    return setPrice(price.toString());

                } else {

                    return setPrice(price);

                }

            },
            formatAttribute = function (a) {

                if (!a) {

                  return;

                }

                if (!(a.value && a.price_mod)) {

                  return;

                }

                let t = a.value;
                if (parseInt(a.price_mod)) {

                    let pm = " ( " + getCurrency() + " " + setPrice(a.price_mod) + " )";
                    t +=  pm

                }

                return t;

            },
            isCompact = function () {

                if (serverConfig.view === "mobile") {

                    return true;

                } else if (route.path.includes('product')) {

                    return false;

                } else if (serverConfig.windowWidth < 600 || (serverConfig.windowWidth > 1023 && serverConfig.windowWidth < 1280)) {

                    return true;

                } else {

                    return false;

                }

            },
            selectCard = function (i) {

                productContainer.value = `product-container-${product.product.value.id}`;
                selectedMedia.value = i;
                carousel.value.slideTo(i);

            },
            getURL = function (endpoint) {

                return `${process.env.VUE_APP_SERVER_URI + endpoint}`;

            },
            deleteProductMedia = function (id, index) {

                emit("delete-media", id, index);

            },
            updateView = function (i) {

                if (!i) {

                    i = selectedMedia.value;

                }

                setTimeout(

                    () => {

                        const b = document.getElementById(`product-banner-${product.product.value.id}-${i}`);

                        if (product.productMedia.value.length === 0) {
                            
                            return;

                        }

                        if (b) {

                            if (product.productMedia.value[i].media_filename_preview) {

                                b.style.backgroundImage =
                                    `url('${process.env.VUE_APP_SERVER_URI}` + product.productMedia.value[i].media_filename_preview + "')";

                            } else {

                                b.style.backgroundImage =
                                    `url('${process.env.VUE_APP_SERVER_URI}` + product.productMedia.value[i].media_filename + "')";

                            }

                        }

                    },
                    300

                );

                if (serverConfig.view === "desktop") {

                    productHeaderClass.value = "product-header-desktop";
                    productLayoutClass.value = "product-layout-desktop";
                    productPreviewContainer.value = "product-preview-desktop";
                    productDetailsClass.value = "product-details-desktop";

                } else if (serverConfig.view === "tablet") {

                    productHeaderClass.value = "product-header-laptop";
                    productLayoutClass.value = "product-layout-desktop";
                    productPreviewContainer.value = "product-preview-desktop";
                    productDetailsClass.value = "product-details-desktop";

                } else {

                    productHeaderClass.value = "product-header-mobile";
                    productLayoutClass.value = "product-layout-mobile";
                    productPreviewContainer.value = "product-preview-mobile";
                    productDetailsClass.value = "product-details-mobile";

                }

                inUpdateView.value = false;

            };

        onMounted(() => {

            setTimeout(() => {

                productPrice.value = getPrice();

            }, 500)

            productContainer.value = `product-container-${selectedMedia.value}`;

            watch(
                () => product.product.value.price,

                (first, second) => {

                    productPrice.value = getPrice();

                }

            );

            watch(
                () => order.value.quantity,

                (first, second) => {

                    productPrice.value = getPrice();

                }

            );

            watch(
                () => product.productMedia.value.length,

                (first, second) => {

                    productContainer.value = `product-container-${product.product.value.id}`;
                    updateView(product.productMedia.value.length-1);

                }

            );

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

            setTimeout(

                () => {

                    for (var i = 0; i <= product.productMedia.value.length; i++) {

                        updateView(i);

                    }

                }, 1000

            );

        });

        return {"localize": translation.localize,
            productPrice,
            productContainer,
            productLayoutClass,
            productHeaderClass,
            productPreviewContainer,
            productDetailsClass,
            deleteProductMedia,
            selectedMedia,
            carousel,
            selectCard,
            getPrice,
            setPrice,
            getURL,
            getCurrency,
            gotoStore,
            formatAttribute,
            order,
            addToCart,
            serverConfig,
            bannerLoading,
            isCompact,
            updateView,
            inUpdateView,
            product};

    }
};

</script>
<style scoped>
.product-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 25px;
}
.product-image {
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
.product-banner-desktop {
  height: 500px;
  width: 100%;
  border-radius: 25px;
  background-size: cover;
  aspect-ratio: 2/1;
  object-fit: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.product-preview-container-desktop {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  border-radius: 50px;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}
.product-details-mobile {
  display: flex;
  flex-direction: row;
  height: 250px;
  color: inherit;
  text-align: left;
}
form#image-upload {
  height: 100%;
}
input#product-image-upload {
  display: none;
}
label.product-image-upload {
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
video.product-video-image {
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
input#product-banner-upload {
  display: none;
}
label.product-banner-upload {
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
video.product-video-banner {
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
.product-relative {
  color: inherit;
  display: flex;
  justify-content: center;
  overflow: hidden;
  position: relative;
}
.product-header-mobile-container {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  width: 60%;
  color: inherit;
  padding: 10px;
}
.product-header-mobile {
  color: inherit;
  max-height: 100px;
  font-size: 1.8em;
  overflow: hidden;
}
.product-header-laptop {
  color: inherit;
  max-height: 120px;
  font-size: 2.0em;
  overflow: hidden;
}
.product-header-desktop {
  color: inherit;
  font-size: 1.8em;
  -webkit-line-clamp: 3;
  display: -webkit-box;
  line-height: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.price-text-desktop {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  color: inherit;
  font-size: 2.6em;
  color: #08183e;
  height: 100%;
  text-overflow: ellipsis;
  justify-content: space-evenly;
}
.product-description {
  font-size: .9em;
}
.product-synopsis {
  font-size: .9em;
  line-height: 25px;
  -webkit-line-clamp: 5;
  display: -webkit-box;
  line-height: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.symbol-text-desktop {
  font-weight: 400;
  font-size: 2.2em;
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
.media-preview {
  width: 100%;
  max-width: 100px;
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
.product-selection {
  display: flex;
  flex-direction: row;
  justify-content: end;
  flex-wrap: wrap;
}
.product-thumbnail-container {
  display: flex;
  flex-direction: column;
  margin: 10px 10px 10px 0px;
}
.delete-button-small {
  margin: 5px;
  font-size: 0.8em;
  cursor: pointer;
}
.create-product-preview {
  width: 100%;
  display: flex;
  justify-content: end;
}
/*
.carousel__slide {
  width: unset !important;
}
*/
/*
.product-carousel {
  width: 100%;
  justify-content: center;
  align-items: center;
}
.product-layout-mobile {
  display: flex;
  flex-direction: row;
}
.product-layout-mobile {
  display: flex;
  flex-direction: column;
}
*/
/*
.carousel__viewport {
  width: 100%;
}
*/
.product-preview-mobile {
  width: 100%;
}
.product-preview-desktop {
  width: 60%;
}
.product-details-desktop {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  height: 100%;
  padding: 40px;
  color: inherit;
  text-align: left;
  overflow: hidden;
  width: 40%;
}
.product-details-mobile {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  height: 100%;
  padding: 10px;
  color: inherit;
  text-align: left;
  overflow: hidden;
  width: 100%;
}
.product-layout-desktop {
  display: flex;
  flex-direction: row;
}
.product-layout-mobile {
  display: flex;
  flex-direction: column;
}
.simple-text-button {
  text-align: left;
  font-weight: 700;
  line-height: 25px;
  color: #1e6989;
  font-size: .8em;
}
.vat-included {
  margin-top: 5px;
  margin-bottom: 5px;
  font-size: 11px;
  font-weight: bold;
  color: #4a7333;
}
.create-dropdown-item {
  width: 250px;
}
.add-to-cart-button {
  display: flex;
  width: auto;
  width: fit-content;
  max-width: 200px;
  margin: 30px 0px 30px 0px;
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
  background: linear-gradient(338deg,#9423d6,#f53697);
}
.attribute-dropdown-container {
  position: relative;
  display: flex;
  flex-direction: row;
  max-width: 250px;
  width: fit-content;
}
.product-quantity-input {
  text-align: left;
  font-weight: 700;
  line-height: 25px;
  color: #1e6989;
  font-size: .8em;
}
</style>
