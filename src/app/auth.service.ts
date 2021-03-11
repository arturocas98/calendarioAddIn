// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { Client } from '@microsoft/microsoft-graph-client';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';

import { AlertsService } from './alerts.service';
import { OAuthSettings } from '../oauth';
import { User } from './user';
import * as moment from 'moment-timezone';
import { findOneIana } from 'windows-iana';
import { GraphService } from './graph.service';
@Injectable({
  providedIn: 'root'
})

export class AuthService {
  public authenticated: boolean;
  public user: User;

  // <constructorSnippet>
  constructor(
    private msalService: MsalService,
    private alertsService: AlertsService,
    // private graphService: GraphService
  ) {

    this.authenticated = this.msalService.getAccount() != null;
    this.getUser().then((user) => { this.user = user });
  }
  // </constructorSnippet>

  // Prompt the user to sign in and
  // grant consent to the requested permission scopes
  async signIn(): Promise<void> {
    let result = await this.msalService.loginPopup(OAuthSettings)
      .catch((reason) => {
        this.alertsService.addError('Login failed', JSON.stringify(reason, null, 2));
      });

    if (result) {
      this.authenticated = true;
      console.log("resultado:", result);
      // this.user = await this.getUser();
      let usuario = await this.getUser();
      console.log("usuario:", usuario);

      const ianaName = findOneIana(usuario.timeZone);
      const timeZone = ianaName!.valueOf() || usuario.timeZone;
      var startOfWeek = moment.tz(timeZone).startOf('week').utc();
      var endOfWeek = moment(startOfWeek).add(7, 'day');

      // this.graphService.getCalendarView(startOfWeek.format(), endOfWeek.format(), timeZone).then((events) => {
      //   // this.events = events;
      //   console.log("eventos:",events);
      // });

    }
  }

  // Sign out
  signOut(): void {
    this.msalService.logout();
    this.user = null;
    this.authenticated = false;
  }

  // Silently request an access token
  async getAccessToken(): Promise<string> {
    let result = await this.msalService.acquireTokenSilent(OAuthSettings)
      .catch((reason) => {
        this.alertsService.addError('Get token failed', JSON.stringify(reason, null, 2));
      });

    if (result) {
      return result.accessToken;
    }

    // Couldn't get a token
    this.authenticated = false;
    return null;
  }

  // <getUserSnippet>
  private async getUser(): Promise<User> {
    if (!this.authenticated) return null;

    let graphClient = Client.init({
      // Initialize the Graph client with an auth
      // provider that requests the token from the
      // auth service
      authProvider: async (done) => {
        let token = await this.getAccessToken()
          .catch((reason) => {
            done(reason, null);
          });
        console.log("token:", token);
        if (token) {
          done(null, token);
        } else {
          done("Could not get an access token", null);
        }
      }
    });

    // Get the user from Graph (GET /me)
    let graphUser: MicrosoftGraph.User = await graphClient
      .api('/me')
      .select('displayName,mail,mailboxSettings,userPrincipalName')
      .get();

    let user = new User();


    user.displayName = graphUser.displayName;
    // // Prefer the mail property, but fall back to userPrincipalName
    user.email = graphUser.mail || graphUser.userPrincipalName;
    user.timeZone = graphUser.mailboxSettings.timeZone;

    // Use default avatar
    // user.avatar = '/assets/no-profile-photo.png';
    // console.log("graph user:",user);
    return user;
  }
  // </getUserSnippet>
}