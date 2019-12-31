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
          });
          this.getVotes(this.id);
        }
        if (params && params.cardType) {
          this.cardType = params.cardType;
        }
      })
    })
  }

  getVotes(id) {
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
    });
  }

}
