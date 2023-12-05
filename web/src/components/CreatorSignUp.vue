<template>
  <div>
    <Dashboard>
      <flex-row class="creator-signup-background">
        <div class="creator-sign-up-container">
          <h2 class="creator-sign-uptitletext">
            {{ localize('TEXT_BECOME_A_CREATOR') }}
          </h2>
          <div>
            <div class="sub-header">
              {{ localize('BECOME_A_CREATOR_DETAILS') }}
            </div>
            <CInput
              :title="localize('TEXT_NAME')"
              :placeholder="localize('TEXT_NAME_PLACEHOLDER')"
              type="string"
              class="creator-sign-up-item"
              @inputValue="fullname = $event"
            />
            <CInput
              :title="localize('TEXT_EMAIL')"
              :placeholder="localize('TEXT_EMAIL_PLACEHOLDER')"
              type="string"
              class="creator-sign-up-item"
              @inputValue="email = $event"
            />
            <CInput
              :title="localize('TEXT_SNS')"
              :placeholder="localize('TEXT_SNS_PLACEHOLDER')"
              type="string"
              class="creator-sign-up-item"
              @inputValue="sns = $event"
            />
            <div class="flex-row">
              <CInput
                :title="localize('SIGN_UP_WALLET_ADDRESS')"
                :placeholder="localize('TEXT_ADDRESS')"
                :value="wallet"
                :disabled="true"
                type="string"
                class="creator-sign-up-item"
                @inputValue="wallet = $event"
              />
              <div class="sign-up-wallet">
                <div class="cinputTitle">
                  {{ localize('SIGN_UP_WALLET_EXPLAIN') }}
                </div>
                <div
                  class="become-a-creator-wallet-button"
                  @click="addWallet"
                >
                  {{ localize('TEXT_SET_WALLET') }}
                </div>
              </div>
            </div>
            <div class="flex-row">
              <CInput
                :title="localize('TEXT_DOMAIN')"
                :placeholder="localize('TEXT_DOMAIN_PLACEHOLDER')"
                type="string"
                class="creator-sign-up-item"
                @inputValue="name = $event"
              />
              <div class="signup-name">
                <div class="cinputTitle">
                  {{ localize('SIGN_UP_DOMAIN_EXPLAIN') }}
                </div>
                <div class="domain-name">
                  https://www.rareium.io/
                  <span
                    v-if="nameOK == true && charsOK == true"
                    class="name-ok"
                  >
                    {{ name }}
                  </span>
                  <span
                    v-else
                    class="name-not-ok"
                  >
                    {{ name }}
                  </span>
                </div>
              </div>
            </div>
            <div
              class="cinputTitle"
            >
              {{ localize('TEXT_ABOUT') }}
            </div>
            <textarea
              v-model="text"
              class="creator-signup-textarea"
              :placeholder="localize('TEXT_MESSAGE_PLACEHOLDER')"
              @value="setText"
            />
          </div>
          <div
            class="become-a-creator-save-button"
            @click="save"
          >
            {{ localize('TEXT_SUBMIT') }}
          </div>
          <br>
          <b>{{ contactResponse }}</b>

          <CModal
            v-if="showCheckModal"
            color="#f9b115"
            title="Sign up."
            size="small"
            @close="showCheckModal = false"
          >
            <template #header>
              <div> Sign Up </div>
            </template>
            <template #body>
              <div
                id="contact-message"
              >
                {{ localize('SIGN_UP_CHECK_ALL') }}
              </div>
            </template>
            <template #footer>
              <div class="hidden" />
            </template>
          </CModal>

          <CModal
            v-if="showResponseModal"
            color="#f9b115"
            title="Sign up."
            size="small"
            @close="showResponseModal = false"
          >
            <template #header>
              <div> Sign Up </div>
            </template>
            <template #body>
              <div
                id="contact-message"
              >
                {{ contactResponse }}
              </div>
            </template>
            <template #footer>
              <div class="hidden" />
            </template>
          </CModal>
        </div>
      </flex-row>
    </Dashboard>
  </div>
</template>
<script>

import {iconStore} from "@/stores/icon";
import {inject, onMounted, reactive, ref, watch} from "vue";
import {translationStore} from "@/stores/translation";
import Axios from "axios";
import FormData from "form-data";

