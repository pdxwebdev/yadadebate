import { Component, OnInit, Input } from '@angular/core';
import { GraphService } from '../yadalib/graph.service';
import { SettingsService } from '../yadalib/settings.service';
import { HttpClient } from '@angular/common/http';
import { BulletinSecretService } from '../yadalib/bulletin-secret.service';

@Component({
  selector: 'app-group-card-list',
  templateUrl: './group-card-list.component.html',
  styleUrls: ['./group-card-list.component.scss'],
})
export class GroupCardListComponent implements OnInit {
  items: any;
  groups: any;
  votes: any;
  parentComponent: any;
  @Input() rootGroup: any;
  constructor(
    private graphService: GraphService,
    private settingsService: SettingsService,
    private ahttp: HttpClient,
    private bulletinSecretService: BulletinSecretService
  ) { }

  ngOnInit() {
    this.parentComponent = this;
    this.groups = [];
    return new Promise((resolve, reject) => {
      let rid = this.rootGroup.transaction.rid;
      this.ahttp.get(this.settingsService.remoteSettings.baseUrl + '/groups?rid=' + rid)
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
    this.groups = [];
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
      chats = chats.sort((a, b) => {
        a.votes = a.votes || 0;
        b.votes = b.votes || 0;
        return (a.votes < b.votes) ? 1 : -1
      });
      this.groups.push({name: name, chats: chats});
    }
  }

}
