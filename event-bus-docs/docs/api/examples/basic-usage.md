---
sidebar_position: 1
---

# Basic Usage Examples

This section provides practical examples of how to use the Event Bus Library in common scenarios.

## Simple Communication Between Components

### Sender Component

```typescript
import { Component } from '@angular/core';
import { EventBusService, BaseEvent, EventCategory } from '@yourdomain/event-bus-library';

// Define the event payload type
interface NotificationPayload {
  message: string;
  type: 'info' | 'warning' | 'error';
  timestamp: number;
}

@Component({
  selector: 'app-notification-sender',
  template: `
    <div>
      <input type="text" [(ngModel)]="message" placeholder="Notification message">
      <select [(ngModel)]="type">
        <option value="info">Info</option>
        <option value="warning">Warning</option>
        <option value="error">Error</option>
      </select>
      <button (click)="sendNotification()">Send Notification</button>
    </div>
  `
})
export class NotificationSenderComponent {
  message = '';
  type: 'info' | 'warning' | 'error' = 'info';

  constructor(private eventBus: EventBusService) {}

  sendNotification() {
    if (!this.message) return;

    const notification: NotificationPayload = {
      message: this.message,
      type: this.type,
      timestamp: Date.now()
    };

    this.eventBus.emit<NotificationPayload>({
      name: 'notification:new',
      timestamp: Date.now(),
      payload: notification,
      category: EventCategory.USER
    });

    // Reset the form
    this.message = '';
    this.type = 'info';
  }
}
```

### Receiver Component

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventBusService, BaseEvent } from '@yourdomain/event-bus-library';
import { Subscription } from 'rxjs';

// Use the same interface as the sender
interface NotificationPayload {
  message: string;
  type: 'info' | 'warning' | 'error';
  timestamp: number;
}

@Component({
  selector: 'app-notification-list',
  template: `
    <div class="notifications">
      <div *ngFor="let notification of notifications" 
           class="notification"
           [ngClass]="notification.type">
        <span class="message">{{ notification.message }}</span>
        <span class="time">{{ notification.timestamp | date:'short' }}</span>
      </div>
      <div *ngIf="notifications.length === 0">No notifications</div>
    </div>
  `,
  styles: [`
    .notification { padding: 10px; margin-bottom: 5px; border-radius: 4px; }
    .info { background-color: #e3f2fd; }
    .warning { background-color: #fff3e0; }
    .error { background-color: #ffebee; }
    .time { font-size: 0.8em; color: #777; margin-left: 10px; }
  `]
})
export class NotificationListComponent implements OnInit, OnDestroy {
  notifications: NotificationPayload[] = [];
  private subscription: Subscription;

  constructor(private eventBus: EventBusService) {}

