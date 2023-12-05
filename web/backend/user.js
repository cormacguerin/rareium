import postgres from "./postgres.js";

import mailgun from "./mailer.js";

import async_ from "async";

import crypto from "crypto";

import url from "url";

import {decrypt, encrypt} from "../aesgcm256.js";

import jwt from "jsonwebtoken";

import qs from "querystring";

const secret = new Buffer(
        "secret",
        "base64"
    ),
    mailer = new mailgun({}),
    pg = new postgres({"database": process.env.DATABASE}),

    userClients = {};


class User {

    clients = userClients;

    constructor () {

        this.authorize = this.authorize.bind(this);
        this.authorizeApi = this.authorize.bind(this);
        this.authenticate = this.authenticate.bind(this);
        this.getSigningKey = this.getSigningKey.bind(this);
        this.addVerifiedNewUser = this.addVerifiedNewUser.bind(this);
        this.addNewUser = this.addNewUser.bind(this);
        this.handleWeb3Signin = this.handleWeb3Signin.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.register = this.register.bind(this);
        this.isEmptyObject = this.isEmptyObject.bind(this);
        this.authorize = this.authorize.bind(this);
        this.genApiKey = this.genApiKey.bind(this);

    }

    isEmptyObject (obj) {

        for (const key in obj) {

            if (Object.hasOwn(
                obj,
                key
            )) {

                return false;

            }

        }
        return true;

    }

    /*
     * Load any previous user clients.
     */
    loadExistingSessions = function () {

        pg.getUserClients((err, clients) => {

            if (err) {

                console.log("unable to retrieve user_clients");
                console.log(err);

            }
            for (const i in clients) {

                if (!userClients[clients[i].user_id]) {

                    userClients[clients[i].user_id] = {};

                }
                userClients[clients[i].user_id][clients[i].client_id] = clients[i];

            }

        });

    };

    /*
     * A function to authenticate a client.
     * This will provide the client a valid token.
     * At this point we expect that the client has
     * already completed all authentication checks.
     * an unauthenticated client should never get
     * here.
     * user Id for regular accounts is an incremented
     * int in the postgres users table, for web3 users
     * it is their web3 address.
     */
    authenticate (user_id, req, res) {

        if (!user_id) {

            return;

        }
        const token = jwt.sign(
                user_id,
                secret
            ),
            client_id = this.genRandStr(),
            new_client = {
                "success": true,
                user_id,
                client_id,
                "account": null,
                "created": new Date(),
                "message": "authenticated with token!",
                token
            };
        if (!(user_id in userClients)) {

            console.log("New client Auth");
            userClients[user_id] = {};

        }
        if (!(client_id in userClients[user_id])) {

            console.log("New client Auth");
            userClients[user_id][client_id] = {};

        }
        userClients[user_id][client_id] = new_client;
        if (typeof res.cookie === "function") {

            res.cookie(
                "petcookie",
                new_client,
                {"httpOnly": true}
            );

        } else {

            console.log("something went wrong - res.cookie is not a function");
            res.status(401);
            res.json({
                "authorized": false
            });
            return;

        }
        pg.addUserClient(
            new_client,
            (e, r) => {

                if (e) {

                    console.log(e);
                    res.status(200);
                    res.json({
                        "authorized": false,
                        "message": e
                    });

                } else {

                    res.status(200);
                    res.json({
                        "authorized": true
                    });

                }


            }
        );

    }

    genRandStr () {

        return Math.round(36 ** 10 * Math.random()).toString(36);

    }


    genApiKey () {

        const e1 = Buffer.from(this.genRandStr()).toString("base64").
                substr(
                    0,
                    8
                ).
                toUpperCase(),
            e2 = Buffer.from(this.genRandStr()).toString("base64").
                substr(
                    0,
                    8
                ).
                toUpperCase(),
            e3 = Buffer.from(this.genRandStr()).toString("base64").
                substr(
                    0,
                    8
                ).
                toUpperCase(),
            e4 = Buffer.from(this.genRandStr()).toString("base64").
                substr(
                    0,
                    8
                ).
                toUpperCase();
        return `${e1}-${e2}-${e3}-${e4}`;

    }

