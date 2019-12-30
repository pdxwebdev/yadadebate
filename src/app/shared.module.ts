import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { VoteComponent } from './vote/vote.component';
import { PostButtonComponent } from './post-button/post-button.component';
import { FormsModule } from '@angular/forms';
import { PostFormComponent } from './post-form/post-form.component';
import { MentionModule } from 'angular-mentions';
import { CommonModule } from '@angular/common';
import { CardComponent } from './card/card.component';
import { PostCardListComponent } from './post-card-list/post-card-list.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule.forRoot(),
        MentionModule
    ],
    declarations: [ 
        VoteComponent,
        PostButtonComponent,
        PostFormComponent,
        CardComponent,
        PostCardListComponent
    ],
    entryComponents: [
      PostFormComponent,
      CardComponent
    ],
    exports: [ 
        CommonModule,
        FormsModule,
        VoteComponent,
        PostButtonComponent,
        PostFormComponent,
        CardComponent,
        PostCardListComponent
    ]
})
export class SharedModule {}