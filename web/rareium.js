
import express from "express";
import https from "https";
import fs from "fs";
import path from "path";
import Fingerprint from "express-fingerprint";
import multer from "multer";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import langparser from "accept-language-parser";
import linkPreview from "link-preview-js";
import compression from "compression";
import eth from "./backend/eth.js";
import cds from "./backend/cds.js";
import pg from "./backend/postgres.js";
import user from "./backend/user.js";
import url from "url";
import utils from "ethereumjs-util";
import crypto from "crypto";
import {Nilsimsa} from "nilsimsa";
import web3Storage from './backend/w3s.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Mailgun from './backend/mailer.js';
import { exec } from 'child_process';

const app = express();
const agent = new https.Agent({
    "rejectUnauthorized": false
});
const db_pg = {};
const facets = {};
const upload = multer({limits:{fieldSize: 100 * 1024 * 1024}});
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

db_pg.admin = new pg({"database": process.env.DATABASE});

const signer = new cds();
const w3s = new web3Storage();
const mailer = new Mailgun({});

// now run as a separate service
const eth_ = new eth('pass var here , eg ipfs');

user.loadExistingSessions();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

app.use(compression());
app.use(cookieParser());
//app.use(bodyParser.json({"limit": "1mb"}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended": true})); // For parsing application/x-www-form-urlencoded

app.use(Fingerprint({
    "parameters": [
        // Defaults
        Fingerprint.useragent,
        // Fingerprint.acceptHeaders,
        Fingerprint.geoip
    ]
}));

//const reHash = function (req, res, next) {
const reHash = (req, res, next) => {

    const cstr = req.fingerprint.hash;
    let rstr = "";

    if (req.fingerprint.components) {

        req.geoIp = req.fingerprint.components.geoip;

    }

    if (cstr.length === 0) {

        return null;

    }

    for (let i = 0; i < cstr.length; ++i) {

        rstr += String.fromCharCode(0xdeadbeef ^ 0x0000ff ^ cstr.charCodeAt(i));

    }

    req.engagement_hash = new Nilsimsa(rstr).digest("hex");
    next();

};

app.use(reHash);

const reject = function (req, res) {
    res.json({
        "authorized": false,
        "message": "unauthorized",
        "engagement": req.engagement_hash,
        "language": req.language,
        "region": req.region
    });
}

/*
 * App.use(bodyParser.raw({type:'image/jpeg;base64',limit: '10mb'}));
 * app.use(bodyParser.raw({type:'image/jpeg',limit: '10mb'}));
 */

/*
 *App.get('*.js', function(req, res, next) {
 *  req.url = req.url + '.gz';
 *  res.set('Content-Encoding', 'gzip');
 *  res.set('Content-Type', 'application/javascript');
 *  next();
 *});
 */

/*
 *App.all('*', function(req, res, next) {
 *  res.header("Access-Control-Allow-Origin", "*");
 *  res.header("Access-Control-Allow-Headers", "X-Requested-With");
 *  res.header("Access-Control-Allow-Headers", "Authorization");
 *  next();
 *});
 */

// User endpoints
app.get(
    "/verifyUserEmail",
    (req, res) => {

        user.checkUserEmail(
            req,
            res
        );

    }
);

app.get(
    "/facebooklogin*",
    (req, res, next) => {

        user.facebookLogin(
            req,
            res,
            next
        );

    }
);

app.post(
    "/login",
    (req, res, next) => {

        user.login(
            req,
            res,
            next
        );

    }
);

app.post(
    "/register",
    (req, res, next) => {

        user.register(
            req,
            res,
            next
        );

    }
);

app.get(
    "/confirmemail",
    (req, res, next) => {

        user.confirmEmail(
            req,
            res,
            next
        );

    }
);

app.get(
    "/forgotPassword",
    (req, res, next) => {

        user.forgotPassword(
            req,
            res,
            next
        );

    }
);

app.get(
    "/resetPassword",
    (req, res, next) => {

        user.resetPassword(
            req,
            res,
            next
        );

    }
);

// Application endpoints(api) go here
app.get(
    "/logout",
    user.authorize,
    (req, res, next) => {

        if (req.authorized === true) {

            user.logout(
                req,
                res,
                next
            );

        } else {
          
            reject(req,res);

        }

    }
);

/*
 * Unauthenticated user (no json web token) attempts to sign in with wallet.
 */
app.get(
    "/signIn",
    user.authorize,
    (req, res, next) => {

        const queryData = url.parse(
            req.url,
            true
        ).query;

        if (queryData.signature && queryData.account) {

            if (eth_.isAddress(queryData.account) === true) {

                const address = eth_.verifySignature(
                    req.engagement_hash,
                    queryData.signature
                );
                console.log(`address ${address}`);
                console.log(`account ${queryData.account}`);
                // verify if signature is valid
                if (address === eth_.toChecksumAddress(queryData.account)) {

                    // check if user id exists for this address and return it, if not create a new user.
                    user.handleWeb3Signin(
                        address,
                        req.engagement_hash,
                        req.geoIp,
                        (user_id) => {

                            if (Number.isInteger(parseInt(user_id))) {

                                return user.authenticate (
                                    user_id,
                                    req,
                                    res
                                );

                            } else {

                                console.log("no user id returned, server error");
                                return res.send(500);

                            }

                        }
                    );

                } else {

                    res.send(403);

                }
                return;

            }

        } else {

            res.send(403);

        }

    }

);

/*
 * Same as above but..
 * User connects a wallet while they are already signed in.
 * For example a user that signed up with email but then installs their own wallet
 */
app.get(
    "/addAccount",
    user.authorize,
    (req, res, next) => {

        if (req.authorized === true) {

            const queryData = url.parse(
                req.url,
                true
            ).query;
            if (queryData.signature && queryData.account) {

                if (eth_.isAddress(queryData.account) === true) {

                    const address = eth_.verifySignature(
                        req.engagement_hash,
                        queryData.signature
                    );

                    // verify if signature is valid
                    if (address === queryData.account) {

                        // we already have a user id so just add it
                        db_pg.admin.addUserAccount(
                            req.user_id,
                            address,
                            null,
                            req.engagement_hash,
                            req.geoIp,
                            (e, r) => {

                                if (e) {

                                    // something went wrong, return null
                                    console.log(e);
                                    res.send(500);
                                    return;

                                }

                                res.send(200);

                            }
                        );

                    } else {

                        res.send(403);

                    }
                    return;

                }

            }

            res.send(403);

        } else {

            reject(req,res)

        }

    }
);

app.get(
    "/setEmail",
    user.authorize,
    (req, res, next) => {

        if (req.authorized === true) {

            const queryData = url.parse(
                req.url,
                true
            ).query;

            if (queryData.email) {

                // we already have a user id so just add it
                db_pg.admin.setEmail(
                    req.user_id,
                    queryData.email,
                    (e, r) => {

                        if (e) {

                            // something went wrong, return null
                            console.log(e);
                            res.send(500);
                            return;

                        }

                        res.send(200);

                    }
                );

            } else {

                res.send(403);

            }
            return;

        }

})

/*
 * authenticated user add address and user_id
 */