    /*
     * Function to authorize user requests based
     * on a cookie/stored signed token.
     */
    authorize (req, res, next) {

        req.authorized = false;

        if (req.cookies.petcookie === undefined) {


        } else {

            var client_id,
                stored_token,
                token,
                user_id,
                client_id;

            try {


                /*
                 * Each request should supply a valid token and
                 * user id. If not bail.
                 */
                user_id = req.cookies.petcookie.user_id;
                token = req.cookies.petcookie.token;
                client_id = req.cookies.petcookie.client_id;
                if (!token || !user_id) {

                    console.log("missing token or user_id");

                }

            } catch (e) {

                return next(e);

            }

            /*
             * At this point we should have a token to test.
             * Grab the stored token for supplied user Id.
             * Test that the supplied token matches it. If not bail.
             */
            if (!userClients[user_id] || this.isEmptyObject(userClients[user_id])) {

                return next();

            }
            if (!userClients[user_id][client_id] || this.isEmptyObject(userClients[user_id][client_id])) {

                return next();

            }
            if (typeof userClients[user_id][client_id].token === "string") {

                stored_token = userClients[user_id][client_id].token;

            } else {

                return next();

            }
            if (stored_token === token) {

                /*
                 * Final step, verify the token. If invalid bail.
                 * If valid we proceed to next.
                 */
                jwt.verify(
                    token,
                    secret,
                    (err_, decoded) => {

                        if (err_) {

                            console.log("token verification failed");

                        } else {

                            req.decoded = decoded;
                            req.user_id = user_id;
                            req.client_id = client_id;

                            /*
                             * Each request should have a client_id for SSE
                             * If client supplies an unknown client_id, this might mean
                             * We have lost it for some reason, eg. server restart.
                             * In this case we should re-auth them.
                             */
                            if (req.user_id in userClients) {

                                req.authorized = true;

                            }

                        }

                    }
                );

            } else {

                console.log("stored token does not match user token");

            }

        }
        console.log(req.authorized);
        return next();

    }

    /*
     * Function to authorize api requests based on the api key and header signature.
     * This function retrieves scopes and adds them into the request but it does not
     * do any scope checking.
     * initially I thought it would be nice to do all the scope checking here but
     * I found that it makes it less versitile as different endpoints may want to do
     * different things. Instead it's the endpoints responsibility to refute if
     * req.scope is not satisfied.
     */
    authorizeApi = function (req, res, next) {

        const parsedurl = url.parse(
                req.url,
                true
            ),
            auth_re = /^LT-HMAC-SHA256 /gi,
            cred_re = /^Credential=/gi,
            head_re = /^SignedHeaders=/gi,
            sig_re = /^Signature=/gi;
        let key_datestamp, key_id, key_scope;

        if (authorization_header.match(auth_re)) {

            authcsv = authorization_header.replace(
                auth_re,
                ""
            );

        }
        const autharr = authcsv.split(",");
        let errors = [],
            authorization_header = req.headers.authorization,
            authcsv, client_signature, credential, signed_headers;
        if (autharr[0].match(
            cred_re,
            ""
        )) {

            credential = autharr[0].replace(
                cred_re,
                ""
            ).split("/");
            if (credential.length !== 4) {

                errors.push(`expected 4 components in credential ${credential.length} found )`);

            } else {

                key_id = credential[0];
                key_datestamp = credential[1];
                key_scope = credential[2];

            }

        } else {

            errors.push("credential not present in authorization header");

        }
        if (autharr[1].match(
            head_re,
            ""
        )) {

            signed_headers = autharr[1].replace(
                head_re,
                ""
            ).split(";");
            if (!(signed_headers.includes("content-type") && signed_headers.includes("date") && signed_headers.includes("host"))) {

                errors.push("signed headers must include at least \"content-type\", \"date\" and \"host\"");

            }

        } else {

            errors.push("signed headers not present in authorization header");

        }
        if (autharr[2].match(
            sig_re,
            ""
        )) {

            client_signature = autharr[2].replace(
                sig_re,
                ""
            );

        } else {

            errors.push("signature not present in authorization header");

        }
        // Process the method
        if (req.method !== "POST" && req.method !== "GET") {

            errors.push("only POST or GET is supported but neither was found in the request");

        }
        // Process headers (afaik javascript sorts objects by default in unicode points so no sorting to do.)
        let header_keys = Object.keys(req.headers),
            signed_headers_str = "";
        for (var i in signed_headers.sort()) {

            if (header_keys.includes(signed_headers[i]) === true) {

                const h = `${signed_headers[i]}:${req.headers[signed_headers[i]].toLowerCase()}\n`;
                signed_headers_str += h;

            } else {

                errors.push(`signed header ${signed_headers[i]}listed in the authorization header not found`);

            }

        }
        // Process the request parameters
        let query_parameters = "";
        for (var i in parsedurl.query) {

            const v = `${i}=${encodeURIComponent(parsedurl.query[i])}&`;
            query_parameters += v;

        }
        query_parameters = query_parameters.replace(
            /&$/,
            ""
        );

        // At this point we should be sure that the host header is present
        const {host} = req.headers;
        // Get the path and check that it maches the one sent in credentials
        if (!parsedurl.pathname) {

            errors.push(`bad path found, expected /<path> but found "${parsedurl.pathname}"`);

        }
        if (errors.length > 0) {

            res.status(403);
            return res.json({"error": errors});

        }
        errors = [];


        // Now build the signing string from the above information
        signing_string = `${req.method}\n${
            req.headers.host}\n${
            parsedurl.pathname}\n${
            query_parameters}\n${
            signed_headers_str}`;

        if (parsedurl.pathname === "testApiKey") {

            console.log("API debug info");
            console.log(" - credential key id");
            console.log(key_id);
            console.log(" - credential key datestamp");
            console.log(key_datestamp);
            console.log(" - credential key scope");
            console.log(key_scope);
            console.log(" - signing string");
            console.log(signing_string);

        }
        console.log(" - signing string");
        console.log(signing_string);
        // TODO add datetime window auth logic

        // Get the key details from the backend and authorize the request
        pg.getApiKeyById(
            key_id,
            function (errors, apiKey) {

                if (errors) {

                    res.status(403);
                    return res.json({"error": errors});

                }

                const signing_key = this.getSigningKey(
                        apiKey.key,
                        key_datestamp,
                        apiKey.name,
                        key_scope
                    ),
                    request_signature = this.hmac(
                        signing_key,
                        signing_string,
                        "hex"
                    );

                // Add the key into the request
                req.scope = apiKey.scope;

                console.log("signing_key hex");
                console.log(Buffer.from(
                    signing_key,
                    "utf8"
                ).toString("hex"));
                console.log("request_signature");
                console.log(request_signature);
                console.log("client_signature");
                console.log(client_signature);

                if (request_signature !== client_signature) {

                    res.status(403);
                    return res.json({"error": errors});

                }

                next();


            }
        );

    };

