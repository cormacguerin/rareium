<template>
  <div
    class="modal-dialog"
  >
    <LocalizedContent ref="lc" />
    <div class="flex-col">
      <!--
      <div
        class="ud-login flex-row"
        @click="udLogin"
      >
        <div class="ud-logo-wrapper">
          <div
            class="ud-logo"
          >
          </div>
        </div>
        <div class="ud-text">
          {{ loginText }}
        </div>
      </div>
-->
      <input
        v-model="email"
        class="emailpass"
        placeholder="e-mail"
      >
      <input
        v-model="password"
        class="emailpass"
        placeholder="password"
        type="password"
      >
    </div>
    <br>
    <div class="flex-row">
      <div
        id="send-button"
        :class="registerClass"
        @click="register"
      >
        {{ localize('TEXT_SIGN_UP') }}
      </div>
      <div
        id="send-button"
        :class="loginClass"
        @click="login"
      >
        {{ localize('TEXT_LOGIN') }}
      </div>
    </div>
    <span
      id="message"
      class="success"
    >
      {{ message }}
    </span>
  </div>
</template>
<script>

import {emit, inject, onMounted, ref, watch} from "vue";
import {translationStore} from "@/stores/translation";
import Axios from "axios";

export default {
    "name": "Login",
    "components": {
    },
    "props": {
        "value": {
            "type": String,
            "default": ""
        },
        "valid": {
            "type": String,
            "default": false
        }
    },
    "emits": [
        "hide-modal-event",
        "get-userinfo-event"
    ],
    setup (_, {emit}) {

        const emitHideModal = () => {

                emit(
                    "hide-modal-event",
                    false
                );

            },
            emitGetUserInfo = () => {

                emit(
                    "get-userinfo-event",
                    true
                );

            },
            email = ref(""),
            message = ref(""),
            emailOK = ref(false),
            emailAvailable = ref(false),
            password = ref(""),
            passwordOK = ref(false),
            registerClass = ref("send-inactive"),
            loginClass = ref("send-inactive"),
            loginText = ref(""),
            translation = translationStore(),
            text = ref(""),
            userInfo = inject("userInfo"),
            login = function () {

                if (loginClass.value == "send-inactive") {

                    validatePassword();
                    return;

                }
                Axios.post(
                    `${process.env.VUE_APP_SERVER_URI}login`,
                    {
                        "email": email.value,
                        "password": password.value
                    }
                ).
                    then((response) => {

                        if (response.data) {

                            if (response.data.authorized == true) {

                                document.getElementById("message").className = "success";
                                setTimeout(
                                    () => {

                                        close();

                                    },
                                    500
                                );

                            } else {

                                document.getElementById("message").className = "error";
                                message.value = translation.localize("LOGIN_FAILED");

                            }

                        }

                    }).
                    catch((error) => {

                        console.log(error);

                    });

            },
            register = function () {

                Axios.post(
                    `${process.env.VUE_APP_SERVER_URI}register`,
                    {
                        "email": email.value,
                        "password": password.value,
                        "language": userInfo.language,
                        "text": text.value
                    }
                ).
                    then((response) => {

                        if (response.data) {

                            if (response.data.status === "success") {

                                document.getElementById("message").className = "success";
                                message.value = translation.localize("CONTACT_WILL_CONTACT");
                                setTimeout(
                                    () => {

                                        close();

                                    },
                                    2000
                                );

                            } else {

                                document.getElementById("message").className = "error";
                                message.value = translation.localize("CONTACT_ERROR");

                            }

                        }

                    }).
                    catch((error) => {

                        console.log(error);

                    });

            },
            verifyEmail = function () {

                Axios.get(
                    `${process.env.VUE_APP_SERVER_URI}verifyUserEmail`,
                    {
                        "params": {
                            "email": email.value
                        }
                    }
                ).
                    then((response) => {

                        if (response.data) {

                            if (response.data.email === "available") {

                                document.getElementById("message").className = "success";
                                message.value = translation.localize("LOGIN_EMAIL_AVAILABLE");
                                emailAvailable.value = true;

                            } else {

                                document.getElementById("message").className = "error";
                                emailAvailable.value = false;
                                message.value = translation.localize("LOGIN_ALREADY_REGISTERED_EMAIL");

                            }
                            validateForm();

                        }

                    }).
                    catch((error) => {

                        console.log(error);

                    });

            },
            close = function () {

                emitGetUserInfo();
                emitHideModal();

            },
            validateEmail = function () {

                const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                if (email.value.match(re)) {

                    emailOK.value = true;
                    verifyEmail();

                } else {

                    emailOK.value = false;
                    message.value = translation.localize("LOGIN_INVALID_EMAIL");

                }

            },
            validatePassword = function () {

                if (password.value.length > 6) {

                    passwordOK.value = true;

                } else {

                    passwordOK.value = false;

                }
                validateForm();

            },
            validateForm = function () {

                if (emailAvailable.value == true && emailOK.value == true && passwordOK.value == true) {

                    registerClass.value = "send-active";
                    loginClass.value = "send-inactive";

                } else if (emailAvailable.value == false && emailOK.value == true && passwordOK.value == true) {

                    registerClass.value = "send-inactive";
                    loginClass.value = "send-active";

                } else {

                    registerClass.value = "send-inactive";
                    loginClass.value = "send-inactive";

                }

            };
        onMounted(() => {

            const count = ref(0);
            watch(
                email,
                () => {

                    validateEmail();

                }
            );
            watch(
                password,
                () => {

                    validatePassword();

                }
            );

        });
        return {"localize": translation.localize,
            close,
            text,
            email,
            password,
            message,
            email,
            emailOK,
            emailAvailable,
            password,
            passwordOK,
            registerClass,
            login,
            loginClass,
            loginText,
            register,
            text,
            userInfo,
            validateEmail,
            validateForm,
            validatePassword,
            verifyEmail,
            emitHideModal,
            emitGetUserInfo};

    }
};

