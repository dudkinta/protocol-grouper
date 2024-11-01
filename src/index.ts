import { EventEmitter } from 'events';
import type { Startable, PeerId } from '@libp2p/interface';


class ProtocolGrouperService extends EventEmitter implements Startable {
  private libp2p: any;
  private protocolGroups: Map<string, Set<PeerId>>;
  private peerProtocols: Map<PeerId, Set<string>>;

  constructor(components: any, init: { runOnPeerDiscovery?: boolean } = {}) {
    super(); // Инициализация EventEmitter
    this.libp2p = components;
    this.protocolGroups = new Map(); // Словарь для группировки по протоколам
    this.peerProtocols = new Map(); // Словарь для хранения протоколов по пиру

    if (init.runOnPeerDiscovery ?? true) {
      // Подписываемся на события обнаружения пиров
      components.events.addEventListener('peer:update', (event: any) => {
        const protocols = event.detail.peer.protocols;
        const peerId: PeerId = event.detail.peer.id;
        if (protocols && peerId) {
          this.updatePeerProtocols(peerId, protocols);
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

  private updatePeerProtocols(peerId: PeerId, protocols: string[]): void {
    if (!this.peerProtocols.has(peerId)) {
      this.peerProtocols.set(peerId, new Set());
    }

    protocols.forEach((protocol: string) => {
      // Обновляем словарь протоколов для каждого пира
      this.peerProtocols.get(peerId)?.add(protocol);

      // Обновляем словарь пиров для каждого протокола
      if (!this.protocolGroups.has(protocol)) {
        this.protocolGroups.set(protocol, new Set());
      }
      const wasAdded = !this.protocolGroups.get(protocol)?.has(peerId);
      this.protocolGroups.get(protocol)?.add(peerId);
      if (wasAdded) {
        // Генерируем событие при добавлении нового протокола через libp2p events
        this.libp2p.events.dispatchEvent(
          new CustomEvent('protocolGrouper:add', { detail: { peerId, protocol } })
        );
      }
    });
  }

  getPeers(protocol: string): PeerId[] {
    if (!this.protocolGroups.has(protocol)) {
      return [];
    }
    return Array.from(this.protocolGroups.get(protocol) ?? []);
  }

  getProtocols(peerId: PeerId): string[] {
    if (!this.peerProtocols.has(peerId)) {
      return [];
    }
    return Array.from(this.peerProtocols.get(peerId) ?? []);
  }
}

export function protocolGrouper(): (
  components: any,
  init?: { runOnPeerDiscovery?: boolean }
) => ProtocolGrouperService {
  return (components: any, init?: { runOnPeerDiscovery?: boolean }) =>
    new ProtocolGrouperService(components, init);
}
