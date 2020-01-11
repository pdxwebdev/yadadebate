import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs/operators';
import { BulletinSecretService } from './bulletin-secret.service';
import { WalletService } from './wallet.service';
import { TransactionService } from './transaction.service';
import { SettingsService } from './settings.service';

declare var X25519;

@Injectable({
  providedIn: 'root'
})
export class PeerService {
    seeds = null;
    loading = false;
    mode: any;
    failedSeedPeers: any;
    peerLocked: any;
    failedConfigPeers: any;
    constructor(
        private ahttp: HttpClient,
        public walletService: WalletService,
        public transactionService: TransactionService,
        public bulletinSecretService: BulletinSecretService,
        public settingsService: SettingsService,
        public storage: Storage
    ) {
        this.seeds = [
            // {"host": "0.0.0.0","port": 8000 },
            // {"host": "34.237.46.10","port": 80 },
            // {"host": "51.15.86.249","port": 8000 },
            // {"host": "178.32.96.27","port": 8000 },
            // {"host": "188.165.250.78","port": 8000 },
            // {"host": "116.203.24.126","port": 8000 }
        ]
        this.mode = false;
        this.failedSeedPeers = new Set();
        this.failedConfigPeers = new Set();
    }

    go() {
        return new Promise(this.peerRoutine.bind(this));
    }

    peerRoutine(resolve, reject) {
        this.peerLocked = false;
        if (this.loading) return;
        this.loading = true;
        return this.storage.get('node')
        .then((node) => {
            return new Promise((resolve2, reject2) => {
                try{
                    var seedPeer = '';
                    if (node && !this.failedSeedPeers.has(node)) {
                        this.settingsService.remoteSettingsUrl = node;
                    } else {
                        var min = 0; 
                        var max = this.seeds.length - 1;
                        var number = Math.floor(Math.random() * (+max - +min)) + +min;
                        if (!this.seeds[number]) return reject(false);
                        seedPeer = 'http://' + this.seeds[number]['host'] + ':' + this.seeds[number]['port'];
                        while (this.failedSeedPeers.has(seedPeer)) {
                            number = Math.floor(Math.random() * (+max - +min)) + +min;
                            if (!this.seeds[number]) return reject(false);
                            seedPeer = 'http://' + this.seeds[number]['host'] + ':' + this.seeds[number]['port'];
                        }
                    }
                    return resolve2(seedPeer);
                }
                catch(err) {
                    return reject2();
                }
            })
            .catch(() => {
                return reject();
            })
        })
        .then((seedPeer) => {
            if(this.settingsService.remoteSettingsUrl) {
                return this.getConfig();
            } else {
                return this.getPeers(seedPeer);
            }
        })
        .then((step) => {
            if(step === 'config') {
                return this.getConfig();
            }
            return new Promise((resolve2, reject2) => {
                return resolve2();
            });
        })
        .then(() => {
            return new Promise((resolve2, reject2) => {
                return this.walletService.get()
                .then(() => {
                    return resolve2();
                })
                .catch((err) => {
                    this.failedConfigPeers.add(this.settingsService.remoteSettingsUrl);
                    return reject2('config')
                });
            })
        })
        .then(() => {
            return this.setupRelationship();
        })
        .then(() => {
            this.peerLocked = true;
            return this.storage.set('node', this.settingsService.remoteSettingsUrl);
        })
        .then(() => {
            return resolve(true);
        })
        .catch((e) => {
            this.settingsService.remoteSettings = {};
            this.settingsService.remoteSettingsUrl = null;
            this.loading = false;
            return reject();
            //this.storage.remove('node');
            // setTimeout(() => {
            //     this.peerRoutine(resolve, reject);
            // }, 100)
        });
    }

    getPeers(seedPeer) {
        return new Promise((resolve, reject) => {
            this.ahttp.get(seedPeer + '/get-peers').pipe(timeout(1000)).subscribe(
                (res) => {
                    var peers = res['peers'];
                    var min = 0; 
                    var max = peers.length - 1;
                    var number = Math.floor(Math.random() * (+max - +min)) + +min;
                    if (!peers[number]) return reject(false);
                    this.settingsService.remoteSettingsUrl = 'http://' + peers[number]['host'] + ':' + peers[number]['port'];
                    while (this.failedConfigPeers.has(this.settingsService.remoteSettingsUrl)) {
                        number = Math.floor(Math.random() * (+max - +min)) + +min;
                        if (!peers[number]) return reject(false);
                        this.settingsService.remoteSettingsUrl = 'http://' + peers[number]['host'] + ':' + peers[number]['port'];
                    }
                    this.storage.set('node', this.settingsService.remoteSettingsUrl);
                    resolve('config');
                },
                (err) => {
                    this.failedSeedPeers.add(seedPeer);
                    this.loading = false;
                    return reject('seed');
                }
            );
        });
    }

    getConfig() {
        return new Promise((resolve, reject) => {
            this.ahttp.get(this.settingsService.remoteSettingsUrl + '/yada_config.json',).pipe(timeout(1000)).subscribe(
                (res) => {
                    this.loading = false;
                    this.settingsService.remoteSettings = res;
                    resolve();
                },
                (err) => {
                    this.failedConfigPeers.add(this.settingsService.remoteSettingsUrl)
                    this.loading = false;
                    return reject('config');
                }
            );
        });
    }

    setupRelationship() {
        return new Promise((resolve, reject) => {
            this.ahttp.get(this.settingsService.remoteSettings['baseUrl'] + '/register')
            .subscribe((data: any) => {
                var raw_dh_private_key = window.crypto.getRandomValues(new Uint8Array(32));
                var raw_dh_public_key = X25519.getPublic(raw_dh_private_key);
                var dh_private_key = this.toHex(raw_dh_private_key);
                var dh_public_key = this.toHex(raw_dh_public_key);
                data.dh_private_key = dh_private_key;
                data.dh_public_key = dh_public_key;

                var hash = this.transactionService.generateTransaction({
                    relationship: {
                        dh_private_key: data.dh_private_key,
                        their_bulletin_secret: data.bulletin_secret,
                        their_username: data.username,
                        my_bulletin_secret: this.bulletinSecretService.bulletin_secret,
                        my_username: this.bulletinSecretService.username
                    },
                    dh_public_key: data.dh_public_key,
                    requested_rid: data.requested_rid,
                    requester_rid: data.requester_rid,
                    callbackurl: data.callbackurl,
                    to: data.to,
                    resolve: resolve
                });
                resolve(hash);
            });
        }) // we cannot do fastgraph registrations. The signing process verifies a relationship. So one must already exist.
        .then((hash) => {
            return this.transactionService.sendTransaction();
        })
        .catch((err) => {
            console.log(err);
        });
    }

    hexToBytes(s) {
        var arr = []
        for (var i = 0; i < s.length; i += 2) {
            var c = s.substr(i, 2);
            arr.push(parseInt(c, 16));
        }
        return String.fromCharCode.apply(null, arr);
    }

    toHex(byteArray) {
        var callback = function(byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }
        return Array.from(byteArray, callback).join('')
    }
}