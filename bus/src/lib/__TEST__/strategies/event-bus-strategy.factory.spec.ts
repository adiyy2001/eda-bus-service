import { TestBed } from '@angular/core/testing';
import { EventBusStrategyFactory, StrategyType } from '../../strategies/event-bus-strategy.factory';
import { StatelessStrategy } from '../../strategies/resources/stateless.strategy';
import { StatefulStrategy } from '../../strategies/resources/stateful.strategy';
import { BroadcastStrategy } from '../../strategies/resources/broadcast.strategy';
import { MulticastStrategy } from '../../strategies/resources/multicast.strategy';
import { UnicastStrategy } from '../../strategies/resources/unicast.strategy';
import { PriorityStrategy } from '../../strategies/resources/priority-strategy';
import { PatternMatchingStrategy } from '../../strategies/resources/pattern-matching-strategy';
import { RoundRobinStrategy } from '../../strategies/resources/round-robin-strategy';
import { PersistedStrategy } from '../../strategies/resources/persisted.strategy';
import { DebounceStrategy } from '../../strategies/resources/debounce.strategy';
import { ThrottleStrategy } from '../../strategies/resources/throttle.strategy';

describe('EventBusStrategyFactory', () => {
  let factory: EventBusStrategyFactory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EventBusStrategyFactory]
    });
    factory = TestBed.inject(EventBusStrategyFactory);
  });

  it('should create a StatelessStrategy when given STATELESS', () => {
    const strategy = factory.createStrategy(StrategyType.STATELESS);
    expect(strategy instanceof StatelessStrategy).toBeTrue();
  });

  it('should create a StatefulStrategy when given STATEFUL', () => {
    const strategy = factory.createStrategy(StrategyType.STATEFUL);
    expect(strategy instanceof StatefulStrategy).toBeTrue();
  });

  it('should create a BroadcastStrategy when given BROADCAST', () => {
    const strategy = factory.createStrategy(StrategyType.BROADCAST);
    expect(strategy instanceof BroadcastStrategy).toBeTrue();
  });

  it('should create a MulticastStrategy when given MULTICAST', () => {
    const strategy = factory.createStrategy(StrategyType.MULTICAST);
    expect(strategy instanceof MulticastStrategy).toBeTrue();
  });

  it('should create a UnicastStrategy when given UNICAST', () => {
    const strategy = factory.createStrategy(StrategyType.UNICAST);
    expect(strategy instanceof UnicastStrategy).toBeTrue();
  });

  it('should create a PriorityStrategy when given PRIORITY', () => {
    const strategy = factory.createStrategy(StrategyType.PRIORITY);
    expect(strategy instanceof PriorityStrategy).toBeTrue();
  });

  it('should create a PatternMatchingStrategy when given PATTERN_MATCHING', () => {
    const strategy = factory.createStrategy(StrategyType.PATTERN_MATCHING);
    expect(strategy instanceof PatternMatchingStrategy).toBeTrue();
  });

  it('should create a RoundRobinStrategy when given ROUND_ROBIN', () => {
    const strategy = factory.createStrategy(StrategyType.ROUND_ROBIN);
    expect(strategy instanceof RoundRobinStrategy).toBeTrue();
  });

  it('should create a PersistedStrategy when given PERSISTED', () => {
    const strategy = factory.createStrategy(StrategyType.PERSISTED);
    expect(strategy instanceof PersistedStrategy).toBeTrue();
  });

  it('should create a DebounceStrategy when given DEBOUNCE', () => {
    const strategy = factory.createStrategy(StrategyType.DEBOUNCE);
    expect(strategy instanceof DebounceStrategy).toBeTrue();
  });

  it('should create a ThrottleStrategy when given THROTTLE', () => {
    const strategy = factory.createStrategy(StrategyType.THROTTLE);
    expect(strategy instanceof ThrottleStrategy).toBeTrue();
  });

  it('should throw an error for an unknown strategy type', () => {
    expect(() => factory.createStrategy('unknown' as StrategyType)).toThrowError(/Unknown strategy type/);
  });
});
