import {File, Web3Storage, getFilesFromPath} from "web3.storage";
import {CID} from "multiformats/cid";
import {CarReader} from "@ipld/car";
import {Stream} from "stream";
import {TreewalkCarSplitter} from "carbites/treewalk";
// import fetch from "node-fetch";
import Axios from "axios";
import fs from "fs";
import path from "path";
import * as json from "multiformats/codecs/json";
import * as raw from "multiformats/codecs/raw";
import {sha256} from "multiformats/hashes/sha2";

// TODO perhaps this is not the best place to be doing image processing, break out
import sharp from "sharp";

class W3S {

    constructor () {

        const main = async () => new Web3Storage({"token": process.env.WEB3STORAGE_TOKEN});

        main().then((c) => {

            this.client = c;
            this.processUploads(100, 5000);

        });

    }

    async storeJSON (nft, callback) {

        let obj;
        try {

            obj = JSON.parse(JSON.stringify(nft));

        } catch (e) {

            console.log(" try json e");
            console.log(e);
            callback(e);
            return;

        }
        const buffer = Buffer.from(JSON.stringify(obj)),
            file = new File(
                [buffer],
                "metadata.json"
            ),
            cid = await this.client.put(
                [file],
                {"wrapWithDirectory": false}
            );

        console.log(
            "stored nft with cid:",
            cid
        );
        callback(
            null,
            cid
        );

    }

    /*
     * Function to store a string
     * TODO : json should be the smae
     */
    async storeString (str, name, callback) {

        const buffer = Buffer.from(str),
            file = new File(
                [buffer],
                name
            ),
            cid = await this.client.put(
                [file],
                {"wrapWithDirectory": false}
            );

        console.log(
            "stored nft with cid:",
            cid
        );
        callback(cid);

    }

    /*
     * Convenience function to store a javascript File
     */
    async storeFile (file, callback) {

        const buffer = file.buffer,
            bytes = file.buffer,
            hash = await sha256.digest(raw.encode(bytes)),
            cid_ = CID.create(
                1,
                raw.code,
                hash
            );

        console.log(`root cid : ${cid_}`);
        const dir = `./public/files/${cid_}/`;

        if (!fs.existsSync(dir)) {

            fs.mkdirSync(dir);

        }

        const filename = `${dir}/${cid_}${path.extname(file.originalname)}`;

        // write file
        await fs.createWriteStream(filename).write(file.buffer);
        const files = await getFilesFromPath(`./public/files/${cid_}/`);

        // reset filename (otherwise it always directory wraps)
        files[0].name = `${cid_}${path.extname(file.originalname)}`;

        const cid = await this.client.put(
            [files[0]],
            {"wrapWithDirectory": false}
        );

        console.log(
            "stored files with cid:",
            cid
        );
        callback(cid);

    }

    async storeFileFromPath (file, callback) {

        const files = await getFilesFromPath(file);

        // reset filename (otherwise it always directory wraps)
        files[0].name = path.basename(file);

        const cid = await this.client.put(
            [files[0]],
            {"wrapWithDirectory": false}
        );

        console.log(
            "stored files with cid:",
            cid
        );
        callback(cid);

    }

    async processUploads (days, maxResults) {

        console.log("processUploads");

        const d = new Date();
        d.setDate(d.getDate() - days);

        const before = d.toISOString(),

            wait = (ms) => new Promise((res) => setTimeout(
                res,
                ms
            ));

        /*
         * let r = await this.client.list({ before, maxResults })
         * for await (const upload of this.client.list({ before, maxResults })) {
         */
        for await (const upload of this.client.list()) {

            const uri = `https://w3s.link/ipfs/${upload.cid}`;
            console.log(uri);

            this.cacheIPFSImage(
                uri,
                (r) => {

                    console.log(r);

                }
            );

            await wait(2000);

        }

        // repeat on the hour
        await wait(3600000)
        this.processUpload();

    }

