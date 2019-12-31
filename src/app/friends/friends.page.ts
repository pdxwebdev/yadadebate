import { Component, OnInit } from '@angular/core';
import { GraphService } from '../yadalib/graph.service';
import { SettingsService } from '../yadalib/settings.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
})
export class FriendsPage implements OnInit {
    items: any;
    pageTitle: any;
    constructor(
        private graphService: GraphService,
        private settingsService: SettingsService,
        private navCtrl: NavController
    ) {
        this.graphService.getDistinctList('friends')
        .then((graphArray) => {
            this.makeList(graphArray);
        });
    }

    makeList(graphArray) {
        return new Promise((resolve, reject) => {
            this.items = [];
            for (let i = 0; i < graphArray.length; i++) {
                this.items.push({
                    transaction: graphArray[i]
                });
            }
            resolve();
        })
    }

    ngOnInit() {
        if(!this.settingsService.remoteSettings.baseUrl) {
          return this.navCtrl.navigateRoot('/');
        }
    }
}