app.get(
    "/addProfile",
    user.authorize,
    (req, res, next) => {

        if (req.authorized === true) {

            const queryData = url.parse(
                req.url,
                true
            ).query;
            db_pg.admin.updateProfile(
                req.user_id,
                queryData.product_id,
                queryData.name,
                queryData.description,
                queryData.price,
                queryData.currency,
                queryData.stock,
                queryData.attributes,
                queryData.customizations,
                queryData.media,
                (e, r) => {

                    res.json(r);

                }
            );

        } else {

            reject(req,res)

        }

    }
);

app.post(
    "/addAvatar",
    upload.single("file"),
    (req, res) => {

        if (req.authorized === true) {

            if (req.file) {

                const avDir = "./public/images/avatar/";
                let filename = (Math.random() + 1).toString(36).substring(19);
                filename += path.extname(req.file.originalname);
                fs.writeFile(
                    avDir + filename,
                    req.file,
                    "binary",
                    (err) => {

                        if (!err) {

                            console.log(`${filename} created successfully!`);
                            res.send(200);

                        } else {

                            console.log(err);
                            res.send(500);

                        }

                    }
                );

            } else {

                res.send(500);

            }

        } else {

            reject(req,res)

        }

    }
);

app.post(
    "/uploadImage",
    [user.authorize,upload.single("file")],
    (req, res) => {

        if (req.authorized === true) {

            if (req.file) {

                const avDir = "./public/images/";
                let filename = req.user_id + '_' + (Math.random() + 1).toString(36).substring(2);
                filename += path.extname(req.file.originalname);
                fs.writeFile(
                    avDir + filename,
                    req.file.buffer,
                    "binary",
                    (err) => {

                        if (!err) {

                            let url = process.env.VUE_APP_SERVER_URI + `public/images/${filename}`;
                            res.status(200)
                            res.json({url})

                        } else {

                            console.log(err);
                            res.send(500);

                        }

                    }
                );

            } else {

                res.send(500);

            }

        } else {

            reject(req,res)

        }

    }
);

app.get(
    "/removeVouchers",
    user.authorize,
    (req, res, next) => {

        if (req.authorized === true) {

            user.isCreator(req, (r) => {

                if (r === true) {

                    const queryData = url.parse(
                        req.url,
                        true
                    ).query;

                    db_pg.admin.removeVouchers(
                        req.user_id,
                        queryData.nft_address,
                        queryData['vouchers[]'],
                        (e, r) => {

                            if (e) {

                                res.send(501);

                            } else {

                                res.send(200);

                            }

                    });

                } else {

                    reject(req,res)

                }

            })

        } else {

            reject(req,res)

        }

})

app.post(
    "/addVouchers",
    user.authorize,
    (req, res, next) => {

        if (req.authorized === true) {

            user.isCreator(req, (r) => {

                if (r === true) {

                    if (req.body.vouchers && req.body.nft_address) {
                      console.log('req.body')
                      console.log(req.body)

                        db_pg.admin.addVouchers(
                            req.user_id,
                            req.body.nft_address,
                            req.body.vouchers,
                            (e, r) => {

                                if (e) {

                                    res.send(501);

                                } else {

                                    res.send(200);

                                }

                        });

                    } else {

                        reject(req,res)

                    }

                } else {

                    reject(req,res)

                }

            })

        } else {

            reject(req,res)

        }

})

app.get(
    "/getVouchers",
    user.authorize,
    (req, res, next) => {

        const queryData = url.parse(
            req.url,
            true
        ).query;

        db_pg.admin.getVouchers(
            queryData.nft_address,

            (e, r) => {

                if (e) {
           
                    console.error(e);
                    res.status = 500;
                    res.send(e)

                } else {

                    res.status = 200;
                    res.json(r);

                }

            }

        )

});

app.get(
    "/findCreator",
    user.authorize,
    (req, res, next) => {

        if (req.authorized === true) {

            const queryData = url.parse(
                req.url,
                true
            ).query;

            db_pg.admin.getUserIdByAddress(
                queryData.address,
                (e, r) => {

                    if (r[0]) {
                      res.send(r[0]);
                    } else {
                      res.status = 200;
                      res.send(false);
                    }

                }
            );

        } else {

            reject(req,res)

        }

    }

);

app.post(
    "/saveCollection",
    [user.authorize,upload.none()],
    (req, res, next) => {

        if (req.authorized === true) {

            var banner;
            // if (!(req.body.nft_address && req.body.image && req.body.banner && req.body.symbol && req.body.description && req.body.category && req.body.media && req.body.chain_id)) {
            if (!(req.body.nft_address && req.body.image && req.body.banner && req.body.symbol && req.body.chain_id)) {

                return reject(req,res)

            }

            if (!req.body.royalty_fee)
              req.body.royalty_fee = "3000";
            if (!req.body.royalty_recipient)
              req.body.royalty_recipient = req.body.owner_address;

            console.log('SAVE COLLECTION req.body')
            console.log(req.body)

            user.isCreator(req, (r) => {

                if (r === true) {

                    db_pg.admin.saveCollection(
                        req.body.nft_address,
                        req.body.owner_address,
                        req.user_id,
                        req.body.name,
                        req.body.symbol,
                        req.body.description,
                        req.body.primary_color,
                        req.body.secondary_color,
                        req.body.image,
                        req.body.banner,
                        req.body.category,
                        req.body.media,
                        req.body.royalty_fee,
                        req.body.royalty_recipient,
                        req.body.chain_id,

                        (e, r) => {

                            res.status = 200;
                            if (r === []) {
                              res.send(true);
                            } else {
                              res.send(false)
                            }

                        }

                    );

                    console.log(r)

                } else {

                    reject(req,res)

                }

            });

        } else {

            reject(req,res)

        }

});

app.get(
    "/getCollection",
    user.authorize,
    (req, res, next) => {

       // if (req.authorized === true) {

            const queryData = url.parse(
                req.url,
                true
            ).query;

            db_pg.admin.getCollection(
                queryData.address,

                (e, r) => {

                    if (e) {
               
                      console.error(e);
                      res.status = 500;
                      res.send(e)

                    } else {

                      res.status = 200;
                      res.json(r[0]);

                    }

                }

            )

        //} else {

          //  reject(req,res)

       // }

});

app.get(
    "/getCollectionMedia",
    user.authorize,
    (req, res, next) => {

    //    if (req.authorized === true) {

            const queryData = url.parse(
                req.url,
                true
            ).query;

            db_pg.admin.getCollectionMedia(
                queryData.nft_address,

                (e, r) => {

                    if (e) {
               
                      console.error(e);
                      res.status = 500;
                      res.send(e)

                    } else {

                      res.status = 200;
                      res.json(r);

                    }

                }

            )

     //   } else {

    //        reject(req,res)

     //   }

});

app.get(
    "/getMyCollections",
    user.authorize,
    (req, res, next) => {

        if (req.authorized === true) {

            const queryData = url.parse(
                req.url,
                true
            ).query;

            db_pg.admin.getMyCollections(
                req.user_id,
                queryData.addr,

                (e, r) => {

                    if (e) {

                      console.error(e);
                      res.status = 500;
                      res.send(e)

                    } else {

                      res.status = 200;
                      res.json(r);

                    }

                }

            )

        } else {

            reject(req,res)

        }

})

