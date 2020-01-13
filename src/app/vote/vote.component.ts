import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { TransactionService } from '../yadalib/transaction.service';
import { WalletService } from '../yadalib/wallet.service';
import { GraphService } from '../yadalib/graph.service';
import { BulletinSecretService } from '../yadalib/bulletin-secret.service';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '../yadalib/settings.service';

@Component({
  selector: 'app-vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.scss'],
})
export class VoteComponent implements OnInit {
  groupChatText: any;
  @Input() item: any;
  @Input() votes: any;
  @Input() parentComponent: any;
  @Output() voteChanged = new EventEmitter();
  topic: any;
  group: any;
  constructor(
    private alertCtrl: AlertController,
    private transactionService: TransactionService,
    private walletService: WalletService,
    private graphService: GraphService,
    private bulletinSecretService: BulletinSecretService,
    private toastCtrl: ToastController,
    private ahttp: HttpClient,
    private settingsService: SettingsService
  ) { }

  ngOnInit() { }

  async segmentChanged(ev: any, item: any) {
    ev.preventDefault();
    ev.stopPropagation();
    if (item.already_voted === true) {
      const toast = await this.toastCtrl.create({
          message: "Can't change your vote.",
          duration: 2000,
          position: 'bottom'
      });
      await toast.present();
      return false;
    }
    return this.getTopic()
    .then(() => {
      return this.getGroup();
    })
    .then(() => {
      this.vote(item);
    })
    .catch(() => {
      console.log('canceled vote');
      item.prevVote = '';
      item.vote = '';
    });
  }

  getTopic() {
    return new Promise((resolve, reject) => {
      if (!this.item) return resolve();
      this.topic = this.settingsService.topics_by_bulletin_secret[this.item.relationship.topic_bulletin_secret];
      if(this.topic) {
        return resolve();
      } else {
        this.ahttp.get(this.settingsService.remoteSettings.baseUrl + '/get-topic?id=' + this.item.relationship.topic_bulletin_secret)
        .subscribe((res: any) => {
          this.settingsService.topics_by_bulletin_secret[this.item.relationship.topic_bulletin_secret] = res.result.txn;
          this.topic = res.result.txn;
          return resolve();
        });
      }
    });
  }

  getGroup() {
    return new Promise((resolve, reject) => {
      if (!this.item) return resolve();
      this.group = this.settingsService.groups_by_bulletin_secret[this.item.relationship.their_bulletin_secret];
      if(this.group) {
        return resolve()
      } else {
        this.ahttp.get(this.settingsService.remoteSettings.baseUrl + '/get-group?id=' + this.item.relationship.their_bulletin_secret)
        .subscribe((res: any) => {
          this.settingsService.groups_by_bulletin_secret[this.item.relationship.their_bulletin_secret] = res.result.txn;
          this.group = res.result.txn;
          return resolve();
        });
      }
    });
  }

  async vote(item) {
    let rid = item.rid;
    let requester_rid = item.requester_rid;
    let requested_rid = item.requested_rid;
    let their_address = item.relationship.their_address;
    let their_public_key = item.relationship.their_public_key;
    let their_bulletin_secret = item.relationship.my_bulletin_secret;
    let their_username = item.relationship.their_username;
    return new Promise(async (resolve, reject) => {
      let alert = await this.alertCtrl.create({
        header: 'Approve transaction',
        subHeader: 'Votes cannot be undone. You are about to spend 0.00 coins ( 0.00 fee). Everything is free for now.',
        buttons: [
          {
            text: 'Cancel',
            handler: (data: any) => {
              reject();
            }
          },
          {
            text: 'Confirm',
            handler: (data: any) => {
                this.walletService.get()
                .then(() => {
                    return this.graphService.getFriends();
                })
                .then(() => {
                    return new Promise((resolve, reject) => {
                      this.ahttp.get(this.settingsService.remoteSettings.baseUrl + '/topic-conflict?topic_bulletin_secret=' + item.relationship.topic_bulletin_secret + '&requested_rid=' + item.requested_rid + '&bulletin_secret=' + this.bulletinSecretService.bulletin_secret)
                      .subscribe((res: any) => {
                        if(res.result) {
                          reject("You've already identified with another group.");
                        } else {
                          resolve();
                        }
                      })
                    })
                })
                .catch(async (err) => {
                  return new Promise(async (resolve, reject) => {
                    console.log(err); 
                    let alert = await this.alertCtrl.create({
                      header: 'Traitor',
                      subHeader: err,
                      buttons: ['OK']
                    });
                    await alert.present();
                    reject();
                  })
                })
                .then(() => {
                    return this.transactionService.generateTransaction({
                        relationship: {
                            their_username: their_username,
                            their_bulletin_secret: their_bulletin_secret,
                            groupChatText: {
                              vote: 'upvote',
                              id: item.id
                            },
                            topic_bulletin_secret: this.topic.relationship.their_bulletin_secret,
                            topic_username: this.topic.relationship.their_username,
                            my_bulletin_secret: this.bulletinSecretService.generate_bulletin_secret(),
                            my_username: this.bulletinSecretService.username
                        },
                        their_bulletin_secret: item.relationship.their_bulletin_secret,
                        rid: rid,
                        requester_rid: requester_rid,
                        requested_rid: requested_rid
                    });
                })
                .then((hash) => {
                    return this.transactionService.sendTransaction();
                })
                .then(() => {
                  return new Promise((resolve, reject) => {
                    this.ahttp.get(this.settingsService.remoteSettings.baseUrl + '/groups?no_cache=1&rid=' + rid)
                    .subscribe((data: any) => {
                        resolve(data.results);
                    },
                    (err) => {
                        console.log(err);
                    });
                  });
                })
                .then(() => {
                    this.groupChatText = '';
                    this.votes += 1;
                    this.item.already_voted = true;
                    resolve();
                })
                .catch(async (err) => {
                   console.log(err); 
                   if(!err) return reject();
                   let alert = await this.alertCtrl.create({
                     header: 'Message error',
                     subHeader: err,
                     buttons: ['OK']
                   });
                   await alert.present();
                   reject();
                });
            }
          }
        ]
      });
      await alert.present();
    });
  }

}
