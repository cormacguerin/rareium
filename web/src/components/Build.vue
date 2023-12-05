<template>
  <div>
    <LocalizedContent ref="lc" />
    <div
      class="build"
    >
      <flex-col>
        <flex-col
          wrap
          class="container"
        >
          <div
            id="about"
            class="title"
          >
            Content
          </div>
        </flex-col>
      </flex-col>
    </div>
  </div>
</template>
<script>

import LocalizedContent from "./LocalizedContent.vue";
export default {
    "name": "Build",
    "components": {
        LocalizedContent
    },
    "props": {
    },
    data () {

        return {
            "openModal": false,
            "homeTitleClass": ""
        };

    },
    "watch": {
        "$root.serverConfig.view" () {

            if (this.$root.serverConfig.view === "desktop") {

                this.homeTitleClass = "home-title-desktop";
                console.log("desktop");

            } else {

                this.homeTitleClass = "home-title-mobile";
                console.log("mobile");

            }

        }
    },
    mounted () {

        this.localize = this.$refs.lc.localize;

    },
    "methods": {
        gotoTab (t) {

            this.selectedTab = t;
            this.$router.push({"path": `/${t}`,
                "name": t});

        }
    }
};

</script>
<style scoped>
.title {
  margin: 20px;
  border: none;
  text-align: left;
  padding-left: 20px;
  padding-right: 20px;
  font-size: 2em;
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
.build-container-desktop {
  margin-left: 100px;
  margin-right: 100px;
  margin-top: -20%;
}
.build-container-mobile {
  margin-left: 10px;
  margin-right: 10px;
  margin-top: -20%;
}
h2 {
  margin-left: 20px;
  text-align: left;
  font-size: 24px;
  color: white
}
</style>
