import { Component, ChangeDetectionStrategy, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { UiService } from '../../services/ui.service';

type SessionType = 'work' | 'break';

const WORK_DURATION = 25 * 60; // 25 minutes
const BREAK_DURATION = 5 * 60; // 5 minutes

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  imports: [CommonModule, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerComponent implements OnDestroy {
  uiService = inject(UiService);

  timeLeft = signal(WORK_DURATION);
  isActive = signal(false);
  sessionType = signal<SessionType>('work');

  private timerInterval: any;

  minutes = signal(Math.floor(this.timeLeft() / 60));
  seconds = signal(this.timeLeft() % 60);

  constructor() {
    this.updateDisplay();
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
  }

  startTimer() {
    if (this.isActive()) return;
    this.isActive.set(true);
    this.timerInterval = setInterval(() => {
      this.timeLeft.update(t => t - 1);
      this.updateDisplay();
      if (this.timeLeft() <= 0) {
        this.switchSession();
      }
    }, 1000);
  }

  pauseTimer() {
    this.isActive.set(false);
    clearInterval(this.timerInterval);
  }

  resetTimer() {
    this.pauseTimer();
    this.sessionType.set('work');
    this.timeLeft.set(WORK_DURATION);
    this.updateDisplay();
  }

  switchSession() {
    this.pauseTimer();
    const newSessionType = this.sessionType() === 'work' ? 'break' : 'work';
    this.sessionType.set(newSessionType);
    this.timeLeft.set(newSessionType === 'work' ? WORK_DURATION : BREAK_DURATION);
    this.updateDisplay();
    // Optional: Auto-start next session
    // this.startTimer();
  }

  updateDisplay() {
    this.minutes.set(Math.floor(this.timeLeft() / 60));
    this.seconds.set(this.timeLeft() % 60);
  }

  close() {
    this.uiService.toggleTimer();
  }
}