app.get(
    "/setCollectionEnabled",
    user.authorize,
    (req, res, next) => {

        if (req.authorized === true) {

            const queryData = url.parse(
                req.url,
                true
            ).query;

            db_pg.admin.setCollectionEnabled(
                req.user_id,
                queryData.nft_address,
                queryData.enabled,

                (e, r) => {

                    if (e) {

                      console.error(e);
                      res.status = 500;
                      res.send(e)

                    } else {

                      res.status = 200;
                      res.json(r[0]);

                    }

                }

            )

        } else {

            reject(req,res)

        }

})

app.get(
    "/enableCreator",
    user.authorize,
    (req, res, next) => {

        if (req.authorized === true) {

            const queryData = url.parse(
                req.url,
                true
            ).query;

            user.isAdmin(req, (r) =>{

                if (r === true) {

                    const queryData = url.parse(
                        req.url,
                        true
                    ).query;

                    db_pg.admin.enableCreator(
                        queryData.user_id,
                        true,

                        (e, r) => {

                            res.status = 200;
                            if (r === []) {
                              res.send(true);
                            } else {
                              res.send(false)
                            }

                        }

                    );

                    console.log(r)

                } else {

                    reject(req,res)

                }

            });

        } else {

            reject(req,res)

        }

    }

);

app.get(
    "/removeCreator",
    user.authorize,
    (req, res, next) => {

        if (req.authorized === true) {

            const queryData = url.parse(
                req.url,
                true
            ).query;

            user.isAdmin(req, (r) =>{

                if (r === true) {

                    const queryData = url.parse(
                        req.url,
                        true
                    ).query;

                    db_pg.admin.enableCreator(
                        queryData.user_id,
                        false,

                        (e, r) => {

                            res.status = 200;
                            if (r === []) {
                              res.send(true);
                            } else {
                              res.send(false)
                            }

                        }

                    );

                    console.log(r)

                } else {

                    reject(req,res)

                }

            });

        } else {

            reject(req,res)

        }

    }

);

app.get(
    "/getCreators",
    user.authorize,
    (req, res, next) => {

        if (req.authorized === true) {

            const queryData = url.parse(
                req.url,
                true
            ).query;

            user.isAdmin(req, (r) =>{

                if (r === true) {

                    const queryData = url.parse(
                        req.url,
                        true
                    ).query;

                    db_pg.admin.getCreators(
                        queryData.user_id,

                        (e, r) => {

                            res.status = 200;
                            res.json(r);

                        }

                    );

                    console.log(r)

                } else {

                    reject(req,res)

                }

            });

        } else {

            reject(req,res)

        }

    }

);

app.get(
    "/getUserInfo",
    user.authorize,
    (req, res, next) => {

        if (req.authorized === true) {

            // Get language and locale
            let language,
                region,
                languages = langparser.parse(req.headers["accept-language"]);
            if (languages[0]) {

                if (languages[0].code) {

                    language = languages[0].code;

                }
                if (languages[0].region) {

                    region = languages[0].region.toLowerCase();

                }

            }
            if (languages[1]) {

                if (languages[1].code && !language) {

                    language = languages[1].code;

                }
                if (languages[1].region && !region) {

                    region = languages[1].region.toLowerCase();

                }

            }
            req.language = language;
            req.region = region;

            user.getUserInfo(
                req,
                res
            );

        } else {

            reject(req,res)

        }
    }
);

app.get(
    "/query",
    (req, res, next) => {

        const queryData = url.parse(
            req.url,
            true
        ).query;
        console.log(queryData.query)

        const combinedContent = Promise.all([
          new Promise(function(resolve, reject) {
            db_pg.admin.queryCollections(
                queryData.query,
                (e, r) => {

                    if (e) {

                      console.log(e)
                      reject(e)

                    }

                    resolve(r)

                });
            }),
          new Promise(function(resolve, reject) {
            db_pg.admin.queryCreators(
                queryData.query,
                (e, r) => {

                    if (e) {

                      console.log(e)
                      reject(e)

                    }

                    resolve(r)

                  });
              })
        ])
          .then(([collections, creators]) => {
           // content and comments have both finished loading.
           console.log("collections")
           console.log(collections)
           console.log("creators")
           console.log(creators)
            
           res.status(200)
           res.json({
             collections,
             creators
           })
            
        })

    }
)

app.get(
    "/sms",
    (req, res) => {

        const twiml = new MessagingResponse();

        console.log("sms");
        console.log(req.query);
        twiml.message("");

        res.writeHead(
            200,
            {"Content-Type": "text/xml"}
        );
        res.end(twiml.toString());

    }
);

app.post(
    "/addFolio",
    [user.authorize,upload.single("file")],
    (req, res, next) => {

        if (req.authorized === true) {

            var image, video, media_filename, media_filename_preview;

            if (req.file != undefined) {

                media_filename = `public/folio/${req.user_id}-folio${path.extname(req.file.originalname)}`;
                // write file
                fs.createWriteStream(media_filename).write(req.file.buffer);

                if (req.body.image) {

                  image = media_filename;

                } else if (req.body.video) {

                  video = media_filename;

                    // attempt to generate preview (requrires ffmpeg)
                    try {

                        media_filename_preview = media_filename + `-preview.jpg`;

                        setTimeout(() => {

                            exec(('ffmpeg -y -ss 00:00:01 -i ' 
                              + media_filename 
                              + ' -vframes 1 -qscale:v 5 -filter:v scale="720:-1" '
                              + media_filename_preview), function () {

                                console.log('Saved the thumb to:', media_filename_preview);

                            });

                        }, 1000);

                    } catch (e) {

                        console.error(e)
                      
                    }

                }

            } else {

              image = req.body.image;
              video = req.body.video;

            }

            db_pg.admin.updateFolio(
                req.user_id,
                req.body.name,
                req.body.title,
                req.body.about,
                image,
                video,
                media_filename_preview,
                req.body.effect,
                req.body.primaryColor,
                req.body.secondaryColor,
                true,
                (e, r) => {

                    res.json(r);

                }
            );

            return;

        } else {

            reject(req,res)

        }
    }
)

app.post(
    "/addPrivateFile",
    [user.authorize,upload.single("file")],
    (req, res, next) => {

        if (req.authorized === true) {

            user.isCreator(req, async (r) => {

                if (r === true) {

                    var media_filename, media_filename_preview, url, preview_url;

                    if (req.file) {

                        let file = req.file;

                        const hashSum = crypto.createHash('sha256');
                        hashSum.update(file.buffer);

                        const filehex = hashSum.digest('hex');
                        const media_filename = `private/files/${filehex}${path.extname(file.originalname)}`;
                        const original_filename = file.originalname;
                        const nft_address = req.body.nft_address;
                        var acl = '{}';

                        if (req.body.acl) {

                            acl = req.body.acl;

                        }

                        // write local file
                        fs.createWriteStream(media_filename).write(file.buffer);

                        if (req.body.is_content_ipfs == true) {

                            url = w3s.storeFile(req.file, function(cid) {
                                console.log('cid')
                                return 'ipfs://' + cid;
                            })

                        } else {

                            url =  process.env.VUE_APP_SERVER_URI + media_filename;

                        }

                        db_pg.admin.updatePrivateFile(
                            req.user_id,
                            media_filename,
                            media_filename_preview,
                            original_filename,
                            url,
                            acl,
                            (e, r) => {

                                res.json({
                                    "url": url,
                                    "preview_url": preview_url,
                                    "original_name": original_filename
                                });

                            }

                        );

                } else {

                    reject(req,res)

                }

            } else {

                reject(req,res)

            }

        });

    }

})

