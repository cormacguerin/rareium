/*
 * Wrapper for Postgres.
 */

import dotenv from "dotenv";
import * as pg from "pg";
const {Pool} = pg.default;
import fs from "fs";

class Postgres {

    constructor (db) {

        if (db) {

            if (db.database === process.env.DATABASE) {

                this.pool = new Pool({
                    "user": "postgres",
                    "host": "localhost",
                    "database": process.env.DATABASE,
                    "password": process.env.DATABASE_PASSWORD,
                    "port": 5432,
                    "idleTimeoutMillis": 60000
                });

            } else {

                this.pool = new Pool({
                    "user": "postgres",
                    "host": "localhost",
                    "database": db.database,
                    "password": db.password,
                    "port": 5432
                });

            }

            this.pool.on(
                "error",
                (err, client) => {

                    console.error(
                        "Unexpected error on idle client",
                        err
                    );
                    process.exit(-1);

                }
            );

            this.pool.query(
                "SELECT NOW()",
                (err, res) => {

                    console.log(
                        err,
                        res
                    );
                    // This.pool.end()

                }
            );

            this.logger = fs.createWriteStream(
                "postgres_write.log",
                {
                    "flags": "a" // 'a' means appending (old data will be preserved)
                }
            );

        }

    }

    execute (statement, values, callback) {

        console.log("statement");
        console.log(statement);
        console.log("values");
        console.log(values);
        (async () => {

            const client = await this.pool.connect();
            try {

                const reply = await client.query(
                    statement,
                    values
                );
                this.logger.write(`${statement}\n`);
                console.log("reply");
                console.log(reply);
                callback(
                    null,
                    reply.rows
                );

            } finally {

                client.release();

            }

        })().catch((e) => {

            console.log(e.stack);
            callback(e);

        });

    }

    /*
     * Same as above, but in row mode array
     */
    raexecute (statement, values, callback) {

        const query = {
            "text": statement,
            values,
            "rowMode": "array"
        };
        (async () => {

            const client = await this.pool.connect();
            try {

                const reply = await client.query(query);
                this.logger.write(`${statement}\n`);
                callback(
                    null,
                    reply.rows
                );

            } finally {

                client.release();

            }

        })().catch((e) => {

            console.log(e.stack);
            callback(e);

        });

    }

    batch_execute (statement, values, callback) {

        console.log('batch_execute statement');
        console.log(statement);
        (async () => {

            this.logger.write(`${statement}\n`);
            const client = await this.pool.connect();
            try {

                await client.query("BEGIN");
                const promises = [],
                    promisePush = async function () {

                        var it = new Date().getTime();
                        for (const v in values) {

                            for (const x in values[v]) {

                                /*
                                 * Console.log(values[v][x]);
                                 * Set empty stuff to null
                                 */
                                if (values[v][x] === "") {

                                    values[v][x] = null;

                                }

                            }

                            console.log('values')
                            console.log(values)

                            promises.push(client.query(
                                statement,
                                Object.values(values[v])
                            ));

                        }
                        const et = new Date().getTime(),
                            totaltime = et - it;
                        console.log(`promises pushed in ${totaltime}ms`);
                        var it = new Date().getTime();
                        await Promise.all(promises).
                            then((r) => {

                                console.log("primises done, commit");
                                client.query("COMMIT");
                                //client.release();
                                const et = new Date().getTime(),
                                    totaltime = et - it;
                                console.log(`promises finished in ${totaltime}ms`);
                                callback(
                                    null,
                                    r
                                );

                            }).
                            catch((e) => {

                                console.log("error pushing statements");
                                console.log(e);
                                client.query("ROLLBACK");
                                //client.release();
                                callback(e);

                            });

                    };
                promisePush();

            } catch (e) {

                console.log("error in rollback");
                console.log(e);
                await client.query("ROLLBACK");

            } finally {

                console.log("finally");
                client.release();

            }

        })().catch((e) => {

            console.log(e.stack);
            callback(e);

        });

    }

    end () {

        this.pool.end();

    }

    /*
     * User Functions
     */
    addUser (username, email, password, default_view, facebook_user_id, facebook_info, account_type, account_status, confirm_code, color_code, role, callback) {

        const query = "INSERT INTO users(username, email, password, default_view, facebook_user_id, facebook_info, account_type, account_status, confirm_code, color_code, role, created_date)" +
                " VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id;";
        this.execute(
            query,
            [
                username,
                email,
                password,
                default_view,
                facebook_user_id,
                facebook_info,
                account_status,
                account_type,
                confirm_code,
                color_code,
                role,
                new Date().getTime()
            ],
            (e, r) => {

                if (e) {

                    callback(e);

                } else {

                    callback(
                        null,
                        r[0].id
                    );

                }

            }
        );

    }

