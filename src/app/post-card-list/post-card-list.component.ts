import { Component, OnInit, Input } from '@angular/core';
import { SettingsService } from '../yadalib/settings.service';
import { HttpClient } from '@angular/common/http';
import { BulletinSecretService } from '../yadalib/bulletin-secret.service';
import { GraphService } from '../yadalib/graph.service';
import { VoteComponent } from '../vote/vote.component';

@Component({
  selector: 'app-post-card-list',
  templateUrl: './post-card-list.component.html',
  styleUrls: ['./post-card-list.component.scss'],
})
export class PostCardListComponent implements OnInit {
  votes: any;
  posts: any;
  thisComponent: any;
  @Input() rootGroup: any;
  @Input() listType: any;
  @Input() parentComponent: any;
  highestVoteCount: any;
  constructor(
    private settingsService: SettingsService,
    private ahttp: HttpClient,
    private bulletinSecretService: BulletinSecretService,
    private graphService: GraphService
  ) { }

  ngOnInit() {
    this.posts = this.rootGroup.transaction.posts;
    this.votes = this.rootGroup.transaction.votes;
    // return new Promise((resolve, reject) => {
    //   let url;
    //   let rid;
    //   switch (this.listType) {
    //     case 'topic':
    //       rid = this.rootGroup.transaction.relationship.their_bulletin_secret;
    //       url = '/topics?topic_bulletin_secret=' + rid
    //       break;
    //     case 'group':
    //       rid = this.rootGroup.transaction.rid;
    //       url = '/groups?rid=' + rid
    //       break;
    //     case 'replies':
    //       rid = this.rootGroup.transaction.id;
    //       url = '/replies?id=' + rid
    //       break;
    //   }
    //   this.ahttp.get(this.settingsService.remoteSettings.baseUrl + url)
    //   .subscribe((data: any) => {
    //       resolve(data.results || []);
    //   },
    //   (err) => {
    //       console.log(err);
    //   });
    // });
  }
}
