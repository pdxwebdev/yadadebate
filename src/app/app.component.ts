import { Component } from '@angular/core';

import { Platform, ModalController, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SettingsService } from './yadalib/settings.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  public appPages = [
    {
      title: 'Topics',
      url: '/topics',
      icon: '/appvotestatic/svg/md-quote.svg'
    },
    {
      title: 'Communities',
      url: '/communities',
      icon: '/appvotestatic/svg/md-people.svg'
    },
    {
      title: 'Friends',
      url: '/friends',
      icon: '/appvotestatic/svg/md-person.svg'
    },
    {
      title: 'Identity',
      url: '/identity',
      icon: '/appvotestatic/svg/md-lock.svg'
    }
  ];
  public appPage = [
    {
      title: 'Identity',
      url: '/identity',
      icon: '/appvotestatic/svg/md-lock.svg'
    }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public settingsService: SettingsService,
    public alertCtl: AlertController
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  async showRules($event) {
    $event.preventDefault();
    var alrt = await this.alertCtl.create({
      header: 'Rules',
      message: '1. All posts must contain a :group and a #topic so everyone knows which group you identify with for a given issue. <br> <br>2. Once you post or interact with a post for a given :group, you connot interact with other posts for that #topic outside of that :group. <br><br>Which :group will produce the best post for a given #topic?'
    });
    alrt.present();
  }
}
