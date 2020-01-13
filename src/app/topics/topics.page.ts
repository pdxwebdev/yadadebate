import { Component, OnInit, ViewChildren } from '@angular/core';
import { SettingsService } from '../yadalib/settings.service';
import { TransactionService } from '../yadalib/transaction.service';
import { GraphService } from '../yadalib/graph.service';
import { BulletinSecretService } from '../yadalib/bulletin-secret.service';
import { HttpClient } from '@angular/common/http';
import { NavigationExtras, ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { promise } from 'protractor';
import { PostCardListComponent } from '../post-card-list/post-card-list.component';
import { Storage } from '@ionic/storage';
import { PeerService } from '../yadalib/peer.service';


declare var foobar;
declare var X25519;
declare var forge;
declare var Base64;

@Component({
  selector: 'app-topics',
  templateUrl: './topics.page.html',
  styleUrls: ['./topics.page.scss'],
})
export class TopicsPage implements OnInit {
  topics: any;
  createForm: any;
  topicName: any;
  parentGroup: any;
  groupSelectForm: any;
  selectedTopic: any;
  topicGroups: any;
  topicGroupsPrepare: any;
  thisComponent: any;
  id: any;
  params: any;
  @ViewChildren(PostCardListComponent) postCardListComponents: PostCardListComponent
  constructor(
    private route: ActivatedRoute,
    public settingsService: SettingsService,
    private transactionService: TransactionService,
    private graphService: GraphService,
    private bulletinSecretService: BulletinSecretService,
    private ahttp: HttpClient,
    private navCtrl: NavController,
    public storage: Storage,
    public peerService: PeerService
  ) { 
    this.topicGroups = {};
    this.thisComponent = this;
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
        this.params = params;
        return this.buildView();
    });
  }

  buildView() {
    return new Promise((resolve, reject) => {
        if(this.settingsService.remoteSettings.baseUrl) {
            return resolve();
        } else {
            return this.settingsService.reinit()
            .then(() => {
                return resolve();
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
                return reject();
            }
        });
    })
    .then((key) => {
        return this.bulletinSecretService.set(key);
    })
    // .then(() => {
    //     this.graphService.getInfo()
    // })
    .then(() => {
      return new Promise((resolve, reject) => {
        this.route.queryParams.subscribe((params) => {
            return resolve(params);
        });
      });
    })
    .then(() => {
        return new Promise((resolve, reject) => {
            if (this.params && this.params.id) {
                this.id = this.params.id.replace(/ /g, '+');
                this.ahttp.get(this.settingsService.remoteSettings.baseUrl + '/get-topic?id=' + this.id)
                .subscribe((res: any) => {
                    let item = res.result;
                    item.time = new Date(parseInt(item.txn.time)*1000).toISOString().slice(0, 19).replace('T', ' ');
                    for(var i=0; i < this.settingsService.static_groups.length; i++) {
                        if(this.settingsService.static_groups[i].rid === item.txn.requester_rid) {
                            this.parentGroup = this.settingsService.static_groups[i];
                            break;
                        }
                    }
                    let fauxGroups = [];
                    fauxGroups.push({group: this.parentGroup, data: [item]});
                    return resolve(fauxGroups);
                });
            } else {
                let promises = [];
                for(var i=0; i < this.settingsService.static_groups.length; i++) {
                    var group = this.settingsService.static_groups[i];
                    promises.push(new Promise((resolve2, reject) => {
                        this.ahttp.get(this.settingsService.remoteSettings.baseUrl + '/trending-topics?requester_rid=' + group.rid + '&id_type=topic&bulletin_secret=' + group.relationship.their_bulletin_secret)
                        .subscribe((data: any) => {
                            return resolve2({group: group, data: data.results});
                        });
                    }));
                }
                return resolve(Promise.all(promises))
            }
        });
    })
    .then((promiseResults: any) => {
        return new Promise((resolve, reject) => {
            var items = {};
            for (let i = 0; i < promiseResults.length; i++) {
                var promiseResult = promiseResults[i];
                if (!items[promiseResult.group['rid']]) items[promiseResult.group['rid']] = [];
                for (let j = 0; j < promiseResult.data.length; j++) {
                    if(!promiseResult.data[j]['relationship']['their_username'] || 
                        promiseResult.data[j]['rid'] == promiseResult.data[j]['requested_rid'] ||
                        promiseResult.data[j]['relationship']['topic'] !== true) 
                            continue
                    var rootGroup = {
                        group: promiseResult.group,
                        transaction: promiseResult.data[j]
                    }
                    items[promiseResult.group['rid']].push(rootGroup);
                }
                items[promiseResult.group['rid']].sort((a, b) => {
                    return (a.transaction.order < b.transaction.order) ? 1 : -1
                });
            }
            resolve(items);
        })
    })
    .then((items) => {
        this.topicGroupsPrepare = items;
    })
    .then(() => {
        var promises = [];
        for(var i=0; i < this.settingsService.static_groups.length; i++) {
            var group = this.settingsService.static_groups[i];
            for (let j = 0; j < this.topicGroupsPrepare[group.rid].length; j++) {
                promises.push(this.getTopics(this.topicGroupsPrepare[group.rid][j]));
            }
        }
        return Promise.all(promises);
    })
    .then(() => {
        for(var i=0; i < this.settingsService.static_groups.length; i++) {
            var group = this.settingsService.static_groups[i];
            this.topicGroupsPrepare[group.rid] = this.topicGroupsPrepare[group.rid].sort((a, b) => {
                return (a.transaction.highestVoteCount < b.transaction.highestVoteCount) ? 1 : -1
            })
        }
    })
    .then(() => {
        this.topicGroups = this.topicGroupsPrepare;
    })
    .catch((err) => {
      this.navCtrl.navigateRoot('/');
    });
  }

  getTopics(rootGroup) {

      return new Promise((resolve, reject) => {
        let rid = rootGroup.transaction.relationship.their_bulletin_secret;
        let url = '/topics?topic_bulletin_secret=' + rid + '&bulletin_secret=' + this.bulletinSecretService.bulletin_secret
        this.ahttp.get(this.settingsService.remoteSettings.baseUrl + url)
        .subscribe((data: any) => {
            resolve(data.results || []);
        },
        (err) => {
            console.log(err);
        });
      })
      .then((results) => {
        return this.parseChats(rootGroup, results);
      });
  }

  parseChats(rootGroup, data) {
    return new Promise((resolve, reject) => {
        rootGroup.transaction.posts = [];
        let chats = [];
        rootGroup.transaction.votes = {};
        let chats_indexed = {};
        let name;
        for(var i=0; i < data.length; i++) {
          var chat = data[i];
          //if (this.listType !== 'replies' && chat.relationship.reply) continue;
          if (chat.relationship.their_username) name = chat.relationship.their_username;

          chat.time = new Date(parseInt(chat.time)*1000).toISOString().slice(0, 19).replace('T', ' ');
          chats.push(chat);
          if (chats_indexed[chat.id]) {
            chats_indexed[chat.id].relationship = {...chats_indexed[chat.id], ...chat };
          } else {
            chats_indexed[chat.id] = chat;
          }
        }
        if (chats.length > 0) {
          chats.sort((a, b) => {
            a.votes = a.votes || 0;
            b.votes = b.votes || 0;
            return (a.votes < b.votes) ? 1 : -1
          });
          rootGroup.transaction.highestVoteCount = chats[0].votes;
          rootGroup.transaction.posts.push({name: name, chats: chats});
        }
        return resolve();
    });
  }
}