app.get(
    "/updateSocialMedia",
    user.authorize,
    (req, res) => {

        if (req.authorized === true) {

          const queryData = url.parse(
              req.url,
              true
          ).query;

          user.isCreator(req, (r) =>{

              if (r === true) {

                  db_pg.admin.updateSocialMedia(
                      req.user_id,
                      queryData.website,
                      queryData.instagram,
                      queryData.twitter,
                      queryData.twitch,
                      queryData.youtube,
                      (e, r) => {

                          if (r[0]) {
                            res.json({"status":"success"});
                          } else {
                            res.status = 200;
                            res.json({"status":"failed"});
                          }

                      }
                  );

              } else {

                  reject(req,res);

              }
          })

        } else {

            reject(req,res);

        }

})

app.post(
    "/addPost",
    user.authorize,
    (req, res, next) => {
    
        if (req.authorized === true && (req.body.content || req.body.preview)) {
          
            if (req.body.content === "" && req.body.preview.url === "") {
                  
                return reject(req,res);

            }

            var pid;
            if (parseInt(req.body.pid)) {
                pid = parseInt(req.body.pid)
            }

            user.isCreator(req, (r) =>{

                if (r === true) {

                    db_pg.admin.addPost(
                        req.user_id,
                        req.body.content,
                        req.body.preview,
                        pid,
                        (e, r) => {

                            if (r[0]) {
                              res.json(r[0]);
                            } else {
                              res.json({"status":"failed"});
                            }

                        }
                    );

                } else {

                    reject(req,res);

                }

            });

        } else {

            reject(req,res);

        }

    }

)

app.get(
    "/deletePost",
    user.authorize,
    (req, res, next) => {

        const queryData = url.parse(
            req.url,
            true
        ).query;
    
        if (req.authorized === true && queryData.pid) {
          

            var pid;
            if (parseInt(queryData.pid)) {

                pid = parseInt(queryData.pid)

            } else {

                return reject(req,res);

            }

            user.isCreator(req, (r) =>{

                if (r === true) {

                    db_pg.admin.deletePost(
                        req.user_id,
                        pid,
                        (e, r) => {

                            if (r) {
                              res.json({"status":"success"});
                            } else {
                              res.json({"status":"failed"});
                            }

                        }
                    );

                } else {

                    reject(req,res);

                }

            });

        } else {

            reject(req,res);

        }

    }

)

app.post(
    "/addNewsImage",
    [user.authorize,upload.single("file")],
    (req, res) => {

      if (req.body && req.file && req.body.id) {

          const filename = `public/images/news_item_${req.body.id}${path.extname(req.file.originalname)}`;

          fs.writeFile(
          filename,
          req.file.buffer,
          "binary",
          (err) => {

              if (!err) {

                  console.log(`${filename} created successfully!`);
                  res.send(200);

              } else {

                  console.log(err);
                  res.send(500);

              }

          })

    } else {

        res.status(400).send();

    }

});

app.post(
    "/stringToWeb3Storage",
    [user.authorize,upload.single("file")],
    (req, res) => {

        if (req.body.content) {

            console.log('fileToWeb3Storage req.body')
            console.log(req.body)

            w3s.storeString(req.body.content, req.body.name, function(cid) {

                // if the file requies a password
                if (req.body.password) {

                    db_pg.admin.addContentPassword(
                        cid,
                        req.body.password,
                        (e, r) => {

                            if (e) {

                                console.log(e)

                            }

                            res.status(200)
                            res.send(cid)

                        }
                    )

                } else {

                    res.status(200)
                    res.send(cid)

                }

            })

        } else {

            res.send(400);

        }

});

app.post(
    "/fileToWeb3Storage",
    [user.authorize,upload.single("file")],
    (req, res) => {

        if (req.file) {

            w3s.storeFile(req.file, function(cid) {

                // generate preview if video
                if (req.file.type === 'video') {

                    var image, video, media_filename, media_filename_preview;

                    media_filename = `public/files/${req.user_id}-${cid}${path.extname(req.file.originalname)}`;

                    // write file
                    fs.createWriteStream(media_filename).write(req.file.buffer);

                    video = media_filename;

                    // attempt to generate preview (requrires ffmpeg)
                    try {

                        media_filename_preview = media_filename + `-preview.jpg`;

                        setTimeout(() => {

                            exec(('ffmpeg -y -ss 00:00:01 -i ' 
                              + media_filename 
                              + ' -vframes 1 -qscale:v 5 -filter:v scale="720:-1" '
                              + media_filename_preview), function () {

                                console.log('Saved the thumb to:', media_filename_preview);

                                w3s.storeFileFromPath(media_filename_preview, function(pcid) {

                                    res.status(200).send([cid, pcid]);

                                })

                            });

                        }, 1000);

                    } catch (e) {

                        console.error(e)
                      
                    }

                } else {

                    res.status(200)
                    res.send(cid)

                }

            })

          /*
            ipfs.addNamedData(
                req.file.buffer.toString("base64"),
                filename,
                (response) => {

                    const file = {};
                    file.ipfsdata = response;
                    file.originalname = req.file.originalname;
                    file.name = req.file.originalname;
                    file.fieldname = req.file.fieldname;
                    file.encoding = req.file.encoding;
                    file.mimetype = req.file.mimetype;
                    file.size = req.file.size;
                    file.dimensions = req.body.dimensions;
                    file.index = req.body.index;
                    res.json(file);

                }
            );
            */
        } else {

            res.send(400);

        }

    }

);

app.post(
    "/addCollectionMedia",
    [user.authorize,upload.none()],
    (req, res) => {

        user.isCreator(req, function(r) {

            if (r === true) {

                var cids = [];

                if (req.body.metadata && req.body.nft_address) {

                    db_pg.admin.addCollectionMedia(
                        req.body.nft_address,
                        req.body.metadata,
                        req.user_id,
                        (e, r) => {

                            if (e) {

                              console.log(e)

                            } else {

                              res.json(r[0])

                            }

                        }

                    );

                      /*
                        w3s.storeJSON(req.body[i], function(e, cid) {

                            if (e) {

                              console.log(e)
                              return res.send(e)

                            } else {

                                cids.push(cid)

                                if (cids.length === req.body.length) {
                                  console.log('cids.length')
                                  console.log(cids.length)

                                    res.status(200)
                                    res.send(cids);

                                }

                            }

                        })
                      */

                } else {

                    res.send(400);

                }

            } else {
              
                reject(req,res);

            }

        });

    }

);

app.get(
    "/createProduct",
    user.authorize,
    (req, res, next) => {
      console.log('create product')

        if (req.authorized === true) {
          console.log('authorized')

            user.isCreator(req, async (r) => {

                const queryData = url.parse(
                    req.url,
                    true
                ).query;

                if (r === true) {

                    db_pg.admin.createProduct(
                        req.user_id,
                        (e, r) => {

                            if (parseInt(r[0].id)) {

                                res.send(r[0]);

                            } else {

                                res.status(500);
                                res.send();

                            }

                        }

                    );

                } else {

                    reject(req,res)

                }

            })

        } else {
          console.log('not authorized')

            reject(req,res)

        }

})

