import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class SettingsService {
    remoteSettings: any;
    remoteSettingsUrl = null;
    seeds = [];
    tokens = {};
    static_groups = [];
    constructor(
    ) {
        this.remoteSettings = {};
        this.tokens = {};
        this.static_groups = [{
            "rid": "f2e26be3191c8242fe288e9168b9e4fb87686fea049b3b1d00c714ba39f51aaa",
            "fee": 0,
            "requester_rid": "858cb57918979a7ba75e610ce1ebe7f32c8df6ecca8cbbed5faf911119dd0473",
            "requested_rid": "f2e26be3191c8242fe288e9168b9e4fb87686fea049b3b1d00c714ba39f51aaa",
            "outputs": [{
                "to": "1wqCEAui6GZ5eLgHL8kv94G8PLrZ4Agkj",
                "value": 0
            }, {
                "to": "1HyqVAfwVZKeEgHDUvp3MthGQhotoVgVUb",
                "value": 0
            }],
            "time": "1576407444",
            "public_key": "03549c4944d08ed6c32dafaf52f5df04857de8a2c680f922f54de57fb7b2559a30",
            "dh_public_key": "b8963a47a35dabbb9f06a05219ab98c1301e8536f565f55bc5fc3be02ce4fd3c",
            "inputs": [],
            "relationship": {
                "their_bulletin_secret": "MEQCIEwNGUoKiVt9y10DzhV9qtG5B7tm5eTv9OTeTrO4wILnAiBeQ02TxEAM/gxChB5jNL/nlPAXYk8PqN6IUdaLgDRr4w==",
                "their_public_key": "02b020fde61367d12ffbbe370d03da13ec54c567adc6005b73783eb175144103e5",
                "their_username": "Political",
                "their_address": "1wqCEAui6GZ5eLgHL8kv94G8PLrZ4Agkj",
                "my_bulletin_secret": "MEQCICVc2KczKUcY3FGQgK89TNCbI/kxIEl3YoE74umvlzJDAiAxBn2FrxP4ac9ovMsfSlvy2GPAZz7sLpuis9bRUk3Etw==",
                "my_username": "test",
                "group": true
            },
            "hash": "8e6c464971c557db144926806628f99a4df5d9bd81c3120bb0545d80e9c3e67a",
            "id": "MEQCIA0FZU1EkIiW5rg4ttmHX2DKGrxxbcOEh5UXpeJk6yHBAiBLPc1YYmM1JBQ3qoYfukqUEnKS6YP8J4VRpru4+BMphw=="
        }];
    }

    go() {
        return new Promise((resolve, reject) => {

        });
    }
}