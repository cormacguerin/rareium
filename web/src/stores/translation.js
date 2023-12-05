import {defineStore} from "pinia";

const getLang = function () {

        if (navigator.userLanguage) {

            return navigator.userLanguage;

        } else if (navigator.language) {

            return navigator.language;

        }

        return "en-US";

    },

    getBrowserLanguage = function () {

        switch (getLang()) {

        case "en-US":
            return "en";
        case "en-AU":
            return "en";
        case "en-CA":
            return "en";
        case "en-IE":
            return "en";
        case "en-GB":
            return "en";
        case "en-JM":
            return "en";
        case "en-ZA":
            return "en";
        case "en-PH":
            return "en";
        case "ja":
            return "ja";
        case "ja-jp":
            return "ja";
        case "ja-JP":
            return "ja";
        default:
            return "en";

        }

    },

    translationStore = defineStore(
        "translation",
        {
            "actions": {
                "setLanguage": (state) => function (lang) {

                    state.VUE_APP_USER_LANGUAGE = lang;

                }
            },
            "getters": {
                "getLang": () => function () {

                    return getLang();

                },
                "localize": (state) => function (...args) {

                    const args_ = Array.prototype.slice.call(args),
                        i = args_[0],
                        r = [];
                    for (let j = 1; j < args_.length; j++) {

                        r.push(args_[j]);

                    }
                    if (!state.VUE_APP_USER_LANGUAGE) {

                        state.VUE_APP_USER_LANGUAGE = getBrowserLanguage();

                    }
                    if (!state[i]) {

                        return i;

                    }
                    if (state[i] && state.VUE_APP_USER_LANGUAGE) {

                        let localized = state[i][state.VUE_APP_USER_LANGUAGE];
                        if (!localized) {

                            return "";

                        }
                        if (r.length > 0) {

                            let l = 0;
                            for (const k in r) {

                                if (r[k]) {

                                    localized = localized.replace(
                                        `{${l}}`,
                                        r[k]
                                    );

                                } else {

                                    localized = localized.replace(
                                        `{${l}}`,
                                        ""
                                    );

                                }
                                l++;

                            }
                            return localized;

                        }
                        return localized;

                    }
                    return i;

                }
            },
            "state": () => ({
                "ACCOUNT_DATA_FOR_REWARDS": {
                    "en": "Share your data to increase your reward multiplier.",
                    "ja": "データを共有することで、報酬の倍率を上げることができます。"
                },
                "APP_COPYRIGHT": {
                    "en": "© 2022 equityDAO  Copyright, All Rights Reserved.",
                    "ja": "© 2022 equityDAO . 無断複写・転載を禁じます。"
                },
                "APP_SET_EMAIL": {
                    "en": "Set e-mail",
                    "ja": "メールアドレスを入力"
                },
                "APP_SET_EMAIL_PLACEHOLDER": {
                    "en": "enter email",
                    "ja": "メールアドレスを入力"
                },
                "APP_SET_EMAIL_TEXT": {
                    "en": "Set an email to receive offer notifications and updates.",
                    "ja": "電子メールを入力し、オファーの通知と更新を受け取ります。"
                },
                "APP_GET_STARTED": {
                    "en": "Get Started !",
                    "ja": "スタート"
                },
                "APP_INSUFFICIENT_BALANCE_A" : {
                    "en": "The connected wallet has insufficient balance to execute this transaction. To complete the transaction please top up your wallet with the listed tokens on the correct chain. Cryptocurrnecy can be purchased on an exchange or via a payment portal in your wallet, for example via 'Transak' on Metamask.",
                    "ja": "接続されているウォレットには、このトランザクションを実行するための十分な残高がありません。 トランザクションを完了するには、正しいチェーンにリストされているトークンをウォレットに補充してください。 暗号通貨は取引所で購入することも、ウォレット内の支払いポータル (メタマスクの「Transak」など) 経由で購入することもできます。"
                },
                "APP_INSUFFICIENT_BALANCE_B" : {
                    "en": "If you use magic wallet it is possible to purchace cryptocurrency by opening the wallet under the profile icon on the top right and click on wallet. NB. Please make sure to purchase tokens on the correct chain, for example, if the Payment is with 'MATIC', please make sure that the connected wallet is on the 'polygon chain' (Not Ethereum). If the payment is in 'ETH' please make sure you are on the Ethereum Chain.",
                    "ja": "マジックウォレットを使用している場合は、右上のプロフィールアイコンの下でウォレットを開き、ウォレットをクリックすることで暗号通貨を購入することができます。 注意。 必ず正しいチェーンでトークンを購入してください。たとえば、支払いが「MATIC」の場合は、接続されたウォレットが「ポリゴン チェーン」(イーサリアムではない) 上にあることを確認してください。 支払いが「ETH」である場合は、イーサリアム チェーン上にいることを確認してください。"
                },
                "APP_INSUFFICIENT_BALANCE_C" : {
                    "en": "For additional support please contact the equityDAO team on discord.",
                    "ja": "追加のサポートが必要な場合は、discord の equityDAO チームにお問い合わせください。"
                },
                "APP_SIGNUP_DETAILS": {
                    "en": "Sign Up for more details",
                    "ja": "登録して詳細を確認する"
                },
                "APP_SIGN_UP": {
                    "en": "Sign Up !",
                    "ja": "サインアップ"
                },
                "APP_SIGN_UP_TITLE": {
                    "en": "Sign up.",
                    "ja": "登録する。"
                },
                "APP_USE_WALLET": {
                    "en": "equityDAO Requires a web3 wallet to use. Please install a wallet like metamask below to continue.",
                    "ja": "を使用するには、web3ウォレットが必要です。下記リンク先のmetamaskのようなウォレットをインストールしてください。"
                },
                "BECOME_A_CREATOR_DETAILS": {
                    "en": "Create NFTs, Grow your audience, Build your brand.",
                    "ja": "equityDAOにクリエイター登録をしてNFTの販売を行います。"
                },
                "BECOME_A_CREATOR_RESPONSE_SUCCESS": {
                    "en": "Thank you for your interest in equityDAO, we will be in contact shortly.",
                    "ja": "equityDAOにご興味をお持ちいただき、ありがとうございます。"
                },
                "BECOME_A_CREATOR_RESPONSE_FAILED": {
                    "en": "An error was encountered processing the request, please check all fields and contact support@equityDAO.io",
                    "ja": "リクエストの処理中にエラーが発生しました。すべてのフィールドを確認して、support@equityDAO.io までご連絡ください。"
                },
                "CONTACT_WILL_CONTACT": {
                    "en": "Thank you for your interest, please check your inbox to complete registration.",
                    "ja": "ご興味をお持ちいただきありがとうございます。メールが送信されましたので、登録作業をご確認ください。"
                },
                "CREATE_TOKENS_MODAL_TITLE": {
                    "en": "Create Tokens and NFT's (ERC-20, ERC-721, ERC-1155)",
                    "ja": ""
                },
                "CREATE_ERC20": {
                    "en": "The standard crypto currency token to represent anything in the ethereum and EVM ecosystem. Fungible, easily transferable and supported by every platform. Choose this for your standard token utility.",
                    "ja": "イーサリアムおよびEVMエコシステム内のあらゆるものを表す標準の暗号通貨トークン。 代替可能で、簡単に譲渡可能で、あらゆるプラットフォームでサポートされています。 標準のトークン ユーティリティにはこれを選択してください。"
                },
                "CREATE_ERC721": {
                    "en": "The standard Non Fungive Token (NFT), used to represent unique assets in the ethereum and EVM ecosystem. Supported by all EVM marketplaces. Choose this when each item needs a truly unique representation.",
                    "ja": "標準の非菌類トークン (NFT)。イーサリアムおよび EVM エコシステム内の固有の資産を表すために使用されます。 すべての EVM マーケットプレイスでサポートされています。 各アイテムに真にユニークな表現が必要な場合は、これを選択します。"
                },
                "CREATE_ERC1155": {
                    "en": "A Hybrid Non Fungible Token that has unique top level tokens with fungible divisibility. Choose this if you want unique assets that can also have currency supply features. Supported by most major platforms.",
                    "ja": "代替可能な可分性を持つ独自のトップレベルのトークンを備えたハイブリッド非代替トークン。 通貨供給機能も備えた独自の資産が必要な場合は、これを選択します。 ほとんどの主要なプラットフォームでサポートされています。"
                },
                "CREATE_CHOOSE_FILE": {
                    "en": "Choose your creative media to upload.",
                    "ja": "アップロードするクリエイティブメディアを選択する。"
                },
                "CREATE_STEP_1": {
                    "en": "Step 1 - Upload Collection Image and Banner.",
                    "ja": "1 - コレクション画像とバナーをアップロードする。"
                },
                "CREATE_STEP_2": {
                    "en": "Step 2 - Define Collection.",
                    "ja": "2 - コレクションを定義します。"
                },
                "CREATE_STEP_3": {
                    "en": "Step 3 - Upload Creative Media.",
                    "ja": "3 - クリエイティブ メディアをアップロードする。"
                },
                "CREATE_STEP_4": {
                    "en": "Step 4 - Define NFT Properties.",
                    "ja": "4 - NFT プロパティを定義する。"
                },
                "CREATE_SPEND": {
                    "en": "Max Daily Spend",
                    "ja": "1日の最大支出"
                },
                "COLLECTION_NFTS_HEADER": {
                    "en": "NFT's in this Collection",
                    "ja": "このコレクションのNFT"
                },
                "PROFILE_COLLECTED_NFTS": {
                    "en": "Collected NFT's",
                    "ja": "購入したNFT"
                },
                "HOME_ABOUT_HEADING": {
                    "en": "About",
                    "ja": "について"
                },
                "HOME_ABOUT_HEADING_1": {
                    "en": "equityDAO ",
                    "ja": "インヴォーク・ネットワーク"
                },
                "HOME_HEADER_1": {
                    "en": "Join us in building a fair ads network that respects user privacy and rewards all.",
                    "ja": "ユーザーのプライバシーを尊重し、すべての人に報酬を与える公正な広告ネットワークを構築します。"
                },
                "HOME_HEADER_2": {
                    "en": "Protect your users privacy and monetize your platform with high performance ads.",
                    "ja": "ユーザーのプライバシーを保護し、高いパフォーマンスの広告でプラットフォームを収益化します。"
                },
                "HOME_HEADING_1_1": {
                    "en": "beyond.",
                    "ja": "未来を拓く。"
                },
                "LOGIN_ALREADY_REGISTERED_EMAIL": {
                    "en": "email registered",
                    "ja": "メールがすでに登録されています。"
                },
                "LOGIN_CONNECT": {
                    "en": "Login / Connect",
                    "ja": "ログイン / 接続"
                },
                "LOGIN_CONNECT_WALLET": {
                    "en": "Connect a Wallet",
                    "ja": "ウォレットを接続する"
                },
                "LOGIN_EMAIL_AVAILABLE": {
                    "en": "Email Available",
                    "ja": "メール利用可能"
                },
                "LOGIN_FAILED": {
                    "en": "Login Failed.",
                    "ja": "ログインできない"
                },
                "LOGIN_INVALID_EMAIL": {
                    "en": "Please enter a valid email address",
                    "ja": "有効なEメールアドレスを入力してください。"
                },
                "LOGIN_INVALID_PASSWORD": {
                    "en": "Please enter more than 6 password characters.",
                    "ja": "6文字以上のパスワードを入力してください。"
                },
                "LOGIN_OR_LOGIN": {
                    "en": "Or Login",
                    "ja": "またはログイン"
                },
                "SIGN_UP_WALLET_ADDRESS": {
                    "en": "Your Wallet Address",
                    "ja": "作成者（サインイン）のウォレットアドレス"
                },
                "SIGN_UP_WALLET_EXPLAIN": {
                    "en": "Please Login to set your wallet address.",
                    "ja": "ログインしてウォレットアドレスを設定してください"
                },
                "SIGN_UP_DOMAIN_EXPLAIN": {
                    "en": "Please enter alpha numeric characters between 2 and 20 characters.",
                    "ja": "（2文字以上20文字以内）※「\\」「?」「&」「%」などの記号は使用不可。"
                },
                "SIGN_UP_CHECK_ALL": {
                    "en": "Please ensure all fields are entered correctly.",
                    "ja": "すべてのフィールドが正しく入力されていることを確認してください。"
                },
                "LAZY_MINT_SIGN_ALL_NFTS": {
                    "en": "Lazy Mint In progress, please wait and sign ALL transactions. Each item needs to be signed.",
                    "ja": "Lazy Mint 進行中です。待ってからすべてのトランザクションに署名してください。 各項目には署名が必要です。"
                },
                "ADD_TO_CART" : {
                    "en": "Add to cart.",
                    "ja": "買い物かごに追加します."
                },
                "VAT_INCLUDED" : {
                    "en": "VAT included in selected territories.",
                    "ja": "消費税込み."
                },
                "SOLD_BY" : {
                    "en": "Sold by",
                    "ja": "選択した地域では消費税が含まれています。"
                },
                "STOCK_LEFT" : {
                    "en": "Stock left",
                    "ja": "在庫量"
                }, 
                "TEXT_ACCESS_NFT" : {
                    "en": "Access NFT",
                    "ja": "NFTにアクセスする"
                },
                "TEXT_MINT_MORE" : {
                    "en": "Mint Again",
                    "ja": "ミント・アゲイン"
                },
                "TEXT_TOKEN_MINTED" : {
                    "en": "Token Minted",
                    "ja": "トークン鋳造"
                },
                "TEXT_INSUFFICIENT_BALANCE" : {
                    "en": "Insufficient Balance",
                    "ja": "残高不足"
                },
                "TEXT_TOKEN_MINT_SUPPLY" : {
                    "en": "Token Mint Supply",
                    "ja": "トークンミントの供給"
                },
                "TEXT_NEXT" : {
                    "en": "Next",
                    "ja": "次"
                },
                "TEXT_PREV" : {
                    "en": "Previous",
                    "ja": "前の"
                },
                "TEXT_TOKEN_NAME" : {
                    "en": "Token Name",
                    "ja": "トークン名"
                },
                "TEXT_TOKEN_SYMBOL" : {
                    "en": "Symbol",
                    "ja": "シンボル"
                },
                "TEXT_ANOTHER_TOKEN" : {
                    "en": "Load Another Token",
                    "ja": "別のトークンをロードする"
                },
                "TEXT_TOKEN_SUPPLY" : {
                    "en": "Initial Supply",
                    "ja": "初期供給"
                },
                "TEXT_TOKEN_TO" : {
                    "en": "To Address",
                    "ja": "宛先アドレス"
                },
                "TEXT_TOKEN_ADDRESS" : {
                    "en": "Token Address",
                    "ja": "トークンアドレス"
                },
                "TEXT_TOKEN_AMOUNT" : {
                    "en": "Transfer Amount",
                    "ja": "払込金額"
                },
                "TEXT_SEND_TOKEN" : {
                    "en": "Send",
                    "ja": "トークンを送信する"
                },
                "TEXT_TOKEN_DESCRIPTION" : {
                    "en": "Token Description",
                    "ja": "トークンの説明"
                },
                "CREATE_ERC20_DEFINE" : {
                    "en": "Define Token Properties.",
                    "ja": "トークンのプロパティを定義します。"
                },
                "TEXT_CREATE_CRYPTO_TOKEN" : {
                    "en": "Create Cryptocurrency Token",
                    "ja": "暗号通貨トークンを作成する"
                },
                "TEXT_CREATE_TOKEN" : {
                    "en": "Create Token",
                    "ja": "トークンの作成"
                },
                "TEXT_TOKEN_NAME_PLACEHOLDER" : {
                    "en": "My Token",
                    "ja": "私のトークン"
                },
                "TEXT_TOKEN_SYMBOL_PLACEHOLDER" : {
                    "en": "MYT",
                    "ja": "MYT"
                },
                "TEXT_TOKEN_SUPPLYPLACEHOLDER" : {
                    "en": "1000000000",
                    "ja": "1000000000"
                },
                "TEXT_TOKEN_TO_PLACEHOLDER" : {
                    "en": "0x...",
                    "ja": "0x..."
                },
                "TEXT_TOKEN_ADDRESS_PLACEHOLDER" : {
                    "en": "0x...",
                    "ja": "0x..."
                },
                "TEXT_TOKEN_AMOUNT_PLACEHOLDER" : {
                    "en": "...",
                    "ja": "..."
                },
                "TEXT_TOKEN_DESCRIPTION_PLACEHOLDER" : {
                    "en": "My Token Description",
                    "ja": "このトークンは.."
                },
                "TEXT_MINT_SUPPLY" : {
                    "en": "Token Mint Supply",
                    "ja": "トークンミントの供給"
                },
                "TEXT_LANGUAGES" : {
                    "en": "Languages",
                    "ja": "言語"
                },
                "TEXT_LANG_CODE_EN" : {
                    "en": "English",
                    "ja": "英語"
                },
                "TEXT_LANG_CODE_ES" : {
                    "en": "Spanish",
                    "ja": "スペイン語"
                },
                "TEXT_LANG_CODE_JA" : {
                    "en": "Japanese",
                    "ja": "日本語"
                },
                "TEXT_LANG_CODE_ZH" : {
                    "en": "Chinese",
                    "ja": "中国語"
                },
                "TEXT_LANG_CODE_KO" : {
                    "en": "Korean",
                    "ja": "韓国語"
                },
                "TEXT_LANG_CODE_DE" : {
                    "en": "German",
                    "ja": "ドイツ語"
                },
                "TEXT_LANG_CODE_FR" : {
                    "en": "French",
                    "ja": "フランス語"
                },
                "TEXT_LANG_CODE_RU" : {
                    "en": "Russian",
                    "ja": "ロシア語"
                },
                "TEXT_LANG_CODE_UA" : {
                    "en": "Ukranian",
                    "ja": "ウクライナ語"
                },
                "TEXT_PRODUCTS" : {
                    "en": "Products",
                    "ja": "製品"
                },
                "TEXT_QUANTITY" : {
                    "en": "Quantity",
                    "ja": "製品の量"
                },
                "CREATE_PRODUCT_TITLE" : {
                    "en": "Define Product",
                    "ja": "製品を定義する"
                },
                "TEXT_PRODUCT_NAME" : {
                    "en": "Product Name",
                    "ja": "商品名"
                },
                "TEXT_PRODUCT_SYNOPSIS" : {
                    "en": "Product Synopsis.",
                    "ja": "製品概要"
                },
                "TEXT_PRODUCT_SYNOPSIS_PLACEHOLDER" : {
                    "en": "eg. Luxury Gold Necklace.",
                    "ja": "例えば。 高級感のあるゴールドのネックレス。"
                },
                "TEXT_PRODUCT_DESCRIPTION" : {
                    "en": "Product Description.",
                    "ja": "製品説明。"
                },
                "TEXT_CURRENCY" : {
                    "en": "Curreny.",
                    "ja": "通貨単位"
                },
                "TEXT_PRODUCT_PRICE" : {
                    "en": "Price",
                    "ja": "価格"
                },
                "TEXT_PRODUCT_STOCK" : {
                    "en": "Stock",
                    "ja": "在庫"
                },
                "TEXT_NEW_CUSTOMIZATION" : {
                    "en": "Customization Name.",
                    "ja": "属性名"
                },
                "TEXT_NEW_CUSTOMIZATION_PLACEHOLDER" : {
                    "en": "eg. size.",
                    "ja": "例えば。 サイズ"
                },
                "TEXT_ADD_CUSTOMIZATION" : {
                    "en": "Add",
                    "ja": "作成する"
                },
                "TEXT_PRICE_MOD" : {
                    "en": "Price Modification.",
                    "ja": "価格変更。"
                },
                "TEXT_PRICE_MOD_PLACEHOLDER" : {
                    "en": "0.00",
                    "ja": "0"
                },
                "TEXT_PRODUCT_VALUE_PLACEHOLDER" : {
                    "en": "22 inch (55cm)",
                    "ja": "22インチ(55cm)"
                },
                "TEXT_DELETE_PRODUCT" : {
                    "en": "Delete Product",
                    "ja": "製品を削除する"
                },
                "TEXT_ANOTHER_PRODUCT" : {
                    "en": "Load Another Product.",
                    "ja": "別の製品をロードする"
                },
                "TEXT_NEW_PRODUCT" : {
                    "en": "Add a New Product",
                    "ja": "新しい製品を追加する"
                },
                "TEXT_DETAILS" : {
                    "en": "Details",
                    "ja": "ディテール"
                },
                "TEXT_PUBLIC_MINT_LINK" : {
                    "en": "public minting link",
                    "ja": "お客様のミントリンク"
                },
                "TEXT_MINTED" : {
                    "en": "Minted",
                    "ja": "鋳造されました"
                },
                "TEXT_VOUCHER" : {
                    "en": "Voucher",
                    "ja": "バウチャー"
                },
                "TEXT_VOUCHER_DETAILS" : {
                    "en": "Voucher Details",
                    "ja": "バウチャーの詳細"
                },
                "TEXT_VOUCHER_DETAILS" : {
                    "en": "Voucher Details",
                    "ja": "バウチャーの詳細"
                },
                "TEXT_LAZY_MINT": {
                    "en": "Lazy Mint",
                    "ja": "レイジーミント"
                },
                "TEXT_ADDRESS": {
                    "en": "0x..",
                    "ja": "0x.."
                },
                "TEXT_LAST_PRICE": {
                    "en": "last price",
                    "ja": "最後の販売"
                },
                "TEXT_CONTENT": {
                    "en": "Content",
                    "ja": "コンテンツ"
                },
                "TEXT_FULLSCREEN": {
                    "en": "Fullscreen",
                    "ja": "全画面表示"
                },
                "TEXT_RESET": {
                    "en": "Reset",
                    "ja": "リセット"
                },
                "TEXT_IMAGE": {
                    "en": "Image",
                    "ja": "画像"
                },
                "TEXT_DOWNLOAD": {
                    "en": "Download",
                    "ja": "ダウンロード"
                },
                "TEXT_LOADING": {
                    "en": "Loading",
                    "ja": "ロードング"
                },
                "TEXT_NFT_SUPPLY_PLACEHOLDER": {
                    "en": "eg. 1",
                    "ja": "たとえば 1"
                },
                "TEXT_NFT_TRAIT_PLACEHOLDER": {
                    "en": "eg. item color",
                    "ja": "たとえばアイテムの色"
                },
                "TEXT_NFT_VALUE_PLACEHOLDER": {
                    "en": "eg. red",
                    "ja": "赤"
                },
                "TEXT_NFT_MINTPRICE_PLACEHOLDER": {
                    "en": "eg. 0.1",
                    "ja": "例えば。 0.1"
                },
                "TEXT_DOMAIN_PLACEHOLDER": {
                    "en": "Creator Domain",
                    "ja": "クリエイタードメイン"
                },
                "TEXT_COLLECTION_NAME_PLACEHOLDER": {
                    "en": "Collection Name",
                    "ja": "コレクション名"
                },
                "TEXT_COLLECTION_SYMBOL_PLACEHOLDER": {
                    "en": "Collection Ticker Symbol",
                    "ja": "コレクションティッカーシンボル"
                },
                "TEXT_COLLECTION_DESCRIPTION_PLACEHOLDER": {
                    "en": "Collection Description.",
                    "ja": "コレクションの説明"
                },
                "TEXT_PERMISSION_DENIED": {
                    "en": "Permission Denied",
                    "ja": "許可が拒否されました"
                },
                "TEXT_NFT_NAME_PLACEHOLDER": {
                    "en": "NFT Token name.",
                    "ja": "NFTトークンの名"
                },
                "TEXT_NFT_DESCRIPTION_PLACEHOLDER": {
                    "en": "NFT Token description.",
                    "ja": "NFTトークンの説明"
                },
                "TEXT_NFT_PROPERTIES_CONTENT_MEDIA": {
                    "en": "Media Content",
                    "ja": "メディアコンテンツ "
                },
                "TEXT_NFT_PROPERTIES_SECRET_TITLE": {
                    "en": "Content Media Passphrase",
                    "ja": "コンテンツ メディア パスフレーズ"
                },
                "TEXT_NFT_PROPERTIES_CONTENT": {
                    "en": "Media Content (eg epub / pdf)",
                    "ja": "メディアコンテンツ (epub / pdf など)"
                },
                "TEXT_NFT_PROPERTIES_SECRET": {
                    "en": "empty for open access",
                    "ja": "なしでは公開コンテンツです"
                },
                "TEXT_NFT_PROPERTIES_AUTHOR": {
                    "en": "Author",
                    "ja": "著者"
                },
                "TEXT_NFT_PROPERTIES_ISBN": {
                    "en": "ISBN",
                    "ja": "ISBN"
                },
                "TEXT_NFT_PROPERTIES_LANGUAGE": {
                    "en": "Language",
                    "ja": "言語"
                },
                "TEXT_NFT_PROPERTIES_EDITION": {
                    "en": "Edition No.",
                    "ja": "エディション番号"
                },
                "TEXT_NFT_PROPERTIES_CONTRIBUTORS": {
                    "en": "Contributors",
                    "ja": "貢献者"
                },
                "TEXT_NFT_PROPERTIES_EDITORS": {
                    "en": "Editors",
                    "ja": "編集者"
                },
                "TEXT_DOMAIN": {
                    "en": "Creator domain name",
                    "ja": "作成者のドメイン名"
                },
                "TEXT_SET_WALLET": {
                    "en": "Set Wallet (login)",
                    "ja": "ウォレットの設定（ログイン）"
                },
                "TEXT_SUBMIT": {
                    "en": "Submit",
                    "ja": "送信"
                },
                "TEXT_START": {
                    "en": "Start",
                    "ja": "スタート"
                },
                "TEXT_TRENDING_NFTS": {
                    "en": "Trending NFT's",
                    "ja": "トレンディングNFT"
                },
                "TEXT_FREEZING_METADATA": {
                    "en": "Freezing Metadata",
                    "ja": "メタデータの凍結"
                },
                "TEXT_PLEASE_WAIT": {
                    "en": "Please Wait..",
                    "ja": "お待ちください"
                },
                "TEXT_CHANGE_CHAIN": {
                    "en": "Change Chain",
                    "ja": "チェーンを変更"
                },
                "TEXT_CREATE_NFT": {
                    "en": "Create NFT",
                    "ja": "NFTを作る"
                },
                "CREATE_NFT_INVALID_DATA_SIZE": {
                    "en": "File too Large, maximum files size in 100MB",
                    "ja": "ファイルが大きすぎます。最大ファイルサイズは 100MB です"
                },
                "CREATE_NFT_INVALID_DATA_BOOK": {
                    "en": "Invalid file type, valid types are PDF and EPUB",
                    "ja": "無効なファイル タイプです。有効なタイプは PDF と EPUB です"
                },
                "TEXT_POST_UPDATE": {
                    "en": "Post Update",
                    "ja": "ブログを書く"
                },
                "TEXT_EDIT_SOCIAL": {
                    "en": "Edit Social",
                    "ja": "マイリンク"
                },
                "TEXT_WALLET": {
                    "en": "Wallet",
                    "ja": "ウォレット"
                },
                "TEXT_PROFILE": {
                    "en": "Profile",
                    "ja": "プロフィール"
                },
                "TEXT_ENTER_PRICE_PLACEHOLDER": {
                    "en": "Enter Price",
                    "ja": "価格"
                },
                "TEXT_WALLET_LOGIN": {
                    "en": "Wallet Login",
                    "ja": "ウォレットログイン"
                },
                "TEXT_SOLD": {
                    "en": "Sold",
                    "ja": "売約済み"
                },
                "TEXT_OPEN": {
                    "en": "Open",
                    "ja": "オープン"
                },
                "TEXT_OFFER": {
                    "en": "Offer",
                    "ja": "オファー"
                },
                "TEXT_BEST_OFFER": {
                    "en": "Best Offer",
                    "ja": "ベストオファー"
                },
                "ACCEPT_OFFER_LIST_FIRST": {
                    "en": "Please list this item beofre accepting an offer. This is required because equityDAO is a decentralized marketplace. We advise to list for a very large price to avoid an unwanted purchase. Then accept the original offer.",
                    "ja": "オファーを受ける前に、このNFTを出品してください。「equityDAO」は分散型マーケットプレイスであるため、必須となります。不要な購入を避けるために、非常に大きな価格で出品することをお勧めします。その後、元のオファーを受け入れてください。"
                },
                "TEXT_ACCEPT": {
                    "en": "Accept",
                    "ja": "アクセプト"
                },
                "TEXT_PLACE_OFFER": {
                    "en": "Place Offer",
                    "ja": "オファーする"
                },
                "TEXT_PRICE": {
                    "en": "Price",
                    "ja": "価格"
                },
                "TEXT_CHAIN": {
                    "en": "Chain",
                    "ja": "チェーン"
                },
                "TEXT_OFFER_PRICE": {
                    "en": "Offer Price",
                    "ja": "提供価格"
                },
                "TEXT_OFFERER": {
                    "en": "Offerer",
                    "ja": "提供者"
                },
                "TEXT_STATUS": {
                    "en": "Status",
                    "ja": "スターテス"
                },
                "TEXT_ACTION": {
                    "en": "Action",
                    "ja": "アクション"
                },
                "TEXT_ACCEPTED": {
                    "en": "ACCEPTED",
                    "ja": "受け入れられました"
                },
                "TEXT_SENT": {
                    "en": "Sent",
                    "ja": "送信しました"
                },
                "TEXT_BUY": {
                    "en": "Buy",
                    "ja": "買う"
                },
                "TEXT_SELL": {
                    "en": "List",
                    "ja": "売る"
                },
                "TEXT_DELIST": {
                    "en": "DeList",
                    "ja": "アンリスト"
                },
                "TEXT_COMING_SOON_HEADER": {
                    "en": "Launch Coming Soon",
                    "ja": "近日発売NFTコレクション"
                },
                "TEXT_COMING_SOON_TEXT": {
                    "en": "Buy and sell on Japans Premiere NFT marketplace",
                    "ja": "プレミアNFTマーケットプレイス"
                },
                "TEXT_ADD_TO_COLLECTION": {
                    "en": "Add To Collection",
                    "ja": "コレクションに追加します"
                },
                "TEXT_UPDATE_NFT_COLLECTION": {
                    "en": "Update Collection",
                    "ja": "コレクションを更新する"
                },
                "TEXT_ANOTHER_NFT": {
                    "en": "Load another NFT?",
                    "ja": "保存済みのデータを読み込みますか？"
                },
                "TEXT_BECOME_A_CREATOR": {
                    "en": "Become a creator",
                    "ja": "クリエイターになる"
                },
                "TEXT_WEBSITE": {
                    "en": "Website",
                    "ja": "Webサイト"
                },
                "TEXT_ABOUT": {
                    "en": "About",
                    "ja": "ギガー・ストーについて"
                },
                "TEXT_EMAIL": {
                    "en": "e-mail",
                    "ja": "Eメール"
                },
                "TEXT_EMAIL_PLACEHOLDER": {
                    "en": "Enter your e-mail.",
                    "ja": "Eメールアドレスを入力してください"
                },
                "TEXT_SNS": {
                    "en": "Social Media",
                    "ja": "SNS"
                },
                "TEXT_SNS_PLACEHOLDER": {
                    "en": "Enter Your Social Media / Portfolion link",
                    "ja": "SNSリンク"
                },
                "TEXT_V_TUBER": {
                    "en": "V-tuber",
                    "ja": "V-tuber"
                },
                "TEXT_MANGA": {
                    "en": "Manga",
                    "ja": "マンガ"
                },
                "TEXT_BOOK": {
                    "en": "Book",
                    "ja": "本"
                },
                "TEXT_MESSAGE_PLACEHOLDER": {
                    "en": "Please tell us about your project or concept, we would love to hear from you ! please include links that can help explain your idea.",
                    "ja": "ご自身の作品のコンセプト、アートワークに対する思いなどを教えてください。"
                },
                "TEXT_ANIME": {
                    "en": "Anime",
                    "ja": "アニメ"
                },
                "TEXT_ART": {
                    "en": "Art",
                    "ja": "美術"
                },
                "TEXT_GAME": {
                    "en": "Game",
                    "ja": "ゲーム"
                },
                "TEXT_GAMING": {
                    "en": "Gaming",
                    "ja": "ゲーム"
                },
                "TEXT_ID": {
                    "en": "Id",
                    "ja": "ID"
                },
                "TEXT_IDOL": {
                    "en": "Idol",
                    "ja": "アイドル"
                },
                "TEXT_GOTOCHI": {
                    "en": "Gotochi",
                    "ja": "ご当地"
                },
                "TEXT_LAUNCHPAD": {
                    "en": "Launchpad",
                    "ja": "発射台"
                },
                "TEXT_ACCOUNT": {
                    "en": "Account",
                    "ja": "アカウント"
                },
                "TEXT_ADVANCED": {
                    "en": "Advanced",
                    "ja": "アドバンスド"
                },
                "TEXT_ADVERT": {
                    "en": "Advert",
                    "ja": "広告"
                },
                "TEXT_AD_MEDIA": {
                    "en": "Media Format",
                    "ja": "広告メディア"
                },
                "TEXT_AGE": {
                    "en": "Age",
                    "ja": "年齢"
                },
                "TEXT_AGE_LOWER": {
                    "en": "From age",
                    "ja": "年齢から"
                },
                "TEXT_AGE_UPPER": {
                    "en": "To age",
                    "ja": "上の年齢"
                },
                "TEXT_AMOUNT": {
                    "en": "Amount",
                    "ja": "金高"
                },
                "TEXT_ASPECT_RATIO": {
                    "en": "Aspect Ratio",
                    "ja": "アスペクト比"
                },
                "TEXT_ATTRIBUTES": {
                    "en": "Attributes",
                    "ja": "属性"
                },
                "TEXT_AUDIENCE_TARGETING": {
                    "en": "Audience Targeting",
                    "ja": "オーディエンスターゲティング"
                },
                "TEXT_BALANCE": {
                    "en": "Balance",
                    "ja": "バランス"
                },
                "TEXT_CAMPAIGN": {
                    "en": "Campaign",
                    "ja": "キャンペーン編集"
                },
                "TEXT_COMPANY": {
                    "en": "Company",
                    "ja": "会社"
                },
                "TEXT_CONNECT": {
                    "en": "Connect",
                    "ja": "接続"
                },
                "TEXT_CONNECT_WALLET": {
                    "en": "Connect Wallet",
                    "ja": "ウォレットを接続する"
                },
                "TEXT_CONTACT": {
                    "en": "",
                    "ja": ""
                },
                "TEXT_COLLECTION": {
                    "en": "Collection",
                    "ja": "コレクション"
                },
                "TEXT_COLLECTION_NAME": {
                    "en": "Collection Name",
                    "ja": "コレクションの名"
                },
                "TEXT_COLLECTION_SYMBOL": {
                    "en": "Collection Symbol",
                    "ja": "コレクションのシンボル"
                },
                "TEXT_COLLECTION_DESCRIPTION": {
                    "en": "Collection Description",
                    "ja": "コレクションの説明"
                },
                "TEXT_NFT_NAME": {
                    "en": "NFT Name",
                    "ja": "NFTの名"
                },
                "TEXT_NFT_DESCRIPTION": {
                    "en": "NFT Description",
                    "ja": "NFTの説明"
                },
                "TEXT_NFT_SUPPLY": {
                    "en": "NFT Supply",
                    "ja": "NFT 供給"
                },
                "TEXT_NFT_MINTPRICE": {
                    "en": "NFT Mint Price (lazymint)",
                    "ja": "NFTミント価格（レイジーミント）"
                },
                "TEXT_MEDIA_TYPE": {
                    "en": "Media Type",
                    "ja": "メディアタイプ"
                },
                "TEXT_CATEGORY": {
                    "en": "Category",
                    "ja": "カテゴリー"
                },
                "CATEGORY_ART": {
                    "en": "Art",
                    "ja": "美術"
                },
                "CATEGORY_BOOK": {
                    "en": "Book",
                    "ja": "本"
                },
                "CATEGORY_MANGA": {
                    "en": "Manga",
                    "ja": "マンガ"
                },
                "CATEGORY_ANIME": {
                    "en": "Anime",
                    "ja": "アニメ"
                },
                "CATEGORY_MUSIC": {
                    "en": "Music",
                    "ja": "音楽"
                },
                "CATEGORY_GOTOCHI": {
                    "en": "Gotochi",
                    "ja": "ご当地"
                },
                "CATEGORY_GAME": {
                    "en": "Game",
                    "ja": "ゲーム"
                },
                "CATEGORY_IDOL": {
                    "en": "Idol",
                    "ja": "アイドル"
                },
                "CATEGORY_SPORT": {
                    "en": "Sport",
                    "ja": "スポーツ"
                },
                "CATEGORY_LAUNCHPAD": {
                    "en": "Launchpad",
                    "ja": "発射台"
                },
                "TEXT_TRAIT": {
                    "en": "Trait",
                    "ja": "特性"
                },
                "TEXT_TYPE": {
                    "en": "Type",
                    "ja": "タイプ"
                },
                "TEXT_VALUE": {
                    "en": "Value",
                    "ja": "バリュー"
                },
                "TEXT_LIST_FOR_SALE": {
                    "en": "List for sale.",
                    "ja": "売りに出す"
                },
                "TEXT_LIST_PRICE": {
                    "en": "List Price",
                    "ja": "価格"
                },
                "TEXT_LIST": {
                    "en": "List",
                    "ja": "リスト"
                },
                "TEXT_CREATIVE_DETAILS": {
                    "en": "Ad Details",
                    "ja": "広告の詳細"
                },
                "TEXT_UPLOAD_COLLECTION_POSTER": {
                    "en": "Collection Poster",
                    "ja": "コレクションポスター"
                },
                "TEXT_PASSPHRASE": {
                    "en": "Passphrase",
                    "ja": "パスワード"
                },
                "TEXT_DELETE": {
                    "en": "Delete",
                    "ja": "消去"
                },
                "TEXT_EXPLORE": {
                    "en": "Explore",
                    "ja": "探検する"
                },
                "TEXT_GENDER": {
                    "en": "Gender",
                    "ja": "性別"
                },
                "TEXT_HOME": {
                    "en": "Home",
                    "ja": "ホーム"
                },
                "TEXT_INITIAL_BALANCE": {
                    "en": "Initial Balance",
                    "ja": "財政収支"
                },
                "TEXT_INTERESTS": {
                    "en": "Interests",
                    "ja": "ご興味"
                },
                "TEXT_LANGUAGE": {
                    "en": "Language",
                    "ja": "言語"
                },
                "TEXT_LOCATION": {
                    "en": "Locations",
                    "ja": "場所"
                },
                "TEXT_LOGIN": {
                    "en": "Login",
                    "ja": "ログイン"
                },
                "TEXT_LOGOUT": {
                    "en": "Logout",
                    "ja": "ログアウト"
                },
                "TEXT_LOG_IN_WITH_METAMASK": {
                    "en": "Log in with metamask",
                    "ja": "メタマスクでサインアップ"
                },
                "TEXT_MEDIA": {
                    "en": "Media",
                    "ja": "メディ"
                },
                "TEXT_METAMASK": {
                    "en": "Metamask",
                    "ja": "Metamask"
                },
                "TEXT_NAME": {
                    "en": "Name",
                    "ja": "お名前"
                },
                "TEXT_NAME_PLACEHOLDER": {
                    "en": "Enter your name.",
                    "ja": "名前を入力してください"
                },
                "TEXT_OR": {
                    "en": "Or",
                    "ja": "それとも"
                },
                "TEXT_OR_EMAIL": {
                    "en": "Or Email",
                    "ja": "ヤ e-mail"
                },
                "TEXT_PRIVACY": {
                    "en": "Privacy",
                    "ja": "プライバシー"
                },
                "TEXT_PRODUCT": {
                    "en": "Product",
                    "ja": "製品"
                },
                "TEXT_REMOVE": {
                    "en": "Remove",
                    "ja": "消去"
                },
                "TEXT_RETRACT_OFFER": {
                    "en": "Cancel Offer",
                    "ja": "オファーをキャンセル"
                },
                "TEXT_REWARDS": {
                    "en": "Rewards",
                    "ja": "広告報酬"
                },
                "TEXT_SAVE": {
                    "en": "Save",
                    "ja": "保存"
                },
                "SAVE_MODAL_MESSAGE_SUCCESS": {
                    "en": "Saved Home Page Successfully",
                    "ja": "ホームページを保存しました"
                },
                "SAVE_MODAL_MESSAGE_FAILED": {
                    "en": "Unable to save, please check data and try again.",
                    "ja": "保存できません。データを確認して、もう一度お試しください。"
                },
                "TEXT_SAVE_CREATOR": {
                    "en": "Save",
                    "ja": "保存"
                },
                "TEXT_CREATE_NFT_COLLECTION": {
                    "en": "Create Collection",
                    "ja": "NFTコレクションを保存する"
                },
                "TEXT_BATCH_MINT": {
                    "en": "Lazy Mint",
                    "ja": "レイジーミント"
                },
                "TEXT_BATCH_MINT": {
                    "en": "Batch Mint",
                    "ja": "バッチミント"
                },
                "TEXT_MINT": {
                    "en": "Mint",
                    "ja": "ミント"
                },
                "TEXT_SEARCH": {
                    "en": "Search",
                    "ja": "検索"
                },
                "TEXT_SERVICES": {
                    "en": "Services",
                    "ja": "サービス"
                },
                "TEXT_SIGN_UP": {
                    "en": "Sign Up",
                    "ja": "送信する"
                },
                "TEXT_SIGN_UP_WITH_METAMASK": {
                    "en": "Sign up with metamask",
                    "ja": "メタマスクでサインアップ"
                },
                "TEXT_STAKING": {
                    "en": "Staking",
                    "ja": "ステーキング"
                },
                "TEXT_TOP_UP": {
                    "en": "Top Up",
                    "ja": "資金を追加する"
                },
                "TEXT_UPLOAD": {
                    "en": "Upload",
                    "ja": "アップロード"
                },
                "TEXT_UPLOAD_FILE": {
                    "en": "Upload file",
                    "ja": "アップロードファイル"
                },
                "TEXT_ENABLE": {
                    "en": "Enable",
                    "ja": "エネーブル"
                },
                "EBOOK_NO_READ": {
                    "en": "To read the ebook, you need to be the owner of the NFT, please buy or mint the NFT if you wish to read.",
                    "ja": "電子ブックを読むには、NFT の所有者である必要があります。読みたい場合は、NFT を購入またはミントしてください。"
                },
                "CREATE_STEP_5": {
                    "en": "Step 5 - Mint all your NFTs",
                    "ja": "ステップ5 - すべてのNFTを造幣局に預ける"
                },
                "MINT_FETCHING_METADATA_URL": {
                    "en": "Fetching Metadata URL",
                    "ja": "メタデータ URL を取得しています"
                },
                "MINT_PLEASE_ENSURE_A": {
                    "en": "Please ensure your metadata is correct.",
                    "ja": "メタデータが正しいことを確認してください。"
                },
                "MINT_PLEASE_ENSURE_B": {
                    "en": "After Minting is impossible to change your metadata.",
                    "ja": "「ミント」後はメタデータを変更できなくなります。"
                },
                "MINT_PLEASE_ENSURE_C": {
                    "en": "Please note that it can take several minutes for the NFT's to appear below, be careful not to mint again too soon to avoid duplicate NFTs as they can NOT be deleted.",
                    "ja": "NFT が以下に表示されるまでに数分かかる場合があることに注意してください。NFT は削除できないため、重複した NFT を避けるためにすぐに再鋳造しないように注意してください。"
                },
                "MINT_SUPPLY": {
                    "en": "Supply",
                    "ja": "在庫供給"
                },
                "BATCH_MINT_ABOUT": {
                    "en": "About Lazy Minting",
                    "ja": "レイジーミントについて"
                },
                "LAZY_MINT_ADVICE": {
                    "en": "With Lazy minting, you do not mint directly. Instead it creates 'vouchers' that other people can use to mint. This is usually the preferred option, because it means you don't pay the 'gas' fee upfront. Users will be able to mint directly from the URL listed below. You can manage these vouchers by clicking the manage voucher button, remember though once a user has minted a voucher, it can not be revoked.",
                    "ja": "遅延ミントは直接ミントしません。 他の人が鋳造に使用できる「バウチャー」を作成します。 これは、「ガス」料金を前払いする必要がないことを意味するため、通常は推奨されるオプションです。 ユーザーは以下の URL から直接ミントすることができます。 [バウチャーの管理] ボタンをクリックすると、これらのバウチャーを管理できます。 ユーザーがクーポンを発行すると、それを取り消すことはできません。"
                },
                "BATCH_MINT_ABOUT": {
                    "en": "About Batch Minting",
                    "ja": "バッチミン党について"
                },
                "BATCH_MINT_ADVICE": {
                    "en": "If you mint here you will pay for the minting 'Gas' fee and the NFT will be transfered directly to your wallet. This is a batch function, meaning all your NFT data above will be minted as separate NFTs. This can help avoid duplicates and the gas fee will be less than if you mint each NFT separately. If you just want to mint one NFT, we recommend you click the mint button in the card above instead. If you have any questions please contact support on discord.",
                    "ja": ""
                },
                "WALLET_UNSURE": {
                    "en": "Unsure which wallet ?",
                    "ja": "どの財布かわからない？"
                },
                "WALLET_ADVICE": {
                    "en": "For easiest access use MagicConnect to login with email or social. Metamask offers the best features but needs to be installed as a desktop plugin or on mobile via the metamask browser.",
                    "ja": "マジック(MagicConnect)は、メールやソーシャルメディアを使ってログインする、最もシンプルなオプションです。Metamaskは最も優れた機能を提供しますが、デスクトップのプラグインとしてモバイルにインストールする必要があり、metamaskブラウザを使用します。"
                },
                // Special store to keep language
                "VUE_APP_USER_LANGUAGE": ""
            })
        }
    );

export {translationStore};