app.get(
    "/getProducts",
    user.authorize,
    (req, res, next) => {

        if (req.authorized === true) {

            user.isCreator(req, async (r) => {

                const queryData = url.parse(
                    req.url,
                    true
                ).query;

                if (r === true) {

                    db_pg.admin.getProducts(
                        req.user_id,
                        (e, r) => {

                          console.log(r)
                            res.json(r);

                    });

                } else {

                    reject(req,res)

                }

            })

        } else {

            reject(req,res)

        }

});

app.get(
    "/deleteProduct",
    user.authorize,
    (req, res, next) => {

        if (req.authorized === true) {

            user.isCreator(req, async (r) => {

                const queryData = url.parse(
                    req.url,
                    true
                ).query;

                if (r === true && queryData.id) {

                    db_pg.admin.deleteProduct(
                        req.user_id,
                        queryData.id,
                        (e, r) => {

                            res.send(200);

                        }

                    );

                } else {

                    reject(req,res)

                }

            })

        } else {

            reject(req,res)

        }

})

app.get(
    "/updateProduct",
    user.authorize,
    (req, res, next) => {

        if (req.authorized === true) {

            user.isCreator(req, async (r) => {

                const queryData = url.parse(
                    req.url,
                    true
                ).query;

                if (r === true && queryData.product) {

                    var p;
                    try {

                        p = JSON.parse(queryData.product);

                    } catch (e) {

                        res.send(e)

                    }

                    let price = p.price;
                    if (price.includes(".")) {

                        price = price.replace(".","");

                    }

                    db_pg.admin.updateProduct(
                        req.user_id,
                        p.id,
                        p.name,
                        p.description,
                        price,
                        p.currency,
                        p.stock,
                        p.attributes,
                        p.customizations,
                        p.media,
                        (e, r) => {

                            res.send(200);

                        }

                    );

                } else {

                    reject(req,res)

                }

            })

        } else {

            reject(req,res)

        }

})

app.post(
    "/addProductFile",
    [user.authorize,upload.single("file")],
    (req, res, next) => {

        if (req.authorized === true && req.file) {

            let file = req.file;

            user.isCreator(req, async (r) => {

                if (r === true) {

                    var media_filename_preview, url, preview_url;

                    const hashSum = crypto.createHash('sha256');
                    hashSum.update(file.buffer);

                    const filehex = hashSum.digest('hex');
                    const base_filename = `public/files/${filehex}`;
                    const media_filename = `public/files/${filehex}${path.extname(file.originalname)}`;
                    const original_filename = file.originalname;

                    // write file
                    fs.createWriteStream(media_filename).write(file.buffer);

                    if (req.body.type === 'video') {

                        // attempt to generate preview (requrires ffmpeg)

                        media_filename_preview = base_filename + `-preview.jpg`;

                        setTimeout(() => {

                            try {

                                exec(('ffmpeg -y -ss 00:00:01 -i ' 
                                  + media_filename 
                                  + ' -vframes 1 -qscale:v 5 -filter:v scale="720:-1" '
                                  + media_filename_preview), function (e,sto,ste) {

                                    /*
                                        console.log(e)
                                        console.log('sto')
                                        console.log(sto)
                                        console.log('ste')
                                        console.log(ste)
                                    */
                                    console.log('Saved the thumb to:', media_filename_preview);

                                });

                            } catch (e) {

                                console.error(e)
                              
                            }

                        }, 1000);

                    }

                    url =  process.env.VUE_APP_SERVER_URI + media_filename;

                    db_pg.admin.updateProductFile(
                        req.user_id,
                        media_filename,
                        media_filename_preview,
                        original_filename,
                        url,
                        (e, r) => {

                            res.json({
                                "id": r.id,
                                "url": r.url,
                                "media_filename": r.media_filename,
                                "media_filename_preview": r.media_filename_preview,
                                "original_filename": r.original_filename
                            });

                        }

                    );

            } else {

                reject(req,res)

            }

        });

    } else {

        reject(req,res)

    }

})

app.get(
    "/mintCollectionMedia",
    user.authorize,
    (req, res) => {

        user.isCreator(req, function(r) {

            if (r === true) {

                const queryData = url.parse(
                    req.url,
                    true
                ).query;

                if (queryData.ft_address && queryData.id) {

                    db_pg.admin.mintCollectionMedia(
                        queryData.nft_address,
                        queryData.id,
                        req.user_id,
                        (e, r) => {

                            if (e) {

                              console.log(e)

                            } else {

                              res.json(r)

                            }

                        }
                    );

                } else {

                    reject(req,res);

                }

            } else {

                reject(req,res);

            }

        })

    }

)

app.get(
    "/setVoucherMinted",
    user.authorize,
    (req, res) => {

        const queryData = url.parse(
            req.url,
            true
        ).query;

        if (queryData.nft_address && queryData.token_id && queryData.voucher_id && queryData.chain_id) {

            var chainId;
            if (queryData.chain_id == 137) {

                chainId = 'matic';

            } else if (queryData.chain_id == 1) {

                chainId = 'eth';

            } else {

              console.log("reject " + queryData.chain_id)
                reject(req,res);
                return;

            }

            eth_.isVoucherMinted (chainId, queryData.nft_address, queryData.voucher_id, (tokenId) => {

                if (queryData.token_id == tokenId) {

                    db_pg.admin.setVoucherMinted(
                        queryData.nft_address,
                        queryData.voucher_id,
                        (e, r) => {

                            if (e) {

                              console.log(e)
                              res.send(500)

                            } else {

                              res.json({
                                  "minted" : true
                              })

                            }

                    });

              } else {

                    res.send({
                        "minted" : false
                    })

                }

            });

        } else {

            reject(req,res);

        }

    }

)

app.get(
    "/deleteCollectionMedia",
    user.authorize,
    (req, res) => {

        user.isCreator(req, function(r) {

            if (r === true) {

                const queryData = url.parse(
                    req.url,
                    true
                ).query;

                if (queryData.nft_address && queryData.id) {

                    db_pg.admin.deleteCollectionMedia(
                        queryData.nft_address,
                        queryData.id,
                        req.user_id,
                        (e, r) => {

                            if (e) {

                              console.log(e)

                            } else {

                              res.json(r)

                            }

                        }
                    );

                } else {

                    reject(req,res);

                }

            } else {

                reject(req,res);

            }

        })

    }

)

app.get(
    "/getLastMintID",
    (req, res, next) => {

        const queryData = url.parse(
            req.url,
            true
        ).query;

        if (queryData.nft_address) {

            db_pg.admin.getLastMintID(
                queryData.nft_address,
                (e, r) => {

                    if (e) {

                        console.log(e)

                    } else {

                        if (r[0]) {

                            res.json({'id':r[0].max})

                        } else {

                            reject(req,res);

                        }

                    }

                }
            )

        } else {

            reject(req,res);

        }

    }

)

app.get(
    "/deleteProductMedia",
    user.authorize,
    (req, res) => {

        user.isCreator(req, function(r) {

            if (r === true) {

                const queryData = url.parse(
                    req.url,
                    true
                ).query;

                if (queryData.id) {

                    db_pg.admin.deleteProductMedia(
                        queryData.id,
                        req.user_id,
                        (e, r) => {

                            if (e) {

                              console.log(e)

                            } else {

                              res.json(r)

                            }

                        }
                    );

                } else {

                    reject(req,res);

                }

            } else {

                reject(req,res);

            }

        })

    }

)

