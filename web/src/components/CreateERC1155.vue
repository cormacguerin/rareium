<template>
  <div>
    <Dashboard>
      <div class="collection-container">
        <div class="create-collection-header">
          <h2 class="createtitletext">
            {{ localize('TEXT_CREATE_NFT_COLLECTION') }}
          </h2>
          <div
            style="font-size: 0.8em; font-weight: bold; margin-top: 40px;"
            @click="showNFTModal = true"
          >
            {{ localize('TEXT_ANOTHER_NFT') }}
          </div>
        </div>

        <div class="create-sub-header step-1">
          {{ localize('CREATE_STEP_1') }}
        </div>

        <CollectionPreview
          :collection="collection.vue"
          @image="updateImage"
          @banner="updateBanner"
        />

        <div>
          <Markdown :source="collection.vue.description" />
        </div>

        <div class="create-sub-header">
          {{ localize('CREATE_STEP_2') }}
        </div>
        <div class="step-1-container">
          <div class="define-nft-left">
            <CInput
              class="margin-top"
              :value="collection.vue.name"
              :title="localize('TEXT_COLLECTION_NAME')"
              :placeholder="localize('TEXT_COLLECTION_NAME_PLACEHOLDER')"
              @inputValue="collection.vue.name = $event"
            />
            <CInput
              class="margin-top"
              :value="collection.vue.symbol"
              :title="localize('TEXT_COLLECTION_SYMBOL')"
              :placeholder="localize('TEXT_COLLECTION_SYMBOL_PLACEHOLDER')"
              @inputValue="collection.vue.symbol = $event"
            />
            <CTextArea
              class="margin-top"
              :value="collection.vue.description"
              :title="localize('TEXT_COLLECTION_DESCRIPTION')"
              :placeholder="localize('TEXT_COLLECTION_DESCRIPTION_PLACEHOLDER')"
              @inputValue="collection.vue.description = $event"
            />
          </div>

          <div class="define-nft-right">
            <div class="flex-row">
              <CDropdown
                :title="localize('TEXT_CATEGORY')"
                :toggler-text="localize(collection.vue.category)"
                class="create-dropdown-item"
              >
                <CDropdownItem
                  v-for="(f,i) in NFTcategory"
                  :key="i"
                  @click.native="collection.vue.category = f"
                >
                  {{ localize(f) }}
                </CDropdownItem>
              </CDropdown>
<!--
              <CDropdown
                :title="localize('TEXT_MEDIA_TYPE')"
                :toggler-text="collection.vue.media"
                class="create-dropdown-item"
              >
                <CDropdownItem
                  v-for="(f,i) in NFTMedia"
                  :key="i"
                  @click.native="collection.vue.media = f"
                >
                  {{ f }}
                </CDropdownItem>
              </CDropdown>
-->
            </div>

            <div class="flex-row swatches-edit">
              <div class="swatches-item flex-row">
                <div class="edit-creator-color">
                  Primary
                </div>
                <VSwatches
                  v-model="collection.vue.primary_color"
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
                        + collection.vue.primary_color
                        + '; width:20px; height: 20px; border: 1px solid; border-radius: 3px; margin: 5px; cursor: pointer;'"
                      readonly
                    >
                  </template>
                </VSwatches>
              </div>
              <div class="swatches-item flex-row">
                <div class="edit-creator-color">
                  Secondary
                </div>
                <VSwatches
                  v-model="collection.vue.secondary_color"
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
                        + collection.vue.secondary_color
                        + '; width:20px; height: 20px; border: 1px solid; border-radius: 3px; margin: 5px; cursor: pointer;'"
                      readonly
                    >
                  </template>
                </VSwatches>
              </div>
            </div>
            <div
              v-if="collection['vue']['nft_address']"
              class="flex-row"
            >
              <div
                class="create-save-collection-button"
                @click="updateCollection"
              >
                {{ localize('TEXT_UPDATE_NFT_COLLECTION') }}
              </div>
              <CSwitch
                class="enable-collection"
                :title="localize('TEXT_ENABLE')"
                :checked="collection['vue']['enabled']"
                @inputValue="setEnabled($event)"
              />
            </div>

            <div
              v-else
              class="create-save-collection-button"
              @click="createCollection"
            >
              {{ localize('TEXT_CREATE_NFT_COLLECTION') }}
            </div>
          </div>
        </div>

        <div class="create-sub-header">
          {{ localize('CREATE_STEP_3') }}
        </div>

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

        <div class="create-collection-preview">
          <Carousel
            ref="carousel"
            v-model="currentSlide"
            class="create-nft-carousel"
            :wrap-around="false"
            :items-to-show="3.5"
          >
            <Slide
              v-for="(n, i) in nfts"
              :key="i.n"
              class="create-nft-slide"
            >
              <div class="flex-col">
                <NFTCard
                  :id="n.id"
                  :key="n.metadata.id"
                  class="file-items"
                  :address="collection.vue.nft_address"
                  :symbol="collection.vue.symbol"
                  :metadata="n.metadata"
                  :metadata_url="n.metadata_url"
                  @click="selectCard(i)"
                  @freeze-metadata="freezeMetadata(i,e)"
                  @mint-token="refreshCollection++"
                />
                <div
                  v-if="selectedNFT == i"
                  class="selected-card"
                >
                </div>
                <div class="flex-row mont-delete">
                  <div
                    class="delete-button-small"
                    @click="deleteCollectionMedia(n.id,i)"
                  >
                    Delete
                  </div>
                </div>
              </div>
            </Slide>

            <template #addons>
              <Navigation />
              <Pagination />
            </template>
          </Carousel>
        </div>

        <div class="create-sub-header">
          {{ localize('CREATE_STEP_4') }}
        </div>

        <div class="step-2-3-container">
          <div class="step-2-3-container-left">
            <div
              v-if="nfts[selectedNFT]"
            >
              <div
                v-if="nfts[selectedNFT].loading"
                class="flex-col"
              >
                <div class="ipfsimagetitle">
                  Image
                </div>
                <div
                  class="ipfs-loading"
                >
                  {{ localize('TEXT_LOADING') }}
                </div>
              </div>
              <div
                v-else
              >
                <div class="ipfsimagetitle">
                  Image
                </div>
                <div
                  v-if="nfts[selectedNFT]['metadata']"
                  class="metafield"
                >
                  {{ nfts[selectedNFT]['metadata'].image }}
                </div>
              </div>
              <div
                v-if="nfts[selectedNFT]['metadata']"
                class="flex-col"
              >
                <div class="ipfsimagetitle">
                  Animation Url
                </div>
                <div
                  v-if="nfts[selectedNFT]['metadata']"
                  class="metafield"
                >
                  {{ nfts[selectedNFT]['metadata'].animation_url }}
                </div>
              </div>
              <div v-if="nfts[selectedNFT]['metadata']">
                <CInput
                  class="margin-top"
                  :value="nfts[selectedNFT]['metadata'].name"
                  :title="localize('TEXT_NFT_NAME')"
                  :placeholder="localize('TEXT_NFT_NAME_PLACEHOLDER')"
                  @inputValue="nfts[selectedNFT]['metadata'].name = $event"
                />
                <CInput
                  class="margin-top"
                  :value="nfts[selectedNFT]['metadata'].description"
                  :title="localize('TEXT_NFT_DESCRIPTION')"
                  :placeholder="localize('TEXT_NFT_DESCRIPTION_PLACEHOLDER')"
                  @inputValue="nfts[selectedNFT]['metadata'].description = $event"
                />
                <!--
                  v-if="nfts[selectedNFT]"
