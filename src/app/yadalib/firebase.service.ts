import { Injectable } from '@angular/core';
import { Firebase } from '@ionic-native/firebase/ngx';
import { GraphService } from './graph.service';
import { SettingsService } from './settings.service';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  constructor(
    private settingsService: SettingsService,
    private graphService: GraphService,
    public firebase: Firebase,
    private ahttp: HttpClient
  ) {}

  initFirebase() {
    if (!document.URL.startsWith('http') || document.URL.startsWith('http://localhost:8080')) {
      this.firebase.getToken()
      .then((token) => {
        console.log(token);
        this.ahttp.post(this.settingsService.remoteSettings['baseUrl'] + '/fcm-token', {
          rid: this.graphService.graph.rid,
          token: token,
        }).subscribe(() => {});
      })
      .catch((error) => {
          console.log('Error getting token', error)
      });

      this.firebase.onTokenRefresh()
      .subscribe((token: string) => {
        console.log(token);
        this.ahttp.post(this.settingsService.remoteSettings['baseUrl'] + '/fcm-token', {
          rid: this.graphService.graph.rid,
          token: token
        }).subscribe(() => {});
      });

      this.firebase.onNotificationOpen().subscribe(notification => {
        console.log(notification);
      });
    }
  }
}