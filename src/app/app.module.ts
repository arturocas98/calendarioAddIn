import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin
import interactionPlugin from '@fullcalendar/interaction'; // a plugin
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MsalModule } from '@azure/msal-angular';
import { OAuthSettings } from 'src/oauth';
import { GraphService } from './graph.service';
import { AuthService } from './auth.service';
import { RouterModule } from '@angular/router';

FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin,
  interactionPlugin
]);
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FullCalendarModule,
    NgbModule,
    MsalModule.forRoot({
      auth: {
        clientId: OAuthSettings.appId,
        redirectUri: OAuthSettings.redirectUri
      }
    }),
    RouterModule.forRoot([{ path: "", component: AppComponent}])
  ],
  providers: [
    AuthService,
    GraphService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
