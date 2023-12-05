import Web3 from "web3";
import { WalletConnectModal } from '@walletconnect/modal'

const getWeb3 = (config) => new Promise((resolve) => {

    const selectedProvider = localStorage.getItem("selectedProvider");

    if (selectedProvider === "metamask") {

        console.log('metamask')
      
        if (window.ethereum) {

            console.log('window.ethereum')

            const currentWeb3 = new Web3(window.ethereum);
            // currentWeb3.providerName = 'browser';
            resolve(currentWeb3);

        } else {

            window.location.href = "https://metamask.app.link/dapp/www.rareium.io";

        }

    } else if (selectedProvider === "walletconnect") {

        console.log('walletconnect')

        const wcProvider = new WalletConnectModal({

            projectId: 'YOUR_PROJECT_ID',
            chains: ['eip155:1']


          /*
            "infuraId": config.VUE_APP_INFURA_ID,
            "qrcodeModal": QRCodeModal,
            "bridge": "https://bridge.walletconnect.org",
            "qrcodeModalOptions": {
                "desktopLinks": [
                    "ledger",
                    "coinbase",
                    "metamask"
                ],
                "mobileLinks": [
                    "metamask",
                    "ledger",
                    "coinbase"
                ]

            }
*/
        })

        resolve(new Web3(wcProvider));

    } else {

        console.log("config.VUE_APP_PROVIDER");
        console.log(config.VUE_APP_PROVIDER);
        resolve(new Web3(new Web3.providers.HttpProvider(config.VUE_APP_PROVIDER)));

    }

});

export {getWeb3};

