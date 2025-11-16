import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  isTimerVisible = signal(false);
  
  toggleTimer() {
    this.isTimerVisible.update(visible => !visible);
  }
}