    confirmUser (user_id, callback) {

        const query = "UPDATE users SET account_status = 'confirmed' WHERE id = $1;";
        this.execute(
            query,
            [user_id],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }
        );

    }

    resetConfirmCode (email, confirm_code, callback) {

        const query = "UPDATE users SET confirm_code = $1 WHERE email = $2;";
        this.execute(
            query,
            [
                confirm_code,
                email
            ],
            (e, r) => {

                if (e) {

                    callback(false);

                } else {

                    callback(true);

                }

            }
        );

    }

    resetPassword (email, password, confirm_code, callback) {

        const query = "UPDATE users SET password = $1 WHERE email = $2 AND confirm_code =  $3;";
        this.execute(
            query,
            [
                password,
                email,
                confirm_code
            ],
            (e, r) => {

                if (e) {

                    callback(false);

                } else {

                    callback(true);

                }

            }
        );

    }

    getUserClients (callback) {

        const query = "SELECT * FROM user_clients;";
        this.execute(
            query,
            null,
            (e, r) => {

                callback(
                    e,
                    r
                );

            }
        );

    }

    checkTableForValue (table, column, value, callback) {

        const query = `SELECT COUNT(${column}) FROM ${table} WHERE ${column} = '${value}';`;
        this.execute(
            query,
            null,
            (e, r) => {

                if (e) {

                    console.log(e);
                    callback(false);

                } else if (parseInt(r[0].count) > 0) {

                    callback(true);

                } else {

                    callback(false);

                }

            }
        );

    }

    addUserClient (client, callback) {

        const query = "INSERT INTO user_clients (client_id, user_id, success, token, message, created_date, active_date)" +
                  " VALUES($1,$2,$3,$4,$5,$6,$7)" +
                  " ON CONFLICT (user_id, client_id) DO UPDATE SET" +
                  " active_date = $7," +
                  " token = $4," +
                  " message = $5;";
        this.execute(
            query,
            [
                client.client_id,
                client.user_id,
                client.success,
                client.token,
                client.message,
                new Date().getTime(),
                new Date().getTime()
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }
        );

    }

    removeUserClient (client, callback) {

        const query = "DELETE FROM user_clients WHERE client_id = $1 AND user_id = $2;";
        this.execute(
            query,
            [
                client.client_id,
                client.user_id
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }
        );

    }

    setEmail (user_id, email, callback) {

        const query = "UPDATE users SET email = $2 WHERE id = $1;";
        this.execute(
            query,
            [user_id, email],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }
        );

    }

    getUserInfo (key, values, callback) {

        let query;
        if (Number.isInteger(parseInt(key))) {

            query = `SELECT ${values.join(",")}, ARRAY_AGG(accounts.address) AS accounts FROM users FULL OUTER JOIN accounts ON users.id = accounts.user_id WHERE users.id = '${key}' GROUP BY id;`;

        } else {

            query = `SELECT ${values.join(",")}, ARRAY_AGG(accounts.address) AS accounts FROM users FULL OUTER JOIN accounts ON users.id = accounts.user_id WHERE users.email = '${key}' GROUP BY id;`;

        }
        console.log(query);
        this.execute(
            query,
            null,
            (e, r) => {

                if (r) {

                    if (r[0]) {

                        callback(
                            e,
                            r[0]
                        );

                    } else {

                        callback(
                            e,
                            null
                        );

                    }

                } else {

                    callback(
                        e,
                        null
                    );

                }

            }
        );

    }

    getUsernameFromId (user_id, callback) {

        if (Number.isInteger(parseInt(user_id))) {

            const query = "SELECT username FROM users WHERE id =  $1;";
            this.execute(
                query,
                [user_id],
                (e, r) => {

                    if (r) {

                        if (r[0]) {

                            callback(
                                e,
                                r[0].username
                            );

                        } else {

                            callback(
                                e,
                                null
                            );

                        }

                    } else {

                        callback(
                            e,
                            null
                        );

                    }

                }
            );

        }

    }

    getUserIdFromFacebookId (facebook_user_id, callback) {

        const query = "SELECT id FROM users WHERE facebook_user_id = $1;";
        this.execute(
            query,
            [facebook_user_id],
            (e, r) => {

                if (r) {

                    if (r[0]) {

                        callback(
                            e,
                            r[0].id
                        );

                    } else {

                        callback(
                            e,
                            null
                        );

                    }

                } else {

                    callback(
                        e,
                        null
                    );

                }

            }
        );

    }

    getUsernamesFromIds (list, callback) {

        let listString;
        if (list) {

            if (list.length > 1) {

                listString = list.join("','");

            } else {

                listString = list;

            }

        } else {

            callback();

        }
        if (!listString.length === 0) {

            callback(
                null,
                []
            );

        }
        const query = "SELECT id, username FROM users WHERE id IN ($1);";
        this.execute(
            query,
            [listString],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }
        );

    }

    /*
     * Param 1 is the email to id. returns email address.
     * param 2 is the subject userid. returns username.
     */
    getMailUserInfo (to_id, sender_id, callback) {

        const query = "SELECT id, username, email FROM users WHERE id IN ($1,$2) ORDER BY ID ASC;";
        this.execute(
            query,
            [
                to_id,
                sender_id
            ],
            (e, r) => {

                const reply = {};
                if (e) {

                    return callback(e);

                } else if (r[0].id === to_id) {

                    reply.email = r[0].email;
                    reply.username = r[1].username;

                } else if (r[1].id === to_id) {

                    reply.email = r[1].email;
                    reply.username = r[0].username;

                } else {

                    e = "invalid user/email lookup";

                }
                callback(
                    e,
                    reply
                );

            }
        );

    }

    getNews (callback) {

        const query = "SELECT * FROM NEWS;";
        this.execute(
            query,
            [],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }
        );

    }

    setNews (id, title, text, link, callback) {

        const query = "INSERT INTO news (id, title, text, link)" +
                " VALUES($1,$2,$3,$4) ON CONFLICT ON CONSTRAINT news_pkey DO UPDATE SET title = $2, text = $3, link = $4 WHERE news.id = $1;";
        this.execute(
            query,
            [
                id,
                title,
                text,
                link
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }
        );

    }

    addContentPassword (cid, password, callback) {

        const query = "INSERT INTO content_password (cid,password)" +
                " VALUES($1,$2) ON CONFLICT ON CONSTRAINT content_password_cid_key DO UPDATE SET password = $2 WHERE content_password.cid = $1;";
        this.execute(
            query,
            [
                cid,
                password
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }
        );

    }

    setCreatorPromoted (id, value, callback) {

        const query = "UPDATE creators SET promoted = $2 WHERE user_id = $1;";

        this.execute(
            query,
            [
                id,
                value
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }
        );

    }

    setUserMailIfNone (user_id, email, callback) {

        const query = "UPDATE users set email = $1 WHERE id = $2 AND email ~ '^\\d+@equitydao.earth' AND $3 NOT IN (SELECT email FROM users);";
        this.execute(
            query,
            [
                email,
                user_id,
                email
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }
        );

    }

    setUserMail (user_id, email, callback) {

        const query = "UPDATE users set email = $1 WHERE id = $2 AND $3 NOT IN (SELECT email FROM users);";
        this.execute(
            query,
            [
                email,
                user_id,
                email
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }
        );

    }

    addToMailQueue (email, content, callback) {

        const query = "INSERT INTO mail_queue (email, mail_content, status) " +
                " VALUES($1,$2,$3);";
        this.execute(
            query,
            [
                email,
                content,
                "new"
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }
        );

    }

    getMailQueueLength (callback) {

        const query = "SELECT COUNT(email) FROM mail_queue WHERE STATUS = 'new';";
        this.execute(
            query,
            null,
            (e, r) => {

                if (r) {

                    if (r[0]) {

                        callback(
                            e,
                            r[0].count
                        );

                    } else {

                        callback(
                            e,
                            0
                        );

                    }

                } else {

                    callback(
                        e,
                        0
                    );

                }

            }
        );

    }

    getFromMailQueue (callback) {

        const query = "SELECT id, mail_content FROM mail_queue WHERE status = 'new' LIMIT 1;";
        this.execute(
            query,
            null,
            (e, r) => {

                if (r) {

                    if (r[0]) {

                        callback(
                            e,
                            r[0]
                        );

                    } else {

                        callback(
                            e,
                            null
                        );

                    }

                } else {

                    callback(
                        e,
                        null
                    );

                }

            }
        );

    }

    setMailQueueStatus (id, status_, callback) {

        const query = `UPDATE mail_queue SET status = \'${status_}\' where id = $1;`;
        this.execute(
            query,
            [id],
            (e, r) => {

                if (r) {

                    if (r[0]) {

                        callback(
                            e,
                            r[0]
                        );

                    } else {

                        callback(
                            e,
                            null
                        );

                    }

                } else {

                    callback(
                        e,
                        null
                    );

                }

            }

        );

    }

    contact (email, name, text, callback) {

        const query = "INSERT INTO contact(email,name,text) VALUES($1,$2,$3);";

        this.execute(
            query,
            [
                email,
                name,
                text
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    createNFTEvent (contract_address, nft_address, name, symbol, owner_address, royalty_fee, royalty_recipient, block_number) {

        const query = "INSERT INTO create_nft_event (contract_address, nft_address, name, symbol, owner_address, royalty_fee, royalty_recipient, block_number, date)" +
                " VALUES($1,$2,$3,$4,$5,$6,$7,$8,NOW());";

        this.execute(
            query,
            [
                contract_address,
                nft_address,
                name,
                symbol,
                owner_address,
                royalty_fee,
                royalty_recipient,
                block_number
            ],
            (e, r) => {

                /*
                 *callback(
                 *    e,
                 *    r
                 *);
                 */

            }

        );

    }

    listedNFTEvent (contract_address, nft_address, token_id, payment_token, price, owner_address, block_number) {

        const query = "INSERT INTO listed_nft_event (contract_address, nft_address, token_id, payment_token, price, owner_address, block_number, date)" +
                " VALUES($1,$2,$3,$4,$5,$6,$7,NOW());";

        this.execute(
            query,
            [
                contract_address,
                nft_address,
                token_id,
                payment_token,
                price,
                owner_address,
                block_number
            ],
            (e, r) => {

                /*
                 *callback(
                 *    e,
                 *    r
                 *);
                 */

            }

        );

    }

    soldNFTEvent (contract_address, nft_address, token_id, payment_token, price, owner_address, buyer_address, block_number) {

        const query = "INSERT INTO sold_nft_event (contract_address, nft_address, token_id, payment_token, price, owner_address, buyer_address, block_number, date)" +
                " VALUES($1,$2,$3,$4,$5,$6,$7,$8,NOW());";

        this.execute(
            query,
            [
                contract_address,
                nft_address,
                token_id,
                payment_token,
                price,
                owner_address,
                buyer_address,
                block_number
            ],
            (e, r) => {

                /*
                 *callback(
                 *    e,
                 *    r
                 *);
                 */

            }

        );

    }

    offerredNFTEvent (contract_address, nft_address, token_id, payment_token, offer_price, offerer_address, block_number) {

        const query = "INSERT INTO offerred_nft_event (contract_address, nft_address, token_id, payment_token, offer_price, offerer_address, block_number, date)" +
                " VALUES($1,$2,$3,$4,$5,$6,$7,NOW())";

        this.execute(
            query,
            [
                contract_address,
                nft_address,
                token_id,
                payment_token,
                offer_price,
                offerer_address,
                block_number
            ],
            (e, r) => {

                /*
                 *callback(
                 *    e,
                 *    r
                 *);
                 */

            }

        );

    }

    canceledOfferEvent (contract_address, nft_address, token_id, payment_token, offer_price, offerer_address, block_number) {

        const query = "INSERT INTO canceled_offer_event (contract_address, nft_address, token_id, payment_token, offer_price, offerer_address, block_number, date)" +
                " VALUES($1,$2,$3,$4,$5,$6,$7,NOW());";

        this.execute(
            query,
            [
                contract_address,
                nft_address,
                token_id,
                payment_token,
                offer_price,
                offerer_address,
                block_number
            ],
            (e, r) => {

                /*
                 *callback(
                 *    e,
                 *    r
                 *);
                 */

            }

        );

    }

    acceptedOfferEvent (contract_address, nft_address, token_id, payment_token, offer_price, offerer_address, owner_address, block_number) {

        const query = "INSERT INTO accepted_offer_event (contract_address, nft_address, token_id, payment_token, offer_price, offerer_address, owner_address, block_number, date)" +
                " VALUES($1,$2,$3,$4,$5,$6,$7,$8,NOW())";

        this.execute(
            query,
            [
                contract_address,
                nft_address,
                token_id,
                payment_token,
                offer_price,
                offerer_address,
                owner_address,
                block_number
            ],
            (e, r) => {

                /*
                 *callback(
                 *    e,
                 *    r
                 *);
                 */

            }

        );

    }

    createdAuctionTEvent (contract_address, nft_address, token_id, payment_token, price, min_bid, start_time, end_time, owner_address, block_number) {

        const query = "INSERT INTO created_auction_event (contract_address, nft_address, token_id, payment_token, price, min_bid, start_time, end_time, owner_address, block_number, date)" +
                " VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW());";

        this.execute(
            query,
            [
                contract_address,
                nft_address,
                token_id,
                payment_token,
                price,
                min_bid,
                start_time,
                end_time,
                owner_address,
                block_number
            ],
            (e, r) => {

                /*
                 *callback(
                 *    e,
                 *    r
                 *);
                 */

            }

        );

    }

    placedBidEvent (contract_address, nft_address, token_id, payment_token, bid_price, bidder_address, block_number) {

        const query = "INSERT INTO placed_bid_event (contract_address, nft_address, token_id, payment_token, bid_price, bidder_address, block_number, date)" +
                " VALUES($1,$2,$3,$4,$5,$6,$7,NOW());";

        this.execute(
            query,
            [
                contract_address,
                nft_address,
                token_id,
                payment_token,
                bid_price,
                bidder_address,
                block_number
            ],
            (e, r) => {

                /*
                 *callback(
                 *    e,
                 *    r
                 *);
                 */

            }

        );

    }

    auctionResultEvent (contract_address, nft_address, token_id, creator_address, winner_address, price, caller_address, block_number) {

        const query = "INSERT INTO auction_result_event (contract_address, nft_address, token_id, creator_address, winner_address, price, caller_address, block_number, date)" +
                " VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW());";

        this.execute(
            query,
            [
                contract_address,
                nft_address,
                token_id,
                creator_address,
                winner_address,
                price,
                caller_address,
                block_number
            ],
            (e, r) => {

                /*
                 *callback(
                 *    e,
                 *    r
                 *);
                 */

            }

        );

    }

    queryCollections (queryTerm, callback) {

        const query = "SELECT name, symbol, nft_address FROM collections WHERE name ILIKE $1 OR symbol ILIKE $1 LIMIT 6;";

        this.execute(
            query,
            [`%${queryTerm}%`],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }
        );

    }

    addCreator (user_id, name, callback) {

        const query = "INSERT INTO creators (user_id,name) values($1, $2) ON CONFLICT ON CONSTRAINT creators_user_id_key DO UPDATE SET name = $2 WHERE creators.user_id = $1";

        this.execute(
            query,
            [
                user_id,
                name
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }
        );

    }

    getCreatorNames (callback) {

        const query = "SELECT name FROM creators;";

        this.execute(
            query,
            [],
            (e, r) => {

                const l = [];
                for (const i in r) {

                    l.push(r[i].name);

                }

                callback(
                    e,
                    l
                );

            }
        );

    }

    queryCreators (queryTerm, callback) {

        const query = "SELECT name, title FROM creators WHERE name ILIKE $1 OR title ILIKE $1 OR about ILIKE $1 LIMIT 6;";

        this.execute(
            query,
            [`%${queryTerm}%`],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }
        );

    }

    addEngagement (payload, callback) {

        const query = "INSERT INTO engagements (ad_manager_proxy_contract_address, campaign_address, user_address, impression, click, engagement_hash, ip, fingerprint, seen)" +
                " VALUES($1,$2,$3,$4,$5,$6,$7,$8,NOW()) ON CONFLICT DO NOTHING;";

        this.execute(
            query,
            [
                payload.ad_manager_proxy_contract_address,
                payload.campaign_address,
                payload.user_address,
                payload.impression,
                payload.click,
                payload.engagement_hash,
                payload.ip,
                payload.fingerprint
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }
        );

    }

    getAccountsByAddress (address, callback) {

        const query = "SELECT * FROM accounts WHERE address = $1";

        this.execute(
            query,
            [address],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    getAccountsById (user_id, callback) {

        const query = "SELECT * FROM accounts WHERE user_id = $1";

        this.execute(
            query,
            [user_address],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    addUserAccount (user_id, address, wallet, hash, geoIp, callback) {

        const query = "INSERT INTO accounts (user_id, address, wallet, engagement_hash, geoip) " +
            "VALUES ($1,$2,$3,$4,$5) ON CONFLICT ON CONSTRAINT user_hash DO UPDATE SET user_id = $1 WHERE accounts.address = $2;";

        this.execute(
            query,
            [
                user_id,
                address,
                wallet,
                hash,
                geoIp
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    /*
     *
     * Obsolete, delete?
     */
    updateUserAccounts (uid, hash, account, callback) {

        if (uid) {

            var query = "INSERT INTO accounts (user_id, engagement_hash, user_address)" +
                    " VALUES($1,$2,$3) ON CONFLICT ON CONSTRAINT user_hash_address DO UPDATE SET user_id = $1 WHERE accounts.engagement_hash = $2;";

        } else {

            var query = "INSERT INTO accounts (user_id, engagement_hash, user_address)" +
                    " VALUES($1,$2,$3) ON CONFLICT DO NOTHING;";

        }

        this.execute(
            query,
            [
                uid,
                hash,
                account
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    updateCollectionToken (nft_address, token_id, owner, previous_owner, transaction_hash, block_number, chain_id, standard, token_uri, metadata, callback) {

        const query = "INSERT INTO collection_tokens (nft_address, token_id, owner, previous_owner, transaction_hash, block_number, chain_id, standard, token_uri, metadata)" +
                " VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT ON CONSTRAINT collection_tokens_nft_address_token_id_key DO UPDATE SET owner = $3, previous_owner = $4, transaction_hash = $5, block_number = $6, token_uri = $9, metadata = $10 WHERE collection_tokens.nft_address = $1 AND collection_tokens.token_id = $2 AND collection_tokens.chain_id = $7 AND collection_tokens.block_number <= $6;";

        this.execute(
            query,
            [
                nft_address,
                token_id,
                owner,
                previous_owner,
                transaction_hash,
                block_number,
                chain_id,
                standard,
                token_uri,
                metadata
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    transferTokenEvent (nft_address, token_id, owner, previous_owner, transaction_hash, block_number, chain_id, standard, callback) {

        const query = "INSERT INTO token_transfer_events (nft_address, token_id, owner, previous_owner, transaction_hash, block_number, chain_id, standard)" +
                " VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT ON CONSTRAINT token_transfer_events_transaction_hash_key DO NOTHING;";

        this.execute(
            query,
            [
                nft_address,
                token_id,
                owner,
                previous_owner,
                transaction_hash,
                block_number,
                chain_id,
                standard
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    getToken (nft_address, token_id, callback) {

        const query = "SELECT * FROM collection_tokens WHERE nft_address = $1 AND token_id = $2;";

        this.execute(
            query,
            [
                nft_address,
                token_id
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    getTokensByCollectionAddress (nft_address, callback) {

        // const query = "SELECT * FROM collection_tokens WHERE nft_address = $1 ORDER BY token_id;";
        const query = "SELECT DISTINCT ON (collection_tokens.token_id, collection_tokens.nft_address) collection_tokens.*, sold_nft_event.date, sold_nft_event.price, sold_nft_event.owner_address FROM collection_tokens FULL OUTER JOIN sold_nft_event ON (collection_tokens.nft_address = sold_nft_event.nft_address AND collection_tokens.token_id = sold_nft_event.token_id) WHERE collection_tokens.nft_address = $1;";

        this.execute(
            query,
            [nft_address],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    getTokensByOwnerAddress (address, callback) {

        // var query = "SELECT * FROM collection_tokens WHERE owner = $1 ORDER BY token_id;"

        const query = "SELECT * FROM collection_tokens WHERE owner = $1 OR (previous_owner = $1 AND owner = $2) ORDER BY token_id;";

        this.execute(
            query,
            [
                address,
                process.env.VUE_APP_MARKETPLACE_ADDRESS
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    getTrendingTokens (callback) {

        // var query = "SELECT * FROM collection_tokens WHERE owner = $1 ORDER BY token_id;"

        // const query = "SELECT DISTINCT ON (sold_nft_event.token_id, sold_nft_event.nft_address) sold_nft_event.token_id, sold_nft_event.nft_address, sold_nft_event.date, sold_nft_event.price, sold_nft_event.owner_address, collection_tokens.chain_id, collection_tokens.metadata, collection_tokens.token_uri, collections.symbol FROM sold_nft_event INNER JOIN collection_tokens ON (sold_nft_event.nft_address = collection_tokens.nft_address AND sold_nft_event.token_id = collection_tokens.token_id) INNER JOIN collections ON collections.nft_address = collection_tokens.nft_address GROUP BY sold_nft_event.nft_address, sold_nft_event.token_id, collection_tokens.chain_id, collection_tokens.metadata, collection_tokens.token_uri, sold_nft_event.owner_address, sold_nft_event.price, sold_nft_event.date, collections.symbol ORDER by sold_nft_event.nft_address, sold_nft_event.token_id, sold_nft_event.date DESC limit 14;";

        const query = "WITH LatestDateCTE AS (SELECT nft_address, token_id, date FROM sold_nft_event GROUP BY nft_address, token_id, date ORDER BY date DESC LIMIT 14) SELECT DISTINCT ON (sne.token_id, sne.nft_address) sne.nft_address || sne.token_id::text AS key, sne.token_id, sne.nft_address, sne.date, sne.price, sne.owner_address, ct.chain_id, ct.metadata, ct.token_uri, col.symbol FROM sold_nft_event sne INNER JOIN LatestDateCTE ldc ON sne.nft_address = ldc.nft_address AND sne.token_id = ldc.token_id AND sne.date = ldc.date INNER JOIN collection_tokens ct ON sne.nft_address = ct.nft_address AND sne.token_id = ct.token_id INNER JOIN collections col ON ct.nft_address = col.nft_address ORDER BY sne.token_id, sne.nft_address, sne.date DESC;";

        this.execute(
            query,
            [],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    saveCollection (nft_address, owner_address, user_id, name, symbol, description, primary_color, secondary_color, image, banner, category, media, royalty_fee, royalty_recipient, chain_id, callback) {

        const query = "INSERT INTO collections(nft_address, owner_address, user_id, name, symbol, description, primary_color, secondary_color, image, banner, category, media, royalty_fee, royalty_recipient, chain_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) ON CONFLICT ON CONSTRAINT collections_nft_address_key DO UPDATE SET owner_address = $2, user_id = $3, name = $4, symbol = $5, description = $6, primary_color = $7, secondary_color=$8, image = $9, banner = $10,category = $11, media = $12, royalty_fee = $13, royalty_recipient = $14, chain_id = $15 WHERE collections.nft_address = $1;";

        this.execute(
            query,
            [
                nft_address,
                owner_address,
                user_id,
                name,
                symbol,
                description,
                primary_color,
                secondary_color,
                image,
                banner,
                category,
                media,
                royalty_fee,
                royalty_recipient,
                chain_id
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    // ONLY FOR ONCHAN DATA
    updateCollection (nft_address, owner_address, name, symbol, royalty_fee, royalty_recipient, chain_id, callback) {

        const query = "INSERT INTO collections(nft_address, owner_address, name, symbol, royalty_fee, royalty_recipient, chain_id) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT ON CONSTRAINT collections_nft_address_key DO UPDATE SET owner_address = $2, name = $3, symbol = $4, royalty_fee = $5, royalty_recipient = $6, chain_id = $7 WHERE collections.nft_address = $1;";

        this.execute(
            query,
            [
                nft_address,
                owner_address,
                name,
                symbol,
                royalty_fee,
                royalty_recipient,
                chain_id
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    getCollection (nft_address, callback) {

        const query = "SELECT creators.name as creator_name, collections.nft_address as nft_address, collections.owner_address, collections.user_id, collections.name, collections.symbol, collections.description, collections.primary_color, collections.secondary_color, collections.banner, collections.image, collections.category, collections.media, collections.color, collections.royalty_fee, collections.royalty_recipient, collections.chain_id, collections.enabled FROM collections FULL OUTER JOIN creators ON (collections.user_id = creators.user_id) where collections.nft_address = $1";

        this.execute(
            query,
            [nft_address],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    getCollectionMedia (nft_address, callback) {

        const query = "SELECT collection_media.*, collections.symbol FROM collection_media INNER JOIN collections on collections.nft_address = collection_media.nft_address WHERE collection_media.nft_address = $1 AND minted = false ORDER BY collection_media.id;";

        this.execute(
            query,
            [nft_address],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    addCollectionMedia (nft_address, metadata, user_id, callback) {

        const query = "INSERT INTO collection_media(nft_address, metadata, user_id, minted) VALUES($1,$2,$3,$4) RETURNING id;";

        this.execute(
            query,
            [
                nft_address,
                metadata,
                user_id,
                false
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    removeVouchers (user_id, nft_address, vouchers, callback) {

        const query = "DELETE FROM vouchers WHERE id IN ($2) AND nft_address = (SELECT c.nft_address FROM collections c WHERE c.user_id = $1 AND c.nft_address = $3)";

        this.execute(
            query,
            [
              user_id,
              vouchers,
              nft_address
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    addVouchers (user_id, nft_address, vouchers, callback) {
      console.log("nft_address " + nft_address)
      console.log(vouchers)

        let values = [];
        for (var i=0; i < vouchers.length; i++) {

            if (!(vouchers[i].metadata.name && 
              vouchers[i].metadata.image && 
              vouchers[i].voucher.price && 
              vouchers[i].voucher.id && 
              vouchers[i].voucher.signature && 
              vouchers[i].voucher.uri)) {

                callback(e)
                return

            }

            let v = []
            v.push(user_id);
            v.push(nft_address);
            v.push(vouchers[i].metadata);
            v.push(vouchers[i].voucher);
            v.push(false);
            values.push(v);

        }

        const query = "INSERT INTO vouchers (nft_address, metadata, voucher, minted) SELECT c.nft_address, $3, $4, $5 FROM collections c WHERE c.user_id = $1 AND c.nft_address = $2";
      console.log('query')
      console.log(query)

        this.batch_execute(
            query,
            values,
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    getVouchers (nft_address, callback) {

        const query = "SELECT * FROM vouchers WHERE nft_address = $1 ORDER BY vouchers.voucher->'id';";

        this.execute(
            query,
            [nft_address],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    setVoucherMinted (nft_address, voucher_id, callback) {

        const query = "UPDATE vouchers SET minted = true WHERE nft_address=$1 AND voucher->'id' = $2;";

        this.execute(
            query,
            [
                nft_address,
                voucher_id
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    deleteCollectionMedia (nft_address, id, user_id, callback) {

        const query = "DELETE FROM collection_media WHERE nft_address=$1 AND id = $2 AND user_id = $3;";

        this.execute(
            query,
            [
                nft_address,
                id,
                user_id
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    getLastMintID (nft_address, callback) {

        const query = "SELECT MAX(token_id) FROM collection_tokens WHERE nft_address = $1;";

        this.execute(
            query,
            [
                nft_address
            ],
            (e, r) => {

                callback(e,r);

            }

        );

    }

    getProducts (user_id, callback) {

        const query = "SELECT creators.name AS creators_name, creators.title AS creators_title, creators.image as creators_image, products.* FROM products INNER JOIN creators ON creators.user_id = products.user_id WHERE products.user_id = $1;";

        this.execute(
            query,
            [
                user_id
            ],
            (e, r) => {

                callback(e,r);

            }

        );

    }

    createProduct (user_id, callback) {

        const query = "INSERT INTO products (user_id) VALUES ($1) RETURNING id;";

        this.execute(
            query,
            [
                user_id
            ],
            (e, r) => {

                console.log('r')
                console.log(r)

                callback(
                    e,
                    r
                );

            }

        );

    }

    updateProduct (user_id, product_id, name, description, price, currency, stock, attributes, customizations, media, callback) {

        const query = "UPDATE products SET name = $3, description = $4, price = $5, currency = $6, stock = $7, attributes = $8, customizations = $9, media = $10 WHERE id = $2 AND user_id = $1;";

        this.execute(
            query,
            [
                user_id,
                product_id,
                name,
                description,
                price,
                currency,
                stock,
                attributes,
                customizations,
                JSON.stringify(media)
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    deleteProduct (user_id, product_id, callback) {

        const query = "DELETE FROM products WHERE id = $1 AND user_id = $2;";

        this.execute(
            query,
            [
                product_id,
                user_id
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    deleteProductMedia (id, user_id, callback) {

        const query = "DELETE FROM product_files WHERE id = $1 AND user_id = $2;";

        this.execute(
            query,
            [
                id,
                user_id
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    getCollectionMedia (nft_address, callback) {

        const query = "SELECT * FROM collection_media WHERE nft_address = $1;";

        this.execute(
            query,
            [nft_address],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    updateCollectionMedia (nft_address, metadata, id, user_id, callback) {

        const query = "UPDATE collection_media SET metadata = $2 WHERE nft_address = $1 AND id = $3 AND user_id = $4;";

        this.execute(
            query,
            [
                nft_address,
                metadata,
                id,
                user_id
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    updateProductFile (uid, media_filename, media_filename_preview, original_filename, url, callback) {

        const query = "INSERT INTO product_files(user_id, media_filename, media_filename_preview, original_filename, url) VALUES($1,$2,$3,$4,$5) ON CONFLICT ON CONSTRAINT product_files_media_filename_key DO UPDATE SET media_filename = $2, media_filename_preview = $3, original_filename = $4, url = $5 WHERE product_files.user_id = $1 and product_files.media_filename = $2 RETURNING *;";

        this.execute(
            query,
            [
                uid,
                media_filename,
                media_filename_preview,
                original_filename,
                url
            ],
            (e, r) => {

                callback(
                    e,
                    r[0]
                );

            }

        );

    }

    updatePrivateFile (uid, media_filename, media_filename_preview, original_filename, url, acl, callback) {

        const query = "INSERT INTO private_files(user_id, media_filename, media_filename_preview, original_filename, url, acl) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT ON CONSTRAINT private_files_media_filename_key DO UPDATE SET media_filename = $2, media_filename_preview = $3, original_filename = $4, url = $5, acl = $6 WHERE private_files.user_id = $1 and private_files.media_filename = $2;";

        this.execute(
            query,
            [
                uid,
                media_filename,
                media_filename_preview,
                original_filename,
                url,
                acl
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    getPrivateFile (url, callback) {

        const query = "SELECT * FROM private_files WHERE url = $1";

        this.execute(
            query,
            [url],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    updateFolio (uid, name, title, about, image, video, video_thumbnail, effect, primary_color, secondary_color, active, callback) {

        const query = "INSERT INTO creators(user_id, name, title, about, image, video, video_thumbnail, effect, primary_color, secondary_color, active) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT ON CONSTRAINT creators_user_id_key DO UPDATE SET title = $3, about = $4, image = $5, video = $6, video_thumbnail = $7, effect = $8, primary_color = $9, secondary_color = $10 WHERE creators.user_id = (SELECT id FROM users WHERE users.id = $1 AND users.creator = true);";

        this.execute(
            query,
            [
                uid,
                name,
                title,
                about,
                image,
                video,
                video_thumbnail,
                effect,
                primary_color,
                secondary_color,
                active
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    updateSocialMedia (uid, website, instagram, twitter, twitch, youtube, callback) {

        const query = "UPDATE creators SET website = $2, instagram = $3, twitter = $4, twitch = $5, youtube = $6 WHERE creators.user_id = (SELECT id FROM users WHERE users.id = $1 AND users.creator = true) RETURNING creators.user_id;";

        this.execute(
            query,
            [
                uid,
                website,
                instagram,
                twitter,
                twitch,
                youtube
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    addPost (uid, content, preview, pid, callback) {

        let query,
            values;
        if (parseInt(pid)) {

            query = "UPDATE posts SET content = $2, preview = $3, edited = $4 WHERE posts.id = $5 AND posts.user_id = (SELECT id FROM users WHERE users.id = $1 AND users.creator = true) RETURNING posts.id AS pid;";
            values = [
                uid,
                content,
                preview,
                new Date().getTime(),
                pid
            ];

        } else {

            query = "INSERT INTO posts(user_id, content, preview, created) VALUES($1,$2,$3,$4) RETURNING posts.id AS pid;";
            values = [
                uid,
                content,
                preview,
                new Date().getTime()
            ];

        }

        this.execute(
            query,
            values,
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    deletePost (uid, pid, callback) {

        const query = "DELETE FROM posts WHERE user_id = $1 AND id = $2";

        this.execute(
            query,
            [
                uid,
                pid
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    getPosts (name, offset, callback) {

        const query = "SELECT * FROM posts WHERE user_id = (SELECT creators.user_id FROM creators WHERE name = $1) ORDER BY created DESC LIMIT 5 OFFSET $2";

        this.execute(
            query,
            [
                name,
                offset
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }

        );

    }

    getFolios (callback) {

        const query = "SELECT * FROM creators WHERE promoted = true ORDER BY Random();";
        this.execute(
            query,
            null,
            (e, r) => {

                callback(
                    e,
                    r
                );

            }
        );

    }

    getFolioById (name, callback) {

        const query = "SELECT * FROM creators WHERE name = $1;";
        this.execute(
            query,
            [name],
            (e, r) => {

                callback(
                    e,
                    r[0]
                );

            }
        );

    }

    getUserIdByAddress (addr, callback) {

        const query = "select distinct user_id from accounts where address = $1;";
        this.execute(
            query,
            [addr],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }
        );

    }

    enableCreator (uid, value, callback) {

        const query = "UPDATE users SET creator = $2 WHERE id = $1;";
        this.execute(
            query,
            [
                uid,
                value
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }
        );

    }

    getCreatorNameById (uid, callback) {

        const query = "SELECT name FROM creators WHERE user_id = $1;";
        this.execute(
            query,
            [uid],
            (e, r) => {

                callback(
                    e,
                    r[0]
                );

            }
        );

    }

    getCreators (uid, callback) {

        const query = "SELECT users.id, users.email, users.creator, creators.name, creators.promoted, ARRAY_AGG(accounts.address) AS addresses, ARRAY_AGG(accounts.geoip) AS geoip FROM users FULL OUTER JOIN accounts ON accounts.user_id = users.id JOIN creators ON creators.user_id = users.id WHERE users.creator = true GROUP BY users.id, creators.name, creators.promoted ORDER BY users.id;";

        this.execute(
            query,
            null,
            (e, r) => {

                callback(
                    e,
                    r
                );

            }
        );

    }

    getCollections (callback) {

        const query = "SELECT creators.name as creator_name, collections.id, collections.nft_address as nft_address, collections.owner_address, collections.user_id, collections.name, collections.symbol, collections.description, collections.primary_color, collections.secondary_color, collections.banner, collections.image, collections.category, collections.media, collections.color, collections.royalty_fee, collections.royalty_recipient, collections.chain_id, collections.enabled FROM collections FULL OUTER JOIN creators ON (collections.user_id = creators.user_id) WHERE collections.enabled = true ORDER BY id DESC;";

        this.execute(
            query,
            null,
            (e, r) => {

                callback(
                    e,
                    r
                );

            }
        );

    }

    getCollectionsByCreator (name, callback) {

        const query = "select * from collections where user_id = (SELECT user_id from creators where name = $1) AND collections.enabled = true ORDER BY id DESC;";
        this.execute(
            query,
            [name],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }
        );

    }

    getCollectionAddresses (chain_id, callback) {

        const query = "SELECT array_agg(distinct nft_address) FROM collections WHERE chain_id = $1";
        this.execute(
            query,
            [chain_id],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }
        );

    }

    getMyCollections (uid, addr, callback) {

        const query = "SELECT * FROM collections WHERE user_id = $1 OR owner_address = $2";
        this.execute(
            query,
            [
                uid,
                addr
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }
        );

    }

    async hasUserAccount(user_id, addr) {

        const query = "SELECT count(*) FROM accounts WHERE user_id = $1 AND accounts.address = $2;"
      
        return new Promise((resolve, reject) => {

            this.execute(query, [user_id, addr], (e, r) => {

                  if (r) {

                    console.log('resolve r')
                    resolve(r);

                  } else {

                    console.log('reject e')
                    reject(e);
                    
                  }

              });

        });

    }

    async getCollectionOwner (user_id, nft_address) {

        const query = "SELECT owner_address FROM collections WHERE user_id = $1 AND nft_address = $2";

        return new Promise((resolve, reject) => {

            this.execute(query, [user_id, nft_address], (e, r) => {

                  if (r) {

                    resolve(r);

                  } else {

                    reject(e);
                    
                  }

              });

        });

    }

/*
    hasUserAccount (user_id, addr) {

        const query = "SELECT count(*) FROM accounts WHERE user_id = $1 AND accounts.address = $2;"
        this.execute(
            query,
            [
                uid,
                addr
            ],
            (e, r) => {

               if (e) {

                  console.log(e)
                  return

               }

               return r;

            }
        );

    }

    getCollectionOwner (user_id, nft_address, callback) {

        const query = "SELECT owner_address FROM collections WHERE user_id = $1 AND nft_address = $2";
        this.execute(
            query,
            [
                uid,
                addr
            ],
            (e, r) => {

               if (e) {

                  console.log(e)
                  return

               }

               return r;

            }

        );

    }
*/
    /*
     *public | accepted_offer_event         | table    | postgres
     *public | canceled_offer_event         | table    | postgres
     *public | listed_nft_event             | table    | postgres
     *public | offerred_nft_event           | table    | postgres
     *public | sold_nft_event               | table    | postgres
     *public | token_transfer_events        | table    | postgres
     */

    setCollectionEnabled (uid, nft_address, enabled, callback) {

        const query = "UPDATE collections SET enabled = $3, promoted = $3 WHERE nft_address = $2 AND user_id = $1 RETURNING enabled";
        this.execute(
            query,
            [
                uid,
                nft_address,
                enabled
            ],
            (e, r) => {

                callback(
                    e,
                    r
                );

            }
        );

    }

}

// module.exports = Postgres;
export default Postgres;
