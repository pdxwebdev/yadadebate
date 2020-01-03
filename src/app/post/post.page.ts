import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SettingsService } from '../yadalib/settings.service';
import { HttpClient } from '@angular/common/http';
import { BulletinSecretService } from '../yadalib/bulletin-secret.service';
import { PostCardListComponent } from '../post-card-list/post-card-list.component';
import { NavController } from '@ionic/angular';

declare var Base64;


@Component({
  selector: 'app-post',
  templateUrl: './post.page.html',
  styleUrls: ['./post.page.scss'],
})
export class PostPage implements OnInit {
  id: any;
  item: any;
  cardType: any;
  votes: any;
  replies: any;
  repliesPrepare: any;
  transaction: any;
  topic: any;
  group: any;
  staticGroup: any;
  thisComponent: any;
  @ViewChild(PostCardListComponent, {static: false}) postCardListComponent: PostCardListComponent;
  constructor(
    private route: ActivatedRoute,
    private ahttp: HttpClient,
    private settingsService: SettingsService,
    private bulletinSecretService: BulletinSecretService,
    private navCtrl: NavController
  ) { 
    this.item = {};
    this.votes = {};
    this.replies = {};
    this.repliesPrepare = {};
    this.transaction = {};
    this.thisComponent = this;
  }

  ngOnInit() {
    if(!this.settingsService.remoteSettings.baseUrl) {
      return this.navCtrl.navigateRoot('/');
    }
    return new Promise((resolve, reject) => {
      if (this.postCardListComponent) this.postCardListComponent.ngOnInit();
      this.route.queryParams.subscribe((params) => {
        return new Promise((resolve2, reject2) => {
          if (params && params.id) {
            this.id = params.id.replace(/ /g, '+');
            this.ahttp.get(this.settingsService.remoteSettings.baseUrl + '/get-post?id=' + this.id)
            .subscribe((res: any) => {
              this.item = res.result;
              this.item.time = new Date(parseInt(this.item.time)*1000).toISOString().slice(0, 19).replace('T', ' ');
              this.transaction = {transaction: this.item};
              for(var i=0; i < this.settingsService.static_groups.length; i++) {
                if(this.settingsService.static_groups[i].rid === this.item.requester_rid) {
                  this.staticGroup = this.settingsService.static_groups[i];
                  break;
                }
              }
              this.ahttp.get(this.settingsService.remoteSettings.baseUrl + '/get-group?id=' + this.item.relationship.their_bulletin_secret)
              .subscribe((res: any) => {
                this.group = res.result.txn;
              });
              this.ahttp.get(this.settingsService.remoteSettings.baseUrl + '/get-topic?id=' + this.item.relationship.topic_bulletin_secret)
              .subscribe((res: any) => {
                this.topic = res.result.txn;
              });
              return resolve2();
            });
            this.getVotes(this.id);
          }
          if (params && params.cardType) {
            this.cardType = params.cardType;
          }
        })
        .then(() => {
          return this.getReplies(this.transaction);
        })
        .then(() => {
            this.replies = this.repliesPrepare;
            resolve();
        });
      });
    });
  }

  getReplies(rootGroup) {
    return new Promise((resolve, reject) => {
      var rid = rootGroup.transaction.id;
      var url = '/replies?id=' + rid
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

  getVotes(id) {
    this.votes[id] = 0;
    return new Promise((resolve, reject) => {
      this.ahttp.get(this.settingsService.remoteSettings.baseUrl + '/votes?id=' + id)
      .subscribe((res: any) => {
        this.votes[id] = this.votes[id] || 0;
        var my_pub_key = this.bulletinSecretService.key.getPublicKeyBuffer().toString('hex');
        for(var i=0; i < res.result.length; i++) {
          if (res.result[i].public_key === my_pub_key) {
            this.item.vote = 'upvote';
            this.item.alreadyVoted = true;
          }
          this.votes[id] += 1;
        }
        return resolve();
      });
    })
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
              chats_indexed[chat.relationship.groupChatText.id].alreadyVoted = true;
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

}