    getSigningKey = function (key_secret, key_datestamp, key_name, key_scope) {

        const kDate = this.hmac(
                `LT${key_secret}`,
                key_datestamp
            ),
            kName = this.hmac(
                kDate,
                key_name
            ),
            kScope = this.hmac(
                kName,
                key_scope
            ),
            kSigning = this.hmac(
                kScope,
                "lt_request"
            );
        return kSigning;

    };

    hmac = function (key, string, encoding) {

        return crypto.createHmac(
            "sha256",
            key
        ).update(
            string,
            "utf8"
        ).
            digest(encoding);

    };

    hash = function (string, encoding) {

        return crypto.createHash("sha256").update(
            string,
            "utf8"
        ).
            digest(encoding);

    };

    /*
     * Helper function to check if a value exists.
     * Provide table name and value;
     */
    valueExists = function (table, key, value, callback) {

        pg.checkTableForValue(
            table,
            key,
            value,
            (reply) => {

                if (reply) {

                    callback(true);

                } else {

                    callback(false);

                }

            }
        );

    };

    /*
     * Function to test if a user exists.
     * On success will proceed to add a new user and relay
     * the status of 'addNewUser' to the callback
     */
    addVerifiedNewUser = function (username, email, password, defaultview, callback) {

        async_.parallel(
            {
                "u" (callback_) {

                    this.valueExists(
                        "users",
                        "username",
                        username,
                        (response) => {

                            callback_(
                                null,
                                response
                            );

                        }
                    );

                },
                "e" (callback_) {

                    this.valueExists(
                        "users",
                        "email",
                        email,
                        (response) => {

                            callback_(
                                null,
                                response
                            );

                        }
                    );

                }
            },
            function (err, results) {

                if (results.u === true || results.e === true) {

                    console.log("user already exists");
                    callback("already_exists");

                } else if (results.u === false && results.e === false) {

                    console.log("proceed to add new user");
                    this.addNewUser(
                        username,
                        email,
                        password,
                        defaultview,
                        "",
                        "non-facebook-user",
                        "unconfirmed",
                        (response) => {

                            callback(response);

                        }
                    );

                } else {

                    callback("error something went wrong testing if user exists");

                }

            }
        );

    };

