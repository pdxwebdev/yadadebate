import { Component, OnInit } from '@angular/core';
import { 
  NavController,
  ToastController,
  AlertController,
  LoadingController,
  Events 
} from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { SettingsService } from '../yadalib/settings.service';
import { PeerService } from '../yadalib/peer.service';
import { BulletinSecretService } from '../yadalib/bulletin-secret.service';
import { FirebaseService } from '../yadalib/firebase.service';
import { GraphService } from '../yadalib/graph.service';
import { WalletService } from '../yadalib/wallet.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';



@Component({
  selector: 'page-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['./settings.page.scss'],
})

export class SettingsPage implements OnInit {
    baseUrl = null
    blockchainAddress = null
    graphproviderAddress = null
    walletproviderAddress = null
    siaAddress = null
    siaPassword = null
    keys = null;
    loadingModal = null;
    prefix = null;
    importedKey = null;
    activeKey = null;
    serverDown = false;
    noUsername = false;
    key = null;
    favorites = null;
    removeFavorites = null;
    constructor(
        public navCtrl: NavController,
        private settingsService: SettingsService,
        private bulletinSecretService: BulletinSecretService,
        private firebaseService: FirebaseService,
        public loadingCtrl: LoadingController,
        public alertCtrl: AlertController,
        private storage: Storage,
        private graphService: GraphService,
        private walletService: WalletService,
        public events: Events,
        public toastCtrl: ToastController,
        public peerService: PeerService,
        private ahttp: HttpClient
    ) {
        if (typeof this.peerService.mode == 'undefined') this.peerService.mode = false;
        this.refresh(null).catch((err) => {
            console.log(err)
        });
        this.prefix = 'usernames-';
    }

    ngOnInit() {

    }

    refresh(refresher) {
        this.noUsername = false;
        return this.bulletinSecretService.all().then((keys) => {
            this.setKeys(keys);
        }).then(() => {
            this.getFavorites();
        }).then(() => {
            if(refresher) refresher.complete();
        });

    }

    async saveToFavorites() {
        let alert = await this.alertCtrl.create({
            header: 'Set group name',
            inputs: [
            {
                name: 'groupname',
                placeholder: 'Group name'
            }
            ],
            buttons: [
            {
                text: 'Save',
                handler: data => {
                    this.storage.set('favorites-' + data.groupname, this.settingsService.remoteSettingsUrl);
                    this.getFavorites();
                }
            }
            ]
        });
        await alert.present();
        
    }
    getResults(keyword:string) {
      return ['234234','234234']
    }

    getFavorites() {
        return new Promise((resolve, reject) => {
            var favorites = [];
            this.storage.forEach((value, key) => {
                if (key.substr(0, 'favorites-'.length) === 'favorites-') {
                    favorites.push({label: key.substr('favorites-'.length), url: value});
                }
            })
            .then(() => {
                if (favorites.length == 0) {
                    var host = 'http://0.0.0.0:5000';
                    this.storage.set('favorites-Home', host);
                    this.storage.set('node', host);
                    favorites.push({label: 'Home', url: host});
                }
                this.favorites = favorites;
                resolve(favorites);
            });
        });
    }

    selectFavorite(favorite) {
        for(var i=0; i < this.favorites.length; i++) {
            this.favorites[i].active = false;
        }
        favorite.active = true;
        this.settingsService.remoteSettingsUrl = favorite.url;
        this.storage.set('node', favorite.url);
    }

    removeFavorite(favorite) {
        this.storage.remove('favorites-' + favorite.label);
        this.getFavorites()
        .then((favorites) => {
            if (!favorites) {
                this.removeFavorites = null;
            }
        });
    }

    setKeys(keys) {
        var keys_indexed = {};
        for (var i = 0; i < keys.length; i++) {
            keys_indexed[keys[i].key] = keys[i].key;
        }
        var newKeys = [];
        this.storage.forEach((value, key) => {
            if (key.substr(0, this.prefix.length) === this.prefix) {
                let active = (this.bulletinSecretService.username || '') == key.substr(this.prefix.length);
                newKeys.push({
                    username: key.substr(this.prefix.length),
                    key: value,
                    active: active
                });
                if (active) {
                    this.activeKey = value;
                }
            }
        })
        .then(() => {
            newKeys.sort(function (a, b) {
                if (a.username < b.username)
                  return -1
                if ( a.username > b.username)
                  return 1
                return 0
            });
            this.keys = newKeys;
        });
    }

