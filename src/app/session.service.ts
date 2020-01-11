import { Injectable } from '@angular/core';
import { SettingsService } from './yadalib/settings.service';
import { PeerService } from './yadalib/peer.service';
import { Storage } from '@ionic/storage';
import { BulletinSecretService } from './yadalib/bulletin-secret.service';
import { GraphService } from './yadalib/graph.service';
import { AlertController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  host: any;
  constructor(
    public settingsService: SettingsService,
    public peerService: PeerService,
    public storage: Storage,
    public bulletinSecretService: BulletinSecretService,
    public graphService: GraphService,
    public alertCtrl: AlertController,
    public ahttp: HttpClient,
    public toastCtrl: ToastController
  ) { 
      this.host = 'http://3.225.228.97';
      //this.host = 'http://0.0.0.0:5000';
  }

  init() {
    
    return new Promise((resolve, reject) => {
        if(this.settingsService.remoteSettings.baseUrl) {
            return resolve();
        } else {
            return this.settingsService.reinit()
            .then(() => {
                return resolve();
            })
            .catch(() => {
                return this.createUser()
                .then(() => {
                  return resolve()
                });
            });
        }
    })
    .then(() => {
        return this.peerService.go()
    })
    .then(() => {
        return this.storage.get('last-keyname')
    })
    .then((key) => {
        return new Promise((resolve, reject) => {
            if(key) {
                return resolve(key)
            } else {
                return this.createUser();
            }
        });
    })
    .then((key) => {
        return this.bulletinSecretService.set(key);
    })
    .then(() => {
        return this.graphService.getInfo()
    })
    .catch(() => {
        
    })
  }

  createUser() {
    return new Promise(async (resolve, reject) => {
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
                    .catch(async () => {
                        const toast = await this.toastCtrl.create({
                            message: 'Username not available',
                            duration: 2000
                        });
                        await toast.present();
                        this.createUser();
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
    .then(() => {
      return this.getPeer();
    })
    .then(() => {
      return this.init();
    })
  }

  async checkUsername(username) {
      return new Promise((resolve, reject) => {
          this.ahttp.get(this.host + '/check-username?username=' + username)
          .subscribe((data: any) => {
              if(data.result) {
                  return reject(username);
              } else {
                  return resolve(username);
              }
          });
      });
  }

  getPeer() {
    return new Promise((resolve, reject) => {
      this.storage.set('favorites-Home', this.host)
      .then(() => {
        return this.storage.set('node', this.host);
      })
      .then(() => {
        return resolve();
      });
    });
  }
}