    // image caching function
    async cacheIPFSImage (url, callback) {

        return Axios({

            "method": "get",
            url,
            "responseType": "stream"

        }).then((response) => {

            const cid = url.substring(url.lastIndexOf("/") + 1);

            if (cid.length < 10) {

                return callback({"status": "failed",
                    "reason": "invalid cid"});

            }

            if (response.headers["content-type"] != "image/png") {

                return callback({"status": "failed",
                    "reason": `invalid type ${response.headers["content-type"]}`});

            }

            console.log(response.headers["content-type"]);

            /*
             *const stream = response.data;
             *
             *stream.on('data', data => {
             *
             *    console.log(data);
             *
             *});
             *
             *stream.on('end', () => {
             *
             *    console.log("stream done");
             *
             *});
             */

            const sharpStream = sharp({"failOn": "error"}),
                promises = [],

                small_image = `./public/imgcache/${cid}_s.jpg`,
                large_image = `./public/imgcache/${cid}_l.jpg`;

            response.data.pipe(sharpStream);

            promises.push(sharpStream.
                clone().
                resize({"width": 320}).
                jpeg({
                    "quality": 95,
                    "chromaSubsampling": "4:4:4",
                    "force": true
                }).
                toFile(small_image));

            promises.push(sharpStream.
                clone().
                resize({"width": 720}).
                jpeg({
                    "quality": 95,
                    "chromaSubsampling": "4:4:4",
                    "force": true
                }).
                toFile(large_image));

            Promise.all(promises).
                then((r) => {

                    callback({

                        "status": "success",
                        "small": process.env.VUE_APP_SERVER_URI + small_image,
                        "large": process.env.VUE_APP_SERVER_URI + large_image

                    });

                }).
                catch((err) => {

                    console.error(
                        "error processing stream",
                        err
                    );

                    try {

                        console.log("try to unlink if files exist");

                        if (fs.existsSync(small_image)) {

                            fs.unlinkSync(small_image);

                        }

                        if (fs.existsSync(large_image)) {

                            fs.unlinkSync(large_image);

                        }

                        return callback({"status": " failed",
                            "reason": "unknown",
                            "error": err});

                    } catch (e) {

                        console.log(e);
                        return callback({"status": "failed",
                            "reason": "unlink error",
                            "error": e});

                    }

                });

        });

    }

    async splitCars (largeCar) {

        // const largeCar = await loadLargeCar();
        const targetSize = 2000,
            splitter = new TreewalkCarSplitter(
                largeCar,
                targetSize
            ),
            i = 0;
        let cid;
        for await (const smallCar of splitter.cars()) {

            // Each small car is an AsyncIterable<Uint8Array> of CAR data
            const reader = await CarReader.fromIterable(smallCar),
                cid_ = await this.client.putCar(reader);
            console.log(`sub cid ${cid_}`);
            cid = cid_;

            /*
             * for await (const chunk of smallCar) {
             *  Do something with the car data...
             *  For example, you could upload it to the web3.storage HTTP API
             *  https://web3.storage/docs/http-api.html#operation/post-car
             * }
             *  You can also get the root CID of each small CAR with the getRoots method:
             *  const roots = await smallCar.getRoots();
             *  console.log('smallCar root cids', roots);
             *  Since we're using TreewalkCarSpliter, all the smaller CARs should have the
             *  same root CID as the large input CAR.
             */

        }

    }

    /*
     *upload () {
     *
     *    const body = {
     *        "ids": ["4e4e4e4e-4e4e-4e4e-4e4e-4e4e4e4e4e4e"]
     *    };
     *
     *    fetch(
     *        " https://api.web3.storage/car",
     *        {
     *            "method": "POST",
     *            "body": JSON.stringify(body),
     *            "headers": {
     *                "accept": "application/json",
     *                "x-api-key": process.env.WEB3STORAGE_TOKEN,
     *                "Content-Type": "application/json"
     *            }
     *        }
     *    ).
     *        then((res) => res.json()).
     *        then((json) => console.log(json)).
     *        catch((err) => console.log(err));
     *
     *}
     */

    genRandStr = function () {

        return (new Date().getSeconds() * Math.random()).toString(36).replace(
            ".",
            ""
        );

    };

}

export default W3S;