export default {
    "name": "CreatorSignUp",
    "components": {
    },
    setup () {

        const translation = translationStore(),
            eBus = inject("eBus"),
            web3 = inject("web3"),
            icon = iconStore(),
            nameOK = ref("false"),
            charsOK = ref("false"),
            fullname = ref(""),
            creatorEmailSignUpItem = ref("item-not-ok"),
            wallet = ref(""),
            name = ref(""),
            text = ref(""),
            email = ref(""),
            sns = ref(""),
            route = inject("route"),
            router = inject("router"),
            showResponseModal = ref(false),
            showCheckModal = ref(false),
            contactResponse = ref(""),
            userInfo = inject("userInfo"),
            serverConfig = inject("serverConfig"),
            setText = function (v) {

                text.value = v;

            },
            checkChars = async function () {

                if (name.value.length < 2 || name.value.length > 20) {

                    charsOK.value = false;
                    return;

                }

                const regEx = /^[0-9a-zA-Z]+$/;
                if (name.value.match(regEx)) {

                    charsOK.value = true;

                } else {

                    charsOK.value = false;

                }

            },
            addWallet = async function () {

                if (parseInt(userInfo.user_id) > 0) {

                    const acc = await web3.value.eth.getAccounts();

                    if (acc.length > 0) {

                        wallet.value = acc[0];

                    } else if (window.ethereum) {

                        const accounts = await ethereum.request({"method": "eth_requestAccounts"});
                        wallet.value = acc[0];

                    }

                } else {

                    eBus.emit(
                        "app-event",
                        {
                            "action": "showLoginModal",
                            "data": ""
                        }
                    );

                }

            },
            validateEmail = function (email) {

                const regEx = /^.*@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
                return email.match(regEx);

            },
            save = function () {

                if (!(validateEmail(email.value) && fullname.value && wallet.value && name.value && text.value)) {

                    showCheckModal.value = true;
                    return;

                }
                console.log("translation.localize a");
                console.log(translation.localize);

                Axios.get(

                    `${process.env.VUE_APP_SERVER_URI}contact`,
                    {

                        "params": {

                            "email": email.value,
                            "sns": sns.value,
                            "fullname": fullname.value,
                            "wallet": wallet.value,
                            "name": name.value,
                            "text": text.value

                        }

                    }

                ).
                    then((response) => {

                        console.log("translation.localize b");
                        console.log(translation.localize);

                        showResponseModal.value = true;

                        if (response.data) {

                            if (response.data.status === "success") {

                                contactResponse.value = translation.localize("BECOME_A_CREATOR_RESPONSE_SUCCESS");

                            } else {

                                contactResponse.value = translation.localize("BECOME_A_CREATOR_RESPONSE_FAILED");

                            }

                        }

                    }).
                    catch((error) => {

                        console.log(error);

                    });

            };

        onMounted(() => {

            /*
             *TODO integrate this into CINPUT
             */
            watch(
                () => email.value,
                () => {

                    if (validateEmail(email.value)) {

                        creatorEmailSignUpItem.value = "item-ok";

                    } else {

                        creatorEmailSignUpItem.value = "item-not-ok";

                    }

                }
            );

            watch(
                () => name.value,
                () => {

                    Axios.get(

                        `${process.env.VUE_APP_SERVER_URI}checkCreatorName`,
                        {

                            "params": {

                                "name": name.value

                            }

                        }

                    ).
                        then((response) => {

                            console.log(response.data);
                            nameOK.value = response.data;
                            checkChars();

                        });

                }

            );

            watch(
                () => userInfo.user_id,
                () => {

                    addWallet();

                }

            );

        });

        return {"localize": translation.localize,
            fullname,
            email,
            sns,
            text,
            contactResponse,
            name,
            nameOK,
            charsOK,
            checkChars,
            creatorEmailSignUpItem,
            showResponseModal,
            showCheckModal,
            wallet,
            validateEmail,
            route,
            router,
            serverConfig,
            showResponseModal,
            save,
            addWallet,
            setText,
            userInfo,
            eBus,
            web3,
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
.creator-sign-uptitletext {
  color: #000;
}
.creator-sign-up-container {
  background-color: white;
  border: 3px solid #a346ff;
  border-radius: 20px;
  margin-left: auto;
  margin-right: auto;
  padding: 20px;
  min-width: 300px;
  max-width: 850px;
  width: 70%;
}
.creator-signup-textarea {
  padding: 10px;
  margin-top: 10px;
  width: 100%;
  height: 150px;
  font-size: .9em;
  box-sizing: border-box;
  border: 2px solid #dfdfdf;
  border-radius: 15px;
}
.become-a-creator-save-button {
  display: flex;
  margin-top: 20px;
  margin-bottom: 20px;
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
  background: linear-gradient(338deg,#ff7c88,#ff46a4);
}
.become-a-creator-wallet-button {
  display: flex;
  margin: 5px 0px;
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
input#creator-sign-up-file-upload {
  display: none;
}
label.creator-sign-up-file-upload {
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
.creator-signup-background {
  display: flex;
  align-items: center;
  background-image: url("../assets/signup-background.png");
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
}
.sign-up-wallet {
  margin-left: 20px;
}
.signup-name {
  display: flex;
  flex-direction: column;
  text-align: left;
  align-items: start;
  justify-content: start;
  margin: 5px 0px 0px 40px;
}
video.video-preview {
  width: 100%;
  object-fit: contain;
}
.name-ok {
  color: #303030;
}
.name-not-ok {
  color: red;
}
.domain-name {
  margin: 8px 0px;
}
.creator-sign-up-item {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.item-ok {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: green;
}
.item-not-ok {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: orange;
}

</style>
