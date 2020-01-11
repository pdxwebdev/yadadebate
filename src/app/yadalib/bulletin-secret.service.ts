import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';


declare var foobar;
declare var forge;

@Injectable({
  providedIn: 'root'
})
export class BulletinSecretService {
    key = null;
    bulletin_secret = null;
    keyname = null;
    keykeys = null;
    username = null;
    constructor(
        private storage: Storage
    ) {}

    shared_encrypt(shared_secret, message) {
        var key = forge.pkcs5.pbkdf2(forge.sha256.create().update(shared_secret).digest().toHex(), 'salt', 400, 32);
        var cipher = forge.cipher.createCipher('AES-CBC', key);
        var iv = '';
        cipher.start({iv: iv});
        cipher.update(forge.util.createBuffer(iv + message));
        cipher.finish()
        return cipher.output.toHex()
    }

    get() {
        return this.all()
        .then((keys: any) => {
            return this.setKeyName(keys);
        })
        .then(() => {
            return this.setKey();
        });
    }

    setKeyName(keys) {
        return new Promise((resolve, reject) => {
            keys.sort(function (a, b) {
                if (a.idx < b.idx)
                    return -1
                if ( a.idx > b.idx)
                    return 1
                return 0
            });
            if (!this.keyname) {
                return this.storage.get('last-keyname').then((key) => {
                    if(key && typeof key == 'string') {
                        this.keyname = key;
                    } else {
                        this.keyname = keys[0].idx
                    }
                    return resolve(keys);
                })
                .catch((err) => {
                    return reject();
                });
            } else {
                return resolve(keys);
            }
        });
    }

    setKey() {
        return new Promise((resolve, reject) => {
            this.storage.get(this.keyname).then((key) => {
                this.key = foobar.bitcoin.ECPair.fromWIF(key);
                this.username = this.keyname.substr('usernames-'.length);
                this.bulletin_secret = this.generate_bulletin_secret();
                return resolve();
            });
        });
    }

    generate_bulletin_secret() {
        return foobar.base64.fromByteArray(this.key.sign(foobar.bitcoin.crypto.sha256(this.username)).toDER());
    }

    set(key) {
        return new Promise((resolve, reject) => {
            this.keyname = key;
            return this.storage.set('last-keyname', key)
            .then(() => {
                return this.storage.remove('usernames-');
            })
            .then((key) => {
                return this.get();
            })
            .then(() => {
                return this.setKey();
            })
            .then(() => {
                return resolve();
            })
            .catch(() => {
                return reject();
            });
        });
    }

    create(username) {
        return new Promise((resolve, reject) => {
            if (!username) return reject();
            this.keyname = 'usernames-' + username;
            this.storage.set('last-keyname', this.keyname);

            this.username = username;
            this.key = foobar.bitcoin.ECPair.makeRandom();
            this.storage.set(this.keyname, this.key.toWIF());
            this.bulletin_secret = this.generate_bulletin_secret();
            return this.get().then(() => {
                return resolve();
            });
        });
    }

    import (keyWif, username) {
        return new Promise((resolve, reject) => {
            if (!username) return reject();
            this.keyname = 'usernames-' + username;
            this.storage.set('last-keyname', this.keyname);
            
            this.username = username;
            this.storage.set(this.keyname, keyWif.trim());
            this.key = foobar.bitcoin.ECPair.fromWIF(keyWif.trim());
            this.bulletin_secret = this.generate_bulletin_secret();
            return this.get().then(() => {
                return resolve();
            });
        });
    }

    all() {
        return new Promise((resolve, reject) => {
            var keykeys = [];
            this.storage.forEach((value, key) => {
                if (key.substr(0, 'usernames-'.length) === 'usernames-') {
                    keykeys.push({key: value, idx: key});
                }
            })
            .then(() => {
                this.keykeys = keykeys;
                resolve(keykeys);
            });
        });
    }

    decrypt(message) {
        var key = forge.pkcs5.pbkdf2(forge.sha256.create().update(this.key.toWIF()).digest().toHex(), 'salt', 400, 32);
        var decipher = forge.cipher.createDecipher('AES-CBC', key);
        var enc = this.hexToBytes(message);
        decipher.start({iv: enc.slice(0,16)});
        decipher.update(forge.util.createBuffer(enc.slice(16)));
        decipher.finish();
        return decipher.output
    }

    hexToBytes(s) {
        var arr = []
        for (var i = 0; i < s.length; i += 2) {
            var c = s.substr(i, 2);
            arr.push(parseInt(c, 16));
        }
        return String.fromCharCode.apply(null, arr);
    }
}