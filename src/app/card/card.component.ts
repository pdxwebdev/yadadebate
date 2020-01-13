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
