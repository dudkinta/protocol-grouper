import { EventEmitter } from 'events';
import type { Startable } from '@libp2p/interface';

class ProtocolGrouperService extends EventEmitter implements Startable {
  private libp2p: any;
  private protocolGroups: { [key: string]: Set<string> };
  private peerProtocols: { [key: string]: Set<string> };

  constructor(components: any, init: { runOnPeerDiscovery?: boolean } = {}) {
    super(); // Инициализация EventEmitter
    this.libp2p = components;
    this.protocolGroups = {}; // Словарь для группировки по протоколам
    this.peerProtocols = {}; // Словарь для хранения протоколов по пиру

    if (init.runOnPeerDiscovery ?? true) {
      // Подписываемся на события обнаружения пиров
      components.events.addEventListener('peer:update', (event: any) => {
        const protocols = event.detail.peer.protocols;
        const peerId = event.detail.peer.id;
        if (protocols && peerId) {
          this.updatePeerProtocols(peerId.toString(), protocols);
        }
      });
    }
  }

  async beforeStart(): Promise<void> {}

  async start(): Promise<void> {}

  async afterStart(): Promise<void> {}

  async beforeStop(): Promise<void> {}

  async stop(): Promise<void> {}

  async afterStop(): Promise<void> {}

  private updatePeerProtocols(peerId: string, protocols: string[]): void {
    if (!this.peerProtocols[peerId]) {
      this.peerProtocols[peerId] = new Set();
    }

    protocols.forEach((protocol: string) => {
      // Обновляем словарь протоколов для каждого пира
      this.peerProtocols[peerId].add(protocol);

      // Обновляем словарь пиров для каждого протокола
      if (!this.protocolGroups[protocol]) {
        this.protocolGroups[protocol] = new Set();
      }
      const wasAdded = !this.protocolGroups[protocol].has(peerId);
      this.protocolGroups[protocol].add(peerId);
      if (wasAdded) {
        // Генерируем событие при добавлении нового протокола через libp2p events
        this.libp2p.events.dispatchEvent(
          new CustomEvent('protocolGrouper:add', { detail: { peerId, protocol } })
        );
      }
    });
  }

  getPeers(protocol: string): string[] {
    if (!this.protocolGroups[protocol]) {
      return [];
    }
    return Array.from(this.protocolGroups[protocol]);
  }

  getProtocols(peerId: string): string[] {
    if (!this.peerProtocols[peerId]) {
      return [];
    }
    return Array.from(this.peerProtocols[peerId]);
  }
}

export function protocolGrouper(): (
  components: any,
  init?: { runOnPeerDiscovery?: boolean }
) => ProtocolGrouperService {
  return (components: any, init?: { runOnPeerDiscovery?: boolean }) =>
    new ProtocolGrouperService(components, init);
}
