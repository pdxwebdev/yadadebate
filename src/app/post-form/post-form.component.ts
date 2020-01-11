import { Component, OnInit, Input } from '@angular/core';
import { SettingsService } from '../yadalib/settings.service';
import { BulletinSecretService } from '../yadalib/bulletin-secret.service';
import { HttpClient } from '@angular/common/http';
import { ToastController, AlertController, NavController, ModalController } from '@ionic/angular';
import { TopicService } from '../topic.service';
import { GroupService } from '../group.service';
import { WalletService } from '../yadalib/wallet.service';
import { TransactionService } from '../yadalib/transaction.service';
import { GraphService } from '../yadalib/graph.service';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss']
})
export class PostFormComponent implements OnInit {
  mentionConfig: any;
  @Input() parentComponent;
  @Input() group;
  @Input() topic;
  mention: any;
  groupChatText: any;
  @Input() parentGroup;
  @Input() post
  constructor(
    private settingsService: SettingsService,
    private bulletinSecretService: BulletinSecretService,
    private ahttp: HttpClient,
    private toastCtrl: ToastController,
    private topicService: TopicService,
    private groupService: GroupService,
    private alertCtrl: AlertController,
    private walletService: WalletService,
    private transactionService: TransactionService,
    private graphService: GraphService,
    private navCtrl: NavController,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
      if(this.group && this.topic) {
        this.groupChatText = ":" + this.group.relationship.their_username + " #" + this.topic.relationship.their_username + " ";
      }
      this.mentionConfig = {
          mentions: [
              {
                  labelKey: 'username',
                  triggerChar: '@',
                  mentionSelect: this.selectedMention.bind(this),
                  returnTrigger: true
              },
              {
                  labelKey: 'username',
                  triggerChar: '#',
                  mentionSelect: this.selectedTopic.bind(this),
                  returnTrigger: true
              },
              {
                  labelKey: 'username',
                  triggerChar: ':',
                  mentionSelect: this.selectedGroup.bind(this),
                  returnTrigger: true
              },
          ]
      }
  }

  async closeModal() {
    await this.modalCtrl.dismiss();
  }

  async search($event) {
    console.log($event);
    if($event.length < 3) return;
    let idType;
    switch($event.substr(0,1)) {
      case '@':
        idType = '';
        break;
      case '#':
        idType = 'topic';
        break;
      case ':':
        idType = 'group';
        break;
    }
    return await this.checkUsername($event.substr(1), idType)
    .then((data: any) => {
      return new Promise((resolve, reject) => {
        let items = [];
        for(var i=0; i < data.length; i++) {
          let item = data[i];
          items.push({
            username: item['txn']['relationship']['their_username'],
            item: item
          })
        }
        let mentionConfigs = this.mentionConfig.mentions;
        for(var i=0; i < mentionConfigs.length; i++) {
          if(mentionConfigs[i].triggerChar === $event.substr(0, 1)) {
            mentionConfigs[i].items = items;
          }
        }
        resolve(mentionConfigs);
      });
    })
    .then((mentionConfigs) => {
      this.mentionConfig = {
          mentions: mentionConfigs
      }
    });
  }

  checkUsername(username, idType) {
    return new Promise((resolve, reject) => {
      this.ahttp.get(this.settingsService.remoteSettings.baseUrl + '/ns-lookup?requester_rid=' + this.settingsService.static_groups[0].rid + '&username=' + username + '&bulletin_secret=' + this.bulletinSecretService.bulletin_secret + '&id_type=' + idType)
      .subscribe((data: any) => {
        return resolve(data);
      });
    });
  }

  selectedGroup(e) {
    this.group = e.item.txn;
    return ':' + e.username + ' ';
  }

  selectedTopic(e) {
    this.topic = e.item.txn;
    return '#' + e.username + ' ';
  }

  selectedMention(e) {
    this.mention = e.item.txn;
    return '@' + e.username + ' ';
  }