  ngOnInit() {
    this.subscription = this.eventBus.on<NotificationPayload>('notification:new')
      .subscribe((event: BaseEvent<NotificationPayload>) => {
        this.notifications.unshift(event.payload);
        
        // Limit the number of displayed notifications
        if (this.notifications.length > 5) {
          this.notifications = this.notifications.slice(0, 5);
        }
      });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
```

## Form Validation with Debounce Strategy

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventBusService, StrategyType, BaseEvent, EventCategory } from '@yourdomain/event-bus-library';

interface ValidationResult {
  field: string;
  valid: boolean;
  errors?: string[];
}

@Component({
  selector: 'app-signup-form',
  template: `
    <form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label for="username">Username</label>
        <input id="username" type="text" formControlName="username">
        <div class="error" *ngIf="usernameErrors.length">
          <p *ngFor="let error of usernameErrors">{{ error }}</p>
        </div>
      </div>
      
      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" type="email" formControlName="email">
        <div class="error" *ngIf="emailErrors.length">
          <p *ngFor="let error of emailErrors">{{ error }}</p>
        </div>
      </div>
      
      <button type="submit" [disabled]="!signupForm.valid">Sign Up</button>
    </form>
  `
})
export class SignupFormComponent implements OnInit {
  signupForm: FormGroup;
  usernameErrors: string[] = [];
  emailErrors: string[] = [];

  constructor(
    private fb: FormBuilder,
    private eventBus: EventBusService
  ) {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    // Set debounce strategy for form input validation
    this.eventBus.setStrategy(StrategyType.DEBOUNCE);
    
    // Subscribe to validation results
    this.eventBus.on<ValidationResult>('form:validation:result').subscribe(
      (event: BaseEvent<ValidationResult>) => {
        const result = event.payload;
        
        if (result.field === 'username') {
          this.usernameErrors = result.errors || [];
        } else if (result.field === 'email') {
          this.emailErrors = result.errors || [];
        }
      }
    );
    
    // Set up form value change listeners
    this.signupForm.get('username')?.valueChanges.subscribe(value => {
      this.validateField('username', value);
    });
    
    this.signupForm.get('email')?.valueChanges.subscribe(value => {
      this.validateField('email', value);
    });
  }
  
  validateField(field: string, value: string) {
    // Emit validation event with debounce
    this.eventBus.emit<{field: string, value: string}>({
      name: 'form:field:changed',
      timestamp: Date.now(),
      payload: { field, value },
      category: EventCategory.USER,
      metadata: {
        debounceDelay: 300
      }
    });
    
    // In a real app, you might have a validator service listening to 'form:field:changed'
    // events and emitting 'form:validation:result' events after validation
    
    // For this example, we'll simulate the validation directly
    setTimeout(() => {
      let errors: string[] = [];
      
      if (field === 'username') {
        if (!value) {
          errors.push('Username is required');
        } else if (value.length < 4) {
          errors.push('Username must be at least 4 characters');
        }
        // Simulate async validation (e.g., checking if username is taken)
        if (value === 'admin') {
          errors.push('Username already taken');
        }
      } else if (field === 'email') {
        if (!value) {
          errors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push('Invalid email format');
        }
      }
      
      this.eventBus.emit<ValidationResult>({
        name: 'form:validation:result',
        timestamp: Date.now(),
        payload: {
          field,
          valid: errors.length === 0,
          errors
        },
        category: EventCategory.SYSTEM
      });
    }, 200); // Simulate server delay
  }
  
  onSubmit() {
    if (this.signupForm.valid) {
      console.log('Form submitted:', this.signupForm.value);
      // Process form submission...
    }
  }
}
```

## Global Error Handling

```typescript
import { Injectable } from '@angular/core';
import { EventBusService, BaseEvent, EventCategory } from '@yourdomain/event-bus-library';
import { HttpErrorResponse } from '@angular/common/http';

export interface ErrorEvent {
  message: string;
  code?: string | number;
  details?: any;
  source?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorService {
  constructor(private eventBus: EventBusService) {}

  handleError(error: Error | HttpErrorResponse, source: string = 'unknown') {
    console.error('Error occurred:', error);
    
    let errorEvent: ErrorEvent = {
      message: 'An unexpected error occurred',
      source: source
    };
    
    if (error instanceof HttpErrorResponse) {
      errorEvent = {
        message: error.statusText || 'HTTP error occurred',
        code: error.status,
        details: error.error,
        source: `${source} (HTTP)`
      };
    } else if (error instanceof Error) {
      errorEvent = {
        message: error.message || 'Error occurred',
        details: error.stack,
        source: source
      };
    }
    
    // Emit the error event
    this.eventBus.emit<ErrorEvent>({
      name: 'error:occurred',
      timestamp: Date.now(),
      payload: errorEvent,
      category: EventCategory.SYSTEM,
      metadata: {
        severity: errorEvent.code >= 500 ? 'critical' : 'normal'
      }
    });
  }
}
```

```typescript
import { Component, OnInit } from '@angular/core';
import { EventBusService, BaseEvent } from '@yourdomain/event-bus-library';

interface ErrorEvent {
  message: string;
  code?: string | number;
  details?: any;
  source?: string;
}

@Component({
  selector: 'app-error-toast',
  template: `
    <div *ngIf="isVisible" class="error-toast" [ngClass]="severity">
      <div class="error-message">{{ currentError?.message }}</div>
      <div class="error-source" *ngIf="currentError?.source">
        Source: {{ currentError.source }}
      </div>
      <button class="close-btn" (click)="hideError()">×</button>
    </div>
  `,
  styles: [`
    .error-toast {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px;
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
      z-index: 9999;
      max-width: 350px;
    }
    .critical {
      background-color: #dc3545;
      color: white;
    }
    .error-source {
      font-size: 0.8em;
      margin-top: 8px;
    }
    .close-btn {
      position: absolute;
      top: 5px;
      right: 5px;
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
    }
  `]
})
export class ErrorToastComponent implements OnInit {
  isVisible = false;
  currentError: ErrorEvent | null = null;
  severity = 'normal';
  private timeout: any;

  constructor(private eventBus: EventBusService) {}

  ngOnInit() {
    this.eventBus.on<ErrorEvent>('error:occurred').subscribe(
      (event: BaseEvent<ErrorEvent>) => {
        this.showError(event.payload, event.metadata?.severity || 'normal');
      }
    );
  }

  showError(error: ErrorEvent, severity: string) {
    // Clear any existing timeout
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    
    this.currentError = error;
    this.severity = severity;
    this.isVisible = true;
    
    // Auto-hide after 5 seconds
    this.timeout = setTimeout(() => {
      this.hideError();
    }, 5000);
  }

  hideError() {
    this.isVisible = false;
  }
}
```

These examples demonstrate some common usage patterns for the Event Bus Library. You can adapt them to your specific application needs.
