import { Component, OnInit, Input } from '@angular/core';
import { SettingsService } from '../yadalib/settings.service';
import { BulletinSecretService } from '../yadalib/bulletin-secret.service';
import { HttpClient } from '@angular/common/http';
import { ToastController, AlertController, NavController } from '@ionic/angular';
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
  group: any;
  topic: any;
  mention: any;
  groupChatText: any;
  @Input() parentGroup;
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
    private navCtrl: NavController
  ) { }

  ngOnInit() {
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
    let result = await new Promise((resolve, reject) => {
      this.ahttp.get(this.settingsService.remoteSettings.baseUrl + '/ns-lookup?requested_rid=' + this.settingsService.static_groups[0].rid + '&username=' + $event.substr(1) + '&bulletin_secret=' + this.bulletinSecretService.bulletin_secret + '&id_type=' + idType)
      .subscribe((data: any) => {
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
        this.mentionConfig = {
            mentions: mentionConfigs
        }
      });
    });
    return result;
  }

  selectedGroup(e) {
    this.group = e.item;
    return ':' + e.username + ' ';
  }

  selectedTopic(e) {
    this.topic = e.item;
    return '#' + e.username + ' ';
  }

  selectedMention(e) {
    this.mention = e.item;
    return '@' + e.username + ' ';
  }

  async submit() {
    return new Promise(async (resolve, reject) => {
      if (!this.group) {
        if (this.groupChatText.indexOf(':') >= 0) {
          var startpos = this.groupChatText.indexOf(':');
          var untilEndTest = this.groupChatText.substr(startpos);
          var endpos = this.groupChatText.indexOf(' ');
          var segment = this.groupChatText.substr(startpos, endpos);
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
        } else {
          const toast = await this.toastCtrl.create({
              message: 'Missing group',
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
            var endpos = this.groupChatText.indexOf(' ');
            var segment = this.groupChatText.substr(startpos, endpos);
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
          } else {
            const toast = await this.toastCtrl.create({
                message: 'Missing topic',
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
                  return this.transactionService.generateTransaction({
                      relationship: {
                          their_username: this.group.relationship.their_username,
                          their_bulletin_secret: this.group.relationship.their_bulletin_secret,
                          groupChatText: this.groupChatText,
                          topic_bulletin_secret: this.topic.relationship.their_bulletin_secret,
                          topic_their_username: this.topic.relationship.their_username,
                          my_bulletin_secret: this.bulletinSecretService.generate_bulletin_secret(),
                          my_username: this.bulletinSecretService.username
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
                  this.ahttp.get(this.settingsService.remoteSettings.baseUrl + '/groups?rid=' + rid)
                  .subscribe((data: any) => {
                      resolve(data.results);
                  },
                  (err) => {
                      console.log(err);
                  });
                });
              }).then(() => {
                  this.groupChatText = '';
                  this.navCtrl.pop();
              })
              .catch(async (err) => {
                  console.log(err); 
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

}
