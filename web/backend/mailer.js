/*
 * Wrapper for Mailgun
 */

// const mailgun = require("mailgun-js");
import mailgun from "mailgun-js";
import fs from "fs";

class Mailgun {

    constructor () {

        this.sendMail = this.sendMail.bind(this);
        this.mg = mailgun({"apiKey": process.env.MAIL_API_KEY,
            "domain": "compdeep.com",
            "host": "api.mailgun.net"});

    }

    sendMail (mail) {

        console.log(mail);
        this.mg.messages().send(
            mail,
            (error, body) => {

                if (error) {

                    console.log(error);

                }
                console.log(body);

            }
        );

    }

}

export default Mailgun;
