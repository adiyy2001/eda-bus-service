import { Injectable } from '@angular/core';
import { BroadcastStrategy } from './resources/broadcast.strategy';
import { EventBusStrategy } from './resources/event-bus-strategy.interface';
import { MulticastStrategy } from './resources/multicast.strategy';
import { PatternMatchingStrategy } from './resources/pattern-matching-strategy';
import { PriorityStrategy } from './resources/priority-strategy';
import { StatefulStrategy } from './resources/stateful.strategy';
import { StatelessStrategy } from './resources/stateless.strategy';
import { UnicastStrategy } from './resources/unicast.strategy';
import { RoundRobinStrategy } from './resources/round-robin-strategy';
import { PersistedStrategy } from './resources/persisted.strategy';
import { DebounceStrategy } from './resources/debounce.strategy';
import { ThrottleStrategy } from './resources/throttle.strategy';

export enum StrategyType {
  STATELESS = 'stateless',
  STATEFUL = 'stateful',
  BROADCAST = 'broadcast',
  MULTICAST = 'multicast',
  UNICAST = 'unicast',
  PRIORITY = 'priority',
  PATTERN_MATCHING = 'pattern-matching',
  ROUND_ROBIN = 'round-robin',
  PERSISTED = "PERSISTED",
  DEBOUNCE = "debounce",
  THROTTLE = "throttle",
}

@Injectable({
  providedIn: 'root',
})
export class EventBusStrategyFactory {
  /**
   * Creates and returns an instance of the requested strategy.
   * @param type The type of strategy to create.
   * @returns An instance of the requested strategy.
   */
  createStrategy(type: StrategyType): EventBusStrategy {
    switch (type) {
      case StrategyType.STATELESS:
        return new StatelessStrategy();
      case StrategyType.STATEFUL:
        return new StatefulStrategy();
      case StrategyType.BROADCAST:
        return new BroadcastStrategy();
      case StrategyType.MULTICAST:
        return new MulticastStrategy();
      case StrategyType.UNICAST:
        return new UnicastStrategy();
      case StrategyType.PRIORITY:
        return new PriorityStrategy();
      case StrategyType.PATTERN_MATCHING:
        return new PatternMatchingStrategy();
      case StrategyType.ROUND_ROBIN:
        return new RoundRobinStrategy();
      case StrategyType.PERSISTED:
        return new PersistedStrategy();
      case StrategyType.DEBOUNCE:
        return new DebounceStrategy();
      case StrategyType.THROTTLE:
        return new ThrottleStrategy();
      default:
        throw new Error(`Unknown strategy type: ${type}`);
    }
  }
}
