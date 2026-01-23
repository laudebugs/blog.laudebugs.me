import { Injectable } from '@angular/core';
import { loadRemote } from '@module-federation/enhanced/runtime';
// ---cut---
// [!region appenvservice] 
@Injectable({providedIn: 'root'})
export class AppEnvService {
  apiUrl: string = '';
  appInsightsUrl: string = '';
  cdnUrl: string = '';

  initialize(): Promise<AppEnvService | null> {
// @noErrors
    return loadRemote<typeof import('remote-app/environment')>('remote-app/environment')
    .then(({environment}) => {
      this.apiUrl = environment.apiUrl;
// @noErrors
      this.appInsightsUrl = envenvironment.appInsightsUrl;
// @noErrors
      this.cdnUrl = envenvironment.cdnUrl;
      return this;
    })
    .catch((error) => {
      console.error('Failed to load remote application/environment configuration', error?.message || error);
      return null;
    });
  }
}
// [!endregion appenvservice] 