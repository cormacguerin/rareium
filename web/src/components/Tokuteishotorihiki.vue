<template>
  <div
    v-if="isLang('ja') > -1"
    :class="docMain"
  >
    <head>
      <title>特定商取引に関する記載</title>
      <meta
        http-equiv="Content-Type"
        content="text/html; charset=UTF-8"
      >
      <meta
        name="generator"
        content="pdftohtml 0.36"
      >
    </head>
    <div>
      販売業<br>
      株式会社マツモト<br>
      者<br>
      運営統<br>括責任<br>
      松本大輝<br>
      者<br>
      所在地<br>
      〒800-8555　福岡県北九州市門司区社ノ木1-2-1<br>
      電話<br>
      093-371-0298<br>
      FAX<br>
      093-391-6530<br>
      メールア&#160;support@shinovi.io<br>
      ドレス<br>
      商品の<br>
      購入取引完了後、購入した商品は、本サービスを利用する際に接続した、<br>
      受け渡し&#160;または作成されたウォレットに転送されます。<br>時期<br>
      販売価格は、各商品に表記された価格に準じます。<br>
      販売価<br>
      商品の出品者には、規定の手数料が売買成立時にかかります。<br>
      格<br>
      手数料は出品確定を行う前に、本サービス画面内で確認することが出来<br>ます。<br>
      商品代<br>
      当サイトのページの閲覧に必要となるインターネット接続料金、通信料金<br>
      金以外<br>
      等はユーザー様の負担となります。また、当社のサービスの利用には、第<br>三者が提供する所定のウォレットを利用している必要があります。当該<br>
      の必要<br>
      ウォレットの利用にかかる料金は、ユーザー様の負担となります。<br>
      料金<br>
      お支払<br>
      購入取引完了時に直ちに暗号資産でお支払いいただきます。<br>
      い方法<br>
      返品に<br>
      商品の特性上、返品・交換・キャンセルは一切受け付けておりません。<br>
      ついて<br>
    </div>
  </div>
</template>
<script>

import {iconStore} from "@/stores/icon";
import {inject, onMounted, reactive, ref, watch} from "vue";
import {translationStore} from "@/stores/translation";

export default {
    "name": "Privacy",
    "components": {
    },
    "props": {
    },
    setup () {

        const icon = iconStore(),
            serverConfig = inject("serverConfig"),
            translation = translationStore(),
            userInfo = inject("userInfo"),
            thisPDF = ref(""),
            docMain = ref(""),
            shinoViDocs = ref(""),
            isLang = function (lang) {

                console.log("translation.getLang()");
                console.log(translation.getLang());

                return translation.getLang().indexOf(lang);

            },
            showPDF = function (pdf) {

                showPDFModal.value = true;
                thisPDF.value = `${process.env.VUE_APP_SERVER_URI + pdf}#view=FitH`;

            },
            resizeIframe = function (obj) {

                obj.style.height = `${obj.value.contentWindow.document.documentElement.scrollHeight}px`;

            },
            updateView = function () {

                if (serverConfig.view === "desktop") {

                    shinoViDocs.value = "shinovi-docs-desktop";
                    docMain.value = "doc-main-desktop";

                } else if (serverConfig.view === "laptop") {

                    shinoViDocs.value = "shinovi-docs-desktop";
                    docMain.value = "doc-main-laptop";

                } else if (serverConfig.view === "tablet") {

                    shinoViDocs.value = "shinovi-docs-desktop";
                    docMain.value = "doc-main-tablet";

                } else if (serverConfig.view === "mobile") {

                    shinoViDocs.value = "shinovi-docs-mobile";
                    docMain.value = "doc-main-mobile";

                } else {

                    shinoViDocs.value = "shinovi-docs-mobile";
                    docMain.value = "doc-main-mobile";

                }

            },
            showPDFModal = ref(false);

        onMounted(() => {

            watch(

                () => serverConfig.view,
                () => {

                    updateView();

                }

            );

            updateView();

        });

        return {"localize": translation.localize,
            translation,
            "icon": icon.get,
            isLang,
            resizeIframe,
            thisPDF,
            docMain,
            shinoViDocs,
            updateView,
            showPDFModal,
            showPDF};

    }
};

</script>
<style scoped>
.doc-main-desktop {
  display: flex; height: 100%; flex-direction: column; overflow: hidden;
  font-size: 0.9em;
  line-height: 30px;
  max-width: 1200px;
  padding: 10px;
  text-align: left;
  margin-left: auto;
  margin-right: auto;
  justify-content: center;
}
.doc-main-laptop {
  display: flex; height: 100%; flex-direction: column; overflow: hidden;
  font-size: 0.9em;
  line-height: 30px;
  max-width: 1200px;
  margin: 10px;
  text-align: left;
  margin-left: auto;
  margin-right: auto;
  justify-content: center;
}
.doc-main-mobile {
  display: flex; height: 100%; flex-direction: column; overflow: hidden;
  font-size: 0.9em;
  line-height: 30px;
  padding: 10px;
  text-align: left;
  margin-left: auto;
  margin-right: auto;
  justify-content: center;
}
.doc-main-tablet {
  display: flex; height: 100%; flex-direction: column; overflow: hidden;
  font-size: 0.9em;
  line-height: 30px;
  max-width: 1000px;
  margin: 10px;
  text-align: left;
  margin-left: auto;
  margin-right: auto;
  justify-content: center;
}
iframe {
  border: none;
}
h1.doc {
  line-height: 50px;
}
.shinovi-docs-desktop {
  flex-grow: 1; border: none; margin: 0; padding: 0;
  margin-top: 100px;
  max-width: 1000px;
}
.shinovi-docs-mobile {
  flex-grow: 1; border: none; margin: 0; padding: 0;
  margin-top: 50px;
  max-width: 500px;
}
.footer-item {
  margin: 10px;
  cursor: pointer;
  color: #505050;
}
</style>