-->
                <CInput
                  class="margin-top"
                  :value="nfts[selectedNFT]['metadata'].supply"
                  :title="localize('TEXT_NFT_SUPPLY')"
                  :placeholder="localize('TEXT_SUPPLY_PLACEHOLDER')"
                  @inputValue="nfts[selectedNFT]['metadata'].supply = $event"
                />
                <CInput
                  class="margin-top"
                  :value="nfts[selectedNFT]['metadata'].mintprice"
                  :title="localize('TEXT_NFT_MINTPRICE')"
                  :placeholder="localize('TEXT_NFT_MINTPRICE_PLACEHOLDER')"
                  @inputValue="nfts[selectedNFT]['metadata'].mintprice = $event"
                />
              </div>
              <div
                v-if="collection.vue.category == 'CATEGORY_MANGA' ||
                      collection.vue.category == 'CATEGORY_BOOK'"
              >
                <div class="flex-row-space">
                  <div class="flex-col">
                    <div class="ipfsimagetitle">
                      {{ localize('TEXT_NFT_PROPERTIES_CONTENT_MEDIA') }}
                    </div>
                    <div class="flex-row">
                      <div class="news-image-container">
                        <label for="img1" class="file-label" id="file-label-1"></label>
                        <input
                          type="file"
                          id="img1"
                          name="img1"
                          accept=".epub, .pdf"
                          class="news-image-input"
                          v-on:input="prepContentFile"
                        >
                      </div>
                      <div class="supported-media-type">
                        epub, pdf
                      </div>
                    </div>
                  </div>
                  <CSwitch
                    class="enable-ipfs"
                    :title="localize('TEXT_IPFS')"
                    :checked="nfts[selectedNFT].isContentIPFS"
                    @inputValue="setIPFSContent($event)"
                  />
                  <div>
                  </div>
<!--
                  <CInput
                    class="margin-top"
                    :value="contentSecret"
                    :title="localize('TEXT_NFT_PROPERTIES_SECRET_TITLE')"
                    :placeholder="localize('TEXT_NFT_PROPERTIES_SECRET')"
                    @inputValue="contentSecret = $event"
                  />
