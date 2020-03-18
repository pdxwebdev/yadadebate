import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  NavController,
  ModalController,
  AlertController,
  LoadingController,
  ToastController
} from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { GraphService } from '../yadalib/graph.service';
import { BulletinSecretService } from '../yadalib/bulletin-secret.service';
import { WalletService } from '../yadalib/wallet.service';
import { TransactionService } from '../yadalib/transaction.service';
import { SettingsService } from '../yadalib/settings.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavigationExtras } from '@angular/router';
import { IonRadioGroup } from '@ionic/angular';
import { GroupService } from '../group.service';
import { PostCardListComponent } from '../post-card-list/post-card-list.component';
import { PeerService } from '../yadalib/peer.service';
import { SessionService } from '../session.service';

declare var Base64;
declare var foobar;
declare var X25519;
declare var forge;


@Component({
  selector: 'app-communities',
  templateUrl: './communities.page.html',
  styleUrls: ['./communities.page.scss'],
})
export class CommunitiesPage implements OnInit {
    @ViewChild('radioGroup', {static: false}) radioGroup: IonRadioGroup
    pageTitle: any;
    groupName: any;
    rootGroup: any;
    createForm: any;
    createTopicForm: any;
    groups: any;
    groupsPrepare: any;
    votes: any;
    thisComponent: any;
    id: any;
    params: any;
    @ViewChildren(PostCardListComponent) postCardListComponents: PostCardListComponent
    constructor(
        public route: ActivatedRoute,
        private graphService: GraphService,
        public navCtrl: NavController,
        public storage: Storage,
        public walletService: WalletService,
        public transactionService: TransactionService,
        public alertCtrl: AlertController,
        public loadingCtrl: LoadingController,
        public bulletinSecretService: BulletinSecretService,
        public settingsService: SettingsService,
        public ahttp: HttpClient,
        public modalCtrl: ModalController,
        public toastCtrl: ToastController,
        public router: Router,
        public groupService: GroupService,
        public peerService: PeerService,
        public sessionService: SessionService
    ) {
        this.groups = {};
        this.thisComponent = this;
    }

    ngOnInit() {
        this.groups = [];  
        this.route.queryParams.subscribe((params) => {
            this.params = params;
            return this.buildView();
        });
    }
    
    buildView() {
        this.sessionService.init()
        .then(() => {
            return new Promise((resolve, reject) => {
                if (this.params && this.params.id) {
                    this.id = this.params.id.replace(/ /g, '+');
                    this.ahttp.get(this.settingsService.remoteSettings.baseUrl + '/get-group?id=' + this.id)
                    .subscribe((res: any) => {
                        let item = res.result;
                        item.time = new Date(parseInt(item.time)*1000).toISOString().slice(0, 19).replace('T', ' ');
                        this.rootGroup = this.settingsService.static_groups_by_rid[item.requester_rid];
                        let fauxGroups = [];
                        fauxGroups.push({group: this.rootGroup, data: [item]});
                        return resolve(fauxGroups);
                    });
                } else {
                    let promises = [];
                    for(var i=0; i < this.settingsService.static_groups.length; i++) {
                        var group = this.settingsService.static_groups[i];
                        promises.push(new Promise((resolve2, reject) => {
                            this.ahttp.get(this.settingsService.remoteSettings.baseUrl + '/trending-groups?requester_rid=' + group.rid + '&id_type=group&bulletin_secret=' + group.relationship.their_bulletin_secret)
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
                            promiseResult.data[j]['relationship']['group'] !== true) 
                                continue
                        items[promiseResult.group['rid']].push({
                            group: promiseResult.group,
                            transaction: promiseResult.data[j]
                        });
                    }
                    items[promiseResult.group['rid']].sort((a, b) => {
                        return (a.transaction.order < b.transaction.order) ? 1 : -1
                    });
                }
                resolve(items);
            })
        })
        .then((items) => {
            this.groupsPrepare = items;
        })
        .then(() => {
            var promises = [];
            for(var i=0; i < this.settingsService.static_groups.length; i++) {
                var group = this.settingsService.static_groups[i];
                for (let j = 0; j < this.groupsPrepare[group.rid].length; j++) {
                    promises.push(this.getGroups(this.groupsPrepare[group.rid][j]));
                }
            }
            return Promise.all(promises);
        })
        .then(() => {
            for(var i=0; i < this.settingsService.static_groups.length; i++) {
                var group = this.settingsService.static_groups[i];
                this.groupsPrepare[group.rid] = this.groupsPrepare[group.rid].sort((a, b) => {
                    return (a.transaction.highestVoteCount < b.transaction.highestVoteCount) ? 1 : -1
                })
            }
        })
        .then(() => {
            this.groups = this.groupsPrepare;
        })
        .catch((err) => {
          this.navCtrl.navigateRoot('/identity');
        });
    }

    getGroups(rootGroup) {
  
        return new Promise((resolve, reject) => {
          let rid = rootGroup.transaction.rid;
          let url = '/groups?rid=' + rid + '&bulletin_secret=' + this.bulletinSecretService.bulletin_secret
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
              if(chat.relationship.groupChatText.vote == 'upvote') {
                if (!rootGroup.transaction.votes[chat.relationship.groupChatText.id]) rootGroup.transaction.votes[chat.relationship.groupChatText.id] = 0;
                rootGroup.transaction.votes[chat.relationship.groupChatText.id] += 1;
                if(!chats_indexed[chat.relationship.groupChatText.id]) {
                  chats_indexed[chat.relationship.groupChatText.id] = {};
                }
                if (chat.public_key === this.bulletinSecretService.key.getPublicKeyBuffer().toString('hex')) {
                  chats_indexed[chat.relationship.groupChatText.id].vote = 'upvote';
                  chats_indexed[chat.relationship.groupChatText.id].already_voted = true;
                }
                if(!chats_indexed[chat.relationship.groupChatText.id].votes) {
                  chats_indexed[chat.relationship.groupChatText.id].votes = 0;
                }
                chats_indexed[chat.relationship.groupChatText.id].votes += 1;
                continue;
              }
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

    itemTapped(event, item) {
        let navigationExtras: NavigationExtras = {
            queryParams: {
                item: Base64.encode(JSON.stringify(item.transaction))
            }
        }
        this.navCtrl.navigateForward('/community-detail', navigationExtras);
    }

    activateCreateForm() {
        this.createForm = !this.createForm;
    }

    activateCreateTopicForm() {
        this.createTopicForm = !this.createTopicForm;
    }

}
