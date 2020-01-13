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
  }
}