-->
                </div>
                <div class="flex-row">
                  <div
                    class="small-text"
                  >

                    {{ nfts[selectedNFT]['metadata']['properties'].content_filename }}
                  </div>
                </div>
                <div
                  v-if="contentFile"
                  class="create-save-collection-button"
                  @click="uploadContentFile"
                >
                    {{ localize('TEXT_UPLOAD') }}
                </div>
                <div class="ipfsimagetitle flex-row-space">
                  <div>
                    {{ localize('TEXT_CONTENT') }}
                  </div>
                  <div
                    class="small-text-inline-link"
                    v-if="nfts[selectedNFT]['metadata']['properties'].content"
                    @click="epubComponent.toggleView()"
                  >
                    {{ localize('TEXT_FULLSCREEN') }}
                  </div>
                  <div
                    class="small-text-inline-link"
                    v-if="nfts[selectedNFT]['metadata']['properties'].content"
                    @click="downloadContentFile"
                  >
                    {{ localize('TEXT_DOWNLOAD') }}
                  </div>
                  <div
                    class="small-text-inline-link"
                    v-if="nfts[selectedNFT]['metadata']['properties'].content"
                    @click="nfts[selectedNFT]['metadata']['properties'].content = ''; nfts[selectedNFT]['metadata']['properties'].content_filename = ''"
                  >
                    {{ localize('TEXT_RESET') }}
                  </div>
                </div>
                <div
                  v-if="nfts[selectedNFT].contentFileLoading"
                  class="flex-col"
                >
                  <div
                    class="ipfs-loading"
                  >
                    {{ localize('TEXT_LOADING') }}
                  </div>
                </div>
                <div
                  v-else
                  class="metafield"
                >
                  {{ nfts[selectedNFT]['metadata']['properties'].content }}
                </div>
                <Epub
                  v-if="nfts[selectedNFT]['metadata']['properties'].content"
                  class="epub-preview"
                  ref="epubComponent"
                  :epub="nfts[selectedNFT]['metadata']['properties'].content"
                >
                </Epub>
                <CInput
                  class="margin-top"
                  :value="nfts[selectedNFT]['metadata']['properties'].author"
                  :title="localize('TEXT_NFT_PROPERTIES_AUTHOR')"
                  :placeholder="localize('TEXT_NFT_PROPERTIES_AUTHOR')"
                  @inputValue="nfts[selectedNFT]['metadata']['properties'].author = $event"
                />
                <CInput
                  class="margin-top"
                  :value="nfts[selectedNFT]['metadata']['properties'].isbn"
                  :title="localize('TEXT_NFT_PROPERTIES_ISBN')"
                  :placeholder="localize('TEXT_NFT_PROPERTIES_ISBN')"
                  @inputValue="nfts[selectedNFT]['metadata']['properties'].isbn = $event"
                />
                <CInput
                  class="margin-top"
                  :value="nfts[selectedNFT]['metadata']['properties'].language"
                  :title="localize('TEXT_NFT_PROPERTIES_LANGUAGE')"
                  :placeholder="localize('TEXT_NFT_PROPERTIES_LANGUAGE')"
                  @inputValue="nfts[selectedNFT]['metadata']['properties'].language = $event"
                />
                <CInput
                  class="margin-top"
                  :value="nfts[selectedNFT]['metadata']['properties'].edition"
                  :title="localize('TEXT_NFT_PROPERTIES_EDITION')"
                  :placeholder="localize('TEXT_NFT_PROPERTIES_EDITION')"
                  @inputValue="nfts[selectedNFT]['metadata']['properties'].edition = $event"
                />
                <CInput
                  class="margin-top"
                  :value="nfts[selectedNFT]['metadata']['properties'].contributors"
                  :title="localize('TEXT_NFT_PROPERTIES_CONTRIBUTORS')"
                  :placeholder="localize('TEXT_NFT_PROPERTIES_CONTRIBUTORS')"
                  @inputValue="nfts[selectedNFT]['metadata']['properties'].contributors = $event"
                />
                <CInput
                  class="margin-top"
                  :value="nfts[selectedNFT]['metadata']['properties'].editors"
                  :title="localize('TEXT_NFT_PROPERTIES_EDITORS')"
                  :placeholder="localize('TEXT_NFT_PROPERTIES_EDITORS')"
                  @inputValue="nfts[selectedNFT]['metadata']['properties'].editors = $event"
                />
              </div>
            </div>
          </div>
          <div class="step-2-3-container-right">
            <div
              v-for="(a,i) in nfts[selectedNFT]['metadata']['attributes']"
              v-if="nfts[selectedNFT]"
            >
              <div
                v-if="nfts[selectedNFT]['metadata']"
                class="create-nft-attribute flex-row"
              >
                <CInput
                  class="create-margin-right"
                  :value="a['trait_type']"
                  :title="localize('TEXT_TRAIT')"
                  :placeholder="localize('TEXT_NFT_TRAIT_PLACEHOLDER')"
                  @inputValue="nfts[selectedNFT]['metadata']['attributes'][i]['trait_type'] = $event"
                />
                <CDropdown
                  :title="localize('TEXT_TYPE')"
                  :toggler-text="nfts[selectedNFT]['metadata']['attributes'][i]['display_type']"
                  class="create-dropdown-item"
                >
                  <CDropdownItem
                    v-for="(f,j) in displayTypes"
                    :key="j"
                    value="String"
                    @click.native="selectAttributeType(i,a['display_type'],f)"
                  >
                    {{ f }}
                  </CDropdownItem>
                </CDropdown>
                <CInput
                  v-if="a.display_type == 'string' || a.display_type == 'number'"
                  :value="a.value"
                  :title="localize('TEXT_VALUE')"
                  :placeholder="localize('TEXT_NFT_VALUE_PLACEHOLDER')"
                  @inputValue="nfts[selectedNFT]['metadata']['attributes'][i].value = $event"
                />
                <Datepicker
                  v-else
                  v-model="nfts[selectedNFT]['metadata']['attributes'][i].value"
                  placeholder="Select Date ..."
                />
              </div>
            </div>
            <div
              class="add-attribute-media-unit-button"
              @click="addAttribute()"
            >
              <span class="plus-icon">
                +
              </span>
              Add Attribute
            </div>
          </div>
        </div>


        <div class="create-sub-header">
          {{ localize('CREATE_STEP_5') }}
        </div>

        <div class="batch-mint-container">

          <div class="mint-internal">

            <div class="mint-advice">
              <b>{{ localize('LAZY_MINT_ABOUT') }}</b>
              <br>
              <br>
              {{ localize('LAZY_MINT_ADVICE') }}
            </div>

            <div
              class="lazy-mint-collection-button"
              @click="lazyMintStart"
            >
              {{ localize('TEXT_LAZY_MINT') }}
            </div>

            <div
              class="mint-link"
              @click="gotoTab('/mint/' + collection.vue.nft_address)"
            >
                {{ localize('TEXT_PUBLIC_MINT_LINK') }}
            </div>

            <div
              class="vouchers-table"
            >
              <div class="vouchers-row">
                <div class="voucher-id">
                  {{ localize('TEXT_ID') }}
                </div>
                <div class="voucher-item">
                  {{ localize('TEXT_NAME') }}
                </div>
                <div class="voucher-item">
                  {{ localize('TEXT_PRICE') }}
                </div>
                <div
                  class="voucher-item"
                >
                  {{ localize('TEXT_DETAILS') }}
                </div>
                <div
                  class="voucher-item"
                >
                  {{ localize('TEXT_MINTED') }}
                </div>
                <div
                  class="voucher-item"
                >
                  {{ localize('TEXT_REMOVE') }}
                </div>
              </div>
              <div>
                <div
                  v-for="k,i in vouchers"
                  class="vouchers-row"
                >
                  <div class="voucher-id">
                    {{ k.voucher.id }}
                  </div>
                  <div class="voucher-item">
                    {{ k.metadata.name }}
                  </div>
                  <div class="voucher-item">
                    {{ k.metadata.mintprice }}
                  </div>
                  <div
                    class="voucher-item"
                    @click="showVoucher(k.voucher, k.metadata)"
                  >
                    {{ localize('TEXT_DETAILS') }}
                  </div>
                  <div class="voucher-item">
                    {{ k.minted }}
                  </div>
                  <div
                    class="voucher-item"
                    @click="removeVoucher(k.id)"
                  >
                    {{ localize('TEXT_REMOVE') }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="vspace" />

          <b>{{ localize('TEXT_OR') }}</b>

          <div class="mint-internal">

            <div class="mint-advice">
              <b>{{ localize('BATCH_MINT_ABOUT') }}</b>
              <br>
              <br>
              {{ localize('BATCH_MINT_ADVICE') }}
            </div>

            <div
              class="batch-mint-collection-button"
              @click="showBatchMintNFTModal = true"
            >
              {{ localize('TEXT_BATCH_MINT') }}
            </div>

          </div>
        </div>

        <Collection
          :preview="false"
          :refresh="refreshCollection"
          :nft-address="collection.vue.nft_address"
        />

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
          v-if="showCreateCollectionErrorModal"
          color="#f9b115"
          title="Create Collection Error"
          @close="showCreateCollectionErrorModal = false"
        >
          <template #header>
            <div> All fields are mandatory  </div>
          </template>
          <template #body>
            <div>
              <div>
                image : " {{ collection.vue.image }} "
              </div>
              <div>
                banner : " {{ collection.vue.banner }} "
              </div>
              <div>
                symbol : " {{ collection.vue.symbol }} "
              </div>
              <div>
                name : " {{ collection.vue.name }} "
              </div>
              <div>
                description : " {{ collection.vue.description }} "
              </div>
            </div>
          </template>
          <template #footer>
            <div class="hidden" />
          </template>
        </CModal>

        <CModal
          v-if="showNFTModal"
          color="#f9b115"
          title="Please Wait"
          width="medium"
          @close="showNFTModal = false"
        >
          <template #header>
            <div> Load NFT Collection </div>
          </template>
          <template #body>
            <div
              v-for="c in contracts"
              class="contract-items"
            >
              <div class="contract-item">
                {{ c.symbol }}
              </div>
              <div
                class="contract-item"
                @click="gotoContract(c.nft_address)"
              >
                {{ c.nft_address }}
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

        <CModal
          v-if="showBatchMintNFTModal"
          color="#f9b115"
          title="Please Wait"
          width="medium"
          @close="showBatchMintNFTModal = false"
        >
          <template #header>
            <div>{{ localize('TEXT_FREEZING_METADATA') }}</div>
          </template>
          <template #body>
            <div class="mint-modal-body">
              <div class="mint-text">
                {{ localize('MINT_PLEASE_ENSURE_A') }}
              </div>
              <div class="mint-text">
                {{ localize('MINT_PLEASE_ENSURE_B') }}
              </div>
              <div class="mint-text-warning">
                {{ localize('MINT_PLEASE_ENSURE_C') }}
              </div>
              <div
                class="batch-mint-items"
              >
                <div
                  v-for="(j,i) in batchMintQueue"
                  class="batch-mint-item"
                >
                  <div>
                    {{ i }} : {{ j }}
                  </div>
                </div>
              </div>
              <br>
              <div
                class="flex-row"
              >
                <div
                  class="batch-mint-button"
                  @click="batchMintStart"
                >
                  {{ localize('TEXT_START') }}
                </div>
                <div
                  v-if="isTransaction"
                  class="is-batch-mint-transaction"
                >
                  <Spinner
                    class="spinner-absolute"
                  />
                  <div
                    class="mint-text-please-wait"
                  >
                    {{ localize('TEXT_PLEASE_WAIT') }}
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template #footer>
            <div class="hidden" />
          </template>
        </CModal>

        <CModal
          v-if="showLazyMintModal"
          color="#f9b115"
          title="Please Wait"
          @close="showLazyMintModal = false"
        >
          <template #header>
            <div> {{ localize('TEXT_LAZY_MINT') }} </div>
          </template>
          <template #body>
            <div>
              {{ localize('LAZY_MINT_SIGN_ALL_NFTS') }}
            </div>
          </template>
          <template #footer>
            <div class="hidden" />
          </template>
        </CModal>

        <CModal
          v-if="showVoucherDetailsModal"
          color="#f9b115"
          title="Please Wait"
          @close="showVoucherDetailsModal = false"
        >
          <template #header>
            <div> {{ localize('TEXT_VOUCHER_DETAILS') }} </div>
          </template>
          <template #body>
            <div>
              {{ voucherMetadata }}
              <br />
              {{ voucherVoucher }}
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
import Markdown from 'vue3-markdown-it';
import {rareiumMarketplaceABI, rareiumNFTABI, rareiumPlatformABI} from "../abi.js";
import Datepicker from "@vuepic/vue-datepicker";
import Collection from "./Collection";
import CollectionPreview from "./CollectionPreview";
import Spinner from "./Spinner.vue";
import Epub from "./Epub.vue";
import "@vuepic/vue-datepicker/dist/main.css";

export default {
    "name": "CreateERC1155",
    "components": {
        Carousel,
        Slide,
        Spinner,
        Pagination,
        Navigation,
        Markdown,
        Datepicker,
        Collection,
        CollectionPreview,
        Epub
    },
    setup () {

        const translation = translationStore(),
            route = inject("route"),
            router = inject("router"),
            icon = iconStore(),
            web3 = inject("web3"),
            lazyMintQueue = reactive([]),
            batchMintQueue = reactive([]),
            enabled = ref(false),
            carousel = ref(),
            epubComponent = ref(),
            hasCreateNFTSub = ref(false),
            isContentIPFS = ref(false),
            refreshCollection = ref(0),
            voucherMetadata = ref(),
            voucherVoucher = ref(),
            autoSaveId = ref(),
            NFTcategory = ref([
                "CATEGORY_ART",
                "CATEGORY_BOOK",
                "CATEGORY_MANGA",
                "CATEGORY_ANIME",
                "CATEGORY_MUSIC",
                "CATEGORY_GOTOCHI",
                "CATEGORY_GAMING",
                "CATEGORY_IDOL",
                "CATEGORY_SPORT",
                "CATEGORY_LAUNCHPAD"
            ]),
            NFTMedia = ref([
                "Art",
                "Music",
                "Film",
                "Event",
                "Key",
                "Game"
            ]),
            selectedNFT = ref(0),
            currentSlide = ref(0),
            file = ref(null),
            // contentSecret = ref(""),
            contentFile = ref(""),
            contracts = ref([]),
            collections = reactive({}),
            collection = reactive({"vue": {
                "id": 0,
                "name": "",
                "symbol": "",
                "description": "",
                "owner": "",
                "image": "",
                "banner": "",
                "video": "",
                "file": {},
                "primaryColor": "#000",
                "secondaryColor": "#dde6e8",
                "primary_color": "#000",
                "secondary_color": "#dde6e8",
                "chain_id": ""
            }}),
            displayTypes = ref([
                "string",
                "number",
                "date"
            ]),
            date = ref(),
            validationErrorText = ref(""),
            showValidationErrorModal = ref(false),
            showLazyMintModal = ref(false),
            showVoucherDetailsModal = ref(false),
            showCreateCollectionErrorModal = ref(false),
            showLoadModal = ref(false),
            showNFTModal = ref(false),
            showDefineCollectionModal = ref(false),
            showBatchMintNFTModal = ref(false),
            isTransaction = ref(false),
            homeNameClass = ref(""),
            ratioWrapper = ref(""),
            ratioWrapperLandscape = ref(""),
            collectionPosterVideo = ref(""),
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
                "image/png",
                "image/svg",
                "image/svg+xml",
                "image/webp"
            ]),
            maxVideoSize = ref("1000000000"),
            maxImageSize = ref("10000000"),
            adManagerContractAddress = ref(process.env.AD_MANAGER_ADDRESS),
            media = ref([]),
            nfts = reactive([]),
            vouchers = reactive([]),

            /*
             *addToCollection = function () {
             *    updateCollectionMedia(nft[selectedNFT.value].id, nft[selectedNFT.value], metadata, function(r) {
             *        console.log('update collection token response')
             *        console.log(r)
             *    })
             *},
             */
            gotoTab = function (url) {

                window.open(`${process.env.VUE_APP_SERVER_URI + url}`, "_blank");

            },
            setIPFSContent = function (e) {

                nfts[selectedNFT.value].isContentIPFS = e;

            },
            setEnabled = function (e) {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}setCollectionEnabled`,
                    {

                        "params": {

                            "enabled": e,
                            "nft_address": collection.vue.nft_address

                        }

                    }
                ).
                    then((response) => {

                        collection.vue.enabled = response.data.enabled;

                    });

            },
            getMyCollections = async function (callback) {

                const accounts = await ethereum.request({"method": "eth_requestAccounts"}),
                    addr = accounts[0];

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}getMyCollections`,
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

                                collections[response.data[i].nft_address] = response.data[i];

                            }

                            callback();

                        }

                    }).
                    catch((error) => {

                        throw error;

                    });

            },
            addCollectionMedia = async function (metadata, callback) {

                Axios.post(
                    `${process.env.VUE_APP_SERVER_URI}addCollectionMedia`,
                    metadata,
                    {

                        "headers": {

                            "Content-Type": "multipart/form-data",
                            "Content-Type": "application/json"

                        }

                    }
                ).
                    then((response) => {

                        if (response.status === 200) {

                            callback(response.data.id);

                        } else {

                            callback();

                        }

                    }).
                    catch((error) => {

                        throw error;

                    });

            },
            updateImage = function (f) {

                addFileToWeb3Storage(
                    f,
                    false,
                    (r) => {

                        collection.vue.image = `ipfs://${r}`;

                    }
                );

            },
            updateBanner = function (f) {

                addFileToWeb3Storage(
                    f,
                    false,
                    (r) => {

                        collection.vue.banner = `ipfs://${r}`;

                    }
                );

            },
            updateCollectionMedia = function (id, metadata, callback) {

                const data = {
                    "nft_address": collection.vue.nft_address,
                    metadata,
                    id
                };

                Axios.post(
                    `${process.env.VUE_APP_SERVER_URI}updateCollectionMedia`,
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

                            callback(response);

                        }

                    }).
                    catch((error) => {

                        throw error;

                    });

            },
            deleteCollectionMedia = function (id, index) {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}deleteCollectionMedia`,
                    {

                        "params": {

                            id,
                            "nft_address": collection.vue.nft_address

                        }

                    }
                ).
                    then((response) => {

                        if (response.status === 200) {

                            nfts.splice(
                                index,
                                1
                            );

                        } else {

                            callback();

                        }

                    }).
                    catch((error) => {

                        throw error;

                    });

            },
            getCollectionMedia = function (nft_address) {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}getCollectionMedia`,
                    {

                        "params": {

                            nft_address

                        }

                    }
                ).
                    then((response) => {

                        if (response.status === 200) {

                            nfts.splice(0);

                            for (const i in response.data) {

                                nfts.push(response.data[i]);

                                // legacy compatability
                                if (!nfts[i].metadata.properties)
                                    nfts[i].metadata.properties = {}

                            }

                            if (selectedNFT.value) {

                                selectCard(selectedNFT.value)

                            } else {

                                selectCard(0)

                            }

                        }

                    }).
                    catch((error) => {

                        throw error;

                    });

            },
            prepContentFile = async function (e) {

                let infile = e.target.files[0];

                if (infile.size > 100000000) {

                    validationErrorText.value = translation.localize('CREATE_NFT_INVALID_DATA_SIZE')
                    showValidationErrorModal.value = true;
                    return;

                }

                if (infile.type === "application/epub+zip" ||
                    infile.type === "application/pdf") {

                    contentFile.value = infile;
                    nfts[selectedNFT.value]['metadata']['properties'].content_filename = contentFile.value.name;

                } else {

                    validationErrorText.value = translation.localize('CREATE_NFT_INVALID_DATA_BOOK')
                    showValidationErrorModal.value = true;
                    return

                }

            },
            uploadContentFile = async function () {

                nfts[selectedNFT.value].contentFileLoading = true;
/*

                var key = CryptoJS.enc.Hex.parse(contentSecret.value);
                var wordArray = CryptoJS.lib.WordArray.create(nfts[selectedNFT]['metadata'].content_file);

                var encrypted = CryptoJS.AES.encrypt(wordArray, key, {
                    mode: CryptoJS.mode.ECB, // Electronic Codebook mode
                    padding: CryptoJS.pad.Pkcs7 // PKCS7 padding
                });

                var encryptedString = encrypted.toString();
*/

                addPrivateFile(
                    (r) => {

                        nfts[selectedNFT.value]['metadata']['properties'].content = r;
                        setTimeout(() => {

                          // epubComponent.value.load();

                        }, 500)

                    }
                );

            },
            downloadContentFile = async function () {

                let contentLink = nfts[selectedNFT.value]['metadata']['properties'].content.replace('ipfs://','https://w3s.link/ipfs/');
                
                Axios.get(
                    contentLink,

                    {

                        "params": {

                        }

                    }

                ).
                    then((response) => {

                })

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
            getTokenURI = async function (address, token_id, owner, callback) {

                const amc = new web3.value.eth.Contract(
                    rareiumNFTABI,
                    address
                );
                amc.methods.tokenURI(token_id).
                    call().
                    then((jsonRpcResult) => {

                        callback(
                            token_id,
                            owner,
                            jsonRpcResult
                        );

                    });

            },
            gotoContract = function (c, i) {

                getCollection(c);

            },
            selectAttributeType = function (i, dt, f) {

                if (dt === "date") {

                    nfts[selectedNFT.value].metadata.attributes[i].value = new Date();

                }
                nfts[selectedNFT.value].metadata.attributes[i].display_type = f;

            },
            fetchMyNFTs = async function () {

                const accounts = await ethereum.request({"method": "eth_requestAccounts"}),
                    addr = accounts[0],
                    amc = new web3.value.eth.Contract(
                        rareiumPlatformABI,
                        `${serverConfig.VUE_APP_PLATFORM_ADDRESS.value}`
                    );
                amc.methods.fetchMyNFTs().call({"from": addr}).
                    then((jsonRpcResult) => {

                        contracts.value.splice(0);

                        for (const i in jsonRpcResult) {

                            if (collections[jsonRpcResult[i]]) {

                                contracts.value.push(collections[jsonRpcResult[i]]);

                            }

                        }

                    });

            },
            // create collection on-chain
            createCollection = async function () {

                if (!(collection.vue.image && collection.vue.banner && collection.vue.symbol && collection.vue.name && collection.vue.description)) {

                    console.log("bad collection");
                    showCreateCollectionErrorModal.value = true;
                    return;

                }

                showLoadModal.value = true;

                const accounts = await ethereum.request({"method": "eth_requestAccounts"}),
                    addr = accounts[0],
                    amc = new web3.value.eth.Contract(
                        rareiumPlatformABI,
                        `${serverConfig.VUE_APP_PLATFORM_ADDRESS.value}`
                    );

                collection.vue.royalty_fee = 1000;
                collection.vue.royalty_recipient = addr;

                const m = {
                    "banner": collection.vue.banner,
                    "category": collection.vue.category,
                    "description": collection.vue.description,
                    "image": collection.vue.image,
                    "media": collection.vue.media,
                    "name": collection.vue.name,
                    "nft_address": collection.vue.nft_address,
                    "owner_address": collection.vue.owner_address,
                    "external_link": `${process.env.VUE_APP_SERVER_URI}collection/${collection.vue.symbol}`,
                    "primary_color": collection.vue.primary_color,
                    "secondary_color": collection.vue.secondary_color,
                    "symbol": collection.vue.symbol,
                    "collaborators": [collection.vue.owner_address]
                };

                metadataToWeb3Storage(
                    m,
                    async (collection_metadata) => {

                        const b64meta = `data:application/json;base64,${btoa(unescape(encodeURIComponent(JSON.stringify(m))))}`;

                        let gasLimit = await amc.methods.createERC1155(
                            collection.vue.name,
                            collection.vue.symbol,
                            b64meta,
                            addr,
                            collection.vue.royalty_fee,
                            collection.vue.royalty_recipient
                        ).estimateGas(
                            {
                                "from": addr
                            },
                            (error, estimatedGas) => {

                                console.log("estimatedGas");
                                console.log(estimatedGas);

                            }
                        );
                        console.log(`before gasLimit ${gasLimit}`);
                        gasLimit = gasLimit <= 500000
                            ? Math.floor(gasLimit * 3)
                            : Math.floor(gasLimit * 1.2);

                        let suggestion_gas = await web3.value.eth.getGasPrice();
                        suggestion_gas = Math.floor(suggestion_gas * 1.2);

                        amc.methods.createERC1155(
                            collection.vue.name,
                            collection.vue.symbol,
                            b64meta,
                            addr,
                            collection.vue.royalty_fee,
                            collection.vue.royalty_recipient
                        ).send({
                            "from": addr,
                            "gasPrice": web3.value.utils.toHex(suggestion_gas),
                            gasLimit
                        }).
                            then((jsonRpcResult) => {

                                const r = jsonRpcResult.events.createNFTEvent.returnValues;

                                if (r.nft && !route.params.address) {

                                    showLoadModal.value = false;
                                    saveCollection(r);

                                } else {

                                    alert("There was an error creating NFT, please contact support@compdeep.com");

                                }

                            });

                    }
                );

            },
            // register collection with shinovi.io
            updateCollection = async function () {

                if (!(collection.vue.image && collection.vue.banner && collection.vue.symbol && collection.vue.name && collection.vue.description)) {

                    return;
                    // TODO add error

                }

                showLoadModal.value = true;

                const accounts = await ethereum.request({"method": "eth_requestAccounts"}),
                    addr = accounts[0],
                    amc = new web3.value.eth.Contract(
                        rareiumNFTABI,
                        collection.vue.nft_address
                    );

                collection.vue.royalty_recipient = addr;
                collection.vue.royalty_fee = 1000;
                collection.vue.chain_id = serverConfig.chainId.value;

                const m = {
                    "banner": collection.vue.banner,
                    "category": collection.vue.category,
                    "description": collection.vue.description,
                    "image": collection.vue.image,
                    "media": collection.vue.media,
                    "name": collection.vue.name,
                    "nft_address": collection.vue.nft_address,
                    "owner_address": collection.vue.owner_address,
                    "external_link": `${process.env.VUE_APP_SERVER_URI}collection/${collection.vue.nft_address}`,
                    "primary_color": collection.vue.primary_color,
                    "secondary_color": collection.vue.secondary_color,
                    "symbol": collection.vue.symbol,
                    "collaborators": [collection.vue.owner_address]
                };

                metadataToWeb3Storage(
                    m,
                    async (collection_metadata) => {

                        const b64meta = `data:application/json;base64,${btoa(unescape(encodeURIComponent(JSON.stringify(m))))}`;

                        let gasLimit = await amc.methods.setContractURI(b64meta).estimateGas(
                            {
                                "from": addr
                            },
                            (error, estimatedGas) => {

                                console.log("estimatedGas");
                                console.log(estimatedGas);

                            }
                        );
                        console.log(`before gasLimit ${gasLimit}`);

                        gasLimit = gasLimit <= 100000
                            ? Math.floor(gasLimit * 3)
                            : Math.floor(gasLimit * 1.2);
                        let suggestion_gas = await web3.value.eth.getGasPrice();
                        suggestion_gas = Math.floor(suggestion_gas * 1.2);

                        amc.methods.setContractURI(b64meta).send({
                            "from": addr,
                            "gasPrice": web3.value.utils.toHex(suggestion_gas),
                            gasLimit
                        }).
                            then((jsonRpcResult) => {

                                Axios.post(

                                    `${process.env.VUE_APP_SERVER_URI}saveCollection`,
                                    collection.vue,
                                    {
                                        "headers": {
                                            "Content-Type": "multipart/form-data"
                                        }
                                    }
                                ).
                                    then((response) => {

                                        if (response.status === 200) {

                                              showLoadModal.value = false;

                                              if (collection.vue.nft_address) {

                                                  getCollection(collection.vue.nft_address);

                                              }

                                          }

                                      }).
                                      catch((error) => {

                                          throw error;

                                      });

                              });

                      }
                  );

              },
              saveCollection = async function (contractResponse) {

                  if (contractResponse.nft) {

                      collection.vue.nft_address = contractResponse.nft;

                  }
                  if (contractResponse.owner) {

                      collection.vue.owner_address = contractResponse.owner;

                  }
                  if (contractResponse.name) {

                      collection.vue.name = contractResponse.name;

                  }
                  if (contractResponse.royaltyFee) {

                      collection.vue.royalty_fee = contractResponse.royaltyFee;

                  }
                  if (contractResponse.royaltyRecipient) {

                      collection.vue.royalty_recipient = contractResponse.royaltyRecipient;

                  }

                  if (serverConfig.chainId.value == 11155111) {

                      collection.vue.chain_id = 1;

                  } else if (serverConfig.chainId.value == 80001) {

                      collection.vue.chain_id = 137;

                  } else {

                      collection.vue.chain_id = serverConfig.chainId.value;

                  }

                  Axios.post(
                      `${process.env.VUE_APP_SERVER_URI}saveCollection`,
                      collection.vue,
                      {
                          "headers": {
                              "Content-Type": "multipart/form-data"
                          }
                      }
                  ).
                      then((response) => {

                          if (response.status === 200) {

                              if (collection.vue.nft_address) {

                                  getCollection(collection.vue.nft_address);

                              }

                          }

                      }).
                      catch((error) => {

                          throw error;

                      });

              },
              selectCard = function (i) {

                  selectedNFT.value = i;
                  autoSave(i);
                  carousel.value.slideTo(i);

              },
              freezeMetadata = async function (i, callback) {

                  metadataToWeb3Storage(
                      nfts[i].metadata,
                      (r) => {

                          nfts[i].metadata_url = r;

                          if (callback) {

                              callback(
                                  r,
                                  i
                              );

                          }

                      }
                  );

              },
              addCreativeFiles = function (e) {

                  if (!collection.vue.nft_address) {

                      alert("Please Creat Collection First");
                      return;

                  }

                  const files = e.target.files;
                  for (let i = 0; i < files.length; i++) {

                      const creative = files[i];

                      if (imageTypes.indexOf(files[i].type) > -1) {

                          getMediaDimensions(
                              files[i],
                              "image",
                              (d) => {

                                  creative.dimensions = d;
                                  const nft = {};
                                  nft.creative = creative;
                                  nft.nft_address = collection.vue.nft_address;
                                  nft.metadata = {
                                      "description": "",
                                      "external_link": `${process.env.VUE_APP_SERVER_URI}collection/${collection.vue.nft_address}`,
                                      "image": "",
                                      "name": "",
                                      "background_color": "",
                                      "animation_url": "",
                                      "content": "",
                                      "content_filename": "",
                                      "attributes": [],
                                      "properties": {},
                                      "supply": 1
                                  };

                                  addCollectionMedia(
                                      nft,
                                      (id) => {

                                          addNFTFileToWeb3Storage(
                                              files[i],
                                              id,
                                              "image"
                                          );
                                          // internal shinovi id
                                          nft.id = id;
                                          nft.loading = true;
                                          nfts.push(nft);
                                          currentSlide.value = nfts.length - 1;
                                          selectedNFT.value = nfts.length - 1;

                                      }
                                  );

                              }
                          );

                      } else if (videoTypes.indexOf(files[i].type) > -1) {

                          console.log("supported video type");

                          getMediaDimensions(
                              files[i],
                              "video",
                              (d) => {

                                  creative.dimensions = d;
                                  const nft = {};
                                  nft.creative = creative;
                                  nft.nft_address = collection.vue.nft_address;
                                  nft.metadata = {
                                      "description": "",
                                      "external_url": `${process.env.VUE_APP_SERVER_URI}collection/${collection.vue.nft_address}`,
                                      "image": "",
                                      "name": "",
                                      "background_color": "",
                                      "animation_url": "",
                                      "attributes": [],
                                      "properties": {},
                                      "supply": 1
                                  };
                                  addCollectionMedia(
                                      nft,
                                      (id) => {

                                          addNFTFileToWeb3Storage(
                                              files[i],
                                              id,
                                              "video"
                                          );
                                          // internal shinovi id
                                          nft.id = id;
                                          nft.loading = true;
                                        nfts.push(nft);
                                        currentSlide.value = nfts.length - 1;
                                        selectedNFT.value = nfts.length - 1;

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

                nfts[selectedNFT.value].metadata.attributes.push({
                    "display_type": "string",
                    "trait_type": "",
                    "value": ""
                });

            },
            removeAttribute = function (i) {
            },
            metadataToWeb3Storage = async function (metadata, callback) {

                const accounts = await ethereum.request({"method": "eth_requestAccounts"}),
                    addr = accounts[0],

                    data = new FormData();
                Axios.post(

                    `${process.env.VUE_APP_SERVER_URI}jsonToWeb3Storage`,
                    metadata,
                    {

                        "headers": {

                            // "Content-Type": "multipart/form-data",
                            "Content-Type": "application/json"

                        }

                    }

                ).
                    then((response) => {

                        callback(response.data);

                    });

            },
            addPrivateFile = async function (callback) {

                const accounts = await ethereum.request({"method": "eth_requestAccounts"}),
                    addr = accounts[0],
                    data = new FormData();

                data.append(
                    "account",
                    addr
                );
                data.append(
                    "nft_address",
                    collection.vue.nft_address
                );
                data.append(
                    "acl",
                    JSON.stringify({"collection":collection.vue.nft_address})
                );
                data.append(
                    "file",
                    contentFile.value
                );
                data.append(
                    "is_content_ipfs",
                    nfts[selectedNFT.value].isContentIPFS
                );

                Axios.post(

                    `${process.env.VUE_APP_SERVER_URI}addPrivateFile`,
                    data,
                    {

                        "headers": {

                            "Content-Type": "multipart/form-data"

                        }

                    }

                ).
                    then((response) => {

                        nfts[selectedNFT.value].contentFileLoading = false;

                        if (response.data) {

                            callback(response.data.url);

                        }

                    });

            },
            addFileToWeb3Storage = async function (file, secure, callback) {

                const accounts = await ethereum.request({"method": "eth_requestAccounts"}),
                    addr = accounts[0],
                    data = new FormData();
                data.append(
                    "account",
                    addr
                );
                data.append(
                    "file",
                    file
                );

                Axios.post(

                    `${process.env.VUE_APP_SERVER_URI}fileToWeb3Storage`,
                    data,
                    {

                        "headers": {

                            "Content-Type": "multipart/form-data"
                            // "Content-Type": "application/json"

                        }

                    }

                ).
                    then((response) => {

                        if (response.data) {

                            callback(response.data);

                        }

                    });

            },
            // same as able but for NFT tokens (TODO: use the above func instead)
            addNFTFileToWeb3Storage = async function (file, i, t) {

                const accounts = await ethereum.request({"method": "eth_requestAccounts"}),
                    addr = accounts[0],
                    data = new FormData();
                data.append(
                    "account",
                    addr
                );
                data.append(
                    "file",
                    file
                );
                data.append(
                    "index",
                    i
                );
                data.append(
                    "type",
                    t
                );
                Axios.post(

                    `${process.env.VUE_APP_SERVER_URI}fileToWeb3Storage`,
                    data,
                    {

                        "headers": {

                            "Content-Type": "multipart/form-data"
                            // "Content-Type": "application/json"

                        }

                    }

                ).
                    then((response) => {

                        // this idiocy because vue3 objects don't work
                        for (let j = 0; j < nfts.length; j++) {

                            if (nfts[j].id === i) {

                                nfts[j].loading = false;

                                if (t === "image") {

                                    nfts[j].metadata.image = `ipfs://${response.data}`;

                                }

                                if (t === "video") {

                                    nfts[j].metadata.animation_url = `ipfs://${response.data[0]}`;
                                    nfts[j].metadata.image = `ipfs://${response.data[1]}`;

                                }
                                updateCollectionMedia(
                                    nfts[j].id,
                                    nfts[j].metadata,
                                    (r) => {}
                                );

                            }

                        }

                    });

            },
            getCollection = function (address) {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}getCollection`,

                    {

                        "params": {

                            address

                        }

                    }

                ).
                    then((response) => {

                        nfts.splice(0);
                        getCollectionMedia(response.data.nft_address);

                        collection.vue.value = {};

                        // Object.assign(collection, response.data);
                        for (const key in response.data) {

                            collection.vue[key] = response.data[key];

                        }

                        router.push({"path": `/create-erc-1155/${response.data.nft_address}/`}).catch((err) => {

                            console.error(err);

                        });

                        const x = async () => {

                            const accounts = await ethereum.request({"method": "eth_requestAccounts"}),
                                addr = accounts[0],
                                amc = new web3.value.eth.Contract(
                                    rareiumNFTABI,
                                    collection.vue.nft_address
                                );
                            amc.methods.contractURI().call().
                                then((jsonRpcResult) => {

                                    console.log("getContractURI jsonRpcResult");
                                    console.log(jsonRpcResult);

                                });

                        };
                        if (collection.vue.nft_address) {

                            x();

                        }

                        refreshCollection.value++;

                    });

            },
            uploadIPFSFiles = function (addr, callback) {

                if (nfts.length === 0) {

                    return;

                }
                for (let i = 0; i < nfts.length; i++) {

                    const data = new FormData();
                    data.append(
                        "account",
                        addr
                    );
                    data.append(
                        "file",
                        nfts[i].creative
                    );
                    data.append(
                        "index",
                        i
                    );
                    data.append(
                        "dimensions",
                        JSON.stringify(nfts[i].dimensions)
                    );
                    Axios.post(

                        `${process.env.VUE_APP_SERVER_URI}addIPFSFile`,
                        {data},
                        {

                            "headers": {

                                "Content-Type": "multipart/form-data"

                            }

                        }


                    ).
                        then((response) => {

                            // input.creatives[response.data.index] = response.data;
                            if (response.data.index == nfts.length - 1) {

                                callback();

                            }

                        });

                }

            },
            uploadIPFSMetadata = function (addr, callback) {

                Axios.post(

                    `${process.env.VUE_APP_SERVER_URI}addIPFSFile`,
                    data,
                    {

                        "headers": {

                            "Content-Type": "multipart/form-data",
                            "Content-Type": "application/json"

                        }

                    }


                ).
                    then((r) => {

                        callback(r);

                    });

            },
            loadIPFS = function (name, opt, callback) {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}getIPFS`,

                    {

                        "params": {

                            name

                        }

                    }

                ).
                    then((response) => {

                        callback(
                            response,
                            opt
                        );

                    });

            },
            batchMintStart = async function () {

                batchMintQueue.splice(0);
                isTransaction.value = true;

                let count = 0;
                for (var i = 0; i < nfts.length; i++) {

                    count += parseInt(nfts[i].metadata.supply);

                }

                for (var i = 0; i < nfts.length; i++) {

                    try {

                        await freezeMetadata(
                            i,
                            (_url, k) => {

                                for (let j = 0; j < nfts[k].metadata.supply; j++) {

                                    if (_url.substring(
                                        0,
                                        4
                                    ) === "ipfs") {

                                        batchMintQueue.push(_url);

                                    } else {

                                        alert("there is an error in the metadata");
                                        return;

                                    }

                                    if (batchMintQueue.length === count) {

                                        batchMintNFT();

                                    }

                                }

                            }

                        );

                    } catch (e) {

                        alert ('There was an error freezing metadata, please send this error to support@shinovi.io, if you have not yet confirmed the process in metamask / wallet it is safe to try again ' + e);

                    }

                }

            },
            signVoucher = async function (batch, address, hash, callback) {

                batch.add(
                  await web3.value.eth.personal.sign(
                     //   web3.value.utils.utf8ToHex(hash),
                     // web3.value.utils.sha3(hash),
                      hash,
                      address,
                  ).then((signature) => {

                      callback(signature)

                  })
                )

            },
            mintVoucher = async function (voucher) {

                const addr = await getAccount(),

                    amc = new web3.value.eth.Contract(
                        rareiumNFTABI,
                        collection.vue.nft_address
                    );

                let gasLimit = await amc.methods.lazyMint(
                    addr,
                    voucher
                ).estimateGas(
                    {
                        "value" : voucher.price,
                        "from": addr
                    },
                    (error, estimatedGas) => {
                    }
                );

                gasLimit = gasLimit <= 50000
                    ? Math.floor(gasLimit * 3)
                    : Math.floor(gasLimit * 1.2);
                let gasPrice = await web3.value.eth.getGasPrice();
                gasPrice = Math.floor(gasPrice * 1.2);

                await amc.methods.lazyMint(
                    addr,
                    voucher
                ).send({
                    "from" : addr,
                    "value" : voucher.price,
                    gasPrice: web3.value.utils.toHex(gasPrice),
                    gasLimit,
                }).
                    then((jsonRpcResult) => {

                        console.log(jsonRpcResult)

                    }
                );

            },
            validateNFTData = async function (lazy) {

                for (var i = 0; i < nfts.length; i++) {

                    if (lazy === true) {

                        if (nfts[i].metadata.mintprice === undefined) {

                            alert('no mint price')
                            return false

                        }

                    }

                }

            },
            showVoucher = function (voucher, metadata) {

                voucherMetadata.value = JSON.stringify(metadata, null, 2);
                voucherVoucher.value = JSON.stringify(voucher, null, 2);
                showVoucherDetailsModal.value = true;

            },
            removeVoucher = function (id) {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}removeVouchers`,
                    {

                        "params": {

                            "vouchers": [id],
                            "nft_address": collection.vue.nft_address

                        }

                    }
                ).
                    then((response) => {

                        getVouchers();

                    });

            },
            saveVouchers = function () {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}addVouchers`,
                    {

                        "params": {

                            "vouchers": toRaw(lazyMintQueue),
                            "nft_address": collection.vue.nft_address

                        }

                    }
                ).
                    then((response) => {

                        getVouchers();

                    });

            },
            getVouchers = function () {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}getVouchers`,
                    {

                        "params": {

                            "nft_address": route.params.address

                        }

                    }
                ).
                    then((response) => {

                        vouchers.splice(0);
                        for (const i in response.data) {

                            vouchers.push(response.data[i])

                        }

                    });

            },
            lazyMintStart = async function () {

                showLazyMintModal.value = true;

                let validate = await validateNFTData(true);

                if (validate === false) {

                    return;

                }

                lazyMintQueue.splice(0);
                isTransaction.value = true;

                let count = 0, id = vouchers.length;
                for (var i = 0; i < nfts.length; i++) {

                    count += parseInt(nfts[i].metadata.supply);

                }

                for (var i = 0; i < nfts.length; i++) {

                    try {

                        await freezeMetadata(
                            i,
                            async (uri, k) => {

                                for (let j = 0; j < nfts[k].metadata.supply; j++) {

                                    id++;

                                    if (uri.substring(
                                        0,
                                        4
                                    ) === "ipfs") {

                                        let price = web3.value.utils.toWei(nfts[k]['metadata'].mintprice);
                                        let metadata = nfts[k]['metadata'];

                                        const keccakHash = web3.value.utils.soliditySha3(
                                            { type: 'uint256', value: id },
                                            { type: 'uint256', value: price },
                                            { type: 'string', value: uri }
                                        ).toString("hex");

                                        const accounts = await ethereum.request({"method": "eth_requestAccounts"});

                                        // batch to reduce insanity
                                        var batch = new web3.value.BatchRequest();

                                        let signature = await signVoucher(batch, accounts[0], keccakHash, (signature) => {

                                            const voucher = {

                                                id,
                                                price,
                                                uri,
                                                signature

                                            }

                                            lazyMintQueue.push({voucher,metadata});

                                            if (lazyMintQueue.length === count) {

                                                batch.execute();

                                                // mintVoucher(lazyMintQueue[0].voucher);

                                                saveVouchers();
                                                showLazyMintModal.value = false;

                                            }

                                        });

                                    } else {

                                        alert("there is an error in the metadata");
                                        return;

                                    }

                                }

                            }

                        );

                    } catch (e) {

                        alert ('There was an error freezing metadata, please send this error to support@shinovi.io, if you have not yet confirmed the process in metamask / wallet it is safe to try again ' + e);

                    }

                }

            },
            batchMintNFT = async function () {

                showBatchMintNFTModal.value = true;

                const addr = await getAccount(),

                    amc = new web3.value.eth.Contract(
                        rareiumNFTABI,
                        collection.vue.nft_address
                    );

                let gasLimit = await amc.methods.batchMint(
                    addr,
                    toRaw(batchMintQueue)
                ).estimateGas(
                    {
                        "from": addr
                    },
                    (error, estimatedGas) => {
                    }
                );

                gasLimit = gasLimit <= 50000
                    ? Math.floor(gasLimit * 3)
                    : Math.floor(gasLimit * 1.2);
                let gasPrice = await web3.value.eth.getGasPrice();
                gasPrice = Math.floor(gasPrice * 1.2);

                amc.methods.batchMint(
                    addr,
                    toRaw(batchMintQueue)
                ).send({
                    "from": addr,
                    "gasPrice": web3.value.utils.toHex(gasPrice),
                    gasLimit
                }).
                    then((jsonRpcResult) => {

                        isTransaction.value = false;
                        showBatchMintNFTModal.value = false;
                        batchMintQueue.splice(0);

                        refreshCollection.value++;

                    });

            },
            autoSave = function (_sel) {

                if (nfts[_sel] === undefined || autoSaveId.value === _sel) {

                    return;

                }

                const id = nfts[_sel].id;
                let metadata = JSON.stringify(nfts[_sel].metadata),

                    doLoop = () => {

                        autoSaveId.value = _sel;

                        if (!nfts[_sel]) {

                            return;

                        }

                        if (metadata != JSON.stringify(nfts[_sel].metadata)) {

                            updateCollectionMedia(
                                nfts[_sel].id,
                                nfts[_sel].metadata,
                                (r) => {
                                    // console.log(r)
                                }
                            );
                            metadata = JSON.stringify(nfts[_sel].metadata);

                        }
                        if (id === nfts[selectedNFT.value].id) {

                            setTimeout(
                                () => {

                                    console.log('return doloop')
                                    console.log(metadata)
                                    doLoop()

                                },
                                3000
                            );

                        }

                    };
                doLoop();

            },

            getMediaDimensions = async function (f, t, c) {

                const dimensions = {};
                if (t === "video") {

                    const $video = document.createElement("video");
                    $video.src = URL.createObjectURL(f);
                    $video.addEventListener(
                        "loadedmetadata",
                        function (e) {

                            console.log(e);
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
            subscribeToNewCollections = async function () {

                // web3.eth.abi.encodeEventSignature('createNFTEvent')
                console.log('subscribeToNewCollections')

                const accounts = await ethereum.request({"method": "eth_requestAccounts"}),
                    addr = accounts[0];

                let options = {
                    topics: [
                      web3.value.utils.sha3('createNFTEvent(address,string,string,address,uint256,address)')
                    ]
                };

                let subCreateCollection = web3.value.eth.subscribe('logs', options);

                subCreateCollection.on('error', err => { throw err })
                .on("connected", function(subscriptionId){
                    console.log("new collections SubID: ", subscriptionId);
                })
                .on('data', event => {

                    let t = web3.value.eth.abi.decodeLog(
                        [{"indexed":true,"internalType":"address","name":"nft","type":"address"},{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"string","name":"symbol","type":"string"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"royaltyFee","type":"uint256"},{"indexed":false,"internalType":"address","name":"royaltyRecipient","type":"address"}],
                        event.data,
                        [event.topics[1],event.topics[2]]
                    )

                    if (web3.value.utils.toChecksumAddress(t.owner) == web3.value.utils.toChecksumAddress(addr) && t.symbol == collection.vue.symbol && !route.params.address) {

                        showLoadModal.value = false;
                        saveCollection(t);

                    }

                });

            };

        onMounted(() => {

            if (route.params.address) {

                getCollection(route.params.address);
                getVouchers();

            }

            getMyCollections(() => {

                fetchMyNFTs();

            });

            if (hasCreateNFTSub.value === false) {

                subscribeToNewCollections();
                hasCreateNFTSub.value = true;

            }

/*
            contentSecret.value = CryptoJS.enc.Hex.stringify(CryptoJS.lib.WordArray.random(256 / 8));
            console.log(contentSecret.value)
*/
            watch(
                () => selectedNFT,
                () => {

                    /*
                     * console.log('watch');
                     * console.log(selectedNFT.value)
                     */

                }
            );

            watch(
                serverConfig.chainId,
                () => {

                    collection.vue.chain_id = serverConfig.chainId.value;
                    getMyCollections(() => {

                        fetchMyNFTs();

                    });

                }
            );

            currentSlide.value = nfts.length;

        });

        return {"localize": translation.localize,
            date,
            displayTypes,
            addAttribute,
            removeAttribute,
            getAccount,
            getTokenURI,
            getVouchers,
            saveVouchers,
            carousel,
            contracts,
            collection,
            collectionPosterVideo,
            contentFile,
            gotoTab,
            prepContentFile,
            uploadContentFile,
            downloadContentFile,
            refreshCollection,
            uploadIPFSFiles,
            loadIPFS,
            uploadIPFSMetadata,
            setIPFSContent,
            isContentIPFS,
            hasCreateNFTSub,
            subscribeToNewCollections,
            metadataToWeb3Storage,
            nfts,
            vouchers,
            showVoucher,
            removeVoucher,
            voucherMetadata,
            voucherVoucher,
            autoSave,
            autoSaveId,
            freezeMetadata,
            setEnabled,
            addCollectionMedia,
            isTransaction,
            signVoucher,
            mintVoucher,
            validateNFTData,
            lazyMintStart,
            batchMintStart,
            batchMintNFT,
            lazyMintQueue,
            batchMintQueue,
            deleteCollectionMedia,
            updateCollectionMedia,
            updateImage,
            updateBanner,
            getCollectionMedia,
            selectCard,
            selectAttributeType,
            selectedNFT,
            currentSlide,
            saveCollection,
            gotoContract,
            epubComponent,
            createCollection,
            updateCollection,
            validationErrorText,
            showLazyMintModal,
            showVoucherDetailsModal,
            showValidationErrorModal,
            showNFTModal,
            showLoadModal,
            showCreateCollectionErrorModal,
            showDefineCollectionModal,
            showBatchMintNFTModal,
            addCreativeFiles,
            addNFTFileToWeb3Storage,
            addFileToWeb3Storage,
            fetchMyNFTs,
            getMediaDimensions,
            homeNameClass,
            NFTcategory,
            NFTMedia,
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
.collection-container {
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
.create-collection-preview-bg {
  flex-grow: 1;
  position: relative;
  overflow: hidden;
  border: 3px dashed #d295ff;
}
.create-collection-preview-bg:hover {
  opacity: 0.5;
}
.create-collection-container {
  padding: 20px;
  width: 33%;
}
.create-collection-preview {
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
.portrait {
  padding-bottom: 177.78%;
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
.collection-upload-container {
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
  max-width: 150px;
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
.create-collection-unit {
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
.create-collection-button {
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
.create-save-collection-button {
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
.lazy-mint-collection-button {
  display: flex;
  margin-bottom: 20px;
  align-items: center;
  width: fit-content;
  font-family: Comfortaa,sans-serif;
  text-align: left;
  white-space: nowrap;
  color: #00cbff;
  height: 50px;
  font-weight: bold;
  padding-left: 20px;
  padding-right: 20px;
  border-radius: 30px;
  border: none;
  cursor: pointer;
  border: 3px solid #00cbff;
}
.batch-mint-collection-button {
  display: flex;
  margin-bottom: 20px;
  align-items: center;
  width: fit-content;
  font-family: Comfortaa,sans-serif;
  text-align: left;
  white-space: nowrap;
  color: #ff46a4;
  height: 50px;
  font-weight: bold;
  padding-left: 20px;
  padding-right: 20px;
  border-radius: 30px;
  border: none;
  text-shadow: 0px 15px 20px 2px rgb(139 106 224 / 33%);
  cursor: pointer;
  border: 3px solid #ff46a4;
}
.batch-mint-button {
  display: flex;
  margin: 0px 0px 30px 10px;
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
  background: linear-gradient(338deg,#ff7c88,#ff46a4)
}
.create-collection-text {
  display: block;
  display: flex;
  justify-items: center;
}
.create-collection-title {
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
.create-collection-body {
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
.batch-mint-container {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
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
  margin-left: 20px;
}
.swatches-item {
  margin-top: 20px;
  margin-right: 20px;
  margin-bottom: 20px;
}
.define-nft-left {
  width: 50%;
  margin-right: 30px;
}
.create-collection-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.define-nft-right {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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
.batch-mint-items {
  width: 100%;
  max-height: 200px;
  overflow: auto;
}
.batch-mint-item {
  display: flex;
  font-size: 0.8em;
  color: #666666;
  padding: 5px;
}
.enable-ipfs {
  margin: 12px;
}
.enable-collection {
  margin-top: 18px;
  margin-left: 25px;
}
.create-nft-carousel {
  width: 100%;
}
.create-nft-slide {
  width: 100%;
}
.mint-advice {
  color: #8f81bd;
  font-size: .8em;
  text-align: left;
  margin: 20px 0px 10px 0px;
}
.mint-modal-body {
  display: flex;
  flex-direction: column;
  align-items: start;
}
.mint-internal {
  display: flex;
  flex-direction: column;
}
.mint-text {
  font-size: 0.9em;
  margin-top: 5px;
}
.mint-text-warning {
  margin-top: 20px;
  text-align: left;
  font-weight: bold;
  font-size: 0.9em;
}
.mint-text-please-wait {
  font-size: 0.9em;
  margin-top: 5px;
  margin-left: 10px;
}
.is-batch-mint-transaction {
  display: flex;
  margin-left: 20px;
  margin-bottom: 20px;
  flex-direction: row;
  justify-content: centerr;
  align-items: center;
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
.epub-preview {
  width: 500px;
  height: 500px;
  font-family: sans-serif;
  text-align: center;
  display: flex;
  width: 100%;
}
.selected-card {
  width: 50px;
  margin-left: auto;
  margin-right: auto;
  border: 3px solid #ff46a4;
}
.vouchers-table {
  font-size: 0.9em;
  border: 1px solid #cacaca;
  border-radius: 7px;
  max-height: 700px;
  overflow: auto;
}
.vouchers-column {
  display: flex;
  flex-direction: column; 
}
.vouchers-row {
  border-bottom: 1px solid #cacaca;
  display: flex;
  flex-direction: row;
  padding: 5px;
}
.voucher-item {
  margin: 5px;
  width: 20px;
  font-size: 0.85em;
}
.voucher-item {
  display: flex;
  justify-content: center;
  margin: 5px;
  width: 20%;
  font-size: 0.85em;
}
.mint-link {
  cursor: pointer;
  padding: 10px;
  font-size: 0.8em;
}
.mint-link:hover {
  text-decoration: underline;
}
</style>