    /*
     * Function to add a new user.
     * On success callback will receive the new user id.
     */
    addNewUser = function (username, email, password, defaultview, facebook_user_id, facebookinfo, account_status, callback) {

        const confirm_code = this.genRandStr(),

            /*
             * Account_status = "confirmed";
             * confirm_code = "";
             * Assign a default color to the user
             */
            colors = [
                "#1258c7",
                "#560393",
                "#a30051",
                "#f40c26",
                "#fe8100",
                "#ffc300",
                "#2fb601",
                "#acd322",
                "#bfdc4c",
                "#34b5ec",
                "#fed93a",
                "#f00b7a",
                "#fea0d0",
                "#fb4e9b",
                "#8e76da",
                "#7659cc",
                "#5129b1",
                "#00c6bc",
                "#86e2df"
            ],
            color_code = colors[Math.floor(Math.random() * colors.length)],
            enc_data = JSON.stringify(encrypt(password));
        pg.addUser(
            username,
            email,
            enc_data,
            defaultview,
            facebook_user_id,
            facebookinfo,
            account_status,
            "individual",
            confirm_code,
            color_code,
            "user",
            (e, r) => {

                if (e) {

                    console.log(`err ${e}`);
                    callback();

                } else {

                    callback(r);

                }

            }
        );

    };

    /*
     * Endpoint and control to test if user/email exists.
     * Used for registration form validation.
     */
    checkUserEmail = function (req, res) {

        const queryData = url.parse(
            req.url,
            true
        ).query;
        if (queryData.username) {

            this.valueExists(
                "users",
                "username",
                queryData.username,
                (response) => {

                    if (response === false) {

                        res.setHeader(
                            "Content-Type",
                            "text/json"
                        );
                        res.setHeader(
                            "Access-Control-Allow-Origin",
                            "*"
                        );
                        res.send({"username": "available"});

                    } else {

                        res.setHeader(
                            "Content-Type",
                            "text/json"
                        );
                        res.setHeader(
                            "Access-Control-Allow-Origin",
                            "*"
                        );
                        res.send({"username": "exists"});

                    }

                }
            );

        } else if (queryData.email) {

            this.valueExists(
                "users",
                "email",
                queryData.email,
                (response) => {

                    if (response === false) {

                        res.setHeader(
                            "Content-Type",
                            "text/json"
                        );
                        res.setHeader(
                            "Access-Control-Allow-Origin",
                            "*"
                        );
                        res.send({"email": "available"});

                    } else {

                        res.setHeader(
                            "Content-Type",
                            "text/json"
                        );
                        res.setHeader(
                            "Access-Control-Allow-Origin",
                            "*"
                        );
                        res.send({"email": "exists"});

                    }

                }
            );

        }

    };

    /*
     * Endoint and control for user login.
     * Accepts email and password and if present attempt login.
     */
    login = function (req, res, next) {

        if (req.body.email && req.body.password) {

            this.valueExists(
                "users",
                "email",
                req.body.email,
                (response) => {

                    if (response === false) {

                        res.status(200);
                        res.setHeader(
                            "Content-Type",
                            "text/json"
                        );
                        res.send({"login": "failed"});

                    } else {

                        pg.getUserInfo(
                            req.body.email,
                            [
                                "id",
                                "password",
                                "account_status"
                            ],
                            (e, userinfo) => {

                                if (e) {

                                    res.status(200);
                                    res.setHeader(
                                        "Content-Type",
                                        "text/json"
                                    );
                                    res.send({"login": "failed"});
                                    return;

                                }
                                let password_data;
                                try {

                                    password_data = JSON.parse(userinfo.password);

                                } catch (e) {

                                    console.log(e);
                                    res.status(200);
                                    res.json({"login": "failed"});

                                }
                                if (Array.isArray(password_data)) {

                                    if (password_data.length === 3) {

                                        if (decrypt(password_data) === req.body.password) {

                                            if (userinfo.account_status === "confirmed") {

                                                console.log("login succeeded");
                                                this.authenticate(
                                                    userinfo.id,
                                                    req,
                                                    res
                                                );

                                            } else {

                                                res.status(200);
                                                res.json({"login": "failed"});

                                            }

                                        } else {

                                            res.status(200);
                                            res.json({"login": "failed"});

                                        }

                                    } else {

                                        res.status(200);
                                        res.json({"login": "failed"});

                                    }

                                } else {

                                    res.status(200);
                                    res.json({"login": "failed"});

                                }

                            }
                        );

                    }

                }
            );

        } else {

            res.status(200);
            res.json({"login": "failed"});

        }

    };