app.get(
    "/getToken",
    (req, res) => {

        const queryData = url.parse(
            req.url,
            true
        ).query;

        db_pg.admin.getToken(
            queryData.address,
            queryData.tokenId,
            (e, r) => {

                if (e) {

                  console.log(e)

                } else {

                  res.status(200)
                  res.json(r[0])

                }

            }

        );

    }

)

app.get(
    "/getTokensByOwnerAddress",
    (req, res) => {

        const queryData = url.parse(
            req.url,
            true
        ).query;

        db_pg.admin.getTokensByOwnerAddress(
            queryData.address,
            (e, r) => {

                if (e) {

                  console.log(e)

                } else {

                  res.status(200)
                  res.json(r)

                }

            }
        );

    }

)

app.get(
    "/getTokensByCollectionAddress",
    (req, res) => {

        const queryData = url.parse(
            req.url,
            true
        ).query;

        db_pg.admin.getTokensByCollectionAddress(
            queryData.address,
            (e, r) => {

                if (e) {

                  console.log(e)

                } else {

                  res.status(200)
                  res.json(r)

                }

            }
        );

    }

)

app.get(
    "/getTrendingTokens",
    (req, res) => {

        db_pg.admin.getTrendingTokens(
            (e, r) => {

                if (e) {

                  console.log(e)

                } else {

                  res.status(200)
                  res.json(r)

                }

            }
        );

    }

)

app.get(
    "/getCollections",
    (req, res) => {

        db_pg.admin.getCollections(
            (e, r) => {

                if (e) {

                  console.log(e)

                } else {

                  res.status(200)
                  res.json(r)

                }

            }
        );

    }

)

app.get(
    "/getCollectionsByCreator",
    (req, res) => {

        const queryData = url.parse(
            req.url,
            true
        ).query;

        db_pg.admin.getCollectionsByCreator(
            queryData.name,
            (e, r) => {

                if (e) {

                  console.log(e)

                } else {

                  res.status(200)
                  res.json(r)

                }

            }
        );

    }

)

app.get(
    "/togglePromoted",
    user.authorize,
    (req, res) => {

        if (req.authorized === true) {

            user.isAdmin(req, (r) => {

                if (r === true) {

                    const queryData = url.parse(
                        req.url,
                        true
                    ).query;

                    db_pg.admin.setCreatorPromoted(
                        queryData.id,
                        queryData.value,
                        (e, r) => {

                            if (e) {

                              console.log(e)

                            } else {

                              res.status(200)
                              res.json(r)

                            }

                        }
                    );

                } else {

                    reject(req,res);

                }

            })

        } else {

            reject(req,res);

        }

    }

)

app.get(
    "/getNews",
    (req, res) => {

        db_pg.admin.getNews(
            (e, r) => {

                if (e) {

                  console.log(e)

                } else {

                  res.status(200)
                  res.json(r)

                }

            }
        );

    }

)

app.get(
    "/setNews",
    (req, res) => {

        const queryData = url.parse(
            req.url,
            true
        ).query;

        let news = {}
        try {

          news = JSON.parse(queryData.news)

        } catch(e) {

          console.log(e)

        }

        if (!news) {

            res.status(200)
            res.json(r)
            return;

        }

        db_pg.admin.setNews(
            news.id,
            news.title,
            news.text,
            news.link,
            (e, r) => {

                if (e) {

                  console.log(e)

                } else {

                  res.status(200)
                  res.json(r)

                }

            }
        );

    }

)

app.post(
    "/getCollectionMedia",
    user.authorize,
    (req, res) => {

        user.isCreator(req, function(r) {

            if (r === true) {

                var cids = [];

                if (req.body.token > 0 && req.body.nft_address) {

                    db_pg.admin.getCollectionMedia(
                        req.body.nft_address,
                        (e, r) => {

                            if (e) {

                              console.log(e)

                            } else {

                              res.json(r)

                            }

                        }
                    );

                }

            }

        })

    }

)

app.post(
    "/updateCollectionMedia",
    [user.authorize,upload.none()],
    (req, res) => {

        user.isCreator(req, function(r) {

            if (r === true) {

                var cids = [];

                if (req.body.metadata && req.body.id && req.body.nft_address) {

                    db_pg.admin.updateCollectionMedia(
                        req.body.nft_address,
                        req.body.metadata,
                        req.body.id,
                        req.user_id,
                        (e, r) => {

                            if (e) {

                              console.log(e)

                            } else {

                              res.json(r)

                            }

                        }
                    );

                } else {

                    reject(req,res);

                }

            } else {

                reject(req,res);

            }

        })

    }

)

app.post(
    "/jsonToWeb3Storage",
    [user.authorize,upload.none()],
    (req, res) => {

        user.isCreator(req, function(r) {

            if (r === true) {

                var cids = [];

                if (JSON.parse(JSON.stringify(req.body))) {

                    w3s.storeJSON(req.body, function(e, cid) {

                        
                        if (e) {

                          console.log(e)
                          return res.send(e)

                        } else {

                            res.status(200)
                            res.send("ipfs://" + cid)

                        }

                    })

                } else {

                    res.send(500);

                }

            } else {
              
                reject(req,res);

            }

        });

    }

);

app.post(
    "/addIPFSFile",
    upload.single("file"),
    (req, res) => {

        user.isCreator(req, function(r) {

            if (r === true) {

                if (req.file) {

                    const filename = `${req.body.account}-${req.file.originalname}`;
                  /*
                    ipfs.addNamedData(
                        req.file.buffer.toString("base64"),
                        filename,
                        (response) => {

                            const file = {};
                            file.ipfsdata = response;
                            file.originalname = req.file.originalname;
                            file.name = req.file.originalname;
                            file.fieldname = req.file.fieldname;
                            file.encoding = req.file.encoding;
                            file.mimetype = req.file.mimetype;
                            file.size = req.file.size;
                            file.dimensions = req.body.dimensions;
                            file.index = req.body.index;
                            res.json(file);

                        }
                    );
                    */
                } else {

                    res.send(500);

                }

            } else {
              
                reject(req,res);

            }

        });

    }

);

app.post(
    "/addIPFSMetadata",
    (req, res) => {

        let name;
        if (req.body.name) {

            name = req.body.name;

        } else if (req.body.title) {

            name = req.body.title;

        } else {

            res.send(501);

        }
        const filename = `${req.body.account}-${name}`;
        if (req.body) {
            /*
            ipfs.addNamedData(
                JSON.stringify(req.body),
                filename,
                (response) => {

                    res.json(response);

                }
            );
            */
        } else {

            res.send(500);

        }

    }
);

