<template>
  <div>
    <LocalizedContent ref="lc" />
    <div
      class="company"
    >
      <flex-col>
        <svg
          class="company-svg"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
        >
          <defs>
            <linearGradient
              id="grad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                stop-color="#967cec"
              />
              <stop
                offset="100%"
                stop-color="#967cec"
              />
            </linearGradient>
          </defs>
          <path
            fill="#fafbfb"
            fill-opacity="1"
            d="M0,192L30,176C60,160,120,128,180,144C240,160,300,224,360,245.3C420,267,480,245,540,224C600,203,660,181,720,165.3C780,149,840,139,900,154.7C960,171,1020,213,1080,197.3C1140,181,1200,107,1260,80C1320,53,1380,75,1410,85.3L1440,96L1440,320L1410,320C1380,320,1320,320,1260,320C1200,320,1140,320,1080,320C1020,320,960,320,900,320C840,320,780,320,720,320C660,320,600,320,540,320C480,320,420,320,360,320C300,320,240,320,180,320C120,320,60,320,30,320L0,320Z"
          />
        </svg>
        <div
          :class="companyContainer"
        >
          <div class="company-title">
            <h2> {{ localize('COMPANY_HEADER') }} </h2>
          </div>
          <div class="company-item">
            {{ localize('COMPANY_CONTENT_1') }}
          </div>
          <div class="company-item">
            {{ localize('COMPANY_CONTENT_2') }}
          </div>
          <div class="company-item">
            {{ localize('COMPANY_CONTENT_3') }}
          </div>
          <div class="company-item">
            {{ localize('COMPANY_CONTENT_4') }}
          </div>
          <div class="company-item">
            {{ localize('COMPANY_CONTENT_5') }}
          </div>
        </div>
      </flex-col>
    </div>
  </div>
</template>
<script>

import LocalizedContent from "./LocalizedContent.vue";
import Contact from "./Contact.vue";
export default {
    "name": "Company",
    "components": {
        Contact,
        LocalizedContent
    },
    "props": {
    },
    data () {

        return {
            "openModal": false,
            "localize" () {},
            "companyContainer": "",
            "titleClass": ""
        };

    },
    "watch": {
        "$root.serverConfig.view" () {

            this.updateView();

        }
    },
    mounted () {

        this.localize = this.$refs.lc.localize;

    },
    updated () {

        this.updateView();

    },
    "methods": {
        gotoTab (t) {

            this.selectedTab = t;
            this.$router.push({"path": `/${t}`,
                "name": t});

        },
        updateView () {

            if (this.$root.serverConfig.view === "desktop" || this.$root.serverConfig.view === "laptop") {

                this.companyContainer = "company-container-desktop";

            } else {

                this.companyContainer = "company-container-mobile";

            }

        }
    }
};

</script>
<style scoped>
svg.company-svg {
  background-color: #411f62;
  padding-top: 100px;
}
.company-container-desktop {
  margin-left: 100px;
  margin-right: 100px;
  margin-top: 100px;
}
.company-container-mobile {
  margin-left: 10px;
  margin-right: 10px;
  margin-top: 100px;
}
.company-item {
  margin: 20px;
}
h1 {
  text-align: left;
  font-size: 3em;
  color: white
}
h2 .company {
  color: #334456;
}
#company {
  margin-top: -60px;
}
</style>