    /*
     * Endpoint and control for user registration.
     */
    register = function (req, res, next) {

        /*
         * Make sure user is not already registered,
         * Is not spam, has filled in information correctly.
         */
        console.log("register attempt");
        let email,
            language,
            password,
            username;
        if (req.body.email && req.body.password) {

            email = req.body.email;
            username = req.body.email;
            password = req.body.password;
            language = req.body.language;
            message = req.body.text;

        } else {

            res.status(400);
            res.send("Invalid register request.");
            return;

        }
        if (!language) {

            language = "en";

        }
        // Silently add contact message
        if (message) {

            pg.contact(
                email,
                message,
                (e, r) => {

                    if (e) {

                        console.log(e);

                    }

                }
            );

        }

        // We can have users, publishers and advertisers
        const defaultview = "user";

        this.addVerifiedNewUser(
            username,
            email,
            password,
            defaultview,
            (response) => {

                // The response is the new user id
                if (response === parseInt(
                    response,
                    10
                )) {

                    /*
                     * If the response looks valid then send the confirmation email.
                     * The confirmation email needs send the code for addNewUser so retrieve that first.
                     */
                    pg.getUserInfo(
                        email,
                        ["confirm_code"],
                        (e, userinfo) => {

                            if (userinfo.confirm_code) {

                                const url = "https://equitydao.earth/confirmemail?" +
                                    `email=${email}&code=${userinfo.confirm_code}`;
                                switch (language) {

                                case "en":
                                    var mail = {
                                        "from": "noreply@equitydao.earth",
                                        "to": email,
                                        "subject": "Confirm your new account",
                                        "html": "<html>" +
                                            "Thank your for Registering." +
                                            "To confirm your account please access the following link." +
                                            "<br>" +
                                            `<a href="${url}">${url}</a>` +
                                            "<br>" +
                                            "</html>"
                                    };
                                    break;
                                case "ja":
                                    var mail = {
                                        "from": "support@equitydao.earth",
                                        "to": email,
                                        "subject": "equitydao.earth アカウントの確認",
                                        "html": "<html>" +
                                            "ご登録ありがとうございました。" +
                                            "お手数ですが、リンクをクリックして登録を完了してください。" +
                                            "<br>" +
                                            `<a href="${url}">${url}</a>` +
                                            "<br>" +
                                            "</html>"
                                    };
                                    break;

                                }
                                mailer.sendMail(mail);
                                pg.addToMailQueue(
                                    email,
                                    JSON.stringify(mail),
                                    (e, r) => {

                                        if (e) {

                                            console.log(e);
                                            console.log("user added but unable to add email to mail queue");
                                            res.status("401");
                                            res.json({"status": "failed"});


                                        } else {

                                            res.status("200");
                                            res.json({"status": "success"});


                                        }

                                    }
                                );

                            } else {

                                console.log("user added but unable to send email");
                                res.status("401");
                                res.json({"status": "failed"});


                            }

                        }
                    );

                } else if (response === "already_exists") {

                    res.status("401");
                    res.json({"status": "exists"});


                } else {

                    console.log("unable to add new USER");
                    res.status("401");
                    res.json({"status": "failed"});


                }

            }
        );

    };

