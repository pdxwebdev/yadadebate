import { Component, OnInit, Input } from '@angular/core';
import { NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '../yadalib/settings.service';

declare var Base64;

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  @Input() item;
  @Input() topic;
  @Input() group;
  @Input() votes;
  @Input() cardType;
  @Input() staticGroup;
  @Input() parentComponent;
  thisComponent: any;
  constructor(
    private navCtrl: NavController,
    public ahttp: HttpClient,
    public settingsService: SettingsService
  ) { }

  ngOnInit() {
    this.thisComponent = this.parentComponent;
    this.group = this.settingsService.groups_by_bulletin_secret[this.item.relationship.their_bulletin_secret];
    if(!this.group) {
      this.ahttp.get(this.settingsService.remoteSettings.baseUrl + '/get-group?id=' + this.item.relationship.their_bulletin_secret)
      .subscribe((res: any) => {
        this.settingsService.groups_by_bulletin_secret[this.item.relationship.their_bulletin_secret] = res.result.txn;
        this.group = res.result.txn;
      });
    }
    this.topic = this.settingsService.topics_by_bulletin_secret[this.item.relationship.topic_bulletin_secret];
    if(!this.topic) {
      this.ahttp.get(this.settingsService.remoteSettings.baseUrl + '/get-topic?id=' + this.item.relationship.topic_bulletin_secret)
      .subscribe((res: any) => {
        this.settingsService.topics_by_bulletin_secret[this.item.relationship.topic_bulletin_secret] = res.result.txn;
        this.topic = res.result.txn;
      });
    }
  }

  gotoTopic(e, item) {
    e.preventDefault();
    e.stopPropagation();
    this.navCtrl.navigateForward('/topics?id=' + item.relationship.topic_bulletin_secret)
  }
   
  gotoGroup(e, item) {
    e.preventDefault();
    e.stopPropagation();
    this.navCtrl.navigateForward('/communities?id=' + item.relationship.their_bulletin_secret)
  }

  viewProfile() {

  }

  async isolateCard(e) {
    e.preventDefault();
    e.stopPropagation();
    this.navCtrl.navigateForward('/post?id=' + this.item.id + '&cardType=' + this.cardType)
  }

}
