import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class SettingsService {
    remoteSettings = {};
    remoteSettingsUrl = null;
    seeds = [];
    tokens = {};
    constructor(
    ) {
        this.tokens = {};
    }

    go() {
        return new Promise((resolve, reject) => {

        });
    }
}