    /*
     * Endpoint to request reset a user password
     */
    forgotPassword = function (req, res, next) {

        const queryData = url.parse(
            req.url,
            true
        ).query;
        console.log("reset user password attempt");
        let {email} = queryData,
            {language} = queryData;
        if (!email) {

            res.status(400);
            res.send("Invalid reset password request.");
            return;

        }
        if (!language) {

            language = "en";

        }
        const confirm_code = this.genRandStr();
        pg.resetConfirmCode(
            email,
            confirm_code,
            (response) => {

                const email_ = email;
                if (response === true) {

                    pg.getUserInfo(
                        email_,
                        ["confirm_code"],
                        (e, userinfo) => {

                            if (userinfo) {

                                if (userinfo.confirm_code) {

                                    const url = "https://<DOMAIN>/?action=resetpassword&" +
                                        `email=${email_}&code=${userinfo.confirm_code}`;
                                    switch (language) {

                                    case "en":
                                        mail = {
                                            "from": "noreply@<DOMAIN>",
                                            "to": email_,
                                            "subject": "Reset password request for account at <DOMAIN>",
                                            "html": "<html>" +
                                                "Hi" +
                                                "<br>" +
                                                "If you made this request please access the following link to reset your password." +
                                                "<br>" +
                                                `<a href="${url}">${url}</a>` +
                                                "<br>" +
                                                "If you did NOT request a new password, ignore this email and your password will remain unchanged." +
                                                "Questions? Contact us at <a href=\"mailto:support@<DOMAIN>\">support@<DOMAIN></a>" +
                                                "</html>"
                                        };
                                        break;

                                    }
                                    mailer.sendMail(mail);
                                    pg.addToMailQueue(
                                        email_,
                                        JSON.stringify(mail),
                                        (e, r) => {

                                            if (e) {

                                                console.log(e);
                                                res.status("401");
                                                res.json({"status": "failed",
                                                    "message": e});


                                            } else {

                                                res.status("200");
                                                res.json({"status": "success"});


                                            }

                                        }
                                    );

                                } else {

                                    console.log("unable to reset password");
                                    res.status("200");
                                    res.json({"status": "failed"});


                                }

                            } else {

                                console.log("unable to reset password");
                                res.status("200");
                                res.json({"status": "failed"});


                            }

                        }
                    );

                } else {

                    console.log("unable to reset password");
                    res.status("200");
                    res.json({"status": "failed"});


                }

            }
        );

    };

    /*
     * Endpoint to reset a user password
     */
    resetPassword = function (req, res, next) {

        const queryData = url.parse(
            req.url,
            true
        ).query;
        console.log("reset user password attempt");
        let {email} = queryData,
            {password} = queryData,
            {confirm_code} = queryData;
        if (!(email && password && confirm_code)) {

            res.status(200);
            res.json({"status": "failed"});
            return;

        }
        if (password.length < 6) {

            res.status(200);
            res.json({"status": "failed"});
            return;

        }
        const enc_data = JSON.stringify(encrypt(password));
        pg.resetPassword(
            email,
            enc_data,
            confirm_code,
            (response) => {

                if (response === true) {

                    res.status("200");
                    res.json({"status": "success"});


                } else {

                    console.log("unable to reset password");
                    res.status("200");
                    res.json({"status": "failed"});


                }

            }
        );

    };

    /*
     * Endpoint confirming email (last step for user registration).
     */
    confirmEmail = function (req, res, next) {

        const queryData = url.parse(
                req.url,
                true
            ).query,
            {code} = queryData,
            {email} = queryData;

        if (!email && !code) {

            console.log("missing email and/or code");
            res.status(401);
            res.json({
                "error": "failed to confirm registration"
            });
            return;

        }
        pg.getUserInfo(
            email,
            [
                "id",
                "account_status",
                "confirm_code"
            ],
            (e, userinfo) => {

                const res_ = res;
                if (e) {

                    console.log(`err ${e}`);
                    res_.status(200);
                    res_.json({
                        "status": "failed"
                    });


                } else if (userinfo.confirm_code === code) {

                    pg.confirmUser(
                        userinfo.id,
                        (e, r) => {

                            if (e) {

                                console.log(`err ${e}`);
                                res_.status(200);
                                res_.json({
                                    "status": "failed"
                                });

                            } else {

                                res_.writeHead(
                                    301,
                                    {"Location": "https://www.equitydao.earth?ha=login"}
                                );
                                res_.end();

                                /*
                                 *Res_.status(200);
                                 *res_.json({
                                 *    status: "success"
                                 *});
                                 */

                            }

                        }
                    );

                } else {

                    res_.status(200);
                    res_.json({
                        "status": "failed"
                    });

                }

            }
        );

    };


