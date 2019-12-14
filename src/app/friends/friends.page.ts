import { Component, OnInit } from '@angular/core';
import { GraphService } from '../yadalib/graph.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
})
export class FriendsPage implements OnInit {
    items: any;
    pageTitle: any;
    constructor(
        private graphService: GraphService
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
    }
}