  async submit() {
    return new Promise(async (resolve, reject) => {
      var re = /:/g
      if(((this.groupChatText || '').match(re) || []).length > 1) {
        return reject('Only one group can be specified.')
      }
      var re = /#/g
      if (((this.groupChatText || '').match(re) || []).length > 1) {
        return reject('Only one topic can be specified.')
      }
      if (!this.group) {
        if (this.groupChatText.indexOf(':') >= 0) {
          var startpos = this.groupChatText.indexOf(':');
          var untilEndTest = this.groupChatText.substr(startpos);
          var endpos = this.groupChatText.substr(startpos).indexOf(' ');
          if (startpos + endpos > startpos) {
            var segment = this.groupChatText.substr(startpos, endpos);
          } else {
            var segment = this.groupChatText.substr(startpos);
          }
          return this.checkUsername(segment.substr(1), 'group')
          .then((data: any) => {
            let items = [];
            for(var i=0; i < data.length; i++) {
              let item = data[i];
              if (item['txn']['relationship']['their_username'].toLowerCase() === segment.substr(1).toLowerCase()) {
                this.group = item['txn'];
                return resolve();
              }
            }
            if (startpos + untilEndTest.length === segment.length) {
              if (untilEndTest.length > 4) {
                return this.groupService.createGroup(this.parentGroup, untilEndTest.substr(1))
                .then((group) => {
                  this.group = group;
                  return resolve();
                });
              }
            }
            if (segment.length > 4) {
              return this.groupService.createGroup(this.parentGroup, segment.substr(1))
              .then((group) => {
                this.group = group;
                return resolve();
              });
            }
          })
        } else {
          const toast = await this.toastCtrl.create({
              message: 'Missing :group. Preceed with colon symbol and must be 4 characters minimum',
              duration: 2000
          });
          await toast.present();
          return;        
        }
      } else {
        return resolve();
      }
    })
    .then(async () => {
      return new Promise(async (resolve, reject) => {
        if (!this.topic) {
          if (this.groupChatText.indexOf('#') >= 0) {
            var startpos = this.groupChatText.indexOf('#');
            var untilEndTest = this.groupChatText.substr(startpos);
            var endpos = this.groupChatText.substr(startpos).indexOf(' ');
            if (startpos + endpos > startpos) {
              var segment = this.groupChatText.substr(startpos, endpos);
            } else {
              var segment = this.groupChatText.substr(startpos);
            }
            return this.checkUsername(segment.substr(1), 'topic')
            .then((data: any) => {
              let items = [];
              for(var i=0; i < data.length; i++) {
                let item = data[i];
                if (item['txn']['relationship']['their_username'].toLowerCase() === segment.substr(1).toLowerCase()) {
                  this.topic = item['txn'];
                  return resolve();
                }
              }
              if (startpos + untilEndTest.length === segment.length) {
                if (untilEndTest.length > 4) {
                  return this.topicService.createTopic(this.parentGroup, untilEndTest.substr(1))
                  .then((topic) => {
                    this.topic = topic;
                    return resolve(); 
                  });
                }
              }
              if (segment.length > 4) {
                return this.topicService.createTopic(this.parentGroup, segment.substr(1))
                .then((topic) => {
                  this.topic = topic;
                  return resolve(); 
                });
              }
            });
          } else {
            const toast = await this.toastCtrl.create({
                message: 'Missing #topic. Preceed with hash symbol and must be 4 characters minimum',
                duration: 2000
            });
            await toast.present();
            return;        
          }
        } else {
          return resolve();
        }
      });
    })
    .then(() => {
      this.send();
    })
    .catch(async (err) => {
      console.log(err); 
      let alert = await this.alertCtrl.create({
        header: 'Problem',
        subHeader: err,
        buttons: ['OK']
      });
      await alert.present();
    });
  }

  async send() {
    let alert = await this.alertCtrl.create({
      header: 'Approve transaction',
      subHeader: 'You are about to spend 0.00 coins ( 0.00 fee). Everything is free for now.',
      buttons: [
        'Cancel',
        {
          text: 'Confirm',
          handler: (data: any) => {
              this.walletService.get()
              .then(() => {
                  return this.graphService.getFriends();
              })
              .then(() => {
                  return new Promise((resolve, reject) => {
                    this.ahttp.get(this.settingsService.remoteSettings.baseUrl + '/topic-conflict?topic_bulletin_secret=' + this.topic.relationship.their_bulletin_secret + '&requested_rid=' + this.group.requested_rid + '&bulletin_secret=' + this.bulletinSecretService.bulletin_secret)
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
                  let reply;
                  if (this.post && this.post.id) {
                    reply = true;
                  } else {
                    this.post = {};
                  }
                  return this.transactionService.generateTransaction({
                      relationship: {
                          their_username: this.group.relationship.their_username,
                          their_bulletin_secret: this.group.relationship.their_bulletin_secret,
                          groupChatText: this.groupChatText,
                          topic_bulletin_secret: this.topic.relationship.their_bulletin_secret,
                          topic_their_username: this.topic.relationship.their_username,
                          my_bulletin_secret: this.bulletinSecretService.generate_bulletin_secret(),
                          my_username: this.bulletinSecretService.username,
                          id: this.post.id,
                          reply: reply
                      },
                      their_bulletin_secret: this.group.relationship.their_bulletin_secret,
                      rid: this.group.rid,
                      requester_rid: this.group.requester_rid,
                      requested_rid: this.group.requested_rid
                  });
              }).then((txn) => {
                  return this.transactionService.sendTransaction();
              })
              .then(() => {
                return new Promise((resolve, reject) => {
                  let rid = this.group.rid;
                  return this.ahttp.get(this.settingsService.remoteSettings.baseUrl + '/groups?rid=' + rid)
                  .subscribe((data: any) => {
                      resolve(data.results);
                  },
                  (err) => {
                      console.log(err);
                  });
                });
              }).then(() => {
                  this.groupChatText = '';
                  this.parentComponent.navCtrl.navigateForward('/post?id=' + this.transactionService.transaction.id + '&cardType=topic')
                  this.modalCtrl.dismiss();
              })
              .catch(async (err) => {
                  console.log(err);
                  if(!err) return;
                  let alert = await this.alertCtrl.create({
                    header: 'Message error',
                    subHeader: err,
                    buttons: ['OK']
                  });
                  await alert.present();
              });
          }
        }
      ]
    });
    await alert.present();
  }

  change() {
    if(this.topic && this.groupChatText.indexOf(this.topic.relationship.their_username) === -1) {
      this.topic = null;
    }
    if(this.group && this.groupChatText.indexOf(this.group.relationship.their_username) === -1) {
      this.group = null;
    }
  }

}
