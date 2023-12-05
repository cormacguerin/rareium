// const crypto = require("crypto");
import crypto from "crypto";

class cds {

    constructor () {

        this.getSigningKey = this.getSigningKey.bind(this);
        this.genSignature = this.genSignature.bind(this);

    }

    getSignedHeaders (headers) {

        let header_keys = Object.keys(headers),
            signed_headers_str = "";
        for (const i in header_keys.sort()) {

            if (!headers[header_keys[i]]) {

                headers[header_keys[i]] = "";

            }
            const h = `${header_keys[i].toString().toLowerCase()}:${headers[header_keys[i]].toString().toLowerCase()}\n`;
            signed_headers_str += h;

        }
        return signed_headers_str;

    }

    getQueryParameters (params) {

        let query_parameters = "";
        for (const i in params) {

            if (params[i]) {

                const v = `${i}=${encodeURIComponent(params[i])}&`;
                query_parameters += v;

            }

        }
        query_parameters = query_parameters.replace(
            /&$/,
            ""
        );
        return query_parameters;

    }

    getSigningKey (key_secret, key_datestamp, key_name, key_scope) {

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

    }

    hmac (key, string, encoding) {

        return crypto.createHmac(
            "sha256",
            key
        ).update(
            string,
            "utf8"
        ).
            digest(encoding);

    }

    hash (string, encoding) {

        return crypto.createHash("sha256").update(
            string,
            "utf8"
        ).
            digest(encoding);

    }

    genSignature (host, keyId, keyName, apiScope, secretKey, method, path, headers, params) {

        const datestamp = new Date().getTime().
                toString(),
            credential = `${keyId}/${datestamp}/${apiScope}/lt_request`,

            signing_string = `${method}\n${
                host}\n${
                path}\n${
                this.getQueryParameters(params)}\n${
                this.getSignedHeaders(headers)}`,

            signing_key = this.getSigningKey(
                secretKey,
                datestamp,
                keyName,
                apiScope
            ),
            signature = this.hmac(
                signing_key,
                signing_string,
                "hex"
            );

        return `LT-HMAC-SHA256 Credential=${credential},SignedHeaders=${Object.keys(headers).join(";").
            toLowerCase()},Signature=${signature}`;

    }

}

export default cds;
