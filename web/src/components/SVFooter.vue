<template>
  <div>
    <div class="footer-main">
      <div class="footer-social">
        <div
          class="discord"
          @click="gotoUrl('https://discord.com/invite/USxY8yN49X')"
        />
        <div
          class="twitter"
          @click="gotoUrl('https://twitter.com/rareium')"
        />
      </div>
      <div
        v-if="isLang('ja') > -1"
        class="footer-links"
      >
        <div
          class="footer-item"
          @click="gotoTab('privacy')"
        >
          個人情報保護方針
        </div>
        <div
          class="footer-item"
          @click="gotoTab('terms')"
        >
          NFTマーケットプレイス利用規約
        </div>
        <div
          class="footer-item"
          @click="gotoTab('tokuteishotorihiki')"
        >
          特定商取引に関する記載
        </div>
        <div
          class="footer-item"
          @click="gotoTab('about')"
        >
          rareiumについて
        </div>
      </div>
      <div
        v-else
        class="footer-links"
      >
        <div
          class="footer-item"
          @click="gotoTab('privacy')"
        >
          Privacy Policy
        </div>
        <div
          class="footer-item"
          @click="gotoTab('terms')"
        >
          Terms and Conditions
        </div>
        <div
          class="footer-item"
          @click="gotoTab('about')"
        >
          About
        </div>
      </div>
      <br>
      <div class="footer-item">
        © 2024 rareium Copyright, All Rights Reserved.
      </div>
    </div>
    <CModal
      v-if="showPDFModal"
      width="medium"
      color="#5d328d"
      :title="thisPDF"
      @close="showPDFModal = false"
    >
      <template #header>
        <div> Edit Admin </div>
      </template>
      <template #body>
        <div class="flex-col">
          <embed
            :src="thisPDF"
            frameborder="0"
            width="100%"
            height="800px"
          >
        </div>
      </template>
      <template #footer>
        <div class="hidden" />
      </template>
    </CModal>
  </div>
</template>
<script>

import {iconStore} from "@/stores/icon";
import {inject, onMounted, reactive, ref, watch} from "vue";
import {translationStore} from "@/stores/translation";

export default {
    "name": "SVFooter",
    "components": {
    },
    "props": {
    },
    setup () {

        const icon = iconStore(),
            router = inject("router"),
            serverConfig = inject("serverConfig"),
            translation = translationStore(),
            userInfo = inject("userInfo"),
            thisPDF = ref(""),
            gotoUrl = function (url) {

                window.location = url;

            },
            isLang = function (lang) {

                console.log(translation.getLang().indexOf(lang));
                return translation.getLang().indexOf(lang);

            },
            showPDF = function (pdf) {

                showPDFModal.value = true;
                thisPDF.value = `${process.env.VUE_APP_SERVER_URI + pdf}#view=FitH`;

            },
            gotoTab = function (t) {

                router.push({"path": `/${t}`,
                    "name": t});

            },
            showPDFModal = ref(false);

        return {"localize": translation.localize,
            translation,
            "icon": icon.get,
            gotoTab,
            gotoUrl,
            isLang,
            thisPDF,
            showPDFModal,
            showPDF};

    }
};

</script>
<style scoped>
.footer-main {
  width: 100%;
  height: 300px;
  margin-top: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.9em;
  flex-direction: column;
  background: white;
  background-position: 0 0;
}
.footer-item {
  margin: 10px;
  cursor: pointer;
  color: #1d1d1d;
}
.footer-item:hover {
  text-decoration: underline;
}
.discord {
  margin: 32px;
  width: 42px;
  height: 42px;
  cursor: pointer;
  background-image: url("../assets/discord.png");
  background-repeat: no-repeat;
  background-size: contain;
}
.twitter {
  margin: 32px;
  width: 42px;
  height: 42px;
  cursor: pointer;
  background-image: url("../assets/x.png");
  background-repeat: no-repeat;
  background-size: contain;
}
.footer-social {
  margin-top: -50px;
  border-radius: 33%;
  display: flex;
  flex-direction: row;
  border-radius: 70%;
}
.footer-links {
  color: white;
  display: flex;
  flex-direction: row;
}
</style>