</script>
<style scoped>
.flex-row {
  display: flex;
  flex-direction: row;
}
.flex-col {
  display: flex;
  flex-direction: column;
}
.title-mobile {
  margin-left: 0px;
}
.title-desktop {
  margin-left: 10px;
}
h2 {
  margin-left: 20px;
  text-align: left;
  font-size: 24px;
  color: white
}
.content-container {
  margin-top: 150px;
}
.modal-dialog {
  pointer-events: all;
}
/*
.ud-login {
  margin-bottom: 20px;
  padding: 10px;
  flex-wrap: nowrap;
  justify-content: center;
  border: 1px solid #a7a5ff;
  border-radius: 10px;
}
.ud-login:hover {
  cursor: pointer;
}
.ud-logo {
  display: block;
  width: 32px;
  height: 32px;
  margin-right: 10px;
  background-image: url("../assets/ud-logo-default-32.png");
  background-size: contain;
  background-repeat: no-repeat;
}
.ud-logo:hover {
  background-image: url("../assets/ud-logo-hover-32.png");
}
.ud-logo-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
*/
li.home-head {
  text-align: left;
  font-size: 1.1em;
  color: white
}
input.emailpass::placeholder{
  color: #a13aff;
}
input.emailpass {
  line-height: 30px;
  font-size: 0.8em;
  text-indent: 5px;
  padding: 5px;
  min-width: 250px;
  margin: 5px;
  border: none;
  border-bottom: 1px solid #a046ff;
  background-color: #fafafa;
  outline: 0;
}
.home-list {
  width: 250px;
}
.signup {
  font-size: 0.8em;
  width: 100px;
  margin-top: 10px;
  margin-left: 20px;
  color: white;
  height: 50px;
  font-weight: bold;
  background-color: #bf8505;
}
.send-inactive {
  float: left;
  margin: 10px;
  padding: 10px 20px;
  border: 1px solid;
  border-radius: 5px;
  border-color: #ff7dcb;
  color: #ff7dcb;
  font-size: 0.8em;
  font-weight: bold;
}
.send-active {
  float: left;
  cursor: pointer;
  margin: 10px;
  padding: 10px 20px;
  border: 1px solid;
  border-radius: 5px;
  border-color: #e10087;
  background-color: #e10087;
  font-weight: bold;
  color: #fff;
  font-size: 0.8em;
}
.signupmodal {
  margin-top: 10%;
}
.error {
  float: left;
  margin: 15px;
  color: grey;
}
.success {
  float: left;
  margin: 15px;
  color: #e10087;
}
/*
.ud-text {
  padding: 5px;
  color: black;
}
*/
#message {
  font-size: 0.8em;
  margin: 15px;
  transition: all 500ms ease-in-out;
}
</style>
