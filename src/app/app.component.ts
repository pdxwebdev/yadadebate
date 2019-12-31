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
      icon: 'quote'
    },
    {
      title: 'Communities',
      url: '/communities',
      icon: 'people'
    },
    {
      title: 'Friends',
      url: '/friends',
      icon: 'person'
    },
    {
      title: 'Identity',
      url: '/identity',
      icon: 'lock'
    }
  ];
  public appPage = [
    {
      title: 'Identity',
      url: '/identity',
      icon: 'lock'
    }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private settingsService: SettingsService
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