/*
app.get(
    "/getIPFS",
    upload.single("file"),
    (req, res) => {

        const queryData = url.parse(
            req.url,
            true
        ).query;
        if (queryData.cid) {

            ipfs.getCid(
                queryData.cid,
                (response, e) => {

                    if (e) {

                        res.sendStatus(500);

                    } else {

                        res.send(response);

                    }

                }
            );

        } else if (queryData.name) {

            ipfs.getName(
                queryData.name,
                (response, e) => {

                    if (e) {

                        res.sendStatus(500);

                    } else {

                        res.send(response);

                    }

                }
            );

        } else {

            res.json({"status": "failed",
                "message": "invalid parameters"});

        }

    }
);

app.get(
    "/lsIPFS",
    upload.single("file"),
    (req, res) => {

        const queryData = url.parse(
            req.url,
            true
        ).query;
        if (queryData.cid) {

            ipfs.lsData(
                queryData.cid,
                (response) => {

                    if (response) {

                        res.sendStatus(500);

                    } else {

                        res.send(response);

                    }

                }
            );

        } else {

            res.json({"status": "failed",
                "message": "invalid parameters"});

        }

    }
);
*/

app.get(
    "/getFolio",
    (req, res, next) => {

        const queryData = url.parse(
            req.url,
            true
        ).query;
        db_pg.admin.getFolioById(
            queryData.name,
            (e, r) => {

                if (e) {
                  console.log(e)
                }

                if (r) {
                  if (r.image) {
                    r.image = process.env.VUE_APP_SERVER_URI + r.image
                  } else if (r.video) {
                    r.video = process.env.VUE_APP_SERVER_URI + r.video
                    r.video_thumbnail = process.env.VUE_APP_SERVER_URI + r.video_thumbnail
                  }
                  res.json(r);
                } else {
                  res.json({});
                }

            }
        );

    }
);

app.get(
    "/getFolios",
    (req, res, next) => {

        db_pg.admin.getFolios(

            (e, r) => {

                for (var i in r) {
                    if (r[i].image) {
                      r[i].image = process.env.VUE_APP_SERVER_URI + r[i].image
                    } else if (r[i].video) {
                      r[i].video = process.env.VUE_APP_SERVER_URI + r[i].video
                      r[i].video_thumbnail = process.env.VUE_APP_SERVER_URI + r[i].video_thumbnail
                    }
                }
                res.json(r);

            }

        );

    }

);

app.get(
    "/getPosts",
    (req, res, next) => {

        const queryData = url.parse(
            req.url,
            true
        ).query;

        var name = queryData.name;
        var offset = queryData.offset;

        if (!parseInt(offset)) {

            offset = 0;

        }

        if (!name) {

            reject(req,res);
            return;

        }

        db_pg.admin.getPosts(
            name,
            offset,
            (e, r) => {

              if (e) {

                  console.error(e)

              }

              /*
                for (var i in r) {
                    if (r[i].image) {
                      r[i].image = process.env.VUE_APP_SERVER_URI + r[i].image
                    } else if (r[i].video) {
                      r[i].video = process.env.VUE_APP_SERVER_URI + r[i].video
                      r[i].video_thumbnail = process.env.VUE_APP_SERVER_URI + r[i].video_thumbnail
                    }
                }
              */
                res.json(r);

            }

        );

    }

);

app.get(
    "/getCreatorNameById",
    user.authorize,
    (req, res, next) => {

        db_pg.admin.getCreatorNameById(
            req.user_id,

            (e, r) => {

                res.json(r);

            }

        );

    }

);

app.get(
    "/getLinkPreview",
    user.authorize,

    (req, res, next) => {

        const queryData = url.parse(
            req.url,
            true
        ).query;

        if (queryData.url) {

            user.isCreator(req, function(r) {

                let ex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
                let rx = new RegExp(ex)

                if (!queryData.url.match(rx)) {

                    res.status(400)
                    res.send({})
                    return

                }

                if (r === true) {

                    try {

                        linkPreview.getLinkPreview(queryData.url,
                          {
                            headers: {
                              "host": "rareium.io",
                              "user-agent": "Twitterbot"
                            },
                            
                            followRedirects: "follow",
                            timeout: 3000
                          }
                        ).then((data) => {

                            console.debug(data)
                            res.json(data)

                        }).catch((e) => {

                            console.debug(e)
                            res.json({})

                        })

                    } catch (uncaughtException) {

                        console.error(uncaughtException)
                        return res.send(401)

                    }

                } else {

                    res.send(401)

                }

            });

        }

    }

);

app.get('/checkCreatorName', function(req,res,next) {

    const queryData = url.parse(
        req.url,
        true
    ).query;

    var name = queryData.name;

    db_pg['admin'].getCreatorNames(function(e,r) {

      if (e) {

          res.status = 400;
          res.json({'status':'failed','message':'please email contact@compdeep.com'});
          return;

      }

      let l = r.concat(['profile','collection','create','creator-sign-up','explore','trade','admin','art','manga','anime','v-tuber','vtuber','gotochi','game','gaming','nft']);

      if (l.includes(name)) {

          res.status(200);
          res.json(false);

      } else {

          res.status(200);
          res.json(true);

      }

    })

})
      

app.get('/contact',
    user.authorize,
    (req, res, next) => {

        if (req.authorized === true) {

          var queryData = url.parse(req.url, true).query;
          if (!(queryData.email && queryData.text && queryData.name && queryData.wallet && queryData.fullname)) {

            res.json({'status':'failed','message':'invalid parameters'});

          } else {

            // e-mail the team
            db_pg['admin'].getCreatorNames(function(e,r) {

              if (e) {

                  res.status = 400;
                  res.json({'status':'failed','message':'please email contact@compdeep.com'});
                  return;

              }

              let l = r.concat(['profile','collection','create','creator-sign-up','explore','trade','admin','art','manga','anime','v-tuber','vtuber','gotochi','game','gaming','nft']);

              if (l.includes(queryData.name)) {

                  res.status = 400;
                  res.json({'status':'failed','message':'Domain name unavailable, please email contact@compdeep.com'});
                  return;

              } else {

                  db_pg['admin'].addCreator(req.user_id, queryData.name, function(e,r) {

                      if (e) {

                          res.status = 400;
                          res.json({'status':'failed','message':'please email contact@compdeep.com'});
                          return;

                      }

                      // e-mail the team
                      
                      var mmail = {
                        from: queryData.email,
                        to: 'contact@compdeep.com',
                        subject: 'rareiumの新規作成依頼',
                        html: '<html>' 
                          + "<br />"
                          + "<br />"
                          + "名前 : " + queryData.fullname 
                          + "<br />"
                          + "<br />"
                          + "ドメイン名 : " + queryData.name 
                          + "<br />"
                          + "<br />"
                          + "SNS : " + queryData.sns
                          + "<br />"
                          + "<br />"
                          + "email : " + queryData.email
                          + "<br />"
                          + "<br />"
                          + "web3 address : " + queryData.wallet
                          + "<br />"
                          + "<br />"
                          + queryData.text
                          + '</html>'
                      }
                      mailer.sendMail(mmail)

                      var smail = {
                        from: queryData.email,
                        to: 'support@rareium.io',
                        subject: 'rareiumの新規作成依頼',
                        html: '<html>' 
                          + "<br />"
                          + "<br />"
                          + "名前 : " + queryData.fullname 
                          + "<br />"
                          + "<br />"
                          + "ドメイン名 : " + queryData.name 
                          + "<br />"
                          + "<br />"
                          + "email : " + queryData.email
                          + "<br />"
                          + "<br />"
                          + "web3 address : " + queryData.wallet
                          + "<br />"
                          + "<br />"
                          + queryData.text
                          + '</html>'
                      }

                      mailer.sendMail(smail)
                      db_pg['admin'].contact(queryData.email, queryData.name, queryData.text, function(e,r) {
                        if (r) {
                          res.json({'status':'success'});
                        } else {
                          res.json({'status':'failed','message':'please email contact@compdeep.com'});
                        }
                      });

                  })

                }

            });

        }

    } else {
      
        reject(req,res);

    }

});

