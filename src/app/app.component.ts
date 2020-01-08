import { Component } from '@angular/core';

import { Platform, ModalController } from '@ionic/angular';
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
    public settingsService: SettingsService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
