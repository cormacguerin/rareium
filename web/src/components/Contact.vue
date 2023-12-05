<template>
  <div
    class="modal-dialog"
  >
    <LocalizedContent ref="lc" />
    <div
      class="ud-login"
      @click="udLogin"
    />
    <flex-col>
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
      <textarea
        v-model="text"
        class="contact"
        :placeholder="placeholder"
      />
    </flex-col>
    <flex-row class="send-close">
      <div
        id="send-button"
        :class="sendClass"
        @click="save"
      >
        {{ localize('TEXT_SIGN_UP') }}
      </div>
      <div
        class="close"
        @click="close"
      >
        Close
      </div>
    </flex-row>

    <CModal
      v-if="showModal"
      color="#f9b115"
      title="Sign up."
      size="small"
      @close="showModal = false"
    >
      <template #header>
        <div> Sign Up </div>
      </template>
      <template #body>
        <div
          id="contact-message"
        >
        
          {{ localize('BECOME_A_CREATOR_RESPONSE') }}
          {{ message }}
        </div>
      </template>
      <template #footer>
        <div class="hidden" />
      </template>
    </CModal>

  </div>
</template>
<script>

import Axios from "axios";
import {translationStore} from "@/stores/translation";
export default {
    "name": "Contact",
    "components": {
        LocalizedContent
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

    setup () {

        const translation = translationStore(),
            email = ref(false),
            passwword = ref(false),
            text = ref(false),
            showModal = ref(false),
            save () {

                Axios.get(

                    process.env.VUE_APP_SERVER_URI + 'register',
                    {
                        "params": {
                            email,
                            password,
                            text
                        }
                    }

                ).
                    then((response) => {

                        showModal.value = true;

                        if (response.data) {

                            if (response.data.status === "success") {

                                message = localize("CONTACT_WILL_CONTACT");
                                setTimeout(
                                    () => {

                                        close();

                                    },
                                    2000
                                );

                            } else {

                                message = localize("CONTACT_ERROR");

                            }

                        }

                    }).
                    catch((error) => {

                        console.log(error);

                    });

            }

            return {"localize": translation.localize,
                showModal,
                email,
                password,
                text,
                save,
                showModal
            };

    }
};

</script>
<style scoped>
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
li.home-head {
  text-align: left;
  font-size: 1.1em;
  color: white
}
input.emailpass {
  font-size: 1em;
  padding: 10px;
  min-width: 250px;
  margin-bottom: 20px;
  border: none;
  border-bottom: 2px solid #efefef;
  border-radius: 10px;
  background-color: #fafafa;
  outline: 0;
}
textarea.contact {
  font-size: 1em;
  padding: 10px;
  min-height: 100px;
  max-width: 400px;
  border-top: 2px white;
  border-left: 2px white;
  border-right: 2px white;
  border-bottom: 2px #efefef solid;
  border-radius: 10px;
  margin-bottom: 20px;
  background-color: #fafafa;
  outline: 0;
}
.send-close {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.home-list {
  width: 250px;
}
.signup {
  width: 100px;
  margin-top: 10px;
  margin-left: 20px;
  color: white;
  height: 50px;
  font-weight: bold;
  background-color: #bf8505;
}
.send-inactive {
  border: 1px solid #f9b115;
  border-radius: 5px;
  background-color: #fff;
  color: #ababab;
  padding: 10px;
  cursor: pointer;
}
.send-active {
  border: 1px solid #f9b115;
  border-color: #f9b115;
  border-radius: 5px;
  background-color: #f9b115;
  color: #fff;
  padding: 10px;
  cursor: pointer;
}
.signupmodal {
  margin-top: 10%;
}
.margin {
  margin-top: 100px;
}
.error {
  float: left;
  margin: 15px;
  color: grey;
}
.success {
  float: left;
  margin: 15px;
  color: #f9b115;
}
.close {
  color: #d0d0d0;
  margin: 10px;
}
.ud-login {
  display: block;
  height: 50px;
  width: 200px;
}
.ud-login:hover {
}
#message {
  font-size: 1em;
  transition: all 500ms ease-in-out;
}
</style>