app.use(
    "/",
    express.static(`${__dirname}/serve/`)
);
app.use(
    "/profile",
    express.static(`${__dirname}/serve/`)
);
app.use(
    "/tokuteishotorihiki",
    express.static(`${__dirname}/serve/`)
);
app.use(
    "/about",
    express.static(`${__dirname}/serve/`)
);
app.use(
    "/howitworks",
    express.static(`${__dirname}/serve/`)
);
app.use(
    "/create",
    express.static(`${__dirname}/serve/`)
);
app.use(
    "/creator",
    express.static(`${__dirname}/serve/`)
);
app.use(
    "/product",
    express.static(`${__dirname}/serve/`)
);
app.use(
    "/privacy",
    express.static(`${__dirname}/serve/`)
);
app.use(
    "/terms",
    express.static(`${__dirname}/serve/`)
);
app.use(
    "/about",
    express.static(`${__dirname}/serve/`)
);
app.use(
    "/tokuteishotorihiki",
    express.static(`${__dirname}/serve/`)
);
app.use(
    "/creator-sign-up",
    express.static(`${__dirname}/serve/`)
);

app.use(
    "/admin",
    user.authorize,
    (req, res, next) => {

        if (req.authorized === true) {

            user.isAdmin(req, (r) =>{

                if (r === true) {

                    express.static(`${__dirname}/serve/`)
                    next();

                } else {

                    reject(req,res);

                }

            });

        } else {

            reject(req,res);

        }
      
    },

);

app.use(
    "/public",
    express.static(`${__dirname}/public/`, { redirect: false })
);

/*
app.use(
    "/public/images",
    express.static(`${__dirname}/public/images/`, { redirect: false })
);
app.use(
    "/public/imgcache",
    express.static(`${__dirname}/public/imgcache`, { redirect: false })
);
*/
// gooogle verify
app.get('/google8e9f3dfc774daa92.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/google8e9f3dfc774daa92.html'));
});

app.get('/private/files/:file', (req, res) => {

  console.log("GET PRIVATE FILE")
  var queryData = url.parse(req.url, true).query;
  console.log("queryData")
  console.log(queryData)
  console.log(queryData.chainId)
  console.log("req.query")
  console.log(req.query)
  console.log("req.params")
  console.log(req.params)

  /*
  reject(req,res);
  return;
*/
  eth_.getUserTokenBalance(req.params.chainId, req.params.contractAddress, req.params.userAddress, req.params.tokenId, (balance)=> {

      let f = process.env.VUE_APP_SERVER_URI + 'private/files/' + req.params.file;

      db_pg.admin.getPrivateFile(f, (e, r)=> {

          if (e) {

              console.log(e)
              res.send(500)
              return;

          }

          "getPrivateFile"
          console.log(r)
          console.log(r.acl)

          const filePath = path.join(__dirname, 'private/files', req.params.file);

          if (fs.existsSync(filePath)) {

              res.sendFile(filePath);

          } else {

              res.send(404);

          }

      });

  })

});

app.get('/public/images/:image', (req, res) => {

  const filePath = path.join(__dirname, 'public/images', req.params.image);

  if (fs.existsSync(filePath)) {

      res.sendFile(filePath);

  } else {

      res.send(404);

  }

});

app.get('/public/imgcache/:image', (req, res) => {

  const filePath = path.join(__dirname, 'public/imgcache', req.params.image);

  if (fs.existsSync(filePath)) {

      res.sendFile(filePath);

  } else {

      res.send(404);

  }

});

app.get('/public/files/:file', (req, res) => {
  console.log("req.params")
  console.log(req.params)

  const filePath = path.join(__dirname, 'public/files', req.params.file);

  if (fs.existsSync(filePath)) {

      res.sendFile(filePath);

  } else {

      res.send(404);

  }

});

app.use(
    "/bibi/",
    user.authorize,
    (req, res, next) => {

        if (req.authorized === false) {

            reject(req,res);
            return;

        }

      
      /*
        console.log("BIBI req");
        console.log("req.url");
        console.log(req.url);
        console.log("req.originalUrl");
        console.log(req.originalUrl);
        console.log(req.query);
*/
        if (req.query && req.url) {

            if (req.query.book) {

                if (req.query.book.includes('.epub')) {

                    // let f = process.env.VUE_APP_SERVER_URI + 'private/files/' + req.params.file;
                    if (!(req.query.chainId && req.query.contractAddress && req.query.userAddress && req.query.tokenId)) {

                        reject(req,res);
                        return;

                    }

                    db_pg.admin.getPrivateFile(req.query.book, async (e, r)=> {

                        if (r.length > 0) {

                            var collection = r[0].acl.collection;

                            // ensure supplied correction is in ACL (TODO support mulpitle acls)
                            if (req.query.contractAddress === collection) {

                                let hasAccount = await db_pg.admin.hasUserAccount(req.user_id, req.query.userAddress);
                                let isOwner = await db_pg.admin.getCollectionOwner(req.user_id, req.query.contractAddress);

                                // ensure supplied account is known for this user (this can allow for more than one address per account(user id))
                                // TODO loop through all potential accounts
                                if (!(parseInt(hasAccount[0].count) > 0)) {

                                    // account supplied is not registered to user
                                    reject(req,res);
                                    return;

                                }

                                // check user token alance
                                eth_.getUserTokenBalance(req.query.chainId, collection, req.query.userAddress, req.query.tokenId, (balance)=> {

                                    // user request is now authenticated, next authorization. First token balance

                                    if (!(balance > 0)) {

                                        // reject if the account is not the contract owner
                                        if (!(isOwner.length > 0)) {

                                            console.log("not owner and no balance")

                                            reject(req,res);
                                            return;

                                        }

                                        if (isOwner[0].owner_address != req.query.userAddress) {

                                            console.log("not owner and no balance")

                                            reject(req,res);
                                            return;

                                        }

                                        // Finally authorize the document

                                        // IS OWNER - contine
                                        console.log('IS OWNER')

                                    }

                                    next();

                                })

                            } else {

                                res.send(401);
                                return;

                            }

                        } else {

                         //   res.send(401);
                         //   return;
                            next();

                        }

                    });

                } else {

                    next();

                }

            } else {

                next();

            }

        } else {

           next();

        }

    },
    express.static(`${__dirname}/bibi/`)
);
app.use(
    "/assets/",
    express.static(`${__dirname}/serve/assets/`)
);
app.use(
    "/*",
    express.static(`${__dirname}/serve/`)
);

/*
app.get(':page', function(req , res){
  res.render('article' + req.params.id);
  express.static(`${__dirname}/creator`)
});
*/

/*
 * catchall for any unknown errors.
 */
process.on('uncaughtException', function (err) {
    console.error((new Date).toUTCString() + ' uncaughtException:', err.message)
    console.error(err.stack)
})

const server = app.listen(
    process.env.PORT,
    () => {

        console.log("Web app listening on port " + process.env.PORT);

    }
);