    async signinCode() {
        new Promise(async (resolve, reject) => {
            let alert = await this.alertCtrl.create({
                header: 'Paste signin code',
                inputs: [
                {
                    name: 'signinCode',
                    placeholder: 'Signin code'
                }
                ],
                buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: data => {
                        console.log('Cancel clicked');
                        reject();
                    }
                },
                {
                    text: 'Sign in',
                    handler: async data => {
                        resolve(data.signinCode);
                    }
                }
                ]
            });
            await alert.present();
        })
        .then((signinCode) => {
          return new Promise((resolve, reject) => {
            return this.ahttp.post(this.settingsService.remoteSettings.baseUrl + '/rmfa', {
              origin: window.location.origin,
              signin_code: signinCode
            })
            .subscribe((data) => {
              resolve(data);
            });
          })
        })
        .then(async (auth: any) => {
            if (auth.authenticated) {
              const toast = await this.toastCtrl.create({
                  message: 'Signin successful!',
                  duration: 2000
              });
              await toast.present();
              return this.refresh(null);
            } else {
              const toast = await this.toastCtrl.create({
                  message: 'Signin failed',
                  duration: 2000
              });
              await toast.present();
            }
        })
        .catch(async () => {
            const toast = await this.toastCtrl.create({
                message: 'Error importing identity!',
                duration: 2000
            });
            await toast.present();
        });
    }

    async importKey() {
        new Promise(async (resolve, reject) => {
            let alert = await this.alertCtrl.create({
                header: 'Set username',
                inputs: [
                {
                    name: 'username',
                    placeholder: 'Username'
                }
                ],
                buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: data => {
                        console.log('Cancel clicked');
                        reject();
                    }
                },
                {
                    text: 'Save',
                    handler: async data => {
                        const toast = await this.toastCtrl.create({
                            message: 'Identity created',
                            duration: 2000
                        });
                        await toast.present();
                        resolve(data.username);
                    }
                }
                ]
            });
            await alert.present();
        })
        .then((username) => {
            return this.bulletinSecretService.import(this.importedKey, username);
        })
        .then(() => {
            this.importedKey = '';
            return this.refresh(null);
        })
        .catch(async () => {
            const toast = await this.toastCtrl.create({
                message: 'Error importing identity!',
                duration: 2000
            });
            await toast.present();
        });
    }

    async createKey() {
        new Promise(async (resolve, reject) => {
            let alert = await this.alertCtrl.create({
                header: 'Set username',
                inputs: [
                {
                    name: 'username',
                    placeholder: 'Username'
                }
                ],
                buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: data => {
                        console.log('Cancel clicked');
                        reject();
                    }
                },
                {
                    text: 'Save',
                    handler: async data => {
                        return this.checkUsername(data.username)
                        .then(() => {
                            return resolve(data.username)  
                        })
                        .catch(() => {
                            this.createKey();
                            return reject(data.username) 
                        });
                    }
                }
                ]
            });
            await alert.present();
        })
        .then((username) => {
            return new Promise((resolve, reject) => {
                this.bulletinSecretService.create(username)
                .then(() => {
                    resolve(username);
                });
            })
        })
        .then((key) => {
            this.set(key)
            .then(() => {
                this.save();
            });
        })
        .then(() => { 
            this.selectIdentity(this.bulletinSecretService.keyname.substr(this.prefix.length));
        })
        // .then(() => {
        //     if (this.settingsService.remoteSettings['walletUrl']) {
        //         return this.graphService.getInfo();
        //     }
        // })
        .then(async () => {

            const toast = await this.toastCtrl.create({
                message: 'Identity created',
                duration: 2000
            });
            await toast.present();
            return this.refresh(null);
        })
        .catch(async () => {
            const toast = await this.toastCtrl.create({
                message: 'Username not available',
                duration: 2000
            });
            await toast.present();
        });
    }

    async checkUsername(username) {
        return new Promise((resolve, reject) => {
            this.ahttp.get('http://0.0.0.0:5000/check-username?username=' + username)
            .subscribe((data: any) => {
                if(data.result) {
                    return reject(username);
                } else {
                    return resolve(username);
                }
            });
        });
    }

    async selectIdentity(key) {
        this.loadingModal = await this.loadingCtrl.create({
          message: 'Finding node...'
        });
        await this.loadingModal.present();
        return this.peerService.go()
        .then(() => {
            return this.set(key);
        })
        .then(() => {
            return this.refresh(null);
        })
        .then(() => { 
            this.loadingModal.dismiss();
        })
        .then(() => {
            this.navCtrl.navigateRoot('/topics');
        })
        .catch((err)  => {
            this.loadingModal.dismiss();  
        });
    }

    unlockWallet() {
        return new Promise((resolve, reject) => {
            this.ahttp.post(
              this.settingsService.remoteSettings['baseUrl'] + '/unlock?origin=' + encodeURIComponent(window.location.origin),
              {key_or_wif: this.activeKey},
              { withCredentials: true }
            )
            .subscribe(async (res) => {
                this.settingsService.tokens[this.bulletinSecretService.keyname] = res['token']
                if (!this.settingsService.tokens[this.bulletinSecretService.keyname]) return resolve(res);
                const toast = await this.toastCtrl.create({
                    message: 'Wallet unlocked!',
                    duration: 2000
                });
                await toast.present();
                resolve(res);
            },
            (err) => {
                return reject('cannot unlock wallet');
            });
        });
    }

    set(key) {
        this.storage.set('last-keyname', this.prefix + key);
        return this.doSet(this.prefix + key)
        .then(() => {
            this.events.publish('pages-settings');
        })
        .catch(() => {
            console.log('can not set identity')
        });
    }

    doSet(keyname) {
        return new Promise((resolve, reject) => {
            this.bulletinSecretService.set(keyname).then(() => {
                return this.refresh(null);
            }).then(() => {
                this.serverDown = false;
                if (!document.URL.startsWith('http') || document.URL.startsWith('http://localhost:8080')) {
                    this.firebaseService.initFirebase();
                }
                return resolve();
            }).catch((error) => {
                this.serverDown = true;
                return reject();
            });
        });
    }

    save() {
        this.graphService.graph = {
            comments: "",
            reacts: "",
            commentReacts: ""
        };
        
        return this.set(this.bulletinSecretService.keyname.substr(this.prefix.length));
    }
}