    logout = function (req, res, next) {

        if (!req.user_id && !req.client_id) {

            res.send(503);
            return;

        }
        let user_clients;
        if (req.user_id in userClients) {

            // Remove from db
            if (!this.isEmptyObject(userClients[req.user_id])) {

                // TODO delete user client
                pg.removeUserClient(
                    userClients[req.user_id][req.client_id],
                    (e, r) => {

                        if (e) {

                            console.log(`unable to set user clients ${user_clients}`);
                            console.log(e);
                            res.sendStatus(503);

                        } else {

                            // Remove the active object
                            delete userClients[req.user_id][req.client_id];
                            // Logout this users cookie session.
                            console.log(`user id ${req.user_id} loggedout`);
                            res.cookie(
                                "petcookie",
                                "",
                                {"expires": new Date()}
                            );
                            res.status(200);
                            res.json({
                                "authorized": false,
                                "message": "logged out"
                            });

                        }


                    }
                );

            } else {

                res.status(200);
                res.json({
                    "authorized": false,
                    "message": "logged out"
                });


            }

        } else {

            // shuold not get here
            res.status(400);
            res.json({
                "authorized": false,
                "message": "contact support"
            });

        }

    };


    /*
     * Function to get the username from a user id.
     */
    getNameFromId = function (req, res, next) {

        let queryData = url.parse(
                req.url,
                true
            ).query,
            user_id;
        if (typeof queryData.user_id === "undefined" || !queryData.user_id) {

            user_id = req.user_id;

        } else if (Number.isInteger(parseInt(queryData.user_id))) {

            user_id = queryData.user_id;

        } else {

            res.status(200);
            res.send("invalid request");
            return;

        }
        pg.getUsernameFromId(
            user_id,
            (e, r) => {

                if (e) {

                    res.status(404);
                    res.send({"error": "error in user exists (get users)"});

                } else {

                    res.status(200);
                    if (r) {

                        res.send({"username": r});

                    } else {

                        res.send({"username": ""});

                    }

                }

            }
        );

    };

    _getNameFromId = function (user_id, callback) {

        if (!Number.isInteger(parseInt(user_id))) {

            callback();

        } else {

            pg.getUsernameFromId(
                user_id,
                (e, u) => {

                    if (e) {

                        callback(
                            e,
                            null
                        );

                    } else {

                        callback(
                            null,
                            u
                        );

                    }

                }
            );

        }

    };

    /*
     * Given a list of user ids, send a list of ids with names.
     */
    getUsersList = function (req, res, next, list) {

        pg.getUsernamesFromIds(
            list,
            (e, r) => {

                if (e) {

                    console.log(e);
                    res.json({"status": "failed",
                        "error": e});

                } else {

                    res.json(r);

                }

            }
        );

    };

    /*
     * Function to get the authenticated status for a user.
     */
    getUserInfo = function (req, res, next) {

        if (req.user_id) {

            pg.getUserInfo(
                req.user_id,
                [
                    "default_view",
                    "username",
                    "color_code",
                    "email",
                    "admin",
                    "creator"
                ],
                (e, userinfo) => {

                    console.log(userinfo);

                    if (e) {

                        res.status(500);
                        res.json({
                            "user_id": req.user_id,
                            "clientid": req.client_id,
                            "authorized": false,
                            "defaultview": "guest",
                            "engagement": req.engagement_hash,
                            "language": req.language,
                            "region": req.region,
                            "admin": false,
                            "creator": false,
                            "message": "token verified"
                        });

                    } else {

                        res.status(200);
                        res.json({
                            "user_id": req.user_id,
                            "clientid": req.client_id,
                            "authorized": true,
                            "defaultview": userinfo.default_view,
                            "engagement": req.engagement_hash,
                            "language": req.language,
                            "region": req.region,
                            "username": userinfo.username,
                            "email": userinfo.email,
                            "color_code": userinfo.color_code,
                            "accounts": userinfo.accounts,
                            "admin": userinfo.admin,
                            "creator": userinfo.creator,
                            "message": "token verified"
                        });

                    }

                }
            );

        } else {

            res.status(200);
            res.json({
                "user_id": "",
                "authorized": false,
                "message": "not authorized",
                "selectedview": "",
                "engagement": req.engagement_hash,
                "language": req.language,
                "region": req.region,
                "admin": false,
                "creator": false,
                "defaultview": "guest"
            });

        }

    };

    getMailQueueLength = function (callback) {

        pg.getMailQueueLength((e, r) => {

            if (e) {

                console.log(`error ? ${e}`);
                callback(0);

            } else if (r) {

                callback(r);

            } else {

                callback(0);

            }

        });

    };

    getFromMailQueue = function (callback) {

        pg.getFromMailQueue((e, r) => {

            if (e) {

                console.log(`error ? ${err}`);
                callback();

            } else if (r) {

                callback(r);

            } else {

                callback();

            }

        });

    };

