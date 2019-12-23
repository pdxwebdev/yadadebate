import { Component, OnInit, Input } from '@angular/core';
import { SettingsService } from '../yadalib/settings.service';
import { HttpClient } from '@angular/common/http';
import { BulletinSecretService } from '../yadalib/bulletin-secret.service';
import { GraphService } from '../yadalib/graph.service';
import { VoteComponent } from '../vote/vote.component';

@Component({
  selector: 'app-topic-card-list',
  templateUrl: './topic-card-list.component.html',
  styleUrls: ['./topic-card-list.component.scss'],
})
export class TopicCardListComponent implements OnInit {
  votes: any;
  topics: any;
  parentComponent: any;
  @Input() rootGroup: any;
  constructor(
    private settingsService: SettingsService,
    private ahttp: HttpClient,
    private bulletinSecretService: BulletinSecretService,
    private graphService: GraphService
  ) { }

  ngOnInit() {
    this.parentComponent = this;
    this.topics = [];
    let rid = this.rootGroup.transaction.relationship.their_bulletin_secret;
    return new Promise((resolve, reject) => {
      this.ahttp.get(this.settingsService.remoteSettings.baseUrl + '/topics?topic_bulletin_secret=' + rid)
      .subscribe((data: any) => {
          resolve(data.results);
      },
      (err) => {
          console.log(err);
      });
    })
    .then((results) => {
      this.parseChats(results);
    });
  }

  parseChats(data) {
    this.topics = [];
    let chats = [];
    this.votes = {};
    let chats_indexed = {};
    let name;
    for(var i=0; i < data.length; i++) {
      var chat = data[i];
      if (chat.relationship.their_username) name = chat.relationship.their_username;
      if(chat.relationship.groupChatText.vote == 'upvote') {
        if (!this.votes[chat.relationship.groupChatText.id]) this.votes[chat.relationship.groupChatText.id] = 0;
        this.votes[chat.relationship.groupChatText.id] += 1;
        if (chat.public_key === this.bulletinSecretService.key.getPublicKeyBuffer().toString('hex')) {
          if (chats_indexed[chat.relationship.groupChatText.id]) {
            chats_indexed[chat.relationship.groupChatText.id].vote = 'upvote';
          } else {
            chats_indexed[chat.relationship.groupChatText.id] = {vote: 'upvote'};
          }
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
      this.topics.push({name: name, chats: chats});
    }
  }

}
