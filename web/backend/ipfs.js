const TCP = require("libp2p-tcp");
const isIPFS = require("is-ipfs");

class InvokeIPFS {

    constructor () {

        this.addData = this.addData.bind(this);
        this.addNamedData = this.addNamedData.bind(this);
        this.getName = this.getName.bind(this);
        this.getCid = this.getCid.bind(this);
        this.lsCid = this.lsCid.bind(this);
        this.lsName = this.lsName.bind(this);
        const main = async () => {

                const {create} = await import("ipfs-core");
                // Return await IPFS.create({
                return await create({
                    "Routing": "dht",
                    "offline": true,
                    "config": {
                        "Addresses": {
                            "Swarm": [

                            /*
                             *  These are public webrtc-star servers
                             * '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
                             * '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star'
                             */
                            ]
                        },
                        "dht": {
                            "enabled": true,
                            "clientMode": true
                        },
                        "ipns": {
                            "enabled": true
                        },
                        "modules": {
                        // Ipns: [ipns]
                        }

                    /*
                     * Transport: [TCP],
                     *  This removes the default IPFS peers to dial to. You can specify any known addresses you wish, or leave blank.
                     * Bootstrap: []
                     */
                    }
                });

            },
            this_ = this;

        main().then((n) => {

            this_.node = n;

        });

    }

    async addData (buffer, callback) {

        const ipfsdata = await this.node.add(buffer);
        callback(ipfsdata);

    }

    async addNamedData (buffer, filename, callback) {

        const ipfsdata = await this.node.add(buffer);
        let key;
        for await (const k of await this.node.key.list()) {

            if (k.name === filename) {

                key = k;

            }

        }
        if (!key) {

            try {

                key = await this.node.key.gen(
                    filename,
                    {
                        "type": "rsa",
                        "size": 2048
                    }
                );

            } catch (e) {

                console.log(e);
                return callback();

            }

        }
        try {

            const name = await this.node.name.publish(
                `/ipfs/${ipfsdata.path}`,
                {
                    "key": key.name,
                    "resolve": true,
                    "allowOffline": true,
                    "lifetime": 31556926000
                }
            );
            callback(name);

        } catch (e) {

            console.log(e);
            this.node.key.rm(key.name);
            callback();

        }

    }

    async getCid (cid, callback) {

        if (isIPFS.cid(cid)) {

            const stream = this.node.cat(cid);
            let data = "";

            for await (const chunk of stream) {

                data += chunk.toString();

            }
            callback(data);

        } else {

            callback();

        }

    }

    async getName (name, callback) {

        const addr_ = `/ipns/${name}`;
        if (isIPFS.ipnsPath(addr_)) {

            let stream;
            try {

                for await (const n of this.node.name.resolve(addr_)) {

                    stream = this.node.cat(n);

                }

            } catch (e) {

                console.log(e);

            }

            let data = "";
            try {

                for await (const chunk of stream) {

                    data += chunk.toString();

                }

            } catch (e) {

                console.log(e);

            }
            callback(data);

        } else {

            callback();

        }

    }

    async lsCid (cid, callback) {

        if (isIPFS.cid(cid)) {

            for await (const file of this.node.ls(cid)) {

                if (file.size > 0) {

                    return callback(true);

                }

            }
            callback(false);

        } else {

            callback(false);

        }

    }

    async lsName (name, callback) {

        const addr_ = `/ipns/${name}`;
        console.log("addr_");
        console.log(addr_);
        if (isIPFS.ipnsPath(addr_)) {

            let ipfsPath;
            try {

                for await (const n of this.node.name.resolve(addr_)) {

                    ipfsPath = n;
                    console.log("ipfsPath");
                    console.log(ipfsPath);

                }

            } catch (e) {

                console.log(e);
                return callback(false);

            }
            console.log("ipfsPath");
            console.log(ipfsPath);
            try {

                for await (const file of this.node.ls(ipfsPath)) {

                    if (file.size > 0) {

                        return callback(true);

                    }

                }

            } catch (e) {

                console.log(e);

            }
            callback(false);

        } else {

            callback(false);

        }

    }

}

module.exports = InvokeIPFS;