    setMailQueueStatus = function (email, status) {

        pg.setMailQueueStatus(
            email,
            status,
            (e, r) => {

                if (e) {

                    console.log(`error ? ${err}`);
                    callback();

                }

            }
        );

    };

    isCreator = function (req, callback) {

        pg.getUserInfo(
            req.user_id,
            ["creator"],
            (e, userinfo) => {

                console.log("userinfo");
                console.log(userinfo);

                if (e) {

                    console.log(e);
                    callback(false);

                } else if (!userinfo) {

                    callback(false);

                } else {

                    callback(userinfo.creator);

                }

            }
        );

    };

    isAdmin = function (req, callback) {

        pg.getUserInfo(
            req.user_id,
            ["admin"],
            (e, userinfo) => {

                if (e) {

                    console.log(e);
                    callback(false);

                } else {

                    callback(userinfo.admin);

                }

            }
        );

    };

    /*
     * Set user email
     */
    setUserMail = function (req, res, next) {

        const queryData = url.parse(
                req.url,
                true
            ).query,
            {email} = queryData;
        pg.setUserMail(
            req.user_id,
            email,
            (e, r) => {

                if (e) {

                    console.log(e);
                    res.json({"email": "exists"});

                } else {

                    res.status(200);
                    res.json({"email": "success"});

                }

            }
        );

    };

    saveAccountDetails = function (req, res) {

        console.log("save account details req.body");
        console.log(JSON.stringify(req.body));
        const data = req.body,
            {bank_name} = data,
            {branch_name} = data,
            {holder_address_1} = data,
            {holder_address_2} = data,
            {holder_city} = data,
            {holder_country} = data,
            {holder_name} = data,
            {holder_zip_code} = data,
            {number} = data,
            {sort_code} = data,
            {type} = data;
        pg.saveAccount(
            req.user_id,
            bank_name,
            branch_name,
            holder_address_1,
            holder_address_2,
            holder_city,
            holder_country,
            holder_name,
            holder_zip_code,
            number,
            sort_code,
            type,
            (e, r) => {

                if (e) {

                    console.log(e);
                    res.json({"email": "exists"});

                } else {

                    res.status(200);
                    res.json({"email": "success"});

                }

            }
        );

    };

    /*
     * Attempt to log in a web3 account locally and create one if it does not exist.
     *
     * @inputs.
     * address - web3 eth address
     * engagement_hash - a hash representing thet user (browser / network signals)
     * geoIp - geoIp
     *
     * @returns
     * user_id - a userid from the users table to uniquely reprersent a user.
     */
    handleWeb3Signin = function (address, engagement_hash, geoIp, callback) {

        this.getAccountsByAddress(
            address,
            (e, r) => {

                if (e) {

                    console.log(e);
                    callback();
                    return;

                }

                if (r.length > 0) {

                    /*
                     * In this scenario this address has already been registered.
                     * TODO : It's possible that someone will sign up the same address to
                     * different accounts, we should have some mechanism where they can merge or view these
                     * For now we will just take the first associated account id.
                     */
                    callback(r[0].user_id);

                } else {

                    // In this scenario we have a new address
                    const mail = `${address}@equitydao.earth`;
                    this.addNewUser(
                        address,
                        mail,
                        "",
                        "",
                        "",
                        "non-facebook-user",
                        "confirmed",
                        (user_id) => {

                            if (Number.isInteger(parseInt(user_id))) {

                                // finally add the associated user account address
                                pg.addUserAccount(
                                    user_id,
                                    address,
                                    null,
                                    engagement_hash,
                                    geoIp,
                                    (e, r) => {

                                        if (e) {

                                            // something went wrong, return null
                                            console.log(e);
                                            callback();

                                        }

                                        callback(user_id);

                                    }

                                );

                            } else {

                                // we should never get here (remove?)
                                callback();

                            }

                        }

                    );

                }

            }
        );

    };

    /*
     * get the web3 accounts associated with an address
     */
    getAccountsByAddress = function (address, callback) {

        pg.getAccountsByAddress(
            address,
            (e, account) => {

                callback(
                    e,
                    account
                );

            }
        );

    };

    /*
     * get the web3 accounts associated with a user id
     */
    getAccountsById = function (user_id, callback) {

        pg.getAccountById(
            user_id,
            (e, account) => {

                callback(
                    e,
                    account
                );

            }
        );

    };

}

const user = new User();

export default user;
